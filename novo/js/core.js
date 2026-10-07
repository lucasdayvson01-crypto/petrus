/* PETRUS · nucleo: estado, datas, texto das aulas e leitura do cerebro do professor (banco de regras, curso, cronograma). */
(function () {
  var P = window.P = {};
  P.$ = function (s, r) { return (r || document).querySelector(s); };
  P.$$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  P.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---- estado salvo neste aparelho (independente do Caderno 48) ---- */
  var KEY = 'petrus.novo.v1', S = null;
  try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { }
  S = S || {};
  S.set = Object.assign({ accent: '#0A84FF', mode: 'light', size: 1, motion: 'on', rail: null }, S.set || {});
  S.read = S.read || {}; S.done = S.done || {}; S.notes = S.notes || []; S.ck = S.ck || {}; S.tip = S.tip || 0;
  P.S = S;
  P.save = function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };

  /* ---- datas ---- */
  P.pad = function (n) { return String(n).padStart(2, '0'); };
  P.iso = function (d) { return d.getFullYear() + '-' + P.pad(d.getMonth() + 1) + '-' + P.pad(d.getDate()); };
  P.today = function () { return P.iso(new Date()); };
  P.parse = function (s) { var a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
  P.fmt = function (s, o) { return P.parse(s.slice(0, 10)).toLocaleDateString('pt-BR', o || { day: '2-digit', month: 'short' }).replace('.', ''); };
  P.daysTo = function (s) { var a = P.parse(s.slice(0, 10)), t = P.parse(P.today()); return Math.round((a - t) / 864e5); };
  P.hm = function (min) { var h = Math.floor(min / 60), m = min % 60; return h ? h + 'h' + (m ? P.pad(m) : '') : m + ' min'; };

  /* ---- dados do cerebro ---- */
  var CFG = P.CFG = window.C48_CFG || {}, CRO = P.CRO = window.C48_CRONO || { materias: [], dias: {} }, CUR = P.CUR = window.C48_CURSO || {}, CER = P.CER = window.C48_CEREBRO || { mats: {}, cards: [] };
  /* aulas extras (temas sem bloco): vão ao fim, para não mudar a posição das aulas do cronograma */
  (function () {
    var X = window.C48_CURSO_EXTRA || {};
    Object.keys(X).forEach(function (m) {
      if (!CUR[m]) CUR[m] = { blocos: [] };
      if (!CUR[m].blocos) CUR[m].blocos = [];
      X[m].forEach(function (b) { if (!CUR[m].blocos.some(function (e) { return e.t === b.t; })) CUR[m].blocos.push(b); });
    });
  })();
  P.ROT = window.C48_ROTINA || {}; P.LEIS = window.C48_LEIS_IDX || []; P.FGV = (window.C48_FGVDICAS && window.C48_FGVDICAS.dicas) || [];
  var MAT = window.C48_MAT || [];
  P.LIST = (CRO.materias || []).map(function (cm) {
    var m = MAT.find(function (x) { return x.id === cm.id; }) || {};
    return Object.assign({}, cm, { grupo: m.grupo || (cm.id === 'fgv' ? 'principal' : ''), unid: m.unid || [], nome: cm.id === 'fgv' ? 'Aula 0 · Como a FGV pensa' : (m.nome || cm.nome) });
  });
  P.mat = function (id) { return P.LIST.find(function (m) { return m.id === id; }); };
  P.blocos = function (id) { return (CUR[id] && CUR[id].blocos) || []; };
  P.regras = function (id) { return (CER.mats[id] && CER.mats[id].regras) || []; };
  P.temas = function (id) { return ((CER.mats[id] && CER.mats[id].temas) || []).slice().sort(function (a, b) { return b.n - a.n; }); };
  P.isRead = function (id, i) { return !!S.read[id + ':' + i]; };
  P.matProg = function (id) { var n = P.blocos(id).length; if (!n) return 0; var c = 0; for (var i = 0; i < n; i++) if (S.read[id + ':' + i]) c++; return Math.round(c * 100 / n); };
  P.totalProg = function () { var n = 0, c = 0; P.LIST.forEach(function (m) { var b = P.blocos(m.id).length; n += b; for (var i = 0; i < b; i++) if (S.read[m.id + ':' + i]) c++; }); return n ? Math.round(c * 100 / n) : 0; };

  /* cronograma */
  P.dia = function (iso) { return (CRO.dias || {})[iso]; };
  P.tkey = function (t) { return t.k + ':' + t.key; };
  P.isDone = function (iso, t) { return !!(S.done[iso] && S.done[iso][P.tkey(t)]); };
  P.toggleDone = function (iso, t) { S.done[iso] = S.done[iso] || {}; var k = P.tkey(t); if (S.done[iso][k]) delete S.done[iso][k]; else S.done[iso][k] = 1; P.save(); };
  P.doneCount = function (iso) { var d = P.dia(iso); if (!d) return [0, 0]; var c = 0; d.tarefas.forEach(function (t) { if (P.isDone(iso, t)) c++; }); return [c, d.tarefas.length]; };
  P.kLabel = { novo: 'Aula nova', rev: 'Revisão', bateria: 'Bateria de questões', reforco: 'Reforço', revgeral: 'Revisão geral', correcao: 'Correção', sim: 'Simulado', livre: 'Estudo livre', vespera: 'Véspera' };
  /* dia de estudo em foco: hoje, ou o proximo dia com plano (o cronograma comeca em 07/10) */
  P.diaFoco = function () { var t = P.today(); if (P.dia(t)) return t; var k = Object.keys(P.CRO.dias || {}).filter(function (x) { return x >= t; }).sort(); return k[0] || t; };
  P.matAtual = function (iso) {
    iso = iso || P.today();
    var l = P.LIST.filter(function (m) { return m.id !== 'fgv'; });
    return l.find(function (m) { return m.ini <= iso && iso <= m.fim; }) || P.LIST.find(function (m) { return m.ini <= iso && iso <= m.fim; }) || l.find(function (m) { return m.ini > iso; }) || l[0];
  };
  P.minRestantes = function () { var t = P.today(), s = 0; Object.keys(CRO.dias || {}).forEach(function (k) { if (k >= t) s += (CRO.dias[k].min || 0); }); return s; };

  /* dicas: do banco de regras e das dicas da prova */
  function hashStr(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  P.dicaProva = function (off) { var L = P.FGV; if (!L.length) return null; var i = (Math.floor(Date.now() / 864e5) + (off || 0) + (S.tip || 0)) % L.length; return L[(i + L.length) % L.length]; };
  P.pegadinhaDia = function () {
    var all = []; Object.keys(CER.mats || {}).forEach(function (id) { (CER.mats[id].regras || []).forEach(function (r) { if (r.k === 'pegadinha') all.push({ m: id, r: r }); }); });
    if (!all.length) return null; return all[hashStr(P.today()) % all.length];
  };
  P.kinds = { pegadinha: ['Pegadinha', 'kpg'], regra: ['Regra', 'kreg'], prazo: ['Prazo', 'kpr'], metodo: ['Método', 'kme'], padrao: ['Padrão FGV', 'kpa'], mnemonico: ['Macete', 'kmn'] };

  /* janelas de estudo: horarios livres da rotina + recomendacao de uso */
  var toMin = function (h) { var a = h.split(':'); return +a[0] * 60 + +a[1]; };
  var toHM = function (m) { return P.pad(Math.floor(m / 60)) + ':' + P.pad(m % 60); };
  P.janelas = function (dow) {
    var blocks = (P.ROT[dow] || []).map(function (b) { return [toMin(b.h), toMin(b.f)]; }).sort(function (a, b) { return a[0] - b[0]; });
    var out = [], cur = 6 * 60, end = 23 * 60;
    blocks.concat([[end, end]]).forEach(function (b) { if (b[0] - cur >= 60) out.push([cur, Math.min(b[0], end)]); cur = Math.max(cur, b[1]); });
    return out.map(function (w) {
      var h = w[0] / 60, tipo, why, score;
      if (h >= 7.5 && h < 12) { tipo = 'Aula nova'; why = 'Mente fresca: o melhor horário para conteúdo difícil.'; score = 3; }
      else if (h >= 13.5 && h < 18) { tipo = 'Questões'; why = 'Boa para treino: atenção estável e pausas fáceis.'; score = 2; }
      else if (h >= 18 && h < 22.5) { tipo = 'Revisão D1/D2'; why = 'Revisar à noite ajuda a fixar antes de dormir.'; score = 2; }
      else { tipo = 'Janela curta'; why = 'Use para flashcards ou reler as dicas.'; score = 1; }
      return { de: toHM(w[0]), ate: toHM(w[1]), min: w[1] - w[0], tipo: tipo, why: why, score: score };
    }).sort(function (a, b) { return b.score - a.score || b.min - a.min; });
  };

  /* texto das aulas: markdown leve com caixas (Exemplo, Pegadinha...) */
  var CALLS = [['Exemplo', 'co-ex', 'Exemplo'], ['Pegadinha', 'co-pg', 'Pegadinha'], ['Como fixar', 'co-fx', 'Como fixar'], ['Diferença-chave', 'co-fx', 'Diferença'], ['Importante', 'co-pg', 'Importante'], ['Agora faça', 'co-go', 'Agora faça'], ['Aviso', 'co-pg', 'Aviso']];
  P.md = function (s) {
    var inl = function (t) { return P.esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>'); };
    return String(s || '').split(/\n{2,}/).map(function (b) {
      var ls = b.split('\n');
      if (ls.length > 2 && ls.every(function (l) { return /^\s*\|.*\|\s*$/.test(l); }) && /^\s*\|[\s:|-]+\|\s*$/.test(ls[1])) {
        var cells = function (l) { return l.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return inl(c.trim()); }); };
        return '<div class="tbw"><table class="tb"><thead><tr>' + cells(ls[0]).map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' + ls.slice(2).map(function (l) { return '<tr>' + cells(l).map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
      }
      if (ls.every(function (l) { return /^\s*\d+\. /.test(l); })) return '<ol>' + ls.map(function (l) { return '<li>' + inl(l.replace(/^\s*\d+\. /, '')) + '</li>'; }).join('') + '</ol>';
      if (ls.every(function (l) { return /^\s*[-*] /.test(l); })) return '<ul>' + ls.map(function (l) { return '<li>' + inl(l.replace(/^\s*[-*] /, '')) + '</li>'; }).join('') + '</ul>';
      var call = CALLS.find(function (c) { return b.startsWith('**' + c[0]); }), body = ls.map(inl).join('<br>');
      if (call) return '<div class="co ' + call[1] + '"><span class="cl">' + call[2] + '</span><p>' + body + '</p></div>';
      return '<p>' + body + '</p>';
    }).join('');
  };

  /* icones (tracos finos, estilo SF Symbols) */
  var I = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    book: '<path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M17 8h2v12h-2"/>',
    law: '<path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-2.5 6a3 3 0 0 0 5 0zM19 8l-2.5 6a3 3 0 0 0 5 0z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    note: '<path d="M6 3.5h9l4 4V20a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 20z"/><path d="M14.5 3.5V8H19M9 13h6M9 16.5h4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 14.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.1 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.1l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.9 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    cards: '<rect x="4" y="7" width="13" height="12" rx="2.5"/><path d="M8 4h10.5A1.5 1.5 0 0 1 20 5.5V16"/>', grid4: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>', desk: '<path d="M3 11h18v2H3z"/><path d="M5 13v6M19 13v6M9 11V7l5-3"/><circle cx="15" cy="4.5" r="1.2"/>', target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>', lock: '<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    back: '<path d="M15 5l-7 7 7 7"/>', fwd: '<path d="M9 5l7 7-7 7"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', pin: '<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v7"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', play: '<path d="M8 5.5v13l11-6.5z"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13"/>', down: '<path d="M6 9l6 6 6-6"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>', flag: '<path d="M5 21V4M5 5h12l-2 4 2 4H5"/>'
  };
  /* icone de linha fina por materia (capas minimalistas) */
  var MI = {
    fgv: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
    etica: '<path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    const: '<path d="M3 9l9-5 9 5z"/><path d="M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18"/>',
    dh: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.3"/><path d="M16 14.2a4.5 4.5 0 0 1 4.5 4.3"/>',
    civil: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
    pcivil: '<path d="M13 4l4 4-6 6-4-4z"/><path d="M11 10l-6.5 6.5a1.4 1.4 0 0 0 2 2L13 12"/><path d="M4 21h9"/>',
    penal: '<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    ppenal: '<path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-2.5 6a3 3 0 0 0 5 0zM19 8l-2.5 6a3 3 0 0 0 5 0z"/>',
    adm: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M10 20v-3h4v3"/>',
    trib: '<circle cx="12" cy="12" r="8.5"/><path d="M9 15l6-6"/><circle cx="9.5" cy="9.5" r=".9"/><circle cx="14.5" cy="14.5" r=".9"/>',
    trab: '<rect x="4" y="8" width="16" height="11" rx="2.5"/><path d="M9 8V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2M4 13h16"/>',
    ptrab: '<rect x="6" y="5" width="12" height="15" rx="2.5"/><path d="M9.5 5V4h5v1M9 11h6M9 15h4"/>',
    emp: '<path d="M4 20V10M10 20V5M16 20v-7M22 20H2"/>',
    cons: '<path d="M6 8h12l1 12H5z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    eca: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
    fil: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    amb: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19l8-8"/>',
    int: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17"/>',
    prev: '<path d="M3.5 12a8.5 8.5 0 0 1 17 0z"/><path d="M12 12v6a2 2 0 0 0 4 0"/>',
    elei: '<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11l1.5-5h5L16 11M10 15h4"/>',
    fin: '<rect x="3.5" y="6" width="17" height="13" rx="3"/><path d="M3.5 10h17M16 14.5h.01"/>'
  };
  P.mic = function (id) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (MI[id] || MI.fgv) + '</svg>'; };
  P.ic = function (n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (I[n] || '') + '</svg>'; };
})();
