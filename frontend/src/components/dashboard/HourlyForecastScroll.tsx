'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { HourlyForecast } from '@/lib/types';
import { formatAQICategory } from '@/lib/utils';

interface HourlyForecastScrollProps {
  forecast: HourlyForecast[];
}

export function HourlyForecastScroll({ forecast }: HourlyForecastScrollProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-forest-600" />
              24-Hour Diurnal AQI Forecast
            </CardTitle>
            <CardDescription>
              Hourly particulate trends driven by planetary boundary layer mixing and traffic patterns.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2.5 min-w-[700px]">
            {forecast.slice(0, 14).map((item, idx) => {
              const itemAqi = formatAQICategory(item.aqi);
              return (
                <div
                  key={idx}
                  className="flex-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex flex-col items-center text-center space-y-1.5"
                >
                  <span className="text-[11px] font-semibold text-slate-500">
                    {item.time.includes('T') ? item.time.split('T')[1].slice(0, 5) : item.time}
                  </span>
                  <span className={`text-base font-extrabold ${itemAqi.badgeText}`}>
                    {item.aqi}
                  </span>
                  <div
                    className="w-full h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        item.aqi <= 50 ? '#10b981' : item.aqi <= 100 ? '#f59e0b' : item.aqi <= 150 ? '#f97316' : '#ef4444',
                    }}
                  />
                  <span className="text-[10px] text-slate-500">{item.temperature}°C</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
