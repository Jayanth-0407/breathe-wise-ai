'use client';

import React from 'react';
import { Thermometer, Wind } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LiveAirQuality } from '@/lib/types';
import { formatAQICategory } from '@/lib/utils';
import { CityPreset } from '@/types/dashboard';

interface CurrentAirQualityWidgetProps {
  selectedCity: CityPreset;
  liveData: LiveAirQuality | null;
}

export function CurrentAirQualityWidget({ selectedCity, liveData }: CurrentAirQualityWidgetProps) {
  const aqiInfo = formatAQICategory(liveData?.aqi || 60);

  return (
    <Card className="border-l-4 overflow-hidden relative" style={{ borderLeftColor: aqiInfo.borderColor }}>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current Atmospheric Condition
            </span>
            <CardTitle className="text-2xl text-slate-900">
              {selectedCity.name}
            </CardTitle>
          </div>
          <Badge className={`text-xs px-3 py-1 font-bold ${aqiInfo.badgeBg}`}>
            {liveData?.category || aqiInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-baseline gap-4">
            <span className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tight">
              {liveData ? liveData.aqi : '--'}
            </span>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Standard AQI
              </span>
              <span className="text-sm font-semibold text-slate-700">
                Dominant: {liveData?.dominant_pollutant || 'PM2.5'}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 max-w-sm space-y-1">
            <strong className="text-slate-900 block font-semibold">Standard Benchmark</strong>
            <p className="leading-relaxed">{aqiInfo.description}</p>
          </div>
        </div>

        {/* Weather & Pollutant Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium block">PM2.5 Concentration</span>
            <span className="text-lg font-bold text-slate-900">
              {liveData?.pm25 ?? '--'} <span className="text-xs font-normal text-slate-500">µg/m³</span>
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium block">PM10 Coarse</span>
            <span className="text-lg font-bold text-slate-900">
              {liveData?.pm10 ?? '--'} <span className="text-xs font-normal text-slate-500">µg/m³</span>
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium block flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temperature
            </span>
            <span className="text-lg font-bold text-slate-900">
              {liveData?.temperature ?? '--'} <span className="text-xs font-normal text-slate-500">°C</span>
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium block flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-blue-500" /> Wind Dispersion
            </span>
            <span className="text-lg font-bold text-slate-900">
              {liveData?.wind_speed ?? '--'} <span className="text-xs font-normal text-slate-500">km/h</span>
            </span>
          </div>
        </div>

        {/* Data Source & Provenance */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Source:</span>
            <span>{liveData?.source || 'Open-Meteo & OpenAQ'}</span>
            {liveData?.is_estimated ? (
              <Badge variant="outline" className="text-[10px] py-0 text-slate-500">
                Model Estimate
              </Badge>
            ) : (
              <Badge variant="success" className="text-[10px] py-0">
                Verified Station
              </Badge>
            )}
          </div>
          <div>
            Last Updated: <span className="font-medium text-slate-700">{liveData?.last_updated || 'Recent'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
