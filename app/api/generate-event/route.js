import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis rate limiter
// (finally using the installed @upstash/ratelimit package)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute per user
  analytics: true,
});

export async function POST(req) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Apply rate limiting per authenticated user
  const { success, limit, remaining, reset } = await ratelimit.limit(userId);
  if (!success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. You can generate 5 events per minute.',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // 3. Parse and validate input
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { prompt: description } = body;

  if (!description || typeof description !== 'string') {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  // Sanitize: strip any prompt injection attempts
  const sanitizedDescription = description
    .replace(/ignore previous instructions/gi, '')
    .replace(/system:/gi, '')
    .trim()
    .slice(0, 1000); // Max 1000 chars

  if (sanitizedDescription.length < 10) {
    return NextResponse.json(
      { error: 'Description too short. Please describe your event in more detail.' },
      { status: 400 }
    );
  }

  // 4. Call OpenRouter AI
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        max_tokens: 800, // Always set a limit
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `You are an event planner. Return ONLY valid JSON: {"title": "string", "description": "string", "category": "tech|music|sports|art|food|business|health|education|gaming|networking|outdoor|community", "suggestedCapacity": 50, "suggestedTicketType": "free"}. No markdown.`,
          },
          {
            role: 'user',
            content: `Create an event based on this description: ${sanitizedDescription}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    let rawContent = data.choices[0]?.message?.content?.trim() || '';

    // Strip markdown code fences if present
    if (rawContent.startsWith('```')) {
      rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    // Parse and validate AI response
    let eventData;
    try {
      eventData = JSON.parse(rawContent);
    } catch {
      throw new Error('AI returned invalid JSON');
    }

    // Validate required fields exist
    if (!eventData.title || !eventData.description) {
      throw new Error('AI response missing required fields');
    }

    return NextResponse.json(eventData);
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      {
        error: 'AI generation temporarily unavailable. Please try again or fill in the details manually.',
      },
      { status: 503 }
    );
  }
}