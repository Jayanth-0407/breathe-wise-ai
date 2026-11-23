'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Top-level Next.js App Router Error Boundary.
 * Catches unhandled runtime exceptions in any route and renders a resilient recovery UI.
 */
export default function GlobalErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // In production, log error to an telemetry service if configured
    if (process.env.NODE_ENV === 'development') {
      // Dev diagnostics
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Unexpected Atmospheric Service Interrupt
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            A temporary component error occurred while rendering environmental data. Your local profile and preferences remain safely stored.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-400 bg-slate-50 py-1 px-2 rounded-md">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-forest-600 hover:bg-forest-700 text-white gap-2 text-xs font-bold py-2.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </Button>
          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-slate-300 hover:bg-slate-50 text-slate-700 gap-2 text-xs font-bold py-2.5"
            >
              <Home className="w-3.5 h-3.5" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
