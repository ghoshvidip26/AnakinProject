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
        waitMs: 20000,
        generateJson: true,
        prompt: "This is a Meetup events page. It contains a grid of events. Please wait for the events to load, scroll if necessary, and then extract every single event you can find. For each event, I need the Title, Date, Group Name, and the Link to the event page. Return this in a JSON object with an 'events' array.",
        schema: {
            type: "object",
            properties: {
                events: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            date: { type: "string" },
                            group: { type: "string" },
                            url: { type: "string" }
                        }
                    }
                }
            }
        }
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
                const extracted = jobResult.result?.extractedData;
                console.log(JSON.stringify(extracted, null, 2));
                return extracted;
            }
            await new Promise(r => setTimeout(r, 3000));
        }

        throw new Error('Timeout: Job took too long to complete.');

    } catch (error) {
        console.error('Error during scraping:', error.message);
    }
}

scrapeMeetup();
