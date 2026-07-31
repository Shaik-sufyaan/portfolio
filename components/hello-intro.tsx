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
