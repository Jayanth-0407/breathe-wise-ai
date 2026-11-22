'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Activity, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DEFAULT_USER_PROFILE } from '@/lib/api';
import { UserProfile } from '@/lib/types';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  useEffect(() => {
    // Load existing profile from localStorage if present
    const savedProfile = localStorage.getItem('breathewise_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {}
    }
  }, []);

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setProfile((p) => ({
            ...p,
            default_city: 'Detected Device Location',
            default_lat: parseFloat(pos.coords.latitude.toFixed(4)),
            default_lon: parseFloat(pos.coords.longitude.toFixed(4)),
          }));
        },
        (err) => {
          alert('Location permission was denied or unavailable. You can manually select a city.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage for instant client state
      localStorage.setItem('breathewise_profile', JSON.stringify(profile));

      // Attempt backend persistence
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiBase}/api/v1/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } catch (e) {
      // localStorage still works
    } finally {
      setLoading(false);
      setSaved(true);
    }
  };

  if (saved) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 w-full">
        <Card className="text-center p-8 border-forest-300 bg-forest-50/30">
          <div className="w-16 h-16 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mx-auto mb-4 border border-forest-300">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Configured Successfully</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            Your fitness preferences and health vulnerability profile will now personalize all air quality guidance and route scoring.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/dashboard">
              <Button size="lg" className="gap-2">
                Go to Live Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a href="/routes">
              <Button variant="outline" size="lg">
                Explore Routes
              </Button>
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 w-full">
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Step {step} of 3
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Personalize Your Environmental Experience
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          We use this information strictly to tailor health guidance and route recommendations. We never diagnose medical conditions or share individual health data.
        </p>
      </div>

      <Card className="shadow-md">
        {/* Step 1: Health Vulnerability */}
        {step === 1 && (
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Heart className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-bold text-slate-900">Health Vulnerability</h3>
            </div>

            {/* Age Group */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                Age Group
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'child', label: 'Child (<18)' },
                  { id: 'young_adult', label: 'Young Adult (18-35)' },
                  { id: 'adult', label: 'Adult (36-64)' },
                  { id: 'senior', label: 'Senior (65+)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, age_group: item.id as any })}
                    className={`py-3 px-3 rounded-lg border text-xs font-medium transition text-center ${
                      profile.age_group === item.id
                        ? 'border-forest-600 bg-forest-50 text-forest-900 ring-2 ring-forest-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Children and seniors experience higher lung ventilation per body weight and are more susceptible to PM2.5.
              </p>
            </div>

            {/* Asthma status */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-semibold text-slate-800">
                Asthma Diagnosis
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, has_asthma: true })}
                  className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition ${
                    profile.has_asthma
                      ? 'border-forest-600 bg-forest-50 text-forest-900 ring-2 ring-forest-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Yes, I have asthma
                </button>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, has_asthma: false })}
                  className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition ${
                    !profile.has_asthma
                      ? 'border-forest-600 bg-forest-50 text-forest-900 ring-2 ring-forest-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  No asthma
                </button>
              </div>
            </div>

            {/* Optional respiratory conditions */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-semibold text-slate-800">
                Other Respiratory / Cardiovascular Conditions (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Seasonal Allergies',
                  'Chronic Bronchitis',
                  'Cardiovascular History',
                  'Post-COVID Sensitivity',
                ].map((condition) => {
                  const selected = profile.respiratory_conditions.includes(condition);
                  return (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => {
                        const next = selected
                          ? profile.respiratory_conditions.filter((c) => c !== condition)
                          : [...profile.respiratory_conditions, condition];
                        setProfile({ ...profile, respiratory_conditions: next });
                      }}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                        selected
                          ? 'border-forest-600 bg-forest-100 text-forest-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {condition}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        )}

        {/* Step 2: Fitness & Routine */}
        {step === 2 && (
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Activity className="w-5 h-5 text-forest-600" />
              <h3 className="text-lg font-bold text-slate-900">Fitness Profile & Preferences</h3>
            </div>

            {/* Fitness Level */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                Current Fitness Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'beginner', label: 'Beginner', desc: 'Gentle walks, light exertion' },
                  { id: 'intermediate', label: 'Intermediate', desc: 'Regular jogs, brisk walks' },
                  { id: 'advanced', label: 'Advanced', desc: 'Long runs, high intensity' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, fitness_level: lvl.id as any })}
                    className={`p-3 rounded-lg border text-left transition ${
                      profile.fitness_level === lvl.id
                        ? 'border-forest-600 bg-forest-50 ring-2 ring-forest-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{lvl.label}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Goal & Preferred Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Daily Activity Goal (Minutes)
                </label>
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-forest-600 focus:ring-forest-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Preferred Exercise Session (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={profile.preferred_duration_minutes ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfile({
                      ...profile,
                      preferred_duration_minutes: val === '' ? ('' as any) : parseInt(val, 10),
                    });
                  }}
                  onBlur={() => {
                    if (!profile.preferred_duration_minutes || Number(profile.preferred_duration_minutes) <= 0) {
                      setProfile({ ...profile, preferred_duration_minutes: 30 });
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-forest-600 focus:ring-forest-600"
                />
              </div>
            </div>

            {/* Preferred Activities */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-semibold text-slate-800">
                Preferred Activities
              </label>
              <div className="flex flex-wrap gap-2">
                {['walking', 'jogging', 'cycling', 'yoga', 'indoor_workouts'].map((act) => {
                  const selected = profile.preferred_activities.includes(act);
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => {
                        const next = selected
                          ? profile.preferred_activities.filter((a) => a !== act)
                          : [...profile.preferred_activities, act];
                        setProfile({ ...profile, preferred_activities: next });
                      }}
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold capitalize transition ${
                        selected
                          ? 'border-forest-600 bg-forest-600 text-white'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {act.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        )}

        {/* Step 3: Location Permission & Default City */}
        {step === 3 && (
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
                onClick={handleDetectLocation}
                className="w-full gap-2 text-xs"
              >
                <MapPin className="w-4 h-4 text-forest-600" />
                Use Device GPS (Browser Permission)
              </Button>
            </div>

            {/* City Preset Selection */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-semibold text-slate-800">
                Or Select Your City Preset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { city: 'Chennai', lat: 13.0827, lon: 80.2707 },
                  { city: 'Delhi NCR', lat: 28.6139, lon: 77.2090 },
                  { city: 'Mumbai', lat: 19.0760, lon: 72.8777 },
                  { city: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
                  { city: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
                  { city: 'Kolkata', lat: 22.5726, lon: 88.3639 },
                ].map((item) => (
                  <button
                    key={item.city}
                    type="button"
                    onClick={() =>
                      setProfile({
                        ...profile,
                        default_city: item.city,
                        default_lat: item.lat,
                        default_lon: item.lon,
                      })
                    }
                    className={`py-2 px-3 rounded-lg border text-xs font-medium text-left transition ${
                      profile.default_city === item.city
                        ? 'border-forest-600 bg-forest-50 text-forest-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item.city}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Coordinates indicator */}
            <div className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200">
              Selected Target: <span className="font-semibold text-slate-800">{profile.default_city}</span> ({profile.default_lat.toFixed(4)}, {profile.default_lon.toFixed(4)})
            </div>
          </CardContent>
        )}

        {/* Footer Navigation */}
        <CardFooter>
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={handlePrev} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button size="sm" onClick={handleNext} className="gap-1.5 ml-auto">
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSave}
              isLoading={loading}
              className="gap-1.5 ml-auto shadow-sm"
            >
              Complete & Save Profile <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
