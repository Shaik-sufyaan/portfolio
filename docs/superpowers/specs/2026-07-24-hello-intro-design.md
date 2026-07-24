# Hello Intro Animation — Design

**Date:** 2026-07-24
**Status:** Approved by user

## Purpose

When a visitor opens the site, they see a pure-black screen on which a white
cursive "hello" writes itself stroke-by-stroke, in the style of the iPhone/Mac
setup screen. The overlay then waits; the visitor's first scroll gesture fades
it away and reveals the portfolio underneath. The intro plays once per browser
session.

## Decisions (confirmed with user)

- **Frequency:** once per browser tab session (`sessionStorage` flag).
- **Content:** a single "hello" in English — no language cycling.
- **Reveal:** scroll-triggered. The overlay stays after the writing finishes;
  the first scroll gesture fades it out (~0.8s) and unveils the site.
- **Technique:** Approach A — SVG stroke-drawing (`stroke-dasharray` /
  `stroke-dashoffset` CSS keyframes) with a cursive "hello" path. Zero new
  dependencies. (Rejected: B — italic-font typewriter, reads as keyboard
  typing, not handwriting; C — Framer Motion, adds a dependency for one
  intro.)

## Architecture

One new client component plus a first-paint guard in the root layout:

- **`components/hello-intro.tsx`** (`"use client"`): self-contained overlay —
  markup, a plain `<style>` element with the component's CSS, SVG path, and
  all behavior. No props, no external state. Rendered in `app/layout.tsx`
  directly above `{children}`.
- **`app/layout.tsx`**: renders `<HelloIntro />` and an inline `<script>` in
  `<head>` that runs before first paint: if `sessionStorage` says the intro
  was already seen this session, it sets `data-hello-seen` on `<html>`. CSS
  hides the overlay entirely when that attribute is present — no black flash
  on repeat loads.

## Behavior

1. **Draw (0 – ~2.2s):** fixed full-viewport black overlay (`z-index` above
   nav and cursor blob). White cursive "hello" SVG path draws via
   `stroke-dashoffset` animation, easing like Apple's (slow-fast-slow).
2. **Wait:** the finished "hello" holds with a subtle glow. A small pulsing
   "scroll" hint fades in near the bottom of the screen.
3. **Dismiss:** first scroll intent — `wheel`, `touchmove`, `keydown`
   (Space / ArrowDown / PageDown), or `Escape` — triggers fade-out (~0.8s,
   slight scale-up on the text). During the fade the underlying page is
   visible at scroll position 0. The component then unmounts.
4. **Scroll lock:** while the overlay is active, `document.body` gets
   `overflow: hidden` so the page beneath cannot move. The dismissing gesture
   itself never scrolls the page. Lock is released on dismiss.
5. **Session flag:** on dismiss, set `sessionStorage["hello-intro-seen"]`.
   All `sessionStorage` access wrapped in try/catch (private-browsing safety);
   on failure the intro simply plays again.
6. **Skip-ahead:** a scroll gesture during the drawing phase jumps straight
   to the fade-out.

## Error handling & edge cases

- **`prefers-reduced-motion: reduce`:** no drawing animation — "hello"
  appears fully written; dismissal is a plain opacity fade.
- **Hydration delay:** the overlay is plain markup rendered by the server, so
  it appears immediately; listeners attach on hydration. (Acceptable:
  pre-hydration scrolls are ignored for the instant before React attaches.)
- **JS fully disabled:** accepted limitation — the rest of the site (cursor
  blob, parallax, reveals) already requires JS, so the intro does too. A
  `<noscript>` style rule hides the overlay so no-JS visitors are not stuck
  on a black screen.
- **Accessibility:** overlay carries `role="dialog"` and `aria-label="hello"`;
  the hint text is real text (screen-reader readable); Escape dismisses.

## Testing

Manual verification against the dev server (`pnpm dev`):

1. Fresh tab → black screen, "hello" draws, hint appears.
2. Wheel scroll, touch swipe (device emulation), Space, and Escape each
   dismiss with a fade; page sits at the top afterwards.
3. Reload in the same tab → no intro, no black flash.
4. New tab → intro plays again.
5. Emulate `prefers-reduced-motion` → static "hello", fade-only dismissal.
6. `pnpm build` passes.
