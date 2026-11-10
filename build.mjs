// Builds the multi-page site from one layout, so nav, footer and head stay identical on every page.
//   node build.mjs
// Layout: src/layout.html. Pages: src/pages/<slug>.html. Output: index.html and <slug>/index.html.
// Placeholders inside pages: {{ROOT}} (relative path to site root), {{CTA}} (shared closing band),
// {{MARQUEE:a,b,c}} (looping marquee track).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const layout = read('./src/layout.html');

const PAGES = [
  { slug: 'home', path: '', nav: 'Home', title: 'Biddle Systems | AI automation that gives small businesses their week back',
    og: 'Biddle Systems | Get your week back',
    desc: 'Three things for small businesses: automations we build and run for you, AI proficiency courses for your team, and Archer, our self-serve automation tool, which turns one sentence into a working automation.' },
  // Round 19: each service is its own page with its own hero animation (they used to be three
  // anchors on one services page). services/ stays as the side-by-side overview.
  { slug: 'automation', path: 'automation/', nav: 'Automation', title: 'Automation services | Biddle Systems',
    og: 'We build it. You get the hours back. | Biddle Systems',
    desc: 'Done-for-you automation for small businesses: we find the repetitive work, build automations inside the systems you already use, and keep them running.' },
  { slug: 'courses', path: 'courses/', nav: 'AI courses', title: 'AI proficiency courses | Biddle Systems',
    og: 'Your team, confident with AI | Biddle Systems',
    desc: 'Hands-on AI training built around your team\'s real work: where AI fits, how to ask for what you need, how to check the result, and what never goes in.' },
  { slug: 'tool', path: 'tool/', nav: 'Archer', title: 'Archer, our automation tool | Biddle Systems',
    og: 'Archer: say what you need. It builds it. | Biddle Systems',
    desc: 'Archer is our self-serve automation tool: describe a task by text or voice and get a working automation back, running in the systems you already use. No code.' },
  { slug: 'services', path: 'services/', nav: 'All services', navHide: true, title: 'Services | Biddle Systems',
    og: 'Three ways to get your week back | Biddle Systems',
    desc: 'Three services: automation services (we build and run it), AI proficiency courses (your team learns to use AI well) and Archer, our automation tool (a short request becomes a working automation).' },
  { slug: 'savings', path: 'savings/', nav: 'Savings', navHide: true, title: 'Savings calculator | Biddle Systems',
    og: 'How many hours are you buying back? | Biddle Systems',
    desc: 'Slide in the hours your team spends on invoices, reports, inbox and follow-ups and see the hours and dollars automation hands back each week and year.' },
  { slug: 'process', path: 'process/', nav: 'How it works', title: 'How it works | Biddle Systems',
    og: 'Days, not months | Biddle Systems',
    desc: 'From a free 30-minute audit call to your first automation running live, one task at a time, inside the systems you already use.' },
  { slug: 'proof', path: 'proof/', nav: 'Proof', title: 'Proof: Our AI Assistant | Biddle Systems',
    og: 'Proven on real businesses first | Biddle Systems',
    desc: 'Matt Biddle built his own AI agent system and uses it every day in his family\'s business. Everything Biddle Systems sells, it already does.' },
  { slug: 'about', path: 'about/', nav: 'About', title: 'About | Biddle Systems',
    og: 'The person who builds it answers the email | Biddle Systems',
    desc: 'Who Biddle Systems is, who it is a good fit for, the industries we work with, how we keep your data private, and the AI tools we build with.' },
  { slug: 'contact', path: 'contact/', nav: 'Contact', title: 'Contact | Biddle Systems',
    og: 'Tell us where the hours go | Biddle Systems',
    desc: 'Book a free 30-minute automation audit. Email support@biddlesystems.com and get a reply within a business day.' },
  // Legal pages: linked from the footer only (nav: null keeps them out of the main menu). No closing CTA band.
  { slug: 'privacy', path: 'privacy/', nav: null, foot: 'Privacy Policy', title: 'Privacy Policy | Biddle Systems',
    og: 'Privacy Policy | Biddle Systems',
    desc: 'What Biddle Systems collects when you use biddlesystems.com or the contact form, why, who processes it, and how to ask for a copy or deletion. No cookies, no ad tracking.' },
  { slug: 'terms', path: 'terms/', nav: null, foot: 'Terms of Use', title: 'Terms of Use | Biddle Systems',
    og: 'Terms of Use | Biddle Systems',
    desc: 'The terms for using biddlesystems.com: what the site is for, calculator estimates, intellectual property, disclaimers and limitation of liability.' },
  { slug: 'accessibility', path: 'accessibility/', nav: null, foot: 'Accessibility', title: 'Accessibility Statement | Biddle Systems',
    og: 'Accessibility Statement | Biddle Systems',
    desc: 'Biddle Systems aims for WCAG 2.1 Level AA across biddlesystems.com. What we do for keyboard, screen reader, contrast and motion, known limits, and how to report a problem.' },
  { slug: 'sms-terms', path: 'sms-terms/', nav: null, foot: 'SMS Terms', title: 'SMS Terms and Conditions | Biddle Systems',
    og: 'SMS Terms and Conditions | Biddle Systems',
    desc: 'Terms for the Biddle Systems SMS assistant program: who can join, how to opt in and out, message frequency and cost, and how messages are handled.' },
];
const NAV_PAGES = PAGES.filter((p) => p.nav);
const LEGAL_PAGES = PAGES.filter((p) => !p.nav);
const FOOT_SLUGS = ['services', 'process', 'proof', 'about', 'contact'];

const marquee = (list) => {
  const run = list.split(',').map((w) => `<span>${w.trim()}</span><span class="mq-sep">/</span>`).join('');
  return `<div class="mq-track">${run}${run}</div>`;
};

// Cross-links at the foot of each service page to the other two.
const SERVICES = [
  { slug: 'automation', num: '01 / Done for you', name: 'Automation services', text: 'We find the repetitive work, build the automations and keep them running.' },
  { slug: 'courses', num: '02 / Taught to your team', name: 'AI proficiency courses', text: 'Hands-on training so your team uses AI well and safely.' },
  { slug: 'tool', num: '03 / Built by you', name: 'Archer', text: 'Describe a task by text or voice and get a working automation.' },
];
const others = (slug) => `  <section class="section section-tight" aria-labelledby="others-title">
    <div class="container">
      <div class="section-head rv">
        <p class="eyebrow">The other two services</p>
        <h2 class="h-display" id="others-title">Prefer a different approach?</h2>
      </div>
      <div class="explore-grid explore-2">
${SERVICES.filter((x) => x.slug !== slug).map((x, i) => `        <a class="xcard rv" href="{{ROOT}}${x.slug}/" style="--d:${i * 80}ms">
          <span class="x-num">${x.num}</span>
          <h3>${x.name}</h3>
          <p>${x.text}</p>
          <span class="x-go" aria-hidden="true"></span>
        </a>`).join('\n')}
      </div>
    </div>
  </section>`;

const cta = `  <section class="cta-band" aria-labelledby="cta-title">
    <div class="cta-glow" aria-hidden="true"></div>
    <div class="floor-wrap floor-wrap-cta" aria-hidden="true"><div class="floor"></div></div>
    <div class="container cta-inner rv">
      <p class="eyebrow">Free automation audit</p>
      <h2 class="cta-title" id="cta-title">See what could run <span class="hl">on its own</span>.</h2>
      <p class="lede-sm">A 30-minute call, no sales pitch. You leave knowing which tasks can run on their own and which service fits: we build it, we train your team, or you use the tool.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="{{ROOT}}contact/" data-magnet>Book the free audit</a>
        <a class="btn btn-ghost" href="mailto:support@biddlesystems.com">support@biddlesystems.com</a>
      </div>
    </div>
  </section>`;

for (const page of PAGES) {
  const root = page.path ? '../' : '';
  const links = (indent, cls) => NAV_PAGES.filter((p) => (p.slug !== 'home' || cls === 'menu') && !(p.navHide && cls === 'nav'))
    .map((p, i) => `${indent}<a${cls === 'menu' ? ` style="--i:${i}"` : ''} href="${root}${p.path}"${p.slug === page.slug ? ' aria-current="page"' : ''}>${p.nav}</a>`).join('\n');
  let content = read(`./src/pages/${page.slug}.html`)
    .replace('{{CTA}}', cta)
    .replace('{{OTHERS}}', () => others(page.slug))
    .replace(/\{\{MARQUEE:([^}]+)\}\}/g, (m, list) => marquee(list));
  const vals = {
    TITLE: page.title, OG_TITLE: page.og, DESC: page.desc, PATH: page.path, SLUG: page.slug,
    NAV: links('      ', 'nav').split('\n').filter((l) => !l.includes('contact/')).join('\n'),
    MENU: links('    ', 'menu'),
    // Footer keeps a short list (Matt: "too many are listed out"); the service pages are one click away via Services.
    FOOTNAV: links('        ', 'foot').split('\n').filter((l) => FOOT_SLUGS.some((s) => l.includes(`href="${root}${s}/"`))).join('\n')
      .replace('>All services<', '>Services<'),
    LEGALNAV: LEGAL_PAGES.map((p) => `        <a href="${root}${p.path}"${p.slug === page.slug ? ' aria-current="page"' : ''}>${p.foot}</a>`).join('\n'),
    SCRIPTS: page.slug === 'savings' ? `<script src="${root}calc.js?v=12" defer></script>` : '',
    CONTENT: content,
  };
  const html = layout
    .replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => {
      if (k === 'ROOT') return m;
      if (!(k in vals)) throw new Error(`No value for ${k} in ${page.slug}`);
      return vals[k];
    })
    .replace(/\{\{ROOT\}\}/g, root);
  if (/\{\{[A-Z_:]+/.test(html)) throw new Error(`Unreplaced placeholder in ${page.slug}`);
  const out = page.path ? `./${page.path}index.html` : './index.html';
  if (page.path) mkdirSync(new URL(`./${page.path}`, import.meta.url), { recursive: true });
  writeFileSync(new URL(out, import.meta.url), html);
  console.log(`built ${out}`);
}
