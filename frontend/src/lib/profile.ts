/**
 * BreatheWise AI - User Profile & Storage Management Module
 * ========================================================
 * Provides centralized, type-safe persistence and retrieval for user health profiles,
 * active geographic coordinates, and personalized fitness goals.
 *
 * Implements the Single Source of Truth (SSOT) pattern to eliminate duplicate
 * localStorage access, JSON parsing overhead, and coordinate drift across pages.
 */

import { UserProfile } from './types';
import { DEFAULT_USER_PROFILE } from './api';

export const PROFILE_STORAGE_KEY = 'breathewise_profile';
export const ACTIVE_ROUTE_STORAGE_KEY = 'breathewise_active_route_location';
export const TARGET_GOAL_STORAGE_KEY = 'breathewise_target_goal_km';

/** Default coordinate anchor: Chennai, Tamil Nadu, India */
export const DEFAULT_ANCHOR_CITY = 'Chennai';
export const DEFAULT_ANCHOR_LAT = 13.0827;
export const DEFAULT_ANCHOR_LON = 80.2707;

export interface ActiveLocationContext {
  name: string;
  city: string;
  lat: number;
  lon: number;
}

/**
 * Validates and normalizes geographic coordinates for a given city name,
 * correcting legacy drift where Chennai or other cities may have had default Delhi coordinates.
 *
 * @param city City name string
 * @param lat Optional current latitude
 * @param lon Optional current longitude
 * @returns Corrected latitude and longitude pair
 */
export function normalizeCityCoordinates(
  city?: string,
  lat?: number,
  lon?: number
): { lat: number; lon: number } {
  const cityName = (city || '').trim().toLowerCase();

  // Guard against Chennai inadvertently inheriting northern India coordinates (> 20°N)
  if (cityName.includes('chennai') && (!lat || lat > 20)) {
    return { lat: DEFAULT_ANCHOR_LAT, lon: DEFAULT_ANCHOR_LON };
  }

  if (cityName.includes('delhi') && (!lat || lat < 25)) {
    return { lat: 28.6139, lon: 77.2090 };
  }

  if (cityName.includes('mumbai') && (!lat || lat < 18 || lat > 20)) {
    return { lat: 19.0760, lon: 72.8777 };
  }

  if (cityName.includes('bengaluru') && (!lat || lat < 11 || lat > 14)) {
    return { lat: 12.9716, lon: 77.5946 };
  }

  return {
    lat: lat && !isNaN(lat) ? lat : DEFAULT_ANCHOR_LAT,
    lon: lon && !isNaN(lon) ? lon : DEFAULT_ANCHOR_LON,
  };
}

/**
 * Retrieves the persisted UserProfile from browser storage.
 * Gracefully falls back to default profile during SSR or if storage is unpopulated.
 *
 * @returns Fully validated UserProfile object
 */
export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_USER_PROFILE;
  }

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;

    const parsed: Partial<UserProfile> = JSON.parse(raw);
    const coords = normalizeCityCoordinates(
      parsed.default_city,
      parsed.default_lat,
      parsed.default_lon
    );

    return {
      ...DEFAULT_USER_PROFILE,
      ...parsed,
      default_lat: coords.lat,
      default_lon: coords.lon,
      daily_activity_goal_minutes:
        parsed.daily_activity_goal_minutes && parsed.daily_activity_goal_minutes > 0
          ? parsed.daily_activity_goal_minutes
          : DEFAULT_USER_PROFILE.daily_activity_goal_minutes,
    };
  } catch (error) {
    return DEFAULT_USER_PROFILE;
  }
}

/**
 * Persists an updated UserProfile to browser storage with validation safeguards.
 *
 * @param updates Partial or complete UserProfile updates
 * @returns The consolidated and saved UserProfile
 */
export function saveStoredProfile(updates: Partial<UserProfile>): UserProfile {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_USER_PROFILE, ...updates };
  }

  try {
    const current = getStoredProfile();
    const consolidated: UserProfile = {
      ...current,
      ...updates,
    };

    // Sanitize non-positive activity goal
    if (!consolidated.daily_activity_goal_minutes || consolidated.daily_activity_goal_minutes <= 0) {
      consolidated.daily_activity_goal_minutes = 30;
    }

    const coords = normalizeCityCoordinates(
      consolidated.default_city,
      consolidated.default_lat,
      consolidated.default_lon
    );
    consolidated.default_lat = coords.lat;
    consolidated.default_lon = coords.lon;

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(consolidated));
    return consolidated;
  } catch (error) {
    return { ...DEFAULT_USER_PROFILE, ...updates };
  }
}

/**
 * Clears stored user profile and associated fitness caches.
 */
export function clearStoredProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ROUTE_STORAGE_KEY);
    localStorage.removeItem(TARGET_GOAL_STORAGE_KEY);
  } catch (error) {
    // Non-blocking cleanup
  }
}

/**
 * Resolves the currently active geographic location, checking route selections,
 * user profile city presets, and fallback anchors in priority order.
 *
 * @returns Active location context object
 */
export function getStoredActiveLocation(): ActiveLocationContext {
  if (typeof window === 'undefined') {
    return {
      name: DEFAULT_ANCHOR_CITY,
      city: DEFAULT_ANCHOR_CITY,
      lat: DEFAULT_ANCHOR_LAT,
      lon: DEFAULT_ANCHOR_LON,
    };
  }

  // 1. Check if user selected a specific route planner starting location
  try {
    const rawLoc = localStorage.getItem(ACTIVE_ROUTE_STORAGE_KEY);
    if (rawLoc) {
      const parsed = JSON.parse(rawLoc);
      if (parsed && parsed.coords && Array.isArray(parsed.coords)) {
        return {
          name: parsed.name || DEFAULT_ANCHOR_CITY,
          city: parsed.city || parsed.name?.split(':')[0] || DEFAULT_ANCHOR_CITY,
          lat: Number(parsed.coords[0]),
          lon: Number(parsed.coords[1]),
        };
      }
    }
  } catch (e) {
    // Fall through to profile check
  }

  // 2. Check user's saved profile city
  const profile = getStoredProfile();
  if (profile.default_city) {
    return {
      name: profile.default_city,
      city: profile.default_city,
      lat: profile.default_lat,
      lon: profile.default_lon,
    };
  }

  // 3. Fallback to default anchor
  return {
    name: DEFAULT_ANCHOR_CITY,
    city: DEFAULT_ANCHOR_CITY,
    lat: DEFAULT_ANCHOR_LAT,
    lon: DEFAULT_ANCHOR_LON,
  };
}

/**
 * Retrieves the user's custom daily jogging distance target (km).
 *
 * @param fallbackKm Default distance in km if not yet set
 * @returns User-defined jogging distance in kilometers
 */
export function getStoredGoalKm(fallbackKm: number = 5.0): number {
  if (typeof window === 'undefined') return fallbackKm;
  try {
    const raw = localStorage.getItem(TARGET_GOAL_STORAGE_KEY);
    if (raw) {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (e) {}
  return fallbackKm;
}

/**
 * Persists the user's custom daily jogging distance target (km).
 *
 * @param goalKm Desired workout distance in km
 */
export function saveStoredGoalKm(goalKm: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TARGET_GOAL_STORAGE_KEY, goalKm.toString());
  } catch (e) {}
}
