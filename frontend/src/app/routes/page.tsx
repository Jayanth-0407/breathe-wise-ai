'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Target, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useRoutesPlanner } from '@/hooks/useRoutesPlanner';
import { RouteControls } from '@/components/routes/RouteControls';
import { RouteCardsList } from '@/components/routes/RouteCardsList';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const RouteMap = dynamic(() => import('@/components/map/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] lg:h-[550px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium">
      Loading Interactive Map...
    </div>
  ),
});

export default function RoutesPage() {
  const {
    routeMode,
    setRouteMode,
    activeCity,
    setActiveCity,
    selectedLocation,
    handleSelectLocation,
    searchLocationQuery,
    setSearchLocationQuery,
    isSearchingLocation,
    handleSearchLocation,
    targetGoalKm,
    goalInput,
    handleGoalChange,
    handleGoalBlur,
    handleGoalPreset,
    activityType,
    setActivityType,
    selectedP2P,
    setSelectedP2P,
    routes,
    selectedRoute,
    selectedRouteId,
    setSelectedRouteId,
    bookmarked,
    setBookmarked,
    mapOrigin,
    mapDest,
  } = useRoutesPlanner();

  return (
    <ErrorBoundary fallbackTitle="Route Planner Error" fallbackMessage="Could not load the interactive route canvas.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <RouteControls
          routeMode={routeMode}
          setRouteMode={setRouteMode}
          activeCity={activeCity}
          setActiveCity={setActiveCity}
          selectedLocation={selectedLocation}
          handleSelectLocation={handleSelectLocation}
          searchLocationQuery={searchLocationQuery}
          setSearchLocationQuery={setSearchLocationQuery}
          isSearchingLocation={isSearchingLocation}
          handleSearchLocation={handleSearchLocation}
          targetGoalKm={targetGoalKm}
          goalInput={goalInput}
          handleGoalChange={handleGoalChange}
          handleGoalBlur={handleGoalBlur}
          handleGoalPreset={handleGoalPreset}
          activityType={activityType}
          setActivityType={setActivityType}
          selectedP2P={selectedP2P}
          setSelectedP2P={setSelectedP2P}
        />

        {/* Main Grid: Interactive Map + Loop Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Map View (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <RouteMap
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              origin={mapOrigin}
              destination={mapDest}
            />

            {/* Goal Fulfillment Banner */}
            {routeMode === 'loop' && selectedRoute && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Daily Jogging Goal Fulfillment
                    </span>
                    <span className="text-xs text-emerald-700">
                      Route Distance: <strong>{selectedRoute.distance_km} km</strong> of your{' '}
                      <strong>{targetGoalKm} km</strong> daily target ({selectedRoute.goal_fulfillment_pct || 100}% fulfilled)
                    </span>
                  </div>
                </div>
                <Badge variant="success" className="text-xs font-bold">
                  Goal Matched
                </Badge>
              </div>
            )}

            {/* Proxy Disclaimer */}
            <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong>Proxy Indicator Disclaimer:</strong> Loops are optimized around parks and low-traffic street classifications. They do not constitute street microclimate sensors. During severe pollution warnings (AQI &gt; 200), prefer indoor alternatives.
              </div>
            </div>
          </div>

          {/* Right Loop Cards View (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <RouteCardsList
              routes={routes}
              selectedRouteId={selectedRouteId}
              setSelectedRouteId={setSelectedRouteId}
              selectedRoute={selectedRoute}
              routeMode={routeMode}
              bookmarked={bookmarked}
              setBookmarked={setBookmarked}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
