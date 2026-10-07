/* PETRUS · barra de rolagem do menu em pílula. A barra nativa sai dos limites arredondados, então desenhamos uma própria:
   fica dentro da pílula, afastada das pontas arredondadas, acompanha o tamanho do menu e pode ser arrastada.
   Funciona nos dois modos: vertical (computador, pílula na lateral) e horizontal (celular, pílula embaixo).
   v3: procura o menu atual sempre (o elemento pode ser trocado depois do carregamento) e reavalia de tempos em tempos,
   então nunca fica presa a um menu antigo nem perde um redimensionamento ou zoom. */
(function () {
  if (window.__rbarOn) return; window.__rbarOn = true;
  var bar = document.createElement('div'), th = document.createElement('i');
  bar.className = 'rbar'; th.className = 'rthumb'; bar.appendChild(th); document.body.appendChild(bar);
  var rail = null, ro = null, raf = 0, until = 0, drag = null, horiz = false, off = [];
  function atual() { return document.querySelector('.rail'); }

  function layout() {
    var cur = atual(); if (cur !== rail) bind(cur);
    if (!rail) { bar.style.display = 'none'; return; }
    var cs = getComputedStyle(rail); horiz = cs.flexDirection === 'row';
    var over = horiz ? rail.scrollWidth > rail.clientWidth + 2 : rail.scrollHeight > rail.clientHeight + 2;
    rail.classList.toggle('has-scroll', over);
    if (!over) { bar.style.display = 'none'; return; }
    var r = rail.getBoundingClientRect(), rad = Math.min(parseFloat(cs.borderTopLeftRadius) || 27, (horiz ? r.height : r.width) / 2), inset = Math.round(rad * .9 + 6);
    bar.classList.toggle('h', horiz); bar.style.display = 'block';
    if (horiz) {
      var len = Math.max(20, r.width - inset * 2);
      bar.style.left = (r.left + inset) + 'px'; bar.style.top = (r.bottom - 9) + 'px'; bar.style.width = len + 'px'; bar.style.height = '';
      var tw = Math.max(28, Math.round(len * rail.clientWidth / rail.scrollWidth)), mx = rail.scrollWidth - rail.clientWidth, p = mx > 0 ? rail.scrollLeft / mx : 0;
      th.style.width = tw + 'px'; th.style.height = ''; th.style.transform = 'translateX(' + Math.round((len - tw) * p) + 'px)';
    } else {
      var h = Math.max(20, r.height - inset * 2);
      bar.style.left = (r.right - 10) + 'px'; bar.style.top = (r.top + inset) + 'px'; bar.style.height = h + 'px'; bar.style.width = '';
      var tH = Math.max(28, Math.round(h * rail.clientHeight / rail.scrollHeight)), max = rail.scrollHeight - rail.clientHeight, pos = max > 0 ? rail.scrollTop / max : 0;
      th.style.height = tH + 'px'; th.style.width = ''; th.style.transform = 'translateY(' + Math.round((h - tH) * pos) + 'px)';
    }
  }
  /* durante a animação de abrir e fechar o menu o tamanho muda: acompanha quadro a quadro */
  function follow(ms) { until = Math.max(until, performance.now() + (ms || 800)); if (raf) return; (function tick() { layout(); if (performance.now() < until || drag) raf = requestAnimationFrame(tick); else raf = 0; })(); }
  function mostraAtivo() { if (!rail || !horiz) return; var a = rail.querySelector('a.on'); if (!a) return; var l = a.offsetLeft - (rail.clientWidth - a.offsetWidth) / 2; rail.scrollTo({ left: Math.max(0, l), behavior: 'smooth' }); }

  /* liga a barra ao menu atual; se o menu for trocado, desliga do antigo e liga ao novo */
  function bind(el) {
    off.forEach(function (f) { f(); }); off = []; if (ro) { ro.disconnect(); ro = null; }
    rail = el; if (!rail) return;
    function on(t, ev, fn, o) { t.addEventListener(ev, fn, o); off.push(function () { t.removeEventListener(ev, fn, o); }); }
    on(rail, 'scroll', function () { layout(); bar.classList.add('on'); clearTimeout(bar._t); bar._t = setTimeout(function () { bar.classList.remove('on'); }, 1100); }, { passive: true });
    ['mouseenter', 'mouseleave', 'transitionend', 'transitionrun', 'click', 'touchstart'].forEach(function (ev) { on(rail, ev, function () { follow(900); }, { passive: true }); });
    on(rail, 'mouseenter', function () { bar.classList.add('on'); });
    on(rail, 'mouseleave', function () { if (!drag) bar.classList.remove('on'); });
    if (window.ResizeObserver) { ro = new ResizeObserver(function () { follow(300); }); ro.observe(rail); }
  }

  window.addEventListener('resize', function () { follow(500); setTimeout(mostraAtivo, 250); });
  window.addEventListener('hashchange', function () { follow(700); setTimeout(mostraAtivo, 400); });
  window.addEventListener('load', function () { follow(1200); });
  /* rede de segurança: reavalia a cada meio segundo (zoom do navegador, troca de menu, fontes que carregam depois) */
  setInterval(function () { if (!drag) layout(); }, 500);

  th.addEventListener('pointerdown', function (e) {
    if (!rail) return; e.preventDefault(); e.stopPropagation(); th.setPointerCapture(e.pointerId);
    drag = { p: horiz ? e.clientX : e.clientY, s: horiz ? rail.scrollLeft : rail.scrollTop }; bar.classList.add('on', 'drag'); follow(60000);
  });
  th.addEventListener('pointermove', function (e) {
    if (!drag || !rail) return;
    if (horiz) { var w = bar.clientWidth, tW = th.clientWidth, mx = rail.scrollWidth - rail.clientWidth; rail.scrollLeft = drag.s + (e.clientX - drag.p) * (mx / Math.max(1, w - tW)); }
    else { var h = bar.clientHeight, tH = th.clientHeight, max = rail.scrollHeight - rail.clientHeight; rail.scrollTop = drag.s + (e.clientY - drag.p) * (max / Math.max(1, h - tH)); }
  });
  function solta() { if (!drag) return; drag = null; bar.classList.remove('drag'); until = performance.now() + 100; }
  th.addEventListener('pointerup', solta); th.addEventListener('pointercancel', solta);
  /* clicar na trilha leva até aquele ponto */
  bar.addEventListener('pointerdown', function (e) {
    if (e.target === th || !rail) return; var r = bar.getBoundingClientRect();
    if (horiz) rail.scrollTo({ left: (e.clientX - r.left) / r.width * (rail.scrollWidth - rail.clientWidth), behavior: 'smooth' });
    else rail.scrollTo({ top: (e.clientY - r.top) / r.height * (rail.scrollHeight - rail.clientHeight), behavior: 'smooth' });
  });
  bind(atual()); layout(); follow(1200); setTimeout(mostraAtivo, 600);
})();
