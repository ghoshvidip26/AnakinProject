export function filterEvents(events: any[], { location, category }: { location?: string, category?: string }) {
    let filtered = events;
    if (location) {
        const loc = location.toLowerCase();
        filtered = filtered.filter(e => 
            (e.venue && e.venue.toLowerCase().includes(loc)) || 
            (e.title && e.title.toLowerCase().includes(loc))
        );
    }
    if (category) {
        const cat = category.toLowerCase();
        filtered = filtered.filter(e => 
            e.category && e.category.some((c: string) => c.toLowerCase() === cat)
        );
    }
    return filtered;
}

const API_KEY = process.env.ANAKIN_API_KEY;

export async function runAnakinScrape(url: string, waitMs = 25000) {
    if (!API_KEY) throw new Error("ANAKIN_API_KEY is not set");

    const submitResp = await fetch("https://api.anakin.io/v1/url-scraper", {
        method: "POST",
        headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ url, useBrowser: true, waitMs, generateJson: false })
    });
    
    const submitData = await submitResp.json();
    if (!submitResp.ok) throw new Error(submitData.message || "Failed to submit job");

    const jobId = submitData.jobId;

    for (let i = 0; i < 100; i++) {
        const pollResp = await fetch(`https://api.anakin.io/v1/url-scraper/${jobId}`, {
            headers: { "X-API-Key": API_KEY }
        });
        const result = await pollResp.json();

        if (result.status === "completed") return result;
        if (result.status === "failed") throw new Error(result.error || "Job failed");

        await new Promise(r => setTimeout(r, 3000));
    }
    throw new Error("Job timed out");
}
