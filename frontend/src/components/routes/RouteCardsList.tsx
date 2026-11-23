'use client';

import React from 'react';
import { Bookmark, ShieldCheck } from 'lucide-react';
import { RouteAlternative } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface RouteCardsListProps {
  routes: RouteAlternative[];
  selectedRouteId: string;
  setSelectedRouteId: (id: string) => void;
  selectedRoute?: RouteAlternative;
  routeMode: 'loop' | 'point_to_point';
  bookmarked: boolean;
  setBookmarked: (val: boolean) => void;
}

export function RouteCardsList({
  routes,
  selectedRouteId,
  setSelectedRouteId,
  selectedRoute,
  routeMode,
  bookmarked,
  setBookmarked,
}: RouteCardsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          {routeMode === 'loop' ? 'Recommended Jogging Circuits' : 'Alternative Paths'} ({routes.length})
        </h3>
        <span className="text-xs text-slate-500">Click to preview on map</span>
      </div>

      {routes.map((route) => {
        const isSelected = route.id === selectedRouteId;
        return (
          <div
            key={route.id}
            onClick={() => setSelectedRouteId(route.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-3 ${
              isSelected
                ? 'border-forest-600 bg-forest-50/40 shadow-sm ring-1 ring-forest-500'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    route.tag === 'Lowest Exposure'
                      ? 'success'
                      : route.tag === 'Greenest'
                      ? 'purple'
                      : 'default'
                  }
                >
                  {route.tag}
                </Badge>
                <span className="text-xs font-bold text-slate-900">{route.name}</span>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {route.duration_minutes} min
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Distance</span>
                <span className="font-bold text-slate-800">{route.distance_km} km</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Exposure Index</span>
                <span className="font-bold text-slate-800">{route.exposure_score}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Greenery Buffer</span>
                <span className="font-bold text-slate-800">{route.green_space_proxy}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {route.explanation}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
              <span>Traffic Proximity: <strong className="text-slate-600">{route.traffic_proximity_proxy}</strong></span>
              <span>Exposure Tier: <strong className="text-slate-600">{route.exposure_tier}</strong></span>
            </div>
          </div>
        );
      })}

      {selectedRoute && (
        <div className="pt-2 flex items-center gap-3">
          <Button
            variant={bookmarked ? 'secondary' : 'outline'}
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={() => setBookmarked(!bookmarked)}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-forest-600 text-forest-600' : ''}`} />
            {bookmarked ? 'Saved to Bookmarked Workouts' : 'Bookmark This Jogging Circuit'}
          </Button>
        </div>
      )}
    </div>
  );
}
