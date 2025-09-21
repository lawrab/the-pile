import time

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1 import auth, pile, share, stats
from app.core.config import settings
from app.core.rate_limiter import limiter

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="The Pile API",
    description="Gaming backlog tracker that helps confront your pile of shame",
    version="0.1.0-alpha",
)

# Add rate limiting state and exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


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


# CORS middleware with restricted configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["X-Process-Time"],
    max_age=3600,
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
