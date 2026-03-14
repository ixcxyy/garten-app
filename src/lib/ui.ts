export function cx(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(' ')
}

export const panelClass =
  'rounded-[28px] border border-white/60 bg-white/80 shadow-[0_28px_80px_rgba(60,70,32,0.12)] backdrop-blur-xl'

export const inputClass =
  'w-full rounded-2xl border border-olive-200/80 bg-white/90 px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100'

export const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(27,94,61,0.22)] transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60'

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-olive-200 bg-white/90 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-emerald-300 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60'

export const ghostButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-white/70 hover:text-stone-900'
