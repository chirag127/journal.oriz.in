/**
 * E2EE helpers via libsodium + the sealed-margin fingerprint helper.
 *
 * Encryption (existing MVP):
 *   Derives a symmetric key from a user-chosen passphrase (PBKDF2 via
 *   crypto_pwhash) and uses crypto_secretbox to encrypt/decrypt the entry
 *   body. The key is held in memory only; on reload the user re-enters the
 *   passphrase. Salt is per-user, stored on the profile.
 *
 * Sealed-margin fingerprint (new — v2 design):
 *   Every saved entry renders an 8-character hex fingerprint in the right
 *   margin (Inter 11px graphite). Deliberately unreadable. NOT a settings
 *   page — surfaced as marginalia.
 *
 *   Hash source priority:
 *     1. Encrypted body — if `encrypted` is set, hash the ciphertext blob.
 *     2. Plaintext body — fall back to `body` (markdown source) so non-E2EE
 *        users still get a deterministic margin signature.
 *
 *   Hash function: libsodium.crypto_generichash (BLAKE2b) with the standard
 *   32-byte default; we slice the first 4 bytes to a hex8. This is cosmetic
 *   marginalia, not a security primitive.
 */
import sodium from 'libsodium-wrappers'

let _ready: Promise<void> | null = null
function ready() {
  if (!_ready) _ready = sodium.ready
  return _ready
}

export async function deriveKey(passphrase: string, saltBase64: string): Promise<Uint8Array> {
  await ready()
  const salt = sodium.from_base64(saltBase64, sodium.base64_variants.ORIGINAL)
  return sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    passphrase,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT,
  )
}

export async function newSalt(): Promise<string> {
  await ready()
  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES)
  return sodium.to_base64(salt, sodium.base64_variants.ORIGINAL)
}

export async function encrypt(
  plaintext: string,
  key: Uint8Array,
): Promise<{ ciphertext: string; nonce: string }> {
  await ready()
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
  const ct = sodium.crypto_secretbox_easy(sodium.from_string(plaintext), nonce, key)
  return {
    ciphertext: sodium.to_base64(ct, sodium.base64_variants.ORIGINAL),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
  }
}

export async function decrypt(
  ciphertextB64: string,
  nonceB64: string,
  key: Uint8Array,
): Promise<string> {
  await ready()
  const ct = sodium.from_base64(ciphertextB64, sodium.base64_variants.ORIGINAL)
  const n = sodium.from_base64(nonceB64, sodium.base64_variants.ORIGINAL)
  const plain = sodium.crypto_secretbox_open_easy(ct, n, key)
  return sodium.to_string(plain)
}

// In-memory key cache — reset on reload, cleared on logout.
let _key: Uint8Array | null = null
export function setSessionKey(k: Uint8Array | null) {
  _key = k
}
export function getSessionKey() {
  return _key
}

/**
 * Compute the 8-char ciphertext fingerprint shown in the sealed margin.
 *
 * Async because libsodium needs `await sodium.ready` once per page load. Use
 * `fingerprintSync` only after a previous async call has primed the runtime.
 */
export async function fingerprint(input: string): Promise<string> {
  await ready()
  if (!input) return '·· ·· ·· ··'.replace(/\s/g, '')
  const hash = sodium.crypto_generichash(8, sodium.from_string(input))
  // 4 bytes = 8 hex chars — deliberately unreadable, deliberately deterministic.
  return Array.from(hash.slice(0, 4))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Synchronous fallback fingerprint — used when libsodium hasn't been primed
 * yet (e.g. inside a list render). Falls back to a non-cryptographic hash
 * (FNV-1a) that produces a stable 8-char hex. Cosmetic only.
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
