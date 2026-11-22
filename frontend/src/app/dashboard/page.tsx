'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Wind,
  MapPin,
  Thermometer,
  Droplets,
  Navigation,
  ShieldAlert,
  Clock,
  Sparkles,
  RefreshCw,
  Info,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Home,
  Search
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatAQICategory } from '@/lib/utils';
import { LiveAirQuality, HourlyForecast, UserProfile } from '@/lib/types';
import { fetchLiveAirQuality, fetchAirQualityForecast, DEFAULT_USER_PROFILE } from '@/lib/api';
import { resolveCityCoordinates } from '@/lib/cities';
import { getStoredProfile } from '@/lib/profile';

// Dynamically import StationMap with SSR disabled (MapLibre requires window/WebGL)
const StationMap = dynamic(() => import('@/components/map/StationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
      Loading Atmospheric Map...
    </div>
  ),
});

const CITY_PRESETS = [
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Delhi NCR', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
];

export default function DashboardPage() {
  const [selectedCity, setSelectedCity] = useState(CITY_PRESETS[0]);
  const [cityInput, setCityInput] = useState('');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [liveData, setLiveData] = useState<LiveAirQuality | null>(null);
  const [forecast, setForecast] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    // Load consolidated profile from Single Source of Truth
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
      console.error('Failed to fetch dashboard data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedCity.lat, selectedCity.lon);
  }, [selectedCity]);

  const handleCityChange = (city: typeof CITY_PRESETS[0]) => {
    setSelectedCity(city);
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
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const custom = {
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

  const aqiInfo = formatAQICategory(liveData?.aqi || 60);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Banner: Location Selector & Status */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mr-2">
            <MapPin className="w-4 h-4 text-forest-600" />
            Location:
          </div>
          {CITY_PRESETS.map((city) => (
            <button
              key={city.name}
              onClick={() => handleCityChange(city)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedCity.name === city.name
                ? 'bg-forest-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {city.name}
            </button>
          ))}
          <button
            onClick={handleUseGPS}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition inline-flex items-center gap-1"
          >
            <Navigation className="w-3 h-3 text-emerald-600" /> GPS
          </button>
        </div>

        {/* City Search Bar & Status */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <form onSubmit={handleSearchCity} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Search city ..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-forest-500 w-44 sm:w-52"
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={searching}
              className="text-xs px-2.5 py-1.5 h-auto gap-1"
            >
              <Search className="w-3 h-3" />
              {searching ? '...' : 'Go'}
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              {selectedCity.lat.toFixed(2)}°, {selectedCity.lon.toFixed(2)}°
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRefreshing(true);
                loadData(selectedCity.lat, selectedCity.lon);
              }}
              disabled={refreshing}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Primary Air Quality Readout */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-l-4 overflow-hidden relative" style={{ borderLeftColor: aqiInfo.borderColor }}>
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Current Atmospheric Condition
                  </span>
                  <CardTitle className="text-2xl text-slate-900">
                    {selectedCity.name}
                  </CardTitle>
                </div>
                <Badge
                  className={`text-xs px-3 py-1 font-bold ${aqiInfo.badgeBg}`}
                >
                  {liveData?.category || aqiInfo.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-baseline gap-4">
                  <span className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tight">
                    {liveData ? liveData.aqi : '--'}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Standard AQI
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      Dominant: {liveData?.dominant_pollutant || 'PM2.5'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 max-w-sm space-y-1">
                  <strong className="text-slate-900 block font-semibold">Standard Benchmark</strong>
                  <p className="leading-relaxed">{aqiInfo.description}</p>
                </div>
              </div>

              {/* Weather & Pollutant Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium block">PM2.5 Concentration</span>
                  <span className="text-lg font-bold text-slate-900">
                    {liveData?.pm25 ?? '--'} <span className="text-xs font-normal text-slate-500">µg/m³</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium block">PM10 Coarse</span>
                  <span className="text-lg font-bold text-slate-900">
                    {liveData?.pm10 ?? '--'} <span className="text-xs font-normal text-slate-500">µg/m³</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium block flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temperature
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {liveData?.temperature ?? '--'} <span className="text-xs font-normal text-slate-500">°C</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium block flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-blue-500" /> Wind Dispersion
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {liveData?.wind_speed ?? '--'} <span className="text-xs font-normal text-slate-500">km/h</span>
                  </span>
                </div>
              </div>

              {/* Data Source & Provenance */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Source:</span>
                  <span>{liveData?.source || 'Open-Meteo & OpenAQ'}</span>
                  {liveData?.is_estimated ? (
                    <Badge variant="outline" className="text-[10px] py-0 text-slate-500">
                      Model Estimate
                    </Badge>
                  ) : (
                    <Badge variant="success" className="text-[10px] py-0">
                      Verified Station
                    </Badge>
                  )}
                </div>
                <div>
                  Last Updated: <span className="font-medium text-slate-700">{liveData?.last_updated || 'Recent'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Atmospheric Station Map */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Live Atmospheric Station Map
                </CardTitle>
                <CardDescription>
                  Geographic monitoring station & ambient conditions for <strong className="text-slate-800">{selectedCity.name}</strong>.
                </CardDescription>
              </div>
              <a href="/routes">
                <Button variant="outline" size="sm" className="text-xs gap-1.5 shadow-xs">
                  Plan Routes <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </a>
            </CardHeader>
            <CardContent className="p-3">
              <StationMap
                lat={selectedCity.lat}
                lon={selectedCity.lon}
                cityName={selectedCity.name}
                aqi={liveData?.aqi || 50}
                category={liveData?.category || aqiInfo.label}
                dominantPollutant={liveData?.dominant_pollutant || 'PM2.5'}
              />
            </CardContent>
          </Card>

          {/* 24-Hour Diurnal Forecast Trend */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-forest-600" />
                    24-Hour Diurnal AQI Forecast
                  </CardTitle>
                  <CardDescription>
                    Hourly particulate trends driven by planetary boundary layer mixing and traffic patterns.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2.5 min-w-[700px]">
                  {forecast.slice(0, 14).map((item, idx) => {
                    const itemAqi = formatAQICategory(item.aqi);
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex flex-col items-center text-center space-y-1.5"
                      >
                        <span className="text-[11px] font-semibold text-slate-500">
                          {item.time.includes('T') ? item.time.split('T')[1].slice(0, 5) : item.time}
                        </span>
                        <span className={`text-base font-extrabold ${itemAqi.badgeText}`}>
                          {item.aqi}
                        </span>
                        <div
                          className="w-full h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              item.aqi <= 50 ? '#10b981' : item.aqi <= 100 ? '#f59e0b' : item.aqi <= 150 ? '#f97316' : '#ef4444',
                          }}
                        />
                        <span className="text-[10px] text-slate-500">{item.temperature}°C</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Col 3: Personalized Guidance & Action Shortcuts */}
        <div className="space-y-6">
          {/* Personalized Health Guidance */}
          <Card className="bg-gradient-to-b from-white to-forest-50/20 border-forest-200">
            <CardHeader className="pb-3 border-b border-forest-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-forest-600" />
                <CardTitle className="text-base text-slate-900">Personalized Health Guidance</CardTitle>
              </div>
              <CardDescription>
                Tailored for: <span className="font-semibold text-forest-800 capitalize">{profile.fitness_level}</span> •{' '}
                <span className="font-semibold text-forest-800 capitalize">{profile.age_group}</span>
                {profile.has_asthma && ' • Asthma'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {liveData?.personalized_guidance}
              </p>

              {liveData?.health_alerts && liveData.health_alerts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Active Advisory
                  </div>
                  {liveData.health_alerts.map((alert, i) => (
                    <p key={i} className="text-xs text-amber-700 leading-tight">
                      • {alert}
                    </p>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <a href="/onboarding" className="text-xs font-semibold text-forest-700 hover:text-forest-800 flex items-center gap-1">
                  Update Vulnerability Profile <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Quick Action Navigation Shortcuts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pollution-Aware Mobility Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <a
                href="/routes"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-forest-300 hover:bg-forest-50/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-forest-700 block">
                      Find Cleaner Routes
                    </span>
                    <span className="text-[11px] text-slate-500">Compare 3 OSRM exposure paths</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-forest-600" />
              </a>

              <a
                href="/best-time"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-forest-300 hover:bg-forest-50/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-forest-700 block">
                      Best Time to Exercise
                    </span>
                    <span className="text-[11px] text-slate-500">Optimal 24h outdoor windows</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-forest-600" />
              </a>

              <a
                href="/indoor"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-forest-300 hover:bg-forest-50/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-forest-700 block">
                      Indoor Exercise Alternatives
                    </span>
                    <span className="text-[11px] text-slate-500">HEPA tips & bodyweight routines</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-forest-600" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
