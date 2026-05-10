import { motion } from "framer-motion"

interface TimelineConnectorProps {
  active?: boolean
}

export function TimelineConnector({ active = true }: TimelineConnectorProps) {
  return (
    <div className="absolute left-6 top-0 flex h-full items-start">
      <div className="relative flex h-full w-1 items-start justify-center">
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 block h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]"
        />
        <span className="absolute left-1/2 top-4 h-full w-px -translate-x-1/2 bg-gradient-to-b from-cyan-500/60 via-purple-500/40 to-transparent" />
      </div>
    </div>
  )
}
