require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { parseLumaEvents } = require("./lib/parseLumaEvents");
const { parseMeetupEvents } = require("./lib/parseMeetupEvents");
const { parseEventbriteEvents } = require("./lib/parseEventbriteEvents");
const { normalizeEvent } = require("./lib/normalizer");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANAKIN_API_KEY;

app.use(express.json());

/**
 * Filters events based on query parameters
 */
function filterEvents(events, { location, category }) {
    let filtered = events;
    if (location) {
        const loc = location.toLowerCase();
        filtered = filtered.filter(e => 
            e.venue.toLowerCase().includes(loc) || 
            e.title.toLowerCase().includes(loc)
        );
    }
    if (category) {
        const cat = category.toLowerCase();
        filtered = filtered.filter(e => 
            e.category.some(c => c.toLowerCase() === cat)
        );
    }
    return filtered;
}

/**
 * Common Anakin.io Scraper Helper
 */
async function runAnakinScrape(url, waitMs = 25000) {
    if (!API_KEY) throw new Error("ANAKIN_API_KEY is not set");

    const submitResp = await fetch("https://api.anakin.io/v1/url-scraper", {
        method: "POST",
        headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ url, useBrowser: true, waitMs, generateJson: false })
    });
    
    const submitData = await submitResp.json();
    if (!submitResp.ok) throw new Error(submitData.message || "Failed to submit job");

    const jobId = submitData.jobId;

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

// --- API ROUTES ---

app.get('/api/scrape/luma', async (req, res) => {
    try {
        const job = await runAnakinScrape("https://lu.ma/bengaluru");
        let events = parseLumaEvents(job.html).map(e => normalizeEvent(e, "Luma"));
        events = filterEvents(events, req.query);
        res.json({ status: "success", total: events.length, events });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.get('/api/scrape/meetup', async (req, res) => {
    try {
        const { loc = "in--Bangalore" } = req.query;
        const url = `https://www.meetup.com/find/?location=${loc}&source=EVENTS`;
        const job = await runAnakinScrape(url);
        let events = parseMeetupEvents(job.html).map(e => normalizeEvent(e, "Meetup"));
        events = filterEvents(events, req.query);
        res.json({ status: "success", total: events.length, events });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.get('/api/scrape/eventbrite', async (req, res) => {
    try {
        const url = "https://www.eventbrite.com/d/india--bangalore/science-and-tech--events/";
        const job = await runAnakinScrape(url);
        let events = parseEventbriteEvents(job.html).map(e => normalizeEvent(e, "Eventbrite"));
        events = filterEvents(events, req.query);
        res.json({ status: "success", total: events.length, events });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.get('/api/scrape/all', async (req, res) => {
    try {
        const { location, category } = req.query;
        const [lumaJob, meetupJob, ebJob] = await Promise.all([
            runAnakinScrape("https://lu.ma/bengaluru"),
            runAnakinScrape("https://www.meetup.com/find/?location=in--Bangalore&source=EVENTS"),
            runAnakinScrape("https://www.eventbrite.com/d/india--bangalore/science-and-tech--events/")
        ]);

        const lumaEvents = parseLumaEvents(lumaJob.html).map(e => normalizeEvent(e, "Luma"));
        const meetupEvents = parseMeetupEvents(meetupJob.html).map(e => normalizeEvent(e, "Meetup"));
        const ebEvents = parseEventbriteEvents(ebJob.html).map(e => normalizeEvent(e, "Eventbrite"));

        let allEvents = [...lumaEvents, ...meetupEvents, ...ebEvents];
        allEvents = filterEvents(allEvents, { location, category });

        res.json({
            status: "success",
            total: allEvents.length,
            events: allEvents
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Unified Anakin API Server running at http://localhost:${PORT}`);
    console.log(`- Filter by location: ?location=HSR`);
    console.log(`- Filter by category: ?category=AI`);
});
