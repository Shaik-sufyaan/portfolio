# Design: Replace VISCERA STUDIO placeholder content with Shaik Sufyaan's portfolio

Date: 2026-07-24
Status: Implemented autonomously (session is non-interactive; decisions recorded here for review)

## Goal

Turn the v0 "VISCERA STUDIO" template into Shaik Sufyaan's personal portfolio using
personal data supplied directly by the user, keeping the existing dark brutalist
design system (Syne/Inter, orange accent, parallax/marquee interactions).

## Approaches considered

1. **Content swap only** — replace strings in place, keep exactly two project rows.
   Too little: Sufyaan has 5+ projects, education, and awards that don't fit.
2. **Full redesign** — new layout via frontend-design skill. Out of scope: the ask
   was "update the website with the needed information", not redesign it.
3. **Hybrid (chosen)** — keep the template's structure, CSS, and interactions;
   replace all placeholder copy; extend the Work section to five real projects;
   repurpose the overlapping-composition section as a CV section (education,
   experience, honors, programs); rewire footer with real contact/socials.

## Content mapping (public-appropriate subset)

Included:
- Name: Shaik Sufyaan — hero + logo + metadata
- Role: CTO & technical co-founder, Corply — hero/about
- Location: Atlanta, Georgia, US — footer
- Email: sufyaan@0lumens.com — footer CTA
- Socials: GitHub, X, LinkedIn — footer links
- Education: Georgia Tech (Computer Engineering, 2026–2027);
  Georgia State (Computer Science, 2024–2025) — CV section
- Experience: Corply (CTO, current); Duet (Backend Developer, Nov 2024–Feb 2025) — CV section
- Projects (Work section): Roomeo, Clapperboard detection (YOLOv8), VR1 Enterprises,
  AeroGrid, Duet Chrome extension — with the URLs provided
- Honors: AI ATL 2025 Drive Capital track (HeyAI); Emory Hacks 2025 best use of
  ElevenLabs (1-2-Tree); Georgia Tech Genesis acceptance; CreateX

Sensitive personal fields the user supplied were deliberately excluded from the
public site.

## Implementation notes

- `app/layout.tsx`: metadata title/description → personal brand.
- `app/page.tsx`: all sections rewritten; interaction JS (blob, parallax) kept;
  class names preserved so `globals.css` continues to apply.
- Project imagery: curated Unsplash images matching each project's theme (template
  already hotlinks Unsplash; no local screenshots available).
- CV section replaces the "LAYERED DEPTH" composition grid with a divider-separated
  editorial list to fit the brutalist aesthetic.
- Post-implementation multi-agent review (content accuracy, link integrity, code
  quality, privacy) confirmed 8 findings, all fixed: broken VR1 Unsplash image,
  dead mobile-footer CSS selectors, footer link contrast, smooth-scroll listener
  leak, dead template CSS blocks, README template branding, internal-doc wording,
  and one dead external link (cocreate repo is private/404 — needs user action).
