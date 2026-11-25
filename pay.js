/* Billing page (pay/ and pay/success/). The forms work without this file: they post straight to the
   client portal, which redirects to Stripe. This only adds the friendly parts: a notice while
   online payment is not open yet, a "test mode" notice, and plain words for ?error= / ?status=. */
(function () {
  'use strict';
  var PORTAL = 'https://portal.biddlesystems.com';
  var q = new URLSearchParams(location.search);

  // Success page: wording for a subscription.
  var doneText = document.getElementById('pay-done-text');
  if (doneText) {
    if (q.get('kind') === 'run-plan') {
      doneText.textContent = 'Your Run plan is active. Your receipt is on its way by email.';
      var more = document.getElementById('pay-done-more');
      if (more) more.innerHTML = 'You are billed once a month. Change your card or cancel any time from the <a class="pay-link" href="../">Billing page</a>.';
    }
    return;
  }

  var banner = document.getElementById('pay-banner');
  if (!banner) return;
  var buttons = document.querySelectorAll('[data-pay-submit]');
  var manage = document.getElementById('pay-manage');

  function show(text, kind) {
    banner.textContent = text;
    banner.className = 'pay-banner' + (kind ? ' pay-banner-' + kind : '');
    banner.hidden = false;
  }
  function close(reason) {
    Array.prototype.forEach.call(buttons, function (b) { b.disabled = true; b.setAttribute('aria-disabled', 'true'); });
    if (manage) { manage.setAttribute('aria-disabled', 'true'); manage.classList.add('is-off'); manage.removeAttribute('href'); }
    show(reason, 'warn');
  }

  var ERRORS = {
    'not-ready': 'Online payment is not open yet. Email support@biddlesystems.com and we will send you a way to pay.',
    'bad-invoice': 'Check the invoice number. It is printed at the top of your invoice.',
    'bad-amount': 'Enter the amount from your invoice in dollars, like 1250.00.',
    'amount-too-large': 'That amount is over the online limit. Email support@biddlesystems.com and we will help.',
    'bad-email': 'Check the email address and try again.',
    'slow-down': 'Too many tries in a row. Wait a minute and try again.',
    'bad-request': 'That did not go through. Please try again.'
  };
  var err = q.get('error');
  if (err) show(ERRORS[err] || 'Something went wrong on our side and nothing was charged. Please try again, or email support@biddlesystems.com.', 'err');
  else if (q.get('status') === 'cancelled') show('Checkout was closed before paying. Nothing was charged.', '');
  if (err || q.get('status')) {
    var into = document.getElementById(q.get('kind') === 'run-plan' ? 'pay-run-plan' : 'pay-invoice');
    if (into && into.scrollIntoView) into.scrollIntoView({ block: 'center' });
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
  }

  // Is online payment open? The portal says yes only once Stripe keys are in place.
  fetch(PORTAL + '/api/pay/config', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (s) {
      if (!s) return;
      if (!s.ready) close(ERRORS['not-ready']);
      else if (s.mode === 'test' && !err) show('Test mode: this page is being tested. No real money is charged.', 'warn');
    })
    .catch(function () { /* the forms still work; the portal answers for itself */ });

  // One click, one checkout.
  Array.prototype.forEach.call(document.querySelectorAll('.pay-form'), function (form) {
    if (form.tagName !== 'FORM') return;
    form.addEventListener('submit', function () {
      var b = form.querySelector('[data-pay-submit]');
      if (b) setTimeout(function () { b.disabled = true; b.textContent = 'Opening secure checkout...'; }, 0);
    });
  });
  // Coming back with the Back button re-enables the buttons.
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    Array.prototype.forEach.call(buttons, function (b) { b.disabled = false; b.textContent = b.closest('#pay-run-plan') ? 'Continue to secure checkout' : 'Continue to secure payment'; });
  });
})();
