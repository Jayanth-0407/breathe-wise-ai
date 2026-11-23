'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardFooter } from '@/components/ui/Card';
import { DEFAULT_USER_PROFILE } from '@/lib/api';
import { UserProfile } from '@/lib/types';
import { getStoredProfile, saveStoredProfile } from '@/lib/profile';
import { OnboardingStepOne } from '@/components/onboarding/OnboardingStepOne';
import { OnboardingStepTwo } from '@/components/onboarding/OnboardingStepTwo';
import { OnboardingStepThree } from '@/components/onboarding/OnboardingStepThree';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleDetectLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setProfile((p) => ({
            ...p,
            default_city: 'Detected Device Location',
            default_lat: parseFloat(pos.coords.latitude.toFixed(4)),
            default_lon: parseFloat(pos.coords.longitude.toFixed(4)),
          }));
        },
        () => {
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
      saveStoredProfile(profile);

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiBase}/api/v1/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } catch (e) {
      // Local storage is primary
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
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Go to Live Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/routes">
              <Button variant="outline" size="lg">
                Explore Routes
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Onboarding Wizard Error" fallbackMessage="Could not load onboarding flow.">
      <div className="max-w-3xl mx-auto px-4 py-12 w-full">
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
          {step === 1 && <OnboardingStepOne profile={profile} setProfile={setProfile} />}
          {step === 2 && <OnboardingStepTwo profile={profile} setProfile={setProfile} />}
          {step === 3 && (
            <OnboardingStepThree
              profile={profile}
              setProfile={setProfile}
              onDetectLocation={handleDetectLocation}
            />
          )}

          <CardFooter className="flex justify-between border-t border-slate-100 p-6">
            <Button variant="outline" onClick={handlePrev} disabled={step === 1} className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext} className="gap-2 text-xs">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={loading} className="gap-2 text-xs">
                {loading ? 'Saving...' : 'Finish & Save Profile'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
