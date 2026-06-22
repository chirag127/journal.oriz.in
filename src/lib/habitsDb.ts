/**
 * Firestore data access for the habit tracker.
 *
 * Schema:
 *   users/{uid}/habits/{habitId}                         — { name (E2EE), emoji (E2EE), color, schedule, createdAt }
 *   users/{uid}/habits/{habitId}/checkins/{YYYY-MM-DD}   — { completed: true, ts }
 *
 * The habit `name` and `emoji` fields are stored as ciphertext blobs when a
 * session key is present (see `~/lib/crypto.ts`). Booleans on checkins are not
 * sensitive enough to warrant encryption — they leak only "user did *something*
 * on this date", which the journal entries collection already does.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore'
import { decrypt, encrypt, getSessionKey } from './crypto'
import { db } from './firebase'

export type HabitSchedule =
  | { kind: 'daily' }
  | { kind: 'weekly'; count: number } // N times per week
  | { kind: 'specific-days'; days: number[] } // 0=Sun..6=Sat

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string // hex
  schedule: HabitSchedule
  createdAt: number
  updatedAt: number
}

interface HabitDoc {
  // E2EE blobs — when session key is set
  nameCipher?: string
  nameNonce?: string
  emojiCipher?: string
  emojiNonce?: string
  // Plaintext fallback (anonymous users / no key yet)
  name?: string
  emoji?: string
  color: string
  schedule: HabitSchedule
  createdAt: number
  updatedAt: number
}

export interface Checkin {
  date: string // YYYY-MM-DD
  completed: boolean
  ts: number
}

const userPath = (uid: string) => `users/${uid}`
const habitsPath = (uid: string) => `${userPath(uid)}/habits`
const checkinsPath = (uid: string, habitId: string) => `${habitsPath(uid)}/${habitId}/checkins`

export function newHabitId() {
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export const habitTodayIso = () => new Date().toISOString().slice(0, 10)

async function encryptField(plain: string): Promise<{ cipher?: string; nonce?: string; plain?: string }> {
  const key = getSessionKey()
  if (!key) return { plain }
  const { ciphertext, nonce } = await encrypt(plain, key)
  return { cipher: ciphertext, nonce }
}

async function decryptField(d: {
  cipher?: string
  nonce?: string
  plain?: string
}): Promise<string> {
  if (d.plain !== undefined) return d.plain
  if (!d.cipher || !d.nonce) return ''
  const key = getSessionKey()
  if (!key) return '••••' // marginalia placeholder when locked
  try {
    return await decrypt(d.cipher, d.nonce, key)
  } catch {
    return '••••'
  }
}

function toDoc(h: Habit, enc: {
  name: { cipher?: string; nonce?: string; plain?: string }
  emoji: { cipher?: string; nonce?: string; plain?: string }
}): HabitDoc {
  const doc: HabitDoc = {
    color: h.color,
    schedule: h.schedule,
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  }
  if (enc.name.cipher) {
    doc.nameCipher = enc.name.cipher
    doc.nameNonce = enc.name.nonce
  } else if (enc.name.plain !== undefined) {
    doc.name = enc.name.plain
  }
  if (enc.emoji.cipher) {
    doc.emojiCipher = enc.emoji.cipher
    doc.emojiNonce = enc.emoji.nonce
  } else if (enc.emoji.plain !== undefined) {
    doc.emoji = enc.emoji.plain
  }
  return doc
}

async function fromDoc(id: string, d: HabitDoc): Promise<Habit> {
  const name = await decryptField({ cipher: d.nameCipher, nonce: d.nameNonce, plain: d.name })
  const emoji = await decryptField({ cipher: d.emojiCipher, nonce: d.emojiNonce, plain: d.emoji })
  return {
    id,
    name,
    emoji,
    color: d.color,
    schedule: d.schedule,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }
}

// ---------- Habits CRUD ----------
export async function listHabits(uid: string): Promise<Habit[]> {
  const snap = await getDocs(collection(db, habitsPath(uid)))
  const habits = await Promise.all(
    snap.docs.map((d) => fromDoc(d.id, d.data() as HabitDoc)),
  )
  return habits.sort((a, b) => a.createdAt - b.createdAt)
}

export async function getHabit(uid: string, habitId: string): Promise<Habit | null> {
  const snap = await getDoc(doc(db, `${habitsPath(uid)}/${habitId}`))
  if (!snap.exists()) return null
  return fromDoc(snap.id, snap.data() as HabitDoc)
}

export async function createHabit(
  uid: string,
  input: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Habit> {
  const id = newHabitId()
  const now = Date.now()
  const habit: Habit = { id, ...input, createdAt: now, updatedAt: now }
  const enc = {
    name: await encryptField(habit.name),
    emoji: await encryptField(habit.emoji),
  }
  await setDoc(doc(db, `${habitsPath(uid)}/${id}`), toDoc(habit, enc))
  return habit
}

export async function updateHabit(uid: string, habit: Habit): Promise<void> {
  const enc = {
    name: await encryptField(habit.name),
    emoji: await encryptField(habit.emoji),
  }
  const next: Habit = { ...habit, updatedAt: Date.now() }
  await setDoc(doc(db, `${habitsPath(uid)}/${habit.id}`), toDoc(next, enc), { merge: true })
}

export async function deleteHabit(uid: string, habitId: string): Promise<void> {
  // Best-effort: delete checkins first, then the habit doc. Firestore has no
  // recursive delete from client SDK, so the loop is fine for typical N<5000.
  const snap = await getDocs(collection(db, checkinsPath(uid, habitId)))
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  await deleteDoc(doc(db, `${habitsPath(uid)}/${habitId}`))
}

// ---------- Checkins ----------
export async function listCheckins(uid: string, habitId: string): Promise<Checkin[]> {
  const snap = await getDocs(collection(db, checkinsPath(uid, habitId)))
  return snap.docs.map((d) => ({
    date: d.id,
    completed: (d.data().completed as boolean) ?? false,
    ts: (d.data().ts as number) ?? 0,
  }))
}

export async function getCheckin(
  uid: string,
  habitId: string,
  date: string,
): Promise<Checkin | null> {
  const snap = await getDoc(doc(db, `${checkinsPath(uid, habitId)}/${date}`))
  if (!snap.exists()) return null
  return {
    date,
    completed: (snap.data().completed as boolean) ?? false,
    ts: (snap.data().ts as number) ?? 0,
  }
}

/**
 * Toggle a checkin. Idempotent: if doc exists, flip `completed`; otherwise
 * create it with `completed: true`.
 */
export async function toggleCheckin(
  uid: string,
  habitId: string,
  date: string = habitTodayIso(),
): Promise<boolean> {
  const ref = doc(db, `${checkinsPath(uid, habitId)}/${date}`)
  const cur = await getDoc(ref)
  const next = cur.exists() ? !((cur.data().completed as boolean) ?? false) : true
  await setDoc(ref, { completed: next, ts: Date.now() }, { merge: true })
  return next
}

/**
 * Compute current + longest streak from a checkin list. A streak is a run of
 * contiguous *expected* days (per the habit's schedule) all marked completed.
 * For simplicity we treat every day as expected for the daily case, and for
 * weekly/specific-days we still count contiguous calendar-day runs of
 * completed checkins (the MVP heuristic — refine later).
 */
export function getHabitStreak(checkins: Checkin[]): { current: number; longest: number } {
  const dates = new Set(checkins.filter((c) => c.completed).map((c) => c.date))
  if (dates.size === 0) return { current: 0, longest: 0 }

  const sorted = [...dates].sort()

  // current streak: contiguous days back from today (or yesterday)
  let current = 0
  const today = new Date()
  const cursor = new Date(today)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  if (!dates.has(iso(today))) cursor.setDate(cursor.getDate() - 1)
  while (dates.has(iso(cursor))) {
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  // longest streak
  let longest = 0
  let run = 0
  let prev: Date | null = null
  for (const d of sorted) {
    const dt = new Date(d)
    if (prev && dt.getTime() - prev.getTime() === 86_400_000) run += 1
    else run = 1
    if (run > longest) longest = run
    prev = dt
  }

  return { current, longest }
}

/**
 * Given a habit schedule and a date, decide whether the habit is "expected"
 * that day. Used by the today-checklist to filter visible habits.
 */
export function isExpectedOn(schedule: HabitSchedule, date: Date = new Date()): boolean {
  if (schedule.kind === 'daily') return true
  if (schedule.kind === 'specific-days') return schedule.days.includes(date.getDay())
  // 'weekly' (N times per week) — always shown; user decides which days
  return true
}
