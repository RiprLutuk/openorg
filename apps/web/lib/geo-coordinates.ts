/**
 * Indonesian Regional & City Coordinates Lookup Table & Geocoding Utilities
 * Provides automatic centroid coordinates for all Indonesian provinces and major cities/regencies
 * so distance calculation and proximity sorting work out-of-the-box for all member workshops.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

// Major Indonesian Cities and Regencies Coordinate Centroids
export const INDONESIA_CITY_COORDINATES: Record<string, LatLng> = {
  // DKI Jakarta
  "jakarta": { lat: -6.2088, lng: 106.8456 },
  "jakarta selatan": { lat: -6.2615, lng: 106.8106 },
  "kota administrasi jakarta selatan": { lat: -6.2615, lng: 106.8106 },
  "jakarta pusat": { lat: -6.1865, lng: 106.8341 },
  "kota administrasi jakarta pusat": { lat: -6.1865, lng: 106.8341 },
  "jakarta barat": { lat: -6.1683, lng: 106.7589 },
  "kota administrasi jakarta barat": { lat: -6.1683, lng: 106.7589 },
  "jakarta timur": { lat: -6.2250, lng: 106.9004 },
  "kota administrasi jakarta timur": { lat: -6.2250, lng: 106.9004 },
  "jakarta utara": { lat: -6.1384, lng: 106.8640 },
  "kota administrasi jakarta utara": { lat: -6.1384, lng: 106.8640 },
  "kepulauan seribu": { lat: -5.6122, lng: 106.5606 },

  // Jawa Barat & Banten (Jabodetabek & Jabar)
  "bekasi": { lat: -6.2383, lng: 106.9756 },
  "kota bekasi": { lat: -6.2383, lng: 106.9756 },
  "kabupaten bekasi": { lat: -6.3644, lng: 107.1725 },
  "cikarang": { lat: -6.3248, lng: 107.1425 },
  "tangerang": { lat: -6.1783, lng: 106.6319 },
  "kota tangerang": { lat: -6.1783, lng: 106.6319 },
  "tangerang selatan": { lat: -6.2888, lng: 106.7179 },
  "kota tangerang selatan": { lat: -6.2888, lng: 106.7179 },
  "kabupaten tangerang": { lat: -6.1963, lng: 106.4776 },
  "depok": { lat: -6.4025, lng: 106.7942 },
  "kota depok": { lat: -6.4025, lng: 106.7942 },
  "bogor": { lat: -6.5971, lng: 106.8060 },
  "kota bogor": { lat: -6.5971, lng: 106.8060 },
  "kabupaten bogor": { lat: -6.5518, lng: 106.8520 },
  "cibinong": { lat: -6.4817, lng: 106.8536 },
  "bandung": { lat: -6.9175, lng: 107.6191 },
  "kota bandung": { lat: -6.9175, lng: 107.6191 },
  "kabupaten bandung": { lat: -7.0253, lng: 107.5198 },
  "bandung barat": { lat: -6.8439, lng: 107.4939 },
  "cimahi": { lat: -6.8722, lng: 107.5422 },
  "kota cimahi": { lat: -6.8722, lng: 107.5422 },
  "cirebon": { lat: -6.7320, lng: 108.5523 },
  "kota cirebon": { lat: -6.7320, lng: 108.5523 },
  "sukabumi": { lat: -6.9277, lng: 106.9300 },
  "kota sukabumi": { lat: -6.9277, lng: 106.9300 },
  "tasikmalaya": { lat: -7.3274, lng: 108.2207 },
  "kota tasikmalaya": { lat: -7.3274, lng: 108.2207 },
  "karawang": { lat: -6.3073, lng: 107.3076 },
  "purwakarta": { lat: -6.5569, lng: 107.4433 },
  "serang": { lat: -6.1104, lng: 106.1640 },
  "kota serang": { lat: -6.1104, lng: 106.1640 },
  "cilegon": { lat: -6.0174, lng: 106.0538 },
  "kota cilegon": { lat: -6.0174, lng: 106.0538 },

  // Jawa Tengah & DI Yogyakarta
  "semarang": { lat: -6.9667, lng: 110.4167 },
  "kota semarang": { lat: -6.9667, lng: 110.4167 },
  "surakarta": { lat: -7.5755, lng: 110.8243 },
  "solo": { lat: -7.5755, lng: 110.8243 },
  "kota surakarta": { lat: -7.5755, lng: 110.8243 },
  "yogyakarta": { lat: -7.7956, lng: 110.3695 },
  "kota yogyakarta": { lat: -7.7956, lng: 110.3695 },
  "sleman": { lat: -7.7156, lng: 110.3556 },
  "bantul": { lat: -7.8938, lng: 110.3306 },
  "magelang": { lat: -7.4706, lng: 110.2178 },
  "pekalongan": { lat: -6.8886, lng: 109.6753 },
  "tegal": { lat: -6.8694, lng: 109.1402 },
  "salatiga": { lat: -7.3305, lng: 110.5084 },
  "kudus": { lat: -6.8048, lng: 110.8405 },
  "banyumas": { lat: -7.5186, lng: 109.2944 },
  "purwokerto": { lat: -7.4243, lng: 109.2302 },
  "cilacap": { lat: -7.7279, lng: 109.0059 },

  // Jawa Timur
  "surabaya": { lat: -7.2575, lng: 112.7521 },
  "kota surabaya": { lat: -7.2575, lng: 112.7521 },
  "malang": { lat: -7.9666, lng: 112.6326 },
  "kota malang": { lat: -7.9666, lng: 112.6326 },
  "batu": { lat: -7.8712, lng: 112.5271 },
  "kota batu": { lat: -7.8712, lng: 112.5271 },
  "sidoarjo": { lat: -7.4478, lng: 112.7183 },
  "gresik": { lat: -7.1566, lng: 112.6555 },
  "kediri": { lat: -7.8480, lng: 112.0178 },
  "kota kediri": { lat: -7.8480, lng: 112.0178 },
  "jember": { lat: -8.1845, lng: 113.6681 },
  "banyuwangi": { lat: -8.2192, lng: 114.3692 },
  "madiun": { lat: -7.6298, lng: 111.5239 },
  "pasuruan": { lat: -7.6453, lng: 112.9075 },
  "probolinggo": { lat: -7.7569, lng: 113.2115 },

  // Sumatera
  "medan": { lat: 3.5952, lng: 98.6722 },
  "kota medan": { lat: 3.5952, lng: 98.6722 },
  "palembang": { lat: -2.9761, lng: 104.7754 },
  "kota palembang": { lat: -2.9761, lng: 104.7754 },
  "bandar lampung": { lat: -5.4292, lng: 105.2625 },
  "kota bandar lampung": { lat: -5.4292, lng: 105.2625 },
  "pekanbaru": { lat: 0.5071, lng: 101.4478 },
  "kota pekanbaru": { lat: 0.5071, lng: 101.4478 },
  "padang": { lat: -0.9471, lng: 100.4172 },
  "kota padang": { lat: -0.9471, lng: 100.4172 },
  "batam": { lat: 1.1301, lng: 104.0529 },
  "kota batam": { lat: 1.1301, lng: 104.0529 },
  "tanjung pinang": { lat: 0.9167, lng: 104.4583 },
  "jambi": { lat: -1.6101, lng: 103.6131 },
  "kota jambi": { lat: -1.6101, lng: 103.6131 },
  "bengkulu": { lat: -3.7928, lng: 102.2608 },
  "kota bengkulu": { lat: -3.7928, lng: 102.2608 },
  "banda aceh": { lat: 5.5483, lng: 95.3238 },
  "kota banda aceh": { lat: 5.5483, lng: 95.3238 },
  "pangkal pinang": { lat: -2.1290, lng: 106.1139 },

  // Bali & Nusa Tenggara
  "denpasar": { lat: -8.6705, lng: 115.2126 },
  "kota denpasar": { lat: -8.6705, lng: 115.2126 },
  "badung": { lat: -8.5819, lng: 115.1771 },
  "kuta": { lat: -8.7233, lng: 115.1725 },
  "gianyar": { lat: -8.5442, lng: 115.3276 },
  "mataram": { lat: -8.5833, lng: 116.1167 },
  "kota mataram": { lat: -8.5833, lng: 116.1167 },
  "lombok barat": { lat: -8.6833, lng: 116.1333 },
  "kupang": { lat: -10.1772, lng: 123.6070 },
  "kota kupang": { lat: -10.1772, lng: 123.6070 },

  // Kalimantan
  "balikpapan": { lat: -1.2379, lng: 116.8289 },
  "kota balikpapan": { lat: -1.2379, lng: 116.8289 },
  "samarinda": { lat: -0.5022, lng: 117.1536 },
  "kota samarinda": { lat: -0.5022, lng: 117.1536 },
  "penajam paser utara": { lat: -1.2725, lng: 116.7118 },
  "nusantara": { lat: -0.9744, lng: 116.7083 }, // IKN
  "ikn": { lat: -0.9744, lng: 116.7083 },
  "banjarmasin": { lat: -3.3167, lng: 114.5900 },
  "kota banjarmasin": { lat: -3.3167, lng: 114.5900 },
  "banjarbaru": { lat: -3.4400, lng: 114.8300 },
  "pontianak": { lat: -0.0263, lng: 109.3425 },
  "kota pontianak": { lat: -0.0263, lng: 109.3425 },
  "palangkaraya": { lat: -2.2167, lng: 113.9167 },
  "kota palangkaraya": { lat: -2.2167, lng: 113.9167 },
  "tarakan": { lat: 3.3000, lng: 117.6333 },

  // Sulawesi
  "makassar": { lat: -5.1477, lng: 119.4327 },
  "kota makassar": { lat: -5.1477, lng: 119.4327 },
  "manado": { lat: 1.4748, lng: 124.8428 },
  "kota manado": { lat: 1.4748, lng: 124.8428 },
  "palu": { lat: -0.9000, lng: 119.8333 },
  "kota palu": { lat: -0.9000, lng: 119.8333 },
  "kendari": { lat: -3.9985, lng: 122.5126 },
  "kota kendari": { lat: -3.9985, lng: 122.5126 },
  "gorontalo": { lat: 0.5412, lng: 123.0595 },
  "mamuju": { lat: -2.6748, lng: 118.8885 },

  // Maluku & Papua
  "ambon": { lat: -3.6547, lng: 128.1906 },
  "kota ambon": { lat: -3.6547, lng: 128.1906 },
  "ternate": { lat: 0.7833, lng: 127.3667 },
  "jayapura": { lat: -2.5337, lng: 140.7181 },
  "kota jayapura": { lat: -2.5337, lng: 140.7181 },
  "sorong": { lat: -0.8762, lng: 131.2558 },
  "manokwari": { lat: -0.8615, lng: 134.0620 },
  "merauke": { lat: -8.4991, lng: 140.4047 },
  "timika": { lat: -4.5467, lng: 136.8833 },
};

// Province Default Fallbacks
export const PROVINCE_FALLBACK_COORDINATES: Record<string, LatLng> = {
  "dki jakarta": { lat: -6.2088, lng: 106.8456 },
  "jawa barat": { lat: -6.9175, lng: 107.6191 },
  "banten": { lat: -6.1783, lng: 106.6319 },
  "jawa tengah": { lat: -6.9667, lng: 110.4167 },
  "di yogyakarta": { lat: -7.7956, lng: 110.3695 },
  "jawa timur": { lat: -7.2575, lng: 112.7521 },
  "bali": { lat: -8.6705, lng: 115.2126 },
  "nusa tenggara barat": { lat: -8.5833, lng: 116.1167 },
  "nusa tenggara timur": { lat: -10.1772, lng: 123.6070 },
  "sumatera utara": { lat: 3.5952, lng: 98.6722 },
  "sumatera barat": { lat: -0.9471, lng: 100.4172 },
  "sumatera selatan": { lat: -2.9761, lng: 104.7754 },
  "riau": { lat: 0.5071, lng: 101.4478 },
  "kepulauan riau": { lat: 1.1301, lng: 104.0529 },
  "lampung": { lat: -5.4292, lng: 105.2625 },
  "jambi": { lat: -1.6101, lng: 103.6131 },
  "bengkulu": { lat: -3.7928, lng: 102.2608 },
  "aceh": { lat: 5.5483, lng: 95.3238 },
  "kepulauan bangka belitung": { lat: -2.1290, lng: 106.1139 },
  "kalimantan timur": { lat: -1.2379, lng: 116.8289 },
  "kalimantan barat": { lat: -0.0263, lng: 109.3425 },
  "kalimantan selatan": { lat: -3.3167, lng: 114.5900 },
  "kalimantan tengah": { lat: -2.2167, lng: 113.9167 },
  "kalimantan utara": { lat: 3.3000, lng: 117.6333 },
  "sulawesi selatan": { lat: -5.1477, lng: 119.4327 },
  "sulawesi utara": { lat: 1.4748, lng: 124.8428 },
  "sulawesi tengah": { lat: -0.9000, lng: 119.8333 },
  "sulawesi tenggara": { lat: -3.9985, lng: 122.5126 },
  "gorontalo": { lat: 0.5412, lng: 123.0595 },
  "sulawesi barat": { lat: -2.6748, lng: 118.8885 },
  "maluku": { lat: -3.6547, lng: 128.1906 },
  "maluku utara": { lat: 0.7833, lng: 127.3667 },
  "papua": { lat: -2.5337, lng: 140.7181 },
  "papua barat": { lat: -0.8615, lng: 134.0620 },
  "papua barat daya": { lat: -0.8762, lng: 131.2558 },
  "papua selatan": { lat: -8.4991, lng: 140.4047 },
  "papua tengah": { lat: -4.5467, lng: 136.8833 },
  "papua pegunungan": { lat: -4.0900, lng: 138.9400 },
};

/**
 * Resolves latitude and longitude for any given Indonesian city / regency name.
 * Uses smart normalization to strip prefixes like "Kota", "Kabupaten", "Kab.", "Kota Adm."
 */
export function getCityCoordinates(cityName?: string | null, provinceName?: string | null): LatLng {
  if (!cityName && !provinceName) {
    return { lat: -6.2088, lng: 106.8456 }; // Default Jakarta
  }

  const cleanCity = (cityName || "")
    .toLowerCase()
    .replace(/^(kota administrasi|kota adm\.|kota|kabupaten|kab\.)\s+/i, "")
    .trim();

  // 1. Direct match on cleaned city name
  if (cleanCity && INDONESIA_CITY_COORDINATES[cleanCity]) {
    return INDONESIA_CITY_COORDINATES[cleanCity];
  }

  // 2. Exact match on raw string
  const rawCity = (cityName || "").toLowerCase().trim();
  if (rawCity && INDONESIA_CITY_COORDINATES[rawCity]) {
    return INDONESIA_CITY_COORDINATES[rawCity];
  }

  // 3. Partial substring matching
  if (cleanCity) {
    for (const [key, coords] of Object.entries(INDONESIA_CITY_COORDINATES)) {
      if (key.includes(cleanCity) || cleanCity.includes(key)) {
        return coords;
      }
    }
  }

  // 4. Fallback to Province centroid
  const cleanProv = (provinceName || "").toLowerCase().trim();
  if (cleanProv && PROVINCE_FALLBACK_COORDINATES[cleanProv]) {
    return PROVINCE_FALLBACK_COORDINATES[cleanProv];
  }

  return { lat: -6.2088, lng: 106.8456 };
}

/**
 * Extracts coordinates from Google Maps share URL if present.
 * Supports patterns:
 * - google.com/maps/@-6.2615,106.8106,17z
 * - google.com/maps/place/.../@-6.2615,106.8106
 * - google.com/maps?q=-6.2615,106.8106
 * - maps.google.com/?ll=-6.2615,106.8106
 */
export function extractCoordinatesFromMapsUrl(url?: string | null): LatLng | null {
  if (!url) return null;

  // Pattern 1: /@(-?\d+\.\d+),(-?\d+\.\d+)
  const matchAt = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (matchAt && matchAt[1] && matchAt[2]) {
    const lat = parseFloat(matchAt[1]);
    const lng = parseFloat(matchAt[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  // Pattern 2: [?&](q|ll|query)=(-?\d+\.\d+),(-?\d+\.\d+)
  const matchQuery = url.match(/[?&](?:q|ll|query|saddr|daddr)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (matchQuery && matchQuery[1] && matchQuery[2]) {
    const lat = parseFloat(matchQuery[1]);
    const lng = parseFloat(matchQuery[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  return null;
}

/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in kilometers.
 */
export function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
