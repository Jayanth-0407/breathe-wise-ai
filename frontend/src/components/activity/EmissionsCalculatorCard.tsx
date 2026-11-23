'use client';

import React from 'react';
import { Leaf } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmissionCalculation } from '@/lib/types';

interface EmissionsCalculatorCardProps {
  calcDistance: number;
  setCalcDistance: (dist: number) => void;
  activeMode: string;
  setActiveMode: (mode: string) => void;
  replacedMode: string;
  setReplacedMode: (mode: string) => void;
  emissionsResult: EmissionCalculation | null;
}

export function EmissionsCalculatorCard({
  calcDistance,
  setCalcDistance,
  activeMode,
  setActiveMode,
  replacedMode,
  setReplacedMode,
  emissionsResult,
}: EmissionsCalculatorCardProps) {
  return (
    <Card className="border-forest-200 shadow-sm">
      <CardHeader className="bg-forest-50/50 border-b border-forest-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-forest-600" />
            <CardTitle className="text-base text-slate-900">
              Low-Emission Transport Calculator
            </CardTitle>
          </div>
          <Badge variant="success">Documented DEFRA Factors</Badge>
        </div>
        <CardDescription>
          Calculate exact emissions prevented by choosing active mobility over motor vehicle transit.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Trip Distance: <span className="text-forest-700 text-sm">{calcDistance} km</span>
            </label>
            <span className="text-xs text-slate-400">Short Urban Commute</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="30"
            step="0.5"
            value={calcDistance}
            onChange={(e) => setCalcDistance(parseFloat(e.target.value))}
            className="w-full accent-forest-600 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Your Active Mode
            </label>
            <select
              value={activeMode}
              onChange={(e) => setActiveMode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="walking">Walking</option>
              <option value="jogging">Jogging / Running</option>
              <option value="cycling">Bicycle / Cycle</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Replaced Vehicle
            </label>
            <select
              value={replacedMode}
              onChange={(e) => setReplacedMode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="petrol_car">Average Petrol Car</option>
              <option value="diesel_car">Diesel Passenger Car</option>
              <option value="auto_rickshaw">CNG Auto-Rickshaw</option>
              <option value="motorbike">Two-Wheeler Motorbike</option>
            </select>
          </div>
        </div>

        {emissionsResult && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-medium block">Avoided Greenhouse Gas</span>
                <span className="text-xl font-black text-emerald-900 block pt-1">
                  {emissionsResult.co2e_saved_kg} <span className="text-xs font-normal">kg CO2e</span>
                </span>
                <span className="text-[10px] text-emerald-700 block mt-1">Global warming dividend</span>
              </div>

              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                <span className="text-[11px] text-blue-800 font-medium block">Avoided Exhaust PM2.5</span>
                <span className="text-xl font-black text-blue-900 block pt-1">
                  {emissionsResult.local_pm25_avoided_grams} <span className="text-xs font-normal">grams</span>
                </span>
                <span className="text-[10px] text-blue-700 block mt-1">Direct street air toxics</span>
              </div>

              <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200">
                <span className="text-[11px] text-purple-800 font-medium block">Avoided Nitrogen Oxides</span>
                <span className="text-xl font-black text-purple-900 block pt-1">
                  {emissionsResult.local_nox_avoided_grams} <span className="text-xs font-normal">grams</span>
                </span>
                <span className="text-[10px] text-purple-700 block mt-1">Smog precursor gas</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
              <p>{emissionsResult.comparative_context}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
