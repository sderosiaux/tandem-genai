# Tandem GenAI - Spécification Produit

## Vision

Application web de conversation avec des personas IA pour pratiquer le français. Simule des rencontres authentiques avec des étrangers apprenant le français, chacun avec sa personnalité, son background et son niveau de langue unique.

---

## Concept Core

- **Tu es francophone**, tu aides des "étrangers" (IA) à pratiquer leur français
- **Les personas répondent en français** — avec leur accent, leurs erreurs, leur style selon leur profil
- **Relation évolutive** : au début vous ne vous connaissez pas, la relation se construit au fil des conversations
- **Mémoire persistante** : chaque persona se souvient de vos échanges précédents

---

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript |
| Styling | Tailwind CSS + Design System custom |
| Composants | Shadcn/ui |
| LLM | OpenAI GPT-4 |
| Persistance | LocalStorage (MVP) |
| Déploiement | Vercel |

---

## Fonctionnalités

### 1. Galerie de Profils (Home)

Page d'accueil affichant tous les personas disponibles en cards.

**Chaque card affiche :**
- Avatar (illustration ou placeholder)
- Prénom + Âge
- Nationalité (drapeau)
- Profession
- Indicateur de niveau de français (jauge ou badge)
- Aperçu du dernier message (si conversation existante)
- Badge "Nouveau" si jamais contacté

**Actions :**
- Cliquer sur un profil → ouvre le chat
- Bouton "Créer un profil" → ouvre le générateur
- Bouton "Profil aléatoire" → génère un persona random

---

### 2. Générateur de Profils

Interface pour créer un nouveau persona, soit manuellement soit aléatoirement.

#### Attributs configurables

| Attribut | Type | Valeurs possibles |
|----------|------|-------------------|
| **Prénom** | Text | Auto-généré selon nationalité ou custom |
| **Nationalité** | Select | USA, UK, Allemagne, Japon, Brésil, Chine, Italie, Espagne, Canada (anglophone), Russie, etc. |
| **Âge** | Slider | 18 - 75 |
| **Profession** | Select + Custom | Étudiant, Développeur, Menuisier, Investisseur, Artiste, Retraité, Médecin, Serveur, etc. |
| **Niveau de français** | Select | Débutant, Intermédiaire, Avancé, Quasi-natif |
| **Exposition au français** | Select | Jamais visité, Touriste, A vécu en France, Vit en France, Québec, Belgique, Suisse |
| **Traits de personnalité** | Multi-select (2-3) | Confiant, Timide, Curieux, Sarcastique, Chaleureux, Arrogant, Hésitant, Enthousiaste, Réservé, Bavard |
| **Centres d'intérêt** | Multi-select (2-4) | Sport, Tech, Cuisine, Voyages, Politique, Art, Musique, Cinéma, Nature, Business, Gaming, Lecture |
| **Style de communication** | Select | Formel, Décontracté, Familier, Hésitant (cherche ses mots) |
| **Background** | Textarea | Histoire personnelle libre (ex: "A grandi au Texas, première fois en Europe") |

#### Génération aléatoire

Bouton "Générer aléatoirement" qui :
1. Sélectionne des valeurs cohérentes pour chaque attribut
2. Génère un background story via GPT
3. Propose le résultat (modifiable avant validation)

---

### 3. Interface de Chat

Style WhatsApp/iMessage — conversation naturelle.

#### Layout

```
┌─────────────────────────────────────────┐
│ ← Retour    [Avatar] Maria, 28 🇧🇷      │
│             Niveau: Intermédiaire       │
├─────────────────────────────────────────┤
│                                         │
│         [Bulle persona - gauche]        │
│                                         │
│              [Bulle user - droite]      │
│                                         │
│         [Bulle persona - gauche]        │
│                                         │
├─────────────────────────────────────────┤
│ [Input message]                 [Envoyer]│
└─────────────────────────────────────────┘
```

#### Comportement de la conversation

**Premier contact :**
- Le persona ne te connaît pas
- Introduction naturelle ("Salut ! Je m'appelle Maria, je suis brésilienne...")
- Questions pour faire connaissance

**Conversations suivantes :**
- Le persona se souvient de tout
- Fait référence aux discussions passées
- La relation évolue (plus familier, inside jokes, etc.)

**Réalisme linguistique :**
- Erreurs de grammaire cohérentes avec le niveau
- Expressions de la langue maternelle qui "glissent"
- Hésitations, corrections ("je veux dire...", "comment on dit...")
- Utilisation du franglais selon profil
- Expressions québécoises/belges si applicable

---

### 4. System Prompt (Architecture)

Chaque persona est défini par un system prompt structuré :

```
Tu es {prénom}, {âge} ans, {nationalité}.

BACKGROUND:
{background_story}

PERSONNALITÉ:
- Traits: {traits}
- Style de communication: {style}
- Centres d'intérêt: {interests}

NIVEAU DE FRANÇAIS:
- Niveau: {level}
- Exposition: {exposure}

RÈGLES DE CONVERSATION:
1. Tu réponds TOUJOURS en français, avec les imperfections correspondant à ton niveau
2. Tu ne connais pas ton interlocuteur au début — fais connaissance naturellement
3. Tu te souviens de TOUT ce qui a été dit dans les conversations précédentes
4. Tu restes TOUJOURS dans ton personnage
5. Tu exprimes des opinions, des préférences, des émotions authentiques
6. Tu peux poser des questions, changer de sujet, faire de l'humour selon ta personnalité

EXEMPLES D'ERREURS TYPIQUES POUR TON NIVEAU:
{error_examples_based_on_level_and_nationality}

CONTEXTE RELATIONNEL:
{relationship_summary_from_previous_conversations}
```

---

### 5. Gestion de la Mémoire

#### Structure des données (LocalStorage)

```typescript
interface Persona {
  id: string
  name: string
  age: number
  nationality: string
  profession: string
  frenchLevel: 'beginner' | 'intermediate' | 'advanced' | 'near-native'
  frenchExposure: string
  traits: string[]
  interests: string[]
  communicationStyle: string
  background: string
  avatar?: string
  createdAt: Date
  isPreset: boolean
}

interface Message {
  id: string
  personaId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Conversation {
  personaId: string
  messages: Message[]
  relationshipSummary?: string  // Résumé généré périodiquement
  lastMessageAt: Date
}

interface AppState {
  personas: Persona[]
  conversations: Record<string, Conversation>
}
```

#### Stratégie de contexte

Pour éviter de dépasser les limites de tokens :
1. **Toujours inclure** : System prompt complet + 20 derniers messages
2. **Résumé relationnel** : Tous les 30 messages, générer un résumé de la relation
3. **Injection de contexte** : Le résumé est injecté dans le system prompt

---

### 6. Personas Pré-définis (Starter Pack)

| Prénom | Nationalité | Âge | Profession | Niveau FR | Personnalité |
|--------|-------------|-----|------------|-----------|--------------|
| **Jake** | 🇺🇸 USA (Texas) | 32 | Développeur | Débutant | Confiant, Curieux, Direct |
| **Maria** | 🇧🇷 Brésil | 28 | Étudiante en art | Intermédiaire | Chaleureuse, Enthousiaste, Bavarde |
| **Hans** | 🇩🇪 Allemagne | 45 | Ingénieur | Avancé | Réservé, Méthodique, Sarcastique |
| **Yuki** | 🇯🇵 Japon | 24 | Designer | Intermédiaire | Timide, Curieuse, Polie |
| **James** | 🇬🇧 UK | 55 | Investisseur | Quasi-natif | Arrogant, Confiant, Cultivé |
| **Sofia** | 🇮🇹 Italie | 38 | Chef cuisinière | Avancé | Passionnée, Expressive, Impatiente |

---

## Pages & Routes

```
/                   → Onboarding (si pas de profil) OU Galerie de profils
/chat/[personaId]   → Interface de conversation
/create             → Générateur de persona (post-MVP)
/settings           → Modifier son profil utilisateur
```

### Flow de navigation

```
Premier lancement:
  / (onboarding) → Créer profil → / (galerie)

Utilisateur existant:
  / (galerie) → /chat/[id] → retour galerie
                    ↓
              Conversation avec mémoire
```

---

## Design Guidelines

### Principes
- **Light theme uniquement**
- Style minimaliste Apple/Linear
- Mobile-first mais optimisé tablette/desktop
- Transitions smooth sur les interactions

### Palette (à définir dans le design system)
- Background: Blanc/Gris très clair
- Accents: Bleu ou Violet subtil
- Texte: Gris foncé (#1a1a1a)
- Bulles user: Couleur accent
- Bulles persona: Gris clair

### Composants clés
- Card de profil avec hover effect
- Bulles de chat avec timestamps discrets
- Input de message avec bouton envoi
- Modal/Drawer pour création de profil
- Badges de niveau colorés
- Drapeaux pour nationalités

---

## MVP Scope

### Inclus dans le MVP
- [x] **Onboarding utilisateur** (prénom, location, description)
- [x] Galerie de 6 profils pré-définis
- [x] Interface de chat fonctionnelle
- [x] **Deux modes d'initiation** (user écrit en premier OU persona initie)
- [x] Mémoire des conversations (LocalStorage)
- [x] System prompts complets avec profil user injecté
- [x] **Typing indicator** (animation pendant génération)
- [x] Design responsive
- [x] Page settings pour modifier son profil

### Post-MVP
- [ ] Générateur de profils custom
- [ ] Génération aléatoire "à la Sims"
- [ ] Résumé relationnel automatique (tous les X messages)
- [ ] Avatars générés par IA
- [ ] Export des conversations
- [ ] Mode "correction" (le persona corrige tes erreurs de français)
- [ ] Notifications push
- [ ] Statistiques de progression (mots appris, temps passé, etc.)

---

## Profil Utilisateur & Onboarding

### Onboarding (Premier lancement)

Au premier lancement, l'utilisateur doit créer son profil :

```
┌─────────────────────────────────────────┐
│                                         │
│     Bienvenue sur Tandem GenAI          │
│                                         │
│  Avant de commencer, présentez-vous !   │
│                                         │
│  Prénom: [_______________]              │
│                                         │
│  Localisation: [_______________]        │
│  (ex: Paris, Lyon, Marseille...)        │
│                                         │
│  À propos de vous:                      │
│  [                           ]          │
│  [                           ]          │
│  (Ce que vous aimez, votre métier...)   │
│                                         │
│           [Commencer →]                 │
│                                         │
└─────────────────────────────────────────┘
```

### Structure du profil utilisateur

```typescript
interface UserProfile {
  name: string
  location: string
  description: string
  createdAt: Date
}
```

### Utilisation du profil

- Les personas ont accès à ces infos dans leur system prompt
- Ils peuvent te poser des questions sur ta ville, tes intérêts
- Ça rend les conversations plus naturelles et personnalisées
- Possibilité de modifier son profil dans les settings

---

## Initiation des Conversations

### Deux modes d'amorce

#### Mode 1 : L'utilisateur initie
- Tu cliques sur un profil → Chat vide
- Tu écris le premier message
- Le persona répond naturellement

#### Mode 2 : Le persona initie
- Bouton "Laisser [Prénom] m'écrire" sur la card du profil
- Le persona envoie un premier message contextuel
- Basé sur ton profil (ex: "Salut ! J'ai vu que tu es de Paris, moi je viens d'arriver en France...")

### Premier message du persona (si initié par lui)

Le system prompt inclut une instruction pour générer une accroche naturelle :
- Se présente brièvement
- Fait référence à un élément du profil utilisateur OU
- Pose une question générique de première rencontre
- Ton adapté à sa personnalité

**Exemples :**

> **Jake (USA, débutant, confiant):**
> "Hey ! Je suis Jake, je suis nouveau ici. Je... comment on dit... I'm trying to learn French haha. Tu peux m'aider ?"

> **James (UK, quasi-natif, arrogant):**
> "Bonjour. Je suis James, investisseur basé à Londres. On m'a dit que ce serait une bonne façon de maintenir mon français. Vous êtes de Paris, n'est-ce pas ?"

> **Maria (Brésil, intermédiaire, chaleureuse):**
> "Oiii ! Salut salut ! Je m'appelle Maria, je suis brésilienne ! J'adore la France, c'est trop beau ! Tu fais quoi dans la vie ?"

---

## Indicateurs UX

### Typing Indicator
- Animation "..." pendant que l'IA génère sa réponse
- Simule une vraie conversation
- Disparaît dès que le message arrive

### Status de connexion (cosmétique)
- Pastille verte "En ligne" sur les profils (toujours vert, c'est de l'IA)
- Optionnel : "Vu à [heure]" sur les messages

---

## Prochaines Étapes

1. Validation de cette spec
2. Setup du projet Next.js + Tailwind + Shadcn
3. Implémentation du design system
4. Développement des composants
5. Intégration OpenAI
6. Tests et polish
