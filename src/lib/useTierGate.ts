/**
 * useTierGate — stub hook returning the user's subscription tier.
 *
 * Until auth-core ships the `tier` custom claim (see knowledge/auth-core),
 * every user is `free`. The /habits surface uses this to render a paywall
 * card. When the claim lands, swap the body for:
 *
 *   const { user } = useAuthUser()
 *   useEffect(() => { user?.getIdTokenResult().then(r => setTier(r.claims.tier ?? 'free')) }, [user])
 */
import { useState } from 'react'

export type Tier = 'free' | 'pro' | 'max'

export function useTierGate(): { tier: Tier; loading: boolean } {
  // Hardcoded until auth-core exposes tier claim.
  const [tier] = useState<Tier>('free')
  return { tier, loading: false }
}
