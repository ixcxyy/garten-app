import { useState } from 'react'
import { ArrowRight, Link2, Users } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { FullPageLoader } from '../components/FullPageLoader'
import { useAppStore } from '../hooks/useAppStore'
import { panelClass, primaryButtonClass, secondaryButtonClass } from '../lib/ui'
import { getDisplayName } from '../lib/utils'

export function InvitePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { inviteCode = '' } = useParams()
  const { currentUser, isReady, getInvitePreview, joinGroupByInviteCode } = useAppStore()
  const [error, setError] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  if (!isReady) {
    return <FullPageLoader label="Die Einladung wird gesucht..." />
  }

  if (!currentUser) {
    const authRedirect = encodeURIComponent(location.pathname)

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(244,208,127,0.35),_transparent_25%),linear-gradient(180deg,_#f8f5ea_0%,_#eff4e4_45%,_#f8fbf7_100%)] px-4 py-8 text-stone-800 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <section className={`${panelClass} overflow-hidden p-6 sm:p-8`}>
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-900">
                  <Link2 className="h-4 w-4" />
                  Einladung
                </p>
                <h1 className="mt-4 font-display text-4xl text-stone-900">Zur Gruppe eingeladen</h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
                  Melde dich an oder erstelle ein Konto, damit wir deine Einladung sicher deinem
                  Profil zuordnen und dich direkt der richtigen Gruppe hinzufuegen koennen.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    ['Code', inviteCode.toUpperCase()],
                    ['Backend', 'Firebase'],
                    ['Status', 'Wartet auf Login'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[24px] bg-stone-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                        {label}
                      </p>
                      <p className="mt-2 font-display text-3xl text-stone-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-olive-100 bg-olive-50/80 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                  <Users className="h-4 w-4 text-emerald-700" />
                  Beitreten
                </div>
                <div className="mt-5 space-y-4">
                  <p className="text-sm leading-7 text-stone-600">
                    Nach dem Login pruefen wir den Invite-Code und leiten dich direkt in die
                    Gruppe weiter.
                  </p>
                  <Link to={`/register?redirect=${authRedirect}`} className={primaryButtonClass}>
                    Konto erstellen
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to={`/login?redirect=${authRedirect}`} className={secondaryButtonClass}>
                    Ich habe schon ein Konto
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  const invite = getInvitePreview(inviteCode)

  if (!invite) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#f8f5ea_0%,_#eff4e4_44%,_#f8fbf7_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            title="Einladung nicht gefunden"
            text="Dieser Invite-Code ist ungueltig oder gehoert nicht zu einer bestehenden Gruppe."
            action={
              <Link to="/dashboard" className={secondaryButtonClass}>
                Zum Dashboard
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  if (currentUser && invite.isMember) {
    return <Navigate to={`/group/${invite.group.id}`} replace />
  }

  async function handleJoin() {
    setError('')
    setIsJoining(true)

    try {
      const group = await joinGroupByInviteCode(inviteCode)
      navigate(`/group/${group.id}`, { replace: true })
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Beitritt war nicht moeglich.')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(244,208,127,0.35),_transparent_25%),linear-gradient(180deg,_#f8f5ea_0%,_#eff4e4_45%,_#f8fbf7_100%)] px-4 py-8 text-stone-800 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <section className={`${panelClass} overflow-hidden p-6 sm:p-8`}>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-900">
                <Link2 className="h-4 w-4" />
                Einladung
              </p>
              <h1 className="mt-4 font-display text-4xl text-stone-900">{invite.group.name}</h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
                {invite.owner ? getDisplayName(invite.owner) : 'Eine Person aus deiner Gruppe'} hat
                dich eingeladen, bei der gemeinsamen Gartenplanung mitzumachen.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ['Mitglieder', `${invite.members.length}`],
                  ['Aufgaben', `${invite.progress.total}`],
                  ['Fortschritt', `${invite.progress.percentage}%`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[24px] bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      {label}
                    </p>
                    <p className="mt-2 font-display text-3xl text-stone-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {invite.members.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center gap-2 rounded-full bg-stone-50 px-3 py-2">
                    <Avatar user={member} size="sm" />
                    <span className="text-sm font-medium text-stone-700">{member.firstName}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-olive-100 bg-olive-50/80 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                <Users className="h-4 w-4 text-emerald-700" />
                Beitreten
              </div>

              <div className="mt-5 space-y-4">
                <p className="text-sm leading-7 text-stone-600">
                  Eingeloggt als <span className="font-semibold">{currentUser.firstName}</span>.
                  Ein Klick und du bist Mitglied dieser Gruppe.
                </p>
                {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
                <button
                  type="button"
                  className={primaryButtonClass}
                  onClick={handleJoin}
                  disabled={isJoining}
                >
                  {isJoining ? 'Beitritt laeuft...' : 'Gruppe beitreten'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
