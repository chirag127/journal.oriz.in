/**
 * HabitHeatmap — 365-day completion grid for a single habit.
 *
 * GitHub-style 7×53 SVG grid. Recharts is already in the app, but for a
 * calendar heatmap, hand-rolled SVG is both lighter and more legible (every
 * Recharts heatmap example hand-rolls SVG anyway). Cells lighten/darken based
 * on whether that calendar day has a completed checkin.
 *
 * Width is responsive: cells scale to fill the container.
 */
import { useMemo } from 'react'
import type { Checkin } from '~/lib/habitsDb'

interface Props {
  checkins: Checkin[]
  color?: string
  /** End date — defaults to today. */
  endDate?: Date
}

const CELL = 11
const GAP = 2
const COLS = 53
const ROWS = 7

function iso(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function HabitHeatmap({ checkins, color = '#b94a3a', endDate }: Props) {
  const end = endDate ?? new Date()

  const { cells, monthLabels } = useMemo(() => {
    const done = new Set(checkins.filter((c) => c.completed).map((c) => c.date))
    // Start from the Sunday at-or-before (end - 364 days)
    const start = new Date(end)
    start.setDate(start.getDate() - 364)
    start.setDate(start.getDate() - start.getDay()) // snap back to Sunday

    const cells: { x: number; y: number; date: string; done: boolean }[] = []
    const monthLabels: { x: number; label: string }[] = []
    let lastMonth = -1
    const cursor = new Date(start)
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        if (cursor > end) break
        const date = iso(cursor)
        cells.push({
          x: col * (CELL + GAP),
          y: row * (CELL + GAP),
          date,
          done: done.has(date),
        })
        if (row === 0) {
          const m = cursor.getMonth()
          if (m !== lastMonth) {
            monthLabels.push({
              x: col * (CELL + GAP),
              label: cursor.toLocaleString('en', { month: 'short' }).toLowerCase(),
            })
            lastMonth = m
          }
        }
        cursor.setDate(cursor.getDate() + 1)
      }
    }
    return { cells, monthLabels }
  }, [checkins, end])

  const width = COLS * (CELL + GAP)
  const height = ROWS * (CELL + GAP) + 14 // + month-label band

  return (
    <div className="hm">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="365-day completion heatmap"
        className="hm-svg"
      >
        {monthLabels.map((m) => (
          <text key={`${m.x}-${m.label}`} x={m.x} y={height - 2} className="hm-month">
            {m.label}
          </text>
        ))}
        {cells.map((c) => (
          <rect
            key={c.date}
            x={c.x}
            y={c.y}
            width={CELL}
            height={CELL}
            rx={1.5}
            ry={1.5}
            fill={c.done ? color : 'var(--hm-empty, rgba(255,255,255,0.06))'}
          >
            <title>
              {c.date} — {c.done ? 'done' : '·'}
            </title>
          </rect>
        ))}
      </svg>
      <style>{`
        .hm { width: 100%; overflow-x: auto; }
        .hm-svg { width: 100%; max-width: ${width}px; height: auto; display: block; }
        .hm-month { font-family: var(--font-sans); font-size: 9px; fill: var(--graphite); }
        @media (prefers-color-scheme: light) {
          :root { --hm-empty: rgba(0, 0, 0, 0.06); }
        }
      `}</style>
    </div>
  )
}
