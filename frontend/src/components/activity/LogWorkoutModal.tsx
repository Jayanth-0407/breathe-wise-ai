'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface LogWorkoutModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  logType: string;
  setLogType: (t: string) => void;
  logDuration: number;
  setLogDuration: (d: number) => void;
  logDistance: number;
  setLogDistance: (d: number) => void;
  logNotes: string;
  setLogNotes: (n: string) => void;
  submitting: boolean;
}

export function LogWorkoutModal({
  show,
  onClose,
  onSubmit,
  logType,
  setLogType,
  logDuration,
  setLogDuration,
  logDistance,
  setLogDistance,
  logNotes,
  setLogNotes,
  submitting,
}: LogWorkoutModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base text-slate-900">Log Physical Activity Session</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={onSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase">Activity Mode</label>
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="jogging">Jogging / Running</option>
                <option value="walking">Brisk Walking</option>
                <option value="cycling">Cycling</option>
                <option value="indoor_workout">Indoor Clean-Air Workout</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Duration (mins)</label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  value={logDuration}
                  onChange={(e) => setLogDuration(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={logDistance}
                  onChange={(e) => setLogDistance(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase">Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Tree canopy route near park"
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1 text-xs">
                {submitting ? 'Saving...' : 'Save Activity Record'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="text-xs">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
