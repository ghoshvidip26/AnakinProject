import { NextResponse } from "next/server";
import { runAnakinScrape, filterEvents } from "@/lib/scrape-utils";
import { parseLumaEvents } from "@/lib/parseLumaEvents";
import { parseMeetupEvents } from "@/lib/parseMeetupEvents";
import { parseEventbriteEvents } from "@/lib/parseEventbriteEvents";
import { normalizeEvent } from "@/lib/normalizer";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const location = searchParams.get("location") || undefined;
        const category = searchParams.get("category") || undefined;

        const [lumaJob, meetupJob, ebJob] = await Promise.all([
            runAnakinScrape("https://lu.ma/bengaluru"),
            runAnakinScrape("https://www.meetup.com/find/?location=in--Bangalore&source=EVENTS"),
            runAnakinScrape("https://www.eventbrite.com/d/india--bangalore/science-and-tech--events/")
        ]);

        const lumaEvents = parseLumaEvents(lumaJob.html).map((e: any) => normalizeEvent(e, "Luma"));
        const meetupEvents = parseMeetupEvents(meetupJob.html).map((e: any) => normalizeEvent(e, "Meetup"));
        const ebEvents = parseEventbriteEvents(ebJob.html).map((e: any) => normalizeEvent(e, "Eventbrite"));

        let allEvents = [...lumaEvents, ...meetupEvents, ...ebEvents];
        allEvents = filterEvents(allEvents, { location, category });

        return NextResponse.json({
            status: "success",
            total: allEvents.length,
            events: allEvents
        });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}
