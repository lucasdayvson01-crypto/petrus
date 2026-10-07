/* PETRUS · barra de rolagem do menu em pílula. A barra nativa sai dos limites arredondados, então desenhamos uma própria:
   fica dentro da pílula, afastada das pontas arredondadas, acompanha a largura do menu quando ele abre ou fecha e pode ser arrastada. */
(function () {
  var rail = document.querySelector('.rail'); if (!rail) return;
  var bar = document.createElement('div'), th = document.createElement('i');
  bar.className = 'rbar'; th.className = 'rthumb'; bar.appendChild(th); document.body.appendChild(bar);
  var raf = 0, until = 0, drag = null;

  function layout() {
    var over = rail.scrollHeight > rail.clientHeight + 2;
    rail.classList.toggle('has-scroll', over);
    if (!over) { bar.style.display = 'none'; return; }
    var r = rail.getBoundingClientRect(), cs = getComputedStyle(rail), rad = Math.min(parseFloat(cs.borderTopLeftRadius) || 27, r.width / 2);
    var inset = Math.round(rad * .9 + 6), top = r.top + inset, h = Math.max(20, r.height - inset * 2);
    bar.style.display = 'block'; bar.style.left = (r.right - 10) + 'px'; bar.style.top = top + 'px'; bar.style.height = h + 'px';
    var vis = rail.clientHeight / rail.scrollHeight, tH = Math.max(28, Math.round(h * vis)), max = rail.scrollHeight - rail.clientHeight, pos = max > 0 ? rail.scrollTop / max : 0;
    th.style.height = tH + 'px'; th.style.transform = 'translateY(' + Math.round((h - tH) * pos) + 'px)';
  }
  /* durante a animação de abrir e fechar o menu a largura muda: acompanha quadro a quadro */
  function follow(ms) { until = Math.max(until, performance.now() + (ms || 800)); if (raf) return; (function tick() { layout(); if (performance.now() < until || drag) raf = requestAnimationFrame(tick); else raf = 0; })(); }

  rail.addEventListener('scroll', function () { layout(); bar.classList.add('on'); clearTimeout(bar._t); bar._t = setTimeout(function () { bar.classList.remove('on'); }, 900); }, { passive: true });
  ['mouseenter', 'mouseleave', 'transitionend', 'click'].forEach(function (ev) { rail.addEventListener(ev, function () { follow(900); }); });
  window.addEventListener('resize', function () { follow(300); });
  window.addEventListener('hashchange', function () { follow(700); });
  if (window.ResizeObserver) new ResizeObserver(function () { follow(300); }).observe(rail);
  rail.addEventListener('mouseenter', function () { bar.classList.add('on'); });
  rail.addEventListener('mouseleave', function () { if (!drag) bar.classList.remove('on'); });

  th.addEventListener('pointerdown', function (e) {
    e.preventDefault(); e.stopPropagation(); th.setPointerCapture(e.pointerId);
    drag = { y: e.clientY, st: rail.scrollTop }; bar.classList.add('on', 'drag'); follow(60000);
  });
  th.addEventListener('pointermove', function (e) {
    if (!drag) return; var h = bar.clientHeight, tH = th.clientHeight, max = rail.scrollHeight - rail.clientHeight;
    rail.scrollTop = drag.st + (e.clientY - drag.y) * (max / Math.max(1, h - tH));
  });
  function solta() { if (!drag) return; drag = null; bar.classList.remove('drag'); until = performance.now() + 100; }
  th.addEventListener('pointerup', solta); th.addEventListener('pointercancel', solta);
  /* clicar na trilha leva até aquele ponto */
  bar.addEventListener('pointerdown', function (e) {
    if (e.target === th) return; var r = bar.getBoundingClientRect(), p = (e.clientY - r.top) / r.height; rail.scrollTo({ top: p * (rail.scrollHeight - rail.clientHeight), behavior: 'smooth' });
  });
  layout(); follow(1200);
})();
