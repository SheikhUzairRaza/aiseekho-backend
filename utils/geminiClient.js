require('dotenv').config();
const { ai } = require('../config/gemini');
const crypto = require('crypto');

// Configurable via .env (fallbacks provided)
const MAX_TOKENS = parseInt(process.env.GEMINI_MAX_TOKENS) || 1500;
const RETRY_COUNT = 2; // safe default, can be adjusted later

// Simple in‑memory cache: hash → {response, timestamp}
const cache = new Map();

function hashPrompt(prompt, model) {
  return crypto.createHash('sha256').update(model + ':' + prompt).digest('hex');
}

/**
 * Calls Gemini with retry, token budgeting and optional caching.
 * @param {Object} options {model, prompt, cacheKey?}
 * @returns {Promise<string>} raw response text from Gemini
 */
async function generateContent({ model, prompt, cacheKey }) {
  const key = cacheKey || hashPrompt(prompt, model);
  if (cache.has(key)) return cache.get(key).response;

  for (let attempt = 0; attempt < RETRY_COUNT; ++attempt) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: MAX_TOKENS,
          responseMimeType: 'application/json',
          temperature: 0.0,
        },
      });
      const text = response.text;
      cache.set(key, { response: text, timestamp: Date.now() });
      return text;
    } catch (e) {
      if (attempt === RETRY_COUNT - 1) throw e;
      // exponential back‑off before next retry
      await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)));
    }
  }
}

module.exports = { generateContent };
