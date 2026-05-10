const { buildBrain } = require('./lib/brain-builder');
const logger = require('./lib/logger');

async function testHF() {
    logger.info("🧪 Testing Local Hugging Face Embedding Model...");
    try {
        // We'll just run a part of buildBrain or a simple embedding test
        const { pipeline } = await import('@huggingface/transformers');
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        const output = await extractor("This is a test event for Bengaluru AI meetups", { pooling: 'mean', normalize: true });
        
        if (output.data && output.data.length > 0) {
            logger.success(`Local model is working! Vector size: ${output.data.length}`);
            logger.info("Sample values: " + Array.from(output.data).slice(0, 5).join(', '));
        } else {
            logger.error("Model returned no data.");
        }
    } catch (err) {
        logger.error("Local Model Test Failed:", err.message);
        console.error(err);
    }
}

testHF();
