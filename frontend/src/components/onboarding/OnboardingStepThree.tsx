'use client';

import React from 'react';
import { MapPin, ShieldCheck } from 'lucide-react';
import { CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserProfile } from '@/lib/types';
import { POPULAR_CITIES, resolveCityCoordinates } from '@/lib/cities';

interface OnboardingStepThreeProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  onDetectLocation: () => void;
}

export function OnboardingStepThree({
  profile,
  setProfile,
  onDetectLocation,
}: OnboardingStepThreeProps) {
  return (
    <CardContent className="space-y-6 pt-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <MapPin className="w-5 h-5 text-forest-600" />
        <h3 className="text-lg font-bold text-slate-900">Location Settings</h3>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-forest-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-1">Privacy Guarantee</strong>
            Location coordinates are strictly used to fetch local station air quality from OpenAQ and Open-Meteo, and to calculate routes. Your live background location is never tracked continuously without active consent.
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onDetectLocation}
          className="w-full gap-2 text-xs"
        >
          <MapPin className="w-4 h-4 text-forest-600" />
          Detect Current Device Coordinates
        </Button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          Or Select a Major City Anchor
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {POPULAR_CITIES.slice(0, 6).map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() =>
                setProfile({
                  ...profile,
                  default_city: city.name,
                  default_lat: city.lat,
                  default_lon: city.lon,
                })
              }
              className={`p-3 rounded-lg border text-left transition ${
                profile.default_city === city.name
                  ? 'border-forest-600 bg-forest-50 text-forest-900 ring-2 ring-forest-500'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="text-xs font-bold">{city.name}</div>
              <div className="text-[11px] text-slate-500">{city.state || city.country}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          Custom Neighborhood or City
        </label>
        <input
          type="text"
          value={profile.default_city}
          placeholder="e.g. Besant Nagar, Chennai"
          onChange={async (e) => {
            const newCity = e.target.value;
            const resolved = await resolveCityCoordinates(newCity);
            if (resolved) {
              setProfile({
                ...profile,
                default_city: newCity,
                default_lat: resolved.lat,
                default_lon: resolved.lon,
              });
            } else {
              setProfile({ ...profile, default_city: newCity });
            }
          }}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
        <p className="text-[11px] text-slate-500">
          Active Coordinates: {profile.default_lat.toFixed(4)}°, {profile.default_lon.toFixed(4)}°
        </p>
      </div>
    </CardContent>
  );
}
