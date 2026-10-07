/* PETRUS · telas. Cada tela devolve {t: titulo, h: html, back: rota de volta, post: funcao apos montar}. */
(function () {
  var P = window.P, esc = P.esc, ic = P.ic, V = P.V = {};
  P.ui = P.ui || { lib: 'todas', cal: null, vade: '', tipoDica: 'todas' };
  var DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  var taskHref = function (t) { var i = parseInt(String(t.key).split(':')[1], 10); return '#/aula/' + t.mat + '/' + (isNaN(i) ? 0 : i); };
  var arrow = '<i class="go">›</i>';
  function matName(id) { var m = P.mat(id); return m ? m.nome : id; }
  /* capa minimalista de materia: cartao branco, icone de linha fina, titulo e progresso */
  function coverHtml(m, extra, cls) {
    var q = m.q ? m.q + (m.q > 1 ? ' questões' : ' questão') + ' na prova' : 'Método de estudo';
    var lines = '<i></i><i></i><i></i><i></i><i></i>';
    return '<a class="folder ' + (cls || '') + '" href="#/materia/' + m.id + '" data-folder="1" style="--h:' + PArt.hueOf(m.id) + '"><span class="fd-back"></span><span class="fd-sheet s1">' + lines + '</span><span class="fd-sheet s2">' + lines + '</span><span class="fd-sheet s3">' + lines + '</span>' +
      '<span class="fd-front"><span class="cv-ic">' + P.mic(m.id) + '</span>' + (extra ? '<span class="chip fd-chip">' + extra + '</span>' : '') + '<h3>' + esc(m.nome) + '</h3><span class="cv-meta">' + q + ' · ' + P.blocos(m.id).length + ' aulas</span><span class="prog"><i style="--p:' + P.matProg(m.id) + '%"></i></span><span class="cv-go">' + P.matProg(m.id) + '% estudado</span></span></a>';
  }
  function sec(t, more) { return '<div class="sec"><h2>' + t + '</h2>' + (more || '') + '</div>'; }

  /* ---------- INICIO ---------- */
  V.inicio = function () {
    var t = P.today(), foco = P.diaFoco(), adiante = foco !== t, d = P.dia(foco), h = new Date().getHours();
    var greet = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite', dias = P.daysTo(P.CFG.prova), cnt = P.doneCount(foco);
    var next = d && d.tarefas.find(function (x) { return !P.isDone(foco, x); });
    var cur = P.matAtual(foco), fase = (P.CFG.fases || []).find(function (f) { return f.ini <= foco && foco <= f.fim; }), dica = P.dicaProva(), peg = P.pegadinhaDia();
    var tipoCnt = { novo: 0, rev: 0, bateria: 0, outros: 0 };
    if (d) d.tarefas.forEach(function (x) { if (x.k === 'novo') tipoCnt.novo++; else if (x.k === 'rev' || x.k === 'revgeral') tipoCnt.rev++; else if (x.k === 'bateria') tipoCnt.bateria++; else tipoCnt.outros++; });

    /* 1. abertura enxuta */
    var hero = '<section class="scene" style="min-height:clamp(250px,34vh,330px)">' + PArt.scene({ hue: 258, seed: 5, kind: 0, figure: true }) +
      '<div class="in" style="gap:10px"><span class="eyebrow" style="color:rgba(255,255,255,.82)">48º Exame de Ordem · 10/01/2027</span><h1>' + greet + ', Lucas.</h1>' +
      '<p class="lead" style="max-width:46ch">' + (d ? (adiante ? 'Seu cronograma começa ' + esc(P.fmt(foco, { weekday: 'long', day: 'numeric', month: 'long' })) + '. Dá para adiantar a Aula 0 hoje.' : 'Hoje são ' + d.tarefas.length + ' tarefas, ' + P.hm(d.min) + ' de estudo, na janela ' + esc(d.janela) + '.') : 'Sem tarefas no cronograma agora. Revise as dicas.') + '</p></div>' +
      '<div class="glassb" style="position:absolute;right:clamp(18px,3vw,34px);bottom:clamp(18px,3vw,34px);text-align:center"><div style="font-size:42px;font-weight:600;letter-spacing:-.05em;line-height:1">' + dias + '</div><div style="font-size:13px;font-weight:600;opacity:.9">dias para a 1ª fase</div></div></section>';

    /* 2. plano do dia (ao lado: proximo passo e materia da vez) */
    var plano = '<div class="card c7"><div class="row" style="padding:0 0 18px;border:0"><div class="ring" style="--p:' + (cnt[1] ? Math.round(cnt[0] * 100 / cnt[1]) : 0) + '"><b>' + cnt[0] + '/' + cnt[1] + '</b></div><div class="grow"><h3 style="font-size:20px">' + (adiante ? 'Primeiro dia de estudo' : 'Plano de hoje') + '</h3><span>' + esc(P.fmt(foco, { weekday: 'long', day: 'numeric', month: 'long' })) + (d ? ' · ' + esc(d.janela) : '') + '</span></div>' + '<a class="btn sm ghost" href="#/cronograma/' + foco + '">Ver o dia</a></div>' +
      (d ? '<div class="chips" style="margin-bottom:16px"><span class="chip">' + tipoCnt.novo + ' aula(s) nova(s)</span><span class="chip">' + tipoCnt.rev + ' revisão(ões)</span>' + (tipoCnt.bateria ? '<span class="chip">' + tipoCnt.bateria + ' bateria(s)</span>' : '') + '<span class="chip">' + P.hm(d.min) + '</span></div><div class="group" style="box-shadow:none;background:var(--surface2)">' +
        d.tarefas.slice(0, 5).map(function (x, k) { var dn = P.isDone(foco, x); return '<div class="row' + (dn ? ' done' : '') + '"><button class="chk' + (dn ? ' on' : '') + '" data-act="task" data-iso="' + foco + '" data-i="' + k + '" aria-label="Marcar como feita">' + ic('check') + '</button><a class="grow" href="' + taskHref(x) + '"><b>' + esc(x.t) + '</b><span>' + P.kLabel[x.k] + ' · ' + esc(matName(x.mat)) + ' · ' + x.min + ' min</span></a></div>'; }).join('') + '</div>' + (d.tarefas.length > 5 ? '<p class="tiny" style="margin-top:10px">+ ' + (d.tarefas.length - 5 > 0 ? d.tarefas.length - 5 : 0) + ' tarefa(s) no cronograma</p>' : '') : '<p class="muted">Nenhuma tarefa para este dia.</p>') + '</div>';

    var jn = P.janelas(new Date().getDay()).slice(0, 2);
    var lateral = '<div class="c5" style="display:grid;gap:22px;align-content:start">' + (next ? '<a class="card dark tap" href="' + taskHref(next) + '" style="padding:26px"><span class="eyebrow">Seu próximo passo</span><h3 style="margin:10px 0 8px;font-size:20px;color:#fff">' + esc(next.t) + '</h3><p class="muted" style="margin-bottom:16px">' + P.kLabel[next.k] + ' · ' + esc(matName(next.mat)) + ' · ' + next.min + ' min</p><span class="btn" style="background:#fff;color:#1C1C1E">' + ic('play') + 'Começar agora</span></a>' : '<div class="card flat"><h3>Tudo em dia</h3><p class="muted" style="margin-top:6px">Você concluiu o plano. Aproveite para revisar as dicas.</p></div>') +
      coverHtml(cur, 'Matéria da vez') +
      '<div class="card"><div class="row" style="padding:0 0 10px;border:0"><div class="ic" style="--c:#7C5CFF">' + ic('clock') + '</div><div class="grow"><h3 style="font-size:17px">Melhores horários hoje</h3><span>Pela sua rotina</span></div></div>' +
      (jn.length ? jn.map(function (w, i) { return '<div class="row" style="padding:11px 0"><div class="grow"><b>' + w.de + ' – ' + w.ate + '</b><span>' + w.tipo + ' · ' + esc(w.why) + '</span></div>' + (i === 0 ? '<span class="chip fill">melhor</span>' : '') + '</div>'; }).join('') : '<p class="muted">Rotina cheia hoje: use os intervalos para flashcards.</p>') + '</div></div>';

    /* 3. semana */
    var dk = Object.keys(P.CRO.dias).filter(function (k) { return k >= foco; }).sort().slice(0, 7);
    var semana = '<div class="week7">' + dk.map(function (k) { var dd = P.dia(k), c = P.doneCount(k), dt = P.parse(k); return '<a class="wk' + (k === foco ? ' on' : '') + '" href="#/cronograma/' + k + '"><span class="wd1">' + ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][dt.getDay()] + '</span><b>' + dt.getDate() + '</b><span class="wm">' + P.hm(dd.min) + '</span><span class="prog"><i style="--p:' + (c[1] ? Math.round(c[0] * 100 / c[1]) : 0) + '%"></i></span></a>'; }).join('') + '</div>';

    /* 4. fase, progresso, dica */
    var fasePct = fase ? Math.max(0, Math.min(100, Math.round((P.parse(foco) - P.parse(fase.ini)) * 100 / Math.max(1, (P.parse(fase.fim) - P.parse(fase.ini)))))) : 0;
    var proxMats = P.LIST.filter(function (m) { return m.id !== 'fgv' && m.ini > cur.ini; }).slice(0, 3);
    var cFase = '<div class="card c4"><span class="eyebrow">Fase atual</span><h3 style="margin:8px 0 6px;font-size:20px">' + esc(fase ? fase.nome : 'Estudo') + '</h3>' + (fase ? '<p class="muted" style="font-size:14px;line-height:1.55">' + esc(fase.foco) + '</p><div class="prog" style="margin:16px 0 6px"><i style="--p:' + fasePct + '%"></i></div><span class="tiny">' + esc(P.fmt(fase.ini)) + ' a ' + esc(P.fmt(fase.fim)) + '</span>' : '') +
      (proxMats.length ? '<div style="margin-top:16px;display:grid;gap:8px"><span class="eyebrow">Depois vem</span>' + proxMats.map(function (m) { return '<a href="#/materia/' + m.id + '" style="display:flex;justify-content:space-between;gap:10px;font-size:14px;font-weight:600"><span>' + esc(m.nome) + '</span><span class="tiny">' + esc(P.fmt(m.ini)) + '</span></a>'; }).join('') + '</div>' : '') + '</div>';
    var iniciadas = P.LIST.filter(function (m) { return P.matProg(m.id) > 0; }).length;
    var cProg = '<div class="card c4"><span class="eyebrow">Seu progresso</span><div style="display:flex;align-items:center;gap:18px;margin:14px 0 12px"><div class="ring" style="--p:' + P.totalProg() + ';--s:92px"><b>' + P.totalProg() + '%</b></div><div><div style="font-size:15px;font-weight:600">aulas estudadas</div><div class="tiny" style="margin-top:2px">' + iniciadas + ' de ' + P.LIST.length + ' matérias iniciadas</div></div></div><div class="row" style="padding:12px 0 0;border-top:1px solid var(--line)"><div class="grow"><b>' + Math.round(P.minRestantes() / 60) + ' h</b><span>de estudo planejadas até a prova</span></div></div></div>';
    var cDica = dica ? '<div class="card tint c4" style="--t:#E8F0FF"><span class="kbadge kreg">Dica da prova</span><h3 style="margin:12px 0 8px;font-size:18px">' + esc(dica.t) + '</h3><p style="font-size:14.5px;line-height:1.6;color:#44506b">' + esc(dica.x.length > 230 ? dica.x.slice(0, 227) + '…' : dica.x) + '</p><button class="btn sm ghost" data-act="tip" style="margin-top:14px">Outra dica</button></div>' : '';

    /* 5. pegadinha + acessos */
    var cPeg = peg ? '<a class="card tint c7" style="--t:#FFF1D6" href="#/materia/' + peg.m + '/dicas"><span class="kbadge kpg">Pegadinha do dia · ' + esc(matName(peg.m)) + '</span><h3 style="margin:12px 0 8px;font-size:19px">' + esc(peg.r.t) + '</h3><p style="font-size:14.5px;line-height:1.6;color:#6b4a12">' + esc(peg.r.e.length > 300 ? peg.r.e.slice(0, 297) + '…' : peg.r.e) + '</p><span class="tiny" style="display:block;margin-top:12px">' + esc(peg.r.b || '') + '</span></a>' : '';
    var acessos = '<div class="c5 quick">' + [['#/vade', 'law', 'Vade Mecum', 'Leis'], ['#/biblioteca', 'book', 'Biblioteca', 'Aulas e dicas'], ['#/agenda', 'clock', 'Agenda', 'Datas e horários'], ['#/notas', 'note', 'Anotações', 'Seu caderno']].map(function (q) { return '<a class="card tap qk" href="' + q[0] + '"><span class="ic">' + ic(q[1]) + '</span><b>' + q[2] + '</b><span class="tiny">' + q[3] + '</span></a>'; }).join('') + '</div>';

    return { t: 'Início', h: hero + '<div class="bento" style="margin-top:22px;align-items:start">' + plano + lateral + '</div>' + sec('Próximos dias', '<a class="more" href="#/cronograma">Abrir o cronograma</a>') + semana + sec('Onde você está') + '<div class="bento">' + cFase + cProg + cDica + '</div>' + sec('Para fixar') + '<div class="bento">' + cPeg + acessos + '</div>' };
  };

  /* ---------- CRONOGRAMA ---------- */
  V.cronograma = function (arg) {
    var ini = P.CRO.inicio, fim = P.CRO.fim, t = P.today();
    var sel = arg && P.dia(arg) ? arg : (P.ui.calSel && P.dia(P.ui.calSel) ? P.ui.calSel : (P.dia(t) ? t : ini));
    P.ui.calSel = sel;
    var mon = sel.slice(0, 7), meses = []; for (var d = P.parse(ini); d <= P.parse(fim); d.setMonth(d.getMonth() + 1, 1)) meses.push(P.iso(d).slice(0, 7));
    var first = P.parse(mon + '-01'), lead = first.getDay(), nd = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate(), cells = '';
    ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(function (x) { cells += '<div class="h">' + x + '</div>'; });
    for (var i = 0; i < lead; i++) cells += '<div class="d off"></div>';
    for (var n = 1; n <= nd; n++) {
      var iso = mon + '-' + P.pad(n), dd = P.dia(iso), cn = P.doneCount(iso), cls = 'd';
      if (dd) cls += ' has'; else cls += ' off'; if (iso === sel) cls += ' on'; if (iso === t) cls += ' today'; if (iso === P.CRO.prova) cls += ' prova';
      cells += '<div class="' + cls + '" data-act="day" data-iso="' + iso + '" style="--i:' + (dd ? Math.min(1, dd.min / 180) : 0) + '">' + n + (dd && cn[1] && cn[0] === cn[1] ? '<i></i>' : '') + '</div>';
    }
    if (mon === P.CRO.prova.slice(0, 7)) { /* dia da prova fora das tarefas ainda aparece */ }
    var dd2 = P.dia(sel), cn2 = P.doneCount(sel), fase = (P.CFG.fases || []).find(function (f) { return f.ini <= sel && sel <= f.fim; });
    var painel = dd2 ? '<div class="card"><div class="row" style="padding:0 0 12px;border:0"><div class="ring" style="--p:' + (cn2[1] ? Math.round(cn2[0] * 100 / cn2[1]) : 0) + '"><b>' + cn2[0] + '/' + cn2[1] + '</b></div><div class="grow"><h3>' + esc(P.fmt(sel, { weekday: 'long', day: 'numeric', month: 'long' })) + '</h3><span>' + P.hm(dd2.min) + ' · janela ' + esc(dd2.janela) + (fase ? ' · fase ' + esc(fase.nome) : '') + '</span></div></div>' +
      (fase ? '<p class="tiny" style="margin-bottom:10px">' + esc(fase.foco) + '</p>' : '') + '<div class="group" style="box-shadow:none;background:var(--surface2)">' + dd2.tarefas.map(function (x, k) { var dn = P.isDone(sel, x); return '<div class="row' + (dn ? ' done' : '') + '"><button class="chk' + (dn ? ' on' : '') + '" data-act="task" data-iso="' + sel + '" data-i="' + k + '" aria-label="Marcar como feita">' + ic('check') + '</button><div class="grow"><b>' + esc(x.t) + '</b><span>' + P.kLabel[x.k] + ' · ' + esc(matName(x.mat)) + ' · ' + x.min + ' min' + (x.ess ? ' · essencial' : '') + '</span></div><a class="btn sm ghost" href="' + taskHref(x) + '">Abrir</a></div>'; }).join('') + '</div></div>' : '<div class="card empty">Escolha um dia colorido no calendário.</div>';
    var mats = '<div class="group">' + P.LIST.map(function (m) { var g = PArt.grad(m.id); return '<a class="row" href="#/materia/' + m.id + '"><div class="ic" style="--c:hsl(' + PArt.hueOf(m.id) + ' 60% 55%)">' + ic('book') + '</div><div class="grow"><b>' + esc(m.nome) + '</b><span>' + P.fmt(m.ini) + ' a ' + P.fmt(m.fim) + ' · mínimo ' + P.hm(m.minMinimo || m.minTotal) + ' · plano ' + P.hm(m.minTotal) + '</span></div>' + (m.q ? '<span class="chip">' + m.q + ' q.</span>' : '') + arrow + '</a>'; }).join('') + '</div>';
    var fases = '<div class="chips">' + (P.CFG.fases || []).map(function (f) { return '<span class="chip' + (f.ini <= t && t <= f.fim ? ' fill' : '') + '" title="' + esc(f.foco) + '">' + esc(f.nome) + ' · ' + P.fmt(f.ini) + '</span>'; }).join('') + '</div>';
    return { t: 'Cronograma', h: '<span class="eyebrow">' + esc(P.CRO.metodo) + ' · até 10/01/2027</span><h1 style="margin:6px 0 10px">Seu cronograma</h1><p class="lead">Cada aula estudada volta em D1, D2, D7, D14 e D30. A ordem é a do seu diagnóstico, com horas mínimas por matéria. Marque o que fez; o resto reorganiza sozinho no seu ritmo.</p>' + '<div style="margin:18px 0 10px">' + fases + '</div>' +
      '<div class="bento" style="margin-top:14px"><div class="card c5"><div class="seg" style="margin-bottom:14px">' + meses.map(function (m) { return '<button class="' + (m === mon ? 'on' : '') + '" data-act="mon" data-m="' + m + '">' + esc(P.parse(m + '-01').toLocaleDateString('pt-BR', { month: 'short', year: m.slice(0, 4) !== '2026' ? '2-digit' : undefined }).replace('.', '')) + '</button>'; }).join('') + '</div><div class="cal">' + cells + '</div><p class="tiny" style="margin-top:12px">Quanto mais forte a cor, mais minutos no dia. Ponto verde: dia concluído. Vermelho: a prova.</p></div><div class="c7">' + painel + '</div></div>' + sec('Matérias, datas e horas mínimas') + mats };
  };

  /* ---------- BIBLIOTECA ---------- */
  V.biblioteca = function () {
    var f = P.ui.lib, L = P.LIST.filter(function (m) { return m.id !== 'fgv' && (f === 'todas' || (f === 'min15' && m.grupo === 'min15') || (f === 'principal' && m.grupo === 'principal') || (f === 'leve' && m.grupo === 'leve')); });
    var a0 = P.mat('fgv');
    var card = function (m) { return coverHtml(m); };
    var hero = a0 ? '<a class="card tap dark" href="#/materia/fgv" style="margin:18px 0 6px;padding:28px 30px;display:flex;gap:20px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:240px"><span class="eyebrow">Comece por aqui</span><h2 style="margin:6px 0 8px;color:#fff">Como a FGV pensa</h2><p class="muted" style="max-width:56ch">O que as 640 questões reais ensinam: o que não adianta decorar, o molde fixo da prova e a estratégia dos 40 acertos.</p></div><span class="btn" style="background:#fff;color:#1C1C1E">' + ic('play') + 'Abrir a Aula 0</span></a>' : '';
    return { t: 'Biblioteca', h: '<span class="eyebrow">Curso do Petrus · ' + P.LIST.length + ' matérias</span><h1 style="margin:6px 0 10px">Biblioteca</h1><p class="lead">Cada matéria reúne a aula, as dicas do professor, os temas que mais caem e as suas anotações, tudo no mesmo lugar e na ordem do seu cronograma.</p>' + hero +
      '<div style="margin:22px 0 18px"><div class="seg">' + [['todas', 'Todas'], ['min15', 'Mínimo de 15%'], ['principal', 'Principais'], ['leve', 'Leves']].map(function (x) { return '<button class="' + (f === x[0] ? 'on' : '') + '" data-act="libf" data-f="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div><div class="grid2">' + L.map(card).join('') + '</div>' };
  };

  /* ---------- MATERIA (curso + dicas + temas + notas) ---------- */
  V.materia = function (id, tab, idx) {
    var m = P.mat(id); if (!m) return { t: 'Matéria', h: '<div class="card empty">Matéria não encontrada.</div>', back: '#/biblioteca' };
    tab = tab || 'aulas'; var bl = P.blocos(id), cu = P.CUR[id] || {}, reg = P.regras(id), temas = P.temas(id), g = PArt.grad(id);
    var nota = m.nota, notaTxt = nota == null || nota < 0 ? 'sem diagnóstico' : nota + ' de ' + (m.q || '?') + ' no diagnóstico';
    var plano = '<div class="glassb" style="margin-top:6px;max-width:560px;font-size:14.5px;line-height:1.5"><b>Plano do Petrus para o Lucas</b><br>' + (m.q ? 'Cai <b>' + m.q + '</b> questão(ões) na prova. ' : 'É a base para ler a prova. ') + 'Seu ponto de partida: ' + notaTxt + '. Estude de <b>' + P.fmt(m.ini) + '</b> a <b>' + P.fmt(m.fim) + '</b>, mínimo de <b>' + P.hm(m.minMinimo || m.minTotal) + '</b>' + (m.ess ? ', começando pelas ' + m.ess + ' aulas essenciais' : '') + '.</div>';
    var hero = '<section class="scene" style="min-height:clamp(280px,38vh,400px);view-transition-name:matcard">' + PArt.scene({ hue: PArt.hueOf(id), seed: 21 + id.length, kind: PArt.kindOf(id), figure: true }) + '<div class="in"><span class="eyebrow" style="color:rgba(255,255,255,.85)">' + (m.q ? m.q + ' questão(ões) na prova' : 'Curso do Petrus') + ' · ' + P.matProg(id) + '% estudado</span><h1 style="font-size:clamp(30px,4.4vw,54px)">' + esc(m.nome) + '</h1>' + plano + '</div></section>';
    var tabs = [['aulas', 'Aulas', bl.length], ['dicas', 'Dicas do professor', reg.length], ['temas', 'O que mais cai', temas.length], ['notas', 'Anotações', P.S.notes.filter(function (n) { return n.mat === id; }).length]];
    var seg = '<div style="margin:20px 0 18px;position:sticky;top:84px;z-index:30"><div class="seg" style="box-shadow:var(--shadow)">' + tabs.map(function (x) { return '<button class="' + (tab === x[0] ? 'on' : '') + '" data-act="mtab" data-id="' + id + '" data-tab="' + x[0] + '">' + x[1] + ' <span class="tiny">' + x[2] + '</span></button>'; }).join('') + '</div></div>';
    var body = '';
    if (tab === 'aulas') {
      body = (cu.intro ? '<div class="card flat" style="margin-bottom:16px"><span class="eyebrow">Visão geral</span><div class="prose" style="margin-top:8px">' + P.md(cu.intro) + '</div></div>' : '') +
        (bl.length ? bl.map(function (b, i) { var rd = P.isRead(id, i); return '<details class="bk" id="bk' + i + '"' + (idx != null && +idx === i ? ' open' : '') + '><summary><span class="n">' + (rd ? '✓' : i + 1) + '</span><span class="t">' + esc(b.t) + '<small>' + esc(b.tema || '') + '</small></span><span class="car">›</span></summary><div class="bd"><div class="prose">' + P.md(b.x) + '</div><div style="margin-top:14px"><button class="btn sm ' + (rd ? 'ghost' : 'acc') + '" data-act="read" data-id="' + id + '" data-i="' + i + '">' + (rd ? 'Marcar como não lida' : 'Marcar como estudada') + '</button></div></div></details>'; }).join('') : '<div class="card empty">Esta matéria ainda não tem aulas escritas.</div>');
    } else if (tab === 'dicas') {
      var ks = ['todas'].concat(Object.keys(P.kinds).filter(function (k) { return reg.some(function (r) { return r.k === k; }); })), cur = P.ui.tipoDica;
      if (ks.indexOf(cur) < 0) cur = 'todas';
      var list = reg.filter(function (r) { return cur === 'todas' || r.k === cur; });
      body = '<div class="chips" style="margin-bottom:16px">' + ks.map(function (k) { return '<button class="chip' + (k === cur ? ' fill' : '') + '" data-act="tipf" data-id="' + id + '" data-k="' + k + '">' + (k === 'todas' ? 'Todas (' + reg.length + ')' : P.kinds[k][0]) + '</button>'; }).join('') + '</div>' +
        '<div class="grid2" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">' + list.map(function (r) { var kk = P.kinds[r.k] || ['Dica', 'kreg']; return '<div class="tip"><span class="kbadge k ' + kk[1] + '">' + kk[0] + '</span><h4>' + esc(r.t) + '</h4><p>' + esc(r.e) + '</p>' + (r.o ? '<p style="color:var(--ink)"><b>Pegadinha/contraponto:</b> ' + esc(r.o) + '</p>' : '') + '<span class="src">' + esc(r.b || '') + (r.x ? ' · ' + esc(r.x) : '') + '</span></div>'; }).join('') + '</div>';
    } else if (tab === 'temas') {
      var max = temas.length ? temas[0].n : 1;
      body = '<p class="lead" style="margin-bottom:16px">Temas ordenados pelo número de questões reais da FGV (exames 40º a 47º). Comece pelo topo: é onde a prova mais cobra.</p><div class="group">' + temas.map(function (t) { return '<div class="row"><div class="grow"><b>' + esc(t.t) + '</b><span>' + t.n + ' questões · apareceu em ' + (t.ex || []).length + ' provas</span><div class="prog" style="margin-top:8px"><i style="--p:' + Math.round(t.n * 100 / max) + '%"></i></div></div><span class="chip">' + t.n + '</span></div>'; }).join('') + '</div>';
    } else {
      var ns = P.S.notes.filter(function (n) { return n.mat === id; });
      body = noteComposer(id) + ns.map(noteHtml).join('');
    }
    return { t: m.nome, h: hero + seg + '<div class="view-body">' + body + '</div>', back: '#/biblioteca', post: function () { if (tab === 'aulas' && idx != null) { var e = document.getElementById('bk' + idx); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); } } };
  };

  /* ---------- VADE MECUM ---------- */
  V.vade = function (id, art) {
    if (id) return V.vadeLei(id, art);
    var f = (P.ui.vade || '').toLowerCase(), groups = {};
    P.LEIS.forEach(function (l) { if (f && (l.nome + ' ' + l.curto + ' ' + l.grupo).toLowerCase().indexOf(f) < 0) return; (groups[l.grupo] = groups[l.grupo] || []).push(l); });
    var html = Object.keys(groups).map(function (gp) { return '<div class="sec"><h2 style="font-size:20px">' + esc(gp) + '</h2></div><div class="group">' + groups[gp].map(function (l) { return '<a class="row" href="#/vade/' + l.id + '"><div class="ic" style="--c:#5E5CE6">' + ic('law') + '</div><div class="grow"><b>' + esc(l.curto || l.nome) + '</b><span>' + esc(l.nome) + ' · ' + l.n + ' dispositivos</span></div>' + arrow + '</a>'; }).join('') + '</div>'; }).join('') || '<div class="card empty">Nenhuma lei encontrada.</div>';
    return { t: 'Vade Mecum', h: '<span class="eyebrow">' + P.LEIS.length + ' leis · texto do Planalto e da OAB</span><h1 style="margin:6px 0 10px">Vade Mecum</h1><p class="lead">A lei seca das matérias da prova. Abra uma lei, busque por artigo ou palavra e marque o que precisa reler. Confira sempre a versão em vigor na fonte.</p><div style="margin:18px 0 6px"><input class="in" id="vf" placeholder="Filtrar leis (ex.: penal, CLT, consumidor)" value="' + esc(P.ui.vade) + '" data-act="vf"></div>' + html, post: function () { var v = document.getElementById('vf'); if (v && P.ui.vade) { v.focus(); v.setSelectionRange(v.value.length, v.value.length); } } };
  };
  var leiCache = {};
  P.loadLei = function (id) {
    return new Promise(function (res) {
      if (window.C48_LEIS && window.C48_LEIS[id]) return res(window.C48_LEIS[id]);
      var sc = document.createElement('script'); sc.src = 'dados/leis/' + id + '.js'; sc.onload = function () { res(window.C48_LEIS && window.C48_LEIS[id]); }; sc.onerror = function () { res(null); }; document.head.appendChild(sc);
    });
  };
  V.vadeLei = function (id, art) {
    P.artAlvo = art ? decodeURIComponent(art) : '';
    var l = P.LEIS.find(function (x) { return x.id === id; }); if (!l) return { t: 'Vade Mecum', h: '<div class="card empty">Lei não encontrada.</div>', back: '#/vade' };
    return { t: l.curto || l.nome, back: '#/vade', h: '<span class="eyebrow">' + esc(l.grupo) + ' · ' + esc(l.fonte) + '</span><h1 style="margin:6px 0 10px;font-size:clamp(28px,4vw,46px)">' + esc(l.nome) + '</h1><p class="tiny" style="max-width:70ch">' + esc(l.aviso || '') + ' <a href="' + esc(l.url) + '" target="_blank" rel="noopener" style="color:var(--accent);font-weight:600">Abrir a fonte</a></p><div style="margin:18px 0 12px"><input class="in" id="lf" placeholder="Buscar no texto (ex.: art. 5º, prescrição, liberdade)" data-act="lf"></div><div class="group" id="leiBody"><div class="empty">Carregando a lei…</div></div><div style="margin-top:14px;text-align:center"><button class="btn ghost" id="leiMore" data-act="leimore" hidden>Mostrar mais</button></div>', post: function () {
      P.loadLei(id).then(function (d) { var body = document.getElementById('leiBody'); if (!body) return; if (!d) { body.innerHTML = '<div class="empty">Não consegui carregar esta lei.</div>'; return; } P.lei = { id: id, arts: d.arts, lim: 60, q: '', alvo: P.artAlvo || '' }; P.renderLei(); if (P.artAlvo) setTimeout(function () { var e = document.querySelector('.art.alvo'); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120); });
    } };
  };
  P.renderLei = function () {
    var L = P.lei, body = document.getElementById('leiBody'), more = document.getElementById('leiMore'); if (!L || !body) return;
    var q = (L.q || '').toLowerCase().trim(), arts = q ? L.arts.filter(function (a) { return ((a.n || '') + ' ' + (a.t || '')).toLowerCase().indexOf(q) >= 0; }) : L.arts;
    var nn = function (a) { return String(a.n || '').replace(/[º°\s.]/g, '').toLowerCase(); };
    if (!q && L.alvo) { var al = String(L.alvo).replace(/[º°\s.]/g, '').toLowerCase(), pos = L.arts.findIndex(function (a) { return nn(a) === al; }); if (pos >= 0) { var from = Math.max(0, pos - 2); arts = L.arts.slice(from, from + 14); L.lim = 14; } }
    var shown = arts.slice(0, L.lim), re = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig') : null;
    body.innerHTML = shown.length ? shown.map(function (a) { var t = esc(a.t || ''); if (re) t = t.replace(re, function (m) { return '<mark>' + m + '</mark>'; }); var alvo = !q && L.alvo && nn(a) === String(L.alvo).replace(/[º°\s.]/g, '').toLowerCase(); return '<div class="art' + (alvo ? ' alvo' : '') + '"><div class="an">' + esc(a.n || '') + (a.g ? ' · ' + esc(a.g) : '') + '</div><div class="at">' + t + '</div></div>'; }).join('') : '<div class="empty">Nada encontrado.</div>';
    if (more) { more.hidden = arts.length <= L.lim; more.textContent = 'Mostrar mais (' + (arts.length - L.lim) + ')'; }
  };

  /* ---------- AGENDA ---------- */
  V.agenda = function () {
    var CFG = P.CFG, hoje = P.today();
    var datas = [{ d: CFG.prova.slice(0, 10), t: '1ª fase do 48º Exame de Ordem', tag: 'PROVA', h: '13h' }, { d: CFG.segundaFase.slice(0, 10), t: '2ª fase (prova prático-profissional)', tag: 'PROVA', h: '13h' }].concat((CFG.prazos || []).map(function (p) { return { d: p.d, t: p.t, tag: p.tag, h: p.h }; })).filter(function (x) { return x.d >= hoje; }).sort(function (a, b) { return a.d.localeCompare(b.d); });
    var dl = '<div class="group">' + datas.map(function (x) { var n = P.daysTo(x.d); return '<div class="row"><div class="ic" style="--c:' + (x.tag === 'PROVA' ? '#FF453A' : x.tag === 'OAB' ? '#0A84FF' : '#30B964') + '">' + ic(x.tag === 'PROVA' ? 'flag' : 'cal') + '</div><div class="grow"><b>' + esc(x.t) + '</b><span>' + esc(P.fmt(x.d, { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })) + (x.h ? ' · ' + esc(x.h) : '') + ' · ' + esc(x.tag) + '</span></div><span class="chip' + (n <= 7 ? ' fill' : '') + '">' + (n === 0 ? 'hoje' : n === 1 ? 'amanhã' : n + ' dias') + '</span></div>'; }).join('') + '</div>';
    var week = '<div class="week">' + [1, 2, 3, 4, 5, 6, 0].map(function (dw) {
      var bl = (P.ROT[dw] || []).map(function (b) { return '<div class="blk ' + b.k + '">' + esc(b.t) + '<small>' + b.h + ' – ' + b.f + '</small></div>'; }).join(''), jn = P.janelas(dw).slice(0, 2).map(function (w) { return '<div class="blk free">' + w.tipo + '<small>' + w.de + ' – ' + w.ate + '</small></div>'; }).join('');
      return '<div class="wd"><h4>' + DOW[dw] + '</h4>' + bl + jn + '</div>'; }).join('') + '</div>';
    var dicas = [['Aula nova de manhã', 'Das 8h às 12h a atenção está no pico. Reserve esse bloco para conteúdo difícil.', '#E3EEFF'], ['Questões à tarde', 'Treino de questões rende bem no começo da tarde, com cronômetro e correção logo depois.', '#E2F7E8'], ['Revisão à noite', 'Revise o que estudou hoje (D1) antes de dormir: o sono consolida o que você acabou de ler.', '#EFE5FF'], ['Blocos de 50 e 10', 'Estude 50 minutos e pare 10. Em 2 horas você faz 2 blocos e uma revisão curta.', '#FFF1D6']];
    var tips = '<div class="bento">' + dicas.map(function (x) { return '<div class="card tint c3" style="--t:' + x[2] + ';color:#2a2540"><h3 style="font-size:17px">' + x[0] + '</h3><p style="font-size:14px;margin-top:8px;opacity:.82">' + x[1] + '</p></div>'; }).join('') + '</div>';
    var ck = '<div class="group">' + (CFG.checklist || []).map(function (c) { var on = P.S.ck[c.id]; return '<div class="row' + (on ? ' done' : '') + '"><button class="chk' + (on ? ' on' : '') + '" data-act="ck" data-id="' + c.id + '">' + ic('check') + '</button><div class="grow"><b>' + esc(c.t) + '</b><span>' + esc(P.fmt(c.d, { day: '2-digit', month: 'long' })) + '</span></div></div>'; }).join('') + '</div>';
    return { t: 'Agenda', h: '<span class="eyebrow">Datas, rotina e horários</span><h1 style="margin:6px 0 10px">Agenda</h1><p class="lead">Suas datas importantes, a semana com aulas, estágio e treino, e as janelas livres com a melhor forma de usar cada uma.</p>' + sec('Datas que mandam') + dl + sec('Sua semana', '<span class="tiny">Contornos: janelas livres para estudar</span>') + week + sec('Como aproveitar melhor os horários') + tips + sec('Checklist') + ck };
  };

  /* ---------- NOTAS ---------- */
  function noteComposer(mat) {
    return '<div class="card" style="margin-bottom:16px;display:grid;gap:10px"><h3>Nova anotação</h3><input class="in" id="nt" placeholder="Título"><textarea class="in" id="nx" rows="4" placeholder="Escreva aqui o que quer lembrar…"></textarea><div class="row" style="padding:0;border:0"><select class="in" id="nm" style="max-width:280px"><option value="">Sem matéria</option>' + P.LIST.map(function (m) { return '<option value="' + m.id + '"' + (m.id === mat ? ' selected' : '') + '>' + esc(m.nome) + '</option>'; }).join('') + '</select><span class="grow"></span><button class="btn acc" data-act="noteadd">' + ic('plus') + 'Salvar</button></div></div>';
  }
  function noteHtml(n) { return '<div class="note" style="margin-bottom:12px"><div class="row" style="padding:0;border:0"><div class="grow"><span class="tiny">' + esc(n.mat ? matName(n.mat) : 'Geral') + ' · ' + esc(new Date(n.ts).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })) + '</span><div class="nt">' + esc(n.t || 'Sem título') + '</div></div><button class="ib" data-act="notedel" data-id="' + n.id + '" aria-label="Apagar" style="width:36px;height:36px;border-radius:50%;background:var(--surface2);display:grid;place-items:center"><span style="width:18px;height:18px;display:block">' + ic('trash') + '</span></button></div><div class="nx">' + esc(n.x) + '</div></div>'; }
  P.noteComposer = noteComposer; P.noteHtml = noteHtml;
  V.notas = function () {
    var ns = P.S.notes.slice().sort(function (a, b) { return b.ts - a.ts; });
    return { t: 'Anotações', h: '<span class="eyebrow">' + ns.length + ' anotações neste aparelho</span><h1 style="margin:6px 0 10px">Anotações</h1><p class="lead">Seu caderno pessoal. Anote pegadinhas, dúvidas e o que errou. Cada matéria também tem a sua aba de anotações.</p><div style="margin-top:18px">' + noteComposer('') + (ns.length ? ns.map(noteHtml).join('') : '<div class="card empty">Nenhuma anotação ainda.</div>') + '</div>' };
  };

  /* ---------- BUSCA ---------- */
  V.busca = function (q) {
    q = decodeURIComponent(q || '').trim(); var ql = q.toLowerCase(); if (!ql) return { t: 'Busca', h: '<div class="card empty">Digite algo na busca.</div>' };
    var rs = [], has = function (s) { return String(s || '').toLowerCase().indexOf(ql) >= 0; };
    P.LIST.forEach(function (m) {
      if (has(m.nome)) rs.push(['Matéria', m.nome, '', '#/materia/' + m.id]);
      P.blocos(m.id).forEach(function (b, i) { if (has(b.t) || has(b.tema) || has(b.x)) rs.push(['Aula', b.t, m.nome, '#/aula/' + m.id + '/' + i]); });
      P.regras(m.id).forEach(function (r) { if (has(r.t) || has(r.e)) rs.push(['Dica', r.t, m.nome + ' · ' + (r.b || ''), '#/materia/' + m.id + '/dicas']); });
    });
    P.LEIS.forEach(function (l) { if (has(l.nome) || has(l.curto)) rs.push(['Lei', l.nome, l.grupo, '#/vade/' + l.id]); });
    P.S.notes.forEach(function (n) { if (has(n.t) || has(n.x)) rs.push(['Nota', n.t || 'Sem título', n.mat ? matName(n.mat) : 'Geral', '#/notas']); });
    return { t: 'Busca', back: '#/inicio', h: '<span class="eyebrow">' + rs.length + ' resultados</span><h1 style="margin:6px 0 18px;font-size:clamp(28px,4vw,46px)">“' + esc(q) + '”</h1><div class="group">' + (rs.slice(0, 60).map(function (r) { return '<a class="row" href="' + r[3] + '"><span class="chip">' + r[0] + '</span><div class="grow"><b>' + esc(r[1]) + '</b><span>' + esc(r[2]) + '</span></div>' + arrow + '</a>'; }).join('') || '<div class="empty">Nada encontrado.</div>') + '</div>' };
  };

  /* ---------- AJUSTES ---------- */
  var COLORS = [['Azul', '#0A84FF'], ['Roxo', '#7C5CFF'], ['Verde', '#30B964'], ['Laranja', '#FF8A1F'], ['Rosa', '#FF4F8B'], ['Turquesa', '#14B8C4'], ['Vermelho', '#FF453A'], ['Grafite', '#3A3A3C']];
  P.COLORS = COLORS;
  V.config = function () {
    var s = P.S.set;
    return { t: 'Ajustes', h: '<span class="eyebrow">Personalize o seu espaço</span><h1 style="margin:6px 0 18px">Ajustes</h1>' +
      sec('Aparência') + '<div class="group"><div class="row"><div class="grow"><b>Cor do site</b><span>Muda botões, destaques e progresso</span></div></div><div class="row"><div class="swatches">' + COLORS.map(function (c) { return '<button class="' + (s.accent === c[1] ? 'on' : '') + '" style="--c:' + c[1] + '" data-act="accent" data-c="' + c[1] + '" aria-label="' + c[0] + '" title="' + c[0] + '"></button>'; }).join('') + '</div></div>' +
      '<div class="row"><div class="grow"><b>Modo</b><span>Claro, escuro ou o do aparelho</span></div><div class="seg">' + [['light', 'Claro'], ['dark', 'Escuro'], ['auto', 'Auto']].map(function (x) { return '<button class="' + (s.mode === x[0] ? 'on' : '') + '" data-act="mode" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="row"><div class="grow"><b>Tamanho do texto</b><span>Para ler as aulas com conforto</span></div><div class="seg">' + [[0.92, 'P'], [1, 'M'], [1.12, 'G'], [1.25, 'GG']].map(function (x) { return '<button class="' + (s.size === x[0] ? 'on' : '') + '" data-act="size" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div></div>' +
      sec('Menu e movimento') + '<div class="group"><div class="row"><div class="grow"><b>Menu lateral</b><span>É uma pílula que abre ao passar o mouse (no celular, ao tocar)</span></div></div><div class="row tap" data-act="motion"><div class="grow"><b>Animações</b><span>Desligue para um site mais estático</span></div><div class="sw' + (s.motion !== 'off' ? ' on' : '') + '"></div></div></div>' +
      sec('Seus dados') + '<div class="group"><div class="row"><div class="grow"><b>Progresso e anotações</b><span>Ficam salvos só neste aparelho. Exporte para guardar uma cópia.</span></div><button class="btn sm ghost" data-act="export">Exportar</button></div><div class="row"><div class="grow"><b>Zerar progresso</b><span>Apaga aulas lidas e tarefas marcadas (não apaga as anotações)</span></div><button class="btn sm ghost" data-act="reset">Zerar</button></div></div>' +
      sec('Sobre') + '<div class="card flat"><p class="muted">Petrus · cérebro do professor: ' + (P.CER.n || '') + ' regras conferidas, ' + Object.keys(P.CUR).length + ' aulas-curso e cronograma de ' + Object.keys(P.CRO.dias).length + ' dias, gerados do banco de dados do Petrus em ' + esc(P.CER.gerado || '') + '. Material independente, sem vínculo com a OAB ou a FGV.</p></div>' };
  };
})();
