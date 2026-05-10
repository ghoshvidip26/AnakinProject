import * as dotenv from 'dotenv';
dotenv.config();
import { parseMeetupEvents } from "./parseMeetupEvents";
import { normalizeEvent } from "./normalizer";
import { runAnakinScrape } from "./scrape-utils";
import * as readline from 'readline';
import * as fs from 'fs';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string) => new Promise<string>(resolve => rl.question(query, resolve));

(async () => {
    try {
        console.log('\n=== Meetup Scraper Interactive Setup ===');
        console.log('Leave any option blank and press Enter to use the default value.\n');

        const locationInput = await askQuestion('1. Enter Location (e.g. in--Bangalore, us--ny--new-york) [default: in--Bangalore]: ');
        const location = locationInput || 'in--Bangalore';
        
        const eventType = await askQuestion('2. Enter Event Type (inPerson, online) [default: both]: ');
        
        const dateRangeInput = await askQuestion('3. Enter Date Range (today, tomorrow, this-week, this-weekend, next-week) [default: any-day]: ');
        const dateRange = dateRangeInput || 'any-day';

        rl.close();

        const queryParams = new URLSearchParams({
            location: location,
            source: 'EVENTS',
        });
        if (eventType) queryParams.append('eventType', eventType);
        if (dateRange && dateRange !== 'any-day') queryParams.append('dateRange', dateRange);

        const meetupUrl = `https://www.meetup.com/find/?${queryParams.toString()}`;
        console.log(`Starting scrape for Meetup: ${meetupUrl}`);

        const job = await runAnakinScrape(meetupUrl, 25000);

        console.log("\n\n--- Scrape Completed ---");

        const html = job.html || job.content || job.result;

        if (html) {
            console.log("Parsing HTML with Meetup Parser...");
            fs.writeFileSync("debug_meetup.html", html);

            const rawEvents = parseMeetupEvents(html);
            const events = rawEvents.map((e: any) => normalizeEvent(e, "Meetup"));

            console.log(`Found ${events.length} events:\n`);
            console.log(JSON.stringify({ status: "success", total_events: events.length, events: events }, null, 2));
        } else {
            console.log("No HTML found in the response.");
        }

    } catch (err: any) {
        console.error("\nError:", err.message);
        rl.close();
    }
})();
