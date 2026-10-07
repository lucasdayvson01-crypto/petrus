/* PETRUS · personalização: volume dos sons, formato das pastas da biblioteca e cores das pastas.
   Os valores ficam em S.set (salvos no aparelho) e viram atributos no <html>, que o CSS lê (data-pasta e data-pcor). */
(function () {
  var P = window.P, S = P.S;
  var def = { vol: 40, pasta: 'arquivo', pcor: 'coloridas' };
  Object.keys(def).forEach(function (k) { if (S.set[k] == null) S.set[k] = def[k]; });

  function hue(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return 258;
    var n = parseInt(m[1], 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
    if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = Math.round(h * 60); if (h < 0) h += 360; }
    return h;
  }
  function aplicar() {
    var s = S.set, r = document.documentElement;
    r.setAttribute('data-pasta', s.pasta || 'arquivo'); r.setAttribute('data-pcor', s.pcor || 'coloridas'); r.style.setProperty('--acc-h', hue(s.accent));
  }
  var apply0 = P.apply; P.apply = function () { var x = apply0.apply(this, arguments); aplicar(); return x; };
  aplicar();

  document.addEventListener('input', function (e) {
    var t = e.target; if (!t || t.getAttribute('data-act') !== 'vol') return;
    S.set.vol = +t.value; var l = document.getElementById('volTxt'); if (l) l.textContent = t.value + '%'; if (P.somAplicar) P.somAplicar();
  });
  document.addEventListener('change', function (e) {
    var t = e.target; if (!t || t.getAttribute('data-act') !== 'vol') return;
    S.set.vol = +t.value; P.save(); if (P.somAplicar) P.somAplicar(); if (P.som) P.som('liquido');
  });
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-act="pasta"],[data-act="pcor"]'); if (!el) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    var a = el.getAttribute('data-act'), v = el.getAttribute('data-v'); S.set[a] = v; P.save(); aplicar(); if (P.som) P.som('pop');
    P.render({ keep: true });
  }, true);
})();
