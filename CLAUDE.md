# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Vanilla JS** (ES6 modules) — no framework
- **Webpack 5** — bundler, dev server on port 3000
- **Bootstrap** + Bootstrap Icons — UI, bundled locally in `source/bootstrap/` (planned removal)
- **Axios** — HTTP client
- **OpenAI SDK** — client-side, `gpt-4o-mini` (planned replacement with Claude API)
- **Playwright** + **Faker.js** — E2E testing
- **Docker** — containerized deployment; backend at port 3001, frontend at 3000, MongoDB

Backend: separate repo (Node/Express + MongoDB). Run: `npm run api` (nodemon, port 3001). MongoDB: `mongodb://db:27017/fea_test` (Docker service named `db`).

## Commands

```bash
npm run dev       # Webpack dev server at http://localhost:3000
npm run prod      # Production build to /public/

npx playwright test                                              # Run all tests
npx playwright test source/tests/specs/001.addNewWord.spec.ts   # Single test file
npx playwright test --grep "test name"                          # By test name
npx playwright test --headed                                    # Show browser
```

Dev server and backend (fea_api at `http://127.0.0.1:3001`) must both be running for Playwright tests.

## Architecture

### Routing — two separate attribute systems

`data-name` drives **inter-page navigation** (routing between sections/pages). `data-action` drives **intra-page actions** (buttons within a page). These are distinct — don't confuse them.

`source/index.js` attaches one click listener to `.actionRoot` and delegates by `data-name`. Each section module exposes a `renderPage()` method. Pages pass navigation callbacks to each other:
```js
new TrainingList(deck, () => new StudyDictionary().renderPage())
```

### Page class pattern

Pages are ES6 classes exported as singletons (`export default new ClassName()`). Core methods: `renderPage()` injects HTML into `.actionRoot`, then attaches event listeners. DOM is fully replaced on each navigation — there is no lifecycle or state persistence between navigations. Within a session, state lives in module-level variables.

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

No CSS variables. Per-feature files in `source/styles/`. Base button class `.myBtn` with color modifiers: `.hardBtn`, `.goodBtn`, `.easyBtn`, `.findNewBtn`, etc. System colors (hardcoded): success `#94FF94`, failed `#FF8C8C`, muted `#E6E6E6`. Bootstrap + Icons bundled locally in `source/bootstrap/`.

### Tests

Page Object Model in `source/tests/pageObjects/`, shared helpers in `source/tests/snippets/`. Faker.js for test data. Most tests currently marked `.skip`.

### CI

GitHub Actions (`.github/workflows/`) runs Playwright against pre-built Docker images: `feelmax/fea_api:3001` + `feelmax/fea_ui:3000` with MongoDB. CI waits for UI readiness via curl polling before running tests.
