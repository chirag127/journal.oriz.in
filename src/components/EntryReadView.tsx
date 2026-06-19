/**
 * EntryReadView — v2.
 *
 * Read-only display on the same cream-page-on-dusk geometry as the editor.
 * Date heading in GT Sectra. Body in iA Writer Quattro at the 66ch hard cap.
 * Sealed-margin fingerprint top-right of the page surface.
 *
 * Three actions, in graphite chrome at the bottom of the column: edit,
 * export .md, delete.
 *
 * NO mood pill. NO journal-type badge. NO weather chip. NO favorite/pinned
 * icons. NO tag pills. The brief cuts the "metadata strip" — entries here
 * are sentences, not records.
 */
import { useEffect, useState } from 'react'
import { fingerprintSync } from '~/lib/fingerprint'
import { deleteEntry, getEntry } from '~/lib/journalDb'
import { mdToHtml } from '~/lib/markdown'
import type { Entry } from '~/lib/types'
import { setSeal } from './Seal'

interface Props {
  uid: string
  entryId: string
}

export default function EntryReadView({ uid, entryId }: Props) {
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    getEntry(uid, entryId).then((e) => {
      if (!e) setMissing(true)
      setEntry(e)
      setLoading(false)
    })
  }, [uid, entryId])

  // The seal is sealed when reading.
  useEffect(() => {
    setSeal('sealed')
    return () => setSeal('closing')
  }, [])

  if (loading) return <div className="er-loading chrome">Loading…</div>
  if (missing || !entry)
    return (
      <div className="er-missing">
        <p>Entry not found.</p>
        <p>
          <a href="/entries">&larr; back to entries</a>
        </p>
      </div>
    )

  const exportMd = () => {
    const md = `# ${entry.title || 'Untitled'}\n\n*${entry.entryDate}*\n\n${entry.body || ''}`
    const blob = new Blob([md], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${entry.entryDate}-${(entry.title || 'entry')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const fp = fingerprintSync(entry.body || entry.title || entry.id)
  const dateLong = new Date(entry.entryDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="er">
      <div className="ee-chrome">
        <div className="spine ee-chrome-row">
          <a href="/dashboard" className="er-back chrome">
            &larr; dashboard
          </a>
          <span className="er-chrome-spacer" aria-hidden="true"></span>
          <a href={`/entries/${entry.id}/edit`} className="er-edit chrome">
            edit
          </a>
        </div>
      </div>

      <article className="er-page page-cream">
        <header className="er-head">
          <h1 className="er-date-display">{dateLong}</h1>
          {entry.title && <p className="er-title">{entry.title}</p>}
          <span className="er-fp tabular" data-oriz-fingerprint aria-hidden="true">
            {fp}
          </span>
        </header>

        <div
          className="entry-body er-body"
          dangerouslySetInnerHTML={{ __html: entry.bodyHtml || mdToHtml(entry.body || '') }}
        />

        <footer className="er-foot">
          <a href={`/entries/${entry.id}/edit`}>edit</a>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={exportMd}>
            export .md
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            className="er-foot-danger"
            onClick={async () => {
              if (window.confirm('Delete this entry permanently?')) {
                await deleteEntry(uid, entry.id)
                window.location.href = '/entries'
              }
            }}
          >
            delete
          </button>
        </footer>
      </article>

      <style>{`
        .er { background: var(--dusk); min-height: 100vh; }
        .er-loading {
          padding: 4rem 2rem;
          text-align: center;
        }
        .er-missing {
          padding: 4rem 2rem;
          text-align: center;
          color: var(--graphite);
          font-family: var(--font-sans);
        }

        .ee-chrome { padding: 16px 0 0; }
        .ee-chrome-row {
          display: flex;
          align-items: center;
          height: 32px;
        }
        .er-back, .er-edit {
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--graphite);
          text-decoration: none;
        }
        .er-back:hover, .er-edit:hover { color: var(--seal-red); }
        .er-chrome-spacer { flex: 1; }

        .er-page {
          margin: 24px auto 0;
          max-width: 720px;
          padding: clamp(2rem, 6vw, 4rem) clamp(1.5rem, 5vw, 3rem);
          color: var(--ink, #1a1a22);
        }
        .er-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          column-gap: 1rem;
          align-items: baseline;
          margin-bottom: 1.75rem;
        }
        .er-date-display {
          grid-column: 1;
          font-family: var(--font-display);
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.1;
          margin: 0;
        }
        .er-title {
          grid-column: 1;
          margin: 0.25rem 0 0;
          font-family: var(--font-display);
          font-size: 1.125rem;
          font-style: italic;
          color: var(--graphite);
        }
        .er-fp {
          grid-column: 2;
          grid-row: 1 / span 2;
          align-self: start;
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--graphite);
          letter-spacing: 0.04em;
          margin-top: 6px;
        }

        .er-body {
          color: var(--ink, #1a1a22);
        }

        .er-foot {
          margin-top: 3rem;
          padding-top: 1rem;
          border-top: 1px solid color-mix(in oklab, var(--ink, #1a1a22) 12%, transparent);
          display: flex;
          gap: 0.75rem;
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--graphite);
        }
        .er-foot a, .er-foot button {
          background: transparent;
          border: 0;
          padding: 0;
          color: var(--graphite);
          font: inherit;
          cursor: pointer;
          text-decoration: underline;
          text-decoration-color: var(--graphite);
          text-underline-offset: 3px;
        }
        .er-foot a:hover, .er-foot button:hover {
          color: var(--seal-red);
          text-decoration-color: var(--seal-red);
        }
        .er-foot-danger:hover { color: var(--seal-red); }
      `}</style>
    </div>
  )
}
