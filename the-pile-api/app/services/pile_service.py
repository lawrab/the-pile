import httpx
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.user import User
from app.models.steam_game import SteamGame
from app.models.pile_entry import PileEntry, GameStatus
from app.schemas.pile import PileFilters
from app.core.config import settings


class PileService:
    async def get_steam_owned_games(self, steam_id: str) -> List[dict]:
        """Fetch owned games from Steam Web API"""
        url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
        params = {
            "key": settings.STEAM_API_KEY,
            "steamid": steam_id,
            "format": "json",
            "include_appinfo": True,
            "include_played_free_games": True
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
            
            return data.get("response", {}).get("games", [])
    
    async def get_steam_app_details(self, app_id: int) -> dict:
        """Fetch game details from Steam Store API"""
        url = f"https://store.steampowered.com/api/appdetails"
        params = {"appids": app_id, "filters": "basic,genres,categories,price_overview,screenshots"}
        
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
    
    async def import_steam_library(self, steam_id: str, user_id: int, db: Session):
        """Import user's Steam library"""
        try:
            # Fetch owned games from Steam
            owned_games = await self.get_steam_owned_games(steam_id)
            
            for game_data in owned_games:
                app_id = game_data["appid"]
                
                # Check if Steam game already exists in database
                steam_game = db.query(SteamGame).filter(SteamGame.steam_app_id == app_id).first()
                
                # Always fetch fresh details to keep Steam data up to date
                details = await self.get_steam_app_details(app_id)
                
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
                        screenshots=[s["path_full"] for s in details.get("screenshots", [])] if details.get("screenshots") else []
                    )
                    db.add(steam_game)
                    # Commit immediately to get the ID and release the lock
                    db.commit()
                    # Refresh to get the auto-generated ID
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
                    steam_game.last_updated = datetime.utcnow()
                    db.commit()
                
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
                    db.commit()
            
            # Update user's last sync time
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.last_sync_at = datetime.utcnow()
                db.commit()
                
        except Exception as e:
            db.rollback()
            print(f"Error importing Steam library: {e}")
            raise
    
    async def sync_playtime(self, steam_id: str, user_id: int, db: Session):
        """Sync playtime data from Steam"""
        try:
            owned_games = await self.get_steam_owned_games(steam_id)
            
            for game_data in owned_games:
                app_id = game_data["appid"]
                playtime = game_data.get("playtime_forever", 0)
                
                # Find existing pile entry
                pile_entry = db.query(PileEntry).join(SteamGame).filter(
                    PileEntry.user_id == user_id,
                    SteamGame.steam_app_id == app_id
                ).first()
                
                if pile_entry:
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
        """Get user's pile with filtering"""
        query = db.query(PileEntry).filter(PileEntry.user_id == user_id)
        
        if filters.status:
            query = query.filter(PileEntry.status == filters.status)
        
        if filters.genre:
            query = query.join(SteamGame).filter(SteamGame.genres.contains([filters.genre]))
        
        return query.offset(filters.offset).limit(filters.limit).all()
    
    async def grant_amnesty(self, user_id: int, steam_game_id: int, reason: str, db: Session) -> bool:
        """Grant amnesty to a game"""
        pile_entry = db.query(PileEntry).filter(
            PileEntry.user_id == user_id,
            PileEntry.steam_game_id == steam_game_id
        ).first()
        
        if pile_entry:
            pile_entry.status = GameStatus.AMNESTY_GRANTED
            pile_entry.amnesty_date = datetime.utcnow()
            pile_entry.amnesty_reason = reason
            db.commit()
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
            pile_entry.completion_date = datetime.utcnow()
            db.commit()
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
            pile_entry.abandon_date = datetime.utcnow()
            pile_entry.abandon_reason = reason
            db.commit()
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
                    pile_entry.completion_date = datetime.utcnow()
                elif status == 'amnesty_granted':
                    pile_entry.amnesty_date = datetime.utcnow()
                elif status == 'abandoned':
                    pile_entry.abandon_date = datetime.utcnow()
                
                db.commit()
                return True
        
        return False
