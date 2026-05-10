import { FeaturedEvents } from "@/components/home/FeaturedEvents"
import { FeatureSection } from "@/components/home/FeatureSection"
import { Hero } from "@/components/home/Hero"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { mockEvents } from "@/data/mockEvents"
import { rankEvents } from "@/lib/scoring"

const origin = { latitude: 12.9716, longitude: 77.5946 }

export default function Home() {
  const featuredEvents = rankEvents(mockEvents, ["AI", "React", "Cloud"], origin, "recommended")

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <Hero />
          <FeaturedEvents events={featuredEvents} />
          <FeatureSection
            items={[
              {
                title: "AI-powered recommendations",
                description:
                  "Intelligent scoring blends interests, networking strength, and travel distance into practical event suggestions.",
              },
              {
                title: "Actionable daily planning",
                description:
                  "Generate a polished developer day with nearby meetups, workshops, and hackathons across Bangalore.",
              },
              {
                title: "Focused Bangalore data",
                description:
                  "Realistic local events from Koramangala to Whitefield, optimized for modern developer workflows.",
              },
            ]}
          />
        </div>
      </div>
      <Footer />
    </main>
  )
}
