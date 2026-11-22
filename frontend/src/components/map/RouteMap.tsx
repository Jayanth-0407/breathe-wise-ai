'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RouteAlternative } from '@/lib/types';

interface RouteMapProps {
  routes: RouteAlternative[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  origin: [number, number]; // [lat, lon]
  destination: [number, number]; // [lat, lon]
}

export default function RouteMap({
  routes,
  selectedRouteId,
  onSelectRoute,
  origin,
  destination,
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);
  
  // Track currently active layer and source IDs to clean up previous routes cleanly
  const activeLayerIds = useRef<string[]>([]);
  const routesRef = useRef<RouteAlternative[]>(routes);
  const selectedRouteIdRef = useRef<string>(selectedRouteId);

  // Keep refs synchronized with latest props
  routesRef.current = routes;
  selectedRouteIdRef.current = selectedRouteId;

  // Initialize MapLibre GL map ONCE on mount
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [origin[1], origin[0]],
      zoom: 13.5,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    mapInstance.current = map;

    // Start Marker (Runner icon)
    const originEl = document.createElement('div');
    originEl.className =
      'w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-xs text-white font-extrabold cursor-pointer transition-transform transform hover:scale-110';
    originEl.innerHTML = '<span>🏃</span>';
    originEl.title = 'Jogging Starting Point';
    const mOrigin = new maplibregl.Marker({ element: originEl })
      .setLngLat([origin[1], origin[0]])
      .addTo(map);
    originMarkerRef.current = mOrigin;

    map.on('load', () => {
      renderRouteLayers(map, routesRef.current, selectedRouteIdRef.current, origin);
    });

    return () => {
      if (originMarkerRef.current) originMarkerRef.current.remove();
      if (destMarkerRef.current) destMarkerRef.current.remove();
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update Origin and Destination markers & pan map when location changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Update origin pin position
    if (originMarkerRef.current) {
      originMarkerRef.current.setLngLat([origin[1], origin[0]]);
    }

    // Handle destination marker for point-to-point mode
    const isLoop =
      Math.abs(origin[0] - destination[0]) < 0.0001 &&
      Math.abs(origin[1] - destination[1]) < 0.0001;

    if (!isLoop) {
      if (!destMarkerRef.current) {
        const destEl = document.createElement('div');
        destEl.className =
          'w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-xs text-white font-extrabold cursor-pointer transition-transform transform hover:scale-110';
        destEl.innerHTML = '<span>🏁</span>';
        destEl.title = 'Finish Point';
        destMarkerRef.current = new maplibregl.Marker({ element: destEl })
          .setLngLat([destination[1], destination[0]])
          .addTo(map);
      } else {
        destMarkerRef.current.setLngLat([destination[1], destination[0]]);
      }
    } else if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }

    // Pan smoothly to new starting point if no routes yet
    if (routes.length === 0) {
      map.flyTo({ center: [origin[1], origin[0]], zoom: 13.5, essential: true });
    }
  }, [origin[0], origin[1], destination[0], destination[1]]);

  // Redraw route polylines when routes or selected route changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (map.isStyleLoaded()) {
      renderRouteLayers(map, routes, selectedRouteId, origin);
    } else {
      map.once('load', () => {
        renderRouteLayers(map, routes, selectedRouteId, origin);
      });
    }
  }, [routes, selectedRouteId]);

  const renderRouteLayers = (
    map: maplibregl.Map,
    routeList: RouteAlternative[],
    selectedId: string,
    currentOrigin: [number, number]
  ) => {
    // 1. Remove all previously added route layers & sources
    activeLayerIds.current.forEach((id) => {
      if (map.getLayer(`layer-${id}`)) map.removeLayer(`layer-${id}`);
      if (map.getSource(`source-${id}`)) map.removeSource(`source-${id}`);
    });
    activeLayerIds.current = [];

    if (!routeList || routeList.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([currentOrigin[1], currentOrigin[0]]);

    // Render unselected routes first, then the selected route on top
    const sorted = [...routeList].sort((a, b) => (a.id === selectedId ? 1 : -1));

    sorted.forEach((route) => {
      const isSelected = route.id === selectedId;
      const coords = route.coordinates;

      if (!coords || coords.length === 0) return;

      coords.forEach((coord) => bounds.extend(coord as [number, number]));

      let color = '#2563eb'; // Blue - Fastest
      if (route.tag === 'Lowest Exposure') color = '#059669'; // Emerald
      else if (route.tag === 'Greenest') color = '#047857'; // Deep forest

      map.addSource(`source-${route.id}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { id: route.id, name: route.name },
          geometry: {
            type: 'LineString',
            coordinates: coords,
          },
        },
      });

      map.addLayer({
        id: `layer-${route.id}`,
        type: 'line',
        source: `source-${route.id}`,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': color,
          'line-width': isSelected ? 5.5 : 3.0,
          'line-opacity': isSelected ? 0.95 : 0.45,
        },
      });

      map.on('click', `layer-${route.id}`, () => {
        onSelectRoute(route.id);
      });

      activeLayerIds.current.push(route.id);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 15.5,
        duration: 900,
      });
    }
  };

  return (
    <div className="relative w-full h-[450px] lg:h-[550px] rounded-xl overflow-hidden border border-slate-200 shadow-xs">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-3 z-10 pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Lowest Exposure
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-forest-800"></span> Greenest
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Fastest
        </span>
      </div>
    </div>
  );
}
