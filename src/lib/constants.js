export const INDUSTRIES = [
  { value: 'all', label: 'All Industries', icon: '🏢', query: '' },
  { value: 'restaurant', label: 'Restaurants & Cafes', icon: '🍽️', query: 'restaurants' },
  { value: 'hotel', label: 'Hotels & Hospitality', icon: '🏨', query: 'hotels' },
  { value: 'retail', label: 'Retail & Shopping', icon: '🛍️', query: 'retail stores' },
  { value: 'saas', label: 'SaaS & Tech Companies', icon: '💻', query: 'software companies' },
  { value: 'healthcare', label: 'Healthcare & Wellness', icon: '🏥', query: 'healthcare clinics' },
  { value: 'realestate', label: 'Real Estate', icon: '🏗️', query: 'real estate agencies' },
  { value: 'education', label: 'Education', icon: '🎓', query: 'schools academies' },
  { value: 'fitness', label: 'Fitness & Gym', icon: '💪', query: 'gyms fitness centers' },
  { value: 'beauty', label: 'Beauty & Salon', icon: '💇', query: 'beauty salons' },
  { value: 'automotive', label: 'Automotive', icon: '🚗', query: 'car dealerships auto repair' },
  { value: 'legal', label: 'Legal Services', icon: '⚖️', query: 'law firms attorneys' },
  { value: 'finance', label: 'Finance & Banking', icon: '🏦', query: 'financial services' },
  { value: 'construction', label: 'Construction', icon: '🔨', query: 'construction companies' },
  { value: 'marketing', label: 'Marketing Agencies', icon: '📣', query: 'marketing agencies' },
  { value: 'cleaning', label: 'Cleaning Services', icon: '🧹', query: 'cleaning services' },
  { value: 'plumbing', label: 'Plumbing & HVAC', icon: '🔧', query: 'plumbing hvac' },
  { value: 'dental', label: 'Dental Clinics', icon: '🦷', query: 'dental clinics' },
];

export const COUNTRIES = [
  {
    value: 'us',
    label: '🇺🇸 United States',
    cities: [
      { value: 'newark-nj', label: 'Newark, New Jersey', lat: 40.7357, lng: -74.1724 },
      { value: 'washington-dc', label: 'Washington, D.C.', lat: 38.9072, lng: -77.0369 },
      { value: 'new-york', label: 'New York City, NY', lat: 40.7128, lng: -74.0060 },
      { value: 'jersey-city', label: 'Jersey City, NJ', lat: 40.7178, lng: -74.0431 },
      { value: 'los-angeles', label: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
      { value: 'chicago', label: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
      { value: 'houston', label: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
      { value: 'miami', label: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
      { value: 'dallas', label: 'Dallas, TX', lat: 32.7767, lng: -96.7970 },
      { value: 'atlanta', label: 'Atlanta, GA', lat: 33.7490, lng: -84.3880 },
      { value: 'philadelphia', label: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652 },
      { value: 'san-francisco', label: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
    ],
  },
  {
    value: 'in',
    label: '🇮🇳 India',
    cities: [
      { value: 'hyderabad', label: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
      { value: 'bangalore', label: 'Bangalore', lat: 12.9716, lng: 77.5946 },
      { value: 'mumbai', label: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { value: 'delhi', label: 'New Delhi', lat: 28.6139, lng: 77.2090 },
      { value: 'chennai', label: 'Chennai', lat: 13.0827, lng: 80.2707 },
      { value: 'pune', label: 'Pune', lat: 18.5204, lng: 73.8567 },
      { value: 'kolkata', label: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    ],
  },
  {
    value: 'uk',
    label: '🇬🇧 United Kingdom',
    cities: [
      { value: 'london', label: 'London', lat: 51.5074, lng: -0.1278 },
      { value: 'manchester', label: 'Manchester', lat: 53.4808, lng: -2.2426 },
      { value: 'birmingham', label: 'Birmingham', lat: 52.4862, lng: -1.8904 },
      { value: 'edinburgh', label: 'Edinburgh', lat: 55.9533, lng: -3.1883 },
    ],
  },
  {
    value: 'ae',
    label: '🇦🇪 UAE',
    cities: [
      { value: 'dubai', label: 'Dubai', lat: 25.2048, lng: 55.2708 },
      { value: 'abu-dhabi', label: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
      { value: 'sharjah', label: 'Sharjah', lat: 25.3463, lng: 55.4209 },
    ],
  },
  {
    value: 'ca',
    label: '🇨🇦 Canada',
    cities: [
      { value: 'toronto', label: 'Toronto', lat: 43.6532, lng: -79.3832 },
      { value: 'vancouver', label: 'Vancouver', lat: 49.2827, lng: -123.1207 },
      { value: 'montreal', label: 'Montreal', lat: 45.5017, lng: -73.5673 },
    ],
  },
  {
    value: 'au',
    label: '🇦🇺 Australia',
    cities: [
      { value: 'sydney', label: 'Sydney', lat: -33.8688, lng: 151.2093 },
      { value: 'melbourne', label: 'Melbourne', lat: -37.8136, lng: 144.9631 },
      { value: 'brisbane', label: 'Brisbane', lat: -27.4698, lng: 153.0251 },
    ],
  },
  {
    value: 'de',
    label: '🇩🇪 Germany',
    cities: [
      { value: 'berlin', label: 'Berlin', lat: 52.5200, lng: 13.4050 },
      { value: 'munich', label: 'Munich', lat: 48.1351, lng: 11.5820 },
      { value: 'hamburg', label: 'Hamburg', lat: 53.5511, lng: 9.9937 },
    ],
  },
  {
    value: 'sg',
    label: '🇸🇬 Singapore',
    cities: [
      { value: 'singapore', label: 'Singapore', lat: 1.3521, lng: 103.8198 },
    ],
  },
  {
    value: 'jp',
    label: '🇯🇵 Japan',
    cities: [
      { value: 'tokyo', label: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { value: 'osaka', label: 'Osaka', lat: 34.6937, lng: 135.5023 },
    ],
  },
  {
    value: 'br',
    label: '🇧🇷 Brazil',
    cities: [
      { value: 'sao-paulo', label: 'São Paulo', lat: -23.5505, lng: -46.6333 },
      { value: 'rio', label: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
    ],
  },
];

export const PIPELINE_STAGES = [
  { id: 'discovered', label: 'Discovered', color: 'var(--accent-blue)', icon: '🔍' },
  { id: 'analyzed', label: 'Analyzed', color: 'var(--accent-violet)', icon: '🧠' },
  { id: 'contacted', label: 'Contacted', color: 'var(--accent-cyan)', icon: '📤' },
  { id: 'replied', label: 'Replied', color: 'var(--accent-amber)', icon: '💬' },
  { id: 'meeting', label: 'Meeting Set', color: 'var(--accent-emerald)', icon: '📅' },
  { id: 'converted', label: 'Converted', color: 'var(--accent-emerald)', icon: '🎉' },
];

export const MESSAGE_TONES = [
  { value: 'professional', label: 'Professional', icon: '👔' },
  { value: 'casual', label: 'Casual & Friendly', icon: '😊' },
  { value: 'consultative', label: 'Consultative', icon: '🎯' },
  { value: 'urgent', label: 'Urgent / FOMO', icon: '⚡' },
];

export const CHANNELS = [
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '📱' },
];

export const GAP_SEVERITIES = {
  critical: { label: 'Critical', color: 'var(--accent-rose)', bg: 'var(--accent-rose-dim)' },
  high: { label: 'High', color: 'var(--accent-amber)', bg: 'var(--accent-amber-dim)' },
  medium: { label: 'Medium', color: 'var(--accent-cyan)', bg: 'var(--accent-cyan-dim)' },
  low: { label: 'Low', color: 'var(--accent-emerald)', bg: 'var(--accent-emerald-dim)' },
};
