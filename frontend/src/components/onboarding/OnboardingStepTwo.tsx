'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { CardContent } from '@/components/ui/Card';
import { UserProfile } from '@/lib/types';

interface OnboardingStepTwoProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

const FITNESS_LEVELS: { id: 'beginner' | 'intermediate' | 'advanced'; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'Gentle walks, light exertion' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Regular jogs, brisk walks' },
  { id: 'advanced', label: 'Advanced', desc: 'Long runs, high intensity' },
];

const ACTIVITIES = ['walking', 'jogging', 'cycling', 'yoga', 'indoor_workouts'];

export function OnboardingStepTwo({ profile, setProfile }: OnboardingStepTwoProps) {
  return (
    <CardContent className="space-y-6 pt-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Activity className="w-5 h-5 text-forest-600" />
        <h3 className="text-lg font-bold text-slate-900">Fitness Profile & Preferences</h3>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">Current Fitness Level</label>
        <div className="grid grid-cols-3 gap-3">
          {FITNESS_LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setProfile({ ...profile, fitness_level: lvl.id })}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">
            Daily Activity Goal (Minutes)
          </label>
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
            value={profile.preferred_duration_minutes || ''}
            onChange={(e) => {
              const val = e.target.value;
              setProfile({
                ...profile,
                preferred_duration_minutes: val === '' ? 0 : parseInt(val, 10),
              });
            }}
            onBlur={() => {
              if (!profile.preferred_duration_minutes || profile.preferred_duration_minutes <= 0) {
                setProfile({ ...profile, preferred_duration_minutes: 30 });
              }
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-forest-600 focus:ring-forest-600"
          />
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <label className="block text-sm font-semibold text-slate-800">Preferred Activities</label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITIES.map((act) => {
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
  );
}
