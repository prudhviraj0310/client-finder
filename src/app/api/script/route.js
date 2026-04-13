import { NextResponse } from 'next/server';

const FALLBACK_SCRIPTS = {
  'hospitals': {
    opening: "Hi, am I speaking with the manager or administrator? Great! My name is [Your Name], and I work with hospitals in [City] to help them get more patients through their doors. I noticed your hospital on Google Maps and had a quick question — are you currently getting enough patient inquiries from online searches?",
    painPoints: [
      "Most hospitals in smaller cities lose 40% of potential patients because they don't have online appointment booking",
      "When patients search 'hospital near me', your competitors with better Google listings get those patients instead",
      "Negative reviews on Google that aren't responded to drive away 80% of potential patients",
    ],
    objectionHandling: {
      "We already have enough patients": "That's great to hear! But are those patients finding you through online search, or is it mostly word-of-mouth? In 2-3 years, 80% of new patients will search online first — we want to make sure you're capturing that traffic before competitors do.",
      "We don't need a website": "I completely understand. But consider this — when a patient searches 'best hospital in [City]', right now your competitor shows up. A simple website with your services, doctors, and booking would change that instantly.",
      "It's too expensive": "I hear you. That's why we offer packages starting at just ₹5,000/month — which is less than the revenue from even one extra patient. And unlike advertising, this keeps working 24/7.",
      "We'll think about it": "Absolutely, take your time. Can I just send you a quick 2-minute video showing exactly what we'd build for you? That way when you discuss it with your team, everyone can see the vision. What's the best WhatsApp number to send it to?",
    },
    closingScript: "Look, I don't want to take more of your time. Here's what I'd like to do — I'll prepare a free digital audit of your hospital's online presence. It takes us 24 hours, and it'll show you exactly where you're losing patients to competitors. There's absolutely no cost or commitment. Can I have your email or WhatsApp to send it to you by tomorrow?",
    keyTalkingPoints: [
      "70% of patients now search online before choosing a hospital",
      "Hospitals with online booking see 3x more appointments",
      "Google reviews are the #1 factor in hospital selection",
      "Your competitor [mention one] already has a strong online presence",
      "We've helped 15+ hospitals in the region increase patient footfall by 40%",
    ],
  },
  'hotels': {
    opening: "Hi, is this the owner or general manager? Hello sir/ma'am, my name is [Your Name]. I help hotels in [City] stop paying 20-25% commission to OTAs like MakeMyTrip and Booking.com. I was looking at your hotel online and I think you might be losing a lot of money to these platforms. Do you have 2 minutes?",
    painPoints: [
      "Hotels pay ₹500-2000 per booking to OTAs as commission — that's lakhs per year",
      "Most travelers search 'hotels near [landmark]' on Google — if you're not showing up, you're invisible",
      "Hotels without their own booking website are 100% dependent on third-party platforms",
    ],
    objectionHandling: {
      "We get enough bookings from OTAs": "That's great — but how much commission are you paying? A direct booking system means every booking you get directly saves you ₹500-2000. Even 10 direct bookings a month saves ₹10,000-20,000.",
      "We don't need a website": "What if I told you that for less than one month's OTA commission, you could have a professional website with a booking engine that pays for itself within the first month?",
      "It's too expensive": "Our solutions start at just ₹3,000/month — compare that to the ₹50,000+ you're paying to OTAs annually. It literally pays for itself.",
    },
    closingScript: "Let me do this — I'll prepare a free comparison showing how much you're currently paying in OTA commissions versus what you'd save with direct bookings. No cost, no obligation. Can I get your WhatsApp to send it over by end of day?",
    keyTalkingPoints: [
      "Average hotel saves ₹2-5 lakhs/year by getting direct bookings",
      "Hotels with Google Business optimization see 60% more walk-ins",
      "A professional website with booking costs less than 2 months of OTA fees",
      "We can integrate with your existing OTA channels seamlessly",
    ],
  },
  'default': {
    opening: "Hi, am I speaking with the owner or manager? Great! My name is [Your Name], and I help local businesses in [City] grow their customer base through digital presence. I was looking at your business online and noticed some opportunities that could bring in more customers. Do you have 2 minutes?",
    painPoints: [
      "80% of customers search online before visiting a business — if you're not visible, you're losing them",
      "Businesses without a website lose credibility compared to competitors who have one",
      "Unmanaged Google reviews can destroy a business's reputation",
    ],
    objectionHandling: {
      "We don't need it": "I understand. But let me ask you this — when was the last time you yourself searched for something on Google before buying? Your customers do the same thing. We just want to make sure they find YOU, not your competitor.",
      "It's too expensive": "Our packages start at very affordable rates. In fact, the cost of NOT being online is much higher — you're losing customers every day to competitors who are visible online.",
      "We'll think about it": "Absolutely! Can I send you a free report showing exactly where your business stands online vs your top 3 competitors? That way you can make an informed decision. What's your WhatsApp?",
    },
    closingScript: "Here's what I suggest — let me prepare a free digital audit of your business. It shows exactly where you stand online, what your competitors are doing, and the specific opportunities you're missing. Zero cost, zero obligation. Can I send it to your WhatsApp by tomorrow?",
    keyTalkingPoints: [
      "97% of consumers search online for local businesses",
      "Businesses with a strong online presence grow 2.8x faster",
      "We've helped 50+ businesses in the region increase their revenue",
      "First 3 months ROI guaranteed or we work for free",
    ],
  },
};

export async function POST(request) {
  try {
    const { industry, location, businessName, painPoints } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Try Gemini AI first
    if (apiKey) {
      try {
        const prompt = `You are an expert B2B cold calling coach for a digital agency in India.

Generate a COMPLETE cold calling script for calling ${industry || 'local businesses'} in ${location || 'Indian cities'}.
${businessName ? `The specific business is: "${businessName}"` : ''}
${painPoints ? `Their specific problems include: ${JSON.stringify(painPoints)}` : ''}

The caller is a team member from a digital agency that offers website development, SEO, Google Business optimization, social media marketing, and online booking systems.

Return a JSON object with EXACTLY these keys:
{
  "opening": "Opening script — how to introduce yourself naturally (2-3 sentences)",
  "painPoints": ["3-4 specific pain points to mention during the call"],
  "objectionHandling": {
    "Common objection 1": "Response to handle it",
    "Common objection 2": "Response to handle it",
    "Common objection 3": "Response to handle it",
    "Common objection 4": "Response to handle it"
  },
  "closingScript": "How to close the call and secure next steps (2-3 sentences)",
  "keyTalkingPoints": ["4-5 key statistics or talking points to use"]
}

Make the scripts:
1. Natural and conversational, NOT salesy or robotic
2. Specific to ${industry || 'the industry'} in ${location || 'Indian cities'}
3. Include real statistics and numbers
4. Use Indian business context (₹ amounts, Indian platforms like Justdial, Google Maps)
5. Focus on ROI and practical benefits

Return ONLY the JSON object, no markdown formatting.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.8 },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
          const script = JSON.parse(aiText);
          return NextResponse.json({ script, source: 'ai' });
        }
      } catch (aiErr) {
        console.log('Gemini script failed:', aiErr.message);
      }
    }

    // Fallback: hardcoded scripts
    const key = industry?.toLowerCase() || 'default';
    const script = FALLBACK_SCRIPTS[key] || FALLBACK_SCRIPTS['default'];

    // Personalize placeholders
    const personalize = (text) => {
      if (typeof text === 'string') {
        return text.replace(/\[City\]/g, location || 'your city').replace(/\[Your Name\]/g, 'our team');
      }
      return text;
    };

    const personalizedScript = {
      opening: personalize(script.opening),
      painPoints: script.painPoints.map(personalize),
      objectionHandling: Object.fromEntries(
        Object.entries(script.objectionHandling).map(([k, v]) => [k, personalize(v)])
      ),
      closingScript: personalize(script.closingScript),
      keyTalkingPoints: script.keyTalkingPoints.map(personalize),
    };

    return NextResponse.json({ script: personalizedScript, source: 'fallback' });
  } catch (error) {
    console.error('Script error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
