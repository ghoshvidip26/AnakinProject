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
  "Church Street": { lat: 12.9750, lng: 77.6067 }
};

/**
 * Parses Meetup search results HTML to extract structured event data.
 * @param {string} html Raw HTML from the scraper
 * @returns {Array} List of structured event objects
 */
function parseMeetupEvents(html) {
  const $ = cheerio.load(html);
  const events = [];

  // Meetup search results contain LD-JSON scripts with Event schema
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const rawContent = $(el).html();
      if (!rawContent) return;

      const data = JSON.parse(rawContent);
      const items = Array.isArray(data) ? data : [data];

      items.forEach((item) => {
        if (item["@type"] === "Event") {
          const title = item.name;
          const venue = item.location?.name || item.location?.address?.addressLocality || "Bengaluru";
          const lowerTitle = title.toLowerCase();

          // Date extraction
          const dateStr = item.startDate ? item.startDate.split("T")[0] : "2026-05-11";

          // Heuristics for categories (Consistency with Luma)
          const categories = [];
          if (lowerTitle.includes("ai") || lowerTitle.includes("gen ai") || lowerTitle.includes("ml")) categories.push("AI");
          if (lowerTitle.includes("tech") || lowerTitle.includes("code") || lowerTitle.includes("dev")) categories.push("Technical");
          if (lowerTitle.includes("meetup") || lowerTitle.includes("boardgame") || lowerTitle.includes("social")) categories.push("Networking");
          if (categories.length === 0) categories.push("Social");

          // Coordinate mapping
          let latitude = 12.9716; // Default Bengaluru
          let longitude = 77.5946;
          for (const [area, coords] of Object.entries(AREA_COORDINATES)) {
            if (venue.includes(area) || title.includes(area)) {
              latitude = coords.lat;
              longitude = coords.lng;
              break;
            }
          }

          // Score estimation
          let networkingScore = 6;
          let technicalScore = 4;
          if (lowerTitle.includes("social") || lowerTitle.includes("meetup") || lowerTitle.includes("boardgame")) networkingScore += 3;
          if (lowerTitle.includes("technical") || lowerTitle.includes("ai") || lowerTitle.includes("workshop")) technicalScore += 4;

          events.push({
            id: (events.length + 1).toString(),
            title: title,
            category: categories,
            latitude: latitude,
            longitude: longitude,
            venue: venue,
            date: dateStr,
            networkingScore: Math.min(10, networkingScore),
            technicalScore: Math.min(10, technicalScore),
            group: item.organizer?.name || "Meetup Group",
            url: item.url,
            attendees: "Active" // Placeholder as count is hidden in search result LD-JSON
          });
        }
      });
    } catch (e) {
      // Skip malformed JSON
    }
  });

  return events;
}

module.exports = { parseMeetupEvents };
