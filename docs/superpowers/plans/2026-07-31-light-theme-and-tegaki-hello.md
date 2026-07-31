# Light Theme + Tegaki `hello` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Invert the portfolio's palette to near-black-on-white, and replace the hand-authored SVG `hello` intro with Tegaki, which derives stroke skeletons from real font outlines.

**Architecture:** All color lives in the custom-variable block of `app/globals.css`; every hardcoded color in the stylesheet and in `app/page.tsx` is replaced by a token so the theme is one place. The intro splits in two: `hello-mark.tsx` owns *what the writing looks like* (font bundle, size, ink) and `hello-intro.tsx` owns *when it plays* (session gate, scroll lock, skip listeners, fade).

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind v4, `tegaki@0.22.1`, pnpm.

---

## Verification approach — read this before Task 1

This repo has **no test runner**: `package.json` has no `test` script and no testing dependency. Adding Vitest + React Testing Library to unit-test a CSS color flip and a 2.6-second overlay would be a larger change than the feature itself, and the user asked for neither. So this plan does not contain fake unit tests. Verification is:

1. **`pnpm exec tsc --noEmit`** — the real typecheck.
   `next.config.mjs` sets `typescript: { ignoreBuildErrors: true }`, so **`pnpm build` does not fail on type errors.** Never treat a green build as a green typecheck.
2. **`pnpm build`** — catches module-resolution and bundling failures (the realistic risk with a new ESM-only dependency).
3. **A manual pass on `pnpm dev`**, scripted step-by-step in Task 7.

Every "Run:" step means *actually run it and read the output*. Do not report a step as passing without it.

---

## File structure

| File | Responsibility | Change |
|---|---|---|
| `package.json` / `pnpm-lock.yaml` | dependency manifest | Modify — add `tegaki` |
| `app/globals.css` | all site color + layout | Modify — tokens, hardcoded colors, hero wash, nav mobile |
| `app/page.tsx` | page markup | Modify — one inline `#888` |
| `components/hello-mark.tsx` | the `hello` glyphs: font bundle, ink, size | **Create** |
| `components/hello-intro.tsx` | overlay lifecycle: session gate, lock, skip, fade | Modify — rewrite |
| `app/layout.tsx` | pre-paint seen-flag, noscript, mount point | **No change** |

---

### Task 1: Add the Tegaki dependency

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Install**

```bash
pnpm add tegaki
```

Expected: `+ tegaki 0.22.1` in the output. A warning about ignored build scripts for `sharp` is pre-existing and unrelated — ignore it.

- [ ] **Step 2: Verify the subpath exports resolve**

Run:

```bash
node -e "import('tegaki/react').then(m=>console.log('react ok:', typeof m.TegakiRenderer)); import('tegaki/fonts/parisienne').then(m=>console.log('font ok:', m.default?.family))"
```

Expected: `react ok: function` (or `object` — it is a `forwardRef` result, both are acceptable; `undefined` is a failure) and `font ok:` followed by a family name string.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: add tegaki for the hello handwriting animation"
```

---

### Task 2: Flip the color tokens

**Files:**
- Modify: `app/globals.css:41-47` (the custom-variable block inside `:root`)

- [ ] **Step 1: Replace the custom-variable block**

The block currently reads:

```css
  /* Adding custom design variables from HTML */
  --bg: #0e0e0e;
  --fg: #ffffff;
  --accent: #ff3e00;
  --gray: #222222;
  --syne: "Syne", sans-serif;
  --inter: "Inter", sans-serif;
```

Replace with:

```css
  /* Adding custom design variables from HTML */
  --bg: #ffffff;
  --fg: #0e0e0e;
  --accent: #dd3300;
  --gray: #e6e6e6;
  /* Muted body copy. Named --dim, not --muted: the shadcn block above already
     declares --muted and @theme inline maps it to Tailwind's bg-muted. */
  --dim: #6b6b6b;
  /* Footer plate — sits just off --bg, mirroring how #000 sat under #0e0e0e. */
  --surface: #f5f5f5;
  --syne: "Syne", sans-serif;
  --inter: "Inter", sans-serif;
```

Do **not** touch the shadcn `:root` oklch declarations above this block or the `.dark` block below it. Nothing on the page consumes them — they feed `components/ui/*`, which the page does not import.

- [ ] **Step 2: Look at it**

Run: `pnpm dev`, open `http://localhost:3000`.
Expected: the site is now black-on-white. It will look wrong in three specific places — hero type lost in the photo, a black inverted nav bar on mobile widths, muted `#888` text that is too light. Tasks 3–5 fix exactly those. Confirm the *background* flipped and the page is otherwise intact.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: flip palette tokens to near-black on white"
```

---

### Task 3: Replace every hardcoded color

**Files:**
- Modify: `app/globals.css` — `footer`, `.footer-meta`, `.cv-item-sub`, `.blob`
- Modify: `app/page.tsx:121`

- [ ] **Step 1: Footer plate**

In the `footer` rule:

```css
footer {
  padding: 100px 0px;
  background: var(--surface);
}
```

- [ ] **Step 2: Muted text — three places**

`.footer-meta`:

```css
.footer-meta {
  display: flex;
  justify-content: space-between;
  font-family: var(--syne);
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--dim);
}
```

`.cv-item-sub`:

```css
.cv-item-sub {
  color: var(--dim);
  font-weight: 300;
  margin-top: 6px;
  font-size: 0.95rem;
}
```

And in `app/page.tsx`, the intro paragraph's inline style — change `color: "#888"` to:

```tsx
                  color: "var(--dim)",
```

- [ ] **Step 3: The cursor blob**

```css
.blob {
  position: fixed;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(221, 51, 0, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
  transition: transform 0.1s ease-out;
}
```

The end stop must fade to transparent **white**, not transparent dark. Safari interpolates gradients through the RGB channels, so `rgba(14,14,14,0)` leaves a gray fringe on a white page. Alpha drops `.15 → .10` because orange reads hotter against white.

- [ ] **Step 4: Confirm no hardcoded colors are left**

Run:

```bash
grep -n "#888\|rgb(0, 0, 0)\|14, 14, 14" app/globals.css app/page.tsx
```

Expected: only two hits remain, both in the `@media (max-width: 767px)` and `@media (hover: none)` nav blocks — Task 4 handles those. Any other hit is a miss; fix it before continuing.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/page.tsx
git commit -m "feat: replace hardcoded dark-theme colors with tokens"
```

---

### Task 4: Fix the nav on mobile and touch

**Background — do not skip.** `nav` sets `mix-blend-mode: difference` and `.nav-links a` sets `color: white`. Difference-blending white renders as *the inverse of whatever is behind it*, so on a white page the links resolve to black on their own. **Leave both of those declarations exactly as they are** — they are the reason the nav stays legible over the hero photo.

The problem is only where a solid background is added: difference-blending a solid white bar inverts the whole bar to black.

**Files:**
- Modify: `app/globals.css` — `@media (max-width: 767px)` nav rules, `@media (hover: none) and (pointer: coarse)` nav rule

- [ ] **Step 1: Mobile breakpoint**

Inside `@media (max-width: 767px)`, the `nav` rule becomes:

```css
  nav {
    padding: 20px;
    flex-direction: column;
    gap: 15px;
    background: rgba(255, 255, 255, 0.95);
    /* A solid plate and difference blending cannot coexist — the blend would
       invert the whole bar. Opt out here and set the link color directly. */
    mix-blend-mode: normal;
  }
```

And the `.nav-links a` rule in that same block gains a color:

```css
  .nav-links a {
    font-size: 0.75rem;
    color: var(--fg);
  }
```

- [ ] **Step 2: Touch-device block**

Inside `@media (hover: none) and (pointer: coarse)`:

```css
  nav {
    background: rgba(255, 255, 255, 0.95);
    mix-blend-mode: normal;
  }

  .nav-links a {
    color: var(--fg);
  }
```

- [ ] **Step 3: Verify in the browser**

Run: `pnpm dev`, open devtools, set the viewport to 375px wide.
Expected: a white nav bar with dark `WORK / ABOUT / CONTACT` links. **Not** a black bar. Then set the viewport back above 768px and scroll the hero — the nav must still invert itself against the photo.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "fix: opt mobile nav out of difference blending on a light page"
```

---

### Task 5: Wash out the hero photo

**Files:**
- Modify: `app/globals.css` — `.hero-img`

- [ ] **Step 1: Change the filter and opacity**

```css
.hero-img {
  position: absolute;
  width: 500px;
  height: 700px;
  object-fit: cover;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  /* The hero type sits on top of this at z-index 10. White type read fine over
     a dark photo; black type does not — it disappears into the dark regions.
     Brighten and fade the image into a pale field instead. */
  filter: grayscale(1) brightness(1.25) contrast(0.95);
  opacity: 0.55;
}
```

Leave `.project-image` alone — it carries no text over it, and its grayscale → color hover still works against white.

- [ ] **Step 2: Verify**

Run: `pnpm dev`, look at the hero at a desktop width.
Expected: `SHAIK` (solid) and `SUFYAAN` (outline) are both clearly legible across the full width of the photo, including where the circuit board is darkest.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "fix: wash out hero photo so black display type stays legible"
```

---

### Task 6: Build the Tegaki `hello`

Two files. `hello-mark.tsx` is created first because `hello-intro.tsx` imports a constant from it.

**Files:**
- Create: `components/hello-mark.tsx`
- Modify: `components/hello-intro.tsx` (full rewrite)

**API notes — verified against the installed `tegaki@0.22.1` type definitions, not guessed:**

- `TegakiRenderer` accepts every `TegakiEngineOptions` field as a prop, including `font`, `time`, and `onComplete`.
- `time={{ mode: 'uncontrolled', duration: N }}` stretches one iteration to exactly `N` seconds. `duration` is mutually exclusive with `speed`/`catchUp`.
- `time="100%"` is shorthand for `{ mode: 'controlled', value: 1, unit: 'progress' }` — the finished word, no animation.
- Ink color and size come from **CSS on the container**: the engine reads `getComputedStyle(root).color` and `.fontSize`. There is no color prop.
- **The reduced-motion gotcha:** the engine reads `prefers-reduced-motion` itself and refuses to start its RAF loop when it is set — but it only jumps time to the end on a *change* event, not at construction. A visitor who loads the page with reduced motion already on would get a **blank overlay**. That is why `animate` is resolved in the host and switches `time` to the controlled `"100%"` form.
- `onComplete` fires from inside the RAF loop, so it **never fires in controlled mode**. The reduced-motion path needs its own timer.

- [ ] **Step 1: Create `components/hello-mark.tsx`**

```tsx
"use client"

import parisienne from "tegaki/fonts/parisienne"
import { TegakiRenderer } from "tegaki/react"

/**
 * The `hello` glyphs and nothing else — when the intro plays is hello-intro's
 * job. Changing the handwriting style is the font import plus the `font` prop
 * here; nothing outside this file needs to know.
 *
 * To swap in a closer match to Apple's SF Hello, generate a monoline cursive
 * bundle (Ms Madi) at https://gkurt.com/tegaki/studio, drop it in, and change
 * the import. SF Hello itself is proprietary to Apple — do not ship it.
 */

/** How long the writing takes. hello-intro derives its safety timeout from this. */
export const WRITE_SECONDS = 1.8

type HelloMarkProps = {
  /** False when the visitor prefers reduced motion — renders it already written. */
  animate: boolean
  /** Fires once the last stroke lands. Never fires when `animate` is false. */
  onWritten?: () => void
}

export default function HelloMark({ animate, onWritten }: HelloMarkProps) {
  return (
    <TegakiRenderer
      className="hello-mark"
      font={parisienne}
      time={animate ? { mode: "uncontrolled", duration: WRITE_SECONDS } : "100%"}
      onComplete={animate ? onWritten : undefined}
    >
      hello
    </TegakiRenderer>
  )
}
```

- [ ] **Step 2: Rewrite `components/hello-intro.tsx`**

Replace the entire file:

```tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import HelloMark, { WRITE_SECONDS } from "./hello-mark"

const SEEN_KEY = "hello-intro-seen"

const HOLD_MS = 600
const FADE_MS = 250
/** Safety net — see the bail timer below. */
const MAX_INTRO_MS = WRITE_SECONDS * 1000 + 2000

type Phase = "intro" | "leaving" | "gone"

function hasSeenIntro() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1"
  } catch {
    return false
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1")
  } catch {
    // private browsing — intro will simply play again next load
  }
}

export default function HelloIntro() {
  const [phase, setPhase] = useState<Phase>("intro")
  // Resolved after mount: reading matchMedia during render would disagree with
  // the server-rendered HTML.
  const [animate, setAnimate] = useState(true)
  const holdTimer = useRef<number | undefined>(undefined)

  // Functional update makes this stable and idempotent — repeated calls from
  // several listeners firing at once collapse into one transition.
  const dismiss = useCallback(() => {
    setPhase((current) => (current === "intro" ? "leaving" : current))
  }, [])

  useEffect(() => {
    if (phase !== "intro") return
    if (hasSeenIntro()) {
      setPhase("gone")
      return
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimate(false)
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      dismiss()
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      dismiss()
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("keydown", dismiss)
    window.addEventListener("click", dismiss)

    // If the writing never reports completion — font fetch failed, canvas
    // context refused, tab backgrounded mid-animation — the overlay must still
    // leave. A scroll-locked white screen is worse than a truncated animation.
    const bail = window.setTimeout(dismiss, MAX_INTRO_MS)

    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("keydown", dismiss)
      window.removeEventListener("click", dismiss)
      window.clearTimeout(bail)
    }
  }, [phase, dismiss])

  const handleWritten = useCallback(() => {
    holdTimer.current = window.setTimeout(dismiss, HOLD_MS)
  }, [dismiss])

  // Reduced motion draws nothing, so onComplete never fires — hold on a timer.
  useEffect(() => {
    if (phase !== "intro" || animate) return
    const timeout = window.setTimeout(dismiss, HOLD_MS)
    return () => window.clearTimeout(timeout)
  }, [phase, animate, dismiss])

  useEffect(() => () => window.clearTimeout(holdTimer.current), [])

  useEffect(() => {
    if (phase !== "leaving") return
    markIntroSeen()
    window.scrollTo(0, 0)
    const timeout = window.setTimeout(() => setPhase("gone"), FADE_MS)
    return () => window.clearTimeout(timeout)
  }, [phase])

  useEffect(() => {
    if (phase === "gone") return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [phase])

  if (phase === "gone") return null

  return (
    <div
      className={`hello-intro${phase === "leaving" ? " hello-intro--leaving" : ""}`}
      // Decorative chrome that leaves on its own after ~2.6s. A focus trap and
      // aria-modal would be right for a dialog that waits for input; here they
      // would just put a screen reader inside a countdown.
      aria-hidden="true"
    >
      <HelloMark animate={animate} onWritten={handleWritten} />
      <style>{css}</style>
    </div>
  )
}

const css = `
.hello-intro {
  position: fixed;
  inset: 0;
  z-index: 9999; /* above the nav (z-index 1000) and the cursor blob */
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  transition: opacity ${FADE_MS}ms ease;
}
.hello-intro--leaving {
  opacity: 0;
  pointer-events: none;
}
/* Tegaki reads ink color and size off the container's computed style. */
.hello-mark {
  color: var(--fg);
  font-size: clamp(4.5rem, 20vw, 12rem);
  line-height: 1.15;
}
html[data-hello-seen] .hello-intro {
  display: none;
}
`
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no output (success). If `time="100%"` is rejected, the literal is not matching the `` `${number}%` `` template type — use `{ mode: "controlled", value: 1, unit: "progress" }` instead, which is the form the shorthand expands to.

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: build completes. If module resolution fails on `tegaki/react`, add `transpilePackages: ["tegaki"]` to `next.config.mjs` — the package is ESM-only with no `require` condition.

- [ ] **Step 5: Watch it**

Run: `pnpm dev`, hard-reload in a fresh tab.
Expected: white screen, `hello` writes in cursive over ~1.8s, holds, fades to the site. Total under 3 seconds.

- [ ] **Step 6: Commit**

```bash
git add components/hello-mark.tsx components/hello-intro.tsx
git commit -m "feat: draw the hello intro with tegaki instead of hand-authored paths"
```

---

### Task 7: Full verification pass

**Files:** none — this task only runs things.

- [ ] **Step 1: Typecheck and build**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: both succeed. Read the output; do not infer.

- [ ] **Step 2: Intro behavior**

Run `pnpm dev`, then in a **fresh tab** each time:

1. Load → `hello` writes, holds, self-dismisses. Page is at scroll position 0 after.
2. Load, then scroll immediately → intro skips to the fade at once.
3. Load, then click → skips.
4. Load, then press a key → skips.
5. Reload in the same tab → no intro at all, and no white flash.
6. New tab → intro plays again.

- [ ] **Step 3: Reduced motion**

In Chrome devtools: ⋮ → More tools → Rendering → *Emulate CSS media feature prefers-reduced-motion* → `reduce`. Load in a fresh tab.
Expected: `hello` appears **already written** — not blank, not animating — and the overlay still dismisses on its own. A blank white screen here means the `animate` flag is not reaching the `time` prop.

- [ ] **Step 4: Mobile nav**

Set viewport to 375px. Expected: white nav plate, dark links. Not a black bar.

- [ ] **Step 5: Contrast spot-check**

Look at, on white: `GITHUB ↗` / `LIVE SITE ↗` / `LIVE DEMO ↗` (orange, should read clearly), the `001 / FULL-STACK` labels, the CV headings, and the muted intro paragraph.
Expected: all comfortably readable. The orange is `#dd3300` at 4.6:1 and the muted grey `#6b6b6b` at 5.4:1 — both clear AA.

- [ ] **Step 6: Hero legibility**

Desktop width, hero section. Expected: `SHAIK` and the `SUFYAAN` outline both legible over the washed photo.

- [ ] **Step 7: Commit any fixes**

If steps 2–6 required changes, commit them:

```bash
git add -A
git commit -m "fix: verification pass corrections"
```

---

## Out of scope

- `styles/globals.css` is dead — nothing imports it (`app/globals.css` is the file wired into `components.json` and `app/layout.tsx`). Left untouched.
- The shadcn oklch `:root` / `.dark` blocks and `components/ui/*` are unused by the page. Not modified.
- No dark-mode toggle. `next-themes` stays an unused dependency, as it already is.
- `--accent` is declared twice in `:root` (shadcn `oklch(0.97 0 0)`, then the custom block's hex, which wins). Pre-existing; not untangled here.
