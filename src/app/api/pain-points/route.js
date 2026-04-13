import { NextResponse } from 'next/server';

const INDUSTRY_PAIN_POINTS = {
  'hospitals': [
    { pain: 'No online appointment booking system', severity: 'critical', impact: 'Losing 40% of patients who prefer online booking to phone calls' },
    { pain: 'Poor Google visibility / no SEO', severity: 'critical', impact: 'Patients search "hospital near me" and find competitors instead' },
    { pain: 'No patient review management', severity: 'high', impact: 'Negative reviews drive away 80% of potential patients' },
    { pain: 'Outdated or no website', severity: 'high', impact: 'Patients can\'t find services, doctors list, or timings online' },
    { pain: 'No WhatsApp/chat for patient queries', severity: 'medium', impact: 'Patients go to competitors who respond faster' },
    { pain: 'Manual patient records (no HMS)', severity: 'high', impact: 'Errors, delays, and poor patient experience' },
    { pain: 'No social media / health content', severity: 'medium', impact: 'Missing free marketing and patient education opportunity' },
    { pain: 'No online payment option', severity: 'medium', impact: 'Patients prefer contactless payments post-COVID' },
  ],
  'hotels': [
    { pain: 'No booking engine on website', severity: 'critical', impact: 'Paying 15-25% commission to OTAs like MakeMyTrip/Booking.com' },
    { pain: 'Poor Google Maps listing', severity: 'critical', impact: 'Travelers can\'t find the hotel or see outdated info' },
    { pain: 'No review management strategy', severity: 'high', impact: 'One bad review reduces bookings by 30%' },
    { pain: 'No social media presence', severity: 'medium', impact: 'Missing Instagram/Facebook marketing = invisible to millennials' },
    { pain: 'Outdated website not mobile-friendly', severity: 'high', impact: '75% of hotel searches happen on mobile' },
    { pain: 'No WhatsApp booking/inquiry', severity: 'medium', impact: 'Guests prefer chat over phone calls' },
  ],
  'restaurants': [
    { pain: 'No online ordering / delivery system', severity: 'critical', impact: 'Paying 25-35% commission to Swiggy/Zomato' },
    { pain: 'Poor Google Maps listing', severity: 'critical', impact: 'Diners can\'t find menu, photos, or timings' },
    { pain: 'No table reservation system', severity: 'high', impact: 'Losing group bookings and event catering' },
    { pain: 'Bad review management', severity: 'high', impact: 'One viral negative review can destroy business' },
    { pain: 'No loyalty/rewards program', severity: 'medium', impact: 'Customers have no reason to return vs competitors' },
    { pain: 'No social media food photography', severity: 'medium', impact: 'Missing viral marketing from food photos' },
  ],
  'healthcare clinics': [
    { pain: 'No online appointment system', severity: 'critical', impact: 'Patients wait on phone or walk in, causing drop-offs' },
    { pain: 'No digital patient records', severity: 'high', impact: 'Paper records cause errors, delays, and lost history' },
    { pain: 'Poor online visibility', severity: 'high', impact: 'Patients search online first, find competitors' },
    { pain: 'No telemedicine/video consultation', severity: 'medium', impact: 'Losing patients who want remote consultations' },
    { pain: 'No patient feedback system', severity: 'medium', impact: 'Can\'t improve service without feedback data' },
  ],
  'dental clinics': [
    { pain: 'No online booking/reminders', severity: 'critical', impact: 'Dental patients need reminders — 40% miss appointments' },
    { pain: 'No before/after gallery online', severity: 'high', impact: 'Patients want to see results before choosing a dentist' },
    { pain: 'Poor Google reviews management', severity: 'high', impact: 'Dental decisions heavily rely on online reviews' },
    { pain: 'No payment plans displayed online', severity: 'medium', impact: 'Cost-conscious patients skip if pricing isn\'t clear' },
  ],
  'default': [
    { pain: 'No professional website', severity: 'critical', impact: 'Invisible to 80% of potential customers who search online' },
    { pain: 'Poor Google Maps / business listing', severity: 'critical', impact: 'Customers searching nearby can\'t find the business' },
    { pain: 'No online booking or inquiry form', severity: 'high', impact: 'Losing customers who prefer self-service' },
    { pain: 'No social media marketing', severity: 'high', impact: 'Missing free advertising and community building' },
    { pain: 'No customer review management', severity: 'medium', impact: 'Unmanaged reviews hurt reputation' },
    { pain: 'No WhatsApp Business / chat support', severity: 'medium', impact: 'Customers expect instant messaging support' },
    { pain: 'No email marketing or CRM', severity: 'low', impact: 'No repeat business generation system' },
  ],
};

export async function POST(request) {
  try {
    const { industry, location, businessName } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Try Gemini AI first
    if (apiKey) {
      try {
        const prompt = `You are a business consultant specializing in ${industry || 'local businesses'} in India.

Analyze the common problems and pain points that ${industry || 'businesses'} in ${location || 'small cities in India'} typically face.
${businessName ? `Specifically for a business named "${businessName}".` : ''}

Return a JSON array of 6-8 pain points. Each object should have:
- "pain": string (the problem they face, specific and actionable)
- "severity": "critical" | "high" | "medium" | "low"
- "impact": string (concrete business impact with numbers/stats if possible)

Focus on digital/technology gaps, customer experience issues, and operational inefficiencies.
Return ONLY the JSON array, no markdown or extra text.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7 },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
          const painPoints = JSON.parse(aiText);
          return NextResponse.json({ painPoints, source: 'ai' });
        }
      } catch (aiErr) {
        console.log('Gemini pain points failed:', aiErr.message);
      }
    }

    // Fallback: hardcoded industry pain points
    const key = industry?.toLowerCase() || 'default';
    const painPoints = INDUSTRY_PAIN_POINTS[key] || INDUSTRY_PAIN_POINTS['default'];

    return NextResponse.json({ painPoints, source: 'fallback' });
  } catch (error) {
    console.error('Pain points error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
