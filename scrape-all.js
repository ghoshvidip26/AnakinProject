const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs');
const { buildBrain } = require('./lib/brain-builder');
const logger = require('./lib/logger');

const execPromise = util.promisify(exec);

/**
 * Moves a result file to persistent storage
 */
function persistFile(fileName) {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    const src = path.join(__dirname, fileName);
    const dest = path.join(dataDir, fileName);
    
    if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
        logger.success(`Moved ${fileName} to persistent data/ directory.`);
        return true;
    }
    return false;
}

/**
 * Runs a scraper script and immediately persists its output
 */
async function runScraper(scriptName, resultFile) {
    logger.info(`Starting Scraper: ${scriptName}...`);
    try {
        // Run with NON_INTERACTIVE flag for industry-grade automation
        const { stdout, stderr } = await execPromise(`node ${scriptName}`, {
            env: { ...process.env, NON_INTERACTIVE: "true" }
        });
        
        if (stderr && !stderr.includes('Warning')) {
            logger.warn(`Scraper ${scriptName} output:`, stderr);
        }
        
        const success = persistFile(resultFile);
        if (success) {
            logger.success(`Completed and Persisted: ${scriptName}`);
        } else {
            logger.warn(`Scraper ${scriptName} finished but ${resultFile} was not found.`);
        }
        return true;
    } catch (error) {
        logger.error(`Scraper ${scriptName} failed:`, error.message);
        return false;
    }
}

async function main() {
    logger.info("========================================");
    logger.info("   ANAKIN INDUSTRY-GRADE SCRAPER SUITE  ");
    logger.info("========================================\n");

    try {
        // Run all scrapers
        // We run Luma and Eventbrite in parallel, then Meetup
        logger.info(">> Phase 1: Running Parallel Scrapers (Luma & Eventbrite)...");
        await Promise.allSettled([
            runScraper('scrape-luma.js', 'luma_results.json'),
            runScraper('scrape-eventbrite.js', 'eventbrite_results.json')
        ]);

        logger.info(">> Phase 2: Running Meetup Scraper...");
        await runScraper('scrape_meetup.js', 'meetup_results.json');

        logger.info(">> Phase 3: Rebuilding AI Knowledge Base (RAG)...");
        await buildBrain();

        logger.success("All scraping and AI indexing jobs completed successfully.");
        logger.info("Run 'node test-output.js' to see the exact data indexed.");
        
    } catch (error) {
        logger.error("Master Suite encountered a fatal error:", error.message);
    }
}

if (require.main === module) {
    main().catch(err => logger.error("Fatal Process Error:", err));
}
