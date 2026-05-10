const cheerio = require("cheerio");

// Map of common Bengaluru areas to coordinates
const AREA_COORDINATES = {
  "HSR Layout": { lat: 12.9121, lng: 77.6446 },
  "Koramangala": { lat: 12.9352, lng: 77.6245 },
  "Indiranagar": { lat: 12.9719, lng: 77.6412 },
  "Whitefield": { lat: 12.9698, lng: 77.7500 },
  "Jayanagar": { lat: 12.9300, lng: 77.5800 },
  "MG Road": { lat: 12.9738, lng: 77.6119 },
  "Dodsworth Layout": { lat: 12.9700, lng: 77.7400 },
  "7th Sector": { lat: 12.9121, lng: 77.6446 } // Often HSR
};

function parseLumaEvents(html) {
  const $ = cheerio.load(html);
  const events = [];

  $(".event-link").each((i, el) => {
    const parent = $(el).closest(".content-card");
    const title = parent.find("h3").first().text().trim();
    const url = $(el).attr("href");
    const fullUrl = url.startsWith("http") ? url : `https://lu.ma${url}`;
    
    const time = parent.find(".event-time span").first().text().trim();
    const venue = parent.find(".text-ellipses").last().text().trim();
    const organizer = parent.find(".nowrap").first().text().trim();
    const image = parent.find("img").first().attr("src");

    // Heuristics for categories
    const categories = [];
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("ai") || lowerTitle.includes("intelligence") || lowerTitle.includes("claude")) categories.push("AI");
    if (lowerTitle.includes("build") || lowerTitle.includes("dev") || lowerTitle.includes("code")) categories.push("Technical");
    if (lowerTitle.includes("meetup") || lowerTitle.includes("party") || lowerTitle.includes("social")) categories.push("Networking");
    if (lowerTitle.includes("privacy") || lowerTitle.includes("security")) categories.push("Privacy");
    if (lowerTitle.includes("bitcoin") || lowerTitle.includes("crypto") || lowerTitle.includes("btc")) categories.push("Crypto");
    if (categories.length === 0) categories.push("General");

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
    let networkingScore = 5;
    let technicalScore = 5;
    if (lowerTitle.includes("meetup") || lowerTitle.includes("party")) networkingScore += 3;
    if (lowerTitle.includes("launch")) networkingScore += 2;
    if (lowerTitle.includes("workshop") || lowerTitle.includes("build") || lowerTitle.includes("code")) technicalScore += 3;
    if (lowerTitle.includes("ai") || lowerTitle.includes("claude")) technicalScore += 2;

    events.push({
      id: (i + 1).toString(),
      title,
      category: categories,
      latitude,
      longitude,
      venue,
      date: "2026-05-11", // Placeholder, ideally parsed from the timeline section
      networkingScore: Math.min(10, networkingScore),
      technicalScore: Math.min(10, technicalScore),
      organizer,
      url: fullUrl,
      image
    });
  });

  return events;
}

module.exports = { parseLumaEvents };
