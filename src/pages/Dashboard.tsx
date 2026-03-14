import { useState } from 'react'
import { ArrowRight, Copy, Leaf, Users } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Avatar } from '../components/Avatar'
import { CreateGroup } from '../components/CreateGroup'
import { EmptyState } from '../components/EmptyState'
import { FullPageLoader } from '../components/FullPageLoader'
import { useAppStore } from '../hooks/useAppStore'
import { hasFirebaseConfig } from '../lib/firebase'
import { panelClass, primaryButtonClass, secondaryButtonClass } from '../lib/ui'
import { buildInviteUrl, copyText, formatDate, getDisplayName } from '../lib/utils'

export function DashboardPage() {
  const navigate = useNavigate()
  const { currentUser, groups, isReady, createGroup, logout } = useAppStore()
  const [copyMessage, setCopyMessage] = useState('')
  const [pageError, setPageError] = useState('')

  if (!isReady) {
    return <FullPageLoader label="Deine Gruppen und Aufgaben werden geladen..." />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  async function handleCreateGroup(name: string) {
    setPageError('')

    try {
      const group = await createGroup({ name })
      navigate(`/group/${group.id}`)
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Die Gruppe konnte nicht erstellt werden.')
      throw error
    }
  }

  async function handleCopyInvite(inviteCode: string) {
    await copyText(buildInviteUrl(inviteCode))
    setCopyMessage('Einladungslink kopiert.')
    window.setTimeout(() => setCopyMessage(''), 2400)
  }

  const totalTasks = groups.reduce((sum, entry) => sum + entry.progress.total, 0)
  const completedTasks = groups.reduce((sum, entry) => sum + entry.progress.done, 0)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(245,207,129,0.35),_transparent_24%),linear-gradient(180deg,_#f8f5ea_0%,_#eef4e5_40%,_#f9fbf7_100%)] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <AppHeader
          currentUser={currentUser}
          title={`Willkommen, ${currentUser.firstName}.`}
          subtitle="Behalte Gruppen, Einladungen und anstehende Gartenarbeit in einer ruhigen, mobilen Uebersicht im Blick."
          onLogout={logout}
        />

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Gruppen', `${groups.length}`, 'Aktive Gartenkreise'],
            ['Todos', `${totalTasks}`, 'Aufgaben ueber alle Gruppen'],
            ['Fortschritt', `${completedTasks}`, 'Erledigte Aktivitaeten'],
          ].map(([label, value, helper]) => (
            <div key={label} className={`${panelClass} p-5`}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{label}</p>
              <p className="mt-3 font-display text-4xl text-stone-900">{value}</p>
              <p className="mt-2 text-sm text-stone-600">{helper}</p>
            </div>
          ))}
        </section>

        {!hasFirebaseConfig ? (
          <section className={`${panelClass} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                Demo-Modus
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Die App ist lauffaehig und speichert aktuell lokal im Browser. Trage
                deine Firebase-Umgebungsvariablen ein, um Auth, Firestore und Storage
                fuer echte Cloud-Daten zu aktivieren.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
              <Leaf className="h-4 w-4" />
              Lokal gespeichert
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-4">
            <CreateGroup onCreate={handleCreateGroup} />
            {pageError ? <p className="text-sm font-medium text-rose-600">{pageError}</p> : null}
            {copyMessage ? <p className="text-sm font-medium text-emerald-700">{copyMessage}</p> : null}
          </div>

          <section className={`${panelClass} p-6 sm:p-7`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-olive-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-olive-900">
                  <Users className="h-4 w-4" />
                  Deine Gruppen
                </p>
                <h2 className="mt-4 font-display text-2xl text-stone-900">Alles auf einen Blick</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Oeffne Gruppen, teile Einladungen und verfolge den Fortschritt pro Garten.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {groups.length === 0 ? (
                <EmptyState
                  title="Noch keine Gruppe"
                  text="Lege deine erste Garten-Gruppe an, um Mitglieder einzuladen und Aufgaben zu sammeln."
                />
              ) : (
                groups.map(({ group, members, progress }) => (
                  <article
                    key={group.id}
                    className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(81,93,51,0.1)]"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                          Erstellt am {formatDate(group.createdAt)}
                        </div>
                        <h3 className="mt-3 font-display text-2xl text-stone-900">{group.name}</h3>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-stone-600">
                          <span>{progress.total} Aktivitaeten</span>
                          <span>{progress.done} erledigt</span>
                          <span>{members.length} Mitglieder</span>
                        </div>
                        <div className="mt-5 h-3 overflow-hidden rounded-full bg-olive-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-lime-500"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <p className="mt-2 text-sm font-medium text-stone-600">
                          Fortschritt: {progress.percentage}%
                        </p>
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          {members.slice(0, 4).map((member) => (
                            <div key={member.id} className="flex items-center gap-2">
                              <Avatar user={member} size="sm" />
                              <span className="text-sm font-medium text-stone-600">
                                {getDisplayName(member)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                        <Link to={`/group/${group.id}`} className={primaryButtonClass}>
                          Gruppe oeffnen
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          className={secondaryButtonClass}
                          onClick={() => handleCopyInvite(group.inviteCode)}
                        >
                          <Copy className="h-4 w-4" />
                          Link kopieren
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}
