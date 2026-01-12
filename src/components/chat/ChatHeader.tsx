'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LevelBadge } from '@/components/shared/LevelBadge'
import { FlagIcon } from '@/components/shared/FlagIcon'
import { Persona } from '@/lib/types'

interface ChatHeaderProps {
  persona: Persona
}

export function ChatHeader({ persona }: ChatHeaderProps) {
  const initials = persona.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link
          href="/"
          className="p-1 -ml-1 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>

        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-foreground">
              {persona.name}, {persona.age}
            </h1>
            <FlagIcon countryCode={persona.nationalityCode} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {persona.profession}
            </span>
            <span className="text-muted-foreground">·</span>
            <LevelBadge level={persona.frenchLevel} className="text-xs py-0" />
          </div>
        </div>
      </div>
    </header>
  )
}
