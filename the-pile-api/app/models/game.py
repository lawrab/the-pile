from sqlalchemy import JSON, Column, Float, Integer, String, Text

from app.db.base import Base


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    steam_app_id = Column(Integer, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    price = Column(Float)  # Price in USD
    genres = Column(JSON)  # List of genre strings
    tags = Column(JSON)  # List of tag strings
    description = Column(Text)
    image_url = Column(String)
    header_image_url = Column(String)
    release_date = Column(String)
    metacritic_score = Column(Integer)

    # Note: This model is deprecated - use SteamGame instead
    # No relationships to avoid conflicts with new schema
