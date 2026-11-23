'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Sun, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ExerciseWindow } from '@/lib/types';

interface ExerciseWindowCardProps {
  win: ExerciseWindow;
  isTop: boolean;
}

export function ExerciseWindowCard({ win, isTop }: ExerciseWindowCardProps) {
  return (
    <Card
      className={`relative overflow-hidden transition-all ${
        isTop
          ? 'border-forest-600 ring-2 ring-forest-500/20 shadow-md'
          : 'border-slate-200'
      }`}
    >
      {isTop && (
        <div className="bg-forest-600 text-white text-[11px] font-bold px-3 py-1 text-center tracking-wider uppercase">
          ⭐ Top Recommended Window
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-forest-700" />
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {win.window_start} – {win.window_end}
            </span>
          </div>
          <Badge
            variant={
              win.suitability === 'Optimal'
                ? 'success'
                : win.suitability === 'Acceptable'
                ? 'default'
                : 'warning'
            }
          >
            {win.suitability}
          </Badge>
        </div>
        <CardDescription className="flex items-center justify-between pt-1">
          <span>Score: <strong className="text-forest-700">{win.recommendation_score}/100</strong></span>
          <span>Avg AQI: <strong className="text-slate-800">{win.avg_aqi} ({win.category})</strong></span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
          <span className="font-semibold text-slate-800 block flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-500" /> Atmospheric Meteorology
          </span>
          <p>{win.weather_summary}</p>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          {win.reason}
        </p>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <Link
            href="/routes"
            className="font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1"
          >
            Plan Route for this Time <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
