const { generateContent } = require('../utils/geminiClient');
const fs = require('fs');
const path = require('path');
const ProviderProfile = require('../models/ProviderProfile');

// Load external prompt template for matcher
const MATCHER_PROMPT_PATH = path.resolve(__dirname, '../prompts/matcher.txt');
const MATCHER_PROMPT_TEMPLATE = fs.readFileSync(MATCHER_PROMPT_PATH, 'utf-8');

class MatcherAgent {
  constructor() {
    // Simple in‑memory cache for distance calculations per request
    this.distanceCache = new Map(); // key: `${lat},${lng}:${provider.id}` → distance km (string)
  }

  // Haversine distance (km)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km
  }

  // Helper to get (or compute) distance with caching
  getDistanceWithCache(userLocation, provider) {
    const cacheKey = `${userLocation.lat},${userLocation.lng}:${provider._id}`;
    if (this.distanceCache.has(cacheKey)) return this.distanceCache.get(cacheKey);
    const dist = this.calculateDistance(
      userLocation.lat,
      userLocation.lng,
      provider.latitude || 33.6844,
      provider.longitude || 73.0479
    ).toFixed(2);
    this.distanceCache.set(cacheKey, dist);
    return dist;
  }

  async matchProviders(intent, userLocation = { lat: 33.6844, lng: 73.0479 }, city = "Islamabad") {
    // 1️⃣ Pre‑filter by city and service_type using MongoDB
    let query = { is_active: true };
    
    if (city) {
        query.city = { $regex: new RegExp(city, 'i') };
    }

    if (intent.service_type) {
        query.service_category = intent.service_type;
    }

    let candidates = await ProviderProfile.find(query).lean();
    
    if (candidates.length === 0 && intent.service_type) {
        // Relax city constraint if no providers found in specific city
        candidates = await ProviderProfile.find({ service_category: intent.service_type }).lean();
    }

    if (intent.preferred_time) {
      candidates = candidates.filter(p => {
        const pref = intent.preferred_time.toLowerCase();
        return p.availability && p.availability[pref] === true;
      });
      // If we filter too strictly and get 0 candidates, fallback to all service matches
      if (candidates.length === 0) {
        console.log(`[MatcherAgent] Strict time filtering yielded 0 results for "${intent.preferred_time}". Relaxing constraint.`);
        candidates = await ProviderProfile.find({ service_category: intent.service_type }).lean();
      }
    }

    // 2️⃣ Augment with distance and metrics
    const augmented = candidates.map(p => {
      return {
        ...p,
        id: p._id?.toString(),
        base_price: p.base_rate || 0,
        skills_array: p.skills || [],
        distance_km: this.getDistanceWithCache(userLocation, p),
        rating: p.metrics?.rating || 0,
        reliability_score: p.metrics?.reliability_score || 0,
        cancellation_rate: p.metrics?.cancellation_rate || 0,
        status: p.is_active ? "Available Now" : "Unavailable"
      };
    });

    // 3️⃣ Build prompt from external template
    const prompt = MATCHER_PROMPT_TEMPLATE
      .replace('${INTENT}', JSON.stringify(intent, null, 2))
      .replace('${PROVIDERS}', JSON.stringify(augmented, null, 2));

    let raw;
    try {
      raw = await generateContent({
        model: 'gemini-2.5-pro',
        prompt,
        cacheKey: `matcher:${JSON.stringify(intent)}:${JSON.stringify(userLocation)}`,
      });
    } catch (e) {
      console.error('[MatcherAgent] Gemini call failed → algorithmic fallback', e);
      return algorithmicFallback(augmented);
    }

    let topProviders;
    try {
      topProviders = JSON.parse(raw);
    } catch (e) {
      console.warn('[MatcherAgent] Invalid JSON from Gemini → fallback');
      return algorithmicFallback(augmented);
    }

    // Enrich Gemini results with full provider details
    const matched = topProviders
      .map(match => {
        const full =
          augmented.find(p => p.id === match.provider_id) ||
          augmented.find(p => p.name.toLowerCase() === match.name?.toLowerCase());
        if (!full) {
          console.warn(`[MatcherAgent] Provider not found for id="${match.provider_id}" name="${match.name}"`);
          return null;
        }
        return { ...full, match_score: match.match_score, reasoning: match.reasoning };
      })
      .filter(Boolean);

    return matched.length ? matched : algorithmicFallback(augmented);
  }
}

// Simple weighted fallback scoring (same as before)
function algorithmicFallback(candidates) {
  return candidates
    .map(p => ({
      ...p,
      match_score: Math.round(
        (p.rating / 5) * 40 +
        (p.reliability_score / 100) * 40 +
        ((100 - p.cancellation_rate) / 100) * 20
      ),
      reasoning: `Selected based on rating (${p.rating}★), reliability (${p.reliability_score}%), low cancellation (${p.cancellation_rate}%).`,
    }))
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3);
}

module.exports = new MatcherAgent();
