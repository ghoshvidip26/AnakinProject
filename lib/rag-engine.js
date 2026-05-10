const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
});

// Industry Grade: Using local Hugging Face Transformers for embeddings
let embeddingPipeline;

const KNOWLEDGE_BASE_PATH = path.join(__dirname, '../data/knowledge_base.json');

async function getEmbeddingPipeline() {
    if (!embeddingPipeline) {
        const { pipeline } = await import('@huggingface/transformers');
        embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return embeddingPipeline;
}

async function generateLocalEmbedding(text) {
    const extractor = await getEmbeddingPipeline();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

class RAGEngine {
    constructor() {
        this.knowledgeBase = [];
        this.history = [];
    }

    loadKnowledgeBase() {
        if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
            try {
                this.knowledgeBase = JSON.parse(fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf8'));
                logger.info(`📡 RAG Engine: Loaded ${this.knowledgeBase.length} records.`);
            } catch (err) {
                logger.error("Error loading knowledge base:", err.message);
            }
        }
    }

    async search(query, options = {}) {
        const { limit = 5, category = null } = options;
        if (this.knowledgeBase.length === 0) this.loadKnowledgeBase();
        
        try {
            const queryVector = await generateLocalEmbedding(query);

            let filteredKB = this.knowledgeBase;
            if (category) {
                filteredKB = filteredKB.filter(e => 
                    e.category.some(c => c.toLowerCase().includes(category.toLowerCase()))
                );
            }

            const scoredEvents = filteredKB.map(event => ({
                ...event,
                similarity: cosineSimilarity(queryVector, event.embedding)
            }));

            return scoredEvents
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);
        } catch (err) {
            logger.error("Search error:", err.message);
            return [];
        }
    }

    async query(userMessage) {
        let detectedCategory = null;
        if (userMessage.toLowerCase().includes('ai')) detectedCategory = 'AI';
        if (userMessage.toLowerCase().includes('fintech')) detectedCategory = 'Fintech';

        const relevantEvents = await this.search(userMessage, { category: detectedCategory });
        
        const context = relevantEvents.map(e => (
            `- ID: ${e.url} | Title: ${e.title} | Venue: ${e.venue} | Date: ${e.date} | Category: ${e.category.join(', ')} | URL: ${e.url}`
        )).join('\n');

        const prompt = `
You are the Anakin Event Intelligence Bot. 
Return a structured JSON response to help developers find events in Bengaluru.

CURRENT CONTEXT:
${context || "No specific events found."}

USER QUESTION:
${userMessage}

RESPONSE SCHEMA:
{
  "summary": "A professional 2-3 sentence overview of the findings.",
  "events": [
    {
      "title": "Event Name",
      "url": "Original URL",
      "date": "Formatted Date",
      "venue": "Location Name",
      "description": "Short 1-sentence highlight of why this is relevant to the user.",
      "category": ["Tag1", "Tag2"]
    }
  ],
  "intelligence_brief": "Strategic advice for the user based on these events."
}

INSTRUCTIONS:
- Be precise.
- Only include events from the context.
- Ensure all URLs are active.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Validate JSON
            const jsonResponse = JSON.parse(text);
            
            this.history.push({ role: 'user', text: userMessage });
            this.history.push({ role: 'bot', text: jsonResponse.summary });
            
            return jsonResponse;
        } catch (err) {
            logger.error("RAG Query error:", err.message);
            return {
                summary: "I'm having trouble formatting my response. Please try again.",
                events: [],
                intelligence_brief: "Check your connection or API quota."
            };
        }
    }
}

module.exports = new RAGEngine();
