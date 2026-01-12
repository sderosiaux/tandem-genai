import { describe, it, expect } from 'vitest'
import { generateSystemPrompt, generateFirstMessagePrompt } from '@/lib/prompts'
import { PRESET_PERSONAS } from '@/lib/personas'
import { UserProfile, Message } from '@/lib/types'

const mockUserProfile: UserProfile = {
  name: 'Alice',
  location: 'Paris',
  description: 'Développeuse passionnée de voyages et de cuisine',
  createdAt: new Date('2024-01-01'),
}

describe('generateSystemPrompt', () => {
  describe('persona information', () => {
    it('includes persona name and age', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile)

      expect(prompt).toContain('Jake')
      expect(prompt).toContain('32 ans')
    })

    it('includes persona nationality', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile)

      expect(prompt).toContain('États-Unis')
    })

    it('includes persona profession', () => {
      const hans = PRESET_PERSONAS.find((p) => p.id === 'hans-germany')!
      const prompt = generateSystemPrompt(hans, mockUserProfile)

      expect(prompt).toContain('Ingénieur automobile')
    })

    it('includes persona background story', () => {
      const maria = PRESET_PERSONAS.find((p) => p.id === 'maria-brazil')!
      const prompt = generateSystemPrompt(maria, mockUserProfile)

      expect(prompt).toContain('São Paulo')
      expect(prompt).toContain('beaux-arts')
    })

    it('includes personality traits', () => {
      const james = PRESET_PERSONAS.find((p) => p.id === 'james-uk')!
      const prompt = generateSystemPrompt(james, mockUserProfile)

      expect(prompt).toContain('arrogant')
      expect(prompt).toContain('confident')
    })

    it('includes interests', () => {
      const sofia = PRESET_PERSONAS.find((p) => p.id === 'sofia-italy')!
      const prompt = generateSystemPrompt(sofia, mockUserProfile)

      expect(prompt).toContain('cooking')
      expect(prompt).toContain('music')
    })
  })

  describe('user profile information', () => {
    it('includes user name', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile)

      expect(prompt).toContain('Alice')
    })

    it('includes user location', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile)

      expect(prompt).toContain('Paris')
    })

    it('includes user description', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile)

      expect(prompt).toContain('Développeuse passionnée de voyages et de cuisine')
    })
  })

  describe('conversation context', () => {
    it('indicates first conversation when no history', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile, [])

      expect(prompt).toContain('PREMIÈRE conversation')
      expect(prompt).toContain('Tu ne connais pas encore')
    })

    it('indicates getting to know phase for few messages', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const history: Message[] = Array.from({ length: 5 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: 'Test message',
        timestamp: new Date(),
      }))
      const prompt = generateSystemPrompt(jake, mockUserProfile, history)

      expect(prompt).toContain('5 messages')
      expect(prompt).toContain('commencez à vous connaître')
    })

    it('indicates established relationship for moderate messages', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const history: Message[] = Array.from({ length: 20 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: 'Test message',
        timestamp: new Date(),
      }))
      const prompt = generateSystemPrompt(jake, mockUserProfile, history)

      expect(prompt).toContain('20 messages')
      expect(prompt).toContain('vous connaissez maintenant')
    })

    it('indicates habitual relationship for many messages', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const history: Message[] = Array.from({ length: 50 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: 'Test message',
        timestamp: new Date(),
      }))
      const prompt = generateSystemPrompt(jake, mockUserProfile, history)

      expect(prompt).toContain('50 messages')
      expect(prompt).toContain('habitués')
    })
  })

  describe('French level errors', () => {
    it('includes beginner-level errors for Jake', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile)

      expect(prompt).toContain('Verbes non conjugués')
      expect(prompt).toContain('Mots anglais')
      expect(prompt).toContain('Genre aléatoire')
    })

    it('includes American-specific errors for Jake', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile)

      expect(prompt).toContain('Structure de phrase anglaise')
    })

    it('includes intermediate-level errors for Maria', () => {
      const maria = PRESET_PERSONAS.find((p) => p.id === 'maria-brazil')!
      const prompt = generateSystemPrompt(maria, mockUserProfile)

      expect(prompt).toContain('Subjonctif')
      expect(prompt).toContain('Prépositions incorrectes')
    })

    it('includes advanced-level errors for Hans', () => {
      const hans = PRESET_PERSONAS.find((p) => p.id === 'hans-germany')!
      const prompt = generateSystemPrompt(hans, mockUserProfile)

      expect(prompt).toContain('Structure de phrase germanique')
    })

    it('includes near-native characteristics for James', () => {
      const james = PRESET_PERSONAS.find((p) => p.id === 'james-uk')!
      const prompt = generateSystemPrompt(james, mockUserProfile)

      expect(prompt).toContain('Quasi aucune erreur')
      expect(prompt).toContain('Vocabulaire parfois précieux')
    })

    it('includes Italian-specific quirks for Sofia', () => {
      const sofia = PRESET_PERSONAS.find((p) => p.id === 'sofia-italy')!
      const prompt = generateSystemPrompt(sofia, mockUserProfile)

      expect(prompt).toContain('allora')
      expect(prompt).toContain('magari')
    })
  })

  describe('personality trait behaviors', () => {
    it('includes confident behavior for confident personas', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile)

      expect(prompt).toContain('assurance')
    })

    it('includes arrogant behavior for James', () => {
      const james = PRESET_PERSONAS.find((p) => p.id === 'james-uk')!
      const prompt = generateSystemPrompt(james, mockUserProfile)

      expect(prompt).toContain('supérieur')
      expect(prompt).toContain('condescendantes')
    })

    it('includes shy behavior for Yuki', () => {
      const yuki = PRESET_PERSONAS.find((p) => p.id === 'yuki-japan')!
      const prompt = generateSystemPrompt(yuki, mockUserProfile)

      expect(prompt).toContain('réservé')
      expect(prompt).toContain('peut-être')
    })

    it('includes talkative behavior for Maria', () => {
      const maria = PRESET_PERSONAS.find((p) => p.id === 'maria-brazil')!
      const prompt = generateSystemPrompt(maria, mockUserProfile)

      expect(prompt).toContain('beaucoup')
      expect(prompt).toContain('digressions')
    })
  })

  describe('communication style', () => {
    it('includes formal style for Hans', () => {
      const hans = PRESET_PERSONAS.find((p) => p.id === 'hans-germany')!
      const prompt = generateSystemPrompt(hans, mockUserProfile)

      expect(prompt).toContain('vouvoies')
      expect(prompt).toContain('soutenu')
    })

    it('includes casual style for Jake', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile)

      expect(prompt).toContain('tutoies naturellement')
    })

    it('includes hesitant style for Yuki', () => {
      const yuki = PRESET_PERSONAS.find((p) => p.id === 'yuki-japan')!
      const prompt = generateSystemPrompt(yuki, mockUserProfile)

      expect(prompt).toContain('pauses')
      expect(prompt).toContain('comment on dit')
    })
  })

  describe('core rules', () => {
    it('instructs to always respond in French', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile)

      expect(prompt).toContain('TOUJOURS en français')
    })

    it('instructs to never reveal being an AI', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile)

      expect(prompt).toContain('ne dis JAMAIS que tu es une IA')
    })

    it('instructs to stay in character', () => {
      const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
      const prompt = generateSystemPrompt(jake, mockUserProfile)

      expect(prompt).toContain('restes TOUJOURS dans ton personnage')
    })
  })
})

describe('generateFirstMessagePrompt', () => {
  it('includes base system prompt', () => {
    const maria = PRESET_PERSONAS.find((p) => p.id === 'maria-brazil')!
    const prompt = generateFirstMessagePrompt(maria, mockUserProfile)

    expect(prompt).toContain('Maria')
    expect(prompt).toContain('28 ans')
    expect(prompt).toContain('Brésil')
  })

  it('instructs to write first message', () => {
    const maria = PRESET_PERSONAS.find((p) => p.id === 'maria-brazil')!
    const prompt = generateFirstMessagePrompt(maria, mockUserProfile)

    expect(prompt).toContain('PREMIER message')
  })

  it('instructs to introduce oneself', () => {
    const maria = PRESET_PERSONAS.find((p) => p.id === 'maria-brazil')!
    const prompt = generateFirstMessagePrompt(maria, mockUserProfile)

    expect(prompt).toContain('Présente-toi')
  })

  it('instructs to ask a question', () => {
    const maria = PRESET_PERSONAS.find((p) => p.id === 'maria-brazil')!
    const prompt = generateFirstMessagePrompt(maria, mockUserProfile)

    expect(prompt).toContain('Pose une question')
  })

  it('references user profile', () => {
    const maria = PRESET_PERSONAS.find((p) => p.id === 'maria-brazil')!
    const prompt = generateFirstMessagePrompt(maria, mockUserProfile)

    expect(prompt).toContain('Alice')
  })

  it('instructs to make French errors', () => {
    const jake = PRESET_PERSONAS.find((p) => p.id === 'jake-texas')!
    const prompt = generateFirstMessagePrompt(jake, mockUserProfile)

    expect(prompt).toContain('erreurs de français')
  })
})
