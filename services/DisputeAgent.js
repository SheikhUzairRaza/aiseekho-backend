const { generateContent } = require('../utils/geminiClient');

class DisputeAgent {
  async handleDispute(booking, complaint) {
    const prompt = `
    You are the Dispute & Escalation Agent for an AI Service Orchestrator.
    
    BOOKING DETAILS:
    ${JSON.stringify(booking, null, 2)}
    
    USER COMPLAINT:
    "${complaint}"
    
    Your goal is to analyze the situation and provide a fair resolution.
    Resolution options:
    1. REFUND: Partial or full refund if quality is poor.
    2. COMPENSATION: Credit for future service if there was a major delay or no-show.
    3. RE-WORK: Provider must return to fix the issue for free.
    4. ESCALATE: Send to a human agent if the dispute is complex.
    5. DENY: If the complaint seems invalid or fraudulent.
    
    Return a JSON object with:
    {
      "resolution": "REFUND" | "COMPENSATION" | "RE-WORK" | "ESCALATE" | "DENY",
      "reasoning": "Reason for the decision",
      "action_details": "Specifics (e.g., amount of refund, percentage of credit)",
      "confidence_score": 0-100
    }
    `;

    try {
      const raw = await generateContent({
        model: 'gemini-2.5-flash',
        prompt,
      });
      return JSON.parse(raw);
    } catch (error) {
      console.error('[DisputeAgent] Error:', error);
      return {
        resolution: "ESCALATE",
        reasoning: "System error during dispute processing. Escalating to human.",
        action_details: "Human agent will review within 24 hours.",
        confidence_score: 0
      };
    }
  }
}

module.exports = new DisputeAgent();
