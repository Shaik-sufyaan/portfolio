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
      <svg className="hello-intro__svg" viewBox="20 15 300 160" fill="none" aria-hidden="true">
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
          d="M246 146 C252 132 260 116 272 112 C284 108 294 117 294 130 C294 143 284 152 272 151 C260 150 253 141 255 130 C257 118 265 111 274 111 C281 111 288 112 295 107"
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
