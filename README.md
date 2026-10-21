# Biddle Systems - cinematic preview

Preview rebuild of biddlesystems.com. Static (index.html, styles.css, script.js), no build step,
no dependencies. Live at https://mwb05.github.io/biddlesystems-cinematic-preview/ (GitHub Pages,
main branch, root). The live site at biddlesystems.com (repo mwb05/biddlesystems) is untouched.

Positioning: Biddle Systems is Matt Biddle's AI consulting company. The homepage pitch is
efficiency and time saved for small businesses, with before/after framing. Jarvis, the AI agent
system Matt built and runs for his family's businesses, is the proof point. The copy says he built
and runs Jarvis for those businesses; it does not say he operates the businesses.

Sections: hero, pinned before/after stage, what we automate, proof (Jarvis timeline), how it
works, contact (matt@biddlesystems.com). The hours in the before/after and bento cards are
representative examples, labeled as such on the page, not client case studies.

Techniques (from the TikTok Brain research that preceded the build):
- Apple-homepage-style pinned, scroll-scrubbed 3D stage (the "Fable 5 builds $10k cinematic
  3D scrolling sites" video): a 320vh section with a sticky viewport, scroll progress drives a
  CSS custom property that tilts the cards in and hands rows from "before" to "after".
- Apple design principles (the "Apple's design philosophy as a Claude skill" video, installed at
  C:\ClaudeCode\apple-design-audit): one type scale, 8pt spacing, one accent, 150-400ms ease-out
  motion, reduced-motion support, 44px targets. Checked with that skill's audit.mjs.
- Aceternity-style components (the "vibe components" video): cursor spotlight, 3D tilt cards,
  word-by-word blur-in headline, count-up stats, tracing beam timeline.

Before go-live: remove the `noindex` meta tag, drop the "Preview" chip in the nav, and consider
changing the Web3Forms subject line. The form uses the same public submit token as the live site.
