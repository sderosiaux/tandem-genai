'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatMessages } from '@/components/chat/ChatMessages'
import { ChatInput } from '@/components/chat/ChatInput'
import { sendMessage, generateFirstMessage } from '@/lib/chat'
import { Message } from '@/lib/types'

export default function ChatPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const personaId = params.personaId as string
  const shouldInitiate = searchParams.get('initiate') === 'true'

  const {
    isLoaded,
    hasUserProfile,
    userProfile,
    getPersona,
    getConversation,
    addMessage,
  } = useAppState()

  const [isTyping, setIsTyping] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [hasInitiated, setHasInitiated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const persona = getPersona(personaId)
  const conversation = getConversation(personaId)

  // Sync local messages with store
  useEffect(() => {
    if (conversation?.messages) {
      setLocalMessages(conversation.messages)
    }
  }, [conversation?.messages])

  // Redirect if no profile or persona not found
  useEffect(() => {
    if (isLoaded && !hasUserProfile) {
      router.push('/')
    }
  }, [isLoaded, hasUserProfile, router])

  // Add messages with delay between each (simulates natural typing)
  const addMessagesWithDelay = useCallback(async (messages: string[], onDone?: () => void) => {
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]

      if (i > 0) {
        // Show typing indicator between messages
        setIsTyping(true)
        // Random delay between 800ms and 2000ms
        const delay = 800 + Math.random() * 1200
        await new Promise(resolve => setTimeout(resolve, delay))
        setIsTyping(false)
      }

      addMessage(personaId, { role: 'assistant', content: msg })

      // Small pause after adding message
      if (i < messages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    onDone?.()
  }, [personaId, addMessage])

  // Handle persona initiation
  const initiateConversation = useCallback(async () => {
    if (!persona || !userProfile || hasInitiated || localMessages.length > 0) return

    setHasInitiated(true)
    setIsTyping(true)
    setStreamingMessage('')

    await generateFirstMessage({
      persona,
      userProfile,
      onChunk: (chunk) => {
        setStreamingMessage((prev) => prev + chunk)
      },
      onComplete: async (fullMessage) => {
        setIsTyping(false)
        setStreamingMessage('')
        // Split multiple messages separated by ---
        const messages = fullMessage
          .split(/\n?---\n?/)
          .map((m) => m.trim())
          .filter((m) => m.length > 0)
        // Add each message with delay
        await addMessagesWithDelay(messages, () => {
          router.replace(`/chat/${personaId}`)
        })
      },
      onError: (err) => {
        console.error('Error generating first message:', err)
        setIsTyping(false)
        setStreamingMessage('')
        setError(`Erreur: ${err.message}`)
      },
    })
  }, [persona, userProfile, hasInitiated, localMessages.length, personaId, addMessagesWithDelay, router])

  // Auto-initiate if requested
  useEffect(() => {
    if (shouldInitiate && persona && userProfile && !hasInitiated && localMessages.length === 0) {
      initiateConversation()
    }
  }, [shouldInitiate, persona, userProfile, hasInitiated, localMessages.length, initiateConversation])

  const handleSend = async (content: string) => {
    if (!persona || !userProfile) return

    // Clear any previous error
    setError(null)

    // Add user message immediately
    addMessage(personaId, { role: 'user', content })

    // Get updated messages including the new one
    const currentMessages = [...localMessages, { id: 'temp', role: 'user' as const, content, timestamp: new Date() }]

    setIsTyping(true)
    setStreamingMessage('')

    // Prepare messages for API (last 20 for context)
    const apiMessages = currentMessages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    await sendMessage({
      persona,
      userProfile,
      messages: apiMessages,
      conversationHistory: currentMessages,
      onChunk: (chunk) => {
        setStreamingMessage((prev) => prev + chunk)
      },
      onComplete: async (fullMessage) => {
        setIsTyping(false)
        setStreamingMessage('')
        // Split multiple messages separated by ---
        const messages = fullMessage
          .split(/\n?---\n?/)
          .map((m) => m.trim())
          .filter((m) => m.length > 0)
        // Add each message with delay between them
        await addMessagesWithDelay(messages)
      },
      onError: (err) => {
        console.error('Error sending message:', err)
        setIsTyping(false)
        setStreamingMessage('')
        setError(`Erreur: ${err.message}`)
      },
    })
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  // Persona not found
  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Correspondant non trouvé</p>
          <button
            onClick={() => router.push('/')}
            className="text-primary hover:underline"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    )
  }

  // Combine stored messages with streaming message for display
  const displayMessages: Message[] = streamingMessage
    ? [
        ...localMessages,
        {
          id: 'streaming',
          role: 'assistant',
          content: streamingMessage,
          timestamp: new Date(),
        },
      ]
    : localMessages

  return (
    <div className="flex flex-col h-screen bg-secondary/30">
      <div className="flex flex-col h-full max-w-2xl mx-auto w-full bg-background shadow-sm">
        <ChatHeader persona={persona} />

        <ChatMessages
          messages={displayMessages}
          personaName={persona.name}
          isTyping={isTyping && !streamingMessage}
        />

        {error && (
          <div className="mx-4 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-destructive/70 hover:text-destructive mt-1"
            >
              Fermer
            </button>
          </div>
        )}

        <ChatInput
          onSend={handleSend}
          disabled={isTyping}
          placeholder={`Écrire à ${persona.name}...`}
        />
      </div>
    </div>
  )
}
