const logger = require('./lib/logger');
const fs = require('fs');
const path = require('path');

async function validate() {
    logger.info("🚀 Starting Industry-Grade Validation...");

    const checks = [
        { name: "Environment Check", path: ".env", validator: (c) => c.includes('GEMINI_API_KEY') && !c.includes('YOUR_GEMINI_API_KEY_HERE') },
        { name: "Data Directory", path: "data", isDir: true },
        { name: "Scraper Suite", path: "scrape-all.js" },
        { name: "RAG Engine", path: "lib/rag-engine.js" },
        { name: "Brain Builder", path: "lib/brain-builder.js" }
    ];

    let passed = 0;

    for (const check of checks) {
        const fullPath = path.join(__dirname, check.path);
        let exists = fs.existsSync(fullPath);
        
        // Industry Grade: Auto-remediation
        if (!exists && check.name === "Data Directory") {
            logger.info("🔧 Auto-remediating: Creating missing Data Directory...");
            fs.mkdirSync(fullPath);
            exists = true;
        }

        if (exists) {
            if (check.isDir && !fs.lstatSync(fullPath).isDirectory()) {
                logger.error(`❌ ${check.name} failed: Path exists but is not a directory.`);
            } else if (check.validator && !check.validator(fs.readFileSync(fullPath, 'utf8'))) {
                logger.warn(`⚠️ ${check.name} needs attention: File exists but configuration is incomplete.`);
            } else {
                logger.success(`${check.name} is ready.`);
                passed++;
            }
        } else {
            logger.error(`❌ ${check.name} failed: Path not found at ${fullPath}`);
        }
    }

    console.log("\n----------------------------------------");
    logger.info(`VALIDATION SUMMARY: ${passed}/${checks.length} PASSED`);
    console.log("----------------------------------------\n");

    if (passed === checks.length) {
        logger.success("System is fully Industry-Grade! Ready for production scrape.");
    } else {
        logger.warn("System has some pending items. Please check the logs above.");
    }
}

validate();
