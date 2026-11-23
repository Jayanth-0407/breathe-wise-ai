'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Home,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LiveAirQuality, UserProfile } from '@/lib/types';
import { formatAQICategory } from '@/lib/utils';

interface HealthAdvisoryPanelProps {
  liveData: LiveAirQuality | null;
  profile: UserProfile;
}

export function HealthAdvisoryPanel({ liveData, profile }: HealthAdvisoryPanelProps) {
  const aqi = liveData?.aqi || 60;
  const aqiInfo = formatAQICategory(aqi);

  return (
    <div className="space-y-6">
      {/* Personalized Health Guidance */}
      <Card className="border-forest-200 bg-linear-to-b from-forest-50/40 to-white">
        <CardHeader className="pb-3 border-b border-forest-100/60">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-forest-700" />
            <CardTitle className="text-base text-forest-900">
              Personalized Health Guidance
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {profile.has_asthma && aqi > 80 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-0.5">
                <span className="font-bold block">Respiratory Vulnerability Alert</span>
                <p>Because you noted asthma or respiratory sensitivity, prolonged high-MET cardio outside is not recommended under current particulate load.</p>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-700 leading-relaxed">
            {liveData?.personalized_guidance ||
              "Current conditions are suitable for moderate outdoor movement. Monitor personal comfort if you have airway sensitivities."}
          </p>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Recommended Protocol
            </span>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                <span>{aqi <= 100 ? 'Outdoor jogging and walking recommended.' : 'Prefer low-intensity walking or indoor training.'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                <span>{aqi <= 100 ? 'Standard ventilation acceptable.' : 'Wear well-fitted N95 particulate mask along traffic corridors.'}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link href="/best-time">
              <Button className="w-full bg-forest-600 hover:bg-forest-700 text-white gap-2 text-xs font-bold py-2 shadow-xs">
                View Best Exercise Windows <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            {aqi > 100 && (
              <Link href="/indoor">
                <Button variant="outline" className="w-full gap-2 text-xs font-semibold py-2">
                  <Home className="w-3.5 h-3.5" /> Explore Indoor Clean-Air Workouts
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exposure Formula Explainer */}
      <Card className="bg-slate-50/70 border-slate-200">
        <CardContent className="p-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <Info className="w-4 h-4 text-forest-600" />
            Physiological Particulate Formulation
          </div>
          <p className="leading-relaxed">
            BreatheWise estimates your cumulative inhaled mass (µg) by multiplying active minute ventilation (V_E = V_0 × MET) by real-time PM2.5 concentration and street proximity factors.
          </p>
          <div className="pt-2">
            <Link href="/routes" className="text-forest-700 font-bold hover:underline inline-flex items-center gap-1">
              Test on Route Planner <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
