export interface UserProfile {
  id?: string;
  user_id: string;
  age_group: 'child' | 'young_adult' | 'adult' | 'senior';
  has_asthma: boolean;
  respiratory_conditions: string[];
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  preferred_activities: string[];
  daily_activity_goal_minutes: number;
  preferred_duration_minutes: number;
  default_city: string;
  default_lat: number;
  default_lon: number;
}

export interface LiveAirQuality {
  aqi: number;
  category: string;
  dominant_pollutant: string;
  pm25?: number;
  pm10?: number;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  wind_direction?: number;
  source: string;
  station_name?: string;
  last_updated: string;
  is_estimated: boolean;
  personalized_guidance: string;
  health_alerts: string[];
}

export interface HourlyForecast {
  time: string;
  aqi: number;
  category: string;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
}

export interface ExerciseWindow {
  window_start: string;
  window_end: string;
  avg_aqi: number;
  category: string;
  recommendation_score: number; // 0-100
  suitability: 'Optimal' | 'Acceptable' | 'Caution' | 'Avoid';
  reason: string;
  weather_summary: string;
}

export interface RouteAlternative {
  id: string;
  name: string;
  tag: 'Lowest Exposure' | 'Greenest' | 'Fastest';
  distance_km: number;
  duration_minutes: number;
  goal_fulfillment_pct?: number;
  exposure_score: number;
  exposure_tier: 'Low' | 'Moderate' | 'Elevated' | 'High';
  traffic_proximity_proxy: 'Low' | 'Moderate' | 'High';
  green_space_proxy: 'Extensive' | 'Moderate' | 'Minimal';
  explanation: string;
  data_uncertainty: string;
  coordinates: [number, number][]; // [lon, lat] for MapLibre
}

export interface IndoorWorkout {
  id: string;
  title: string;
  category: 'Indoor Walking' | 'Yoga & Stretching' | 'Low-Impact Cardio' | 'Bodyweight Fitness';
  duration_minutes: number;
  intensity: 'Low' | 'Medium' | 'High';
  instructions: string[];
  benefits: string;
  clean_air_tips: string[];
}

export interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  duration_minutes: number;
  distance_km: number;
  estimated_aqi?: number;
  exposure_score?: number;
  location_name?: string;
  notes?: string;
  logged_at: string;
}

export interface EmissionCalculation {
  distance_km: number;
  transport_mode: string;
  co2e_saved_grams: number;
  co2e_saved_kg: number;
  local_pm25_avoided_grams: number;
  local_nox_avoided_grams: number;
  explanation: string;
  comparative_context?: string;
  scientific_distinction?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: { title: string; source: string; url?: string }[];
  suggested_actions?: string[];
}
