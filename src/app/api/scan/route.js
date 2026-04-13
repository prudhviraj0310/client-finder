import { NextResponse } from 'next/server';

// Google Places API (New) — primary source for real data
const GOOGLE_PLACES_URL = 'https://places.googleapis.com/v1/places:searchText';

// Fallback: Nominatim + Overpass
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const INDUSTRY_QUERIES = {
  'restaurants': 'restaurants',
  'hotels': 'hotels',
  'hospitals': 'hospitals',
  'retail stores': 'retail shops stores',
  'software companies': 'software IT companies',
  'healthcare clinics': 'clinics healthcare',
  'real estate agencies': 'real estate agencies',
  'schools academies': 'schools colleges',
  'gyms fitness centers': 'gym fitness center',
  'beauty salons': 'beauty salon parlour',
  'car dealerships auto repair': 'car repair auto service',
  'law firms attorneys': 'law firm advocate',
  'financial services': 'bank finance',
  'construction companies': 'construction builders',
  'marketing agencies': 'marketing advertising agency',
  'cleaning services': 'cleaning services',
  'plumbing hvac': 'plumber HVAC',
  'dental clinics': 'dental clinic dentist',
  'pharmacies': 'pharmacy medical shop',
  'coaching centers': 'coaching center tuition classes',
  '': 'businesses',
};

const INDUSTRY_ICONS = {
  'restaurants': '🍽️', 'hotels': '🏨', 'hospitals': '🏥',
  'retail stores': '🛍️', 'software companies': '💻',
  'healthcare clinics': '🏥', 'real estate agencies': '🏗️',
  'schools academies': '🎓', 'gyms fitness centers': '💪',
  'beauty salons': '💇', 'car dealerships auto repair': '🚗',
  'law firms attorneys': '⚖️', 'financial services': '🏦',
  'construction companies': '🔨', 'marketing agencies': '📣',
  'cleaning services': '🧹', 'plumbing hvac': '🔧',
  'dental clinics': '🦷', 'pharmacies': '💊',
  'coaching centers': '📚',
};

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// =============================================
// STRATEGY 1: Google Places API (New) — BEST DATA
// =============================================
async function searchGooglePlaces(location, industry, radius) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('NO_GOOGLE_KEY');

  const query = INDUSTRY_QUERIES[industry] || industry || 'businesses';
  const textQuery = `${query} in ${location}`;

  const response = await fetchWithTimeout(GOOGLE_PLACES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.nationalPhoneNumber',
        'places.internationalPhoneNumber',
        'places.rating',
        'places.userRatingCount',
        'places.websiteUri',
        'places.googleMapsUri',
        'places.types',
        'places.reviews',
        'places.location',
        'places.businessStatus',
        'places.primaryType',
        'places.regularOpeningHours',
      ].join(','),
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: 20,
      languageCode: 'en',
    }),
  }, 12000);

  if (!response.ok) {
    const errBody = await response.text();
    console.error('Google Places error:', response.status, errBody);
    throw new Error(`Google Places API error: ${response.status}`);
  }

  return response.json();
}

function processGoogleResults(data, industry) {
  const places = data.places || [];
  const icon = INDUSTRY_ICONS[industry] || '🏢';

  return places
    .filter(p => p.displayName?.text)
    .map(p => {
      const name = p.displayName?.text || '';
      const phone = p.nationalPhoneNumber || p.internationalPhoneNumber || '';
      const website = p.websiteUri || '';
      const hasWebsite = !!website;
      const rating = p.rating || 0;
      const reviews = p.userRatingCount || 0;
      const address = p.formattedAddress || '';
      const lat = p.location?.latitude || 0;
      const lng = p.location?.longitude || 0;

      // Extract review texts
      const reviewSnippets = (p.reviews || []).slice(0, 3).map(r => ({
        text: r.text?.text || '',
        rating: r.rating || 0,
        author: r.authorAttribution?.displayName || 'Anonymous',
        time: r.relativePublishTimeDescription || '',
      }));

      // Opening hours
      const openingHours = p.regularOpeningHours?.weekdayDescriptions?.join(', ') || '';

      // Digital score
      let digitalScore = 0;
      if (hasWebsite) digitalScore += 30;
      if (phone) digitalScore += 15;
      if (rating > 0) digitalScore += 10;
      if (reviews > 10) digitalScore += 10;
      if (reviews > 50) digitalScore += 5;
      if (openingHours) digitalScore += 10;
      if (reviewSnippets.length > 0) digitalScore += 5;
      digitalScore = Math.min(digitalScore, 100);

      const missingItems = [];
      if (!hasWebsite) missingItems.push('No Website');
      if (!phone) missingItems.push('No Phone Listed');
      if (rating === 0) missingItems.push('No Rating');
      if (reviews < 5) missingItems.push('Few Reviews');
      if (!openingHours) missingItems.push('No Hours Listed');

      return {
        id: `gp-${p.id}`,
        name,
        industry: industry || 'business',
        icon,
        rating,
        reviews,
        reviewSnippets,
        address,
        city: '',
        country: '',
        lat,
        lng,
        phone,
        email: '',
        website,
        hasWebsite,
        googleMapsUrl: p.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}+${encodeURIComponent(address)}`,
        primaryCategory: p.primaryType || industry || '',
        businessStatus: p.businessStatus || 'OPERATIONAL',
        cuisine: '',
        digitalScore,
        missingItems,
        socialMedia: {},
        isChain: false,
        chainName: null,
        openingHours,
        source: 'google',
      };
    })
    .sort((a, b) => a.digitalScore - b.digitalScore);
}

// =============================================
// STRATEGY 2: Nominatim — FREE FALLBACK
// =============================================
async function searchNominatim(location, industry, radius) {
  const NOMINATIM_MAP = {
    'schools academies': 'college',
    'restaurants': 'restaurant',
    'hotels': 'hotel',
    'hospitals': 'hospital',
    'retail stores': 'shop',
    'software companies': 'software',
    'healthcare clinics': 'clinic',
    'real estate agencies': 'real estate',
    'gyms fitness centers': 'gym',
    'beauty salons': 'salon',
    'car dealerships auto repair': 'car repair',
    'law firms attorneys': 'lawyer',
    'financial services': 'bank',
    'construction companies': 'construction',
    'marketing agencies': 'marketing',
    'plumbing hvac': 'plumber',
    'dental clinics': 'dentist',
    'pharmacies': 'pharmacy',
    'coaching centers': 'school',
  };

  const query = NOMINATIM_MAP[industry] || (INDUSTRY_QUERIES[industry] || industry || 'businesses').split(' ')[0];

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', `${query} in ${location}`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '30');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('namedetails', '1');

  const response = await fetchWithTimeout(url.toString(), {
    headers: { 'User-Agent': 'ClientFinder/2.0 (Business Scanner)' },
  }, 10000);

  if (!response.ok) throw new Error(`Nominatim error: ${response.status}`);
  return response.json();
}

function processNominatimResults(results, industry) {
  const icon = INDUSTRY_ICONS[industry] || '🏢';

  return results
    .filter(r => r.name && r.name.length > 1)
    .filter(r => {
      const nameLower = (r.namedetails?.name || r.name).toLowerCase();
      if (nameLower.includes('temple') || nameLower.includes('mandir') || nameLower.includes('church') || nameLower.includes('mosque')) {
        return false;
      }
      return true;
    })
    .map(r => {
      const ext = r.extratags || {};
      const addr = r.address || {};
      const phone = ext.phone || ext['contact:phone'] || '';
      const website = ext.website || ext['contact:website'] || ext.url || '';
      const hasWebsite = !!website;
      const email = ext.email || ext['contact:email'] || '';
      const openingHours = ext.opening_hours || '';
      const addressStr = r.display_name?.split(',').slice(0, 3).join(',') || '';

      let digitalScore = 0;
      if (hasWebsite) digitalScore += 30;
      if (phone) digitalScore += 15;
      if (email) digitalScore += 10;
      if (openingHours) digitalScore += 10;
      if (addressStr) digitalScore += 5;
      digitalScore = Math.min(digitalScore, 100);

      const missingItems = [];
      if (!hasWebsite) missingItems.push('No Website');
      if (!phone) missingItems.push('No Phone Listed');
      if (!email) missingItems.push('No Email');
      if (!openingHours) missingItems.push('No Hours');

      const bName = r.namedetails?.name || r.name;
      return {
        id: `osm-${r.osm_type}-${r.osm_id}`,
        name: bName,
        industry: industry || 'business',
        icon,
        rating: 0,
        reviews: 0,
        reviewSnippets: [],
        address: addressStr,
        city: addr.city || addr.town || addr.village || '',
        country: addr.country || '',
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        phone,
        email,
        website,
        hasWebsite,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bName)}+${encodeURIComponent(addressStr)}`,
        primaryCategory: r.type || industry || '',
        businessStatus: 'OPERATIONAL',
        cuisine: ext.cuisine || '',
        digitalScore,
        missingItems,
        socialMedia: {},
        isChain: !!ext.brand,
        chainName: ext.brand || null,
        openingHours,
        source: 'nominatim',
      };
    })
    .sort((a, b) => a.digitalScore - b.digitalScore);
}

// =============================================
// STRATEGY 3: Overpass — BACKUP
// =============================================
async function searchOverpass(lat, lng, industry, radius) {
  const amenityMap = {
    'restaurants': 'amenity=restaurant',
    'hotels': 'tourism=hotel',
    'hospitals': 'amenity~"hospital|clinic|doctors"',
    'retail stores': 'shop',
    'healthcare clinics': 'amenity~"clinic|doctors|hospital"',
    'schools academies': 'amenity~"school|college|university"',
    'gyms fitness centers': 'leisure=fitness_centre',
    'beauty salons': 'shop~"beauty|hairdresser"',
    'car dealerships auto repair': 'shop~"car|car_repair"',
    'law firms attorneys': 'office~"lawyer|attorney"',
    'financial services': 'amenity=bank',
    'dental clinics': 'amenity=dentist',
    'pharmacies': 'amenity=pharmacy',
    'coaching centers': 'amenity~"school|college"',
  };

  const radiusM = Math.min(radius, 15000);
  const osmFilter = amenityMap[industry] || 'amenity';
  const query = `[out:json][timeout:10];(node[${osmFilter}](around:${radiusM},${lat},${lng});way[${osmFilter}](around:${radiusM},${lat},${lng}););out body 30;`;

  for (const server of OVERPASS_SERVERS) {
    try {
      const response = await fetchWithTimeout(server, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      }, 25000);
      if (response.ok) return response.json();
    } catch (e) { continue; }
  }
  throw new Error('Overpass unavailable');
}

function processOverpassResults(elements, industry) {
  const icon = INDUSTRY_ICONS[industry] || '🏢';

  return elements
    .filter(el => el.tags && el.tags.name)
    .filter(el => {
      const nameLower = el.tags.name.toLowerCase();
      if (nameLower.includes('temple') || nameLower.includes('mandir') || nameLower.includes('church') || nameLower.includes('mosque')) {
        return false;
      }
      return true;
    })
    .map(el => {
      const tags = el.tags;
      const phone = tags.phone || tags['contact:phone'] || '';
      const website = tags.website || tags['contact:website'] || '';
      const hasWebsite = !!website;
      const email = tags.email || tags['contact:email'] || '';
      const openingHours = tags.opening_hours || '';
      const addr = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:state']].filter(Boolean).join(', ');

      let digitalScore = 0;
      if (hasWebsite) digitalScore += 30;
      if (phone) digitalScore += 15;
      if (email) digitalScore += 10;
      if (openingHours) digitalScore += 10;
      if (addr) digitalScore += 5;
      digitalScore = Math.min(digitalScore, 100);

      const missingItems = [];
      if (!hasWebsite) missingItems.push('No Website');
      if (!phone) missingItems.push('No Phone Listed');
      if (!email) missingItems.push('No Email');
      if (!openingHours) missingItems.push('No Hours');

      return {
        id: `osm-${el.id}`,
        name: tags.name,
        industry: industry || 'business',
        icon,
        rating: 0,
        reviews: 0,
        reviewSnippets: [],
        address: addr,
        city: tags['addr:city'] || '',
        country: tags['addr:country'] || '',
        lat: el.lat || el.center?.lat || 0,
        lng: el.lon || el.center?.lon || 0,
        phone,
        email,
        website,
        hasWebsite,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tags.name)}+${encodeURIComponent(addr)}`,
        primaryCategory: tags.amenity || tags.shop || industry || '',
        businessStatus: 'OPERATIONAL',
        cuisine: tags.cuisine || '',
        digitalScore,
        missingItems,
        socialMedia: {},
        isChain: !!tags.brand,
        chainName: tags.brand || null,
        openingHours,
        source: 'overpass',
      };
    })
    .sort((a, b) => a.digitalScore - b.digitalScore);
}

// =============================================
// GEOCODE: Convert location text → lat/lng
// =============================================
async function geocodeLocation(locationText) {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', locationText);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  const response = await fetchWithTimeout(url.toString(), {
    headers: { 'User-Agent': 'ClientFinder/2.0 (Geocoder)' },
  }, 8000);

  if (!response.ok) return null;
  const results = await response.json();
  if (results.length === 0) return null;
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

// =============================================
// MAIN HANDLER
// =============================================
export async function POST(request) {
  try {
    const { lat, lng, industry, radius = 5000, location } = await request.json();
    const locationText = location || '';

    let businesses = [];
    let source = '';

    // STRATEGY 1: Google Places (best data — real phone numbers, reviews)
    if (process.env.GOOGLE_PLACES_API_KEY && locationText) {
      try {
        const data = await searchGooglePlaces(locationText, industry, radius);
        businesses = processGoogleResults(data, industry);
        source = 'Google Places';
      } catch (err) {
        console.log('Google Places failed:', err.message);
      }
    }

    // STRATEGY 2: Overpass (needs lat/lng — gives better websites)
    if (businesses.length === 0) {
      let searchLat = lat;
      let searchLng = lng;

      // Geocode if we only have text
      if (!searchLat && locationText) {
        const coords = await geocodeLocation(locationText);
        if (coords) {
          searchLat = coords.lat;
          searchLng = coords.lng;
        }
      }

      if (searchLat && searchLng) {
        try {
          // Use default 15km if no radius provided or handle "all" conceptually with a generic large radius
          const data = await searchOverpass(searchLat, searchLng, industry, radius || 20000);
          businesses = processOverpassResults(data.elements || [], industry);
          source = 'Overpass';
        } catch (ovErr) {
          console.error('Overpass also failed:', ovErr.message);
        }
      }
    }

    // STRATEGY 3: Nominatim (free, location-text based — last resort)
    if (businesses.length === 0 && locationText) {
      try {
        const results = await searchNominatim(locationText, industry, radius);
        businesses = processNominatimResults(results, industry);
        source = 'Nominatim';
      } catch (nomErr) {
        console.log('Nominatim failed:', nomErr.message);
      }
    }

    if (businesses.length === 0) {
      return NextResponse.json(
        { error: 'No businesses found. Try a different location or industry.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      businesses,
      totalFound: businesses.length,
      source,
      location: locationText,
    });
  } catch (error) {
    console.error('Scan error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
