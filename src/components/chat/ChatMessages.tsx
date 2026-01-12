'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatBubble } from './ChatBubble'
import { TypingIndicator } from './TypingIndicator'
import { Message } from '@/lib/types'

interface ChatMessagesProps {
  messages: Message[]
  personaName: string
  isTyping?: boolean
}

export function ChatMessages({
  messages,
  personaName,
  isTyping = false,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive or typing starts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-muted-foreground mb-2">
            Commencez la conversation avec {personaName}
          </p>
          <p className="text-sm text-muted-foreground/70">
            Dites bonjour ou présentez-vous !
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1">
      <div className="p-4 space-y-4">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            personaName={personaName}
          />
        ))}

        {isTyping && <TypingIndicator personaName={personaName} />}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
