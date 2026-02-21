"""Main FastAPI application.""" 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from config import settings
import uvicorn

app = FastAPI(title="NepLaunch API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
from routers import auth, founders, talent, investors, matches, ai

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(founders.router, prefix="/founders", tags=["founders"])
app.include_router(talent.router, prefix="/talent", tags=["talent"])
app.include_router(investors.router, prefix="/investors", tags=["investors"])
app.include_router(matches.router, prefix="/matches", tags=["matches"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    from config import settings
    if not settings.USE_MOCK_DATA:
        await init_db()
    else:
        print("Running in MOCK DATA mode - no database required!")
        print("Login with: founder@neplaunch.com / talent@neplaunch.com / investor@neplaunch.com")
        print("Password: password123")


@app.get("/")
async def root():
    return {"message": "NepLaunch API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
