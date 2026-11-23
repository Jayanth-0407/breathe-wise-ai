'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export function HepaFiltrationGuide() {
  return (
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
  );
}
