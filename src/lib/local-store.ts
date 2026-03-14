import type {
  AppUser,
  CreateGroupPayload,
  CreateTodoPayload,
  GardenGroup,
  LoginPayload,
  PersistedState,
  RegisterPayload,
  TodoItem,
} from '../types'
import { generateId, generateInviteCode, getAvatarLabel } from './utils'

const STORAGE_KEY = 'garten-app/state/v1'
const EVENT_NAME = 'garten-app:state-changed'

const EMPTY_STATE: PersistedState = {
  users: [],
  credentials: [],
  groups: [],
  groupMembers: [],
  todos: [],
  currentUserId: null,
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function normalizeState(value: Partial<PersistedState> | null | undefined): PersistedState {
  return {
    users: value?.users ?? [],
    credentials: value?.credentials ?? [],
    groups: value?.groups ?? [],
    groupMembers: value?.groupMembers ?? [],
    todos: value?.todos ?? [],
    currentUserId: value?.currentUserId ?? null,
  }
}

export function getSnapshot() {
  if (!isBrowser()) {
    return EMPTY_STATE
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return EMPTY_STATE
  }

  try {
    return normalizeState(JSON.parse(raw) as PersistedState)
  } catch {
    return EMPTY_STATE
  }
}

function saveSnapshot(nextState: PersistedState) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
  window.dispatchEvent(new Event(EVENT_NAME))
}

function updateState(updater: (currentState: PersistedState) => PersistedState) {
  const currentState = getSnapshot()
  const nextState = updater(currentState)
  saveSnapshot(nextState)
  return nextState
}

function requireCurrentUser(state: PersistedState) {
  const user = state.users.find((entry) => entry.id === state.currentUserId)

  if (!user) {
    throw new Error('Bitte melde dich zuerst an.')
  }

  return user
}

function ensureMember(groupId: string, userId: string, state: PersistedState) {
  const isMember = state.groupMembers.some(
    (membership) => membership.groupId === groupId && membership.userId === userId,
  )

  if (!isMember) {
    throw new Error('Du bist kein Mitglied dieser Gruppe.')
  }
}

export function subscribe(listener: () => void) {
  if (!isBrowser()) {
    return () => undefined
  }

  const handleChange = () => listener()
  window.addEventListener(EVENT_NAME, handleChange)
  window.addEventListener('storage', handleChange)

  return () => {
    window.removeEventListener(EVENT_NAME, handleChange)
    window.removeEventListener('storage', handleChange)
  }
}

export function registerUser(payload: RegisterPayload) {
  const email = payload.email.trim().toLowerCase()
  const username = payload.username.trim().toLowerCase()
  const firstName = payload.firstName.trim()
  const lastName = payload.lastName.trim()
  const password = payload.password.trim()

  if (!email || !username || !firstName || !lastName || !password) {
    throw new Error('Bitte fuelle alle Felder aus.')
  }

  const nextState = updateState((state) => {
    if (state.credentials.some((entry) => entry.email === email)) {
      throw new Error('Zu dieser E-Mail gibt es bereits ein Konto.')
    }

    if (state.users.some((entry) => entry.username === username)) {
      throw new Error('Dieser Username ist bereits vergeben.')
    }

    const user: AppUser = {
      id: generateId(),
      username,
      firstName,
      lastName,
      email,
      avatar: getAvatarLabel(firstName, lastName, username),
      createdAt: new Date().toISOString(),
    }

    return {
      ...state,
      users: [user, ...state.users],
      credentials: [
        {
          userId: user.id,
          email,
          password,
        },
        ...state.credentials,
      ],
      currentUserId: user.id,
    }
  })

  return requireCurrentUser(nextState)
}

export function login(payload: LoginPayload) {
  const email = payload.email.trim().toLowerCase()
  const password = payload.password.trim()

  const nextState = updateState((state) => {
    const credential = state.credentials.find(
      (entry) => entry.email === email && entry.password === password,
    )

    if (!credential) {
      throw new Error('Die Zugangsdaten passen nicht zusammen.')
    }

    return {
      ...state,
      currentUserId: credential.userId,
    }
  })

  return requireCurrentUser(nextState)
}

export function logout() {
  updateState((state) => ({
    ...state,
    currentUserId: null,
  }))
}

export function createGroup(payload: CreateGroupPayload) {
  const name = payload.name.trim()

  if (!name) {
    throw new Error('Bitte gib deiner Gruppe einen Namen.')
  }

  const nextState = updateState((state) => {
    const owner = requireCurrentUser(state)
    const group: GardenGroup = {
      id: generateId(),
      name,
      owner: owner.id,
      inviteCode: generateInviteCode(),
      createdAt: new Date().toISOString(),
    }

    return {
      ...state,
      groups: [group, ...state.groups],
      groupMembers: [
        {
          groupId: group.id,
          userId: owner.id,
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
        ...state.groupMembers,
      ],
    }
  })

  return nextState.groups[0]
}

export function joinGroupByInviteCode(inviteCode: string) {
  const normalizedCode = inviteCode.trim().toLowerCase()

  const nextState = updateState((state) => {
    const user = requireCurrentUser(state)
    const group = state.groups.find(
      (entry) => entry.inviteCode.toLowerCase() === normalizedCode,
    )

    if (!group) {
      throw new Error('Der Einladungslink ist nicht mehr gueltig.')
    }

    const alreadyMember = state.groupMembers.some(
      (membership) => membership.groupId === group.id && membership.userId === user.id,
    )

    if (alreadyMember) {
      return state
    }

    return {
      ...state,
      groupMembers: [
        {
          groupId: group.id,
          userId: user.id,
          role: 'member',
          joinedAt: new Date().toISOString(),
        },
        ...state.groupMembers,
      ],
    }
  })

  return nextState.groups.find((group) => group.inviteCode.toLowerCase() === normalizedCode)!
}

export function createTodo(payload: CreateTodoPayload) {
  const title = payload.title.trim()
  const description = payload.description.trim()

  if (!title) {
    throw new Error('Bitte gib der Aufgabe einen Titel.')
  }

  const nextState = updateState((state) => {
    const user = requireCurrentUser(state)
    ensureMember(payload.groupId, user.id, state)

    const todo: TodoItem = {
      id: generateId(),
      groupId: payload.groupId,
      title,
      description,
      photo: payload.photo,
      done: false,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    }

    return {
      ...state,
      todos: [todo, ...state.todos],
    }
  })

  return nextState.todos[0]
}

export function toggleTodo(todoId: string) {
  const nextState = updateState((state) => {
    const user = requireCurrentUser(state)
    const todo = state.todos.find((entry) => entry.id === todoId)

    if (!todo) {
      throw new Error('Diese Aufgabe wurde nicht gefunden.')
    }

    ensureMember(todo.groupId, user.id, state)

    return {
      ...state,
      todos: state.todos.map((entry) =>
        entry.id === todoId
          ? {
              ...entry,
              done: !entry.done,
            }
          : entry,
      ),
    }
  })

  return nextState.todos.find((todo) => todo.id === todoId)!
}

export function getCurrentUser(state: PersistedState) {
  return state.users.find((user) => user.id === state.currentUserId) ?? null
}

export function getGroupsForUser(userId: string, state: PersistedState) {
  const memberships = state.groupMembers.filter((membership) => membership.userId === userId)
  const groupIds = new Set(memberships.map((membership) => membership.groupId))

  return state.groups
    .filter((group) => groupIds.has(group.id))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

export function getGroupById(groupId: string, state: PersistedState) {
  return state.groups.find((group) => group.id === groupId) ?? null
}

export function getGroupByInviteCode(inviteCode: string, state: PersistedState) {
  const normalizedCode = inviteCode.trim().toLowerCase()
  return (
    state.groups.find((group) => group.inviteCode.toLowerCase() === normalizedCode) ?? null
  )
}

export function getMembersForGroup(groupId: string, state: PersistedState) {
  const userIds = state.groupMembers
    .filter((membership) => membership.groupId === groupId)
    .map((membership) => membership.userId)

  return state.users.filter((user) => userIds.includes(user.id))
}

export function getMembership(groupId: string, userId: string, state: PersistedState) {
  return (
    state.groupMembers.find(
      (membership) => membership.groupId === groupId && membership.userId === userId,
    ) ?? null
  )
}

export function getTodosForGroup(groupId: string, state: PersistedState) {
  return state.todos
    .filter((todo) => todo.groupId === groupId)
    .sort((left, right) => {
      if (left.done !== right.done) {
        return Number(left.done) - Number(right.done)
      }

      return right.createdAt.localeCompare(left.createdAt)
    })
}
