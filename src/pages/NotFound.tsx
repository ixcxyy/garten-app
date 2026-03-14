import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { secondaryButtonClass } from '../lib/ui'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8f5ea_0%,_#eff4e4_44%,_#f8fbf7_100%)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <EmptyState
          title="Seite nicht gefunden"
          text="Dieser Gartenpfad existiert nicht. Ueber das Dashboard kommst du wieder zur Uebersicht."
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
