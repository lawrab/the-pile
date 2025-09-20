from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=20,          # Number of connections to maintain in pool
    max_overflow=30,       # Additional connections beyond pool_size
    pool_timeout=30,       # Timeout for getting connection from pool
    pool_recycle=3600,     # Recycle connections after 1 hour
    pool_pre_ping=True,    # Verify connections before use
    echo=False,            # Set to True for SQL logging in development
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_session():
    """Get a database session for background tasks"""
    return SessionLocal()