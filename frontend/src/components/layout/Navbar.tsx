'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import { 
  Wind, 
  MapPin, 
  Clock, 
  Home, 
  Activity, 
  Bot, 
  User, 
  Sparkles,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Wind },
  { name: 'Routes', href: '/routes', icon: MapPin },
  { name: 'Best Time', href: '/best-time', icon: Clock },
  { name: 'Indoor Workouts', href: '/indoor', icon: Home },
  { name: 'Activity & Impact', href: '/activity', icon: Activity },
  { name: 'AI Assistant', href: '/assistant', icon: Bot },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-forest-600 flex items-center justify-center text-white shadow-sm shadow-forest-200 group-hover:bg-forest-700 transition">
              <Wind className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                BreatheWise <span className="text-forest-600 font-extrabold text-sm uppercase px-1.5 py-0.5 rounded bg-forest-50 border border-forest-200">AI</span>
              </span>
              <p className="text-[11px] text-slate-700 font-medium leading-none">Pollution-Aware Mobility</p>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-forest-50 text-forest-800 font-semibold border border-forest-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-forest-600" : "text-slate-400")} />
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/onboarding"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-forest-50 text-forest-700 border border-forest-200 hover:bg-forest-100 transition"
              title="Personalize your health vulnerabilities and fitness goals"
            >
              <Sparkles className="w-3.5 h-3.5 text-forest-600" />
              Onboarding
            </a>
            <a
              href="/profile"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
              title="Profile & Privacy Settings"
              aria-label="Profile and Privacy Settings"
            >
              <User className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium",
                  isActive
                    ? "bg-forest-50 text-forest-800 font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-forest-600" : "text-slate-400")} />
                {item.name}
              </a>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <a
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-forest-600 text-white"
            >
              Start Onboarding
            </a>
            <a
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg border border-slate-200 text-slate-700"
              aria-label="Profile"
            >
              <User className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
