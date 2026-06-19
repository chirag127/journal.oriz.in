/**
 * Sealed-margin fingerprint helper — libsodium-free.
 *
 * Every saved entry renders an 8-character hex fingerprint in the right
 * margin (Inter 11px graphite). Deliberately unreadable. Surfaced as
 * marginalia, never as chrome.
 *
 * This is a NON-cryptographic FNV-1a hash; the brief calls it "ciphertext
 * fingerprint", but the v1 site only encrypts opt-in (`encrypted: true` per
 * entry) — we want a stable 8-char marginal hex string for every entry,
 * encrypted or not. FNV-1a does that without dragging libsodium-wrappers
 * into every island bundle (the PWA rollup pass can't resolve libsodium's
 * ESM `./libsodium.mjs` self-reference, so importing it client-side breaks
 * the build).
 *
 * For genuinely-cryptographic fingerprints (when libsodium is already on
 * the page because the user has opted into E2EE), use `fingerprintAsync`
 * from `~/lib/crypto.ts` — that runs BLAKE2b over the ciphertext.
 */
export function fingerprintSync(input: string): string {
  if (!input) return '00000000'
  let h = 0x811c9dc5 >>> 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0').slice(0, 8)
}
