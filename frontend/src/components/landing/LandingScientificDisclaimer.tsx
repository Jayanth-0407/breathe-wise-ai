'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function LandingScientificDisclaimer() {
  return (
    <section className="bg-slate-100/80 border-y border-slate-200 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm text-slate-600">
            <h4 className="text-base font-bold text-slate-900">Responsible Scientific Communication</h4>
            <p className="leading-relaxed">
              BreatheWise AI treats greenery and traffic proximity as <em>proxy indicators</em>, not direct street-level microclimate monitors. We never diagnose medical conditions or label outdoor routes as completely safe during severe pollution events. Always consult a healthcare provider for medical advice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
