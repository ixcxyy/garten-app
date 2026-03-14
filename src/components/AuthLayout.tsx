import type { PropsWithChildren, ReactNode } from 'react'

interface AuthLayoutProps extends PropsWithChildren {
  title: string
  subtitle: string
  footer: ReactNode
}

export function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(245,207,129,0.45),_transparent_28%),linear-gradient(180deg,_#f7f3e8_0%,_#eef3e0_42%,_#f8faf5_100%)] px-4 py-8 text-stone-800 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_center,_rgba(46,125,89,0.16),_transparent_55%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[32px] border border-white/60 bg-stone-900/90 p-8 text-stone-100 shadow-[0_30px_90px_rgba(42,54,29,0.2)] sm:p-10">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Garten Gruppen App
          </span>
          <h1 className="mt-6 max-w-lg font-display text-4xl leading-tight sm:text-5xl">
            Gemeinsame Gartenarbeit ohne App-Store-Huerden.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-stone-300 sm:text-base">
            Organisiert Aufgaben, Einladungen und Fortschritt in einer mobilen WebApp,
            die sich direkt per Link teilen laesst.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Gruppen', 'Familiengarten, Hof oder Gemeinschaftsbeet in Minuten starten.'],
              ['Einladungen', 'Links teilen, oeffnen und direkt der Gruppe beitreten.'],
              ['Aktivitaeten', 'Todos mit Foto, Status und Verlauf uebersichtlich pflegen.'],
            ].map(([label, text]) => (
              <div
                key={label}
                className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur"
              >
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_28px_90px_rgba(70,76,40,0.14)] backdrop-blur-xl sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Schnellstart
          </p>
          <h2 className="mt-3 font-display text-3xl text-stone-900">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 border-t border-olive-100 pt-5 text-sm text-stone-600">
            {footer}
          </div>
        </section>
      </div>
    </div>
  )
}
