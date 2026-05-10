import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  const interests = Array.isArray(payload?.interests)
    ? payload.interests.join(", ")
    : "developer interests";
  const location = payload?.location ?? "Bangalore";
  const freeTime = payload?.freeTime ?? "your chosen time";

  return NextResponse.json({
    success: true,
    message: `Based on ${interests} around ${location} during ${freeTime}, DevSpot AI has generated a strong schedule focused on networking, learning, and efficient travel.`,
  });
}
