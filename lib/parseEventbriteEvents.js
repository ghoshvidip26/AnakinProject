const cheerio = require("cheerio");

// Map of common Bengaluru areas to coordinates
const AREA_COORDINATES = {
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

  if (
    lower.includes("ai") ||
    lower.includes("ml") ||
    lower.includes("llm") ||
    lower.includes("genai")
  ) {
    categories.push("AI");
  }

  if (
    lower.includes("startup") ||
    lower.includes("founder")
  ) {
    categories.push("Startup");
  }

  if (
    lower.includes("web3") ||
    lower.includes("blockchain")
  ) {
    categories.push("Web3");
  }

  if (categories.length === 0) {
    categories.push("General");
  }

  return categories;
}

function parseEventbriteEvents(html) {
  const $ = cheerio.load(html);

  const events = [];

  // ----------------------------
  // FIRST TRY JSON-LD
  // ----------------------------

  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const json = JSON.parse($(el).html());

      const items = Array.isArray(json)
        ? json
        : [json];

      items.forEach((item) => {
        if (
          item["@type"] &&
          item["@type"].includes("Event")
        ) {
          events.push({
            title: item.name,
            venue:
              item.location?.name ||
              "Bangalore",
            date:
              item.startDate?.split("T")[0],
            url: item.url,
            category: classifyCategories(
              item.name
            ),
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

      if (
        href.includes("/e/")
      ) {
        const title = $(el)
          .text()
          .replace(/\s+/g, " ")
          .trim();

        if (!title || title.length < 5) return;

        const categories =
          classifyCategories(title);

        let latitude = 12.9716;
        let longitude = 77.5946;

        for (const [area, coords] of Object.entries(
          AREA_COORDINATES
        )) {
          if (title.includes(area)) {
            latitude = coords.lat;
            longitude = coords.lng;
          }
        }

        events.push({
          id: (events.length + 1).toString(),
          title,
          category: categories,
          latitude,
          longitude,
          venue: "Bangalore",
          date: "2026-05-11",
          networkingScore: 7,
          technicalScore: 7,
          url: href.startsWith("http")
            ? href
            : `https://eventbrite.com${href}`,
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

module.exports = {
  parseEventbriteEvents,
};