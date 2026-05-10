import * as dotenv from 'dotenv';
dotenv.config();
import { parseLumaEvents } from "./parseLumaEvents";
import { normalizeEvent } from "./normalizer";
import { runAnakinScrape } from "./scrape-utils";

(async () => {
  try {
    const lumaUrl = "https://lu.ma/bengaluru"; 
    console.log(`Starting scrape for Luma: ${lumaUrl}`);
    
    const job = await runAnakinScrape(lumaUrl, 10000);
    
    console.log("\n\n--- Scrape Completed ---");
    
    if (job.html) {
      console.log("Parsing HTML with Cheerio...");
      const rawEvents = parseLumaEvents(job.html);
      const events = rawEvents.map((e: any) => normalizeEvent(e, "Luma"));
      
      console.log(`Found ${events.length} events:\n`);
      console.log(JSON.stringify(events, null, 2));
    } else {
      console.log("No HTML found in the response.");
    }
    
  } catch (err: any) {
    console.error("\nError:", err.message);
  }
})();
