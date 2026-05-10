"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const interests = [
  "AI",
  "Frontend",
  "Backend",
  "Cloud",
  "DevOps",
  "Security",
  "Data",
  "Mobile",
  "Web3",
  "Startup",
]

interface InterestSelectorProps {
  selectedInterests: string[]
  sortOption: "recommended" | "distance" | "networking"
  onChange: (next: string[]) => void
  onSortChange: (value: "recommended" | "distance" | "networking") => void
  onSubmit: () => void
}

export function InterestSelector({
  selectedInterests,
  sortOption,
  onChange,
  onSortChange,
  onSubmit,
}: InterestSelectorProps) {
  const [customValue, setCustomValue] = useState("")

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      onChange(selectedInterests.filter((item) => item !== interest))
      return
    }

    onChange([...selectedInterests, interest])
  }

  const addCustomInterest = () => {
    const value = customValue.trim()
    if (value && !selectedInterests.includes(value)) {
      onChange([...selectedInterests, value])
    }
    setCustomValue("")
  }

  return (
    <section className="rounded-[2rem] border border-zinc-800/70 bg-zinc-950/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
      <div className="flex flex-col gap-4">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Your developer profile</p>
          <h2 className="text-2xl font-semibold text-white">Choose your interests</h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Select the topics that matter most and let DevSpot AI personalize your event feed.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/80 p-4">
            <div className="mb-4 flex flex-wrap gap-2">
              {interests.map((interest) => {
                const active = selectedInterests.includes(interest)
                return (
                  <Button
                    key={interest}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="rounded-full text-sm"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Button>
                )
              })}
            </div>

            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input
                  placeholder="Add custom interest"
                  value={customValue}
                  onChange={(event) => setCustomValue(event.target.value)}
                />
                <Button type="button" size="sm" variant="secondary" onClick={addCustomInterest}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedInterests.length === 0 ? (
                  <Badge variant="secondary">No interests selected</Badge>
                ) : (
                  selectedInterests.map((interest) => (
                    <Badge key={interest}>{interest}</Badge>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-zinc-800/70 bg-zinc-950/80 p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Event filter</p>
              <p className="text-sm text-zinc-400">Adjust the planner to focus on your preferred event signal.</p>
            </div>

            <div className="space-y-3">
              <Select value={sortOption} onValueChange={(value) => onSortChange(value as "recommended" | "distance" | "networking") }>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sort events</SelectLabel>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="distance">Nearest</SelectItem>
                    <SelectItem value="networking">Networking first</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="space-y-3 rounded-3xl bg-zinc-950/90 p-4 text-sm text-zinc-400">
                <p className="font-medium text-white">Location</p>
                <Input value="San Francisco, CA" disabled />
              </div>
            </div>

            <Button type="button" size="lg" onClick={onSubmit}>
              Recommend events
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
