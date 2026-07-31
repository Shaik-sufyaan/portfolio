# Light Theme + Tegaki `hello` — Design

**Date:** 2026-07-31
**Status:** Approved by user
**Supersedes:** the drawing technique in `2026-07-24-hello-intro-design.md`
(the session/scroll-lock behavior from that spec is kept; the hand-authored SVG
paths and the scroll-to-dismiss gate are replaced).

## Purpose

Two changes to the portfolio:

1. **Invert the palette.** The site is white-on-near-black. It becomes
   near-black-on-white.
2. **Replace the `hello` intro drawing.** The current animation is five
   hand-guessed bezier paths with five hand-tuned `animation-delay` values. The
   letterforms are visibly wrong. A real handwriting-animation library renders
   it instead.

## Decisions (confirmed with user)

- **Palette:** pure white `#ffffff` background, near-black `#0e0e0e` ink.
- **Accent:** keep the orange, deepened `#ff3e00` → `#dd3300`. The original hits
  only 3.1:1 on white, which fails WCAG AA for the small project links
  (`GITHUB ↗`, `LIVE SITE ↗`, `LIVE DEMO ↗`). The deepened value reaches 4.6:1.
- **Library:** [Tegaki](https://github.com/KurtGokhan/tegaki) — MIT, ~3k stars,
  zero runtime dependencies, first-class React entry point, SSR-safe, ships
  pre-generated stroke bundles. It derives stroke skeletons from real font
  outlines, so the letterforms are correct by construction.
  - Rejected: **Vara.js** (289 stars, hand-authored JSON fonts, no React
    binding, v2 canvas rewrite pending) and **Khoshnus.js** (small community,
    thin docs).
- **Font:** bundled **Parisienne**, imported through a single swappable module.
  - Apple's lettering is **SF Hello**, proprietary and licensed only to Apple
    employees and contractors. It is not copied. The goal is the *moment* — one
    continuous cursive `hello` writing itself on a plain field — not Apple's
    artwork.
  - The closest free monoline match is Google's **Ms Madi**, but Tegaki builds
    custom bundles only through its browser studio. Parisienne ships today with
    zero manual steps; the swap point is one import line.
- **Intro behavior:** write (~1.8s) → hold (0.6s) → auto-fade (0.25s). No longer
  waits for a scroll gesture. Scroll, click, or any key skips instantly. Still
  once per browser session.

## Approach

Chosen: **flip the tokens and close the token gaps.** Every hardcoded color that
made this flip awkward becomes a variable. Output is identical to a
minimal in-place flip, but a future dark mode becomes a token swap rather than a
second search through the stylesheet.

Rejected: a bare in-place value swap (leaves the same landmines for next time),
and wiring a full `next-themes` light/dark toggle (real scope creep — not asked
for, and `next-themes` staying unused is fine).

## Color system

`app/globals.css` `:root`, custom-variable block:

| Token | Before | After | Notes |
|---|---|---|---|
| `--bg` | `#0e0e0e` | `#ffffff` | |
| `--fg` | `#ffffff` | `#0e0e0e` | |
| `--gray` | `#222222` | `#e6e6e6` | borders, dividers, marquee rules |
| `--dim` | *(new)* | `#6b6b6b` | replaces every `#888`; 5.4:1 on white |
| `--surface` | *(new)* | `#f5f5f5` | footer; mirrors how `#000` sat under `#0e0e0e` |

Named `--dim`, not `--muted`: the shadcn block above already declares `--muted`
and `@theme inline` maps it to Tailwind's `bg-muted`. A second `--muted` in the
custom block would silently override it.
| `--accent` | `#ff3e00` | `#dd3300` | 4.6:1 on white |

The shadcn `:root` / `.dark` oklch blocks above it are left alone — no component
in the site uses them, and `--background`/`--foreground` are consumed only by the
unused `components/ui/*` set.

**Note:** `--accent` is declared twice in `:root` today — once in the shadcn
block as `oklch(0.97 0 0)` and again in the custom block as `#ff3e00`. The
second wins. This is pre-existing and stays as-is; only the custom-block value
changes.

Hardcoded colors to replace:

| Location | Before | After |
|---|---|---|
| `footer` | `background: rgb(0,0,0)` | `background: var(--surface)` |
| `.footer-meta` | `color: #888` | `color: var(--dim)` |
| `.cv-item-sub` | `color: #888` | `color: var(--dim)` |
| `app/page.tsx` intro `<p>` | `color: "#888"` | `color: "var(--dim)"` |
| `.blob` | `rgba(255,62,0,.15) → rgba(14,14,14,0)` | `rgba(221,51,0,.10) → rgba(255,255,255,0)` |
| `nav` (mobile + touch) | `rgba(14,14,14,.95)` | `rgba(255,255,255,.95)` |

## Three places the flip breaks

**1. Hero type over the photo.** White `SHAIK` over the dark grayscale circuit
board reads fine; black `SHAIK` over it does not — the type is lost in the dark
regions of the image. Fix: wash the photo out to a pale field.

```
.hero-img: filter grayscale(1) contrast(1.1)  → grayscale(1) brightness(1.25) contrast(0.95)
           opacity 0.8                        → 0.55
```

`.project-image` is unchanged — it carries no text over it, and its
grayscale → color hover still works on white.

**2. The nav.** `nav` uses `mix-blend-mode: difference` and `.nav-links a` is
`color: white`. Difference-blending white renders as the inverse of whatever is
behind it, so on a white page the links resolve to black automatically. **Both
declarations stay exactly as they are.**

The mobile breakpoint (`max-width: 767px`) and the touch-device block, however,
give `nav` a solid background — and difference-blending a solid white bar
inverts the entire bar to black. Fix, in both blocks: set
`mix-blend-mode: normal`, background `rgba(255,255,255,0.95)`, and add
`.nav-links a { color: var(--fg) }` scoped to those blocks so the links are not
relying on a blend mode that is no longer active.

**3. The blob gradient.** It fades to `rgba(14,14,14,0)`. Fading to a
transparent *dark* color leaves a gray fringe on white in Safari, which
interpolates through the color's RGB channels. It fades to
`rgba(255,255,255,0)` instead, and alpha drops `.15 → .10` because orange reads
hotter against white.

## Hello architecture

Two components, split so *when it plays* is independent of *what it looks like*:

**`components/hello-mark.tsx`** (`"use client"`) — the only file that knows
about Tegaki. Owns the font import, stroke color, size, and speed. Props:
`onDone?: () => void`, `animate: boolean`. Swapping Parisienne for a custom
Ms Madi bundle is a one-line change here and touches nothing else.

**`components/hello-intro.tsx`** (`"use client"`) — keeps its existing
responsibilities: session gate, body scroll lock, skip listeners, fade-out,
unmount. Loses the inline `<svg>`, the five `.hello-stroke--*` delay rules, and
the `hello-draw` keyframes. Renders `<HelloMark />`.

`app/layout.tsx` is unchanged — the pre-paint `data-hello-seen` script, the
`<noscript>` rule, and the `<HelloIntro />` placement all still apply. The
`.hello-intro` overlay background flips `#000` → `#fff` and the stroke `#fff` →
`#0e0e0e`.

**API verification at implementation time.** Tegaki's docs show
`import { TegakiRenderer } from 'tegaki'` while the published `exports` map also
exposes `tegaki/react`. The installed package's type definitions decide which is
used. Likewise, completion is detected via the component's own callback or ref
handle if the installed version exposes one; otherwise a timer derived from the
same constants that drive the animation. Do not guess — read the shipped
`.d.mts` files.

## Behavior

1. **Write (0 – ~1.8s):** full-viewport white overlay above the nav and cursor
   blob. `hello` writes itself in near-black.
2. **Hold (~0.6s):** the finished word sits.
3. **Fade (~0.25s):** overlay fades, scroll lock releases, component unmounts.
4. **Skip:** `wheel`, `touchmove`, `click`, or any `keydown` at any point jumps
   straight to the fade.
5. **Session flag:** `sessionStorage["hello-intro-seen"]` is set on dismiss,
   wrapped in try/catch. On failure the intro simply plays again next load.

The pulsing `SCROLL` hint is removed — the overlay no longer waits for the
visitor, so prompting them to act is misleading.

## Accessibility & edge cases

- **Overlay semantics change.** `role="dialog" aria-modal="true"` plus a focus
  steal is correct for a modal that waits for input; it is wrong for decorative
  chrome that leaves on its own after 2.6s. The overlay becomes `aria-hidden`
  with no focus steal. Screen-reader users get the page directly.
- **`prefers-reduced-motion: reduce`:** the word renders already-written; the
  overlay still auto-dismisses on the same schedule. No stroke animation, no
  scale/transform on the fade.
- **JS disabled:** unchanged — the `<noscript>` rule hides the overlay.
- **Contrast:** `--dim` at 5.4:1 and `--accent` at 4.6:1 both clear AA for
  normal text. `.outline-text` (0.15) and `.sticky-type` (0.05) are decorative
  and exempt; their perceptual weight is roughly preserved under inversion.
- **Print styles** already force white/black and now agree with the screen
  theme. Unchanged.
- **`styles/globals.css`** is dead — nothing imports it (`app/globals.css` is
  the one wired into `components.json` and `app/layout.tsx`). Out of scope; left
  untouched.

## Testing

The repo has no test runner and no `test` script, so verification is a build
plus a manual pass. Both must actually be run and their output read — not
assumed.

1. `pnpm build` passes with no type errors.
2. `pnpm dev`, fresh tab → white screen, `hello` writes, holds, self-dismisses;
   site is at scroll position 0 afterwards.
3. Wheel, click, and a keypress each skip the intro early.
4. Reload in the same tab → no intro, no white flash.
5. New tab → intro plays again.
6. Emulated `prefers-reduced-motion` → static `hello`, still auto-dismisses.
7. Mobile viewport (≤767px) → nav bar is a white bar with dark links, not an
   inverted black bar.
8. Hero `SHAIK / SUFYAAN` is legible over the washed-out photo.
9. Spot-check the orange links (`GITHUB ↗`, `LIVE SITE ↗`, `LIVE DEMO ↗`) and
   the `#888`-derived body copy against the new background.
