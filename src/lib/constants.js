export const INDUSTRIES = [
  { value: 'all', label: 'All Industries', icon: '🏢', query: '' },
  { value: 'restaurant', label: 'Restaurants & Cafes', icon: '🍽️', query: 'restaurants' },
  { value: 'hotel', label: 'Hotels & Hospitality', icon: '🏨', query: 'hotels' },
  { value: 'hospital', label: 'Hospitals & Clinics', icon: '🏥', query: 'hospitals' },
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
  { value: 'pharmacy', label: 'Pharmacies', icon: '💊', query: 'pharmacies' },
  { value: 'coaching', label: 'Coaching Centers', icon: '📚', query: 'coaching centers' },
];

export const POPULAR_LOCATIONS = [
  // India - Major Cities
  { label: 'Hyderabad, Telangana', value: 'Hyderabad, Telangana, India' },
  { label: 'Bangalore, Karnataka', value: 'Bangalore, Karnataka, India' },
  { label: 'Mumbai, Maharashtra', value: 'Mumbai, Maharashtra, India' },
  { label: 'New Delhi', value: 'New Delhi, India' },
  { label: 'Chennai, Tamil Nadu', value: 'Chennai, Tamil Nadu, India' },
  { label: 'Pune, Maharashtra', value: 'Pune, Maharashtra, India' },
  { label: 'Kolkata, West Bengal', value: 'Kolkata, West Bengal, India' },
  // India - Tier 2/3 Cities (user's area)
  { label: 'Madanapalli, Andhra Pradesh', value: 'Madanapalle, Annamayya, Andhra Pradesh, India' },
  { label: 'Tirupati, Andhra Pradesh', value: 'Tirupati, Andhra Pradesh, India' },
  { label: 'Chittoor, Andhra Pradesh', value: 'Chittoor, Andhra Pradesh, India' },
  { label: 'Kadapa, Andhra Pradesh', value: 'Kadapa, Andhra Pradesh, India' },
  { label: 'Kurnool, Andhra Pradesh', value: 'Kurnool, Andhra Pradesh, India' },
  { label: 'Anantapur, Andhra Pradesh', value: 'Anantapur, Andhra Pradesh, India' },
  { label: 'Vijayawada, Andhra Pradesh', value: 'Vijayawada, Andhra Pradesh, India' },
  { label: 'Visakhapatnam, Andhra Pradesh', value: 'Visakhapatnam, Andhra Pradesh, India' },
  { label: 'Nellore, Andhra Pradesh', value: 'Nellore, Andhra Pradesh, India' },
  { label: 'Warangal, Telangana', value: 'Warangal, Telangana, India' },
  { label: 'Coimbatore, Tamil Nadu', value: 'Coimbatore, Tamil Nadu, India' },
  { label: 'Mysore, Karnataka', value: 'Mysore, Karnataka, India' },
  { label: 'Vizag, Andhra Pradesh', value: 'Visakhapatnam, Andhra Pradesh, India' },
  // International
  { label: 'Dubai, UAE', value: 'Dubai, UAE' },
  { label: 'New York, USA', value: 'New York City, USA' },
  { label: 'London, UK', value: 'London, United Kingdom' },
  { label: 'Singapore', value: 'Singapore' },
  { label: 'Toronto, Canada', value: 'Toronto, Canada' },
  { label: 'Sydney, Australia', value: 'Sydney, Australia' },
];

// Legacy - kept for backward compatibility
export const COUNTRIES = [
  {
    value: 'in',
    label: '🇮🇳 India',
    cities: [
      { value: 'madanapalli', label: 'Madanapalli, AP', lat: 13.5500, lng: 78.5000 },
      { value: 'hyderabad', label: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
      { value: 'bangalore', label: 'Bangalore', lat: 12.9716, lng: 77.5946 },
      { value: 'mumbai', label: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { value: 'delhi', label: 'New Delhi', lat: 28.6139, lng: 77.2090 },
      { value: 'chennai', label: 'Chennai', lat: 13.0827, lng: 80.2707 },
      { value: 'tirupati', label: 'Tirupati', lat: 13.6288, lng: 79.4192 },
      { value: 'chittoor', label: 'Chittoor', lat: 13.2172, lng: 79.1003 },
      { value: 'vijayawada', label: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
      { value: 'visakhapatnam', label: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
    ],
  },
  {
    value: 'us',
    label: '🇺🇸 United States',
    cities: [
      { value: 'new-york', label: 'New York City, NY', lat: 40.7128, lng: -74.0060 },
      { value: 'los-angeles', label: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
      { value: 'chicago', label: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
      { value: 'houston', label: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
      { value: 'miami', label: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
    ],
  },
  {
    value: 'ae',
    label: '🇦🇪 UAE',
    cities: [
      { value: 'dubai', label: 'Dubai', lat: 25.2048, lng: 55.2708 },
      { value: 'abu-dhabi', label: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
    ],
  },
  {
    value: 'uk',
    label: '🇬🇧 United Kingdom',
    cities: [
      { value: 'london', label: 'London', lat: 51.5074, lng: -0.1278 },
      { value: 'manchester', label: 'Manchester', lat: 53.4808, lng: -2.2426 },
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
