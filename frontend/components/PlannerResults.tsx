import { Skeleton } from "@/components/ui/skeleton"
import { EventCard } from "@/components/EventCard"
import type { EventType } from "@/lib/types"

interface PlannerResultsProps {
  recommendations: (EventType & { distance?: number })[]
  loading: boolean
}

export function PlannerResults({ recommendations, loading }: PlannerResultsProps) {
  return (
    <section className="space-y-6 py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Recommended events</p>
          <h2 className="text-3xl font-semibold text-white">Plan your next developer meetup.</h2>
        </div>
        <p className="text-sm text-zinc-400">Fast, local, and personalized for your skills.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-[1.5rem]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {recommendations.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  )
}
