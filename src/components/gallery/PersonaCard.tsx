'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LevelBadge } from '@/components/shared/LevelBadge'
import { FlagIcon } from '@/components/shared/FlagIcon'
import { Persona, Message } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PersonaCardProps {
  persona: Persona
  lastMessage?: Message
  isNew?: boolean
  onLetThemWrite?: () => void
}

export function PersonaCard({
  persona,
  lastMessage,
  isNew = false,
  onLetThemWrite,
}: PersonaCardProps) {
  const initials = persona.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const handleLetThemWrite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onLetThemWrite?.()
  }

  return (
    <Link href={`/chat/${persona.id}`}>
      <Card
        className={cn(
          'p-4 hover:shadow-md transition-all duration-200 cursor-pointer',
          'hover:border-primary/20 hover:-translate-y-0.5',
          'relative overflow-hidden'
        )}
      >
        {/* Badge "Nouveau" */}
        {isNew && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
              Nouveau
            </span>
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Indicateur en ligne */}
            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-card" />
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">
                {persona.name}, {persona.age}
              </h3>
              <FlagIcon countryCode={persona.nationalityCode} size="sm" />
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {persona.profession}
            </p>

            <div className="flex items-center gap-2">
              <LevelBadge level={persona.frenchLevel} />
            </div>
          </div>
        </div>

        {/* Dernier message ou bouton */}
        <div className="mt-4 pt-3 border-t border-border">
          {lastMessage ? (
            <p className="text-sm text-muted-foreground truncate">
              <span className="font-medium">
                {lastMessage.role === 'user' ? 'Vous' : persona.name}:
              </span>{' '}
              {lastMessage.content}
            </p>
          ) : (
            <button
              onClick={handleLetThemWrite}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Laisser {persona.name} m&apos;écrire →
            </button>
          )}
        </div>
      </Card>
    </Link>
  )
}
