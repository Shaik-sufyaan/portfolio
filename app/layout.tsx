import type React from "react"
import type { Metadata } from "next"
import { Syne, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import HelloIntro from "@/components/hello-intro"
import "./globals.css"

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "SHAIK SUFYAAN — CTO & Builder",
  description:
    "Shaik Sufyaan — technical co-founder & CTO of Corply. Full-stack engineer in Atlanta building products end to end: Roomeo, AeroGrid, and more.",
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
