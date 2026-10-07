/* PETRUS · simulados: estante 2D com 10 livros. Cada livro = um simulado de 40 questoes reais da FGV (sem repeticao entre eles).
   Para abrir o livro N: estudar (N-1)x10% das aulas de CADA materia na Biblioteca e concluir o simulado anterior. */
(function () {
  var P = window.P, esc = P.esc, ic = P.ic, V = P.V, S = P.S;
  S.sim = S.sim || {}; S.simrun = S.simrun || {};
  var N = 10, PER = 40, STEP = 10;
  var HUES = [255, 200, 150, 28, 340, 270, 190, 90, 12, 232], BH = [212, 228, 200, 238, 216, 224, 206, 234, 198, 220], BW = [84, 94, 80, 98, 86, 92, 82, 96, 84, 90];
  var ORDER = ['etica', 'fil', 'const', 'dh', 'int', 'trib', 'fin', 'adm', 'amb', 'civil', 'cons', 'eca', 'emp', 'pcivil', 'penal', 'ppenal', 'trab', 'ptrab', 'prev', 'elei'];
  var qrP = null, plan = null, byId = null, nameToId = {};
  P.LIST.forEach(function (m) { nameToId[m.nome] = m.id; });

  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hashS(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function shuffle(a, seed) { var r = rng(seed), x = a.slice(); for (var i = x.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = x[i]; x[i] = x[j]; x[j] = t; } return x; }

  /* carrega as 640 questoes reais so quando preciso */
  P.loadQR = function () {
    if (window.C48_QR) return Promise.resolve(window.C48_QR); if (qrP) return qrP;
    qrP = new Promise(function (res) { var s = document.createElement('script'); s.src = 'dados/questoes-reais.js?v=2'; s.onload = function () { res(window.C48_QR); }; s.onerror = function () { res(null); }; document.head.appendChild(s); }); return qrP;
  };
  function buildPlan(Q) {
    if (plan) return plan;
    byId = {}; Q.forEach(function (q) { byId[q.id] = q; });
    var ms = P.LIST.filter(function (m) { return m.id !== 'fgv' && m.q > 0; }), tot = ms.reduce(function (a, m) { return a + m.q; }, 0), alloc = {}, rem = [], used = 0;
    ms.forEach(function (m) { var x = PER * m.q / tot; alloc[m.id] = Math.floor(x); used += alloc[m.id]; rem.push([x - Math.floor(x), m.id]); });
    rem.sort(function (a, b) { return b[0] - a[0]; }); for (var i = 0; used < PER; i++, used++) alloc[rem[i % rem.length][1]]++;
    var pools = {}; ms.forEach(function (m) { pools[m.id] = shuffle(Q.filter(function (q) { return nameToId[q.materia] === m.id && !q.anulada; }), hashS(m.id)); });
    plan = []; for (var n = 0; n < N; n++) { var qs = []; ORDER.forEach(function (id) { var a = alloc[id] || 0, pool = pools[id] || []; for (var k = 0; k < a && pool.length; k++) qs.push(pool[(n * a + k) % pool.length].id); }); plan.push(qs); }
    plan.alloc = alloc; return plan;
  }

  P.simPlan = function () { return plan; };
  /* regra de desbloqueio */
  P.simReq = function (n) {
    var T = (n - 1) * STEP, rows = [];
    P.LIST.forEach(function (m) { if (m.id === 'fgv') return; var tot = P.blocos(m.id).length; if (!tot) return; var need = Math.ceil(T / 100 * tot), have = 0; for (var i = 0; i < tot; i++) if (S.read[m.id + ':' + i]) have++; rows.push({ m: m, need: need, have: Math.min(have, tot), tot: tot, ok: have >= need }); });
    var prevOk = n === 1 || !!S.sim[n - 1], studyOk = rows.every(function (r) { return r.ok; });
    return { T: T, rows: rows, prevOk: prevOk, studyOk: studyOk, ok: prevOk && studyOk, ready: rows.filter(function (r) { return r.ok; }).length };
  };
  function status(n) { if (S.sim[n]) return 'done'; return P.simReq(n).ok ? 'open' : 'locked'; }
  function nextTarget() { for (var n = 1; n <= N; n++) if (!S.sim[n]) return n; return N; }

  /* ---------- ESTANTE ---------- */
  var plant = '<svg class="plant" viewBox="0 0 60 90" aria-hidden="true"><path d="M30 60 C26 40 14 36 8 24 C22 24 30 38 30 60Z" fill="#8FBF9A"/><path d="M30 60 C34 38 46 32 54 18 C38 20 30 36 30 60Z" fill="#6FAE80"/><path d="M30 60 C30 44 28 30 30 14 C34 30 34 44 30 60Z" fill="#A6D1AE"/><path d="M14 60h32l-4 26H18z" fill="#D9A27A"/><rect x="12" y="56" width="36" height="8" rx="3" fill="#E3B58F"/></svg>';
  V.simulados = function () {
    var sel = P.ui.simSel || nextTarget(); P.ui.simSel = sel;
    var books = function (from, to) {
      var h = ''; for (var n = from; n <= to; n++) {
        var st = status(n), r = S.sim[n], badge = st === 'done' ? '<span class="bk-badge ok">' + ic('check') + '</span>' : st === 'locked' ? '<span class="bk-badge">' + ic('lock') + '</span>' : '<span class="bk-badge go">' + ic('play') + '</span>';
        h += '<button class="book st-' + st + (n === sel ? ' sel' : '') + '" data-sim="' + n + '" style="--h:' + HUES[n - 1] + ';--bh:' + BH[n - 1] + 'px;--bw:' + BW[n - 1] + 'px" aria-label="Simulado ' + n + (st === 'locked' ? ' (bloqueado)' : '') + '"><span class="bk-top"></span><span class="bk-title">Simulado ' + n + '</span>' + badge + '<span class="bk-num">' + n + '</span>' + (r ? '<span class="bk-score">' + r.pct + '%</span>' : '') + '</button>';
      } return h;
    };
    var shelves = '<div class="estante"><div class="shelf-row">' + books(1, 5) + plant + '</div><div class="board"></div><div class="shelf-row">' + books(6, 10) + '</div><div class="board"></div></div>';
    var feitos = Object.keys(S.sim).length;
    return { t: 'Simulados', h: '<span class="eyebrow">' + N + ' simulados · questões reais da FGV (exames 40º a 47º)</span><h1 style="margin:6px 0 10px">Estante de simulados</h1><p class="lead">Cada livro é um simulado de ' + PER + ' questões diferentes, no molde da prova (ex.: 4 de Ética para cada 40). Para abrir o próximo livro você precisa ter estudado uma porcentagem de cada matéria na Biblioteca. Estudar abre a estante.</p><div class="chips" style="margin:16px 0 26px"><span class="chip">' + feitos + ' de ' + N + ' feitos</span><span class="chip">400 questões únicas</span></div>' + shelves + '<div id="simdetail" style="margin-top:30px">' + detail(sel) + '</div>', post: function () { P.loadQR(); } };
  };
  function detail(n) {
    var st = status(n), rq = P.simReq(n), r = S.sim[n], run = S.simrun[n];
    var head = '<div class="row" style="padding:0 0 16px;border:0"><div class="ic" style="--c:hsl(' + HUES[n - 1] + ' 60% 52%)">' + ic('target') + '</div><div class="grow"><h3 style="font-size:21px">Simulado ' + n + '</h3><span>' + PER + ' questões · tempo sugerido ' + P.hm(Math.round(PER * 3.75)) + (rq.T ? ' · destrava com ' + rq.T + '% de cada matéria' : ' · livre para começar') + '</span></div></div>';
    if (st === 'locked') {
      var falta = rq.rows.filter(function (x) { return !x.ok; });
      return '<div class="card">' + head + '<div class="prog" style="margin-bottom:8px"><i style="--p:' + Math.round(rq.ready * 100 / Math.max(1, rq.rows.length)) + '%"></i></div><p class="muted" style="margin-bottom:16px">' + rq.ready + ' de ' + rq.rows.length + ' matérias já atingiram ' + rq.T + '%.' + (!rq.prevOk ? ' Falta também concluir o Simulado ' + (n - 1) + '.' : '') + '</p>' +
        (falta.length ? '<span class="eyebrow">O que falta estudar</span><div class="group" style="margin-top:10px">' + falta.map(function (x) { return '<a class="row" href="#/materia/' + x.m.id + '/aulas"><div class="ic" style="--c:hsl(' + PArt.hueOf(x.m.id) + ' 55% 52%)">' + P.mic(x.m.id) + '</div><div class="grow"><b>' + esc(x.m.nome) + '</b><span>' + x.have + ' de ' + x.need + ' aula(s) necessária(s) · faltam ' + (x.need - x.have) + '</span><div class="prog" style="margin-top:8px;height:5px"><i style="--p:' + Math.round(x.have * 100 / x.need) + '%"></i></div></div><i class="go" style="font-size:20px">›</i></a>'; }).join('') + '</div>' : '') + '</div>';
    }
    var btns = '<div class="chips" style="margin-top:16px">' + (run ? '<button class="btn acc" data-simgo="' + n + '">' + ic('play') + 'Continuar (' + Object.keys(run.resp || {}).length + ' respondidas)</button><button class="btn ghost" data-simgo="' + n + '" data-fresh="1">Recomeçar</button>' : '<button class="btn acc" data-simgo="' + n + '">' + ic('play') + (r ? 'Refazer simulado' : 'Começar simulado') + '</button>') + (r ? '<a class="btn ghost" href="#/simulado/' + n + '/resultado">Ver correção</a>' : '') + '</div>';
    var res = r ? '<div class="row" style="padding:12px 0 0;border-top:1px solid var(--line)"><div class="ring" style="--p:' + r.pct + ';--s:78px"><b>' + r.pct + '%</b></div><div class="grow"><b>' + r.acertos + ' de ' + r.total + ' acertos</b><span>Nota de corte da prova real: 50% (40 de 80). Melhor resultado salvo.</span></div></div>' : '';
    return '<div class="card">' + head + res + btns + '</div>';
  }

  /* ---------- PROVA ---------- */
  var run = null, tick = 0;
  V.simulado = function (n, sub) {
    n = +n; if (!(n >= 1 && n <= N)) return { t: 'Simulado', back: '#/simulados', h: '<div class="card empty">Simulado não encontrado.</div>' };
    if (status(n) === 'locked') return { t: 'Simulado ' + n, back: '#/simulados', h: '<div class="card empty">Este livro ainda está trancado. Estude as matérias pedidas para abri-lo.</div>' };
    return { t: 'Simulado ' + n, back: '#/simulados', h: '<span class="eyebrow">Simulado ' + n + ' de ' + N + '</span><div id="simbox"><div class="card empty">Carregando as questões…</div></div>', post: function () { P.loadQR().then(function (Q) { if (!Q) { document.getElementById('simbox').innerHTML = '<div class="card empty">Não consegui carregar as questões.</div>'; return; } buildPlan(Q); start(n, sub); }); } };
  };
  function start(n, sub) {
    var box = document.getElementById('simbox'); if (!box) return;
    var qs = plan[n - 1].map(function (id) { return byId[id]; }).filter(Boolean);
    if (sub === 'resultado' && S.sim[n]) { run = { n: n, qs: qs, resp: S.sim[n].resp || {}, i: 0, t0: Date.now(), done: true }; return showResult(); }
    var saved = S.simrun[n]; run = { n: n, qs: qs, resp: (saved && saved.resp) || {}, i: (saved && saved.i) || 0, t0: Date.now() - ((saved && saved.el) || 0) * 1000, done: false };
    if (P.ui.simFresh === n) { run.resp = {}; run.i = 0; run.t0 = Date.now(); delete S.simrun[n]; P.save(); P.ui.simFresh = null; }
    clearInterval(tick); tick = setInterval(function () { var e = document.getElementById('simtime'); if (!e) { clearInterval(tick); return; } e.textContent = clock(); persist(); }, 1000);
    showQ();
  }
  function clock() { var s = Math.floor((Date.now() - run.t0) / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ':' : '') + P.pad(m) + ':' + P.pad(s % 60); }
  function persist() { if (!run || run.done) return; S.simrun[run.n] = { resp: run.resp, i: run.i, el: Math.floor((Date.now() - run.t0) / 1000) }; P.save(); }
  function showQ() {
    var box = document.getElementById('simbox'); if (!box || !run) return;
    var q = run.qs[run.i], tot = run.qs.length, ans = Object.keys(run.resp).length, mid = nameToId[q.materia];
    box.innerHTML = '<div class="card" style="margin-top:14px"><div class="row" style="padding:0 0 16px;border:0"><div class="grow"><span class="chip">' + esc(q.materia) + '</span></div><span class="chip" style="font-variant-numeric:tabular-nums">' + ic('clock') + '<span id="simtime" style="margin-left:4px">' + clock() + '</span></span></div>' +
      '<div class="prog" style="margin-bottom:10px"><i style="--p:' + Math.round((run.i + 1) * 100 / tot) + '%"></i></div><div class="tiny" style="margin-bottom:14px">Questão ' + (run.i + 1) + ' de ' + tot + ' · ' + ans + ' respondidas · ' + esc(q.exame) + ' Exame, questão ' + esc(q.num) + '</div>' +
      '<div class="prose" style="font-size:16.5px;max-width:none;margin-bottom:18px">' + P.md(q.enun) + '</div><div style="display:grid;gap:10px">' + ['A', 'B', 'C', 'D'].map(function (L) { return '<button class="qopt' + (run.resp[q.id] === L ? ' sel' : '') + '" data-ans="' + L + '"><b>' + L + '</b><span>' + esc(q.alts[L] || '') + '</span></button>'; }).join('') + '</div>' +
      '<div class="chips" style="margin-top:22px;justify-content:space-between"><div class="chips"><button class="btn ghost sm" data-nav="-1"' + (run.i === 0 ? ' disabled style="opacity:.4"' : '') + '>Anterior</button><button class="btn sm" data-nav="1"' + (run.i === tot - 1 ? ' disabled style="opacity:.4"' : '') + '>Próxima</button></div><button class="btn acc sm" data-finish="1">Finalizar simulado</button></div></div>' +
      '<div class="card flat" style="margin-top:16px"><span class="eyebrow">Mapa das questões</span><div class="qmap" style="margin-top:10px">' + run.qs.map(function (x, i) { return '<button class="qd' + (run.resp[x.id] ? ' a' : '') + (i === run.i ? ' c' : '') + '" data-goq="' + i + '">' + (i + 1) + '</button>'; }).join('') + '</div></div>';
  }
  function showResult() {
    var box = document.getElementById('simbox'); if (!box || !run) return; clearInterval(tick);
    var acertos = 0, por = {}, errs = [], fresh = !run.done;
    run.qs.forEach(function (q) { var id = nameToId[q.materia], ok = run.resp[q.id] === q.gab; por[id] = por[id] || { a: 0, t: 0 }; por[id].t++; if (ok) { acertos++; por[id].a++; } else errs.push(q); if (fresh && P.registrar && run.resp[q.id] !== undefined) P.registrar(q, ok, { tema: P.temaDaQuestao ? P.temaDaQuestao(q) : '', resp: run.resp[q.id] }); else if (fresh && P.registrar && !ok) P.registrar(q, false, { tema: P.temaDaQuestao ? P.temaDaQuestao(q) : '', resp: '' }); });
    var tot = run.qs.length, pct = Math.round(acertos * 100 / tot);
    if (!run.done || !S.sim[run.n] || acertos >= S.sim[run.n].acertos) { S.sim[run.n] = { acertos: acertos, total: tot, pct: pct, resp: run.resp, ts: Date.now(), tempo: Math.floor((Date.now() - run.t0) / 1000) }; delete S.simrun[run.n]; P.save(); }
    run.done = true; var nx = run.n < N ? P.simReq(run.n + 1) : null;
    box.innerHTML = '<div class="card" style="margin-top:14px"><div class="row" style="padding:0 0 18px;border:0"><div class="ring" style="--p:' + pct + ';--s:96px"><b>' + pct + '%</b></div><div class="grow"><h3 style="font-size:22px">' + acertos + ' de ' + tot + ' acertos</h3><span>' + (pct >= 50 ? 'Acima da nota de corte da prova real (50%). Continue assim.' : 'Abaixo da nota de corte (50%). A correção abaixo mostra onde estudar.') + '</span></div></div>' +
      '<div class="chips"><a class="btn" href="#/simulados">Voltar à estante</a><button class="btn ghost" data-simgo="' + run.n + '" data-fresh="1">Refazer</button></div></div>' +
      (nx && run.n < N ? '<div class="card tint" style="--t:#E8F0FF;margin-top:16px"><h3 style="font-size:18px">Próximo livro: Simulado ' + (run.n + 1) + '</h3><p style="margin-top:6px;font-size:14.5px">' + (nx.ok ? 'Já está liberado na estante.' : 'Para abrir, estude ' + nx.T + '% de cada matéria: faltam ' + nx.rows.filter(function (r) { return !r.ok; }).length + ' matéria(s).') + '</p></div>' : '') +
      '<div class="sec"><h2>Seu desempenho por matéria</h2></div><div class="group">' + Object.keys(por).sort(function (a, b) { return por[a].a / por[a].t - por[b].a / por[b].t; }).map(function (id) { var p = por[id], m = P.mat(id); return '<a class="row" href="#/materia/' + id + '"><div class="ic" style="--c:hsl(' + PArt.hueOf(id) + ' 55% 52%)">' + P.mic(id) + '</div><div class="grow"><b>' + esc(m ? m.nome : id) + '</b><span>' + p.a + ' de ' + p.t + ' acertos</span><div class="prog" style="margin-top:8px;height:5px"><i style="--p:' + Math.round(p.a * 100 / p.t) + '%"></i></div></div><i class="go" style="font-size:20px">›</i></a>'; }).join('') + '</div>' +
      (errs.length ? '<div class="sec"><h2>Correção das questões erradas (' + errs.length + ')</h2></div>' + errs.map(function (q) { var id = nameToId[q.materia]; return '<details class="bk"><summary><span class="n">' + esc(q.num) + '</span><span class="t">' + esc(q.enun.slice(0, 110)) + '…<small>' + esc(q.materia) + ' · ' + esc(q.exame) + ' Exame</small></span><span class="car">›</span></summary><div class="bd"><div class="prose" style="font-size:15.5px">' + P.md(q.enun) + '</div><div style="display:grid;gap:8px;margin-top:12px">' + ['A', 'B', 'C', 'D'].map(function (L) { var cls = L === q.gab ? ' right' : (run.resp[q.id] === L ? ' wrong' : ''); return '<div class="qopt' + cls + '"><b>' + L + '</b><span>' + esc(q.alts[L] || '') + '</span></div>'; }).join('') + '</div><div class="chips" style="margin-top:14px"><span class="chip">Gabarito: ' + esc(q.gab) + '</span><span class="chip">Você marcou: ' + esc(run.resp[q.id] || 'em branco') + '</span><a class="btn sm acc" href="#/materia/' + id + '/aulas">Estudar ' + esc(q.materia) + '</a></div></div></details>'; }).join('') : '<div class="card flat" style="margin-top:16px">Nenhum erro. Excelente!</div>');
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sim]');
    if (b) { var n = +b.getAttribute('data-sim'); P.ui.simSel = n; if (status(n) === 'locked') { P.render({ keep: true }); var d = document.getElementById('simdetail'); if (d) d.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else { P.render({ keep: true }); var d2 = document.getElementById('simdetail'); if (d2) d2.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
    var g = e.target.closest('[data-simgo]');
    if (g) { var gn = +g.getAttribute('data-simgo'), tgt = '#/simulado/' + gn; if (g.getAttribute('data-fresh')) P.ui.simFresh = gn; if (location.hash === tgt) P.render(); else location.hash = tgt; return; }
    if (!run || !document.getElementById('simbox')) return;
    var a = e.target.closest('[data-ans]'); if (a) { var q = run.qs[run.i]; run.resp[q.id] = a.getAttribute('data-ans'); persist(); showQ(); return; }
    var nv = e.target.closest('[data-nav]'); if (nv) { run.i = Math.max(0, Math.min(run.qs.length - 1, run.i + (+nv.getAttribute('data-nav')))); persist(); showQ(); window.scrollTo({ top: 0 }); return; }
    var gq = e.target.closest('[data-goq]'); if (gq) { run.i = +gq.getAttribute('data-goq'); persist(); showQ(); window.scrollTo({ top: 0 }); return; }
    var f = e.target.closest('[data-finish]'); if (f) { var un = run.qs.length - Object.keys(run.resp).length; if (un && !f.getAttribute('data-sure')) { f.setAttribute('data-sure', '1'); f.textContent = un + ' em branco. Finalizar mesmo?'; setTimeout(function () { if (f) { f.removeAttribute('data-sure'); f.textContent = 'Finalizar simulado'; } }, 4000); return; } showResult(); window.scrollTo({ top: 0 }); }
  });
  document.addEventListener('keydown', function (e) {
    if (!run || run.done || !document.getElementById('simbox') || /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) return;
    var k = e.key.toUpperCase();
    if ('ABCD'.indexOf(k) >= 0 && k.length === 1) { run.resp[run.qs[run.i].id] = k; persist(); showQ(); }
    else if (e.key === 'ArrowRight' && run.i < run.qs.length - 1) { run.i++; persist(); showQ(); }
    else if (e.key === 'ArrowLeft' && run.i > 0) { run.i--; persist(); showQ(); }
  });
})();
