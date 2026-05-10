import * as cheerio from "cheerio";

// Map of common Bengaluru areas to coordinates
const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "HSR Layout": { lat: 12.9121, lng: 77.6446 },
  "Koramangala": { lat: 12.9352, lng: 77.6245 },
  "Indiranagar": { lat: 12.9719, lng: 77.6412 },
  "Whitefield": { lat: 12.9698, lng: 77.7500 },
  "Jayanagar": { lat: 12.9300, lng: 77.5800 },
  "MG Road": { lat: 12.9738, lng: 77.6119 },
  "Dodsworth Layout": { lat: 12.9700, lng: 77.7400 },
  "7th Sector": { lat: 12.9121, lng: 77.6446 } // Often HSR
};

function enrichEvent(eventObj: any, exactVenue: any = null) {
    const lowerTitle = eventObj.title.toLowerCase();
    const lowerGroup = (eventObj.group || "").toLowerCase();
    
    // Industry Grade: Advanced Sector Heuristics
    const categories = [];
    
    if (lowerTitle.includes("ai") || lowerTitle.includes("intelligence") || lowerTitle.includes("claude") || lowerTitle.includes("llm")) categories.push("AI");
    if (lowerTitle.includes("fintech") || lowerTitle.includes("finance") || lowerTitle.includes("trading")) categories.push("Fintech");
    if (lowerTitle.includes("saas") || lowerTitle.includes("enterprise") || lowerTitle.includes("b2b")) categories.push("SaaS");
    if (lowerTitle.includes("crypto") || lowerTitle.includes("web3") || lowerTitle.includes("blockchain") || lowerTitle.includes("bitcoin")) categories.push("Web3");
    if (lowerTitle.includes("developer") || lowerTitle.includes("code") || lowerTitle.includes("technical") || lowerTitle.includes("workshop")) categories.push("Technical");
    if (lowerTitle.includes("social") || lowerTitle.includes("mixer") || lowerTitle.includes("party") || lowerTitle.includes("networking")) categories.push("Networking");
    
    if (categories.length === 0) categories.push("General Tech");

    // Industry Grade: Score estimation
    let networkingScore = 5;
    let technicalScore = 5;
    if (categories.includes("Networking")) networkingScore += 4;
    if (categories.includes("Technical")) technicalScore += 4;
    if (categories.includes("AI")) technicalScore += 2;
    if (lowerTitle.includes("launch") || lowerTitle.includes("demo")) networkingScore += 2;

    // Coordinate mapping
    let latitude = 12.9716; 
    let longitude = 77.5946;
    
    if (exactVenue && exactVenue.lat && exactVenue.lng) {
        latitude = exactVenue.lat;
        longitude = exactVenue.lng;
    } else {
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
        technicalScore: Math.min(10, technicalScore),
        source: "Meetup"
    };
}

export function parseMeetupEvents(html: string) {
    const events: any[] = [];
    let apolloState: any = null;
    
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
                apolloStr = apolloStr.split('</script>')[0].trim();
                if (apolloStr.endsWith(';')) apolloStr = apolloStr.slice(0, -1);
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
        const $ = cheerio.load(html);
        const seenUrls = new Set();

        $('a').each((i, el) => {
            const $el = $(el);
            let url = $el.attr('href');
            
            if (url && url.includes('/events/')) {
                url = url.split('?')[0];
                if (seenUrls.has(url)) return;

                const title = $el.find('h3').text().trim() || $el.attr('aria-label') || $el.find('h2').text().trim();
                if (!title) return;

                const date = $el.find('time').text().trim() || "Check URL for date";
                
                let group = "Not specified";
                $el.find('*').each((_, child) => {
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
