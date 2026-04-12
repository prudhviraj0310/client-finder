import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { business } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback if no Gemini key — simulate high-end analysis
      return NextResponse.json({
        gaps: business.missingItems.map((item, i) => ({
          id: `gap-${i}`,
          title: item,
          severity: item.includes('Website') || item.includes('Phone') ? 'critical' : 'high',
          description: `The business is currently losing customers because it lacks ${item.toLowerCase()}.`,
          evidence: `Scanner detected no ${item.toLowerCase()} attached to the Google/OSM profile.`,
          opportunity: `Implement ${item.toLowerCase()} to immediately boost trust and inbound leads.`,
          pitchAngle: `I noticed you're missing ${item.toLowerCase()}. Did you know 80% of customers abandon businesses they can't verify online? I can set this up for you in 48 hours.`
        })),
        websiteAudit: {
          overall: 0, mobile: 0, speed: 0, seo: 0,
          issues: [
            { type: 'critical', text: 'No digital footprint detected.' },
            { type: 'high', text: 'Lost local visibility for high-intent searches.' }
          ]
        },
        competitors: [
          { name: 'Local Competitor A', score: 85, rating: 4.5, reviews: 120 },
          { name: 'Local Competitor B', score: 78, rating: 4.2, reviews: 85 }
        ],
        techStack: [],
        missingTech: ['Website Builder/CMS', 'SEO Tools', 'Booking System', 'CRM']
      });
    }

    // Call Gemini API to generate real hyper-personalized analysis
    const prompt = `
    You are an elite B2B sales strategist and digital auditor.
    Analyze the following business and output a pure JSON response containing a gap analysis and pitch materials.

    BUSINESS DATA:
    Name: ${business.name}
    Industry: ${business.industry}
    Address: ${business.address}
    Current Score: ${business.digitalScore}/100
    Missing Elements: ${business.missingItems.join(', ')}

    Return ONLY pure JSON (no markdown fences, no \`\`\`, just the JSON object).
    The JSON must follow exactly this schema:
    {
      "gaps": [
        {
          "id": "string",
          "title": "string (The core problem)",
          "severity": "critical|high|medium|low",
          "description": "string (Why this hurts their revenue)",
          "evidence": "string (Proof from the data)",
          "opportunity": "string (What happens if we fix it)",
          "pitchAngle": "string (A 2-sentence highly personalized cold outreach hook)"
        }
      ],
      "websiteAudit": {
        "overall": number (0-100),
        "mobile": number,
        "speed": number,
        "seo": number,
        "issues": [{"type": "critical|high|medium|low", "text": "string"}]
      },
      "competitors": [
        {"name": "string (invent 2 highly realistic competitor profiles for this area)", "score": number, "rating": number, "reviews": number}
      ],
      "techStack": ["string (predicted based on industry)"],
      "missingTech": ["string (what we should sell them)"]
    }
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) throw new Error('Gemini API call failed');
    const data = await response.json();
    
    // Parse Gemini's JSON
    let aiText = data.candidates[0].content.parts[0].text;
    aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(aiText);

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
