'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { DEFAULT_USER_PROFILE } from '@/lib/api';
import { resolveCityCoordinates } from '@/lib/cities';
import { getStoredProfile, saveStoredProfile, clearStoredProfile } from '@/lib/profile';
import { ProfileSettingsForm } from '@/components/profile/ProfileSettingsForm';
import { DataPrivacyGovernance } from '@/components/profile/DataPrivacyGovernance';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  const handleSave = async () => {
    let updatedProfile = { ...profile };
    if (updatedProfile.default_city) {
      const resolved = await resolveCityCoordinates(updatedProfile.default_city);
      if (resolved) {
        updatedProfile.default_city = resolved.name;
        updatedProfile.default_lat = resolved.lat;
        updatedProfile.default_lon = resolved.lon;
        setProfile(updatedProfile);
      }
    }

    const savedResult = saveStoredProfile(updatedProfile);
    setProfile(savedResult);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiBase}/api/v1/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedResult),
      });
    } catch (e) {
      // Local storage is primary
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
    setDownloading(true);
    const data = {
      profile,
      exported_at: new Date().toISOString(),
      governance: 'BreatheWise AI User Data Export (GDPR / Privacy Principle Compliant)',
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
      clearStoredProfile();
      setProfile(DEFAULT_USER_PROFILE);
      alert('Local data cleared successfully.');
    }
  };

  return (
    <ErrorBoundary fallbackTitle="Profile Load Error" fallbackMessage="Unable to load user profile settings.">
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
          <div className="md:col-span-2 space-y-6">
            <ProfileSettingsForm
              profile={profile}
              setProfile={setProfile}
              handleSave={handleSave}
              saved={saved}
            />
          </div>
          <div className="space-y-6">
            <DataPrivacyGovernance
              onExportData={handleExportData}
              onClearData={handleClearData}
              downloading={downloading}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
