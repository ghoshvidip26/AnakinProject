require('dotenv').config();
const { parseEventbriteEvents } = require("./lib/parseEventbriteEvents.js");
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
 * Scrapes Eventbrite events from a given URL using Anakin.io's URL Scraper
 */
async function scrape(url) {
  console.log(`\nSubmitting scrape job for: ${url}...`);
  
  const submitted = await request("POST", "/url-scraper", { 
    url,
    useBrowser: true,
    waitMs: 15000, 
    generateJson: false 
  });

  if (!submitted || !submitted.jobId) {
    throw new Error("Failed to submit scrape job.");
  }

  const jobId = submitted.jobId;
  console.log(`Job submitted! ID: ${jobId}. Polling...`);

  for (let i = 0; i < 60; i++) {
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

(async () => {
  try {
    // URL targeting Science & Tech events in Bangalore
    const eventbriteUrl = "https://www.eventbrite.com/d/india--bangalore/science-and-tech--events/?page=1";
    
    const job = await scrape(eventbriteUrl);
    
    console.log("\n\n--- Scrape Completed ---");
    
    const html = job.html || job.content || job.result;

    if (html) {
      console.log("Parsing HTML with Eventbrite Parser...");
      const { normalizeEvent } = require("./lib/normalizer.js");
      const rawEvents = parseEventbriteEvents(html);
      const events = rawEvents.map(e => normalizeEvent(e, "Eventbrite"));
      
      console.log(`Found ${events.length} events:\n`);
      const output = {
        status: "success",
        source: "Eventbrite",
        total_events: events.length,
        events: events
      };
      
      console.log(JSON.stringify(output, null, 2));
      
      // Save results
      const fs = require('fs');
      fs.writeFileSync('eventbrite_results.json', JSON.stringify(output, null, 2));
      console.log("\nResults saved to eventbrite_results.json");
      
    } else {
      console.log("No HTML found in the response.");
    }
    
  } catch (err) {
    console.error("\nError:", err.message);
  }
})();
