/**
 * AuthGate — v2.
 *
 * Guards a React subtree. Same behavior as v1 (anonymous bridge, account
 * link CTA), restyled for the dusk surface: no card, no rounded corners,
 * no soft-bg fill — just text and the seal-red CTA.
 */

import { signInAnonymously } from 'firebase/auth'
import { useState } from 'react'
import { auth } from '~/lib/firebase'
import { useAuthUser } from '~/lib/useAuthUser'

interface Props {
  children: (uid: string, isAnonymous: boolean) => React.ReactNode
  allowAnonymous?: boolean
}

export default function AuthGate({ children, allowAnonymous = true }: Props) {
  const { user, loading } = useAuthUser()
  const [busy, setBusy] = useState(false)

  if (loading) return <p className="ag-loading chrome">Loading…</p>

  if (!user) {
    return (
      <div className="ag">
        <h2>Sign in to continue</h2>
        <p>
          Your journal entries are tied to your account so they follow you across every{' '}
          <code>*.oriz.in</code> site.
        </p>
        <p className="ag-actions">
          <a href="/account/" className="ag-primary">
            open sign-in &rarr;
          </a>
          {allowAnonymous && (
            <>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                className="ag-link"
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  try {
                    await signInAnonymously(auth)
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                {busy ? 'starting…' : 'try without signing up'}
              </button>
            </>
          )}
        </p>
        {allowAnonymous && (
          <p className="ag-fine chrome">
            Anonymous sessions stay on this device. Sign in later from{' '}
            <a href="/account/">/account</a> to link them.
          </p>
        )}
        <style>{`
          .ag {
            padding: 2.5rem 0;
            font-family: var(--font-body);
          }
          .ag h2 {
            font-family: var(--font-display);
            font-size: 1.375rem;
            font-weight: 600;
            margin: 0 0 0.5rem;
            color: var(--page-cream);
          }
          @media (prefers-color-scheme: light) {
            .ag h2 { color: var(--ink, #1a1a22); }
          }
          .ag p {
            color: var(--graphite);
            line-height: 1.65;
            margin: 0 0 1rem;
            max-width: 56ch;
          }
          .ag code {
            font-family: var(--font-mono);
            font-size: 0.875em;
          }
          .ag-actions {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            font-family: var(--font-body);
            font-size: 1rem;
          }
          .ag-primary {
            color: var(--seal-red);
            text-decoration: none;
            border-bottom: 1px solid var(--seal-red);
            padding-bottom: 1px;
          }
          .ag-primary:hover { background: color-mix(in oklab, var(--seal-red) 12%, transparent); }
          .ag-link {
            background: transparent;
            border: 0;
            color: var(--graphite);
            font: inherit;
            cursor: pointer;
            text-decoration: underline;
            text-underline-offset: 3px;
            padding: 0;
          }
          .ag-link:hover { color: var(--seal-red); }
          .ag-fine {
            font-size: 13px;
            font-family: var(--font-sans);
            color: var(--graphite);
          }
          .ag-fine a { color: inherit; text-decoration-color: var(--seal-red); }
          .ag-loading {
            padding: 3rem 0;
            color: var(--graphite);
          }
        `}</style>
      </div>
    )
  }

  return <>{children(user.uid, user.isAnonymous)}</>
}
