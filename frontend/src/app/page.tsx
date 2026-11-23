import React from 'react';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingFeatureGrid } from '@/components/landing/LandingFeatureGrid';
import { LandingScientificDisclaimer } from '@/components/landing/LandingScientificDisclaimer';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function HomePage() {
  return (
    <ErrorBoundary fallbackTitle="Home Rendering Error" fallbackMessage="Unable to render welcome page.">
      <div className="flex flex-col">
        <LandingHero />
        <LandingFeatureGrid />
        <LandingScientificDisclaimer />
      </div>
    </ErrorBoundary>
  );
}
