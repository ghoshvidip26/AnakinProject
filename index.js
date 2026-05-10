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

// --- API ROUTES ---

// 1. Luma Scrape
app.get('/api/scrape/luma', async (req, res) => {
    try {
        const url = "https://lu.ma/bengaluru";
        const job = await runAnakinScrape(url);
        const events = parseLumaEvents(job.html || job.content);
        res.json({ status: "success", source: "Luma", total: events.length, events });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// 2. Meetup Scrape
app.get('/api/scrape/meetup', async (req, res) => {
    try {
        const { location = "in--Bangalore", dateRange = "any-day" } = req.query;
        const url = `https://www.meetup.com/find/?location=${location}&source=EVENTS&dateRange=${dateRange}`;
        
        const job = await runAnakinScrape(url);
        const events = parseMeetupEvents(job.html || job.content);
        res.json({ status: "success", source: "Meetup", total: events.length, events });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// 3. Eventbrite Scrape
app.get('/api/scrape/eventbrite', async (req, res) => {
    try {
        const url = "https://www.eventbrite.com/d/india--bangalore/science-and-tech--events/?page=1";
        const job = await runAnakinScrape(url);
        const events = parseEventbriteEvents(job.html || job.content);
        res.json({ status: "success", source: "Eventbrite", total: events.length, events });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// 4. Scrape All
app.get('/api/scrape/all', async (req, res) => {
    try {
        const results = await Promise.allSettled([
            runAnakinScrape("https://lu.ma/bengaluru").then(j => parseLumaEvents(j.html)),
            runAnakinScrape("https://www.meetup.com/find/?location=in--Bangalore&source=EVENTS").then(j => parseMeetupEvents(j.html)),
            runAnakinScrape("https://www.eventbrite.com/d/india--bangalore/science-and-tech--events/").then(j => parseEventbriteEvents(j.html))
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
});

app.listen(PORT, () => {
    console.log(`\n🚀 Anakin API Server running at http://localhost:${PORT}`);
    console.log(`- GET /api/scrape/luma`);
    console.log(`- GET /api/scrape/meetup?location=in--Bangalore`);
    console.log(`- GET /api/scrape/eventbrite`);
    console.log(`- GET /api/scrape/all`);
});
