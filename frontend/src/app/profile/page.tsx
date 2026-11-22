'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Heart, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  Lock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserProfile } from '@/lib/types';
import { DEFAULT_USER_PROFILE } from '@/lib/api';
import { resolveCityCoordinates, POPULAR_CITIES } from '@/lib/cities';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('breathewise_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {}
    }
  }, []);

  const handleSave = async () => {
    let updatedProfile = { ...profile };
    // Synchronize coordinates if city was typed manually
    if (updatedProfile.default_city) {
      const resolved = await resolveCityCoordinates(updatedProfile.default_city);
      if (resolved) {
        updatedProfile.default_city = resolved.name;
        updatedProfile.default_lat = resolved.lat;
        updatedProfile.default_lon = resolved.lon;
        setProfile(updatedProfile);
      }
    }

    if (!updatedProfile.daily_activity_goal_minutes || Number(updatedProfile.daily_activity_goal_minutes) <= 0) {
      updatedProfile.daily_activity_goal_minutes = 30;
    } else {
      updatedProfile.daily_activity_goal_minutes = Number(updatedProfile.daily_activity_goal_minutes);
    }

    localStorage.setItem('breathewise_profile', JSON.stringify(updatedProfile));
    
    // Also sync to backend if running
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiBase}/api/v1/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });
    } catch (e) {}

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
    setDownloading(true);
    const data = {
      profile,
      exported_at: new Date().toISOString(),
      governance: "BreatheWise AI User Data Export (GDPR / Privacy Principle Compliant)",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breathewise_user_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear your local profile and history? This cannot be undone.')) {
      localStorage.removeItem('breathewise_profile');
      setProfile(DEFAULT_USER_PROFILE);
      alert('Local data cleared successfully.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold">
          <User className="w-3.5 h-3.5 text-forest-600" />
          Settings & Privacy Governance
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          User Profile & Data Privacy
        </h1>
        <p className="text-sm text-slate-600">
          Manage your health vulnerability settings, fitness targets, and exercise data with complete privacy control.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Form Settings (2 cols) */}
        <div className="md:col-span-2 space-y-6">
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Age Group</label>
                <select
                  value={profile.age_group}
                  onChange={(e) => setProfile({ ...profile, age_group: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="child">Child (&lt;18)</option>
                  <option value="young_adult">Young Adult (18-35)</option>
                  <option value="adult">Adult (36-64)</option>
                  <option value="senior">Senior (65+)</option>
                </select>
              </div>

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

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Daily Goal (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={profile.daily_activity_goal_minutes ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfile({
                      ...profile,
                      daily_activity_goal_minutes: val === '' ? ('' as any) : parseInt(val, 10),
                    });
                  }}
                  onBlur={() => {
                    if (!profile.daily_activity_goal_minutes || Number(profile.daily_activity_goal_minutes) <= 0) {
                      setProfile({ ...profile, daily_activity_goal_minutes: 30 });
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

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
                {/* Popular City quick select pills */}
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
        </div>

        {/* Right Column: Privacy Actions (1 col) */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-forest-600" />
                <CardTitle className="text-sm">Data Privacy & Sovereignty</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs text-slate-600 leading-relaxed">
              <p>
                BreatheWise AI is built on the principle of <strong>data minimization</strong>. Your health and GPS location data are never sold or shared with third-party advertisers.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="w-full gap-1.5 text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Export Data (JSON)
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleClearData}
                  className="w-full gap-1.5 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All Local Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed space-y-1">
            <strong className="text-slate-800 block">Medical Disclaimer</strong>
            BreatheWise AI provides environmental and atmospheric risk reduction tools. It does not diagnose cardiovascular, pulmonary, or respiratory diseases.
          </div>
        </div>
      </div>
    </div>
  );
}
