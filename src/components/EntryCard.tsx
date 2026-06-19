/**
 * EntryCard — v2.
 *
 * One-line list row: date · first sentence · 8-char fingerprint. Same
 * geometry as the dashboard and EntryList rows. NOT a card. NO mood pill,
 * NO tag pills, NO journal-type badge, NO word count.
 *
 * Used by MemoriesView (and any other surface that wants a single-row
 * entry reference). Backwards-compatible default `entry` prop interface.
 */
import { fingerprintSync } from '~/lib/fingerprint'
import type { Entry } from '~/lib/types'

interface Props {
  entry: Entry
  href?: string
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

export default function EntryCard({ entry, href }: Props) {
  const fp = fingerprintSync(entry.body || entry.title || entry.id)
  return (
    <a className="ec" href={href ?? `/entries/${entry.id}`}>
      <time className="ec-date tabular">{fmtDate(entry.entryDate)}</time>
      <span className="ec-text">{firstSentence(entry.body) || entry.title || 'Untitled'}</span>
      <span className="ec-fp" data-oriz-fingerprint aria-hidden="true">
        {fp}
      </span>
      <style>{`
        .ec {
          display: grid;
          grid-template-columns: 4.25rem minmax(0, 1fr) 5.5rem;
          gap: 1rem;
          padding: 0.5rem 0;
          color: inherit;
          text-decoration: none;
          border-bottom: 1px solid var(--rule);
          align-items: baseline;
          font-family: var(--font-body);
        }
        .ec:hover .ec-text { color: var(--seal-red); }
        .ec-date {
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--graphite);
        }
        .ec-text {
          font-size: 16px;
          line-height: 1.4;
          color: var(--page-cream);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (prefers-color-scheme: light) {
          .ec-text { color: var(--ink, #1a1a22); }
        }
        .ec-fp {
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--graphite);
          letter-spacing: 0.04em;
          text-align: right;
          font-feature-settings: 'tnum' 1, 'zero' 1, 'calt' 0;
        }
      `}</style>
    </a>
  )
}
