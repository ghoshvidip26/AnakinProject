import type { RankedEvent } from "@/lib/scoring"
import { FeaturedEvent } from "@/components/event/FeaturedEvent"

interface FeaturedEventsProps {
  events: RankedEvent[]
}

export function FeaturedEvents({ events }: FeaturedEventsProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Featured nearby events</p>
          <h2 className="text-3xl font-semibold text-white">Curated Bangalore experiences</h2>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        {events.slice(0, 3).map((event) => (
          <FeaturedEvent key={event.id} event={event} />
        ))}
      </div>
    </section>
  )
}
