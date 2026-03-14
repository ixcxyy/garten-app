import { useState } from 'react'
import { ArrowLeft, Copy, Images, Users } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Avatar } from '../components/Avatar'
import { CreateTodo } from '../components/CreateTodo'
import { EmptyState } from '../components/EmptyState'
import { FullPageLoader } from '../components/FullPageLoader'
import { TodoCard } from '../components/TodoCard'
import { useAppStore } from '../hooks/useAppStore'
import { panelClass, secondaryButtonClass } from '../lib/ui'
import { buildInviteUrl, copyText, formatDate, getDisplayName } from '../lib/utils'

export function GroupPage() {
  const { groupId = '' } = useParams()
  const { currentUser, isReady, getGroupView, createTodo, logout, snapshot, toggleTodo } = useAppStore()
  const [message, setMessage] = useState('')
  const [pageError, setPageError] = useState('')

  if (!isReady) {
    return <FullPageLoader label="Die Gruppe wird geladen..." />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const groupView = getGroupView(groupId)

  if (!groupView) {
    return <Navigate to="/dashboard" replace />
  }

  const activeGroupView = groupView
  const openTodos = activeGroupView.todos.filter((todo) => !todo.done)
  const doneTodos = activeGroupView.todos.filter((todo) => todo.done)
  const photos = activeGroupView.todos.filter((todo) => todo.photo).slice(0, 4)

  async function handleCreateTodo(payload: {
    title: string
    description: string
    photo: string | null
  }) {
    setPageError('')

    try {
      await createTodo({
        groupId,
        title: payload.title,
        description: payload.description,
        photo: payload.photo,
      })
      setMessage('Aktivitaet gespeichert.')
      window.setTimeout(() => setMessage(''), 2400)
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Die Aktivitaet konnte nicht gespeichert werden.',
      )
      throw error
    }
  }

  async function handleToggleTodo(todoId: string) {
    await toggleTodo(todoId)
  }

  async function handleCopyInvite() {
    await copyText(buildInviteUrl(activeGroupView.group.inviteCode))
    setMessage('Einladungslink kopiert.')
    window.setTimeout(() => setMessage(''), 2400)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(238,204,118,0.28),_transparent_24%),linear-gradient(180deg,_#f9f5ea_0%,_#eef5e5_44%,_#f8fbf7_100%)] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <AppHeader
          currentUser={currentUser}
          title={activeGroupView.group.name}
          subtitle={`Organisiert von ${activeGroupView.owner ? getDisplayName(activeGroupView.owner) : 'eurer Gruppe'} | Invite-Code ${activeGroupView.group.inviteCode}`}
          onLogout={logout}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/dashboard" className={secondaryButtonClass}>
            <ArrowLeft className="h-4 w-4" />
            Zurueck zum Dashboard
          </Link>
          {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
          {pageError ? <p className="text-sm font-medium text-rose-600">{pageError}</p> : null}
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className={`${panelClass} p-6 sm:p-7`}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Erstellt am {formatDate(activeGroupView.group.createdAt)}
                </p>
                <h2 className="mt-3 font-display text-3xl text-stone-900">
                  Fortschritt der Gruppe
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {activeGroupView.progress.done} von {activeGroupView.progress.total} Aktivitaeten
                  sind bereits erledigt.
                </p>
              </div>
              <button type="button" className={secondaryButtonClass} onClick={handleCopyInvite}>
                <Copy className="h-4 w-4" />
                Invite-Link kopieren
              </button>
            </div>

            <div className="mt-6 h-4 overflow-hidden rounded-full bg-olive-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-700 via-lime-500 to-amber-300"
                style={{ width: `${activeGroupView.progress.percentage}%` }}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ['Offen', `${activeGroupView.progress.open}`],
                ['Erledigt', `${activeGroupView.progress.done}`],
                ['Mitglieder', `${activeGroupView.members.length}`],
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

          <div className="grid gap-4">
            <section className={`${panelClass} p-6`}>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                <Users className="h-4 w-4 text-emerald-700" />
                Mitglieder
              </div>
              <div className="mt-5 space-y-3">
                {activeGroupView.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-3xl bg-stone-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar user={member} />
                      <div>
                        <p className="font-semibold text-stone-900">{getDisplayName(member)}</p>
                        <p className="text-sm text-stone-500">@{member.username}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                      {member.id === activeGroupView.group.owner ? 'Owner' : 'Mitglied'}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${panelClass} p-6`}>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                <Images className="h-4 w-4 text-emerald-700" />
                Letzte Fotos
              </div>
              {photos.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-stone-600">
                  Sobald ihr Fotos an Aufgaben haengt, erscheinen hier die neuesten Eindruecke.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {photos.map((todo) => (
                    <img
                      key={todo.id}
                      src={todo.photo ?? undefined}
                      alt={todo.title}
                      className="h-28 w-full rounded-[22px] object-cover"
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div>
            <CreateTodo onCreate={handleCreateTodo} />
          </div>

          <div className="space-y-6">
            <section className={`${panelClass} p-6 sm:p-7`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Offen
                  </p>
                  <h2 className="mt-2 font-display text-2xl text-stone-900">Anstehende Arbeit</h2>
                </div>
                <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
                  {openTodos.length} Eintraege
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {openTodos.length === 0 ? (
                  <EmptyState
                    title="Alles geschafft"
                    text="Im Moment gibt es keine offenen Aufgaben in dieser Gruppe."
                  />
                ) : (
                  openTodos.map((todo) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      creator={snapshot.users.find((user) => user.id === todo.createdBy) ?? null}
                      onToggle={handleToggleTodo}
                    />
                  ))
                )}
              </div>
            </section>

            <section className={`${panelClass} p-6 sm:p-7`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Archiv
                  </p>
                  <h2 className="mt-2 font-display text-2xl text-stone-900">Erledigte Aufgaben</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-900">
                  {doneTodos.length} Eintraege
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {doneTodos.length === 0 ? (
                  <EmptyState
                    title="Noch nichts abgehakt"
                    text="Erledigte Aufgaben werden hier gesammelt, damit ihr den Fortschritt sehen koennt."
                  />
                ) : (
                  doneTodos.map((todo) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      creator={snapshot.users.find((user) => user.id === todo.createdBy) ?? null}
                      onToggle={handleToggleTodo}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  )
}
