// ─── LifeSync OS — AI Client & Generation Infrastructure ─────────────
// Robust `@google/genai` wrapper with caching, rate limit protection,
// and guaranteed deterministic fallback generation.

import { GoogleGenAI } from "@google/genai";
import { sanitizeMedicalLanguage } from "./safety";

// In-memory cache to prevent duplicate LLM calls during rapid re-renders
const responseCache = new Map<string, { timestamp: number; data: unknown }>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

function getCached<T>(key: string): T | null {
  const item = responseCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return item.data as T;
}

function setCache<T>(key: string, data: T): void {
  responseCache.set(key, { timestamp: Date.now(), data });
}

/**
 * Executes a structured AI request using Google Gemini.
 * If API Key is absent, network fails, or output schema fails to parse,
 * seamlessly returns the provided deterministic fallback without crashing.
 */
export async function generateStructuredAiResponse<T>(
  prompt: string,
  fallbackGenerator: () => T,
  cacheKey?: string
): Promise<T> {
  if (cacheKey) {
    const cached = getCached<T>(cacheKey);
    if (cached) return cached;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    const fallback = fallbackGenerator();
    if (cacheKey) setCache(cacheKey, fallback);
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3, // Lower temperature for consistent analytical results
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Empty AI response received.");
    }

    const sanitized = sanitizeMedicalLanguage(rawText);
    const parsed = JSON.parse(sanitized) as T;

    if (cacheKey) setCache(cacheKey, parsed);
    return parsed;
  } catch (err) {
    console.warn("[Health AI Client] Error or rate limit; using fallback generator:", err);
    const fallback = fallbackGenerator();
    if (cacheKey) setCache(cacheKey, fallback);
    return fallback;
  }
}
