/* The ride: home page scroll story (round 23).
   1. A fixed canvas of 3D particles behind the page. Every section with data-shape names a form
      (storm, lattice, orbit, globe, portal...); as you scroll from one section to the next the
      particles morph between their forms and the camera drifts, so the whole page feels like one
      continuous camera move. Plain 2D canvas with a perspective projection: no WebGL, no
      textures, ~1.4k points on desktop and ~600 on a phone.
   2. Scroll-scrubbed scenes. The tall .rs sections pin their content (CSS sticky) and GSAP
      ScrollTrigger timelines scrub against scroll position. Lenis smooths wheel scrolling on
      desktop (touch keeps native scrolling).
   Reduced motion or "Pause animations": the vendor libraries are never loaded, the canvas paints
   one calm still frame, and the scenes stay as plain sections (ride.css). Without JS none of this
   runs and the page reads top to bottom. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var canvas = document.getElementById('ride-canvas');
  if (!canvas) return;

  var motionOff = false;
  try { motionOff = localStorage.getItem('bs-motion') === 'off'; } catch (err) {}
  var reduced = motionOff || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia('(max-width: 900px)').matches;
  var root = (document.querySelector('script[src*="ride.js"]') || {}).src || '';
  root = root.replace(/ride\.js.*$/, '');

  /* ================= 1. particle field ================= */
  var ctx = canvas.getContext('2d');
  var N = small ? 600 : 1400;
  var R1 = new Float32Array(N), R2 = new Float32Array(N), R3 = new Float32Array(N);
  var seed = 7;
  var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (var k = 0; k < N; k++) { R1[k] = rnd(); R2[k] = rnd(); R3[k] = rnd(); }
  var TAU = Math.PI * 2, GOLD = Math.PI * (3 - Math.sqrt(5));
  var out = [0, 0, 0];

  /* Each shape writes point k's position at time t into out. Roughly unit scale. */
  var SHAPES = {
    drift: function (k, t) {
      var r = 1.7 * Math.cbrt(R1[k]), th = R2[k] * TAU + t * 0.04 * (0.4 + R1[k]), ph = Math.acos(2 * R3[k] - 1);
      out[0] = r * Math.sin(ph) * Math.cos(th); out[1] = r * Math.cos(ph) * 0.8; out[2] = r * Math.sin(ph) * Math.sin(th);
    },
    storm: function (k, t) {
      var r = 0.35 + 1.9 * R1[k], th = R2[k] * TAU + t * 0.55 / (0.25 + r), ph = Math.acos(2 * R3[k] - 1);
      var j = 0.06 * Math.sin(t * 3 + k);
      out[0] = (r + j) * Math.sin(ph) * Math.cos(th); out[1] = (r * Math.cos(ph)) * 0.55 + 0.05 * Math.sin(t * 2 + k * 0.7); out[2] = (r + j) * Math.sin(ph) * Math.sin(th);
    },
    lattice: function (k, t) {
      var idx = Math.floor(R1[k] * 27), axis = idx % 3, a = (Math.floor(idx / 3) % 3) - 1, b = Math.floor(idx / 9) - 1;
      var s = R2[k] * 2 - 1, j = (R3[k] - 0.5) * 0.03, S = 0.95;
      if (axis === 0) { out[0] = s * S; out[1] = a * S + j; out[2] = b * S; }
      else if (axis === 1) { out[0] = a * S + j; out[1] = s * S; out[2] = b * S; }
      else { out[0] = a * S; out[1] = b * S + j; out[2] = s * S; }
    },
    orbit: function (k, t) {
      var u = R1[k] * TAU + t * 0.4, v = R2[k] * TAU, rr = 0.12 + 0.16 * R3[k], R = 1.3;
      out[0] = (R + rr * Math.cos(v)) * Math.cos(u); out[1] = rr * Math.sin(v); out[2] = (R + rr * Math.cos(v)) * Math.sin(u);
    },
    field: function (k, t) {
      var gx = Math.round((R1[k] * 2 - 1) * 10) / 10 * 2.4, gz = (R2[k] * 2 - 1) * 2.4;
      if (R3[k] < 0.5) { var tmp = gx; gx = gz; gz = Math.round(tmp / 0.24) * 0.24; }
      out[0] = gx; out[2] = gz; out[1] = -0.75 + 0.12 * Math.sin(gx * 1.6 + t * 0.9) * Math.cos(gz * 1.3 + t * 0.6);
    },
    globe: function (k, t) {
      var y = 1 - 2 * (k + 0.5) / N, r = Math.sqrt(1 - y * y), ph = k * GOLD + t * 0.12, R = 1.15;
      out[0] = Math.cos(ph) * r * R; out[1] = y * R; out[2] = Math.sin(ph) * r * R;
    },
    portal: function (k, t) {
      var W = 1.6, H = 1.0;
      if (R3[k] < 0.3) { /* frame */
        var p = R1[k] * 4, s = (p % 1) * 2 - 1, e = Math.floor(p);
        out[0] = e < 2 ? s * W : (e === 2 ? -W : W); out[1] = e < 2 ? (e === 0 ? -H : H) : s * H;
      } else { /* rows of list items */
        var row = Math.floor(R2[k] * 6); out[0] = (R1[k] * 2 - 1) * W * 0.85; out[1] = -H + 0.3 + row * 0.3;
      }
      out[2] = 0.02 * Math.sin(t + k);
    },
    helix: function (k, t) {
      var x = (R1[k] * 2 - 1) * 2.1, strand = R2[k] < 0.5 ? 0 : Math.PI, a = x * 2.6 + strand + t * 0.5, rr = 0.38 + (R3[k] - 0.5) * 0.06;
      out[0] = x; out[1] = rr * Math.cos(a); out[2] = rr * Math.sin(a);
      if (R3[k] > 0.85) { out[1] *= (R3[k] - 0.85) * 6.6 - 0.5; } /* rungs */
    },
    core: function (k, t) {
      if (R3[k] < 0.55) {
        var r = 0.42 * Math.cbrt(R1[k]), th = R2[k] * TAU + t * 0.3, ph = Math.acos(2 * (R3[k] / 0.55) - 1);
        out[0] = r * Math.sin(ph) * Math.cos(th); out[1] = r * Math.cos(ph); out[2] = r * Math.sin(ph) * Math.sin(th);
      } else { /* rays streaming outward */
        var d = 0.45 + ((R1[k] + t * 0.12) % 1) * 2.4, a2 = R2[k] * TAU, b2 = Math.acos(2 * ((R3[k] - 0.55) / 0.45) - 1);
        out[0] = d * Math.sin(b2) * Math.cos(a2); out[1] = d * Math.cos(b2) * 0.7; out[2] = d * Math.sin(b2) * Math.sin(a2);
      }
    }
  };
  SHAPES.alert = SHAPES.orbit;

  /* camera per shape: distance, pitch, horizontal offset (fraction of width, desktop), brightness */
  var CAM = {
    drift: [3.6, 0.25, 0, 0.8], storm: [3.0, 0.3, 0.2, 1], lattice: [3.4, 0.45, 0.22, 0.95],
    orbit: [3.1, 0.55, -0.2, 1], alert: [3.1, 0.55, 0.22, 1], field: [3.2, 0.32, 0, 0.6],
    globe: [3.3, 0.2, 0.22, 0.9], portal: [3.6, 0.1, -0.22, 0.75], helix: [3.4, 0.25, 0, 0.6], core: [3.4, 0.2, 0, 1]
  };

  var anchors = [];
  function measure() {
    var vh = window.innerHeight;
    anchors = Array.prototype.map.call(document.querySelectorAll('[data-shape]'), function (el) {
      var top = el.getBoundingClientRect().top + window.scrollY;
      var h = el.offsetHeight;
      return { shape: el.getAttribute('data-shape'), el: el, y: top + Math.max(0, h - vh) / 2 - (h < vh ? (vh - h) / 2 : 0), top: top, h: h };
    });
  }

  var W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    measure();
  }

  var smooth = function (a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var A_RGB = [125, 211, 252], G_RGB = [224, 242, 254], RED = [255, 84, 84];
  var px = new Float32Array(N * 3);

  /* local progress (0..1) of a scene: 0 when its top reaches the top of the screen, 1 when its bottom reaches the bottom */
  function localP(el, y) {
    var top = el.getBoundingClientRect().top + window.scrollY;
    return Math.max(0, Math.min(1, (y - top) / Math.max(1, el.offsetHeight - window.innerHeight)));
  }

  var camYaw = 0, camPitch = 0.3, camDist = 3.6, camOff = 0, camBright = 0.8, first = true;
  var fixEl = document.getElementById('fix');

  function frame(t) {
    var y = window.scrollY;
    if (!anchors.length) return;
    /* which two shapes are we between? */
    var i = 0;
    while (i < anchors.length - 1 && y >= anchors[i + 1].y) i++;
    var a = anchors[i], b = anchors[Math.min(i + 1, anchors.length - 1)];
    var m = a === b ? 0 : smooth(0.2, 0.8, (y - a.y) / Math.max(1, b.y - a.y));
    if (y < anchors[0].y) m = 0;
    var fa = SHAPES[a.shape] || SHAPES.drift, fb = SHAPES[b.shape] || SHAPES.drift;
    var ca = CAM[a.shape] || CAM.drift, cb = CAM[b.shape] || CAM.drift;

    /* camera chases its target so even a scroll jump turns into a glide */
    var k2 = first ? 1 : 0.06; first = false;
    camDist += (lerp(ca[0], cb[0], m) - camDist) * k2;
    camPitch += (lerp(ca[1], cb[1], m) - camPitch) * k2;
    camOff += ((small ? 0 : lerp(ca[2], cb[2], m)) - camOff) * k2;
    camBright += (lerp(ca[3], cb[3], m) - camBright) * k2;
    var heroP = anchors[0] ? Math.min(1, y / Math.max(1, anchors[0].h * 0.6)) : 0;
    var dist = camDist - (a.shape === 'drift' ? heroP * 1.1 : 0); /* hero: fly into the cloud */
    camYaw = t * 0.00006 + y * 0.00035;

    /* fix scene: a slice of the ring turns red, then heals */
    var alarm = 0;
    if (fixEl && (a.shape === 'alert' || b.shape === 'alert')) {
      var fp = localP(fixEl, y);
      alarm = smooth(0.25, 0.4, fp) * (1 - smooth(0.6, 0.72, fp));
      if (a.shape !== 'alert' && b.shape === 'alert') alarm *= m;
      if (a.shape === 'alert' && b.shape !== 'alert') alarm *= 1 - m;
    }

    var cy = Math.cos(camYaw), sy = Math.sin(camYaw), cp = Math.cos(camPitch), sp = Math.sin(camPitch);
    var f = Math.min(W, H * 1.25) * 0.62;
    var cx = W * (0.5 + camOff), cyy = H * 0.5;
    var ts = t / 1000;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    var base = small ? 1.5 : 1.7;
    for (var k = 0; k < N; k++) {
      fa(k, ts); var ax = out[0], ay = out[1], az = out[2];
      if (m > 0) { fb(k, ts); ax = lerp(ax, out[0], m); ay = lerp(ay, out[1], m); az = lerp(az, out[2], m); }
      /* yaw then pitch */
      var x1 = ax * cy - az * sy, z1 = ax * sy + az * cy;
      var y1 = ay * cp - z1 * sp, z2 = ay * sp + z1 * cp;
      var zz = z2 + dist;
      if (zz < 0.2) continue;
      var s = f / zz;
      var X = cx + x1 * s, Y = cyy + y1 * s;
      if (X < -10 || X > W + 10 || Y < -10 || Y > H + 10) continue;
      var depth = Math.max(0, Math.min(1, 1.25 - zz / (dist + 1.6)));
      var al = (0.18 + 0.75 * depth) * camBright;
      var col = A_RGB;
      if (R3[k] > 0.92) col = G_RGB;
      if (alarm > 0) {
        var ang = Math.atan2(az, ax);
        if (ang > 0.2 && ang < 1.5) col = [lerp(col[0], RED[0], alarm), lerp(col[1], RED[1], alarm), lerp(col[2], RED[2], alarm)];
      }
      ctx.fillStyle = 'rgba(' + (col[0] | 0) + ',' + (col[1] | 0) + ',' + (col[2] | 0) + ',' + al.toFixed(3) + ')';
      var sz = base * s / f * 3.4 * (0.6 + R2[k] * 0.8);
      ctx.fillRect(X - sz / 2, Y - sz / 2, sz, sz);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  resize();
  window.addEventListener('resize', function () { small = window.matchMedia('(max-width: 900px)').matches; resize(); });
  window.addEventListener('load', measure);
  if (window.ResizeObserver) new ResizeObserver(function () { measure(); }).observe(document.body);

  if (reduced) {
    /* one calm still frame, redrawn only on resize */
    var still = function () { frame(0); };
    still(); window.addEventListener('resize', still);
    canvas.classList.add('on');
    return;
  }

  var running = true;
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && !running) { running = true; requestAnimationFrame(loop); }
  });
  function loop(t) {
    if (document.hidden) { running = false; return; }
    frame(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(function (t) { frame(t); canvas.classList.add('on'); requestAnimationFrame(loop); });

  /* ================= 2. scroll-scrubbed scenes (GSAP + ScrollTrigger + Lenis) ================= */
  function load(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = root + src; s.async = false; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  Promise.all([load('vendor/gsap.min.js'), load('vendor/ScrollTrigger.min.js'), load('vendor/lenis.min.js')])
    .then(scenes)
    .catch(function () { /* libraries failed: the pinned scenes still show their content statically */ });

  function scenes() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    gsap.registerPlugin(ST);

    if (window.Lenis && !window.matchMedia('(pointer: coarse)').matches) {
      var lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 0.9, anchors: { offset: 0 } });
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
      doc.classList.add('lenis');
    }

    var q = function (sel, ctxEl) { return Array.prototype.slice.call((ctxEl || document).querySelectorAll(sel)); };
    var scrub = function (trigger, opts) {
      return gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: Object.assign({ trigger: trigger, start: 'top top', end: 'bottom bottom', scrub: 0.8 }, opts || {}) });
    };
    var intro = function (tl, sc) {
      /* every pinned scene: copy rises in at the start */
      var parts = q('.r-copy > *', sc);
      tl.from(parts, { y: 50, opacity: 0, stagger: 0.025, duration: 0.12 }, 0);
      return tl;
    };

    /* 0. hero: the headline pushes toward the camera and dissolves as the cloud swallows the view */
    var hero = document.querySelector('.rs-hero');
    if (hero) {
      scrub(hero, { end: 'bottom top', scrub: 0.5 })
        .to('.r-hero-copy', { scale: 1.35, y: -40, opacity: 0, filter: 'blur(10px)', duration: 1 }, 0.25)
        .to('.r-cue', { opacity: 0, duration: 0.2 }, 0);
    }

    /* 1. the pile: chores fly at you out of the dark, the clock runs the week away */
    var pile = document.querySelector('.rs-pile');
    if (pile) {
      var cards = q('.pcard', pile);
      var clock = document.getElementById('pile-clock'), hours = document.getElementById('pile-hours');
      var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      var tl1 = intro(scrub(pile), pile);
      cards.forEach(function (c, i) {
        var dir = i % 2 ? 1 : -1;
        tl1.fromTo(c, { opacity: 0, x: dir * (180 + i * 30), y: -120 + i * 25, z: -900, rotation: dir * 30, rotationX: 40, scale: 0.6 },
          { opacity: 1, x: 0, y: 0, z: 0, rotation: c.style.getPropertyValue('--r') || 0, rotationX: 0, scale: 1, duration: 0.14, ease: 'power2.out' }, 0.08 + i * 0.065);
      });
      /* the pile trembles under its own weight, then gets swept off the table */
      tl1.to(cards, { x: function (i) { return (i % 2 ? 1 : -1) * 700; }, y: function (i) { return -200 + i * 40; }, rotation: function (i) { return (i % 2 ? 1 : -1) * 40; }, opacity: 0, stagger: 0.012, duration: 0.14, ease: 'power2.in' }, 0.74)
        .to(q('.r-copy', pile), { opacity: 0, y: -60, duration: 0.1 }, 0.74)
        .fromTo('#pile-kicker', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.1 }, 0.82)
        .to('#pile-kicker', { opacity: 0, scale: 1.4, duration: 0.06 }, 0.95);
      var meter = { h: 0, d: 0 };
      hours.textContent = '0.0';
      tl1.fromTo(meter, { h: 0, d: 0 }, {
        h: 16.5, d: 1, duration: 0.6,
        onUpdate: function () {
          hours.textContent = meter.h.toFixed(1);
          var mins = meter.d * (5 * 15.75 * 60); /* Monday 6:04 am .. Friday 9:49 pm, 15h45 a day */
          var day = Math.min(4, Math.floor(mins / (15.75 * 60)));
          var m = 6 * 60 + 4 + (mins - day * 15.75 * 60);
          var hh = Math.floor(m / 60), mm = Math.floor(m % 60), ap = hh >= 12 ? 'pm' : 'am', h12 = ((hh + 11) % 12) + 1;
          clock.textContent = DAYS[day] + ', ' + h12 + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ap;
        }
      }, 0.1);
    }

    /* 2. we build it: the steps snap into place along a wire, then get stamped */
    var build = document.querySelector('.rs-build');
    if (build) {
      var tl2 = intro(scrub(build), build);
      tl2.fromTo(q('.fb-line i', build), { scaleY: 0 }, { scaleY: 1, duration: 0.5 }, 0.15);
      q('.fb-step', build).forEach(function (s, i) {
        tl2.from(s, { opacity: 0, x: 120, rotationY: -35, z: -200, duration: 0.12, ease: 'power2.out' }, 0.15 + i * 0.13);
      });
      tl2.from(q('.fb-stamp', build), { opacity: 0, scale: 2.4, rotation: 10, duration: 0.08, ease: 'back.out(2)' }, 0.72)
        .to(q('.r-visual', build), { scale: 0.92, opacity: 0, z: -200, duration: 0.1 }, 0.92)
        .to(q('.r-copy', build), { opacity: 0, y: -40, duration: 0.08 }, 0.93);
    }

    /* 3. we run it: the panel swings in, the clock ticks through the morning, jobs land */
    var run = document.querySelector('.rs-run');
    if (run) {
      var tl3 = intro(scrub(run), run);
      var runClock = document.getElementById('run-clock'), runHours = document.getElementById('run-hours');
      var saved = [70, 50, 80, 15];
      runHours.textContent = '0.0'; runClock.textContent = 'Tuesday, 6:00 am';
      tl3.from(q('.r-panel', run), { rotationX: 38, rotationY: 18, y: 120, z: -300, opacity: 0, duration: 0.18, ease: 'power2.out' }, 0.02);
      q('.runlist li', run).forEach(function (li, i) {
        tl3.from(li, { opacity: 0.12, x: -24, duration: 0.06 }, 0.24 + i * 0.12);
      });
      var mo = { t: 0 };
      tl3.fromTo(mo, { t: 0 }, {
        t: 1, duration: 0.6,
        onUpdate: function () {
          var mins = Math.round(mo.t * 4);
          runClock.textContent = 'Tuesday, 6:0' + mins + ' am';
          var landed = 0;
          for (var i = 0; i < saved.length; i++) if (mo.t >= (i + 0.5) / 4.5) landed += saved[i];
          runHours.textContent = (landed / 60).toFixed(1);
        }
      }, 0.22)
        .to(q('.r-visual', run), { opacity: 0, y: -60, duration: 0.08 }, 0.93)
        .to(q('.r-copy', run), { opacity: 0, y: -40, duration: 0.08 }, 0.93);
    }

    /* 4. we fix it: all healthy -> something breaks at 2:13 am (red) -> fixed by 2:31 -> calm morning */
    var fix = document.querySelector('.rs-fix');
    if (fix) {
      var mon = document.getElementById('monitor');
      var tl4 = intro(scrub(fix), fix);
      var lines = q('.ml', fix);
      tl4.from(mon, { y: 80, opacity: 0, rotationX: 20, duration: 0.12 }, 0.02)
        .set(lines, { opacity: 0.08 }, 0)
        .to(lines[0], { opacity: 1, duration: 0.04 }, 0.28)
        .to(fix.querySelector('.ms-ok-0'), { opacity: 0, duration: 0.02 }, 0.28)
        .to(fix.querySelector('.ms-bad'), { opacity: 1, duration: 0.02 }, 0.28)
        .fromTo(mon, { '--alarm': 0 }, { '--alarm': 1, duration: 0.08 }, 0.28)
        .fromTo(mon, { x: 0 }, { x: 8, duration: 0.01, repeat: 5, yoyo: true }, 0.3)
        .to(lines[1], { opacity: 1, duration: 0.04 }, 0.42)
        .to(lines[2], { opacity: 1, duration: 0.04 }, 0.56)
        .to(fix.querySelector('.ms-bad'), { opacity: 0, duration: 0.02 }, 0.6)
        .to(fix.querySelector('.ms-ok'), { opacity: 1, duration: 0.02 }, 0.6)
        .to(mon, { '--alarm': 0, duration: 0.08 }, 0.6)
        .to(lines[3], { opacity: 1, duration: 0.04 }, 0.7)
        .to(q('.r-visual', fix), { opacity: 0, scale: 0.94, duration: 0.08 }, 0.93)
        .to(q('.r-copy', fix), { opacity: 0, y: -40, duration: 0.08 }, 0.93);
    }

    /* 6. proof: the activity terminal swings flat as it arrives */
    var term = document.querySelector('.r-term');
    if (term) {
      gsap.fromTo(term, { rotationY: -28, rotationX: 10, transformPerspective: 1200, opacity: 0.3, x: 60 },
        { rotationY: 0, rotationX: 0, opacity: 1, x: 0, ease: 'none', scrollTrigger: { trigger: term, start: 'top 95%', end: 'center 55%', scrub: 0.8 } });
    }

    /* 7. Archer: the portal rises off the floor into view, rows light up, you ask for one more */
    var archer = document.querySelector('.rs-archer');
    if (archer) {
      var tl7 = intro(scrub(archer), archer);
      var portal = archer.querySelector('.portal');
      var rows = q('.po-list li:not(.po-new)', archer);
      tl7.fromTo(portal, { rotationX: 62, rotationZ: -8, y: 160, z: -500, opacity: 0 }, { rotationX: 0, rotationZ: 0, y: 0, z: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.02);
      rows.forEach(function (r, i) { tl7.from(r, { opacity: 0, x: 30, duration: 0.06 }, 0.22 + i * 0.05); });
      tl7.from(q('.vz-b.in', archer), { opacity: 0, y: 20, scale: 0.9, duration: 0.07 }, 0.5)
        .from(q('.vz-b.out', archer), { opacity: 0, y: 20, scale: 0.9, duration: 0.07 }, 0.62)
        .from(q('.po-new', archer), { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, duration: 0.08 }, 0.74)
        .to(portal, { rotationY: -10, scale: 0.96, duration: 0.2 }, 0.8);
    }

    /* finale: the call to action lands with a push-in */
    var cta = document.querySelector('.r-finale .cta-inner');
    if (cta) {
      /* hand the block from the CSS scroll-reveal (.rv) to GSAP, or the tween would run 0 -> 0 */
      cta.classList.remove('rv');
      gsap.fromTo(cta, { scale: 0.85, opacity: 0, y: 80 }, { scale: 1, opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: '.r-finale', start: 'top 90%', end: 'top 35%', scrub: 0.8 } });
    }

    /* layout settles after fonts load: recompute trigger positions and the canvas anchors */
    var refresh = function () { ST.refresh(); measure(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
  }
})();
