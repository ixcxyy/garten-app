import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Firestore,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadString, type FirebaseStorage } from 'firebase/storage'
import type {
  AppUser,
  CreateGroupPayload,
  CreateTodoPayload,
  GardenGroup,
  GroupMember,
  LoginPayload,
  PersistedState,
  RegisterPayload,
  TodoItem,
} from '../types'
import { firebaseAuth, firebaseDb, firebaseStorage, hasFirebaseConfig } from './firebase'
import { generateId, generateInviteCode, getAvatarLabel } from './utils'

const EMPTY_STATE: PersistedState = {
  users: [],
  credentials: [],
  groups: [],
  groupMembers: [],
  todos: [],
  currentUserId: null,
}

const listeners = new Set<() => void>()

const initialLoadState = {
  auth: false,
  users: false,
  groups: false,
  groupMembers: false,
  todos: false,
}

let snapshot: PersistedState = EMPTY_STATE
let loadState = { ...initialLoadState }
let syncStarted = false
let authCleanup: (() => void) | null = null
let dataCleanupCallbacks: Array<() => void> = []
let storeError: string | null = null

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

function isBrowser() {
  return typeof window !== 'undefined'
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

function normalizeState(value: Partial<PersistedState> | null | undefined): PersistedState {
  return {
    users: value?.users ?? [],
    credentials: [],
    groups: value?.groups ?? [],
    groupMembers: value?.groupMembers ?? [],
    todos: value?.todos ?? [],
    currentUserId: value?.currentUserId ?? null,
  }
}

function updateSnapshot(partial: Partial<PersistedState>) {
  snapshot = normalizeState({
    ...snapshot,
    ...partial,
  })
  emitChange()
}

function markLoaded(key: keyof typeof initialLoadState) {
  loadState = {
    ...loadState,
    [key]: true,
  }
  emitChange()
}

function setStoreError(message: string | null) {
  storeError = message
  emitChange()
}

function resetCollectionState() {
  loadState = {
    ...loadState,
    users: false,
    groups: false,
    groupMembers: false,
    todos: false,
  }
}

function requireServices() {
  if (!hasFirebaseConfig || !firebaseAuth || !firebaseDb || !firebaseStorage) {
    throw new Error('Firebase ist noch nicht konfiguriert.')
  }

  return {
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage,
  }
}

function toFriendlyError(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error : new Error('Etwas ist schiefgelaufen.')
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return new Error('Zu dieser E-Mail gibt es bereits ein Konto.')
    case 'auth/invalid-email':
      return new Error('Bitte gib eine gueltige E-Mail-Adresse ein.')
    case 'auth/weak-password':
      return new Error('Das Passwort ist zu kurz oder zu einfach.')
    case 'auth/operation-not-allowed':
      return new Error(
        'E-Mail/Passwort ist in Firebase Authentication noch nicht aktiviert. Aktiviere in Firebase unter Authentication > Sign-in method den Provider "Email/Password".',
      )
    case 'auth/configuration-not-found':
      return new Error(
        'Firebase Authentication ist fuer dieses Web-Projekt noch nicht voll eingerichtet. Pruefe in Firebase die Werte fuer apiKey, authDomain und projectId und aktiviere unter Authentication > Sign-in method den Provider "Email/Password".',
      )
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return new Error('Die Zugangsdaten passen nicht zusammen.')
    case 'auth/too-many-requests':
      return new Error('Zu viele Versuche. Bitte warte kurz und probiere es erneut.')
    case 'permission-denied':
      return new Error(
        'Firebase blockiert den Zugriff. Pruefe deine Firestore- oder Storage-Regeln und veroeffentliche sie erneut.',
      )
    case 'failed-precondition':
      return new Error(
        'Firestore ist noch nicht voll eingerichtet. Lege in Firebase zuerst eine Cloud Firestore Datenbank an.',
      )
    case 'unavailable':
      return new Error('Firebase ist gerade nicht erreichbar. Bitte probiere es gleich noch einmal.')
    case 'storage/unauthorized':
      return new Error(
        'Der Bildupload ist durch Firebase Storage-Regeln blockiert. Pruefe die Storage-Regeln des Projekts.',
      )
    case 'storage/bucket-not-found':
      return new Error(
        'Der konfigurierte Firebase Storage-Bucket wurde nicht gefunden. Pruefe `VITE_FIREBASE_STORAGE_BUCKET`.',
      )
    default:
      return new Error(
        `Firebase hat die Anfrage abgelehnt (${error.code}). Bitte pruefe die Projektkonfiguration in Firebase.`,
      )
  }
}

function buildMembershipId(groupId: string, userId: string) {
  return `${groupId}_${userId}`
}

function getNamePartsFromUser(user: User) {
  const displayName = user.displayName?.trim()

  if (displayName) {
    const [firstName, ...rest] = displayName.split(/\s+/)

    return {
      firstName: firstName || 'Garten',
      lastName: rest.join(' '),
    }
  }

  const emailBase = user.email?.split('@')[0]?.trim() || 'gartenfreund'
  return {
    firstName: emailBase,
    lastName: '',
  }
}

function toAppUser(value: AppUser | undefined, authUser: User): AppUser {
  if (value) {
    return value
  }

  const email = authUser.email?.trim().toLowerCase() ?? ''
  const { firstName, lastName } = getNamePartsFromUser(authUser)
  const fallbackName = email.split('@')[0] || firstName || 'gartenfreund'

  return {
    id: authUser.uid,
    username: fallbackName.toLowerCase(),
    firstName,
    lastName,
    email,
    avatar: getAvatarLabel(firstName, lastName, fallbackName),
    createdAt: new Date().toISOString(),
  }
}

function upsertUserProfile(user: AppUser) {
  const remainingUsers = snapshot.users.filter((entry) => entry.id !== user.id)

  updateSnapshot({
    users: [user, ...remainingUsers],
  })
}

async function ensureUserProfile(db: Firestore, authUser: User) {
  const userRef = doc(db, 'users', authUser.uid)
  const userSnapshot = await getDoc(userRef)

  if (userSnapshot.exists()) {
    const existingUser = userSnapshot.data() as AppUser
    upsertUserProfile(existingUser)
    return existingUser
  }

  const nextUser = toAppUser(undefined, authUser)
  await setDoc(userRef, nextUser)
  upsertUserProfile(nextUser)
  return nextUser
}

function startSync() {
  if (!isBrowser() || !hasFirebaseConfig || syncStarted) {
    return
  }

  const { auth, db } = requireServices()
  syncStarted = true

  function stopDataSync() {
    dataCleanupCallbacks.forEach((cleanup) => cleanup())
    dataCleanupCallbacks = []
    resetCollectionState()
  }

  function startDataSync() {
    if (dataCleanupCallbacks.length > 0) {
      return
    }

    setStoreError(null)

    dataCleanupCallbacks = [
      onSnapshot(
        collection(db, 'users'),
        (usersSnapshot) => {
          updateSnapshot({
            users: usersSnapshot.docs.map((entry) => entry.data() as AppUser),
          })
          markLoaded('users')
        },
        (error) => {
          markLoaded('users')
          setStoreError(toFriendlyError(error).message)
        },
      ),
      onSnapshot(
        collection(db, 'groups'),
        (groupsSnapshot) => {
          updateSnapshot({
            groups: groupsSnapshot.docs.map((entry) => entry.data() as GardenGroup),
          })
          markLoaded('groups')
        },
        (error) => {
          updateSnapshot({
            groups: [],
          })
          markLoaded('groups')
          setStoreError(toFriendlyError(error).message)
        },
      ),
      onSnapshot(
        collection(db, 'groupMembers'),
        (membershipsSnapshot) => {
          updateSnapshot({
            groupMembers: membershipsSnapshot.docs.map((entry) => entry.data() as GroupMember),
          })
          markLoaded('groupMembers')
        },
        (error) => {
          updateSnapshot({
            groupMembers: [],
          })
          markLoaded('groupMembers')
          setStoreError(toFriendlyError(error).message)
        },
      ),
      onSnapshot(
        collection(db, 'todos'),
        (todosSnapshot) => {
          updateSnapshot({
            todos: todosSnapshot.docs.map((entry) => entry.data() as TodoItem),
          })
          markLoaded('todos')
        },
        (error) => {
          updateSnapshot({
            todos: [],
          })
          markLoaded('todos')
          setStoreError(toFriendlyError(error).message)
        },
      ),
    ]
  }

  authCleanup = onAuthStateChanged(
    auth,
    (user) => {
      setStoreError(null)

      if (user) {
        upsertUserProfile(toAppUser(snapshot.users.find((entry) => entry.id === user.uid), user))
        startDataSync()
      } else {
        stopDataSync()
        updateSnapshot({
          users: [],
          groups: [],
          groupMembers: [],
          todos: [],
        })
      }

      updateSnapshot({
        currentUserId: user?.uid ?? null,
      })
      markLoaded('auth')
    },
    (error) => {
      setStoreError(toFriendlyError(error).message)
      markLoaded('auth')
    },
  )
}

async function ensureMembership(db: Firestore, groupId: string, userId: string) {
  const membershipId = buildMembershipId(groupId, userId)
  const membershipSnapshot = await getDoc(doc(db, 'groupMembers', membershipId))

  if (!membershipSnapshot.exists()) {
    throw new Error('Du bist kein Mitglied dieser Gruppe.')
  }
}

async function getGroupByInviteCodeFromServer(db: Firestore, inviteCode: string) {
  const normalizedCode = inviteCode.trim().toLowerCase()

  const groupsSnapshot = await getDocs(
    query(collection(db, 'groups'), where('inviteCode', '==', normalizedCode), limit(1)),
  )

  if (groupsSnapshot.empty) {
    return null
  }

  return groupsSnapshot.docs[0].data() as GardenGroup
}

async function createUniqueInviteCode(db: Firestore) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inviteCode = generateInviteCode().toLowerCase()
    const existingGroup = await getGroupByInviteCodeFromServer(db, inviteCode)

    if (!existingGroup) {
      return inviteCode
    }
  }

  throw new Error('Es konnte kein eindeutiger Invite-Code erzeugt werden.')
}

function requireCurrentFirebaseUser() {
  const { auth } = requireServices()

  if (!auth.currentUser) {
    throw new Error('Bitte melde dich zuerst an.')
  }

  return auth.currentUser
}

async function createPhotoUrl(
  storage: FirebaseStorage,
  groupId: string,
  todoId: string,
  photo: string | null,
) {
  if (!photo) {
    return null
  }

  const photoRef = ref(storage, `groups/${groupId}/todos/${todoId}/photo`)
  await uploadString(photoRef, photo, 'data_url')
  return getDownloadURL(photoRef)
}

export function getSnapshot() {
  startSync()
  return snapshot
}

export function isStoreReady() {
  if (!hasFirebaseConfig) {
    return true
  }

  if (storeError && loadState.auth) {
    return true
  }

  if (!loadState.auth) {
    return false
  }

  if (!snapshot.currentUserId) {
    return true
  }

  return (
    loadState.users &&
    loadState.groups &&
    loadState.groupMembers &&
    loadState.todos
  )
}

export function subscribe(listener: () => void) {
  startSync()
  listeners.add(listener)

  return () => {
    listeners.delete(listener)

    if (listeners.size === 0) {
      authCleanup?.()
      authCleanup = null
      dataCleanupCallbacks.forEach((cleanup) => cleanup())
      dataCleanupCallbacks = []
      syncStarted = false
      loadState = { ...initialLoadState }
      snapshot = EMPTY_STATE
      storeError = null
    }
  }
}

export function getStoreError() {
  return storeError
}

export async function registerUser(payload: RegisterPayload) {
  const email = payload.email.trim().toLowerCase()
  const username = payload.username.trim().toLowerCase()
  const firstName = payload.firstName.trim()
  const lastName = payload.lastName.trim()
  const password = payload.password.trim()

  if (!email || !username || !firstName || !lastName || !password) {
    throw new Error('Bitte fuelle alle Felder aus.')
  }

  const { auth, db } = requireServices()

  try {
    const usersWithUsername = await getDocs(
      query(collection(db, 'users'), where('username', '==', username), limit(1)),
    )

    if (!usersWithUsername.empty) {
      throw new Error('Dieser Username ist bereits vergeben.')
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password)
    const user: AppUser = {
      id: credential.user.uid,
      username,
      firstName,
      lastName,
      email,
      avatar: getAvatarLabel(firstName, lastName, username),
      createdAt: new Date().toISOString(),
    }

    try {
      await setDoc(doc(db, 'users', user.id), user)
    } catch (error) {
      await deleteUser(credential.user).catch(() => undefined)
      throw error
    }

    return user
  } catch (error) {
    throw toFriendlyError(error)
  }
}

export async function login(payload: LoginPayload) {
  const email = payload.email.trim().toLowerCase()
  const password = payload.password.trim()

  if (!email || !password) {
    throw new Error('Bitte gib E-Mail und Passwort ein.')
  }

  const { auth, db } = requireServices()

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return ensureUserProfile(db, credential.user)
  } catch (error) {
    throw toFriendlyError(error)
  }
}

export async function loginWithGoogle() {
  const { auth, db } = requireServices()

  try {
    const credential = await signInWithPopup(auth, googleProvider)
    return ensureUserProfile(db, credential.user)
  } catch (error) {
    throw toFriendlyError(error)
  }
}

export async function logout() {
  const { auth } = requireServices()
  await signOut(auth)
}

export async function createGroup(payload: CreateGroupPayload) {
  const name = payload.name.trim()

  if (!name) {
    throw new Error('Bitte gib deiner Gruppe einen Namen.')
  }

  const authUser = requireCurrentFirebaseUser()
  const { db } = requireServices()
  const groupId = generateId()
  const inviteCode = await createUniqueInviteCode(db)
  const group: GardenGroup = {
    id: groupId,
    name,
    owner: authUser.uid,
    inviteCode,
    createdAt: new Date().toISOString(),
  }

  const membership: GroupMember = {
    groupId,
    userId: authUser.uid,
    role: 'owner',
    joinedAt: new Date().toISOString(),
  }

  const batch = writeBatch(db)
  batch.set(doc(db, 'groups', group.id), group)
  batch.set(doc(db, 'groupMembers', buildMembershipId(group.id, authUser.uid)), membership)
  await batch.commit()

  return group
}

export async function joinGroupByInviteCode(inviteCode: string) {
  const authUser = requireCurrentFirebaseUser()
  const { db } = requireServices()
  const group = await getGroupByInviteCodeFromServer(db, inviteCode)

  if (!group) {
    throw new Error('Der Einladungslink ist nicht mehr gueltig.')
  }

  const membershipId = buildMembershipId(group.id, authUser.uid)
  const membershipRef = doc(db, 'groupMembers', membershipId)
  const membershipSnapshot = await getDoc(membershipRef)

  if (!membershipSnapshot.exists()) {
    await setDoc(membershipRef, {
      groupId: group.id,
      userId: authUser.uid,
      role: 'member',
      joinedAt: new Date().toISOString(),
    } satisfies GroupMember)
  }

  return group
}

export async function createTodo(payload: CreateTodoPayload) {
  const title = payload.title.trim()
  const description = payload.description.trim()

  if (!title) {
    throw new Error('Bitte gib der Aufgabe einen Titel.')
  }

  const authUser = requireCurrentFirebaseUser()
  const { db, storage } = requireServices()
  await ensureMembership(db, payload.groupId, authUser.uid)

  const todoId = generateId()
  const photoUrl = await createPhotoUrl(storage, payload.groupId, todoId, payload.photo)
  const todo: TodoItem = {
    id: todoId,
    groupId: payload.groupId,
    title,
    description,
    photo: photoUrl,
    done: false,
    createdBy: authUser.uid,
    createdAt: new Date().toISOString(),
  }

  await setDoc(doc(db, 'todos', todo.id), todo)
  return todo
}

export async function toggleTodo(todoId: string) {
  const authUser = requireCurrentFirebaseUser()
  const { db } = requireServices()
  const todoSnapshot = await getDoc(doc(db, 'todos', todoId))

  if (!todoSnapshot.exists()) {
    throw new Error('Diese Aufgabe wurde nicht gefunden.')
  }

  const todo = todoSnapshot.data() as TodoItem
  await ensureMembership(db, todo.groupId, authUser.uid)
  await updateDoc(doc(db, 'todos', todoId), {
    done: !todo.done,
  })

  return {
    ...todo,
    done: !todo.done,
  } satisfies TodoItem
}
