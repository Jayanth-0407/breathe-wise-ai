'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Flame, 
  Clock, 
  PlusCircle, 
  TrendingUp, 
  Leaf, 
  Car, 
  CheckCircle2, 
  ShieldCheck, 
  Info,
  Calendar,
  Bike
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ActivityItem, EmissionCalculation } from '@/lib/types';

export default function ActivityPage() {
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
      console.error('Failed to load activities:', e);
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
      console.error('Failed to calculate emissions:', e);
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

  const weeklyGoalMin = 210; // 30 min * 7 days
  const goalProgressPct = Math.min(100, Math.round((weeklyMinutes / weeklyGoalMin) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-forest-600" />
            Activity & Climate Impact
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Activity Tracking & Low-Emission Insights
          </h1>
          <p className="text-sm text-slate-600">
            Log your workouts, monitor exercise streaks, and quantify carbon and toxic local air emissions avoided.
          </p>
        </div>

        <Button
          onClick={() => setShowLogModal(true)}
          className="gap-2 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Log Workout Session
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Fitness Goal</span>
            <span className="text-xs font-bold text-forest-700">{goalProgressPct}% Completed</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{weeklyMinutes}</span>
            <span className="text-xs text-slate-500 font-medium">/ {weeklyGoalMin} minutes</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-forest-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${goalProgressPct}%` }}
            />
          </div>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Distance</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{weeklyKm}</span>
            <span className="text-xs text-slate-500 font-medium">km logged</span>
          </div>
          <span className="text-xs text-slate-400 block mt-2">Aerobic mobility distance</span>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-forest-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{activities.length}</span>
            <span className="text-xs text-slate-500 font-medium">sessions</span>
          </div>
          <span className="text-xs text-slate-400 block mt-2">Recorded physical activities</span>
        </Card>
      </div>

      {/* Main Grid: Emissions Calculator + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Emissions Calculator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-forest-200 shadow-sm">
            <CardHeader className="bg-forest-50/50 border-b border-forest-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-forest-600" />
                  <CardTitle className="text-base text-slate-900">
                    Low-Emission Transport Calculator
                  </CardTitle>
                </div>
                <Badge variant="success">Documented DEFRA Factors</Badge>
              </div>
              <CardDescription>
                Calculate exact emissions prevented by choosing active mobility over motor vehicle transit.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Distance Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Trip Distance: <span className="text-forest-700 text-sm">{calcDistance} km</span>
                  </label>
                  <span className="text-xs text-slate-400">Short Urban Commute</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="30"
                  step="0.5"
                  value={calcDistance}
                  onChange={(e) => setCalcDistance(parseFloat(e.target.value))}
                  className="w-full accent-forest-600 cursor-pointer"
                />
              </div>

              {/* Mode switchers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Your Active Mode
                  </label>
                  <div className="flex gap-2">
                    {['walking', 'cycling'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setActiveMode(m)}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold capitalize transition ${
                          activeMode === m
                            ? 'bg-forest-600 text-white border-forest-600'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Replaced Vehicle
                  </label>
                  <select
                    value={replacedMode}
                    onChange={(e) => setReplacedMode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:border-forest-600 focus:ring-forest-600"
                  >
                    <option value="petrol_car">Petrol Passenger Car (~171 g/km)</option>
                    <option value="diesel_car">Diesel Passenger Car (~165 g/km)</option>
                    <option value="motorbike">Two-Wheeler Motorbike (~103 g/km)</option>
                    <option value="auto_rickshaw">Auto-Rickshaw / Micro-Transit (~82 g/km)</option>
                  </select>
                </div>
              </div>

              {/* Output Readout */}
              {emissionsResult && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">CO2e Prevented</span>
                      <span className="text-lg font-black text-forest-700">{emissionsResult.co2e_saved_kg} kg</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Tailpipe PM2.5 Avoided</span>
                      <span className="text-lg font-black text-emerald-700">{emissionsResult.local_pm25_avoided_grams} g</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Toxic NOx Avoided</span>
                      <span className="text-lg font-black text-amber-700">{emissionsResult.local_nox_avoided_grams} g</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {emissionsResult.comparative_context}
                  </p>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Scientific Distinction:</strong> {emissionsResult.scientific_distinction}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Log List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Previous Activities ({activities.length})
            </h3>
            <span className="text-xs text-slate-500">Sorted by recent</span>
          </div>

          {activities.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
              <Activity className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No workout activities logged yet.</p>
              <Button size="sm" variant="outline" onClick={() => setShowLogModal(true)}>
                Log First Session
              </Button>
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="capitalize text-xs font-semibold">
                      {act.activity_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs font-bold text-slate-900">{act.location_name || 'Workout'}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {act.duration_minutes} min
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>Distance: <strong className="text-slate-800">{act.distance_km} km</strong></span>
                  {act.exposure_score && (
                    <span>Exposure Index: <strong className="text-forest-700">{act.exposure_score}</strong></span>
                  )}
                </div>

                {act.notes && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                    "{act.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manual Activity Logging Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white shadow-xl">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-base">Log Physical Activity</CardTitle>
              <CardDescription>Manually track your outdoor or indoor exercise session.</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Activity Type</label>
                  <select
                    value={logType}
                    onChange={(e) => setLogType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="jogging">Jogging</option>
                    <option value="walking">Walking</option>
                    <option value="cycling">Cycling</option>
                    <option value="indoor_workout">Indoor Workout</option>
                    <option value="yoga">Yoga & Stretching</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Duration (Mins)</label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={logDuration}
                      onChange={(e) => setLogDuration(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={logDistance}
                      onChange={(e) => setLogDistance(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="Air felt clear, brisk pace..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </CardContent>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 rounded-b-xl">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={submitting}>
                  Save Workout
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
