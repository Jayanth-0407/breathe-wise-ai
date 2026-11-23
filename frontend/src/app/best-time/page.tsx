'use client';

import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { CITY_PRESETS } from '@/types/dashboard';
import { useBestTimeWindows } from '@/hooks/useBestTimeWindows';
import { ExerciseWindowCard } from '@/components/best-time/ExerciseWindowCard';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function BestTimePage() {
  const {
    selectedCity,
    setSelectedCity,
    sessionDuration,
    setSessionDuration,
    windows,
  } = useBestTimeWindows();

  return (
    <ErrorBoundary fallbackTitle="Forecast Load Error" fallbackMessage="Unable to load hourly exercise windows.">
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
          {windows.map((win, idx) => (
            <ExerciseWindowCard key={idx} win={win} isTop={idx === 0} />
          ))}
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
    </ErrorBoundary>
  );
}
