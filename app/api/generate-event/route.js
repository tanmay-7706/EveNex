import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an event planner. Return ONLY valid JSON: {\"title\": \"string\", \"description\": \"string\", \"category\": \"tech|music|sports|art|food|business|health|education|gaming|networking|outdoor|community\", \"suggestedCapacity\": 50, \"suggestedTicketType\": \"free\"}. No markdown."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    let text = completion.choices[0]?.message?.content?.trim() || "";
    
    if (text.startsWith("```")) {
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Error:", error.message);
    return NextResponse.json({ error: "Failed to generate event" }, { status: 500 });
  }
}