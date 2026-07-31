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
  /** Fires once the last stroke lands. */
  onWritten?: () => void
}

export default function HelloMark({ onWritten }: HelloMarkProps) {
  return (
    <TegakiRenderer
      className="hello-mark"
      font={parisienne}
      time={{ mode: "uncontrolled", duration: WRITE_SECONDS }}
      onComplete={onWritten}
    >
      hello
    </TegakiRenderer>
  )
}
