import { CheckCircle2, Circle, ImageIcon } from 'lucide-react'
import type { AppUser, TodoItem } from '../types'
import { cx, secondaryButtonClass } from '../lib/ui'
import { formatDateTime, getDisplayName } from '../lib/utils'
import { Avatar } from './Avatar'

interface TodoCardProps {
  todo: TodoItem
  creator: AppUser | null
  onToggle: (todoId: string) => Promise<void> | void
}

export function TodoCard({ todo, creator, onToggle }: TodoCardProps) {
  return (
    <article
      className={cx(
        'rounded-[28px] border p-5 transition sm:p-6',
        todo.done
          ? 'border-emerald-200 bg-emerald-50/80'
          : 'border-white/70 bg-white/85 shadow-[0_18px_50px_rgba(81,93,51,0.1)]',
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cx(
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]',
                todo.done ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-100 text-amber-900',
              )}
            >
              {todo.done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              {todo.done ? 'Erledigt' : 'Offen'}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
              {formatDateTime(todo.createdAt)}
            </span>
          </div>

          <h3
            className={cx(
              'mt-4 font-display text-2xl text-stone-900',
              todo.done && 'text-stone-500 line-through decoration-emerald-500/60',
            )}
          >
            {todo.title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-stone-600">
            {todo.description || 'Keine zusaetzliche Beschreibung hinterlegt.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {creator ? (
              <div className="flex items-center gap-3 rounded-full bg-stone-100/90 px-3 py-2">
                <Avatar user={creator} size="sm" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Erstellt von
                  </p>
                  <p className="text-sm font-semibold text-stone-800">{getDisplayName(creator)}</p>
                </div>
              </div>
            ) : null}

            <button type="button" className={secondaryButtonClass} onClick={() => onToggle(todo.id)}>
              {todo.done ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {todo.done ? 'Wieder oeffnen' : 'Als erledigt markieren'}
            </button>
          </div>
        </div>

        {todo.photo ? (
          <div className="w-full lg:max-w-[240px]">
            <img
              src={todo.photo}
              alt={todo.title}
              className="h-44 w-full rounded-[24px] object-cover"
            />
          </div>
        ) : (
          <div className="flex h-44 w-full items-center justify-center rounded-[24px] border border-dashed border-olive-200 bg-olive-50/80 text-stone-400 lg:max-w-[240px]">
            <div className="text-center">
              <ImageIcon className="mx-auto h-6 w-6" />
              <p className="mt-3 text-sm font-medium">Kein Foto hinterlegt</p>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
