import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Turf Booking System API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "SUPER_SECRET_JWT_KEY_TURFHUB_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Support SQLite fallback or PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./turf_booking.db")

    class Config:
        case_sensitive = True

settings = Settings()
