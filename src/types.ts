export type GroupRole = 'owner' | 'member'

export interface AppUser {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  avatar: string
  createdAt: string
}

export interface CredentialRecord {
  userId: string
  email: string
  password: string
}

export interface GardenGroup {
  id: string
  name: string
  owner: string
  inviteCode: string
  createdAt: string
}

export interface GroupMember {
  userId: string
  groupId: string
  role: GroupRole
  joinedAt: string
}

export interface TodoItem {
  id: string
  groupId: string
  title: string
  description: string
  photo: string | null
  done: boolean
  createdBy: string
  createdAt: string
}

export interface PersistedState {
  users: AppUser[]
  credentials: CredentialRecord[]
  groups: GardenGroup[]
  groupMembers: GroupMember[]
  todos: TodoItem[]
  currentUserId: string | null
}

export interface RegisterPayload {
  username: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface CreateGroupPayload {
  name: string
}

export interface CreateTodoPayload {
  groupId: string
  title: string
  description: string
  photo: string | null
}
