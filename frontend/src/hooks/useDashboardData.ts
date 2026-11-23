'use client';

import { useState, useEffect } from 'react';
import { LiveAirQuality, HourlyForecast, UserProfile } from '@/lib/types';
import { fetchLiveAirQuality, fetchAirQualityForecast, DEFAULT_USER_PROFILE } from '@/lib/api';
import { resolveCityCoordinates } from '@/lib/cities';
import { getStoredProfile } from '@/lib/profile';
import { CityPreset, CITY_PRESETS } from '@/types/dashboard';

export function useDashboardData() {
  const [selectedCity, setSelectedCity] = useState<CityPreset>(CITY_PRESETS[0]);
  const [cityInput, setCityInput] = useState('');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [liveData, setLiveData] = useState<LiveAirQuality | null>(null);
  const [forecast, setForecast] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    const stored = getStoredProfile();
    setProfile(stored);
    if (stored.default_city && stored.default_lat && stored.default_lon) {
      setSelectedCity({
        name: stored.default_city,
        lat: stored.default_lat,
        lon: stored.default_lon,
      });
    }
  }, []);

  const loadData = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const [live, fc] = await Promise.all([
        fetchLiveAirQuality(lat, lon),
        fetchAirQualityForecast(lat, lon),
      ]);
      setLiveData(live);
      setForecast(fc);
    } catch (e) {
      // Graceful fallback handled in api.ts
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedCity.lat, selectedCity.lon);
  }, [selectedCity]);

  const handleCityChange = (city: CityPreset) => {
    setSelectedCity(city);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(selectedCity.lat, selectedCity.lon);
  };

  const handleSearchCity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cityInput.trim()) return;
    setSearching(true);
    try {
      const resolved = await resolveCityCoordinates(cityInput);
      if (resolved) {
        setSelectedCity({
          name: resolved.name,
          lat: resolved.lat,
          lon: resolved.lon,
        });
        setCityInput('');
      } else {
        alert(`Could not find coordinates for "${cityInput}". Please check spelling.`);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleUseGPS = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const custom: CityPreset = {
            name: 'Device GPS Location',
            lat: parseFloat(pos.coords.latitude.toFixed(4)),
            lon: parseFloat(pos.coords.longitude.toFixed(4)),
          };
          setSelectedCity(custom);
        },
        () => alert('Unable to retrieve device GPS coordinates.')
      );
    }
  };

  return {
    selectedCity,
    setSelectedCity,
    cityInput,
    setCityInput,
    profile,
    liveData,
    forecast,
    loading,
    refreshing,
    searching,
    handleCityChange,
    handleRefresh,
    handleSearchCity,
    handleUseGPS,
  };
}
