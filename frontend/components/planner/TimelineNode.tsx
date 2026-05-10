import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import type { RankedEvent } from "@/lib/scoring"

interface TimelineNodeProps {
  event: RankedEvent
  reason: string
}

export function TimelineNode({ event, reason }: TimelineNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/85 shadow-[0_40px_100px_rgba(15,23,42,0.32)]"
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-t-[1.75rem]">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
        <div className="absolute left-6 bottom-6 rounded-full border border-cyan-400/30 bg-black/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
          {event.time}
        </div>
      </div>

      <div className="space-y-4 px-6 py-6">
        <div className="flex flex-wrap items-center gap-2">
          {event.category.slice(0, 3).map((category) => (
            <Badge key={`${event.id}-${category}`} variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
              {category}
            </Badge>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-white">{event.title}</h3>
          <p className="text-sm text-zinc-400">{event.venue}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Networking</p>
            <p className="mt-2 text-base font-semibold text-white">{event.networkingScore}/10</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Technical</p>
            <p className="mt-2 text-base font-semibold text-white">{event.technicalScore}/10</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Distance</p>
            <p className="mt-2 text-base font-semibold text-white">{event.distance.toFixed(1)} km</p>
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-4 text-sm leading-6 text-cyan-100">
          {reason}
        </div>
      </div>
    </motion.div>
  )
}
