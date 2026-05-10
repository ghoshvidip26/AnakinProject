const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

async function listAllModels() {
    const API_KEY = process.env.GEMINI_API_KEY;
    console.log("Fetching FULL list of available models...");
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        
        if (data.error) {
            console.error("API Error:", data.error.message);
            return;
        }

        console.log("\n--- Recommended Stable Models ---");
        const stableModels = data.models.filter(m => 
            m.name.includes('gemini-1.5-flash') || 
            m.name.includes('gemini-1.5-pro')
        );
        
        stableModels.forEach(m => {
            console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(', ')})`);
        });

        console.log("\n--- All Available Models ---");
        data.models.forEach(m => {
            console.log(`- ${m.name}`);
        });

    } catch (err) {
        console.error("Fetch failed:", err.message);
    }
}

listAllModels();
