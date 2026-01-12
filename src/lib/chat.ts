import { Persona, UserProfile, Message } from './types'

interface SendMessageOptions {
  persona: Persona
  userProfile: UserProfile
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  conversationHistory: Message[]
  onChunk: (chunk: string) => void
  onComplete: (fullMessage: string) => void
  onError: (error: Error) => void
}

export async function sendMessage({
  persona,
  userProfile,
  messages,
  conversationHistory,
  onChunk,
  onComplete,
  onError,
}: SendMessageOptions): Promise<void> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona,
        userProfile,
        messages,
        conversationHistory,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let fullMessage = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      fullMessage += chunk
      onChunk(chunk)
    }

    // Don't save empty messages
    if (fullMessage.trim()) {
      onComplete(fullMessage)
    } else {
      onError(new Error('Réponse vide du serveur'))
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'))
  }
}

interface GenerateFirstMessageOptions {
  persona: Persona
  userProfile: UserProfile
  onChunk: (chunk: string) => void
  onComplete: (fullMessage: string) => void
  onError: (error: Error) => void
}

export async function generateFirstMessage({
  persona,
  userProfile,
  onChunk,
  onComplete,
  onError,
}: GenerateFirstMessageOptions): Promise<void> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona,
        userProfile,
        messages: [],
        conversationHistory: [],
        generateFirstMessage: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let fullMessage = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      fullMessage += chunk
      onChunk(chunk)
    }

    // Don't save empty messages
    if (fullMessage.trim()) {
      onComplete(fullMessage)
    } else {
      onError(new Error('Réponse vide du serveur'))
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'))
  }
}
