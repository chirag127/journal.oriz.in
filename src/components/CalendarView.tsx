/**
 * CalendarView — v2.
 *
 * Vertical year-strip: 12 month rows × 28-31 day cells. Full year fits one
 * viewport on desktop. Empty days = `--dusk` graphite squares; days with an
 * entry = `--page-cream` fills. Streaks become visible as SHAPES — a run of
 * cream against dusk — never as numbers.
 *
 * Hover a cream day: first sentence appears as a right-margin note in
 * Inter 13px graphite. Click → entry. Mobile collapses to one month per
 * viewport, same row geometry.
 *
 * NO heatmap gradient. NO mood color. NO intensity. Binary: wrote or didn't.
 * NO "you wrote 412 words". NO streak counter ("47 days!" — forbidden).
 */
import { useEffect, useMemo, useState } from 'react'
import { listEntries } from '~/lib/journalDb'
import type { Entry } from '~/lib/types'

interface Props {
  uid: string
  /** Year to render — defaults to current year. */
  year?: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}
function isoDate(y: number, m: number, d: number) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`
}
function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate()
}

function firstSentence(body: string): string {
  if (!body) return ''
  const stripped = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*_>`-]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const m = stripped.match(/.+?[.!?](\s|$)/)
  const s = m ? m[0].trim() : stripped.slice(0, 120)
  return s.length > 120 ? s.slice(0, 120).replace(/\s+\S*$/, '') + '…' : s
}

export default function CalendarView({ uid, year: propYear }: Props) {
  const [year, setYear] = useState<number>(() => propYear ?? new Date().getFullYear())
  const [entries, setEntries] = useState<Entry[]>([])
  const [hover, setHover] = useState<{ iso: string; entry: Entry } | null>(null)

  useEffect(() => {
    listEntries(uid, { limit: 1000 }).then(setEntries)
  }, [uid])

  const byDate = useMemo(() => {
    const map: Record<string, Entry> = {}
    for (const e of entries) {
      // Pick the most recent entry per date for the margin note.
      if (!map[e.entryDate] || e.updatedAt > map[e.entryDate].updatedAt) map[e.entryDate] = e
    }
    return map
  }, [entries])

  const todayIso = new Date().toISOString().slice(0, 10)

  return (
    <div className="cal">
      <header className="cal-head">
        <button
          type="button"
          className="cal-y-btn"
          onClick={() => setYear((y) => y - 1)}
          aria-label="Previous year"
        >
          &larr;
        </button>
        <h1 className="cal-year tabular">{year}</h1>
        <button
          type="button"
          className="cal-y-btn"
          onClick={() => setYear((y) => y + 1)}
          aria-label="Next year"
        >
          &rarr;
        </button>
      </header>

      <ol className="cal-strip" aria-label={`Calendar of ${year}`}>
        {MONTHS.map((m, mi) => {
          const dim = daysInMonth(year, mi)
          return (
            <li key={m} className="cal-month">
              <span className="cal-month-label chrome">{m}</span>
              <ol className="cal-days" aria-label={`${m} ${year}`}>
                {Array.from({ length: 31 }, (_, di) => {
                  const day = di + 1
                  if (day > dim)
                    return <li key={di} className="cal-cell cal-cell-empty" aria-hidden="true" />
                  const iso = isoDate(year, mi, day)
                  const e = byDate[iso]
                  const isToday = iso === todayIso
                  if (!e) {
                    return (
                      <li key={di} className={`cal-cell ${isToday ? 'cal-cell-today' : ''}`}>
                        <span className="sr">
                          {m} {day}
                        </span>
                      </li>
                    )
                  }
                  return (
                    <li
                      key={di}
                      className={`cal-cell cal-cell-on ${isToday ? 'cal-cell-today' : ''}`}
                    >
                      <a
                        href={`/entries/${e.id}`}
                        aria-label={`${m} ${day} — ${firstSentence(e.body) || e.title || 'entry'}`}
                        onMouseEnter={() => setHover({ iso, entry: e })}
                        onFocus={() => setHover({ iso, entry: e })}
                        onMouseLeave={() => setHover((h) => (h?.iso === iso ? null : h))}
                        onBlur={() => setHover((h) => (h?.iso === iso ? null : h))}
                      >
                        <span className="sr">
                          {m} {day}
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ol>
            </li>
          )
        })}
      </ol>

      <aside className={`cal-margin ${hover ? 'cal-margin-on' : ''}`} aria-live="polite">
        {hover && (
          <p className="cal-margin-note">
            <time className="cal-margin-date tabular">{hover.iso}</time>
            <span className="cal-margin-text">
              {firstSentence(hover.entry.body) || hover.entry.title || 'Untitled'}
            </span>
          </p>
        )}
      </aside>

      <style>{`
        .cal {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          column-gap: 2rem;
          padding-bottom: 2rem;
          font-family: var(--font-sans);
        }
        @media (max-width: 900px) {
          .cal { grid-template-columns: 1fr; }
        }

        .cal-head {
          grid-column: 1 / -1;
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          margin: 0 0 1.5rem;
        }
        .cal-year {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 600;
          letter-spacing: -0.01em;
          margin: 0;
          color: var(--page-cream);
        }
        @media (prefers-color-scheme: light) {
          .cal-year { color: var(--ink, #1a1a22); }
        }
        .cal-y-btn {
          background: transparent;
          border: 0;
          color: var(--graphite);
          font-family: inherit;
          font-size: 1rem;
          cursor: pointer;
          padding: 0 0.25rem;
        }
        .cal-y-btn:hover { color: var(--seal-red); }

        .cal-strip {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cal-month {
          display: grid;
          grid-template-columns: 32px minmax(0, 1fr);
          align-items: center;
          gap: 8px;
        }
        .cal-month-label {
          font-family: var(--font-sans);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--graphite);
          font-feature-settings: 'tnum' 1;
        }
        .cal-days {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(31, 1fr);
          gap: 2px;
        }
        .cal-cell {
          aspect-ratio: 1;
          background: var(--rule);
          min-width: 0;
        }
        .cal-cell-empty { background: transparent; }
        .cal-cell-on {
          background: var(--page-cream);
        }
        .cal-cell-today {
          outline: 1px solid var(--seal-red);
          outline-offset: -1px;
        }
        .cal-cell a {
          display: block;
          width: 100%;
          height: 100%;
          background: var(--page-cream);
          text-decoration: none;
        }
        .cal-cell a:focus-visible {
          outline: 1px solid var(--seal-red);
          outline-offset: 1px;
        }
        .sr {
          position: absolute;
          width: 1px; height: 1px;
          padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0,0,0,0);
          white-space: nowrap; border: 0;
        }

        .cal-margin {
          padding-top: 2.5rem; /* line up with the strip top */
          color: var(--graphite);
          opacity: 0;
          transition: opacity 120ms ease-out;
        }
        .cal-margin-on { opacity: 1; }
        @media (max-width: 900px) {
          .cal-margin { padding-top: 1rem; min-height: 3rem; }
        }
        .cal-margin-note {
          margin: 0;
          font-family: var(--font-sans);
          font-size: 13px;
          line-height: 1.5;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .cal-margin-date {
          color: var(--graphite);
          font-size: 11px;
          letter-spacing: 0.04em;
        }
        .cal-margin-text {
          color: var(--page-cream);
        }
        @media (prefers-color-scheme: light) {
          .cal-margin-text { color: var(--ink, #1a1a22); }
        }
      `}</style>
    </div>
  )
}
