'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Wind, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Flame, 
  Heart,
  AlertTriangle,
  Fan,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { IndoorWorkout } from '@/lib/types';

export default function IndoorPage() {
  const [category, setCategory] = useState<string>('all');
  const [routines, setRoutines] = useState<IndoorWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndoorRoutines = async () => {
      setLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/v1/indoor-workouts`);
        if (res.ok) {
          const data = await res.json();
          setRoutines(data.routines || []);
        }
      } catch (e) {
        console.error('Failed to load indoor workouts:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchIndoorRoutines();
  }, []);

  const categories = ['all', 'Indoor Walking', 'Yoga & Stretching', 'Low-Impact Cardio', 'Bodyweight Fitness'];

  const filtered = category === 'all' 
    ? routines 
    : routines.filter((r) => r.category.toLowerCase().includes(category.toLowerCase().split(' ')[0]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold">
          <Home className="w-3.5 h-3.5 text-purple-700" />
          Clean-Air Indoor Exercise Sanctuary
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Indoor Exercise Alternatives
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          When outdoor air quality is unhealthy, protect your respiratory tract without sacrificing physical fitness. Tailored workouts and HEPA-filtered indoor protocols.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
              category === cat
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Routines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <Card key={item.id} className="hover:border-purple-300 transition-all flex flex-col justify-between">
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
              <a href="/activity" className="font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1">
                Log Session <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </Card>
        ))}
      </div>

      {/* Practical Indoor Clean Air Protocol Card */}
      <Card className="bg-gradient-to-r from-slate-50 to-white border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-forest-600" />
            <CardTitle className="text-base text-slate-900">
              Indoor Air Quality & HEPA Filtration Guidelines
            </CardTitle>
          </div>
          <CardDescription>
            Grounded in US EPA and WHO indoor air quality standards.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-700">
            <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">1. EPA Clean Air Delivery Rate (CADR) 2/3 Rule</strong>
              <p>
                When purchasing a HEPA air purifier for your exercise room, ensure the Smoke CADR (in CFM) is at least <strong>two-thirds (2/3)</strong> of the room’s floor area in square feet. (e.g. A 150 sq ft room requires at least 100 CFM CADR).
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">2. Natural Ventilation Timing</strong>
              <p>
                Never open windows during morning thermal inversions (6:00 AM – 9:00 AM). If indoor CO2 builds up, ventilate strictly during early afternoon (1:00 PM – 4:00 PM) when atmospheric mixing drops outdoor particulate concentrations.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">3. Eliminate Indoor Particulate Sources</strong>
              <p>
                Avoid lighting incense, dhoop, scented candles, or frying foods without exhaust ventilation. In enclosed rooms, incense burning can generate PM2.5 concentrations exceeding 400 µg/m³.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">4. Wet Mopping Over Dry Sweeping</strong>
              <p>
                Exercise movements resuspend coarse dust from floors into your breathing zone. Wet mop workout areas with water or a damp microfiber cloth instead of dry sweeping.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
