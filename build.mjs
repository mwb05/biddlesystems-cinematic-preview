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
    desc: 'Small businesses get their week back three ways: automations we build and run for you, AI proficiency courses for your team, and a self-serve tool that turns a short request into a working automation.' },
  { slug: 'services', path: 'services/', nav: 'Services', title: 'Services | Biddle Systems',
    og: 'Three ways to get your week back | Biddle Systems',
    desc: 'Three services: automation services (we build and run it), AI proficiency courses (your team learns to use AI well) and the automation tool (a short request becomes a working automation).' },
  { slug: 'savings', path: 'savings/', nav: 'Savings', title: 'Savings calculator | Biddle Systems',
    og: 'How many hours are you buying back? | Biddle Systems',
    desc: 'Slide in the hours your team spends on invoices, reports, inbox and follow-ups and see the hours and dollars AI automation hands back each week and year.' },
  { slug: 'process', path: 'process/', nav: 'How it works', title: 'How it works | Biddle Systems',
    og: 'Weeks, not quarters | Biddle Systems',
    desc: 'From a free audit call to your first automation running live in 30 days or less. Fixed quotes, your systems, and you own everything we build.' },
  { slug: 'proof', path: 'proof/', nav: 'Proof', title: 'Proof: Jarvis | Biddle Systems',
    og: 'Proven on real businesses first | Biddle Systems',
    desc: 'Matt Biddle built and runs Jarvis, an AI agent system with 90+ tools, for his family\'s businesses. Everything Biddle Systems sells, it already does every day.' },
  { slug: 'about', path: 'about/', nav: 'About', title: 'About | Biddle Systems',
    og: 'The person who builds it answers the email | Biddle Systems',
    desc: 'Who Biddle Systems is, who it is a good fit for, the industries we work with, how we keep your data private, and the AI tools we build with.' },
  { slug: 'contact', path: 'contact/', nav: 'Contact', title: 'Contact | Biddle Systems',
    og: 'Tell us where the hours go | Biddle Systems',
    desc: 'Book a free 45-minute automation audit. Email support@biddlesystems.com and get a reply within a business day.' },
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
// Round 12: the header, mobile menu and footer name the three services instead of one "Services"
// link. All three point at sections of the services page, so they never carry aria-current
// (three underlined links on one page would read as three current pages).
const SERVICE_LINKS = [
  { slug: 'services', path: 'services/#automation', nav: 'Automation', anchor: true },
  { slug: 'services', path: 'services/#courses', nav: 'Courses', anchor: true },
  { slug: 'services', path: 'services/#tool', nav: 'Tool', anchor: true },
];
const NAV_PAGES = PAGES.filter((p) => p.nav).flatMap((p) => (p.slug === 'services' ? SERVICE_LINKS : [p]));
const LEGAL_PAGES = PAGES.filter((p) => !p.nav);

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
      <p class="lede-sm">45 minutes, no pitch. You leave with the jobs that can run on their own, what each costs you today, and which of the three fits: we build it, we train your team, or you take the tool.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="{{ROOT}}contact/" data-magnet>Book the free audit</a>
        <a class="btn btn-ghost" href="mailto:support@biddlesystems.com">support@biddlesystems.com</a>
      </div>
    </div>
  </section>`;

for (const page of PAGES) {
  const root = page.path ? '../' : '';
  const links = (indent, cls) => NAV_PAGES.filter((p) => p.slug !== 'home' || cls === 'menu')
    .map((p, i) => `${indent}<a${cls === 'menu' ? ` style="--i:${i}"` : ''} href="${root}${p.path}"${p.slug === page.slug && !p.anchor ? ' aria-current="page"' : ''}>${p.nav}</a>`).join('\n');
  let content = read(`./src/pages/${page.slug}.html`)
    .replace('{{CTA}}', cta)
    .replace(/\{\{MARQUEE:([^}]+)\}\}/g, (m, list) => marquee(list));
  const vals = {
    TITLE: page.title, OG_TITLE: page.og, DESC: page.desc, PATH: page.path, SLUG: page.slug,
    NAV: links('      ', 'nav').split('\n').filter((l) => !l.includes('contact/')).join('\n'),
    MENU: links('    ', 'menu'),
    FOOTNAV: links('        ', 'foot'),
    LEGALNAV: LEGAL_PAGES.map((p) => `        <a href="${root}${p.path}"${p.slug === page.slug ? ' aria-current="page"' : ''}>${p.foot}</a>`).join('\n'),
    SCRIPTS: page.slug === 'savings' ? `<script src="${root}calc.js?v=11" defer></script>` : '',
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
