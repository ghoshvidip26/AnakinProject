import { motion } from "framer-motion"
import { TimelineConnector } from "./TimelineConnector"
import { TimelineNode } from "./TimelineNode"
import { TravelIndicator } from "./TravelIndicator"
import { buildEventReason, buildTravelHint } from "@/lib/ai"
import type { RankedEvent } from "@/lib/scoring"
import type { PlannerInput } from "@/lib/ai"

interface TimelineProps {
  schedule: RankedEvent[]
  input: PlannerInput
}

export function Timeline({ schedule, input }: TimelineProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.14 } },
      }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.35)]"
    >
      <div className="pointer-events-none absolute left-10 top-6 h-[calc(100%-3rem)] w-px bg-gradient-to-b from-cyan-400/60 via-purple-400/40 to-transparent" />
      <div className="space-y-10">
        {schedule.map((event, index) => (
          <motion.div
            key={event.id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0 },
            }}
            className="relative"
          >
            <TimelineConnector />
            <div className="ml-14">
              <TimelineNode event={event} reason={buildEventReason(event, input)} />
              {index < schedule.length - 1 ? (
                (() => {
                  const hint = buildTravelHint(event, schedule[index + 1])
                  return (
                    <TravelIndicator
                      label={hint.label}
                      subLabel={`${hint.route} • ${hint.distance} km`}
                    />
                  )
                })()
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
