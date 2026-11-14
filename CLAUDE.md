# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Before you write code

Two things happen before any code change, every time — no exceptions for "small" changes.

**1. Read the architecture reference.** The technical architecture of this monorepo lives in Notion:

> **[🏗️ Platform — Technical Architecture](https://app.notion.com/p/Platform-Technical-Architecture-3d0f7dde8f43812a8ceffb9de1b09141)**

Read it before developing anything. It is the _what/how_ — what exists, how the pieces fit together, where the sensitive-data boundaries are; this file is the _rules to follow while changing it_. When the code and that document disagree, the code wins — say so explicitly and flag the drift instead of coding against the stale description.

**2. Plan before implementing.** State the plan first — which files change, in what order, and how the result gets verified — and only then start editing. For anything beyond a single obvious edit, get the plan agreed before writing code. A plan that turns out wrong mid-way is a signal to stop and re-plan, not to keep patching forward.

## Monorepo overview

Turborepo + Yarn Workspaces v1 monorepo. **Always use Yarn** — the lockfile and workspace resolution are Yarn-specific; `npm` and `pnpm` will break things.

```
apps/mobile/appointmate/    # Expo app — mental health check-in log (LGPD sensitive data)
apps/mobile/tickets-app/    # Expo app — multi-tenant ticketing, published on Play Store
apps/web/finance-app/       # Vite + React SPA — personal finance tracker (@app/finance), consumes @industry/web
packages/design-system/industry/
  web/                        # @industry/web — React components (Industry design system), no MUI/Emotion
  mobile/                     # @industry/mobile — React Native components (Industry design system), no React Native Paper
  tokens/                     # @industry/tokens — shared design tokens (TS + CSS vars), adopted by all 3 apps
packages/eslint-config/     # @repo/eslint-config — ESLint v9 flat configs
packages/typescript-config/ # @repo/typescript-config — shared tsconfigs
```

The Industry design system (`@industry/*`) is the design system used by both mobile apps (tickets-app, appointmate), migrated to it in REB-88/89/90. `@industry/web` is consumed by `apps/web/finance-app` (`@app/finance`) and documented in Storybook. Its previous generation, Vuotto Tech (`@vuotto/*`), was fully removed from the monorepo (REB-100) once the migration completed.

## Git workflow

**Always create a feature branch before starting any new task.** Never develop directly on `main`.

```sh
git checkout -b feat/<short-description>   # new feature
git checkout -b fix/<short-description>    # bug fix
git checkout -b chore/<short-description>  # tooling / maintenance
```

Open a pull request targeting `main` when the work is ready for review.

## Development guidelines

These rules apply to every workspace in this monorepo. They override generic default behavior — follow them even where they're stricter than what you'd otherwise do.

### Data protection (LGPD)

`apps/mobile/appointmate` stores **dado sensível de saúde** under LGPD (Lei 13.709/2018, Art. 5º II) — mood, sleep/energy/appetite/concentration, medication data, free-text clinical notes, all in the Firestore `forms` collection.

- **Never weaken a Firestore security rule** (`firestore.rules` in `appointmate` or `tickets-app`) without checking what data becomes exposed and to whom. The `hasOnly([...])` allow-list in `appointmate`'s rules exists specifically to stop undeclared fields from being written — extend it deliberately when adding a field, never remove it to "make a bug go away."
- **Never add a new Firestore query that isn't filtered by `userId`/ownership.** In `appointmate`, `read` in the security rules also governs `list` queries — an unfiltered query is denied outright, but the same discipline applies conceptually to `tickets-app`'s `workspace_id` scoping.
- **Do not introduce an analytics, crash-reporting, or telemetry SDK** (Sentry, Amplitude, Mixpanel, Firebase Analytics, etc.) into `appointmate` without explicit user sign-off — none exists today, and adding one silently would mean sensitive health-adjacent data starts flowing to a new third party.
- **Do not log form content.** Never `console.log`/`console.warn` a `FormValues` object, a Firestore document from `forms`, or any field derived from it — even for debugging. Log IDs and error codes, not payloads.
- **Auth tokens persist via `AsyncStorage`, not `expo-secure-store`.** If you're asked to harden token storage, that's the concrete gap — don't assume it's already hardware-backed.
- **PDF export (`expo-print`/`expo-sharing`) must stay local-and-share, not upload.** If a "send by email" or "sync to cloud" feature is ever requested, treat it as a new data-processing activity requiring its own legal-basis/consent conversation, not a trivial extension of the existing export button.
- **Minimize what you persist.** When adding a new field to any `forms`-like collection, ask whether it needs to exist at all before adding it to the schema and the rules allow-list — every field added is a field that has to be justified later.
- When in doubt about whether a change has LGPD implications, say so explicitly and ask rather than assuming it's fine — this is the one category of "obviously safe refactor" that isn't.

### Comments: default to none

**Write code without comments unless the comment is critical.** The default is zero. Do not add one proactively — not to restate what the code says, not to narrate test setup, not to explain a subtle workaround, and never to reference the current task/ticket/PR. That context belongs in the commit message and the PR description, not in the file.

A comment is critical only when it documents a constraint that is **invisible in the code** and that a future edit would break **silently** — no failing test, no error, just wrong behavior. If breaking it produces a loud failure, the failure is the documentation; don't write the comment.

The comments that currently meet that bar, as the calibration reference:

- `metro.config.js` (both mobile apps) — why `react`/`react-native`/`react-native-safe-area-context`/`react-native-svg` are pinned to app-local `node_modules`. Without it, icons and charts mount with no error and render nothing.
- `jest.config.js` — the `react` mapping that prevents a dual-instance "invalid hook call", and why `firestore.rules.test.ts` is excluded from the default run.
- `jest.setup.js` — the shape the `addListener` mock must have for `Animated`'s internal cleanup.
- `appointmate`'s `formsService.ts` — the `userId` filter is **required** by the security rules, not an optimization; a query without it is denied outright.

Everything else gets deleted. Also never write a comment explaining _what_ a function does when its name and signature already say so.

### Clean Code

- Names should make comments unnecessary: prefer `isDateOnOrAfterToday` over `checkDate`, `EMPTY_FORM_VALUES` over `defaults`.
- Small, single-purpose functions and components over large ones that branch on a mode/flag. If a screen component is doing data-fetching, validation, and rendering all inline and growing unwieldy, that's a signal to extract — but only when it's already happened, not preemptively.
- No dead code, no commented-out code, no unused exports. If it's not called anywhere, delete it rather than leaving it "in case."
- Don't add a parameter, prop, or config flag for a case that doesn't exist yet. Extend the API when the second real use case shows up, not in anticipation of one.
- Prefer explicit, narrow types over `any`/broad unions (`@typescript-eslint/no-explicit-any` is already a warn-level rule repo-wide — treat it as a hard rule, since `--max-warnings 0` fails the build on it anyway).
- Keep validation, formatting, and business-rule logic in `src/domain/` (or the equivalent plain-function layer), not inline in a component's JSX or event handler — see `isDateOnOrAfterToday`, `formatDateInput`, `isWithinTimeFilter` in `appointmate` for the pattern to follow.

### Clean Architecture

Every app in this repo already follows the same layering — keep new code inside it rather than reaching across layers:

- **Domain (`src/domain/`)** — plain TypeScript, no React, no Firebase, no navigation imports. Pure functions and types (`form.ts`, `pdf.ts`, `timeFilter.ts` in `appointmate`). This layer should be testable with zero mocks.
- **Services (`src/services/`)** — the only place that talks to Firebase (or any external system). Screens and hooks call a service function; they never import `firebase/firestore` or `firebase/auth` directly.
- **Screens/Components (`src/screens/`, `src/components/`)** — composition and presentation. Business rules belong in `domain/`, not here; data access belongs in `services/`, not here.
- **Design system (`@industry/web`, `@industry/mobile`, `@industry/tokens`)** — the only place that owns visual styling primitives (colors, spacing, component variants). App-level code should not hardcode a hex color or a magic spacing number that already exists as a token.
- Dependencies point inward: screens depend on services and domain; services depend on domain; domain depends on nothing app-specific. Never have `src/domain/` import from `src/screens/` or `src/services/`.
- Cross-cutting state (`AuthContext` in `appointmate`, the Zustand `useAuthStore` in `tickets-app`) is a single, explicit place per app — don't introduce a second competing state mechanism in the same app for the same concern.

### Language & framework knowledge

- **TypeScript everywhere**, `strict: true` + `noUncheckedIndexedAccess: true` (`@repo/typescript-config/base.json`) — don't disable strictness locally to make a type error go away; fix the type.
- **React 19** across all apps — no `React.FC`, prefer plain function components; hooks rules are enforced by `eslint-plugin-react-hooks` in the `react-internal` config.
- **Fonts (`tickets-app`, `appointmate`)** — Inter 400/500/600 is embedded at build time by the `expo-font` config plugin in each app's `app.json`, as one family named `Inter`. A font change needs a new native build, not just a Metro reload. Every app text style must set `fontFamily` from `@industry/tokens` (React Native has no global default font); each app's `src/typography.test.ts` enforces this for `*.styles.ts` files.
- **Expo SDK 57 / React Native 0.86.3 (`tickets-app`, `appointmate`, and `@industry/mobile`'s dev dependency)** — both apps pin `react`/`react-native`/`react-native-paper` to their own local `node_modules` via a custom Metro `resolveRequest` (see either app's `metro.config.js`). Do not "simplify" that resolver — it exists because a hoisted, differently-versioned copy of these packages breaks at runtime with an opaque renderer error. When adding a new native-module dependency to a mobile app, check whether it also needs a `nohoist` entry in the root `package.json`.
- **React Native Paper + Portals (`Dialog`, `Menu`)** — these rely on React Context identity to find their `PortalHost`. If a Portal-based component works in the app but crashes with an opaque error in Jest, suspect a dual-module-instance problem before anything else (see `appointmate/jest.config.js`'s `react-native-paper` `moduleNameMapper` entry and its inline comment for the full explanation).
- **Firebase (`firebase` v11, modular SDK)** — always use `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })` on React Native, never bare `getAuth()`, or session persistence silently breaks. Firestore composite indexes (`firestore.indexes.json`) are required whenever a query combines an equality filter with an `orderBy` on a different field — the local emulator won't catch a missing index, but production will fail at query time.
- **react-hook-form (`appointmate`)** — validation rules live on the `Controller`, not hand-rolled in `onChange` handlers. A "save draft" path that must skip validation should read `getValues()` directly rather than going through `handleSubmit`.
- **ESLint (`eslint-plugin-only-warn`)** — every rule in this repo is surfaced as a warning, not an error; `--max-warnings 0` in each workspace's `lint` script is what actually enforces it. Treat any lint warning as build-breaking, not advisory.

## Commands

### From repo root

```sh
yarn install          # install all workspaces in one shot
yarn dev              # runs each workspace's persistent dev script in parallel (the design-system packages' `tsup --watch` — not Storybook, start that per-package with `yarn workspace <pkg> storybook`)
yarn build            # build all packages and apps (respects turbo dep order)
yarn lint             # ESLint across all workspaces
yarn check-types      # TypeScript across all workspaces
yarn format           # Prettier write
yarn format:check     # Prettier check (CI)
```

### Tests

Every workspace resolves the same `jest@30.3.0`, hoisted at the repo root. Jest 30 renamed `--testPathPattern` to `--testPathPatterns` (plural); the singular form exits 1.

```sh
yarn workspace @app/appointmate test                          # full suite
yarn workspace @app/appointmate test --testPathPatterns=Home  # a single file
```

Run these from the repo root — `yarn workspace <pkg> test` from inside the package directory fails with Yarn v1's help output.

### @industry/web (`packages/design-system/industry/web`)

```sh
yarn workspace @industry/web storybook        # Storybook dev on :6010
yarn workspace @industry/web build-storybook  # static build
```

### @industry/mobile (`packages/design-system/industry/mobile`)

```sh
yarn workspace @industry/mobile storybook  # Storybook dev on :6011
yarn workspace @industry/mobile jest       # Jest (node env, babel-jest only)
```

## Architecture

### Design system layers

Industry has a single appearance: deep navy background, filled rounded surfaces with a soft outline, a blue gradient with glow on primary actions, and Inter in sentence case. There is no light theme — the OS color scheme changes nothing.

- **`@industry/tokens`** — the source of truth for colors, spacing, radii, font sizes, gradients and glow. `scripts/build-tokens.mjs` is the single origin: it generates the TypeScript constants and the `colors.css`/`gradients.css` custom properties from the same definitions, and fails the build when a text/surface pair drops below 4.5:1 or a control border below 3:1. Never hand-edit a generated file; change the generator and run `yarn workspace @industry/tokens build`.
- **`@industry/web`** — React components, own implementation (no MUI/Emotion), themed from `@industry/tokens` via CSS custom properties. Documented in Storybook; visual regression tests run via Chromatic on every push/PR to `main` that touches `packages/design-system/industry/web/` or `industry/tokens/`.
- **`@industry/mobile`** — React Native components, own implementation (no React Native Paper), themed from `@industry/tokens` via `StyleSheet.create`. Tests run in Node env (not jsdom) with a minimal Babel config that bypasses `metro-react-native-babel-preset`. `GradientSurface` is the only place that draws a gradient or glow: it uses React Native's `experimental_backgroundImage` and `boxShadow`, which need the New Architecture (`react-native >= 0.76`). Verified on Android only; on iOS a shadow or glow on the same view that clips its corners is unverified. The web Storybook preview cannot draw the native gradient or `react-native-svg`, so affected stories carry a visible notice.

### CI workflows

| Workflow                        | Trigger                                                                                           | What it does                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `coverage.yml`                  | PR → main (tickets-app, appointmate, finance-app, industry/{web,mobile,tokens} paths)             | Runs Jest only on changed source files; enforces ≥ 95% coverage on those files |
| `deploy-finance-app.yml`        | Push → main (finance-app, industry/{web,tokens} paths) + manual                                   | Builds finance-app and deploys it to Vercel (`--prebuilt`)                     |
| `storybook-vercel.yml`          | Push → main (industry/{web,mobile,tokens} paths) + manual                                         | Builds both Storybooks and deploys them to Vercel                              |
| `web-apps.yml`                  | PR → main (apps/web, industry/web, industry/tokens, eslint-config, typescript-config paths)       | Lint/check-types/test for finance-app                                          |
| `mobile-apps.yml`               | PR → main (mobile apps, industry/mobile, industry/tokens, eslint-config, typescript-config paths) | Lint/check-types/test for appointmate + tickets-app                            |
| `storybook-industry-web.yml`    | Push/PR → main (industry/web, industry/tokens paths)                                              | Chromatic publish for `@industry/web`                                          |
| `storybook-industry-mobile.yml` | Push/PR → main (industry/mobile, industry/tokens paths)                                           | Chromatic publish for `@industry/mobile`                                       |
| `version.yml`                   | Push → main (`.changeset/**`)                                                                     | Opens/updates the Changesets "Version Packages" PR                             |
| `copilot-review.yml`            | PR opened/synchronized (any)                                                                      | Requests a Copilot code review                                                 |
| `auto-update-prs.yml`           | Push → main                                                                                       | Merges `main` into open PRs                                                    |

## ESLint configs

Three flat-config exports from `@repo/eslint-config`:

- `base` — any TypeScript package
- `react-internal` — React packages (e.g. `@industry/web`)
- `next-js` — Next.js apps; kept for future use, no workspace consumes it today

`eslint-plugin-only-warn` converts errors to warnings in all configs.
