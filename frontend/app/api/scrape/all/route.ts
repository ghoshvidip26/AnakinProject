import { NextResponse } from "next/server";
import { runAnakinScrape, filterEvents, mapLocation } from "@/lib/scrape-utils";
import { parseLumaEvents } from "@/lib/parseLumaEvents";
import { parseMeetupEvents } from "@/lib/parseMeetupEvents";
import { parseEventbriteEvents } from "@/lib/parseEventbriteEvents";
import { normalizeEvent } from "@/lib/normalizer";

async function handler(request: Request) {
    try {
        const isPost = request.method === "POST";
        const body = isPost ? await request.json().catch(() => ({})) : {};
        const { searchParams } = new URL(request.url);
        
        const city = body.city || searchParams.get("city");
        const mapped = mapLocation(city);
        
        const lumaUrl = body.lumaUrl || searchParams.get("lumaUrl") || `https://lu.ma/${mapped ? mapped.luma : 'bengaluru'}`;
        const meetupLoc = mapped ? mapped.meetup : (body.meetupLocation || searchParams.get("meetupLocation") || "in--Bangalore");
        const eventbriteLoc = mapped ? mapped.eventbrite : "india--bangalore";
        const category = body.category || searchParams.get("category") || "science-and-tech--events";
        
        const eventbriteUrl = body.eventbriteUrl || searchParams.get("eventbriteUrl") || `https://www.eventbrite.com/d/${eventbriteLoc}/${category}/`;

        const results = await Promise.allSettled([
            runAnakinScrape(lumaUrl).then(j => parseLumaEvents(j.html).map((e: any) => normalizeEvent(e, "Luma"))),
            runAnakinScrape(`https://www.meetup.com/find/?location=${meetupLoc}&source=EVENTS`).then(j => parseMeetupEvents(j.html).map((e: any) => normalizeEvent(e, "Meetup"))),
            runAnakinScrape(eventbriteUrl).then(j => parseEventbriteEvents(j.html).map((e: any) => normalizeEvent(e, "Eventbrite")))
        ]);

        let allEvents: any[] = [];
        if (results[0].status === "fulfilled") allEvents.push(...results[0].value);
        if (results[1].status === "fulfilled") allEvents.push(...results[1].value);
        if (results[2].status === "fulfilled") allEvents.push(...results[2].value);

        const filterParams = {
            location: body.location || searchParams.get("location") || undefined,
            category: body.category || searchParams.get("category") || undefined
        };
        
        allEvents = filterEvents(allEvents, filterParams);

        return NextResponse.json({
            status: "success",
            total: allEvents.length,
            events: allEvents
        });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}

export { handler as GET, handler as POST };
