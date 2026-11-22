import React from 'react';
import { 
  Wind, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  TreePine, 
  Home, 
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-50/60 via-white to-slate-50 border-b border-slate-200/60 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100/80 border border-forest-300 text-forest-800 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-forest-600" />
              <span>Pollution-Aware Fitness & Mobility Assistant</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Breathe Cleaner. <br />
              <span className="text-forest-700 bg-gradient-to-r from-forest-700 to-emerald-600 bg-clip-text text-transparent">
                Move Smarter. Live Healthier.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Navigate urban air pollution with personalized route recommendations, predictive exercise windows, and deterministic exposure estimations tailored to your health vulnerability.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a href="/onboarding">
                <Button size="lg" className="shadow-md shadow-forest-600/20 text-base px-6">
                  Get Started (Personalize)
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" className="text-base px-6">
                  Open Live Dashboard
                </Button>
              </a>
            </div>

            {/* Quick Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-700 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest-600" /> OpenAQ Station Measurements
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest-600" /> Open-Meteo 72h Forecasts
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest-600" /> OSRM Geospatial Routing
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <Badge variant="success">Core Capabilities</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Scientifically Grounded Urban Health Tools
          </h2>
          <p className="text-sm text-slate-600">
            Every calculation is deterministic. We never fabricate AQI values or make unsupported medical claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Card className="hover:border-forest-300 transition-all">
            <CardContent className="space-y-4 pt-6">
              <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-700">
                <Wind className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Live Air Quality Dashboard</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Real-time observational PM2.5, PM10, temperature, and wind dispersion data with standardized CPCB/EPA AQI breakpoints and personalized health guidance.
              </p>
              <a href="/dashboard" className="inline-flex items-center text-xs font-semibold text-forest-700 hover:text-forest-800 gap-1 pt-2">
                View Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="hover:border-forest-300 transition-all">
            <CardContent className="space-y-4 pt-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Route Explorer</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Compare up to 3 OSRM walking/jogging routes scored by green space corridors and proximity to high-emission arterial roads.
              </p>
              <a href="/routes" className="inline-flex items-center text-xs font-semibold text-forest-700 hover:text-forest-800 gap-1 pt-2">
                Explore Routes <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="hover:border-forest-300 transition-all">
            <CardContent className="space-y-4 pt-6">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Best Exercise Windows</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Forecast-driven timing that identifies when diurnal boundary layer dispersion drops particulate levels, avoiding thermal inversions and rush hour.
              </p>
              <a href="/best-time" className="inline-flex items-center text-xs font-semibold text-forest-700 hover:text-forest-800 gap-1 pt-2">
                Find Best Times <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card className="hover:border-forest-300 transition-all">
            <CardContent className="space-y-4 pt-6">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Indoor Workouts & Clean Air</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When ambient conditions are hazardous, maintain aerobic fitness indoors with tailored bodyweight, yoga, and low-impact circuits plus practical HEPA filtration tips.
              </p>
              <a href="/indoor" className="inline-flex items-center text-xs font-semibold text-forest-700 hover:text-forest-800 gap-1 pt-2">
                Indoor Alternatives <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </CardContent>
          </Card>

          {/* Card 5 */}
          <Card className="hover:border-forest-300 transition-all">
            <CardContent className="space-y-4 pt-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Activity & Emission Tracking</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Log daily fitness, monitor estimated inhaled particulate dose, and quantify exact CO2e and localized NOx emissions avoided by active transport.
              </p>
              <a href="/activity" className="inline-flex items-center text-xs font-semibold text-forest-700 hover:text-forest-800 gap-1 pt-2">
                Track Activity <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </CardContent>
          </Card>

          {/* Card 6 */}
          <Card className="hover:border-forest-300 transition-all">
            <CardContent className="space-y-4 pt-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Grounded AI Assistant</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ask questions about respiratory protection, mask efficacy (N95 vs cloth), air purifier sizing, and route decisions backed by WHO and CPCB literature citations.
              </p>
              <a href="/assistant" className="inline-flex items-center text-xs font-semibold text-forest-700 hover:text-forest-800 gap-1 pt-2">
                Chat with Assistant <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Scientific Transparency & Disclaimer Banner */}
      <section className="bg-slate-100/80 border-y border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-600">
              <h4 className="text-base font-bold text-slate-900">Responsible Scientific Communication</h4>
              <p className="leading-relaxed">
                BreatheWise AI treats greenery and traffic proximity as <em>proxy indicators</em>, not direct street-level microclimate monitors. We never diagnose medical conditions or label outdoor routes as completely safe during severe pollution events. Always consult a healthcare provider for medical advice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
