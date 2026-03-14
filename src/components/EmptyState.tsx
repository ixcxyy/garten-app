import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  text: string
  action?: ReactNode
}

export function EmptyState({ title, text, action }: EmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-olive-200 bg-olive-50/80 p-8 text-center">
      <h3 className="font-display text-2xl text-stone-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-stone-600">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
