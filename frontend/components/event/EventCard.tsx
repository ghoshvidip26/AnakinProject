import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { RankedEvent } from "@/lib/scoring"

interface EventCardProps {
  event: RankedEvent
  actionLabel?: string
}

export function EventCard({ event, actionLabel = "View details" }: EventCardProps) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-zinc-800/70 bg-zinc-950/90 shadow-xl shadow-zinc-950/30 transition hover:-translate-y-1 hover:border-zinc-700/80">
      <div className="relative h-[220px] overflow-hidden bg-zinc-900">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">{event.date} · {event.time}</p>
          <h3 className="mt-2 text-xl font-semibold leading-tight">{event.title}</h3>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {event.category.slice(0, 3).map((category) => (
            <Badge key={`${event.id}-${category}`} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>

        <p className="text-sm leading-6 text-zinc-400">{event.description}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-zinc-950/70 p-4 text-sm text-zinc-300">
            <p className="text-zinc-100 font-medium">{event.venue}</p>
            <p>{event.time} • {event.duration}</p>
          </div>
          <div className="rounded-3xl bg-zinc-950/70 p-4 text-sm text-zinc-300">
            <p className="text-zinc-100 font-medium">Networking</p>
            <p>{event.networkingScore}/10</p>
            <p className="mt-2 text-zinc-100 font-medium">Technical</p>
            <p>{event.technicalScore}/10</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-400">{event.distance.toFixed(1)} km away</p>
          <Button asChild size="sm" className="w-full text-sm sm:w-auto">
            <a href={`/event/${event.id}`}>{actionLabel}</a>
          </Button>
        </div>
      </div>
    </article>
  )
}
