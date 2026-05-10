const { execSync } = require('child_process');

/**
 * scrape-all.js
 * 
 * Orchestrates the execution of all three event scrapers:
 * 1. Luma (scrape-luma.js)
 * 2. Meetup (scrape_meetup.js) - Interactive
 * 3. Eventbrite (scrape-eventbrite.js)
 * 
 * This script runs them sequentially to ensure terminal output is readable
 * and to allow the Meetup interactive setup to work correctly.
 */

async function main() {
    console.log("========================================");
    console.log("   ANAKIN EVENT SCRAPER MASTER SUITE    ");
    console.log("========================================\n");

    try {
        console.log(">> Phase 1: Scraping Luma (Bengaluru)...");
        execSync('node scrape-luma.js', { stdio: 'inherit' });
        console.log("\n----------------------------------------\n");

        console.log(">> Phase 2: Scraping Meetup (Interactive Setup Required)...");
        // Running with 'inherit' so you can respond to the location/date prompts
        execSync('node scrape_meetup.js', { stdio: 'inherit' });
        console.log("\n----------------------------------------\n");

        console.log(">> Phase 3: Scraping Eventbrite (Science & Tech)...");
        execSync('node scrape-eventbrite.js', { stdio: 'inherit' });
        console.log("\n----------------------------------------\n");

        console.log("SUCCESS: All scraping jobs completed.");
        console.log("Check the individual result files for structured JSON output:");
        console.log("- luma_results.json");
        console.log("- meetup_results.json");
        console.log("- eventbrite_results.json");
        console.log("\n========================================\n");

        // Set up cleanup logic
        const fs = require('fs');
        const path = require('path');
        const filesToClean = [
            'luma_results.json',
            'meetup_results.json',
            'eventbrite_results.json'
        ];

        const cleanup = () => {
            console.log("\n[Cleanup] Removing temporary session JSON files...");
            for (const file of filesToClean) {
                const filePath = path.join(__dirname, file);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted: ${file}`);
                }
            }
            console.log("Session closed safely.");
            process.exit(0);
        };

        // Handle process exits safely
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

        // Keep terminal active for the session
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question("Session Active. Press Ctrl+C or type 'exit' to close the session and delete temporary files: ", (answer) => {
            if (answer.trim().toLowerCase() === 'exit') {
                cleanup();
            } else {
                console.log("Invalid input, session still active. Press Ctrl+C to close.");
            }
        });

    } catch (error) {
        console.error("\n[!] ERROR: One of the scrapers encountered an issue.");
        console.error("The workflow has been paused. Please check the logs above.");
    }
}

main();
