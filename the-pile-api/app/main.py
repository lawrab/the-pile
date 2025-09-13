from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, pile, stats, share

app = FastAPI(
    title="The Pile API",
    description="Gaming backlog tracker that helps confront your pile of shame",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(pile.router, prefix="/api/v1/pile", tags=["pile"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["stats"])
app.include_router(share.router, prefix="/api/v1/share", tags=["share"])

@app.get("/")
async def root():
    return {"message": "Welcome to The Pile API - confront your gaming backlog!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}