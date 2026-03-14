import type { AppUser } from '../types'
import { cx } from '../lib/ui'

const sizeMap = {
  sm: 'h-10 w-10 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
}

interface AvatarProps {
  user: AppUser
  size?: keyof typeof sizeMap
}

export function Avatar({ user, size = 'md' }: AvatarProps) {
  return (
    <div
      className={cx(
        'inline-flex items-center justify-center rounded-full border border-white/70 bg-gradient-to-br from-amber-100 via-lime-50 to-emerald-100 font-semibold text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]',
        sizeMap[size],
      )}
      aria-label={`${user.firstName} ${user.lastName}`}
      title={`${user.firstName} ${user.lastName}`}
    >
      {user.avatar}
    </div>
  )
}
