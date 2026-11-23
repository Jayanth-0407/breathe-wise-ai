'use client';

import React from 'react';
import { Activity, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ActivityStatsSummaryProps {
  weeklyMinutes: number;
  weeklyKm: number;
  totalSessions: number;
}

export function ActivityStatsSummary({
  weeklyMinutes,
  weeklyKm,
  totalSessions,
}: ActivityStatsSummaryProps) {
  const weeklyGoalMin = 210;
  const goalProgressPct = Math.min(100, Math.round((weeklyMinutes / weeklyGoalMin) * 100));

  return (
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
          <span className="text-3xl font-black text-slate-900">{totalSessions}</span>
          <span className="text-xs text-slate-500 font-medium">sessions</span>
        </div>
        <span className="text-xs text-slate-400 block mt-2">Recorded physical activities</span>
      </Card>
    </div>
  );
}
