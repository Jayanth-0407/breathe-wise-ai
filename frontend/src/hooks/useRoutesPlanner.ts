'use client';

import { useState, useEffect } from 'react';
import { RouteAlternative, UserProfile } from '@/lib/types';
import { DEFAULT_USER_PROFILE } from '@/lib/api';
import { resolveLocationCoordinates } from '@/lib/cities';
import { getStoredProfile, getStoredGoalKm, saveStoredGoalKm } from '@/lib/profile';
import {
  LocationPresetItem,
  P2PPresetItem,
  LOCATION_PRESETS,
  P2P_PRESETS,
  generateFallbackLoops,
} from '@/types/routes';

export function useRoutesPlanner() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [activeCity, setActiveCity] = useState<string>('Chennai');
  const [routeMode, setRouteMode] = useState<'loop' | 'point_to_point'>('loop');

  // Jogging Loop State
  const [targetGoalKm, setTargetGoalKm] = useState<number>(5.0);
  const [goalInput, setGoalInput] = useState<string>('5.0');
  const [selectedLocation, setSelectedLocation] = useState<LocationPresetItem>(LOCATION_PRESETS[0]);
  const [searchLocationQuery, setSearchLocationQuery] = useState<string>('');
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);

  // Point to Point State
  const [selectedP2P, setSelectedP2P] = useState<P2PPresetItem>(P2P_PRESETS[0]);

  const [activityType, setActivityType] = useState<'jogging' | 'walking'>('jogging');
  const [routes, setRoutes] = useState<RouteAlternative[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('loop-1');
  const [loading, setLoading] = useState<boolean>(true);
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  useEffect(() => {
    const savedGoal = getStoredGoalKm(5.0);
    setTargetGoalKm(savedGoal);
    setGoalInput(savedGoal.toString());

    const storedProfile = getStoredProfile();
    setProfile(storedProfile);
    const currentCity = storedProfile.default_city || 'Chennai';
    setActiveCity(currentCity);

    const savedLoc = localStorage.getItem('breathewise_active_route_location');
    if (savedLoc) {
      try {
        const parsedLoc = JSON.parse(savedLoc);
        if (parsedLoc && parsedLoc.coords) {
          setSelectedLocation(parsedLoc);
          return;
        }
      } catch (e) {
        // Fall through
      }
    }

    const matched = LOCATION_PRESETS.find(
      (p) => p.city.toLowerCase() === currentCity.toLowerCase()
    );
    if (matched) {
      setSelectedLocation(matched);
    }
  }, []);

  const fetchJoggingLoops = async (origin: [number, number], goalKm: number) => {
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/routes/jogging-loop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_lat: origin[0],
          origin_lon: origin[1],
          target_distance_km: goalKm,
          activity_type: activityType,
          has_asthma: profile.has_asthma,
          age_group: profile.age_group,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const loops = data.loops && data.loops.length > 0 ? data.loops : generateFallbackLoops(origin, goalKm);
        setRoutes(loops);
        if (loops.length > 0) {
          setSelectedRouteId(loops[0].id);
        }
      } else {
        const fallback = generateFallbackLoops(origin, goalKm);
        setRoutes(fallback);
        setSelectedRouteId(fallback[0].id);
      }
    } catch (e) {
      const fallback = generateFallbackLoops(origin, goalKm);
      setRoutes(fallback);
      setSelectedRouteId(fallback[0].id);
    } finally {
      setLoading(false);
    }
  };

  const fetchP2PRoutes = async (origin: [number, number], dest: [number, number]) => {
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/routes/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_lat: origin[0],
          origin_lon: origin[1],
          destination_lat: dest[0],
          destination_lon: dest[1],
          activity_type: activityType,
          has_asthma: profile.has_asthma,
          age_group: profile.age_group,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rList = data.routes || [];
        setRoutes(rList);
        if (rList.length > 0) {
          setSelectedRouteId(rList[0].id);
        }
      }
    } catch (e) {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeMode === 'loop') {
      fetchJoggingLoops(selectedLocation.coords, targetGoalKm);
    } else {
      fetchP2PRoutes(selectedP2P.origin, selectedP2P.dest);
    }
  }, [routeMode, selectedLocation, targetGoalKm, selectedP2P, activityType]);

  const handleSelectLocation = (loc: LocationPresetItem) => {
    setSelectedLocation(loc);
    localStorage.setItem('breathewise_active_route_location', JSON.stringify(loc));
  };

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchLocationQuery.trim();
    if (!query) return;
    setIsSearchingLocation(true);
    try {
      const cleanQ = query.toLowerCase();
      const matchedPreset = LOCATION_PRESETS.find(
        (p) =>
          p.city.toLowerCase() === activeCity.toLowerCase() &&
          (p.name.toLowerCase().includes(cleanQ) || cleanQ.includes(p.name.toLowerCase().split(' ')[0]))
      );
      if (matchedPreset) {
        handleSelectLocation(matchedPreset);
        setSearchLocationQuery('');
        return;
      }

      const resolved = await resolveLocationCoordinates(query, activeCity);
      if (resolved) {
        const customLoc: LocationPresetItem = {
          name: resolved.name,
          city: activeCity,
          coords: [resolved.lat, resolved.lon],
        };
        handleSelectLocation(customLoc);
        setSearchLocationQuery('');
      } else {
        alert(`Could not find coordinates for "${query}". Try a nearby street or landmark.`);
      }
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleGoalChange = (value: string) => {
    setGoalInput(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0.5 && num <= 30.0) {
      setTargetGoalKm(num);
      saveStoredGoalKm(num);
    }
  };

  const handleGoalBlur = () => {
    const num = parseFloat(goalInput);
    if (isNaN(num) || num < 0.5) {
      setGoalInput('5.0');
      setTargetGoalKm(5.0);
      saveStoredGoalKm(5.0);
    }
  };

  const handleGoalPreset = (km: number) => {
    setGoalInput(km.toString());
    setTargetGoalKm(km);
    saveStoredGoalKm(km);
  };

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const mapOrigin = routeMode === 'loop' ? selectedLocation.coords : selectedP2P.origin;
  const mapDest = routeMode === 'loop' ? selectedLocation.coords : selectedP2P.dest;

  return {
    profile,
    activeCity,
    setActiveCity,
    routeMode,
    setRouteMode,
    targetGoalKm,
    goalInput,
    handleGoalChange,
    handleGoalBlur,
    handleGoalPreset,
    selectedLocation,
    handleSelectLocation,
    searchLocationQuery,
    setSearchLocationQuery,
    isSearchingLocation,
    handleSearchLocation,
    selectedP2P,
    setSelectedP2P,
    activityType,
    setActivityType,
    routes,
    selectedRoute,
    selectedRouteId,
    setSelectedRouteId,
    loading,
    bookmarked,
    setBookmarked,
    mapOrigin,
    mapDest,
  };
}
