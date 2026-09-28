import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.routers import recipes_router, users_router, inventory_router, auth_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("recipe_generator")

# Ensure tables exist immediately on import/startup
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.warning(f"Initial table check notice: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup check & seed demo user if none exists
    try:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            if not db.query(User).first():
                demo_user = User(
                    name="Sujal Fitness",
                    email="sujal@example.com",
                    target_calories=2400,
                    target_protein_g=180.0,
                    target_carbs_g=220.0,
                    target_fat_g=65.0,
                    dietary_preference="High Protein North Indian (Gym Staple)"
                )
                db.add(demo_user)
                db.commit()
                logger.info("Seeded default demo user.")
    except Exception as e:
        logger.error(f"Error during startup initialization: {e}")
    yield

    # Shutdown logic if needed
    logger.info("Application shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-Protein North Indian Recipe & Macronutrient Generator API with Groq LLM & Neon Postgres",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else settings.cors_origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(recipes_router)
app.include_router(users_router)
app.include_router(inventory_router)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "environment": settings.ENVIRONMENT
    }

@app.get("/health", tags=["Health"])
def health_check():
    db_connected = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_connected = True
    except Exception as e:
        logger.error(f"DB Health check failed: {e}")

    groq_configured = bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY != "gsk_your_groq_api_key_here")

    return {
        "status": "ok" if db_connected else "degraded",
        "database_connected": db_connected,
        "database_dialect": engine.dialect.name,
        "groq_configured": groq_configured,
        "groq_model": settings.GROQ_MODEL
    }

@app.get("/api/system/stats", tags=["System"])
def system_stats():
    import time
    start = time.time()
    db_ok = False
    recipe_count = 0
    inventory_count = 0
    user_count = 0
    latency_ms = 0.0

    try:
        with SessionLocal() as db:
            ping_start = time.time()
            db.execute(text("SELECT 1"))
            latency_ms = round((time.time() - ping_start) * 1000, 1)
            
            from app.models.recipe import Recipe
            from app.models.inventory import InventoryItem
            recipe_count = db.query(Recipe).count()
            inventory_count = db.query(InventoryItem).count()
            user_count = db.query(User).count()
            db_ok = True
    except Exception as e:
        logger.error(f"Error reading system stats: {e}")

    return {
        "database": {
            "status": "connected" if db_ok else "disconnected",
            "dialect": engine.dialect.name,
            "host": getattr(engine.url, "host", "unknown"),
            "latency_ms": latency_ms,
            "counts": {
                "recipes": recipe_count,
                "inventory": inventory_count,
                "users": user_count
            }
        },
        "llm": {
            "provider": "Groq Cloud",
            "model": settings.GROQ_MODEL,
            "configured": bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY != "gsk_your_groq_api_key_here")
        }
    }

