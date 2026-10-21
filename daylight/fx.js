/* Option 3: Daylight effects.
   - scene color morph: whichever section crosses the middle of the screen sets the page color
   - clock: hands wind backwards as you scroll (time handed back), and tick slowly on their own
   - floating UI pieces drift with the cursor at different depths
   - kinetic type band slides sideways with scroll */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  /* ---- scene color morph ---- */
  var SCENES = { top: 'cream', shift: 'cobalt', automate: 'cream', proof: 'ink', how: 'orange', contact: 'cream' };
  var sceneIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) body.setAttribute('data-scene', SCENES[e.target.id] || 'cream');
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  Object.keys(SCENES).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) sceneIO.observe(el);
  });

  /* ---- clock ---- */
  var ticks = document.getElementById('clock-ticks');
  if (ticks) {
    var svgNS = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < 60; i++) {
      var major = i % 5 === 0;
      var a = i * 6 * Math.PI / 180;
      var r1 = major ? 80 : 86, r2 = 92;
      var ln = document.createElementNS(svgNS, 'line');
      ln.setAttribute('x1', (Math.sin(a) * r1).toFixed(2));
      ln.setAttribute('y1', (-Math.cos(a) * r1).toFixed(2));
      ln.setAttribute('x2', (Math.sin(a) * r2).toFixed(2));
      ln.setAttribute('y2', (-Math.cos(a) * r2).toFixed(2));
      if (major) ln.setAttribute('class', 'major');
      ticks.appendChild(ln);
    }
  }
  var hourHand = document.getElementById('clock-h');
  var minHand = document.getElementById('clock-m');

  /* ---- floats + kinetic ---- */
  var floats = Array.prototype.slice.call(document.querySelectorAll('#float-ui .fl'));
  var kin = Array.prototype.slice.call(document.querySelectorAll('[data-kin]'));
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener('pointermove', function (e) {
    tmx = e.clientX / window.innerWidth - 0.5;
    tmy = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  function frame(now) {
    var y = window.scrollY, vh = window.innerHeight;
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;

    if (minHand && hourHand) {
      /* starts at 10:10, winds back two full hours over the first two screens of scroll */
      var back = Math.min(y, vh * 2.5) / (vh * 2) * 720;
      var drift = reduced ? 0 : now / 1000 * 3;
      var m = 60 + drift - back;
      var h = 305 + (drift - back) / 12;
      minHand.setAttribute('transform', 'rotate(' + m.toFixed(2) + ')');
      hourHand.setAttribute('transform', 'rotate(' + h.toFixed(2) + ')');
    }

    if (!reduced) {
      floats.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 1;
        el.style.transform = 'translate3d(' + (mx * -36 * d).toFixed(1) + 'px,' + (my * -28 * d - y * 0.18 * d).toFixed(1) + 'px,0)';
      });
      kin.forEach(function (el) {
        var dir = parseFloat(el.getAttribute('data-kin')) || 1;
        var r = el.getBoundingClientRect();
        var off = (r.top - vh) * 0.6;
        el.style.transform = 'translate3d(' + (dir * off - (dir > 0 ? el.scrollWidth * 0.35 : 0)).toFixed(1) + 'px,0,0)';
      });
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);
  if (reduced) window.addEventListener('scroll', function () { requestAnimationFrame(frame); }, { passive: true });
})();
