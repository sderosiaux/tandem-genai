'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppState, UserProfile, Persona, Conversation, Message } from './types'
import { PRESET_PERSONAS } from './personas'

const STORAGE_KEY = 'tandem-genai-state'

// État initial
const getInitialState = (): AppState => ({
  userProfile: null,
  personas: PRESET_PERSONAS,
  conversations: {},
})

// Lire depuis LocalStorage
export const loadState = (): AppState => {
  if (typeof window === 'undefined') return getInitialState()

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return getInitialState()

    const parsed = JSON.parse(stored)

    // Reconstruire les dates
    if (parsed.userProfile?.createdAt) {
      parsed.userProfile.createdAt = new Date(parsed.userProfile.createdAt)
    }

    // Reconstruire les dates des messages
    Object.keys(parsed.conversations || {}).forEach((personaId) => {
      const conv = parsed.conversations[personaId]
      if (conv.lastMessageAt) {
        conv.lastMessageAt = new Date(conv.lastMessageAt)
      }
      conv.messages = conv.messages.map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }))
    })

    // Merge avec les presets (au cas où on en ajoute de nouveaux)
    const customPersonas = (parsed.personas || []).filter(
      (p: Persona) => !p.isPreset
    )

    return {
      ...parsed,
      personas: [...PRESET_PERSONAS, ...customPersonas],
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error)
    return getInitialState()
  }
}

// Sauvegarder dans LocalStorage
export const saveState = (state: AppState): void => {
  if (typeof window === 'undefined') return

  try {
    // Ne sauvegarder que les personas custom (pas les presets)
    const stateToSave = {
      ...state,
      personas: state.personas.filter((p) => !p.isPreset),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  } catch (error) {
    console.error('Failed to save state to localStorage:', error)
  }
}

// Effacer toutes les données
export const clearState = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// Hook principal pour gérer l'état de l'app
export function useAppState() {
  const [state, setState] = useState<AppState>(getInitialState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Charger l'état au montage (côté client uniquement)
  useEffect(() => {
    const loaded = loadState()
    setState(loaded)
    setIsLoaded(true)
  }, [])

  // Sauvegarder à chaque changement d'état
  useEffect(() => {
    if (isLoaded) {
      saveState(state)
    }
  }, [state, isLoaded])

  // Définir le profil utilisateur
  const setUserProfile = useCallback((profile: UserProfile) => {
    setState((prev) => ({ ...prev, userProfile: profile }))
  }, [])

  // Mettre à jour le profil utilisateur
  const updateUserProfile = useCallback(
    (updates: Partial<Omit<UserProfile, 'createdAt'>>) => {
      setState((prev) => {
        if (!prev.userProfile) return prev
        return {
          ...prev,
          userProfile: { ...prev.userProfile, ...updates },
        }
      })
    },
    []
  )

  // Ajouter un message à une conversation
  const addMessage = useCallback(
    (personaId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
      setState((prev) => {
        const existingConversation = prev.conversations[personaId]
        const conversation: Conversation = existingConversation || {
          personaId,
          messages: [],
          lastMessageAt: new Date(),
        }

        const newMessage: Message = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }

        return {
          ...prev,
          conversations: {
            ...prev.conversations,
            [personaId]: {
              ...conversation,
              messages: [...conversation.messages, newMessage],
              lastMessageAt: new Date(),
            },
          },
        }
      })
    },
    []
  )

  // Récupérer une conversation
  const getConversation = useCallback(
    (personaId: string): Conversation | null => {
      return state.conversations[personaId] || null
    },
    [state.conversations]
  )

  // Récupérer un persona par ID
  const getPersona = useCallback(
    (personaId: string): Persona | null => {
      return state.personas.find((p) => p.id === personaId) || null
    },
    [state.personas]
  )

  // Supprimer une conversation
  const deleteConversation = useCallback((personaId: string) => {
    setState((prev) => {
      const { [personaId]: _, ...remainingConversations } = prev.conversations
      return {
        ...prev,
        conversations: remainingConversations,
      }
    })
  }, [])

  // Réinitialiser toutes les données
  const resetAllData = useCallback(() => {
    clearState()
    setState(getInitialState())
  }, [])

  return {
    state,
    isLoaded,
    // User profile
    setUserProfile,
    updateUserProfile,
    hasUserProfile: !!state.userProfile,
    userProfile: state.userProfile,
    // Personas
    personas: state.personas,
    getPersona,
    // Conversations
    conversations: state.conversations,
    addMessage,
    getConversation,
    deleteConversation,
    // Utils
    resetAllData,
  }
}

// Hook pour une conversation spécifique
export function useConversation(personaId: string) {
  const { getConversation, getPersona, addMessage, state } = useAppState()

  const conversation = getConversation(personaId)
  const persona = getPersona(personaId)
  const messages = conversation?.messages || []

  const sendMessage = useCallback(
    (content: string) => {
      addMessage(personaId, { role: 'user', content })
    },
    [addMessage, personaId]
  )

  const addAssistantMessage = useCallback(
    (content: string) => {
      addMessage(personaId, { role: 'assistant', content })
    },
    [addMessage, personaId]
  )

  return {
    conversation,
    persona,
    messages,
    userProfile: state.userProfile,
    sendMessage,
    addAssistantMessage,
    hasMessages: messages.length > 0,
  }
}
