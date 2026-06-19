/**
 * THE SEAL — the only animated element in the entire app.
 *
 * 12px-diameter circle, fixed top-right (16px from top + right edges) on
 * every page. Per the v2 brief, it carries the entire visual signature of
 * oriz-journal: it IS the privacy signal, replacing what would have been a
 * padlock icon. The PWA icon (`/icons/icon-*.png`) renders the same shape.
 *
 * Four states (the only state machine in the app):
 *   - `typing`  → hollow ring, 1px stroke      (unsaved local edits)
 *   - `sealing` → soft 600ms opacity pulse     (libsodium operation in flight)
 *   - `sealed`  → solid fill                   (encrypted to disk — the rest state)
 *   - `closing` → quarter-turn 300ms transform (entry close — wax pressing shut)
 *
 * Driven globally by a tiny window event bus so any island can transition
 * the seal without prop-drilling:
 *   window.dispatchEvent(new CustomEvent('seal:set', { detail: 'sealing' }))
 *
 * The bus is NOT a generic motion system — only the four states above are
 * accepted, and the seal is the only consumer. Anything else trying to ride
 * this channel won't render.
 *
 * `prefers-reduced-motion: reduce` collapses the pulse to instant fill and
 * the closing rotate to no-op, but the state colors still update.
 */
import { useEffect, useState } from 'react'

export type SealState = 'typing' | 'sealing' | 'sealed' | 'closing'

interface Props {
  /** Initial state — defaults to `sealed`, the rest state on dashboard / read-view. */
  initialState?: SealState
  /** Optional ARIA label override. The seal already announces its state via aria-live. */
  ariaLabel?: string
}

const STATE_LABEL: Record<SealState, string> = {
  typing: 'unsaved local edits',
  sealing: 'sealing — encryption in flight',
  sealed: 'sealed — encrypted to disk',
  closing: 'closing — wax pressing shut',
}

export default function Seal({ initialState = 'sealed', ariaLabel }: Props) {
  const [state, setState] = useState<SealState>(initialState)

  useEffect(() => {
    const onSet = (e: Event) => {
      const detail = (e as CustomEvent<SealState>).detail
      if (
        detail === 'typing' ||
        detail === 'sealing' ||
        detail === 'sealed' ||
        detail === 'closing'
      ) {
        setState(detail)
      }
    }
    window.addEventListener('seal:set', onSet as EventListener)
    return () => window.removeEventListener('seal:set', onSet as EventListener)
  }, [])

  return (
    <span
      className={`seal seal--${state}`}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel ?? `oriz-journal seal — ${STATE_LABEL[state]}`}
      data-seal-state={state}
    >
      <style>{`
        .seal {
          position: fixed;
          top: 16px;
          right: 16px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          z-index: 60;
          pointer-events: none;
          /* state changes are explicit, not eased — except the two motions
             explicitly listed in the brief (pulse + closing rotate). */
          transition: none;
        }
        .seal--typing {
          background: transparent;
          box-shadow: inset 0 0 0 1px var(--seal-red);
        }
        .seal--sealing {
          background: var(--seal-red);
          animation: seal-pulse 600ms ease-in-out;
        }
        .seal--sealed {
          background: var(--seal-red);
        }
        .seal--closing {
          background: var(--seal-red);
          transform: rotate(90deg);
          transition: transform 300ms ease-out;
        }
        @keyframes seal-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          .seal--sealing { animation: none; }
          .seal--closing { transition: none; transform: none; }
        }
      `}</style>
    </span>
  )
}

/**
 * Imperative helper — call from anywhere to transition the seal.
 *
 *   import { setSeal } from '~/components/Seal'
 *   setSeal('sealing')
 *   await encrypt(...)
 *   setSeal('sealed')
 */
export function setSeal(state: SealState) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<SealState>('seal:set', { detail: state }))
}
