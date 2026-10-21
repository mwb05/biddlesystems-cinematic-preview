// Builds the three design options from one template, so the copy stays identical across them.
//   node build.mjs
// Template: src/page.html. Output: aurora/index.html, circuit/index.html, daylight/index.html.
// Each option folder also holds its own hand-written theme.css and fx.js.
import { readFileSync, writeFileSync } from 'node:fs';

const template = readFileSync(new URL('./src/page.html', import.meta.url), 'utf8');

const OPTIONS = [
  { slug: 'aurora', num: 1, name: 'Aurora' },
  { slug: 'circuit', num: 2, name: 'Circuit' },
  { slug: 'daylight', num: 3, name: 'Daylight' },
];

const switcher = (current) => `<nav class="opt-switch" aria-label="Design options">
  <a class="opt-all" href="../">All options</a>
${OPTIONS.map((o) => `  <a href="../${o.slug}/"${o.slug === current ? ' aria-current="page"' : ''}><b>${o.num}</b> ${o.name}</a>`).join('\n')}
</nav>`;

const marqueeWords = (words) => {
  const run = words.map((w) => `<span>${w}</span><span class="mq-sep">/</span>`).join('');
  return `<div class="mq-track">${run}${run}</div>`;
};

const parts = {
  aurora: {
    THEME_COLOR: '#07090f',
    BODY_START: `<canvas class="aurora-canvas" id="aurora" aria-hidden="true"></canvas>
<div class="grain" aria-hidden="true"></div>`,
    HERO_BG: `      <div class="glass-field" id="glass">
        <span class="g g-ring" data-depth="0.6"></span>
        <span class="g g-orb" data-depth="1.2"></span>
        <span class="g g-pill" data-depth="0.9"></span>
        <span class="g g-cube" data-depth="1.5"><i></i><i></i><i></i><i></i><i></i><i></i></span>
      </div>`,
    AFTER_HERO: `  <div class="marquee" aria-hidden="true" data-marquee>
    ${marqueeWords(['Invoices', 'Reports', 'Inbox', 'Follow-ups', 'Payables', 'Intake forms', 'Scheduling'])}
  </div>
`,
    SHIFT_BG: `      <div class="shift-halo" aria-hidden="true"></div>`,
    BEFORE_BENTO: '',
    AFTER_AUTOMATE: `  <section class="statement" aria-label="The result">
    <div class="container">
      <p class="statement-line" data-scale><span class="statement-num"><span data-count="15" >0</span>+ hours</span> of hand work, back every week.</p>
      <p class="statement-sub rv">That is the target for a ten-person team. Your audit puts real numbers on it.</p>
    </div>
  </section>
`,
    PROOF_EXTRA: '',
    BODY_END: '',
  },

  circuit: {
    THEME_COLOR: '#05070a',
    BODY_START: '',
    HERO_BG: `      <canvas class="globe" id="globe"></canvas>
      <div class="floor-wrap"><div class="floor"></div></div>`,
    AFTER_HERO: `  <div class="stack-strip" aria-label="Works with what you already use">
    <span class="stack-label">Plugs into what you already use</span>
    <div class="marquee marquee-sm" data-marquee aria-hidden="true">
      ${marqueeWords(['Email', 'Spreadsheets', 'POS exports', 'Payroll', 'Bank feeds', 'Accounting', 'CRM', 'Calendars', 'Text messages', 'PDFs'])}
    </div>
  </div>
`,
    SHIFT_BG: `      <div class="floor-wrap floor-wrap-shift" aria-hidden="true"><div class="floor"></div></div>`,
    BEFORE_BENTO: `      <figure class="flow rv" aria-label="Your inbox, POS exports, payroll, vendor invoices and web forms flow into your AI assistant, which produces the 6 am report, drafted replies, coded payables and sent follow-ups.">
        <div class="flow-stage" id="flow"></div>
        <figcaption>How the work moves once it is automated.</figcaption>
      </figure>
`,
    AFTER_AUTOMATE: '',
    PROOF_EXTRA: `        <div class="term rv" aria-hidden="true">
          <div class="term-head"><span></span><span></span><span></span><b>jarvis / activity</b></div>
          <pre class="term-log" id="term-log"></pre>
          <p class="term-note">Illustrative activity feed.</p>
        </div>`,
    BODY_END: '',
  },

  daylight: {
    THEME_COLOR: '#f4efe6',
    BODY_START: '',
    HERO_BG: `      <div class="blobs"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span></div>
      <svg class="clock" id="clock" viewBox="-100 -100 200 200" aria-hidden="true">
        <circle r="96" class="clock-rim"/>
        <g class="clock-ticks" id="clock-ticks"></g>
        <line class="clock-h" id="clock-h" x1="0" y1="8" x2="0" y2="-46"/>
        <line class="clock-m" id="clock-m" x1="0" y1="10" x2="0" y2="-72"/>
        <circle r="4" class="clock-pin"/>
      </svg>
      <div class="float-ui" id="float-ui">
        <div class="fl fl-text" data-depth="1.4"><b>Jarvis</b><span>Daily report is in your inbox. Sales up 8% on last Monday.</span></div>
        <div class="fl fl-chip" data-depth="0.8"><span class="fl-check"></span>Invoice 4471 coded and filed</div>
        <div class="fl fl-sticker" data-depth="1.8">+15 h<small>this week</small></div>
        <div class="fl fl-cal" data-depth="1.1"><b>Monday</b><span class="cal-free">9:00 Free</span><span class="cal-free">11:00 Free</span><span class="cal-x">Sales report (automated)</span></div>
      </div>`,
    AFTER_HERO: `  <div class="kinetic" aria-hidden="true">
    <p class="kin-line" data-kin="-1">Less busywork. More business. Less busywork. More business.</p>
    <p class="kin-line kin-alt" data-kin="1">Your week back. Your week back. Your week back. Your week back.</p>
  </div>
`,
    SHIFT_BG: '',
    BEFORE_BENTO: '',
    AFTER_AUTOMATE: '',
    PROOF_EXTRA: '',
    BODY_END: '',
  },
};

for (const o of OPTIONS) {
  const vals = {
    ...parts[o.slug],
    ROOT: '../',
    BODY_CLASS: `theme-${o.slug} has-switch`,
    TITLE_PREFIX: `Option ${o.num} ${o.name} | `,
    BODY_START: `${switcher(o.slug)}\n${parts[o.slug].BODY_START}`,
  };
  const html = template.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => {
    if (!(k in vals)) throw new Error(`No value for ${k} in ${o.slug}`);
    return vals[k];
  });
  writeFileSync(new URL(`./${o.slug}/index.html`, import.meta.url), html);
  console.log(`built ${o.slug}/index.html`);
}
