/* PETRUS · "Design da Apple" (regras do PDF, skill de Emil Kowalski): resposta no toque, animação sempre interrompível e
   gesto que herda a velocidade do dedo. O CSS (apple.css) cuida das molas, do :active e da tipografia; aqui fica o que precisa de JS. */
(function () {
  var P = window.P;

  /* 1. Resposta no toque: no iOS o :active só funciona se existir um ouvinte de touchstart na página */
  document.addEventListener('touchstart', function () { }, { passive: true });

  /* 2. Toda animação precisa ser interrompível.
        A pasta que está abrindo (e a página de aula que vira vidro) pode ser cancelada: tocar em outro lugar, Esc ou voltar
        desfazem o movimento a partir de onde ele está, e uma transição de tela em andamento é pulada, nunca bloqueia o toque. */
  P.cancelaAbrir = function () {
    clearTimeout(P.openTimer); clearTimeout(P.glassTimer);
    document.querySelectorAll('.folder.opening').forEach(function (f) { f.classList.remove('opening'); });
    document.querySelectorAll('.pauta-wrap.glassout').forEach(function (w) { w.classList.remove('glassout'); });
    document.body.classList.remove('fdopen');
  };
  function abrindo() { return !!document.querySelector('.folder.opening, .pauta-wrap.glassout'); }
  document.addEventListener('pointerdown', function (e) {
    if (P.vt && P.vt.skipTransition) { try { P.vt.skipTransition(); } catch (x) { } }
    if (abrindo() && !(e.target.closest && e.target.closest('.folder.opening, .pauta-wrap a'))) P.cancelaAbrir();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && abrindo()) P.cancelaAbrir(); });
  window.addEventListener('popstate', function () { P.cancelaAbrir(); });

  /* 3. O movimento herda a velocidade do dedo. As telinhas (rendimento e lei seca) ganham uma alça: arraste para baixo e solte.
        O destino não é onde você soltou, é onde o impulso levaria: projeção = velocidade * 0,998/(1-0,998), a fórmula de rolagem da Apple.
        Para cima, a telinha resiste como borracha. Se o impulso não bastar, volta com a mola do painel. */
  var DECEL = .998;
  function projeta(v) { return v / 1000 * (DECEL / (1 - DECEL)); } /* v em px/s -> px */
  function borracha(y, d) { var c = .55; return (1 - (1 / ((Math.abs(y) * c / d) + 1))) * d * (y < 0 ? -1 : 1); }

  function folha(card, fechar) {
    if (card._folha) return; card._folha = true;
    var alvo = card.closest('.rp-wrap') || card, g = document.createElement('span'); g.className = 'sheet-grab'; g.setAttribute('aria-hidden', 'true');
    card.insertBefore(g, card.firstChild);
    var d = null, pts = [];
    function amostra(y) { var t = performance.now(); pts.push([t, y]); while (pts.length > 2 && t - pts[0][0] > 110) pts.shift(); }
    g.addEventListener('pointerdown', function (e) {
      e.preventDefault(); g.setPointerCapture(e.pointerId); d = { y0: e.clientY, h: alvo.getBoundingClientRect().height }; pts = []; amostra(e.clientY);
      alvo.classList.add('sheet-dragging'); alvo.style.transition = 'none';
    });
    g.addEventListener('pointermove', function (e) {
      if (!d) return; var dy = e.clientY - d.y0; amostra(e.clientY);
      alvo.style.transform = 'translateY(' + (dy < 0 ? borracha(dy, 260) : dy).toFixed(1) + 'px)';
    });
    function solta(e) {
      if (!d) return; var dy = e.clientY - d.y0, h = d.h, v = 0; d = null; alvo.classList.remove('sheet-dragging');
      if (pts.length > 1) { var a = pts[0], b = pts[pts.length - 1]; v = (b[1] - a[1]) / Math.max(1, b[0] - a[0]) * 1000; } /* px/s */
      var destino = dy + projeta(v);
      if (destino > Math.min(170, h * .35)) {
        /* sai na direção do impulso, e rápido se foi um arremesso */
        var dur = Math.max(.22, Math.min(.5, (h - dy) / Math.max(900, v) )); alvo.style.transition = 'transform ' + dur + 's cubic-bezier(.3,.7,.4,1), opacity ' + dur + 's';
        alvo.style.transform = 'translateY(' + (h + 60) + 'px)'; alvo.style.opacity = '0'; setTimeout(fechar, Math.round(dur * 520));
      } else {
        alvo.style.transition = 'transform .45s var(--mola-painel)'; alvo.style.transform = 'translateY(0)';
        setTimeout(function () { alvo.style.transition = ''; alvo.style.transform = ''; }, 480);
      }
    }
    g.addEventListener('pointerup', solta); g.addEventListener('pointercancel', solta);
  }
  new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (!n.classList) return;
        if (n.classList.contains('rp-ov')) { var c = n.querySelector('.rp-card'), x = n.querySelector('[data-rpclose]'); if (c && x) folha(c, function () { x.click(); }); }
        if (n.classList.contains('lm-ov')) { var l = n.querySelector('.lm-card'), y = n.querySelector('[data-lmclose]'); if (l && y) folha(l, function () { y.click(); }); }
      });
    });
  }).observe(document.body, { childList: true });
})();
