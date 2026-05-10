import { NextResponse } from "next/server";
import { runAnakinScrape, filterEvents } from "@/lib/scrape-utils";
import { parseEventbriteEvents } from "@/lib/parseEventbriteEvents";
import { normalizeEvent } from "@/lib/normalizer";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const location = searchParams.get("location") || undefined;
        const category = searchParams.get("category") || undefined;

        const url = "https://www.eventbrite.com/d/india--bangalore/science-and-tech--events/";
        const job = await runAnakinScrape(url);
        let events = parseEventbriteEvents(job.html).map((e: any) => normalizeEvent(e, "Eventbrite"));
        events = filterEvents(events, { location, category });

        return NextResponse.json({ status: "success", total: events.length, events });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}
