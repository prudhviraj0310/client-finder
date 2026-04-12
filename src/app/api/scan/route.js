import { NextResponse } from 'next/server';

// Nomination API — very fast, reliable OSM search
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Overpass as secondary source
const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const INDUSTRY_OSM_TAGS = {
  'restaurants': 'restaurant',
  'hotels': 'hotel',
  'retail stores': 'shop',
  'software companies': 'office',
  'healthcare clinics': 'clinic',
  'real estate agencies': 'estate_agent',
  'schools academies': 'school',
  'gyms fitness centers': 'fitness_centre',
  'beauty salons': 'beauty',
  'car dealerships auto repair': 'car_repair',
  'law firms attorneys': 'lawyer',
  'financial services': 'bank',
  'construction companies': 'construction',
  'marketing agencies': 'advertising',
  'cleaning services': 'cleaning',
  'plumbing hvac': 'plumber',
  'dental clinics': 'dentist',
  '': 'restaurant',
};

const INDUSTRY_ICONS = {
  'restaurant': '🍽️', 'hotel': '🏨', 'shop': '🛍️', 'office': '💻',
  'clinic': '🏥', 'estate_agent': '🏗️', 'school': '🎓', 'fitness_centre': '💪',
  'beauty': '💇', 'car_repair': '🚗', 'lawyer': '⚖️', 'bank': '🏦',
  'construction': '🔨', 'advertising': '📣', 'cleaning': '🧹', 'plumber': '🔧',
  'dentist': '🦷',
};

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// Strategy 1: Nominatim search (fast, reliable)
async function searchNominatim(lat, lng, industry, radius) {
  const tag = INDUSTRY_OSM_TAGS[industry] || 'restaurant';
  const industryLabel = industry || 'restaurants';

  // Calculate rough bounding box from radius
  const latDelta = (radius / 1000) / 111.32;
  const lngDelta = (radius / 1000) / (111.32 * Math.cos(lat * Math.PI / 180));

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', `${industryLabel}`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '50');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('viewbox', `${lng - lngDelta},${lat + latDelta},${lng + lngDelta},${lat - latDelta}`);
  url.searchParams.set('bounded', '1');

  const response = await fetchWithTimeout(url.toString(), {
    headers: {
      'User-Agent': 'ClientFinder/1.0 (Business Scanner)',
    },
  }, 8000);

  if (!response.ok) throw new Error(`Nominatim error: ${response.status}`);
  return response.json();
}

// Strategy 2: Overpass (backup, more data but slower)
async function searchOverpass(lat, lng, industry, radius) {
  const tag = INDUSTRY_OSM_TAGS[industry] || 'restaurant';
  const radiusM = Math.min(radius, 10000);

  // Simple, fast query
  const amenityMap = {
    'restaurant': 'amenity=restaurant',
    'hotel': 'tourism=hotel',
    'shop': 'shop',
    'clinic': 'amenity~"clinic|doctors|hospital"',
    'school': 'amenity~"school|college|university"',
    'fitness_centre': 'leisure=fitness_centre',
    'beauty': 'shop~"beauty|hairdresser"',
    'car_repair': 'shop~"car|car_repair"',
    'lawyer': 'office~"lawyer|attorney"',
    'bank': 'amenity=bank',
    'dentist': 'amenity=dentist',
    'estate_agent': 'office=estate_agent',
    'office': 'office',
    'construction': 'office=construction',
    'advertising': 'office~"advertising|marketing"',
    'cleaning': 'shop=cleaning',
    'plumber': 'craft~"plumber|hvac"',
  };

  const osmFilter = amenityMap[tag] || 'amenity=restaurant';
  const query = `[out:json][timeout:8];node[${osmFilter}](around:${radiusM},${lat},${lng});out body 50;`;

  for (const server of OVERPASS_SERVERS) {
    try {
      const response = await fetchWithTimeout(server, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      }, 10000);
      if (response.ok) return response.json();
    } catch (e) {
      continue;
    }
  }
  throw new Error('Overpass unavailable');
}

function processNominatimResults(results, industry) {
  const tag = INDUSTRY_OSM_TAGS[industry] || 'restaurant';
  const icon = INDUSTRY_ICONS[tag] || '🏢';

  return results
    .filter(r => r.name && r.name.length > 1)
    .map(r => {
      const ext = r.extratags || {};
      const addr = r.address || {};

      const hasWebsite = !!(ext.website || ext['contact:website'] || ext.url);
      const website = ext.website || ext['contact:website'] || ext.url || '';
      const phone = ext.phone || ext['contact:phone'] || '';
      const email = ext.email || ext['contact:email'] || '';
      const openingHours = ext.opening_hours || '';
      const cuisine = ext.cuisine || '';
      const brand = ext.brand || '';

      const socialMedia = {};
      if (ext['contact:facebook'] || ext.facebook) socialMedia.facebook = ext['contact:facebook'] || ext.facebook;
      if (ext['contact:instagram'] || ext.instagram) socialMedia.instagram = ext['contact:instagram'] || ext.instagram;
      if (ext['contact:twitter'] || ext.twitter) socialMedia.twitter = ext['contact:twitter'] || ext.twitter;

      const addressStr = r.display_name?.split(',').slice(0, 3).join(',') || '';

      let digitalScore = 0;
      if (hasWebsite) digitalScore += 30;
      if (phone) digitalScore += 10;
      if (email) digitalScore += 10;
      if (Object.keys(socialMedia).length > 0) digitalScore += 15;
      if (openingHours) digitalScore += 10;
      if (addressStr) digitalScore += 5;
      if (cuisine) digitalScore += 5;
      if (brand) digitalScore += 5;
      digitalScore = Math.min(digitalScore, 100);

      const missingItems = [];
      if (!hasWebsite) missingItems.push('No Website');
      if (!phone) missingItems.push('No Phone');
      if (!email) missingItems.push('No Email');
      if (!Object.keys(socialMedia).length) missingItems.push('No Social Media');
      if (!openingHours) missingItems.push('No Hours');

      const bLat = parseFloat(r.lat);
      const bLng = parseFloat(r.lon);
      const bName = r.namedetails?.name || r.name;
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bName)}+${encodeURIComponent(addressStr)}`;

      return {
        id: `osm-${r.osm_type}-${r.osm_id}`,
        name: bName,
        industry: tag,
        icon,
        rating: 0,
        reviews: 0,
        address: addressStr,
        city: addr.city || addr.town || addr.village || '',
        country: addr.country || '',
        lat: bLat,
        lng: bLng,
        phone, email, website, hasWebsite,
        googleMapsUrl,
        primaryCategory: r.type || tag,
        cuisine, digitalScore, missingItems, socialMedia,
        isChain: !!brand, chainName: brand || null, openingHours,
      };
    })
    .sort((a, b) => a.digitalScore - b.digitalScore);
}

function processOverpassResults(elements, industry) {
  const tag = INDUSTRY_OSM_TAGS[industry] || 'restaurant';
  const icon = INDUSTRY_ICONS[tag] || '🏢';

  return elements
    .filter(el => el.tags && el.tags.name)
    .map(el => {
      const tags = el.tags;
      const hasWebsite = !!(tags.website || tags['contact:website']);
      const website = tags.website || tags['contact:website'] || '';
      const phone = tags.phone || tags['contact:phone'] || '';
      const email = tags.email || tags['contact:email'] || '';
      const openingHours = tags.opening_hours || '';

      const socialMedia = {};
      if (tags['contact:facebook']) socialMedia.facebook = tags['contact:facebook'];
      if (tags['contact:instagram']) socialMedia.instagram = tags['contact:instagram'];

      const addr = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:state']].filter(Boolean).join(', ');

      let digitalScore = 0;
      if (hasWebsite) digitalScore += 30;
      if (phone) digitalScore += 10;
      if (email) digitalScore += 10;
      if (Object.keys(socialMedia).length > 0) digitalScore += 15;
      if (openingHours) digitalScore += 10;
      if (addr) digitalScore += 5;
      if (tags.cuisine) digitalScore += 5;
      if (tags.brand) digitalScore += 5;
      digitalScore = Math.min(digitalScore, 100);

      const missingItems = [];
      if (!hasWebsite) missingItems.push('No Website');
      if (!phone) missingItems.push('No Phone');
      if (!email) missingItems.push('No Email');
      if (!Object.keys(socialMedia).length) missingItems.push('No Social Media');
      if (!openingHours) missingItems.push('No Hours');

      const bLat = el.lat || 0;
      const bLng = el.lon || 0;
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tags.name)}+${encodeURIComponent(addr)}`;

      return {
        id: `osm-${el.id}`,
        name: tags.name,
        industry: tag, icon,
        rating: 0, reviews: 0,
        address: addr,
        city: tags['addr:city'] || '',
        country: tags['addr:country'] || '',
        lat: bLat, lng: bLng,
        phone, email, website, hasWebsite,
        googleMapsUrl,
        primaryCategory: tags.amenity || tags.shop || tag,
        cuisine: tags.cuisine || '',
        digitalScore, missingItems, socialMedia,
        isChain: !!tags.brand, chainName: tags.brand || null, openingHours,
      };
    })
    .sort((a, b) => a.digitalScore - b.digitalScore);
}

export async function POST(request) {
  try {
    const { lat, lng, industry, radius = 5000 } = await request.json();

    // Try Nominatim first (fastest), fall back to Overpass
    let businesses = [];
    let source = '';

    try {
      const results = await searchNominatim(lat, lng, industry, radius);
      businesses = processNominatimResults(results, industry);
      source = 'Nominatim';
    } catch (nomErr) {
      console.log('Nominatim failed, trying Overpass:', nomErr.message);
      try {
        const data = await searchOverpass(lat, lng, industry, radius);
        businesses = processOverpassResults(data.elements || [], industry);
        source = 'Overpass';
      } catch (ovErr) {
        console.error('Both sources failed:', ovErr.message);
        return NextResponse.json(
          { error: 'Search servers are busy. Please try again in a few seconds.' },
          { status: 504 }
        );
      }
    }

    return NextResponse.json({ businesses, totalFound: businesses.length, source });
  } catch (error) {
    console.error('Scan error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
