const fs = require('fs');
const path = require('path');
const logger = require('./lib/logger');

function checkOutput() {
    logger.info("🧐 Reviewing Industry-Grade Scrape Output...");
    
    const dataDir = path.join(__dirname, 'data');
    const files = ['luma_results.json', 'meetup_results.json', 'eventbrite_results.json'];
    
    files.forEach(file => {
        const filePath = path.join(dataDir, file);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const count = Array.isArray(data.events) ? data.events.length : 0;
            logger.success(`${file}: Found ${count} up-to-date events in persistent storage.`);
            
            if (count > 0) {
                const first = data.events[0];
                console.log(`   - Sample Event: "${first.title}"`);
                console.log(`   - Sector: ${first.category?.join(', ') || 'General'}`);
                console.log(`   - Date: ${first.date}`);
            }
        } else {
            logger.warn(`${file}: Not found in data/ directory. Run 'npm run scrape' first.`);
        }
    });

    const kbPath = path.join(dataDir, 'knowledge_base.json');
    if (fs.existsSync(kbPath)) {
        const kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
        logger.success(`Knowledge Base: ${kb.length} events indexed and ready for RAG.`);
    }
}

checkOutput();
