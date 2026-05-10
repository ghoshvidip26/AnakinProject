import { RankedEvent } from "./scoring";

export function optimizeRecommendations(
  rankedEvents: RankedEvent[],
  limit = 5,
) {
  const selected: RankedEvent[] = [];
  const categoryCount = new Map<string, number>();

  for (const event of rankedEvents) {
    if (selected.length >= limit) {
      break;
    }

    const categoryKey = event.category[0] ?? "General";
    const count = categoryCount.get(categoryKey) ?? 0;

    if (count < 2 || selected.length < 2) {
      selected.push(event);
      categoryCount.set(categoryKey, count + 1);
    }
  }

  if (selected.length < limit) {
    for (const event of rankedEvents) {
      if (selected.length >= limit) {
        break;
      }
      if (!selected.some((item) => item.id === event.id)) {
        selected.push(event);
      }
    }
  }

  return selected;
}
