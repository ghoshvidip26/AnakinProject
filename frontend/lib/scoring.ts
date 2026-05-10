import { haversineDistance } from "./distance";
import { EventType } from "./types";

export interface RankedEvent extends EventType {
  distance: number;
  score: number;
  matches: number;
}

export type SortOption = "recommended" | "distance" | "networking";

export function rankEvents(
  events: EventType[],
  interests: string[],
  origin: { latitude: number; longitude: number },
  sortBy: SortOption = "recommended",
) {
  const interestSet = new Set(
    interests.map((interest) => interest.toLowerCase()),
  );

  const ranked = events.map((event) => {
    const matches = event.category.filter((category) =>
      interestSet.has(category.toLowerCase()),
    ).length;

    const interestScore = interests.length
      ? Math.min(matches / interests.length, 1)
      : 0.25;

    const normalizedNetworking = Math.min(event.networkingScore / 10, 1);
    const normalizedTechnical = Math.min(event.technicalScore / 10, 1);
    const distance = haversineDistance(
      origin.latitude,
      origin.longitude,
      event.latitude,
      event.longitude,
    );

    const distancePenalty = Math.min(distance / 18, 1);
    const score =
      interestScore * 50 +
      normalizedNetworking * 24 +
      normalizedTechnical * 22 -
      distancePenalty * 16;

    return {
      ...event,
      distance,
      score,
      matches,
    };
  });

  const sorted = ranked.slice().sort((left, right) => {
    if (sortBy === "distance") {
      return left.distance - right.distance;
    }

    if (sortBy === "networking") {
      return right.networkingScore - left.networkingScore;
    }

    return right.score - left.score;
  });

  return sorted;
}

export function getEventReasons(
  event: RankedEvent,
  interests: string[],
): string[] {
  const reasons: string[] = [];

  if (event.matches > 0) {
    reasons.push(
      `Matches ${event.matches} of your selected interest${event.matches > 1 ? "s" : ""}`,
    );
  } else {
    reasons.push("Expands your backend and cloud mindset");
  }

  if (event.networkingScore >= 8) {
    reasons.push("High networking potential with senior engineers");
  }

  if (event.technicalScore >= 8) {
    reasons.push("Strong technical depth for career growth");
  }

  reasons.push(
    event.distance <= 4
      ? `Easy commute: ${event.distance} km away`
      : `Worth the travel for strategic learning`,
  );

  return reasons;
}
