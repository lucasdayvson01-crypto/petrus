/* PETRUS · testes por assunto, bateria rapida, revisao de erros e caderno de erros.
   Metodo do professor: UMA questao por vez, voce responde, so entao vem a correcao com o porque; errou, entra no caderno de erros
   e vem uma questao de reforco (que NAO conta no placar) antes de seguir. Questoes anuladas nunca contam. */
(function () {
  var P = window.P, esc = P.esc, ic = P.ic, V = P.V, S = P.S;
  var T = null;
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(a) { var r = rng(Date.now() & 0xffff), x = a.slice(); for (var i = x.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = x[i]; x[i] = x[j]; x[j] = t; } return x; }
  var temaOfQ = {};
  function temaDe(mat, qid) { var k = mat + '|' + qid; if (temaOfQ[k] !== undefined) return temaOfQ[k]; var t = P.temas(mat).find(function (x) { return x.ids.indexOf(qid) >= 0; }); return (temaOfQ[k] = t ? t.t : ''); }

  /* ---------- rota: #/teste/<materia|all>/<tema|bateria|erros>/<chave> ---------- */
  V.teste = function (mat, kind, key) {
    var back = mat && mat !== 'all' ? '#/materia/' + mat + '/testes' : '#/erros', m = P.mat(mat), title = kind === 'tema' ? ((P.temas(mat)[+key] || {}).t || 'Teste') : kind === 'bateria' ? 'Bateria rápida' : 'Revisão dos erros';
    return { t: 'Teste · ' + (m ? m.nome : 'Caderno de erros'), back: back, h: '<span class="eyebrow">' + esc(m ? m.nome : 'Todas as matérias') + ' · ' + (kind === 'tema' ? 'teste do assunto' : kind === 'bateria' ? 'prova rápida' : 'revisão espaçada') + '</span><h1 style="margin:6px 0 4px;font-size:clamp(24px,3.2vw,38px)">' + esc(title) + '</h1><div id="tbox"><div class="card empty">Preparando as questões…</div></div>', post: function () { P.qsReady().then(function () { return P.loadFgv(); }).then(function () { begin(mat, kind, key); }); } };
  };
  function pick(mat, kind, key) {
    var ids = [], title = '', tema = '';
    if (kind === 'tema') { var te = P.temas(mat)[+key]; if (te) { title = te.t; tema = te.t; ids = shuffle(te.ids).filter(function (id) { var q = P.q(id); return q && !q.anulada; }).slice(0, 6); } }
    else if (kind === 'bateria') {
      var temas = P.temas(mat), pool = []; temas.forEach(function (t) { t.ids.forEach(function (id) { var q = P.q(id); if (q && !q.anulada) pool.push({ id: id, w: t.n }); }); });
      var act = P.errosAtivos(mat).map(function (e) { return e.id; }).filter(function (id) { return P.q(id) && !P.q(id).anulada; });
      ids = shuffle(act).slice(0, 3); var rest = shuffle(pool.map(function (p) { return p.id; }).filter(function (id) { return ids.indexOf(id) < 0; }));
      pool.sort(function (a, b) { return b.w - a.w; }); var heavy = pool.map(function (p) { return p.id; }).filter(function (id) { return ids.indexOf(id) < 0; }).slice(0, 30);
      var mix = shuffle(heavy.concat(rest.slice(0, 20))); mix.forEach(function (id) { if (ids.length < 10 && ids.indexOf(id) < 0) ids.push(id); }); title = 'Bateria rápida';
    } else {
      var v = P.errosVencidos(mat === 'all' ? '' : mat); if (!v.length) v = P.errosAtivos(mat === 'all' ? '' : mat);
      ids = shuffle(v.map(function (e) { return e.id; })).filter(function (id) { var q = P.q(id); return q && !q.anulada; }).slice(0, 12); title = 'Revisão dos erros';
    }
    return { ids: ids, title: title, tema: tema };
  }
  function begin(mat, kind, key) {
    var box = document.getElementById('tbox'); if (!box) return;
    var p = pick(mat, kind, key);
    if (!p.ids.length) { box.innerHTML = '<div class="card empty">' + (kind === 'erros' ? 'Nenhum erro para revisar. Quando você errar uma questão, ela entra no caderno de erros e volta aqui na hora certa.' : 'Não encontrei questões para este teste.') + '</div>'; return; }
    T = { mat: mat, kind: kind, key: key, main: p.ids, queue: p.ids.map(function (id) { return { id: id, reforco: false }; }), i: 0, a: 0, e: 0, resp: {}, usados: {}, errosNovos: [], reforcos: 0, done: false, tema: p.tema };
    p.ids.forEach(function (id) { T.usados[id] = 1; }); show();
  }
  function placar() { var t = T.a + T.e; return '✅ ' + T.a + ' · ❌ ' + T.e + (t ? ' · ' + Math.round(T.a * 100 / t) + '%' : ''); }
  function show() {
    var box = document.getElementById('tbox'); if (!box || !T) return;
    if (T.i >= T.queue.length) return fim();
    var it = T.queue[T.i], q = P.q(it.id), mainTotal = T.main.length, pos = T.queue.slice(0, T.i + 1).filter(function (x) { return !x.reforco; }).length;
    T.cur = { id: it.id, reforco: it.reforco, answered: false };
    box.innerHTML = '<div class="card" style="margin-top:14px"><div class="row" style="padding:0 0 14px;border:0"><div class="grow"><span class="chip">' + esc(q.materia) + '</span> ' + (it.reforco ? '<span class="chip fill">Reforço · não conta no placar</span>' : '') + '</div><span class="chip" style="font-variant-numeric:tabular-nums">' + placar() + '</span></div>' +
      '<div class="prog" style="margin-bottom:10px"><i style="--p:' + Math.round(pos * 100 / mainTotal) + '%"></i></div><div class="tiny" style="margin-bottom:14px">' + (it.reforco ? 'Questão de reforço sobre o mesmo ponto' : 'Questão ' + pos + ' de ' + mainTotal) + ' · ' + esc(q.exame) + ' Exame, questão ' + esc(q.num) + '</div>' +
      '<div class="prose" style="font-size:16.5px;max-width:none;margin-bottom:18px">' + P.md(q.enun) + '</div><div style="display:grid;gap:10px" id="topts">' + ['A', 'B', 'C', 'D'].map(function (L) { return '<button class="qopt" data-tans="' + L + '"><b>' + L + '</b><span>' + esc(q.alts[L] || '') + '</span></button>'; }).join('') + '</div><div id="tfb"></div></div>';
  }
  function answer(L) {
    if (!T || T.done || !T.cur || T.cur.answered) return; T.cur.answered = true;
    var q = P.q(T.cur.id), ok = L === q.gab, tema = temaDe(P.matDe(q), q.id) || T.tema, reforco = T.cur.reforco;
    var res = P.registrar(q, ok, { tema: tema, resp: L, reforco: reforco });
    if (!reforco) { if (ok) T.a++; else { T.e++; T.errosNovos.push(q.id); } T.resp[q.id] = L; }
    P.$$('#topts .qopt').forEach(function (b) { var l = b.getAttribute('data-tans'); b.disabled = true; if (l === q.gab) b.classList.add('right'); else if (l === L) b.classList.add('wrong'); });
    var ex = P.explicacao(q), refs = ex.regra ? P.leiRefs(ex.regra.b).slice(0, 4) : [], bi = P.blocoDoTema(P.matDe(q), tema);
    var fb = '<div class="fb ' + (ok ? 'ok' : 'no') + '"><h3>' + (ok ? 'Acertou!' : 'Errou, e tudo bem: agora você sabe onde olhar.') + '</h3><p>' + (ok ? 'Gabarito ' + q.gab + '. ' : 'Você marcou <b>' + L + '</b>. O gabarito é <b>' + q.gab + '</b>. ') + (ex.comentario ? esc(ex.comentario) : 'A alternativa correta diz: ' + esc(ex.gabarito)) + '</p>' +
      (ok ? '' : '<p class="tiny" style="margin-top:6px">Sua alternativa: ' + esc(q.alts[L] || '') + '</p>') +
      (ex.regra ? '<div class="co" style="margin:12px 0 0"><span class="cl">A regra por trás</span><p><b>' + esc(ex.regra.t) + '.</b> ' + esc(ex.regra.e.length > 400 ? ex.regra.e.slice(0, 397) + '…' : ex.regra.e) + (ex.regra.o ? '<br><b>O que a banca troca:</b> ' + esc(ex.regra.o) : '') + '</p></div>' : '') +
      (refs.length ? '<div class="chips" style="margin-top:10px">' + refs.map(function (x) { return '<a class="chip lei" href="#/vade/' + x.id + '/' + x.art + '">' + ic('law') + 'LEI SECA · ' + esc(x.label) + '</a>'; }).join('') + '</div>' : '') +
      (!ok ? '<p class="tiny" style="margin-top:10px">' + (res === 'novo' ? 'Anotado no seu caderno de erros. Volta em D+1, D+3, D+7, D+15 e D+30.' : '') + '</p>' : (res === 'avancou' ? '<p class="tiny" style="margin-top:10px">Revisão cumprida: o erro avançou na escala D+1, D+3, D+7, D+15, D+30.</p>' : res === 'dominado' ? '<p class="tiny" style="margin-top:10px">Este erro está dominado. Bom trabalho.</p>' : '')) +
      '<div class="chips" style="margin-top:14px"><button class="btn acc" data-tnext="1">' + (T.i + 1 >= T.queue.length && ok ? 'Ver resultado' : 'Próxima') + '</button>' + (bi >= 0 ? '<a class="btn ghost" href="#/aula/' + P.matDe(q) + '/' + bi + '">Voltar à aula do assunto</a>' : '') + '</div></div>';
    document.getElementById('tfb').innerHTML = fb; document.getElementById('tfb').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (!ok && T.kind !== 'erros' && T.reforcos < 4) { var mat = P.matDe(q), te = P.temas(mat).find(function (x) { return x.t === tema; }); if (te) { var alt = shuffle(te.ids).find(function (id) { var qq = P.q(id); return qq && !qq.anulada && !T.usados[id]; }); if (alt) { T.usados[alt] = 1; T.reforcos++; T.queue.splice(T.i + 1, 0, { id: alt, reforco: true }); } } }
  }
  function next() { if (!T) return; T.i++; show(); window.scrollTo({ top: 0 }); }
  function fim() {
    var box = document.getElementById('tbox'); if (!box) return; T.done = true; var tot = T.a + T.e, pct = tot ? Math.round(T.a * 100 / tot) : 0;
    var temasErr = {}; T.errosNovos.forEach(function (id) { var q = P.q(id), t = temaDe(P.matDe(q), id); temasErr[t] = (temasErr[t] || 0) + 1; });
    var rev = Object.keys(temasErr);
    box.innerHTML = '<div class="card" style="margin-top:14px"><div class="row" style="padding:0 0 16px;border:0"><div class="ring" style="--p:' + pct + ';--s:96px"><b>' + pct + '%</b></div><div class="grow"><h3 style="font-size:22px">' + T.a + ' acertos em ' + tot + ' questões</h3><span>' + (pct >= 70 ? 'Bom domínio deste ponto. Ele já pesa a seu favor na prova.' : pct >= 50 ? 'Dá para chegar lá: revise os pontos abaixo e refaça o teste amanhã.' : 'Ainda não. Releia a aula do assunto e refaça: errar agora é barato.') + '</span></div></div>' +
      (rev.length ? '<span class="eyebrow">Precisam de revisão</span><div class="chips" style="margin:8px 0 14px">' + rev.map(function (t) { var bi = P.blocoDoTema(T.mat === 'all' ? '' : T.mat, t); return bi >= 0 ? '<a class="chip" href="#/aula/' + T.mat + '/' + bi + '">' + esc(t) + '</a>' : '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>' : '<p class="muted" style="margin-bottom:14px">Nenhum erro novo neste teste.</p>') +
      (T.reforcos ? '<p class="tiny" style="margin-bottom:12px">Houve ' + T.reforcos + ' questão(ões) de reforço; elas não entraram no placar.</p>' : '') +
      '<div class="chips"><button class="btn acc" data-trestart="1">Refazer outro conjunto</button>' + (T.mat !== 'all' ? '<a class="btn ghost" href="#/materia/' + T.mat + '/erros">Caderno de erros</a><a class="btn ghost" href="#/materia/' + T.mat + '/testes">Voltar aos testes</a>' : '<a class="btn ghost" href="#/erros">Voltar ao caderno</a>') + '</div></div>';
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-tans]'); if (a && document.getElementById('tbox')) { answer(a.getAttribute('data-tans')); return; }
    if (e.target.closest('[data-tnext]')) { next(); return; }
    if (e.target.closest('[data-trestart]') && T) { begin(T.mat, T.kind, T.kind === 'tema' ? T.key : '0'); return; }
    var d = e.target.closest('[data-edone]'); if (d) { var id = d.getAttribute('data-edone'); if (S.erros[id]) { S.erros[id].done = true; S.erros[id].due = 0; P.save(); P.render({ keep: true }); } return; }
  });
  document.addEventListener('keydown', function (e) {
    if (!T || T.done || !document.getElementById('tbox') || /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) return; var k = e.key.toUpperCase();
    if (T.cur && !T.cur.answered && k.length === 1 && 'ABCD'.indexOf(k) >= 0) answer(k);
    else if (T.cur && T.cur.answered && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')) { e.preventDefault(); next(); }
  });

  /* ---------- CADERNO DE ERROS ---------- */
  P.errosTab = function (mat) {
    var all = P.errosLista(mat), at = all.filter(function (e) { return !e.done; }), ve = P.errosVencidos(mat), dom = all.filter(function (e) { return e.done; }), tg = mat || 'all';
    return '<div class="bento" style="margin-bottom:18px"><div class="card c4"><span class="eyebrow">Ativos</span><div style="font-size:40px;font-weight:600;letter-spacing:-.04em">' + at.length + '</div><span class="tiny">erros que ainda pedem revisão</span></div><div class="card c4"><span class="eyebrow">Para rever hoje</span><div style="font-size:40px;font-weight:600;letter-spacing:-.04em">' + ve.length + '</div><span class="tiny">vencidos na escala D+1 a D+30</span></div><div class="card c4"><span class="eyebrow">Dominados</span><div style="font-size:40px;font-weight:600;letter-spacing:-.04em">' + dom.length + '</div><span class="tiny">cumpriram todas as revisões</span></div></div>' +
      '<div class="chips" style="margin-bottom:20px"><a class="btn acc" href="#/teste/' + tg + '/erros/0">' + ic('play') + (ve.length ? 'Revisar ' + Math.min(ve.length, 12) + ' agora' : 'Revisar meus erros') + '</a></div>' +
      '<p class="lead" style="margin-bottom:16px;font-size:15px">Todo erro de teste ou de simulado entra aqui sozinho. Você só sai da lista depois de acertar em D+1, D+3, D+7, D+15 e D+30. Para cada erro, volte à aula do assunto antes de refazer.</p><div id="errlist"><div class="card empty">Carregando o caderno…</div></div>';
  };
  P.fillErros = function (mat) {
    P.qsReady().then(function () { return P.loadFgv(); }).then(function () {
      var el = document.getElementById('errlist'); if (!el) return; var all = P.errosLista(mat).sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0) || (a.due || 9e15) - (b.due || 9e15); });
      if (!all.length) { el.innerHTML = '<div class="card empty">Seu caderno está vazio, e isso só quer dizer que você ainda não testou. Faça um teste por assunto para começar.</div>'; return; }
      el.innerHTML = all.map(function (e) {
        var q = P.q(e.id); if (!q) return ''; var bi = P.blocoDoTema(e.mat, e.tema), vence = e.done ? 'dominado' : (e.due <= Date.now() ? 'para rever hoje' : 'próxima revisão ' + P.fmt(P.iso(new Date(e.due))));
        return '<details class="bk"><summary><span class="n">' + (e.done ? '✓' : e.n + '×') + '</span><span class="t">' + esc(q.enun.slice(0, 120)) + '…<small>' + esc(q.materia) + ' · ' + esc(e.tema || '') + ' · ' + vence + '</small></span><span class="car">›</span></summary><div class="bd">' + P.qHtml(q, { reveal: true }) + '<div class="chips" style="margin-top:16px">' + (bi >= 0 ? '<a class="btn sm acc" href="#/aula/' + e.mat + '/' + bi + '">Reler a aula do assunto</a>' : '') + (!e.done ? '<button class="btn sm ghost" data-edone="' + e.id + '">Já domino, tirar da lista</button>' : '') + '<span class="chip">Você errou ' + e.n + ' vez(es)</span></div></div></details>';
      }).join('');
    });
  };
  V.erros = function () {
    var ve = P.errosVencidos('').length;
    return { t: 'Caderno de erros', h: '<span class="eyebrow">Revisão espaçada D+1 · D+3 · D+7 · D+15 · D+30</span><h1 style="margin:6px 0 10px">Caderno de erros</h1><p class="lead">Aqui ficam todas as questões que você errou, de todas as matérias. É o seu material mais valioso: é exatamente o que a prova vai cobrar de você.</p><div style="margin-top:22px">' + P.errosTab('') + '</div>', post: function () { P.fillErros(''); } };
  };
})();
