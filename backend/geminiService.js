/**
 * @file geminiService.js
 * @description Google Gemini AI service for the AI Sustainability Coach feature.
 * Handles all interactions with the Gemini 1.5 Flash model safely and efficiently.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { getCachedValue, setCachedValue } from './utils/cache.js';

// --- Model Configuration ---
const MODEL_NAME = 'gemini-2.0-flash';

// Strict system instruction to keep the AI on-topic and safe
const SYSTEM_INSTRUCTION = `You are an expert AI Sustainability Coach for the CoolEarth platform by Sage Corp.
Your ONLY purpose is to analyze a user's carbon footprint activity logs and provide concise, personalized, and actionable coaching advice.

Rules you MUST follow:
1. Respond ONLY with a valid JSON object. Do not add markdown fences, explanations, or any text outside the JSON.
2. Base your advice strictly on the user's provided log data. Be specific, not generic.
3. The JSON object must have exactly this shape:
   {
     "headline": "A short, encouraging headline (max 10 words)",
     "summary": "A 2-3 sentence motivational overview of the user's progress.",
     "tips": [
       { "category": "travel|energy|food|waste|shopping", "tip": "A specific, actionable tip (1-2 sentences).", "impact": "Low|Medium|High" }
     ],
     "challenge": "One specific, personalized challenge for this week based on their weak area.",
     "kudos": "A short, genuine compliment about their best performing area."
   }
4. Generate exactly 3 tips, one for each of the top 3 categories in the user's data.
5. Never discuss topics unrelated to carbon footprint reduction and sustainability.
6. Keep language positive, encouraging, and direct — avoid jargon.`;

// Safety settings to block harmful content
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Generation config: low temperature for factual, consistent output
const GENERATION_CONFIG = {
  temperature: 0.6,
  topK: 32,
  topP: 1,
  maxOutputTokens: 1024,
};

/**
 * Lazy-initializes the Gemini AI client.
 * Throws a clear error if the API key is missing.
 * @returns {import('@google/generative-ai').GenerativeModel}
 */
function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the backend environment variables.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: SYSTEM_INSTRUCTION,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: GENERATION_CONFIG,
  });
}

/**
 * Generates personalized AI coaching tips based on a summary of user carbon logs.
 *
 * @param {Object} userLogsSummary - A structured summary of the user's activity.
 * @param {string} userLogsSummary.userName - The display name of the user.
 * @param {number} userLogsSummary.totalSaved - Total CO2 saved in kg.
 * @param {number} userLogsSummary.totalPoints - Total cool points earned.
 * @param {Object} userLogsSummary.categoryBreakdown - CO2 savings per category.
 * @param {Array}  userLogsSummary.recentLogs - Recent 5 log entries for context.
 * @returns {Promise<Object>} The structured coaching response parsed from JSON.
 */
export async function generateCoachingTips(userLogsSummary) {
  const cacheKey = `gemini:${JSON.stringify(userLogsSummary)}`;
  const cached = getCachedValue(cacheKey, 5 * 60 * 1000);

  if (cached) {
    return cached;
  }

  const model = getModel();

  const userPrompt = `
Analyze the following user data and generate coaching advice:

User: ${userLogsSummary.userName}
Total CO2 Saved: ${userLogsSummary.totalSaved.toFixed(2)} kg
Total Cool Points: ${userLogsSummary.totalPoints}

Category Breakdown (kg CO2 saved):
${Object.entries(userLogsSummary.categoryBreakdown)
  .map(([cat, val]) => `  - ${cat}: ${val.toFixed(2)} kg`)
  .join('\n')}

Recent Activity Logs (most recent first):
${userLogsSummary.recentLogs
  .slice(0, 5)
  .map((log, i) => `  ${i + 1}. [${log.category}] "${log.description}" — ${log.savings} kg CO2 saved`)
  .join('\n')}

Provide the JSON coaching response now.
`.trim();

  const result = await model.generateContent(userPrompt);
  const responseText = result.response.text();

  // Strip potential markdown code fences just in case
  const cleaned = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    setCachedValue(cacheKey, parsed, 5 * 60 * 1000);
    return parsed;
  } catch {
    throw new Error(`Gemini returned invalid JSON. Raw response: ${responseText.substring(0, 200)}`);
  }
}
