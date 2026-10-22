/* Biddle Systems cinematic preview. Plain JS, no dependencies. Shared by every page.
   Effects: word-by-word headline, scroll reveals, count-ups, cursor spotlight, 3D tilt,
   a pinned scroll-scrubbed before/after stage, a tracing beam on the proof timeline,
   mobile menu, page transitions, magnetic buttons and the pinned horizontal process track.
   Every block checks its elements exist, so pages only get the effects they contain. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('js');
  if (reduced) doc.classList.add('rm');

  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  /* 1. Word-by-word headline reveal */
  Array.prototype.forEach.call(document.querySelectorAll('[data-words]'), function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'w';
      s.style.transitionDelay = (120 + i * 70) + 'ms';
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('in'); }); });
  });

  /* 2. Reveal on scroll */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  Array.prototype.forEach.call(document.querySelectorAll('.rv'), function (el) { revealIO.observe(el); });

  /* 3. Count-up numbers */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (reduced) { el.textContent = target.toFixed(decimals); return; }
    var dur = 900, t0 = performance.now();
    (function tick(now) {
      var t = clamp((now - t0) / dur, 0, 1);
      el.textContent = (target * easeOut(t)).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
    })(t0);
  }
  var countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { countUp(e.target); countIO.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) { countIO.observe(el); });

  /* 4. Cursor spotlight (hero) and per-card spotlight (bento) */
  var hero = document.querySelector('.hero, .page-hero');
  var spot = document.getElementById('spot');
  if (hero && spot && !reduced) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      spot.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      spot.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.bcard'), function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* 5. 3D tilt on hover (small angles, cheap transform only) */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-tilt]'), function (el) {
      var max = el.classList.contains('bcard') ? 4 : 7;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(1200px) rotateY(' + (x * max * 2).toFixed(2) + 'deg) rotateX(' + (-y * max * 2).toFixed(2) + 'deg)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* 6. Nav state and reading progress bar */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('progress');

  /* 7. Pinned before/after stage, scrubbed by scroll position */
  var shift = document.getElementById('shift');
  var scene = document.getElementById('scene');
  var beforeRows = Array.prototype.slice.call(document.querySelectorAll('#before-rows .row'));
  var afterRows = Array.prototype.slice.call(document.querySelectorAll('#after-rows .row'));
  var afterCard = document.querySelector('.card.after');
  var savedEl = document.getElementById('saved-total');
  var savedSub = document.getElementById('saved-sub');
  var afterTotalEl = document.getElementById('after-total');
  var afterMinutes = [20, 0, 40, 10, 0];
  var savedShown = 0, savedTarget = 0, afterShown = 0, afterTarget = 0;

  function setStage(p) {
    scene.style.setProperty('--p', p.toFixed(4));
    var start = 0.22, span = 0.52, n = afterRows.length;
    var landed = 0;
    savedTarget = 0; afterTarget = 0;
    for (var i = 0; i < n; i++) {
      var at = start + (i / n) * span;
      var on = p >= at;
      if (beforeRows[i]) beforeRows[i].classList.toggle('struck', on);
      afterRows[i].classList.toggle('landed', on);
      if (on) {
        landed++;
        savedTarget += parseFloat(afterRows[i].getAttribute('data-saved')) || 0;
        afterTarget += afterMinutes[i] / 60;
      }
    }
    afterCard.classList.toggle('lift', p > 0.82);
    if (landed === 0) savedSub.textContent = 'Keep scrolling';
    else if (landed < n) savedSub.textContent = landed + ' of ' + n + ' jobs handed off';
    else savedSub.textContent = 'Nearly two working days, every week';
  }

  function finalizeStage() {
    setStage(1);
    savedEl.textContent = savedTarget.toFixed(1);
    afterTotalEl.textContent = afterTarget.toFixed(1);
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    var docH = doc.scrollHeight - vh;

    if (nav) nav.classList.toggle('solid', y > 24);
    if (progress && docH > 0) progress.style.transform = 'scaleX(' + (y / docH).toFixed(4) + ')';

    if (shift && scene && !reduced) {
      var top = shift.offsetTop;
      var travel = shift.offsetHeight - vh;
      var p = clamp((y - top) / Math.max(1, travel), 0, 1);
      setStage(p);
    }

    var tl = document.getElementById('timeline');
    var beam = document.getElementById('beam');
    if (tl && beam) {
      var r = tl.getBoundingClientRect();
      var bp = reduced ? 1 : clamp((vh * 0.75 - r.top) / Math.max(1, r.height), 0, 1);
      beam.style.transform = 'scaleY(' + bp.toFixed(4) + ')';
    }
  }

  /* Smoothly chase the number targets so the counters feel scrubbed, not stepped. */
  function animateNumbers() {
    if (Math.abs(savedShown - savedTarget) > 0.005) {
      savedShown += (savedTarget - savedShown) * 0.12;
      savedEl.textContent = savedShown.toFixed(1);
    }
    if (Math.abs(afterShown - afterTarget) > 0.005) {
      afterShown += (afterTarget - afterShown) * 0.12;
      afterTotalEl.textContent = afterShown.toFixed(1);
    }
    requestAnimationFrame(animateNumbers);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', onScroll);

  if (reduced && shift) finalizeStage();
  else if (shift) requestAnimationFrame(animateNumbers);
  onScroll();

  /* 8. Marquee bands: drift on their own and speed up with scroll velocity */
  var tracks = Array.prototype.map.call(document.querySelectorAll('[data-marquee] .mq-track'), function (t) {
    return { el: t, x: 0 };
  });
  if (tracks.length && !reduced) {
    var lastY = window.scrollY, boost = 0;
    (function drift() {
      var y = window.scrollY;
      boost = boost * 0.9 + Math.abs(y - lastY) * 0.08;
      lastY = y;
      tracks.forEach(function (t) {
        var half = t.el.scrollWidth / 2;
        if (!half) return;
        t.x = (t.x + 0.5 + boost) % half;
        t.el.style.transform = 'translate3d(' + (-t.x).toFixed(1) + 'px,0,0)';
      });
      requestAnimationFrame(drift);
    })();
  }

  /* 9. Contact: copy email, submit the form without leaving the page */
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var done = function () { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('matt@biddlesystems.com').then(done, function () { copyBtn.textContent = 'Copy failed'; });
      } else {
        copyBtn.textContent = 'Copy failed';
      }
    });
  }

  /* 10. Mobile menu */
  var menuBtn = document.getElementById('menu-btn');
  var menu = document.getElementById('menu');
  if (menuBtn && menu) {
    var setMenu = function (open) {
      menu.hidden = !open;
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
    window.addEventListener('pageshow', function () { setMenu(false); });
  }

  /* 11. Page transitions. Browsers with cross-document view transitions animate on their own
     (site.css); the rest get a short curtain sweep before leaving. */
  var nativeVT = window.CSS && CSS.supports && CSS.supports('view-transition-name: none');
  if (!reduced && !nativeVT) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.protocol.indexOf('http') !== 0) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      doc.classList.add('leaving');
      setTimeout(function () { location.href = url.href; }, 280);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) doc.classList.remove('leaving'); });
  }

  /* 12. Magnetic primary buttons: drift a few px toward the cursor */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-magnet]'), function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.3;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* 13. Pinned horizontal track (process page): vertical scroll slides the cards sideways */
  var hs = document.getElementById('hs');
  var hsTrack = document.getElementById('hs-track');
  var hsFill = document.getElementById('hs-fill');
  if (hs && hsTrack && !reduced) {
    var hsCards = Array.prototype.slice.call(hsTrack.children);
    var hsUpdate = function () {
      var vh = window.innerHeight;
      var p = clamp((window.scrollY - hs.offsetTop) / Math.max(1, hs.offsetHeight - vh), 0, 1);
      var max = Math.max(0, hsTrack.scrollWidth - window.innerWidth);
      hsTrack.style.transform = 'translate3d(' + (-max * p).toFixed(1) + 'px,0,0)';
      if (hsFill) hsFill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      var mid = window.innerWidth * 0.62;
      hsCards.forEach(function (c) { c.classList.toggle('on', c.getBoundingClientRect().left < mid); });
    };
    var hsTick = false;
    window.addEventListener('scroll', function () {
      if (hsTick) return;
      hsTick = true;
      requestAnimationFrame(function () { hsUpdate(); hsTick = false; });
    }, { passive: true });
    window.addEventListener('resize', hsUpdate);
    hsUpdate();
  } else if (hsTrack) {
    Array.prototype.forEach.call(hsTrack.children, function (c) { c.classList.add('on'); });
  }

  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('status');
    var sent = document.getElementById('sent');
    var submit = document.getElementById('submit');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      status.className = 'status';
      status.textContent = 'Sending...';
      submit.disabled = true;
      var payload = {};
      Array.prototype.forEach.call(form.elements, function (el) { if (el.name) payload[el.name] = el.type === 'checkbox' ? el.checked : el.value; });
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, data: d }; }); })
        .then(function (r) {
          if (r.ok && r.data && r.data.success) {
            Array.prototype.forEach.call(form.querySelectorAll('.field, #submit, #status'), function (el) { el.hidden = true; });
            sent.hidden = false;
          } else {
            throw new Error((r.data && r.data.message) || 'Submission failed');
          }
        })
        .catch(function () {
          /* Network or CORS failure: fall back to a native POST, which lands on the live thanks page. */
          status.textContent = 'Sending...';
          form.submit();
        });
    });
  }

  /* Color palette switcher (preview only). Ten palettes live in theme.css as html[data-palette]
     blocks; arctic is the default (no attribute). The pick is remembered across pages, and
     ?palette=<id> in the URL forces one (handy for sending Matt a specific look). */
  var PALETTES = [
    ['arctic', 'Arctic', '#22d3ee', '#a5f3fc'],
    ['cobalt', 'Cobalt', '#60a5fa', '#c4b5fd'],
    ['violet', 'Ultraviolet', '#a78bfa', '#f0abfc'],
    ['sunset', 'Sunset', '#f472b6', '#fdba74'],
    ['crimson', 'Crimson', '#fb7185', '#fda4af'],
    ['ember', 'Ember', '#ff7a45', '#ffc857'],
    ['copper', 'Copper', '#e0895a', '#f3d1a8'],
    ['gold', 'Gold', '#fbbf24', '#fde68a'],
    ['lime', 'Lime', '#c6f432', '#f4f4f5'],
    ['emerald', 'Emerald', '#34d399', '#bef264']
  ];
  var palIndex = function (id) {
    for (var i = 0; i < PALETTES.length; i++) if (PALETTES[i][0] === id) return i;
    return -1;
  };
  var cur = palIndex(doc.getAttribute('data-palette') || 'arctic');
  if (cur < 0) { cur = 0; doc.removeAttribute('data-palette'); }

  var sw = document.createElement('div');
  sw.className = 'pal-switch';
  sw.setAttribute('role', 'group');
  sw.setAttribute('aria-label', 'Preview color palette');
  sw.innerHTML =
    '<button type="button" class="pal-arrow" data-step="-1" aria-label="Previous palette">‹</button>' +
    '<div class="pal-mid"><span class="pal-label"><i class="pal-chip" aria-hidden="true"></i><b class="pal-name"></b><span class="pal-count"></span></span>' +
    '<span class="pal-dots">' + PALETTES.map(function (p, i) {
      return '<button type="button" class="pal-dot" data-i="' + i + '" aria-label="' + p[1] + ' palette" style="--d1:' + p[2] + ';--d2:' + p[3] + '"></button>';
    }).join('') + '</span></div>' +
    '<button type="button" class="pal-arrow" data-step="1" aria-label="Next palette">›</button>' +
    '<span class="pal-live" aria-live="polite"></span>';
  document.body.appendChild(sw);

  var metaTheme = document.querySelector('meta[name="theme-color"]');
  var applyPalette = function (i, announce) {
    cur = (i + PALETTES.length) % PALETTES.length;
    var p = PALETTES[cur];
    if (cur === 0) doc.removeAttribute('data-palette'); else doc.setAttribute('data-palette', p[0]);
    try { localStorage.setItem('bs-palette', p[0]); } catch (e) { /* private mode */ }
    sw.querySelector('.pal-name').textContent = p[1];
    sw.querySelector('.pal-count').textContent = (cur + 1) + ' / ' + PALETTES.length;
    sw.querySelector('.pal-chip').style.background = 'linear-gradient(135deg,' + p[2] + ' 50%,' + p[3] + ' 50%)';
    Array.prototype.forEach.call(sw.querySelectorAll('.pal-dot'), function (d, k) { d.setAttribute('aria-pressed', k === cur ? 'true' : 'false'); });
    if (metaTheme) metaTheme.setAttribute('content', getComputedStyle(doc).getPropertyValue('--bg').trim());
    if (announce) sw.querySelector('.pal-live').textContent = p[1] + ' palette';
    document.dispatchEvent(new CustomEvent('palettechange', { detail: p[0] }));
  };
  sw.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-step')) applyPalette(cur + Number(b.getAttribute('data-step')), true);
    else applyPalette(Number(b.getAttribute('data-i')), true);
  });
  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if (e.key === '[') applyPalette(cur - 1, true);
    if (e.key === ']') applyPalette(cur + 1, true);
  });
  applyPalette(cur, false);
})();
