/* PETRUS · ensino: o interior dos livros. Cada materia tem Aulas (teoria por conteudo + casos reais + lei seca), Testes por assunto,
   Caderno de erros (revisao espacada D+1, D+3, D+7, D+15, D+30) e Dicas. Tudo vem do banco do Petrus: curso, regras conferidas,
   questoes reais da FGV (exames 40 a 47) e leis. Metodo: caso, regra, pegadinha (o que a banca trocou), fixacao, exercicio. */
(function () {
  var P = window.P, esc = P.esc, ic = P.ic, V = P.V, S = P.S;
  S.erros = S.erros || {}; S.rd = S.rd || {}; S.tstat = S.tstat || {};
  var DAYS = [1, 3, 7, 15, 30], DAY = 864e5;
  var nameToId = {}; P.LIST.forEach(function (m) { nameToId[m.nome] = m.id; });
  P.matDe = function (q) { return nameToId[q.materia]; };

  /* ---------- texto: tokens para casar regras e questoes com os temas ---------- */
  var STOP = 'para como mais pela pelo pelas pelos entre sobre sendo seus suas desse dessa esta este essa isso quando onde qual quais cada todo toda todos todas apenas ainda tambem deve devem pode podem sera serao nao sem com uma uns umas dos das nos nas aos'.split(' ');
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' '); }
  function toks(s) { var o = {}; norm(s).split(/\s+/).forEach(function (w) { if (w.length > 3 && STOP.indexOf(w) < 0) o[w] = 1; }); return o; }
  function overlap(a, b) { var n = 0; for (var k in a) if (b[k]) n++; return n; }

  /* ---------- questoes reais (carregadas sob demanda) ---------- */
  var qmap = null;
  P.qsReady = function () {
    return P.loadQR().then(function (Q) { if (!Q) return null; if (!qmap) { qmap = {}; Q.forEach(function (q) { qmap[q.id] = q; }); } return qmap; });
  };
  P.q = function (id) { return qmap && qmap[id]; };
  P.loadFgv = function () {
    if (window.C48_FGV) return Promise.resolve(window.C48_FGV);
    return new Promise(function (res) { var s = document.createElement('script'); s.src = 'dados/fgv.js'; s.onload = function () { res(window.C48_FGV); }; s.onerror = function () { res(null); }; document.head.appendChild(s); });
  };
  P.temaDoBloco = function (mat, i) { var b = P.blocos(mat)[i]; if (!b || !b.tema) return null; return P.temas(mat).find(function (t) { return t.t === b.tema; }) || null; };
  P.temaDaQuestao = function (q) { var mat = P.matDe(q), t = P.temas(mat).find(function (x) { return x.ids.indexOf(q.id) >= 0; }); return t ? t.t : ''; };
  P.blocoDoTema = function (mat, temaT) { var bl = P.blocos(mat); for (var i = 0; i < bl.length; i++) if (bl[i].tema === temaT) return i; return -1; };

  /* ---------- regras do banco que explicam cada aula ---------- */
  var rcache = {};
  P.regrasDoBloco = function (mat, i) {
    var k = mat + ':' + i; if (rcache[k]) return rcache[k];
    var b = P.blocos(mat)[i], out = []; if (!b) return (rcache[k] = out);
    var prim = toks((b.tema || '') + ' ' + (b.t || '')), sec = toks(b.x);
    P.regras(mat).forEach(function (r) { var tt = toks(r.t), ee = toks(r.e), sc = overlap(tt, prim) * 3 + overlap(tt, sec) + overlap(ee, prim); if (sc >= 4) out.push({ r: r, sc: sc }); });
    out.sort(function (a, b2) { return b2.sc - a.sc; }); return (rcache[k] = out.slice(0, 6).map(function (x) { return x.r; }));
  };
  P.regraDaQuestao = function (q) {
    var mat = P.matDe(q); if (!mat) return null; var qt = toks(q.enun + ' ' + (q.alts[q.gab] || '')), best = null, bs = 0;
    P.regras(mat).forEach(function (r) { var sc = overlap(toks(r.t), qt) * 2 + overlap(toks(r.e), qt); if (sc > bs) { bs = sc; best = r; } });
    return bs >= 5 ? best : null;
  };

  /* ---------- lei seca: artigos citados nas regras viram atalhos para o Vade Mecum ---------- */
  var LAWMAP = { 'CF': 'cf', 'CLT': 'clt', 'CPC': 'cpc', 'CC': 'cc', 'CP': 'cp', 'CTN': 'ctn', 'CPP': 'cpp', 'ECA': 'eca', 'CDC': 'cdc', 'LEP': 'l7210', 'CED': 'ced', 'LINDB': 'lindb', 'RG': 'regulamento', 'EOAB': 'estatuto' };
  var haveLaw = {}; P.LEIS.forEach(function (l) { haveLaw[l.id] = l; });
  P.leiRefs = function (b) {
    var out = [], seen = {};
    String(b || '').split(/;|\s\+\s/).forEach(function (seg) {
      var id = null, m = seg.match(/Lei(?: Complementar| Federal)?\s*(?:n[ºo.]*\s*)?(\d{1,2}(?:\.\d{3})?)\/(\d{2,4})/i);
      if (m) { var num = m[1].replace(/\./g, ''); id = (/Complementar/i.test(seg) ? 'lc' : 'l') + num; if (num === '8906') id = 'estatuto'; }
      else { var m2 = seg.match(/\b(CF|CLT|CPC|CC|CP|CTN|CPP|ECA|CDC|LEP|CED|LINDB|RG)\b/); if (m2) id = LAWMAP[m2[1]]; }
      if (!id || !haveLaw[id]) return;
      var am = seg.match(/arts?\.?\s*([^;]*)/i); if (!am) return;
      (am[1].match(/\d+(?:º|°)?(?:-[A-Z])?/g) || []).slice(0, 4).forEach(function (a) { var an = a.replace(/[º°]/g, ''), key = id + '/' + an; if (!seen[key]) { seen[key] = 1; out.push({ id: id, art: an, label: (haveLaw[id].curto || id) + ' art. ' + a }); } });
    });
    return out;
  };
  function leiSeca(mat, i, rs) {
    var refs = [], seen = {}; rs.forEach(function (r) { P.leiRefs(r.b).forEach(function (x) { var k = x.id + x.art; if (!seen[k]) { seen[k] = 1; refs.push(x); } }); });
    refs = refs.slice(0, 10); if (!refs.length) return '';
    return '<div class="lsec"><span class="eyebrow">LEI SECA · vale a leitura</span><div class="chips" style="margin-top:8px">' + refs.map(function (x) { return '<a class="chip lei" href="#/vade/' + x.id + '/' + x.art + '">' + ic('law') + esc(x.label) + '</a>'; }).join('') + '</div></div>';
  }

  /* ---------- caderno de erros + revisao espacada ---------- */
  P.registrar = function (q, ok, opts) {
    opts = opts || {}; var mat = P.matDe(q), tema = (opts.tema || ''), now = Date.now(), k = q.id, e = S.erros[k];
    if (!opts.reforco) { var ts = S.tstat[mat + '|' + tema] = S.tstat[mat + '|' + tema] || { a: 0, t: 0 }; ts.t++; if (ok) ts.a++; }
    if (!ok) {
      if (!e) e = S.erros[k] = { mat: mat, tema: tema, n: 0, first: now, step: 0, streak: 0 };
      e.n++; e.step = 0; e.streak = 0; e.last = now; e.due = now + DAY * DAYS[0]; e.resp = opts.resp || ''; e.done = false;
      P.save(); return 'novo';
    }
    if (e && !e.done && (e.due || 0) <= now + 3600e3) { e.streak++; e.step++; e.last = now; if (e.step >= DAYS.length) { e.done = true; e.due = 0; } else e.due = now + DAY * DAYS[e.step]; P.save(); return e.done ? 'dominado' : 'avancou'; }
    P.save(); return 'ok';
  };
  P.errosLista = function (mat) { var out = []; Object.keys(S.erros).forEach(function (id) { var e = S.erros[id]; if (!mat || e.mat === mat) out.push(Object.assign({ id: id }, e)); }); return out; };
  P.errosVencidos = function (mat) { var now = Date.now(); return P.errosLista(mat).filter(function (e) { return !e.done && (e.due || 0) <= now; }); };
  P.errosAtivos = function (mat) { return P.errosLista(mat).filter(function (e) { return !e.done; }); };

  /* revisao espacada das aulas estudadas */
  P.marcaLida = function (mat, i, on) {
    var k = mat + ':' + i; if (on) { S.read[k] = 1; S.rd[k] = S.rd[k] || { ts: Date.now(), step: 0 }; } else { delete S.read[k]; delete S.rd[k]; } P.save();
  };
  P.revisoesVencidas = function () {
    var now = Date.now(), out = []; Object.keys(S.rd).forEach(function (k) { var r = S.rd[k]; if (r.step >= DAYS.length) return; var due = r.ts + DAY * DAYS[r.step]; if (due <= now) { var p = k.split(':'); out.push({ mat: p[0], i: +p[1], key: k, step: r.step, due: due }); } });
    return out.sort(function (a, b) { return a.due - b.due; });
  };
  P.revisou = function (k) { var r = S.rd[k]; if (!r) return; r.step++; r.ts = r.step >= DAYS.length ? r.ts : r.ts; P.save(); };
  P.nextRev = function (k) { var r = S.rd[k]; if (!r || r.step >= DAYS.length) return null; return r.ts + DAY * DAYS[r.step]; };

  /* edital verticalizado: ✅ consolidado · 🟡 estudado, precisa revisar · ⬜ ainda nao estudado */
  P.statusBloco = function (mat, i) {
    if (!P.isRead(mat, i)) return 'nao';
    var te = P.temaDoBloco(mat, i); if (!te) return 'ok';
    var ts = S.tstat[mat + '|' + te.t], pend = P.errosAtivos(mat).some(function (e) { return e.tema === te.t; });
    if (!ts || ts.t < 3) return 'rev'; if (pend || ts.a / ts.t < 0.7) return 'rev'; return 'ok';
  };
  var ST = { ok: ['✅', 'Consolidado'], rev: ['🟡', 'Revisar'], nao: ['⬜', 'Não estudado'] };
  P.stIcon = function (s) { return ST[s]; };

  /* ---------- gabarito comentado ---------- */
  P.explicacao = function (q) {
    var mat = P.matDe(q), F = window.C48_FGV, c = F && F[mat] && F[mat].q && F[mat].q[q.id] && F[mat].q[q.id].c, r = P.regraDaQuestao(q), gabTxt = q.alts[q.gab] || '';
    if (!c && window.C48_COM) c = window.C48_COM[q.id];
    return { comentario: c || '', regra: r, gabarito: gabTxt };
  };
  function qHtml(q, o) {
    o = o || {}; var ex = P.explicacao(q);
    return '<div class="qcase"><div class="tiny" style="margin-bottom:8px">' + esc(q.exame) + ' Exame de Ordem · ' + esc(q.materia) + ' · questão ' + esc(q.num) + '</div><div class="prose" style="font-size:15.5px;max-width:none">' + P.md(q.enun) + '</div>' +
      '<div style="display:grid;gap:8px;margin-top:12px">' + ['A', 'B', 'C', 'D'].map(function (L) { return '<div class="qopt' + (o.reveal && L === q.gab ? ' right' : '') + '"><b>' + L + '</b><span>' + esc(q.alts[L] || '') + '</span></div>'; }).join('') + '</div>' +
      (o.reveal ? '<div class="co co-go" style="margin-top:14px"><span class="cl">Gabarito ' + esc(q.gab) + (q.anulada ? ' (anulada)' : '') + '</span><p>' + (ex.comentario ? esc(ex.comentario) : 'Alternativa ' + esc(q.gab) + ': ' + esc(ex.gabarito)) + '</p></div>' + (ex.regra ? '<div class="co"><span class="cl">A regra por trás</span><p><b>' + esc(ex.regra.t) + '.</b> ' + esc(ex.regra.e.length > 420 ? ex.regra.e.slice(0, 417) + '…' : ex.regra.e) + (ex.regra.b ? '<br><span class="tiny">' + esc(ex.regra.b) + '</span>' : '') + '</p></div>' : '') : '') + '</div>';
  }
  P.qHtml = qHtml;

  /* ---------- MATERIA: Aulas, Testes, Erros, Dicas, Notas ---------- */
  V.materia = function (id, tab, idx) {
    var m = P.mat(id); if (!m) return { t: 'Matéria', h: '<div class="card empty">Matéria não encontrada.</div>', back: '#/biblioteca' };
    tab = tab || 'aulas'; var bl = P.blocos(id), cu = P.CUR[id] || {}, reg = P.regras(id), temas = P.temas(id), er = P.errosAtivos(id);
    var nota = m.nota, notaTxt = nota == null || nota < 0 ? 'sem diagnóstico' : nota + ' de ' + (m.q || '?') + ' no diagnóstico';
    var nLidas = bl.filter(function (b, i) { return P.isRead(id, i); }).length;
    var plano = '<div class="glassb" style="margin-top:6px;max-width:560px;font-size:14.5px;line-height:1.5"><b>Plano do Petrus para o Lucas</b><br>' + (m.q ? 'Cai <b>' + m.q + '</b> questão(ões) na prova. ' : 'É a base para ler a prova. ') + 'Seu ponto de partida: ' + notaTxt + '. Estude de <b>' + P.fmt(m.ini) + '</b> a <b>' + P.fmt(m.fim) + '</b>, mínimo de <b>' + P.hm(m.minMinimo || m.minTotal) + '</b>' + (m.ess ? ', começando pelas ' + m.ess + ' aulas essenciais' : '') + '.</div>';
    var hero = '<section class="scene" style="min-height:clamp(250px,34vh,340px);view-transition-name:matcard">' + PArt.scene({ hue: PArt.hueOf(id), seed: 21 + id.length, kind: PArt.kindOf(id), figure: true }) + '<div class="in"><span class="eyebrow" style="color:rgba(255,255,255,.85)">' + (m.q ? m.q + ' questão(ões) na prova' : 'Curso do Petrus') + ' · ' + P.matProg(id) + '% estudado</span><h1 style="font-size:clamp(28px,4vw,46px)">' + esc(m.nome) + '</h1>' + plano + '</div></section>';
    var tabs = [['aulas', 'Aulas', bl.length], ['testes', 'Testes', temas.length], ['erros', 'Caderno de erros', er.length], ['dicas', 'Dicas', reg.length], ['notas', 'Notas', P.S.notes.filter(function (n) { return n.mat === id; }).length]];
    var seg = '<div style="margin:22px 0 20px;position:sticky;top:78px;z-index:30"><div class="seg" style="box-shadow:var(--shadow)">' + tabs.map(function (x) { return '<button class="' + (tab === x[0] ? 'on' : '') + '" data-act="mtab" data-id="' + id + '" data-tab="' + x[0] + '">' + x[1] + ' <span class="tiny">' + x[2] + '</span></button>'; }).join('') + '</div></div>';
    var body = '', post = null;
    if (tab === 'aulas') { body = P.aulasIndice(id, m, bl, cu); }
    else if (tab === 'testes') body = testesTab(id, m, temas);
    else if (tab === 'erros') { body = P.errosTab(id); post = function () { P.fillErros(id); }; }
    else if (tab === 'dicas') {
      var ks = ['todas'].concat(Object.keys(P.kinds).filter(function (k) { return reg.some(function (r) { return r.k === k; }); })), cur = P.ui.tipoDica; if (ks.indexOf(cur) < 0) cur = 'todas';
      var list = reg.filter(function (r) { return cur === 'todas' || r.k === cur; });
      body = '<div class="chips" style="margin-bottom:18px">' + ks.map(function (k) { return '<button class="chip' + (k === cur ? ' fill' : '') + '" data-act="tipf" data-id="' + id + '" data-k="' + k + '">' + (k === 'todas' ? 'Todas (' + reg.length + ')' : P.kinds[k][0]) + '</button>'; }).join('') + '</div><div class="grid2" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">' + list.map(function (r) { var kk = P.kinds[r.k] || ['Dica', 'kreg']; return '<div class="tip"><span class="kbadge ' + kk[1] + '">' + kk[0] + '</span><h4>' + esc(r.t) + '</h4><p>' + esc(r.e) + '</p>' + (r.o ? '<p style="color:var(--ink)"><b>Contraponto:</b> ' + esc(r.o) + '</p>' : '') + leiChips(r.b) + '<span class="src">' + esc(r.b || '') + (r.x ? ' · ' + esc(r.x) : '') + '</span></div>'; }).join('') + '</div>';
    } else { var ns = P.S.notes.filter(function (n) { return n.mat === id; }); body = P.noteComposer(id) + ns.map(P.noteHtml).join(''); }
    return { t: m.nome, h: hero + seg + '<div class="view-body">' + body + '</div>', back: '#/biblioteca', post: function () { if (post) post(); } };
  };
  function leiChips(b) { var refs = P.leiRefs(b).slice(0, 4); return refs.length ? '<div class="chips">' + refs.map(function (x) { return '<a class="chip lei" href="#/vade/' + x.id + '/' + x.art + '">' + ic('law') + esc(x.label) + '</a>'; }).join('') + '</div>' : ''; }

  /* ----- aba Aulas: teoria por conteudo + caso real + lei seca + teste do assunto ----- */
  function aulasTab(id, m, bl, cu, idx) {
    var cnt = { ok: 0, rev: 0, nao: 0 }; bl.forEach(function (b, i) { cnt[P.statusBloco(id, i)]++; });
    var resumo = '<div class="card flat" style="margin-bottom:18px"><div class="row" style="padding:0;border:0"><div class="grow"><b>Edital verticalizado desta matéria</b><span>✅ consolidado: ' + cnt.ok + ' · 🟡 estudado, precisa revisar: ' + cnt.rev + ' · ⬜ ainda não estudado: ' + cnt.nao + '</span></div><div class="ring" style="--p:' + P.matProg(id) + ';--s:64px"><b style="font-size:15px">' + P.matProg(id) + '%</b></div></div></div>';
    var intro = cu.intro ? '<div class="card" style="margin-bottom:18px"><span class="eyebrow">Abertura da matéria</span><div class="prose" style="margin-top:8px">' + P.md(cu.intro) + '</div></div>' : '';
    var vencidas = P.revisoesVencidas().filter(function (x) { return x.mat === id; });
    var revBanner = vencidas.length ? '<div class="card tint" style="--t:#FFF1D6;margin-bottom:18px"><b>Revisões vencendo nesta matéria: ' + vencidas.length + '</b><p style="margin-top:4px;font-size:14px">Abra a aula marcada com 🔁 e responda o teste do assunto: revisão não é reler, é testar.</p></div>' : '';
    var list = bl.map(function (b, i) {
      var st = P.statusBloco(id, i), s = ST[st], rd = P.isRead(id, i), te = P.temaDoBloco(id, i), rs = P.regrasDoBloco(id, i), due = vencidas.some(function (x) { return x.i === i; }), nr = P.nextRev(id + ':' + i);
      var sub = (te ? te.n + ' questões em ' + (te.ex || []).length + ' provas' : 'abertura') + (nr ? ' · próxima revisão ' + P.fmt(P.iso(new Date(nr))) : '');
      var pegs = rs.filter(function (r) { return r.k === 'pegadinha' || r.k === 'padrao'; }).slice(0, 3), outras = rs.filter(function (r) { return pegs.indexOf(r) < 0; }).slice(0, 3);
      var rBlock = function (arr, titulo, cls) { return arr.length ? '<div class="bkbox"><span class="eyebrow">' + titulo + '</span>' + arr.map(function (r) { return '<div class="rg"><b>' + esc(r.t) + '</b><p>' + esc(r.e.length > 380 ? r.e.slice(0, 377) + '…' : r.e) + '</p>' + (r.o ? '<p class="pg"><b>O que a banca troca:</b> ' + esc(r.o) + '</p>' : '') + '</div>'; }).join('') + '</div>' : ''; };
      var teste = te ? '<div class="bkbox" data-ex="' + id + ':' + i + '"><span class="eyebrow">Caso real da prova</span><div class="exh tiny">Carregando exemplos…</div></div><div class="chips" style="margin-top:16px"><a class="btn acc sm" href="#/teste/' + id + '/tema/' + P.temas(id).indexOf(te) + '">' + ic('target') + 'Testar este assunto (' + Math.min(te.ids.length, 6) + ' questões reais)</a><button class="btn sm ' + (rd ? 'ghost' : '') + '" data-act="read" data-id="' + id + '" data-i="' + i + '">' + (rd ? 'Marcar como não lida' : 'Marcar como estudada') + '</button></div>' : '<div class="chips" style="margin-top:16px"><button class="btn sm ' + (rd ? 'ghost' : '') + '" data-act="read" data-id="' + id + '" data-i="' + i + '">' + (rd ? 'Marcar como não lida' : 'Marcar como estudada') + '</button></div>';
      return '<details class="bk" id="bk' + i + '"' + (idx != null && +idx === i ? ' open' : '') + '><summary><span class="n" title="' + s[1] + '">' + s[0] + '</span><span class="t">' + (due ? '🔁 ' : '') + esc(b.t) + '<small>' + esc(sub) + '</small></span><span class="car">›</span></summary><div class="bd">' +
        '<div class="pre"><span class="eyebrow">Antes de ler, pense</span><p>' + (te ? 'Esse assunto caiu em <b>' + te.n + ' questões</b> nas provas ' + (te.ex || []).join(', ') + '. Qual instituto a banca quer ver aqui e o que ela costuma trocar? Leia a teoria com essa pergunta na cabeça.' : 'Leia como mapa: ele organiza o que vem nas próximas aulas.') + '</p></div>' +
        '<span class="eyebrow">Teoria</span><div class="prose" style="margin-top:6px">' + P.md(b.x) + '</div>' + rBlock(pegs, 'Pegadinhas da FGV neste assunto') + rBlock(outras, 'Regras do banco do Petrus (conferidas na lei)') + leiSeca(id, i, rs) + teste + '</div></details>';
    }).join('');
    return { h: revBanner + resumo + intro + (list || '<div class="card empty">Esta matéria ainda não tem aulas escritas.</div>'), post: function () {
      P.qsReady().then(function () { return P.loadFgv(); }).then(function () {
        P.$$('[data-ex]').forEach(function (el) {
          var k = el.getAttribute('data-ex').split(':'), te = P.temaDoBloco(k[0], +k[1]); if (!te) return;
          var qs = te.ids.map(function (qid) { return P.q(qid); }).filter(function (q) { return q && !q.anulada; }).sort(function (a, b2) { return parseInt(b2.exame) - parseInt(a.exame); }).slice(0, 2);
          var h = P.$('.exh', el); if (h) h.outerHTML = qs.length ? qs.map(function (q, n) { return '<details class="qex"><summary>' + (n === 0 ? 'Caso 1' : 'Caso 2') + ' · ' + esc(q.exame) + ' Exame, questão ' + esc(q.num) + ' <span class="tiny">(toque para ver a questão e o gabarito)</span></summary>' + qHtml(q, { reveal: true }) + '</details>'; }).join('') : '<p class="muted">Ainda sem caso real ligado a este assunto.</p>';
        });
      });
      if (idx != null) { var e = document.getElementById('bk' + idx); if (e) setTimeout(function () { e.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80); }
    } };
  }

  /* ----- aba Testes: por assunto, bateria rapida e o que mais cai ----- */
  function testesTab(id, m, temas) {
    var max = temas.length ? temas[0].n : 1, er = P.errosVencidos(id);
    var top = '<div class="bento" style="margin-bottom:6px"><a class="card tap c6" href="#/teste/' + id + '/bateria/0" style="padding:24px"><span class="eyebrow">Prova rápida</span><h3 style="margin:8px 0 6px;font-size:20px">Bateria de 10 questões</h3><p class="muted" style="font-size:14px">Mistura os assuntos da matéria, com mais peso nos que mais caem e nos que você já errou.</p><span class="btn sm" style="margin-top:14px">' + ic('play') + 'Começar</span></a>' +
      '<a class="card tap c6" href="#/teste/' + id + '/erros/0" style="padding:24px"><span class="eyebrow">Revisão dos erros</span><h3 style="margin:8px 0 6px;font-size:20px">' + er.length + ' erro(s) para rever hoje</h3><p class="muted" style="font-size:14px">Perguntas que você errou voltam em D+1, D+3, D+7, D+15 e D+30.</p><span class="btn sm ghost" style="margin-top:14px">' + ic('play') + 'Revisar</span></a></div>';
    var list = '<div class="sec"><h2>Teste por assunto</h2><span class="tiny">Ordenado pelo que mais cai na FGV</span></div><div class="group">' + temas.map(function (t, k) {
      var ts = S.tstat[id + '|' + t.t], pct = ts && ts.t ? Math.round(ts.a * 100 / ts.t) : null, bi = P.blocoDoTema(id, t.t);
      return '<a class="row" href="#/teste/' + id + '/tema/' + k + '"><div class="grow"><b>' + esc(t.t) + '</b><span>' + t.n + ' questões reais · ' + (t.ex || []).length + ' provas' + (pct != null ? ' · seu acerto: ' + pct + '%' : ' · ainda não testado') + (bi < 0 ? ' · sem aula escrita' : '') + '</span><div class="prog" style="margin-top:8px;height:5px"><i style="--p:' + Math.round(t.n * 100 / max) + '%"></i></div></div><span class="chip">' + ic('play') + 'Testar</span></a>';
    }).join('') + '</div>';
    return top + list;
  }
})();
