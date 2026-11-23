'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { CardContent } from '@/components/ui/Card';
import { UserProfile } from '@/lib/types';

interface OnboardingStepOneProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

const AGE_GROUPS: { id: 'child' | 'young_adult' | 'adult' | 'senior'; label: string }[] = [
  { id: 'child', label: 'Child (<18)' },
  { id: 'young_adult', label: 'Young Adult (18-35)' },
  { id: 'adult', label: 'Adult (36-64)' },
  { id: 'senior', label: 'Senior (65+)' },
];

const RESPIRATORY_CONDITIONS = [
  'Seasonal Allergies',
  'Chronic Bronchitis',
  'Cardiovascular History',
  'Post-COVID Sensitivity',
];

export function OnboardingStepOne({ profile, setProfile }: OnboardingStepOneProps) {
  return (
    <CardContent className="space-y-6 pt-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Heart className="w-5 h-5 text-rose-500" />
        <h3 className="text-lg font-bold text-slate-900">Health Vulnerability</h3>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">Age Group</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AGE_GROUPS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setProfile({ ...profile, age_group: item.id })}
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

      <div className="space-y-2 pt-2">
        <label className="block text-sm font-semibold text-slate-800">Asthma Diagnosis</label>
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

      <div className="space-y-2 pt-2">
        <label className="block text-sm font-semibold text-slate-800">
          Other Respiratory / Cardiovascular Conditions (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {RESPIRATORY_CONDITIONS.map((condition) => {
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
  );
}
