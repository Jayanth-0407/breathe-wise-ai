-- ==============================================================================
-- BreatheWise AI — Database Migration 001: Initial Schema
-- PostgreSQL with PostGIS Extensions (Render PostgreSQL Compatible)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- PostGIS extension for geospatial routing and proximity analysis
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    age_group VARCHAR(50) DEFAULT 'adult',
    has_asthma BOOLEAN DEFAULT FALSE,
    respiratory_conditions JSONB DEFAULT '[]'::jsonb,
    fitness_level VARCHAR(50) DEFAULT 'intermediate',
    preferred_activities JSONB DEFAULT '["walking", "jogging"]'::jsonb,
    daily_activity_goal_minutes INT DEFAULT 30,
    preferred_duration_minutes INT DEFAULT 30,
    default_city VARCHAR(100) DEFAULT 'Delhi NCR',
    default_lat DOUBLE PRECISION DEFAULT 28.6139,
    default_lon DOUBLE PRECISION DEFAULT 77.2090,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 2. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(100) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    duration_minutes INT NOT NULL,
    distance_km DOUBLE PRECISION DEFAULT 0.0,
    estimated_aqi DOUBLE PRECISION,
    exposure_score DOUBLE PRECISION,
    location_name VARCHAR(200),
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_logged_at ON activity_logs(logged_at DESC);

-- 3. Route Bookmarks
CREATE TABLE IF NOT EXISTS route_bookmarks (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    origin_lat DOUBLE PRECISION NOT NULL,
    origin_lon DOUBLE PRECISION NOT NULL,
    destination_lat DOUBLE PRECISION NOT NULL,
    destination_lon DOUBLE PRECISION NOT NULL,
    distance_km DOUBLE PRECISION NOT NULL,
    estimated_duration_min DOUBLE PRECISION NOT NULL,
    exposure_tier VARCHAR(50) DEFAULT 'Moderate',
    route_geojson JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_route_bookmarks_user_id ON route_bookmarks(user_id);

-- 4. Environmental Cache (Fast In-Memory / Relational fallback)
CREATE TABLE IF NOT EXISTS environmental_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    payload JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON environmental_cache(expires_at);
