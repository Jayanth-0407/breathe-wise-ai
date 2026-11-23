'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-forest-50/60 via-white to-slate-50 border-b border-slate-200/60 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100/80 border border-forest-300 text-forest-800 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            <span>Pollution-Aware Fitness & Mobility Assistant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Breathe Cleaner. <br />
            <span className="text-forest-700 bg-gradient-to-r from-forest-700 to-emerald-600 bg-clip-text text-transparent">
              Move Smarter. Live Healthier.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Navigate urban air pollution with personalized route recommendations, predictive exercise windows, and deterministic exposure estimations tailored to your health vulnerability.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/onboarding">
              <Button size="lg" className="shadow-md shadow-forest-600/20 text-base px-6">
                Get Started (Personalize)
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="text-base px-6">
                Open Live Dashboard
              </Button>
            </Link>
          </div>

          {/* Quick Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-700 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest-600" /> OpenAQ Station Measurements
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest-600" /> Open-Meteo 72h Forecasts
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest-600" /> OSRM Geospatial Routing
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
