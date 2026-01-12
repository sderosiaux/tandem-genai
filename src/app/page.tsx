'use client'

import { useAppState } from '@/lib/store'
import { OnboardingForm } from '@/components/onboarding/OnboardingForm'
import { PersonaMosaic } from '@/components/gallery/PersonaMosaic'
import { UserProfile } from '@/lib/types'

export default function Home() {
  const {
    isLoaded,
    hasUserProfile,
    userProfile,
    personas,
    conversations,
    setUserProfile,
  } = useAppState()

  // Attendre le chargement du state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  // Onboarding si pas de profil
  if (!hasUserProfile) {
    return (
      <OnboardingForm
        onComplete={(profile: UserProfile) => setUserProfile(profile)}
      />
    )
  }

  // Mosaïque des personas
  return (
    <PersonaMosaic
      personas={personas}
      conversations={conversations}
      userProfile={userProfile!}
      onLetPersonaWrite={() => {
        // La navigation est gérée dans PersonaMosaic
      }}
    />
  )
}
