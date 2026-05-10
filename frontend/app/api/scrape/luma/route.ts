import { NextResponse } from "next/server";
import { runAnakinScrape, filterEvents, mapLocation } from "@/lib/scrape-utils";
import { parseLumaEvents } from "@/lib/parseLumaEvents";
import { normalizeEvent } from "@/lib/normalizer";

async function handler(request: Request) {
    try {
        const isPost = request.method === "POST";
        const body = isPost ? await request.json().catch(() => ({})) : {};
        const { searchParams } = new URL(request.url);

        let url = body.url || searchParams.get("url");
        if (!url) {
            const city = body.city || searchParams.get("city");
            const mapped = mapLocation(city);
            const location = mapped ? mapped.luma : (body.location || searchParams.get("location") || "bengaluru");
            url = `https://lu.ma/${location.toLowerCase()}`;
        }
        
        const job = await runAnakinScrape(url);
        let events = parseLumaEvents(job.html).map((e: any) => normalizeEvent(e, "Luma"));
        events = filterEvents(events, {
            location: body.location || searchParams.get("location") || undefined,
            category: body.category || searchParams.get("category") || undefined
        });

        return NextResponse.json({ status: "success", source: "Luma", total: events.length, events });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}

export { handler as GET, handler as POST };
