import { useState } from 'react'
import { Plus, Sprout } from 'lucide-react'
import { inputClass, panelClass, primaryButtonClass } from '../lib/ui'

interface CreateGroupProps {
  onCreate: (name: string) => Promise<void> | void
}

export function CreateGroup({ onCreate }: CreateGroupProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onCreate(name)
      setName('')
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Die Gruppe konnte nicht erstellt werden.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`${panelClass} p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-900">
            <Sprout className="h-4 w-4" />
            Neue Gruppe
          </p>
          <h2 className="mt-4 font-display text-2xl text-stone-900">
            Gartenkreis anlegen
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Erstelle eine Gruppe und teile den Einladungslink direkt per WhatsApp oder
            in eurer Familiengruppe.
          </p>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700" htmlFor="group-name">
            Gruppenname
          </label>
          <input
            id="group-name"
            className={inputClass}
            placeholder="z. B. Familien Garten"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <button type="submit" className={primaryButtonClass} disabled={isSubmitting}>
          <Plus className="h-4 w-4" />
          {isSubmitting ? 'Wird erstellt...' : 'Gruppe erstellen'}
        </button>
      </form>
    </section>
  )
}
