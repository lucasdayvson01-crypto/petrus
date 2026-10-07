/* PETRUS · lei seca dentro da aula. Ao tocar numa lei (chip "LEI SECA") fora do Vade Mecum, o artigo abre numa telinha arredondada
   com o fundo desfocado, sem tirar você da aula. Dali dá para "Abrir no Vade Mecum": nesse caso o botão voltar leva de volta para
   a aula de onde você veio, e não para a lista do Vade. */
(function () {
  var P = window.P, esc = P.esc, ov = null;
  P.vadeOrigem = null;
  var norm = function (s) { return String(s || '').replace(/[º°\s.]/g, '').toLowerCase(); };

  function fechar() {
    if (!ov) return; var o = ov; ov = null; o.classList.remove('on'); o.classList.add('off');
    setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 380);
  }
  function abrir(href, rotulo) {
    fechar(); var m = href.match(/^#\/vade\/([^\/]+)(?:\/(.+))?$/); if (!m) return false;
    var id = m[1], art = m[2] ? decodeURIComponent(m[2]) : '', lei = P.LEIS.find(function (x) { return x.id === id; });
    if (!lei) return false;
    ov = document.createElement('div'); ov.className = 'lm-ov';
    ov.innerHTML = '<div class="lm-card" role="dialog" aria-modal="true" aria-label="Lei seca"><button class="lm-x" data-lmclose aria-label="Fechar">×</button>' +
      '<span class="lm-eyebrow">Lei seca · ' + esc(lei.grupo || '') + '</span><h3>' + esc(rotulo || lei.curto || lei.nome) + '</h3><p class="lm-sub">' + esc(lei.nome) + '</p>' +
      '<div class="lm-body" id="lmBody"><div class="lm-load">Carregando o texto…</div></div>' +
      '<div class="lm-foot"><button class="btn sm" data-lmgo="' + esc(href) + '">Abrir no Vade Mecum</button><button class="btn sm ghost" data-lmclose>Fechar</button></div></div>';
    document.body.appendChild(ov); void ov.offsetWidth; ov.classList.add('on');
    var c = ov.querySelector('.lm-x'); if (c) c.focus({ preventScroll: true });
    P.loadLei(id).then(function (d) {
      var b = document.getElementById('lmBody'); if (!b) return;
      if (!d || !d.arts) { b.innerHTML = '<div class="lm-load">Não consegui carregar esta lei. Use "Abrir no Vade Mecum".</div>'; return; }
      var al = norm(art), pos = al ? d.arts.findIndex(function (a) { return norm(a.n) === al; }) : -1, from = pos >= 0 ? Math.max(0, pos - 1) : 0, fatia = d.arts.slice(from, from + (pos >= 0 ? 6 : 8));
      b.innerHTML = fatia.map(function (a) { var alvo = pos >= 0 && norm(a.n) === al; return '<div class="lm-art' + (alvo ? ' alvo' : '') + '"><b>' + esc(a.n || '') + (a.g ? ' · ' + esc(a.g) : '') + '</b><p>' + esc(a.t || '') + '</p></div>'; }).join('');
      var e = b.querySelector('.alvo'); if (e) b.scrollTop = Math.max(0, e.offsetTop - 14);
    });
    return true;
  }
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var go = t.closest('[data-lmgo]');
    if (go) { e.preventDefault(); e.stopPropagation(); P.vadeOrigem = location.hash; var h = go.getAttribute('data-lmgo'); fechar(); location.hash = h; return; }
    if (ov && (t.closest('[data-lmclose]') || !t.closest('.lm-card'))) { e.preventDefault(); e.stopPropagation(); fechar(); return; }
    var a = t.closest('a.lei[href^="#/vade/"], a.chip.lei[href^="#/vade/"]');
    if (a && !/^#\/vade/.test(location.hash)) { if (abrir(a.getAttribute('href'), (a.textContent || '').trim())) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); } return; }
    /* voltar a partir do Vade que foi aberto de dentro de uma aula: volta para a aula */
    if (t.closest('#back') && P.vadeOrigem && /^#\/vade\//.test(location.hash)) {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); var o = P.vadeOrigem; P.vadeOrigem = null; location.hash = o;
    }
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
  window.addEventListener('hashchange', function () { if (ov) fechar(); if (P.vadeOrigem && !/^#\/vade/.test(location.hash)) P.vadeOrigem = null; });
})();
