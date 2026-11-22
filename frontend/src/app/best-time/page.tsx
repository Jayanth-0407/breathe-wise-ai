'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Wind, 
  Thermometer, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Sun,
  Moon,
  Info,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ExerciseWindow, UserProfile } from '@/lib/types';
import { DEFAULT_USER_PROFILE } from '@/lib/api';

const CITY_PRESETS = [
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Delhi NCR', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
];

export default function BestTimePage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [selectedCity, setSelectedCity] = useState(CITY_PRESETS[0]);
  const [sessionDuration, setSessionDuration] = useState<number>(45);
  const [windows, setWindows] = useState<ExerciseWindow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem('breathewise_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        if (parsed.preferred_duration_minutes) {
          setSessionDuration(parsed.preferred_duration_minutes);
        }
        if (parsed.default_city) {
          let lat = parsed.default_lat;
          let lon = parsed.default_lon;
          if (parsed.default_city.toLowerCase().includes('chennai') && (lat > 20 || !lat)) {
            lat = 13.0827;
            lon = 80.2707;
          }
          if (lat && lon) {
            setSelectedCity({ name: parsed.default_city, lat, lon });
          }
        }
      } catch (e) {}
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
      console.error('Failed to fetch exercise windows:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWindows(selectedCity.lat, selectedCity.lon, sessionDuration);
  }, [selectedCity, sessionDuration]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          Predictive Atmospheric Dispersion Timing
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Best Time to Exercise Outdoors
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Identify optimal outdoor activity windows over the next 24 hours based on planetary boundary layer mixing, wind dispersion, and diurnal particulate inversions.
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* City selector */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Target Location
          </span>
          <div className="flex flex-wrap gap-2">
            {CITY_PRESETS.map((city) => (
              <button
                key={city.name}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCity.name === city.name
                    ? 'bg-forest-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Duration selector */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Planned Workout Duration
          </span>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => setSessionDuration(mins)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                  sessionDuration === mins
                    ? 'bg-white text-forest-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Windows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {windows.map((win, idx) => {
          const isTop = idx === 0;
          return (
            <Card
              key={idx}
              className={`relative overflow-hidden transition-all ${
                isTop
                  ? 'border-forest-600 ring-2 ring-forest-500/20 shadow-md'
                  : 'border-slate-200'
              }`}
            >
              {isTop && (
                <div className="bg-forest-600 text-white text-[11px] font-bold px-3 py-1 text-center tracking-wider uppercase">
                  ⭐ Top Recommended Window
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-forest-700" />
                    <span className="text-xl font-black text-slate-900 tracking-tight">
                      {win.window_start} – {win.window_end}
                    </span>
                  </div>
                  <Badge
                    variant={
                      win.suitability === 'Optimal'
                        ? 'success'
                        : win.suitability === 'Acceptable'
                        ? 'default'
                        : 'warning'
                    }
                  >
                    {win.suitability}
                  </Badge>
                </div>
                <CardDescription className="flex items-center justify-between pt-1">
                  <span>Score: <strong className="text-forest-700">{win.recommendation_score}/100</strong></span>
                  <span>Avg AQI: <strong className="text-slate-800">{win.avg_aqi} ({win.category})</strong></span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-800 block flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Atmospheric Meteorology
                  </span>
                  <p>{win.weather_summary}</p>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {win.reason}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href="/routes"
                    className="font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1"
                  >
                    Plan Route for this Time <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Atmospheric Science Explanation Banner */}
      <Card className="bg-gradient-to-r from-slate-50 to-forest-50/30 border-forest-200">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-forest-100 border border-forest-300 flex items-center justify-center text-forest-800 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Why Does Air Quality Vary By Time of Day?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                During the day, solar heating warms the ground, creating convective updrafts that expand the <strong>planetary boundary layer</strong> (up to 1,500–2,000 meters). This dilutes particulate matter into a much larger volume of air, often making early afternoon (1:00 PM – 4:30 PM) cleaner than early mornings.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Conversely, overnight radiational cooling causes a <strong>thermal inversion</strong>—a layer of warm air trapping cold, dense air near the surface. Combined with early morning rush hour, this prevents smoke and vehicle exhaust from dispersing, making early morning runs (6:00 AM – 8:30 AM) significantly higher in particulate exposure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
