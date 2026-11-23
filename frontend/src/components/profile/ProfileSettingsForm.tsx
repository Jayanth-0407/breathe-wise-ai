'use client';

import React from 'react';
import { Heart, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserProfile } from '@/lib/types';
import { POPULAR_CITIES, resolveCityCoordinates } from '@/lib/cities';

interface ProfileSettingsFormProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  handleSave: () => void;
  saved: boolean;
}

export function ProfileSettingsForm({
  profile,
  setProfile,
  handleSave,
  saved,
}: ProfileSettingsFormProps) {
  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-base flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" /> Health Vulnerability Profile
        </CardTitle>
        <CardDescription>
          Used exclusively to tailor health advisories and workout intensity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Age Group */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">Age Group</label>
          <select
            value={profile.age_group}
            onChange={(e) =>
              setProfile({
                ...profile,
                age_group: e.target.value as 'child' | 'young_adult' | 'adult' | 'senior',
              })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
          >
            <option value="child">Child (&lt;18)</option>
            <option value="young_adult">Young Adult (18-35)</option>
            <option value="adult">Adult (36-64)</option>
            <option value="senior">Senior (65+)</option>
          </select>
        </div>

        {/* Asthma */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">Asthma Diagnosis</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setProfile({ ...profile, has_asthma: true })}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition ${
                profile.has_asthma
                  ? 'bg-forest-600 text-white border-forest-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Diagnosed Asthma
            </button>
            <button
              type="button"
              onClick={() => setProfile({ ...profile, has_asthma: false })}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition ${
                !profile.has_asthma
                  ? 'bg-forest-600 text-white border-forest-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              No Asthma
            </button>
          </div>
        </div>

        {/* Daily Goal Minutes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">Daily Goal (Minutes)</label>
          <input
            type="number"
            min="5"
            max="300"
            value={profile.daily_activity_goal_minutes || ''}
            onChange={(e) => {
              const val = e.target.value;
              setProfile({
                ...profile,
                daily_activity_goal_minutes: val === '' ? 0 : parseInt(val, 10),
              });
            }}
            onBlur={() => {
              if (!profile.daily_activity_goal_minutes || profile.daily_activity_goal_minutes <= 0) {
                setProfile({ ...profile, daily_activity_goal_minutes: 30 });
              }
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        {/* City Preset */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase">Home City Preset</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={profile.default_city}
              placeholder="Enter city (e.g. Chennai, Mumbai, Delhi)"
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
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {POPULAR_CITIES.slice(0, 6).map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() =>
                  setProfile({
                    ...profile,
                    default_city: c.name,
                    default_lat: c.lat,
                    default_lon: c.lon,
                  })
                }
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  profile.default_city.toLowerCase() === c.name.toLowerCase()
                    ? 'bg-forest-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Target Coordinates: <span className="font-semibold text-slate-700">{profile.default_lat.toFixed(4)}°, {profile.default_lon.toFixed(4)}°</span>
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Button size="sm" onClick={handleSave} className="gap-1.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4" /> Save Profile Changes
          </Button>
          {saved && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
