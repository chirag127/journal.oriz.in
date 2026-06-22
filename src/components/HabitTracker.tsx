/**
 * HabitTracker — today's checklist for all of a user's habits.
 *
 * Renders the habits expected today (per their schedule) with a toggle
 * checkin. Anything not expected today is shown collapsed at the bottom.
 */
import { useEffect, useState } from 'react'
import AuthGate from './AuthGate'
import {
  getCheckin,
  habitTodayIso,
  type Habit,
  isExpectedOn,
  listHabits,
  toggleCheckin,
} from '~/lib/habitsDb'

interface RowState {
  habit: Habit
  completed: boolean
  busy: boolean
}

interface InnerProps {
  uid: string
}

function HabitTrackerInner({ uid }: InnerProps) {
  const [rows, setRows] = useState<RowState[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const today = habitTodayIso()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const habits = await listHabits(uid)
        const states = await Promise.all(
          habits.map(async (h) => ({
            habit: h,
            completed: (await getCheckin(uid, h.id, today))?.completed ?? false,
            busy: false,
          })),
        )
        if (!cancelled) setRows(states)
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [uid, today])

  const toggle = async (habitId: string) => {
    if (!rows) return
    setRows((cur) =>
      cur ? cur.map((r) => (r.habit.id === habitId ? { ...r, busy: true } : r)) : cur,
    )
    try {
      const next = await toggleCheckin(uid, habitId, today)
      setRows((cur) =>
        cur
          ? cur.map((r) => (r.habit.id === habitId ? { ...r, completed: next, busy: false } : r))
          : cur,
      )
    } catch (e) {
      setError((e as Error).message)
      setRows((cur) =>
        cur ? cur.map((r) => (r.habit.id === habitId ? { ...r, busy: false } : r)) : cur,
      )
    }
  }

  if (rows === null && !error) return <p className="ht-loading">Loading…</p>
  if (error) return <p className="ht-err">{error}</p>
  if (!rows || rows.length === 0) {
    return (
      <div className="ht-empty">
        <p>No habits yet. Start tracking something small — daily writing, water, a walk.</p>
        <p>
          <a href="/habits/new" className="ht-cta">
            + new habit
          </a>
        </p>
        <style>{`
          .ht-empty { color: var(--graphite); padding: 2rem 0; font-family: var(--font-body); }
          .ht-empty p { margin: 0 0 0.75rem; }
          .ht-cta { color: var(--seal-red); text-decoration: none; border-bottom: 1px solid var(--seal-red); padding-bottom: 1px; }
        `}</style>
      </div>
    )
  }

  const now = new Date()
  const todayRows = rows.filter((r) => isExpectedOn(r.habit.schedule, now))
  const otherRows = rows.filter((r) => !isExpectedOn(r.habit.schedule, now))
  const doneCount = todayRows.filter((r) => r.completed).length

  return (
    <div className="ht">
      <header className="ht-head">
        <span className="ht-date">{today}</span>
        <span className="ht-progress">
          {doneCount} / {todayRows.length}
        </span>
      </header>
      <ul className="ht-list">
        {todayRows.map((r) => (
          <HabitRow key={r.habit.id} row={r} onToggle={() => toggle(r.habit.id)} />
        ))}
      </ul>
      {otherRows.length > 0 && (
        <details className="ht-other">
          <summary>not scheduled today ({otherRows.length})</summary>
          <ul className="ht-list">
            {otherRows.map((r) => (
              <HabitRow key={r.habit.id} row={r} onToggle={() => toggle(r.habit.id)} muted />
            ))}
          </ul>
        </details>
      )}
      <style>{`
        .ht { font-family: var(--font-body); }
        .ht-head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule); margin-bottom: 0.75rem; }
        .ht-date { font-family: var(--font-mono); font-size: 13px; color: var(--graphite); }
        .ht-progress { font-family: var(--font-display); font-style: italic; color: var(--graphite); }
        .ht-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; }
        .ht-other { margin-top: 1.5rem; }
        .ht-other summary { font-family: var(--font-sans); font-size: 13px; color: var(--graphite); cursor: pointer; padding: 0.5rem 0; letter-spacing: 0.04em; }
        .ht-loading, .ht-err { color: var(--graphite); padding: 2rem 0; font-family: var(--font-body); }
        .ht-err { color: var(--seal-red); }
      `}</style>
    </div>
  )
}

function HabitRow({
  row,
  onToggle,
  muted = false,
}: {
  row: RowState
  onToggle: () => void
  muted?: boolean
}) {
  const { habit, completed, busy } = row
  return (
    <li className={`hr${completed ? ' done' : ''}${muted ? ' muted' : ''}`}>
      <button
        type="button"
        className="hr-check"
        onClick={onToggle}
        disabled={busy}
        aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
        style={{ borderColor: habit.color, background: completed ? habit.color : 'transparent' }}
      >
        {completed ? '✓' : ''}
      </button>
      <span className="hr-emoji" aria-hidden="true">
        {habit.emoji}
      </span>
      <a href={`/habits/${habit.id}`} className="hr-name">
        {habit.name}
      </a>
      <span className="hr-sched">{describeSchedule(habit.schedule)}</span>
      <style>{`
        .hr { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--rule); }
        .hr.done .hr-name { text-decoration: line-through; color: var(--graphite); }
        .hr.muted { opacity: 0.6; }
        .hr-check { width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 1.5px solid; background: transparent; color: var(--page-cream); cursor: pointer; font-size: 14px; line-height: 1; padding: 0; flex-shrink: 0; }
        .hr-check:disabled { opacity: 0.5; cursor: wait; }
        .hr-emoji { font-size: 1.125rem; width: 1.5rem; text-align: center; }
        .hr-name { color: var(--page-cream); text-decoration: none; flex: 1; font-size: 1rem; }
        @media (prefers-color-scheme: light) { .hr-name { color: var(--ink, #1a1a22); } }
        .hr-name:hover { color: var(--seal-red); }
        .hr-sched { color: var(--graphite); font-size: 13px; font-family: var(--font-sans); }
      `}</style>
    </li>
  )
}

function describeSchedule(s: Habit['schedule']): string {
  if (s.kind === 'daily') return 'daily'
  if (s.kind === 'weekly') return `${s.count}× / week`
  const names = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa']
  return s.days.map((d) => names[d]).join(' ')
}

export default function HabitTracker() {
  return <AuthGate>{(uid) => <HabitTrackerInner uid={uid} />}</AuthGate>
}
