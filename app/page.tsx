"use client"

import { useEffect } from "react"

export default function Home() {
  useEffect(() => {
    // Mouse Blob Follower
    const blob = document.getElementById("cursor-blob")
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY
      if (blob) {
        blob.style.transform = `translate(${x - 200}px, ${y - 200}px)`
      }
    }
    document.addEventListener("mousemove", handleMouseMove)

    // Parallax Effect
    const handleScroll = () => {
      const scroll = window.pageYOffset

      // Hero parallax
      const parallaxTexts = document.querySelectorAll(".parallax-text")
      parallaxTexts.forEach((text) => {
        const speed = text.getAttribute("data-speed")
        if (speed) {
          ;(text as HTMLElement).style.transform = `translateX(${scroll * Number.parseFloat(speed) * 0.1}px)`
        }
      })

      const heroImg = document.getElementById("hero-img")
      if (heroImg) {
        heroImg.style.transform = `translate(-50%, calc(-50% + ${scroll * 0.2}px)) scale(${1 + scroll * 0.0005})`
      }

      // Floating labels in project section
      const labels = document.querySelectorAll(".floating-label")
      labels.forEach((label, index) => {
        const direction = index % 2 === 0 ? 1 : -1
        ;(label as HTMLElement).style.transform = `translateY(${scroll * 0.1 * direction}px)`
      })
    }
    window.addEventListener("scroll", handleScroll)

    // Smooth scrolling for anchor links (delegated so cleanup can remove it)
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest('a[href^="#"]')
      if (!anchor) return
      e.preventDefault()
      const href = anchor.getAttribute("href")
      if (href) {
        document.querySelector(href)?.scrollIntoView({
          behavior: "smooth",
        })
      }
    }
    document.addEventListener("click", handleAnchorClick)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("click", handleAnchorClick)
    }
  }, [])

  return (
    <>
      <div className="blob" id="cursor-blob"></div>

      <nav>
        <div className="logo">SUFYAAN ©26</div>
        <ul className="nav-links">
          <li>
            <a href="#work">Work</a>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section id="hero">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200"
            alt="Circuit board macro"
            className="hero-img"
            id="hero-img"
          />
          <div className="hero-title-container container">
            <span className="huge-type parallax-text" data-speed="-2">
              SHAIK
            </span>
            <span className="huge-type outline-text parallax-text" data-speed="2" style={{ paddingLeft: "200px" }}>
              SUFYAAN
            </span>
          </div>
        </section>

        {/* INTRO */}
        <section id="about">
          <div className="container">
            <div style={{ maxWidth: "800px" }}>
              <h2
                style={{
                  fontSize: "3rem",
                  fontFamily: "var(--syne)",
                  marginBottom: "40px",
                }}
              >
                I BUILD PRODUCTS END TO END — AND SHIP THEM FAST.
              </h2>
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 300,
                  color: "var(--dim)",
                }}
              >
                Technical co-founder &amp; CTO of Corply. Full-stack engineer based in Atlanta — computer science at
                Georgia State, now computer engineering at Georgia Tech. From real-time systems and computer vision to
                production web platforms, I own every layer: frontend, backend, infra, and the schema underneath.
              </p>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="scrolling-marquee">
          <div className="marquee-inner">
            <span className="huge-type outline-text">BUILD — SHIP — REPEAT — CORPLY — ATLANTA — </span>
            <span className="huge-type outline-text">BUILD — SHIP — REPEAT — CORPLY — ATLANTA — </span>
          </div>
        </div>

        {/* WORK SECTION */}
        <section id="work" className="container">
          <div className="sticky-type">WORK</div>

          {/* Project 1 — Roomeo */}
          <div className="project-row">
            <div className="project-info">
              <span style={{ fontFamily: "var(--syne)", color: "var(--accent)" }}>001 / FULL-STACK</span>
              <h3 className="huge-type" style={{ fontSize: "6rem", margin: "20px 0" }}>
                ROOMEO
              </h3>
              <p>
                A full-stack roommate platform built solo in under 8 weeks: real-time messaging, swipe-based matching,
                expense splitting with automated debt simplification, an event system, and a marketplace — every
                component, service, and schema on a single database and auth system. Accepted into Georgia Tech&apos;s
                Genesis startup incubator.
              </p>
              <div className="divider"></div>
              <p>SOLO BUILD — 8 WEEKS</p>
            </div>
            <div className="project-media">
              <img
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000"
                alt="Roomeo — roommate platform"
                className="project-image"
              />
              <div className="floating-label huge-type outline-text" style={{ fontSize: "8rem" }}>
                MATCH
              </div>
            </div>
          </div>

          {/* Project 2 — Clapperboard Detection */}
          <div className="project-row" style={{ flexDirection: "row-reverse" }}>
            <div className="project-info">
              <span style={{ fontFamily: "var(--syne)", color: "var(--accent)" }}>002 / COMPUTER VISION</span>
              <h3 className="huge-type" style={{ fontSize: "6rem", margin: "20px 0" }}>
                COCREATE
              </h3>
              <p>
                Real-time clapperboard detection system built on YOLOv8 — 95.48% mAP at roughly 48 FPS. Placed top 5
                out of ~100 participants.
              </p>
              <div className="divider"></div>
              <p>
                <a
                  href="https://github.com/Shaik-sufyaan/cocreate"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "none" }}
                >
                  GITHUB ↗
                </a>
              </p>
            </div>
            <div className="project-media">
              <img
                src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1000"
                alt="Cocreate — clapperboard detection"
                className="project-image"
              />
              <div
                className="floating-label huge-type outline-text"
                style={{ fontSize: "8rem", right: "auto", left: "-100px" }}
              >
                VISION
              </div>
            </div>
          </div>

          {/* Project 3 — VR1 Enterprises */}
          <div className="project-row">
            <div className="project-info">
              <span style={{ fontFamily: "var(--syne)", color: "var(--accent)" }}>003 / PRODUCTION WEB</span>
              <h3 className="huge-type" style={{ fontSize: "6rem", margin: "20px 0" }}>
                VR1
              </h3>
              <p>
                Production website for VR1 Enterprises, an international teacher-recruitment company — including a
                consultation-scheduling system optimized for SEO. Acquired 100+ users within the first month.
              </p>
              <div className="divider"></div>
              <p>
                <a
                  href="https://www.vr1enterprises.com/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "none" }}
                >
                  LIVE SITE ↗
                </a>
              </p>
            </div>
            <div className="project-media">
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1000"
                alt="VR1 Enterprises — teacher recruitment"
                className="project-image"
              />
              <div className="floating-label huge-type outline-text" style={{ fontSize: "8rem" }}>
                GLOBAL
              </div>
            </div>
          </div>

          {/* Project 4 — AeroGrid */}
          <div className="project-row" style={{ flexDirection: "row-reverse" }}>
            <div className="project-info">
              <span style={{ fontFamily: "var(--syne)", color: "var(--accent)" }}>004 / SPATIAL UI</span>
              <h3 className="huge-type" style={{ fontSize: "6rem", margin: "20px 0" }}>
                AEROGRID
              </h3>
              <p>
                A 3D airspace visualization interface modeled on a NASA geofencing patent, making drone flight
                constraints interpretable in real time.
              </p>
              <div className="divider"></div>
              <p>
                <a
                  href="https://aero-grid.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "none" }}
                >
                  LIVE DEMO ↗
                </a>
              </p>
            </div>
            <div className="project-media">
              <img
                src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=1000"
                alt="AeroGrid — 3D airspace visualization"
                className="project-image"
              />
              <div
                className="floating-label huge-type outline-text"
                style={{ fontSize: "8rem", right: "auto", left: "-100px" }}
              >
                AIRSPACE
              </div>
            </div>
          </div>

          {/* Project 5 — Duet */}
          <div className="project-row">
            <div className="project-info">
              <span style={{ fontFamily: "var(--syne)", color: "var(--accent)" }}>005 / MUSIC TECH</span>
              <h3 className="huge-type" style={{ fontSize: "6rem", margin: "20px 0" }}>
                DUET
              </h3>
              <p>
                Chrome extension that captures musical notes and converts them to MusicXML in real time, piping
                structured data to Duet&apos;s composition backend. Owned the full pipeline — from browser-side capture
                to backend ingestion — as Duet&apos;s backend developer.
              </p>
              <div className="divider"></div>
              <p>NOV 2024 — FEB 2025</p>
            </div>
            <div className="project-media">
              <img
                src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80&w=1000"
                alt="Duet — real-time music notation"
                className="project-image"
              />
              <div className="floating-label huge-type outline-text" style={{ fontSize: "8rem" }}>
                NOTES
              </div>
            </div>
          </div>
        </section>

        {/* CV SECTION */}
        <section id="cv">
          <div className="container">
            <div className="cv-grid">
              <div className="cv-block">
                <h4 className="cv-heading">EDUCATION</h4>
                <div className="cv-item">
                  <p className="cv-item-title">Georgia Institute of Technology</p>
                  <p className="cv-item-sub">Computer Engineering — Jan 2026 – Dec 2027</p>
                </div>
                <div className="cv-item">
                  <p className="cv-item-title">Georgia State University</p>
                  <p className="cv-item-sub">Computer Science — Jan 2024 – Dec 2025</p>
                </div>
              </div>
              <div className="cv-block">
                <h4 className="cv-heading">EXPERIENCE</h4>
                <div className="cv-item">
                  <p className="cv-item-title">Corply — Co-founder &amp; CTO</p>
                  <p className="cv-item-sub">Current</p>
                </div>
                <div className="cv-item">
                  <p className="cv-item-title">Duet — Backend Developer</p>
                  <p className="cv-item-sub">Nov 2024 – Feb 2025</p>
                </div>
              </div>
              <div className="cv-block">
                <h4 className="cv-heading">HONORS</h4>
                <div className="cv-item">
                  <p className="cv-item-title">Winner — AI ATL 2025</p>
                  <p className="cv-item-sub">Drive Capital track (HeyAI)</p>
                </div>
                <div className="cv-item">
                  <p className="cv-item-title">Winner — Emory Hacks 2025</p>
                  <p className="cv-item-sub">Best use of ElevenLabs (1-2-Tree)</p>
                </div>
                <div className="cv-item">
                  <p className="cv-item-title">Georgia Tech Genesis</p>
                  <p className="cv-item-sub">Startup incubator — accepted with Roomeo</p>
                </div>
                <div className="cv-item">
                  <p className="cv-item-title">CreateX</p>
                  <p className="cv-item-sub">Georgia Tech entrepreneurship program</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="contact">
          <div className="container">
            <div className="footer-cta">
              <a href="mailto:sufyaan@0lumens.com">LET&apos;S — BUILD</a>
            </div>
            <div className="divider"></div>
            <div className="footer-meta">
              <div>© 2026 SHAIK SUFYAAN</div>
              <div className="footer-links">
                <a href="https://github.com/Shaik-sufyaan" target="_blank" rel="noreferrer">
                  GITHUB
                </a>
                <a href="https://x.com/sufyaan1517" target="_blank" rel="noreferrer">
                  TWITTER/X
                </a>
                <a href="https://www.linkedin.com/in/shaik-mohammed-sufyaan/" target="_blank" rel="noreferrer">
                  LINKEDIN
                </a>
              </div>
              <div>LOCATED IN ATLANTA, GA</div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
