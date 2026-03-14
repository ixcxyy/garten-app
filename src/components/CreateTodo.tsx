import { useState } from 'react'
import { Camera, CheckCircle2, Plus } from 'lucide-react'
import { fileToDataUrl } from '../lib/utils'
import { inputClass, panelClass, primaryButtonClass } from '../lib/ui'

interface CreateTodoProps {
  onCreate: (payload: { title: string; description: string; photo: string | null }) => Promise<void> | void
}

export function CreateTodo({ onCreate }: CreateTodoProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const [file] = Array.from(event.target.files ?? [])

    if (!file) {
      setPhoto(null)
      setPhotoName('')
      return
    }

    try {
      setPhoto(await fileToDataUrl(file))
      setPhotoName(file.name)
    } catch (photoError) {
      setError(photoError instanceof Error ? photoError.message : 'Foto konnte nicht geladen werden.')
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onCreate({ title, description, photo })
      setTitle('')
      setDescription('')
      setPhoto(null)
      setPhotoName('')
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Die Aktivitaet konnte nicht erstellt werden.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`${panelClass} p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-900">
            <CheckCircle2 className="h-4 w-4" />
            Neue Aktivitaet
          </p>
          <h2 className="mt-4 font-display text-2xl text-stone-900">Was steht als Naechstes an?</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Halte Titel, kurze Beschreibung und optional ein Bild fest, damit jede Person
            direkt weiss, was zu tun ist.
          </p>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700" htmlFor="todo-title">
            Titel
          </label>
          <input
            id="todo-title"
            className={inputClass}
            placeholder="z. B. Beete giessen"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-semibold text-stone-700"
            htmlFor="todo-description"
          >
            Beschreibung
          </label>
          <textarea
            id="todo-description"
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Kurzer Hinweis fuer die Gruppe..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="rounded-3xl border border-dashed border-olive-200 bg-olive-50/70 p-4">
          <label
            htmlFor="todo-photo"
            className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-stone-700"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
              <Camera className="h-4 w-4" />
            </span>
            Foto hochladen
          </label>
          <input
            id="todo-photo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handlePhotoChange}
          />
          <p className="mt-2 text-sm text-stone-500">
            {photoName || 'Kein Foto ausgewaehlt. Ideal fuer Vorher-Nachher oder Standort.'}
          </p>
          {photo ? (
            <img
              src={photo}
              alt="Vorschau"
              className="mt-4 h-40 w-full rounded-3xl object-cover"
            />
          ) : null}
        </div>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <button type="submit" className={primaryButtonClass} disabled={isSubmitting}>
          <Plus className="h-4 w-4" />
          {isSubmitting ? 'Wird gespeichert...' : 'Aktivitaet anlegen'}
        </button>
      </form>
    </section>
  )
}
