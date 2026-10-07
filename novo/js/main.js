/* PETRUS · casca do site: menu lateral, barra superior (voltar, busca, ajustes), roteador, eventos e movimento. */
(function () {
  var P = window.P, $ = P.$, $$ = P.$$, esc = P.esc, ic = P.ic, V = P.V;
  var cur = { route: '', view: null };

  /* ---------- ajustes (cor, modo, tamanho, movimento, menu) ---------- */
  P.railClosed = function () { var s = P.S.set; return s.rail === 'closed' || (s.rail == null && innerWidth < 1180); };
  P.apply = function () {
    var s = P.S.set, r = document.documentElement, mode = s.mode === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : s.mode;
    r.style.setProperty('--accent', s.accent); r.setAttribute('data-mode', mode);
    r.style.setProperty('--fs', s.size); r.setAttribute('data-motion', s.motion);
    var tb = $('#theme'); if (tb) { tb.innerHTML = ic(mode === 'dark' ? 'sun' : 'moon'); tb.setAttribute('aria-label', mode === 'dark' ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'); }
    setTimeout(placeInd, 80); if (P.setBg && cur.route != null) P.setBg(parse());
  };
  /* menu em pilula: abre ao passar o mouse (ou ao tocar) com brilhos roxos 2D */
  var lastBurst = 0;
  function sparkle() {
    var rail = $('.rail'), now = Date.now(); if (!rail || now - lastBurst < 1400 || P.S.set.motion === 'off' || innerWidth <= 820) return; lastBurst = now;
    rail.classList.remove('burst'); void rail.offsetWidth; rail.classList.add('burst'); setTimeout(function () { rail.classList.remove('burst'); }, 1900);
    setTimeout(function () {
      var r = rail.getBoundingClientRect(), box = $('.sparks'), star = '<svg viewBox="0 0 24 24"><path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" fill="url(#spg)"/></svg>';
      for (var i = 0; i < 9; i++) {
        var e = document.createElement('i'); e.className = 'spk'; var s = 6 + Math.random() * 9;
        e.style.cssText = '--s:' + s.toFixed(0) + 'px;--d:' + (1.8 + Math.random() * 1.2).toFixed(2) + 's;--dl:' + (Math.random() * .9).toFixed(2) + 's;left:' + (r.left - 12 + Math.random() * (r.width + 24)).toFixed(0) + 'px;top:' + (r.top - 10 + Math.random() * (r.height + 20)).toFixed(0) + 'px';
        e.innerHTML = star; box.appendChild(e); (function (n) { setTimeout(function () { n.remove(); }, 3600); })(e);
      }
    }, 140);
  }
  function initRail() {
    var rail = $('.rail'); if (!rail) return;
    var sp = document.createElement('div'); sp.className = 'sparks'; sp.innerHTML = '<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="spg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9C2FF"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs></svg>'; document.body.appendChild(sp);
    rail.addEventListener('mouseenter', function () { sparkle(); [250, 520, 800].forEach(function (t) { setTimeout(placeInd, t); }); });
    rail.addEventListener('mouseleave', function () { [250, 520, 800].forEach(function (t) { setTimeout(placeInd, t); }); });
    rail.addEventListener('click', function (e) { if (innerWidth <= 1024 && !rail.classList.contains('open') && !e.target.closest('a')) { rail.classList.add('open'); sparkle(); } });
    document.addEventListener('click', function (e) { if (!rail.contains(e.target)) rail.classList.remove('open'); });
  }
  function toast(t) { var e = document.createElement('div'); e.className = 'toast'; e.textContent = t; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 2500); }

  /* ---------- fundo diferente para cada secao (paisagem 2D) ---------- */
  var THEMES = { inicio: { hue: 262, hue2: 305, seed: 5 }, cronograma: { hue: 345, hue2: 38, sun: 1, seed: 8 }, biblioteca: { hue: 200, hue2: 165, seed: 12 }, teste: { hue: 200, hue2: 165, seed: 12 }, flashcards: { hue: 268, hue2: 320, stars: 1, seed: 61 }, memoria: { hue: 172, hue2: 120, seed: 62 }, escritorio: { hue: 32, hue2: 350, sun: 1, seed: 63 }, erros: { hue: 12, hue2: 340, seed: 41 }, simulados: { hue: 28, hue2: 350, sun: 1, seed: 31 }, simulado: { hue: 28, hue2: 350, sun: 1, seed: 31 }, vade: { hue: 232, hue2: 285, stars: 1, seed: 15 }, agenda: { hue: 352, hue2: 40, sun: 1, seed: 19 }, notas: { hue: 150, hue2: 95, seed: 23 }, config: { hue: 270, hue2: 300, sat: .55, seed: 27 }, busca: { hue: 262, hue2: 305, seed: 5 } };
  var bgCache = {}, bgKey = '', bgFlip = 0;
  P.setBg = function (r, force) {
    var key = r.base, th = THEMES[key] || THEMES.inicio;
    if (r.base === 'materia' || r.base === 'aula') { var h = PArt.hueOf(r.p[1]); th = { hue: h, hue2: h + 55, seed: 30 + h % 17, sun: PArt.kindOf(r.p[1]) === 2 ? 1 : 0 }; key = 'materia/' + r.p[1]; }
    var dark = document.documentElement.getAttribute('data-mode') === 'dark', ck = key + (dark ? '|d' : '|l');
    if (!force && ck === bgKey) return; bgKey = ck;
    var html = bgCache[ck] || (bgCache[ck] = PArt.bg(Object.assign({ night: dark }, th)));
    var a = $('.bgl.a'), b = $('.bgl.b'); if (!a || !b) return;
    var next = bgFlip ? a : b, prev = bgFlip ? b : a; bgFlip = 1 - bgFlip;
    next.innerHTML = html; next.classList.add('on'); prev.classList.remove('on');
  };

  /* ---------- menu lateral ---------- */
  var NAV = [['inicio', 'Início', 'home'], ['cronograma', 'Cronograma', 'cal'], ['biblioteca', 'Biblioteca', 'book'], ['simulados', 'Simulados', 'target'], ['flashcards', 'Flashcards', 'cards'], ['memoria', 'Jogo da memória', 'grid4'], ['escritorio', 'Escritório', 'desk'], ['vade', 'Vade Mecum', 'law'], ['agenda', 'Agenda', 'clock'], ['notas', 'Anotações', 'note']];
  function buildRail() {
    var n0 = 0, st = function () { return ' style="--i:' + (n0++) + '"'; };
    var h = '<i class="ind" id="ind"></i><div class="brand"' + st() + '><span class="bl"><i>P</i><span class="lb">Petrus</span></span></div><div class="grp"' + st() + '>Estudar</div>';
    NAV.forEach(function (n, i) {
      if (i === 4) h += '<div class="grp"' + st() + '>Praticar</div>'; if (i === 7) h += '<div class="grp"' + st() + '>Consultar</div>'; if (i === 9) h += '<div class="grp"' + st() + '>Seu espaço</div>';
      h += '<a href="#/' + n[0] + '" data-r="' + n[0] + '" title="' + n[1] + '"' + st() + '>' + ic(n[2]) + '<span class="lb">' + n[1] + '</span></a>';
    });
    h += '<div class="sp"></div><a href="#/config" data-r="config" title="Ajustes"' + st() + '>' + ic('gear') + '<span class="lb">Ajustes</span></a>';
    $('.rail').innerHTML = h;
  }
  function placeInd() {
    var ind = $('#ind'), on = $('.rail > a.on'); if (!ind) return;
    if (!on || innerWidth <= 820) { ind.style.opacity = 0; return; }
    ind.style.opacity = 1; ind.style.top = on.offsetTop + 'px'; ind.style.height = on.offsetHeight + 'px';
  }
  function markRail(r) {
    $$('.rail > a[data-r]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-r') === r.base || ((r.base === 'materia' || r.base === 'aula' || r.base === 'teste' || r.base === 'erros') && a.getAttribute('data-r') === 'biblioteca') || (r.base === 'simulado' && a.getAttribute('data-r') === 'simulados')); });
    var sub = $('#subLib'); if (sub) { sub.classList.toggle('open', r.base === 'biblioteca' || r.base === 'materia'); $$('a', sub).forEach(function (a) { a.classList.toggle('on', r.base === 'materia' && a.getAttribute('data-m') === r.p[1]); }); }
    [30, 350, 650].forEach(function (t) { setTimeout(placeInd, t); });
  }
  window.addEventListener('resize', function () { P.apply(); });

  /* ---------- roteador ---------- */
  function parse() { var p = (location.hash || '#/inicio').replace(/^#\/?/, '').split('/'); if (!p[0]) p[0] = 'inicio'; return { base: p[0], p: p, key: p.join('/') }; }
  function build(r) {
    var p = r.p;
    switch (r.base) {
      case 'cronograma': return V.cronograma(p[1]);
      case 'biblioteca': return V.biblioteca();
      case 'aula': return V.aula(p[1], p[2]);
      case 'flashcards': return V.flashcards();
      case 'memoria': return V.memoria();
      case 'escritorio': return V.escritorio();
      case 'teste': return V.teste(p[1], p[2], p[3]);
      case 'erros': return V.erros();
      case 'simulados': return V.simulados();
      case 'simulado': return V.simulado(p[1], p[2]);
      case 'materia': return V.materia(p[1], p[2], p[3]);
      case 'vade': return V.vade(p[1], p[2]);
      case 'agenda': return V.agenda();
      case 'notas': return V.notas();
      case 'busca': return V.busca(p.slice(1).join('/'));
      case 'config': return V.config();
      default: return V.inicio();
    }
  }
  function render(o) {
    o = o || {}; var r = parse(), v; var sy = window.scrollY; document.body.classList.remove('foco');
    try { v = build(r); } catch (e) { console.error(e); v = { t: 'Erro', h: '<div class="card empty">Não consegui montar esta tela: ' + esc(e.message) + '</div>' }; }
    cur.view = v; cur.route = r.key;
    var box = $('#view'); box.className = 'view' + (o.keep ? ' na' : ''); box.innerHTML = v.h;
    $('#ttl').textContent = v.t || 'Petrus'; document.title = (v.t || 'Petrus') + ' · Petrus';
    var back = $('#back'); back.disabled = r.base === 'inicio'; markRail(r); P.setBg(r);
    if (o.keep) window.scrollTo(0, sy); else window.scrollTo(0, 0);
    if (v.post) v.post(); initParallax();
  }
  P.render = render;
  window.addEventListener('hashchange', function () { render(); });

  /* ---------- paralaxe das cenas ---------- */
  var par = null;
  function initParallax() { par = $$('.scene'); }
  document.addEventListener('pointermove', function (e) {
    if (!par || !par.length || P.S.set.motion === 'off') return;
    par.forEach(function (sc) {
      var r = sc.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      $$('.ly', sc).forEach(function (l) { var d = +l.getAttribute('data-d') || 0; l.style.transform = 'translate3d(' + (-dx * d * 70).toFixed(1) + 'px,' + (-dy * d * 26).toFixed(1) + 'px,0)'; });
    });
  }, { passive: true });
  window.addEventListener('scroll', function () {
    if (!par || P.S.set.motion === 'off') return;
    par.forEach(function (sc) { var r = sc.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; var k = -r.top; $$('.ly', sc).forEach(function (l) { l.style.marginTop = (k * (+l.getAttribute('data-d') || 0) * .12).toFixed(1) + 'px'; }); });
  }, { passive: true });

  /* ---------- eventos ---------- */
  function readNote() { var t = $('#nt'), x = $('#nx'), m = $('#nm'); return { t: t.value.trim(), x: x.value.trim(), mat: m.value }; }
  /* clique na pasta: ela abre e depois vira a tela da materia (transicao com movimento) */
  document.addEventListener('click', function (e) {
    var f = e.target.closest('a[data-folder]'); if (!f || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var href = f.getAttribute('href');
    if (P.S.set.motion === 'off' || !document.startViewTransition || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    e.preventDefault(); if (f.classList.contains('opening')) return;
    f.classList.add('opening'); f.style.viewTransitionName = 'matcard';
    setTimeout(function () {
      var vt = document.startViewTransition(function () { history.pushState(null, '', href); render(); });
      vt.finished.then(function () { f.style.viewTransitionName = ''; }, function () { });
    }, 560);
  });
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return; var a = el.getAttribute('data-act'), S = P.S, d = el.dataset;
    if (a === 'vf' || a === 'lf') return;
    if (a === 'tip') { S.tip++; P.save(); render({ keep: true }); }
    else if (a === 'task') { var t = P.dia(d.iso).tarefas[+d.i]; P.toggleDone(d.iso, t); render({ keep: true }); }
    else if (a === 'day') { location.hash = '#/cronograma/' + d.iso; }
    else if (a === 'mon') { var k = Object.keys(P.CRO.dias).filter(function (x) { return x.slice(0, 7) === d.m; }).sort(); if (k.length) location.hash = '#/cronograma/' + k[0]; }
    else if (a === 'libf') { P.ui.lib = d.f; render({ keep: true }); }
    else if (a === 'mtab') { location.hash = '#/materia/' + d.id + '/' + d.tab; }
    else if (a === 'tipf') { P.ui.tipoDica = d.k; render({ keep: true }); }
    else if (a === 'read') {
      var key = d.id + ':' + d.i, rd = !S.read[key]; P.marcaLida(d.id, +d.i, rd);
      var det = el.closest('details'), did = det && det.id; render({ keep: true }); if (did) { var nd = document.getElementById(did); if (nd) nd.open = true; }
      toast(rd ? 'Aula estudada. Revisões marcadas: D+1, D+3, D+7, D+15 e D+30' : 'Marcação removida');
    }
    else if (a === 'leimore') { P.lei.lim += 100; P.renderLei(); }
    else if (a === 'noteadd') { var n = readNote(); if (!n.x && !n.t) { toast('Escreva algo para salvar'); return; } S.notes.push({ id: Date.now().toString(36), t: n.t, x: n.x, mat: n.mat, ts: Date.now() }); P.save(); toast('Anotação salva'); render({ keep: true }); }
    else if (a === 'notedel') { S.notes = S.notes.filter(function (x) { return x.id !== d.id; }); P.save(); render({ keep: true }); }
    else if (a === 'ck') { if (S.ck[d.id]) delete S.ck[d.id]; else S.ck[d.id] = 1; P.save(); render({ keep: true }); }
    else if (a === 'accent') { S.set.accent = d.c; P.save(); P.apply(); render({ keep: true }); }
    else if (a === 'mode') { S.set.mode = d.v; P.save(); P.apply(); render({ keep: true }); }
    else if (a === 'size') { S.set.size = +d.v; P.save(); P.apply(); render({ keep: true }); }
    else if (a === 'motion') { S.set.motion = S.set.motion === 'off' ? 'on' : 'off'; P.save(); P.apply(); render({ keep: true }); }
    else if (a === 'export') {
      var blob = new Blob([JSON.stringify({ exportado: new Date().toISOString(), progresso: { lidas: S.read, tarefas: S.done, checklist: S.ck }, notas: S.notes }, null, 2)], { type: 'application/json' }), u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = 'petrus-progresso.json'; l.click(); setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
    }
    else if (a === 'reset') { if (el.getAttribute('data-sure')) { S.read = {}; S.done = {}; S.ck = {}; P.save(); toast('Progresso zerado'); render({ keep: true }); } else { el.setAttribute('data-sure', '1'); el.textContent = 'Confirmar?'; setTimeout(function () { el.removeAttribute('data-sure'); el.textContent = 'Zerar'; }, 4000); } }
  });
  document.addEventListener('input', function (e) {
    var a = e.target.getAttribute && e.target.getAttribute('data-act');
    if (a === 'vf') { P.ui.vade = e.target.value; render({ keep: true }); }
    else if (a === 'lf' && P.lei) { P.lei.q = e.target.value; P.lei.lim = 60; P.renderLei(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.target.id === 'gs' && e.key === 'Enter') { var q = e.target.value.trim(); if (q) location.hash = '#/busca/' + encodeURIComponent(q); }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) { e.preventDefault(); var g = $('#gs'); if (g) g.focus(); }
  });
  $('#back').addEventListener('click', function () { var b = cur.view && cur.view.back; if (b) location.hash = b; else if (history.length > 1) history.back(); else location.hash = '#/inicio'; });
  $('#cfg').innerHTML = ic('gear');
  $('#cfg').addEventListener('click', function () { location.hash = '#/config'; });
  $('#theme').addEventListener('click', function (e) {
    e.stopPropagation();
    var dark = document.documentElement.getAttribute('data-mode') === 'dark', next = dark ? 'light' : 'dark', r = e.currentTarget.getBoundingClientRect();
    var go = function () { P.S.set.mode = next; P.save(); P.apply(); if (cur.route === 'config') render({ keep: true }); };
    if (!document.startViewTransition || P.S.set.motion === 'off') { go(); return; }
    document.documentElement.classList.add('vt-theme');
    var vt = document.startViewTransition(go);
    vt.finished.then(function () { document.documentElement.classList.remove('vt-theme'); }, function () { document.documentElement.classList.remove('vt-theme'); });
  });

  /* ---------- partida ---------- */
  function boot() {
    var dias = P.daysTo(P.CFG.prova); $('#cnt').textContent = dias; buildRail(); initRail(); P.apply();
    matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', P.apply);
    if (!location.hash) location.hash = '#/inicio'; else render();
    if (!P.LIST.length) $('#view').innerHTML = '<div class="card empty">Os dados do Petrus não carregaram. Rode tools\\sync-dados.ps1.</div>';
  }
  boot();
})();
