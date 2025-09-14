#!/usr/bin/env python3
"""Simple test script to see if we can import and start the app"""

print("Starting test script...")

try:
    print("Testing imports...")
    from app.main import app
    print("FastAPI app imported successfully!")
    
    print("Testing settings...")
    from app.core.config import settings
    print(f"Settings loaded - CORS origins: {settings.CORS_ORIGINS}")
    
    print("All imports successful!")
    
except Exception as e:
    print(f"Error during import: {e}")
    import traceback
    traceback.print_exc()