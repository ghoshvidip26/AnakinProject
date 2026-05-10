import { NextResponse } from "next/server";
import { runAnakinScrape, filterEvents, mapLocation } from "@/lib/scrape-utils";
import { parseMeetupEvents } from "@/lib/parseMeetupEvents";
import { normalizeEvent } from "@/lib/normalizer";

async function handler(request: Request) {
    try {
        const isPost = request.method === "POST";
        const body = isPost ? await request.json().catch(() => ({})) : {};
        const { searchParams } = new URL(request.url);

        const city = body.city || searchParams.get("city");
        const mapped = mapLocation(city);
        const location = mapped ? mapped.meetup : (body.location || searchParams.get("location") || "in--Bangalore");
        const dateRange = body.dateRange || searchParams.get("dateRange") || "any-day";
        
        const url = `https://www.meetup.com/find/?location=${location}&source=EVENTS&dateRange=${dateRange}`;
        const job = await runAnakinScrape(url);
        let events = parseMeetupEvents(job.html).map((e: any) => normalizeEvent(e, "Meetup"));
        events = filterEvents(events, {
            location: body.location || searchParams.get("location") || undefined,
            category: body.category || searchParams.get("category") || undefined
        });

        return NextResponse.json({ status: "success", source: "Meetup", total: events.length, events });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}

export { handler as GET, handler as POST };
