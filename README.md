# Biddle Systems - cinematic preview

Preview rebuild of biddlesystems.com. Static HTML/CSS/JS, no dependencies. Live at
https://mwb05.github.io/biddlesystems-cinematic-preview/ (GitHub Pages, main branch, root).
The live site at biddlesystems.com (repo mwb05/biddlesystems) is untouched.

Positioning: Biddle Systems is Matt Biddle's AI consulting company. The pitch is efficiency and
time saved for small businesses, with before/after framing. Jarvis, the AI agent system Matt built
and runs for his family's businesses, is the proof point. The copy says he built and runs Jarvis
for those businesses; it does not say he operates the businesses. Hours on the page are
representative examples, labeled as such, not client case studies.

## Round 8: locked in Glacier

Matt said to move forward with Glacier. The palette switcher, its styles, the pre-paint palette
script and the other nine palette blocks were removed (all in git history at eab0787). Glacier in
theme.css :root is the only look; ?palette= no longer does anything. Asset query strings bumped
to ?v=8 so browsers drop the old switcher script.

## Round 7: Glacier is the site color

Matt set Glacier. theme.css :root now holds the Glacier values and Arctic moved into its own
html[data-palette="arctic"] block. Glacier is first in the switcher and is what every visitor sees
unless they pick another. The saved-pick key changed to bs-palette-v7 so an older pick left in a
browser from earlier rounds does not override Glacier. Asset query strings bumped to ?v=7.
The other nine palettes are still in the switcher; remove it when the site goes live.

## Round 6: narrowed to Matt's favorites, plus Forest

Matt named Arctic, Glacier, Jade and Evergreen as his favorites and asked for more like those,
plus a Forest option. Those four are unchanged. The six palettes furthest from them - Aqua,
Lagoon, Seafoam, Emerald, Mint, Spring - were replaced with Frost, Crystal, Tundra, Forest, Pine
and Alpine: closer icy-blue and deep-green variants, including a true muted pine Forest. Order in
the switcher is now Arctic, Glacier, Frost, Crystal, Tundra, Jade, Evergreen, Forest, Pine, Alpine.

## Round 5: palettes in the Arctic/Emerald family, globe fixed

Matt liked Arctic and Emerald most, so the ten palettes are now all cool cyan-to-green:
Arctic (default), Glacier, Aqua, Lagoon, Seafoam, Emerald, Jade, Mint, Spring, Evergreen. Each
pairs its accent with a lighter tint of the same hue. The home-page globe had stopped drawing in
round 4 (fx.js split the space-separated RGB variables on the letter "s" instead of whitespace,
so every canvas color was invalid); fixed.

## Round 4: ten color palettes

Matt felt the original cyan + green clashed and asked for 10 color options to scroll through.
Every color in the CSS and the canvas/SVG effects now comes from variables in theme.css, and ten
palettes override them: Arctic (default), Cobalt, Ultraviolet, Sunset, Crimson, Ember, Copper,
Gold, Lime, Emerald. Each pairs its accent with a second color from the same warm or cool family.
A floating switcher (bottom right, bottom center on phones) steps through them with arrows or the
swatch dots; [ and ] on the keyboard also work. The pick is remembered across pages, and
?palette=<id> in the URL forces one. Remove the switcher once a palette is chosen.

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
