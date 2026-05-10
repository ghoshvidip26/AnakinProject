/**
 * Normalizes event data from different sources into a common format
 * @param {Object} event Raw event data from a parser
 * @param {string} source Source name (Luma, Meetup, Eventbrite)
 * @returns {Object} Normalized event object
 */
export function normalizeEvent(event: any, source: string) {
    // Ensure category is always an array
    const category = Array.isArray(event.category) ? event.category : [event.category || "General"];
    
    // Consistent date formatting (YYYY-MM-DD)
    let formattedDate = event.date || "2026-05-11";
    
    // Handle ISO strings or strings with time
    if (formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
    } else if (formattedDate.includes(' ')) {
        // Handle cases like "May 11 2026" or similar if they appear
        // Basic check for YYYY-MM-DD pattern
        const match = formattedDate.match(/\d{4}-\d{2}-\d{2}/);
        if (match) formattedDate = match[0];
    }
    
    return {
        id: event.id || Math.random().toString(36).substr(2, 9),
        title: event.title,
        category: category,
        latitude: parseFloat(event.latitude) || 12.9716,
        longitude: parseFloat(event.longitude) || 77.5946,
        venue: event.venue || "Bengaluru",
        date: formattedDate,
        networkingScore: event.networkingScore || 5,
        technicalScore: event.technicalScore || 5,
        organizer: event.organizer || event.group || "Unknown",
        url: event.url,
        source: source
    };
}
