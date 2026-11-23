'use client';

import { useState, useEffect } from 'react';
import { ActivityItem, EmissionCalculation } from '@/lib/types';

export function useActivityTracker() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [weeklyKm, setWeeklyKm] = useState(0);
  const [loading, setLoading] = useState(true);

  // Manual Log Form State
  const [showLogModal, setShowLogModal] = useState(false);
  const [logType, setLogType] = useState('jogging');
  const [logDuration, setLogDuration] = useState(30);
  const [logDistance, setLogDistance] = useState(4.5);
  const [logNotes, setLogNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Emissions Calculator State
  const [calcDistance, setCalcDistance] = useState(5.0);
  const [activeMode, setActiveMode] = useState('walking');
  const [replacedMode, setReplacedMode] = useState('petrol_car');
  const [emissionsResult, setEmissionsResult] = useState<EmissionCalculation | null>(null);

  const fetchActivities = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/activities?user_id=guest-user`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        if (data.summary) {
          setWeeklyMinutes(data.summary.total_duration_minutes || 0);
          setWeeklyKm(data.summary.total_distance_km || 0);
        }
      }
    } catch (e) {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  const calculateEmissions = async (dist: number, act: string, rep: string) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/emissions/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distance_km: dist,
          active_mode: act,
          replaced_mode: rep,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmissionsResult(data);
      }
    } catch (e) {
      // Graceful fallback
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    calculateEmissions(calcDistance, activeMode, replacedMode);
  }, [calcDistance, activeMode, replacedMode]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'guest-user',
          activity_type: logType,
          duration_minutes: logDuration,
          distance_km: logDistance,
          estimated_aqi: 95,
          exposure_score: Math.round(95 * (logDuration / 30) * 0.9),
          location_name: 'Local Exercise Session',
          notes: logNotes,
        }),
      });
      if (res.ok) {
        setShowLogModal(false);
        setLogNotes('');
        await fetchActivities();
      }
    } catch (e) {
      alert('Failed to log activity.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    activities,
    weeklyMinutes,
    weeklyKm,
    loading,
    showLogModal,
    setShowLogModal,
    logType,
    setLogType,
    logDuration,
    setLogDuration,
    logDistance,
    setLogDistance,
    logNotes,
    setLogNotes,
    submitting,
    handleLogSubmit,
    calcDistance,
    setCalcDistance,
    activeMode,
    setActiveMode,
    replacedMode,
    setReplacedMode,
    emissionsResult,
  };
}
