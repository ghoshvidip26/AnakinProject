import { Timeline } from "@/components/planner/Timeline"
import type { PlannerInput } from "@/lib/ai"
import type { RankedEvent } from "@/lib/scoring"

interface PlannerResultsProps {
  events: RankedEvent[]
  explanation?: string
  loading?: boolean
  input: PlannerInput
}

export function PlannerResults({
  events,
  explanation,
  loading = false,
  input,
}: PlannerResultsProps) {
  if (loading) {
    return (
      <div className="space-y-6 rounded-[2rem] border border-cyan-500/10 bg-zinc-950/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
        <p className="text-sm text-cyan-300/70">AI is mapping your optimal day...</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 rounded-[1.75rem] bg-zinc-900/80" />
          ))}
        </div>
      </div>
    )
  }

  if (!events.length) {
    return (
      <div className="rounded-[2rem] border border-cyan-500/10 bg-zinc-950/90 p-10 text-center text-zinc-300 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/60">Ready to generate</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">Your timeline will appear here</h2>
        <p className="mt-3 max-w-xl mx-auto text-sm leading-7 text-zinc-400">
          Select your interests, location, and free time to see DevSpot AI build a connected, story-driven Bangalore developer day.
        </p>
      </div>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-cyan-500/10 bg-zinc-950/90 p-7 shadow-[0_40px_120px_rgba(15,23,42,0.35)]">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Developer Day Timeline</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">AI-generated sequence for your Bangalore evening</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-400">This timeline connects events with travel flow, venue strategy, and human-style reasoning.</p>
      </div>

      <Timeline schedule={events} input={input} />
    </section>
  )
}
