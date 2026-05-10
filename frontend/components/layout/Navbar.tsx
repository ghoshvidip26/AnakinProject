import Link from "next/link"

export function Navbar() {
  return (
    <header className="border-b border-zinc-800/70 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          DevSpot AI
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-300">
          <Link href="/discover" className="transition hover:text-white">Discover</Link>
          <Link href="/planner" className="transition hover:text-white">Planner</Link>
          <Link href="/event/ai-lab-indiranagar" className="transition hover:text-white">Event</Link>
        </nav>
      </div>
    </header>
  )
}
