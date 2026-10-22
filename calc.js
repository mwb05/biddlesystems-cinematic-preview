/* Savings calculator (savings page). Each slider row carries data-keep: the share of that job
   still done by a person after automation (review, approvals, exceptions). Totals chase their
   targets so the big number rolls instead of jumping. */
(function () {
  'use strict';
  var form = document.getElementById('calc');
  if (!form) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rows = Array.prototype.slice.call(form.querySelectorAll('.calc-row[data-keep]'));
  var rate = document.getElementById('c-rate');
  var $ = function (id) { return document.getElementById(id); };
  var fmtH = function (h) { return (Math.round(h * 10) / 10).toString() + ' h'; };
  var money = function (n) { return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); };

  var shown = 0, target = 0;
  function fill(input) {
    var p = (input.value - input.min) / (input.max - input.min) * 100;
    input.style.setProperty('--fill', p.toFixed(1) + '%');
  }

  function update() {
    var before = 0, after = 0;
    rows.forEach(function (r) {
      var input = r.querySelector('input');
      var h = parseFloat(input.value) || 0;
      before += h;
      after += h * parseFloat(r.getAttribute('data-keep'));
      r.querySelector('output').textContent = fmtH(h);
      fill(input);
    });
    var r$ = parseFloat(rate.value) || 0;
    rate.parentNode.querySelector('output').textContent = '$' + r$;
    fill(rate);

    var saved = before - after;
    target = saved;
    var max = Math.max(before, 1);
    $('b-before').style.width = (before / max * 100).toFixed(1) + '%';
    $('b-after').style.width = (after / max * 100).toFixed(1) + '%';
    $('o-before').textContent = fmtH(before);
    $('o-after').textContent = fmtH(after);
    $('o-year').textContent = Math.round(saved * 52).toLocaleString('en-US');
    $('o-money').textContent = money(saved * 52 * r$);
    $('o-days').textContent = (Math.round(saved * 52 / 12 / 8 * 10) / 10).toString();
    $('o-pct').textContent = before ? Math.round(saved / before * 100) + '%' : '0%';
    if (reduced) { shown = target; $('o-week').textContent = target.toFixed(1); }
  }

  function roll() {
    if (Math.abs(shown - target) > 0.01) {
      shown += (target - shown) * 0.14;
      $('o-week').textContent = shown.toFixed(1);
    } else if (shown !== target) {
      shown = target;
      $('o-week').textContent = target.toFixed(1);
    }
    requestAnimationFrame(roll);
  }

  form.addEventListener('input', update);
  update();
  if (!reduced) requestAnimationFrame(roll);
})();
