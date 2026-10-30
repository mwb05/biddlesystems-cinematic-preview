# Biddle Systems - cinematic preview

Preview rebuild of biddlesystems.com. Static HTML/CSS/JS, no dependencies. Live at
https://mwb05.github.io/biddlesystems-cinematic-preview/ (GitHub Pages, main branch, root).
The live site at biddlesystems.com (repo mwb05/biddlesystems) is untouched.

## Round 14: simpler, and obvious what is for sale

Matt: "simplify it more, make it obvious what I am selling, keep the animations." Copy-only plus
section order; no CSS or JS changed. Visible words on the seven marketing pages (main element,
CTA band included) went 2,911 -> 2,297, another 21% off after round 13. What changed:

- Home: the hero lede now says it outright ("We sell three things: automations we build for you,
  AI courses for your team, and a tool that turns one sentence into a working automation"). The
  three-service cards moved up to sit right under the hero (section id `offer`; the scroll cue
  and the second hero button point there), with a one-line fish / teach-to-fish lede. The
  "Go deeper" explore grid (four cards duplicating the nav) was removed. Before/after stage,
  statement and proof teaser kept, trimmed.
- Nav: Automation / AI courses / Automation tool / How it works / Proof / About. Savings left the
  header (`navHide` in build.mjs) but stays in the mobile menu and footer. Checked headless in
  Chrome at 1081 (the narrowest width the desktop nav shows), 1100 and 1280: one line, room
  before the Free audit button. "Automation services" as the first label wrapped at 1100, so it
  is "Automation" in the header only; the services page still uses the full name.
- Services: shorter ledes and service paragraphs, Before/After rows cut to two per service,
  "Why three" (fish / fishing lesson) moved above the pill cloud, pill cloud 10 -> 8.
- Process: shorter steps, checks 6 -> 5, FAQ 8 -> 5. Proof: timeline and cards trimmed, the
  "A day with Jarvis" lede dropped. About: founder copy to one paragraph, fit lists 4+4 -> 3+3,
  security cards one line each, the Tools pill section removed (the home stack strip already
  lists them). Contact, savings, CTA band, footer blurb and meta descriptions tightened.
- Nothing added: no prices, guarantees, client names, security promises or stats. Jarvis proof
  point unchanged (Matt built and runs it for his family's businesses). Legal pages untouched.

## Round 13: copy cut by roughly 30%

Matt said there was a lot of text. Visible words on the seven marketing pages (home, services,
savings, process, proof, about, contact) went from 3,480 to 2,531 (27% fewer, tags stripped; the
hero run list, before/after rows, KPI tiles and pill clouds were counted too and mostly kept, so
the prose itself is down by more than 30%). The shared CTA band (build.mjs) and footer blurb
(src/layout.html) were tightened as well. Nothing else changed: same sections, same design,
Glacier palette, animations and layout, same three services and the fish / fishing-lesson framing,
support@ contact, legal pages untouched. Cuts that removed whole items rather than words: the
process FAQ went from 14 to 8 questions (cost merged into pricing; what we need, NDA, outside
SoCal, business size, existing software dropped as already answered on About or Contact); the
services pill cloud 17 -> 10; About industries 10 -> 8 and two section ledes dropped; the
Contact audit list 4 -> 3. No prices, guarantees, client names, security promises or stats added.
Meta descriptions for home and services shortened. Verified live after the push.

## Round 12: three services (automation services, AI proficiency courses, automation tool)

Matt asked for the copy and offer structure to sell exactly three services, with the design, Glacier
palette, animations and layout untouched: (1) automation services, done for you; (2) AI proficiency
courses for the client's team; (3) the automation tool, self-serve, where a short text or voice
request becomes a working automation. Framed lightly as "give a man a fish / teach a man to fish"
(automation services is the fish, the tool teaches them to fish). Copy-only changes:

- Nav, mobile menu and footer: the single "Services" link became Automation / Courses / Tool,
  pointing at #automation, #courses and #tool on the services page (build.mjs SERVICE_LINKS; anchor
  links never get aria-current). Measured at 1100px and 1280px: all seven links on one line with
  room before the Free audit button; the mobile menu's ten links fit a 360x740 viewport.
- Home: hero lede names the three ways, second button is "See the three services". "What we
  automate" became "What we offer" with the three services in the same three cards (same viz
  blocks: report bars, inbox rows reused as course topics, chat bubbles as a tool request).
  Proof teaser and the Services explore card updated. Hero stats, before/after stage, statement
  and the savings page untouched.
- Services page: hero, three-link jump nav, three .svc articles (automation / courses / tool),
  "What gets automated" pill cloud (the old six automations plus the extra jobs list), and the
  old "Beyond automation" section (roadmap, training, policy, tool review, which implied extra
  offerings) replaced by "The fish, or the fishing lesson" with two cards: done for you / done by you.
- Process: lede says this is the automation-services path and the other two start from the same
  audit; step 02's written plan now says which of the three fits; one new FAQ "Which of the three
  services should I start with?". Proof: lede and the "On request" timeline item tie Jarvis's
  text/voice-request builds to the self-serve tool. About: lede and founder paragraph name the
  three. Contact: audit list gains "Which of the three services fits". CTA band, footer blurb and
  JSON-LD description name the three. fx.js activity feed gained one line (build.request).
- Jarvis proof point unchanged in substance: Matt built and runs Jarvis for his family's businesses;
  nothing says he operates them. No prices, guarantees, client names, security promises or new
  statistics were added; existing representative numbers were left as they were.
- Not touched: styles.css, site.css, theme.css, script.js, calc.js, the legal pages' sources, the
  live site. Asset query strings bumped to ?v=11 (fx.js changed). Verified headless in Edge at
  1100 / 1280 / 360 wide: no horizontal overflow, no JS errors.

## Publishing (round 11)

Publish = `git push origin main` from this folder; GitHub Pages rebuilds within a minute. The push
works from the Dell: Matt's GitHub login is in Git Credential Manager there and git uses it
silently. Rounds 7-10 reported that they "could not push from this PC". The real cause was git's
ownership check, not GitHub: C:\ClaudeCode is a symlink to the GMKtec share, so git sees this repo
as //192.168.0.193/ClaudeCode/biddlesystems-cinematic-preview and refuses every command ("dubious
ownership") until that path is in the global safe.directory list. The jarvis repo and the older
website previews already had entries; this repo did not. Round 11 added it on the Dell:

    git config --global --add safe.directory '%(prefix)///192.168.0.193/ClaudeCode/biddlesystems-cinematic-preview'

On a box that still shows that error, run the same line once and push. Builder jobs commit as
`git -c user.name="Jarvis AutoBuild" -c user.email=mwbiddle@officeamg.com commit` (the Dell has no
default git identity for this repo). Fallback: the GMKtec's
"Jarvis Push Reminder" task (jarvis/scripts/remind-unpushed.ps1, every 4 hours) also pushes this
repo when a commit is waiting, so a committed round reaches the preview even if the push is skipped.

Positioning: Biddle Systems is Matt Biddle's AI consulting company. The pitch is efficiency and
time saved for small businesses, with before/after framing. Jarvis, the AI agent system Matt built
and runs for his family's businesses, is the proof point. The copy says he built and runs Jarvis
for those businesses; it does not say he operates the businesses. Hours on the page are
representative examples, labeled as such, not client case studies.

## Round 10: ADA / WCAG 2.1 AA pass and the legal pages

Matt asked for the site to be completely ADA compliant and to have all the legal pages, and
pointed at TikToks he had sent. TikTok Brain was down on every host during this run, so the two
saved briefs were used instead: ducktate's pre-launch legal checklist (terms of service, privacy
policy, cookie consent, no analytics or session replay without consent, locked-down data) and
yatesvids' "check and add the policy pages" prompt. Applied:

Legal pages (new, built from src/pages through the layout, linked from the footer Legal column,
no closing CTA band): /privacy/, /terms/, /accessibility/, /sms-terms/. The old footer links to
the live site's privacy.html and sms-terms.html are gone. The SMS terms are the live ones with
support@ instead of the gmail address. The privacy policy says plainly: no cookies, no analytics,
no ad pixels, no session replay, fonts served from this site; names Web3Forms, GitHub Pages,
Twilio, Anthropic/OpenAI; California (CCPA-style) rights honored for everyone; 45-day response.
Because the site sets no cookies there is no cookie banner (nothing to consent to). The contact
form has a one-line privacy notice above the status line.

Fonts now self-hosted (fonts/inter-latin.woff2, fonts/inter-tight-latin.woff2, variable weight,
latin subset, downloaded from Google Fonts' CDN) so the Google Fonts request, the only third-party
request on the site, is gone. @font-face is at the top of styles.css; layout.html preloads both.

Accessibility fixes (WCAG 2.1 AA, with 2.2 target-size and focus rules where they apply):
- "Pause animations" / "Resume animations" button in the footer (WCAG 2.2.2 pause/stop/hide for
  the globe, marquee, terminal feed, scroll stage and counters). Stores bs-motion=off in
  localStorage, applies html.rm before first paint (inline head script) and reloads. Every
  prefers-reduced-motion rule in styles.css, site.css and theme.css now has an html.rm twin;
  script.js, fx.js and calc.js treat the stored preference like the OS setting.
- Count-up numbers and the before/after totals now hold their final values in the HTML; JS zeroes
  them only when motion is on. Screen readers, no-JS and paused visitors read the real numbers.
  The scroll-scrubbed "hours back" block lost its aria-live (it changed every frame).
- Mobile menu: focus moves to the first link on open, Tab/Shift+Tab cycle inside the open menu,
  Escape returns focus to the button. The menu nav is labelled "Mobile" so it no longer shares the
  "Main" landmark name with the header nav.
- Copy-email button: visible text plus screen-reader text instead of an aria-label that hid the
  "Copied" state; a polite live region announces copied / failed.
- Contact form: confirmation block gets focus after a successful send; the native-POST fallback
  re-enables the button. Savings sliders carry aria-describedby to their hint text. The results
  panel is a div, not an aside (an aside inside main is a nested landmark).
- Inputs keep a visible focus ring (outline, not just a border change). main has tabindex=-1 so
  the skip link lands reliably. A forced-colors (Windows High Contrast) block gives buttons,
  cards and fields real borders and hides the purely decorative layers. .sr-only utility added.
- JSON-LD gained a CA/US address; footer copyright names the LLC and Southern California.

Verified with axe-core 4 (wcag2a/aa, wcag21a/aa, wcag22aa, best-practice) on all 11 pages at
1280 and 360 wide, motion on and off, plus a 320px reflow check: zero violations, no horizontal
overflow, no JS errors. Keyboard checks: first Tab hits the skip link, menu focus/Escape work,
pause toggle sets html.rm and the counters show final numbers. Asset query strings bumped to v=10.

## Round 9: gap pass against other AI consulting sites, support@ email

Matt asked for a full pass for anything missing compared with other AI consulting sites, and for
every email to go to support@biddlesystems.com. Compared against small-business AI consultancies
(Wolf TG, Attentus, Peerbits and others): they commonly show who the founder is, who they serve,
industries, data security, named AI tools, training and AI-policy offers, audit deliverables,
pricing model and more FAQs. Added:
- /about/ (new page, in nav): who you work with, good fit / not a fit, industries, security and
  privacy (business API access, least access, human approval, NDA), vendor-neutral tools.
- Services: "Beyond automation" (AI roadmap, team training, AI use policy, tool review).
- How it works FAQ: pricing model, which AI, existing software, what we need, leaving, NDA, remote.
- Contact: what the free audit gives you, location / remote / NDA line.
- Home marquee names Gmail, Outlook, Microsoft 365, Google Workspace, QuickBooks, Excel.
All mailto links, the copy button, the JSON-LD and meta descriptions now use
support@biddlesystems.com. The contact form still delivers wherever the Web3Forms key is
registered (set in the Web3Forms account, not in this code). Asset query strings bumped to ?v=9.
Not added because they need real facts from Matt: testimonials, a phone number, a booking
calendar link, a headshot, LinkedIn, published prices.

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
