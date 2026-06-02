# Journal

> Private. Fast. Beautiful. A daily companion for writing, reflection, memory keeping, and personal growth.

**Live:** [https://journal.oriz.in](https://journal.oriz.in)

Journal is a privacy-first PWA for personal journaling. It runs entirely on the
[Firebase Spark plan](https://firebase.google.com/pricing) (free forever) and
stays out of your way: it autosaves, works offline, installs to your home
screen, and never sells your data.

## Highlights

- **Editorial Sanctuary design.** Fraunces serif + Inter Tight sans + JetBrains Mono. Ivory paper, sienna ink. Restrained, readable, calm.
- **Ten journal types, custom types.** Daily, Gratitude, Learning, Reading, Travel, Work, Fitness, Dream, Research, Reflection — and any custom type you need.
- **Moods, tags, favorites, pinned.** Five moods with intensity, custom tags, per-type templates, full-text + tag search.
- **Calendar, timeline, memories, stats.** "On this day" anniversaries, monthly heatmap, year view, mood trends, word counts, longest streak.
- **Selective listeners + on-demand reads.** Recent 30 entries stream live; older entries load on demand. Free-tier-friendly.
- **Custom textarea + live preview editor.** Markdown, autosave (4.5 s), Cmd-S, no distraction.
- **Export everything.** JSON, Markdown, plain text, or ZIP — at any time, from your browser. No lock-in.
- **Import too.** Bring entries back from a previous export, or a Day One JSON, or any collection of `.md` / `.json` files.
- **Goals, templates, weather, location.** Track writing frequency, save reusable prompts, attach where you were and what the weather was like.
- **PWA, offline, installable.** Service worker, runtime cache for images and fonts, offline fallback page.
- **Account deletion is real.** Single button wipes every Firestore doc owned by your `uid`.

## Stack

- **Astro 5** (static, `output: "static"`) + **React 19** islands (`client:only="react"`)
- **TypeScript** strict, **Tailwind CSS v4** via Vite plugin, **Biome 2** for lint+format
- **Firebase 12**: Auth (Email, Google, GitHub, Anonymous) + Firestore + Hosting. No Cloud Functions, no paid services.
- **React Hook Form** + **Zod v4** for forms, **Recharts** for stats, **Fuse.js** for search, **marked + DOMPurify** for markdown, **JSZip** for export bundles, **dayjs** for dates.
- **Vitest** + **@testing-library/react** for unit tests, **Playwright** for E2E.

## Local development

Requires **Node 22.12+** and **pnpm 10+**.

```bash
pnpm install
cp .env.example .env.local   # fill in your Firebase web config
pnpm icons                    # generate PWA icons (also runs as `prebuild`)
pnpm dev                      # http://localhost:4321
```

### Firebase setup (Spark plan, free)

1. Create a Firebase project at <https://console.firebase.google.com>.
2. Enable **Email/Password**, **Google**, and **GitHub** under **Authentication → Sign-in method**.
3. Create a **Firestore database** in **Native** mode, in **production** region of your choice.
4. Replace the placeholders in `.firebaserc` with your project ID.
5. Deploy rules and indexes once:
   ```bash
   pnpm deploy:rules
   ```
6. Run `pnpm dev` and open <http://localhost:4321>. Click **Try as a guest** to start without signup.

## Scripts

| Script              | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `pnpm dev`          | Astro dev server with HMR.                                |
| `pnpm icons`        | Generate PWA icons from `public/favicon.svg`.             |
| `pnpm build`        | `astro check` + `astro build` (runs `prebuild` for icons).|
| `pnpm build:fast`   | Build only, skip typecheck.                               |
| `pnpm preview`      | Serve `dist/` locally.                                    |
| `pnpm check`        | TypeScript + Astro diagnostics.                           |
| `pnpm lint`         | Biome lint.                                               |
| `pnpm lint:fix`     | Biome lint with `--write`.                                |
| `pnpm format`       | Biome format with `--write`.                              |
| `pnpm test`         | Vitest unit tests.                                        |
| `pnpm test:e2e`     | Playwright E2E suite.                                     |
| `pnpm deploy`       | Full Firebase deploy (hosting + rules).                   |
| `pnpm deploy:rules` | Firestore rules + composite indexes only.                 |

## Architecture

```
src/
  components/react/   # React islands (AppShell, views, editor, ui)
  layouts/            # Astro layouts
  pages/              # Astro routes (mostly 1-line shells that mount a React island)
  lib/
    firebase/         # client + per-collection data layer
    hooks/            # auth, entries, settings, weather, autosave, etc.
    stores/           # Zustand stores
    utils/            # pure functions (date, markdown, stats, search, export, import)
    schemas/          # Zod schemas
    constants.ts      # MOODS, JOURNAL_TYPES, THEMES, GOAL_TYPES, GOAL_PERIODS
  types/journal.ts    # Domain types
  styles/global.css   # Tailwind v4 @theme + design tokens
```

### Data model (Firestore)

```
users/{uid}
  └─ entries/{entryId}            # one document per journal entry
  └─ templates/{id}               # user templates (isBuiltIn=false)
  └─ tags/{id}                    # tag registry (denormalized count)
  └─ goals/{id}                   # writing goals
  └─ settings/preferences         # single user settings doc
  └─ counters/stats               # denormalized aggregates
  └─ counters/yearly/{year}       # year-bucketed aggregates
templates/{id}                    # built-in templates (top-level, read-only)
```

Security: see [`firestore.rules`](firestore.rules). Composite indexes: see
[`firestore.indexes.json`](firestore.indexes.json). Owner-only reads/writes
on every per-user collection; built-in templates are publicly readable.

### Spark-plan budgets

| Resource       | Free / day | Notes                                     |
| -------------- | ---------- | ----------------------------------------- |
| Reads          | 50 000     | Recent + pinned + favs stream live.       |
| Writes         | 20 000     | Autosave is debounced 4.5 s; no thrash.   |
| Storage        | 1 GiB      | Text-only; entries are small.             |
| Egress         | 10 GiB/mo  | Static SPA + PWA service worker caches.    |

## Deployment

See [`DEPLOY.md`](DEPLOY.md) for the full Firebase + custom domain + CI/CD guide.

## License

MIT © Chirag Singhal.
