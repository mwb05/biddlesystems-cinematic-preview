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
    desc: 'Biddle Systems builds AI automation for small businesses: invoices, reports, inbox triage and follow-ups that run on their own, so your team gets hours back every week.' },
  { slug: 'services', path: 'services/', nav: 'Services', title: 'Services | Biddle Systems',
    og: 'Six jobs to stop doing by hand | Biddle Systems',
    desc: 'Reports, inbox, invoices, forms, follow-ups and a private AI assistant. What each automation replaces, the before and after, and the turnaround.' },
  { slug: 'savings', path: 'savings/', nav: 'Savings', title: 'Savings calculator | Biddle Systems',
    og: 'How many hours are you buying back? | Biddle Systems',
    desc: 'Slide in the hours your team spends on invoices, reports, inbox and follow-ups and see the hours and dollars AI automation hands back each week and year.' },
  { slug: 'process', path: 'process/', nav: 'How it works', title: 'How it works | Biddle Systems',
    og: 'Weeks, not quarters | Biddle Systems',
    desc: 'From a free audit call to your first automation running live in 30 days or less. Fixed quotes, your systems, and you own everything we build.' },
  { slug: 'proof', path: 'proof/', nav: 'Proof', title: 'Proof: Jarvis | Biddle Systems',
    og: 'Proven on real businesses first | Biddle Systems',
    desc: 'Matt Biddle built and runs Jarvis, an AI agent system with 90+ tools, for his family\'s businesses. Everything Biddle Systems sells, it already does every day.' },
  { slug: 'contact', path: 'contact/', nav: 'Contact', title: 'Contact | Biddle Systems',
    og: 'Tell us where the hours go | Biddle Systems',
    desc: 'Book a free 45-minute automation audit. Email matt@biddlesystems.com and get a reply within a business day.' },
];

const marquee = (list) => {
  const run = list.split(',').map((w) => `<span>${w.trim()}</span><span class="mq-sep">/</span>`).join('');
  return `<div class="mq-track">${run}${run}</div>`;
};

const cta = `  <section class="cta-band" aria-labelledby="cta-title">
    <div class="cta-glow" aria-hidden="true"></div>
    <div class="floor-wrap floor-wrap-cta" aria-hidden="true"><div class="floor"></div></div>
    <div class="container cta-inner rv">
      <p class="eyebrow">Free automation audit</p>
      <h2 class="cta-title" id="cta-title">Find your first <span class="hl">10 hours</span> a week.</h2>
      <p class="lede-sm">45 minutes, no pitch. You leave with a list of the jobs that can run on their own and the hours each one costs you today.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="{{ROOT}}contact/" data-magnet>Book the free audit</a>
        <a class="btn btn-ghost" href="mailto:matt@biddlesystems.com">matt@biddlesystems.com</a>
      </div>
    </div>
  </section>`;

for (const page of PAGES) {
  const root = page.path ? '../' : '';
  const links = (indent, cls) => PAGES.filter((p) => p.slug !== 'home' || cls === 'menu')
    .map((p, i) => `${indent}<a${cls === 'menu' ? ` style="--i:${i}"` : ''} href="${root}${p.path}"${p.slug === page.slug ? ' aria-current="page"' : ''}>${p.nav}</a>`).join('\n');
  let content = read(`./src/pages/${page.slug}.html`)
    .replace('{{CTA}}', cta)
    .replace(/\{\{MARQUEE:([^}]+)\}\}/g, (m, list) => marquee(list));
  const vals = {
    TITLE: page.title, OG_TITLE: page.og, DESC: page.desc, PATH: page.path, SLUG: page.slug,
    NAV: links('      ', 'nav').split('\n').filter((l) => !l.includes('contact/')).join('\n'),
    MENU: links('    ', 'menu'),
    FOOTNAV: links('        ', 'foot'),
    SCRIPTS: page.slug === 'savings' ? `<script src="${root}calc.js?v=5" defer></script>` : '',
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
