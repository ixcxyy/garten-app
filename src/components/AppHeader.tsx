import { Leaf, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from './Avatar'
import type { AppUser } from '../types'
import { ghostButtonClass, secondaryButtonClass } from '../lib/ui'

interface AppHeaderProps {
  currentUser: AppUser
  title: string
  subtitle: string
  onLogout: () => void
}

export function AppHeader({ currentUser, title, subtitle, onLogout }: AppHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-[34px] border border-white/65 bg-stone-900/92 px-5 py-5 text-white shadow-[0_24px_80px_rgba(41,53,30,0.24)] sm:px-7 sm:py-6">
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200"
          >
            <Leaf className="h-4 w-4" />
            Garten Gruppen App
          </Link>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300 sm:text-base">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-full border border-white/12 bg-white/10 px-4 py-2">
            <Avatar user={currentUser} />
            <div>
              <p className="text-sm font-semibold text-white">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-xs text-stone-300">@{currentUser.username}</p>
            </div>
          </div>
          <button type="button" className={secondaryButtonClass} onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
          <Link to="/dashboard" className={ghostButtonClass}>
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  )
}
