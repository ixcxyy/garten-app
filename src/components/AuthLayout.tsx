import type { PropsWithChildren, ReactNode } from 'react'

interface AuthLayoutProps extends PropsWithChildren {
  title: string
  subtitle: string
  footer: ReactNode
}

export function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(245,207,129,0.5),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(65,141,99,0.16),_transparent_24%),linear-gradient(180deg,_#f7f3e8_0%,_#eef3e0_42%,_#f8faf5_100%)] px-4 py-8 text-stone-800 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_center,_rgba(46,125,89,0.18),_transparent_55%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden rounded-[36px] border border-white/60 bg-stone-900/92 p-8 text-stone-100 shadow-[0_30px_90px_rgba(42,54,29,0.2)] sm:p-10">
          <div className="pointer-events-none absolute -right-14 top-8 h-44 w-44 rounded-full bg-emerald-300/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-8 h-32 w-32 rounded-full bg-amber-200/15 blur-3xl" />
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Garten Gruppen App
          </span>
          <h1 className="mt-6 max-w-lg font-display text-4xl leading-tight sm:text-5xl">
            Ein Gartenboard, das sich wie ein ruhiger Arbeitsraum anfuehlt.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-stone-300 sm:text-base">
            Organisiert Aufgaben, Einladungen und Fortschritt in einer mobilen Web-App,
            die schnell startet, leicht teilbar ist und sich fuer kleine Gruppen sofort
            gut anfuehlt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              'Live mit Firebase',
              'Mit Google oder E-Mail',
              'Direkt per Link teilbar',
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-200"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Gruppen', 'Familiengarten, Hof oder Gemeinschaftsbeet in Minuten starten.'],
              ['Einladungen', 'Links teilen, oeffnen und direkt der Gruppe beitreten.'],
              ['Aktivitaeten', 'Todos mit Foto, Status und Verlauf sichtbar pflegen.'],
            ].map(([label, text]) => (
              <div
                key={label}
                className="rounded-3xl border border-white/10 bg-white/7 p-4 backdrop-blur"
              >
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[36px] border border-white/70 bg-white/82 p-6 shadow-[0_28px_90px_rgba(70,76,40,0.14)] backdrop-blur-xl sm:p-8">
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
