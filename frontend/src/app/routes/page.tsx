'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Navigation, 
  TreePine, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Bookmark, 
  Share2, 
  Info, 
  CheckCircle2, 
  RefreshCw, 
  Target, 
  Flame, 
  ArrowRight,
  Search
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RouteAlternative, UserProfile } from '@/lib/types';
import { DEFAULT_USER_PROFILE } from '@/lib/api';
import { resolveLocationCoordinates } from '@/lib/cities';

// Dynamically import RouteMap with SSR disabled (MapLibre requires window/WebGL)
const RouteMap = dynamic(() => import('@/components/map/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] lg:h-[550px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium">
      Loading Interactive Map...
    </div>
  ),
});

export interface LocationPresetItem {
  name: string;
  city: string;
  coords: [number, number];
}

const LOCATION_PRESETS: LocationPresetItem[] = [
  // Chennai (Default)
  { name: 'Marina Beach Promenade', city: 'Chennai', coords: [13.0500, 80.2824] },
  { name: 'Besant Nagar & Elliot Beach', city: 'Chennai', coords: [13.0001, 80.2718] },
  { name: 'Semmozhi Poonga Botanical', city: 'Chennai', coords: [13.0483, 80.2520] },
  { name: 'Anna Nagar Tower Park', city: 'Chennai', coords: [13.0850, 80.2100] },
  { name: 'Guindy National Park Perimeter', city: 'Chennai', coords: [13.0067, 80.2206] },

  // Delhi NCR
  { name: 'Lodhi Gardens & Environs', city: 'Delhi NCR', coords: [28.5933, 77.2197] },
  { name: 'Central Ridge Forest', city: 'Delhi NCR', coords: [28.6015, 77.1720] },
  { name: 'Nehru Park & Chanakyapuri', city: 'Delhi NCR', coords: [28.5900, 77.1950] },

  // Mumbai
  { name: 'Marine Drive Promenade', city: 'Mumbai', coords: [18.9438, 72.8234] },
  { name: 'Bandstand & Coastal', city: 'Mumbai', coords: [19.0436, 72.8194] },
  { name: 'Shivaji Park Circuit', city: 'Mumbai', coords: [19.0269, 72.8384] },

  // Bengaluru
  { name: 'Cubbon Park Loop', city: 'Bengaluru', coords: [12.9760, 77.5929] },
  { name: 'Lalbagh Botanical Garden', city: 'Bengaluru', coords: [12.9507, 77.5848] },
  { name: 'Sankey Tank Promenade', city: 'Bengaluru', coords: [13.0094, 77.5744] },
];

const P2P_PRESETS = [
  {
    name: 'Chennai: Marina Beach to Santhome',
    city: 'Chennai',
    origin: [13.0500, 80.2824] as [number, number],
    dest: [13.0336, 80.2785] as [number, number],
  },
  {
    name: 'Chennai: Besant Nagar to Thiruvanmiyur',
    city: 'Chennai',
    origin: [13.0001, 80.2718] as [number, number],
    dest: [12.9830, 80.2670] as [number, number],
  },
  {
    name: 'Delhi: Connaught Place to India Gate',
    city: 'Delhi NCR',
    origin: [28.6315, 77.2167] as [number, number],
    dest: [28.6129, 77.2295] as [number, number],
  },
  {
    name: 'Mumbai: Bandstand to Carter Road',
    city: 'Mumbai',
    origin: [19.0436, 72.8194] as [number, number],
    dest: [19.0660, 72.8250] as [number, number],
  },
];

export default function RoutesPage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [activeCity, setActiveCity] = useState<string>('Chennai');
  const [routeMode, setRouteMode] = useState<'loop' | 'point_to_point'>('loop');
  
  // Jogging Loop State - user typed distance
  const [targetGoalKm, setTargetGoalKm] = useState<number>(5.0);
  const [goalInput, setGoalInput] = useState<string>('5.0');
  const [selectedLocation, setSelectedLocation] = useState<LocationPresetItem>(LOCATION_PRESETS[0]);
  const [searchLocationQuery, setSearchLocationQuery] = useState<string>('');
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  
  // Point to Point State
  const [selectedP2P, setSelectedP2P] = useState(P2P_PRESETS[0]);

  const [activityType, setActivityType] = useState<'jogging' | 'walking'>('jogging');
  const [routes, setRoutes] = useState<RouteAlternative[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('loop-1');
  const [loading, setLoading] = useState<boolean>(true);
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  useEffect(() => {
    // 1. Restore typed goal if previously set by user
    const savedGoal = localStorage.getItem('breathewise_target_goal_km');
    if (savedGoal) {
      const parsedGoal = parseFloat(savedGoal);
      if (!isNaN(parsedGoal) && parsedGoal > 0) {
        setTargetGoalKm(parsedGoal);
        setGoalInput(parsedGoal.toString());
      }
    }

    // 2. Load user profile for health and city context
    let currentCity = 'Chennai';
    const saved = localStorage.getItem('breathewise_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        if (parsed.default_city) {
          currentCity = parsed.default_city;
          setActiveCity(parsed.default_city);
        }
      } catch (e) {}
    }

    // 3. Restore last chosen location if available and matches active city
    const savedLoc = localStorage.getItem('breathewise_active_route_location');
    if (savedLoc) {
      try {
        const parsedLoc = JSON.parse(savedLoc);
        if (parsedLoc && parsedLoc.coords) {
          setSelectedLocation(parsedLoc);
          return;
        }
      } catch (e) {}
    }

    // Otherwise default to first preset matching the user's city
    const matched = LOCATION_PRESETS.find(
      (p) => p.city.toLowerCase() === currentCity.toLowerCase()
    );
    if (matched) {
      setSelectedLocation(matched);
    }
  }, []);

  const fetchJoggingLoops = async (origin: [number, number], goalKm: number) => {
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/routes/jogging-loop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_lat: origin[0],
          origin_lon: origin[1],
          target_distance_km: goalKm,
          activity_type: activityType,
          has_asthma: profile.has_asthma,
          age_group: profile.age_group,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRoutes(data.loops || []);
        if (data.loops && data.loops.length > 0) {
          setSelectedRouteId(data.loops[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load jogging loops:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchP2PRoutes = async (origin: [number, number], dest: [number, number]) => {
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/routes/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_lat: origin[0],
          origin_lon: origin[1],
          destination_lat: dest[0],
          destination_lon: dest[1],
          activity_type: activityType,
          has_asthma: profile.has_asthma,
          age_group: profile.age_group,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRoutes(data.routes || []);
        if (data.routes && data.routes.length > 0) {
          setSelectedRouteId(data.routes[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load point-to-point routes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeMode === 'loop') {
      fetchJoggingLoops(selectedLocation.coords, targetGoalKm);
    } else {
      fetchP2PRoutes(selectedP2P.origin, selectedP2P.dest);
    }
  }, [routeMode, selectedLocation, targetGoalKm, selectedP2P, activityType]);

  const handleSelectLocation = (loc: LocationPresetItem) => {
    setSelectedLocation(loc);
    localStorage.setItem('breathewise_active_route_location', JSON.stringify(loc));
  };

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchLocationQuery.trim();
    if (!query) return;
    setIsSearchingLocation(true);
    try {
      // 1. Direct match in active city's presets (e.g. "anna nagar" matches "Anna Nagar Tower Park")
      const cleanQ = query.toLowerCase();
      const matchedPreset = LOCATION_PRESETS.find(
        (p) =>
          p.city.toLowerCase() === activeCity.toLowerCase() &&
          (p.name.toLowerCase().includes(cleanQ) || cleanQ.includes(p.name.toLowerCase().split(' ')[0]))
      );
      if (matchedPreset) {
        handleSelectLocation(matchedPreset);
        setSearchLocationQuery('');
        return;
      }

      // 2. Intelligent landmark, neighborhood & OpenStreetMap address resolution
      const resolved = await resolveLocationCoordinates(query, activeCity);
      if (resolved) {
        const customLoc: LocationPresetItem = {
          name: resolved.name,
          city: activeCity,
          coords: [resolved.lat, resolved.lon],
        };
        handleSelectLocation(customLoc);
        setSearchLocationQuery('');
      } else {
        alert(`Could not find coordinates for "${query}". Try a nearby street or landmark.`);
      }
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const mapOrigin = routeMode === 'loop' ? selectedLocation.coords : selectedP2P.origin;
  const mapDest = routeMode === 'loop' ? selectedLocation.coords : selectedP2P.dest;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold">
            <Target className="w-3.5 h-3.5 text-forest-600" />
            Fitness-Driven Geospatial Routing
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Pollution-Aware Route Planner
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Find the lowest-exposure jogging loop that fulfills your daily distance goal, avoiding heavy traffic corridors and maximizing tree canopies.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setRouteMode('loop')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              routeMode === 'loop'
                ? 'bg-forest-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Daily Goal Loop
          </button>
          <button
            onClick={() => setRouteMode('point_to_point')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              routeMode === 'point_to_point'
                ? 'bg-forest-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Point-to-Point
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {routeMode === 'loop' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Location selector (5 cols) */}
            <div className="md:col-span-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Starting Spot ({activeCity})
                </label>
                {/* Active City Switcher */}
                <div className="flex items-center gap-1">
                  {['Chennai', 'Delhi NCR', 'Mumbai', 'Bengaluru'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setActiveCity(c);
                        const firstInCity = LOCATION_PRESETS.find((p) => p.city.toLowerCase() === c.toLowerCase());
                        if (firstInCity) {
                          handleSelectLocation(firstInCity);
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                        activeCity.toLowerCase() === c.toLowerCase()
                          ? 'bg-forest-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets strictly for the active city */}
              <div className="flex flex-wrap gap-1.5">
                {LOCATION_PRESETS.filter(
                  (loc) => loc.city.toLowerCase() === activeCity.toLowerCase()
                ).map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedLocation.name === loc.name
                        ? 'bg-forest-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>

              {/* Custom Starting Spot Search in active city */}
              <form onSubmit={handleSearchLocation} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder={`Search starting spot in ${activeCity}...`}
                  value={searchLocationQuery}
                  onChange={(e) => setSearchLocationQuery(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-forest-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  disabled={isSearchingLocation}
                  className="text-xs px-2.5 py-1.5 h-auto gap-1"
                >
                  <Search className="w-3 h-3" />
                  {isSearchingLocation ? '...' : 'Find'}
                </Button>
              </form>
            </div>

            {/* Daily Goal Distance Typed Input (4 cols) */}
            <div className="md:col-span-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-forest-600" />
                  Target Daily Distance
                </label>
                <span className="text-xs font-extrabold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200">
                  {targetGoalKm} km goal
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="30.0"
                    value={goalInput}
                    onChange={(e) => {
                      const str = e.target.value;
                      setGoalInput(str);
                      const num = parseFloat(str);
                      if (!isNaN(num) && num >= 0.5 && num <= 30.0) {
                        setTargetGoalKm(num);
                        localStorage.setItem('breathewise_target_goal_km', num.toString());
                      }
                    }}
                    onBlur={() => {
                      const num = parseFloat(goalInput);
                      if (isNaN(num) || num < 0.5) {
                        setGoalInput('5.0');
                        setTargetGoalKm(5.0);
                        localStorage.setItem('breathewise_target_goal_km', '5.0');
                      }
                    }}
                    placeholder="e.g. 5.0"
                    className="w-full px-3 py-1.5 pr-8 text-xs font-bold border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-forest-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    km
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[3.0, 5.0, 7.5, 10.0].map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => {
                        setGoalInput(km.toString());
                        setTargetGoalKm(km);
                        localStorage.setItem('breathewise_target_goal_km', km.toString());
                      }}
                      className={`px-2 py-1.5 rounded-md text-xs font-bold transition border ${
                        targetGoalKm === km
                          ? 'bg-forest-600 text-white border-forest-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {km}k
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Type any distance above. Routes are street-snapped to match this goal.
              </p>
            </div>

            {/* Activity Pace Switcher (3 cols) */}
            <div className="md:col-span-3 space-y-2.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Activity Pace
              </label>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                {(['jogging', 'walking'] as const).map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => setActivityType(act)}
                    className={`flex-1 py-1 text-xs font-bold capitalize rounded-md transition ${
                      activityType === act
                        ? 'bg-white text-forest-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Point-to-Point Urban Corridors ({activeCity})
              </span>
              <div className="flex flex-wrap gap-2">
                {P2P_PRESETS.filter(
                  (p) => !p.city || p.city.toLowerCase() === activeCity.toLowerCase()
                ).map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setSelectedP2P(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedP2P.name === preset.name
                        ? 'bg-forest-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
                    <strong>{targetGoalKm} km</strong> daily target ({selectedRoute.goal_fulfillment_pct}% fulfilled)
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
      </div>
    </div>
  );
}
