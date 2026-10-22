# Biddle Systems - cinematic preview

Preview rebuild of biddlesystems.com. Static HTML/CSS/JS, no dependencies. Live at
https://mwb05.github.io/biddlesystems-cinematic-preview/ (GitHub Pages, main branch, root).
The live site at biddlesystems.com (repo mwb05/biddlesystems) is untouched.

Positioning: Biddle Systems is Matt Biddle's AI consulting company. The pitch is efficiency and
time saved for small businesses, with before/after framing. Jarvis, the AI agent system Matt built
and runs for his family's businesses, is the proof point. The copy says he built and runs Jarvis
for those businesses; it does not say he operates the businesses. Hours on the page are
representative examples, labeled as such, not client case studies.

## Round 3: Circuit, built out into a multi-page site

Matt picked option 2 (Circuit) from round 2 and asked for a fuller, multi-page site. The Aurora
and Daylight options and the chooser page were retired (they are in git history at 62aefee).
/circuit/ now redirects to the root.

Pages:
- /           Home: particle-globe hero, pinned 3D before/after stage, "780 hours a year"
              statement, three automation cards, Jarvis teaser with typing terminal, page cards.
- /services/  Flow diagram plus all six automations as alternating rows (before / after /
              turnaround, what it plugs into), and a list of other jobs we look for.
- /savings/   Interactive savings calculator: sliders per job plus hourly cost; hours back per
              week (rolling number), per year, dollar value, workdays back per month.
- /process/   Pinned horizontal scroll track (Day 1 audit -> Day 30 live -> monthly), "what you
              get" terms, FAQ.
- /proof/     Jarvis: KPI tiles, tracing-beam day timeline, terminal feed, "what it means for you".
- /contact/   Form (Web3Forms, same public token as the live site) and what happens next.

Every page shares the nav (mobile gets a full-screen menu), a closing "find your first 10 hours"
CTA band and the footer. Page-to-page navigation uses cross-document view transitions where the
browser supports them, and a cyan scan-line curtain elsewhere. Primary buttons are magnetic.

Build: pages are generated from one layout so nav/footer/head stay identical.

    node build.mjs     # src/layout.html + src/pages/<slug>.html -> index.html, <slug>/index.html

Files: styles.css (base tokens and round 1 components), theme.css (Circuit look), site.css
(multi-page components), script.js (shared effects, menu, transitions, horizontal track),
fx.js (globe, flow diagram, terminal), calc.js (savings page only).

Techniques (from the TikTok Brain research behind round 1): Apple-style pinned scroll-scrubbed
3D stage, Apple design rules (one type scale, 8pt spacing, short ease-out motion, reduced-motion
support, 44px targets), Aceternity-style spotlight, tilt cards, word blur-in headlines,
count-ups and tracing beam. Round 3 adds the pinned horizontal scroll section, page transitions
and the interactive calculator as the conversion tool.

Before go-live: remove the `noindex` meta tag in src/layout.html, drop the "Preview" chip,
update the Web3Forms subject line, then rebuild.
