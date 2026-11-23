'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatAQICategory } from '@/lib/utils';
import { useDashboardData } from '@/hooks/useDashboardData';
import { LocationSelectorBanner } from '@/components/dashboard/LocationSelectorBanner';
import { CurrentAirQualityWidget } from '@/components/dashboard/CurrentAirQualityWidget';
import { HourlyForecastScroll } from '@/components/dashboard/HourlyForecastScroll';
import { HealthAdvisoryPanel } from '@/components/dashboard/HealthAdvisoryPanel';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const StationMap = dynamic(() => import('@/components/map/StationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
      Loading Atmospheric Map...
    </div>
  ),
});

export default function DashboardPage() {
  const {
    selectedCity,
    cityInput,
    setCityInput,
    profile,
    liveData,
    forecast,
    refreshing,
    searching,
    handleCityChange,
    handleRefresh,
    handleSearchCity,
    handleUseGPS,
  } = useDashboardData();

  const aqiInfo = formatAQICategory(liveData?.aqi || 60);

  return (
    <ErrorBoundary fallbackTitle="Dashboard Load Error" fallbackMessage="Unable to render atmospheric dashboard.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Banner: Location Selector */}
        <LocationSelectorBanner
          selectedCity={selectedCity}
          handleCityChange={handleCityChange}
          cityInput={cityInput}
          setCityInput={setCityInput}
          searching={searching}
          handleSearchCity={handleSearchCity}
          handleUseGPS={handleUseGPS}
          refreshing={refreshing}
          handleRefresh={handleRefresh}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1 & 2: Primary Air Quality & Map & Forecast */}
          <div className="lg:col-span-2 space-y-6">
            <CurrentAirQualityWidget selectedCity={selectedCity} liveData={liveData} />

            {/* Interactive Atmospheric Station Map */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Live Atmospheric Station Map
                  </CardTitle>
                  <CardDescription>
                    Geographic monitoring station & ambient conditions for <strong className="text-slate-800">{selectedCity.name}</strong>.
                  </CardDescription>
                </div>
                <Link href="/routes">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 shadow-xs">
                    Plan Routes <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-3">
                <StationMap
                  lat={selectedCity.lat}
                  lon={selectedCity.lon}
                  cityName={selectedCity.name}
                  aqi={liveData?.aqi || 50}
                  category={liveData?.category || aqiInfo.label}
                  dominantPollutant={liveData?.dominant_pollutant || 'PM2.5'}
                />
              </CardContent>
            </Card>

            {/* 24-Hour Diurnal Forecast Trend */}
            <HourlyForecastScroll forecast={forecast} />
          </div>

          {/* Col 3: Sidebar Health Guidance */}
          <HealthAdvisoryPanel liveData={liveData} profile={profile} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
