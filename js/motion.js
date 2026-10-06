/* Movimento do Caderno 48: entrada escalonada, revelar ao rolar, barras que crescem, brilho que segue o mouse. */
/* tema claro/escuro + ilha dinamica (valem mesmo com movimento reduzido) */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  try { var saved = localStorage.getItem('c48.theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  function setTheme(t, x, y) {
    var apply = function () { root.setAttribute('data-theme', t); try { localStorage.setItem('c48.theme', t); } catch (e) {} };
    if (!document.startViewTransition || reduce) { apply(); return; }
    root.classList.add('vt-theme');
    var vt;
    try { vt = document.startViewTransition(apply); } catch (e) { apply(); root.classList.remove('vt-theme'); return; }
    var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    vt.ready.then(function () {
      root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 750, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(function () {});
    vt.finished.then(function () { root.classList.remove('vt-theme'); }, function () { root.classList.remove('vt-theme'); });
  }
  function mount() {
    if (document.getElementById('island') || !document.body) return;
    var CFG = window.C48_CFG || {}, d = Math.max(0, Math.ceil((new Date(CFG.prova || '2027-01-10T13:00:00') - new Date()) / 864e5));
    var el = document.createElement('div'); el.id = 'island';
    el.innerHTML = '<button type="button" class="is-c" aria-expanded="false" aria-label="Atalhos"><span class="is-dot"></span><b class="is-n">' + d + '</b><span class="is-t">dias para a 1ª fase</span></button>' +
      '<div class="is-x"><a href="#/home">Hoje</a><a href="#/crono">Cronograma</a><a href="#/rev">Revisão</a><a href="#/mock">Simulado</a>' +
      '<button type="button" class="is-th" aria-label="Trocar tema"><svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button></div>';
    document.body.appendChild(el);
    var c = el.querySelector('.is-c'), timer = 0;
    function open(v) { el.classList.toggle('open', v); c.setAttribute('aria-expanded', v ? 'true' : 'false'); }
    c.addEventListener('click', function (e) { open(!el.classList.contains('open')); e.stopPropagation(); });
    el.addEventListener('mouseenter', function () { clearTimeout(timer); if (matchMedia('(hover:hover)').matches) open(true); });
    el.addEventListener('mouseleave', function () { timer = setTimeout(function () { open(false); }, 350); });
    document.addEventListener('click', function (e) { if (!el.contains(e.target)) open(false); });
    el.querySelector('.is-x').addEventListener('click', function (e) { if (e.target.closest('a')) open(false); });
    el.querySelector('.is-th').addEventListener('click', function (e) {
      var r = e.currentTarget.getBoundingClientRect();
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', r.left + r.width / 2, r.top + r.height / 2);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();

(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var app = document.getElementById('app'); if (!app) return;
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  var busy = false, timer = 0;
  function enhance() {
    busy = true;
    try {
      var kids = [].slice.call(app.children);
      var box = kids.length === 1 ? kids[0] : app;
      [].slice.call(box.children).forEach(function (el, i) { if (i < 8) el.style.setProperty('--i', i); });
      box.classList.remove('mo-in'); void box.offsetWidth; box.classList.add('mo-in');
      [].forEach.call(app.querySelectorAll('.grid>.card,.list>*,.tile'), function (el, i) {
        if (io && i > 6 && el.getBoundingClientRect().top > innerHeight) { el.classList.add('mo-rv'); io.observe(el); setTimeout(function () { el.classList.add('on'); }, 4000); }
      });
      [].forEach.call(app.querySelectorAll('.bar>i,.bar>b,.cprog>i,.cpb>i'), function (el) { el.classList.add('mo-grow'); });
    } catch (e) {}
    setTimeout(function () { busy = false; }, 80);
  }
  new MutationObserver(function () {
    if (busy) return; clearTimeout(timer); timer = setTimeout(enhance, 30);
  }).observe(app, { childList: true });
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.card.dark,.hero,.chero,.petrus-hero'); if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.chk,.crb,[onclick*="crFeito"]');
    if (t) { t.classList.remove('mo-done'); void t.offsetWidth; t.classList.add('mo-done'); }
  });
  /* numeros contam do zero (data-count) */
  function countUp() {
    [].forEach.call(app.querySelectorAll('[data-count]'), function (el) {
      var to = parseInt(el.getAttribute('data-count'), 10); if (isNaN(to) || el.__c) return; el.__c = 1;
      var t0 = performance.now(), d = 900;
      (function step(t) { var p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(step); else el.textContent = to; })(t0);
    });
  }
  /* orbe do hero segue o mouse com parallax suave */
  var raf = 0;
  document.addEventListener('pointermove', function (e) {
    if (raf) return; raf = requestAnimationFrame(function () {
      raf = 0; var hr = app.querySelector('.hm-r'); if (!hr) return; var r = hr.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      [].forEach.call(hr.querySelectorAll('.hm-orb i'), function (o, i) { var k = (i + 1) * 14; o.style.translate = (dx * k) + 'px ' + (dy * k) + 'px'; });
    });
  }, { passive: true });
  new MutationObserver(function () { setTimeout(countUp, 60); }).observe(app, { childList: true });
  countUp();
  enhance();
})();
