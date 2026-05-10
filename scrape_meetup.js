require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const ANAKIN_API_KEY = process.env.ANAKIN_API_KEY;
// --- INTERACTIVE FILTERING SETUP ---
const readline = require('readline');

if (!ANAKIN_API_KEY) {
    console.error('Error: ANAKIN_API_KEY is not set in .env file');
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
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
    await scrapeMeetup(meetupUrl);
}

async function scrapeMeetup(meetupUrl) {
    console.log(`\nStarting scrape for: ${meetupUrl}`);

    const payload = {
        url: meetupUrl,
        useBrowser: true,
        waitMs: 15000,
        generateJson: true
    };

    try {
        const response = await fetch('https://api.anakin.io/v1/url-scraper', {
            method: 'POST',
            headers: {
                'X-API-Key': ANAKIN_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(`Anakin API Error: ${JSON.stringify(data)}`);

        const jobId = data.jobId;
        console.log(`Job submitted. ID: ${jobId}`);

        let attempts = 0;
        while (attempts < 60) {
            attempts++;
            const res = await fetch(`https://api.anakin.io/v1/url-scraper/${jobId}`, {
                headers: { 'X-API-Key': ANAKIN_API_KEY }
            });
            const jobResult = await res.json();

            if (jobResult.status === 'completed') {
                console.log('Done!');
                
                // Write debug file
                const fs = require('fs');
                fs.writeFileSync('debug_response.json', JSON.stringify(jobResult, null, 2));
                console.log("Saved raw response to debug_response.json for deep analysis.");

                const extracted = jobResult.generatedJson || jobResult;
                let events = [];
                if (extracted && extracted.data && extracted.data.links) {
                    events = extracted.data.links.map(link => {
                        const lines = link.text.split('\n').map(l => l.trim()).filter(l => l !== '');
                        return {
                            title: lines[0],
                            date: "Extracting...",
                            group: "Extracting...",
                            attendees: "Extracting...",
                            url: link.url
                        };
                    });
                }

                const finalOutput = {
                    status: "success",
                    source: "Waiting for debug",
                    total_events: events.length,
                    events: events
                };

                console.log(JSON.stringify(finalOutput, null, 2));
                return finalOutput;
            }
            await new Promise(r => setTimeout(r, 3000));
        }

        throw new Error('Timeout: Job took too long to complete.');

    } catch (error) {
        console.error('Error during scraping:', error.message);
    }
}

main();
