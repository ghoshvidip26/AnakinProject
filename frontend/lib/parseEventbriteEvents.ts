import * as cheerio from "cheerio";

// Map of common Bengaluru areas to coordinates
const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "HSR Layout": { lat: 12.9121, lng: 77.6446 },
  "Koramangala": { lat: 12.9352, lng: 77.6245 },
  "Indiranagar": { lat: 12.9719, lng: 77.6412 },
  "Whitefield": { lat: 12.9698, lng: 77.7500 },
  "Jayanagar": { lat: 12.9300, lng: 77.5800 },
  "MG Road": { lat: 12.9738, lng: 77.6119 },
  "JP Nagar": { lat: 12.9063, lng: 77.5857 },
  "Church Street": { lat: 12.9750, lng: 77.6067 },
  "KTPO": { lat: 12.9723, lng: 77.7475 },
  "Electronic City": { lat: 12.8452, lng: 77.6632 }
};

function classifyCategories(title = "") {
  const lower = title.toLowerCase();
  const categories = [];

  // Industry Grade: Advanced Sector Heuristics
  if (lower.includes("ai") || lower.includes("intelligence") || lower.includes("claude") || lower.includes("llm") || lower.includes("ml")) categories.push("AI");
  if (lower.includes("fintech") || lower.includes("finance") || lower.includes("trading") || lower.includes("invest")) categories.push("Fintech");
  if (lower.includes("saas") || lower.includes("enterprise") || lower.includes("b2b")) categories.push("SaaS");
  if (lower.includes("crypto") || lower.includes("web3") || lower.includes("blockchain") || lower.includes("bitcoin")) categories.push("Web3");
  if (lower.includes("developer") || lower.includes("code") || lower.includes("technical") || lower.includes("workshop") || lower.includes("devops")) categories.push("Technical");
  if (lower.includes("social") || lower.includes("mixer") || lower.includes("party") || lower.includes("networking")) categories.push("Networking");
  
  if (categories.length === 0) categories.push("General Tech");

  return categories;
}

export function parseEventbriteEvents(html: string) {
  const $ = cheerio.load(html);
  const events: any[] = [];

  // ----------------------------
  // FIRST TRY JSON-LD
  // ----------------------------
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const content = $(el).html();
      if (!content) return;
      const json = JSON.parse(content);

      const items = Array.isArray(json) ? json : [json];

      items.forEach((item) => {
        if (
          item["@type"] &&
          item["@type"].includes("Event")
        ) {
          const eventId = item.url?.split('/e/')[1]?.split('/')[0]?.split('?')[0] || (events.length + 1).toString();
          events.push({
            id: eventId,
            title: item.name,
            venue: item.location?.name || "Bangalore",
            date: item.startDate?.split("T")[0],
            url: item.url,
            category: classifyCategories(item.name),
          });
        }
      });
    } catch {}
  });

  // ----------------------------
  // FALLBACK DOM PARSING
  // ----------------------------
  if (events.length === 0) {
    $("a").each((_, el) => {
      const href = $(el).attr("href") || "";

      if (href.includes("/e/")) {
        const title = $(el)
          .text()
          .replace(/\s+/g, " ")
          .trim();

        if (!title || title.length < 5) return;

        const categories = classifyCategories(title);

        let latitude = 12.9716;
        let longitude = 77.5946;

        for (const [area, coords] of Object.entries(AREA_COORDINATES)) {
          if (title.includes(area)) {
            latitude = coords.lat;
            longitude = coords.lng;
          }
        }

        const eventId = href.split('/e/')[1]?.split('/')[0]?.split('?')[0] || (events.length + 1).toString();
        
        // Industry Grade: Score estimation
        let networkingScore = 5;
        let technicalScore = 5;
        if (categories.includes("Networking")) networkingScore += 4;
        if (categories.includes("Technical")) technicalScore += 4;
        if (categories.includes("AI")) technicalScore += 2;
        const lower = title.toLowerCase();
        if (lower.includes("launch") || lower.includes("demo")) networkingScore += 2;

        events.push({
          id: `eventbrite-${eventId}`,
          title,
          category: categories,
          latitude,
          longitude,
          venue: "Bangalore",
          date: "2026-05-11",
          networkingScore: Math.min(10, networkingScore),
          technicalScore: Math.min(10, technicalScore),
          url: href.startsWith("http")
            ? href
            : `https://eventbrite.com${href}`,
          source: "Eventbrite"
        });
      }
    });
  }

  // Remove duplicates
  const unique = [];
  const seen = new Set();

  for (const event of events) {
    if (!seen.has(event.title)) {
      seen.add(event.title);
      unique.push(event);
    }
  }

  return unique;
}
