from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, JSON
import datetime
from app.database.session import Base

class Turf(Base):
    __tablename__ = "turfs"

    id = Column(String, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    location = Column(String, nullable=False)
    city = Column(String, nullable=False, index=True)
    area = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    price_per_hour = Column(Float, nullable=False)
    weekend_price_per_hour = Column(Float, nullable=True)
    sport_types = Column(JSON, nullable=False) # e.g. ["Box Cricket", "Football"]
    images = Column(JSON, nullable=False)
    rating = Column(Float, default=5.0)
    reviews_count = Column(Integer, default=0)
    amenities = Column(JSON, nullable=True)
    status = Column(String, default="active")
    is_featured = Column(Boolean, default=False)
    opening_time = Column(String, default="06:00")
    closing_time = Column(String, default="23:00")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
