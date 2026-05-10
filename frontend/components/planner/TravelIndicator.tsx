import { motion } from "framer-motion"

interface TravelIndicatorProps {
  label: string
  subLabel: string
}

export function TravelIndicator({ label, subLabel }: TravelIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative mx-auto max-w-3xl rounded-[2rem] border border-cyan-500/10 bg-zinc-950/80 p-4 text-sm text-zinc-300 shadow-[0_30px_80px_rgba(15,23,42,0.2)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="mt-1 text-xs text-zinc-500">{subLabel}</p>
        </div>
        <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
          Smooth transition
        </div>
      </div>
    </motion.div>
  )
}
