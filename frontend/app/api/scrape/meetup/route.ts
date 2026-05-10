import { NextResponse } from "next/server";
import { runAnakinScrape, filterEvents } from "@/lib/scrape-utils";
import { parseMeetupEvents } from "@/lib/parseMeetupEvents";
import { normalizeEvent } from "@/lib/normalizer";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const loc = searchParams.get("loc") || "in--Bangalore";
        const location = searchParams.get("location") || undefined;
        const category = searchParams.get("category") || undefined;

        const url = `https://www.meetup.com/find/?location=${loc}&source=EVENTS`;
        const job = await runAnakinScrape(url);
        let events = parseMeetupEvents(job.html).map((e: any) => normalizeEvent(e, "Meetup"));
        events = filterEvents(events, { location, category });

        return NextResponse.json({ status: "success", total: events.length, events });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}
