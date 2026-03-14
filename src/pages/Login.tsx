import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FullPageLoader } from '../components/FullPageLoader'
import { useAppStore } from '../hooks/useAppStore'
import { inputClass, primaryButtonClass } from '../lib/ui'
import { resolveRedirectPath } from '../lib/utils'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, isReady, login } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isReady) {
    return <FullPageLoader label="Anmeldung und Daten werden geladen..." />
  }

  if (currentUser) {
    return <Navigate to={resolveRedirectPath(location.search)} replace />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate(resolveRedirectPath(location.search), { replace: true })
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Anmeldung war nicht moeglich.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Anmelden"
      subtitle="Melde dich an, um Gruppen zu verwalten, Einladungen anzunehmen und Aufgaben auf dem Handy abzuhaken."
      footer={
        <span>
          Noch kein Konto?{' '}
          <Link
            to={`/register?redirect=${encodeURIComponent(resolveRedirectPath(location.search))}`}
            className="font-semibold text-emerald-700"
          >
            Jetzt registrieren
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700" htmlFor="email">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            className={inputClass}
            placeholder="garten@beispiel.at"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700" htmlFor="password">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            className={inputClass}
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <button type="submit" className={primaryButtonClass} disabled={isSubmitting}>
          {isSubmitting ? 'Anmeldung laeuft...' : 'Einloggen'}
        </button>
      </form>
    </AuthLayout>
  )
}
