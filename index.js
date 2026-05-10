require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { parseLumaEvents } = require("./lib/parseLumaEvents");
const { parseMeetupEvents } = require("./lib/parseMeetupEvents");
const { parseEventbriteEvents } = require("./lib/parseEventbriteEvents");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANAKIN_API_KEY;

app.use(express.json());

/**
 * Common Anakin.io Scraper Helper
 */
async function runAnakinScrape(url, waitMs = 25000) {
    if (!API_KEY) throw new Error("ANAKIN_API_KEY is not set");

    // Submit Job
    const submitResp = await fetch("https://api.anakin.io/v1/url-scraper", {
        method: "POST",
        headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ url, useBrowser: true, waitMs, generateJson: false })
    });
    
    const submitData = await submitResp.json();
    if (!submitResp.ok) throw new Error(submitData.message || "Failed to submit job");

    const jobId = submitData.jobId;

    // Poll Job (Up to 5 minutes)
    for (let i = 0; i < 100; i++) {
        const pollResp = await fetch(`https://api.anakin.io/v1/url-scraper/${jobId}`, {
            headers: { "X-API-Key": API_KEY }
        });
        const result = await pollResp.json();

        if (result.status === "completed") return result;
        if (result.status === "failed") throw new Error(result.error || "Job failed");

        await new Promise(r => setTimeout(r, 3000));
    }
    throw new Error("Job timed out");
}

// --- API ROUTE HANDLERS ---

// --- DYNAMIC TRANSLATION ENGINE ---
function mapLocation(city) {
    if (!city) return null;
    const c = city.toLowerCase().trim();
    if (c === "bengaluru" || c === "bangalore") return { luma: "bengaluru", meetup: "in--Bangalore", eventbrite: "india--bangalore" };
    if (c === "mumbai") return { luma: "mumbai", meetup: "in--mumbai", eventbrite: "india--mumbai" };
    if (c === "delhi" || c === "new delhi") return { luma: "new-delhi", meetup: "in--new-delhi", eventbrite: "india--new-delhi" };
    if (c === "hyderabad") return { luma: "hyderabad", meetup: "in--hyderabad", eventbrite: "india--hyderabad" };
    if (c === "pune") return { luma: "pune", meetup: "in--pune", eventbrite: "india--pune" };
    if (c === "chennai") return { luma: "chennai", meetup: "in--chennai", eventbrite: "india--chennai" };
    
    // Generic fallback
    return { luma: c.replace(/\s+/g, '-'), meetup: `in--${c.replace(/\s+/g, '-')}`, eventbrite: `india--${c.replace(/\s+/g, '-')}` };
}

// --- API ROUTE HANDLERS ---

// 1. Luma Scrape
const lumaHandler = async (req, res) => {
    try {
        let url = req.body?.url || req.query?.url;
        if (!url) {
            const city = req.body?.city || req.query?.city;
            const mapped = mapLocation(city);
            const location = mapped ? mapped.luma : (req.body?.location || req.query?.location || "bengaluru");
            url = `https://lu.ma/${location.toLowerCase()}`;
        }
        
        const job = await runAnakinScrape(url);
        const events = parseLumaEvents(job.html || job.content);
        res.json({ status: "success", source: "Luma", total: events.length, events });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// 2. Meetup Scrape
const meetupHandler = async (req, res) => {
    try {
        const city = req.body?.city || req.query?.city;
        const mapped = mapLocation(city);
        const location = mapped ? mapped.meetup : (req.body?.location || req.query?.location || "in--Bangalore");
        const dateRange = req.body?.dateRange || req.query?.dateRange || "any-day";
        const url = `https://www.meetup.com/find/?location=${location}&source=EVENTS&dateRange=${dateRange}`;
        
        const job = await runAnakinScrape(url);
        const events = parseMeetupEvents(job.html || job.content);
        res.json({ status: "success", source: "Meetup", total: events.length, events });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// 3. Eventbrite Scrape
const eventbriteHandler = async (req, res) => {
    try {
        let url = req.body?.url || req.query?.url;
        if (!url) {
            const city = req.body?.city || req.query?.city;
            const mapped = mapLocation(city);
            const location = mapped ? mapped.eventbrite : (req.body?.location || req.query?.location || "india--bangalore");
            const category = req.body?.category || req.query?.category || "science-and-tech--events";
            const page = req.body?.page || req.query?.page || 1;
            url = `https://www.eventbrite.com/d/${location.toLowerCase()}/${category.toLowerCase()}/?page=${page}`;
        }

        const job = await runAnakinScrape(url);
        const events = parseEventbriteEvents(job.html || job.content);
        res.json({ status: "success", source: "Eventbrite", total: events.length, events });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// 4. Scrape All
const scrapeAllHandler = async (req, res) => {
    try {
        const city = req.body?.city || req.query?.city;
        const mapped = mapLocation(city);
        
        const lumaUrl = req.body?.lumaUrl || req.query?.lumaUrl || `https://lu.ma/${mapped ? mapped.luma : 'bengaluru'}`;
        const meetupLoc = mapped ? mapped.meetup : (req.body?.meetupLocation || req.query?.meetupLocation || "in--Bangalore");
        const eventbriteLoc = mapped ? mapped.eventbrite : "india--bangalore";
        const category = req.body?.category || req.query?.category || "science-and-tech--events";
        
        const eventbriteUrl = req.body?.eventbriteUrl || req.query?.eventbriteUrl || `https://www.eventbrite.com/d/${eventbriteLoc}/${category}/`;

        const results = await Promise.allSettled([
            runAnakinScrape(lumaUrl).then(j => parseLumaEvents(j.html)),
            runAnakinScrape(`https://www.meetup.com/find/?location=${meetupLoc}&source=EVENTS`).then(j => parseMeetupEvents(j.html)),
            runAnakinScrape(eventbriteUrl).then(j => parseEventbriteEvents(j.html))
        ]);

        const formatted = {
            luma: results[0].status === "fulfilled" ? results[0].value : { error: results[0].reason },
            meetup: results[1].status === "fulfilled" ? results[1].value : { error: results[1].reason },
            eventbrite: results[2].status === "fulfilled" ? results[2].value : { error: results[2].reason }
        };

        res.json({ status: "success", data: formatted });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Register GET and POST routes
app.route('/api/scrape/luma').get(lumaHandler).post(lumaHandler);
app.route('/api/scrape/meetup').get(meetupHandler).post(meetupHandler);
app.route('/api/scrape/eventbrite').get(eventbriteHandler).post(eventbriteHandler);
app.route('/api/scrape/all').get(scrapeAllHandler).post(scrapeAllHandler);

app.listen(PORT, () => {
    console.log(`\n🚀 Anakin API Server running at http://localhost:${PORT}`);
    console.log(`Methods Supported: GET, POST`);
    console.log(`- /api/scrape/luma`);
    console.log(`- /api/scrape/meetup`);
    console.log(`- /api/scrape/eventbrite`);
    console.log(`- /api/scrape/all`);
});
