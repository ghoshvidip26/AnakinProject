"use client"

import { useMemo, useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PlannerForm } from "@/components/planner/PlannerForm"
import { PlannerResults } from "@/components/planner/PlannerResults"
import { PlannerLoading } from "@/components/planner/PlannerLoading"
import { mockEvents } from "@/data/mockEvents"
import { planDeveloperDay, type PlannerInput, type PlannerOutput } from "@/lib/ai"

const locationCoordinates: Record<string, { latitude: number; longitude: number }> = {
  "Koramangala": { latitude: 12.9352, longitude: 77.6245 },
  "HSR Layout": { latitude: 12.926, longitude: 77.6365 },
  "Whitefield": { latitude: 12.9695, longitude: 77.7495 },
  "Indiranagar": { latitude: 12.9719, longitude: 77.6412 },
  "MG Road": { latitude: 12.9762, longitude: 77.6033 },
  "Electronic City": { latitude: 12.8445, longitude: 77.6606 },
  "Bellandur": { latitude: 12.9352, longitude: 77.6827 },
}

export default function PlannerPage() {
  const [interests, setInterests] = useState<string[]>(["AI", "Backend", "Cloud"])
  const [location, setLocation] = useState("Koramangala")
  const [freeTime, setFreeTime] = useState("Evening")
  const [result, setResult] = useState<PlannerOutput | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const origin = useMemo(
    () => locationCoordinates[location] ?? locationCoordinates["MG Road"],
    [location],
  )

  const generatePlan = async () => {
    setIsGenerating(true)
    const input: PlannerInput = {
      interests,
      location,
      freeTime,
      origin,
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 2800))
      const plan = planDeveloperDay(input, mockEvents)
      setResult(plan)
      await fetch("/api/recommend", {
        method: "POST",
        body: JSON.stringify({ interests, location, freeTime }),
      })
    } catch {
      // ignore API errors for UI demo
    } finally {
      setIsGenerating(false)
    }
  }

  const input: PlannerInput = {
    interests,
    location,
    freeTime,
    origin,
  }

  return (
    <main className="relative min-h-screen bg-black text-white">
      {isGenerating && <PlannerLoading />}
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.35fr]">
          <div className="sticky top-10 h-fit">
            <PlannerForm
              interests={interests}
              location={location}
              freeTime={freeTime}
              onInterestChange={setInterests}
              onLocationChange={setLocation}
              onFreeTimeChange={setFreeTime}
              onGenerate={generatePlan}
            />
          </div>

          <div className="overflow-y-auto">
            <PlannerResults
              events={result?.schedule ?? []}
              explanation={result?.explanation}
              loading={isGenerating}
              input={input}
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
