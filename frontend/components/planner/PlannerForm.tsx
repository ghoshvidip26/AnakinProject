"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InterestSelector } from "@/components/planner/InterestSelector"

const locations = [
  "Koramangala",
  "HSR Layout",
  "Whitefield",
  "Indiranagar",
  "MG Road",
  "Electronic City",
  "Bellandur",
]

const freeTimes = ["Morning", "Afternoon", "Evening"]

interface PlannerFormProps {
  interests: string[]
  location: string
  freeTime: string
  onInterestChange: (interests: string[]) => void
  onLocationChange: (location: string) => void
  onFreeTimeChange: (time: string) => void
  onGenerate: () => void
}

const topicOptions = [
  "AI",
  "Backend",
  "Cloud",
  "DevOps",
  "Frontend",
  "React",
  "Next.js",
  "Security",
  "Web3",
  "Startup",
  "Hackathon",
]

export function PlannerForm({
  interests,
  location,
  freeTime,
  onInterestChange,
  onLocationChange,
  onFreeTimeChange,
  onGenerate,
}: PlannerFormProps) {
  const selectedLabels = useMemo(
    () => interests.slice(0, 5),
    [interests],
  )

  const toggleInterest = (topic: string) => {
    if (interests.includes(topic)) {
      onInterestChange(interests.filter((item) => item !== topic))
      return
    }
    onInterestChange([...interests, topic])
  }

  return (
    <div className="space-y-6 rounded-2xl border border-zinc-800/70 bg-zinc-950/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">AI planner</p>
        <h2 className="text-3xl font-semibold text-white">Plan your developer day with AI.</h2>
        <p className="max-w-2xl text-sm leading-7 text-zinc-400">
          Choose your interests, preferred zone, and available time. DevSpot AI will craft a polished event flow for Bangalore.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Home location</label>
          <Select value={location} onValueChange={onLocationChange}>
            <SelectTrigger size="default" className="w-full">
              <SelectValue placeholder="Choose location" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select a neighborhood</SelectLabel>
                {locations.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Available time</label>
          <Select value={freeTime} onValueChange={onFreeTimeChange}>
            <SelectTrigger size="default" className="w-full">
              <SelectValue placeholder="Choose time" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time block</SelectLabel>
                {freeTimes.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl bg-zinc-950/80 p-4">
        <p className="text-sm font-medium text-white">Select up to 5 interests</p>
        <InterestSelector
          options={topicOptions}
          selected={interests}
          onToggle={toggleInterest}
        />
        <p className="text-xs text-zinc-500">Selected: {selectedLabels.join(", ") || "None"}</p>
      </div>

      <Button size="lg" onClick={onGenerate} className="w-full">
        Generate my tech day
      </Button>
    </div>
  )
}
