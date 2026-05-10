const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // Note: The Node SDK doesn't have a direct listModels method on the genAI object usually, 
        // but we can try to fetch from the API directly if needed.
        // However, let's try 'text-embedding-004' again but ensure we are using the right version.
        
        console.log("Attempting to embed with 'text-embedding-004' on v1...");
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent("Hello world");
        console.log("Success! text-embedding-004 works.");
    } catch (err) {
        console.error("Error with text-embedding-004:", err.message);
        
        try {
            console.log("Attempting to embed with 'embedding-001'...");
            const model = genAI.getGenerativeModel({ model: "embedding-001" });
            const result = await model.embedContent("Hello world");
            console.log("Success! embedding-001 works.");
        } catch (err2) {
            console.error("Error with embedding-001:", err2.message);
            
            try {
                console.log("Attempting to embed with 'models/embedding-001' (full path)...");
                const model = genAI.getGenerativeModel({ model: "models/embedding-001" });
                const result = await model.embedContent("Hello world");
                console.log("Success! models/embedding-001 works.");
            } catch (err3) {
                console.error("Error with models/embedding-001:", err3.message);
            }
        }
    }
}

listModels();
