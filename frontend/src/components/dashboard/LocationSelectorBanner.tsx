'use client';

import React from 'react';
import { MapPin, Search, Navigation, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CityPreset, CITY_PRESETS } from '@/types/dashboard';

interface LocationSelectorBannerProps {
  selectedCity: CityPreset;
  handleCityChange: (city: CityPreset) => void;
  cityInput: string;
  setCityInput: (val: string) => void;
  searching: boolean;
  handleSearchCity: (e: React.FormEvent) => void;
  handleUseGPS: () => void;
  refreshing: boolean;
  handleRefresh: () => void;
}

export function LocationSelectorBanner({
  selectedCity,
  handleCityChange,
  cityInput,
  setCityInput,
  searching,
  handleSearchCity,
  handleUseGPS,
  refreshing,
  handleRefresh,
}: LocationSelectorBannerProps) {
  return (
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCity.name === city.name
                ? 'bg-forest-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {city.name}
          </button>
        ))}
        <button
          onClick={handleUseGPS}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition"
          title="Use exact GPS Coordinates"
        >
          <Navigation className="w-3 h-3 text-forest-600" />
          GPS
        </button>
      </div>

      <div className="flex items-center gap-2 w-full lg:w-auto">
        <form onSubmit={handleSearchCity} className="flex gap-1.5 flex-1 lg:w-64">
          <input
            type="text"
            placeholder="Search any global city..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-forest-500"
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={searching}
            className="text-xs px-2.5 py-1.5 h-auto"
          >
            <Search className="w-3.5 h-3.5" />
          </Button>
        </form>

        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
