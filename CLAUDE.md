# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow Rules

- **Never commit.** The user always reviews changes first and commits manually. Claude prepares changes and reports "ready for review" — nothing more.
- **Never push** to remote unless explicitly asked.

## Tech Stack

- **Vanilla JS** (ES6 modules) — no framework
- **Webpack 5** — bundler, dev server on port 3000
- **CSS architecture** — ITCSS (tokens / reset / base / layout / components / pages) + design tokens as CSS custom properties in `source/styles/01-tokens/`. No CSS framework; Bootstrap fully removed.
- **ESLint** — linting config in `.eslintrc.js`, run via `npm run lint`
- **Axios** — HTTP client
- **OpenAI SDK** — client-side, `gpt-4o-mini` (planned replacement with Claude API)
- **Playwright** + **Faker.js** — E2E testing
- **Docker** — containerized deployment; backend at port 3001, frontend at 3000, MongoDB

Backend: separate repo (Node/Express + MongoDB). Run: `npm run api` (nodemon, port 3001). MongoDB: `mongodb://db:27017/fea_test` (Docker service named `db`).

## Commands

```bash
npm run dev       # Webpack dev server at http://localhost:3000
npm run prod      # Production build to /public/
npm run lint      # ESLint over source/

npx playwright test                                              # Run all tests
npx playwright test source/tests/specs/001.addNewWord.spec.ts   # Single test file
npx playwright test --grep "test name"                          # By test name
npx playwright test --headed                                    # Show browser
```

Dev server and backend (fea_api at `http://127.0.0.1:3001`) must both be running for Playwright tests.

## Architecture

### Routing — two levels + two attribute systems

**Top-level routing** is handled by `Router` in `source/core/Router.js`. `source/index.js` constructs the Router with a registry of top-level sections (currently `vocabulary`, `speaking`) and calls `router.start()`, which attaches a single delegated click listener to `.l-container`. The Router catches clicks on elements with `data-name` that match its registry and runs `navigate(name)` — unmounting the current page and mounting the next one.

**Intra-page actions** use `data-action` — those are handled by each page's own listeners. Don't confuse `data-name` (inter-page, Router-owned) with `data-action` (intra-page).

**Nested page-to-page navigation** within a section (e.g. Vocabulary → NewDictionaryPage) is not routed through the Router. Sub-page transitions instantiate the next `PageController` directly and unmount the current one:
```js
await this.unmount()
const next = new NewDictionaryPage()
await next.mount({ speechPart: name })
```
The Router ignores unknown `data-name` values, so these page-local handlers run independently of Router state.

**URL sync is not implemented.** Everything lives at `/` — no history API, no deep-links, no back-button. Planned as a later task.

### Page lifecycle — PageController

`source/core/PageController.js` is the base class for lifecycle-managed pages: `mount()` / `unmount()` template methods with `onMount()` / `onUnmount()` override points. Under the hood it owns an `AbortController` — its helpers `addListener(element, event, handler)`, `setTimeout(callback, ms)`, `setInterval(callback, ms)`, and `fetch(url, options)` all bind to `signal`, so `unmount()` triggers `abort()` and the browser removes everything automatically. A `setHTML(element, trustedTemplate)` helper marks every innerHTML site as an XSS boundary (Phase 6.3 will add sanitization).

All page modules (Vocabulary + Speaking, 15 files total) extend `PageController` and are exported as classes — no singleton instances. Router rejects any registered route whose controller isn't a `PageController` subclass/instance.

New pages must extend `PageController`. File naming convention: `XxxPage.js` for all page files.

### Shared UI components

`source/utils/constants.js` contains reusable HTML template strings used across pages:
- `getModalWindow()` — modal with `data-action` buttons
- `spinner` — loading indicator shown during API calls
- `feedbackArea` — 3-button SRS panel (HARD / GOOD / EASY)
- `clear_icon`, `add_icon` — SVG icon buttons

`source/utils/utils.js` contains: `makeRequest()` (Axios wrapper — note method type is `"UPDATE"` not `"PUT"`), SRS helpers (`checkAvailableStudyWords`, `modifyStudyLevel`), `fillProgressBar()`, `colorizeDeck()` (HSL color generator avoiding 5° hue conflicts), `setTimer()`.

### Backend communication

All API calls go through `makeRequest()` in `source/utils/utils.js`. Base URL hardcoded in `source/utils/constants.js`: `http://127.0.0.1:3001/api`. No try/catch around API calls currently.

Key endpoints:
- `GET/POST/DELETE /api/words/study/` — user's active study list
- `PUT /api/words/study/:id` — update word + trigger SRS recalculation
- `GET /api/words/init/` — master dictionary
- `GET/POST /api/decks/init/` — word categories

**StudyWord schema** (MongoDB via Mongoose):
```
{ word, translate, wordType, studyInterval: Number (default 1), coefficient: Number (default 2.5), nextShowDate: Date }
```
`resolution` is not stored in DB — sent by frontend on PUT, consumed by SRS logic, then discarded.

### SRS system

Interval calculations happen in the backend (`~/Desktop/FEA_API/helpers/srs.js`). Frontend only determines availability:
```js
word.studyInterval === 1 || new Date(word.nextShowDate) <= Date.now()
```
User feedback sent as `resolution` on `PUT /api/words/study/:id`. Backend effects:
- `EASY` — coefficient `+0.15` (max 90), interval `× coefficient` (max 180 days)
- `GOOD` — coefficient unchanged, interval `× coefficient` (max 180 days)
- `HARD` — coefficient `−0.3` (min 1.3), interval `× coefficient`
- `FAIL` — coefficient `−0.45` (min 1.3), interval reset to 1 day

### OpenAI integration

Client-side only (`source/utils/chatGptApi.js`), `dangerouslyAllowBrowser: true`. API key entered by user in UI — never persisted. Model: `gpt-4o-mini`. Functions: `getTopicList()` (speaking topics), `verifyRawEssayByGpt()` (essay feedback with level A2–C2).

### Styles

ITCSS structure in `source/styles/`: `01-tokens` → `02-reset` → `03-base` → `04-layout` → `05-components` → `06-pages`. Entrypoint is `source/styles/main.css`. Design tokens (colors, spacing, typography, radii, shadows) live in `01-tokens/` as CSS custom properties — reference them via `var(--color-success)` etc., don't hardcode. Mascot PNGs live alongside the Memonk brand assets and are integrated where configured (see Phase 5 branding). Bootstrap + Bootstrap Icons fully removed.

### Tests

Page Object Model in `source/tests/pageObjects/`, shared helpers in `source/tests/snippets/`. Faker.js for test data. Most tests currently marked `.skip`.

### CI

GitHub Actions (`.github/workflows/`) runs Playwright against pre-built Docker images: `feelmax/fea_api:3001` + `feelmax/fea_ui:3000` with MongoDB. CI waits for UI readiness via curl polling before running tests.
