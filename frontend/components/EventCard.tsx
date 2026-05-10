import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"
import type { EventType } from "@/lib/types"

interface EventCardProps {
  event: EventType & {
    distance?: number
  }
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="overflow-hidden border border-zinc-800/70 bg-zinc-950/90 shadow-lg shadow-zinc-950/20">
      <CardContent className="space-y-4 px-5 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg text-white">{event.title}</CardTitle>
            <CardDescription className="text-sm text-zinc-400">
              {event.venue} · {event.date}
            </CardDescription>
          </div>
          <div className="space-y-2 text-right">
            <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
              {event.distance?.toFixed(1)} km away
            </p>
            <Button variant="secondary" size="sm" asChild>
              <a href={event.url} target="_blank" rel="noreferrer">
                View event
              </a>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {event.category.map((category) => (
            <Badge key={`${event.id}-${category}`} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-zinc-800/70 bg-zinc-950/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm text-zinc-400">
          <p>Network score: {event.networkingScore}/10</p>
          <p>Technical relevance: {event.technicalScore}/10</p>
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          Organizer: {event.organizer}
        </p>
      </CardFooter>
    </Card>
  )
}
