require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const ANAKIN_API_KEY = process.env.ANAKIN_API_KEY;
const MEETUP_URL = 'https://www.meetup.com/find/?location=in--Bangalore&source=EVENTS';

if (!ANAKIN_API_KEY) {
    console.error('Error: ANAKIN_API_KEY is not set in .env file');
    process.exit(1);
}

async function scrapeMeetup() {
    console.log(`Starting scrape for: ${MEETUP_URL}`);

    const payload = {
        url: MEETUP_URL,
        useBrowser: true,
        waitMs: 10000,
        generateJson: true,
        prompt: "List the titles and URLs of all events found on the page.",
        schema: {
            type: "object",
            properties: {
                events: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            date_time: { type: "string" },
                            organizer: { type: "string" },
                            event_url: { type: "string" },
                            attendee_count: { type: "string" }
                        },
                        required: ["title", "event_url"]
                    }
                }
            }
        }
    };

    try {
        // 1. Submit the scraping job
        const response = await fetch('https://api.anakin.io/v1/url-scraper', {
            method: 'POST',
            headers: {
                'X-API-Key': ANAKIN_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Anakin API Error: ${JSON.stringify(data)}`);
        }

        const jobId = data.jobId;
        console.log(`Job submitted successfully. Job ID: ${jobId}`);

        // 2. Poll for results
        let jobResult = null;
        let attempts = 0;
        const maxAttempts = 40;

        while (attempts < maxAttempts) {
            attempts++;
            console.log(`Polling for results (Attempt ${attempts})...`);

            const resultResponse = await fetch(`https://api.anakin.io/v1/url-scraper/${jobId}`, {
                headers: { 'X-API-Key': ANAKIN_API_KEY }
            });

            jobResult = await resultResponse.json();

            if (jobResult.status === 'completed') {
                console.log('Scraping completed!');
                const events = jobResult.result?.extractedData?.events || [];
                console.log(`Found ${events.length} events:`);
                console.log(JSON.stringify(events, null, 2));
                return events;
            } else if (jobResult.status === 'failed') {
                throw new Error(`Job failed: ${jobResult.error || 'Unknown error'}`);
            }

            // Wait for 3 seconds before next poll
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        throw new Error('Timeout: Job took too long to complete.');

    } catch (error) {
        console.error('Error during scraping:', error.message);
    }
}

scrapeMeetup();
