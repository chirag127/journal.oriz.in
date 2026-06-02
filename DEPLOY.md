# Deployment — `journal.oriz.in`

End-to-end deploy guide for a new Firebase project, custom domain, and CI/CD.

## 1. One-time setup

### 1.1 Create the Firebase project

1. Go to <https://console.firebase.google.com> → **Add project**.
2. Name it `journal-oriz-in` (or anything). Enable / disable Google Analytics as you like — we don't depend on it.
3. Pick a region (e.g. `us-central1` for low latency to the Americas / Europe).

### 1.2 Enable authentication providers

**Authentication → Sign-in method** → enable:

- Email/Password
- Google (set support email; no need for OAuth consent screen if only your own project)
- GitHub (optional; requires creating a GitHub OAuth app)
- Anonymous (for "Try as a guest")

### 1.3 Create the Firestore database

**Firestore Database → Create database → Production mode → pick a region.**

The default rules deny all reads/writes. We'll deploy the repo's `firestore.rules` next.

### 1.4 Get web credentials

**Project settings (gear) → Your apps → `</>` (Web app) → Register app.**

Copy the `firebaseConfig` object — you need:

```
PUBLIC_FIREBASE_API_KEY
PUBLIC_FIREBASE_AUTH_DOMAIN
PUBLIC_FIREBASE_PROJECT_ID
PUBLIC_FIREBASE_STORAGE_BUCKET
PUBLIC_FIREBASE_MESSAGING_SENDER_ID
PUBLIC_FIREBASE_APP_ID
```

Put these in `.env.local` for dev, and as GitHub Actions secrets for CI.

### 1.5 Wire `.firebaserc`

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 1.6 Install Firebase CLI (one time)

```bash
npm install -g firebase-tools
firebase login
```

## 2. Deploy rules and indexes

```bash
pnpm deploy:rules
```

This pushes `firestore.rules` and `firestore.indexes.json`. Indexes take a few minutes to build the first time.

## 3. Custom domain — `journal.oriz.in`

### 3.1 Buy / own the domain

Buy `oriz.in` (or just `journal.oriz.in` as a subdomain) from any registrar — Cloudflare Registrar, Namecheap, Google Domains, Porkbun, etc.

### 3.2 Add the custom domain in Firebase

**Hosting → Add custom domain → `journal.oriz.in`**.

Firebase will show you a `TXT` record (for ownership) and an `A` record (for routing). Add both at your registrar's DNS panel:

- **A** record: `@` (root) → `151.101.1.195` (or whatever Firebase shows — these IPs rotate)
- **A** record: `@` → `151.101.65.195`
- **TXT** record: `@` → the long verification string Firebase gives you

It can take 5–60 minutes for DNS to propagate. Firebase will then issue a free Let's Encrypt certificate automatically.

### 3.3 Add the www redirect (optional)

If you also want `www.journal.oriz.in` to redirect to the apex, add a second custom domain in Firebase for the `www` subdomain and it will redirect automatically once you approve the cert.

## 4. CI/CD with GitHub Actions

### 4.1 Required secrets

In your GitHub repo: **Settings → Secrets and variables → Actions**, add:

| Secret                          | Source                                                                  |
| ------------------------------- | ----------------------------------------------------------------------- |
| `PUBLIC_FIREBASE_API_KEY`       | Firebase web config                                                     |
| `PUBLIC_FIREBASE_AUTH_DOMAIN`   | Firebase web config                                                     |
| `PUBLIC_FIREBASE_PROJECT_ID`    | Firebase web config                                                     |
| `PUBLIC_FIREBASE_STORAGE_BUCKET`| Firebase web config                                                     |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase web config                                               |
| `PUBLIC_FIREBASE_APP_ID`        | Firebase web config                                                     |
| `FIREBASE_SERVICE_ACCOUNT`      | Firebase project settings → Service accounts → **Generate new private key** (JSON) |
| `FIREBASE_PROJECT_ID`           | Same as the public project ID                                           |

The two workflows at `.github/workflows/`:

- **`ci.yml`** — runs on every PR. Installs deps, lints (Biome), typechecks (`astro check`), and builds.
- **`deploy.yml`** — runs on every push to `main` and on manual dispatch. Builds, then uses `FirebaseExtended/action-hosting-deploy@v0` to deploy `dist/` to the `live` channel (= production).

The `environment: production` declaration gates production deploys behind GitHub Environments if you enable branch protection rules.

## 5. Manual deploy (optional)

If you'd rather deploy from your laptop:

```bash
pnpm build
pnpm deploy:hosting       # just the SPA
pnpm deploy:rules         # just the rules
pnpm deploy               # everything
```

## 6. Post-deploy checklist

- [ ] Open <https://journal.oriz.in> and confirm the marketing page loads.
- [ ] Open DevTools → Application → Manifest, confirm PWA installable.
- [ ] Click **Try as a guest**, write a test entry, refresh — entry should still be there (Firestore read on demand).
- [ ] Toggle offline in DevTools → Network → write another entry → see "Offline" indicator. Toggle back online → entry syncs.
- [ ] Lighthouse → PWA category should be green.
- [ ] Lighthouse → Performance should be 90+ on a cold visit.
- [ ] From a phone, visit `https://journal.oriz.in` and use **Share → Add to Home Screen** — the PWA should install with the sienna journal cover.

## 7. Rollback

Firebase Hosting keeps every release for 30 days.

**Hosting → Release history → ⋮ → Rollback**.

## 8. Costs

This entire project runs on the **Spark** (free) plan:

- Hosting: 10 GB egress / month
- Firestore: 50 K reads + 20 K writes / day
- Auth: unlimited email + 10 K phone verifications / month

The selective-listener pattern (recent 30 + pinned 20 + favorites 50 streamed; rest fetched on demand) keeps a heavy daily user well within budget. A user writing 5 entries/day and reading their own history for 15 minutes/day uses ~3 K reads and ~50 writes — comfortably within Spark.

If you ever outgrow it, the same code deploys unchanged to **Blaze** (pay-as-you-go). The only thing that changes is `firestore.rules` quotas.
