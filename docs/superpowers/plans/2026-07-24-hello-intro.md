# Hello Intro Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A black full-screen intro where a white cursive "hello" draws itself Apple-style, waits, and fades away on the visitor's first scroll — once per browser session.

**Architecture:** One self-contained client component (`components/hello-intro.tsx`) holding markup, a `<style>` element, per-letter SVG stroke paths animated with `stroke-dashoffset`, and all dismissal logic. `app/layout.tsx` renders it above `{children}` plus a tiny inline script that sets `data-hello-seen` on `<html>` before first paint so repeat same-session loads never flash black.

**Tech Stack:** Next.js 16 App Router, React 19, plain CSS animations (no new dependencies). Verification via headless Chrome (screenshots + DevTools Protocol driven by a dependency-free Node script using Node's native WebSocket).

**Testing note:** The repo has no unit-test infrastructure and this feature is almost entirely visual/behavioral, so verification is end-to-end: rendered screenshots checked by eye at each step, then a scripted headless-Chrome run that dispatches a real wheel event and asserts the overlay unmounts and the session flag sticks. Spec: `docs/superpowers/specs/2026-07-24-hello-intro-design.md`.

---

### Task 1: Author the cursive "hello" SVG and verify it visually

No commit from this task — it produces verified path data used verbatim in Task 2. All files live in the session scratchpad, not the repo.

**Files:**
- Create (scratchpad): `hello-preview.html`

- [ ] **Step 1: Write the standalone preview page**

Write this to `<scratchpad>/hello-preview.html`. It contains the first-cut per-letter paths (h, e, l, l, o as separate strokes with overlapping entry/exit tails so they read as connected cursive) and the exact animation CSS the component will use:

```html
<meta charset="utf-8">
<style>
  body { margin: 0; background: #000; display: grid; place-items: center; height: 100vh; }
  svg { width: min(64vw, 420px); }
  .hello-stroke {
    stroke: #fff; fill: none; stroke-width: 8;
    stroke-linecap: round; stroke-linejoin: round;
    stroke-dasharray: 1; stroke-dashoffset: 1;
    animation: hello-draw 0.6s cubic-bezier(0.65, 0, 0.35, 1) forwards;
  }
  .s-h  { animation-delay: 0.15s; animation-duration: 0.65s; }
  .s-e  { animation-delay: 0.78s; animation-duration: 0.30s; }
  .s-l1 { animation-delay: 1.06s; animation-duration: 0.40s; }
  .s-l2 { animation-delay: 1.44s; animation-duration: 0.40s; }
  .s-o  { animation-delay: 1.82s; animation-duration: 0.45s; }
  @keyframes hello-draw { to { stroke-dashoffset: 0; } }
</style>
<svg viewBox="20 20 300 180" aria-hidden="true">
  <path pathLength="1" class="hello-stroke s-h"
    d="M42 150 C56 146 66 128 71 100 C76 68 77 44 71 37 C66 32 60 38 60 49 C60 74 64 122 69 150 C74 128 80 103 91 99 C101 95 106 103 107 117 C108 132 108 141 111 150 C113 157 120 156 125 147"/>
  <path pathLength="1" class="hello-stroke s-e"
    d="M118 150 C124 138 134 116 146 112 C156 109 162 117 157 126 C150 137 136 141 130 133 C126 127 128 142 134 150 C140 157 150 153 156 144"/>
  <path pathLength="1" class="hello-stroke s-l1"
    d="M162 148 C172 140 182 112 188 78 C192 54 192 38 186 34 C180 31 176 40 177 52 C178 80 182 124 188 144 C190 151 197 153 203 146"/>
  <path pathLength="1" class="hello-stroke s-l2"
    d="M204 148 C214 140 224 112 230 78 C234 54 234 38 228 34 C222 31 218 40 219 52 C220 80 224 124 230 144 C232 151 239 153 245 146"/>
  <path pathLength="1" class="hello-stroke s-o"
    d="M246 146 C252 132 262 114 274 111 C288 108 296 118 295 131 C294 145 282 153 271 151 C260 149 256 138 262 128 C267 119 277 117 284 122 C290 127 296 126 300 120"/>
</svg>
```

- [ ] **Step 2: Locate Chrome**

```powershell
$chrome = @("C:\Program Files\Google\Chrome\Application\chrome.exe",
            "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe") |
          Where-Object { Test-Path $_ } | Select-Object -First 1
$chrome
```

Expected: a path prints. If none prints, fall back to Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`) — same flags work.

- [ ] **Step 3: Screenshot the finished animation state**

`--virtual-time-budget` fast-forwards the animations to completion:

```powershell
& $chrome --headless=new --disable-gpu --screenshot="<scratchpad>\hello-final.png" --window-size=900,500 --virtual-time-budget=5000 "file:///<scratchpad>/hello-preview.html"
```

Expected: `hello-final.png` written.

- [ ] **Step 4: Read the PNG and judge it**

Read `hello-final.png` with the Read tool. Acceptance: a human would read it as cursive lowercase "hello" — connected-looking, consistent slant, no stray hooks or collapsed loops, letters roughly on one baseline.

- [ ] **Step 5: Iterate until it passes**

If any letter is malformed, adjust that letter's control points in `hello-preview.html` and repeat Steps 3–4. Typical fixes: widen a loop by moving its top control points apart; fix baseline wobble by pinning end points to y=150; fix slant by shearing x-coordinates of upper points. Do not proceed until Step 4's acceptance holds. Record the final `d` strings — Task 2 pastes them verbatim.

---

### Task 2: Create the HelloIntro component

**Files:**
- Create: `components/hello-intro.tsx`

- [ ] **Step 1: Write the component**

Create `components/hello-intro.tsx` exactly as below, replacing the five `d` attributes with the final strings from Task 1 (below they show the Task 1 first-cut values):

```tsx
"use client"

import { useEffect, useRef, useState } from "react"

const SEEN_KEY = "hello-intro-seen"

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

const DISMISS_KEYS = [" ", "Spacebar", "ArrowDown", "PageDown", "Escape"]
const FADE_MS = 850

export default function HelloIntro() {
  const [phase, setPhase] = useState<"intro" | "leaving" | "gone">("intro")
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  useEffect(() => {
    if (hasSeenIntro()) {
      setPhase("gone")
      return
    }

    const dismiss = () => {
      if (phaseRef.current !== "intro") return
      setPhase("leaving")
      markIntroSeen()
      window.scrollTo(0, 0)
      window.setTimeout(() => setPhase("gone"), FADE_MS)
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      dismiss()
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      dismiss()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (DISMISS_KEYS.includes(e.key)) {
        e.preventDefault()
        dismiss()
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

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
      role="dialog"
      aria-label="hello"
    >
      <svg className="hello-intro__svg" viewBox="20 20 300 180" fill="none" aria-hidden="true">
        <path
          pathLength={1}
          className="hello-stroke hello-stroke--h"
          d="M42 150 C56 146 66 128 71 100 C76 68 77 44 71 37 C66 32 60 38 60 49 C60 74 64 122 69 150 C74 128 80 103 91 99 C101 95 106 103 107 117 C108 132 108 141 111 150 C113 157 120 156 125 147"
        />
        <path
          pathLength={1}
          className="hello-stroke hello-stroke--e"
          d="M118 150 C124 138 134 116 146 112 C156 109 162 117 157 126 C150 137 136 141 130 133 C126 127 128 142 134 150 C140 157 150 153 156 144"
        />
        <path
          pathLength={1}
          className="hello-stroke hello-stroke--l1"
          d="M162 148 C172 140 182 112 188 78 C192 54 192 38 186 34 C180 31 176 40 177 52 C178 80 182 124 188 144 C190 151 197 153 203 146"
        />
        <path
          pathLength={1}
          className="hello-stroke hello-stroke--l2"
          d="M204 148 C214 140 224 112 230 78 C234 54 234 38 228 34 C222 31 218 40 219 52 C220 80 224 124 230 144 C232 151 239 153 245 146"
        />
        <path
          pathLength={1}
          className="hello-stroke hello-stroke--o"
          d="M246 146 C252 132 262 114 274 111 C288 108 296 118 295 131 C294 145 282 153 271 151 C260 149 256 138 262 128 C267 119 277 117 284 122 C290 127 296 126 300 120"
        />
      </svg>
      <p className="hello-intro__hint">scroll</p>
      <style>{css}</style>
    </div>
  )
}

const css = `
.hello-intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  transition: opacity ${FADE_MS}ms ease;
}
.hello-intro--leaving {
  opacity: 0;
  pointer-events: none;
}
.hello-intro__svg {
  width: min(64vw, 420px);
  transition: transform ${FADE_MS}ms ease;
  filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.25));
}
.hello-intro--leaving .hello-intro__svg {
  transform: scale(1.06);
}
.hello-stroke {
  stroke: #fff;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: hello-draw 0.6s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
.hello-stroke--h  { animation-delay: 0.15s; animation-duration: 0.65s; }
.hello-stroke--e  { animation-delay: 0.78s; animation-duration: 0.30s; }
.hello-stroke--l1 { animation-delay: 1.06s; animation-duration: 0.40s; }
.hello-stroke--l2 { animation-delay: 1.44s; animation-duration: 0.40s; }
.hello-stroke--o  { animation-delay: 1.82s; animation-duration: 0.45s; }
@keyframes hello-draw {
  to { stroke-dashoffset: 0; }
}
.hello-intro__hint {
  position: absolute;
  bottom: 7vh;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--font-inter), sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  opacity: 0;
  animation: hello-hint 2.4s ease 2.5s infinite;
}
@keyframes hello-hint {
  0%, 100% { opacity: 0; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-6px); }
}
html[data-hello-seen] .hello-intro {
  display: none;
}
@media (prefers-reduced-motion: reduce) {
  .hello-stroke {
    animation: none;
    stroke-dashoffset: 0;
  }
  .hello-intro__hint {
    animation: none;
    opacity: 1;
  }
  .hello-intro__svg {
    transition: none;
    filter: none;
  }
}
`
```

Design notes for the implementer:
- `pathLength={1}` normalizes every path so `stroke-dasharray: 1 / stroke-dashoffset: 1 → 0` works without measuring real path lengths.
- `phaseRef` lets the stable `dismiss` closure read the current phase without re-registering listeners.
- The scroll lock (`overflow: hidden` on body) stays through `leaving` so the dismissing gesture can never scroll the page mid-fade; the cleanup on unmount restores the previous value.
- `window.scrollTo(0, 0)` guarantees the site is revealed at the top.

- [ ] **Step 2: Type-check**

```powershell
pnpm exec tsc --noEmit
```

Expected: exits 0, no errors. (If `node_modules` is missing, run `pnpm install` first.)

- [ ] **Step 3: Commit**

```bash
git add components/hello-intro.tsx
git commit -m "feat: add Apple-style hello intro overlay component"
```

---

### Task 3: Wire the intro into the root layout

**Files:**
- Modify: `app/layout.tsx` (currently 47 lines; renders `<html><body>{children}<Analytics/></body></html>`)

- [ ] **Step 1: Edit the layout**

Three changes, full resulting file below: import the component; add `suppressHydrationWarning` to `<html>` (the pre-paint script mutates the root element's attributes); as the FIRST children of `<body>`, add the synchronous seen-flag script (runs during HTML parsing, before the overlay markup below it is parsed — this is the no-flash guarantee), the `<noscript>` hider, and `<HelloIntro />`:

```tsx
import type React from "react"
import type { Metadata } from "next"
import { Syne, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import HelloIntro from "@/components/hello-intro"
import "./globals.css"

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "VISCERA STUDIO",
  description: "Digital artifacts that shatter the noise",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

const helloSeenScript = `try{if(sessionStorage.getItem("hello-intro-seen")==="1")document.documentElement.setAttribute("data-hello-seen","")}catch(e){}`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${inter.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: helloSeenScript }} />
        <noscript>
          <style>{`.hello-intro{display:none}`}</style>
        </noscript>
        <HelloIntro />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

Keep the existing metadata block byte-identical — only the import, the `suppressHydrationWarning` attribute, the `helloSeenScript` const, and the three new body children change.

- [ ] **Step 2: Type-check**

```powershell
pnpm exec tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: show hello intro on load, skip within same session"
```

---

### Task 4: End-to-end verification in headless Chrome

**Files:**
- Create (scratchpad): `verify-hello.mjs`
- Possibly modify: `components/hello-intro.tsx` (fixes found here)

- [ ] **Step 1: Start the dev server**

```powershell
pnpm dev
```

Run in background. Expected within ~15s: "Ready" with the local URL (default `http://localhost:3000`; note the port if different).

- [ ] **Step 2: Start headless Chrome with a debugging port**

```powershell
& $chrome --headless=new --disable-gpu --remote-debugging-port=9222 --user-data-dir="<scratchpad>\chrome-profile" --window-size=1280,800
```

Run in background. `$chrome` is the path found in Task 1 Step 2.

- [ ] **Step 3: Write the CDP verification script**

Requires Node ≥ 21 for native WebSocket (`node -v` to confirm; if older, do this task's checks manually in a visible browser instead). Write to `<scratchpad>/verify-hello.mjs`:

```js
import { writeFileSync } from "node:fs"

const SCRATCH = new URL(".", import.meta.url).pathname.replace(/^\//, "")
const SITE = process.argv[2] ?? "http://localhost:3000"

const res = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(SITE), {
  method: "PUT",
})
const target = await res.json()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))

let nextId = 0
function send(method, params = {}) {
  const id = ++nextId
  ws.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => {
    const onMsg = (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id === id) {
        ws.removeEventListener("message", onMsg)
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
      }
    }
    ws.addEventListener("message", onMsg)
  })
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function evaluate(expression) {
  const { result } = await send("Runtime.evaluate", { expression, returnByValue: true })
  return result.value
}
async function shot(name) {
  const { data } = await send("Page.captureScreenshot")
  writeFileSync(`${SCRATCH}${name}`, Buffer.from(data, "base64"))
  console.log("saved", name)
}
function assert(cond, label) {
  console.log(cond ? "PASS" : "FAIL", "-", label)
  if (!cond) process.exitCode = 1
}

await send("Page.enable")
await sleep(4500) // load + full draw animation

assert(await evaluate(`!!document.querySelector(".hello-intro")`), "overlay present on fresh load")
assert(
  (await evaluate(`getComputedStyle(document.body).overflow`)) === "hidden",
  "body scroll locked while overlay up",
)
await shot("e2e-1-drawn.png")

await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 640, y: 400, deltaX: 0, deltaY: 240 })
await sleep(1500) // fade (850ms) + unmount

assert(!(await evaluate(`document.querySelector(".hello-intro")`)), "overlay unmounted after wheel")
assert((await evaluate(`sessionStorage.getItem("hello-intro-seen")`)) === "1", "session flag set")
assert(
  (await evaluate(`getComputedStyle(document.body).overflow`)) !== "hidden",
  "body scroll unlocked after dismiss",
)
assert((await evaluate(`window.scrollY`)) === 0, "page revealed at top")
await shot("e2e-2-revealed.png")

await send("Page.reload")
await sleep(3000)
assert(
  (await evaluate(`document.documentElement.hasAttribute("data-hello-seen")`)),
  "pre-paint script set data-hello-seen on reload",
)
assert(
  !(await evaluate(
    `(() => { const el = document.querySelector(".hello-intro"); return el && getComputedStyle(el).display !== "none" })()`,
  )),
  "no visible overlay on same-session reload",
)
await shot("e2e-3-reload.png")

ws.close()
```

- [ ] **Step 4: Run it**

```powershell
node "<scratchpad>\verify-hello.mjs" http://localhost:3000
```

Expected: seven `PASS` lines, three PNGs saved, exit code 0.

- [ ] **Step 5: Read the three screenshots**

Read each PNG. Acceptance: (1) black screen with fully drawn white cursive "hello" (hint may be mid-pulse); (2) the VISCERA site visible at the top, no black overlay; (3) same as 2 immediately after reload.

- [ ] **Step 6: Keyboard + reduced-motion spot checks**

New tab = fresh sessionStorage, so each check gets a clean run. Append nothing to the repo — run these via a second small script reusing the `send`/`evaluate` helpers; the checks:
1. Fresh tab (`PUT /json/new?<url>`); send `Input.dispatchKeyEvent` `{type:"keyDown", key:"Escape", code:"Escape"}` then the matching `keyUp`; after 1.5s the overlay must be unmounted.
2. Fresh tab; same with `{key:" ", code:"Space"}` (Space); after 1.5s the overlay must be unmounted.
3. Fresh tab; send `Input.dispatchTouchEvent` `{type:"touchStart", touchPoints:[{x:640,y:500}]}` then `{type:"touchMove", touchPoints:[{x:640,y:300}]}` then `{type:"touchEnd", touchPoints:[]}`; after 1.5s the overlay must be unmounted (touch swipe).
4. Fresh tab; first send `Emulation.setEmulatedMedia` with `{features:[{name:"prefers-reduced-motion",value:"reduce"}]}`, reload, screenshot at t≈1s: "hello" must already be fully drawn (no partial strokes).

Expected: all four hold.

- [ ] **Step 7: Fix anything that failed, re-run, commit fixes**

If all seven PASS and Step 5–6 acceptance held and no source files changed, skip the commit. Otherwise:

```bash
git add components/hello-intro.tsx app/layout.tsx
git commit -m "fix: harden hello intro dismissal behavior"
```

- [ ] **Step 8: Stop the background dev server and Chrome**

Stop both background processes (TaskStop / Stop-Process). Leave nothing running.

---

### Task 5: Production build and push

**Files:** none new

- [ ] **Step 1: Production build**

```powershell
pnpm build
```

Expected: "Compiled successfully", static pages generated, exit 0.

- [ ] **Step 2: Push**

```bash
git push
```

Expected: `main -> main` accepted by `https://github.com/Shaik-sufyaan/portfolio.git`. Note in the final report that if Vercel is connected to the repo, this deploys the intro to production.
