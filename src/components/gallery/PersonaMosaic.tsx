'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Persona, Conversation, UserProfile } from '@/lib/types'
import { Settings, MessageCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PersonaMosaicProps {
  personas: Persona[]
  conversations: Record<string, Conversation>
  userProfile: UserProfile
  onLetPersonaWrite: (personaId: string) => void
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  'near-native': 'Quasi-natif',
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-amber-500',
  intermediate: 'bg-sky-500',
  advanced: 'bg-emerald-500',
  'near-native': 'bg-violet-500',
}

export function PersonaMosaic({
  personas,
  conversations,
  userProfile,
  onLetPersonaWrite,
}: PersonaMosaicProps) {
  const router = useRouter()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleLetThemWrite = async (e: React.MouseEvent, personaId: string) => {
    e.preventDefault()
    e.stopPropagation()
    onLetPersonaWrite(personaId)
    router.push(`/chat/${personaId}?initiate=true`)
  }

  const handleCardClick = (personaId: string) => {
    router.push(`/chat/${personaId}`)
  }

  // Trier les personas : ceux avec conversation récente en premier
  const sortedPersonas = [...personas].sort((a, b) => {
    const aConv = conversations[a.id]
    const bConv = conversations[b.id]
    if (aConv && !bConv) return -1
    if (!aConv && bConv) return 1
    if (aConv && bConv) {
      return (
        new Date(bConv.lastMessageAt).getTime() -
        new Date(aConv.lastMessageAt).getTime()
      )
    }
    return 0
  })

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header - Editorial style */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-stone-100/80 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-serif font-light tracking-tight text-stone-900">
              Tandem
            </h1>
            <span className="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium">
              Conversations
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-500">
              {userProfile.name}
            </span>
            <Link
              href="/settings"
              className="p-2.5 rounded-full bg-stone-200/60 hover:bg-stone-300/60 transition-all duration-300"
            >
              <Settings className="h-4 w-4 text-stone-600" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Section title */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400 font-medium mb-2">
            Vos correspondants
          </p>
          <h2 className="text-4xl font-serif font-light text-stone-800 leading-tight">
            Avec qui souhaitez-vous
            <br />
            <span className="italic">discuter</span> ?
          </h2>
        </div>

        {/* Mosaic Grid - Mix of 1x1 and 2x2 squares */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sortedPersonas.map((persona, index) => {
            const conversation = conversations[persona.id]
            const lastMessage = conversation?.messages.at(-1)
            const isNew = !conversation
            const isHovered = hoveredId === persona.id

            // Mix: positions 0 and 4 are 2x2, others are 1x1
            const isLarge = index === 0 || index === 4
            const sizeClass = isLarge
              ? 'col-span-2 row-span-2'
              : 'col-span-1 row-span-1'

            return (
              <article
                key={persona.id}
                onClick={() => handleCardClick(persona.id)}
                onMouseEnter={() => setHoveredId(persona.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  'group relative rounded-2xl overflow-hidden cursor-pointer',
                  'bg-white shadow-sm hover:shadow-xl',
                  'transition-all duration-500 ease-out',
                  'transform hover:-translate-y-1',
                  'aspect-square', // Force 1:1 ratio
                  sizeClass
                )}
              >
                {/* Background image */}
                <div className="absolute inset-0">
                  <Image
                    src={`/avatars/${persona.id}.png`}
                    alt={persona.name}
                    fill
                    className={cn(
                      'object-cover transition-all duration-700 ease-out',
                      isHovered ? 'scale-105' : 'scale-100'
                    )}
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  {/* Gradient overlay */}
                  <div
                    className={cn(
                      'absolute inset-0 transition-opacity duration-500',
                      'bg-gradient-to-t from-black/80 via-black/20 to-transparent',
                      isHovered ? 'opacity-90' : 'opacity-70'
                    )}
                  />
                </div>

                {/* Level badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full',
                    'text-[10px] uppercase tracking-wider font-medium text-white',
                    LEVEL_COLORS[persona.frenchLevel]
                  )}>
                    {LEVEL_LABELS[persona.frenchLevel]}
                  </span>
                </div>

                {/* New badge */}
                {isNew && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-stone-800 text-[10px] uppercase tracking-wider font-medium">
                      <Sparkles className="h-3 w-3" />
                      Nouveau
                    </span>
                  </div>
                )}

                {/* Content - adapts to card size */}
                <div className={cn(
                  'absolute inset-x-0 bottom-0 z-10',
                  isLarge ? 'p-5' : 'p-3'
                )}>
                  {/* Name and country */}
                  <div className="flex items-end justify-between mb-1">
                    <div>
                      <h3 className={cn(
                        'font-serif font-light text-white mb-0.5',
                        isLarge ? 'text-xl' : 'text-base'
                      )}>
                        {persona.name}, {persona.age}
                      </h3>
                      <p className={cn(
                        'text-white/70 uppercase tracking-wider',
                        isLarge ? 'text-xs' : 'text-[10px]'
                      )}>
                        {isLarge
                          ? `${persona.nationality} · ${persona.profession}`
                          : persona.nationality
                        }
                      </p>
                    </div>
                    <div className={isLarge ? 'text-2xl' : 'text-lg'}>
                      {persona.nationalityCode === 'US' && '🇺🇸'}
                      {persona.nationalityCode === 'BR' && '🇧🇷'}
                      {persona.nationalityCode === 'DE' && '🇩🇪'}
                      {persona.nationalityCode === 'JP' && '🇯🇵'}
                      {persona.nationalityCode === 'GB' && '🇬🇧'}
                      {persona.nationalityCode === 'IT' && '🇮🇹'}
                    </div>
                  </div>

                  {/* Last message or CTA - only on large cards or hover */}
                  {isLarge && (
                    <div
                      className={cn(
                        'transition-all duration-300 overflow-hidden',
                        isHovered ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                      )}
                    >
                      <div className="pt-3 border-t border-white/20">
                        {lastMessage ? (
                          <p className="text-sm text-white/80 line-clamp-2">
                            <span className="font-medium">
                              {lastMessage.role === 'user' ? 'Vous' : persona.name}:
                            </span>{' '}
                            {lastMessage.content}
                          </p>
                        ) : (
                          <button
                            onClick={(e) => handleLetThemWrite(e, persona.id)}
                            className={cn(
                              'flex items-center gap-2 text-sm text-white font-medium',
                              'hover:text-amber-300 transition-colors'
                            )}
                          >
                            <MessageCircle className="h-4 w-4" />
                            Laisser {persona.name} m'écrire en premier
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Online indicator - only on large cards */}
                  {isLarge && (
                    <div className={cn(
                      'absolute bottom-5 right-5 flex items-center gap-2',
                      'transition-all duration-300',
                      isHovered ? 'opacity-100' : 'opacity-0'
                    )}>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-white/60">
                        En ligne
                      </span>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {/* Empty state */}
        {personas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-stone-400 font-serif text-lg italic">
              Aucun correspondant disponible pour le moment.
            </p>
          </div>
        )}
      </main>

      {/* Footer accent */}
      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-stone-200">
        <p className="text-xs text-stone-400 text-center tracking-wide">
          Pratiquez le français avec des conversations authentiques
        </p>
      </footer>
    </div>
  )
}
