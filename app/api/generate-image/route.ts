/**
 * API Route: /api/generate-image
 * Purpose: Securely generate images via OpenAI's gpt-image-1 model using the user's prompt.
 * How it works: Accepts a JSON POST body with { prompt, n, size, quality } and returns image URLs or base64 data.
 * Security: Uses OPENAI_API_KEY from environment, never exposes key to client.
 * Author/Model: GPT-4.1
 * Date: 2025-05-19
 */

import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { prompt, n = 1, size = "1024x1024", quality = "standard" } = await request.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required." }), { status: 400 });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // Call OpenAI image generation
    // Note: response_format is not supported for gpt-image-1, so we omit it (API returns URLs by default)
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n,
      size,
      quality
    });
    // Log the response for debugging
    console.log("OpenAI image response:", JSON.stringify(response.data));
    // Return both url and b64_json if present
    return new Response(JSON.stringify({ data: response.data }), { status: 200 });
  } catch (error) {
    console.error("Error in generate-image API:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500 });
  }
}
