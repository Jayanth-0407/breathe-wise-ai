'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ActivityItem } from '@/lib/types';

interface ActivityHistoryListProps {
  activities: ActivityItem[];
}

export function ActivityHistoryList({ activities }: ActivityHistoryListProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-sm uppercase tracking-wider font-bold">
          Recent Activity Log ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No activity sessions logged yet. Record your workouts to track metrics!
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-[10px] py-0 font-bold">
                    {act.activity_type}
                  </Badge>
                  <span className="font-bold text-slate-800">{act.location_name || 'Outdoor Workout'}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(act.logged_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <span>{act.duration_minutes} mins</span>
                  {act.distance_km > 0 && <span>{act.distance_km} km</span>}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Est. Exposure</span>
                <span className="font-extrabold text-slate-800 text-sm">
                  {act.exposure_score ?? '--'}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
