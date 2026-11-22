export interface CityCoordinates {
  name: string;
  lat: number;
  lon: number;
  state?: string;
  country?: string;
}

export const POPULAR_CITIES: CityCoordinates[] = [
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu', country: 'India' },
  { name: 'Delhi NCR', lat: 28.6139, lon: 77.2090, state: 'Delhi', country: 'India' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, state: 'Maharashtra', country: 'India' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, state: 'Karnataka', country: 'India' },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, state: 'Telangana', country: 'India' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'West Bengal', country: 'India' },
  { name: 'Pune', lat: 18.5204, lon: 73.8567, state: 'Maharashtra', country: 'India' },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, state: 'Gujarat', country: 'India' },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'Rajasthan', country: 'India' },
  { name: 'Kochi', lat: 9.9312, lon: 76.2673, state: 'Kerala', country: 'India' },
  { name: 'Chandigarh', lat: 30.7333, lon: 76.7794, state: 'Punjab', country: 'India' },
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'United Kingdom' },
  { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'United States' },
];

export interface LandmarkItem {
  name: string;
  city: string;
  lat: number;
  lon: number;
  aliases: string[];
}

export const POPULAR_LANDMARKS: LandmarkItem[] = [
  // ==================== CHENNAI ====================
  {
    name: 'Anna Nagar Tower Park',
    city: 'Chennai',
    lat: 13.0850,
    lon: 80.2100,
    aliases: ['anna nagar', 'annanagar', 'anna nagar east', 'anna nagar west', 'anna nagar tower', 'roundtana'],
  },
  {
    name: 'T. Nagar (Panagal Park)',
    city: 'Chennai',
    lat: 13.0418,
    lon: 80.2341,
    aliases: ['t nagar', 't. nagar', 't-nagar', 'thyagaraya nagar', 'panagal park', 'pondys bazaar', 'pondy bazaar'],
  },
  {
    name: 'Marina Beach Promenade',
    city: 'Chennai',
    lat: 13.0500,
    lon: 80.2824,
    aliases: ['marina beach', 'marina', 'kamarajar salai', 'triplicane beach', 'chepauk beach'],
  },
  {
    name: 'Besant Nagar & Elliot Beach',
    city: 'Chennai',
    lat: 13.0001,
    lon: 80.2718,
    aliases: ['besant nagar', 'elliots beach', 'elliot beach', 'bessie', 'schmidt memorial'],
  },
  {
    name: 'Adyar & Theosophical Society',
    city: 'Chennai',
    lat: 13.0012,
    lon: 80.2565,
    aliases: ['adyar', 'gandhi nagar adyar', 'theosophical society', 'adyar river', 'maler hospital'],
  },
  {
    name: 'Mylapore & Kapaleeshwarar',
    city: 'Chennai',
    lat: 13.0368,
    lon: 80.2676,
    aliases: ['mylapore', 'kapaleeshwarar', 'luz corner', 'mandaveli', 'san thome', 'santhome'],
  },
  {
    name: 'Semmozhi Poonga Botanical Gardens',
    city: 'Chennai',
    lat: 13.0483,
    lon: 80.2520,
    aliases: ['semmozhi poonga', 'cathedral road', 'gemini flyover', 'anna flyover'],
  },
  {
    name: 'Guindy National Park Perimeter',
    city: 'Chennai',
    lat: 13.0067,
    lon: 80.2206,
    aliases: ['guindy', 'guindy national park', 'iit madras', 'raj bhavan', 'guindy race course'],
  },
  {
    name: 'Velachery Lake & Hub',
    city: 'Chennai',
    lat: 12.9815,
    lon: 80.2180,
    aliases: ['velachery', 'velachery lake', 'phoenix marketcity', 'vijaya nagar velachery'],
  },
  {
    name: 'Nungambakkam & Sterling Road',
    city: 'Chennai',
    lat: 13.0569,
    lon: 80.2425,
    aliases: ['nungambakkam', 'sterling road', 'loyola college', 'valluvar kottam'],
  },
  {
    name: 'Alwarpet & TTK Road',
    city: 'Chennai',
    lat: 13.0334,
    lon: 80.2520,
    aliases: ['alwarpet', 'ttk road', 'chamiers road', 'music academy'],
  },
  {
    name: 'Thiruvanmiyur Beach',
    city: 'Chennai',
    lat: 12.9830,
    lon: 80.2594,
    aliases: ['thiruvanmiyur', 'thiruvanmiyur beach', 'valmiki nagar'],
  },
  {
    name: 'Kilpauk & Chetpet',
    city: 'Chennai',
    lat: 13.0784,
    lon: 80.2412,
    aliases: ['kilpauk', 'chetpet', 'chetpet eco park', 'kelly road'],
  },
  {
    name: 'Kotturpuram & Anna Library',
    city: 'Chennai',
    lat: 13.0125,
    lon: 80.2370,
    aliases: ['kotturpuram', 'anna centenary library', 'gandhi mandapam'],
  },
  {
    name: 'OMR / Thoraipakkam IT Corridor',
    city: 'Chennai',
    lat: 12.9400,
    lon: 80.2350,
    aliases: ['omr', 'thoraipakkam', 'perungudi', 'sholinganallur', 'old mahabalipuram road'],
  },
  {
    name: 'ECR / Akkarai Coastal Stretch',
    city: 'Chennai',
    lat: 12.8996,
    lon: 80.2444,
    aliases: ['ecr', 'east coast road', 'akkarai', 'neelankarai', 'palavakkam', 'injambakkam'],
  },

  // ==================== DELHI NCR ====================
  {
    name: 'Lodhi Gardens & Environs',
    city: 'Delhi NCR',
    lat: 28.5933,
    lon: 77.2197,
    aliases: ['lodhi gardens', 'lodhi garden', 'khan market', 'lodhi colony'],
  },
  {
    name: 'Central Ridge Forest',
    city: 'Delhi NCR',
    lat: 28.6015,
    lon: 77.1720,
    aliases: ['central ridge', 'ridge forest', 'dhaula kuan'],
  },
  {
    name: 'Connaught Place & Central Park',
    city: 'Delhi NCR',
    lat: 28.6315,
    lon: 77.2167,
    aliases: ['connaught place', 'cp', 'inner circle', 'rajiv chowk'],
  },
  {
    name: 'India Gate & Kartavya Path',
    city: 'Delhi NCR',
    lat: 28.6129,
    lon: 77.2295,
    aliases: ['india gate', 'kartavya path', 'rajpath', 'c-hexagon'],
  },
  {
    name: 'Nehru Park & Chanakyapuri',
    city: 'Delhi NCR',
    lat: 28.5900,
    lon: 77.1950,
    aliases: ['nehru park', 'chanakyapuri', 'shanti path'],
  },
  {
    name: 'Hauz Khas Complex & Deer Park',
    city: 'Delhi NCR',
    lat: 28.5535,
    lon: 77.1945,
    aliases: ['hauz khas', 'deer park', 'green park'],
  },

  // ==================== MUMBAI ====================
  {
    name: 'Marine Drive Promenade',
    city: 'Mumbai',
    lat: 18.9438,
    lon: 72.8234,
    aliases: ['marine drive', 'queens necklace', 'nariman point', 'churchgate'],
  },
  {
    name: 'Bandstand & Coastal',
    city: 'Mumbai',
    lat: 19.0436,
    lon: 72.8194,
    aliases: ['bandstand', 'bandra bandstand', 'bandra west', 'carter road', 'bandra'],
  },
  {
    name: 'Shivaji Park Circuit',
    city: 'Mumbai',
    lat: 19.0269,
    lon: 72.8384,
    aliases: ['shivaji park', 'dadar west', 'dadar'],
  },
  {
    name: 'Juhu Beach Promenade',
    city: 'Mumbai',
    lat: 19.0988,
    lon: 72.8264,
    aliases: ['juhu', 'juhu beach', 'vile parle'],
  },

  // ==================== BENGALURU ====================
  {
    name: 'Cubbon Park Loop',
    city: 'Bengaluru',
    lat: 12.9760,
    lon: 77.5929,
    aliases: ['cubbon park', 'cubbon', 'kanteerava stadium'],
  },
  {
    name: 'Lalbagh Botanical Garden',
    city: 'Bengaluru',
    lat: 12.9507,
    lon: 77.5848,
    aliases: ['lalbagh', 'lalbagh botanical garden', 'south end circle'],
  },
  {
    name: 'Sankey Tank Promenade',
    city: 'Bengaluru',
    lat: 13.0094,
    lon: 77.5744,
    aliases: ['sankey tank', 'sadashivanagar', 'malleshwaram'],
  },
  {
    name: 'Indiranagar & 100ft Road',
    city: 'Bengaluru',
    lat: 12.9784,
    lon: 77.6408,
    aliases: ['indiranagar', '100 feet road', 'defence colony'],
  },
  {
    name: 'Koramangala 4th Block',
    city: 'Bengaluru',
    lat: 12.9345,
    lon: 77.6266,
    aliases: ['koramangala', 'sony world'],
  },
];

/**
 * Intelligent location resolver that resolves:
 * 1. Specific neighborhoods and landmarks (e.g. "Anna Nagar", "T. Nagar", "Marina Beach", "Bandra")
 * 2. Major city names (e.g. "Chennai", "Delhi", "Bengaluru")
 * 3. Worldwide street/neighborhood queries via OpenStreetMap Photon API
 * 4. City-level queries via Open-Meteo Geocoding
 */
export async function resolveLocationCoordinates(
  query: string,
  cityHint?: string
): Promise<{ name: string; lat: number; lon: number } | null> {
  const raw = query.trim();
  if (!raw) return null;
  const clean = raw.toLowerCase().replace(/[,.]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Check local landmark and neighborhood database (supports aliases and partial matches)
  if (cityHint) {
    const hint = cityHint.toLowerCase();
    for (const item of POPULAR_LANDMARKS) {
      if (item.city.toLowerCase() === hint) {
        if (
          item.name.toLowerCase() === clean ||
          item.name.toLowerCase().includes(clean) ||
          clean.includes(item.name.toLowerCase()) ||
          item.aliases.some((a) => clean === a || clean.includes(a) || a.includes(clean))
        ) {
          return { name: item.name, lat: item.lat, lon: item.lon };
        }
      }
    }
  }

  // Check without city filter if not matched yet
  for (const item of POPULAR_LANDMARKS) {
    if (
      item.name.toLowerCase() === clean ||
      item.name.toLowerCase().includes(clean) ||
      clean.includes(item.name.toLowerCase()) ||
      item.aliases.some((a) => clean === a || clean.includes(a) || a.includes(clean))
    ) {
      return { name: item.name, lat: item.lat, lon: item.lon };
    }
  }

  // 2. Check POPULAR_CITIES (Chennai, Delhi, Mumbai, Bengaluru, etc.)
  for (const city of POPULAR_CITIES) {
    if (clean === city.name.toLowerCase() || clean.includes(city.name.toLowerCase())) {
      return { name: city.name, lat: city.lat, lon: city.lon };
    }
  }

  // 3. Fallback: Query Photon OpenStreetMap geocoder (supports neighborhoods, streets, POIs, CORS enabled)
  try {
    const searchQuery = cityHint && !clean.includes(cityHint.toLowerCase()) 
      ? `${raw}, ${cityHint}` 
      : raw;
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`,
      { headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const feat = data.features[0];
        const [lon, lat] = feat.geometry.coordinates;
        const placeName = feat.properties.name || feat.properties.street || raw;
        return {
          name: `${placeName} (${cityHint || feat.properties.city || 'Local'})`,
          lat: parseFloat(lat.toFixed(4)),
          lon: parseFloat(lon.toFixed(4)),
        };
      }
    }
  } catch (e) {
    console.warn('Photon geocoding error:', e);
  }

  // 4. Fallback: Query Open-Meteo Geocoding
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(raw)}&count=1&language=en&format=json`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const top = data.results[0];
        return {
          name: top.name,
          lat: parseFloat(top.latitude.toFixed(4)),
          lon: parseFloat(top.longitude.toFixed(4)),
        };
      }
    }
  } catch (e) {
    console.warn('Open-Meteo geocoding error:', e);
  }

  return null;
}

// Backward-compatibility alias
export const resolveCityCoordinates = resolveLocationCoordinates;
