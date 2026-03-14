import type { AppUser, TodoItem } from '../types'

export function generateId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 4)
}

export function getAvatarLabel(firstName: string, lastName: string, username: string) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.trim()
  return initials ? initials.toUpperCase() : username.slice(0, 2).toUpperCase()
}

export function getDisplayName(user: AppUser) {
  return `${user.firstName} ${user.lastName}`.trim()
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getProgress(todos: TodoItem[]) {
  const total = todos.length
  const done = todos.filter((todo) => todo.done).length
  const open = total - done
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100)

  return {
    total,
    done,
    open,
    percentage,
  }
}

export async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('Die Datei konnte nicht gelesen werden.'))
    reader.readAsDataURL(file)
  })
}

export function buildInviteUrl(inviteCode: string) {
  if (typeof window === 'undefined') {
    return `/invite/${inviteCode}`
  }

  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`

  return new URL(`${base}invite/${inviteCode}`, window.location.origin).toString()
}

export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const input = document.createElement('textarea')
  input.value = text
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
}

export function resolveRedirectPath(search: string) {
  const params = new URLSearchParams(search)
  const directRedirect = params.get('redirect')
  const pagesRedirect = params.get('p')

  if (pagesRedirect) {
    return pagesRedirect
  }

  return directRedirect || '/dashboard'
}
