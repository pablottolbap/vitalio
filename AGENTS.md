# AGENTS.md

## Cursor Cloud specific instructions

Vitalio is a **fully static React 19 + Vite SPA** (npm, ESM). There is **no backend, database, or container** — all content is bundled from JSON at build time and any third-party integrations (Web3Forms, hCaptcha, Umami) are optional browser-side calls used only by the submission form / analytics.

### Services

Only one process runs locally: the **Vite dev server** (`npm run dev`).

- It serves the app under the base path `/vitalio/`, so the working URL is `http://localhost:5173/vitalio/` (the bare `http://localhost:5173/` will not render the app).

### Lint / test / build / run

Standard commands live in `package.json` scripts; a couple of non-obvious points:

- **Linting has two independent parts.** Code lint is what CI runs directly: `npx eslint src scripts --max-warnings 0`. `npm run lint` is *not* ESLint — it runs `scripts/lint.js`, which validates the content JSON data. Run both.
- **Content data pipeline.** `content/*.json` (one file per YouTube channel) is aggregated into the committed `src/data.json` via `node scripts/aggregate.js`. `data.json` is committed, so the app runs without re-aggregating. On PRs, CI runs the aggregation and fails/commits if `src/data.json` is stale — re-run `node scripts/aggregate.js` and commit if you change anything under `content/`.
- **Tests / coverage:** `npm run test` (vitest, jsdom) and `npm run coverage` (enforces thresholds: lines/functions/statements 80, branches 75).
- **Build/preview:** `npm run build` then `npm run preview`.

### Node version

CI uses Node 24; the VM's default Node 22.x also works for Vite 8 / Vitest 4. No version manager pinning is required.

### Optional env

`VITE_WEB3FORMS_ACCESS_KEY` is only needed for live submission-form email delivery; it falls back to a placeholder and is not required for local dev, tests, or browsing.
