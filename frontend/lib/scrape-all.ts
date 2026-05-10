import { execSync } from 'child_process';

/**
 * scrape-all.ts
 * 
 * Orchestrates the execution of all three event scrapers.
 */

async function main() {
    console.log("========================================");
    console.log("   ANAKIN EVENT SCRAPER MASTER SUITE    ");
    console.log("========================================\n");

    try {
        console.log(">> Phase 1: Scraping Luma (Bengaluru)...");
        // Using npx tsx to run the TS scripts directly
        execSync('npx tsx lib/scrape-luma.ts', { stdio: 'inherit' });
        console.log("\n----------------------------------------\n");

        console.log(">> Phase 2: Scraping Meetup (Interactive Setup Required)...");
        execSync('npx tsx lib/scrape-meetup.ts', { stdio: 'inherit' });
        console.log("\n----------------------------------------\n");

        console.log(">> Phase 3: Scraping Eventbrite (Science & Tech)...");
        execSync('npx tsx lib/scrape-eventbrite.ts', { stdio: 'inherit' });
        console.log("\n----------------------------------------\n");

        console.log("SUCCESS: All scraping jobs completed.");
        console.log("Check the individual result files for structured JSON output.");
        console.log("========================================");

    } catch (error) {
        console.error("\n[!] ERROR: One of the scrapers encountered an issue.");
        console.error("The workflow has been paused. Please check the logs above.");
    }
}

main();
