/* PETRUS · aulas em folha de pauta. A aba Aulas do livro mostra uma folha de pauta com o indice; clicar no numero embaralha as folhas
   e abre UMA pagina so com aquela aula (area de concentracao): teoria, pegadinhas, casos reais, lei seca, teste do assunto e suas anotacoes. */
(function () {
  var P = window.P, esc = P.esc, ic = P.ic, V = P.V, S = P.S;
  S.anot = S.anot || {};

  /* ---------- aba Aulas = indice em folha de pauta ---------- */
  P.aulasIndice = function (id, m, bl, cu) {
    var cnt = { ok: 0, rev: 0, nao: 0 }; bl.forEach(function (b, i) { cnt[P.statusBloco(id, i)]++; });
    var venc = P.revisoesVencidas().filter(function (x) { return x.mat === id; }), prox = -1;
    for (var k = 0; k < bl.length; k++) if (!P.isRead(id, k)) { prox = k; break; }
    var intro = cu.intro ? '<details class="bk" style="margin-bottom:22px"><summary><span class="n">★</span><span class="t">Abertura da matéria<small>O que cai, como a FGV cobra e como estudar</small></span><span class="car">›</span></summary><div class="bd"><div class="prose">' + P.md(cu.intro) + '</div></div></details>' : '';
    var banner = venc.length ? '<div class="card tint" style="--t:#FFF1D6;margin-bottom:20px"><b>🔁 ' + venc.length + ' revisão(ões) vencendo nesta matéria</b><p style="margin-top:4px;font-size:14px">Abra a aula marcada e faça o teste do assunto: revisar é testar, não reler.</p></div>' : '';
    var nums = bl.map(function (b, i) { return '<button class="pt-n s-' + P.statusBloco(id, i) + '" data-aula="' + id + ':' + i + '" title="Aula ' + (i + 1) + ': ' + esc(b.t) + '">' + (i + 1) + '</button>'; }).join('');
    var lines = bl.map(function (b, i) { var s = P.stIcon(P.statusBloco(id, i)), te = P.temaDoBloco(id, i), due = venc.some(function (x) { return x.i === i; });
      return '<li><a href="#/aula/' + id + '/' + i + '" data-aula="' + id + ':' + i + '"><span class="pn">' + (i + 1) + '</span><span class="pt">' + (due ? '🔁 ' : '') + esc(b.t) + '<small>' + (te ? te.n + ' questões reais em ' + (te.ex || []).length + ' provas' : 'abertura e mapa da matéria') + '</small></span><span class="ps" title="' + s[1] + '">' + s[0] + '</span></a></li>'; }).join('');
    return banner + intro + '<div class="pauta-wrap" id="pauta"><span class="pf p3"></span><span class="pf p2"></span><span class="pf p1"></span><div class="pauta-sheet"><div class="pt-head"><span class="eyebrow">Índice · folha de pauta</span><h3>' + esc(m.nome) + '</h3><p class="tiny">✅ ' + cnt.ok + ' consolidadas · 🟡 ' + cnt.rev + ' para revisar · ⬜ ' + cnt.nao + ' ainda não estudadas</p></div>' +
      '<div class="pt-marks" aria-label="Aulas">' + nums + '</div><ol class="pt-list">' + lines + '</ol>' + (prox >= 0 ? '<div class="pt-foot"><a class="btn acc" data-aula="' + id + ':' + prox + '" href="#/aula/' + id + '/' + prox + '">' + ic('play') + (prox === 0 && !cnt.ok && !cnt.rev ? 'Começar pela aula 1' : 'Continuar na aula ' + (prox + 1)) + '</a></div>' : '<div class="pt-foot"><span class="chip fill">Todas as aulas estudadas</span> <a class="btn ghost sm" href="#/materia/' + id + '/testes">Ir para os testes</a></div>') + '</div></div>';
  };

  /* clique no numero: as folhas se embaralham e a aula abre em pagina propria */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-aula]'); if (!a || e.metaKey || e.ctrlKey) return;
    var k = a.getAttribute('data-aula').split(':'), href = '#/aula/' + k[0] + '/' + k[1], wrap = document.getElementById('pauta');
    e.preventDefault();
    if (!wrap || P.S.set.motion === 'off' || !document.startViewTransition || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { location.hash = href; return; }
    if (wrap.classList.contains('glassout')) return;
    wrap.classList.add('glassout');
    setTimeout(function () { var root = document.documentElement; root.classList.add('vt-glass'); var vt = document.startViewTransition(function () { history.pushState(null, '', href); P.render(); }); var fim = function () { root.classList.remove('vt-glass'); }; vt.ready.catch(function () { }); vt.updateCallbackDone.catch(function () { }); vt.finished.then(fim, fim); }, 620);
  });

  /* ---------- pagina de UMA aula ---------- */
  V.aula = function (id, ix) {
    var i = +ix, m = P.mat(id), bl = P.blocos(id), b = bl[i];
    if (!m || !b) return { t: 'Aula', back: '#/biblioteca', h: '<div class="card empty">Aula não encontrada.</div>' };
    var te = P.temaDoBloco(id, i), rs = P.regrasDoBloco(id, i), rd = P.isRead(id, i), st = P.stIcon(P.statusBloco(id, i)), nr = P.nextRev(id + ':' + i);
    var pegs = rs.filter(function (r) { return r.k === 'pegadinha' || r.k === 'padrao'; }).slice(0, 3), outras = rs.filter(function (r) { return pegs.indexOf(r) < 0; }).slice(0, 3);
    var rBox = function (arr, titulo) { return arr.length ? '<div class="bkbox"><span class="eyebrow">' + titulo + '</span>' + arr.map(function (r) { return '<div class="rg"><b>' + esc(r.t) + '</b><p>' + esc(r.e.length > 380 ? r.e.slice(0, 377) + '…' : r.e) + '</p>' + (r.o ? '<p class="pg"><b>O que a banca troca:</b> ' + esc(r.o) + '</p>' : '') + '</div>'; }).join('') + '</div>' : ''; };
    var refs = [], seen = {}; rs.forEach(function (r) { P.leiRefs(r.b).forEach(function (x) { var k = x.id + x.art; if (!seen[k]) { seen[k] = 1; refs.push(x); } }); });
    var lei = refs.length ? '<div class="lsec"><span class="eyebrow">LEI SECA · vale a leitura</span><div class="chips" style="margin-top:8px">' + refs.slice(0, 10).map(function (x) { return '<a class="chip lei" href="#/vade/' + x.id + '/' + x.art + '">' + ic('law') + esc(x.label) + '</a>'; }).join('') + '</div></div>' : '';
    var dots = bl.map(function (x, k) { return '<a class="dt' + (k === i ? ' on' : '') + ' s-' + P.statusBloco(id, k) + '" href="#/aula/' + id + '/' + k + '" title="Aula ' + (k + 1) + ': ' + esc(x.t) + '">' + (k + 1) + '</a>'; }).join('');
    var tbtn = te ? '<a class="btn acc" href="#/teste/' + id + '/tema/' + P.temas(id).indexOf(te) + '">' + ic('target') + 'Testar este assunto (' + Math.min(te.ids.length, 6) + ' questões reais)</a>' : '';
    var key = id + ':' + i, nota = S.anot[key] || '';
    var h = '<div class="foco-top"><a class="btn ghost sm" href="#/materia/' + id + '/aulas">' + ic('back') + 'Índice de ' + esc(m.nome) + '</a><div class="dots">' + dots + '</div></div>' +
      '<article class="folha"><span class="eyebrow">Aula ' + (i + 1) + ' de ' + bl.length + ' · ' + esc(m.nome) + '</span><h1>' + esc(b.t) + '</h1>' +
      '<div class="chips" style="margin:12px 0 22px"><span class="chip">' + st[0] + ' ' + st[1] + '</span>' + (te ? '<span class="chip">' + te.n + ' questões em ' + (te.ex || []).length + ' provas</span>' : '<span class="chip">Abertura</span>') + (nr ? '<span class="chip">Próxima revisão ' + P.fmt(P.iso(new Date(nr))) + '</span>' : '') + '</div>' +
      '<div class="pre"><span class="eyebrow">Antes de ler, pense</span><p>' + (te ? 'Esse assunto caiu em <b>' + te.n + ' questões</b> nas provas ' + (te.ex || []).join(', ') + '. Qual instituto a banca quer ver aqui e o que ela costuma trocar? Leia com essa pergunta na cabeça.' : 'Leia como mapa: ele organiza o que vem nas próximas aulas.') + '</p></div>' +
      '<span class="eyebrow">Teoria</span><div class="prose aula" style="margin-top:8px">' + P.md(b.x) + '</div>' + rBox(pegs, 'Pegadinhas da FGV neste assunto') + rBox(outras, 'Regras do banco do Petrus (conferidas na lei)') + lei +
      (te ? '<div class="bkbox" data-ex="' + id + ':' + i + '"><span class="eyebrow">Casos reais da prova</span><div class="exh tiny">Carregando exemplos…</div></div>' : '') +
      '<div class="bkbox"><span class="eyebrow">Suas anotações desta aula</span><textarea class="in padn" data-anot="' + key + '" rows="5" placeholder="Escreva com as suas palavras o que entendeu e o que a banca costuma trocar…">' + esc(nota) + '</textarea></div>' +
      '<div class="chips" style="margin-top:22px">' + tbtn + '<button class="btn ' + (rd ? 'ghost' : '') + '" data-act="read" data-id="' + id + '" data-i="' + i + '">' + (rd ? 'Marcar como não estudada' : 'Marcar como estudada') + '</button></div>' +
      '<div class="pg-nav">' + (i > 0 ? '<a class="btn ghost sm" href="#/aula/' + id + '/' + (i - 1) + '">' + ic('back') + 'Aula ' + i + '</a>' : '<span></span>') + (i < bl.length - 1 ? '<a class="btn sm" href="#/aula/' + id + '/' + (i + 1) + '">Aula ' + (i + 2) + ic('fwd') + '</a>' : '<a class="btn sm acc" href="#/materia/' + id + '/testes">Ir para os testes</a>') + '</div></article>';
    return { t: m.nome + ' · Aula ' + (i + 1), back: '#/materia/' + id + '/aulas', h: h, post: function () {
      document.body.classList.add('foco');
      P.qsReady().then(function () { return P.loadFgv(); }).then(function () {
        P.$$('[data-ex]').forEach(function (el) {
          var k = el.getAttribute('data-ex').split(':'), t2 = P.temaDoBloco(k[0], +k[1]); if (!t2) return;
          var qs = t2.ids.map(function (qid) { return P.q(qid); }).filter(function (q) { return q && !q.anulada; }).sort(function (a, b2) { return parseInt(b2.exame) - parseInt(a.exame); }).slice(0, 3);
          var hh = P.$('.exh', el); if (hh) hh.outerHTML = qs.length ? qs.map(function (q, n) { return '<details class="qex"><summary>Caso ' + (n + 1) + ' · ' + esc(q.exame) + ' Exame, questão ' + esc(q.num) + ' <span class="tiny">(abra, pense, e só então veja o gabarito)</span></summary>' + P.qHtml(q, { reveal: true }) + '</details>'; }).join('') : '<p class="muted">Ainda sem caso real ligado a este assunto.</p>';
        });
      });
    } };
  };
  /* notas da aula salvas na hora */
  var tmr = 0;
  document.addEventListener('input', function (e) { var t = e.target; if (!t.getAttribute || !t.getAttribute('data-anot')) return; S.anot[t.getAttribute('data-anot')] = t.value; clearTimeout(tmr); tmr = setTimeout(function () { P.save(); }, 400); });
  /* setas navegam entre as aulas */
  document.addEventListener('keydown', function (e) {
    var m = (location.hash || '').match(/^#\/aula\/([^/]+)\/(\d+)/); if (!m || /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) return;
    var n = P.blocos(m[1]).length, i = +m[2];
    if (e.key === 'ArrowRight' && i < n - 1) location.hash = '#/aula/' + m[1] + '/' + (i + 1); else if (e.key === 'ArrowLeft' && i > 0) location.hash = '#/aula/' + m[1] + '/' + (i - 1);
  });
})();
