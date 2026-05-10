import { optimizeRecommendations } from "./planner";
import { rankEvents, type RankedEvent, type SortOption } from "./scoring";
import { haversineDistance } from "./distance";
import type { EventType } from "./types";

export interface PlannerInput {
  interests: string[];
  location: string;
  freeTime: string;
  origin: { latitude: number; longitude: number };
  sortBy?: SortOption;
}

export interface PlannerOutput {
  headline: string;
  explanation: string;
  schedule: RankedEvent[];
  bestNetworking: RankedEvent | null;
  bestTechnical: RankedEvent | null;
  lowTravel: RankedEvent | null;
  summaryBullets: string[];
}

function parseTimeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + (minute ?? 0);
}

export function buildPlannerHeadline(input: PlannerInput) {
  const interestLabel = input.interests.length
    ? input.interests.slice(0, 2).join(" & ")
    : "Developer";

  return `AI-crafted developer day for ${interestLabel} in ${input.location}`;
}

export function buildPlannerExplanation(input: PlannerInput) {
  const interestsText = input.interests.length
    ? input.interests.join(", ")
    : "developer growth";

  return `Based on your interest in ${interestsText}, available ${input.freeTime.toLowerCase()} window, and Bangalore proximity, DevSpot AI assembles an efficient timeline with strong networking and commute flow.`;
}

export function planDeveloperDay(
  input: PlannerInput,
  events: EventType[],
): PlannerOutput {
  const sortBy = input.sortBy ?? "recommended";
  const ranked = rankEvents(events, input.interests, input.origin, sortBy);
  const schedule = optimizeRecommendations(ranked, 4).sort(
    (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
  );

  const bestNetworking = ranked.reduce<RankedEvent | null>((best, event) => {
    if (!best || event.networkingScore > best.networkingScore) return event;
    return best;
  }, null);

  const bestTechnical = ranked.reduce<RankedEvent | null>((best, event) => {
    if (!best || event.technicalScore > best.technicalScore) return event;
    return best;
  }, null);

  const lowTravel = ranked.reduce<RankedEvent | null>((best, event) => {
    if (!best || event.distance < best.distance) return event;
    return best;
  }, null);

  const summaryBullets = [
    `Tailored to ${input.interests.join(", ")} while keeping travel soft.`,
    `Prioritizes strong networking and technical signal in Bangalore events.`,
    `Oddly efficient event sequence in ${input.location}.`,
    `Designed to feel like a polished developer day flow.`,
  ];

  return {
    headline: buildPlannerHeadline(input),
    explanation: buildPlannerExplanation(input),
    schedule,
    bestNetworking,
    bestTechnical,
    lowTravel,
    summaryBullets,
  };
}

export function buildEventReason(event: RankedEvent, input: PlannerInput) {
  const interestLine = event.matches
    ? `Aligned with your ${input.interests.slice(0, 2).join(" and ")} focus.`
    : "Strong developer signal for broad engineering growth.";

  const networkingLine =
    event.networkingScore >= 8
      ? "High networking potential with founders and product teams."
      : "Solid community value with balanced learning.";

  const commuteLine =
    event.distance <= 4
      ? "Low commute from your home zone, keeping the day smooth."
      : "Worth the commute for a premium technical crowd.";

  return `${interestLine} ${networkingLine} ${commuteLine}`;
}

export function buildTravelHint(current: RankedEvent, next: RankedEvent) {
  const distance = haversineDistance(
    current.latitude,
    current.longitude,
    next.latitude,
    next.longitude,
  );
  const duration = Math.max(8, Math.round(distance * 4 + 3));
  const transport = distance <= 2 ? "walk" : "cab";
  const label = `${duration} min ${transport} journey`;
  const route =
    distance <= 2
      ? "Walkable transition"
      : distance <= 6
        ? "Quick cab route"
        : "Fast ride between venues";

  return { label, route, distance: distance.toFixed(1) };
}
