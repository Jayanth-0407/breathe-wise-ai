'use client';

import React from 'react';
import { Target, MapPin, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  LocationPresetItem,
  P2PPresetItem,
  LOCATION_PRESETS,
  P2P_PRESETS,
} from '@/types/routes';

interface RouteControlsProps {
  routeMode: 'loop' | 'point_to_point';
  setRouteMode: (mode: 'loop' | 'point_to_point') => void;
  activeCity: string;
  setActiveCity: (city: string) => void;
  selectedLocation: LocationPresetItem;
  handleSelectLocation: (loc: LocationPresetItem) => void;
  searchLocationQuery: string;
  setSearchLocationQuery: (q: string) => void;
  isSearchingLocation: boolean;
  handleSearchLocation: (e: React.FormEvent) => void;
  targetGoalKm: number;
  goalInput: string;
  handleGoalChange: (val: string) => void;
  handleGoalBlur: () => void;
  handleGoalPreset: (km: number) => void;
  activityType: 'jogging' | 'walking';
  setActivityType: (act: 'jogging' | 'walking') => void;
  selectedP2P: P2PPresetItem;
  setSelectedP2P: (p2p: P2PPresetItem) => void;
}

export function RouteControls({
  routeMode,
  setRouteMode,
  activeCity,
  setActiveCity,
  selectedLocation,
  handleSelectLocation,
  searchLocationQuery,
  setSearchLocationQuery,
  isSearchingLocation,
  handleSearchLocation,
  targetGoalKm,
  goalInput,
  handleGoalChange,
  handleGoalBlur,
  handleGoalPreset,
  activityType,
  setActivityType,
  selectedP2P,
  setSelectedP2P,
}: RouteControlsProps) {
  return (
    <div className="space-y-4">
      {/* Header and Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold">
            <Target className="w-3.5 h-3.5 text-forest-600" />
            Fitness-Driven Geospatial Routing
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Pollution-Aware Route Planner
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Find the lowest-exposure jogging loop that fulfills your daily distance goal, avoiding heavy traffic corridors and maximizing tree canopies.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setRouteMode('loop')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              routeMode === 'loop'
                ? 'bg-forest-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Daily Goal Loop
          </button>
          <button
            onClick={() => setRouteMode('point_to_point')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              routeMode === 'point_to_point'
                ? 'bg-forest-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Point-to-Point
          </button>
        </div>
      </div>

      {/* Control Panel Card */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4 sm:p-5">
          {routeMode === 'loop' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Starting Spot & City Selection (5 cols) */}
              <div className="md:col-span-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-forest-600" />
                    Starting Spot
                  </label>
                  <div className="flex items-center gap-1">
                    {['Chennai', 'Delhi NCR', 'Mumbai', 'Bengaluru'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setActiveCity(c);
                          const firstInCity = LOCATION_PRESETS.find((p) => p.city.toLowerCase() === c.toLowerCase());
                          if (firstInCity) {
                            handleSelectLocation(firstInCity);
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          activeCity.toLowerCase() === c.toLowerCase()
                            ? 'bg-forest-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {c.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {LOCATION_PRESETS.filter(
                    (loc) => loc.city.toLowerCase() === activeCity.toLowerCase()
                  ).map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedLocation.name === loc.name
                          ? 'bg-forest-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSearchLocation} className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder={`Search starting spot in ${activeCity}...`}
                    value={searchLocationQuery}
                    onChange={(e) => setSearchLocationQuery(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-forest-500"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={isSearchingLocation}
                    className="text-xs px-2.5 py-1.5 h-auto gap-1"
                  >
                    <Search className="w-3 h-3" />
                    {isSearchingLocation ? '...' : 'Find'}
                  </Button>
                </form>
              </div>

              {/* Daily Goal Distance Typed Input (4 cols) */}
              <div className="md:col-span-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-forest-600" />
                    Target Daily Distance
                  </label>
                  <span className="text-xs font-extrabold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200">
                    {targetGoalKm} km goal
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="30.0"
                      value={goalInput}
                      onChange={(e) => handleGoalChange(e.target.value)}
                      onBlur={handleGoalBlur}
                      placeholder="e.g. 5.0"
                      className="w-full px-3 py-1.5 pr-8 text-xs font-bold border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-forest-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      km
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[3.0, 5.0, 7.5, 10.0].map((km) => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => handleGoalPreset(km)}
                        className={`px-2 py-1.5 rounded-md text-xs font-bold transition border ${
                          targetGoalKm === km
                            ? 'bg-forest-600 text-white border-forest-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {km}k
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Type any distance above. Routes are street-snapped to match this goal.
                </p>
              </div>

              {/* Activity Pace Switcher (3 cols) */}
              <div className="md:col-span-3 space-y-2.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Activity Pace
                </label>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {(['jogging', 'walking'] as const).map((act) => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => setActivityType(act)}
                      className={`flex-1 py-1 text-xs font-bold capitalize rounded-md transition ${
                        activityType === act
                          ? 'bg-white text-forest-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Point-to-Point selection */
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Popular Urban Corridors
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {P2P_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setSelectedP2P(p)}
                    className={`p-3 text-left rounded-xl border text-xs font-semibold transition ${
                      selectedP2P.name === p.name
                        ? 'bg-forest-50 border-forest-500 text-forest-900 ring-2 ring-forest-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold truncate">{p.name.split(':')[0]}</div>
                    <div className="text-[11px] text-slate-500 truncate">{p.name.split(':')[1]}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
