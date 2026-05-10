const fs = require('fs');
const path = require('path');
const logger = require('./logger');
require('dotenv').config();

// Industry Grade: Using local Hugging Face Transformers for embeddings
let pipeline;

const DATA_DIR = path.join(__dirname, '../data');
const KNOWLEDGE_BASE_PATH = path.join(DATA_DIR, 'knowledge_base.json');

/**
 * Lazy-loads the embedding pipeline
 */
async function getPipeline() {
    if (!pipeline) {
        const { pipeline: hfPipeline } = await import('@huggingface/transformers');
        logger.info("📡 Loading local embedding model (all-MiniLM-L6-v2)...");
        pipeline = await hfPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        logger.success("Model loaded successfully.");
    }
    return pipeline;
}

/**
 * Generates embeddings using the local model
 */
async function generateEmbedding(text) {
    const extractor = await getPipeline();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

async function buildBrain() {
    logger.info("🧠 Starting Industry-Grade Brain Builder (Local Transformers)...");

    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

    let existingBrain = [];
    if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
        try {
            existingBrain = JSON.parse(fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf8'));
            logger.info(`Loaded existing brain with ${existingBrain.length} records.`);
        } catch (err) {
            logger.warn("Could not parse existing knowledge base, starting fresh.");
        }
    }

    const sourceFiles = [
        'luma_results.json',
        'meetup_results.json',
        'eventbrite_results.json'
    ];

    let allNewEvents = [];
    const seenUrls = new Set(existingBrain.map(e => e.url));

    for (const fileName of sourceFiles) {
        const filePath = path.join(DATA_DIR, fileName);
        if (fs.existsSync(filePath)) {
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const events = Array.isArray(data.events) ? data.events : [];
                
                logger.info(`Processing ${events.length} events from ${fileName}`);
                
                events.forEach(event => {
                    if (!seenUrls.has(event.url)) {
                        allNewEvents.push(event);
                        seenUrls.add(event.url);
                    }
                });
            } catch (err) {
                logger.error(`Error reading ${fileName}:`, err.message);
            }
        }
    }

    if (allNewEvents.length === 0) {
        logger.success("No new events to index. Brain is already up to date.");
        return;
    }

    logger.info(`🔄 Generating embeddings for ${allNewEvents.length} NEW events locally...`);

    const newBrainRecords = [];

    for (let i = 0; i < allNewEvents.length; i++) {
        const event = allNewEvents[i];
        const textToEmbed = `Event: ${event.title}. Category: ${event.category.join(', ')}. Venue: ${event.venue}. Date: ${event.date}. Organizer: ${event.organizer}. Source: ${event.source || 'Unknown'}.`;
        
        try {
            const embedding = await generateEmbedding(textToEmbed);
            
            newBrainRecords.push({
                ...event,
                embedding: embedding,
                searchContent: textToEmbed,
                indexedAt: new Date().toISOString()
            });
            
            if ((i + 1) % 5 === 0) logger.info(`  - Embedded ${i + 1}/${allNewEvents.length} events...`);
        } catch (err) {
            logger.error(`Failed to embed event "${event.title}":`, err.message);
        }
    }

    const updatedBrain = [...existingBrain, ...newBrainRecords];
    fs.writeFileSync(KNOWLEDGE_BASE_PATH, JSON.stringify(updatedBrain, null, 2));
    logger.success(`✅ Brain successfully updated! Total records: ${updatedBrain.length}`);
}

if (require.main === module) {
    buildBrain().catch(err => logger.error("Fatal Error in Brain Builder:", err));
}

module.exports = { buildBrain };
