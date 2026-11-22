import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAQICategory(aqi: number): {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  description: string;
} {
  if (aqi <= 50) {
    return {
      label: "Good",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeText: "text-emerald-700",
      borderColor: "border-emerald-500",
      description: "Air quality is satisfactory, and air pollution poses little or no risk.",
    };
  }
  if (aqi <= 100) {
    return {
      label: "Moderate",
      badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
      badgeText: "text-amber-700",
      borderColor: "border-amber-500",
      description: "Air quality is acceptable; however, sensitive individuals should observe symptoms.",
    };
  }
  if (aqi <= 150) {
    return {
      label: "Unhealthy for Sensitive Groups",
      badgeBg: "bg-orange-50 text-orange-800 border-orange-200",
      badgeText: "text-orange-700",
      borderColor: "border-orange-500",
      description: "Individuals with respiratory or cardiac conditions may experience health effects.",
    };
  }
  if (aqi <= 200) {
    return {
      label: "Unhealthy",
      badgeBg: "bg-red-50 text-red-800 border-red-200",
      badgeText: "text-red-700",
      borderColor: "border-red-500",
      description: "Everyone may begin to experience health effects; sensitive members more seriously.",
    };
  }
  if (aqi <= 300) {
    return {
      label: "Very Unhealthy",
      badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
      badgeText: "text-purple-700",
      borderColor: "border-purple-500",
      description: "Health alert: The risk of health effects is increased for everyone.",
    };
  }
  return {
    label: "Hazardous",
    badgeBg: "bg-rose-950 text-rose-100 border-rose-800",
    badgeText: "text-rose-900",
    borderColor: "border-rose-900",
    description: "Health warning of emergency conditions: entire population is more likely to be affected.",
  };
}
