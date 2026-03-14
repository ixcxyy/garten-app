interface FullPageLoaderProps {
  label?: string
}

export function FullPageLoader({
  label = 'Verbindung wird aufgebaut...',
}: FullPageLoaderProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8f5ea_0%,_#eef4e5_45%,_#f9fbf7_100%)] px-4 py-10">
      <div className="mx-auto flex max-w-3xl items-center justify-center">
        <div className="rounded-[28px] border border-white/70 bg-white/85 px-6 py-10 text-center shadow-[0_18px_50px_rgba(81,93,51,0.1)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
            Garten Gruppen App
          </p>
          <h1 className="mt-4 font-display text-3xl text-stone-900">Moment bitte</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-stone-600">{label}</p>
        </div>
      </div>
    </div>
  )
}
