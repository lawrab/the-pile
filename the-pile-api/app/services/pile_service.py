import httpx
import asyncio
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
import time
from app.models.user import User
from app.models.steam_game import SteamGame
from app.models.pile_entry import PileEntry, GameStatus
from app.models.import_status import ImportStatus
from app.schemas.pile import PileFilters
from app.core.config import settings
from app.services.cache_service import cache_result, invalidate_cache_pattern


class RateLimiter:
    """Simple rate limiter for API calls"""
    def __init__(self, requests_per_second: int, burst_size: int):
        self.requests_per_second = requests_per_second
        self.burst_size = burst_size
        self.tokens = burst_size
        self.last_refill = time.time()
        self.lock = asyncio.Lock()
    
    async def acquire(self):
        """Acquire a token for making a request"""
        async with self.lock:
            now = time.time()
            # Refill tokens based on time elapsed
            time_elapsed = now - self.last_refill
            tokens_to_add = time_elapsed * self.requests_per_second
            self.tokens = min(self.burst_size, self.tokens + tokens_to_add)
            self.last_refill = now
            
            if self.tokens >= 1:
                self.tokens -= 1
                return
            else:
                # Wait until we can get a token
                wait_time = (1 - self.tokens) / self.requests_per_second
                await asyncio.sleep(wait_time)
                self.tokens = 0


class PileService:
    def __init__(self):
        self.rate_limiter = RateLimiter(
            requests_per_second=10,  # Conservative rate limit
            burst_size=20           # Allow small bursts
        )
    @cache_result(expiration=900, key_prefix="steam_owned_games")  # 15 minutes
    async def get_steam_owned_games(self, steam_id: str) -> List[dict]:
        """Fetch owned games from Steam Web API"""
        url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
        params = {
            "key": settings.STEAM_API_KEY,
            "steamid": steam_id,
            "format": "json",
            "include_appinfo": True,
            "include_played_free_games": True,
            "include_extended_appinfo": True
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
            
            return data.get("response", {}).get("games", [])
    
    @cache_result(expiration=86400, key_prefix="steam_app_details")  # 24 hours
    async def get_steam_app_details(self, app_id: int) -> dict:
        """Fetch game details from Steam Store API"""
        url = f"https://store.steampowered.com/api/appdetails"
        params = {"appids": app_id, "filters": "basic,genres,categories,price_overview,screenshots,release_date"}
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                data = response.json()
                
                app_data = data.get(str(app_id), {})
                if app_data.get("success") and app_data.get("data"):
                    return app_data["data"]
                return {}
        except Exception as e:
            print(f"Error fetching Steam app details for {app_id}: {e}")
            return {}
    
    @cache_result(expiration=86400, key_prefix="steam_reviews")  # 24 hours
    async def get_steam_reviews(self, app_id: int) -> dict:
        """Fetch review summary from Steam Reviews API"""
        url = f"https://store.steampowered.com/appreviews/{app_id}"
        params = {
            "json": 1,
            "num_per_page": 0,  # We only want the query summary, not actual reviews
            "language": "english"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                data = response.json()
                
                if data.get("success") == 1 and "query_summary" in data:
                    query_summary = data["query_summary"]
                    return {
                        "total_reviews": query_summary.get("total_reviews", 0),
                        "total_positive": query_summary.get("total_positive", 0),
                        "total_negative": query_summary.get("total_negative", 0),
                        "review_score_desc": query_summary.get("review_score_desc", "No user reviews"),
                        "rating_percent": self._calculate_rating_percentage(
                            query_summary.get("total_positive", 0),
                            query_summary.get("total_reviews", 0)
                        )
                    }
                return {}
        except Exception as e:
            print(f"Error fetching Steam reviews for {app_id}: {e}")
            return {}
    
    def _calculate_rating_percentage(self, positive: int, total: int) -> int:
        """Calculate positive review percentage"""
        if total == 0:
            return 0
        return int((positive / total) * 100)
    
    async def get_game_details_batch(self, app_ids: List[int], db: Session = None) -> Dict[int, Dict[str, Any]]:
        """Fetch game details for multiple games in parallel with rate limiting and smart caching"""
        semaphore = asyncio.Semaphore(10)  # Max 10 concurrent requests
        
        # Smart caching: Check which games already exist and were recently updated
        cached_data = {}
        games_to_fetch = []
        
        if db:
            # Consider games fresh if updated within the last 7 days
            cache_cutoff = datetime.now(timezone.utc) - timedelta(days=7)
            
            # Query existing games that are still fresh
            cached_games = db.query(SteamGame).filter(
                SteamGame.steam_app_id.in_(app_ids),
                SteamGame.last_updated >= cache_cutoff
            ).all()
            
            # Build cached data from database
            for game in cached_games:
                cached_data[game.steam_app_id] = {
                    "details": {
                        "name": game.name,
                        "short_description": game.description,
                        "genres": [{"description": genre} for genre in game.genres] if game.genres else [],
                        "categories": [{"description": cat} for cat in game.categories] if game.categories else [],
                        "price_overview": {"initial": int(game.price * 100)} if game.price else {},
                        "release_date": {"date": game.release_date} if game.release_date else {},
                        "developers": game.developer.split(", ") if game.developer else [],
                        "publishers": game.publisher.split(", ") if game.publisher else [],
                        "screenshots": [{"path_full": url} for url in game.screenshots] if game.screenshots else [],
                        "type": game.steam_type
                    },
                    "reviews": {
                        "rating_percent": game.steam_rating_percent,
                        "review_score_desc": game.steam_review_summary,
                        "total_reviews": game.steam_review_count
                    }
                }
            
            # Only fetch games that aren't cached or are stale
            cached_app_ids = set(game.steam_app_id for game in cached_games)
            games_to_fetch = [app_id for app_id in app_ids if app_id not in cached_app_ids]
            
            print(f"Smart caching: Using cached data for {len(cached_app_ids)} games, fetching {len(games_to_fetch)} games")
        else:
            games_to_fetch = app_ids
        
        async def fetch_single_game(app_id: int) -> tuple[int, Dict[str, Any]]:
            async with semaphore:
                await self.rate_limiter.acquire()
                
                # Get both app details and reviews concurrently for this game
                details_task = self.get_steam_app_details(app_id)
                reviews_task = self.get_steam_reviews(app_id)
                
                details, reviews = await asyncio.gather(
                    details_task, reviews_task, return_exceptions=True
                )
                
                # Handle exceptions
                if isinstance(details, Exception):
                    details = {}
                if isinstance(reviews, Exception):
                    reviews = {}
                
                return app_id, {"details": details, "reviews": reviews}
        
        # Process only games that need fetching in parallel
        fetched_data = {}
        if games_to_fetch:
            tasks = [fetch_single_game(app_id) for app_id in games_to_fetch]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Convert to dict, filtering out exceptions
            for result in results:
                if isinstance(result, Exception):
                    continue
                app_id, data = result
                fetched_data[app_id] = data
        
        # Combine cached and fetched data
        game_data = {**cached_data, **fetched_data}
            
        return game_data
    
    async def import_steam_library(self, steam_id: str, user_id: int, db: Session):
        """Import user's Steam library with parallel processing"""
        # Create import status record
        import_status = ImportStatus(
            user_id=user_id,
            operation_type='import',
            status='running',
            progress_current=0
        )
        db.add(import_status)
        db.commit()
        db.refresh(import_status)
        
        try:
            # Fetch owned games from Steam
            owned_games = await self.get_steam_owned_games(steam_id)
            
            # Update progress with total count
            import_status.progress_total = len(owned_games)
            db.commit()
            
            # Process games in batches for better performance
            BATCH_SIZE = 50  # Process 50 games at a time
            total_processed = 0
            
            for batch_start in range(0, len(owned_games), BATCH_SIZE):
                batch_end = min(batch_start + BATCH_SIZE, len(owned_games))
                batch_games = owned_games[batch_start:batch_end]
                
                # Extract app_ids for this batch
                batch_app_ids = [game["appid"] for game in batch_games]
                
                # Fetch all game details for this batch in parallel with smart caching
                game_details = await self.get_game_details_batch(batch_app_ids, db)
                
                # Process each game in the batch
                await self._process_game_batch(batch_games, game_details, user_id, db)
                
                # Update progress
                total_processed += len(batch_games)
                import_status.progress_current = total_processed
                db.commit()
            
            # Update user's last sync time
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.last_sync_at = datetime.now(timezone.utc)
                db.commit()
            
            # Mark import as completed
            import_status.status = 'completed'
            import_status.completed_at = datetime.now(timezone.utc)
            db.commit()
                
        except Exception as e:
            db.rollback()
            # Mark import as failed
            import_status.status = 'failed'
            import_status.error_message = str(e)
            import_status.completed_at = datetime.now(timezone.utc)
            db.commit()
            print(f"Error importing Steam library: {e}")
            raise
    
    async def _process_game_batch(self, batch_games: List[dict], game_details: Dict[int, Dict[str, Any]], user_id: int, db: Session):
        """Process a batch of games with their fetched details"""
        for game_data in batch_games:
            app_id = game_data["appid"]
            
            # Get the fetched details for this game
            details = game_details.get(app_id, {}).get("details", {})
            reviews = game_details.get(app_id, {}).get("reviews", {})
            
            # Check if Steam game already exists in database
            steam_game = db.query(SteamGame).filter(SteamGame.steam_app_id == app_id).first()
            
            # Extract game information
            price_overview = details.get("price_overview", {})
            game_price = 0
            if price_overview and price_overview.get("initial"):
                game_price = price_overview.get("initial", 0) / 100
            
            is_free = price_overview.get("initial", 0) == 0 if price_overview else True
            
            if not steam_game:
                # Create new Steam game record
                steam_game = SteamGame(
                    steam_app_id=app_id,
                    name=game_data.get("name", "Unknown Game"),
                    image_url=f"https://steamcdn-a.akamaihd.net/steam/apps/{app_id}/header.jpg",
                    genres=[g["description"] for g in details.get("genres", [])] if details.get("genres") else [],
                    categories=[c["description"] for c in details.get("categories", [])] if details.get("categories") else [],
                    description=details.get("short_description", ""),
                    price=game_price,
                    is_free=is_free,
                    release_date=details.get("release_date", {}).get("date", "") if details.get("release_date") else "",
                    developer=", ".join(details.get("developers", [])) if details.get("developers") else "",
                    publisher=", ".join(details.get("publishers", [])) if details.get("publishers") else "",
                    screenshots=[s["path_full"] for s in details.get("screenshots", [])] if details.get("screenshots") else [],
                    # Steam review/rating data
                    steam_rating_percent=reviews.get("rating_percent") if reviews.get("total_reviews", 0) > 0 else None,
                    steam_review_summary=reviews.get("review_score_desc") if reviews.get("total_reviews", 0) > 0 else None,
                    steam_review_count=reviews.get("total_reviews") if reviews.get("total_reviews", 0) > 0 else None,
                    steam_type=details.get("type")
                )
                db.add(steam_game)
                db.flush()  # Get ID without committing
                db.refresh(steam_game)
            else:
                # Update existing Steam game with fresh data
                steam_game.name = game_data.get("name", steam_game.name)
                steam_game.price = game_price
                steam_game.is_free = is_free
                if details.get("genres"):
                    steam_game.genres = [g["description"] for g in details.get("genres", [])]
                if details.get("categories"):
                    steam_game.categories = [c["description"] for c in details.get("categories", [])]
                if details.get("short_description"):
                    steam_game.description = details.get("short_description")
                if details.get("release_date", {}).get("date"):
                    steam_game.release_date = details.get("release_date", {}).get("date")
                if details.get("developers"):
                    steam_game.developer = ", ".join(details.get("developers", []))
                if details.get("publishers"):
                    steam_game.publisher = ", ".join(details.get("publishers", []))
                if details.get("screenshots"):
                    steam_game.screenshots = [s["path_full"] for s in details.get("screenshots", [])]
                
                # Update Steam review/rating data if available
                if reviews.get("total_reviews", 0) > 0:
                    steam_game.steam_rating_percent = reviews.get("rating_percent")
                    steam_game.steam_review_summary = reviews.get("review_score_desc")
                    steam_game.steam_review_count = reviews.get("total_reviews")
                
                # Update Steam type
                if details.get("type"):
                    steam_game.steam_type = details.get("type")
                
                steam_game.last_updated = datetime.now(timezone.utc)
            
            # Check if pile entry already exists
            existing_entry = db.query(PileEntry).filter(
                PileEntry.user_id == user_id,
                PileEntry.steam_game_id == steam_game.id
            ).first()
            
            if not existing_entry:
                # Create pile entry with purchase price from Steam game
                pile_entry = PileEntry(
                    user_id=user_id,
                    steam_game_id=steam_game.id,
                    playtime_minutes=game_data.get("playtime_forever", 0),
                    purchase_price=game_price,  # Use current Steam price as purchase price
                    status=GameStatus.UNPLAYED if game_data.get("playtime_forever", 0) == 0 else GameStatus.PLAYING
                )
                db.add(pile_entry)
        
        # Commit the entire batch at once for better performance
        db.commit()
    
    async def sync_playtime(self, steam_id: str, user_id: int, db: Session):
        """Sync playtime data from Steam"""
        try:
            owned_games = await self.get_steam_owned_games(steam_id)
            
            # Build a map of app_id -> playtime for efficient lookup
            playtime_map = {game_data["appid"]: game_data.get("playtime_forever", 0) for game_data in owned_games}
            
            # Single query with eager loading to get all pile entries
            pile_entries = db.query(PileEntry).options(
                joinedload(PileEntry.steam_game)
            ).filter(PileEntry.user_id == user_id).all()
            
            # Update playtime for existing entries
            for pile_entry in pile_entries:
                app_id = pile_entry.steam_game.steam_app_id
                if app_id in playtime_map:
                    playtime = playtime_map[app_id]
                    pile_entry.playtime_minutes = playtime
                    
                    # Update status based on playtime
                    if playtime == 0 and pile_entry.status not in [GameStatus.AMNESTY_GRANTED, GameStatus.COMPLETED]:
                        pile_entry.status = GameStatus.UNPLAYED
                    elif playtime > 0 and pile_entry.status == GameStatus.UNPLAYED:
                        pile_entry.status = GameStatus.PLAYING
            
            db.commit()
            
        except Exception as e:
            db.rollback()
            print(f"Error syncing playtime: {e}")
            raise
    
    async def get_user_pile(self, user_id: int, filters: PileFilters, db: Session) -> List[PileEntry]:
        """Get user's pile with filtering and sorting"""
        # Start with base query including eager loading to prevent N+1
        query = db.query(PileEntry).options(
            joinedload(PileEntry.steam_game)
        ).filter(PileEntry.user_id == user_id)
        
        # Apply filters
        if filters.status:
            query = query.filter(PileEntry.status == filters.status)
        
        if filters.genre:
            query = query.join(SteamGame).filter(SteamGame.genres.contains([filters.genre]))
        
        # Apply sorting
        if filters.sort_by:
            if filters.sort_by == "playtime":
                if filters.sort_direction == "asc":
                    query = query.order_by(PileEntry.playtime_minutes.asc())
                else:
                    query = query.order_by(PileEntry.playtime_minutes.desc())
            elif filters.sort_by == "rating":
                # Join with SteamGame if not already joined
                if not filters.genre:
                    query = query.join(SteamGame)
                
                if filters.sort_direction == "asc":
                    query = query.order_by(SteamGame.steam_rating_percent.asc().nulls_last())
                else:
                    query = query.order_by(SteamGame.steam_rating_percent.desc().nulls_last())
        else:
            # Default sorting by creation date (newest first)
            query = query.order_by(PileEntry.created_at.desc())
        
        return query.offset(filters.offset).limit(filters.limit).all()
    
    async def grant_amnesty(self, user_id: int, steam_game_id: int, reason: str, db: Session) -> bool:
        """Grant amnesty to a game"""
        pile_entry = db.query(PileEntry).filter(
            PileEntry.user_id == user_id,
            PileEntry.steam_game_id == steam_game_id
        ).first()
        
        if pile_entry:
            pile_entry.status = GameStatus.AMNESTY_GRANTED
            pile_entry.amnesty_date = datetime.now(timezone.utc)
            pile_entry.amnesty_reason = reason
            db.commit()
            
            # Invalidate user-specific caches
            invalidate_cache_pattern(f"reality_check:*{user_id}*")
            invalidate_cache_pattern(f"behavioral_insights:*{user_id}*")
            
            return True
        
        return False

    async def start_playing(self, user_id: int, steam_game_id: int, db: Session) -> bool:
        """Mark a game as currently being played"""
        pile_entry = db.query(PileEntry).filter(
            PileEntry.user_id == user_id,
            PileEntry.steam_game_id == steam_game_id
        ).first()
        
        if pile_entry:
            pile_entry.status = GameStatus.PLAYING
            db.commit()
            
            # Invalidate user-specific caches
            invalidate_cache_pattern(f"reality_check:*{user_id}*")
            invalidate_cache_pattern(f"behavioral_insights:*{user_id}*")
            
            return True
        
        return False
    
    async def mark_completed(self, user_id: int, steam_game_id: int, db: Session) -> bool:
        """Mark a game as completed"""
        pile_entry = db.query(PileEntry).filter(
            PileEntry.user_id == user_id,
            PileEntry.steam_game_id == steam_game_id
        ).first()
        
        if pile_entry:
            pile_entry.status = GameStatus.COMPLETED
            pile_entry.completion_date = datetime.now(timezone.utc)
            db.commit()
            
            # Invalidate user-specific caches
            invalidate_cache_pattern(f"reality_check:*{user_id}*")
            invalidate_cache_pattern(f"behavioral_insights:*{user_id}*")
            
            return True
        
        return False
    
    async def mark_abandoned(self, user_id: int, steam_game_id: int, reason: str, db: Session) -> bool:
        """Mark a game as abandoned"""
        pile_entry = db.query(PileEntry).filter(
            PileEntry.user_id == user_id,
            PileEntry.steam_game_id == steam_game_id
        ).first()
        
        if pile_entry:
            pile_entry.status = GameStatus.ABANDONED
            pile_entry.abandon_date = datetime.now(timezone.utc)
            pile_entry.abandon_reason = reason
            db.commit()
            
            # Invalidate user-specific caches
            invalidate_cache_pattern(f"reality_check:*{user_id}*")
            invalidate_cache_pattern(f"behavioral_insights:*{user_id}*")
            
            return True
        
        return False
    
    async def update_status(self, user_id: int, steam_game_id: int, status: str, db: Session) -> bool:
        """Update game status directly"""
        pile_entry = db.query(PileEntry).filter(
            PileEntry.user_id == user_id,
            PileEntry.steam_game_id == steam_game_id
        ).first()
        
        if pile_entry:
            # Convert string status to enum
            status_map = {
                'unplayed': GameStatus.UNPLAYED,
                'playing': GameStatus.PLAYING,
                'completed': GameStatus.COMPLETED,
                'abandoned': GameStatus.ABANDONED,
                'amnesty_granted': GameStatus.AMNESTY_GRANTED
            }
            
            if status in status_map:
                pile_entry.status = status_map[status]
                
                # Set appropriate timestamps
                if status == 'completed':
                    pile_entry.completion_date = datetime.now(timezone.utc)
                elif status == 'amnesty_granted':
                    pile_entry.amnesty_date = datetime.now(timezone.utc)
                elif status == 'abandoned':
                    pile_entry.abandon_date = datetime.now(timezone.utc)
                
                db.commit()
                return True
        
        return False
