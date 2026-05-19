// Updated IntentAgent using shared geminiClient
const { generateContent } = require('../utils/geminiClient');
const fs = require('fs');
const path = require('path');

// Load prompt from external file
const INTENT_PROMPT_PATH = path.resolve(__dirname, '../prompts/intent.txt');
const INTENT_PROMPT = fs.readFileSync(INTENT_PROMPT_PATH, 'utf-8');

const KEYWORD_MAP = [
  { keywords: ['ac', 'air condition', 'aircondition', 'cooling', 'coolin', 'thanda', 'refrigerat', 'gas bhar', 'compressor', 'outer', 'ac wala', 'ac thik', 'ac kharab'], type: 'ac_technician' },
  { keywords: ['plumb', 'pipe', 'leak', 'nali', 'tap', 'geyser', 'motor', 'toilet', 'bathroom', 'paani', 'tanki', 'nal', 'sink', 'boring', 'flush', 'commode', 'washroom'], type: 'plumber' },
  { keywords: ['electric', 'wiring', 'bijli', 'fan', 'switch', 'bulb', 'light', 'ups', 'generator', 'current', 'short', 'shart', 'db', 'breaker', 'stablizer', 'moter'], type: 'electrician' },
  { keywords: ['beauty', 'makeup', 'salon', 'hair', 'baal', 'bridal', 'facial', 'mehendi', 'manicure', 'pedicure', 'party makeup', 'dulhan', 'khubsurat', 'threading', 'wax', 'cutting'], type: 'beautician' },
  { keywords: ['tutor', 'teacher', 'ustad', 'math', 'science', 'english', 'physics', 'chemistry', 'biology', 'padhai', 'padhao', 'maths', 'home tuition', 'academy', 'parhai'], type: 'tutor' },
  { keywords: ['driver', 'gaadi', 'chauffeur', 'chauffer', 'pick', 'drop', 'driving'], type: 'driver' },
  { keywords: ['mechanic', 'tuning', 'engine', 'repair', 'car', 'gari', 'gaadi kharab'], type: 'mechanic' },
  { keywords: ['clean', 'cleaning', 'safai', 'deep', 'sofa', 'carpet', 'fumigation', 'kera maar'], type: 'home_service' },
  { keywords: ['carpenter', 'paint', 'painter', 'wood', 'furniture', 'lakri', 'polish'], type: 'small_pro' }
];
function keywordFallback(input) {
  const lower = input.toLowerCase();
  let service_type = null;
  for (const { keywords, type } of KEYWORD_MAP) {
    if (keywords.some(k => lower.includes(k))) {
      service_type = type;
      break;
    }
  }

  let preferred_time = null;
  if (lower.includes('subah') || lower.includes('morning')) preferred_time = 'morning';
  else if (lower.includes('dopeher') || lower.includes('afternoon') || lower.includes('din')) preferred_time = 'afternoon';
  else if (lower.includes('sham') || lower.includes('evening') || lower.includes('raat')) preferred_time = 'evening';

  return service_type ? { service_type, preferred_time } : null;
}
function safeParse(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    const required = ["service_type", "urgency", "budget_preference", "confidence", "missing_info"];
    const hasRequired = required.every(k => Object.prototype.hasOwnProperty.call(parsed, k));
    if (!hasRequired) return null;
    // preferred_time and job_complexity are optional but should exist in the object
    if (!Object.prototype.hasOwnProperty.call(parsed, "preferred_time")) parsed.preferred_time = null;
    if (!Object.prototype.hasOwnProperty.call(parsed, "job_complexity")) parsed.job_complexity = "basic";
    return parsed;
  } catch { return null; }
}
async function withRetry(fn, attempts = 2) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e) { lastError = e; await new Promise(r => setTimeout(r, 200 * Math.pow(2, i))); }
  }
  throw lastError;
}
class IntentAgent {
  async parseIntent(userInput) {
    const directMatch = keywordFallback(userInput);
    if (directMatch && directMatch.service_type) {
      console.log(`[IntentAgent] Layer 0 Match: ${directMatch.service_type} (Saved tokens!)`);
      return { 
        service_type: directMatch.service_type, 
        location: null, 
        urgency: "medium", 
        budget_preference: "standard", 
        preferred_time: directMatch.preferred_time,
        job_complexity: "basic",
        confidence: 90, 
        missing_info: [] 
      };
    }
    const prompt = INTENT_PROMPT.replace('${userInput}', userInput);
    const callGemini = async () => {
      return await generateContent({ model: 'gemini-2.5-flash', prompt });
    };
    let rawResponse;
    try { rawResponse = await withRetry(callGemini); }
    catch (error) {
      console.error('IntentAgent Gemini call failed after retries:', error);
      const fallback = keywordFallback(userInput);
      return { 
        service_type: fallback?.service_type || null, 
        location: null, 
        urgency: "unknown", 
        budget_preference: "unknown", 
        preferred_time: fallback?.preferred_time || null,
        confidence: fallback ? 50 : 0, 
        missing_info: fallback ? [] : ["service_type"] 
      };
    }
    let parsed = safeParse(rawResponse);
    if (!parsed || !parsed.service_type) {
      const fallback = keywordFallback(userInput);
      if (fallback && fallback.service_type) {
        console.log(`[IntentAgent] Gemini fallback to keyword -> ${fallback.service_type}`);
        parsed = { 
          service_type: fallback.service_type, 
          location: null, 
          urgency: parsed?.urgency || "medium", 
          budget_preference: parsed?.budget_preference || "standard", 
          preferred_time: parsed?.preferred_time || fallback.preferred_time,
          confidence: Math.max(parsed?.confidence || 0, 60), 
          missing_info: (parsed?.missing_info || []).filter(m => m !== 'service_type') 
        };
      } else {
        return { 
          service_type: null, 
          location: null, 
          urgency: "unknown", 
          budget_preference: "unknown", 
          preferred_time: parsed?.preferred_time || null,
          confidence: 0, 
          missing_info: ["service_type"] 
        };
      }
    }
    return parsed;
  }
}
module.exports = new IntentAgent();
