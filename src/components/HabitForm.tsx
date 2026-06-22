/**
 * HabitForm — create / edit a habit.
 *
 * Inputs: name, emoji, color, schedule (daily / weekly count / specific days).
 * Names + emoji are encrypted at the data layer (habitsDb.ts).
 */
import { useState } from 'react'
import { createHabit, type Habit, type HabitSchedule, updateHabit } from '~/lib/habitsDb'

interface Props {
  uid: string
  initial?: Habit
  onSaved?: (habit: Habit) => void
  onCancel?: () => void
}

const PRESET_COLORS = [
  '#b94a3a', // seal red
  '#c79454', // ochre
  '#5c7a4f', // moss
  '#4a6a7d', // dusk blue
  '#8a5a8a', // mauve
  '#6e6e6e', // graphite
]

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function HabitForm({ uid, initial, onSaved, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '✦')
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0])
  const [scheduleKind, setScheduleKind] = useState<HabitSchedule['kind']>(
    initial?.schedule.kind ?? 'daily',
  )
  const [weeklyCount, setWeeklyCount] = useState<number>(
    initial?.schedule.kind === 'weekly' ? initial.schedule.count : 3,
  )
  const [specificDays, setSpecificDays] = useState<number[]>(
    initial?.schedule.kind === 'specific-days' ? initial.schedule.days : [1, 2, 3, 4, 5],
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleDay = (d: number) =>
    setSpecificDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()))

  const submit = async () => {
    setError(null)
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    const schedule: HabitSchedule =
      scheduleKind === 'daily'
        ? { kind: 'daily' }
        : scheduleKind === 'weekly'
          ? { kind: 'weekly', count: Math.max(1, Math.min(7, weeklyCount)) }
          : { kind: 'specific-days', days: specificDays.length ? specificDays : [1, 2, 3, 4, 5] }
    setBusy(true)
    try {
      if (initial) {
        const next: Habit = { ...initial, name: name.trim(), emoji, color, schedule }
        await updateHabit(uid, next)
        onSaved?.(next)
      } else {
        const created = await createHabit(uid, { name: name.trim(), emoji, color, schedule })
        onSaved?.(created)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="hf">
      <label className="hf-field">
        <span className="hf-label">Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Morning pages, 10k steps, drink water…"
          maxLength={120}
        />
      </label>

      <div className="hf-row">
        <label className="hf-field">
          <span className="hf-label">Emoji</span>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
            className="hf-emoji"
            maxLength={4}
          />
        </label>
        <div className="hf-field">
          <span className="hf-label">Color</span>
          <div className="hf-swatches">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`hf-swatch${c === color ? ' on' : ''}`}
                style={{ background: c }}
                aria-label={`Use color ${c}`}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="hf-field">
        <span className="hf-label">Schedule</span>
        <div className="hf-sched">
          <label>
            <input
              type="radio"
              name="sched"
              checked={scheduleKind === 'daily'}
              onChange={() => setScheduleKind('daily')}
            />
            Daily
          </label>
          <label>
            <input
              type="radio"
              name="sched"
              checked={scheduleKind === 'weekly'}
              onChange={() => setScheduleKind('weekly')}
            />
            <input
              type="number"
              min={1}
              max={7}
              value={weeklyCount}
              onChange={(e) => setWeeklyCount(Number(e.target.value))}
              disabled={scheduleKind !== 'weekly'}
              className="hf-weekly-num"
            />{' '}
            × per week
          </label>
          <label>
            <input
              type="radio"
              name="sched"
              checked={scheduleKind === 'specific-days'}
              onChange={() => setScheduleKind('specific-days')}
            />
            Specific days
          </label>
        </div>
        {scheduleKind === 'specific-days' && (
          <div className="hf-days">
            {DAY_LABELS.map((lbl, i) => (
              <button
                key={i}
                type="button"
                className={`hf-day${specificDays.includes(i) ? ' on' : ''}`}
                onClick={() => toggleDay(i)}
              >
                {lbl}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="hf-err">{error}</p>}

      <div className="hf-actions">
        <button type="button" className="hf-save" onClick={submit} disabled={busy}>
          {busy ? 'saving…' : initial ? 'save changes' : 'create habit'}
        </button>
        {onCancel && (
          <button type="button" className="hf-cancel" onClick={onCancel}>
            cancel
          </button>
        )}
      </div>

      <style>{`
        .hf { display: flex; flex-direction: column; gap: 1rem; max-width: 36rem; font-family: var(--font-body); }
        .hf-field { display: flex; flex-direction: column; gap: 0.375rem; }
        .hf-label { font-size: 13px; color: var(--graphite); font-family: var(--font-sans); letter-spacing: 0.04em; text-transform: lowercase; }
        .hf input[type="text"], .hf input[type="number"] {
          background: transparent;
          border: 0;
          border-bottom: 1px solid var(--rule);
          padding: 0.375rem 0;
          color: var(--page-cream);
          font: inherit;
          font-size: 1rem;
        }
        @media (prefers-color-scheme: light) {
          .hf input[type="text"], .hf input[type="number"] { color: var(--ink, #1a1a22); }
        }
        .hf input:focus { outline: none; border-bottom-color: var(--seal-red); }
        .hf-emoji { width: 5rem; font-size: 1.5rem !important; text-align: center; }
        .hf-row { display: flex; gap: 1.5rem; flex-wrap: wrap; }
        .hf-swatches { display: flex; gap: 0.5rem; padding-top: 0.25rem; }
        .hf-swatch { width: 1.75rem; height: 1.75rem; border-radius: 50%; border: 1px solid var(--rule); cursor: pointer; }
        .hf-swatch.on { box-shadow: 0 0 0 2px var(--page-cream); }
        .hf-sched { display: flex; flex-direction: column; gap: 0.5rem; color: var(--page-cream); }
        @media (prefers-color-scheme: light) { .hf-sched { color: var(--ink, #1a1a22); } }
        .hf-sched label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
        .hf-weekly-num { width: 3rem !important; text-align: center; padding: 0 0.25rem !important; }
        .hf-days { display: flex; gap: 0.375rem; padding-top: 0.5rem; }
        .hf-day {
          width: 2rem; height: 2rem; border-radius: 50%;
          border: 1px solid var(--rule); background: transparent;
          color: var(--graphite); cursor: pointer; font: inherit; font-size: 13px;
        }
        .hf-day.on { background: var(--seal-red); color: var(--page-cream); border-color: var(--seal-red); }
        .hf-err { color: var(--seal-red); font-size: 14px; margin: 0; }
        .hf-actions { display: flex; gap: 0.75rem; padding-top: 0.5rem; }
        .hf-save {
          background: var(--seal-red); color: var(--page-cream);
          border: 0; padding: 0.5rem 1rem; cursor: pointer; font: inherit;
          letter-spacing: 0.02em;
        }
        .hf-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .hf-cancel {
          background: transparent; color: var(--graphite);
          border: 1px solid var(--rule); padding: 0.5rem 1rem; cursor: pointer; font: inherit;
        }
      `}</style>
    </div>
  )
}
