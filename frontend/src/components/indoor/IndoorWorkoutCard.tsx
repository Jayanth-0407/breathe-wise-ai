'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Fan, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IndoorWorkout } from '@/lib/types';

interface IndoorWorkoutCardProps {
  item: IndoorWorkout;
}

export function IndoorWorkoutCard({ item }: IndoorWorkoutCardProps) {
  return (
    <Card className="hover:border-purple-300 transition-all flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <Badge variant="purple" className="text-xs font-bold">
              {item.category}
            </Badge>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {item.duration_minutes} min
            </span>
          </div>
          <CardTitle className="text-lg text-slate-900 pt-1">
            {item.title}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {item.benefits}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Step-by-Step Sequence:
            </h4>
            <ul className="space-y-1.5">
              {item.instructions.map((step, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </div>

      <div className="p-4 bg-purple-50/40 border-t border-purple-100 rounded-b-xl flex items-center justify-between text-xs">
        <span className="text-purple-900 font-medium flex items-center gap-1.5">
          <Fan className="w-3.5 h-3.5 text-purple-600" />
          {item.clean_air_tips[0] || 'Run HEPA filtration prior to workout.'}
        </span>
        <Link href="/activity" className="font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1">
          Log Session <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
