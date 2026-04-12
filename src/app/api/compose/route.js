import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { business, tone, channel } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback for demo mode
      const isEmail = channel === 'email';
      const gap = business?.missingItems?.[0] || 'your website';
      return NextResponse.json({
        subject: isEmail ? `${business?.name || 'Your Business'} + Digital Growth` : null,
        body: `Hi there,\n\nI was looking into ${business?.name || 'your business'} and noticed a massive opportunity regarding ${gap.toLowerCase()}. \n\nBusinesses fixing this see a 40% jump in inbound leads. I built HexaInd TAC to solve exactly this.\n\nAre you open to a quick 5-minute chat to see how we’d fix this for you?\n\nBest,\nHexaInd Team`
      });
    }

    const prompt = `
    You are an elite B2B sales copywriter.
    Write a hyper-personalized outreach message for a local business.
    
    BUSINESS PROFILE:
    Name: ${business.name}
    Industry: ${business.industry}
    Address: ${business.address}
    Identified Gaps: ${business.missingItems.join(', ')}

    PARAMETERS:
    Channel: ${channel} (e.g. Email, LinkedIn, WhatsApp)
    Tone: ${tone} (e.g. professional, direct, conversational, aggressive)

    REQUIREMENTS:
    1. If Email, include a Subject Line.
    2. Hook them in the first sentence by mentioning their business name and a specific gap we found.
    3. Keep it under 100 words. Short, punchy, value-driven.
    4. Provide a clear, low-friction call to action.
    5. Return ONLY pure JSON with "subject" (if email, else null) and "body".

    Example format:
    {
      "subject": "Quick question about [Business Name]",
      "body": "Hi there,\\n\\n..."
    }
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8 }
      })
    });

    if (!response.ok) throw new Error('Failed to generate copy');
    const data = await response.json();
    
    let aiText = data.candidates[0].content.parts[0].text;
    aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(aiText));

  } catch (error) {
    console.error('Compose API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
