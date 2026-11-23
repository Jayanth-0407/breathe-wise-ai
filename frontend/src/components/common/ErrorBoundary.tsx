'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Reusable React Class Error Boundary for isolating UI widget failures.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      // Dev diagnostics
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">
              {this.props.fallbackTitle || 'Component Failed to Load'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {this.props.fallbackMessage || 'An unexpected rendering error occurred. You can retry safely without reloading.'}
            </p>
          </div>
          <Button
            onClick={this.handleReset}
            size="sm"
            variant="outline"
            className="text-xs font-semibold gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            Retry Component
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
