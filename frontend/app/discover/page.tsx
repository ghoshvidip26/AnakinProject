"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EventGrid } from "@/components/event/EventGrid"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { mockEvents } from "@/data/mockEvents"
import { rankEvents, type RankedEvent, type SortOption } from "@/lib/scoring"

const categories = [
  "All",
  "AI",
  "ML",
  "React",
  "Next.js",
  "Web3",
  "Cloud",
  "DevOps",
  "Security",
  "Backend",
  "Startup",
  "Hackathon",
]

const origin = { latitude: 12.9716, longitude: 77.5946 }

export default function DiscoverPage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [sortBy, setSortBy] = useState<SortOption>("recommended")

  const rankedEvents = useMemo(() => {
    const matched = mockEvents.filter((event) => {
      const search = query.toLowerCase()
      const title = event.title.toLowerCase()
      const venue = event.venue.toLowerCase()
      const categoryMatch = category === "All" || event.category.includes(category)
      const queryMatch = !search || title.includes(search) || venue.includes(search)
      return categoryMatch && queryMatch
    })

    return rankEvents(matched, category === "All" ? ["AI"] : [category], origin, sortBy)
  }, [category, query, sortBy])

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-zinc-800/70 bg-zinc-950/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">Discover</p>
                <h1 className="mt-3 text-4xl font-semibold text-white">All Bangalore developer events</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
                  Filter by category, search for venues, and sort by AI-ranked relevance or commute distance.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search events or venues"
                />
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger size="default" className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sort events</SelectLabel>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="distance">Nearest</SelectItem>
                      <SelectItem value="networking">Networking first</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((item) => (
                <Button
                  key={item}
                  variant={category === item ? "default" : "outline"}
                  size="sm"
                  className="rounded-full text-xs uppercase tracking-[0.24em]"
                  onClick={() => setCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-800/70 bg-zinc-950/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <p className="text-sm text-zinc-400">{rankedEvents.length} events found</p>
            <EventGrid events={rankedEvents as RankedEvent[]} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
