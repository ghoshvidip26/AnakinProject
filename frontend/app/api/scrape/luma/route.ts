import { NextResponse } from "next/server";
import { runAnakinScrape, filterEvents } from "@/lib/scrape-utils";
import { parseLumaEvents } from "@/lib/parseLumaEvents";
import { normalizeEvent } from "@/lib/normalizer";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const location = searchParams.get("location") || undefined;
        const category = searchParams.get("category") || undefined;

        const job = await runAnakinScrape("https://lu.ma/bengaluru");
        let events = parseLumaEvents(job.html).map((e: any) => normalizeEvent(e, "Luma"));
        events = filterEvents(events, { location, category });

        return NextResponse.json({ status: "success", total: events.length, events });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}
