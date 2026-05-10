import { Badge } from "@/components/ui/badge"

interface InterestSelectorProps {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}

export function InterestSelector({ options, selected, onToggle }: InterestSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option)
        return (
          <Badge
            key={option}
            variant={active ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onToggle(option)}
          >
            {option}
          </Badge>
        )
      })}
    </div>
  )
}
