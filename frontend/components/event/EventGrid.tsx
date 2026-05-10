import type { RankedEvent } from "@/lib/scoring"
import { EventCard } from "@/components/event/EventCard"

interface EventGridProps {
  events: RankedEvent[]
}

export function EventGrid({ events }: EventGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
