import { notFound } from "next/navigation"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RecommendationReason } from "@/components/event/RecommendationReason"
import { EventCard } from "@/components/event/EventCard"
import { mockEvents } from "@/data/mockEvents"
import { getEventReasons, rankEvents } from "@/lib/scoring"

const origin = { latitude: 12.9716, longitude: 77.5946 }

interface EventPageProps {
  params: {
    id: string
  }
}

export default function EventPage({ params }: EventPageProps) {
  const event = mockEvents.find((item) => item.id === params.id)

  if (!event) {
    return notFound()
  }

  const rankedEvents = rankEvents(mockEvents, event.category, origin, "recommended")
  const related = rankedEvents.filter((item) => item.id !== event.id).slice(0, 3)
  const eventRanked = rankedEvents.find((item) => item.id === event.id)

  if (!eventRanked) {
    return notFound()
  }

  const reasons = getEventReasons(eventRanked, event.category)

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] border border-zinc-800/70 bg-zinc-950/90 shadow-[0_40px_120px_rgba(15,23,42,0.35)]">
          <div className="relative h-[420px] bg-zinc-900">
            <img
              src={event.image}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <Badge variant="secondary">Event detail</Badge>
              <h1 className="mt-4 text-5xl font-semibold tracking-tight">{event.title}</h1>
              <p className="mt-4 max-w-2xl text-lg text-zinc-300">{event.description}</p>
            </div>
          </div>

          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-zinc-800/70 bg-zinc-950/90 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Schedule</p>
                    <p className="mt-3 text-lg font-semibold text-white">{event.date} · {event.time}</p>
                    <p className="mt-2 text-sm text-zinc-400">{event.duration} • {event.venue}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Organizer</p>
                    <p className="mt-3 text-lg font-semibold text-white">{event.organizer}</p>
                    <a href={event.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm text-cyan-300 hover:text-white">
                      Visit event page
                    </a>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {event.category.map((item) => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
              </div>

              <RecommendationReason reasons={reasons} />
            </div>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-zinc-800/70 bg-zinc-950/90 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">AI recommendation</p>
                <p className="mt-3 text-lg font-semibold text-white">Why this event works</p>
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  DevSpot AI ranked this event highly for your Bangalore developer profile due to strong networking potential, technical depth, and nearby location.
                </p>
                <div className="mt-6 grid gap-3">
                  <div className="rounded-3xl bg-zinc-900/80 p-4 text-sm text-zinc-300">
                    <p className="font-semibold text-white">Networking</p>
                    <p>{event.networkingScore}/10</p>
                  </div>
                  <div className="rounded-3xl bg-zinc-900/80 p-4 text-sm text-zinc-300">
                    <p className="font-semibold text-white">Technical relevance</p>
                    <p>{event.technicalScore}/10</p>
                  </div>
                  <div className="rounded-3xl bg-zinc-900/80 p-4 text-sm text-zinc-300">
                    <p className="font-semibold text-white">Distance</p>
                    <p>{eventRanked.distance.toFixed(1)} km from city center</p>
                  </div>
                </div>
                <Button className="mt-6 w-full">Book your seat</Button>
              </div>

              <div className="rounded-[2rem] border border-zinc-800/70 bg-zinc-950/90 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Related events</p>
                <div className="mt-5 space-y-4">
                  {related.map((item) => (
                    <EventCard key={item.id} event={item} actionLabel="View" />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
