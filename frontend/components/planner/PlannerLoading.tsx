"use client"

import { motion } from "framer-motion"

const steps = [
  "Scanning Bangalore tech events...",
  "Analyzing networking density...",
  "Calculating optimal commute flow...",
  "Generating your developer timeline...",
]

export function PlannerLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-[#06101f]/95 p-8 shadow-[0_40px_120px_rgba(16,24,40,0.55)]"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-violet-500 to-cyan-400 opacity-80" />
        <div className="pb-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
            AI generation in progress
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white">
            Crafting your Bangalore developer timeline...
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            This may take a few moments while DevSpot AI optimizes for networking, timing, and travel.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.12, duration: 0.4, ease: "easeOut" }}
              className="rounded-3xl border border-white/5 bg-zinc-900/80 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]" />
                <p className="text-sm font-medium text-white">Step {index + 1}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{step}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-cyan-500/10 bg-white/5 p-4 text-sm text-zinc-300 shadow-inner shadow-cyan-500/5">
          <div className="mb-4 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-cyan-300/60">
            <span>Processing insight deck</span>
            <span>Approx. 3 seconds</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 w-[40%] rounded-full bg-cyan-400/90 shadow-[0_0_30px_rgba(56,189,248,0.45)]"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
