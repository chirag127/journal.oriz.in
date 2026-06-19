# oriz-journal

[journal.oriz.in](https://journal.oriz.in) — privacy-first PWA journal in the [oriz family](https://oriz.in). Ten journal types (daily, gratitude, learning, reading, travel, work, fitness, dream, research, reflection), offline-first, fully on the Firebase Spark plan.

This site is part of the `chirag127/oriz` hub and shares its design system, Firebase project, and single sign-in with the rest of the family.

## Stack

- **Astro 6** static output, **React 19** islands.
- **Tailwind v4** via `@tailwindcss/vite`.
- **[@chirag127/oriz-ui](https://github.com/chirag127/oriz-ui)** for the design system, Sidebar, AccountPanel, ContactForm, FinishSignIn, family metadata, and Firebase init.
- **Firebase** — shared `oriz-app` project (auth + Firestore). Auth is on `auth.oriz.in` so a sign-in flows across every `*.oriz.in` site.
- Hosting: **Firebase Hosting** at `journal.oriz.in`.

## Develop

```bash
pnpm install
npx envpact-cli@0.2.0     # pulls .env.local from the shared envpact bundle
pnpm dev
```

Open `http://localhost:4321`.

`pnpm typecheck` runs `astro check`. `pnpm lint` runs Biome.

## Build & deploy

```bash
pnpm build                # builds to ./dist
pnpm deploy               # firebase deploy --only hosting
```

`firebase.json` is set up for static SPA-fallback routing with `cleanUrls`. Firestore rules + indexes ship via:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Migrating from the legacy theme

The previous version of this site shipped a bespoke "Editorial Sanctuary" theme (Fraunces + sienna) and an in-house React app for entries / calendar / templates / stats. This commit replaces the theme and the layout shell with `@chirag127/oriz-ui`. The journal app's React surface (entry editor, calendar, timeline, etc.) has been removed in this pass and will be re-grafted on top of `oriz-ui` primitives in a follow-up — every link in the sidebar currently routes to `/account/` so users can sign in while we rebuild.

The `firestore.rules` and `firestore.indexes.json` are kept verbatim — the data shape (entries, templates, tags, goals, settings, counters) is unchanged. Only the Firebase **project** changed: from `bookatlas-13392` (legacy) → `oriz-app` (shared family project). **Existing journal entries in `bookatlas-13392` are not migrated automatically; that is a separate manual step** (export from the legacy project, re-import into `oriz-app` under the matching `uid`).
