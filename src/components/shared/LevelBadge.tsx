import { Badge } from '@/components/ui/badge'
import { FrenchLevel, FRENCH_LEVEL_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
  level: FrenchLevel
  className?: string
}

const levelColors: Record<FrenchLevel, string> = {
  beginner: 'bg-red-100 text-red-700 hover:bg-red-100',
  intermediate: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  advanced: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  'near-native': 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100',
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(levelColors[level], 'font-medium', className)}
    >
      {FRENCH_LEVEL_LABELS[level]}
    </Badge>
  )
}
