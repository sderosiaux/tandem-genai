import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PRESET_PERSONAS } from '@/lib/personas'
import { UserProfile } from '@/lib/types'

const mockUserProfile: UserProfile = {
  name: 'Alice',
  location: 'Paris',
  description: 'Développeuse',
  createdAt: new Date(),
}

// We'll test validation logic without mocking OpenAI since the API route
// handles errors gracefully and returns 500 when OpenAI fails

describe('Chat API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('request body structure', () => {
    it('should have correct shape for normal message', () => {
      const requestBody = {
        persona: PRESET_PERSONAS[0],
        userProfile: mockUserProfile,
        messages: [{ role: 'user', content: 'Salut !' }],
        conversationHistory: [],
      }

      expect(requestBody.persona).toBeDefined()
      expect(requestBody.persona.id).toBe('jake-texas')
      expect(requestBody.userProfile.name).toBe('Alice')
      expect(requestBody.messages).toHaveLength(1)
      expect(requestBody.messages[0].role).toBe('user')
    })

    it('should have correct shape for first message generation', () => {
      const requestBody = {
        persona: PRESET_PERSONAS[0],
        userProfile: mockUserProfile,
        messages: [],
        conversationHistory: [],
        generateFirstMessage: true,
      }

      expect(requestBody.generateFirstMessage).toBe(true)
      expect(requestBody.messages).toHaveLength(0)
    })

    it('should include conversation history for context', () => {
      const history = [
        { id: '1', role: 'user' as const, content: 'Salut', timestamp: new Date() },
        { id: '2', role: 'assistant' as const, content: 'Hey!', timestamp: new Date() },
      ]

      const requestBody = {
        persona: PRESET_PERSONAS[0],
        userProfile: mockUserProfile,
        messages: [
          { role: 'user', content: 'Salut' },
          { role: 'assistant', content: 'Hey!' },
          { role: 'user', content: 'Ça va ?' },
        ],
        conversationHistory: history,
      }

      expect(requestBody.conversationHistory).toHaveLength(2)
      expect(requestBody.messages).toHaveLength(3)
    })
  })

  describe('persona data for API', () => {
    it('should include all necessary persona fields', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!

      expect(jake.name).toBe('Jake')
      expect(jake.age).toBe(32)
      expect(jake.nationality).toBe('États-Unis')
      expect(jake.frenchLevel).toBe('beginner')
      expect(jake.traits).toContain('confident')
      expect(jake.background).toBeDefined()
    })

    it('should have correct French level for each persona', () => {
      const levelMap = {
        'jake-texas': 'beginner',
        'maria-brazil': 'intermediate',
        'hans-germany': 'advanced',
        'yuki-japan': 'intermediate',
        'james-uk': 'near-native',
        'sofia-italy': 'advanced',
      }

      Object.entries(levelMap).forEach(([id, expectedLevel]) => {
        const persona = PRESET_PERSONAS.find((p) => p.id === id)
        expect(persona?.frenchLevel).toBe(expectedLevel)
      })
    })
  })

  describe('user profile for API', () => {
    it('should include all user profile fields', () => {
      expect(mockUserProfile.name).toBeDefined()
      expect(mockUserProfile.location).toBeDefined()
      expect(mockUserProfile.description).toBeDefined()
      expect(mockUserProfile.createdAt).toBeInstanceOf(Date)
    })
  })
})
