/* PETRUS · praticar: Flashcards (repeticao espacada), Jogo da memoria (regra x artigo) e Escritorio (casos de consultoria na mesa).
   Tudo usa o banco do Petrus e so traz o que voce ja estudou (ou tudo, se preferir). */
(function () {
  var P = window.P, esc = P.esc, ic = P.ic, V = P.V, S = P.S;
  S.fc = S.fc || {}; S.mem = S.mem || {}; S.casos = S.casos || {};
  P.ui.fcDeck = P.ui.fcDeck || 'estudadas'; P.ui.fcMat = P.ui.fcMat || 'todas'; P.ui.fcKind = P.ui.fcKind || 'todas';
  P.ui.memDeck = P.ui.memDeck || 'estudadas'; P.ui.memN = P.ui.memN || 6;
  var DAY = 864e5, BOX = [0, 1, 3, 7, 15, 30, 60];
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(a) { var r = rng((Date.now() ^ (Math.random() * 1e9)) >>> 0), x = a.slice(); for (var i = x.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = x[i]; x[i] = x[j]; x[j] = t; } return x; }
  P.lidas = function (mat) { var n = 0; P.blocos(mat).forEach(function (b, i) { if (P.isRead(mat, i)) n++; }); return n; };
  function matsDoDeck(deck) { return P.LIST.filter(function (m) { return m.id !== 'fgv' && P.regras(m.id).length && (deck === 'todas' || P.lidas(m.id) > 0); }); }
  function allRegras(deck, mat) { var out = []; matsDoDeck(deck).forEach(function (m) { if (mat && mat !== 'todas' && mat !== m.id) return; P.regras(m.id).forEach(function (r) { out.push({ m: m.id, r: r }); }); }); return out; }

  /* ===================== FLASHCARDS ===================== */
  var FC = null;
  V.flashcards = function () {
    var deck = P.ui.fcDeck, mat = P.ui.fcMat, kind = P.ui.fcKind, ms = matsDoDeck(deck);
    if (mat !== 'todas' && !ms.some(function (m) { return m.id === mat; })) mat = P.ui.fcMat = 'todas';
    var pool = allRegras(deck, mat).filter(function (x) { return kind === 'todas' || x.r.k === kind; }), now = Date.now();
    var due = pool.filter(function (x) { var c = S.fc[x.r.id]; return c && c.due <= now; }).length, novos = pool.filter(function (x) { return !S.fc[x.r.id]; }).length, dom = pool.filter(function (x) { var c = S.fc[x.r.id]; return c && c.box >= 5; }).length;
    var kinds = ['todas'].concat(Object.keys(P.kinds));
    return { t: 'Flashcards', h: '<span class="eyebrow">Repetição espaçada · ' + (P.CER.n || '') + ' cartas do banco do Petrus</span><h1 style="margin:6px 0 10px">Flashcards</h1><p class="lead">Leia a frente, responda de cabeça, vire a carta e diga se acertou. O que você erra volta logo; o que você acerta volta cada vez mais tarde (1, 3, 7, 15, 30 e 60 dias).</p>' +
      '<div class="card" style="margin-top:22px;display:grid;gap:18px"><div><span class="eyebrow">Baralho</span><div class="seg" style="margin-top:8px"><button class="' + (deck === 'estudadas' ? 'on' : '') + '" data-fcset="deck:estudadas">Só o que já estudei</button><button class="' + (deck === 'todas' ? 'on' : '') + '" data-fcset="deck:todas">Todas as matérias</button></div></div>' +
      '<div><span class="eyebrow">Matéria</span><div class="chips" style="margin-top:8px"><button class="chip' + (mat === 'todas' ? ' fill' : '') + '" data-fcset="mat:todas">Todas</button>' + ms.map(function (m) { return '<button class="chip' + (mat === m.id ? ' fill' : '') + '" data-fcset="mat:' + m.id + '">' + esc(m.nome.replace('Direito ', '')) + '</button>'; }).join('') + '</div>' + (ms.length ? '' : '<p class="muted" style="margin-top:8px">Você ainda não marcou nenhuma aula como estudada. Escolha “Todas as matérias” ou estude uma aula na Biblioteca.</p>') + '</div>' +
      '<div><span class="eyebrow">Tipo de carta</span><div class="chips" style="margin-top:8px">' + kinds.map(function (k) { return '<button class="chip' + (kind === k ? ' fill' : '') + '" data-fcset="kind:' + k + '">' + (k === 'todas' ? 'Todas' : P.kinds[k][0]) + '</button>'; }).join('') + '</div></div>' +
      '<div class="row" style="padding:0;border:0"><div class="grow"><b>' + due + ' para rever agora · ' + novos + ' novas · ' + dom + ' dominadas</b><span>' + pool.length + ' cartas neste baralho</span></div><button class="btn acc" data-fcgo="1"' + (pool.length ? '' : ' disabled style="opacity:.5"') + '>' + ic('play') + 'Começar sessão</button></div></div><div id="fcbox"></div>' };
  };
  function fcSession() {
    var pool = allRegras(P.ui.fcDeck, P.ui.fcMat).filter(function (x) { return P.ui.fcKind === 'todas' || x.r.k === P.ui.fcKind; }), now = Date.now();
    var due = shuffle(pool.filter(function (x) { var c = S.fc[x.r.id]; return c && c.due <= now; })), novos = shuffle(pool.filter(function (x) { return !S.fc[x.r.id]; })).slice(0, 15);
    var q = due.concat(novos).slice(0, 25); if (!q.length) q = shuffle(pool).slice(0, 15);
    FC = { q: q, i: 0, flip: false, ac: 0, er: 0, total: q.length };
    fcShow();
  }
  function fcShow() {
    var box = document.getElementById('fcbox'); if (!box || !FC) return;
    if (FC.i >= FC.q.length) { box.innerHTML = '<div class="card" style="margin-top:20px;text-align:center;padding:36px"><div class="ring" style="--p:' + (FC.ac + FC.er ? Math.round(FC.ac * 100 / (FC.ac + FC.er)) : 0) + ';--s:96px;margin:0 auto 14px"><b>' + (FC.ac + FC.er ? Math.round(FC.ac * 100 / (FC.ac + FC.er)) : 0) + '%</b></div><h3>Sessão concluída</h3><p class="muted" style="margin:6px 0 18px">' + FC.ac + ' acertos e ' + FC.er + ' para rever em breve.</p><button class="btn acc" data-fcgo="1">Outra sessão</button></div>'; return; }
    var it = FC.q[FC.i], r = it.r, kk = P.kinds[r.k] || ['Carta', 'kreg'], m = P.mat(it.m), refs = P.leiRefs(r.b).slice(0, 4);
    box.innerHTML = '<div class="fcx-wrap"><div class="tiny" style="text-align:center;margin-bottom:12px">Carta ' + (FC.i + 1) + ' de ' + FC.q.length + ' · ' + esc(m.nome) + '</div><div class="prog" style="max-width:360px;margin:0 auto 22px"><i style="--p:' + Math.round(FC.i * 100 / FC.q.length) + '%"></i></div>' +
      '<div class="fcx' + (FC.flip ? ' flip' : '') + '" data-fcflip="1" tabindex="0"><div class="fcx-in"><div class="fcx-f fcx-front"><span class="kbadge ' + kk[1] + '">' + kk[0] + '</span><h2>' + esc(r.t) + '</h2><p class="muted">O que diz a regra? Responda de cabeça e toque para virar.</p></div>' +
      '<div class="fcx-f fcx-back"><span class="kbadge ' + kk[1] + '">' + kk[0] + '</span><p class="fcx-e">' + esc(r.e.length > 640 ? r.e.slice(0, 637) + '…' : r.e) + '</p>' + (r.o ? '<p class="fcx-o"><b>O que a banca troca:</b> ' + esc(r.o) + '</p>' : '') + (refs.length ? '<div class="chips">' + refs.map(function (x) { return '<a class="chip lei" href="#/vade/' + x.id + '/' + x.art + '">' + ic('law') + esc(x.label) + '</a>'; }).join('') + '</div>' : '') + '<span class="tiny">' + esc(r.b || '') + '</span></div></div></div>' +
      '<div class="fcx-btns">' + (FC.flip ? '<button class="btn ghost" data-fcr="0">Errei</button><button class="btn ghost" data-fcr="1">Difícil</button><button class="btn acc" data-fcr="2">Acertei</button>' : '<button class="btn" data-fcflip="1">Virar a carta</button>') + '</div><p class="tiny" style="text-align:center;margin-top:12px">Atalhos: espaço vira · 1 errei · 2 difícil · 3 acertei</p></div>';
  }
  function fcRate(v) {
    if (!FC || !FC.flip) return; var it = FC.q[FC.i], id = it.r.id, c = S.fc[id] || { box: 0, due: 0 }, now = Date.now();
    if (v === 0) { c.box = 1; c.due = now + 10 * 60e3; FC.er++; FC.q.push(it); }
    else if (v === 1) { c.box = Math.max(1, c.box); c.due = now + DAY; FC.ac++; }
    else { c.box = Math.min(BOX.length - 1, c.box + 1); c.due = now + DAY * BOX[c.box]; FC.ac++; }
    S.fc[id] = c; P.save(); FC.i++; FC.flip = false; fcShow();
  }

  /* ===================== JOGO DA MEMORIA ===================== */
  var MG = null, mtimer = 0;
  V.memoria = function () {
    var deck = P.ui.memDeck, n = P.ui.memN, ms = matsDoDeck(deck), pairs = memPairs(deck, 99).length;
    return { t: 'Jogo da memória', h: '<span class="eyebrow">Regra × artigo da lei</span><h1 style="margin:6px 0 10px">Jogo da memória</h1><p class="lead">Encontre os pares: de um lado o instituto jurídico, do outro o artigo que o regula. Quem liga a regra ao artigo lê a lei seca mais rápido na prova.</p>' +
      '<div class="card" style="margin-top:22px;display:grid;gap:18px"><div><span class="eyebrow">Baralho</span><div class="seg" style="margin-top:8px"><button class="' + (deck === 'estudadas' ? 'on' : '') + '" data-memset="deck:estudadas">Só o que já estudei</button><button class="' + (deck === 'todas' ? 'on' : '') + '" data-memset="deck:todas">Todas as matérias</button></div></div>' +
      '<div><span class="eyebrow">Tamanho</span><div class="seg" style="margin-top:8px">' + [6, 8, 10].map(function (k) { return '<button class="' + (n === k ? 'on' : '') + '" data-memset="n:' + k + '">' + k + ' pares</button>'; }).join('') + '</div></div>' +
      '<div class="row" style="padding:0;border:0"><div class="grow"><b>' + pairs + ' pares disponíveis</b><span>' + (S.mem[n] ? 'Seu recorde em ' + n + ' pares: ' + S.mem[n].moves + ' jogadas em ' + S.mem[n].time + 's' : 'Sem recorde ainda para ' + n + ' pares') + '</span></div><button class="btn acc" data-memgo="1"' + (pairs >= n ? '' : ' disabled style="opacity:.5"') + '>' + ic('play') + 'Jogar</button></div>' + (pairs < n ? '<p class="muted">Poucos pares neste baralho. Escolha “Todas as matérias” ou estude mais aulas.</p>' : '') + '</div><div id="membox"></div>' };
  };
  function memPairs(deck, n) {
    var seen = {}, out = [];
    shuffle(allRegras(deck)).forEach(function (x) { var r = x.r, b = String(r.b || '').trim(); if (!b || b.length > 34 || r.t.length > 76 || seen[b] || !/\d/.test(b)) return; seen[b] = 1; out.push({ id: r.id, t: r.t, b: b }); });
    return out.slice(0, n);
  }
  function memStart() {
    var n = P.ui.memN, ps = memPairs(P.ui.memDeck, n); if (ps.length < n) return;
    var cards = []; ps.forEach(function (p) { cards.push({ pid: p.id, kind: 't', txt: p.t }); cards.push({ pid: p.id, kind: 'b', txt: p.b }); });
    MG = { cards: shuffle(cards), open: [], matched: {}, moves: 0, t0: 0, lock: false, n: n }; clearInterval(mtimer); memShow();
  }
  function memShow() {
    var box = document.getElementById('membox'); if (!box || !MG) return; var cols = MG.n <= 6 ? 4 : 5;
    box.innerHTML = '<div style="margin-top:22px"><div class="row" style="padding:0 0 14px;border:0"><span class="chip">Jogadas: <b id="memmv" style="margin-left:4px">' + MG.moves + '</b></span><span class="chip">' + ic('clock') + '<b id="memt" style="margin-left:4px">0</b>s</span><span class="chip">Pares: <b id="mempr" style="margin-left:4px">' + Object.keys(MG.matched).length + '/' + MG.n + '</b></span></div><div class="mem" style="--cols:' + cols + '">' +
      MG.cards.map(function (c, i) { return '<button class="mc ' + c.kind + '" data-mc="' + i + '" aria-label="Carta"><span class="mc-in"><span class="mc-f mc-b">?</span><span class="mc-f mc-fr">' + esc(c.txt) + '</span></span></button>'; }).join('') + '</div></div>';
  }
  function memFlip(i) {
    if (!MG || MG.lock) return; var btn = document.querySelector('[data-mc="' + i + '"]'); if (!btn || btn.classList.contains('on') || btn.classList.contains('ok')) return;
    if (!MG.t0) { MG.t0 = Date.now(); mtimer = setInterval(function () { var e = document.getElementById('memt'); if (!e) { clearInterval(mtimer); return; } e.textContent = Math.floor((Date.now() - MG.t0) / 1000); }, 500); }
    btn.classList.add('on'); MG.open.push(i);
    if (MG.open.length === 2) {
      MG.moves++; document.getElementById('memmv').textContent = MG.moves; var a = MG.cards[MG.open[0]], b = MG.cards[MG.open[1]], ba = document.querySelector('[data-mc="' + MG.open[0] + '"]');
      if (a.pid === b.pid && a.kind !== b.kind) { MG.matched[a.pid] = 1; MG.open.forEach(function (k) { var e = document.querySelector('[data-mc="' + k + '"]'); e.classList.add('ok'); }); MG.open = []; document.getElementById('mempr').textContent = Object.keys(MG.matched).length + '/' + MG.n; if (Object.keys(MG.matched).length === MG.n) memWin(); }
      else { MG.lock = true; var o = MG.open.slice(); setTimeout(function () { o.forEach(function (k) { var e = document.querySelector('[data-mc="' + k + '"]'); if (e) e.classList.remove('on'); }); MG.open = []; MG.lock = false; }, 1100); }
    }
  }
  function memWin() {
    clearInterval(mtimer); var time = Math.floor((Date.now() - MG.t0) / 1000), best = S.mem[MG.n], rec = !best || MG.moves < best.moves || (MG.moves === best.moves && time < best.time); if (rec) { S.mem[MG.n] = { moves: MG.moves, time: time }; P.save(); }
    setTimeout(function () { var box = document.getElementById('membox'); if (box) box.insertAdjacentHTML('afterbegin', '<div class="card" style="margin-top:22px;text-align:center"><h3>Você completou em ' + MG.moves + ' jogadas e ' + time + 's' + (rec ? ' · novo recorde!' : '') + '</h3><p class="muted" style="margin:6px 0 14px">Cada par que você liga é um artigo a menos para procurar na prova.</p><button class="btn acc" data-memgo="1">Jogar de novo</button></div>'); }, 500);
  }

  /* ===================== ESCRITORIO ===================== */
  function casosDisponiveis() { return (window.C48_CASOS || []).filter(function (c) { return (c.lvl || 0) <= P.lidas(c.mat); }); }
  var desk = '<svg class="mesa-art" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="wd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C79A6B"/><stop offset="1" stop-color="#A97B4F"/></linearGradient><radialGradient id="lamp" cx=".86" cy=".12" r=".7"><stop offset="0" stop-color="#FFE9B0" stop-opacity=".85"/><stop offset="1" stop-color="#FFE9B0" stop-opacity="0"/></radialGradient></defs><rect width="1000" height="560" fill="url(#wd)"/>' +
    [60, 130, 205, 270, 350, 420, 500].map(function (y, i) { return '<path d="M0 ' + y + ' C250 ' + (y + 8 - i % 3 * 5) + ' 600 ' + (y - 8) + ' 1000 ' + (y + 6) + '" stroke="rgba(90,55,25,.22)" stroke-width="' + (1.5 + i % 2) + '" fill="none"/>'; }).join('') +
    '<rect width="1000" height="560" fill="url(#lamp)"/><g transform="translate(860 70)"><ellipse cx="0" cy="40" rx="64" ry="18" fill="rgba(60,35,15,.3)"/><path d="M-40 34 L-20 -10 L26 -10 L46 34Z" fill="#2F3A4F"/><path d="M-6 -10 L-6 -70 L44 -92" stroke="#2F3A4F" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="62" cy="-92" rx="38" ry="16" fill="#3C4A66" transform="rotate(-18 62 -92)"/></g>' +
    '<g transform="translate(110 470)"><ellipse cx="6" cy="34" rx="40" ry="10" fill="rgba(60,35,15,.3)"/><circle cx="0" cy="0" r="34" fill="#F6F1E8"/><circle cx="0" cy="0" r="26" fill="#5B3A22"/><path d="M34 -4 q22 4 8 22" stroke="#F6F1E8" stroke-width="7" fill="none" stroke-linecap="round"/></g>' +
    '<g transform="translate(250 505) rotate(-18)"><rect x="-70" y="-5" width="140" height="10" rx="5" fill="#1F4E9E"/><rect x="62" y="-5" width="22" height="10" rx="5" fill="#D8B24A"/></g>' +
    '<g transform="translate(900 480)"><rect x="-60" y="-34" width="120" height="68" rx="10" fill="#E9E4D8"/><rect x="-52" y="-26" width="104" height="22" rx="4" fill="#9FB8A1"/>' + [0, 1, 2].map(function (r) { return [0, 1, 2, 3].map(function (c) { return '<rect x="' + (-50 + c * 26) + '" y="' + (2 + r * 11) + '" width="20" height="8" rx="2" fill="#CFC8B6"/>'; }).join(''); }).join('') + '</g></svg>';
  function folhaMini(c, i, n) { var m = P.mat(c.mat); return '<button class="fcaso" data-caso="' + c.id + '" style="--r:' + ((i * 7 % 11) - 5) + 'deg;--x:' + ((i % 3) * 18 - 14) + 'px;--y:' + (i * 8) + 'px;--z:' + (n - i) + '" aria-label="Abrir consulta ' + (i + 1) + '"><span class="fc-h">CONSULTA Nº ' + (i + 1) + '</span><span class="fc-m">' + esc(m ? m.nome : c.mat) + '</span><span class="fc-l"></span><span class="fc-l s"></span><span class="fc-l"></span><span class="fc-c">' + esc(c.cliente) + '</span></button>'; }
  V.escritorio = function () {
    var disp = casosDisponiveis(), pend = disp.filter(function (c) { return !S.casos[c.id] || !S.casos[c.id].ok; }), feitos = disp.filter(function (c) { return S.casos[c.id] && S.casos[c.id].ok; }), rever = disp.filter(function (c) { return S.casos[c.id] && !S.casos[c.id].ok; });
    var total = (window.C48_CASOS || []).length, abertoId = P.ui.casoAberto && disp.some(function (c) { return c.id === P.ui.casoAberto; }) ? P.ui.casoAberto : null;
    var pilha = pend.length ? pend.slice(0, 6).map(function (c, i) { return folhaMini(c, i, Math.min(6, pend.length)); }).join('') : '<div class="mesa-vazia">' + (disp.length ? 'Mesa limpa! Você respondeu todos os casos liberados. Estude mais aulas para chegarem novas consultas.' : 'Nenhuma consulta chegou ainda. Marque uma aula como estudada na Biblioteca e os casos daquela matéria aparecem aqui.') + '</div>';
    var lista = function (arr, vazio) { return arr.length ? '<div class="group">' + arr.map(function (c) { var st = S.casos[c.id], m = P.mat(c.mat); return '<button class="row tap" data-caso="' + c.id + '" style="width:100%;text-align:left"><div class="grow"><b>' + esc(c.cliente) + ' · ' + esc(m ? m.nome : c.mat) + '</b><span>' + esc(c.pergunta) + '</span></div>' + (st ? '<span class="chip' + (st.ok ? ' fill' : '') + '">' + (st.ok ? 'Resolvido' : 'Rever') + '</span>' : '<span class="chip">Novo</span>') + '</button>'; }).join('') + '</div>' : '<div class="card empty">' + vazio + '</div>'; };
    return { t: 'Escritório', h: '<span class="eyebrow">Consultoria · ' + disp.length + ' de ' + total + ' casos liberados</span><h1 style="margin:6px 0 10px">Escritório</h1><p class="lead">Clientes chegam com problemas reais. Pegue uma folha da pilha, leia o caso e dê o seu parecer na gaveta. Os casos liberam conforme você estuda as aulas.</p>' +
      '<section class="mesa" id="mesa">' + desk + '<div class="mesa-top"><span class="chip">Na mesa: ' + pend.length + '</span><span class="chip">Resolvidos: ' + feitos.length + '</span><span class="chip">A rever: ' + rever.length + '</span></div><div class="pilha" id="pilha"' + (abertoId ? ' hidden' : '') + '>' + pilha + '</div><div id="aberto">' + (abertoId ? abertoHtml(abertoId) : '') + '</div></section>' +
      '<div class="sec"><h2>Para responder</h2></div>' + lista(pend, 'Nada pendente.') + '<div class="sec"><h2>A rever</h2></div>' + lista(rever, 'Você ainda não errou nenhum caso.') + '<div class="sec"><h2>Resolvidos</h2></div>' + lista(feitos, 'Nenhum caso resolvido ainda.') };
  };
  function abertoHtml(id) {
    var c = (window.C48_CASOS || []).find(function (x) { return x.id === id; }); if (!c) return ''; var m = P.mat(c.mat), st = S.casos[id], resp = P.ui.casoResp;
    var paper = '<article class="papel"><span class="eyebrow">Consulta · ' + esc(m ? m.nome : c.mat) + '</span><h2>' + esc(c.cliente) + '</h2><p class="relato">' + esc(c.relato) + '</p><p class="pergunta"><b>' + esc(c.pergunta) + '</b></p>' + (P.ui.casoDone === id ? '<span class="carimbo ' + (P.ui.casoOk ? 'ok' : 'no') + '">' + (P.ui.casoOk ? 'PARECER CORRETO' : 'REVER') + '</span>' : '') + '</article>';
    var done = P.ui.casoDone === id, refs = done ? P.leiRefs(c.base).slice(0, 3) : [];
    var gaveta = '<div class="gaveta open" id="gaveta"><button class="gv-tab" data-gv="1"><span>Gaveta de pareceres</span><i></i></button><div class="gv-in">' + (done ? '<div class="fb ' + (P.ui.casoOk ? 'ok' : 'no') + '" style="margin-top:0"><h3>' + (P.ui.casoOk ? 'Parecer correto!' : 'Quase. Vamos ao parecer do Petrus.') + '</h3><p>Resposta: <b>' + esc(c.ops[c.gab]) + '</b>. ' + esc(c.exp) + '</p><p class="tiny" style="margin-top:8px">Base legal: ' + esc(c.base) + '</p>' + (refs.length ? '<div class="chips" style="margin-top:8px">' + refs.map(function (x) { return '<a class="chip lei" href="#/vade/' + x.id + '/' + x.art + '">' + ic('law') + esc(x.label) + '</a>'; }).join('') + '</div>' : '') + '</div><div class="chips" style="margin-top:14px"><button class="btn acc" data-casonext="1">Próxima consulta</button><button class="btn ghost" data-casovolta="1">Voltar à pilha</button></div>' :
      '<p class="gv-q">' + esc(c.pergunta) + '</p><div class="gv-ops">' + c.ops.map(function (o, k) { return '<button class="qopt' + (resp === k ? ' sel' : '') + '" data-caso-op="' + k + '"><b>' + 'ABCD'[k] + '</b><span>' + esc(o) + '</span></button>'; }).join('') + '</div><div class="chips" style="margin-top:12px"><button class="btn acc" data-caso-send="1"' + (resp == null ? ' disabled style="opacity:.5"' : '') + '>Dar o parecer</button><button class="btn ghost" data-casovolta="1">Guardar na pilha</button></div>') + '</div></div>';
    return '<div class="abre">' + paper + '</div>' + gaveta;
  }

  /* ===================== eventos ===================== */
  document.addEventListener('click', function (e) {
    var t = e.target, el;
    if ((el = t.closest('[data-fcset]'))) { var kv = el.getAttribute('data-fcset').split(':'); P.ui['fc' + kv[0][0].toUpperCase() + kv[0].slice(1)] = kv[1]; P.render({ keep: true }); return; }
    if (t.closest('[data-fcgo]')) { if (document.getElementById('fcbox')) { fcSession(); var b = document.getElementById('fcbox'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' }); } return; }
    if (t.closest('[data-fcflip]')) { if (FC && !FC.flip) { FC.flip = true; fcShow(); } return; }
    if ((el = t.closest('[data-fcr]'))) { fcRate(+el.getAttribute('data-fcr')); return; }
    if ((el = t.closest('[data-memset]'))) { var m2 = el.getAttribute('data-memset').split(':'); if (m2[0] === 'deck') P.ui.memDeck = m2[1]; else P.ui.memN = +m2[1]; P.render({ keep: true }); return; }
    if (t.closest('[data-memgo]')) { memStart(); var mb = document.getElementById('membox'); if (mb) mb.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if ((el = t.closest('[data-mc]'))) { memFlip(+el.getAttribute('data-mc')); return; }
    if ((el = t.closest('[data-caso]'))) { P.ui.casoAberto = el.getAttribute('data-caso'); P.ui.casoResp = null; P.ui.casoDone = null; P.render({ keep: true }); var ms = document.getElementById('mesa'); if (ms) ms.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if ((el = t.closest('[data-caso-op]'))) { P.ui.casoResp = +el.getAttribute('data-caso-op'); P.$$('[data-caso-op]').forEach(function (b2) { b2.classList.toggle('sel', +b2.getAttribute('data-caso-op') === P.ui.casoResp); }); var sb = document.querySelector('[data-caso-send]'); if (sb) { sb.disabled = false; sb.style.opacity = 1; } return; }
    if (t.closest('[data-caso-send]')) { var c = (window.C48_CASOS || []).find(function (x) { return x.id === P.ui.casoAberto; }); if (!c || P.ui.casoResp == null) return; var ok = P.ui.casoResp === c.gab; S.casos[c.id] = { ok: ok || (S.casos[c.id] && S.casos[c.id].ok) || false, ts: Date.now(), resp: P.ui.casoResp }; if (!ok) S.casos[c.id].ok = false; P.save(); P.ui.casoDone = c.id; P.ui.casoOk = ok; document.getElementById('aberto').innerHTML = abertoHtml(c.id); return; }
    if (t.closest('[data-casovolta]')) { P.ui.casoAberto = null; P.ui.casoDone = null; P.render({ keep: true }); return; }
    if (t.closest('[data-casonext]')) { var disp = casosDisponiveis().filter(function (x) { return !S.casos[x.id] || !S.casos[x.id].ok; }).filter(function (x) { return x.id !== P.ui.casoAberto; }); P.ui.casoAberto = disp.length ? disp[0].id : null; P.ui.casoResp = null; P.ui.casoDone = null; P.render({ keep: true }); return; }
    if (t.closest('[data-gv]')) { var g = document.getElementById('gaveta'); if (g) g.classList.toggle('open'); }
  });
  document.addEventListener('keydown', function (e) {
    if (/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) return;
    if (FC && document.getElementById('fcbox') && FC.i < FC.q.length) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!FC.flip) { FC.flip = true; fcShow(); } } else if (FC.flip && '123'.indexOf(e.key) >= 0 && e.key.length === 1) fcRate(+e.key - 1); }
  });
})();
