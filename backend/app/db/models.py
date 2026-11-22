import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(100), unique=True, index=True, nullable=False)
    age_group = Column(String(50), default="adult")  # child, young_adult, adult, senior
    has_asthma = Column(Boolean, default=False)
    respiratory_conditions = Column(JSON, default=list)  # e.g. ["allergies", "copd"]
    fitness_level = Column(String(50), default="intermediate")  # beginner, intermediate, advanced
    preferred_activities = Column(JSON, default=lambda: ["walking", "jogging"])
    daily_activity_goal_minutes = Column(Integer, default=30)
    preferred_duration_minutes = Column(Integer, default=30)
    default_city = Column(String(100), default="New Delhi")
    default_lat = Column(Float, default=28.6139)
    default_lon = Column(Float, default=77.2090)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(100), index=True, nullable=False)
    activity_type = Column(String(50), nullable=False)  # walking, jogging, cycling, indoor_workout
    duration_minutes = Column(Integer, nullable=False)
    distance_km = Column(Float, default=0.0)
    estimated_aqi = Column(Float, nullable=True)
    exposure_score = Column(Float, nullable=True)  # calculated intake proxy (ug)
    location_name = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)

class RouteBookmark(Base):
    __tablename__ = "route_bookmarks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(100), index=True, nullable=False)
    title = Column(String(150), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lon = Column(Float, nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lon = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=False)
    estimated_duration_min = Column(Float, nullable=False)
    exposure_tier = Column(String(50), default="Moderate")  # Low, Moderate, Elevated, High
    route_geojson = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
