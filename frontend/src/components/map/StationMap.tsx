'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { formatAQICategory } from '@/lib/utils';

interface StationMapProps {
  lat: number;
  lon: number;
  cityName: string;
  aqi?: number;
  category?: string;
  dominantPollutant?: string;
}

export default function StationMap({
  lat,
  lon,
  cityName,
  aqi = 50,
  category = 'Moderate',
  dominantPollutant = 'PM2.5',
}: StationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

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
      center: [lon, lat],
      zoom: 11.5,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    mapInstance.current = map;

    map.on('load', () => {
      renderMarker(map, lat, lon, aqi, cityName, dominantPollutant);
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      map.remove();
    };
  }, []);

  // Update map center and marker when lat/lon or AQI changes
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    map.flyTo({
      center: [lon, lat],
      zoom: 12,
      essential: true,
      duration: 1200,
    });

    renderMarker(map, lat, lon, aqi, cityName, dominantPollutant);
  }, [lat, lon, aqi, cityName, dominantPollutant]);

  const renderMarker = (
    map: maplibregl.Map,
    latitude: number,
    longitude: number,
    currentAqi: number,
    name: string,
    pollutant: string
  ) => {
    if (markerRef.current) {
      markerRef.current.remove();
    }

    const aqiMeta = formatAQICategory(currentAqi);
    const color =
      currentAqi <= 50
        ? '#10b981'
        : currentAqi <= 100
        ? '#f59e0b'
        : currentAqi <= 150
        ? '#f97316'
        : currentAqi <= 200
        ? '#ef4444'
        : '#7f1d1d';

    const el = document.createElement('div');
    el.className = 'group relative cursor-pointer';
    el.innerHTML = `
      <div style="background-color: ${color};" class="w-10 h-10 rounded-full border-3 border-white shadow-xl flex flex-col items-center justify-center text-white font-extrabold text-xs transition-transform transform group-hover:scale-110">
        <span class="leading-none text-[11px] font-black">${currentAqi}</span>
        <span class="text-[8px] opacity-80 leading-none">AQI</span>
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style="background-color: ${color}; opacity: 0.7;"></div>
    `;

    const popupContent = `
      <div style="font-family: system-ui, sans-serif; padding: 4px 6px; min-width: 150px;">
        <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${name}</div>
        <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">Dominant: ${pollutant}</div>
        <div style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; background-color: ${color}20; color: ${color}; border: 1px solid ${color}60;">
          AQI ${currentAqi} • ${aqiMeta.label}
        </div>
      </div>
    `;

    const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(popupContent);

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(map);

    markerRef.current = marker;
  };

  return (
    <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-xs flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-xs font-bold text-slate-800">{cityName}</span>
        <span className="text-[11px] text-slate-500">
          ({lat.toFixed(2)}°, {lon.toFixed(2)}°)
        </span>
      </div>
    </div>
  );
}
