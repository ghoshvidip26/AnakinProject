const cheerio = require("cheerio");

const AREA_COORDINATES = {
  "HSR Layout": { lat: 12.9121, lng: 77.6446 },
  "Koramangala": { lat: 12.9352, lng: 77.6245 },
  "Indiranagar": { lat: 12.9719, lng: 77.6412 },
  "Whitefield": { lat: 12.9698, lng: 77.7500 },
  "Jayanagar": { lat: 12.9300, lng: 77.5800 },
  "MG Road": { lat: 12.9738, lng: 77.6119 },
  "Dodsworth Layout": { lat: 12.9700, lng: 77.7400 },
  "7th Sector": { lat: 12.9121, lng: 77.6446 }
};

function parseLumaEvents(html) {
  const $ = cheerio.load(html);
  const events = [];

  $(".event-link").each((i, el) => {
    const parent = $(el).closest(".content-card");
    const title = parent.find("h3").first().text().trim();
    const url = $(el).attr("href");
    const fullUrl = url.startsWith("http") ? url : `https://lu.ma${url}`;
    
    // Improved Date/Time Extraction
    let rawTime = parent.find(".event-time span").first().text().trim();
    let date = "2026-05-11"; // Default
    
    // Heuristic: If rawTime contains a month name, it's likely a date
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthMatch = months.find(m => rawTime.includes(m));
    if (monthMatch) {
      // Basic normalization attempt
      const dateMatch = rawTime.match(/([A-Z][a-z]{2}\s\d{1,2})/);
      if (dateMatch) date = `2026-${String(months.indexOf(monthMatch) + 1).padStart(2, '0')}-${String(dateMatch[1].split(' ')[1]).padStart(2, '0')}`;
    }

    const venue = parent.find(".text-ellipses").last().text().trim();
    const organizer = parent.find(".nowrap").first().text().trim();
    const image = parent.find("img").first().attr("src");

    // Industry Sector Heuristics (Industry Grade)
    const sectors = [];
    const lowerTitle = title.toLowerCase();
    const lowerOrg = organizer.toLowerCase();

    if (lowerTitle.includes("ai") || lowerTitle.includes("llm") || lowerTitle.includes("data")) sectors.push("AI/ML");
    if (lowerTitle.includes("fintech") || lowerTitle.includes("payment") || lowerTitle.includes("bank")) sectors.push("Fintech");
    if (lowerTitle.includes("health") || lowerTitle.includes("bio") || lowerTitle.includes("med")) sectors.push("Healthtech");
    if (lowerTitle.includes("crypto") || lowerTitle.includes("web3") || lowerTitle.includes("chain")) sectors.push("Web3");
    if (lowerTitle.includes("saas") || lowerTitle.includes("b2b")) sectors.push("SaaS");
    if (lowerTitle.includes("devops") || lowerTitle.includes("cloud") || lowerTitle.includes("infra")) sectors.push("Infrastructure");
    
    if (sectors.length === 0) sectors.push("General Tech");

    // Coordinate mapping
    let latitude = 12.9716;
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
    if (lowerTitle.includes("workshop") || lowerTitle.includes("build")) technicalScore += 3;

    events.push({
      id: `luma-${i}-${Date.now()}`,
      title,
      category: sectors,
      latitude,
      longitude,
      venue,
      date,
      networkingScore: Math.min(10, networkingScore),
      technicalScore: Math.min(10, technicalScore),
      organizer,
      url: fullUrl,
      image,
      source: "Luma"
    });
  });

  return events;
}

module.exports = { parseLumaEvents };
