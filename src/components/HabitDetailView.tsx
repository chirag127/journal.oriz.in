/**
 * HabitDetailView — single-habit page: header + heatmap + streak.
 */
import { useEffect, useState } from 'react'
import AuthGate from './AuthGate'
import HabitHeatmap from './HabitHeatmap'
import {
  type Checkin,
  deleteHabit,
  getHabit,
  getHabitStreak,
  type Habit,
  listCheckins,
  toggleCheckin,
  habitTodayIso,
} from '~/lib/habitsDb'

interface InnerProps {
  uid: string
  habitId: string
}

function Inner({ uid, habitId }: InnerProps) {
  const [habit, setHabit] = useState<Habit | null>(null)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const today = habitTodayIso()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [h, c] = await Promise.all([getHabit(uid, habitId), listCheckins(uid, habitId)])
        if (!cancelled) {
          setHabit(h)
          setCheckins(c)
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message)
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [uid, habitId])

  const todayDone = checkins.find((c) => c.date === today)?.completed ?? false

  const toggleToday = async () => {
    setBusy(true)
    try {
      const next = await toggleCheckin(uid, habitId, today)
      setCheckins((cur) => {
        const without = cur.filter((c) => c.date !== today)
        return [...without, { date: today, completed: next, ts: Date.now() }]
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!confirm('Delete this habit and every check-in? This cannot be undone.')) return
    setBusy(true)
    try {
      await deleteHabit(uid, habitId)
      window.location.assign('/habits')
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  if (loading) return <p className="hd-loading">Loading…</p>
  if (error) return <p className="hd-err">{error}</p>
  if (!habit) {
    return (
      <p className="hd-err">
        Habit not found.{' '}
        <a href="/habits" className="hd-back">
          back to habits
        </a>
      </p>
    )
  }

  const { current, longest } = getHabitStreak(checkins)
  const totalDone = checkins.filter((c) => c.completed).length

  return (
    <div className="hd">
      <header className="hd-head">
        <span className="hd-emoji" aria-hidden="true">
          {habit.emoji}
        </span>
        <h1 className="hd-name">{habit.name}</h1>
      </header>

      <div className="hd-stats">
        <div className="hd-stat">
          <span className="hd-stat-val">{current}</span>
          <span className="hd-stat-lbl">current streak</span>
        </div>
        <div className="hd-stat">
          <span className="hd-stat-val">{longest}</span>
          <span className="hd-stat-lbl">longest streak</span>
        </div>
        <div className="hd-stat">
          <span className="hd-stat-val">{totalDone}</span>
          <span className="hd-stat-lbl">total checkins</span>
        </div>
      </div>

      <div className="hd-today">
        <button
          type="button"
          className="hd-toggle"
          onClick={toggleToday}
          disabled={busy}
          style={{
            background: todayDone ? habit.color : 'transparent',
            borderColor: habit.color,
            color: todayDone ? 'var(--page-cream)' : habit.color,
          }}
        >
          {todayDone ? '✓ done today' : 'mark done today'}
        </button>
      </div>

      <section className="hd-heatmap-wrap">
        <h2 className="hd-h2">last 365 days</h2>
        <HabitHeatmap checkins={checkins} color={habit.color} />
      </section>

      <footer className="hd-foot">
        <a href="/habits" className="hd-back">
          ← all habits
        </a>
        <button type="button" className="hd-del" onClick={remove} disabled={busy}>
          delete habit
        </button>
      </footer>

      <style>{`
        .hd { font-family: var(--font-body); display: flex; flex-direction: column; gap: 1.5rem; }
        .hd-head { display: flex; align-items: center; gap: 0.75rem; }
        .hd-emoji { font-size: 2rem; }
        .hd-name { margin: 0; font-family: var(--font-display); font-size: clamp(1.625rem, 4vw, 2rem); font-weight: 600; letter-spacing: -0.01em; color: var(--page-cream); }
        @media (prefers-color-scheme: light) { .hd-name { color: var(--ink, #1a1a22); } }
        .hd-stats { display: flex; gap: 2rem; padding: 0.75rem 0; border-block: 1px solid var(--rule); }
        .hd-stat { display: flex; flex-direction: column; }
        .hd-stat-val { font-family: var(--font-display); font-size: 1.75rem; font-weight: 600; color: var(--page-cream); }
        @media (prefers-color-scheme: light) { .hd-stat-val { color: var(--ink, #1a1a22); } }
        .hd-stat-lbl { font-family: var(--font-sans); font-size: 12px; color: var(--graphite); letter-spacing: 0.04em; }
        .hd-today { display: flex; }
        .hd-toggle { border: 1.5px solid; padding: 0.5rem 1rem; font: inherit; cursor: pointer; letter-spacing: 0.02em; }
        .hd-toggle:disabled { opacity: 0.5; cursor: wait; }
        .hd-h2 { font-family: var(--font-display); font-style: italic; font-size: 1.0625rem; color: var(--graphite); margin: 0 0 0.5rem; }
        .hd-heatmap-wrap { display: flex; flex-direction: column; gap: 0.25rem; }
        .hd-foot { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--rule); }
        .hd-back { color: var(--graphite); text-decoration: none; font-family: var(--font-sans); font-size: 13px; }
        .hd-back:hover { color: var(--seal-red); }
        .hd-del { background: transparent; border: 0; color: var(--graphite); font: inherit; font-size: 13px; cursor: pointer; font-family: var(--font-sans); text-decoration: underline; text-underline-offset: 3px; }
        .hd-del:hover { color: var(--seal-red); }
        .hd-loading, .hd-err { color: var(--graphite); padding: 2rem 0; }
        .hd-err { color: var(--seal-red); }
      `}</style>
    </div>
  )
}

export default function HabitDetailView() {
  return (
    <AuthGate>
      {(uid) => {
        const m = window.location.pathname.match(/^\/habits\/([^/]+)/)
        const id = m ? decodeURIComponent(m[1]) : ''
        return <Inner uid={uid} habitId={id} />
      }}
    </AuthGate>
  )
}
