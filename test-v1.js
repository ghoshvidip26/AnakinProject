const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testV1() {
    console.log("Attempting to use v1 endpoint with text-embedding-004...");
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Explicitly set apiVersion to v1
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" }, { apiVersion: 'v1' });
        const result = await model.embedContent("test");
        console.log("SUCCESS with text-embedding-004 on v1!");
    } catch (err) {
        console.error("FAILED with text-embedding-004 on v1:", err.message);
        
        console.log("\nAttempting with 'embedding-001' on v1...");
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "embedding-001" }, { apiVersion: 'v1' });
            const result = await model.embedContent("test");
            console.log("SUCCESS with embedding-001 on v1!");
        } catch (err2) {
            console.error("FAILED with embedding-001 on v1:", err2.message);
        }
    }
}

testV1();
