'use client';

import { useState, useEffect } from 'react';
import { ExerciseWindow, UserProfile } from '@/lib/types';
import { DEFAULT_USER_PROFILE } from '@/lib/api';
import { getStoredProfile } from '@/lib/profile';
import { CityPreset, CITY_PRESETS } from '@/types/dashboard';

export function useBestTimeWindows() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [selectedCity, setSelectedCity] = useState<CityPreset>(CITY_PRESETS[0]);
  const [sessionDuration, setSessionDuration] = useState<number>(45);
  const [windows, setWindows] = useState<ExerciseWindow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const stored = getStoredProfile();
    setProfile(stored);
    if (stored.preferred_duration_minutes) {
      setSessionDuration(stored.preferred_duration_minutes);
    }
    if (stored.default_city && stored.default_lat && stored.default_lon) {
      setSelectedCity({
        name: stored.default_city,
        lat: stored.default_lat,
        lon: stored.default_lon,
      });
    }
  }, []);

  const fetchWindows = async (lat: number, lon: number, dur: number) => {
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(
        `${apiBase}/api/v1/exercise-windows?lat=${lat}&lon=${lon}&duration=${dur}&has_asthma=${profile.has_asthma}&age_group=${profile.age_group}`
      );
      if (res.ok) {
        const data = await res.json();
        setWindows(data.windows || []);
      }
    } catch (e) {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWindows(selectedCity.lat, selectedCity.lon, sessionDuration);
  }, [selectedCity, sessionDuration]);

  return {
    selectedCity,
    setSelectedCity,
    sessionDuration,
    setSessionDuration,
    windows,
    loading,
  };
}
