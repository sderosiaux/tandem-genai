# Plan d'Implémentation - Tandem GenAI

## Phase 1 : Setup Projet

### 1.1 Initialisation Next.js 15

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Options :
- TypeScript : Yes
- Tailwind CSS : Yes
- ESLint : Yes
- App Router : Yes
- `src/` directory : Yes
- Turbopack : Yes

### 1.2 Installation Shadcn/ui

```bash
npx shadcn@latest init
```

Composants à installer :
```bash
npx shadcn@latest add button card input textarea avatar badge scroll-area separator
```

### 1.3 Dépendances additionnelles

```bash
npm install openai
npm install -D vitest @testing-library/react @testing-library/dom jsdom @vitejs/plugin-react
```

### 1.4 Structure de fichiers

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Onboarding ou Galerie
│   ├── chat/
│   │   └── [personaId]/
│   │       └── page.tsx            # Interface chat
│   ├── settings/
│   │   └── page.tsx                # Modifier profil user
│   └── api/
│       └── chat/
│           └── route.ts            # API OpenAI
├── components/
│   ├── ui/                         # Shadcn components
│   ├── onboarding/
│   │   └── OnboardingForm.tsx
│   ├── gallery/
│   │   ├── PersonaCard.tsx
│   │   └── PersonaGallery.tsx
│   ├── chat/
│   │   ├── ChatHeader.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessages.tsx
│   │   └── TypingIndicator.tsx
│   └── shared/
│       ├── FlagIcon.tsx
│       └── LevelBadge.tsx
├── lib/
│   ├── types.ts                    # Interfaces TypeScript
│   ├── store.ts                    # LocalStorage hooks
│   ├── personas.ts                 # 6 personas pré-définis
│   ├── prompts.ts                  # Génération system prompts
│   └── utils.ts                    # Helpers
├── styles/
│   └── theme.ts                    # Design tokens
└── __tests__/
    ├── lib/
    │   ├── store.test.ts
    │   └── prompts.test.ts
    └── api/
        └── chat.test.ts
```

---

## Phase 2 : Core Library

### 2.1 Types TypeScript (`src/lib/types.ts`)

```typescript
// Niveaux de français
export type FrenchLevel = 'beginner' | 'intermediate' | 'advanced' | 'near-native'

// Exposition au français
export type FrenchExposure =
  | 'never-visited'
  | 'tourist'
  | 'lived-in-france'
  | 'lives-in-france'
  | 'quebec'
  | 'belgium'
  | 'switzerland'

// Style de communication
export type CommunicationStyle = 'formal' | 'casual' | 'familiar' | 'hesitant'

// Traits de personnalité
export type PersonalityTrait =
  | 'confident' | 'shy' | 'curious' | 'sarcastic'
  | 'warm' | 'arrogant' | 'hesitant' | 'enthusiastic'
  | 'reserved' | 'talkative'

// Centres d'intérêt
export type Interest =
  | 'sports' | 'tech' | 'cooking' | 'travel'
  | 'politics' | 'art' | 'music' | 'cinema'
  | 'nature' | 'business' | 'gaming' | 'reading'

// Persona (l'IA)
export interface Persona {
  id: string
  name: string
  age: number
  nationality: string
  nationalityCode: string  // ISO code pour drapeau
  profession: string
  frenchLevel: FrenchLevel
  frenchExposure: FrenchExposure
  traits: PersonalityTrait[]
  interests: Interest[]
  communicationStyle: CommunicationStyle
  background: string
  avatar?: string
  isPreset: boolean
  createdAt: Date
}

// Message dans une conversation
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Conversation avec un persona
export interface Conversation {
  personaId: string
  messages: Message[]
  relationshipSummary?: string
  lastMessageAt: Date
}

// Profil utilisateur
export interface UserProfile {
  name: string
  location: string
  description: string
  createdAt: Date
}

// État global de l'app
export interface AppState {
  userProfile: UserProfile | null
  personas: Persona[]
  conversations: Record<string, Conversation>
}
```

### 2.2 Store LocalStorage (`src/lib/store.ts`)

```typescript
import { useState, useEffect, useCallback } from 'react'
import { AppState, UserProfile, Persona, Conversation, Message } from './types'
import { PRESET_PERSONAS } from './personas'

const STORAGE_KEY = 'tandem-genai-state'

// État initial
const getInitialState = (): AppState => ({
  userProfile: null,
  personas: PRESET_PERSONAS,
  conversations: {}
})

// Lire depuis LocalStorage
export const loadState = (): AppState => {
  if (typeof window === 'undefined') return getInitialState()

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return getInitialState()

    const parsed = JSON.parse(stored)
    // Merge avec les presets (au cas où on en ajoute)
    return {
      ...parsed,
      personas: [...PRESET_PERSONAS, ...parsed.personas.filter((p: Persona) => !p.isPreset)]
    }
  } catch {
    return getInitialState()
  }
}

// Sauvegarder dans LocalStorage
export const saveState = (state: AppState): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// Hook principal
export const useAppState = () => {
  const [state, setState] = useState<AppState>(getInitialState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Charger au mount
  useEffect(() => {
    setState(loadState())
    setIsLoaded(true)
  }, [])

  // Sauvegarder à chaque changement
  useEffect(() => {
    if (isLoaded) {
      saveState(state)
    }
  }, [state, isLoaded])

  // Actions
  const setUserProfile = useCallback((profile: UserProfile) => {
    setState(prev => ({ ...prev, userProfile: profile }))
  }, [])

  const addMessage = useCallback((personaId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    setState(prev => {
      const conversation = prev.conversations[personaId] || {
        personaId,
        messages: [],
        lastMessageAt: new Date()
      }

      const newMessage: Message = {
        ...message,
        id: crypto.randomUUID(),
        timestamp: new Date()
      }

      return {
        ...prev,
        conversations: {
          ...prev.conversations,
          [personaId]: {
            ...conversation,
            messages: [...conversation.messages, newMessage],
            lastMessageAt: new Date()
          }
        }
      }
    })
  }, [])

  const getConversation = useCallback((personaId: string): Conversation | null => {
    return state.conversations[personaId] || null
  }, [state.conversations])

  const getPersona = useCallback((personaId: string): Persona | null => {
    return state.personas.find(p => p.id === personaId) || null
  }, [state.personas])

  return {
    state,
    isLoaded,
    setUserProfile,
    addMessage,
    getConversation,
    getPersona,
    hasUserProfile: !!state.userProfile
  }
}
```

### 2.3 Personas pré-définis (`src/lib/personas.ts`)

```typescript
import { Persona } from './types'

export const PRESET_PERSONAS: Persona[] = [
  {
    id: 'jake-texas',
    name: 'Jake',
    age: 32,
    nationality: 'États-Unis',
    nationalityCode: 'US',
    profession: 'Développeur',
    frenchLevel: 'beginner',
    frenchExposure: 'never-visited',
    traits: ['confident', 'curious'],
    interests: ['tech', 'sports', 'gaming'],
    communicationStyle: 'casual',
    background: "Développeur full-stack au Texas. N'a jamais quitté les États-Unis. Veut apprendre le français pour impressionner une collègue française. Très motivé mais part de zéro.",
    isPreset: true,
    createdAt: new Date()
  },
  {
    id: 'maria-brazil',
    name: 'Maria',
    age: 28,
    nationality: 'Brésil',
    nationalityCode: 'BR',
    profession: 'Étudiante en art',
    frenchLevel: 'intermediate',
    frenchExposure: 'tourist',
    traits: ['warm', 'enthusiastic', 'talkative'],
    interests: ['art', 'music', 'travel', 'cinema'],
    communicationStyle: 'casual',
    background: "Étudiante en beaux-arts à São Paulo. A passé 3 mois à Paris en échange universitaire. Adore la culture française et rêve d'y retourner vivre.",
    isPreset: true,
    createdAt: new Date()
  },
  {
    id: 'hans-germany',
    name: 'Hans',
    age: 45,
    nationality: 'Allemagne',
    nationalityCode: 'DE',
    profession: 'Ingénieur',
    frenchLevel: 'advanced',
    frenchExposure: 'lived-in-france',
    traits: ['reserved', 'sarcastic'],
    interests: ['tech', 'politics', 'reading'],
    communicationStyle: 'formal',
    background: "Ingénieur automobile chez BMW. A vécu 2 ans à Strasbourg pour un projet. Français très correct mais accent allemand prononcé. Humour pince-sans-rire.",
    isPreset: true,
    createdAt: new Date()
  },
  {
    id: 'yuki-japan',
    name: 'Yuki',
    age: 24,
    nationality: 'Japon',
    nationalityCode: 'JP',
    profession: 'Designer UX',
    frenchLevel: 'intermediate',
    frenchExposure: 'tourist',
    traits: ['shy', 'curious'],
    interests: ['art', 'gaming', 'cinema', 'cooking'],
    communicationStyle: 'hesitant',
    background: "Designer à Tokyo, passionnée de culture française depuis l'enfance (anime, pâtisserie). A visité Paris une fois. Très polie, cherche ses mots.",
    isPreset: true,
    createdAt: new Date()
  },
  {
    id: 'james-uk',
    name: 'James',
    age: 55,
    nationality: 'Royaume-Uni',
    nationalityCode: 'GB',
    profession: 'Investisseur',
    frenchLevel: 'near-native',
    frenchExposure: 'lives-in-france',
    traits: ['arrogant', 'confident'],
    interests: ['business', 'politics', 'art', 'travel'],
    communicationStyle: 'formal',
    background: "Investisseur basé à Londres avec un pied-à-terre à Paris. Éduqué dans les meilleures écoles, français quasi-parfait. Condescendant mais cultivé.",
    isPreset: true,
    createdAt: new Date()
  },
  {
    id: 'sofia-italy',
    name: 'Sofia',
    age: 38,
    nationality: 'Italie',
    nationalityCode: 'IT',
    profession: 'Chef cuisinière',
    frenchLevel: 'advanced',
    frenchExposure: 'lived-in-france',
    traits: ['enthusiastic', 'talkative'],
    interests: ['cooking', 'travel', 'music', 'art'],
    communicationStyle: 'familiar',
    background: "Chef dans un restaurant étoilé à Milan. A fait ses classes à Lyon pendant 3 ans. Passionnée, expressive, parle avec les mains. Mélange parfois italien et français.",
    isPreset: true,
    createdAt: new Date()
  }
]
```

### 2.4 Génération de System Prompts (`src/lib/prompts.ts`)

```typescript
import { Persona, UserProfile, Message, FrenchLevel } from './types'

// Exemples d'erreurs typiques par niveau et nationalité
const ERROR_EXAMPLES: Record<FrenchLevel, Record<string, string[]>> = {
  beginner: {
    default: [
      "Confusion he/she → 'il' pour tout",
      "Oubli des articles → 'je veux pomme'",
      "Verbes non conjugués → 'je aller'",
      "Mots anglais insérés → 'je suis very happy'",
      "Genre aléatoire → 'la table, le chaise'"
    ],
    US: [
      "Prononciation phonétique → 'bone-jour'",
      "Structure anglaise → 'je suis 32 years old'",
    ],
    JP: [
      "Omission du sujet → 'suis content'",
      "R/L confusion à l'écrit → 'je palre'",
    ]
  },
  intermediate: {
    default: [
      "Erreurs de genre occasionnelles",
      "Subjonctif évité ou mal utilisé",
      "Prépositions incorrectes → 'je pense à faire' vs 'je pense de faire'",
      "Expressions littéralement traduites"
    ],
    BR: [
      "Faux amis portugais → 'actuellement' pour 'atualmente'",
      "Nasales approximatives",
    ]
  },
  advanced: {
    default: [
      "Expressions idiomatiques parfois maladroites",
      "Accent perceptible à l'écrit (interjections)",
      "Registre parfois trop formel ou informel",
    ],
    DE: [
      "Structure de phrase germanique occasionnelle",
      "Composés traduits littéralement",
    ],
    IT: [
      "Gestuelle décrite → 'comment dire *fait un geste*'",
      "Mots italiens qui glissent → 'allora', 'magari'",
    ]
  },
  'near-native': {
    default: [
      "Quasi aucune erreur",
      "Peut utiliser des expressions légèrement désuètes",
      "Accent très léger perceptible dans les interjections",
    ]
  }
}

// Mapper les traits vers des comportements
const TRAIT_BEHAVIORS: Record<string, string> = {
  confident: "Tu t'exprimes avec assurance, tu n'hésites pas à donner ton avis.",
  shy: "Tu es réservé(e), tu poses des questions plutôt que d'affirmer.",
  curious: "Tu poses beaucoup de questions, tu veux tout savoir sur ton interlocuteur.",
  sarcastic: "Tu as un humour pince-sans-rire, tu fais des remarques ironiques.",
  warm: "Tu es chaleureux/se, tu utilises des termes affectueux.",
  arrogant: "Tu te sens supérieur(e), tu fais parfois des remarques condescendantes.",
  hesitant: "Tu cherches tes mots, tu te corriges souvent.",
  enthusiastic: "Tu utilises beaucoup d'exclamations, tu t'emballe facilement.",
  reserved: "Tu réponds de manière concise, tu ne t'épanches pas.",
  talkative: "Tu parles beaucoup, tu fais des digressions."
}

// Mapper le style de communication
const STYLE_DESCRIPTIONS: Record<string, string> = {
  formal: "Tu vouvoies ton interlocuteur. Langage soutenu.",
  casual: "Tu tutoies naturellement. Langage courant.",
  familiar: "Tu tutoies et utilises de l'argot, des abréviations.",
  hesitant: "Tu fais des pauses (...), tu te reprends, tu demandes confirmation."
}

export function generateSystemPrompt(
  persona: Persona,
  userProfile: UserProfile,
  conversationHistory: Message[] = []
): string {

  const traitBehaviors = persona.traits
    .map(t => TRAIT_BEHAVIORS[t])
    .filter(Boolean)
    .join('\n- ')

  const errors = [
    ...(ERROR_EXAMPLES[persona.frenchLevel]?.default || []),
    ...(ERROR_EXAMPLES[persona.frenchLevel]?.[persona.nationalityCode] || [])
  ].join('\n- ')

  const relationshipContext = conversationHistory.length === 0
    ? "C'est votre PREMIÈRE conversation. Tu ne connais pas encore cette personne."
    : `Vous avez déjà échangé ${conversationHistory.length} messages. Réfère-toi naturellement aux sujets déjà abordés.`

  return `Tu es ${persona.name}, ${persona.age} ans, ${persona.nationality}.

## TON IDENTITÉ
- Profession : ${persona.profession}
- Personnalité : ${persona.traits.join(', ')}
- Centres d'intérêt : ${persona.interests.join(', ')}

## TON HISTOIRE
${persona.background}

## TON NIVEAU DE FRANÇAIS
- Niveau : ${persona.frenchLevel}
- Exposition : ${persona.frenchExposure}

## COMMENT TU T'EXPRIMES
${STYLE_DESCRIPTIONS[persona.communicationStyle]}

Comportements liés à ta personnalité :
- ${traitBehaviors}

## ERREURS TYPIQUES À FAIRE (selon ton niveau)
- ${errors}

## TON INTERLOCUTEUR
Tu parles avec ${userProfile.name}, qui vit à ${userProfile.location}.
Ce qu'il/elle dit de lui/elle-même : "${userProfile.description}"

## CONTEXTE RELATIONNEL
${relationshipContext}

## RÈGLES ABSOLUES
1. Tu réponds TOUJOURS en français, avec les imperfections correspondant à ton niveau
2. Tu restes TOUJOURS dans ton personnage - tu ES ${persona.name}
3. Tu ne dis JAMAIS que tu es une IA ou un assistant
4. Tu exprimes des opinions, préférences, émotions authentiques
5. Tu peux poser des questions, changer de sujet, faire de l'humour
6. Tu te souviens de TOUT ce qui a été dit précédemment
7. Tes réponses sont naturelles et conversationnelles (pas de listes, pas de format structuré)
8. Tu peux utiliser des émojis si ça correspond à ta personnalité

## FORMAT
Réponds de manière naturelle, comme dans une vraie conversation par message. Pas de mise en forme markdown, juste du texte conversationnel.`
}

export function generateFirstMessagePrompt(persona: Persona, userProfile: UserProfile): string {
  return `${generateSystemPrompt(persona, userProfile, [])}

## TA MISSION MAINTENANT
Écris ton PREMIER message à ${userProfile.name}. Tu ne le/la connais pas encore.
- Présente-toi brièvement
- Soit naturel(le) et fidèle à ta personnalité
- Tu peux faire référence au profil de ${userProfile.name} si pertinent
- Pose une question pour lancer la conversation

Écris UNIQUEMENT ton message, rien d'autre.`
}
```

---

## Phase 3 : Tests

### 3.1 Configuration Vitest (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 3.2 Tests du Store (`src/__tests__/lib/store.test.ts`)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadState, saveState } from '@/lib/store'
import { PRESET_PERSONAS } from '@/lib/personas'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
    removeItem: (key: string) => { delete store[key] }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Store', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('loadState', () => {
    it('returns initial state when localStorage is empty', () => {
      const state = loadState()
      expect(state.userProfile).toBeNull()
      expect(state.personas).toHaveLength(PRESET_PERSONAS.length)
      expect(state.conversations).toEqual({})
    })

    it('loads persisted state from localStorage', () => {
      const mockState = {
        userProfile: { name: 'Test', location: 'Paris', description: 'Dev' },
        personas: [],
        conversations: {}
      }
      localStorageMock.setItem('tandem-genai-state', JSON.stringify(mockState))

      const state = loadState()
      expect(state.userProfile?.name).toBe('Test')
    })

    it('merges preset personas with stored custom personas', () => {
      const customPersona = {
        id: 'custom-1',
        name: 'Custom',
        isPreset: false,
        // ... autres champs
      }
      const mockState = {
        userProfile: null,
        personas: [customPersona],
        conversations: {}
      }
      localStorageMock.setItem('tandem-genai-state', JSON.stringify(mockState))

      const state = loadState()
      expect(state.personas.length).toBe(PRESET_PERSONAS.length + 1)
    })
  })

  describe('saveState', () => {
    it('persists state to localStorage', () => {
      const state = {
        userProfile: { name: 'Test', location: 'Lyon', description: 'Designer', createdAt: new Date() },
        personas: PRESET_PERSONAS,
        conversations: {}
      }

      saveState(state)

      const stored = JSON.parse(localStorageMock.getItem('tandem-genai-state')!)
      expect(stored.userProfile.name).toBe('Test')
    })
  })
})
```

### 3.3 Tests des Prompts (`src/__tests__/lib/prompts.test.ts`)

```typescript
import { describe, it, expect } from 'vitest'
import { generateSystemPrompt, generateFirstMessagePrompt } from '@/lib/prompts'
import { PRESET_PERSONAS } from '@/lib/personas'

const mockUserProfile = {
  name: 'Alice',
  location: 'Paris',
  description: 'Développeuse passionnée de voyages',
  createdAt: new Date()
}

describe('generateSystemPrompt', () => {
  it('includes persona name and age', () => {
    const jake = PRESET_PERSONAS.find(p => p.id === 'jake-texas')!
    const prompt = generateSystemPrompt(jake, mockUserProfile)

    expect(prompt).toContain('Jake')
    expect(prompt).toContain('32 ans')
  })

  it('includes user profile information', () => {
    const jake = PRESET_PERSONAS.find(p => p.id === 'jake-texas')!
    const prompt = generateSystemPrompt(jake, mockUserProfile)

    expect(prompt).toContain('Alice')
    expect(prompt).toContain('Paris')
    expect(prompt).toContain('Développeuse passionnée de voyages')
  })

  it('indicates first conversation when no history', () => {
    const jake = PRESET_PERSONAS.find(p => p.id === 'jake-texas')!
    const prompt = generateSystemPrompt(jake, mockUserProfile, [])

    expect(prompt).toContain('PREMIÈRE conversation')
  })

  it('references previous messages count when history exists', () => {
    const jake = PRESET_PERSONAS.find(p => p.id === 'jake-texas')!
    const history = [
      { id: '1', role: 'user' as const, content: 'Salut', timestamp: new Date() },
      { id: '2', role: 'assistant' as const, content: 'Hey!', timestamp: new Date() }
    ]
    const prompt = generateSystemPrompt(jake, mockUserProfile, history)

    expect(prompt).toContain('2 messages')
  })

  it('includes appropriate errors for beginner level', () => {
    const jake = PRESET_PERSONAS.find(p => p.id === 'jake-texas')!
    const prompt = generateSystemPrompt(jake, mockUserProfile)

    expect(prompt).toContain("Verbes non conjugués")
    expect(prompt).toContain("Mots anglais")
  })

  it('includes personality trait behaviors', () => {
    const james = PRESET_PERSONAS.find(p => p.id === 'james-uk')!
    const prompt = generateSystemPrompt(james, mockUserProfile)

    expect(prompt).toContain('supérieur')
    expect(prompt).toContain('assurance')
  })
})

describe('generateFirstMessagePrompt', () => {
  it('includes instruction to introduce oneself', () => {
    const maria = PRESET_PERSONAS.find(p => p.id === 'maria-brazil')!
    const prompt = generateFirstMessagePrompt(maria, mockUserProfile)

    expect(prompt).toContain('PREMIER message')
    expect(prompt).toContain('Présente-toi')
  })
})
```

### 3.4 Tests API Route (`src/__tests__/api/chat.test.ts`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Bonjour ! Je suis Jake.' } }]
        })
      }
    }
  }))
}))

describe('Chat API Route', () => {
  it('should return a streamed response', async () => {
    // Test sera implémenté avec la route
  })

  it('should include system prompt with persona data', async () => {
    // Test sera implémenté avec la route
  })

  it('should return 400 if personaId is missing', async () => {
    // Test sera implémenté avec la route
  })
})
```

---

## Phase 4 : Composants UI

### 4.1 Design System (`src/styles/theme.ts`)

```typescript
export const theme = {
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
    },
    accent: {
      primary: '#6366F1',    // Indigo
      secondary: '#818CF8',
      light: '#E0E7FF',
    },
    bubble: {
      user: '#6366F1',
      userText: '#FFFFFF',
      persona: '#F3F4F6',
      personaText: '#111827',
    },
    level: {
      beginner: '#EF4444',
      intermediate: '#F59E0B',
      advanced: '#10B981',
      'near-native': '#6366F1',
    },
    border: '#E5E7EB',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  }
}

// Tailwind CSS variables (dans globals.css)
export const tailwindTheme = `
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 238.7 83.5% 66.7%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 238.7 83.5% 66.7%;
    --radius: 0.75rem;
  }
`
```

### 4.2 Composants principaux

**PersonaCard.tsx** - Card dans la galerie
**ChatBubble.tsx** - Bulle de message
**ChatInput.tsx** - Input avec bouton envoi
**TypingIndicator.tsx** - Animation "..."
**OnboardingForm.tsx** - Formulaire création profil
**LevelBadge.tsx** - Badge coloré du niveau

---

## Phase 5 : Pages

### 5.1 Page d'accueil (`src/app/page.tsx`)

- Si pas de profil → Afficher OnboardingForm
- Si profil existe → Afficher PersonaGallery

### 5.2 Page Chat (`src/app/chat/[personaId]/page.tsx`)

- Header avec infos persona
- Liste de messages scrollable
- Input en bas
- Intégration streaming OpenAI

### 5.3 Page Settings (`src/app/settings/page.tsx`)

- Formulaire modification profil
- Bouton supprimer données

---

## Phase 6 : API

### 6.1 Route Chat (`src/app/api/chat/route.ts`)

```typescript
import OpenAI from 'openai'
import { generateSystemPrompt } from '@/lib/prompts'

const openai = new OpenAI()

export async function POST(req: Request) {
  const { messages, persona, userProfile, conversationHistory } = await req.json()

  const systemPrompt = generateSystemPrompt(persona, userProfile, conversationHistory)

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    stream: true,
  })

  // Return streaming response
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        controller.enqueue(encoder.encode(content))
      }
      controller.close()
    }
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
```

---

## Ordre d'exécution

| # | Tâche | Dépendances |
|---|-------|-------------|
| 1 | Setup Next.js + Tailwind + Shadcn | - |
| 2 | Design system + theme | 1 |
| 3 | Types TypeScript | 1 |
| 4 | Personas pré-définis | 3 |
| 5 | Génération system prompts | 3, 4 |
| 6 | **Tests prompts** | 5 |
| 7 | Store LocalStorage | 3 |
| 8 | **Tests store** | 7 |
| 9 | Composants UI (cards, bulles, input) | 2 |
| 10 | Page Onboarding | 7, 9 |
| 11 | Page Galerie | 7, 9 |
| 12 | API Route OpenAI | 5 |
| 13 | **Tests API** | 12 |
| 14 | Page Chat | 7, 9, 12 |
| 15 | Page Settings | 7, 9 |
| 16 | Typing indicator + polish | 14 |
| 17 | **Tests E2E** | All |

---

## Commandes

```bash
# Dev
npm run dev

# Tests
npm run test
npm run test:watch

# Build
npm run build

# Lint
npm run lint
```
