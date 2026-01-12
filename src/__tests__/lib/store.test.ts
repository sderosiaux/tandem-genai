import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadState, saveState, clearState } from '@/lib/store'
import { PRESET_PERSONAS } from '@/lib/personas'
import { AppState, Persona, UserProfile } from '@/lib/types'

// Mock localStorage
const createLocalStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    _getStore: () => store,
    _setStore: (newStore: Record<string, string>) => {
      store = newStore
    },
  }
}

describe('Store', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>

  beforeEach(() => {
    localStorageMock = createLocalStorageMock()
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  })

  describe('loadState', () => {
    it('returns initial state when localStorage is empty', () => {
      const state = loadState()

      expect(state.userProfile).toBeNull()
      expect(state.personas).toHaveLength(PRESET_PERSONAS.length)
      expect(state.conversations).toEqual({})
    })

    it('returns initial state with all preset personas', () => {
      const state = loadState()

      expect(state.personas).toContainEqual(
        expect.objectContaining({ id: 'jake-texas', name: 'Jake' })
      )
      expect(state.personas).toContainEqual(
        expect.objectContaining({ id: 'maria-brazil', name: 'Maria' })
      )
      expect(state.personas).toContainEqual(
        expect.objectContaining({ id: 'hans-germany', name: 'Hans' })
      )
      expect(state.personas).toContainEqual(
        expect.objectContaining({ id: 'yuki-japan', name: 'Yuki' })
      )
      expect(state.personas).toContainEqual(
        expect.objectContaining({ id: 'james-uk', name: 'James' })
      )
      expect(state.personas).toContainEqual(
        expect.objectContaining({ id: 'sofia-italy', name: 'Sofia' })
      )
    })

    it('loads persisted user profile from localStorage', () => {
      const mockState: AppState = {
        userProfile: {
          name: 'Alice',
          location: 'Paris',
          description: 'Développeuse',
          createdAt: new Date('2024-01-15'),
        },
        personas: [],
        conversations: {},
      }
      localStorageMock.setItem(
        'tandem-genai-state',
        JSON.stringify(mockState)
      )

      const state = loadState()

      expect(state.userProfile?.name).toBe('Alice')
      expect(state.userProfile?.location).toBe('Paris')
      expect(state.userProfile?.description).toBe('Développeuse')
      expect(state.userProfile?.createdAt).toBeInstanceOf(Date)
    })

    it('loads persisted conversations with proper date reconstruction', () => {
      const timestamp = new Date('2024-01-15T10:30:00Z')
      const mockState: AppState = {
        userProfile: null,
        personas: [],
        conversations: {
          'jake-texas': {
            personaId: 'jake-texas',
            messages: [
              {
                id: 'msg-1',
                role: 'user',
                content: 'Salut Jake!',
                timestamp: timestamp,
              },
              {
                id: 'msg-2',
                role: 'assistant',
                content: 'Hey! Comment tu vas?',
                timestamp: timestamp,
              },
            ],
            lastMessageAt: timestamp,
          },
        },
      }
      localStorageMock.setItem(
        'tandem-genai-state',
        JSON.stringify(mockState)
      )

      const state = loadState()

      expect(state.conversations['jake-texas']).toBeDefined()
      expect(state.conversations['jake-texas'].messages).toHaveLength(2)
      expect(state.conversations['jake-texas'].messages[0].timestamp).toBeInstanceOf(Date)
      expect(state.conversations['jake-texas'].lastMessageAt).toBeInstanceOf(Date)
    })

    it('merges preset personas with stored custom personas', () => {
      const customPersona: Partial<Persona> = {
        id: 'custom-1',
        name: 'Custom Persona',
        isPreset: false,
        nationality: 'Test',
        nationalityCode: 'XX',
        age: 30,
        profession: 'Tester',
        frenchLevel: 'intermediate',
        frenchExposure: 'tourist',
        traits: ['curious'],
        interests: ['tech'],
        communicationStyle: 'casual',
        background: 'Test background',
        createdAt: new Date(),
      }
      const mockState = {
        userProfile: null,
        personas: [customPersona],
        conversations: {},
      }
      localStorageMock.setItem(
        'tandem-genai-state',
        JSON.stringify(mockState)
      )

      const state = loadState()

      // Should have all presets + custom persona
      expect(state.personas.length).toBe(PRESET_PERSONAS.length + 1)
      expect(state.personas.find((p) => p.id === 'custom-1')).toBeDefined()
    })

    it('does not duplicate preset personas when loading', () => {
      // Simulate storing presets (which shouldn't happen, but let's be safe)
      const mockState = {
        userProfile: null,
        personas: [{ ...PRESET_PERSONAS[0] }], // Storing a preset
        conversations: {},
      }
      localStorageMock.setItem(
        'tandem-genai-state',
        JSON.stringify(mockState)
      )

      const state = loadState()

      // Should still only have PRESET_PERSONAS.length personas
      // because we filter out presets when loading
      expect(state.personas.length).toBe(PRESET_PERSONAS.length)
    })

    it('returns initial state on JSON parse error', () => {
      localStorageMock.setItem('tandem-genai-state', 'invalid json{{{')

      const state = loadState()

      expect(state.userProfile).toBeNull()
      expect(state.personas).toHaveLength(PRESET_PERSONAS.length)
      expect(state.conversations).toEqual({})
    })
  })

  describe('saveState', () => {
    it('persists state to localStorage', () => {
      const userProfile: UserProfile = {
        name: 'Bob',
        location: 'Lyon',
        description: 'Designer',
        createdAt: new Date(),
      }
      const state: AppState = {
        userProfile,
        personas: PRESET_PERSONAS,
        conversations: {},
      }

      saveState(state)

      expect(localStorageMock.setItem).toHaveBeenCalled()
      const savedData = JSON.parse(
        localStorageMock._getStore()['tandem-genai-state']
      )
      expect(savedData.userProfile.name).toBe('Bob')
    })

    it('does not save preset personas (only custom)', () => {
      const state: AppState = {
        userProfile: null,
        personas: PRESET_PERSONAS,
        conversations: {},
      }

      saveState(state)

      const savedData = JSON.parse(
        localStorageMock._getStore()['tandem-genai-state']
      )
      expect(savedData.personas).toHaveLength(0)
    })

    it('saves custom personas alongside presets', () => {
      const customPersona: Persona = {
        id: 'custom-2',
        name: 'Custom',
        age: 25,
        nationality: 'Test',
        nationalityCode: 'XX',
        profession: 'Tester',
        frenchLevel: 'beginner',
        frenchExposure: 'never-visited',
        traits: ['shy'],
        interests: ['music'],
        communicationStyle: 'hesitant',
        background: 'Test',
        isPreset: false,
        createdAt: new Date(),
      }
      const state: AppState = {
        userProfile: null,
        personas: [...PRESET_PERSONAS, customPersona],
        conversations: {},
      }

      saveState(state)

      const savedData = JSON.parse(
        localStorageMock._getStore()['tandem-genai-state']
      )
      expect(savedData.personas).toHaveLength(1)
      expect(savedData.personas[0].id).toBe('custom-2')
    })

    it('persists conversations with messages', () => {
      const state: AppState = {
        userProfile: null,
        personas: PRESET_PERSONAS,
        conversations: {
          'jake-texas': {
            personaId: 'jake-texas',
            messages: [
              {
                id: 'msg-1',
                role: 'user',
                content: 'Hello!',
                timestamp: new Date(),
              },
            ],
            lastMessageAt: new Date(),
          },
        },
      }

      saveState(state)

      const savedData = JSON.parse(
        localStorageMock._getStore()['tandem-genai-state']
      )
      expect(savedData.conversations['jake-texas'].messages).toHaveLength(1)
      expect(savedData.conversations['jake-texas'].messages[0].content).toBe(
        'Hello!'
      )
    })
  })

  describe('clearState', () => {
    it('removes state from localStorage', () => {
      localStorageMock.setItem('tandem-genai-state', '{"test": true}')

      clearState()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'tandem-genai-state'
      )
    })
  })
})
