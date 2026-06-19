/**
 * DashboardView — v2.
 *
 * Single 720px column, vertical letter, NEVER a card grid.
 *
 *   [ Today's date — GT Sectra display ]
 *   [ Today's prompt — GT Sectra italic, graphite ]
 *   [ Single primary action: "Open today's entry →" / "Continue today's entry →" ]
 *   [ 1px hairline ]
 *   [ Last 5 entries: Mon DD  ·  first sentence … ]
 *   [ all entries → ]   (then whitespace; no global footer)
 *
 * NO streak counter. NO words-written stat. NO calendar heatmap. NO memories
 * carousel. Streaks are visible only as shapes on /calendar.
 *
 * The seal sits top-right (rendered by the BaseLayout). On dashboard load
 * the seal stays in 'sealed' state — vault is current.
 */
import { useEffect, useState } from 'react'
import { fingerprintSync } from '~/lib/fingerprint'
import { listEntries, todayIso } from '~/lib/journalDb'
import type { Entry } from '~/lib/types'

interface Props {
  uid: string
  isAnonymous: boolean
}

const PROMPTS = [
  'What sentence will you remember a year from now?',
  'What did you almost say today, and didn’t?',
  'What changed since last Tuesday?',
  'Where did the day surprise you?',
  'Who are you protecting by writing this only here?',
  'What is the smallest true thing you could write?',
  'What were you wrong about this week?',
  'What did you notice that no one else did?',
  'What is the question under the question?',
  'What does today’s you owe tomorrow’s you?',
]

function pickPrompt(seedIso: string) {
  let h = 0
  for (let i = 0; i < seedIso.length; i++) h = (h * 31 + seedIso.charCodeAt(i)) | 0
  return PROMPTS[Math.abs(h) % PROMPTS.length]
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
  // Mar 14
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

export default function DashboardView({ uid, isAnonymous }: Props) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listEntries(uid, { limit: 10 }).then((rows) => {
      if (cancelled) return
      setEntries(rows)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [uid])

  const today = todayIso()
  const todayEntry = entries.find((e) => e.entryDate === today)
  const recent = entries.filter((e) => e.entryDate !== today).slice(0, 5)
  const todayDate = new Date(today + 'T00:00:00')
  const todayLong = todayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const prompt = pickPrompt(today)

  return (
    <div className="dash">
      {isAnonymous && (
        <p className="dash-anon chrome">
          You are signed in anonymously. <a href="/account/">Link an account</a> from /account to
          sync your entries.
        </p>
      )}

      <h1 className="dash-date">{todayLong}</h1>
      <p className="dash-prompt">{prompt}</p>

      <p className="dash-cta">
        {todayEntry ? (
          <a href={`/entries/${todayEntry.id}/edit`}>Continue today&rsquo;s entry &rarr;</a>
        ) : (
          <a href="/entries/new">Open today&rsquo;s entry &rarr;</a>
        )}
      </p>

      <hr className="hairline" />

      {loading ? null : recent.length === 0 ? (
        <p className="dash-empty chrome">No earlier entries yet. Today is page one.</p>
      ) : (
        <ul className="dash-list">
          {recent.map((e) => {
            const fp = fingerprintSync(e.encrypted ? e.body : e.body || e.title || e.id)
            return (
              <li key={e.id}>
                <a className="dash-row" href={`/entries/${e.id}`}>
                  <time className="dash-row-date tabular">{fmtDate(e.entryDate)}</time>
                  <span className="dash-row-text">
                    {firstSentence(e.body) || (e.title ? e.title : 'Untitled')}
                  </span>
                  <span className="dash-row-fp" data-oriz-fingerprint aria-hidden="true">
                    {fp}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      )}

      <p className="dash-all">
        <a href="/entries">all entries &rarr;</a>
      </p>

      <style>{`
        .dash {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          font-family: var(--font-body);
        }
        .dash-anon {
          padding: 0.625rem 0.875rem;
          border: 1px solid var(--rule);
          color: var(--graphite);
        }
        .dash-anon a { color: var(--seal-red); }
        .dash-date {
          font-family: var(--font-display);
          font-size: clamp(1.75rem, 4vw, 2.25rem);
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.1;
          margin: 1rem 0 0.25rem;
          color: var(--page-cream);
        }
        @media (prefers-color-scheme: light) {
          .dash-date { color: var(--ink, #1a1a22); }
        }
        .dash-prompt {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1.25rem;
          color: var(--graphite);
          margin: 0 0 0.5rem;
          max-width: 38ch;
        }
        .dash-cta {
          margin: 0.5rem 0 0;
          font-family: var(--font-body);
          font-size: 1rem;
        }
        .dash-cta a {
          color: var(--seal-red);
          text-decoration: none;
          border-bottom: 1px solid var(--seal-red);
          padding-bottom: 1px;
        }
        .dash-cta a:hover { background: color-mix(in oklab, var(--seal-red) 12%, transparent); }
        .dash-list {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0 0;
          display: flex;
          flex-direction: column;
        }
        .dash-row {
          display: grid;
          grid-template-columns: 4.25rem minmax(0, 1fr) 5.5rem;
          gap: 1rem;
          padding: 0.5rem 0;
          color: inherit;
          text-decoration: none;
          border-bottom: 1px solid var(--rule);
          align-items: baseline;
        }
        .dash-row:hover .dash-row-text { color: var(--seal-red); }
        .dash-row-date {
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--graphite);
        }
        .dash-row-text {
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.4;
          color: var(--page-cream);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (prefers-color-scheme: light) {
          .dash-row-text { color: var(--ink, #1a1a22); }
        }
        .dash-row-fp {
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--graphite);
          letter-spacing: 0.04em;
          text-align: right;
          font-feature-settings: 'tnum' 1, 'zero' 1, 'calt' 0;
        }
        .dash-empty {
          color: var(--graphite);
          font-family: var(--font-body);
          font-size: 1rem;
          margin: 0.5rem 0 0;
        }
        .dash-all {
          margin: 1.25rem 0 0;
          font-family: var(--font-sans);
          font-size: 13px;
        }
        .dash-all a {
          color: var(--graphite);
          text-decoration: underline;
          text-decoration-color: var(--rule);
          text-underline-offset: 3px;
        }
        .dash-all a:hover { color: var(--seal-red); text-decoration-color: var(--seal-red); }
      `}</style>
    </div>
  )
}
