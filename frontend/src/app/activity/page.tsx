'use client';

import React from 'react';
import { Activity, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { ActivityStatsSummary } from '@/components/activity/ActivityStatsSummary';
import { EmissionsCalculatorCard } from '@/components/activity/EmissionsCalculatorCard';
import { ActivityHistoryList } from '@/components/activity/ActivityHistoryList';
import { LogWorkoutModal } from '@/components/activity/LogWorkoutModal';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function ActivityPage() {
  const {
    activities,
    weeklyMinutes,
    weeklyKm,
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
  } = useActivityTracker();

  return (
    <ErrorBoundary fallbackTitle="Activity Tracker Error" fallbackMessage="Could not load your activity log.">
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

          <Button onClick={() => setShowLogModal(true)} className="gap-2 shadow-xs">
            <PlusCircle className="w-4 h-4" />
            Log Workout Session
          </Button>
        </div>

        {/* Stats Summary Bar */}
        <ActivityStatsSummary
          weeklyMinutes={weeklyMinutes}
          weeklyKm={weeklyKm}
          totalSessions={activities.length}
        />

        {/* Main Grid: Emissions Calculator + Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <EmissionsCalculatorCard
              calcDistance={calcDistance}
              setCalcDistance={setCalcDistance}
              activeMode={activeMode}
              setActiveMode={setActiveMode}
              replacedMode={replacedMode}
              setReplacedMode={setReplacedMode}
              emissionsResult={emissionsResult}
            />
          </div>

          <div className="lg:col-span-5 space-y-4">
            <ActivityHistoryList activities={activities} />
          </div>
        </div>

        {/* Log Workout Modal */}
        <LogWorkoutModal
          show={showLogModal}
          onClose={() => setShowLogModal(false)}
          onSubmit={handleLogSubmit}
          logType={logType}
          setLogType={setLogType}
          logDuration={logDuration}
          setLogDuration={setLogDuration}
          logDistance={logDistance}
          setLogDistance={setLogDistance}
          logNotes={logNotes}
          setLogNotes={setLogNotes}
          submitting={submitting}
        />
      </div>
    </ErrorBoundary>
  );
}
