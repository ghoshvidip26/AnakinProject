require('dotenv').config();
const { parseLumaEvents } = require("./lib/parseLumaEvents.js");

const BASE = "https://api.anakin.io/v1";
const API_KEY = process.env.ANAKIN_API_KEY;

if (!API_KEY) {
  throw new Error("ANAKIN_API_KEY is not set in your .env file");
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
      signal: AbortSignal.timeout(30000),
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
 * Scrapes Luma events from a given URL using Anakin.io's URL Scraper
 */
async function scrape(url) {
  console.log(`Submitting scrape job for: ${url}...`);
  
  const submitted = await request("POST", "/url-scraper", { 
    url,
    useBrowser: true,
    waitMs: 10000, 
    generateJson: false // We will parse the HTML ourselves using cheerio
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

// Main execution
(async () => {
  try {
    const lumaUrl = "https://lu.ma/bengaluru"; 
    const job = await scrape(lumaUrl);
    
    console.log("\n\n--- Scrape Completed ---");
    
    if (job.html) {
      console.log("Parsing HTML with Cheerio...");
      const events = parseLumaEvents(job.html);
      
      console.log(`Found ${events.length} events:\n`);
      const output = {
        status: "success",
        source: "Luma",
        total_events: events.length,
        events: events
      };
      console.log(JSON.stringify(output, null, 2));

      const fs = require('fs');
      fs.writeFileSync('luma_results.json', JSON.stringify(output, null, 2));
      console.log("\nResults saved to luma_results.json");
    } else {
      console.log("No HTML found in the response. Full job response:");
      console.log(JSON.stringify(job, null, 2));
    }
    
  } catch (err) {
    console.error("\nError:", err.message);
  }
})();
