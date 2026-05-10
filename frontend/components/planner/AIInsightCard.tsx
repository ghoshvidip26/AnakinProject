interface AIInsightCardProps {
  headline: string
  explanation: string
  bullets: string[]
}

export function AIInsightCard({
  headline,
  explanation,
  bullets,
}: AIInsightCardProps) {
  return (
    <section className="rounded-2xl border border-cyan-500/10 bg-zinc-950/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
      <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">AI insight</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{headline}</h2>
      <p className="mt-4 text-sm leading-7 text-zinc-400">{explanation}</p>
      <div className="mt-5 space-y-3">
        {bullets.map((bullet) => (
          <div key={bullet} className="flex items-start gap-3 text-sm text-zinc-300">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
            <span>{bullet}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
