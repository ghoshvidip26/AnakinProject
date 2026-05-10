import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-zinc-800/70 bg-gradient-to-br from-zinc-950 via-zinc-900 to-slate-950 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.16),_transparent_25%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-end">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.32em] text-cyan-200/80">
            Bangalore developer experience
          </span>
          <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Discover and plan your most productive tech day with AI.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-300">
            DevSpot AI surfaces Bangalore’s best developer events, optimizes your route, and explains why each meetup helps you grow faster.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/planner">
              <Button size="lg">Generate my tech day</Button>
            </Link>
            <Link href="/discover">
              <Button variant="outline" size="lg">
                Browse events
              </Button>
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="rounded-[1.75rem] bg-zinc-950/90 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">AI snapshot</p>
              <div className="mt-4 space-y-3 text-zinc-200">
                <p>Smart event matchmaking across AI, Web3, Cloud, React, and Security.</p>
                <p>Balanced for networking, technical depth, and low travel in Bangalore.</p>
                <p>Perfect for fast-moving developers and startup teams.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
