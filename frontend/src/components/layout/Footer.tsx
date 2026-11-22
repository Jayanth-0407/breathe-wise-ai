import React from 'react';
import { ShieldCheck, Info, HeartPulse } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-forest-500"></span>
              BreatheWise AI
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A scientifically responsible mobility and fitness assistant. Empowering urban residents to reduce particulate matter exposure, plan cleaner commuting and running routes, and maintain daily fitness without compromising respiratory health.
            </p>
            <div className="flex items-center gap-2 text-xs text-forest-400 bg-slate-800/80 px-3 py-1.5 rounded-md inline-flex border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-forest-400" />
              <span>WCAG 2.2 AA Accessible • Non-color-only AQI Communication</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Environmental Data</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 hover:text-slate-200 transition">
                <span>OpenAQ Global Stations</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-200 transition">
                <span>Open-Meteo Air Quality Models</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-200 transition">
                <span>CPCB / US EPA NAQI Standards</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-200 transition">
                <span>OpenStreetMap & OSRM Engine</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Health & Governance</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 hover:text-slate-200 transition">
                <span>WHO Air Quality Guidelines 2021</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-200 transition">
                <span>Strict Privacy: Minimal Health Retention</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-200 transition">
                <span>No Unsupported Medical Diagnosis</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-200 transition">
                <span>Transparent Scientific Proxies</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} BreatheWise AI. Built for urban health resilience.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> Grounded in Environmental Health Science
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-400" /> Routing proxies are comparative estimates
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
