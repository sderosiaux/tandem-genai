'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UserProfile } from '@/lib/types'

interface OnboardingFormProps {
  onComplete: (profile: UserProfile) => void
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isValid = name.trim().length >= 2 && location.trim().length >= 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsSubmitting(true)

    const profile: UserProfile = {
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
      createdAt: new Date(),
    }

    // Petit délai pour l'UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    onComplete(profile)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Bienvenue sur Tandem
            </h1>
            <p className="text-muted-foreground">
              Avant de commencer, présentez-vous !
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Prénom
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Votre prénom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="location"
                className="text-sm font-medium text-foreground"
              >
                Localisation
              </label>
              <Input
                id="location"
                type="text"
                placeholder="Paris, Lyon, Marseille..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                À propos de vous{' '}
                <span className="text-muted-foreground font-normal">
                  (optionnel)
                </span>
              </label>
              <Textarea
                id="description"
                placeholder="Ce que vous aimez, votre métier, vos passions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Chargement...' : 'Commencer'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Ces informations aideront vos correspondants à mieux vous connaître.
        </p>
      </div>
    </div>
  )
}
