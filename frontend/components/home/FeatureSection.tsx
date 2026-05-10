interface FeatureSectionProps {
  items: {
    title: string
    description: string
  }[]
}

export function FeatureSection({ items }: FeatureSectionProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-[2rem] border border-zinc-800/70 bg-zinc-950/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">{item.title}</p>
          <p className="mt-4 text-sm leading-7 text-zinc-300">{item.description}</p>
        </div>
      ))}
    </section>
  )
}
