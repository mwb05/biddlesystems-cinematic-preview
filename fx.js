/* Circuit effects (shared by every page; each block runs only if its element is on the page).
   - canvas particle globe (Fibonacci sphere, nearest-neighbour mesh, travelling data arcs),
     follows the cursor and fades as the hero scrolls away
   - "how the work moves" flow diagram, drawn as SVG with packets riding the wires
     (horizontal on desktop, stacked on phones)
   - terminal activity feed in the proof section that types itself once visible */
(function () {
  'use strict';
  var motionOff = false;
  try { motionOff = localStorage.getItem('bs-motion') === 'off'; } catch (err) {}
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || motionOff;
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

  /* ---- globe ---- */
  var canvas = document.getElementById('globe');
  var hero = document.querySelector('.hero, .page-hero');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var small = window.innerWidth < 720;
    var N = small ? 360 : 720;
    var pts = [];
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var rad = Math.sqrt(1 - y * y);
      var th = golden * i;
      pts.push([Math.cos(th) * rad, y, Math.sin(th) * rad]);
    }
    /* two nearest neighbours per point, computed once (rotation keeps distances) */
    var pairs = [];
    for (var a = 0; a < N; a++) {
      var best = [[9, -1], [9, -1]];
      for (var b = 0; b < N; b++) {
        if (a === b) continue;
        var dx = pts[a][0] - pts[b][0], dy = pts[a][1] - pts[b][1], dz = pts[a][2] - pts[b][2];
        var d = dx * dx + dy * dy + dz * dz;
        if (d < best[1][0]) { best[1] = [d, b]; if (best[1][0] < best[0][0]) best.reverse(); }
      }
      if (a < best[0][1]) pairs.push(a, best[0][1]);
      if (a < best[1][1]) pairs.push(a, best[1][1]);
    }
    var arcs = [];
    var newArc = function (now) {
      return { a: (Math.random() * N) | 0, b: (Math.random() * N) | 0, t0: now + Math.random() * 1200, dur: 1400 + Math.random() * 900 };
    };
    for (var k = 0; k < 6; k++) arcs.push(newArc(0));

    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var size = function () {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener('resize', size);
    var mx = 0, my = 0, tmx = 0, tmy = 0;
    window.addEventListener('pointermove', function (e) {
      tmx = e.clientX / window.innerWidth - 0.5;
      tmy = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    var proj = new Float32Array(N * 3);
    var rotate = function (p, ay, ax, out, o) {
      var cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      var x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy;
      var y = p[1] * cx - z * sx; z = p[1] * sx + z * cx;
      out[o] = x; out[o + 1] = y; out[o + 2] = z;
    };
    var tmp = new Float32Array(3);

    /* colors come from the active palette (theme.css), re-read when the switcher changes it */
    var C = {};
    var rgbOf = function (name) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      if (v.charAt(0) === '#') return [1, 3, 5].map(function (i) { return parseInt(v.slice(i, i + 2), 16); }).join(',');
      return v.split(/\s+/).join(',');
    };
    var readColors = function () { C.a = rgbOf('--a-rgb'); C.g = rgbOf('--g-rgb'); C.hi = rgbOf('--hi'); C.term = rgbOf('--term'); };
    readColors();
    document.addEventListener('palettechange', function () { readColors(); if (reduced) requestAnimationFrame(draw); });

    var draw = function (now) {
      var scrollFade = hero ? clamp(1 - window.scrollY / (hero.offsetHeight * 0.9), 0, 1) : 1;
      if (scrollFade <= 0) { if (!reduced) requestAnimationFrame(draw); return; }
      mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
      var ay = (reduced ? 0.6 : now * 0.00011) + mx * 0.9;
      var ax = -0.32 + my * 0.5;
      var R = Math.min(W, H) * 0.4 * (1 + (1 - scrollFade) * 0.25);
      var cx = W * 0.5, cy = H * 0.48;
      var F = 3.2;
      ctx.clearRect(0, 0, W, H);
      canvas.style.opacity = scrollFade.toFixed(3);

      /* soft core glow */
      var g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.25);
      g.addColorStop(0, 'rgba(' + C.a + ',0.12)');
      g.addColorStop(1, 'rgba(' + C.a + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      for (var i = 0; i < N; i++) {
        rotate(pts[i], ay, ax, tmp, 0);
        var s = F / (F - tmp[2]);
        proj[i * 3] = cx + tmp[0] * R * s;
        proj[i * 3 + 1] = cy + tmp[1] * R * s;
        proj[i * 3 + 2] = (tmp[2] + 1) / 2;
      }
      ctx.lineWidth = 0.6;
      for (var j = 0; j < pairs.length; j += 2) {
        var p = pairs[j] * 3, q = pairs[j + 1] * 3;
        var dep = (proj[p + 2] + proj[q + 2]) / 2;
        ctx.strokeStyle = 'rgba(' + C.a + ',' + (0.03 + 0.22 * dep * dep).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(proj[p], proj[p + 1]); ctx.lineTo(proj[q], proj[q + 1]); ctx.stroke();
      }
      for (var m = 0; m < N; m++) {
        var dd = proj[m * 3 + 2];
        ctx.fillStyle = 'rgba(' + C.term + ',' + (0.15 + 0.8 * dd * dd).toFixed(3) + ')';
        var r = 0.5 + 1.5 * dd;
        ctx.fillRect(proj[m * 3] - r / 2, proj[m * 3 + 1] - r / 2, r, r);
      }

      /* data arcs: lift between two surface points, bright head with a fading tail */
      for (var n = 0; n < arcs.length; n++) {
        var arc = arcs[n];
        var u = (now - arc.t0) / arc.dur;
        if (u < 0) continue;
        if (u > 1.3) { arcs[n] = newArc(now); continue; }
        var A = pts[arc.a], B = pts[arc.b];
        var STEPS = 24;
        ctx.beginPath();
        var started = false, hx = 0, hy = 0;
        for (var st = 0; st <= STEPS; st++) {
          var v = st / STEPS;
          if (v > u || v < u - 0.35) continue;
          var x = A[0] + (B[0] - A[0]) * v, y = A[1] + (B[1] - A[1]) * v, z = A[2] + (B[2] - A[2]) * v;
          var len = Math.sqrt(x * x + y * y + z * z) || 1;
          var lift = 1 + Math.sin(Math.PI * v) * 0.28;
          rotate([x / len * lift, y / len * lift, z / len * lift], ay, ax, tmp, 0);
          var s2 = F / (F - tmp[2]);
          hx = cx + tmp[0] * R * s2; hy = cy + tmp[1] * R * s2;
          if (!started) { ctx.moveTo(hx, hy); started = true; } else ctx.lineTo(hx, hy);
        }
        if (!started) continue;
        ctx.strokeStyle = 'rgba(' + C.g + ',0.75)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        if (u <= 1) {
          ctx.fillStyle = 'rgba(' + C.hi + ',0.95)';
          ctx.beginPath(); ctx.arc(hx, hy, 2.4, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (!reduced) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    if (reduced) window.addEventListener('resize', function () { requestAnimationFrame(draw); });
  }

  /* ---- flow diagram ---- */
  var stage = document.getElementById('flow');
  var INS = ['Inbox', 'POS exports', 'Payroll', 'Vendor invoices', 'Web forms'];
  var OUTS = ['6 am report', 'Drafted replies', 'Coded payables', 'Follow-ups sent'];
  var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };

  function layout(stacked) {
    if (!stacked) {
      var ins = INS.map(function (l, i) { return { x: 10, y: 22 + i * 76, w: 190, h: 48, l: l }; });
      var outs = OUTS.map(function (l, i) { return { x: 800, y: 48 + i * 84, w: 190, h: 48, l: l }; });
      return { vb: '0 0 1000 420', ins: ins, outs: outs, c: { x: 500, y: 210, r: 84 }, fs: 16, stacked: false };
    }
    var ins2 = INS.map(function (l, i) {
      var row = i < 3 ? 0 : 1, col = i < 3 ? i : i - 3;
      return { x: row ? 64 + col * 120 : 4 + col * 120, y: 6 + row * 54, w: 112, h: 40, l: l };
    });
    var outs2 = OUTS.map(function (l, i) { return { x: 8 + (i % 2) * 180, y: 470 + Math.floor(i / 2) * 54, w: 164, h: 40, l: l }; });
    return { vb: '0 0 360 570', ins: ins2, outs: outs2, c: { x: 180, y: 290, r: 70 }, fs: 13, stacked: true };
  }

  function wire(n, c, out, stacked) {
    if (!stacked) {
      if (!out) { var y1 = n.y + n.h / 2; return 'M' + (n.x + n.w) + ' ' + y1 + ' C' + (n.x + n.w + 130) + ' ' + y1 + ' ' + (c.x - c.r - 110) + ' ' + c.y + ' ' + (c.x - c.r) + ' ' + c.y; }
      var y2 = n.y + n.h / 2; return 'M' + (c.x + c.r) + ' ' + c.y + ' C' + (c.x + c.r + 110) + ' ' + c.y + ' ' + (n.x - 130) + ' ' + y2 + ' ' + n.x + ' ' + y2;
    }
    var nx = n.x + n.w / 2;
    if (!out) return 'M' + nx + ' ' + (n.y + n.h) + ' C' + nx + ' ' + (n.y + n.h + 90) + ' ' + c.x + ' ' + (c.y - c.r - 90) + ' ' + c.x + ' ' + (c.y - c.r);
    return 'M' + c.x + ' ' + (c.y + c.r) + ' C' + c.x + ' ' + (c.y + c.r + 70) + ' ' + nx + ' ' + (n.y - 70) + ' ' + nx + ' ' + n.y;
  }

  function buildFlow() {
    if (!stage) return;
    var L = layout(window.innerWidth < 720);
    var svg = '<svg viewBox="' + L.vb + '" role="presentation" aria-hidden="true">' +
      '<defs><radialGradient id="coreGrad"><stop offset="0" style="stop-color:var(--hi)"/><stop offset="1" style="stop-color:var(--accent)"/></radialGradient></defs>';
    var wires = '', nodes = '', packets = '';
    var add = function (list, out) {
      list.forEach(function (n, i) {
        var id = (out ? 'wo' : 'wi') + i;
        wires += '<path class="wire' + (out ? ' wire-out' : '') + '" id="' + id + '" d="' + wire(n, L.c, out, L.stacked) + '"/>';
        nodes += '<g class="node' + (out ? ' node-out' : '') + '"><rect x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h + '" rx="10"/>' +
          '<text x="' + (n.x + n.w / 2) + '" y="' + (n.y + n.h / 2 + L.fs * 0.35) + '" text-anchor="middle" font-size="' + L.fs + '">' + esc(n.l) + '</text></g>';
        if (!reduced) {
          for (var p = 0; p < 2; p++) {
            var dur = (2.2 + (i % 3) * 0.35).toFixed(2);
            var begin = (-(i * 0.45 + p * dur / 2)).toFixed(2);
            packets += '<circle class="packet' + (out ? ' packet-out' : '') + '" r="4"><animateMotion dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite"><mpath href="#' + id + '"/></animateMotion></circle>';
          }
        }
      });
    };
    add(L.ins, false);
    add(L.outs, true);
    var c = L.c;
    var core = '<g class="core"><circle class="core-ring spin" cx="' + c.x + '" cy="' + c.y + '" r="' + (c.r + 14) + '"/>' +
      '<circle class="core-fill" cx="' + c.x + '" cy="' + c.y + '" r="' + c.r + '"/>' +
      '<text x="' + c.x + '" y="' + (c.y - 4) + '">Your AI</text>' +
      '<text x="' + c.x + '" y="' + (c.y + 16) + '">assistant</text>' +
      '<text class="core-sub" x="' + c.x + '" y="' + (c.y + 36) + '">by Biddle Systems</text></g>';
    stage.innerHTML = svg + wires + packets + nodes + core + '</svg>';
    stage.setAttribute('data-stacked', L.stacked ? '1' : '0');
  }
  buildFlow();
  window.addEventListener('resize', function () {
    if (stage && stage.getAttribute('data-stacked') !== (window.innerWidth < 720 ? '1' : '0')) buildFlow();
  });

  /* ---- terminal feed ---- */
  var log = document.getElementById('term-log');
  var LINES = [
    ['06:00:02', 'reports.daily   ', 'daily report sent to 3 managers', 'ok'],
    ['06:00:41', 'inbox.triage    ', '27 sorted, 6 replies drafted', 'ok'],
    ['06:03:15', 'payables.code   ', '14 invoices coded and filed', 'ok'],
    ['06:04:09', 'followups.send  ', '3 overdue customers nudged', 'ok'],
    ['08:12:30', 'assistant.sms   ', 'staff question answered from policy docs', 'ok'],
    ['10:45:02', 'reviews.watch   ', '2 new reviews, summary sent', 'ok'],
    ['13:20:18', 'payables.match  ', 'statement reconciled, 1 exception', 'flag'],
    ['16:00:00', 'reports.weekly  ', 'labor report queued for Monday', 'ok']
  ];
  if (log) {
    var done = [], li = 0, ci = 0, started = false, MAX = 8;
    var fmt = function (L) {
      return '<span class="tm">' + L[0] + '</span> ' + esc(L[1]) + ' ' + esc(L[2]) + '  <span class="ok">' + L[3] + '</span>';
    };
    var plain = function (L) { return L[0] + ' ' + L[1] + ' ' + L[2] + '  ' + L[3]; };
    var paint = function (typing) {
      log.innerHTML = done.slice(-MAX).join('\n') + (typing !== null ? (done.length ? '\n' : '') + esc(typing) + '<span class="cur"></span>' : '');
    };
    var step = function () {
      var L = LINES[li % LINES.length], text = plain(L);
      if (ci <= text.length) { paint(text.slice(0, ci)); ci += 2; setTimeout(step, 18); return; }
      done.push(fmt(L)); if (done.length > 40) done = done.slice(-MAX);
      li++; ci = 0; paint('');
      setTimeout(step, 700);
    };
    if (reduced) { done = LINES.map(fmt); paint(null); }
    else {
      new IntersectionObserver(function (es, io) {
        if (es[0].isIntersecting && !started) { started = true; io.disconnect(); step(); }
      }, { threshold: 0.3 }).observe(log);
    }
  }
})();
