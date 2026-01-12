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
  | 'confident'
  | 'shy'
  | 'curious'
  | 'sarcastic'
  | 'warm'
  | 'arrogant'
  | 'hesitant'
  | 'enthusiastic'
  | 'reserved'
  | 'talkative'
  | 'funny'
  | 'deadpan'
  | 'dramatic'
  | 'chill'
  | 'anxious'

// Type d'humour
export type HumorStyle =
  | 'none'           // Pas drôle du tout
  | 'dad-jokes'      // Blagues nulles assumées
  | 'witty'          // Esprit vif, jeux de mots
  | 'sarcastic'      // Ironie, second degré
  | 'absurd'         // Humour absurde, random
  | 'self-deprecating' // Se moque de soi-même
  | 'dry'            // Pince-sans-rire

// Niveau d'éducation
export type EducationLevel =
  | 'basic'          // Peu éduqué, fait des fautes
  | 'average'        // Éducation normale
  | 'educated'       // Cultivé
  | 'intellectual'   // Très cultivé, références

// Centres d'intérêt
export type Interest =
  | 'sports'
  | 'tech'
  | 'cooking'
  | 'travel'
  | 'politics'
  | 'art'
  | 'music'
  | 'cinema'
  | 'nature'
  | 'business'
  | 'gaming'
  | 'reading'

// Persona (l'IA)
export interface Persona {
  id: string
  name: string
  age: number
  nationality: string
  nationalityCode: string // ISO code pour drapeau
  profession: string
  frenchLevel: FrenchLevel
  frenchExposure: FrenchExposure
  traits: PersonalityTrait[]
  interests: Interest[]
  communicationStyle: CommunicationStyle
  background: string
  // Nouveaux champs pour plus de réalisme
  humorStyle: HumorStyle
  educationLevel: EducationLevel
  quirks: string[]  // Tics, manies, expressions favorites
  opinions: string[] // Opinions tranchées sur certains sujets
  emojis: string[]  // Emojis favoris (utilisés avec modération)
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

// Labels pour l'affichage
export const FRENCH_LEVEL_LABELS: Record<FrenchLevel, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  'near-native': 'Quasi-natif',
}

export const FRENCH_EXPOSURE_LABELS: Record<FrenchExposure, string> = {
  'never-visited': "N'a jamais visité",
  tourist: 'Touriste',
  'lived-in-france': 'A vécu en France',
  'lives-in-france': 'Vit en France',
  quebec: 'Québec',
  belgium: 'Belgique',
  switzerland: 'Suisse',
}

export const TRAIT_LABELS: Record<PersonalityTrait, string> = {
  confident: 'Confiant',
  shy: 'Timide',
  curious: 'Curieux',
  sarcastic: 'Sarcastique',
  warm: 'Chaleureux',
  arrogant: 'Arrogant',
  hesitant: 'Hésitant',
  enthusiastic: 'Enthousiaste',
  reserved: 'Réservé',
  talkative: 'Bavard',
}

export const INTEREST_LABELS: Record<Interest, string> = {
  sports: 'Sport',
  tech: 'Tech',
  cooking: 'Cuisine',
  travel: 'Voyages',
  politics: 'Politique',
  art: 'Art',
  music: 'Musique',
  cinema: 'Cinéma',
  nature: 'Nature',
  business: 'Business',
  gaming: 'Gaming',
  reading: 'Lecture',
}
