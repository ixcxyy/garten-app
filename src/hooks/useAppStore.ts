import { startTransition, useEffect, useState } from 'react'
import {
  createGroup,
  createTodo,
  getCurrentUser,
  getGroupById,
  getGroupByInviteCode,
  getGroupsForUser,
  getMembersForGroup,
  getMembership,
  getSnapshot,
  getStoreError,
  isStoreReady,
  getTodosForGroup,
  joinGroupByInviteCode,
  login,
  loginWithGoogle,
  logout,
  registerUser,
  subscribe,
  toggleTodo,
} from '../lib/app-store'
import { getProgress } from '../lib/utils'

export function useAppStore() {
  const [storeState, setStoreState] = useState(() => ({
    snapshot: getSnapshot(),
    isReady: isStoreReady(),
    error: getStoreError(),
  }))

  useEffect(() => {
    return subscribe(() => {
      startTransition(() => {
        setStoreState({
          snapshot: getSnapshot(),
          isReady: isStoreReady(),
          error: getStoreError(),
        })
      })
    })
  }, [])

  const { snapshot, isReady, error } = storeState
  const currentUser = getCurrentUser(snapshot)
  const groups = currentUser
    ? getGroupsForUser(currentUser.id, snapshot).map((group) => {
        const members = getMembersForGroup(group.id, snapshot)
        const todos = getTodosForGroup(group.id, snapshot)

        return {
          group,
          members,
          todos,
          progress: getProgress(todos),
        }
      })
    : []

  function getGroupView(groupId: string) {
    const group = getGroupById(groupId, snapshot)

    if (!group || !currentUser) {
      return null
    }

    const membership = getMembership(groupId, currentUser.id, snapshot)

    if (!membership) {
      return null
    }

    const todos = getTodosForGroup(groupId, snapshot)
    const members = getMembersForGroup(groupId, snapshot)
    const owner = members.find((member) => member.id === group.owner) ?? null

    return {
      group,
      membership,
      members,
      owner,
      todos,
      progress: getProgress(todos),
    }
  }

  function getInvitePreview(inviteCode: string) {
    const group = getGroupByInviteCode(inviteCode, snapshot)

    if (!group) {
      return null
    }

    const todos = getTodosForGroup(group.id, snapshot)
    const members = getMembersForGroup(group.id, snapshot)
    const owner = members.find((member) => member.id === group.owner) ?? null
    const isMember = currentUser
      ? Boolean(getMembership(group.id, currentUser.id, snapshot))
      : false

    return {
      group,
      members,
      owner,
      progress: getProgress(todos),
      isMember,
    }
  }

  return {
    snapshot,
    isReady,
    error,
    currentUser,
    groups,
    getGroupView,
    getInvitePreview,
    registerUser,
    login,
    loginWithGoogle,
    logout,
    createGroup,
    joinGroupByInviteCode,
    createTodo,
    toggleTodo,
  }
}
