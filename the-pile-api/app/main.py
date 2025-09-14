from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1 import auth, pile, stats, share
import time

app = FastAPI(
    title="The Pile API",
    description="Gaming backlog tracker that helps confront your pile of shame",
    version="0.1.0-alpha",
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Performance tracking
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

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