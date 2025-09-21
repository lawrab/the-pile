#!/usr/bin/env python3
"""Development server startup script"""

import os

from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Set development defaults
    os.environ.setdefault(
        "DATABASE_URL", "postgresql://postgres:password@localhost:5432/thepile_dev"
    )
    os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
    os.environ.setdefault("JWT_SECRET_KEY", "dev_secret_key_change_in_production")
    os.environ.setdefault("STEAM_API_KEY", "your_steam_api_key_here")
    os.environ.setdefault("CORS_ORIGINS", '["http://localhost:3000"]')

    uvicorn.run(
        "app.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info"
    )
