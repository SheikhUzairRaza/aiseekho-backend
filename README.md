# AI-Seekho Orchestrator Backend 🧠

The Node.js/Express engine powering the agentic service marketplace. This server orchestrates multiple Google Gemini-based agents to provide a seamless end-to-end service lifecycle.

## 🛠️ Multi-Agent Architecture
- **Workflow Agent**: The primary controller that manages state and dynamic pricing.
- **Intent Agent**: NLP engine for multilingual parsing (Roman Urdu/Urdu/English).
- **Matcher Agent**: Decision engine that scores providers based on 6+ reliability factors.
- **Dispute Agent**: Autonomous arbiter for resolution of customer complaints.

## 🚀 Quick Start

1. **Setup Environment**
   ```bash
   npm install
   cp .env.example .env # Add your GEMINI_API_KEY
   ```

2. **Launch Server**
   ```bash
   node index.js
   ```

## 📡 API Interface
- `POST /api/chat`: Primary endpoint for processing natural language requests.
- `POST /api/simulate-cancel`: Trigger the self-healing rerouting workflow.
- `POST /api/complete`: Verify service quality and update provider metrics.
- `GET /api/history`: Retrieve authenticated user/provider service logs.
