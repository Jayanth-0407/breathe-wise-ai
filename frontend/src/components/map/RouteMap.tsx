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
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const centerLon = origin[1];
    const centerLat = origin[0];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
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
      center: [centerLon, centerLat],
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    mapInstance.current = map;

    map.on('load', () => {
      // Start Marker (Clean green pin with runner icon)
      const originEl = document.createElement('div');
      originEl.className = 'w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-extrabold cursor-pointer';
      originEl.innerHTML = '<span>🏃</span>';
      originEl.title = 'Start / Finish Point';
      const mOrigin = new maplibregl.Marker({ element: originEl })
        .setLngLat([origin[1], origin[0]])
        .addTo(map);

      markersRef.current = [mOrigin];

      // If destination is different from origin (point-to-point mode)
      const isLoop = Math.abs(origin[0] - destination[0]) < 0.0001 && Math.abs(origin[1] - destination[1]) < 0.0001;
      if (!isLoop) {
        const destEl = document.createElement('div');
        destEl.className = 'w-7 h-7 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-extrabold cursor-pointer';
        destEl.innerHTML = '<span>🏁</span>';
        destEl.title = 'Finish Point';
        const mDest = new maplibregl.Marker({ element: destEl })
          .setLngLat([destination[1], destination[0]])
          .addTo(map);
        markersRef.current.push(mDest);
      }

      updateRouteLayers(map, routes, selectedRouteId);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.remove();
    };
  }, [origin[0], origin[1], destination[0], destination[1]]);

  useEffect(() => {
    if (!mapInstance.current || !mapInstance.current.isStyleLoaded()) return;
    updateRouteLayers(mapInstance.current, routes, selectedRouteId);
  }, [routes, selectedRouteId]);

  const updateRouteLayers = (
    map: maplibregl.Map,
    routeList: RouteAlternative[],
    selectedId: string
  ) => {
    routeList.forEach((r) => {
      if (map.getLayer(`layer-${r.id}`)) map.removeLayer(`layer-${r.id}`);
      if (map.getSource(`source-${r.id}`)) map.removeSource(`source-${r.id}`);
    });

    if (routeList.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([origin[1], origin[0]]);

    // Render unselected routes first, then the selected route on top
    const sorted = [...routeList].sort((a, b) => (a.id === selectedId ? 1 : -1));

    sorted.forEach((route) => {
      const isSelected = route.id === selectedId;
      const coords = route.coordinates;

      if (!coords || coords.length === 0) return;

      coords.forEach((coord) => bounds.extend(coord as [number, number]));

      let color = '#2563eb'; // Blue
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
          'line-width': isSelected ? 5 : 2.5,
          'line-opacity': isSelected ? 0.95 : 0.40,
        },
      });

      map.on('click', `layer-${route.id}`, () => {
        onSelectRoute(route.id);
      });
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 16 });
    }
  };

  return (
    <div className="relative w-full h-[450px] lg:h-[550px] rounded-xl overflow-hidden border border-slate-200 shadow-xs">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-3 z-10">
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
