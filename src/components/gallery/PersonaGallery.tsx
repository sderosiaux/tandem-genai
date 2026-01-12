'use client'

import { useRouter } from 'next/navigation'
import { PersonaCard } from './PersonaCard'
import { Persona, Conversation, UserProfile } from '@/lib/types'
import { Settings } from 'lucide-react'
import Link from 'next/link'

interface PersonaGalleryProps {
  personas: Persona[]
  conversations: Record<string, Conversation>
  userProfile: UserProfile
  onLetPersonaWrite: (personaId: string) => void
}

export function PersonaGallery({
  personas,
  conversations,
  userProfile,
  onLetPersonaWrite,
}: PersonaGalleryProps) {
  const router = useRouter()

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

  const handleLetThemWrite = async (personaId: string) => {
    onLetPersonaWrite(personaId)
    router.push(`/chat/${personaId}?initiate=true`)
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Tandem</h1>
            <p className="text-sm text-muted-foreground">
              Bonjour, {userProfile.name}
            </p>
          </div>
          <Link
            href="/settings"
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>
      </header>

      {/* Liste des personas */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Vos correspondants
          </h2>
        </div>

        <div className="space-y-3">
          {sortedPersonas.map((persona) => {
            const conversation = conversations[persona.id]
            const lastMessage = conversation?.messages.at(-1)
            const isNew = !conversation

            return (
              <PersonaCard
                key={persona.id}
                persona={persona}
                lastMessage={lastMessage}
                isNew={isNew}
                onLetThemWrite={() => handleLetThemWrite(persona.id)}
              />
            )
          })}
        </div>

        {personas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucun correspondant disponible.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
