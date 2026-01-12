import { cn } from '@/lib/utils'
import { Message } from '@/lib/types'

interface ChatBubbleProps {
  message: Message
  personaName?: string
}

export function ChatBubble({ message, personaName }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  return (
    <div
      className={cn(
        'flex flex-col max-w-[80%]',
        isUser ? 'ml-auto items-end' : 'mr-auto items-start'
      )}
    >
      <div
        className={cn(
          'rounded-2xl px-4 py-2.5',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-secondary text-secondary-foreground rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
      <span className="text-xs text-muted-foreground mt-1 px-1">
        {formatTime(message.timestamp)}
      </span>
    </div>
  )
}
