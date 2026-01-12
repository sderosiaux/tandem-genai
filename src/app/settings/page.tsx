'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useAppState } from '@/lib/store'

export default function SettingsPage() {
  const router = useRouter()
  const { isLoaded, hasUserProfile, userProfile, updateUserProfile, resetAllData } =
    useAppState()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Initialize form with current values
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name)
      setLocation(userProfile.location)
      setDescription(userProfile.description)
    }
  }, [userProfile])

  // Redirect if no profile
  useEffect(() => {
    if (isLoaded && !hasUserProfile) {
      router.push('/')
    }
  }, [isLoaded, hasUserProfile, router])

  const handleSave = async () => {
    if (!name.trim() || !location.trim()) return

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    updateUserProfile({
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
    })

    setIsSaving(false)
    router.push('/')
  }

  const handleDeleteAllData = () => {
    resetAllData()
    router.push('/')
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="p-1 -ml-1 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Paramètres</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Section */}
        <section className="bg-card rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Mon profil
          </h2>

          <div className="space-y-4">
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
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
                À propos de vous
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <Button
              onClick={handleSave}
              className="w-full h-12"
              disabled={!name.trim() || !location.trim() || isSaving}
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-destructive mb-4">
            Zone de danger
          </h2>

          <p className="text-sm text-muted-foreground mb-4">
            Supprimer toutes vos données effacera votre profil et toutes vos
            conversations. Cette action est irréversible.
          </p>

          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              className="w-full h-12"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer toutes mes données
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-destructive">
                Êtes-vous sûr ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-12"
                  onClick={handleDeleteAllData}
                >
                  Confirmer
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
