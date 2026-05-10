import * as dotenv from 'dotenv';
dotenv.config();
import { parseEventbriteEvents } from "./parseEventbriteEvents";
import { normalizeEvent } from "./normalizer";
import { runAnakinScrape } from "./scrape-utils";
import * as fs from 'fs';

(async () => {
  try {
    const eventbriteUrl = "https://www.eventbrite.com/d/india--bangalore/science-and-tech--events/?page=1";
    console.log(`Starting scrape for Eventbrite: ${eventbriteUrl}`);
    
    const job = await runAnakinScrape(eventbriteUrl, 15000);
    
    console.log("\n\n--- Scrape Completed ---");
    
    const html = job.html || job.content || job.result;

    if (html) {
      console.log("Parsing HTML with Eventbrite Parser...");
      const rawEvents = parseEventbriteEvents(html);
      const events = rawEvents.map((e: any) => normalizeEvent(e, "Eventbrite"));
      
      console.log(`Found ${events.length} events:\n`);
      const output = {
        status: "success",
        source: "Eventbrite",
        total_events: events.length,
        events: events
      };
      
      console.log(JSON.stringify(output, null, 2));
      
      fs.writeFileSync('eventbrite_results.json', JSON.stringify(output, null, 2));
      console.log("\nResults saved to eventbrite_results.json");
      
    } else {
      console.log("No HTML found in the response.");
    }
    
  } catch (err: any) {
    console.error("\nError:", err.message);
  }
})();
