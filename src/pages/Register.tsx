import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FullPageLoader } from '../components/FullPageLoader'
import { useAppStore } from '../hooks/useAppStore'
import { inputClass, primaryButtonClass } from '../lib/ui'
import { resolveRedirectPath } from '../lib/utils'

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, isReady, registerUser } = useAppStore()
  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isReady) {
    return <FullPageLoader label="Registrierung und Daten werden vorbereitet..." />
  }

  if (currentUser) {
    return <Navigate to={resolveRedirectPath(location.search)} replace />
  }

  function updateField(key: keyof typeof form, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await registerUser(form)
      navigate(resolveRedirectPath(location.search), { replace: true })
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Registrierung war nicht moeglich.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Konto erstellen"
      subtitle="Lege deinen Garten-Zugang an. Avatar-Initialen werden automatisch aus Vor- und Nachname erzeugt."
      footer={
        <span>
          Schon dabei?{' '}
          <Link
            to={`/login?redirect=${encodeURIComponent(resolveRedirectPath(location.search))}`}
            className="font-semibold text-emerald-700"
          >
            Hier anmelden
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className={inputClass}
              placeholder="maria_meier"
              value={form.username}
              onChange={(event) => updateField('username', event.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700" htmlFor="email-register">
              E-Mail
            </label>
            <input
              id="email-register"
              type="email"
              className={inputClass}
              placeholder="maria@beispiel.at"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700" htmlFor="first-name">
              Vorname
            </label>
            <input
              id="first-name"
              className={inputClass}
              placeholder="Maria"
              value={form.firstName}
              onChange={(event) => updateField('firstName', event.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700" htmlFor="last-name">
              Nachname
            </label>
            <input
              id="last-name"
              className={inputClass}
              placeholder="Meier"
              value={form.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700" htmlFor="password-register">
            Passwort
          </label>
          <input
            id="password-register"
            type="password"
            className={inputClass}
            placeholder="Mindestens etwas, das du dir merkst"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
          />
        </div>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <button type="submit" className={primaryButtonClass} disabled={isSubmitting}>
          {isSubmitting ? 'Konto wird erstellt...' : 'Registrieren'}
        </button>
      </form>
    </AuthLayout>
  )
}
