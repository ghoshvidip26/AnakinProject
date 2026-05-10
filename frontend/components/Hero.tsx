import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="rounded-[2rem] border border-zinc-800/70 bg-gradient-to-br from-zinc-950/80 to-zinc-900/95 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">DevSpot AI</Badge>
          <p className="text-sm text-zinc-400">AI-powered developer event discovery and planning.</p>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Discover the next developer event that moves your career forward.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            Use your interests, nearby locations, technical fit, and networking score to uncover curated tech events with a startup-ready experience.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg">Start planning</Button>
          <Button variant="outline" size="lg">
            Explore local events
          </Button>
        </div>
      </div>
    </section>
  )
}
