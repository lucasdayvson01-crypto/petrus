/* PETRUS · rendimento: pílula deitada com líquido roxo dentro de vidro fosco. Mostra quanto já foi estudado (aulas lidas) no total
   e em cada matéria. Ao clicar, a pílula "abre" com um líquido roxo suave e mostra uma telinha arredondada com a explicação. */
(function () {
  var P = window.P, esc = P.esc, S = P.S, V = P.V;
  var WAVE = '<svg viewBox="0 0 22 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 L10 0 Q20 10 10 20 T10 40 T10 60 T10 80 T10 100 T10 120 L0 120 Z"/></svg>';

  /* ---------- números do rendimento ---------- */
  function matInfo(id) {
    var bl = P.blocos(id), n = bl.length, lidas = 0, ok = 0, rev = 0, nao = 0, prox = [];
    for (var i = 0; i < n; i++) {
      if (P.isRead(id, i)) lidas++; else if (prox.length < 3) prox.push(i);
      var st = P.statusBloco(id, i); if (st === 'ok') ok++; else if (st === 'rev') rev++; else nao++;
    }
    var a = 0, t = 0; Object.keys(S.tstat || {}).forEach(function (k) { if (k.indexOf(id + '|') === 0) { a += S.tstat[k].a || 0; t += S.tstat[k].t || 0; } });
    var venc = P.revisoesVencidas().filter(function (x) { return x.mat === id; }).length, err = P.errosAtivos(id).length;
    return { n: n, lidas: lidas, ok: ok, rev: rev, nao: nao, a: a, t: t, venc: venc, err: err, prox: prox, pct: n ? Math.round(lidas * 100 / n) : 0 };
  }
  function allInfo() {
    var r = { n: 0, lidas: 0, ok: 0, rev: 0, nao: 0, a: 0, t: 0, venc: 0, err: 0, prox: [] };
    P.LIST.forEach(function (m) { var x = matInfo(m.id); ['n', 'lidas', 'ok', 'rev', 'nao', 'a', 't', 'venc', 'err'].forEach(function (k) { r[k] += x[k]; }); });
    r.pct = r.n ? Math.round(r.lidas * 100 / r.n) : 0; return r;
  }
  /* quanto o cronograma esperaria que já estivesse feito (minutos planejados que já passaram) */
  function esperado() {
    var t = P.today(), tot = 0, feito = 0;
    Object.keys(P.CRO.dias || {}).forEach(function (k) { var m = P.CRO.dias[k].min || 0; tot += m; if (k < t) feito += m; });
    return tot ? Math.round(feito * 100 / tot) : 0;
  }
  P.rendInfo = function (id) { return id === 'all' ? allInfo() : matInfo(id); };

  /* ---------- a pílula ---------- */
  P.rpill = function (id, size) {
    var x = P.rendInfo(id), p = x.pct, tick = id === 'all' ? esperado() : null;
    var nome = id === 'all' ? 'até a prova' : (P.mat(id) ? P.mat(id).nome : id);
    return '<span class="rpill ' + (size || '') + '" role="button" tabindex="0" data-rend="' + esc(id) + '" style="--p:' + p + '" aria-label="Rendimento ' + esc(nome) + ': ' + p + '% estudado. Toque para ver os detalhes.">' +
      '<span class="rp-glass"><span class="rp-liquid"></span>' + (p > 0 && p < 100 ? '<span class="rp-edge">' + WAVE + '</span>' : '') + '<span class="rp-bub b1"></span><span class="rp-bub b2"></span><span class="rp-bub b3"></span><span class="rp-shine"></span>' +
      (tick !== null ? '<span class="rp-tick" style="--e:' + tick + '" title="Onde o cronograma esperaria estar hoje"></span>' : '') +
      '<span class="rp-txt"><b>' + p + '%</b><small>' + (size === 'sm' ? 'estudado' : 'estudado ' + (id === 'all' ? 'até a prova' : '')) + '</small></span></span></span>';
  };

  /* ---------- a telinha que abre ---------- */
  function bar(label, a, b, note) {
    var p = b ? Math.round(a * 100 / b) : 0;
    return '<div class="rp-line"><div class="rp-lt"><span>' + label + '</span><b>' + a + (b ? ' de ' + b : '') + '</b></div><div class="rp-mini"><i style="--p:' + p + '%"></i></div>' + (note ? '<small>' + note + '</small>' : '') + '</div>';
  }
  function popHtml(id) {
    var x = P.rendInfo(id), all = id === 'all', dias = P.daysTo(P.CFG.prova), sem = Math.max(1, dias / 7), faltam = x.n - x.lidas;
    var nome = all ? 'Seu rendimento até a prova' : esc(P.mat(id).nome);
    var h = '<div class="rp-card" role="dialog" aria-modal="true" aria-label="Rendimento"><button class="rp-x" data-rpclose aria-label="Fechar">×</button>' +
      '<span class="rp-eyebrow">' + (all ? 'Todas as matérias' : 'Rendimento da matéria') + '</span><h3>' + nome + '</h3>' +
      '<div class="rp-big"><b>' + x.pct + '%</b><span>' + x.lidas + ' de ' + x.n + ' aulas estudadas' + (all ? '<br>faltam ' + dias + ' dias para a 1ª fase' : '') + '</span></div>';
    h += bar('Aulas estudadas', x.lidas, x.n, all ? 'O cronograma esperaria que você já tivesse feito ' + esperado() + '% do plano de estudo hoje.' : 'Cada aula que você marca como lida entra na conta.');
    h += bar('Temas consolidados', x.ok, x.n, '✅ lido e bem em questões · 🟡 lido, falta revisar: ' + x.rev + ' · ⬜ ainda não estudado: ' + x.nao);
    h += x.t ? bar('Acertos nos testes', x.a, x.t, Math.round(x.a * 100 / x.t) + '% de acerto nas questões reais já respondidas.') : '<div class="rp-line"><div class="rp-lt"><span>Acertos nos testes</span><b>sem testes ainda</b></div><small>Quando você fizer uma bateria, o acerto aparece aqui.</small></div>';
    h += '<div class="rp-two"><div><b>' + x.venc + '</b><span>revisões vencidas (D+1, 3, 7, 15, 30)</span></div><div><b>' + x.err + '</b><span>erros ativos no caderno</span></div></div>';
    if (all) h += '<p class="rp-note">Para terminar todas as aulas antes da prova, o ritmo é de cerca de <b>' + Math.ceil(faltam / sem) + ' aulas por semana</b>.</p>';
    else if (x.prox.length) h += '<div class="rp-next"><span>Próximas aulas</span>' + x.prox.map(function (i) { return '<a href="#/aula/' + id + '/' + i + '">' + (i + 1) + '. ' + esc(P.blocos(id)[i].t) + '</a>'; }).join('') + '</div>';
    h += '<p class="rp-how"><b>Como a barra é calculada:</b> rendimento = aulas lidas ÷ total de aulas. Os testes, as revisões e os erros aparecem ao lado para mostrar se o que você leu está fixado.</p></div>';
    return h;
  }
  var ov = null;
  function close() {
    if (!ov) return; var o = ov; ov = null; o.classList.remove('on'); o.classList.add('off'); if (P.som) P.som('feche');
    setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 520);
  }
  function open(el) {
    close(); var r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, id = el.getAttribute('data-rend');
    if (id !== 'all' && !P.mat(id)) return;
    ov = document.createElement('div'); ov.className = 'rp-ov';
    ov.style.setProperty('--ox', x + 'px'); ov.style.setProperty('--oy', y + 'px');
    ov.innerHTML = '<span class="rp-ink"></span><div class="rp-wrap">' + popHtml(id) + '</div>';
    document.body.appendChild(ov); void ov.offsetWidth; ov.classList.add('on');
    var c = ov.querySelector('.rp-x'); if (c) c.focus({ preventScroll: true });
    if (P.som) { P.som('liquido'); setTimeout(function () { P.som('magia'); }, 140); }
    if (S.set.motion !== 'off') {
      el.classList.remove('slosh'); void el.offsetWidth; el.classList.add('slosh'); setTimeout(function () { el.classList.remove('slosh'); }, 800);
      magia(ov, x, y);
    }
  }
  /* efeito de magia: anéis de luz e estrelinhas roxas que voam a partir da pílula, e algumas que ficam cintilando em volta da telinha */
  function magia(o, x, y) {
    var h = '<span class="rp-ring"></span><span class="rp-ring r2"></span>', i, a, d, s;
    for (i = 0; i < 26; i++) {
      a = Math.random() * Math.PI * 2; d = 90 + Math.random() * Math.min(innerWidth, 620) * .55; s = .5 + Math.random() * 1.1;
      h += '<span class="rp-spark" style="--dx:' + Math.round(Math.cos(a) * d) + 'px;--dy:' + Math.round(Math.sin(a) * d * .8) + 'px;--s:' + s.toFixed(2) + ';--dl:' + Math.round(Math.random() * 260) + 'ms;--rt:' + Math.round(Math.random() * 180 - 90) + 'deg;--h:' + (255 + Math.round(Math.random() * 40)) + '"></span>';
    }
    var wrap = o.querySelector('.rp-wrap'), tw = '';
    for (i = 0; i < 9; i++) tw += '<span class="rp-twk" style="left:' + Math.round(Math.random() * 100) + '%;top:' + Math.round(Math.random() * 100) + '%;--s:' + (.4 + Math.random() * .7).toFixed(2) + ';--dl:' + Math.round(Math.random() * 2400) + 'ms"></span>';
    var f = document.createElement('div'); f.className = 'rp-fx'; f.innerHTML = h; o.appendChild(f);
    if (wrap) { var t = document.createElement('div'); t.className = 'rp-tw'; t.innerHTML = tw; wrap.appendChild(t); }
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-rend]');
    if (t) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); open(t); return; }
    if (ov && (e.target.closest('[data-rpclose]') || !e.target.closest('.rp-card'))) { if (!e.target.closest('.rp-next a')) { e.preventDefault(); close(); } else close(); }
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    var t = e.target; if ((e.key === 'Enter' || e.key === ' ') && t && t.getAttribute && t.getAttribute('data-rend')) { e.preventDefault(); open(t); }
  });
  window.addEventListener('hashchange', close);

  /* ---------- onde ela aparece: início e topo de cada matéria ---------- */
  function depoisDoHero(r, html) {
    if (!r || typeof r.h !== 'string') return r; var k = r.h.indexOf('</section>'); if (k < 0) return r;
    r.h = r.h.slice(0, k + 10) + html + r.h.slice(k + 10); return r;
  }
  var inicio = V.inicio; V.inicio = function () { var r = inicio.apply(this, arguments); return depoisDoHero(r, '<div class="rp-bar"><span class="rp-cap">Quanto você já estudou até a prova</span>' + P.rpill('all', 'lg') + '</div>'); };
})();
