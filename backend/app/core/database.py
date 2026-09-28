from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Handle Postgres dialect url compatibility if needed (e.g. postgres:// -> postgresql://)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Ensure driver compatibility for SQLAlchemy 2.x (prefer psycopg, fallback to psycopg2)
if db_url.startswith("postgresql://"):
    try:
        import psycopg
    except ImportError:
        try:
            import psycopg2
            db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        except ImportError:
            pass

# Connect args (SQLite needs check_same_thread=False; Postgres does not)
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that provides a database session for route handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
