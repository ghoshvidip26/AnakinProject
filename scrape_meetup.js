require('dotenv').config();
const { parseMeetupEvents } = require("./lib/parseMeetupEvents.js");
const readline = require('readline');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const BASE = "https://api.anakin.io/v1";
const API_KEY = process.env.ANAKIN_API_KEY;

if (!API_KEY) {
    console.error("Error: ANAKIN_API_KEY is not set in your .env file");
    process.exit(1);
}

/**
 * Helper to make API requests to Anakin.io
 */
async function request(method, path, body) {
    try {
        const resp = await fetch(BASE + path, {
            method,
            headers: {
                "X-API-Key": API_KEY,
                "Content-Type": "application/json"
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!resp.ok) {
            const errData = await resp.json().catch(() => ({}));
            console.error(`API Error (${resp.status}):`, errData);
            return null;
        }

        return await resp.json();
    } catch (error) {
        console.error(`Request failed: ${error.message}`);
        return null;
    }
}

/**
 * Scrapes Meetup events from a given URL using Anakin.io's URL Scraper
 */
async function scrape(url) {
    console.log(`\nSubmitting scrape job for: ${url}...`);

    const submitted = await request("POST", "/url-scraper", {
        url,
        useBrowser: true,
        waitMs: 25000, // Increased from 15s to 25s for heavy React rendering
        generateJson: false 
    });

    if (!submitted || !submitted.jobId) {
        throw new Error("Failed to submit scrape job.");
    }

    const jobId = submitted.jobId;
    console.log(`Job submitted! ID: ${jobId}. Polling (up to 5 mins)...`);

    for (let i = 0; i < 100; i++) { // Increased from 60 to 100 attempts
        const job = await request("GET", `/url-scraper/${jobId}`);

        if (!job) {
            await new Promise(r => setTimeout(r, 3000));
            continue;
        }

        if (job.status === "completed") {
            return job;
        }

        if (job.status === "failed") {
            throw new Error(`Scrape failed: ${job.error}`);
        }

        process.stdout.write(".");
        await new Promise(r => setTimeout(r, 3000));
    }

    throw new Error("Timed out after 3 minutes");
}

// --- INTERACTIVE SETUP & EXECUTION ---

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

(async () => {
    try {
        console.log('\n=== Meetup Scraper Interactive Setup ===');
        console.log('Leave any option blank and press Enter to use the default value.\n');

        const location = await askQuestion('1. Enter Location (e.g. in--Bangalore, us--ny--new-york) [default: in--Bangalore]: ') || 'in--Bangalore';
        const eventType = await askQuestion('2. Enter Event Type (inPerson, online) [default: both]: ');
        const dateRange = await askQuestion('3. Enter Date Range (today, tomorrow, this-week, this-weekend, next-week) [default: any-day]: ') || 'any-day';

        rl.close();

        // Construct the URL dynamically based on filters
        const queryParams = new URLSearchParams({
            location: location,
            source: 'EVENTS',
        });
        if (eventType) queryParams.append('eventType', eventType);
        if (dateRange && dateRange !== 'any-day') queryParams.append('dateRange', dateRange);

        const meetupUrl = `https://www.meetup.com/find/?${queryParams.toString()}`;

        const job = await scrape(meetupUrl);

        console.log("\n\n--- Scrape Completed ---");

        const html = job.html || job.content || job.result;

        if (html) {
            console.log("Parsing HTML with Meetup Parser...");

            // Dump HTML for debugging
            const fs = require('fs');
            fs.writeFileSync("debug_meetup.html", html);

            const { normalizeEvent } = require("./lib/normalizer.js");
            const rawEvents = parseMeetupEvents(html);
            const events = rawEvents.map(e => normalizeEvent(e, "Meetup"));

            console.log(`Found ${events.length} events:\n`);
            console.log(JSON.stringify({ status: "success", total_events: events.length, events: events }, null, 2));
        } else {
            console.log("No HTML found in the response. Full job response:");
            console.log(JSON.stringify(job, null, 2));
        }

    } catch (err) {
        console.error("\nError:", err.message);
        rl.close();
    }
})();
