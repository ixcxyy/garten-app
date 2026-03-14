import { hasFirebaseConfig } from './firebase'
import * as firebaseStore from './firebase-store'
import * as localStore from './local-store'
import type { CreateGroupPayload, CreateTodoPayload, LoginPayload, RegisterPayload } from '../types'

const liveStore = hasFirebaseConfig ? firebaseStore : localStore

export const getCurrentUser = localStore.getCurrentUser
export const getGroupById = localStore.getGroupById
export const getGroupByInviteCode = localStore.getGroupByInviteCode
export const getGroupsForUser = localStore.getGroupsForUser
export const getMembersForGroup = localStore.getMembersForGroup
export const getMembership = localStore.getMembership
export const getTodosForGroup = localStore.getTodosForGroup

export function getSnapshot() {
  return liveStore.getSnapshot()
}

export function isStoreReady() {
  if ('isStoreReady' in liveStore) {
    return liveStore.isStoreReady()
  }

  return true
}

export function getStoreError() {
  if ('getStoreError' in liveStore) {
    return liveStore.getStoreError()
  }

  return null
}

export function subscribe(listener: () => void) {
  return liveStore.subscribe(listener)
}

export function registerUser(payload: RegisterPayload) {
  return liveStore.registerUser(payload)
}

export function login(payload: LoginPayload) {
  return liveStore.login(payload)
}

export function loginWithGoogle() {
  if ('loginWithGoogle' in liveStore) {
    return liveStore.loginWithGoogle()
  }

  return Promise.reject(
    new Error('Google-Anmeldung ist nur mit aktiver Firebase-Konfiguration verfuegbar.'),
  )
}

export function logout() {
  return liveStore.logout()
}

export function createGroup(payload: CreateGroupPayload) {
  return liveStore.createGroup(payload)
}

export function joinGroupByInviteCode(inviteCode: string) {
  return liveStore.joinGroupByInviteCode(inviteCode)
}

export function createTodo(payload: CreateTodoPayload) {
  return liveStore.createTodo(payload)
}

export function toggleTodo(todoId: string) {
  return liveStore.toggleTodo(todoId)
}
