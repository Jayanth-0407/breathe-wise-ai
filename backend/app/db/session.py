import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("breathewise.db")

db_url = settings.active_database_url

engine_kwargs = {
    "pool_pre_ping": True,
}

if db_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Render PostgreSQL external / remote connection configuration
    # 1. Require SSL if not specified
    connect_args = {"connect_timeout": 5}
    if "sslmode" not in db_url:
        connect_args["sslmode"] = "require"
    engine_kwargs["connect_args"] = connect_args
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10
    engine_kwargs["pool_recycle"] = 300

try:
    engine = create_engine(db_url, **engine_kwargs)
except Exception as e:
    logger.warning(f"Could not connect to {db_url}, falling back to local SQLite: {e}")
    db_url = "sqlite:///./breathewise.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_tables_created = False

def init_db():
    global _tables_created, engine, SessionLocal
    if _tables_created:
        return
    try:
        from app.db import models  # ensure models are loaded
        Base.metadata.create_all(bind=engine)
        _tables_created = True
        logger.info("Database schemas verified.")
    except Exception as e:
        logger.warning(f"Remote database initialization timed out or failed: {e}. Falling back to local SQLite.")
        fallback_url = "sqlite:///./breathewise.db"
        engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base.metadata.create_all(bind=engine)
        _tables_created = True
        logger.info("Local SQLite database initialized as resilient fallback.")

def get_db():
    if not _tables_created:
        init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
