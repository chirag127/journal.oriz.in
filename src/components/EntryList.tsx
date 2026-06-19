/**
 * EntryList — v2.
 *
 * Single 720px column. Each entry is one line: date + first sentence +
 * 8-char ciphertext fingerprint right-aligned. Click → entry. NO card grid.
 * NO mood/type/tag filter rows by default — only the showFilters surface
 * exposes a thin filter at top, in graphite chrome.
 *
 * Used by /entries, /favorites, /pinned, /tags/[tag].
 */
import { useEffect, useMemo, useState } from 'react'
import { fingerprintSync } from '~/lib/fingerprint'
import { listEntries } from '~/lib/journalDb'
import type { Entry, JournalType, Mood } from '~/lib/types'
import { JOURNAL_TYPES, MOODS } from '~/lib/types'

interface Props {
  uid: string
  filter?: { favorite?: boolean; pinned?: boolean; tag?: string; journalType?: JournalType }
  emptyHint?: string
  showFilters?: boolean
}

function firstSentence(body: string): string {
  if (!body) return ''
  const stripped = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*_>`-]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const m = stripped.match(/.+?[.!?](\s|$)/)
  const s = m ? m[0].trim() : stripped.slice(0, 140)
  return s.length > 140 ? s.slice(0, 140).replace(/\s+\S*$/, '') + '…' : s
}

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

export default function EntryList({ uid, filter, emptyHint, showFilters }: Props) {
  const [all, setAll] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [moodFilter, setMoodFilter] = useState<Mood | ''>('')
  const [typeFilter, setTypeFilter] = useState<JournalType | ''>('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listEntries(uid, { ...filter, limit: 500 }).then((rows) => {
      if (!cancelled) {
        setAll(rows)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, JSON.stringify(filter)])

  const filtered = useMemo(() => {
    return all.filter(
      (e) =>
        (!moodFilter || e.mood === moodFilter) && (!typeFilter || e.journalType === typeFilter),
    )
  }, [all, moodFilter, typeFilter])

  // Group by year for the heading rules.
  const grouped = useMemo(() => {
    const m = new Map<string, Entry[]>()
    for (const e of filtered) {
      const y = e.entryDate.slice(0, 4)
      if (!m.has(y)) m.set(y, [])
      m.get(y)!.push(e)
    }
    return [...m.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [filtered])

  if (loading) return <p className="el-loading chrome">Loading entries…</p>

  return (
    <div className="el">
      {showFilters && (
        <div className="el-filters chrome">
          <select value={moodFilter} onChange={(e) => setMoodFilter(e.target.value as Mood | '')}>
            <option value="">all moods</option>
            {MOODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label.toLowerCase()}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as JournalType | '')}
          >
            <option value="">all types</option>
            {JOURNAL_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label.toLowerCase()}
              </option>
            ))}
          </select>
          <span className="el-count tabular">
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="el-empty">
          {emptyHint ?? 'No entries yet. '}
          <a href="/entries/new">+ new entry</a>
        </p>
      ) : (
        grouped.map(([year, rows]) => (
          <section key={year} className="el-year">
            <h2 className="el-year-h tabular">{year}</h2>
            <ul className="el-list">
              {rows.map((e) => {
                const fp = fingerprintSync(e.body || e.title || e.id)
                return (
                  <li key={e.id}>
                    <a className="el-row" href={`/entries/${e.id}`}>
                      <time className="el-date tabular">{fmtDate(e.entryDate)}</time>
                      <span className="el-text">
                        {firstSentence(e.body) || e.title || 'Untitled'}
                      </span>
                      <span className="el-fp" data-oriz-fingerprint aria-hidden="true">
                        {fp}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}

      <style>{`
        .el { display: flex; flex-direction: column; gap: 1.5rem; font-family: var(--font-body); }
        .el-loading {
          padding: 2rem 0;
          color: var(--graphite);
        }

        .el-filters {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--rule);
        }
        .el-filters select {
          background: transparent;
          border: 0;
          color: var(--page-cream);
          font: inherit;
          font-family: var(--font-sans);
          font-size: 13px;
          padding: 0.25rem 0;
          cursor: pointer;
        }
        @media (prefers-color-scheme: light) {
          .el-filters select { color: var(--ink, #1a1a22); }
        }
        .el-filters select:focus { outline: 2px solid var(--seal-red); outline-offset: 2px; }
        .el-count { margin-left: auto; color: var(--graphite); font-size: 13px; }

        .el-empty {
          padding: 3rem 0;
          color: var(--graphite);
          font-family: var(--font-body);
          text-align: left;
        }
        .el-empty a { color: var(--seal-red); text-decoration: none; border-bottom: 1px solid var(--seal-red); }

        .el-year { display: flex; flex-direction: column; gap: 0.25rem; }
        .el-year-h {
          font-family: var(--font-display);
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--graphite);
          margin: 0 0 0.25rem;
          padding-bottom: 0.25rem;
          border-bottom: 1px solid var(--rule);
        }

        .el-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
        }
        .el-row {
          display: grid;
          grid-template-columns: 4.25rem minmax(0, 1fr) 5.5rem;
          gap: 1rem;
          padding: 0.5rem 0;
          color: inherit;
          text-decoration: none;
          border-bottom: 1px solid var(--rule);
          align-items: baseline;
        }
        .el-row:hover .el-text { color: var(--seal-red); }
        .el-date {
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--graphite);
        }
        .el-text {
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.4;
          color: var(--page-cream);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (prefers-color-scheme: light) {
          .el-text { color: var(--ink, #1a1a22); }
        }
        .el-fp {
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--graphite);
          letter-spacing: 0.04em;
          text-align: right;
          font-feature-settings: 'tnum' 1, 'zero' 1, 'calt' 0;
        }
      `}</style>
    </div>
  )
}
