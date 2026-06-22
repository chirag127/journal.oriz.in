/**
 * HabitsIndexView — top of /habits.
 *
 * Mounts the daily checklist (HabitTracker) and the paywall card when the
 * user is on the free tier. The paywall doesn't *block* habits in the MVP —
 * the data layer works regardless — it just messages the upgrade path. Swap
 * to a hard block once auth-core's tier claim ships and pricing is decided.
 */
import HabitTracker from './HabitTracker'
import { useTierGate } from '~/lib/useTierGate'

export default function HabitsIndexView() {
  const { tier } = useTierGate()

  return (
    <div className="hi">
      {tier === 'free' && <PaywallCard />}
      <div className="hi-actions">
        <a href="/habits/new" className="hi-new">
          + new habit
        </a>
      </div>
      <HabitTracker />
      <style>{`
        .hi { display: flex; flex-direction: column; gap: 1.5rem; font-family: var(--font-body); }
        .hi-actions { display: flex; }
        .hi-new {
          color: var(--seal-red);
          text-decoration: none;
          border-bottom: 1px solid var(--seal-red);
          padding-bottom: 1px;
          font-size: 0.9375rem;
        }
        .hi-new:hover { background: color-mix(in oklab, var(--seal-red) 12%, transparent); }
      `}</style>
    </div>
  )
}

function PaywallCard() {
  return (
    <aside className="pw">
      <div className="pw-row">
        <span className="pw-tag">pro</span>
        <h2 className="pw-h">Habits is a Pro feature</h2>
      </div>
      <p className="pw-body">
        You're on the free tier — you can still create and check habits during preview, but the
        feature will move to <strong>oriz Pro</strong> when billing ships. Your data stays put.
      </p>
      <p className="pw-cta">
        <a href="/account/" className="pw-link">
          manage account &rarr;
        </a>
      </p>
      <style>{`
        .pw {
          border-left: 2px solid var(--seal-red);
          padding: 0.875rem 1rem;
          background: color-mix(in oklab, var(--seal-red) 6%, transparent);
          font-family: var(--font-body);
          color: var(--page-cream);
        }
        @media (prefers-color-scheme: light) { .pw { color: var(--ink, #1a1a22); } }
        .pw-row { display: flex; align-items: baseline; gap: 0.625rem; margin-bottom: 0.5rem; }
        .pw-tag {
          font-family: var(--font-sans);
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--seal-red);
          border: 1px solid var(--seal-red);
          padding: 1px 6px;
        }
        .pw-h { margin: 0; font-family: var(--font-display); font-size: 1.0625rem; font-weight: 600; }
        .pw-body { margin: 0 0 0.5rem; color: var(--graphite); line-height: 1.55; max-width: 56ch; }
        .pw-cta { margin: 0; font-size: 0.875rem; }
        .pw-link { color: var(--seal-red); text-decoration: none; border-bottom: 1px solid var(--seal-red); padding-bottom: 1px; }
      `}</style>
    </aside>
  )
}
