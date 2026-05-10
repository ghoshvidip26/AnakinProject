interface RecommendationReasonProps {
  reasons: string[]
}

export function RecommendationReason({ reasons }: RecommendationReasonProps) {
  return (
    <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/90 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-400">Why this event?</p>
      <ul className="mt-4 space-y-3 text-sm text-zinc-300">
        {reasons.map((reason, index) => (
          <li key={index} className="flex gap-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
