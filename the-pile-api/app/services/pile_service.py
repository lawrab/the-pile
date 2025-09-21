import asyncio
from datetime import datetime, timedelta, timezone
import time
from typing import Any, Dict, List

import httpx
from sqlalchemy.orm import Session

try:
    from dateutil import parser as dateutil_parser
except ImportError:
    dateutil_parser = None
from app.core.config import settings
from app.models.import_status import ImportStatus
from app.models.pile_entry import GameStatus, PileEntry
from app.models.steam_game import SteamGame
from app.models.user import User
from app.schemas.pile import PileFilters
from app.services.cache_service import invalidate_cache_pattern


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
            burst_size=20,  # Allow small bursts
        )

    async def check_steam_profile_visibility(self, steam_id: str) -> tuple[bool, str]:
        """Check if a Steam profile is public

        Returns:
            tuple: (is_public: bool, visibility_state: str)
            visibility_state can be: "public", "friendsonly", "private", or "unknown"
        """
        import logging

        logger = logging.getLogger(__name__)

        # Apply rate limiting
        await self.rate_limiter.acquire()

        api_key = settings.STEAM_API_KEY
        if not api_key:
            logger.error("STEAM_API_KEY is not configured")
            raise ValueError("Steam API key is not configured")

        url = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/"
        params = {
            "key": api_key,
            "steamids": steam_id,
        }

        logger.info(f"Checking profile visibility for steam_id: {steam_id}")

        async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                players = data.get("response", {}).get("players", [])
                if not players:
                    logger.warning(f"No player data found for steam_id: {steam_id}")
                    return False, "unknown"

                player = players[0]
                # communityvisibilitystate: 1 = Private, 2 = Friends Only, 3 = Public
                visibility_state = player.get("communityvisibilitystate", 1)

                if visibility_state == 3:
                    logger.info(f"Profile is public for steam_id: {steam_id}")
                    return True, "public"
                elif visibility_state == 2:
                    logger.info(f"Profile is friends-only for steam_id: {steam_id}")
                    return False, "friendsonly"
                else:
                    logger.info(f"Profile is private for steam_id: {steam_id}")
                    return False, "private"

            except Exception as e:
                logger.error(f"Error checking profile visibility: {e}")
                return False, "unknown"

    async def get_steam_owned_games(self, steam_id: str):
        """Fetch owned games from Steam API with rate limiting and timeout handling"""
        import logging

        logger = logging.getLogger(__name__)

        # Apply rate limiting
        await self.rate_limiter.acquire()

        api_key = settings.STEAM_API_KEY
        if not api_key:
            logger.error("STEAM_API_KEY is not configured")
            raise ValueError("Steam API key is not configured")

        url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
        params = {
            "key": api_key,
            "steamid": steam_id,
            "include_appinfo": 1,
            "include_played_free_games": 1,  # Include free games they've played
            "format": "json",
        }

        logger.info(f"Making Steam API call to GetOwnedGames for steam_id: {steam_id}")

        # Configure timeout - Steam API can be slow
        timeout = httpx.Timeout(30.0, connect=10.0)  # 30s total, 10s connect

        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                logger.info(f"Steam API response status: {response.status_code}")
                logger.info(f"Steam API response data keys: {list(data.keys())}")

                if "response" not in data:
                    logger.error(f"No 'response' key in Steam API data: {data}")
                    return []

                response_data = data["response"]

                # Log only the structure, not the content (privacy and size concerns)
                response_keys = list(response_data.keys()) if response_data else []
                logger.info(f"Steam API response keys: {response_keys}")

                # Check if the response has a game_count field
                game_count = response_data.get("game_count", 0)
                games = response_data.get("games", [])

                logger.info(f"Steam API reports game_count: {game_count}")
                logger.info(f"Found {len(games)} games in games array")

                # If game_count is 0 or games is empty, profile might be private
                if game_count == 0 and len(games) == 0:
                    logger.warning(
                        f"Steam profile might be private or user has no games: "
                        f"steam_id={steam_id}"
                    )
                    # Log structure only, not data
                    logger.info(
                        f"Response structure - keys: {response_keys}, "
                        f"is_empty: {not response_data}"
                    )

                return games

            except httpx.TimeoutException as e:
                logger.error(f"Steam API timeout for steam_id {steam_id}: {e}")
                raise ValueError("Steam API request timed out. Please try again.")
            except httpx.HTTPStatusError as e:
                logger.error(f"Steam API HTTP error for steam_id {steam_id}: {e}")
                raise ValueError(f"Steam API returned error: {e.response.status_code}")
            except Exception as e:
                logger.error(
                    f"Unexpected error calling Steam API for steam_id {steam_id}: {e}"
                )
                raise ValueError(f"Failed to fetch games from Steam: {str(e)}")

    async def get_steam_app_details(self, app_id: int):
        """Fetch app details from Steam Store API with timeout handling"""
        # Apply rate limiting
        await self.rate_limiter.acquire()

        url = "https://store.steampowered.com/api/appdetails"
        params = {"appids": app_id, "l": "english"}

        # Configure timeout for Store API
        timeout = httpx.Timeout(20.0, connect=5.0)  # 20s total, 5s connect

        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if str(app_id) in data and data[str(app_id)]["success"]:
                    return data[str(app_id)]["data"]
                return {}

            except (httpx.TimeoutException, httpx.HTTPStatusError, Exception):
                # Store API failures are non-critical, just return empty data
                return {}

    async def get_steam_reviews(self, app_id: int):
        """Fetch review summary from Steam API with timeout handling"""
        # Apply rate limiting
        await self.rate_limiter.acquire()

        url = f"https://store.steampowered.com/appreviews/{app_id}"
        params = {
            "json": 1,
            "language": "all",
            "review_type": "all",
            "purchase_type": "all",
            "num_per_page": 0,  # We only want the summary data
        }

        # Configure timeout for Reviews API
        timeout = httpx.Timeout(15.0, connect=5.0)  # 15s total, 5s connect

        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if data.get("success") == 1 and "query_summary" in data:
                    query_summary = data["query_summary"]
                    total_reviews = query_summary.get("total_reviews", 0)

                    if total_reviews > 0:
                        positive_reviews = query_summary.get("total_positive", 0)
                        rating_percent = self._calculate_rating_percentage(
                            positive_reviews, total_reviews
                        )

                        return {
                            "total_reviews": total_reviews,
                            "positive_reviews": positive_reviews,
                            "rating_percent": rating_percent,
                            "review_score_desc": query_summary.get("review_score_desc"),
                        }

                return {}

            except (httpx.TimeoutException, httpx.HTTPStatusError, Exception):
                # Reviews API failures are non-critical, just return empty data
                return {}

    def _calculate_rating_percentage(self, positive: int, total: int) -> int:
        """Calculate positive review percentage"""
        if total == 0:
            return 0
        return int((positive / total) * 100)

    def _detect_abandoned_status(
        self,
        current_playtime: int,
        stored_playtime: int,
        current_status: GameStatus,
        last_updated: datetime = None,
    ) -> GameStatus:
        """
        Detect if a game should be marked as abandoned based on playtime patterns.

        Abandoned game criteria (3 month timeframe):
        1. Game was being played (status = PLAYING) but playtime hasn't
           increased in 3+ months
        2. Game has some playtime (> 0) but hasn't been touched in 3+ months
        3. Unplayed games that have been in pile for 3+ months

        Args:
            current_playtime: Current playtime from Steam (minutes)
            stored_playtime: Previously stored playtime (minutes)
            current_status: Current game status
            last_updated: When the entry was last updated

        Returns:
            GameStatus.ABANDONED if criteria met, otherwise the current status
        """
        # Only auto-abandon games that are currently unplayed or playing
        if current_status not in [GameStatus.UNPLAYED, GameStatus.PLAYING]:
            return current_status

        # If playtime hasn't changed, this suggests the game hasn't been played recently
        playtime_unchanged = current_playtime == stored_playtime

        # Get time thresholds - 3 months for all criteria
        now = datetime.now(timezone.utc)
        three_months_ago = now - timedelta(days=90)

        # Ensure we have a valid datetime object for comparison
        if last_updated is None:
            # If no last_updated, assume it's very old (fallback to long ago)
            last_activity = three_months_ago - timedelta(days=365)  # Over a year ago
        elif isinstance(last_updated, str):
            # If it's a string, try to parse it
            try:
                if dateutil_parser:
                    last_activity = dateutil_parser.parse(last_updated)
                else:
                    # Fallback to basic datetime parsing
                    last_activity = datetime.fromisoformat(
                        last_updated.replace("Z", "+00:00")
                    )
                # Ensure it's timezone-aware
                if last_activity.tzinfo is None:
                    last_activity = last_activity.replace(tzinfo=timezone.utc)
            except Exception as e:
                print(f"Error parsing datetime string '{last_updated}': {e}")
                last_activity = three_months_ago - timedelta(days=365)  # Fallback
        elif isinstance(last_updated, datetime):
            last_activity = last_updated
            # Ensure it's timezone-aware
            if last_activity.tzinfo is None:
                last_activity = last_activity.replace(tzinfo=timezone.utc)
        else:
            print(
                f"Unexpected type for last_updated: {type(last_updated)} - "
                f"{last_updated}"
            )
            last_activity = three_months_ago - timedelta(days=365)  # Fallback

        # 3-month criteria:

        # Criterion 1: Unplayed games older than 3 months
        if (
            current_status == GameStatus.UNPLAYED
            and current_playtime == 0
            and last_activity < three_months_ago
        ):
            return GameStatus.ABANDONED

        # Criterion 2: Games with any playtime but not touched in 3+ months
        if (
            current_playtime > 0
            and playtime_unchanged
            and last_activity < three_months_ago
        ):
            return GameStatus.ABANDONED

        # Criterion 3: Playing games with no playtime increase in 3+ months
        if (
            current_status == GameStatus.PLAYING
            and playtime_unchanged
            and current_playtime > 0
            and last_activity < three_months_ago
        ):
            return GameStatus.ABANDONED

        return current_status

    async def get_game_details_batch(
        self, app_ids: List[int], db: Session
    ) -> Dict[int, Dict[str, Any]]:
        """
        Fetch game details for a batch of app IDs with parallel processing
        and error handling
        """
        import asyncio

        from app.services.cache_service import cache_service

        results = {}
        semaphore = asyncio.Semaphore(10)  # Limit concurrent requests

        async def fetch_game_data(app_id: int):
            """Fetch data for a single game with error handling"""
            async with semaphore:
                try:
                    # Check cache first
                    cache_key = f"game_details:{app_id}"
                    cached_data = cache_service.get(cache_key)
                    if cached_data:
                        return app_id, cached_data

                    # Fetch fresh data with timeout handling
                    details_task = self.get_steam_app_details(app_id)
                    reviews_task = self.get_steam_reviews(app_id)

                    # Run both requests concurrently with timeout
                    try:
                        details, reviews = await asyncio.wait_for(
                            asyncio.gather(
                                details_task, reviews_task, return_exceptions=True
                            ),
                            timeout=35.0,  # Overall timeout for both requests
                        )

                        # Handle exceptions from individual requests
                        if isinstance(details, Exception):
                            print(f"Details fetch failed for app {app_id}: {details}")
                            details = {}
                        if isinstance(reviews, Exception):
                            print(f"Reviews fetch failed for app {app_id}: {reviews}")
                            reviews = {}

                    except asyncio.TimeoutError:
                        print(f"Overall timeout for app {app_id}, using empty data")
                        details, reviews = {}, {}

                    game_data = {"details": details, "reviews": reviews}

                    # Cache successful results for 7 days
                    if details or reviews:
                        cache_service.set(cache_key, game_data, expiration=604800)

                    return app_id, game_data

                except Exception as e:
                    print(f"Error fetching data for app {app_id}: {e}")
                    return app_id, {"details": {}, "reviews": {}}

        # Process all games concurrently
        tasks = [fetch_game_data(app_id) for app_id in app_ids]

        try:
            # Wait for all tasks with a generous timeout
            completed_tasks = await asyncio.wait_for(
                asyncio.gather(*tasks, return_exceptions=True),
                timeout=120.0,  # 2 minutes for entire batch
            )

            for result in completed_tasks:
                if isinstance(result, Exception):
                    print(f"Batch task failed: {result}")
                    continue
                app_id, game_data = result
                results[app_id] = game_data

        except asyncio.TimeoutError:
            print(f"Batch processing timed out for {len(app_ids)} apps")
            # Return partial results

        return results

    async def import_steam_library(self, steam_id: str, user_id: int, db: Session):
        """Import user's Steam library with parallel processing"""
        import logging

        logger = logging.getLogger(__name__)

        logger.info(
            f"Starting import_steam_library for user {user_id}, steam_id {steam_id}"
        )

        # Create import status record
        import_status = ImportStatus(
            user_id=user_id,
            operation_type="import",
            status="running",
            progress_current=0,
        )
        db.add(import_status)
        db.commit()
        db.refresh(import_status)

        logger.info(f"Created import status record {import_status.id}")

        try:
            # Fetch owned games from Steam
            logger.info(f"Fetching owned games from Steam for {steam_id}")
            owned_games = await self.get_steam_owned_games(steam_id)
            logger.info(f"Retrieved {len(owned_games)} games from Steam")

            # Update progress with total count
            import_status.progress_total = len(owned_games)
            db.commit()

            if len(owned_games) == 0:
                logger.warning(f"No games found for Steam ID {steam_id}")

                # Check if this is a privacy issue
                logger.info("Checking profile visibility...")
                is_public, visibility_state = await self.check_steam_profile_visibility(
                    steam_id
                )

                if not is_public:
                    if visibility_state == "private":
                        error_msg = (
                            "Your Steam profile is set to Private. Due to Steam "
                            "API limitations, we can only access game libraries "
                            "from public profiles. Please temporarily set your "
                            "profile to Public in Steam > Edit Profile > Privacy "
                            "Settings, import your games, then you can set it "
                            "back to Private."
                        )
                    elif visibility_state == "friendsonly":
                        error_msg = (
                            "Your Steam profile is set to Friends Only. Due to "
                            "Steam API limitations, we can only access game "
                            "libraries from public profiles. Please temporarily "
                            "set your profile to Public in Steam > Edit Profile > "
                            "Privacy Settings, import your games, then you can "
                            "set it back to Friends Only."
                        )
                    else:
                        error_msg = (
                            "Unable to access your Steam profile. Please ensure "
                            "your profile is set to Public in Steam Privacy "
                            "Settings."
                        )

                    import_status.status = "failed"
                    import_status.error_message = error_msg
                    logger.warning(f"Profile visibility issue: {visibility_state}")
                else:
                    # Profile is public but no games found
                    import_status.status = "completed"
                    import_status.error_message = (
                        "No games found in your Steam library."
                    )
                    logger.info("Profile is public but user has no games")

                import_status.completed_at = datetime.now(timezone.utc)
                db.commit()
                return

            # Process games in batches for better performance
            BATCH_SIZE = 50  # Process 50 games at a time
            total_processed = 0

            for batch_start in range(0, len(owned_games), BATCH_SIZE):
                batch_end = min(batch_start + BATCH_SIZE, len(owned_games))
                batch_games = owned_games[batch_start:batch_end]

                logger.info(
                    f"Processing batch {batch_start//BATCH_SIZE + 1}: "
                    f"{len(batch_games)} games"
                )

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

                logger.info(f"Processed {total_processed}/{len(owned_games)} games")

            # Update user's last sync time
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.last_sync_at = datetime.now(timezone.utc)
                db.commit()
                logger.info(f"Updated last_sync_at for user {user_id}")

            # Mark import as completed
            import_status.status = "completed"
            import_status.completed_at = datetime.now(timezone.utc)
            db.commit()

            logger.info(f"Import completed successfully for user {user_id}")

        except Exception as e:
            logger.error(f"Error importing Steam library for user {user_id}: {str(e)}")
            db.rollback()
            # Mark import as failed
            import_status.status = "failed"
            import_status.error_message = str(e)
            import_status.completed_at = datetime.now(timezone.utc)
            db.commit()
            print(f"Error importing Steam library: {e}")
            raise

    async def _process_game_batch(
        self,
        batch_games: List[dict],
        game_details: Dict[int, Dict[str, Any]],
        user_id: int,
        db: Session,
    ):
        """Process a batch of games with their fetched details"""
        import logging
        
        logger = logging.getLogger(__name__)
        
        for game_data in batch_games:
            app_id = game_data["appid"]

            # Get the fetched details for this game
            details = game_details.get(app_id, {}).get("details", {})
            reviews = game_details.get(app_id, {}).get("reviews", {})

            # Ensure reviews is never None
            if reviews is None:
                reviews = {}

            # Check if Steam game already exists in database
            steam_game = (
                db.query(SteamGame).filter(SteamGame.steam_app_id == app_id).first()
            )

            # Extract game information with improved price handling
            price_overview = details.get("price_overview", {})
            game_price = 0.0
            
            if price_overview:
                # Steam returns prices in cents, convert to dollars
                initial_price_cents = price_overview.get("initial", 0)
                final_price_cents = price_overview.get("final", initial_price_cents)
                
                # Use final price (after discounts) if available, otherwise initial
                game_price = final_price_cents / 100.0 if final_price_cents else 0.0
                
                # Debug logging for price calculation
                if initial_price_cents != final_price_cents:
                    logger.debug(
                        f"Game {app_id} price: ${initial_price_cents/100:.2f} "
                        f"-> ${final_price_cents/100:.2f} (discounted)"
                    )
            
            # Game is free if the price is 0 (check the converted dollar amount)
            is_free = game_price == 0.0

            if not steam_game:
                # Create new Steam game record
                steam_game = SteamGame(
                    steam_app_id=app_id,
                    name=game_data.get("name", "Unknown Game"),
                    image_url=(
                        f"https://steamcdn-a.akamaihd.net/steam/apps/{app_id}/"
                        "header.jpg"
                    ),
                    genres=(
                        [g["description"] for g in details.get("genres", [])]
                        if details.get("genres")
                        else []
                    ),
                    categories=(
                        [c["description"] for c in details.get("categories", [])]
                        if details.get("categories")
                        else []
                    ),
                    description=details.get("short_description", ""),
                    price=game_price,
                    is_free=is_free,
                    release_date=(
                        details.get("release_date", {}).get("date", "")
                        if details.get("release_date")
                        else ""
                    ),
                    developer=(
                        ", ".join(details.get("developers", []))
                        if details.get("developers")
                        else ""
                    ),
                    publisher=(
                        ", ".join(details.get("publishers", []))
                        if details.get("publishers")
                        else ""
                    ),
                    screenshots=(
                        [s["path_full"] for s in details.get("screenshots", [])]
                        if details.get("screenshots")
                        else []
                    ),
                    # Steam review/rating data
                    steam_rating_percent=(
                        reviews.get("rating_percent")
                        if reviews
                        and reviews.get("total_reviews", 0)
                        and reviews.get("total_reviews", 0) > 0
                        else None
                    ),
                    steam_review_summary=(
                        reviews.get("review_score_desc")
                        if reviews
                        and reviews.get("total_reviews", 0)
                        and reviews.get("total_reviews", 0) > 0
                        else None
                    ),
                    steam_review_count=(
                        reviews.get("total_reviews")
                        if reviews
                        and reviews.get("total_reviews", 0)
                        and reviews.get("total_reviews", 0) > 0
                        else None
                    ),
                    steam_type=details.get("type"),
                    # Store Steam's last played time
                    rtime_last_played=game_data.get("rtime_last_played"),
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
                    steam_game.genres = [
                        g["description"] for g in details.get("genres", [])
                    ]
                if details.get("categories"):
                    steam_game.categories = [
                        c["description"] for c in details.get("categories", [])
                    ]
                if details.get("short_description"):
                    steam_game.description = details.get("short_description")
                if details.get("release_date", {}).get("date"):
                    steam_game.release_date = details.get("release_date", {}).get(
                        "date"
                    )
                if details.get("developers"):
                    steam_game.developer = ", ".join(details.get("developers", []))
                if details.get("publishers"):
                    steam_game.publisher = ", ".join(details.get("publishers", []))
                if details.get("screenshots"):
                    steam_game.screenshots = [
                        s["path_full"] for s in details.get("screenshots", [])
                    ]

                # Update Steam review/rating data if available
                total_reviews = reviews.get("total_reviews") if reviews else None
                if total_reviews and total_reviews > 0:
                    steam_game.steam_rating_percent = reviews.get("rating_percent")
                    steam_game.steam_review_summary = reviews.get("review_score_desc")
                    steam_game.steam_review_count = reviews.get("total_reviews")

                # Update Steam type and last played time
                if details.get("type"):
                    steam_game.steam_type = details.get("type")

                # Update Steam's last played time
                steam_game.rtime_last_played = game_data.get("rtime_last_played")

                steam_game.last_updated = datetime.now(timezone.utc)

            # Check if pile entry already exists
            existing_entry = (
                db.query(PileEntry)
                .filter(
                    PileEntry.user_id == user_id,
                    PileEntry.steam_game_id == steam_game.id,
                )
                .first()
            )

            current_playtime = game_data.get("playtime_forever", 0)

            if not existing_entry:
                # Create pile entry - status will be computed dynamically when retrieved
                pile_entry = PileEntry(
                    user_id=user_id,
                    steam_game_id=steam_game.id,
                    playtime_minutes=current_playtime,
                    # Use current Steam price as purchase price
                    purchase_price=game_price,
                    status=(
                        GameStatus.UNPLAYED
                        if current_playtime == 0
                        else GameStatus.PLAYING
                    ),
                )
                db.add(pile_entry)
            else:
                # Update existing entry - status will be computed dynamically
                # when retrieved
                existing_entry.playtime_minutes = current_playtime
                existing_entry.updated_at = datetime.now(timezone.utc)

        # Commit the entire batch at once for better performance
        db.commit()

    async def sync_playtime(self, steam_id: str, user_id: int, db: Session):
        """
        Sync playtime data from Steam with abandoned detection using
        Steam's last played data
        """
        import logging
        
        logger = logging.getLogger(__name__)
        
        try:
            owned_games = await self.get_steam_owned_games(steam_id)

            # Build maps for efficient lookup
            playtime_map = {}
            last_played_map = {}
            
            # Debug: Track privacy issues
            games_with_last_played = 0
            games_without_last_played = 0

            for game_data in owned_games:
                app_id = game_data["appid"]
                playtime_map[app_id] = game_data.get("playtime_forever", 0)

                # Get last played time from Steam (Unix timestamp)
                rtime_last_played = game_data.get("rtime_last_played")
                if rtime_last_played and rtime_last_played > 0:
                    # Convert Unix timestamp to datetime
                    last_played_map[app_id] = datetime.fromtimestamp(
                        rtime_last_played, tz=timezone.utc
                    )
                    games_with_last_played += 1
                else:
                    last_played_map[app_id] = None
                    games_without_last_played += 1

            # Log privacy analysis - use WARNING to ensure visibility
            total_games = len(owned_games)
            logger.warning(
                f"SYNC PRIVACY ANALYSIS - User {user_id}: {games_with_last_played}/{total_games} games have "
                f"last played data, {games_without_last_played} games missing last played data "
                f"(likely due to Steam privacy settings)"
            )

            # Get all pile entries for this user with their steam games
            pile_entries = (
                db.query(PileEntry)
                .join(SteamGame)
                .filter(
                    PileEntry.user_id == user_id,
                    SteamGame.steam_app_id.in_(list(playtime_map.keys())),
                )
                .all()
            )

            updated_count = 0
            abandoned_count = 0
            checked_count = 0

            for entry in pile_entries:
                app_id = entry.steam_game.steam_app_id
                current_playtime = playtime_map.get(app_id, 0)
                stored_playtime = entry.playtime_minutes
                steam_last_played = last_played_map.get(app_id)
                checked_count += 1

                # Use Steam's last played time if available, otherwise fall back
                # to database timestamps
                if steam_last_played:
                    last_activity_date = steam_last_played
                    activity_source = "Steam"
                else:
                    last_activity_date = entry.updated_at or entry.created_at
                    activity_source = "Database"

                # Always check if game should be marked as abandoned
                new_status = self._detect_abandoned_status(
                    current_playtime=current_playtime,
                    stored_playtime=stored_playtime,
                    current_status=entry.status,
                    last_updated=last_activity_date,
                )

                # Update playtime if it changed
                playtime_changed = current_playtime != stored_playtime
                if playtime_changed:
                    entry.playtime_minutes = current_playtime
                    entry.updated_at = datetime.now(timezone.utc)
                    updated_count += 1

                # Update status if abandoned detection triggered
                if new_status != entry.status and new_status == GameStatus.ABANDONED:
                    entry.status = new_status
                    entry.abandon_date = datetime.now(timezone.utc)
                    entry.abandon_reason = (
                        f"Automatically detected during sync - no recent activity "
                        f"(using {activity_source} data)"
                    )
                    entry.updated_at = datetime.now(timezone.utc)
                    abandoned_count += 1

                # If either playtime or status changed, mark as updated
                if playtime_changed or (new_status != entry.status):
                    entry.updated_at = datetime.now(timezone.utc)

            # Commit all changes
            db.commit()

            # Log sync completion summary - use WARNING to ensure visibility  
            logger.warning(
                f"SYNC COMPLETED - User {user_id}: "
                f"Checked {checked_count} games, updated playtime for "
                f"{updated_count} games, marked {abandoned_count} games as abandoned. "
                f"Privacy impact: {games_without_last_played}/{total_games} games "
                f"missing last played data."
            )

        except Exception as e:
            db.rollback()
            logger.error(f"Error syncing playtime for user {user_id}: {e}")
            raise

    async def get_user_pile(
        self, user_id: int, filters: PileFilters, db: Session
    ) -> List[PileEntry]:
        """Get user's pile with filtering and sorting using repository pattern"""
        from app.repositories.pile_repository import PileRepository

        pile_repo = PileRepository(db)
        return pile_repo.get_filtered_pile(user_id, filters)

    async def grant_amnesty(
        self, user_id: int, steam_game_id: int, reason: str, db: Session
    ) -> bool:
        """Grant amnesty to a game using repository pattern"""
        from app.repositories.pile_repository import PileRepository

        pile_repo = PileRepository(db)
        entry = pile_repo.update_status(
            user_id,
            steam_game_id,
            GameStatus.AMNESTY_GRANTED,
            amnesty_date=datetime.now(timezone.utc),
            amnesty_reason=reason,
        )

        if entry:
            # Invalidate user-specific caches
            invalidate_cache_pattern(f"reality_check:*{user_id}*")
            invalidate_cache_pattern(f"behavioral_insights:*{user_id}*")
            return True

        return False

    async def start_playing(
        self, user_id: int, steam_game_id: int, db: Session
    ) -> bool:
        """Mark a game as currently being played using repository pattern"""
        from app.repositories.pile_repository import PileRepository

        pile_repo = PileRepository(db)
        entry = pile_repo.update_status(user_id, steam_game_id, GameStatus.PLAYING)

        if entry:
            # Invalidate user-specific caches
            invalidate_cache_pattern(f"reality_check:*{user_id}*")
            invalidate_cache_pattern(f"behavioral_insights:*{user_id}*")
            return True

        return False

    async def mark_completed(
        self, user_id: int, steam_game_id: int, db: Session
    ) -> bool:
        """Mark a game as completed using repository pattern"""
        from app.repositories.pile_repository import PileRepository

        pile_repo = PileRepository(db)
        entry = pile_repo.update_status(
            user_id,
            steam_game_id,
            GameStatus.COMPLETED,
            completion_date=datetime.now(timezone.utc),
        )

        if entry:
            # Invalidate user-specific caches
            invalidate_cache_pattern(f"reality_check:*{user_id}*")
            invalidate_cache_pattern(f"behavioral_insights:*{user_id}*")
            return True

        return False

    async def mark_abandoned(
        self, user_id: int, steam_game_id: int, reason: str, db: Session
    ) -> bool:
        """Mark a game as abandoned using repository pattern"""
        from app.repositories.pile_repository import PileRepository

        pile_repo = PileRepository(db)
        entry = pile_repo.update_status(
            user_id,
            steam_game_id,
            GameStatus.ABANDONED,
            abandon_date=datetime.now(timezone.utc),
            abandon_reason=reason,
        )

        if entry:
            # Invalidate user-specific caches
            invalidate_cache_pattern(f"reality_check:*{user_id}*")
            invalidate_cache_pattern(f"behavioral_insights:*{user_id}*")
            return True

        return False

    async def update_status(
        self, user_id: int, steam_game_id: int, status: str, db: Session
    ) -> bool:
        """Update game status directly"""
        pile_entry = (
            db.query(PileEntry)
            .filter(
                PileEntry.user_id == user_id, PileEntry.steam_game_id == steam_game_id
            )
            .first()
        )

        if pile_entry:
            # Convert string status to enum
            status_map = {
                "unplayed": GameStatus.UNPLAYED,
                "playing": GameStatus.PLAYING,
                "completed": GameStatus.COMPLETED,
                "abandoned": GameStatus.ABANDONED,
                "amnesty_granted": GameStatus.AMNESTY_GRANTED,
            }

            if status in status_map:
                pile_entry.status = status_map[status]

                # Set appropriate timestamps
                if status == "completed":
                    pile_entry.completion_date = datetime.now(timezone.utc)
                elif status == "amnesty_granted":
                    pile_entry.amnesty_date = datetime.now(timezone.utc)
                elif status == "abandoned":
                    pile_entry.abandon_date = datetime.now(timezone.utc)

                db.commit()
                return True

        return False

    async def clear_user_pile(self, user_id: int, db: Session) -> int:
        """
        Clear all pile entries for a user (destructive operation) and reset
        import throttling
        """
        from app.models.user import User
        from app.repositories.pile_repository import PileRepository
        from app.services.cache_service import invalidate_cache_pattern

        pile_repo = PileRepository(db)

        # Delete all pile entries for the user
        deleted_count = pile_repo.clear_user_pile(user_id)

        # Reset the user's last_sync_at to allow immediate reimport
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.last_sync_at = None
            db.commit()

        # Clear related caches
        invalidate_cache_pattern(f"reality_check:{user_id}")
        invalidate_cache_pattern(f"behavioral_insights:{user_id}")

        return deleted_count
