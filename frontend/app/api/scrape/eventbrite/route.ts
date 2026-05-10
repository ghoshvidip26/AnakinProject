import { NextResponse } from "next/server";
import { runAnakinScrape, filterEvents, mapLocation } from "@/lib/scrape-utils";
import { parseEventbriteEvents } from "@/lib/parseEventbriteEvents";
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
            const location = mapped ? mapped.eventbrite : (body.location || searchParams.get("location") || "india--bangalore");
            const ebCategory = body.ebCategory || searchParams.get("ebCategory") || "science-and-tech--events";
            const page = body.page || searchParams.get("page") || 1;
            url = `https://www.eventbrite.com/d/${location.toLowerCase()}/${ebCategory.toLowerCase()}/?page=${page}`;
        }
        
        const job = await runAnakinScrape(url);
        let events = parseEventbriteEvents(job.html).map((e: any) => normalizeEvent(e, "Eventbrite"));
        events = filterEvents(events, {
            location: body.location || searchParams.get("location") || undefined,
            category: body.category || searchParams.get("category") || undefined
        });

        return NextResponse.json({ status: "success", source: "Eventbrite", total: events.length, events });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}

export { handler as GET, handler as POST };
