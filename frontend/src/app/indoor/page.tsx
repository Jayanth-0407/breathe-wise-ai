'use client';

import React, { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { IndoorWorkout } from '@/lib/types';
import { IndoorWorkoutCard } from '@/components/indoor/IndoorWorkoutCard';
import { HepaFiltrationGuide } from '@/components/indoor/HepaFiltrationGuide';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const CATEGORIES = ['all', 'Indoor Walking', 'Yoga & Stretching', 'Low-Impact Cardio', 'Bodyweight Fitness'];

export default function IndoorPage() {
  const [category, setCategory] = useState<string>('all');
  const [routines, setRoutines] = useState<IndoorWorkout[]>([]);

  useEffect(() => {
    const fetchIndoorRoutines = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/v1/indoor-workouts`);
        if (res.ok) {
          const data = await res.json();
          setRoutines(data.routines || []);
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchIndoorRoutines();
  }, []);

  const filtered = category === 'all'
    ? routines
    : routines.filter((r) => r.category.toLowerCase().includes(category.toLowerCase().split(' ')[0]));

  return (
    <ErrorBoundary fallbackTitle="Indoor Routines Error" fallbackMessage="Could not load indoor workout routines.">
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
          {CATEGORIES.map((cat) => (
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
            <IndoorWorkoutCard key={item.id} item={item} />
          ))}
        </div>

        {/* Practical Indoor Clean Air Protocol Card */}
        <HepaFiltrationGuide />
      </div>
    </ErrorBoundary>
  );
}
