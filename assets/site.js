/*
  site.js: the only script a content page needs (about 3 KB minified, 1.2 KB gzip). Load with <script src="site.js" defer>.
  If the page also loads scroll/scrollcraft.js (defer, before this file), reveals are handed to the engine.

  - Phone menu on a native <dialog>: focus trap, Esc and inertness come free; focus returns to the button.
  - Reveals: [data-sc-in] gets .sc-in once on entry (children of [data-sc-stagger] one after another).
    Anything already on screen at start is revealed at once, so nothing above the fold waits.
  - Layered hero ([data-depth]): swaps the poster for its planes once all of them have decoded.
  - Phone action bar: shown once the hero's main button has scrolled away.
  - Forms with [data-form]: sent with fetch; the success line shows only after the server says ok.
*/
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- phone menu
  var menu = document.getElementById('menu');
  var opener = document.querySelector('[data-menu-open]');
  if (menu && opener && typeof menu.showModal === 'function') {
    opener.addEventListener('click', function () {
      menu.showModal();
      opener.setAttribute('aria-expanded', 'true');
    });
    menu.addEventListener('close', function () {
      opener.setAttribute('aria-expanded', 'false');
      opener.focus();   // WebKit does not restore focus by itself
    });
    menu.addEventListener('click', function (e) {
      if (e.target === menu || e.target.closest('[data-menu-close], a[href]')) menu.close();
    });
  }

  // ---------------------------------------------------------------- reveals
  if (window.ScrollCraft) {
    window.ScrollCraft.mount(document);
  } else {
    var reveal = function (el) {
      el.classList.add('sc-in');
      var step = parseFloat(el.getAttribute('data-sc-stagger'));
      if (!isNaN(step)) {
        Array.prototype.forEach.call(el.children, function (kid, i) {
          kid.style.transitionDelay = reduce ? '0ms' : Math.min(i, 3) * step + 'ms';
          kid.classList.add('sc-in');
        });
      }
    };
    var targets = document.querySelectorAll('[data-sc-in]');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(targets, reveal);
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
      Array.prototype.forEach.call(targets, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) reveal(el); else io.observe(el);
      });
    }
    root.classList.add('ls-ready');
  }

  // ---------------------------------------------------------------- layered hero
  // The flattened poster stays until every plane has decoded, so a slow or failed
  // layer never shows a half-built scene (hero-depth.md).
  var depth = document.querySelector('[data-depth]');
  if (depth && !reduce) {
    var planes = depth.querySelectorAll('.depth__plane img');
    Promise.all(Array.prototype.map.call(planes, function (img) { return img.decode(); }))
      .then(function () { depth.classList.add('is-layered'); })
      .catch(function () {});
  }

  // ---------------------------------------------------------------- phone action bar
  var bar = document.querySelector('.action-bar');
  var heroCta = document.querySelector('[data-hero-cta]');
  if (bar && heroCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      bar.classList.toggle('is-shown', !e.isIntersecting && e.boundingClientRect.top < 0);
    }).observe(heroCta);
  } else if (bar) {
    bar.classList.add('is-shown');
  }

  // ---------------------------------------------------------------- forms
  Array.prototype.forEach.call(document.querySelectorAll('form[data-form]'), function (form) {
    var status = form.querySelector('.form__status');
    var say = function (state, text) {
      if (!status) return;
      status.dataset.state = state;
      status.textContent = text;
    };
    form.addEventListener('invalid', function (e) {
      var f = e.target;
      f.setAttribute('aria-invalid', 'true');
      var err = document.getElementById(f.id + '-error');
      if (err) err.textContent = f.dataset.error || f.validationMessage;
    }, true);
    form.addEventListener('input', function (e) {
      var f = e.target;
      if (f.getAttribute('aria-invalid') === 'true' && f.checkValidity()) {
        f.removeAttribute('aria-invalid');
        var err = document.getElementById(f.id + '-error');
        if (err) err.textContent = '';
      }
    });
    form.addEventListener('submit', function (e) {
      var action = form.getAttribute('action');
      if (!action || action === '#' || !window.fetch) return;   // let the browser post it
      e.preventDefault();
      var button = form.querySelector('[type="submit"]');
      if (button) button.disabled = true;
      say('busy', form.dataset.busy || 'Sending…');
      fetch(action, { method: form.method || 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error(String(res.status));
          form.reset();
          say('ok', form.dataset.ok || 'Sent. We will reply soon.');
        })
        .catch(function () {
          say('error', form.dataset.fail || 'That did not send. Please try again, or contact us directly.');
        })
        .then(function () { if (button) button.disabled = false; });
    });
  });
})();
