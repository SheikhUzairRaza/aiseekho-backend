const { GoogleGenAI } = require('@google/genai');

require('dotenv').config();

// Initialize the client. Make sure GEMINI_API_KEY is in your .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

module.exports = { ai };
