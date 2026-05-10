const cheerio = require("cheerio");

function parseMeetupEvents(html) {
    const events = [];

    // 1. Try to extract Meetup's deep NEXT_DATA JSON or APOLLO_STATE
    const nextDataMatch = html.match(/<script id="?__NEXT_DATA__"? type="?application\/json"?>(.*?)<\/script>/);
    const apolloMatch = html.match(/window\.__APOLLO_STATE__\s*=\s*({.*?});/);
    
    let apolloState = null;
    
    if (nextDataMatch) {
        try {
            const nextData = JSON.parse(nextDataMatch[1].replace(/\\"/g, '"'));
            apolloState = nextData?.props?.pageProps?.apolloState || nextData?.props?.pageProps?.initialState;
        } catch (e) {}
    } 
    if (!apolloState && apolloMatch) {
        try {
            apolloState = JSON.parse(apolloMatch[1].replace(/\\"/g, '"'));
        } catch (e) {}
    }

    if (apolloState) {
        // Extract events from Apollo State
        for (const key in apolloState) {
            if (key.startsWith('Event:')) {
                const ev = apolloState[key];
                if (ev.title && ev.dateTime) {
                    events.push({
                        title: ev.title,
                        date: ev.dateTime,
                        group: ev.group?.name || "Not specified",
                        attendees: ev.going ? `${ev.going} attendees` : "Not specified",
                        url: ev.eventUrl || "Not specified",
                        source: "Apollo Deep Extraction"
                    });
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
                events.push({
                    title: title,
                    date: date,
                    group: group,
                    attendees: attendees,
                    url: url,
                    source: "Cheerio Deep Extraction"
                });
            }
        });
    }

    return events;
}

module.exports = { parseMeetupEvents };
