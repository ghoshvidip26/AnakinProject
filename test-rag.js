const ragEngine = require('./lib/rag-engine');
const logger = require('./lib/logger');

async function testRAG() {
    logger.info("🔍 Testing Anakin RAG Model (Structured Mode)...");
    
    const query = "What are the best AI meetups happening in Bangalore?";
    console.log(`\nQuery: "${query}"`);
    console.log("Processing...");

    try {
        const response = await ragEngine.query(query);
        
        console.log("\n----------------------------------------");
        console.log("🤖 STRUCTURED ROBOT RESPONSE:");
        console.log("----------------------------------------");
        
        console.log(`\n📝 SUMMARY: \n${response.summary}`);
        
        console.log(`\n📅 UPCOMING EVENTS (${response.events.length}):`);
        response.events.forEach((e, i) => {
            console.log(`\n${i + 1}. [${e.title}]`);
            console.log(`   🔗 Link: ${e.url}`);
            console.log(`   📍 Venue: ${e.venue}`);
            console.log(`   🕒 Date: ${e.date}`);
            console.log(`   💡 Highlight: ${e.description}`);
        });

        console.log(`\n🧠 INTELLIGENCE BRIEF: \n${response.intelligence_brief}`);
        console.log("----------------------------------------\n");

    } catch (err) {
        logger.error("Test Failed:", err.message);
    }
}

testRAG();
