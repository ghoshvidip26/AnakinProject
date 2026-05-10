import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { RankedEvent } from "@/lib/scoring"

interface FeaturedEventProps {
  event: RankedEvent
}

export function FeaturedEvent({ event }: FeaturedEventProps) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-fuchsia-600/10 bg-zinc-950/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="default">Featured</Badge>
          <p className="mt-4 text-3xl font-semibold text-white">{event.title}</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">{event.description}</p>
        </div>
        <div className="rounded-3xl bg-zinc-900 p-4 text-right text-sm text-zinc-300">
          <p className="text-zinc-100 font-medium">{event.date}</p>
          <p className="mt-2">{event.time}</p>
          <p className="mt-4 text-zinc-300">{event.distance.toFixed(1)} km</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-2 sm:grid-cols-3">
          <span className="rounded-3xl bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.24em] text-zinc-400">{event.category[0]}</span>
          <span className="rounded-3xl bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.24em] text-zinc-400">Networking {event.networkingScore}</span>
          <span className="rounded-3xl bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.24em] text-zinc-400">Tech {event.technicalScore}</span>
        </div>
        <Button asChild variant="secondary">
          <a href={`/event/${event.id}`}>Explore event</a>
        </Button>
      </div>
    </article>
  )
}
