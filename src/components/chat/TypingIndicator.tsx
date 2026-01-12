import { cn } from '@/lib/utils'

interface TypingIndicatorProps {
  personaName: string
  className?: string
}

export function TypingIndicator({ personaName, className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-start gap-2 max-w-[80%]', className)}>
      <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
        </div>
      </div>
    </div>
  )
}
