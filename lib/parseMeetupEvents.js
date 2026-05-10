const cheerio = require("cheerio");

// Map of common Bengaluru areas to coordinates (from Luma scraper)
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

function enrichEvent(eventObj, exactVenue = null) {
    const lowerTitle = eventObj.title.toLowerCase();
    const lowerGroup = (eventObj.group || "").toLowerCase();
    
    // Heuristics for categories
    const categories = [];
    if (lowerTitle.includes("ai") || lowerTitle.includes("intelligence") || lowerGroup.includes("ai")) categories.push("AI");
    if (lowerTitle.includes("build") || lowerTitle.includes("dev") || lowerTitle.includes("code") || lowerGroup.includes("dev")) categories.push("Technical");
    if (lowerTitle.includes("meetup") || lowerTitle.includes("party") || lowerTitle.includes("social") || lowerGroup.includes("meetup")) categories.push("Networking");
    if (lowerTitle.includes("privacy") || lowerTitle.includes("security")) categories.push("Privacy");
    if (lowerTitle.includes("bitcoin") || lowerTitle.includes("crypto") || lowerTitle.includes("btc")) categories.push("Crypto");
    if (categories.length === 0) categories.push("General");

    // Score estimation
    let networkingScore = 5;
    let technicalScore = 5;
    if (lowerTitle.includes("meetup") || lowerTitle.includes("party") || lowerGroup.includes("meetup")) networkingScore += 3;
    if (lowerTitle.includes("launch")) networkingScore += 2;
    if (lowerTitle.includes("workshop") || lowerTitle.includes("build") || lowerTitle.includes("code")) technicalScore += 3;
    if (lowerTitle.includes("ai") || lowerTitle.includes("claude") || lowerTitle.includes("data")) technicalScore += 2;

    // Coordinate mapping (Fallback to Bangalore default)
    let latitude = 12.9716; 
    let longitude = 77.5946;
    
    // If Apollo provided exact venue coordinates, use them!
    if (exactVenue && exactVenue.lat && exactVenue.lng) {
        latitude = exactVenue.lat;
        longitude = exactVenue.lng;
    } else {
        // Otherwise use the heuristic mapping
        for (const [area, coords] of Object.entries(AREA_COORDINATES)) {
            if (lowerTitle.includes(area.toLowerCase()) || lowerGroup.includes(area.toLowerCase())) {
                latitude = coords.lat;
                longitude = coords.lng;
                break;
            }
        }
    }

    return {
        ...eventObj,
        category: categories,
        latitude: latitude,
        longitude: longitude,
        networkingScore: Math.min(10, networkingScore),
        technicalScore: Math.min(10, technicalScore)
    };
}

function parseMeetupEvents(html) {
    const events = [];

    // 1. Try to extract Meetup's deep NEXT_DATA JSON or APOLLO_STATE
    let apolloState = null;
    
    try {
        if (html.includes('__NEXT_DATA__')) {
            const nextDataStr = html.split('<script id="__NEXT_DATA__" type="application/json">')[1]?.split('</script>')[0];
            if (nextDataStr) {
                const nextData = JSON.parse(nextDataStr);
                apolloState = nextData?.props?.pageProps?.apolloState || nextData?.props?.pageProps?.initialState;
            }
        }
    } catch (e) {
        console.error("Failed to parse NEXT_DATA");
    }

    try {
        if (!apolloState && html.includes('__APOLLO_STATE__')) {
            let apolloStr = html.split('window.__APOLLO_STATE__=')[1] || html.split('window.__APOLLO_STATE__ = ')[1];
            if (apolloStr) {
                // Find the end of the script block
                apolloStr = apolloStr.split('</script>')[0].trim();
                // Remove trailing semicolon if present
                if (apolloStr.endsWith(';')) apolloStr = apolloStr.slice(0, -1);
                
                // Sometimes it's stringified
                if (apolloStr.startsWith('"') && apolloStr.endsWith('"')) {
                    apolloStr = JSON.parse(apolloStr);
                }
                
                apolloState = JSON.parse(apolloStr);
            }
        }
    } catch (e) {
        console.error("Failed to parse APOLLO_STATE");
    }

    if (apolloState) {
        // Extract events from Apollo State
        for (const key in apolloState) {
            if (key.startsWith('Event:')) {
                const ev = apolloState[key];
                if (ev.title && ev.dateTime) {
                    const venueKey = ev.venue ? ev.venue.__ref : null;
                    const venueData = venueKey ? apolloState[venueKey] : null;
                    
                    const baseEvent = {
                        id: ev.id || key.split(':')[1] || Math.random().toString(36).substr(2, 9),
                        title: ev.title,
                        date: ev.dateTime,
                        group: ev.group?.name || "Not specified",
                        attendees: ev.going ? `${ev.going} attendees` : "Not specified",
                        url: ev.eventUrl || "Not specified",
                        source: "Apollo Deep Extraction"
                    };
                    
                    events.push(enrichEvent(baseEvent, venueData));
                }
            }
        }
    } else {
        // 2. Fallback: Cheerio HTML Extraction using accurate DOM Selectors
        console.log("Could not find Apollo state. Extracting using precise Cheerio fallback.");
        const $ = cheerio.load(html);

        // Track unique URLs to avoid duplicates
        const seenUrls = new Set();

        $('a').each((i, el) => {
            const $el = $(el);
            let url = $el.attr('href');
            
            if (url && url.includes('/events/')) {
                // Remove tracking parameters for clean URLs
                url = url.split('?')[0];

                if (seenUrls.has(url)) return;

                const title = $el.find('h3').text().trim() || $el.attr('aria-label') || $el.find('h2').text().trim();
                if (!title) return; // Skip if no title found

                const date = $el.find('time').text().trim() || "Check URL for date";
                
                let group = "Not specified";
                $el.find('*').each((_, child) => {
                    // Get only the direct text of the element, not its children's text
                    const text = $(child).clone().children().remove().end().text().trim();
                    if (text.startsWith('by ') && text.length > 3) {
                        group = text.replace(/^by\s+/i, '');
                    }
                });

                let attendees = "Not specified";
                $el.find('span, div, p').each((_, child) => {
                    const text = $(child).clone().children().remove().end().text().trim();
                    if (text.toLowerCase().includes('attendee')) {
                        attendees = text;
                    }
                });

                seenUrls.add(url);
                const eventId = url.split('/events/')[1]?.split('/')[0] || Math.random().toString(36).substr(2, 9);
                const baseEvent = {
                    id: eventId,
                    title: title,
                    date: date,
                    group: group,
                    attendees: attendees,
                    url: url,
                    source: "Cheerio Deep Extraction"
                };
                
                events.push(enrichEvent(baseEvent));
            }
        });
    }

    return events;
}

module.exports = { parseMeetupEvents };
