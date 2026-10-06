(function () {
'use strict';
const CFG = window.C48_CFG, MAT = window.C48_MAT, DICAS = window.C48_DICAS || [];
const HIST = window.C48_HIST || [], NOT = window.C48_NOT || [];
const KEY = 'petrus.site.v1';
const C48 = { id: 'c48', nome: 'Caderno 48', cor: '#6C151E', special: true };
const TIPOS = ['conceito', 'literalidade', 'atenção', 'tempo', 'chute'];
const GRUPO = { min15: 'Mínimo de 15%', principal: 'Principal', leve: 'Manutenção' };

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmt = s => { const d = parse(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const today = () => iso(new Date());
const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const uid = () => Math.random().toString(36).slice(2, 9);
const WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const hm = m => { m = Math.round(m); return m >= 60 ? `${Math.floor(m / 60)}h${pad(m % 60)}` : `${m} min`; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- estado ---------- */
function defaults() {
  return { cfg: { hWeek: 2.5, hWeekend: 4, unitMin: 75 }, units: {}, pages: {}, errors: [], simulados: [], questions: [],
    checklist: {}, rate: {}, hours: {}, links: {}, lembretes: [], simDone: {}, qh: {}, profile: {}, theme: 'claro', leve: {}, conq: {}, sono: '23:00', bestStreak: 0, vm: {}, notas: [], duvidas: [] };
}
const QR = window.C48_QR || [];
const allQ = () => QR.concat(S.questions);
const QRIDS = new Set(QR.map(q => q.id));
const histOf = q => QRIDS.has(q.id) ? (S.qh[q.id] || []) : (q.hist || []);
const addHist = (q, ok) => { const h = { d: today(), ok }; if (QRIDS.has(q.id)) (S.qh[q.id] = S.qh[q.id] || []).push(h); else (q.hist = q.hist || []).push(h); };
let S;
try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = defaults(); }
S.cfg = Object.assign(defaults().cfg, S.cfg);
Object.entries(window.C48_DIAG || {}).forEach(([k, v]) => { if (S.rate[k] === undefined) S.rate[k] = v; });
function save() { S._t = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Não consegui salvar no navegador. Exporte um backup.'); } dbSoon(); }
function toast(t) { const e = document.createElement('div'); e.className = 'toast'; e.textContent = t; document.body.appendChild(e); setTimeout(() => e.remove(), 2200); }

/* ---------- fases, capacidade, simulados ---------- */
const faseOf = ds => CFG.fases.find(f => ds >= f.ini && ds <= f.fim);
function simDates() {
  const out = []; let d = parse('2026-10-25'); const end = parse('2027-01-03');
  while (d <= end) { const ds = iso(d); const f = faseOf(ds);
    out.push({ d: ds, tipo: (f && (f.id === 'P2' || f.id === 'P3')) || ds === '2026-11-15' ? 'mini' : 'completo' }); d = addDays(d, 7); }
  return out;
}
const SIMS = simDates();
const isSim = ds => SIMS.some(s => s.d === ds);
function dayMin(ds) { const wd = parse(ds).getDay(); return ((wd === 0 || wd === 6) ? S.cfg.hWeekend : S.cfg.hWeek) * 60; }
function dayCap(ds) { const f = faseOf(ds); if (!f || !f.novo || isSim(ds)) return 0; return dayMin(ds) * f.mult * f.novo / S.cfg.unitMin; }
function capRange(a, b) { let c = 0, d = parse(a); const e = parse(b); while (d <= e) { c += dayCap(iso(d)); d = addDays(d, 1); } return c; }
const START = CFG.fases[0].ini, END = CFG.fases[CFG.fases.length - 1].fim;

/* ---------- unidades, fila, status ---------- */
function queue() {
  const all = [];
  MAT.forEach((m, mi) => m.unid.forEach((u, i) => all.push({ k: m.id + ':' + i, m, i, u, mi })));
  return all.sort((a, b) => a.m.ciclo - b.m.ciclo || a.i - b.i || a.mi - b.mi);
}
const QUEUE = queue();
const isDone = k => !!(S.units[k] && S.units[k].d);
function ust(k) {
  const u = S.units[k]; if (!u || !u.d) return 'new';
  return CFG.revisoes.every(o => u.rev && u.rev[o]) ? 'ok' : 'rev';
}
const STL = { new: 'não estudado', rev: 'revisar', ok: 'consolidado' };
const unitByKey = k => QUEUE.find(x => x.k === k);

/* ---------- revisões ---------- */
function dueItems() {
  const items = [];
  Object.entries(S.units).forEach(([k, u]) => { if (!u.d) return; const q = unitByKey(k); if (!q) return;
    CFG.revisoes.forEach(o => items.push({ kind: 'u', k, o, due: iso(addDays(parse(u.d), o)), done: !!(u.rev && u.rev[o]), label: q.u, sub: q.m.nome })); });
  S.errors.forEach(e => CFG.revisoes.forEach(o => items.push({ kind: 'e', k: e.id, o, due: iso(addDays(parse(e.d), o)), done: !!(e.rev && e.rev[o]),
    label: 'Erro: ' + (e.topico || 'sem tópico'), sub: e.materia })));
  return items.sort((a, b) => a.due.localeCompare(b.due));
}
const pending = (t = today()) => dueItems().filter(i => !i.done && i.due <= t);

/* ---------- ficha ABCD ---------- */
const FICHAS = CFG.fichas || [];
function fichaDoDia(ds) { return FICHAS.length ? FICHAS[((diffDays(CFG.fases[0].ini, ds) % FICHAS.length) + FICHAS.length) % FICHAS.length] : null; }
function nextUnit(ds) {
  const fi = fichaDoDia(ds);
  if (fi) { const x = QUEUE.find(q => !isDone(q.k) && fi.mats.includes(q.m.id)); if (x) return x; }
  return QUEUE.find(q => !isDone(q.k)) || null;
}
/* ---------- tempo, constância, nota ---------- */
const minToday = () => S.hours[today()] || 0;
function logSess(m, k) { S.sess = S.sess || []; S.sess.push({ t: Date.now(), m: m, k: k || null }); if (S.sess.length > 600) S.sess = S.sess.slice(-600); }
function horarios() {
  const hrs = new Array(24).fill(0), ev = new Array(24).fill(0);
  (S.sess || []).forEach(x => { const h = new Date(x.t).getHours(); hrs[h] += x.m || 0; ev[h]++; });
  const turno = h => h >= 5 && h < 12 ? 'manhã' : h < 18 && h >= 12 ? 'tarde' : h >= 18 ? 'noite' : 'madrugada';
  const tt = { manhã: 0, tarde: 0, noite: 0, madrugada: 0 }; hrs.forEach((m, h) => { tt[turno(h)] += m + ev[h] * 5; });
  const top = Object.entries(tt).sort((a, b) => b[1] - a[1])[0];
  return { hrs, ev, tt, melhor: top && top[1] > 0 ? top[0] : null, n: (S.sess || []).length };
}
const metaDia = ds => (S.leve && S.leve[ds]) ? 30 : CFG.minimoDiaMin;
const metaHoje = () => metaDia(today());
function streak() {
  let n = 0, d = parse(today());
  if ((S.hours[iso(d)] || 0) >= metaDia(iso(d))) n++;
  d = addDays(d, -1);
  while ((S.hours[iso(d)] || 0) >= metaDia(iso(d))) { n++; d = addDays(d, -1); }
  return n;
}
function progress() {
  const total = QUEUE.length, done = QUEUE.filter(x => isDone(x.k)).length, ok = QUEUE.filter(x => ust(x.k) === 'ok').length;
  const exp = Math.min(total, capRange(START, today()));
  const capAll = capRange(START, END);
  return { total, done, ok, exp, capAll, pct: total ? done / total : 0 };
}
function nota() {
  const t = today(), P = progress(), comps = [];
  const expY = t > START ? Math.min(P.total, capRange(START, iso(addDays(parse(t), -1)))) : 0;
  comps.push({ n: 'Ritmo do conteúdo', w: .3, v: expY >= 2 ? clamp(P.done / expY, 0, 1) : null,
    why: expY >= 2 ? `${P.done} unidades estudadas para uma meta de ${Math.floor(expY)} até ontem` : 'ainda não há meta vencida' });
  const days = []; for (let i = 1; i <= 14; i++) { const d = iso(addDays(parse(t), -i)); if (d >= START) days.push(d); }
  comps.push({ n: 'Constância (2h/dia)', w: .3, v: days.length ? days.reduce((s, d) => s + clamp((S.hours[d] || 0) / metaDia(d), 0, 1), 0) / days.length : null,
    why: days.length ? `média dos últimos ${days.length} dias em relação à meta de ${CFG.minimoDiaMin / 60}h` : 'começa a contar amanhã' });
  const past = dueItems().filter(i => i.due < t);
  comps.push({ n: 'Revisões em dia', w: .2, v: past.length ? past.filter(i => i.done).length / past.length : null,
    why: past.length ? `${past.filter(i => i.done).length} de ${past.length} revisões vencidas feitas` : 'nenhuma revisão venceu ainda' });
  const sims = S.simulados.slice().sort((a, b) => a.d.localeCompare(b.d)).slice(-3);
  let dv = null, dw = '';
  if (sims.length) { const p = sims.reduce((s, x) => s + x.acertos / x.total, 0) / sims.length; dv = clamp(p / .75, 0, 1); dw = `média de ${Math.round(p * 100)}% nos últimos simulados (corte da prova: 50%)`; }
  else { let a = 0, n = 0; allQ().forEach(q => histOf(q).forEach(h => { n++; if (h.ok) a++; }));
    if (n >= 10) { dv = clamp(a / n / .75, 0, 1); dw = `${Math.round(a / n * 100)}% de acerto em ${n} questões reais`; } else dw = 'faça um simulado ou 10 questões reais'; }
  comps.push({ n: 'Desempenho', w: .2, v: dv, why: dw });
  const have = comps.filter(c => c.v != null);
  if (!have.length) return { nota: null, comps };
  const sw = have.reduce((s, c) => s + c.w, 0), val = have.reduce((s, c) => s + c.w * c.v, 0) / sw * 10;
  const low = have.slice().sort((a, b) => a.v - b.v)[0];
  const lbl = val >= 8.5 ? 'Ritmo forte' : val >= 7 ? 'Bom caminho' : val >= 5 ? 'Atenção' : 'Alerta';
  return { nota: Math.round(val * 10) / 10, lbl, comps, low };
}

/* ---------- conquistas, nível, humor e tema ---------- */
function achievements() {
  const st = streak(), P = progress(), nq = allQ().reduce((s, q) => s + histOf(q).length, 0), bs = Math.max(S.bestStreak || 0, st);
  const best = S.simulados.reduce((m, x) => Math.max(m, x.acertos / x.total), 0), hrs = Object.values(S.hours).reduce((s, v) => s + v, 0);
  const etica = MAT.find(m => m.id === 'etica'), eticaOk = etica.unid.every((_, i) => isDone('etica:' + i));
  return [
    { id: 'd1', t: 'Primeiro dia', d: 'Bateu a meta de um dia', ok: Object.keys(S.hours).some(k => S.hours[k] >= metaDia(k)) },
    { id: 's3', t: '3 dias seguidos', d: 'Sequência de 3 dias', ok: bs >= 3 }, { id: 's7', t: 'Semana inteira', d: 'Sequência de 7 dias', ok: bs >= 7 },
    { id: 's14', t: 'Duas semanas', d: 'Sequência de 14 dias', ok: bs >= 14 }, { id: 's30', t: 'Um mês', d: 'Sequência de 30 dias', ok: bs >= 30 },
    { id: 'u1', t: 'Primeiro tópico', d: 'Estudou um tópico', ok: P.done >= 1 }, { id: 'u10', t: '10 tópicos', d: '10 tópicos estudados', ok: P.done >= 10 },
    { id: 'u50', t: '50 tópicos', d: '50 tópicos estudados', ok: P.done >= 50 }, { id: 'ok1', t: 'Consolidado', d: 'Primeiro tópico com as 5 revisões', ok: P.ok >= 1 },
    { id: 'et', t: 'Ética completa', d: 'Todos os tópicos de Ética estudados', ok: eticaOk },
    { id: 'sm1', t: 'Primeiro simulado', d: 'Registrou um simulado', ok: S.simulados.length >= 1 }, { id: 'sm50', t: 'Acima do corte', d: 'Simulado com 50% ou mais', ok: best >= .5 },
    { id: 'q100', t: '100 questões', d: '100 questões respondidas', ok: nq >= 100 }, { id: 'q500', t: '500 questões', d: '500 questões respondidas', ok: nq >= 500 },
    { id: 'e10', t: 'Caderno vivo', d: '10 erros anotados', ok: S.errors.length >= 10 }, { id: 'h50', t: '50 horas', d: '50 horas de estudo', ok: hrs >= 3000 }, { id: 'h100', t: '100 horas', d: '100 horas de estudo', ok: hrs >= 6000 }
  ];
}
function nivel() {
  const P = progress(), nq = allQ().reduce((s, q) => s + histOf(q).length, 0), hrs = Object.values(S.hours).reduce((s, v) => s + v, 0);
  const xp = Math.floor(hrs / 6) + P.done * 20 + P.ok * 10 + Math.floor(nq / 2), lv = Math.floor(Math.sqrt(xp / 40)) + 1, lo = (lv - 1) * (lv - 1) * 40, hi = lv * lv * 40;
  return { xp, lv, p: (xp - lo) / (hi - lo), prox: hi - xp };
}
function checkConq() {
  S.conq = S.conq || {}; let ch = false; const st = streak();
  if (st > (S.bestStreak || 0)) { S.bestStreak = st; ch = true; }
  achievements().forEach(a => { if (a.ok && !S.conq[a.id]) { S.conq[a.id] = today(); ch = true; toast('Conquista: ' + a.t); } });
  if (ch) save();
}
const moodNow = () => minToday() >= metaHoje() ? 'feliz' : (new Date().getHours() >= 22 ? 'cansado' : 'neutro');
const effTheme = () => S.theme === 'auto' ? ((new Date().getHours() >= 18 || new Date().getHours() < 6) ? 'escuro' : 'claro') : (S.theme === 'escuro' ? 'escuro' : 'claro');
const vidroOn = () => S.vidro === undefined ? effTheme() === 'escuro' : !!S.vidro;
function applyTheme() { document.body.dataset.theme = effTheme(); document.body.classList.toggle('vidro', vidroOn()); applyUi(); }
/* ---------- configurações visuais (cor, fontes, tamanho, animações) ---------- */
const UI_ACC = [['#2F8F6B', 'Laranja'], ['#3B5BDB', 'Azul'], ['#2E8B63', 'Verde'], ['#C2185B', 'Rosa'], ['#7B3FE4', 'Roxo'], ['#D4A017', 'Dourado']];
const UI_FONT = [['', 'Padrão (Roboto)'], ['Georgia,\'Times New Roman\',serif', 'Com serifa (Georgia)'], ['Verdana,Tahoma,sans-serif', 'Bem legível (Verdana)'], ['system-ui,-apple-system,\'Segoe UI\',sans-serif', 'Do seu aparelho']];
const UI_DISP = [['', 'Padrão (Archivo)'], ['Georgia,\'Times New Roman\',serif', 'Com serifa (Georgia)'], ['same', 'Igual ao texto']];
const UI_LINE = [['1.8', 'Confortável'], ['1.6', 'Compacta'], ['2', 'Bem espaçada']];
function applyUi() {
  const u = S.ui || {}, r = document.documentElement.style, set = (k, v) => v ? r.setProperty(k, v) : r.removeProperty(k);
  set('--orange', u.accent);
  set('--font', u.font);
  set('--disp', u.disp === 'same' ? (u.font || '\'Roboto\',\'Segoe UI\',system-ui,sans-serif') : u.disp);
  set('--fs', u.fs && u.fs !== 100 ? String(u.fs / 100) : '');
  set('--lh', u.lh && u.lh !== '1.8' ? u.lh : '');
  document.body.classList.toggle('rm', !!u.rm);
  document.body.classList.toggle('tophover', u.topmode === 'hover');
  if (typeof applyNav === 'function' && document.getElementById('nav')) { try { applyNav(); } catch (e) { } }
}
/* ---------- semente de páginas ---------- */
function seedPages(id) {
  if (id === 'c48') return [
    { id: uid(), title: 'Regras do Exame (edital)', notes: [], html:
      `<h3>1ª fase</h3><ul><li>10/01/2027, 13h às 18h (5 horas). Portões fecham às 12h30.</li><li>80 questões objetivas. Aprovação com 40 acertos (50%).</li><li>No mínimo 15% das questões em Estatuto da Advocacia, Regulamento Geral, Código de Ética, Direitos Humanos e Filosofia do Direito.</li></ul>
       <h3>2ª fase</h3><ul><li>28/02/2027, 13h às 18h. Peça (5,00) e 4 questões discursivas (1,25 cada). Nota mínima 6,00.</li><li>A área foi escolhida na inscrição e não muda depois de pago.</li></ul>
       <div class="lei"><b>Fonte:</b> resumo do edital de 21/09/2026 (E-OAB/README.md). Confira no edital.</div>` },
    { id: uid(), title: 'Dia da prova', notes: [], html:
      `<ul><li>Documento oficial com foto, ORIGINAL.</li><li>Caneta esferográfica transparente, azul ou preta.</li><li>Chegar com 1 hora de antecedência.</li><li>Proibido: celular, relógio, boné, óculos escuros, lápis, borracha, corretivo.</li></ul><div class="peg"><b>Pegadinha:</b> quem é pego com item proibido é eliminado. Sem segunda chamada.</div>` },
    { id: uid(), title: 'Minhas pegadinhas', notes: [], html:
      `<div class="tip"><b>Dica:</b> uma linha por armadilha em que eu caí. Releio na véspera da prova.</div><ol><li><br></li></ol>` },
    { id: uid(), title: 'Mapa de artigos', notes: [], html:
      `<p>Tabela feita por mim, com a lei seca na mão: assunto, lei, artigos principais.</p><table><tr><th>Assunto</th><th>Lei</th><th>Artigos</th></tr><tr><td><br></td><td><br></td><td><br></td></tr></table>` }
  ];
  const m = MAT.find(x => x.id === id);
  return [{ id: uid(), title: 'Capa da matéria', notes: [], html:
    `<h3>${esc(m.nome)}</h3><p><b>Peso no plano:</b> ${GRUPO[m.grupo]}${m.grupo === 'min15' ? ' (entra no mínimo de 15% do edital)' : ''}.</p>${m.nota ? `<div class="tip"><b>Dica:</b> ${esc(m.nota)}</div>` : ''}
     <h4>Lei seca a ler</h4><p>(preencha com a lei na mão)</p>
     <h4>Minhas pegadinhas nesta matéria</h4><ul><li><br></li></ul>
     <div class="tip"><b>Método:</b> questão primeiro, lei seca depois, resumo por último. Um tópico novo por vez e revisão D1, D2, D7, D14, D30.</div>` }];
}
function seedUnit(m, u) {
  return { id: uid(), title: u, unit: null, notes: [], html:
    `<h4>Mapa em 30 segundos</h4><p>Onde isto se encaixa em ${esc(m.nome)} e por que a banca gosta.</p>
     <h4>Teoria curta (só o que cai)</h4><ul><li>Lei seca primeiro.</li><li>Depois, o entendimento dos tribunais superiores (conferir no texto oficial).</li></ul>
     <h4>Com as minhas palavras</h4><p><br></p>
     <div class="peg"><b>Pegadinhas:</b> <br></div>
     <h4>Autoteste</h4><ol><li><br></li><li><br></li><li><br></li></ol>` };
}
const pagesOf = id => (S.pages[id] = S.pages[id] || seedPages(id));

/* ---------- navegação ---------- */
const NAV = [['home', 'Início'], ['mapa', 'Mapa da OAB'], ['foco', 'Foco'], ['lib', 'Biblioteca'], ['vade', 'Vade Mecum'], ['plan', 'Cronograma'], ['rev', 'Revisão'], ['sim', 'Simulados'], ['err', 'Erros'], ['petrus', 'Petrus']];
const ICON = {
  crono: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 14l2 2 4-4"/>',
  curso: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v6"/>',
  cards: '<rect x="3" y="6" width="14" height="12" rx="2"/><path d="M7 3h12a2 2 0 012 2v10"/>',
  rel: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  mapa: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  notas: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/>',
  vade: '<path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z"/><path d="M12 6v14"/>',
  foco: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  lib: '<path d="M4 4h5v16H4zM11 4h5v16h-5z"/><path d="M18.5 6l2.5.8-3.5 13-2.5-.8"/>',
  plan: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  rev: '<path d="M4 12a8 8 0 0 1 14-5l2 2"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5l-2-2"/><path d="M4 20v-5h5"/>',
  sim: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  err: '<path d="M5 3h10l4 4v14H5z"/><path d="M9 12l6 6M15 12l-6 6"/>',
  config: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  petrus: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>'
};
const COVERS = [['#6C151E', '#F5DABF'], ['#0F3D3A', '#F5DABF'], ['#5E4440', '#F5DABF'], ['#8E2A35', '#F5DABF'], ['#1F5A55', '#F5DABF'], ['#9C7F76', '#2B1416'], ['#D8C3A5', '#2B1416']];
const TABCOL = [['#16161A', '#fff']];
const PAST = ['#D6B8FF', '#FFB7B2', '#A6DEFF', '#FFCDAE', '#A8F0CE', '#F2B6E8', '#D9D9D9'];
const MESES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
const WDL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const TITLES = { vade: 'Vade Mecum', foco: 'Modo foco', home: 'Início', lib: 'Biblioteca', plan: 'Cronograma', rev: 'Revisão', sim: 'Simulados', err: 'Erros', petrus: 'Petrus', book: 'Livro', notas: 'Notas do aluno', config: 'Configurações', mock: 'Simulado completo', mapa: 'Mapa até a OAB', cards: 'Cartões', rel: 'Relatório', curso: 'Curso do Petrus', crono: 'Cronograma do curso' };
let navHidden = (() => { if (window.innerWidth < 900) return true; try { const v = localStorage.getItem('c48.nav'); if (v) return v === 'hidden'; } catch (e) { } return false; })();
let navMat = false, navAnim = false;
/* menu lateral: por padrão fica escondido no computador e aparece ao passar o mouse na borda esquerda; "fixo" volta ao modo antigo */
let navPinned = false;
const navHoverMode = () => window.innerWidth >= 900 && (S && S.ui && S.ui.navmode) !== 'fixo';
function applyNav() {
  const hide = navHoverMode() ? !navPinned : navHidden;
  document.body.classList.toggle('nav-hidden', hide); document.body.classList.toggle('nav-hover', navHoverMode());
  if (!document.getElementById('navzone')) { const z = document.createElement('div'); z.id = 'navzone'; z.className = 'navzone'; document.body.appendChild(z); const h = document.createElement('button'); h.className = 'nhandle'; h.setAttribute('data-act', 'navToggle'); h.setAttribute('aria-label', 'Abrir o menu'); document.body.appendChild(h); }
  try { localStorage.setItem('c48.nav', navHidden ? 'hidden' : 'open'); } catch (e) { }
}
window.addEventListener('resize', () => { try { if (window.innerWidth < 900 && !navHidden) navHidden = true; applyNav(); } catch (e) { } });
function navHtml(r) {
  const mt = minToday(), meta = metaHoje();
  const it = ([k, l]) => `<a href="#/${k}" class="${(r.v === k || (r.v === 'book' && k === 'lib')) ? (navAnim ? 'on pop' : 'on') : ''}"><svg viewBox="0 0 24 24">${ICON[k]}</svg><span>${l}</span></a>`;
  const open = navMat || r.v === 'book';
  const mats = [C48].concat(MAT.slice().sort((a, b) => a.ciclo - b.ciclo)).map(m => `<a href="#/book/${m.id}" class="${r.v === 'book' && r.a === m.id ? 'on' : ''}"><i class="d" style="background:${m.id === 'c48' ? '#190A00' : PAST[m.ciclo] || PAST[0]}"></i><span>${esc(m.nome)}</span><span class="nt">${m.id === 'c48' || S.rate[m.id] == null ? '' : S.rate[m.id]}</span></a>`).join('');
  return `<div class="brand"><span class="bm">P</span>Petrus<button class="hide" data-act="navToggle" title="Esconder o menu"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button></div>
    <div class="grp">Estudar</div><a href="index.html"><svg viewBox="0 0 24 24">${ICON.home}</svg><span>Início</span></a>${[['crono', 'Cronograma do curso'], ['curso', 'Curso do Petrus'], ['lib', 'Biblioteca'], ['vade', 'Vade Mecum'], ['notas', 'Notas do aluno']].map(it).join('')}
    <div class="grp">Treinar</div>${[['rev', 'Revisão'], ['cards', 'Cartões'], ['sim', 'Simulados'], ['err', 'Erros']].map(it).join('')}
    <div class="grp btn2 ${open ? 'open' : ''}" data-act="navMat">Matérias<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></div><div class="sub2 ${open ? 'open' : ''}">${mats}</div>
    <div class="grp">Petrus</div>${[['config', 'Configurações']].map(it).join('')}
    <div class="vrow" data-act="vidro" title="Ligar ou desligar o vidro fosco"><span>Vidro fosco</span><i class="swi ${vidroOn() ? 'on' : ''}"></i></div><div class="mini"><div class="tiny" style="color:rgba(25,10,0,.6)">Estudo de hoje</div><b>${hm(mt)} de ${hm(meta)}</b>${bar(clamp(mt / meta, 0, 1), null, '', true)}</div>`;
}
let pfOpen = false;
const BGS = ['#2F8F6B', '#3B5BDB', '#2E8B63', '#C2185B', '#7B3FE4', '#F2C94C', '#FFD5BA'];
const COATS = ['#5A3326', '#1F2937', '#2E4A3F', '#3B3B3B', '#7A2E2E'];
const ACCS = [['nenhum', 'Nenhum'], ['oculos', 'Óculos'], ['fone', 'Fone'], ['bone', 'Boné']];
const prof = () => Object.assign({ bg: '#2F8F6B', coat: '#5A3326', acc: 'nenhum', ear: 'sim' }, S.profile || {});
/* Personagem do Lucas: retrato geométrico em tons chapados, com sombra dividida ao meio (estilo dos cartões de personagem de referência).
   Traços tirados da foto: cabelo black power com degradê nas laterais, barba cheia, bigode, sobrancelhas grossas, olhar de lado,
   brinco de argola, blazer de tweed marrom sobre gola alta preta. A foto em si não é guardada. */
function avatarSvg(p, view, mood) {
  const u = Math.random().toString(36).slice(2, 7), skin = '#A8704C', hair = '#150D08', ink = '#14100D';
  const blazer = 'M0 300L0 256C0 226 36 212 76 202C84 214 100 224 120 240C140 224 156 214 164 202C204 212 240 226 240 256L240 300Z';
  const beard = 'M75 112C73 168 96 198 120 198C144 198 167 168 165 112C160 142 144 150 120 150C96 150 80 142 75 112Z';
  const acc = {
    oculos: `<g fill="rgba(255,255,255,.2)" stroke="${ink}" stroke-width="3.6"><circle cx="100" cy="112" r="15"/><circle cx="140" cy="112" r="15"/></g><path d="M115 112h10" stroke="${ink}" stroke-width="3.6"/>`,
    fone: `<path d="M68 118C64 22 176 22 172 118" fill="none" stroke="#16130F" stroke-width="9" stroke-linecap="round"/><rect x="58" y="104" width="18" height="32" rx="9" fill="#16130F"/><rect x="164" y="104" width="18" height="32" rx="9" fill="#16130F"/>`,
    bone: `<path d="M68 90C66 34 174 34 172 90Z" fill="#16130F"/><path d="M62 92H186C186 102 130 102 62 96Z" fill="#0A0806"/>`
  }[p.acc] || '';
  return `<svg viewBox="${view || '30 14 180 180'}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Personagem do Lucas"><defs>
    <clipPath id="h${u}"><ellipse cx="120" cy="118" rx="46" ry="56"/><path d="${beard}"/><ellipse cx="74" cy="124" rx="7" ry="11"/><ellipse cx="166" cy="124" rx="7" ry="11"/></clipPath>
    <clipPath id="b${u}"><path d="${blazer}"/></clipPath>
    <pattern id="t${u}" width="9" height="7" patternUnits="userSpaceOnUse"><path d="M0 1.5h5M4.5 5h4.5" stroke="#D9AE8B" stroke-width="1.5" opacity=".38"/></pattern></defs>
    <rect width="240" height="300" fill="${p.bg}"/>
    <path d="${blazer}" fill="${p.coat}"/><path d="${blazer}" fill="url(#t${u})"/>
    <g clip-path="url(#b${u})"><rect x="120" y="190" width="120" height="120" fill="#000" opacity=".16"/></g>
    <path d="M98 206L120 238L142 206L146 300L94 300Z" fill="#12100E"/>
    <path d="M78 200L98 266L120 238L98 206Z" fill="#000" opacity=".3"/><path d="M162 200L142 266L120 238L142 206Z" fill="#000" opacity=".38"/>
    <rect x="88" y="164" width="64" height="48" rx="19" fill="#12100E"/>
    <ellipse cx="74" cy="124" rx="7" ry="11" fill="${skin}"/><ellipse cx="166" cy="124" rx="7" ry="11" fill="${skin}"/>
    <ellipse cx="120" cy="118" rx="46" ry="56" fill="${skin}"/><path d="${beard}" fill="${hair}"/>
    <g clip-path="url(#h${u})"><rect x="120" y="40" width="70" height="170" fill="#000" opacity=".14"/></g>
    <path d="M120 108C116 118 112 128 113 134C117 138 123 138 127 134C128 128 124 118 120 108Z" fill="#7A4A2E" opacity=".5"/>
    <circle cx="92" cy="134" r="7" fill="#C8603F" opacity=".2"/><circle cx="148" cy="134" r="7" fill="#C8603F" opacity=".2"/>
    <ellipse cx="100" cy="112" rx="10" ry="5.6" fill="#F4EDE6"/><ellipse cx="140" cy="112" rx="10" ry="5.6" fill="#F4EDE6"/>
    <circle cx="95.5" cy="112" r="4.3" fill="#2A160C"/><circle cx="135.5" cy="112" r="4.3" fill="#2A160C"/><circle cx="95.5" cy="112" r="2" fill="#0B0604"/><circle cx="135.5" cy="112" r="2" fill="#0B0604"/>
    <path d="M90 111Q100 104 110 111M130 111Q140 104 150 111" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M87 98C95 90 108 90 113 97M127 97C132 90 145 90 153 98" stroke="${hair}" stroke-width="6.4" fill="none" stroke-linecap="round"/>
    <path d="M96 141C106 132 134 132 144 141C136 151 104 151 96 141Z" fill="${hair}"/>
    ${mood === 'feliz' ? '<path d="M104 153C108 171 132 171 136 153C128 158 112 158 104 153Z" fill="#F6EFEA"/><path d="M104 153C112 160 128 160 136 153" stroke="#8E4B3E" stroke-width="2.8" fill="none" stroke-linecap="round"/>' : '<path d="M107 154C113 149 127 149 133 154C127 158 113 158 107 154Z" fill="#8E4B3E"/><path d="M108 155C114 163 126 163 132 155C126 159 114 159 108 155Z" fill="#A65D4C"/>'}
    ${p.ear === 'nao' ? '' : '<circle cx="168" cy="137" r="6.6" fill="none" stroke="#E7E3DC" stroke-width="2.3"/>'}
    <g fill="${hair}"><path d="M72 106C58 64 78 36 120 34C162 36 182 64 168 106L160 92C156 78 140 72 120 72C100 72 84 78 80 92Z"/><circle cx="84" cy="56" r="18"/><circle cx="106" cy="42" r="20"/><circle cx="134" cy="42" r="20"/><circle cx="156" cy="56" r="18"/><circle cx="120" cy="36" r="18"/><circle cx="72" cy="80" r="13"/><circle cx="168" cy="80" r="13"/><path d="M72 100C70 110 71 120 74 128L80 124C78 112 78 104 80 94Z"/><path d="M168 100C170 110 169 120 166 128L160 124C162 112 162 104 160 94Z"/></g>
    <g fill="#3A2418" opacity=".55"><circle cx="100" cy="50" r="5"/><circle cx="128" cy="46" r="5"/><circle cx="150" cy="60" r="4"/><circle cx="86" cy="62" r="4"/></g>
    ${mood === 'feliz' ? '<g fill="#FFD84D" stroke="#fff" stroke-width="1"><path d="M40 46l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><path d="M200 70l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z"/><path d="M52 150l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>' : mood === 'cansado' ? `<path d="M88 112Q100 120 112 112L112 99L88 99Z" fill="${skin}"/><path d="M128 112Q140 120 152 112L152 99L128 99Z" fill="${skin}"/><path d="M89 112Q100 118 111 112M129 112Q140 118 151 112" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/><text x="176" y="56" font-family="Archivo,Arial" font-weight="800" font-size="26" fill="#fff" opacity=".9">z</text><text x="192" y="38" font-family="Archivo,Arial" font-weight="800" font-size="18" fill="#fff" opacity=".8">z</text>` : ''}
    ${acc}</svg>`;
}
function avatarHtml() { return window.PETRUS_AV ? window.PETRUS_AV() : '<span class=\"anon\">P</span>'; }
function profileHtml() {
  const p = prof(), N = nota(), dProva = Math.max(0, Math.ceil((new Date(CFG.prova) - new Date()) / 864e5)), lv = nivel(), ach = achievements();
  const sw = (k, list) => list.map(v => `<button class="sw ${p[k] === v ? 'on' : ''}" style="background:${v}" data-act="pfSet" data-k="${k}" data-v="${v}" title="${v}"></button>`).join('');
  const pl = (k, list) => list.map(([v, l]) => `<button class="pl ${p[k] === v ? 'on' : ''}" data-act="pfSet" data-k="${k}" data-v="${v}">${l}</button>`).join('');
  const ic = d => `<svg viewBox="0 0 24 24">${d}</svg>`;
  return `<div class="pfm"><div class="pfh"><div class="pfcard"><small>ESTUDANTE DE DIREITO</small><b>PETRUS</b>${avatarHtml(p, '0 0 240 300')}</div>
    <div><b class="nm">Estudante</b><span>48º Exame de Ordem</span>
      </div></div>
    <div class="pfs"><span><b>${streak()}</b>dias seguidos</span><span><b>${N.nota == null ? '—' : N.nota.toFixed(1)}</b>nota</span><span><b>${dProva}</b>dias p/ a prova</span></div>
    <div class="pfr" style="margin-top:12px"><label>Nível ${lv.lv} · ${lv.xp} XP · faltam ${lv.prox} para o próximo</label>${bar(clamp(lv.p, 0, 1), null, '', true)}</div>
    <h2>Conquistas (${ach.filter(a => a.ok).length} de ${ach.length})</h2><div class="badges">${ach.map(a => `<span class="bg ${a.ok ? 'on' : ''}" title="${esc(a.d)}">${esc(a.t)}</span>`).join('')}</div>
    <h2>Tema</h2><div class="pls">${[['claro', 'Claro'], ['escuro', 'Escuro (vidro laranja)'], ['auto', 'Automático (noite escuro)']].map(([v, l]) => `<button class="pl ${(S.theme || 'claro') === v ? 'on' : ''}" data-act="pfTema" data-v="${v}">${l}</button>`).join('')}</div>
    <h2>Descanso</h2><div class="pfr"><label>Hora de dormir (o aviso vem 30 minutos antes)</label><input type="time" id="sonoin" value="${esc(S.sono || '23:00')}" style="max-width:140px"></div>
    
    <div class="row" style="margin-top:12px"><button class="btn ghost sm" data-act="pfReset">Voltar ao padrão</button></div></div>`;
}
function topbarHtml(r) {
  const P = progress();
  const pc = Math.round(P.pct * 100);
  return `<div class="scrim" data-act="navHide"></div><button class="mmenu" data-act="navToggle" aria-label="Menu" title="Menu"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></svg></button>
    <div class="whob"><button class="av" data-act="petrusOpen" title="Falar com o Petrus">${avatarHtml(prof())}</button><div class="wmeter" title="Conteúdo estudado: ${pc}%"><i style="width:${Math.max(4, pc)}%"></i></div><span class="wpct">${pc}%</span>${pfOpen ? profileHtml() : ''}</div>`;
}
const tmin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
function todaySchedule(ds) {
  const wd = parse(ds).getDay(), base = (window.C48_ROTINA || {})[wd] || [];
  const items = base.filter(b => !b.so || isSim(ds)).map(b => Object.assign({}, b));
  const due = pending(ds), f = faseOf(ds), next = f && f.novo && !isSim(ds) ? nextUnit(ds) : null;
  const st = items.filter(b => b.k === 'estudo');
  const l1 = [`Revisões D1/D2/D7/D14/D30: ${due.length} na fila`, '10 questões reais (banco de simulados)'];
  const l2 = [next ? `Novo: ${next.u} (${next.m.nome})` : 'Sem conteúdo novo hoje', `Caderno de erros: ${S.errors.length} registros`];
  if (st.length === 1) st[0].sub = l1.concat(l2); else if (st.length >= 2) { st[0].sub = l1; st[1].sub = l2; }
  items.push({ h: S.sono || '23:00', f: '23:59', t: 'Hora de dormir', k: 'sono', sub: ['Durma de 7 a 8 horas: o sono fixa o que você estudou.'] });
  return items.sort((a, b) => tmin(a.h) - tmin(b.h));
}
function dotCalendar(t) {
  const start = parse(START), endS = CFG.prova.slice(0, 10), end = parse(endS);
  const first = addDays(start, -((start.getDay() + 6) % 7)), last = addDays(end, (7 - end.getDay()) % 7);
  let html = '', d = new Date(first);
  while (d <= last) {
    const ds = iso(d), m = S.hours[ds] || 0; let cls = 'off';
    if (ds >= START && ds <= endS) cls = ds === endS ? 'exam' : ds === t ? 'today' : ds < t ? (m >= metaDia(ds) ? 'done' : 'miss') : 'fut';
    html += `<i class="dd ${cls}" title="${fmt(ds)} · ${hm(m)}"></i>`; d = addDays(d, 1);
  }
  return html;
}
function weekBars(t) {
  const d0 = parse(t), mon = addDays(d0, -((d0.getDay() + 6) % 7)), days = [0, 1, 2, 3, 4, 5, 6].map(i => iso(addDays(mon, i)));
  const mx = Math.max(CFG.minimoDiaMin, ...days.map(x => S.hours[x] || 0)), L = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
  return days.map((x, i) => { const m = S.hours[x] || 0; return `<div class="wb ${x === t ? 'today' : ''}"><em>${m ? hm(m) : ''}</em><div class="tube"><i style="height:${Math.max(6, m / mx * 100)}%"></i></div><span>${L[i]}</span></div>`; }).join('');
}
let curPage = {}, errFilter = '', quiz = null, timer = { left: 5 * 3600, run: false, id: null }, openLembrete = false;
let CUR = (location.hash || '').replace(/^#\//, '') || 'home';
function route() { const h = CUR.split('/'); return { v: h[0] || 'home', a: h[1] }; }
function go(path) { try { narParar(); } catch (x) { try { speechSynthesis.cancel(); } catch (y) { } } navAnim = true; CUR = String(path).replace(/^#\//, '') || 'home'; if (window.innerWidth < 900 && !navHidden) { navHidden = true; applyNav(); } try { history.replaceState(null, '', '#/' + CUR); } catch (e) { } telaRender(); }
let lastView = null;
function telaRender() {
  const v = route().v + (route().v === 'book' ? '/' + route().a : '');
  const ok = document.startViewTransition && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) && lastView !== null;
  lastView = v;
  if (ok) { try { const vt = document.startViewTransition(() => render()); [vt.ready, vt.finished, vt.updateCallbackDone].forEach(x => x && x.catch(() => { })); return; } catch (e) { } }
  render();
}
/* menu redondo e retrátil de dentro dos livros: aparece ao passar o mouse na borda esquerda (ou arrastar o dedo no celular) */
const BI = {
  trilha: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 000-6h-4a3 3 0 010-6h6"/>',
  aula: '<path d="M4 4h7a2 2 0 012 2v14a2 2 0 00-2-2H4z"/><path d="M20 4h-7a2 2 0 00-2 2v14a2 2 0 012-2h7z"/>',
  ouvir: '<path d="M5 9v6h3l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 010 7"/>'
};
function bnavHtml(r) {
  if (r.v !== 'book') return '';
  const inL = !!(BK.k && BK.k !== '_resumo'), inR = BK.k === '_resumo';
  const ic = p => `<svg viewBox="0 0 24 24">${p}</svg>`;
  const b = (act, extra, p, tip, on) => `<button class="bi ${on ? 'on' : ''}" data-act="${act}" ${extra || ''} data-tip="${tip}" aria-label="${tip}">${ic(p)}</button>`;
  const a = (href, p, tip) => `<a class="bi" href="#/${href}" data-tip="${tip}" aria-label="${tip}">${ic(p)}</a>`;
  const voltar = a('lib', '<path d="M15 6l-6 6 6 6"/><path d="M9 12h11"/>', 'Voltar à biblioteca');
  const items = inL
    ? [voltar, b('bkBack', '', BI.trilha, 'Trilha de aulas'), b('bkTab', 'data-t="aula"', BI.aula, 'Aula', BK.tab === 'aula'), b('bkTab', 'data-t="lei"', ICON.vade, 'Lei e vídeos', BK.tab === 'lei'), b('bkTab', 'data-t="pratica"', ICON.sim, 'Praticar', BK.tab === 'pratica'), b('bkTab', 'data-t="notas"', ICON.notas, 'Minhas notas', BK.tab === 'notas'), b('bkWide', '', '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', 'Expandir a leitura', !!S.wide)]
    : [voltar, b('bkBack', '', BI.trilha, 'Trilha de aulas', !inR), b('bkResumo', '', ICON.rev, 'Resumo de véspera', inR), a('cards', ICON.cards, 'Cartões'), a('notas', ICON.notas, 'Notas do aluno')];
  return `<a class="bi brandc" href="index.html" data-tip="Início" aria-label="Início">${avatarHtml()}</a>${items.join('')}`;
}
function renderBnav(r) {
  let n = document.getElementById('bnav');
  if (r.v !== 'book') { if (n) n.remove(); document.querySelectorAll('.bzone,.bhandle').forEach(x => x.remove()); document.body.classList.remove('bnav-open'); return; }
  if (!n) { n = document.createElement('div'); n.id = 'bnav'; document.body.appendChild(n); const z = document.createElement('div'); z.className = 'bzone'; document.body.appendChild(z); const h = document.createElement('button'); h.className = 'bhandle'; h.setAttribute('data-act', 'bnavToggle'); h.setAttribute('aria-label', 'Abrir o menu do livro'); document.body.appendChild(h); }
  n.innerHTML = bnavHtml(r);
}
/* dock em pílula da tela inicial: os 5 atalhos que mais se usam, com contadores */
function dockHtml() {
  const svg = p => `<svg viewBox="0 0 24 24">${p}</svg>`, bd = n => n > 0 ? `<i class="bdg">${n > 99 ? '99+' : n}</i>` : '';
  const pn = pending().length, nq = dueQs().length, ne = S.errors.length;
  const nx = nextUnit(today()), ing = QUEUE.find(x => !isDone(x.k) && bkStep(x.k) > 0 && AULA()[x.k]);
  const cont = ing || (nx && AULA()[nx.k] ? nx : QUEUE.find(q => AULA()[q.k] && !isDone(q.k)) || QUEUE.find(q => AULA()[q.k]));
  const go1 = cont ? `<button class="bi go" data-act="bkOpen" data-k="${cont.k}" data-tip="Continuar: ${esc(cont.u)}" aria-label="Continuar a estudar">${svg('<path d="M8 5v14l11-7z"/>')}</button>` : '';
  return go1
    + `<a class="bi" href="#/rev" data-tip="Revisão do dia" aria-label="Revisão">${svg(ICON.rev)}${bd(pn)}</a>`
    + (nq ? `<button class="bi" data-act="qDue" data-tip="Rever questões vencidas" aria-label="Questões">${svg(ICON.sim)}${bd(nq)}</button>` : `<a class="bi" href="#/sim" data-tip="Questões e simulados" aria-label="Questões">${svg(ICON.sim)}</a>`)
    + `<a class="bi" href="#/err" data-tip="Caderno de erros" aria-label="Erros">${svg(ICON.err)}${bd(ne)}</a>`
    + `<a class="bi" href="#/foco" data-tip="Modo foco 50/10" aria-label="Foco">${svg(ICON.foco)}</a>`
    + `<button class="bi" data-act="dockSearch" data-tip="Pesquisar" aria-label="Pesquisar">${svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>')}</button>`;
}
function renderDock(r) {
  let d = document.getElementById('dock');
  if (r.v !== 'home') { if (d) d.remove(); document.body.classList.remove('hasdock'); return; }
  if (!d) { d = document.createElement('div'); d.id = 'dock'; document.body.appendChild(d); }
  d.innerHTML = dockHtml(); document.body.classList.add('hasdock');
}
/* se uma tela falhar ao montar, mostra o erro em vez de ficar parada sem dizer nada */
function showErr(e) {
  try { console.error(e); let b = document.getElementById('errbar'); if (!b) { b = document.createElement('div'); b.id = 'errbar'; b.addEventListener('click', () => b.remove()); document.body.appendChild(b); }
    b.textContent = 'Não consegui abrir esta tela (' + (CUR || '') + '): ' + (e && e.message ? e.message : e) + '. Toque aqui para fechar e me mande esta mensagem.'; } catch (x) { }
}
function render() { try { renderCore(); } catch (e) { showErr(e); } }
function renderCore() {
  const r = route();
  if (r.v === 'home') { location.replace('index.html'); return; }
  if (['petrus', 'plan', 'foco', 'mapa', 'rel'].indexOf(r.v) >= 0) { location.replace('app.html#/lib'); return; }
  $('#nav').innerHTML = navHtml(r);
  const fn = { vade: vVade, foco: vFoco, home: vHome, lib: vLib, book: () => vBook(r.a), plan: vPlan, rev: vRev, sim: vSim, err: vErr, petrus: vPetrus, notas: vNotas, config: vConfig, mock: vMock, mapa: vMapa, cards: vCards, rel: vRel, curso: vCP, crono: vCrono }[r.v] || vHome;
  $('#app').innerHTML = topbarHtml(r) + fn();
  document.body.classList.toggle('bk', r.v === 'book'); document.body.dataset.book = r.v === 'book' ? r.a : ''; document.body.classList.toggle('wide', !!S.wide);
  if (!document.getElementById('topzone')) { const z = document.createElement('div'); z.id = 'topzone'; z.className = 'topzone'; document.body.appendChild(z); }
  renderBnav(r);
  renderDock(r);
  if (r.v === 'book') bindBook();
  if (r.v === 'foco') paintFoco();
  if (navAnim) {
    const w = $('#app'); w.classList.add('enter'); setTimeout(() => w.classList.remove('enter'), 800);
    const on = $('.nav a.on'); if (on) on.insertAdjacentHTML('beforeend', '<i class="rip"></i>');
    navAnim = false;
  }
  checkConq();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => { CUR = (location.hash || '').replace(/^#\/?/, '') || 'home'; telaRender(); });

/* ---------- componentes ---------- */
const bar = (p, tick, tl, thin) => `<div class="bar ${thin ? 'thin' : ''}"><i style="width:${clamp(p * 100, 0, 100)}%"></i>${tick != null ? `<b style="left:${clamp(tick * 100, 0, 100)}%" data-l="${tl}"></b>` : ''}</div>`;
const copyBtn = (t, l, cls) => `<button class="btn ${cls || 'ghost'} sm" data-act="copy" data-t="${encodeURIComponent(t)}">${l}</button>`;

/* ================== CURSO DO PETRUS (cérebro de professor) ================== */
/* Dados: dados/cerebro.js (banco de regras, Raio-X por tema, clones, cartões; gerado de estudo-petrus\banco) e dados/curso.js (aulas escritas pelo Petrus). */
const CER = window.C48_CEREBRO || { mats: {}, clones: [], cards: [], n: 0 }, CURP = window.C48_CURSO || {};
const MOLDE = { etica: [1, 8], fil: [9, 10], const: [11, 16], dh: [17, 18], elei: [19, 20], int: [21, 22], fin: [23, 24], trib: [25, 29], adm: [30, 34], amb: [35, 36], civil: [37, 42], eca: [43, 44], cons: [45, 46], emp: [47, 50], pcivil: [51, 56], penal: [57, 62], ppenal: [63, 68], prev: [69, 70], trab: [71, 75], ptrab: [76, 80] };
const molde = id => MOLDE[id] ? { de: MOLDE[id][0], ate: MOLDE[id][1], n: MOLDE[id][1] - MOLDE[id][0] + 1 } : null;
const TIPOS_R = { regra: 'Regra', prazo: 'Prazo', quorum: 'Quórum', pegadinha: 'Pegadinha', jurisprudencia: 'Jurisprudência', mnemonico: 'Macete', metodo: 'Método', divergencia: 'Divergência', padrao: 'Padrão FGV' };
const STAT_R = { conferido: ['ok', 'conferido na lei'], conferir: ['ck', 'conferir antes de usar'], divergente: ['dv', 'divergente: ler a lei'] };
const cpRead = () => (S.cp = S.cp || { r: {} }).r;
let qIds = null, qTema = '';
function cpMatList() { return MAT.slice().sort((a, b) => a.ciclo - b.ciclo); }
function cpProg(id) { const A = (CURP[id] || {}).blocos || [], r = cpRead(); const n = A.filter((b, i) => r[id + ':' + i]).length; return { n, tot: A.length }; }
const cpFixo = t => t.ex.length >= 6;
function cpQ(id) { return QR.find(q => q.id === id); }
function cpTemaCard(id, m, i, t, mx) {
  const ex = t.ex.join(', ');
  return `<div class="rx ${cpFixo(t) ? 'fx' : ''}"><div class="rxh"><b>${esc(t.t)}</b>${cpFixo(t) ? '<span class="pill or">tema fixo</span>' : ''}</div>
    <div class="rxb"><div class="bar thin"><i style="width:${Math.max(6, t.n / mx * 100)}%"></i></div><span class="tiny">${t.n} ${t.n > 1 ? 'questões' : 'questão'} · exames ${esc(ex)}</span></div>
    <button class="btn ghost sm" data-act="cpTreino" data-m="${id}" data-i="${i}">Treinar estas ${t.n}</button></div>`;
}
function cpRegras(id) {
  const rs = ((CER.mats[id] || {}).regras || []);
  if (!rs.length) return '';
  const ordem = ['padrao', 'pegadinha', 'regra', 'prazo', 'quorum', 'mnemonico', 'jurisprudencia', 'divergencia', 'metodo'];
  const grupos = ordem.map(k => [k, rs.filter(r => r.k === k)]).filter(g => g[1].length);
  const nConf = rs.filter(r => r.s === 'conferido').length;
  return `<div class="card"><h2>Banco de regras do Petrus (${rs.length} · ${nConf} conferidas na lei)</h2>
    <p class="muted" style="font-size:13px;margin-bottom:12px">Cada regra foi lida no texto da lei. O selo mostra se ainda precisa de conferência: use o que está <b>conferido</b> com segurança e leia a lei antes de afirmar o que estiver em <b>conferir</b>.</p>
    ${grupos.map(([k, l]) => `<details class="rg"><summary>${TIPOS_R[k] || k} <span class="tiny">(${l.length})</span></summary>${l.map(r => { const st = STAT_R[r.s] || STAT_R.conferir; return `<div class="rgi"><div class="rgh"><b>${esc(r.t)}</b><span class="sel ${st[0]}" title="${st[1]}">${st[1]}</span></div><div class="rgt">${mdRich(r.e)}</div>${r.b ? `<div class="tiny">Base legal: ${esc(r.b)}${r.x ? ' · exame(s): ' + esc(r.x) : ''}</div>` : ''}${r.o ? `<div class="tiny">Nota do Petrus: ${esc(r.o)}</div>` : ''}</div>`; }).join('')}</details>`).join('')}</div>`;
}
function vCP() {
  const r = route();
  if (r.a === 'fgv') return vCPAula0();
  if (r.a && MAT.find(m => m.id === r.a)) return vCPMat(r.a);
  const tot = Object.values(CER.mats).reduce((s, m) => s + m.regras.length, 0);
  const lista = cpMatList().map(m => {
    const c = CER.mats[m.id] || { regras: [], temas: [] }, p = cpProg(m.id), mo = molde(m.id), fx = c.temas.filter(cpFixo).length, temAula = (CURP[m.id] || {}).blocos;
    return `<a class="cpc" href="#/curso/${m.id}" style="--cc:${m.cor}"><b>${esc(m.nome)}</b><span class="tiny">${mo ? mo.n + (mo.n > 1 ? ' questões' : ' questão') + ' por prova (Q' + mo.de + (mo.n > 1 ? '–' + mo.ate : '') + ')' : ''}</span>
      <span class="tiny">${temAula ? p.n + ' de ' + p.tot + ' blocos lidos' : 'aula em preparo'} · ${fx} ${fx === 1 ? 'tema fixo' : 'temas fixos'} · ${c.regras.length} regras</span>${temAula ? bar(p.tot ? p.n / p.tot : 0, null, '', true) : ''}</a>`;
  }).join('');
  return `<div class="top"><div><h1>Curso do <em>Petrus</em></h1><p class="sub">O curso inteiro do Petrus, feito para você: resumo didático, o que a FGV mais cobra, as pegadinhas de cada tema e treino com as questões reais. Começa pela Aula 0 e depois segue a ordem que o seu diagnóstico pediu.</p></div></div>
    <div class="curso"><div class="card dark"><h2>Aula 0</h2><h1 style="font-size:26px;margin:0 0 8px">Como a FGV <em>pensa</em></h1><p style="margin:0 0 14px;line-height:1.6">O que 640 questões dos exames 40 a 47 ensinam: o que não adianta decorar, o molde fixo da prova, as questões que se repetem e a estratégia dos 40 acertos.</p><a class="btn" href="#/curso/fgv" style="text-decoration:none">Abrir a Aula 0</a></div>
    <div><h2>Matérias, na ordem do seu diagnóstico</h2><div class="cpg">${lista}</div></div>
    <div class="grid g2"><div class="card cream"><h2>Cartões do banco</h2><p style="margin:0 0 12px;line-height:1.55">${CER.cards.length} cartões de regras e pegadinhas conferidas na lei, para revisar sem abrir o livro.</p><button class="btn sm" data-act="cardSrc" data-s="cerebro">Abrir os cartões</button></div>
      <div class="card"><h2>O cérebro do Petrus</h2><p style="margin:0;line-height:1.55">${tot} regras em 20 matérias, ${(window.C48_QR || []).length} questões reais classificadas por tema e as questões que a FGV repete. Gerado em ${esc(CER.gerado || '')}.</p></div></div></div>`;
}
function vCPMat(id) {
  const m = MAT.find(x => x.id === id), c = CER.mats[id] || { regras: [], temas: [] }, A = CURP[id], mo = molde(id), rd = cpRead();
  const mx = Math.max(1, ...c.temas.map(t => t.n)), nq = c.temas.reduce((s, t) => s + t.n, 0);
  const temaIdx = n => c.temas.findIndex(t => t.t === n);
  const raiox = c.temas.length ? `<div class="card"><h2>Raio-X: o que a FGV cobrou em ${esc(m.nome)}</h2><p class="muted" style="font-size:13px;margin-bottom:12px">${nq} questões reais dos exames 40 a 47${mo ? ' (sempre as questões ' + mo.de + (mo.n > 1 ? ' a ' + mo.ate : '') + ' da prova)' : ''}, classificadas por tema pelo Petrus. <b>Tema fixo</b> = apareceu em 6 ou mais das 8 provas.</p><div class="rxg">${c.temas.map((t, i) => cpTemaCard(id, m, i, t, mx)).join('')}</div></div>` : '';
  const blocos = A && A.blocos.length ? A.blocos.map((b, i) => {
    const ti = b.tema ? temaIdx(b.tema) : -1, t = ti >= 0 ? c.temas[ti] : null, key = id + ':' + i, lido = !!rd[key];
    return `<div class="lstep cpb ${lido ? 'lido' : ''}"><h2>${i + 1}. ${esc(b.t)}</h2>${t ? `<div class="row"><span class="pill cream">${t.n} ${t.n > 1 ? 'questões' : 'questão'} · exames ${esc(t.ex.join(', '))}</span>${cpFixo(t) ? '<span class="pill or">tema fixo</span>' : ''}</div>` : ''}${mdRich(b.x)}
      <div class="row">${t ? `<button class="btn ghost sm" data-act="cpTreino" data-m="${id}" data-i="${ti}">Treinar as ${t.n} questões reais</button>` : ''}<button class="btn sm ${lido ? 'ghost' : ''}" data-act="cpLido" data-k="${key}">${lido ? 'Lido (desmarcar)' : 'Marcar como lido'}</button></div></div>`;
  }).join('') : '<div class="card cream"><h2>Aula em preparo</h2><p style="margin:0;line-height:1.55">O Petrus ainda está escrevendo a aula desta matéria. Enquanto isso, use o Raio-X acima para treinar os temas que mais caem e o banco de regras abaixo.</p></div>';
  const p = cpProg(id);
  return `<div class="top"><div><a class="tiny" href="#/curso">← Curso do Petrus</a><h1>${esc(m.nome)}</h1><p class="sub">${mo ? 'Na prova são ' + mo.n + (mo.n > 1 ? ' questões' : ' questão') + ' (Q' + mo.de + (mo.n > 1 ? ' a Q' + mo.ate : '') + ').' : ''} ${A ? p.n + ' de ' + p.tot + ' blocos lidos.' : ''}</p></div><a class="btn ghost sm" href="#/book/${id}" style="text-decoration:none">Abrir o livro de ${esc(m.nome)}</a></div>
    <div class="curso">${A && A.intro ? `<div class="card cream cpi">${mdRich(A.intro)}</div>` : ''}${raiox}${blocos}${cpRegras(id)}</div>`;
}
/* livro (Biblioteca): resumo denso do Petrus por tema, do que mais cai para o que menos cai, com treino e banco de regras */
const CPOPEN = new Set();
document.addEventListener('toggle', e => { const d = e.target; if (d && d.classList && d.classList.contains('cpd')) { if (d.open) CPOPEN.add(d.dataset.k); else CPOPEN.delete(d.dataset.k); } }, true);
function cpLivro(m) {
  const id = m.id, A = CURP[id]; if (!A || !A.blocos || !A.blocos.length) return '';
  const c = CER.mats[id] || { regras: [], temas: [] }, rd = cpRead(), p = cpProg(id), mo = molde(id);
  const itens = A.blocos.map((b, i) => {
    const ti = b.tema ? c.temas.findIndex(t => t.t === b.tema) : -1, t = ti >= 0 ? c.temas[ti] : null, key = id + ':' + i, lido = !!rd[key];
    return `<details class="cpd ${lido ? 'lido' : ''}" data-k="${key}" ${CPOPEN.has(key) ? 'open' : ''}><summary><span class="cpn">${lido ? '✓' : i + 1}</span><b>${esc(b.t)}</b>${t ? `<span class="tiny">${t.n} ${t.n > 1 ? 'questões' : 'questão'}${cpFixo(t) ? ' · tema fixo' : ''}</span>` : ''}</summary>
      <div class="cpdb prose">${mdRich(b.x)}</div><div class="row cpdr">${t ? `<button class="btn ghost sm" data-act="cpTreino" data-m="${id}" data-i="${ti}">Treinar as ${t.n} questões reais</button>` : ''}<button class="btn sm ${lido ? 'ghost' : ''}" data-act="cpLido" data-k="${key}">${lido ? 'Lido (desmarcar)' : 'Marcar como lido'}</button></div></details>`;
  }).join('');
  return `<h2 class="sh">Resumo denso do Petrus</h2><p class="muted" style="margin:-4px 0 12px;font-size:13.5px;line-height:1.5">${mo ? `Na prova são ${mo.n} ${mo.n > 1 ? 'questões' : 'questão'} de ${esc(m.nome)}. ` : ''}Os blocos abaixo vão do tema que mais cai para o que menos cai, com quadros, pegadinhas da FGV e treino das questões reais. ${p.n} de ${p.tot} lidos. <a href="#/curso/${id}">Abrir no Curso do Petrus</a> · <a href="#/crono">Ver no cronograma</a>.</p>
    ${A.intro ? `<details class="cpd intro" data-k="${id}:intro" ${CPOPEN.has(id + ':intro') ? 'open' : ''}><summary><span class="cpn">★</span><b>Por que esta matéria importa na prova</b></summary><div class="cpdb prose">${mdRich(A.intro)}</div></details>` : ''}
    <div class="cpds">${itens}</div>${cpRegras(id)}`;
}
/* cartão da tela inicial: próxima aula do Curso do Petrus (Aula 0 primeiro, depois a ordem do diagnóstico) */
function cpHomeHtml() {
  try {
    const CR = window.C48_CRONO; if (!CR) return '';
    const hj = crDia(), dia = CR.dias[hj], ts = dia.tarefas.filter(t => crContaTarefa(t)), feitas = ts.filter((t, i) => crFeita(hj, dia.tarefas.indexOf(t))).length, atras = crAtrasadas().length;
    const top = ts.filter(t => ['novo', 'rev', 'bateria', 'reforco', 'revgeral', 'correcao'].includes(t.k)).slice(0, 3).map(t => crRotulo(t) + ': ' + crNomeTarefa(t));
    return `<div class="card cream cph"><h2>Hoje no cronograma · ${fmt(hj)}</h2><div class="row" style="justify-content:space-between;align-items:flex-end;gap:14px"><div style="min-width:0"><b style="font-size:17px">${dia.min} min de estudo (${dia.janela})</b><div class="tiny" style="margin-top:4px">${feitas} de ${ts.length} tarefas feitas${atras ? ` · <b style="color:#B93A22">${atras} atrasadas</b>` : ''}</div><div class="tiny" style="margin-top:4px">${top.map(esc).join(' · ')}</div></div><a class="btn sm" href="#/crono" style="text-decoration:none">Abrir o cronograma</a></div></div>`;
  } catch (e) { return ''; }
}
/* ---------- Cronograma do curso (dados/cronograma.js, gerado por tools/montar-cronograma.ps1) ---------- */
const crTk = () => (S.cp = S.cp || { r: {} }).tk = (S.cp.tk || {});
const crRv = () => (S.cp = S.cp || { r: {} }).rv = (S.cp.rv || {});
function crDia(d) { const CR = window.C48_CRONO, t = d || today(); return t < CR.inicio ? CR.inicio : t > CR.fim ? CR.fim : t; }
const crContaTarefa = t => !['livre', 'sim'].includes(t.k) || t.k === 'livre' && false;
const crMat = id => id === 'fgv' ? { id: 'fgv', nome: 'Aula 0', cor: '#FF6D29' } : (MAT.find(m => m.id === id) || { id, nome: id, cor: '#888' });
function crRotulo(t) { return { novo: 'Aula nova', rev: 'Revisão D' + t.n, bateria: 'Bateria', reforco: 'Reforço', revgeral: 'Revisão geral', correcao: 'Correção', sim: 'Simulado', livre: 'Questões e erros', vespera: 'Véspera' }[t.k] || t.k; }
function crNomeTarefa(t) { const m = t.mat ? crMat(t.mat).nome : ''; return ['novo', 'rev', 'reforco'].includes(t.k) ? m + ' · ' + t.t : t.k === 'bateria' || t.k === 'revgeral' ? m : t.t; }
const crFeita = (d, i) => !!crTk()[d + '|' + i];
function crAtrasadas() {
  const CR = window.C48_CRONO, hj = crDia(), out = [];
  Object.keys(CR.dias).filter(d => d < hj).forEach(d => CR.dias[d].tarefas.forEach((t, i) => { if (!['livre', 'sim'].includes(t.k) && !crFeita(d, i)) out.push({ d, i, t }); }));
  return out;
}
function crTarefaHtml(d, i, t) {
  const f = crFeita(d, i), m = t.mat ? crMat(t.mat) : null, link = ['novo', 'reforco'].includes(t.k) && t.mat ? `<a class="btn ghost sm" href="#/curso/${t.mat}" style="text-decoration:none">Abrir a aula</a>` : t.k === 'rev' && t.mat ? `<a class="btn ghost sm" href="#/curso/${t.mat}" style="text-decoration:none">Rever</a>` : '';
  const trein = ['novo', 'reforco'].includes(t.k) && t.n ? `<button class="btn ghost sm" data-act="crTreino" data-k="${esc(t.key)}">Treinar ${t.n}</button>` : t.k === 'bateria' ? `<button class="btn ghost sm" data-act="crBateria" data-m="${t.mat}">Treinar 10</button>` : t.k === 'sim' ? '<a class="btn ghost sm" href="#/mock" style="text-decoration:none">Montar o simulado</a>' : t.k === 'livre' || t.k === 'correcao' ? '<a class="btn ghost sm" href="#/err" style="text-decoration:none">Caderno de erros</a>' : '';
  return `<div class="crt ${f ? 'ok' : ''} k-${t.k}" ${m ? `style="--cc:${m.cor}"` : ''}><button class="crc" data-act="crFeito" data-d="${d}" data-i="${i}" aria-label="Marcar como feito">${f ? '✓' : ''}</button><div class="crb"><span class="crl">${esc(crRotulo(t))}${t.k !== 'sim' ? ' · ' + t.min + ' min' : ' · ' + (t.min / 60) + ' h'}</span><b>${esc(crNomeTarefa(t))}</b></div><div class="row crx">${link}${trein}</div></div>`;
}
function vCrono() {
  const CR = window.C48_CRONO; if (!CR) return '<div class="top"><div><h1>Cronograma</h1></div></div><p>Cronograma não encontrado.</p>';
  const hj = crDia(), dia = CR.dias[hj], atras = crAtrasadas(), dProva = Math.max(0, Math.ceil((new Date(CR.prova + 'T13:00:00') - new Date()) / 864e5));
  const hojeLista = dia.tarefas.map((t, i) => [t, i]).filter(([t]) => t.k !== 'sim' || true).map(([t, i]) => crTarefaHtml(hj, i, t)).join('');
  const prox = Object.keys(CR.dias).filter(d => d > hj).slice(0, 7).map(d => { const D = CR.dias[d], nv = D.tarefas.filter(t => t.k === 'novo').length, rv = D.tarefas.filter(t => t.k === 'rev').length, sim = D.tarefas.find(t => t.k === 'sim'); const nomes = [...new Set(D.tarefas.filter(t => ['novo', 'reforco', 'revgeral'].includes(t.k) && t.mat).map(t => crMat(t.mat).nome))].slice(0, 3).join(', ');
    return `<div class="crw"><b>${fmt(d)} · ${WD[parse(d).getDay()]}</b><span class="tiny">${D.min} min · ${D.janela}</span><span class="tiny">${nv ? nv + ' aula(s) nova(s) · ' : ''}${rv} revisões${sim ? ' · ' + crRotulo(sim) : ''}</span><span class="tiny">${esc(nomes)}</span></div>`; }).join('');
  const totMin = CR.materias.reduce((s, m) => s + m.minTotal, 0), totMinimo = CR.materias.reduce((s, m) => s + m.minMinimo, 0);
  const tab = CR.materias.map(m => { const mo = molde(m.id), cor = crMat(m.id).cor; return `<tr><td><i class="d" style="background:${cor}"></i>${esc(m.nome)}</td><td>${m.q || ''}</td><td>${m.nota < 0 ? '' : m.nota}</td><td>${m.blocos} <span class="tiny">(${m.ess} essenciais)</span></td><td><b>${(m.minMinimo / 60).toFixed(1)} h</b></td><td>${(m.minTotal / 60).toFixed(1)} h</td><td class="tiny">${fmt(m.ini)} a ${fmt(m.fim)}</td></tr>`; }).join('');
  const meses = {}; Object.keys(CR.dias).forEach(d => { (meses[d.slice(0, 7)] = meses[d.slice(0, 7)] || []).push(d); });
  const cal = Object.keys(meses).map(k => `<details class="crm"><summary>${MESES[Number(k.slice(5)) - 1]} ${k.slice(0, 4)}</summary>${meses[k].map(d => { const D = CR.dias[d], nomes = [...new Set(D.tarefas.filter(t => ['novo', 'reforco', 'revgeral'].includes(t.k) && t.mat).map(t => crMat(t.mat).nome))].join(', '); const sim = D.tarefas.find(t => t.k === 'sim'); return `<div class="crw ${d === hj ? 'hoje' : ''}"><b>${fmt(d)} · ${WD[parse(d).getDay()]}</b><span class="tiny">${D.min} min · ${esc(D.fase)}${sim ? ' · ' + crRotulo(sim) : ''}</span><span>${esc(nomes || (D.fase === 'reta-final' ? 'revisão geral' : 'revisões e questões'))}</span></div>`; }).join('')}</details>`).join('');
  return `<div class="top"><div><h1>Cronograma do <em>curso</em></h1><p class="sub">Até a prova de <b>10/01/2027</b> (${dProva} dias). Método: cada aula estudada volta em <b>D1, D2, D7, D14 e D30</b>. A ordem é pelo que mais cai e pelo que você mais precisa. Janelas de estudo da sua rotina, mínimo de 2 horas por dia.</p></div></div>
  <div class="curso">
  <div class="card"><h2>Hoje · ${fmt(hj)} ${WD[parse(hj).getDay()]} · ${dia.min} min (${dia.janela})</h2><div class="crl2">${hojeLista || '<p class="muted">Sem tarefas hoje.</p>'}</div></div>
  ${atras.length ? `<div class="card or"><h2>Atrasadas (${atras.length})</h2><p style="margin:0 0 10px;line-height:1.5">Faça primeiro as <b>revisões</b> atrasadas e as aulas <b>essenciais</b>; os blocos complementares ficam por último. O Petrus não esquece nada: nada foi perdido.</p><div class="crl2">${atras.slice(0, 10).map(a => crTarefaHtml(a.d, a.i, a.t)).join('')}</div>${atras.length > 10 ? `<p class="tiny">E mais ${atras.length - 10} tarefas atrasadas.</p>` : ''}</div>` : ''}
  <div class="card"><h2>Próximos 7 dias</h2><div class="crws">${prox}</div></div>
  <div class="card"><h2>Horas mínimas por matéria (total do plano: ${(totMin / 60).toFixed(0)} h; só o essencial: ${(totMinimo / 60).toFixed(0)} h)</h2><p class="muted" style="font-size:13px;margin-bottom:10px">"Mínimo" = aulas essenciais (tema fixo ou 4+ questões nas 8 provas) + as revisões D1 a D30 delas + a bateria. "Plano" inclui tudo, com reforço. Se atrasar, corte primeiro os blocos complementares, nunca as revisões.</p><div class="scroll"><table class="t"><tr><th>Matéria</th><th>Q/prova</th><th>Sua nota</th><th>Blocos</th><th>Mínimo</th><th>Plano</th><th>Período</th></tr>${tab}</table></div></div>
  <div class="card cream"><h2>Marcos</h2><div class="list"><div>07 a 20/10: arranque leve (TCC dia 20): Aula 0, Ética e Administrativo</div><div>25/10 a 03/01: simulado aos domingos, correção na segunda</div><div>26/11 a 02/12 (P2) e 10 a 16/12 (P3): só revisões e questões</div><div>até 08/12: todo o conteúdo novo; depois, reforço por tema</div><div>04 a 09/01: revisão geral por matéria, sem conteúdo novo; 09/01 véspera leve</div><div><b>10/01: 1ª fase (13h às 18h)</b></div></div></div>
  <div class="card"><h2>Calendário completo</h2>${cal}</div>
  </div>`;
}
function vCPAula0() {
  const A = CURP.fgv, rd = cpRead();
  const par = (CER.clones || []).map(c => { const a = cpQ(c.a), b = cpQ(c.b); if (!a || !b) return ''; const ex = q => q.exame + ' · questão ' + q.num; return `<div class="cln"><span class="pill cream">${esc(c.m)}</span><div class="clq"><b>${esc(ex(a))}</b><p>${esc(a.enun.slice(0, 220))}…</p></div><div class="clq"><b>${esc(ex(b))}</b><p>${esc(b.enun.slice(0, 220))}…</p></div><button class="btn ghost sm" data-act="cpClone" data-a="${c.a}" data-b="${c.b}">Treinar as duas</button></div>`; }).join('');
  const blocos = A ? A.blocos.map((b, i) => { const key = 'fgv:' + i, lido = !!rd[key]; return `<div class="lstep cpb ${lido ? 'lido' : ''}"><h2>${i + 1}. ${esc(b.t)}</h2>${mdRich(b.x)}<div class="row"><button class="btn sm ${lido ? 'ghost' : ''}" data-act="cpLido" data-k="${key}">${lido ? 'Lido (desmarcar)' : 'Marcar como lido'}</button></div></div>`; }).join('') : '<div class="card cream"><h2>Aula em preparo</h2></div>';
  return `<div class="top"><div><a class="tiny" href="#/curso">← Curso do Petrus</a><h1>Aula 0: como a FGV <em>pensa</em></h1><p class="sub">Base: as 640 questões dos exames 40 a 47, todas lidas e classificadas pelo Petrus.</p></div></div>
    <div class="curso">${A && A.intro ? `<div class="card cream cpi">${mdRich(A.intro)}</div>` : ''}${blocos}${par ? `<div class="card"><h2>Questões que se repetem (pares quase iguais)</h2><p class="muted" style="font-size:13px;margin-bottom:12px">A FGV reaproveita a mesma regra com personagens novos. Leia os pares lado a lado e responda: o que mudou? O que ficou igual?</p>${par}</div>` : ''}</div>`;
}
/* ================== INÍCIO ================== */
/* Petrus 3D (2ª versão, baseado na foto de referência): professor de óculos retangulares, cabelo bagunçado, nariz grande,
   bigode e barba por fazer, suéter verde com zíper. O corpo fica dentro de um disco redondo e a cabeça sai para fora dele.
   Humor calculado a partir dos estudos (ver petMood): radiante, contente, atento, preocupado, triste ou bravo. */
function petrusSvg(mood) {
  const star = 'M0-9L2.4-2.4L9 0L2.4 2.4L0 9L-2.4 2.4L-9 0L-2.4-2.4Z';
  return `<svg class="p3d m-${mood}" viewBox="0 0 300 340" role="img" aria-label="Petrus, o professor">
<defs>
<radialGradient id="ptSkin" cx="42%" cy="30%" r="78%"><stop offset="0" stop-color="#FFE6D2"/><stop offset=".55" stop-color="#F8C6A6"/><stop offset="1" stop-color="#E49A7B"/></radialGradient>
<radialGradient id="ptHair" cx="40%" cy="22%" r="85%"><stop offset="0" stop-color="#BE824A"/><stop offset=".55" stop-color="#7E4B28"/><stop offset="1" stop-color="#46240F"/></radialGradient>
<linearGradient id="ptBlz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4F2A12"/><stop offset="1" stop-color="#190A00"/></linearGradient>
<radialGradient id="ptNose" cx="40%" cy="28%" r="78%"><stop offset="0" stop-color="#FFC9B4"/><stop offset="1" stop-color="#EC8266"/></radialGradient>
<radialGradient id="ptCheek"><stop offset="0" stop-color="#FF8A74" stop-opacity=".62"/><stop offset="1" stop-color="#FF8A74" stop-opacity="0"/></radialGradient>
<linearGradient id="ptShirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E8E1D9"/></linearGradient>
<linearGradient id="ptBow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9248"/><stop offset="1" stop-color="#E4540A"/></linearGradient>
<clipPath id="ptEyeL"><ellipse cx="122" cy="153" rx="6.4" ry="8.8"/></clipPath>
<clipPath id="ptEyeR"><ellipse cx="178" cy="153" rx="6.4" ry="8.8"/></clipPath>
<filter id="ptB1" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="ptB2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.6"/></filter>
</defs>
<ellipse cx="150" cy="332" rx="108" ry="9" fill="#190A00" opacity=".16" filter="url(#ptB1)"/>
<g class="p3d-body">
<path d="M16 340C24 272 88 250 150 250C212 250 276 272 284 340Z" fill="url(#ptBlz)"/>
<path d="M36 302C60 270 100 258 130 255" stroke="#fff" stroke-opacity=".13" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M112 251L150 310L188 251Z" fill="url(#ptShirt)"/>
<path d="M90 264L128 249L147 298Z" fill="#2E1607"/><path d="M210 264L172 249L153 298Z" fill="#2E1607"/>
<path d="M150 270L120 255L120 285Z" fill="url(#ptBow)"/><path d="M150 270L180 255L180 285Z" fill="url(#ptBow)"/>
<rect x="141" y="260" width="18" height="19" rx="7" fill="#2F8F6B"/><rect x="144" y="262" width="6" height="7" rx="3" fill="#fff" opacity=".35"/>
</g>
<g class="p3d-head"><g class="p3d-aim">
<path d="M126 210L126 254C126 266 174 266 174 254L174 210Z" fill="url(#ptSkin)"/>
<ellipse cx="150" cy="238" rx="32" ry="13" fill="#C27559" opacity=".38" filter="url(#ptB2)"/>
<ellipse cx="88" cy="170" rx="13" ry="19" fill="url(#ptSkin)"/><ellipse cx="90" cy="172" rx="6" ry="10" fill="#F08C70" opacity=".6"/>
<ellipse cx="212" cy="170" rx="13" ry="19" fill="url(#ptSkin)"/><ellipse cx="210" cy="172" rx="6" ry="10" fill="#F08C70" opacity=".6"/>
<path d="M92 132C92 82 208 82 208 132L208 178C208 224 184 246 150 246C116 246 92 224 92 178Z" fill="url(#ptSkin)"/>
<ellipse cx="128" cy="112" rx="26" ry="11" fill="#fff" opacity=".28" filter="url(#ptB2)"/>
<path class="tint" d="M92 132C92 82 208 82 208 132L208 178C208 224 184 246 150 246C116 246 92 224 92 178Z" fill="#FF3322" opacity="0"/>
<circle cx="114" cy="198" r="19" fill="url(#ptCheek)"/><circle cx="186" cy="198" r="19" fill="url(#ptCheek)"/>
<path d="M86 148C72 94 102 56 150 56C200 56 230 94 214 148C210 124 198 108 178 102C158 96 124 98 104 112C94 120 88 134 86 148Z" fill="url(#ptHair)"/>
<path d="M118 64C130 40 170 38 184 64C170 56 140 54 118 64Z" fill="url(#ptHair)"/>
<path d="M112 82C132 68 162 66 190 80" stroke="#E0A468" stroke-opacity=".55" stroke-width="4" fill="none" stroke-linecap="round"/>
<path class="brow bl" d="M104 126Q122 116 140 124"/><path class="brow br" d="M160 124Q178 116 196 126"/>
<g class="eyes-open"><g class="irises"><ellipse cx="122" cy="153" rx="6.2" ry="8.6" fill="#2A1306"/><circle cx="124.4" cy="149" r="2.5" fill="#fff"/><ellipse cx="178" cy="153" rx="6.2" ry="8.6" fill="#2A1306"/><circle cx="180.4" cy="149" r="2.5" fill="#fff"/></g>
<g clip-path="url(#ptEyeL)"><rect class="lid ll" x="104" y="130" width="36" height="26" fill="#F3B898"/></g>
<g clip-path="url(#ptEyeR)"><rect class="lid lr" x="160" y="130" width="36" height="26" fill="#F3B898"/></g></g>
<g class="eyes-happy"><path d="M110 156Q122 140 134 156" stroke="#2A1306" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M166 156Q178 140 190 156" stroke="#2A1306" stroke-width="4.5" fill="none" stroke-linecap="round"/></g>
<circle cx="122" cy="153" r="26" fill="#fff" fill-opacity=".1" stroke="#190A00" stroke-width="5"/><circle cx="178" cy="153" r="26" fill="#fff" fill-opacity=".1" stroke="#190A00" stroke-width="5"/>
<path d="M147 150Q150 145 153 150" stroke="#190A00" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M97 148L89 145M203 148L211 145" stroke="#190A00" stroke-width="4" stroke-linecap="round"/>
<path d="M104 140A22 22 0 0 1 119 131" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M160 140A22 22 0 0 1 175 131" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/>
<ellipse cx="150" cy="191" rx="16.5" ry="12.5" fill="url(#ptNose)"/><ellipse cx="145" cy="186" rx="6" ry="3.6" fill="#fff" opacity=".5"/>
<path class="mo mo-neutro" d="M130 216L170 216"/>
<path class="mo mo-contente" d="M127 214Q150 232 173 214"/>
<g class="mo mo-radiante"><path d="M123 211Q150 246 177 211Z" fill="#8E2F22"/><path d="M130 213Q150 221 170 213L168 217Q150 226 132 217Z" fill="#fff"/><path d="M138 232Q150 226 162 232Q150 240 138 232Z" fill="#E8715F"/></g>
<path class="mo mo-preocupado" d="M130 221Q140 214 150 221T170 221"/>
<path class="mo mo-triste" d="M128 226Q150 209 172 226"/>
<path class="mo mo-bravo" d="M130 222Q150 212 170 222"/>
<g class="vein"><path d="M186 94l9-5M190 101l10 2M186 108l9 6" stroke="#E0352B" stroke-width="3" fill="none" stroke-linecap="round"/></g>
<path class="tear" d="M108 184c-5 9-1 14 3 14s6-5-3-14z" fill="#7CC8FF"/>
<path class="sweat" d="M198 100c-5 9-1 14 3 14s6-5-3-14z" fill="#8FD3FF"/>
<path class="sp s1" d="${star}" transform="translate(246 96)" fill="#2F8F6B"/><path class="sp s2" d="${star}" transform="translate(54 120) scale(.8)" fill="#FFB27A"/><path class="sp s3" d="${star}" transform="translate(252 206) scale(.65)" fill="#2F8F6B"/>
</g></g></svg>`;
}
/* termômetro de humor: soma de 0 a 100 feita só com o que está registrado nos estudos */
function petMood() {
  const t = today(), h = new Date().getHours(), mt = minToday(), meta = metaHoje();
  let cr = clamp(mt / meta, 0, 1); if (cr < 1) { if (h < 12) cr = Math.max(cr, .45); else if (h < 17) cr = Math.max(cr, .2); }
  const st = streak(), over = pending().length, ontem = S.hours[iso(addDays(parse(t), -1))] || 0;
  const pH = Math.round(cr * 45), pS = Math.round(Math.min(st, 7) / 7 * 20), pR = Math.round((1 - Math.min(over, 10) / 10) * 20), pO = ontem >= 60 ? 15 : ontem >= 30 ? 11 : ontem > 0 ? 6 : 0;
  const score = clamp(pH + pS + pR + pO, 0, 100);
  const key = score >= 85 ? 'radiante' : score >= 65 ? 'contente' : score >= 45 ? 'neutro' : score >= 28 ? 'preocupado' : score >= 12 ? 'triste' : 'bravo';
  const label = { radiante: 'Radiante', contente: 'Contente', neutro: 'Atento', preocupado: 'Preocupado', triste: 'Triste', bravo: 'Bravo' }[key];
  const parts = [['Hoje', pH, 45], ['Sequência', pS, 20], ['Revisões em dia', pR, 20], ['Ontem', pO, 15]];
  const worst = parts.map(p => [p[0], p[1] / p[2]]).sort((a, b) => a[1] - b[1])[0][0];
  return { score, key, label, parts, worst, st, over, mt, meta };
}
let PET = { i: -1, f: -1 };
/* dica da prova (FGV) que o Petrus mostra sempre; os dados vêm de dados\dicas-fgv.js, mantido pelo Estagiário 65 */
const FGVD = () => (window.C48_FGVDICAS && window.C48_FGVDICAS.dicas) || [];
function fgvDicaHtml(ix) {
  const L = FGVD(); if (!L.length) return '';
  const d = L[((ix % L.length) + L.length) % L.length], rot = { dado: 'Dado das 640 questões reais e do edital', fonte: 'De uma fonte pública (confira)', opiniao: 'Opinião do Petrus, não é dado' }[d.tipo] || '';
  return `<div class="pdica t-${d.tipo}" id="pdica"><span class="ptag">${rot}</span><b>Dica da prova: ${esc(d.t)}</b><p>${esc(d.x)}</p>${d.fonte ? `<small>Fonte: ${esc(d.fonte)}</small>` : ''}<small class="tiny">Toque no Petrus para outra dica.</small></div>`;
}
function petrusHero(mt, meta, dProva, nDue) {
  const M = petMood(), h = new Date().getHours(), greet = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const nx = nextUnit(today()), ing = QUEUE.find(x => !isDone(x.k) && bkStep(x.k) > 0 && AULA()[x.k]);
  const pick = ing || (nx && AULA()[nx.k] ? nx : QUEUE.find(x => !isDone(x.k) && AULA()[x.k]));
  const falta = Math.max(0, meta - mt);
  const why = { 'Hoje': mt === 0 ? 'ainda não há estudo registrado hoje' : 'o estudo de hoje está abaixo da meta', 'Sequência': 'a sequência de dias caiu', 'Revisões em dia': `há ${M.over} revisões vencidas`, 'Ontem': 'ontem quase não houve estudo' }[M.worst];
  const msg = {
    radiante: `Rotina em dia e meta de hoje batida (${hm(mt)}). Assim se constrói uma boa preparação.`,
    contente: mt >= meta ? `Meta de hoje batida: ${hm(mt)}. O que entrar a mais é ganho.` : `Você está no caminho. Faltam ${hm(falta)} para a meta de hoje.`,
    neutro: `Estou atento. Hoje: ${hm(mt)} de ${hm(meta)}.${M.over ? ' Há ' + M.over + (M.over > 1 ? ' revisões vencidas.' : ' revisão vencida.') : ''}`,
    preocupado: `Estou preocupado: ${why}. Dá para corrigir ainda hoje.`,
    triste: `Fico triste de ver o dia passar: ${why}. Trinta minutos já mudam o quadro.`,
    bravo: `Assim não, Lucas: ${why}. Abra a aula agora; eu espero.`
  }[M.key];
  const extra = [nDue ? (nDue > 1 ? `${nDue} revisões esperando` : '1 revisão esperando') : '', `${dProva} dias para a 1ª fase`].filter(Boolean).join(' · ');
  const tip = M.parts.map(p => p[0] + ' ' + p[1] + '/' + p[2]).join(' · ');
  const dicaFgv = fgvDicaHtml(PET.f >= 0 ? PET.f : Math.floor(Date.now() / 864e5));
  return `<div class="petrus-hero m-${M.key}"><div class="pchar" data-act="petrusTalk" title="Clique para ouvir uma dica">${petrusSvg(M.key)}</div>
  <div class="pbub"><span class="pname">PETRUS · SEU PROFESSOR</span><p id="pmsg"><b>${greet}, Lucas.</b> ${msg}</p>
  ${dicaFgv}
  <span class="pextra" title="${esc(tip)}">${extra}</span>
  <div class="row" style="margin-top:12px">${pick ? `<button class="btn sm" data-act="bkOpen" data-k="${pick.k}">${ing ? 'Continuar a aula' : 'Abrir a aula de hoje'}</button>` : ''}<a class="btn ghost sm" href="#/rev" style="text-decoration:none">Ver revisões</a></div></div></div>`;
}
document.addEventListener('mousemove', e => {
  if (PET.raf) return; PET.raf = requestAnimationFrame(() => { PET.raf = 0;
    const s = document.querySelector('.p3d'); if (!s) return; const r = s.getBoundingClientRect();
    const dx = clamp((e.clientX - (r.left + r.width / 2)) / 350, -1, 1), dy = clamp((e.clientY - (r.top + r.height * .42)) / 350, -1, 1);
    s.style.setProperty('--px', (dx * 5.5).toFixed(1) + 'px'); s.style.setProperty('--py', (dy * 4.5).toFixed(1) + 'px');
    s.style.setProperty('--rot', (dx * 5).toFixed(1) + 'deg'); s.style.setProperty('--hx', (dx * 4).toFixed(1) + 'px'); });
}, { passive: true });
function vHome() {
  const t = today(), now = new Date(), P = progress(), N = nota(), f = faseOf(t);
  const dProva = Math.max(0, Math.ceil((new Date(CFG.prova) - now) / 864e5));
  const dInsc = Math.ceil((new Date(CFG.inscricaoFim) - now) / 864e5);
  const mt = minToday(), meta = metaHoje(), due = pending(), leve = !!S.leve[t], fiDia = fichaDoDia(t);
  const next = f && f.novo && !isSim(t) ? nextUnit(t) : null;
  const dica = DICAS.length ? DICAS[Math.floor((parse(t) - parse('2026-01-01')) / 864e5) % DICAS.length] : '';
  const hist = HIST.filter(h => h.data <= t).sort((a, b) => b.data.localeCompare(a.data))[0] || HIST[0];
  const news = NOT.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 3);
  const prazos = CFG.prazos.filter(p => p.d >= t).sort((a, b) => a.d.localeCompare(b.d)).slice(0, 5);
  const sim = SIMS.find(s => s.d >= t);
  const st = streak();
  let cobra;
  const stTxt = `Sequência: ${st} dia${st === 1 ? '' : 's'}.`;
  if (mt >= meta) cobra = `<div class="cobra ok"><b>Meta de hoje batida: ${hm(mt)} de ${hm(meta)}${leve ? ' (dia leve)' : ''}.</b><span class="muted">${stTxt} Se quiser, continue mais um pouco.</span><span class="sp"></span>${logBtns()}</div>`;
  else { const falta = meta - mt, h = now.getHours();
    const msg = leve ? `Hoje é um dia leve: 30 minutos já mantêm a sua sequência. Faltam ${hm(falta)}.`
      : mt === 0 ? (h < 12 ? 'Ainda não há estudo registrado hoje. A meta é de 2 horas, e 30 minutos já são um bom começo.' : 'Ainda não há estudo registrado hoje. Quando puder, comece com 30 minutos.')
      : `Faltam ${hm(falta)} para a meta de hoje.`;
    cobra = `<div class="cobra"><div><b>${msg}</b><div class="tiny" style="margin-top:3px">${leve ? 'Dia leve: revisões D1 e D2 e 5 questões.' : 'Dia puxado ou cansado? Dá para escolher a versão mínima de 30 minutos.'}</div></div><span class="sp"></span><button class="btn ghost sm" data-act="leve">${leve ? 'Voltar para 2h' : 'Versão mínima (30 min)'}</button>${logBtns()}</div>`; }
  const diff = P.done - P.exp, ritmo = P.exp < 1 ? 'Meta de ritmo começa a contar nos próximos dias.' : diff >= 0 ? 'No ritmo ou à frente.' : `Atrás ${Math.ceil(-diff)} unidade${-diff > 1 ? 's' : ''} da meta de hoje.`;
  const need = P.capAll > 0 ? P.total / P.capAll : 99;
  const sched = todaySchedule(t), nowM = now.getHours() * 60 + now.getMinutes();
  const studyMin = sched.filter(b => b.k === 'estudo').reduce((s2, b) => s2 + tmin(b.f) - tmin(b.h), 0);
  const svg = d => `<svg viewBox="0 0 24 24">${d}</svg>`;
  const htab = S.homeTab === 'geral' ? 'geral' : 'hoje';
  return `<div class="home hv-${htab}"><div class="htabs"><button class="${htab === 'hoje' ? 'on' : ''}" data-act="homeTab" data-v="hoje">Hoje</button><button class="${htab === 'geral' ? 'on' : ''}" data-act="homeTab" data-v="geral">Visão geral</button></div>
  ${petrusHero(mt, meta, dProva, due.length)}
  ${cobra}
  ${hojeAulaHtml()}
  ${cpHomeHtml()}
  <div class="hsearch"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="hq" placeholder="Pesquisar temas, aulas, minhas páginas, notas e leis" autocomplete="off" value="${esc(hqQ)}"><div id="hqres">${hqHtml(hqQ)}</div></div>
  <div class="hero">
    <div class="datecard">
      <div class="dnum">${pad(now.getDate())}</div>
      <div class="dmeta"><div><b>${MESES[now.getMonth()]}</b><span>${now.getFullYear()}</span></div><div class="dw">${WDL[now.getDay()]}</div></div>
      <div class="dhead">${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((l, i) => `<span class="${(now.getDay() + 6) % 7 === i ? 't' : ''}">${l}</span>`).join('')}</div>
      <div class="dgrid">${dotCalendar(t)}</div>
      <div class="legend"><span><i style="background:var(--ink)"></i>2h batidas</span><span><i style="background:var(--orange)"></i>hoje</span><span><i style="box-shadow:inset 0 0 0 1.6px #B3AEA7"></i>sem meta</span><span><i style="background:#C2BEB8"></i>a vir</span><span><i style="background:var(--peach);box-shadow:inset 0 0 0 2px var(--brown)"></i>prova em ${dProva} dias</span></div>
    </div>
    <div class="sched">
      <div class="hd"><div><h2>Cronograma de hoje</h2><h3>${f ? esc(f.nome) : 'Fora do plano'}</h3><div class="tiny" style="margin-top:4px">${f ? esc(f.foco) : ''}</div>${fiDia ? `<span class="tg o" style="margin-top:10px">Treino ${fiDia.id} · ${esc(fiDia.foco)}</span>` : ''}</div>
        <div class="tiny" style="text-align:right">Estudo planejado<br><b style="color:#fff;font-size:15px">${hm(studyMin)}</b></div></div>
      <div class="tl">${sched.map(b => { const a = tmin(b.h), z = tmin(b.f), cls = b.k + (nowM >= a && nowM < z ? ' agora' : nowM >= z ? ' passou' : ''); return `<div class="it ${cls}"><div class="tm">${b.h}${b.k === 'sono' ? '' : '<small>até ' + b.f + '</small>'}</div><div class="bd"><b>${esc(b.t)}</b>${(b.sub || []).map(x => `<span>${esc(x)}</span>`).join('')}</div></div>`; }).join('')}</div>
      <div class="ft"><div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="tiny">Registrar estudo: ${hm(mt)} de ${hm(meta)}${leve ? ' (dia leve)' : ''}</span>${logBtns()}</div>${bar(clamp(mt / meta, 0, 1), null, '', true)}<div class="row" style="margin-top:12px"><a class="btn sm" href="#/foco" style="text-decoration:none">Entrar no modo foco (50/10)</a></div></div>
    </div>
  </div>
  <div class="trio">
    <div class="progcard">
      <div class="hd"><div><h2 style="color:rgba(25,10,0,.6)">Progresso</h2><div class="num">${Math.round(P.pct * 100)}%<small>${P.done} de ${P.total} unidades estudadas</small></div></div>
        <div style="text-align:right"><span class="tg k">${P.ok} consolidadas</span><div class="tiny" style="margin-top:6px;color:rgba(25,10,0,.7)">${ritmo}</div></div></div>
      <div style="margin-top:24px">${bar(P.pct, P.total ? P.exp / P.total : 0, 'meta de hoje')}</div>
      <div class="wbars">${weekBars(t)}</div>
      <div class="tiny" style="margin-top:8px;color:rgba(25,10,0,.65)">Barras: minutos estudados por dia nesta semana (meta de 2h por dia).</div>
    </div>
    <div class="minis">
      <div class="mini2"><span class="ico">${svg(ICON.sim)}</span><div><div class="v">${dProva}</div><div class="l">dias para a 1ª fase · ${Math.floor(dProva / 7)} semanas</div></div></div>
      <div class="mini2"><span class="ico">${svg('<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5l-5.4 3 1.2-6L3.3 9.3l6.1-.7z"/>')}</span><div><div class="v">${N.nota == null ? '—' : N.nota.toFixed(1)}</div><div class="l">${N.nota == null ? 'nota: sem dados ainda' : 'nota · ' + esc(N.lbl)}</div></div></div>
      <div class="mini2"><span class="ico">${svg(ICON.rev)}</span><div><div class="v">${due.length}</div><div class="l">revisões na fila · <a href="#/rev">abrir</a></div></div></div>
      <div class="mini2"><span class="ico">${svg(ICON.err)}</span><div><div class="v">${S.errors.length}</div><div class="l">erros no caderno · <a href="#/err">abrir</a></div></div></div>
    </div>
  </div>
  <div class="tiles">
    <div class="tile g3c"><h3>Próximo simulado</h3>
      ${sim ? `<div class="big" style="font-size:46px">${fmt(sim.d)}<small>${WD[parse(sim.d).getDay()]} · ${sim.tipo === 'mini' ? 'mini, 40 questões' : '80 questões, 13h às 18h'}</small></div>` : '<div class="d">Sem simulados agendados.</div>'}
      <div class="d">Questões reais de provas anteriores.</div><div class="ft"><a class="btn sm" href="#/sim" style="text-decoration:none">Abrir simulados</a></div></div>
    <div class="tile g4"><h3>Próximos prazos</h3><div class="list">${prazos.map(p => `<div><span class="pill ${p.tag === 'OAB' ? 'or' : ''}">${fmt(p.d)}</span><span class="sp">${esc(p.t)}${p.h ? ' · ' + p.h : ''}</span></div>`).join('')}</div></div>
    <div class="tile g0"><h3>Dica do dia</h3><div class="d" style="font-size:17px;line-height:1.45;color:var(--brown);font-weight:500">${esc(dica)}</div></div>
    <div class="tile g2c"><h3>${hist ? esc(hist.titulo) : 'Historinha do dia'}</h3>
      ${hist ? `<div class="tags"><span class="tg w">${esc(hist.materia)}</span></div><p class="story">${esc(hist.texto)}</p><p class="tiny"><b>Para fixar:</b> ${esc(hist.ancora)}</p>${hist.pergunta ? `<p class="tiny" style="margin-top:6px"><b>Pergunta para o chat:</b> ${esc(hist.pergunta)}</p>` : ''}` : '<div class="d">Sem historinha ainda.</div>'}</div>
    <div class="tile g1"><h3>Notícias jurídicas</h3>
      ${news.length ? `<div class="list">${news.map(n => `<div style="display:block"><a href="${esc(n.url)}" target="_blank" rel="noopener" style="font-weight:700">${esc(n.titulo)}</a><div class="tiny">${esc(n.fonte)} · ${fmt(n.data)}${n.materia ? ' · ' + esc(n.materia) : ''}</div><div style="font-size:13px">${esc(n.resumo)}</div></div>`).join('')}</div>` : '<div class="d">Ainda sem notícias. O agente petrus-noticias preenche esta lista.</div>'}</div>
    <div class="tile g5"><h3>Meus lembretes</h3>
      <div class="list">${S.lembretes.length ? S.lembretes.slice().sort((a, b) => a.d.localeCompare(b.d)).map(l => `<div><span class="pill">${fmt(l.d)}</span><span class="sp">${esc(l.t)}</span><button class="btn ghost sm" data-act="delLem" data-id="${l.id}">x</button></div>`).join('') : '<div class="d">Nenhum lembrete.</div>'}</div>
      <form data-form="lem" class="row" style="margin-top:6px"><input type="date" name="d" required style="max-width:150px" value="${t}"><input name="t" placeholder="Lembrete" required style="flex:1;min-width:120px"><button class="btn sm">Adicionar</button></form></div>
    <div class="tile g6"><h3>Como estou</h3>
      ${N.nota == null ? `<div class="d">A nota aparece depois dos primeiros dias de registro de estudo, revisões e simulados.</div>` : `
      <div class="score"><div class="ring" style="--p:${N.nota * 10}"><div><div><b>${N.nota.toFixed(1)}</b><br><span>de 10</span></div></div></div>
        <div style="flex:1;min-width:180px">${N.comps.map(c2 => `<div class="comp"><span>${c2.n}</span>${c2.v == null ? '<span class="tiny">sem dados</span>' : bar(c2.v, null, '', true)}<b>${c2.v == null ? '' : Math.round(c2.v * 100)}</b></div>`).join('')}</div></div>
      <div class="d">Puxa para baixo: <b>${esc(N.low.n)}</b> (${esc(N.low.why)}).</div>`}
      <div class="tiny">[OPINIÃO] Mede hábito e ritmo, não prevê aprovação. Com ${S.cfg.hWeek}h por dia útil e ${S.cfg.hWeekend}h no fim de semana, o plano comporta cerca de ${Math.floor(P.capAll)} das ${P.total} unidades como conteúdo novo${need > 1.05 ? `; para cobrir tudo seriam cerca de ${(S.cfg.hWeek * need).toFixed(1)}h por dia útil` : ''}.</div></div>
  </div></div>`;
}
/* ================== VADE MECUM ================== */
let vmIdx = {}, vmQ = '', vmRes = null, vmAllQ = '', vmBusy = false, vmNT = null;
const vmKey = a => (a.g ? a.g + ' ' : '') + a.n;
const vmMark = (id, a) => ((S.vm || {})[id] || {})[vmKey(a)] || {};
function vmSet(id, a, patch) { S.vm = S.vm || {}; const m = (S.vm[id] = S.vm[id] || {}), k = vmKey(a); m[k] = Object.assign({}, m[k], patch); if (!m[k].l && !m[k].e && !m[k].n) delete m[k]; save(); }
const vmLidos = id => Object.values((S.vm || {})[id] || {}).filter(x => x.l).length;
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function loadLei(id) {
  return new Promise(res => {
    if (window.C48_LEIS && window.C48_LEIS[id]) return res(true);
    const sc = document.createElement('script'); sc.src = `dados/leis/${id}.js`; sc.onload = () => res(true); sc.onerror = () => res(false); document.head.appendChild(sc);
  });
}
function vmCur() {
  const r = route(); if (r.v !== 'vade' || !r.a) return null; const d = window.C48_LEIS && window.C48_LEIS[r.a]; if (!d) return null;
  let i = vmIdx[r.a]; if (i == null || i < 0 || i >= d.arts.length) i = d.arts.length > 1 ? 1 : 0;
  return { L: (window.C48_LEIS_IDX || []).find(x => x.id === r.a), arts: d.arts, i, a: d.arts[i] };
}
function vmRender() {
  const l0 = $('#vmlist'), sc = l0 ? l0.scrollTop : 0; render(); const l = $('#vmlist');
  if (l) { l.scrollTop = sc; const cur = l.querySelector('.cur'); if (cur && (cur.offsetTop < l.scrollTop || cur.offsetTop > l.scrollTop + l.clientHeight - 50)) l.scrollTop = Math.max(0, cur.offsetTop - 70); }
}
function vmFmt(t) {
  return t.split('\n').map((l, k) => {
    let e = esc(l).replace(/\((?:Redação|Incluíd|Vide|Vigência|Revogad|Regulament|Vetad|Alterad|Declarad|Suspens|NR)[^)]*\)/g, m => `<small class="nr">${m}</small>`);
    if (k === 0) e = e.replace(/^(Art\.\s*[\d.]+\s*[º°o]?(?:-[A-Z]{1,2})?)/, '<b>$1</b>');
    const cls = /^(§|Parágrafo)/.test(l) ? 'par' : /^[IVXLC]+\s*[-–.]/.test(l) ? 'inc' : /^([a-z]\)|\d+\s*[-.)])/.test(l) ? 'ali' : '';
    return `<p class="${cls}">${e}</p>`;
  }).join('');
}
async function vmRun() {
  const q = norm(vmAllQ.trim()); if (q.length < 3) { vmRes = null; toast('Digite ao menos 3 letras.'); render(); return; }
  vmBusy = true; render();
  const IDX = window.C48_LEIS_IDX || []; await Promise.all(IDX.map(x => loadLei(x.id)));
  const out = []; let total = 0;
  for (const L of IDX) {
    const arts = ((window.C48_LEIS || {})[L.id] || {}).arts || [];
    arts.forEach((a, i) => { if (a.n === 'Início') return; if (a.nt === undefined) a.nt = norm(a.t); const p = a.nt.indexOf(q);
      if (p >= 0) { total++; if (out.length < 60) out.push({ id: L.id, curto: L.curto, i, n: a.n, g: a.g, sn: a.t.replace(/\s+/g, ' ').slice(Math.max(0, p - 50), p + 120) }); } });
  }
  vmRes = { q: vmAllQ, out, total }; vmBusy = false; render();
}
function vadeHome(IDX) {
  const grupos = [...new Set(IDX.map(x => x.grupo))], GR = ['g3c', 'g5', 'g4', 'g0', 'g1', 'g2c', 'g6'];
  const res = vmRes ? `<div class="card cream" style="margin-bottom:18px"><h2>${vmRes.total} resultado${vmRes.total === 1 ? '' : 's'} para “${esc(vmRes.q)}”${vmRes.total > vmRes.out.length ? ' (mostrando os 60 primeiros)' : ''}</h2><div class="list">${vmRes.out.map(r => `<div style="display:block"><a href="#/vade/${r.id}" data-act="vmSel" data-id="${r.id}" data-i="${r.i}" style="font-weight:700">${esc(r.curto)} · ${r.g ? esc(r.g) + ' ' : ''}Art. ${esc(r.n)}</a><div style="font-size:13px">${esc(r.sn)}</div></div>`).join('') || '<div class="muted">Nada encontrado.</div>'}</div></div>` : '';
  return `<div class="top"><div><h1>Vade Mecum</h1><p class="sub">Leis em texto seco, do Planalto e da OAB, para ler artigo por artigo. Marque o que leu, estrele o que é "lei seca, vale a leitura" e anote. Confira sempre a versão atual na fonte.</p></div></div>
  <form data-form="vmall" class="row" style="margin-bottom:18px"><input name="q" placeholder="Buscar em todas as leis (ex.: sigilo, prazo, prerrogativas)" value="${esc(vmAllQ)}" style="max-width:520px;flex:1"><button class="btn">${vmBusy ? 'Buscando...' : 'Buscar'}</button></form>
  ${res}
  ${grupos.map((g, gi) => `<h2 style="margin-top:18px">${esc(g)}</h2><div class="shelf">${IDX.filter(x => x.grupo === g).map(x => { const lidos = vmLidos(x.id); return `<a class="tile ${GR[gi % GR.length]}" href="#/vade/${x.id}"><div class="tags"><span class="tg w">${esc(x.fonte)}</span><span class="tg w">${x.n} artigos</span></div><h3>${esc(x.curto)}</h3><div class="d">${esc(x.nome)}</div>${bar(x.n ? lidos / x.n : 0, null, '', true)}<div class="ft"><span class="cn">${lidos} lidos</span></div></a>`; }).join('')}</div>`).join('')}`;
}
function vadeLei(L, data) {
  const cu = vmCur(), arts = data.arts, i = cu.i, q = norm(vmQ.trim()), list = [];
  vmIdx[L.id] = i;
  arts.forEach((a, j) => { if (q) { if (a.nt === undefined) a.nt = norm(a.t); if (!norm(a.n).includes(q) && !a.nt.includes(q)) return; } list.push([a, j]); });
  const a = arts[i], mk = vmMark(L.id, a), lidos = vmLidos(L.id);
  const items = list.map(([x, j]) => { const m = vmMark(L.id, x); return `<div class="vi ${j === i ? 'cur' : ''} ${m.l ? 'lido' : ''}" data-act="vmSel" data-id="${L.id}" data-i="${j}"><span>${x.n === 'Início' ? 'Início' : (x.g ? esc(x.g) + ' ' : '') + 'Art. ' + esc(x.n)}</span><em>${m.e ? '★' : ''}${m.n ? '✎' : ''}${m.l ? '✓' : ''}</em></div>`; }).join('');
  return `<div class="top"><div><div class="tiny"><a href="#/vade">Vade Mecum</a> › ${esc(L.grupo)}</div><h1>${esc(L.curto)}</h1>
    <p class="sub">${esc(L.nome)} · ${lidos} de ${L.n} artigos lidos · fonte: <a href="${esc(L.url)}" target="_blank" rel="noopener">${esc(L.fonte)}</a>, capturado em ${fmt(L.captura)}</p></div>
    <input id="vmq" placeholder="Filtrar artigos (número ou palavra)" value="${esc(vmQ)}" style="max-width:300px"></div>
  <div class="tiny" style="margin:-8px 0 14px">${esc(L.aviso || '')}</div>
  <div style="margin-bottom:14px">${bar(L.n ? lidos / L.n : 0, null, '', true)}</div>
  <div class="vm"><div class="vlist card" id="vmlist">${items || '<div class="muted" style="padding:8px">Nenhum artigo encontrado.</div>'}</div>
    <div class="vmr card"><div class="tags">${a.g ? `<span class="tg">${esc(a.g)}</span>` : ''}${a.h ? `<span class="tg w">${esc(a.h)}</span>` : ''}</div>
      <div class="vtxt">${vmFmt(a.t)}</div>
      <div class="row" style="margin-top:16px"><button class="btn sm" data-act="vmLido">${mk.l ? 'Lido ✓' : 'Marcar como lido'}</button><button class="btn ghost sm" data-act="vmNext">Lido e próximo</button><button class="btn ghost sm" data-act="vmStar">${mk.e ? '★ Lei seca, vale a leitura' : '☆ Lei seca, vale a leitura'}</button><button class="btn ghost sm" data-act="vmCopy">Copiar para o Petrus</button></div>
      <label>Minha anotação</label><textarea id="vmnote" placeholder="O que este artigo cobra? Prazo, exceção, pegadinha...">${esc(mk.n || '')}</textarea>
      <div class="row" style="margin-top:12px"><button class="btn ghost sm" data-act="vmGo" data-d="-1">Anterior</button><button class="btn ghost sm" data-act="vmGo" data-d="1">Próximo</button></div></div></div>`;
}
function vVade() {
  const r = route(), IDX = window.C48_LEIS_IDX || [];
  if (!IDX.length) return `<div class="top"><div><h1>Vade Mecum</h1></div></div><div class="card"><p>Nenhuma lei carregada. Rode <b>tools\\converter-leis.ps1</b> para gerar as leis a partir de <b>leis-origem</b>.</p></div>`;
  const L = r.a && IDX.find(x => x.id === r.a);
  if (!L) return vadeHome(IDX);
  if (!(window.C48_LEIS && window.C48_LEIS[L.id])) { loadLei(L.id).then(() => { if (route().v === 'vade' && route().a === L.id) render(); }); return `<div class="top"><div><h1>${esc(L.curto)}</h1><p class="sub">Carregando o texto da lei...</p></div></div>`; }
  return vadeLei(L, window.C48_LEIS[L.id]);
}
/* ================== SIMULADO COMPLETO (80 questões reais, mesma proporção de matérias da prova) ================== */
const MOCK_META = 45, MOCK_CORTE = 40;
const hms = s => `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}`;
const mockLeft = M => Math.max(0, 5 * 3600 - Math.floor((Date.now() - M.start) / 1000));
function mockMonta() {
  const pool = QR.filter(q => !q.anulada && q.materia && q.materia !== 'Não classificada'), by = {};
  pool.forEach(q => (by[q.materia] = by[q.materia] || []).push(q));
  const mats = Object.keys(by), raw = mats.map(m => [m, by[m].length / pool.length * 80]), n = {}; let s = 0;
  raw.forEach(([m, v]) => { n[m] = Math.max(1, Math.floor(v)); s += n[m]; });
  raw.sort((a, b) => (b[1] - Math.floor(b[1])) - (a[1] - Math.floor(a[1])));
  for (let i = 0; s < 80; i++, s++) n[raw[i % raw.length][0]]++;
  while (s > 80) { const m = Object.keys(n).sort((a, b) => n[b] - n[a])[0]; n[m]--; s--; }
  const ids = [];
  mats.forEach(m => { by[m].slice().sort((a, b) => ((histOf(a).length ? 1 : 0) - (histOf(b).length ? 1 : 0)) || (Math.random() - .5)).slice(0, n[m]).forEach(q => ids.push(q.id)); });
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  S.mock = { ids, ans: {}, i: 0, start: Date.now(), done: false, conf: false, dist: n };
  save();
}
function mockFecha() {
  const M = S.mock; if (!M || M.done) return; let ok = 0; const por = {}, erros = [];
  M.ids.forEach(id => {
    const q = qById(id); if (!q) return; const a = M.ans[id], certo = a === q.gab; por[q.materia] = por[q.materia] || { n: 0, ok: 0, em: 0 }; por[q.materia].n++;
    if (!a) por[q.materia].em++; else { addHist(q, certo); }
    if (certo) { ok++; por[q.materia].ok++; } else if (a) erros.push(q);
  });
  erros.forEach(q => {
    if (S.errors.some(e => e.fid === q.id)) return;
    const mt = MAT.find(x => x.nome === q.materia), F = mt && FGV()[mt.id], d = F && F.q[q.id], tm = d && F.temas[d.t];
    addErr({ fid: q.id, unit: tm ? mt.id + ':' + tm.unit : '', materia: q.materia, tipo: 'conceito', topico: (tm ? tm.label + ' · ' : '') + q.exame + ' exame Q' + q.num + ' (simulado)', enun: q.enun.slice(0, 80), minha: M.ans[q.id], correta: q.gab, regra: d ? d.c : 'Revisar a questão e o fundamento' });
  });
  const min = Math.min(300, Math.round((Date.now() - M.start) / 60000)), t = today();
  const fracos = Object.entries(por).filter(([m, v]) => v.n >= 3).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).slice(0, 3).map(([m]) => m).join(', ');
  S.simulados.push({ id: uid(), d: t, prova: 'Simulado completo do Petrus (80 questões reais)', total: 80, acertos: ok, min: String(min), temas: fracos }); S.simDone[t] = true;
  S.hours[t] = (S.hours[t] || 0) + min;
  M.done = true; M.ok = ok; M.por = por; M.min = min; M.fim = Date.now(); save();
}
function vMock() {
  const M = S.mock;
  if (!M) return `<div class="top"><div><h1>Simulado <em>completo</em></h1><p class="sub">80 questões reais com a mesma proporção de matérias da prova, 5 horas, sem gabarito até o fim.</p></div></div><div class="card"><button class="btn" data-act="mockNew">Montar um simulado de 80 questões</button></div>`;
  if (M.done) return mockResultado(M);
  const i = clamp(M.i, 0, M.ids.length - 1), q = qById(M.ids[i]), got = M.ans[q.id], n = Object.keys(M.ans).length;
  const grid = M.ids.map((id, k) => `<button class="mg ${M.ans[id] ? 'on' : ''} ${k === i ? 'cur' : ''}" data-act="mockGo" data-i="${k}">${k + 1}</button>`).join('');
  const conf = M.conf ? `<div class="mconf"><b>Finalizar agora?</b> Você respondeu ${n} de 80 (${80 - n} em branco contam como erro). <button class="btn sm" data-act="mockFim">Sim, corrigir</button> <button class="btn ghost sm" data-act="mockCancela">Voltar à prova</button></div>` : '';
  return `<div class="top"><div><h1>Simulado <em>completo</em></h1><p class="sub">80 questões reais, mesma proporção de matérias da prova. A correção só aparece no fim. Meta: ${MOCK_META} acertos (o corte é ${MOCK_CORTE}).</p></div><div class="mtimer" id="mtm">${hms(mockLeft(M))}</div></div>
  <div class="card"><div class="mgrid">${grid}</div><p class="tiny" style="margin-top:8px">${n} de 80 respondidas</p></div>${conf}
  <div class="card cream mq"><h2>Questão ${i + 1} de 80</h2><p style="line-height:1.65;white-space:pre-wrap">${esc(q.enun)}</p>
    ${['A', 'B', 'C', 'D'].filter(l => q.alts[l]).map(l => `<button class="qopt ${got === l ? 'pick' : ''}" data-act="mockPick" data-l="${l}"><b>${l})</b> ${esc(q.alts[l])}</button>`).join('')}
    <div class="row" style="margin-top:12px"><button class="btn ghost sm" data-act="mockGo" data-i="${i - 1}" ${i === 0 ? 'disabled' : ''}>Anterior</button><button class="btn sm" data-act="mockGo" data-i="${i + 1}" ${i === M.ids.length - 1 ? 'disabled' : ''}>Próxima</button><span class="sp"></span><button class="btn dk sm" data-act="mockFim">Finalizar e corrigir</button></div></div>`;
}
function mockResultado(M) {
  const ok = M.ok, v = ok >= MOCK_META ? 'Acima da meta de ' + MOCK_META + '.' : ok >= MOCK_CORTE ? 'Passou do corte de ' + MOCK_CORTE + ', mas abaixo da sua meta de ' + MOCK_META + '. Faltam ' + (MOCK_META - ok) + '.' : 'Abaixo do corte de ' + MOCK_CORTE + '. Faltam ' + (MOCK_CORTE - ok) + ' para o corte e ' + (MOCK_META - ok) + ' para a meta.';
  const linhas = Object.entries(M.por).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).map(([m, x]) => `<tr><td>${esc(m)}</td><td>${x.n}</td><td>${x.ok}</td><td><b>${Math.round(x.ok / x.n * 100)}%</b></td><td>${x.em || ''}</td></tr>`).join('');
  const revis = M.ids.map(id => qById(id)).filter(q => q && M.ans[q.id] !== q.gab).map(q => {
    const mt = MAT.find(x => x.nome === q.materia), F = mt && FGV()[mt.id], d = F && F.q[q.id], a = M.ans[q.id];
    return `<details class="fq"><summary><span>${esc(q.exame)} exame · questão ${esc(q.num)}</span><em>${esc(q.materia)}</em><i class="bno">${a ? 'errou' : 'em branco'}</i></summary><p class="en">${esc(q.enun)}</p><p class="tiny">Você marcou: <b>${a || 'nada'}</b> · Gabarito: <b>${q.gab}</b>.</p><p>${esc(q.alts[q.gab] || '')}</p>${d ? `<div class="fr no">${esc(d.c)}</div>` : ''}</details>`;
  }).join('');
  return `<div class="top"><div><h1>Resultado do <em>simulado</em></h1><p class="sub">${M.min} minutos de prova.</p></div></div>
  <div class="card or"><h2>Acertos</h2><div class="big" style="font-size:72px">${ok}<small>de 80 · meta ${MOCK_META} · corte ${MOCK_CORTE}</small></div><p>${v}</p><p class="tiny">[DADO] contagem das suas respostas. [OPINIÃO] um simulado só não prevê a prova: a tendência dos próximos importa mais.</p></div>
  <div class="card"><h2>Por matéria (da mais fraca para a mais forte)</h2><div class="scroll"><table class="t"><tr><th>Matéria</th><th>Questões</th><th>Acertos</th><th>%</th><th>Em branco</th></tr>${linhas}</table></div><p class="tiny">Os erros foram para o caderno de erros, com revisão agendada.</p></div>
  <div class="card"><h2>Questões para rever (${M.ids.length - ok})</h2><div class="fqs">${revis || '<p>Nenhuma. Acertou tudo.</p>'}</div></div>
  <div class="row"><button class="btn" data-act="mockNew">Montar outro simulado</button><a class="btn ghost" href="#/err" style="text-decoration:none">Abrir o caderno de erros</a><a class="btn ghost" href="#/sim" style="text-decoration:none">Voltar aos simulados</a></div>`;
}
setInterval(() => { const el = document.getElementById('mtm'); if (el && S.mock && !S.mock.done) el.textContent = hms(mockLeft(S.mock)); }, 1000);

/* ================== MODO FOCO ================== */
let FOCO = { phase: 'estudo', left: 3000, run: false, id: null, acc: 0, ciclos: 0 };
const FOCO_LEN = { estudo: 3000, pausa: 600, longa: 1200 };
const FOCO_NOME = { estudo: 'Estudo', pausa: 'Pausa curta', longa: 'Pausa longa' };
const mmss = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
function focoFlush() { const m = Math.floor(FOCO.acc / 60); if (m >= 1) { const t = today(); S.hours[t] = (S.hours[t] || 0) + m; logSess(m); FOCO.acc -= m * 60; save(); } }
function paintFoco() {
  const a = $('#ftm'); if (a) a.textContent = mmss(FOCO.left);
  const b = $('#fph'); if (b) b.textContent = FOCO_NOME[FOCO.phase] + (FOCO.run ? '' : ' · parado');
  const c2 = $('#fbar'); if (c2) c2.style.width = (100 - FOCO.left / FOCO_LEN[FOCO.phase] * 100) + '%';
  const d = $('#fhoje'); if (d) d.textContent = `${hm(minToday())} de ${hm(metaHoje())} hoje`;
  const g = $('#fgo'); if (g) g.textContent = FOCO.run ? 'Pausar' : (FOCO.left < FOCO_LEN[FOCO.phase] ? 'Continuar' : 'Começar');
  document.title = FOCO.run ? `${mmss(FOCO.left)} · Foco` : 'Caderno 48';
}
function focoNext(skip) {
  if (FOCO.phase === 'estudo') { focoFlush(); if (!skip) FOCO.ciclos++; FOCO.phase = FOCO.ciclos > 0 && FOCO.ciclos % 4 === 0 ? 'longa' : 'pausa'; } else FOCO.phase = 'estudo';
  FOCO.left = FOCO_LEN[FOCO.phase];
}
function focoTick() {
  if (!FOCO.run) return;
  FOCO.left--; if (FOCO.phase === 'estudo') { FOCO.acc++; if (FOCO.acc >= 60) focoFlush(); }
  if (FOCO.left <= 0) {
    const era = FOCO.phase; focoNext(false); toast(era === 'estudo' ? 'Bloco de 50 minutos concluído. Hora da pausa.' : 'A pausa acabou. Vamos de novo?');
    try { if ('Notification' in window && Notification.permission === 'granted') new Notification('Caderno 48', { body: era === 'estudo' ? 'Bloco concluído. Hora da pausa.' : 'A pausa acabou. Voltar a estudar?' }); } catch (e) { }
  }
  paintFoco();
}
function vFoco() {
  const t = today(), now = new Date(), nowM = now.getHours() * 60 + now.getMinutes(), sched = todaySchedule(t), mt = minToday(), meta = metaHoje();
  const est = sched.filter(b => b.k === 'estudo'), cur = est.find(b => nowM >= tmin(b.h) && nowM < tmin(b.f)) || est.find(b => tmin(b.h) > nowM) || est[0];
  const f = faseOf(t), next = f && f.novo && !isSim(t) ? nextUnit(t) : null, fi = fichaDoDia(t), leve = !!S.leve[t];
  const tasks = (cur && cur.sub) ? cur.sub : ['Revisões do dia', '10 questões reais', next ? 'Novo: ' + next.u : 'Caderno de erros'];
  return `<div class="top"><div><h1>Modo foco</h1><p class="sub">Um bloco por vez: 50 minutos de estudo e 10 de pausa. O tempo estudado entra sozinho no registro de hoje.</p></div><span class="pill" id="fhoje">${hm(mt)} de ${hm(meta)} hoje</span></div>
  <div class="focus"><div class="fcard"><div class="ph" id="fph"></div><div class="tm" id="ftm">${mmss(FOCO.left)}</div>
    <div class="fb"><i id="fbar" style="width:${100 - FOCO.left / FOCO_LEN[FOCO.phase] * 100}%"></i></div>
    <div class="row" style="justify-content:center;margin-top:22px"><button class="btn" id="fgo" data-act="fGo">Começar</button><button class="btn ghost" data-act="fSkip">Pular fase</button><button class="btn ghost" data-act="fReset">Zerar</button></div>
    <div class="tiny" style="margin-top:16px">Ciclos de 50 minutos concluídos nesta sessão: ${FOCO.ciclos}. A cada 4 ciclos vem uma pausa longa de 20 minutos.</div></div>
   <div class="card"><h2>Agora</h2><h3>${cur ? esc(cur.t) + ' · ' + cur.h + ' às ' + cur.f : 'Sem bloco de estudo hoje'}</h3>${fi ? `<div class="tiny" style="margin:4px 0 10px">Treino ${fi.id}: ${esc(fi.foco)}</div>` : ''}
    <div class="list">${tasks.map(x => `<div><span class="dot or"></span><span class="sp">${esc(x)}</span></div>`).join('')}</div>
    <div class="row" style="margin-top:14px">${next ? `<button class="btn sm" data-act="openUnit" data-k="${next.k}">Abrir o tópico no caderno</button><button class="btn ghost sm" data-act="toggleUnit" data-k="${next.k}">Marcar como estudado</button>` : ''}<button class="btn ghost sm" data-act="leve">${leve ? 'Voltar para 2h' : 'Hoje é dia leve (30 min)'}</button></div></div></div>`;
}
function logBtns() { return `<div class="row" style="gap:6px"><button class="btn sm" data-act="log" data-m="30">+30 min</button><button class="btn sm" data-act="log" data-m="60">+1h</button><button class="btn ghost sm" data-act="log" data-m="-30">-30</button></div>`; }

/* ================== BIBLIOTECA ================== */
let searchQ = '', libFilter = '';
function vLib() {
  const GR = ['g3c', 'g5', 'g4', 'g0', 'g1', 'g2c', 'g6'];
  const cover = m => {
    const us = QUEUE.filter(x => x.m.id === m.id), d = us.filter(x => isDone(x.k)).length, p = us.length ? d / us.length : 0, nt = S.rate[m.id];
    return `<a class="tile ${GR[m.ciclo] || 'g0'}" href="#/book/${m.id}"><div class="tags"><span class="tg w">${GRUPO[m.grupo]}</span><span class="tg w">${m.ciclo === 0 ? 'Primeiro ciclo' : 'Ciclo ' + m.ciclo}</span></div><h3>${esc(m.nome)}</h3><div class="d">${d} de ${us.length} unidades estudadas</div>${bar(p, null, '', true)}<div class="ft"><span class="av" title="Minha nota">${nt == null ? '-' : nt}</span><span class="cn">${us.length} un.</span></div></a>`;
  };
  const c48 = `<a class="tile c48" href="#/book/c48"><div class="tags"><span class="tg o">Caderno geral</span></div><h3>Caderno 48</h3><div class="d">Regras do exame, pegadinhas, mapa de artigos e dia da prova.</div><div class="ft"><span class="cn">${pagesOf('c48').length} páginas</span></div></a>`;  const hits = searchQ.length > 1 ? search(searchQ) : [];
  const ev = MAT.map(m => { const us = QUEUE.filter(x => x.m.id === m.id); const c = { new: 0, rev: 0, ok: 0 }; us.forEach(x => c[ust(x.k)]++);
    return `<tr><td><a href="#/book/${m.id}" style="color:inherit"><b>${esc(m.nome)}</b></a><div class="tiny">${GRUPO[m.grupo]}</div></td><td>${c.new}</td><td>${c.rev}</td><td>${c.ok}</td><td>${bar(us.length ? (c.rev + c.ok) / us.length : 0, null, '', true)}</td>
    <td><select data-act="rate" data-id="${m.id}" style="width:64px;padding:6px">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option ${((S.rate[m.id] ?? '') === n) ? 'selected' : ''} value="${n}">${n}</option>`).join('')}<option value="" ${S.rate[m.id] == null ? 'selected' : ''}>-</option></select></td></tr>`; }).join('');
  const list = MAT.filter(m => !libFilter || m.grupo === libFilter);
  return `<div class="top"><div><h1>Biblioteca</h1><p class="sub">Cada cartão é uma matéria. Abra para ver o índice, as páginas e os post-its.</p></div>
    <input id="q" placeholder="Buscar nas minhas páginas" value="${esc(searchQ)}" style="max-width:280px"></div>
  <div class="fpills">${[['', 'Todas'], ['min15', 'Mínimo de 15%'], ['principal', 'Principais'], ['leve', 'Manutenção']].map(([k, l]) => `<span class="fpill ${libFilter === k ? 'on' : ''}" data-act="libF" data-f="${k}">${l}</span>`).join('')}</div>
  ${hits.length ? `<div class="card cream" style="margin-bottom:18px"><h2>Resultados</h2><div class="list">${hits.map(h => `<div style="display:block"><a href="#/book/${h.b}" data-act="goPage" data-b="${h.b}" data-p="${h.p}" style="font-weight:700">${esc(h.title)}</a><div class="tiny">${esc(h.bn)}</div><div style="font-size:13px">${esc(h.snip)}</div></div>`).join('')}</div></div>` : ''}
  <div class="shelf">${libFilter ? '' : c48}${list.map(cover).join('')}</div>
  <div class="card" style="margin-top:26px"><h2>Edital verticalizado</h2><p class="muted" style="font-size:13px;margin-bottom:10px">Consolidado = as cinco revisões feitas. Revisar = estudado, com revisões em aberto. A nota de 0 a 10 é sua autoavaliação por matéria (vinda do diagnóstico, dá para mudar).</p>
    <div class="scroll"><table class="t"><tr><th>Matéria</th><th>Novas</th><th>Revisar</th><th>Consolidadas</th><th style="width:25%">Cobertura</th><th>Minha nota</th></tr>${ev}</table></div>
    <p class="tiny" style="margin-top:10px">Regra de ajuste: matéria abaixo de 50% por duas semanas sobe de prioridade; acima de 75% vira manutenção. Confira a lista no edital.</p></div>`;
}function search(q) {
  q = q.toLowerCase(); const out = [];
  [C48, ...MAT].forEach(b => { if (!S.pages[b.id]) return; S.pages[b.id].forEach(p => {
    const txt = (p.title + ' ' + p.html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' '), i = txt.toLowerCase().indexOf(q);
    if (i >= 0) out.push({ b: b.id, bn: b.nome, p: p.id, title: p.title, snip: txt.slice(Math.max(0, i - 40), i + 90) }); }); });
  return out.slice(0, 12);
}

/* ================== PESQUISA DA TELA INICIAL ================== */
let hqQ = '';
function hqHtml(q) {
  q = (q || '').trim(); if (q.length < 2) return '';
  const nq = norm(q), out = [];
  QUEUE.forEach(x => { const A = AULA()[x.k], hit = norm(x.u + ' ' + x.m.nome).includes(nq), ah = A && A.sec.find(s => norm(s.x).includes(nq));
    if (hit || ah) out.push(`<div class="hr" data-act="openUnit" data-k="${x.k}"><b>${esc(x.u)}</b><span class="tiny">${esc(x.m.nome)}${ah && !hit ? ' · na aula: ' + esc(ah.t) : ''}</span></div>`); });
  const pg = search(q).map(h => `<div class="hr" data-act="page" data-b="${h.b}" data-p="${h.p}"><b>${esc(h.title || 'Página')}</b><span class="tiny">${esc(h.bn)} · …${esc(h.snip)}…</span></div>`);
  const nt = S.notas.filter(n => norm(n.t + ' ' + n.x).includes(nq)).map(n => `<div class="hr" data-act="hqNota" data-id="${n.id}"><b>${esc(n.t || 'Sem título')}</b><span class="tiny">Notas do aluno</span></div>`);
  const sec = (t, a) => a.length ? `<div class="hg">${t}</div>${a.slice(0, 6).join('')}` : '';
  return `<div class="hres">${sec('Temas e aulas', out)}${sec('Minhas páginas', pg)}${sec('Notas do aluno', nt)}<div class="hg">Leis</div><div class="hr" data-act="hqLeis"><b>Buscar “${esc(q)}” em todas as leis do Vade Mecum</b><span class="tiny">Estatuto, CF, códigos e mais</span></div></div>`;
}
/* ================== MAPA ATÉ A OAB ================== */
const MODN = ['Fundação: Ética', 'Administrativo e Trabalho', 'Processos: Penal e Trabalho', 'Matérias leves', 'Constitucional e Penal', 'Tributário, Filosofia e ECA', 'Civil, Processo Civil e o resto', 'Reta final'];
let mapSel = null;
function modulos() {
  const mods = MODN.map((n, c) => ({ n, c, mats: c < 7 ? MAT.filter(m => m.ciclo === c) : [] }));
  mods.forEach(md => { const us = QUEUE.filter(x => md.mats.includes(x.m)); md.total = us.length; md.done = us.filter(x => isDone(x.k)).length; md.pct = md.total ? md.done / md.total : (S.simulados.length >= 3 ? 1 : S.simulados.length / 3); md.ok = md.pct >= 1; });
  const cur = mods.find(m => !m.ok); mods.forEach(m => { m.cur = m === cur; });
  return mods;
}
function vMapa() {
  const mods = modulos(), cur = mods.find(m => m.cur) || mods[mods.length - 1];
  if (mapSel == null) mapSel = cur.c;
  const sel = mods[mapSel] || cur, left = Math.max(0, Math.ceil((new Date(CFG.prova) - new Date()) / 864e5));
  const P = [[130, 90], [500, 90], [870, 90], [870, 290], [500, 290], [130, 290], [130, 490], [500, 490], [870, 490]];
  let d = 'M' + P[0].join(' ');
  for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i]; d += a[1] === b[1] ? ` L${b[0]} ${b[1]}` : ` C${a[0] + (a[0] > 500 ? 110 : -110)} ${a[1]} ${b[0] + (b[0] > 500 ? 110 : -110)} ${b[1]} ${b[0]} ${b[1]}`; }
  const nodes = mods.map((m, i) => { const [x, y] = P[i], st = m.ok ? 'ok' : m.cur ? 'cur' : 'fut', sl = i === mapSel ? ' sel' : '';
    return `<g class="mn ${st}${sl}" data-act="mapSel" data-i="${i}" transform="translate(${x} ${y})" tabindex="0"><circle class="pulse" r="40"/><circle class="c" r="34"/>${m.ok ? '<path class="ck" d="M-12 0l8 9 16-18"/>' : `<text class="nn" y="9">${i + 1}</text>`}<text class="lb" y="62">${esc(m.n)}</text><text class="pc" y="80">${m.total ? m.done + '/' + m.total + ' temas' : S.simulados.length + ' simulados'}</text></g>`; }).join('');
  const [ex, ey] = P[8];
  const X = `<g transform="translate(${ex} ${ey + 0})" class="tx"><circle r="52" class="isl"/><path class="xx" d="M-26 -26L26 26M26 -26L-26 26"/></g>`;
  const last = mods[7], xPos = [870, 490];
  const detail = `<div class="card cream mdet"><div class="tiny">MÓDULO ${sel.c + 1} DE ${mods.length}${sel.mats.length ? ' · ' + Math.round(sel.mats.reduce((s, m) => s + peso(m).p, 0)) + '% das questões do banco' : ''}</div><h2>${esc(sel.n)}</h2>
    ${sel.mats.length ? `<div class="list">${sel.mats.map(m => { const us = QUEUE.filter(x => x.m === m), dn = us.filter(x => isDone(x.k)).length; return `<div><span class="sp"><b>${esc(m.nome)}</b><div class="tiny">${dn}/${us.length} temas${(AULA()[m.id + ':0']) ? ' · aulas escritas' : ''}</div>${bar(us.length ? dn / us.length : 0, null, '', true)}</span><a class="btn sm" href="#/book/${m.id}">Abrir livro</a></div>`; }).join('')}</div>`
      : `<p style="font-size:14.5px;line-height:1.6">Aqui você troca o conteúdo novo por prática: simulados de 80 questões, revisão D1 a D30 e caderno de erros. Meta: ao menos 3 simulados registrados antes de chegar ao X.</p><div class="row"><a class="btn sm" href="#/sim">Simulados</a><a class="btn ghost sm" href="#/rev">Revisão</a><a class="btn ghost sm" href="#/err">Erros</a></div>`}</div>`;
  return `<div class="top"><div><h1>Mapa até a <em>OAB</em></h1><p class="sub">Cada parada é um módulo. O X é o 48º Exame, em ${fmt('2027-01-10')}${left ? ': faltam ' + left + ' dias' : ''}.</p></div></div>
    <div class="card mapa-card"><svg viewBox="0 0 1000 580" class="mapa-svg" role="img" aria-label="Mapa de módulos até a prova da OAB"><path d="${d}" class="trail"/><path d="${d}" class="trail2"/>${nodes}${(() => { const ci = mods.findIndex(x => x.cur); return ci < 0 ? '' : `<foreignObject x="${P[ci][0] - 26}" y="${P[ci][1] - 104}" width="52" height="52"><div xmlns="http://www.w3.org/1999/xhtml" class="mav">${avatarHtml(prof())}</div></foreignObject>`; })()}${X}
      <text x="${ex}" y="${ey + 78}" class="xl" text-anchor="middle">48º Exame</text><text x="${ex}" y="${ey + 96}" class="xl2" text-anchor="middle">1ª fase · ${fmt('2027-01-10')}</text></svg></div>${detail}`;
}

/* ================== AULA DO PETRUS, DÚVIDAS E NOTAS ================== */
const AULA = () => window.C48_AULA || {}, AULA_STEP = {};
function mdHtml(s) {
  const inl = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  return String(s || '').split(/\n{2,}/).map(b => {
    const ls = b.split('\n');
    if (ls.every(l => /^\s*[-*] /.test(l))) return '<ul>' + ls.map(l => '<li>' + inl(l.replace(/^\s*[-*] /, '')) + '</li>').join('') + '</ul>';
    return '<p>' + ls.map(inl).join('<br>') + '</p>';
  }).join('');
}
function livroIntro(mat, open) {
  const us = QUEUE.filter(x => x.m.id === mat.id), qs = QR.filter(q => q.materia === mat.nome).length, f = (window.C48_FOCO || {})[mat.id] || '';
  return `<details class="lintro" ${open ? 'open' : ''}><summary>Introdução do livro: ${esc(mat.nome)}</summary>
    <p>${esc(f)}</p><p>Aqui vamos estudar ${us.length} temas, nesta ordem:</p><ol>${us.map(x => `<li>${esc(x.u)}</li>`).join('')}</ol>
    <p class="tiny">${qs ? `O banco do app tem ${qs} questões reais classificadas nesta matéria, de ${new Set(QR.map(q => q.exame)).size} exames.` : 'Ainda não há questões classificadas nesta matéria no banco do app.'}</p>
    <p class="tiny">Em cada tema o Petrus ensina em cinco passos: introdução, três desenvolvimentos e conclusão. Depois você pratica com questões reais e agenda a revisão.</p></details>`;
}
function aulaBox(k, mat) {
  const A = AULA()[k], q = unitByKey(k);
  if (!A) return `<div class="aula-box" data-k="${k}"><h2>Aula do Petrus</h2><p>A aula escrita deste tema ainda não foi gerada. O professor automático escreve as aulas por matéria, na ordem do seu ciclo. Enquanto isso, use o guia de estudo abaixo.</p><button class="btn sm" data-act="duvidaOpen" data-k="${k}">Preciso desta aula agora</button><div id="dvbox"></div></div>`;
  const i = clamp(AULA_STEP[k] || 0, 0, A.sec.length - 1), s = A.sec[i];
  return `<div class="aula-box" data-k="${k}"><div class="ab-h"><span class="tiny">AULA DO PETRUS</span><h2>${esc(q.u)}</h2></div>
    <div class="steps">${A.sec.map((x, j) => `<button class="${j === i ? 'on' : j < i ? 'ok' : ''}" data-act="aulaGo" data-k="${k}" data-i="${j}"><i>${j + 1}</i><span>${esc(x.t.split(':')[0])}</span></button>`).join('')}</div>
    <div class="ab-b"><h3>${esc(s.t)}</h3>${mdHtml(s.x)}</div>
    <div class="row" style="margin-top:12px">${i > 0 ? `<button class="btn ghost sm" data-act="aulaGo" data-k="${k}" data-i="${i - 1}">Anterior</button>` : ''}${i < A.sec.length - 1 ? `<button class="btn sm" data-act="aulaGo" data-k="${k}" data-i="${i + 1}">Próximo: ${esc(A.sec[i + 1].t.split(':')[0])}</button>` : `<button class="btn sm" data-act="toggleUnit" data-k="${k}">Marcar tema como estudado</button>`}
      <button class="btn ghost sm sp-r" data-act="duvidaOpen" data-k="${k}">Tenho uma dúvida</button></div>
    <div id="dvbox"></div></div>`;
}
const duvidaTxt = d => `[Dúvida do Lucas · ${d.mat} · ${d.unit}]\n${d.t}\n\nPetrus: explique do zero, confira se entendi e faça uma pergunta de cada vez.`;
function vConfig() {
  const u = S.ui || {}, ch = (k, v, l, on) => `<button class="pl ${on ? 'on' : ''}" data-act="cfgSet" data-k="${k}" data-v="${esc(v)}">${l}</button>`;
  const acc = u.accent || '#2F8F6B';
  return `<div class="cfg"><h1>Configurações</h1><p class="tiny">Tudo aqui é só visual e fica salvo neste aparelho. Mude à vontade; o botão "Restaurar padrão" volta tudo ao original.</p>
  <div class="card"><h2>Cor de destaque</h2><div class="swr">${UI_ACC.map(([c, l]) => `<button class="sw ${acc.toLowerCase() === c.toLowerCase() ? 'on' : ''}" style="--c:${c}" title="${l}" aria-label="${l}" data-act="cfgSet" data-k="accent" data-v="${c}"></button>`).join('')}<label class="sw cu" title="Escolher outra cor">+<input type="color" id="cfgcolor" value="${acc}"></label></div><p class="tiny">É a cor dos botões, das marcações e do menu redondo.</p></div>
  <div class="card"><h2>Tema</h2><div class="pls">${[['claro', 'Claro'], ['escuro', 'Escuro'], ['auto', 'Automático (escuro à noite)']].map(([v, l]) => `<button class="pl ${(S.theme || 'claro') === v ? 'on' : ''}" data-act="pfTema" data-v="${v}">${l}</button>`).join('')}<button class="pl ${vidroOn() ? 'on' : ''}" data-act="vidro">Vidro fosco</button></div></div>
  <div class="card"><h2>Fonte do texto</h2><div class="pls">${UI_FONT.map(([v, l]) => ch('font', v, l, (u.font || '') === v)).join('')}</div>
  <h2 style="margin-top:18px">Fonte dos títulos</h2><div class="pls">${UI_DISP.map(([v, l]) => ch('disp', v, l, (u.disp || '') === v)).join('')}</div></div>
  <div class="card"><h2>Tamanho do texto das aulas</h2><div class="szr"><span style="font-size:13px">A</span><input type="range" min="85" max="140" step="5" value="${u.fs || 100}" id="cfgfs"><span style="font-size:24px">A</span><b id="cfgfsv">${u.fs || 100}%</b></div>
  <h2 style="margin-top:18px">Espaço entre as linhas</h2><div class="pls">${UI_LINE.map(([v, l]) => ch('lh', v, l, (u.lh || '1.8') === v)).join('')}</div>
  <div class="cfgprev prose"><p><b>Prévia.</b> A advocacia é incompatível, mesmo em causa própria, com as atividades do art. 28 do Estatuto. Já o impedimento é proibição parcial.</p></div></div>
  <div class="card"><h2>Menus</h2><p class="tiny" style="margin:0 0 6px">Menu lateral (computador)</p><div class="pls">${ch('navmode', 'hover', 'Aparece ao passar o mouse na borda', u.navmode !== 'fixo')}${ch('navmode', 'fixo', 'Fixo na tela', u.navmode === 'fixo')}</div>
  <p class="tiny">Dentro dos livros o menu aparece só ao passar o mouse na borda esquerda. O seu personagem, no canto direito de cima, abre o perfil ao passar o mouse.</p></div>
  <div class="card"><h2>Narração (Ouvir esta etapa)</h2>${speechOk() ? (() => { const L = narVozes(), cur = narVoz(); return L.length ? `<p class="tiny" style="margin:0 0 8px">Voz</p><select id="cfgvoz" class="cfgsel">${L.map(x => `<option value="${esc(x.v.voiceURI)}" ${cur && cur.voiceURI === x.v.voiceURI ? 'selected' : ''}>${esc(x.v.name)} (${esc(x.v.lang)})${x.nat ? ' · natural' : ''}</option>`).join('')}</select>
  <div class="szr"><span style="font-size:13px">Lenta</span><input type="range" min="0.7" max="1.35" step="0.05" value="${narVel()}" id="cfgvel"><span style="font-size:13px">Rápida</span><b id="cfgvelv">${narVel().toFixed(2).replace('.', ',')}x</b></div><div class="pls"><button class="pl" data-act="narTeste">Ouvir uma amostra</button></div>
  ${L.some(x => x.nat) ? '<p class="tiny" style="font-weight:700">Voz natural encontrada: ela já é a preferida pelo app.</p>' : '<p class="tiny" style="color:var(--orange);font-weight:700">Nenhuma voz natural foi encontrada neste navegador. O app não consegue instalar voz nem forçar uma que o navegador não oferece: abra o app no Microsoft Edge (Windows) para ter as vozes "Online (Natural)".</p>'}<p class="tiny">A voz vem do seu aparelho, então a qualidade depende do que está instalado. As vozes marcadas como "natural" são bem mais humanas: no Edge e no Windows 11 aparecem vozes "Microsoft ... Online (Natural)", no Chrome a "Google português do Brasil", no iPhone e no Mac a "Luciana". O app lê o texto preparado para falar (artigo, parágrafo e siglas por extenso) e faz pausas entre frases e parágrafos.</p>` : '<p class="tiny">Este navegador não informou nenhuma voz em português. Abra o app no Edge ou no Chrome, ou instale uma voz em português nas configurações de idioma do sistema.</p>'; })() : '<p class="tiny">Este navegador não tem narração.</p>'}</div>
  <div class="card"><h2>Sons</h2><div class="pls">${ch('sfx', u.sfx === false ? '1' : '0', u.sfx === false ? 'Sons desligados (clique para ligar)' : 'Sons ligados (clique para desligar)', u.sfx !== false)}${ch('hover', u.hover ? '0' : '1', u.hover ? 'Tique ao passar o mouse: ligado' : 'Tique ao passar o mouse: desligado', !!u.hover)}<button class="pl" data-act="sfxTest">Testar o som</button></div>
  <div class="szr"><span style="font-size:13px">Baixo</span><input type="range" min="0" max="100" step="5" value="${u.vol == null ? 40 : u.vol}" id="cfgvol"><span style="font-size:13px">Alto</span><b id="cfgvolv">${u.vol == null ? 40 : u.vol}%</b></div>
  <p class="tiny">Um clique suave nos botões e um som de acerto ou erro nas questões. O tique ao passar o mouse vem desligado, porque cansa; ligue se gostar. Os sons são gerados pelo navegador, sem arquivos. O navegador só libera o som depois do seu primeiro clique na página.</p></div>
  <div class="card"><h2>Movimento</h2><div class="pls">${ch('rm', u.rm ? '' : '1', 'Reduzir animações e transições', !!u.rm)}</div><p class="tiny">Desliga as transições de tela e os efeitos. Ajuda se o aparelho estiver lento ou se o movimento incomodar.</p></div>
  <button class="btn ghost" data-act="cfgReset">Restaurar padrão</button></div>`;
}
function vNotas() {
  if (!S.notas.length) { S.notas.push({ id: uid(), t: 'Minha primeira nota', x: '', d: today() }); save(); }
  if (!notaCur || !S.notas.find(n => n.id === notaCur)) notaCur = S.notas[0].id;
  const n = S.notas.find(x => x.id === notaCur);
  return `<div class="top"><div><h1>Notas do <em>aluno</em></h1><p class="sub">Bloco livre para anotar o que quiser. Salva sozinho.</p></div><button class="btn" data-act="notaNew">Nova nota</button></div>
    <div class="notas"><div class="nlist">${S.notas.map(x => `<div class="it ${x.id === notaCur ? 'cur' : ''}" data-act="notaSel" data-id="${x.id}"><b>${esc(x.t || 'Sem título')}</b><span class="tiny">${esc(((x.x || '').replace(/\s+/g, ' ')).slice(0, 48))}</span></div>`).join('')}</div>
    <div class="ned"><input id="ntitle" value="${esc(n.t)}" placeholder="Título"><textarea id="nbody" placeholder="Escreva aqui...">${esc(n.x)}</textarea>
    <div class="row"><span class="tiny" id="nstat">Salvo</span><button class="btn ghost sm sp-r" data-act="notaDel" data-id="${n.id}">Apagar nota</button></div></div></div>`;
}
let notaCur = null, notaT = null;
function notaSave() { const n = S.notas.find(x => x.id === notaCur); if (!n) return; n.t = $('#ntitle').value; n.x = $('#nbody').value; n.d = today(); save(); const st = $('#nstat'); if (st) st.textContent = 'Salvo'; const it = $('.nlist .it.cur'); if (it) { it.querySelector('b').textContent = n.t || 'Sem título'; it.querySelector('span').textContent = (n.x || '').replace(/\s+/g, ' ').slice(0, 48); } }

/* ================== ANÁLISE DA FGV (questões reais por tema) ================== */
const FGV = () => window.C48_FGV || {}, FGVA = new Proxy({}, { get: (_, id) => (S.fgvA || {})[id], set: (_, id, v) => { S.fgvA = S.fgvA || {}; S.fgvA[id] = v; return true; } });
const qById = id => QR.find(q => q.id === id);
function fgvQHtml(mat, id, open) {
  const q = qById(id), d = FGV()[mat].q[id], tm = FGV()[mat].temas[d.t], got = FGVA[id];
  if (!q) return '';
  const an = q.anulada, done = !!got || an;
  const alts = ['A', 'B', 'C', 'D'].map(L => { const cls = !done ? '' : (L === q.gab ? 'ok' : (L === got ? 'no' : '')); return `<button class="fa ${cls}" ${done ? 'disabled' : ''} data-act="fgvAns" data-m="${mat}" data-id="${id}" data-a="${L}"><b>${L}</b><span>${esc(q.alts[L])}</span></button>`; }).join('');
  const res = !done ? '' : `<div class="fr ${an ? 'an' : got === q.gab ? 'ok' : 'no'}"><b>${an ? 'Questão anulada pela banca.' : got === q.gab ? 'Acertou.' : 'Errou. A correta é a ' + q.gab + '.'}</b> ${esc(d.c)} <button class="btn ghost sm" data-act="fgvRedo" data-m="${mat}" data-id="${id}">Refazer</button></div>`;
  return `<details class="fq" data-id="${id}" ${open ? 'open' : ''}><summary><span>${esc(q.exame)} exame · questão ${esc(q.num)}</span><em>${esc(tm.label)}</em>${an ? '<i class="ban">anulada</i>' : (got ? (got === q.gab ? '<i class="bok">acertou</i>' : '<i class="bno">errou</i>') : '')}</summary><p class="en">${esc(q.enun)}</p><div class="fas">${alts}</div>${res}</details>`;
}
function fgvUnit(m, k) {
  const F = FGV()[m.id]; if (!F) return '';
  const idx = Number(k.split(':')[1]), tk = Object.keys(F.temas).filter(t => F.temas[t].unit === idx);
  const sim = F.simulado === idx, ids = sim ? Object.keys(F.q) : Object.keys(F.q).filter(id => tk.includes(F.q[id].t));
  if (!ids.length) return `<h3>Questões reais da FGV</h3><p class="tiny">Nenhuma questão dos exames 40º a 47º foi mapeada para este tema. Isso não quer dizer que nunca vá cair: significa que, nas 8 provas analisadas, ele não apareceu como questão principal.</p>`;
  if (sim) return `<h3>Simulado de Ética: as ${ids.length} questões reais</h3><p class="tiny">Todas as questões de Ética dos exames 40º a 47º, em ordem de exame. Faça sem consultar, depois leia os comentários. Meta: errar o mínimo possível, porque Ética é a matéria em que a FGV mais copia a lei.</p><div class="fqs">${ids.map(id => fgvQHtml(m.id, id, false)).join('')}</div>`;
  const por = tk.map(t => `${F.temas[t].label}: ${Object.values(F.q).filter(x => x.t === t).length} questões`).join('; ');
  return `<h3>Questões reais da FGV neste tema</h3><p class="tiny">${esc(por)} nos exames 40º a 47º. Responda antes de ler o comentário.</p><div class="fqs">${ids.map(id => fgvQHtml(m.id, id, false)).join('')}</div>`;
}
function fgvRaioX(m) {
  const F = FGV()[m.id]; if (!F) return '';
  const cont = {}; Object.values(F.q).forEach(x => cont[x.t] = (cont[x.t] || 0) + 1);
  const rank = Object.entries(cont).sort((a, b) => b[1] - a[1]), mx = rank.length ? rank[0][1] : 1;
  const tot = Object.keys(F.q).length, g = { A: 0, B: 0, C: 0, D: 0 }; Object.keys(F.q).forEach(id => { const q = qById(id); if (q && g[q.gab] !== undefined) g[q.gab]++; });
  const gv = Object.values(g).reduce((a, b) => a + b, 0);
  return `<h2 class="sh">Raio-X da FGV em ${esc(m.nome)}</h2><div class="raio"><p class="tiny">Baseado nas ${tot} questões reais dos exames 40º a 47º. O que mais cai, em ordem:</p>
    <div class="rk">${rank.map(([t, n]) => `<div><span>${esc(F.temas[t].label)}</span><div class="rb"><i style="width:${Math.round(n / mx * 100)}%"></i></div><b>${n}</b></div>`).join('')}</div>
    <h4>Padrões que se repetem</h4><ul>${F.padrao.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
    <p class="tiny">Gabarito nas questões válidas: ${Object.entries(g).map(([L, n]) => L + ' ' + n).join(' · ')} (${gv} questões). Não existe letra "mais provável": não aposte em letra.</p></div>`;
}

/* ================== LIVRO COMO CURSO ================== */
const BK = { k: null, tab: 'aula', mode: {} };
const bkStep = k => { S.bk = S.bk || {}; return S.bk[k] || 0; };
const wordsOf = A => A ? A.sec.reduce((n, s) => n + s.x.split(/\s+/).length, 0) : 0;
const minOf = A => Math.max(5, Math.round(wordsOf(A) / 170));
const CALLS = [['Exemplo', 'co-ex', 'Exemplo'], ['Pegadinha', 'co-pg', 'Pegadinha'], ['Como fixar', 'co-fx', 'Como fixar'], ['Diferença-chave', 'co-fx', 'Diferença'], ['Importante', 'co-pg', 'Importante'], ['Agora faça', 'co-go', 'Agora faça'], ['Aviso', 'co-pg', 'Aviso']];
/* ---------- narração: voz escolhida, texto preparado para falar, pausas naturais ---------- */
function speechOk() { return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined'; }
const NU = ['', 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'sétimo', 'oitavo', 'nono'], NT = ['', 'décimo', 'vigésimo', 'trigésimo', 'quadragésimo', 'quinquagésimo', 'sexagésimo', 'septuagésimo', 'octogésimo', 'nonagésimo'];
const ordNum = n => n < 10 ? NU[n] : NT[Math.floor(n / 10)] + (n % 10 ? ' ' + NU[n % 10] : '');
const romNum = s => { const m = { I: 1, V: 5, X: 10, L: 50, C: 100 }; let n = 0; for (let i = 0; i < s.length; i++) { const v = m[s[i]], nx = m[s[i + 1]] || 0; n += v < nx ? -v : v; } return n; };
const SIGLAS = [[/\bCFOAB\b/g, 'Conselho Federal da O A B'], [/\bOAB\b/g, 'O A B'], [/\bCED\b/g, 'Código de Ética'], [/\bRG\b/g, 'Regulamento Geral'], [/\bFGV\b/g, 'F G V'], [/\bSTF\b/g, 'S T F'], [/\bSTJ\b/g, 'S T J'], [/\bTST\b/g, 'T S T'], [/\bTED\b/g, 'T E D'], [/\bTAC\b/g, 'T A C'], [/\bADI\b/g, 'A D I'], [/\bADPF\b/g, 'A D P F'], [/\bCPC\b/g, 'Código de Processo Civil'], [/\bCPP\b/g, 'Código de Processo Penal'], [/\bCP\b/g, 'Código Penal'], [/\bCF\b/g, 'Constituição Federal'], [/\bCLT\b/g, 'C L T'], [/\bECA\b/g, 'E C A'], [/\bPAC\b/g, 'P A C'], [/\bUCAM\b/g, 'Ucam'], [/\bD(\d)\b/g, 'D $1'], [/\bLEP\b/g, 'Lei de Execução Penal']];
function narTxt(raw) {
  let t = String(raw || '');
  t = t.replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, ' ').replace(/\|/g, ', ');
  t = t.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*\n]+)\*/g, '$1').replace(/[#>_`]/g, '').replace(/^\s*[-•]\s+/gm, '').replace(/^\s*(\d+)\.\s+/gm, '$1, ');
  t = t.replace(/\barts\.\s*|\barts\s+(?=\d)/gi, 'artigos ').replace(/\bart\.\s*|\bart\s+(?=\d)/gi, 'artigo ');
  t = t.replace(/§§\s*/g, 'parágrafos ').replace(/§\s*/g, 'parágrafo ');
  t = t.replace(/\b(artigo|artigos|parágrafo|parágrafos)\s+(\d{1,2})(?:[º°]|o\b)?(?![\d.])/gi, (m, w, n) => w + ' ' + (Number(n) <= 9 ? ordNum(Number(n)) : n));
  t = t.replace(/(,|\be|\bou|\ba)\s+(\d{1,2})\s*[º°](?!\d)/g, (m, c, n) => c + ' ' + ordNum(Number(n)));
  t = t.replace(/\b(\d{1,2})\s*[º°](?=\s+(exame|período|lugar|ano|edição|dia|cartão))/gi, (m, n) => ordNum(Number(n)));
  t = t.replace(/\b(\d{1,2})\s*[º°]/g, (m, n) => Number(n) <= 9 ? ordNum(Number(n)) : n);
  t = t.replace(/\b(inciso|incisos|inc\.)\s+([IVXLC]{1,6})\b/g, (m, w, r) => 'inciso ' + romNum(r));
  t = t.replace(/\b(artigo|artigos)\s+([\wéáíóúç]+)\s*,\s*([IVXLC]{1,6})\b(?![a-zç])/g, (m, w, n, r) => w + ' ' + n + ', inciso ' + romNum(r));
  t = t.replace(/\b([IVXLC]{1,6})\s+(a|e)\s+([IVXLC]{1,6})\b(?=\s+(do|da|dos|das|e|,|\.))/g, (m, a, c, b) => (/^[IVXLC]+$/.test(a) && romNum(a) < 60 ? romNum(a) : a) + ' ' + c + ' ' + romNum(b));
  t = t.replace(/(\d{1,3}(?:\.\d{3})*)\/(\d{4})/g, '$1, de $2');
  t = t.replace(/\bR\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)/g, '$1 reais').replace(/(\d+)\s*%/g, '$1 por cento').replace(/\bnº\s*/gi, 'número ').replace(/\be\.g\./g, 'por exemplo');
  SIGLAS.forEach(([re, v]) => { t = t.replace(re, v); });
  t = t.replace(/\s[—–]\s/g, ', ').replace(/\s-\s/g, ', ').replace(/[“”"]/g, '').replace(/\(([^)]{0,80})\)/g, ', $1,').replace(/\s*\/\s*/g, ' barra ').replace(/[ \t]+/g, ' ');
  return t.trim();
}
function narPartes(txt) {
  const out = [];
  narTxt(txt).split(/\n+/).map(p => p.trim()).filter(Boolean).forEach(p => {
    const fr = p.match(/[^.!?…;:]+[.!?…;:]*/g) || [p]; let cur = '';
    fr.forEach(f => { f = f.trim(); if (!f) return; if ((cur + ' ' + f).length > 230 && cur) { out.push([cur, 'f']); cur = f; } else cur = cur ? cur + ' ' + f : f; if (cur.length > 60 && /[.!?…]$/.test(cur)) { out.push([cur, 'f']); cur = ''; } });
    if (cur) out.push([cur, 'f']); if (out.length) out[out.length - 1][1] = 'p';
  });
  return out;
}
function narVozes() {
  if (!speechOk()) return [];
  const pt = speechSynthesis.getVoices().filter(v => /^pt([-_]|$)/i.test(v.lang));
  const sc = v => (/natural|neural|online/i.test(v.name) ? 60 : 0) + (/francisca|antonio|thalita|google|luciana|felipe|fernanda|vit[oó]ria|joana/i.test(v.name) ? 25 : 0) + (/pt[-_]BR/i.test(v.lang) ? 20 : 0) + (v.localService ? 0 : 5);
  return pt.map(v => ({ v, s: sc(v), nat: /natural|neural|online/i.test(v.name) })).sort((a, b) => b.s - a.s);
}
function narVoz() { const l = narVozes(), u = S.ui || {}; return (u.voz && (l.find(x => x.v.voiceURI === u.voz) || {}).v) || (l[0] && l[0].v) || null; }
const NAR = { id: 0, on: false, el: null };
const narVel = () => { const v = Number((S.ui || {}).vel); return v >= 0.7 && v <= 1.4 ? v : 0.96; };
window.PETRUS_VEL = { get: () => narVel(), set: v => { S.ui = S.ui || {}; S.ui.vel = v; save(); } };
window.PETRUS_VOZ = { list: () => narVozes().map(x => ({ id: x.v.voiceURI, name: x.v.name, nat: x.nat })), get: () => (narVoz() || {}).voiceURI, set: id => { S.ui = S.ui || {}; S.ui.voz = id; save(); } };
function narParar() { NAR.id++; NAR.on = false; try { speechSynthesis.cancel(); } catch (e) { } if (NAR.el) { NAR.el.classList.remove('on'); NAR.el = null; } }
function ouvir(txt, el) {
  try {
    if (NAR.on) { narParar(); return false; }
    const partes = narPartes(txt); if (!partes.length) return false;
    const id = ++NAR.id; NAR.on = true; NAR.el = el || null; speechSynthesis.cancel();
    const falar = i => {
      if (id !== NAR.id) return;
      if (i >= partes.length) { narParar(); return; }
      const [t, tipo] = partes[i], u = new SpeechSynthesisUtterance(t), v = narVoz();
      u.lang = (v && v.lang) || 'pt-BR'; if (v) u.voice = v; u.rate = narVel(); u.pitch = /\?$/.test(t) ? 1.06 : 1;
      u.onend = () => setTimeout(() => falar(i + 1), tipo === 'p' ? 520 : /[,;:]$/.test(t) ? 90 : 180);
      u.onerror = () => { if (id === NAR.id) narParar(); };
      speechSynthesis.speak(u);
    };
    falar(0); return true;
  } catch (e) { return false; }
}
if (speechOk()) { try { speechSynthesis.onvoiceschanged = () => { if (route().v === 'config') render(); }; } catch (e) { } }
function mdRich(s) {
  const inl = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
  return String(s || '').split(/\n{2,}/).map(b => {
    const ls = b.split('\n');
    if (ls.length > 2 && ls.every(l => /^\s*\|.*\|\s*$/.test(l)) && /^\s*\|[\s:|-]+\|\s*$/.test(ls[1])) {
      const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => inl(c.trim()));
      return '<div class="tbw"><table class="tb"><thead><tr>' + cells(ls[0]).map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' + ls.slice(2).map(l => '<tr>' + cells(l).map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
    }
    if (ls.every(l => /^\s*\d+\. /.test(l))) return '<ol>' + ls.map(l => '<li>' + inl(l.replace(/^\s*\d+\. /, '')) + '</li>').join('') + '</ol>';
    if (ls.every(l => /^\s*[-*] /.test(l))) return '<ul>' + ls.map(l => '<li>' + inl(l.replace(/^\s*[-*] /, '')) + '</li>').join('') + '</ul>';
    const call =CALLS.find(c => b.startsWith('**' + c[0]));
    const body = ls.map(inl).join('<br>');
    if (call) return `<div class="co ${call[1]}"><span class="cl">${call[2]}</span><p>${body}</p></div>`;
    return '<p>' + body + '</p>';
  }).join('');
}
function bkKeys(A) { const set = new Set(); (A ? A.sec : []).forEach(s => (s.x.match(/\*\*[^*]{3,60}\*\*/g) || []).forEach(t => { const w = t.slice(2, -2); if (/^[A-Za-zÀ-ú0-9]/.test(w) && !/[:.,;]$/.test(w) && !/^(Exemplo|Pegadinha|Como fixar|Agora faça|Diferença|Importante)/.test(w)) set.add(w); })); return [...set].slice(0, 16); }
function vBook(id) {
  if (id === 'c48' || BK.mode[id] === 'caderno') return vBookCaderno(id);
  const m = MAT.find(x => x.id === id); if (!m) return '<p>Livro não encontrado.</p>';
  if (BK.k && BK.k !== '_resumo' && !BK.k.startsWith(id + ':')) BK.k = null;
  if (BK.k === '_resumo') return vResumoMat(m);
  return BK.k ? vLicao(m, BK.k) : vCurso(m);
}
function vResumoMat(m) {
  const us = QUEUE.filter(x => x.m === m && AULA()[x.k]);
  return `<div class="curso" style="--mc:${m.cor}"><div class="lhead"><button class="btn ghost sm" data-act="bkBack">← ${esc(m.nome)}</button><span class="tiny">Resumo de véspera</span></div>
    <h1 class="lt">Resumo: ${esc(m.nome)}</h1><p class="lead2">Uma conclusão por aula, para reler antes da prova. Se algo não fizer sentido, volte à aula.</p>
    ${us.map(x => { const A = AULA()[x.k], c = A.sec[A.sec.length - 1]; return `<div class="lstep"><h2>${esc(x.u)}</h2><div class="prose">${mdRich(c.x.replace(/\*\*Agora faça:\*\*[\s\S]*$/, ''))}</div><button class="btn ghost sm" data-act="bkOpen" data-k="${x.k}">Reabrir aula</button></div>`; }).join('')}</div>`;
}
function nlmText(m) {
  const us = QUEUE.filter(x => x.m === m && AULA()[x.k]), F = FGV()[m.id];
  const out = ['# ' + m.nome + ' (Caderno 48)', 'Material de estudo para o Exame de Ordem. Fonte: aulas do Petrus conferidas com o texto da lei e questões reais da FGV (40º a 47º). Confira sempre a lei vigente.', ''];
  us.forEach((x, n) => { out.push('## Capítulo ' + (n + 1) + ': ' + x.u, ''); AULA()[x.k].sec.forEach(s => out.push('### ' + s.t, '', s.x, '')); });
  if (F) { out.push('## Questões reais da FGV com comentário', ''); Object.keys(F.q).forEach(id => { const q = qById(id), d = F.q[id]; if (!q) return; out.push('### ' + q.exame + ' exame, questão ' + q.num + ' (' + F.temas[d.t].label + ')', '', q.enun, '', ['A', 'B', 'C', 'D'].map(L => L + ') ' + q.alts[L]).join('\n'), '', q.anulada ? 'Questão anulada pela banca.' : 'Gabarito: ' + q.gab + '.', 'Comentário: ' + d.c, ''); }); }
  return out.join('\n');
}function vCurso(m) {
  const us = QUEUE.filter(x => x.m === m), done = us.filter(x => isDone(x.k)).length, f = (window.C48_FOCO || {})[m.id] || '', E = ES().mat[m.id];
  const nxt = us.find(x => !isDone(x.k)) || us[0];
  const cards = us.map((x, i) => { const A = AULA()[x.k], st = isDone(x.k) ? 'ok' : (bkStep(x.k) > 0 ? 'ing' : 'new'), lab = { ok: 'Concluída', ing: 'Em andamento', new: A ? 'Não iniciada' : 'Aula em breve' }[st];
    const intro = A ? A.sec[0].x.split(/\n/)[0].replace(/\*\*/g, '').slice(0, 130) + '…' : 'O professor está preparando esta aula.';
    return `<div class="cc ${st} ${A ? '' : 'off'}" ${A ? `data-act="bkOpen" data-k="${x.k}"` : ''}><span class="n">${isDone(x.k) ? '✓' : i + 1}</span><div><b>${esc(x.u)}</b><p>${esc(intro)}</p>${freshBar(x.k)}<span class="meta">${lab}${A ? ' · ' + minOf(A) + ' min de leitura' : ''}${S.errors.filter(e => e.topico === x.u).length >= 2 ? '<em class="ref"> · Reforçar: '+ S.errors.filter(e => e.topico === x.u).length +' erros</em>' : ''}</span></div></div>`; }).join('');
  return `<div class="curso"><div class="chero" style="--mc:${m.cor}"><div class="tiny">CURSO</div><h1>${esc(m.nome)}</h1><p class="lead">${esc(f)}</p>${peso(m).n ? `<span class="tiny" style="text-transform:none;letter-spacing:0">No banco de ${QR.length} questões reais, ${peso(m).n} (${peso(m).p}%) são desta matéria.</span>` : ''}
    <div class="cprog"><div class="bar"><i style="width:${us.length ? done / us.length * 100 : 0}%"></i></div><span>${done} de ${us.length} aulas concluídas</span></div>
    ${nxt && AULA()[nxt.k] ? `<button class="btn" data-act="bkOpen" data-k="${nxt.k}">${done ? 'Continuar' : 'Começar'}: ${esc(nxt.u)}</button>` : ''}</div>
    <h2 class="sh">Trilha de aulas</h2><div class="ctrail">${cards}</div>${fgvRaioX(m)}${cpLivro(m)}
    ${E ? `<h2 class="sh">Para assistir e ler</h2><div class="aulas">${E.aulas.map(aulaHtml).join('')}</div><div class="row" style="margin-top:8px">${E.leis.map(leiBtn).join('')}</div>` : ''}
    <div class="row" style="margin-top:22px"><button class="btn ghost sm" data-act="bkResumo">Resumo de véspera da matéria</button><button class="btn ghost sm" data-act="bkMode" data-id="${m.id}" data-v="caderno">Abrir meu caderno de anotações deste livro</button><button class="btn ghost sm" data-act="nlmExport" data-id="${m.id}">Exportar para o NotebookLM</button><a class="btn ghost sm" href="https://notebooklm.google.com" target="_blank" rel="noopener">Abrir o NotebookLM</a><a class="btn ghost sm" href="#/lib">Voltar à biblioteca</a></div></div>`;
}
function vLicao(m, k) {
  const A = AULA()[k], q = unitByKey(k), us = QUEUE.filter(x => x.m === m), i = us.findIndex(x => x.k === k);
  if (!A) { BK.k = null; return vCurso(m); }
  const step = clamp(bkStep(k), 0, A.sec.length - 1), s = A.sec[step], last = step === A.sec.length - 1, tab = BK.tab;
  const tabs = [['aula', 'Aula'], ['lei', 'Lei e vídeos'], ['pratica', 'Praticar'], ['notas', 'Minhas notas']].map(t => `<button class="${tab === t[0] ? 'on' : ''}" data-act="bkTab" data-t="${t[0]}">${t[1]}</button>`).join('');
  let body = '';
  if (tab === 'aula') {
    const roadmap = step === 0 ? `<div class="road"><b>Nesta aula você vai ver:</b><ol>${A.sec.slice(1, -1).map(x => `<li>${esc(x.t.replace(/^Desenvolvimento \d+: /, ''))}</li>`).join('')}</ol><span class="tiny">${minOf(A)} minutos de leitura. Leia com calma, uma etapa por vez.</span></div>` : '';
    const keys = last ? `<div class="keys"><h3>Fixe estes termos</h3><div>${bkKeys(A).map(t => `<span>${esc(t)}</span>`).join('')}</div></div>
      <div class="recall"><h3>Agora com as suas palavras</h3><p>Sem olhar o texto, escreva em poucas linhas o que você aprendeu. Escrever é o que fixa.</p><textarea id="bkans" placeholder="Eu aprendi que...">${esc(((S.units[k] || {}).test || {}).ans || '')}</textarea></div>` : '';
    body = `<div class="lstep"><div class="dots">${A.sec.map((x, j) => `<button class="${j === step ? 'on' : j < step ? 'ok' : ''}" data-act="bkStep" data-k="${k}" data-i="${j}" title="${esc(x.t)}"></button>`).join('')}<span>Etapa ${step + 1} de ${A.sec.length}</span></div>
      <h2>${esc(s.t)}</h2>${speechOk() ? `<span class="vrow2"><button class="rb lis" data-act="ouvir" data-k="${k}" data-i="${step}" title="Ouvir esta etapa" aria-label="Ouvir esta etapa"><svg viewBox="0 0 24 24"><path d="M5 9v6h3l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 010 7"/></svg></button><button class="rb lis" data-act="narVel" title="Velocidade da voz" aria-label="Velocidade da voz"><b>${narVel().toFixed(2).replace('.', ',')}x</b></button></span>` : ""}${roadmap}<div class="prose">${mdRich(s.x)}</div>${keys}${last ? chapEnd(m, k, us, i) : ''}
      ${last ? '<p class="tiny">Aula escrita em outubro de 2026 a partir dos textos das leis do Vade Mecum. Leis mudam: confira a redação em vigor na fonte antes da prova.</p>' : ''}<div class="lnav">${step > 0 ? `<button class="btn ghost" data-act="bkStep" data-k="${k}" data-i="${step - 1}">Voltar</button>` : '<span></span>'}${!last ? `<button class="btn" data-act="bkStep" data-k="${k}" data-i="${step + 1}">Próxima etapa</button>` : `<button class="btn" data-act="bkDone" data-k="${k}">${isDone(k) ? 'Aula concluída' : 'Concluir aula e agendar revisão'}</button>`}</div></div>`;
  } else if (tab === 'lei') body = `<div class="lstep">${guiaHtml(k, m)}</div>`;
  else if (tab === 'pratica') {
    const g = ES().un[k], auto = g ? g.auto : [];
    body = `<div class="lstep"><h2>Praticar</h2><p class="lead2">Estudar sem praticar não fixa. Faça nesta ordem:</p>
      <ol class="pr"><li><b>Autoteste (3 min).</b> ${auto.length ? 'Responda em voz alta, sem olhar:' : 'Escreva três perguntas sobre a aula e responda.'}${auto.length ? `<ul>${auto.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}</li>
      <li><b>Questões reais (15 min).</b> <button class="btn sm" data-act="trainMat" data-m="${esc(m.nome)}">Treinar questões de ${esc(m.nome)}</button></li>
      <li><b>Errou? Anote.</b> <button class="btn ghost sm" data-act="toErr" data-k="${k}">Mandar para o caderno de erros</button></li>
      <li><b>Revisão.</b> ${isDone(k) ? 'Já agendada: D1, D2, D7, D14, D30.' : `<button class="btn sm" data-act="bkDone" data-k="${k}">Marcar como estudada</button>`}</li></ol>
      ${fgvUnit(m, k)}${bkCards(A, q.u).length ? `<h3>Cartões desta aula</h3><div class="fcs">${bkCards(A, q.u).map(c => `<details class="fc"><summary>${esc(c.f)}</summary><p>${esc(c.b)}</p></details>`).join('')}</div>` : ''}<button class="btn ghost sm" data-act="duvidaOpen" data-k="${k}">Tenho uma dúvida sobre esta aula</button><div id="dvbox"></div></div>`;
  } else body = `<div class="lstep"><h2>Minhas notas desta aula</h2><p class="lead2">Anote aqui o que quiser lembrar. Fica salvo sozinho.</p><textarea id="bknote" class="bknote" placeholder="Minhas anotações...">${esc(((S.units[k] || {}).note) || '')}</textarea>
    <div class="row"><button class="btn ghost sm" data-act="bkMode" data-id="${m.id}" data-v="caderno">Abrir o caderno completo (post-its, grifos)</button></div></div>`;
  return `<div class="curso lic ${S.leitura ? 'leitura' : ''}" style="--mc:${m.cor}"><div class="lhead"><button class="btn ghost sm" data-act="bkBack">← ${esc(m.nome)}</button><span><button class="btn ghost sm" data-act="bkRead">${S.leitura ? 'Modo normal' : 'Modo leitura'}</button> <span class="tiny">Aula ${i + 1} de ${us.length}</span></span></div>
    <h1 class="lt">${esc(q.u)}</h1><div class="ltabs">${tabs}</div>${body}</div>`;
}

/* barra de "frescor": esvazia com o tempo sem rever o capítulo (30 dias) */
function freshBar(k) {
  const u = S.units[k]; if (!u || !u.d) return '';
  let last = u.d; Object.keys(u.rev || {}).forEach(o => { if (u.rev[o]) { const dd = iso(addDays(parse(u.d), Number(o))); if (dd > last) last = dd; } });
  const tc = (S.touch || {})[k]; if (tc && tc > last) last = tc;
  const open = S.errors.filter(e => e.unit === k && !CFG.revisoes.every(o => e.rev && e.rev[o])).length;
  const days = Math.max(0, diffDays(last, today())), f = clamp(1 - days / 30 - open * 0.15, 0, 1), lab = f > .66 ? 'fresco' : f > .33 ? 'revise em breve' : 'precisa de revisão';
  return `<span class="fresh ${f > .66 ? 'ok' : f > .33 ? 'mid' : 'low'}" title="Frescor: ${lab}"><i style="width:${Math.round(f * 100)}%"></i><em>${lab}</em></span>`;
}
function chapEnd(m, k, us, i) {
  const F = FGV()[m.id], nx = us[i + 1] && AULA()[us[i + 1].k] ? us[i + 1] : null;
  let sc = '';
  if (F) {
    const idx = Number(k.split(':')[1]), tk = Object.keys(F.temas).filter(t => F.temas[t].unit === idx);
    const ids = F.simulado === idx ? [] : Object.keys(F.q).filter(id => tk.includes(F.q[id].t)), fa = S.fgvA || {};
    const ans = ids.filter(id => fa[id]), ok = ans.filter(id => qById(id) && fa[id] === qById(id).gab).length;
    if (ids.length) sc = `<p>${ans.length ? `Nas questões reais deste capítulo você respondeu <b>${ans.length} de ${ids.length}</b> e acertou <b>${ok}</b>.${ans.length - ok ? ' Os erros já estão no caderno de erros, com revisão agendada.' : ''}` : `Este capítulo tem <b>${ids.length} questões reais</b> da FGV esperando por você.`}</p>`;
  }
  if (!F) sc = `<p>Ainda não mapeei as questões reais da FGV por capítulo em ${esc(m.nome)}. Enquanto isso, treine as questões da matéria inteira.</p>`;
  return `<div class="endc"><h3>Fim do capítulo</h3>${sc}<div class="row">${F ? '<button class="btn sm" data-act="bkTab" data-t="pratica">Fazer as questões reais</button>' : `<button class="btn sm" data-act="trainMat" data-m="${esc(m.nome)}">Treinar questões de ${esc(m.nome)}</button>`}${nx ? `<button class="btn ghost sm" data-act="bkOpen" data-k="${nx.k}">Próximo: ${esc(nx.u)}</button>` : ''}</div></div>`;
}
/* ================== EXTRAS DE ESTUDO ================== */
const peso = m => { const n = QR.filter(q => q.materia === m.nome).length; return { n, p: QR.length ? Math.round(n / QR.length * 100) : 0 }; };
function bkCards(A, title) {
  const out = [];
  A.sec.forEach(s => s.x.split(/\n{2,}/).forEach(b => { const c = ['Pegadinha', 'Como fixar', 'Diferença-chave', 'Importante'].find(n => b.startsWith('**' + n)); if (c) out.push({ f: (c === 'Pegadinha' ? 'Qual é a pegadinha? ' : 'Como fixar: ') + '(' + s.t.replace(/^Desenvolvimento \d+: /, '') + ')', b: b.replace(/^\*\*[^*]+\*\*:?\s*/, '').replace(/\*\*/g, ''), t: title }); }));
  return out;
}
const CARD = { deck: null, i: 0, show: false, src: 'aulas' };
function cardDeck() {
  if (CARD.deck) return CARD.deck;
  if (CARD.src === 'cerebro') {
    const nome = id => (MAT.find(x => x.id === id) || { nome: id }).nome;
    const base = (CER.cards || []).map(c => ({ m: nome(c.m), t: TIPOS_R[c.k] || c.k, f: c.t, b: c.e + (c.b ? ' (' + c.b + ')' : '') }));
    CARD.deck = base.map(c => [Math.random(), c]).sort((a, b) => a[0] - b[0]).map(x => x[1]); return CARD.deck;
  }
  const all = []; QUEUE.forEach(x => { const A = AULA()[x.k]; if (A) bkCards(A, x.u).forEach(c => all.push(Object.assign(c, { done: isDone(x.k), m: x.m.nome }))); });
  const base = all.some(c => c.done) ? all.filter(c => c.done) : all;
  CARD.deck = base.map(c => [Math.random(), c]).sort((a, b) => a[0] - b[0]).map(x => x[1]); return CARD.deck;
}
function vCards() {
  const d = cardDeck();
  const src = `<div class="row" style="margin-bottom:14px"><button class="chip ${CARD.src !== 'cerebro' ? 'on' : ''}" data-act="cardSrc" data-s="aulas">Das minhas aulas</button><button class="chip ${CARD.src === 'cerebro' ? 'on' : ''}" data-act="cardSrc" data-s="cerebro">Banco do Petrus (${(CER.cards || []).length})</button></div>`;
  if (!d.length) return `<div class="top"><div><h1>Cartões</h1></div></div><div class="curso">${src}<p>Conclua uma aula para gerar cartões.</p></div>`;
  const c = d[CARD.i % d.length];
  return `<div class="top"><div><h1>Cartões de <em>revisão</em></h1><p class="sub">${CARD.src === 'cerebro' ? 'Regras e pegadinhas conferidas na lei pelo Petrus.' : 'Pegadinhas e pontos de fixação das aulas que você estudou.'} Tente responder antes de virar o cartão.</p></div></div>
    <div class="curso">${src}<div class="fcard ${CARD.show ? 'on' : ''}" data-act="cardShow"><span class="tiny">${esc(c.m)} · ${esc(c.t)}</span><h2>${esc(c.f)}</h2>${CARD.show ? `<p>${esc(c.b)}</p>` : '<p class="muted">Toque para ver a resposta</p>'}</div>
    <div class="row">${CARD.show ? '<button class="btn ghost" data-act="cardMiss">Errei, mostre de novo logo</button><button class="btn" data-act="cardNext">Acertei, próximo</button>' : '<button class="btn" data-act="cardShow">Virar o cartão</button>'}<span class="tiny">${CARD.i % d.length + 1} de ${d.length}</span></div></div>`;
}
function vRel() {
  const t = today(), st = iso(addDays(parse(t), -6));
  let mins = 0; for (let i = 0; i < 7; i++) mins += S.hours[iso(addDays(parse(t), -i))] || 0;
  const unidades = Object.entries(S.units).filter(([k, u]) => u.d && u.d >= st).map(([k]) => unitByKey(k)).filter(Boolean);
  let qs = 0, qok = 0; const by = {};
  allQ().forEach(q => { const h = histOf(q); h.forEach(x => { if (x.d >= st) { qs++; if (x.ok) qok++; } }); const m = q.materia || 'Outra'; by[m] = by[m] || { n: 0, ok: 0 }; h.forEach(x => { by[m].n++; if (x.ok) by[m].ok++; }); });
  const fracas = Object.entries(by).filter(([m, v]) => v.n >= 5).map(([m, v]) => [m, v.ok / v.n, v.n]).sort((a, b) => a[1] - b[1]).slice(0, 5);
  const nx = nextUnit(t), pend = pending().length;
  const plano = [nx ? `Estudar a aula "${nx.u}" (${nx.m.nome}).` : 'Revisar tudo o que já estudou.', pend ? `Fazer as ${pend} revisões vencidas antes de conteúdo novo.` : 'Nenhuma revisão vencida: bom sinal.', fracas.length ? `Treinar 20 questões de ${fracas[0][0]}, sua matéria com menor acerto.` : 'Responder questões para o app descobrir seus pontos fracos.'];
  return `<div class="top"><div><h1>Relatório da <em>semana</em></h1><p class="sub">${fmt(st)} a ${fmt(t)}. Gerado do que você registrou no app.</p></div></div>
    <div class="grid g3"><div class="card"><div class="tiny">Tempo estudado</div><h2>${hm(mins)}</h2><p class="muted">Meta: ${hm(CFG.minimoDiaMin * 7)} na semana</p></div>
    <div class="card"><div class="tiny">Aulas concluídas</div><h2>${unidades.length}</h2><p class="muted">${unidades.slice(0, 3).map(x => esc(x.u)).join('; ') || 'Nenhuma ainda'}</p></div>
    <div class="card"><div class="tiny">Questões</div><h2>${qs}</h2><p class="muted">${qs ? Math.round(qok / qs * 100) + '% de acerto' : 'Nenhuma respondida'}</p></div></div>
    <div class="grid g2" style="margin-top:16px"><div class="card cream"><h2>Onde você mais erra</h2>${fracas.length ? `<div class="list">${fracas.map(f => `<div><span class="sp"><b>${esc(f[0])}</b><div class="tiny">${f[2]} respostas</div></span><b>${Math.round(f[1] * 100)}%</b></div>`).join('')}</div>` : '<p class="muted">Responda ao menos 5 questões de uma matéria para aparecer aqui.</p>'}</div>
    <div class="card"><h2>Quando você estuda</h2>${(() => { const h = horarios(); if (!h.n) return '<p class="muted">Ainda não há registros. Abra aulas e registre o tempo no Início: o Petrus vai aprender o seu horário.</p>'; const mx = Math.max(1, ...h.tt ? Object.values(h.tt) : [1]); return '<div class="list">' + Object.entries(h.tt).map(([k, v]) => `<div><span class="sp"><b>${k}</b></span><span class="bar thin" style="width:55%"><i style="width:${Math.round(v / mx * 100)}%"></i></span></div>`).join('') + `</div><p class="tiny" style="margin-top:8px">Seu turno mais forte até agora: <b>${h.melhor || '-'}</b>. Reserve nele os temas novos e deixe as revisões para os outros horários.</p>`; })()}</div>
    <div class="card"><h2>Plano para a próxima semana</h2><ol class="pr">${plano.map(p => `<li>${esc(p)}</li>`).join('')}</ol></div></div>`;
}
function hojeAulaHtml() {
  const nx = nextUnit(today()), ing = QUEUE.find(x => !isDone(x.k) && bkStep(x.k) > 0 && AULA()[x.k]);
  const pick = ing || (nx && AULA()[nx.k] ? nx : QUEUE.find(x => !isDone(x.k) && AULA()[x.k]));
  if (!pick) return '';
  const A = AULA()[pick.k], fi = fichaDoDia(today());
  return `<div class="hoje" style="--mc:${pick.m.cor}"><div><span class="tiny">${ing ? 'CONTINUE DE ONDE PAROU' : 'SUA AULA DE HOJE'}${fi ? ' · TREINO ' + fi.id : ''}</span><h3>${esc(pick.u)}</h3><p>${esc(pick.m.nome)} · ${minOf(A)} min de leitura${ing ? ' · etapa ' + (bkStep(pick.k) + 1) + ' de ' + A.sec.length : ''}</p></div><button class="btn" data-act="bkOpen" data-k="${pick.k}">${ing ? 'Continuar' : 'Abrir aula'}</button></div>`;
}
document.addEventListener('mouseup', e => {
  if (e.target && e.target.id === 'selq') return;
  setTimeout(() => {
    const old = document.getElementById('selq'); if (old) old.remove();
    const sel = getSelection(), t = sel && sel.toString().trim(); if (!t || t.length < 6 || !BK.k) return;
    const an = sel.anchorNode && (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode); if (!an || !an.closest || !an.closest('.prose')) return;
    const r = sel.getRangeAt(0).getBoundingClientRect(), b = document.createElement('button');
    b.id = 'selq'; b.className = 'btn sm'; b.textContent = 'Tenho dúvida neste trecho'; b.dataset.act = 'selDuvida'; b.dataset.t = t.slice(0, 300);
    b.style.cssText = `position:fixed;left:${Math.max(8, Math.min(r.left, innerWidth - 220))}px;top:${Math.max(8, r.top - 46)}px;z-index:60`; document.body.appendChild(b);
  }, 10);
});

/* ================== LIVRO ================== */
const SW = ['#FFCDAE', '#A8F0CE', '#A6DEFF', '#F2B6E8', '#D6B8FF'];
const TPL = {
  esq: '<div class="esq"><div class="eb">Regra</div><span class="ea">→</span><div class="eb">Exceção</div><span class="ea">→</span><div class="eb">Pegadinha</div></div><p><br></p>',
  mapa: '<div class="mapa"><div><div class="eb">Ramo 1</div><div class="eb" style="margin-top:8px">Ramo 2</div></div><div class="eb c">Tema central</div><div><div class="eb">Ramo 3</div><div class="eb" style="margin-top:8px">Ramo 4</div></div></div><p><br></p>',
  res: '<h3>Resumo de uma página</h3><h4>Regra (5 a 8 linhas)</h4><ul><li><br></li></ul><h4>Exceções</h4><ul><li><br></li></ul><h4>Prazos e números</h4><table><tr><th>Assunto</th><th>Prazo ou regra</th></tr><tr><td><br></td><td><br></td></tr></table><h4>2 pegadinhas</h4><ol><li><br></li><li><br></li></ol><h4>3 perguntas de autoteste</h4><ol><li><br></li><li><br></li><li><br></li></ol><p><br></p>'
};
const HLC = ['#FFE08A', '#FFCDAE', '#A8F0CE', '#D6B8FF'];
let PRESEL = '', bookCol = (() => { try { return localStorage.getItem('c48.bookcol') === '1'; } catch (e) { return false; } })();
const ES = () => window.C48_ESTUDO || { mat: {}, un: {}, como: [] };
const ytUrl = a => a.p ? 'https://www.youtube.com/playlist?list=' + a.p : 'https://www.youtube.com/watch?v=' + a.y;
const aulaHtml = a => `<a class="aula" href="${ytUrl(a)}" target="_blank" rel="noopener"><span class="pl">&#9654;</span><span><b>${esc(a.t)}</b>${a.n ? `<em>${esc(a.n)}</em>` : ''}</span></a>`;
const leiBtn = l => `<button class="btn ghost sm" data-act="vmArt" data-id="${l.id}" data-n="${l.n || ''}">${esc(l.t)}</button>`;
const ytBusca = s => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(s);
function guiaHtml(k, mat) {
  const mod = (ES().mod || {})[k], m = ES().mat[mat.id], q = unitByKey(k);
  const vids = (mod && mod.v) || [], qs = (mod && mod.b && mod.b.length) ? mod.b : [q.u + ' ' + mat.nome + ' OAB 1ª fase aula', mat.nome + ' OAB questões comentadas FGV'];
  const leis = (mod && mod.leis && mod.leis.length) ? mod.leis : (m ? m.leis : []);
  return `<div class="guia"><h2>Videoaulas deste módulo</h2><p class="tiny" style="margin:-6px 0 10px">${esc(q.u)}</p>
    ${vids.length ? `<div class="aulas">${vids.map(aulaHtml).join('')}</div>` : `<p>Ainda não separei vídeos específicos deste módulo. Use as buscas abaixo${m && m.aulas.length ? ' ou as aulas gerais da matéria' : ''}.</p>${m && m.aulas.length ? `<h4>Aulas gerais da matéria</h4><div class="aulas">${m.aulas.map(aulaHtml).join('')}</div>` : ''}`}
    <h4>Aulas do CEISC sobre o conteúdo deste capítulo</h4><div class="row">${(() => { const A = AULA()[k] || {}, ign = /^(Introdução|Explicando|Pegadinhas|Teste rápido|Respostas|Conclusão|Mapa)/i, ts = (A.sec || []).map(s => s.t).filter(t => !ign.test(t)).map(t => t.replace(/^Conteúdo denso \d+:\s*/i, '').replace(/\s*\([^)]*\)/g, '').trim()).filter(Boolean).slice(0, 4); return ['CEISC ' + mat.nome + ' ' + q.u].concat(ts.map(t => 'CEISC ' + t + ' OAB')).map(s => `<a class="btn ghost sm" href="${ytBusca(s)}" target="_blank" rel="noopener" style="text-decoration:none">${esc(s.length > 54 ? s.slice(0, 52) + '…' : s)}</a>`).join(''); })()}</div>
    <h4>Buscar mais videoaulas deste tema</h4><div class="row">${qs.map(s => `<a class="btn ghost sm" href="${ytBusca(s)}" target="_blank" rel="noopener" style="text-decoration:none">${esc(s.length > 46 ? s.slice(0, 44) + '…' : s)}</a>`).join('')}</div>
    ${leis.length ? `<h4>Leia a lei seca deste módulo</h4><div class="row">${leis.map(leiBtn).join('')}</div>` : ''}
    <div class="row" style="margin-top:14px"><button class="btn sm" data-act="trainMat" data-m="${esc(mat.nome)}">Treinar questões reais de ${esc(mat.nome)}</button></div>
    <p class="tiny">Os vídeos vieram de pesquisa no YouTube pelo título e pelo assunto, e <b>eu não os assisti</b>. Confira se ainda estão no ar e se estão atualizados (vale a lei vigente em 21/09/2026). Se um vídeo contradisser a aula do caderno ou a lei, vale a lei.</p></div>`;
}
function guiaHtmlAntigo(k, mat) {
  const u = ES().un[k], m = ES().mat[mat.id], q = unitByKey(k);
  if (!u) return `<div class="guia"><h2>Guia de estudo</h2><p>O Petrus ainda não escreveu o guia desta unidade. Use o roteiro abaixo com as aulas e a lei seca da matéria e peça para eu montar o guia deste tópico no chat.</p>${roteiroHtml()}${m ? `<div class="aulas">${m.aulas.map(aulaHtml).join('')}</div><div class="row">${m.leis.map(leiBtn).join('')}</div>` : ''}<button class="btn sm" data-act="trainMat" data-m="${esc(mat.nome)}">Treinar questões de ${esc(mat.nome)}</button></div>`;
  return `<div class="guia"><h2>Guia de estudo: ${esc(q.u)}</h2>
    <h4>1. Assista</h4><div class="aulas">${u.aulas.map(aulaHtml).join('')}</div>
    <h4>2. Leia a lei seca no Vade Mecum</h4><div class="row">${u.leis.map(leiBtn).join('')}</div>
    <h4>3. O que fixar (resumo do Petrus, baseado no texto da lei)</h4><ul>${u.pontos.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
    <h4>Pegadinhas [OPINIÃO]</h4><ul>${u.peg.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
    <h4>4. Autoteste: responda sem olhar</h4><ol>${u.auto.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
    <div class="row" style="margin-top:10px"><button class="btn sm" data-act="trainMat" data-m="${esc(mat.nome)}">Treinar questões reais da matéria</button></div>
    <details><summary>Como estudar uma unidade (roteiro)</summary>${roteiroHtml()}</details>
    <p class="tiny">Resumo escrito pelo Petrus a partir da lei do Vade Mecum. Confira os números no texto e a versão em vigor. Vídeos podem mudar de endereço.</p></div>`;
}
function roteiroHtml() { return `<ol class="rot">${ES().como.map(c => `<li><b>${esc(c[0])}</b> ${esc(c[1])}</li>`).join('')}</ol>`; }
function vBookCaderno(id) {
  const isC = id === 'c48', m = isC ? C48 : MAT.find(x => x.id === id);
  if (!m) return '<p>Livro não encontrado.</p>';
  const pages = pagesOf(id);
  if (!curPage[id] || !pages.find(p => p.id === curPage[id])) curPage[id] = pages[0].id;
  const pg = pages.find(p => p.id === curPage[id]);
  const us = isC ? [] : QUEUE.filter(x => x.m.id === id);
  const links = S.links[id] || [];
  const bookNo = isC ? '48' : String(MAT.indexOf(m) + 1);
  const left = `<div class="pg-l grid-paper"><div class="sect">LIVRO</div><div class="numb">${bookNo}</div><div class="nm">${esc(m.nome)}</div>
    ${isC ? '<p class="tiny" style="text-align:center">Caderno geral do exame.</p>' : `<p class="tiny" style="text-align:center">${GRUPO[m.grupo]} · ${us.filter(x => isDone(x.k)).length}/${us.length} unidades</p>`}
    <p style="text-align:center;margin-top:4px"><a href="#/lib" class="tiny">voltar à biblioteca</a></p>
    ${isC ? '' : `<p style="text-align:center"><button class="btn sm" data-act="bkMode" data-id="${id}" data-v="curso">Voltar ao curso</button></p>`}
    ${isC ? '' : `<h2>Conteúdo</h2>${us.map(x => { const s = ust(x.k), pp = pages.find(p => p.unit === x.k);
      return `<div class="it ${pp && pp.id === curPage[id] ? 'cur' : ''}"><button class="chk ${s === 'ok' ? 'ok on' : s === 'rev' ? 'rev on' : ''}" data-act="toggleUnit" data-k="${x.k}" title="Marcar como estudado hoje"></button><span class="t" data-act="openUnit" data-k="${x.k}">${esc(x.u)}</span><span class="st">${s === 'new' ? '' : s === 'ok' ? 'ok' : 'rev'}</span></div>`; }).join('')}`}
    <h2>Páginas</h2>
    ${pages.filter(p => !p.unit).map(p => `<div class="it ${p.id === curPage[id] ? 'cur' : ''}" data-act="page" data-b="${id}" data-p="${p.id}"><span class="t">${esc(p.title || 'Sem título')}</span></div>`).join('')}
    <button class="btn ghost sm" data-act="newPage" data-b="${id}" style="margin-top:8px">+ Nova página</button>
    ${isC || !ES().mat[id] ? '' : `<h2>Aulas sugeridas</h2>${ES().mat[id].aulas.map(aulaHtml).join('')}<div class="row" style="margin-top:6px">${ES().mat[id].leis.map(leiBtn).join('')}</div>`}
    <h2>Minhas videoaulas</h2>
    ${links.map((l, i) => `<div class="it"><a class="t" href="${esc(l.u)}" target="_blank" rel="noopener">${esc(l.t)}</a><span class="st" data-act="delLink" data-b="${id}" data-i="${i}" style="cursor:pointer">x</span></div>`).join('') || '<p class="tiny">Nenhuma ainda.</p>'}
    <form data-form="link" data-b="${id}" style="margin-top:6px"><input name="t" placeholder="Título (ex.: CEISC, aula 1)" required><input name="u" type="url" placeholder="Link do YouTube" required style="margin-top:6px"><button class="btn dk sm" style="margin-top:6px">Salvar link</button></form>
    ${isC ? '' : `<h2>Minha nota na matéria</h2><select data-act="rate" data-id="${id}">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option ${S.rate[id] === n ? 'selected' : ''} value="${n}">${n}</option>`).join('')}<option value="" ${S.rate[id] == null ? 'selected' : ''}>sem nota</option></select>`}
  </div>`;
  const q = pg.unit ? unitByKey(pg.unit) : null, u = pg.unit ? (S.units[pg.unit] || {}) : null, test = (u && u.test) || { ans: '', self: '' };
  const right = `<div class="pg-r">
    <div class="tools">
      <button data-cmd="bold"><b>N</b></button><button data-cmd="underline"><u>S</u></button><button data-cmd="sub">Sublinhar</button>
      ${HLC.map(c => `<button class="sw" data-cmd="hl" data-c="${c}" style="background:${c}" title="Grifar"></button>`).join('')}
      <button data-cmd="nohl">Tirar grifo</button><button data-cmd="ul">Lista</button>
      <button data-cmd="tip">Dica</button><button data-cmd="peg">Pegadinha</button><button data-cmd="lei">Lei seca</button><button data-cmd="esq">Esquema</button><button data-cmd="mapa">Mapa</button><button data-cmd="res">Resumo 1 pág.</button>
      ${SW.map(c => `<button class="sw" data-cmd="postit" data-c="${c}" style="background:${c}" title="Post-it"></button>`).join('')}
      <span class="sp"></span><button data-act="delPage" data-b="${id}" data-p="${pg.id}">Apagar página</button></div>
    ${q ? livroIntro(m, pg.unit.endsWith(':0')) + aulaBox(pg.unit, m) + guiaHtml(pg.unit, m) : ''}
    <div class="sheet"><input id="ptitle" class="pg-title" value="${esc(pg.title)}" placeholder="Título da página">
      <div id="body" class="body" contenteditable="true" spellcheck="true">${pg.html}</div>
      <div class="notes" id="notes">${(pg.notes || []).map(noteHtml).join('')}</div></div>
    ${q ? `<div class="testbox"><h2>Teste do Petrus</h2><p style="font-size:14px">Responda antes de olhar a teoria. Uma pergunta por vez, e se errar, o Petrus reforça o mesmo ponto antes de avançar.</p>
      <ol class="qs"><li>Explique <b>${esc(q.u)}</b> com as suas palavras.</li><li>Qual é a regra e qual é a exceção?</li><li>Que pegadinha a banca poderia armar aqui?</li></ol>
      <textarea id="ans" placeholder="Minha explicação">${esc(test.ans || '')}</textarea>
      <div class="row" style="margin-top:10px"><select id="self" style="width:auto"><option value="">Como me sinto</option><option value="entendi" ${test.self === 'entendi' ? 'selected' : ''}>Entendi</option><option value="parcial" ${test.self === 'parcial' ? 'selected' : ''}>Entendi em parte</option><option value="nao" ${test.self === 'nao' ? 'selected' : ''}>Não entendi</option></select>
      <button class="btn sm" data-act="copyTest" data-k="${pg.unit}">Copiar para o Petrus</button>
      <button class="btn ghost sm" data-act="toErr" data-k="${pg.unit}">Mandar para o caderno de erros</button></div>
      </div>` : ''}
  </div>`;
  return `<div class="top"><div><div class="tiny">Livro</div><h1 style="font-size:clamp(30px,5vw,46px)">${esc(m.nome)}</h1></div><button class="btn ghost sm" data-act="bookCol">${bookCol ? 'Mostrar conteúdo' : 'Esconder conteúdo'}</button></div><div class="open ${bookCol ? 'col1' : ''}">${left}${right}<div class="tabs">${pages.slice(0, 14).map((p, i) => { const tc = TABCOL[i % TABCOL.length]; return `<div class="tab ${p.id === curPage[id] ? 'cur' : ''}" style="background:${tc[0]};color:${tc[1]}" data-act="page" data-b="${id}" data-p="${p.id}" title="${esc(p.title || 'Sem título')}">${i + 1}</div>`; }).join('')}</div></div>`;
}
function noteHtml(n) { return `<div class="note" data-id="${n.id}" data-c="${n.c}" style="left:${n.x}px;top:${n.y}px;background:${n.c}"><div class="h"><span data-act="delNote">x</span></div><div class="tx" contenteditable="true">${esc(n.t || '')}</div></div>`; }
function curPg() { const r = route(); return (S.pages[r.a] || []).find(p => p.id === curPage[r.a]); }
let saveT;
function savePage() {
  const pg = curPg(); if (!pg || !$('#body')) return;
  pg.html = $('#body').innerHTML; pg.title = $('#ptitle').value;
  pg.notes = $$('.note').map(n => ({ id: n.dataset.id, c: n.dataset.c, x: parseInt(n.style.left) || 0, y: parseInt(n.style.top) || 0, t: n.querySelector('.tx').innerText }));
  save();
}
const saveSoon = () => { clearTimeout(saveT); saveT = setTimeout(savePage, 350); };
function bindBook() {
  const body = $('#body'); if (!body) return;
  body.addEventListener('input', saveSoon);
  $('#ptitle').addEventListener('input', () => { saveSoon(); });
  $('#notes').addEventListener('input', saveSoon);
  $$('.tools button').forEach(b => b.addEventListener('mousedown', e => e.preventDefault()));
  const notes = $('#notes'); let drag = null;
  notes.addEventListener('pointerdown', e => { const h = e.target.closest('.h'); if (!h || e.target.closest('[data-act]')) return; const n = h.parentElement, sr = $('.sheet').getBoundingClientRect();
    drag = { n, dx: e.clientX - n.offsetLeft - sr.left, dy: e.clientY - n.offsetTop - sr.top, sr }; h.setPointerCapture(e.pointerId); });
  notes.addEventListener('pointermove', e => { if (!drag) return; drag.n.style.left = clamp(e.clientX - drag.sr.left - drag.dx, 0, drag.sr.width - 120) + 'px'; drag.n.style.top = Math.max(0, e.clientY - drag.sr.top - drag.dy) + 'px'; });
  notes.addEventListener('pointerup', () => { if (drag) { drag = null; savePage(); } });
  const ans = $('#ans'); if (ans) { const r = route(); const k = curPg().unit;
    ans.addEventListener('input', () => { S.units[k] = S.units[k] || {}; S.units[k].test = S.units[k].test || {}; S.units[k].test.ans = ans.value; save(); });
    $('#self').addEventListener('change', e => { S.units[k] = S.units[k] || {}; S.units[k].test = S.units[k].test || {}; S.units[k].test.self = e.target.value; save(); }); }
}
function inBody() { const s = getSelection(); return s.rangeCount && $('#body') && $('#body').contains(s.anchorNode); }
function focusEnd() { const b = $('#body'); b.focus(); const r = document.createRange(); r.selectNodeContents(b); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
function tool(btn) {
  const c = btn.dataset.cmd, body = $('#body');
  if (c === 'postit') { const pg = curPg(), sh = $('.sheet').getBoundingClientRect(), n = { id: uid(), c: btn.dataset.c, x: Math.max(10, sh.width - 190), y: 70 + (pg.notes.length % 5) * 40, t: '' };
    pg.notes.push(n); $('#notes').insertAdjacentHTML('beforeend', noteHtml(n)); savePage(); return; }
  if (!inBody()) { if (['tip', 'peg', 'lei', 'esq', 'mapa', 'res'].includes(c)) focusEnd(); else { toast('Selecione um trecho do texto primeiro.'); return; } }
  document.execCommand('styleWithCSS', false, true);
  if (c === 'bold') document.execCommand('bold');
  else if (c === 'underline') document.execCommand('underline');
  else if (c === 'ul') document.execCommand('insertUnorderedList');
  else if (c === 'hl') document.execCommand('hiliteColor', false, btn.dataset.c);
  else if (c === 'nohl') document.execCommand('hiliteColor', false, 'transparent');
  else if (c === 'sub') { const r = getSelection().getRangeAt(0); if (r.collapsed) { toast('Selecione um trecho primeiro.'); return; }
    const sp = document.createElement('span'); sp.className = 'sub'; sp.appendChild(r.extractContents()); r.insertNode(sp); }
  else if (TPL[c]) { getSelection().collapseToEnd(); document.execCommand('insertHTML', false, TPL[c]); }
  else { const L = { tip: 'Dica', peg: 'Pegadinha', lei: 'Lei seca' }[c]; getSelection().collapseToEnd(); document.execCommand('insertHTML', false, `<div class="${c}"><b>${L}:</b>&nbsp;escreva aqui</div><p><br></p>`); }
  savePage();
}

/* ================== CRONOGRAMA ================== */
function vPlan() {
  const t = today(), P = progress(), f = faseOf(t), dProva = Math.ceil((new Date(CFG.prova) - new Date()) / 864e5);
  const need = P.capAll > 0 ? P.total / P.capAll : 99;
  const sem = [
    ['Segunda', 'Treino 08:00. Estudo 10h às 13h. Tarde: TCC (até 20/10) ou questões.', 'Aulas 18h às 22h', 'Conteúdo novo + revisões + 10 questões'],
    ['Terça', 'Treino 08:00. Estudo 10h às 13h. Tarde: TCC (até 20/10) ou questões.', 'Aulas 18h às 22h', 'Conteúdo novo + revisões + 10 questões'],
    ['Quarta', 'Aula 10:10 às 12:10. Estágio 12h às 16h.', 'Treino 19h. Estudo 20:30 às 22:30', 'Revisões + questões + caderno de erros'],
    ['Quinta', 'Treino 08:00. Estudo 09:30 às 11:30. Estágio 12h às 16h.', 'Aula 18h às 20h', 'Revisões e 10 questões (bloco curto)'],
    ['Sexta', 'Aula virtual 08h às 10h. Treino 10:30. Estudo à tarde (exceto sexta de estágio).', 'Aula 18h às 20h', 'Conteúdo novo + revisões'],
    ['Sábado', 'Estudo 09h às 13h.', 'Treino 19h', 'Conteúdo novo + bateria de 20 questões'],
    ['Domingo', 'Estudo 09h às 13h. Simulado 13h às 18h nas datas marcadas.', 'Livre', 'Revisão semanal, lei seca, ajuste do plano']
  ];
  const hist = Math.min(...[...Object.keys(S.hours)].map(d => d).concat(START));
  return `<div class="top"><div><h1>Crono<em>grama</em></h1><p class="sub">Visão geral do plano (fases e agenda). O cronograma dia a dia do curso, com revisões D1, D2, D7, D14 e D30, está em <a href="#/crono"><b>Cronograma do curso</b></a>.</p></div><a class="btn" href="#/crono" style="text-decoration:none">Abrir o cronograma do curso</a></div>
  <div class="grid g3" style="margin-bottom:16px">
    <div class="card or"><h2>Prazo final</h2><div class="big">${dProva}<small>dias</small></div><p class="tiny" style="margin-top:8px">1ª fase: domingo, 10/01/2027, 13h às 18h.</p></div>
    <div class="card"><h2>Meta mínima</h2><div class="big">2<small>h por dia, todos os dias</small></div><p class="tiny" style="margin-top:8px">Dia ruim: 30 min (D1, D2 e 5 questões). Não zere a sequência.</p></div>
    <div class="card cream"><h2>Cobertura do plano</h2><div class="big">${Math.min(100, Math.round(P.capAll / P.total * 100))}<small>% das unidades como conteúdo novo</small></div><p class="tiny" style="margin-top:8px">${need > 1.05 ? `Para 100% seriam cerca de ${(S.cfg.hWeek * need).toFixed(1)}h por dia útil.` : 'Cobre tudo no ritmo atual.'}</p></div>
  </div>
  <div class="card" style="margin-bottom:16px"><h2>Quanto posso estudar (ajuste)</h2>
    <div class="grid g3"><div><label>Horas por dia útil: <b>${S.cfg.hWeek}h</b></label><input type="range" min="2" max="6" step="0.5" value="${S.cfg.hWeek}" data-cfg="hWeek"></div>
    <div><label>Horas por dia de fim de semana: <b>${S.cfg.hWeekend}h</b></label><input type="range" min="2" max="8" step="0.5" value="${S.cfg.hWeekend}" data-cfg="hWeekend"></div>
    <div><label>Minutos por unidade de conteúdo: <b>${S.cfg.unitMin}</b></label><input type="range" min="45" max="120" step="5" value="${S.cfg.unitMin}" data-cfg="unitMin"></div></div>
    <p class="muted" style="font-size:13px;margin-top:12px">[OPINIÃO] Ideal para o tempo que temos: 2h30 a 3h nos dias úteis e 4h no fim de semana, descontando aulas, estágio e treino. Metade do tempo vai para revisões e questões, o resto para conteúdo novo. Com TCC até 20/10 e as provas P2 e P3, o plano congela conteúdo novo nessas semanas e mantém só revisões e questões.</p></div>
  <div class="card" style="margin-bottom:16px"><h2>Fases até a prova</h2><div class="scroll"><table class="t"><tr><th>Fase</th><th>Período</th><th>Foco</th></tr>
    ${CFG.fases.map(x => `<tr class="${f && f.id === x.id ? 'now' : ''}"><td><b>${esc(x.nome)}</b></td><td>${fmt(x.ini)} a ${fmt(x.fim)}</td><td>${esc(x.foco)}</td></tr>`).join('')}</table></div></div>
  <div class="card" style="margin-bottom:16px"><h2>Ordem de estudo por ciclos (esboço, feita pelo seu diagnóstico)</h2><div class="scroll"><table class="t"><tr><th>Ciclo</th><th>Matérias (sua nota 0 a 10)</th><th>Unidades</th></tr>
    ${[...new Set(MAT.map(m => m.ciclo))].sort((a, b) => a - b).map(c => { const ms = MAT.filter(m => m.ciclo === c);
      return `<tr><td><b>${c === 0 ? 'Primeiro' : c}</b></td><td>${ms.map(m => `${esc(m.nome)} <span class="tiny">(${S.rate[m.id] == null ? '-' : S.rate[m.id]})</span>`).join(' · ')}</td><td>${ms.reduce((s, m) => s + m.unid.length, 0)}</td></tr>`; }).join('')}</table></div>
    <p class="tiny" style="margin-top:8px">[OPINIÃO] Ética primeiro (matéria obrigatória e a mais fraca), depois as matérias de nota baixa, e as fortes (Civil, Processo Civil, Empresarial, Direitos Humanos, Consumidor) ficam para manutenção por questões. Esboço até o Lucas aprovar.</p></div>
  <div class="card" style="margin-bottom:16px"><h2>Ficha de estudo ABCD (como a sua ficha de treino)</h2><div class="scroll"><table class="t"><tr><th>Treino</th><th>Foco</th><th>Próximas unidades</th></tr>
    ${FICHAS.map(fi => { const nx = QUEUE.filter(q => !isDone(q.k) && fi.mats.includes(q.m.id)).slice(0, 2), hoje = fichaDoDia(t) && fichaDoDia(t).id === fi.id;
      return `<tr class="${hoje ? 'now' : ''}"><td><b>${esc(fi.nome)}</b>${hoje ? ' (hoje)' : ''}</td><td>${esc(fi.foco)}</td><td>${nx.length ? nx.map(q => esc(q.u)).join(' · ') : 'concluído'}</td></tr>`; }).join('')}</table></div>
    <p class="tiny" style="margin-top:8px">Os dias giram A, B, C, D, A... A fila de revisões D1/D2/D7/D14/D30 entra em todos os treinos. [OPINIÃO] Ética aparece em dois treinos por ser a matéria mais fraca e obrigatória. Dá para trocar as matérias de cada treino em dados/config.js.</p></div>  <div class="card cream" style="margin-bottom:16px"><h2>Semana-modelo (esboço, sujeito à sua aprovação)</h2><div class="scroll"><table class="t"><tr><th>Dia</th><th>Manhã e tarde</th><th>Noite</th><th>Estudo do dia</th></tr>
    ${sem.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table></div>
    <p class="tiny" style="margin-top:8px">Baseado nos horários da faculdade, estágio (quarta e quinta, 12h às 16h, e uma sexta por mês) e treino. Confirme no diagnóstico.</p></div>
  <div class="grid g2" style="margin-bottom:16px">
    <div class="card"><h2>O que preciso até a prova</h2><div class="list">${CFG.checklist.map(c => `<div><button class="chk ${S.checklist[c.id] ? 'on' : ''}" data-act="ck" data-id="${c.id}"></button><span class="sp" style="${S.checklist[c.id] ? 'opacity:.5;text-decoration:line-through' : ''}">${esc(c.t)}</span><span class="pill ${c.d < t && !S.checklist[c.id] ? 'or' : ''}">${fmt(c.d)}</span></div>`).join('')}</div></div>
    <div class="card"><h2>Método para o tempo que temos</h2><div class="list">
      <div><span class="dot or"></span><span>Questão primeiro, teoria sob demanda, lei seca como base.</span></div>
      <div><span class="dot or"></span><span>Poucas matérias por ciclo, contato frequente.</span></div>
      <div><span class="dot or"></span><span>Revisão espaçada D1, D2, D7, D14, D30, sem reler tudo: lembrar, conferir, 3 a 5 questões.</span></div>
      <div><span class="dot or"></span><span>10 questões por dia. Todo erro e todo acerto no chute vai para o caderno de erros.</span></div>
      <div><span class="dot or"></span><span>Simulado semanal com questões reais, no horário da prova, com correção completa.</span></div>
      <div><span class="dot or"></span><span>Fila de revisão acima de 90 min: reduza o conteúdo novo, nunca as revisões.</span></div></div></div></div>
  <div class="card cream"><h2>Simulados programados</h2><div class="chips">${SIMS.map(s => `<span class="chip ${S.simDone[s.d] ? 'on' : ''}" style="padding:8px 14px">${fmt(s.d)} · ${s.tipo === 'mini' ? 'mini 40' : 'completo 80'}</span>`).join('')}</div>
    <p class="tiny" style="margin-top:10px">Domingos às 13h. Em semana de prova, seminário ou feriado, vira mini-simulado de 40 questões. Prova real do 48º Exame: 10/01/2027.</p></div>`;
}

/* ================== REVISÃO ================== */
function vRev() {
  const t = today(), all = dueItems().filter(i => !i.done), late = all.filter(i => i.due < t), now = all.filter(i => i.due === t), soon = all.filter(i => i.due > t && i.due <= iso(addDays(parse(t), 7)));
  const est = (late.length + now.length) * 8;
  const row = i => { const cls = i.due < t ? 'late' : ''; return `<div><button class="chk" data-act="revDone" data-kind="${i.kind}" data-k="${i.k}" data-o="${i.o}"></button><span class="sp"><b>${esc(i.label)}</b><div class="tiny">${esc(i.sub)} · D${i.o} · ${fmt(i.due)}${i.due < t ? ' · atrasada ' + diffDays(i.due, t) + 'd' : ''}</div></span><span class="chip ${cls}">D${i.o}</span></div>`; };
  return `<div class="top"><div><h1>Revisão <em>do dia</em></h1><p class="sub">Sem reler tudo: 3 minutos de folha em branco, conferir no resumo, 3 a 5 questões.</p></div>
    <span class="pill ${est > 90 ? 'or' : ''}">${late.length + now.length} itens · cerca de ${hm(est)}</span></div>
  ${est > 90 ? '<div class="cobra"><b>A fila passou de 90 minutos.</b><span class="muted">Reduza o conteúdo novo, não as revisões.</span></div>' : ''}
  <div class="grid g2"><div class="card"><h2>Atrasadas (${late.length})</h2><div class="list">${late.map(row).join('') || '<div class="muted">Nada atrasado.</div>'}</div>
    <p class="tiny" style="margin-top:8px">Perdeu uma? Faça no dia em que lembrar e siga a sequência. Não recomece tudo.</p></div>
  <div class="card cream"><h2>Hoje (${now.length})</h2><div class="list">${now.map(row).join('') || '<div class="muted">Nada para hoje.</div>'}</div></div>
  <div class="card" style="grid-column:1/-1"><h2>Próximos 7 dias (${soon.length})</h2><div class="list">${soon.map(row).join('') || '<div class="muted">Nada nos próximos dias. Estude um tópico novo para gerar revisões.</div>'}</div></div></div>
  <p class="tiny" style="margin-top:14px">Em semana de P2 ou P3: só D1, D2 e D7, em modo leve (15 a 30 min). Intervalos exatos são convenção de cursinho; o efeito do espaçamento é bem estudado.</p>`;
}

/* ================== SIMULADOS + QUESTÕES REAIS ================== */
function vSim() {
  const t = today(), next = SIMS.find(s => s.d >= t), hist = S.simulados.slice().sort((a, b) => a.d.localeCompare(b.d));
  const chart = hist.length ? `<svg viewBox="0 0 ${Math.max(300, hist.length * 70)} 170" style="width:100%;max-height:200px">
    <line x1="0" x2="100%" y1="${150 - 50 * 1.3}" y2="${150 - 50 * 1.3}" stroke="#6C151E" stroke-dasharray="4 4"/><text x="4" y="${150 - 50 * 1.3 - 5}" fill="#6C151E" font-size="10">corte 50%</text>
    ${hist.map((h, i) => { const p = h.acertos / h.total * 100; return `<rect x="${i * 70 + 20}" y="${150 - p * 1.3}" width="40" height="${p * 1.3}" rx="8" fill="${p >= 50 ? '#2E6B63' : '#B5535C'}"/><text x="${i * 70 + 40}" y="${145 - p * 1.3}" text-anchor="middle" fill="#2B1416" font-size="11">${Math.round(p)}%</text><text x="${i * 70 + 40}" y="165" text-anchor="middle" fill="#7A5F5A" font-size="10">${fmt(h.d)}</text>`; }).join('')}</svg>` : '<p class="muted">Nenhum simulado registrado ainda.</p>';
  const tm = timer.left, hh = Math.floor(tm / 3600), mm = Math.floor(tm % 3600 / 60), ss = tm % 60;
  const matOpts = MAT.map(m => `<option ${PRESEL === m.nome ? 'selected' : ''}>${esc(m.nome)}</option>`).join('');
  PRESEL = '';
  const exOpts = [...new Set(QR.map(q => q.exame))].map(e => `<option>${esc(e)}</option>`).join('');
  const qs = S.questions, nQR = QR.filter(q => !q.anulada).length, stat = q => { const h = histOf(q); return h.length ? `${h.filter(x => x.ok).length}/${h.length}` : 'nova'; };
  const qDone = allQ().filter(q => histOf(q).length).length;
  let qz = '';
  if (quiz) { const q = allQ().find(x => x.id === quiz.id);
    if (q) qz = `<div class="card cream" style="margin-top:14px"><h2>${q.tipoProva ? 'Questão real verificada · ' : ''}${esc(q.exame || 'Exame')} Exame${q.materia && q.materia !== 'Não classificada' ? ' · ' + esc(q.materia) + (q.materiaFonte ? ' (inferida)' : '') : ''}${q.num ? ' · questão ' + esc(q.num) : ''}${q.tipoProva ? ' · prova tipo ' + q.tipoProva : ''}</h2><p style="line-height:1.6;white-space:pre-wrap">${esc(q.enun)}</p>
      ${['A', 'B', 'C', 'D'].filter(l => q.alts[l]).map(l => `<button class="qopt ${quiz.pick ? (l === q.gab ? 'right' : l === quiz.pick ? 'wrong' : '') : ''}" data-act="pick" data-l="${l}" ${quiz.pick ? 'disabled' : ''}><b>${l})</b> ${esc(q.alts[l])}</button>`).join('')}
      ${quiz.pick ? `<p style="margin:10px 0"><b>${quiz.pick === q.gab ? 'Acertou.' : 'Errou. Gabarito: ' + q.gab + '.'}</b>${q.gabarito ? ` <span class="tiny">(gabarito ${q.gabarito}, conferir no PDF oficial)</span>` : ''}</p><div class="row">${quiz.pick !== q.gab ? `<button class="btn dk sm" data-act="qErr" data-id="${q.id}">Mandar para o caderno de erros</button>` : ''}<button class="btn sm" data-act="qNext">Próxima</button></div>` : '<p class="tiny">Marque o grau de certeza antes de clicar: certo, duvidoso ou chute.</p>'}</div>`; }
  return `<div class="top"><div><h1>Simu<em>lados</em></h1><p class="sub">Questões reais de provas anteriores da FGV. Baixe as provas e os gabaritos oficiais em <a href="https://oab.fgv.br" target="_blank" rel="noopener">oab.fgv.br</a>.</p></div></div>
  <div class="card cream" style="margin-bottom:16px"><h2>Simulado completo de 80 questões</h2><p style="margin:0 0 10px">80 questões reais, com a mesma proporção de matérias da prova, cronômetro de 5 horas e correção só no fim. Meta: <b>${MOCK_META}</b> acertos (o corte é ${MOCK_CORTE}). Os erros vão para o caderno de erros e o tempo conta como estudo.</p>
    <div class="row">${S.mock && !S.mock.done ? `<a class="btn" href="#/mock" style="text-decoration:none">Continuar (${Object.keys(S.mock.ans).length} de 80 respondidas)</a>` : `<button class="btn" data-act="mockNew">Montar e começar</button>`}${S.mock && S.mock.done ? `<a class="btn ghost" href="#/mock" style="text-decoration:none">Ver o último resultado (${S.mock.ok} de 80)</a>` : ''}</div></div>
  <div class="grid g2" style="margin-bottom:16px">
    <div class="card or"><h2>Próximo simulado</h2>${next ? `<div class="big" style="font-size:60px">${fmt(next.d)}<small>${WD[parse(next.d).getDay()]} · ${next.tipo === 'mini' ? 'mini, 40 questões, 2h30' : '80 questões, 13h às 18h'}</small></div>` : '<p>Sem simulados agendados.</p>'}
      <p class="tiny" style="margin-top:12px">Passo a passo: baixe a prova, imprima ou abra sem o gabarito, cronometre, marque o grau de certeza, corrija e passe os erros ao caderno. Depois, 2 horas de correção.</p></div>
    <div class="card"><h2>Cronômetro de 5 horas</h2><div class="timer" id="tmr">${pad(hh)}:${pad(mm)}:${pad(ss)}</div>
      <div class="row" style="margin-top:12px"><button class="btn sm" data-act="tmrGo">${timer.run ? 'Pausar' : 'Iniciar'}</button><button class="btn ghost sm" data-act="tmrReset">Zerar</button></div></div></div>
  <div class="grid g2" style="margin-bottom:16px">
    <div class="card"><h2>Meu histórico</h2>${chart}</div>
    <div class="card cream"><h2>Registrar simulado</h2><form data-form="sim"><div class="row"><input type="date" name="d" value="${t}" required style="flex:1"><select name="tipo" style="flex:1"><option value="80">Completo, 80</option><option value="40">Mini, 40</option></select></div>
      <label>Prova usada (ex.: 47º Exame, caderno de questões)</label><input name="prova" required><div class="row"><div style="flex:1"><label>Acertos</label><input type="number" name="acertos" min="0" max="80" required></div><div style="flex:1"><label>Minutos gastos</label><input type="number" name="min"></div></div>
      <label>Temas em que mais errei</label><input name="temas"><button class="btn dk sm" style="margin-top:12px">Salvar</button></form></div></div>
  <div class="card"><h2>Banco de questões reais (${nQR + qs.length} · ${qDone} já feitas)</h2>
    <p class="muted" style="font-size:13px;margin-bottom:12px">${nQR} questões dos exames 40º a 47º, extraídas dos cadernos oficiais e conferidas com os gabaritos (42º ainda com gabarito preliminar; questões anuladas ficam de fora). A FGV não rotula a matéria no caderno: a matéria de cada questão foi <b>inferida pelo Petrus</b> (posição no molde da prova e tema do enunciado), e uma questão de fronteira pode estar na matéria vizinha. Você também pode colar questões de outras provas abaixo.</p>
    <div class="duebox"><b>${dueQs().length ? dueQs().length + (dueQs().length > 1 ? ' questões' : ' questão') + ' para rever hoje' : 'Nenhuma questão vencida hoje'}</b><span class="tiny">Quem você acertou volta em cerca de 1, 3, 7, 16, 35 e 70 dias, e o prazo se ajusta ao seu acerto na matéria e aos seus erros naquela questão. Quem você errou volta amanhã.</span>${dueQs().length ? '<button class="btn sm" data-act="qDue">Rever agora</button>' : ''}</div>
    <div class="row" style="margin-bottom:12px"><select id="qex" style="max-width:160px"><option value="">Todos os exames</option>${exOpts}</select><select id="qmat" style="max-width:240px"><option value="">Todas as matérias</option><option>Não classificada</option>${matOpts}</select><button class="btn sm" data-act="qStart">Treinar questão</button><span class="tiny">Meta: 10 por dia</span></div>
    ${qIds ? `<div class="duebox"><b>Treino por tema: ${esc(qTema)}</b><span class="tiny">${qIds.size} questões reais deste tema. As próximas vêm só dele.</span><button class="btn ghost sm" data-act="qTemaOff">Sair do tema</button></div>` : ''}
    ${qz}
    <details style="margin-top:14px"><summary style="cursor:pointer;font-weight:700">Adicionar questão real</summary>
      <form data-form="q" style="margin-top:10px"><div class="row"><input name="exame" placeholder="Exame (ex.: 42º)" required style="flex:1"><input name="num" placeholder="Nº" style="max-width:80px"><select name="materia" style="flex:1">${matOpts}</select></div>
      <label>Enunciado</label><textarea name="enun" required></textarea>
      ${['A', 'B', 'C', 'D'].map(l => `<label>Alternativa ${l}</label><input name="alt${l}" required>`).join('')}
      <label>Gabarito oficial</label><select name="gab" style="max-width:120px"><option>A</option><option>B</option><option>C</option><option>D</option></select><br><button class="btn sm" style="margin-top:12px">Salvar questão</button></form></details>
    ${qs.length ? `<div class="scroll" style="margin-top:14px"><table class="t"><tr><th>Exame</th><th>Matéria</th><th>Enunciado</th><th>Acertos</th><th></th></tr>${qs.slice(-15).reverse().map(q => `<tr><td>${esc(q.exame)}${q.num ? ' #' + esc(q.num) : ''}</td><td>${esc(q.materia)}</td><td>${esc(q.enun.slice(0, 70))}...</td><td>${stat(q)}</td><td><button class="btn ghost sm" data-act="delQ" data-id="${q.id}">x</button></td></tr>`).join('')}</table></div>` : ''}</div>`;
}

/* ================== ERROS ================== */
function vErr() {
  const list = S.errors.filter(e => !errFilter || e.tipo === errFilter).slice().reverse();
  const cnt = {}; TIPOS.forEach(x => cnt[x] = S.errors.filter(e => e.tipo === x).length);
  const matOpts = MAT.map(m => `<option>${esc(m.nome)}</option>`).join('');
  return `<div class="top"><div><h1>Caderno <em>de erros</em></h1><p class="sub">Todo erro e todo acerto no chute entra. Cada erro tem as suas próprias revisões D1, D2, D7, D14, D30.</p></div></div>
  <div class="chips" style="margin-bottom:16px"><span class="chip ${!errFilter ? 'on' : ''}" data-act="errF" data-t="">todos ${S.errors.length}</span>${TIPOS.map(x => `<span class="chip ${errFilter === x ? 'on' : ''}" data-act="errF" data-t="${x}">${x} ${cnt[x]}</span>`).join('')}</div>
  <div class="grid g2"><div class="card cream"><h2>Novo erro</h2><form data-form="err"><div class="row"><select name="materia" style="flex:1">${matOpts}</select><select name="tipo" style="flex:1">${TIPOS.map(x => `<option>${x}</option>`).join('')}</select></div>
    <label>Tópico</label><input name="topico" required><label>Enunciado resumido (ou código da prova)</label><input name="enun">
    <div class="row"><div style="flex:1"><label>Minha resposta</label><input name="minha"></div><div style="flex:1"><label>Resposta correta</label><input name="correta"></div></div>
    <label>Regra certa em 1 linha</label><input name="regra" required><label>Pegadinha</label><input name="peg"><button class="btn dk sm" style="margin-top:12px">Salvar erro</button></form></div>
  <div class="card"><h2>${list.length} registros</h2><div class="list">${list.map(e => `<div style="display:block"><div class="row"><b class="sp">${esc(e.topico)}</b><span class="pill">${esc(e.tipo)}</span><button class="btn ghost sm" data-act="delErr" data-id="${e.id}">x</button></div>
    <div class="tiny">${esc(e.materia)} · ${fmt(e.d)}${e.unit && AULA()[e.unit] ? ` · <span class="lk" data-act="bkOpen" data-k="${e.unit}">Ver a aula deste ponto</span>` : ''}</div><div style="font-size:14px;margin:4px 0"><b>Regra:</b> ${esc(e.regra)}</div>${e.peg ? `<div class="tiny">Pegadinha: ${esc(e.peg)}</div>` : ''}
    <div class="chips" style="margin-top:6px">${CFG.revisoes.map(o => `<span class="chip ${e.rev && e.rev[o] ? 'on' : ''} ${!(e.rev && e.rev[o]) && iso(addDays(parse(e.d), o)) < today() ? 'late' : ''}" data-act="revDone" data-kind="e" data-k="${e.id}" data-o="${o}">D${o} · ${fmt(iso(addDays(parse(e.d), o)))}</span>`).join('')}</div></div>`).join('') || '<div class="muted">Nenhum erro ainda. Errar na bateria é bom.</div>'}</div></div></div>`;
}

/* ================== PETRUS ================== */
function vPetrus() {
  const lastH = HIST.length ? HIST.slice().sort((a, b) => b.data.localeCompare(a.data))[0].data : null, lastN = window.C48_NOT_ATUALIZADO;
  const cmds = [['/diagnostico', 'Refaz o diagnóstico e devolve o resumo'], ['/cronograma', 'Monta ou refaz o cronograma'], ['/revisao', 'Gera a fila de revisão do dia'], ['/ajuste', 'Revisão semanal e ajuste do plano'], ['/cansei', 'Protocolo de dia ruim'], ['/conferir', 'Lista o que preciso conferir na fonte']];
  return `<div class="top"><div><h1>Prof. <em>Petrus</em></h1><p class="sub">O professor conversa no chat do Claude. Este app guarda o seu caderno, o seu progresso e as suas anotações.</p></div></div>
  <div class="grid g2">
    <div class="card"><h2>Como o Petrus conduz uma aula</h2><div class="list">
      <div><span class="dot or"></span><span>Primeiro um mapa do tema e a teoria curta, depois pergunta ativa.</span></div>
      <div><span class="dot or"></span><span>Pergunta, espera a sua resposta e confere se você entendeu. Uma questão por vez.</span></div>
      <div><span class="dot or"></span><span>Errou: o ponto vai para o caderno de erros e ganha uma questão de reforço antes de avançar.</span></div>
      <div><span class="dot or"></span><span>Questão real só com origem verificada. Sem comprovação, ele avisa que é questão original de treino.</span></div>
      <div><span class="dot or"></span><span>Nunca cita artigo, súmula ou tema de que não tem certeza: manda conferir na fonte.</span></div></div></div>
    <div class="card cream"><h2>Comandos (clique para copiar)</h2><div class="list">${cmds.map(c => `<div><b>${c[0]}</b><span class="sp muted">${c[1]}</span>${copyBtn(c[0], 'Copiar')}</div>`).join('')}
      <div><b>/bateria matéria</b><span class="sp muted">10 questões originais, sem gabarito</span>${copyBtn('/bateria ', 'Copiar')}</div></div></div>
    ${(S.duvidas || []).length ? `<div class="card cream" style="grid-column:1/-1"><h2>Minhas dúvidas</h2><p class="tiny" style="margin-bottom:8px">Copie a dúvida e cole no chat do Petrus, nesta aba. Marque como resolvida quando entender.</p><div class="list">${S.duvidas.slice().reverse().map(x => `<div style="opacity:${x.ok ? .5 : 1}"><span class="sp"><b>${esc(x.mat)} · ${esc(x.unit)}</b><div class="tiny">${fmt(x.d)} · ${esc(x.t)}</div></span><button class="btn ghost sm" data-act="duvidaCopy" data-id="${x.id}">Copiar</button>${x.ok ? '' : `<button class="btn sm" data-act="duvidaOk" data-id="${x.id}">Resolvida</button>`}</div>`).join('')}</div></div>` : ''}
    <div class="card"><h2>Videoaulas do CEISC</h2><p style="font-size:14px;line-height:1.6">Eu não assisto vídeo do YouTube. Para o Petrus se basear nelas, há três caminhos: (1) cole aqui, em cada livro, o link das aulas, e depois cole no chat a transcrição ou os seus apontamentos; (2) me passe a playlist e eu tento baixar as legendas, se você autorizar a instalação de uma ferramenta; (3) tire os apontamentos da aula no caderno e o Petrus corrige e aprofunda. O Petrus resume com as palavras dele, sem copiar a aula.</p></div>
    <div class="card"><h2>Agentes automáticos</h2><div class="list">
      <div><span class="dot ${lastH ? 'ok' : ''}"></span><span class="sp"><b>petrus-historinhas</b><div class="tiny">Última: ${lastH ? fmt(lastH) : 'nenhuma'}</div></span></div>
      <div><span class="dot ${lastN ? 'ok' : ''}"></span><span class="sp"><b>petrus-noticias</b><div class="tiny">Última: ${lastN ? fmt(lastN) : 'nenhuma'}</div></span></div>
      <div><span class="dot or"></span><span class="sp"><b>petrus-cobranca</b><div class="tiny">Cobra as 2 horas por dia. Lê o progresso.json.</div></span></div></div>
      <p class="tiny" style="margin-top:8px">Envio por e-mail e WhatsApp depende de conector ativo. Veja o LEIA-ME.md.</p></div>
    <div class="card"><h2>Lembretes no navegador</h2><p style="font-size:14px;margin-bottom:10px">Com a página aberta, o app avisa às 12h, 17h, 20h e 21h30 se faltar estudo para as 2 horas do dia.</p>
      <button class="btn sm" data-act="notif">Ativar lembretes</button> <span class="tiny" id="nst">${'Notification' in window ? 'Permissão: ' + Notification.permission : 'Navegador sem suporte'}</span></div>
    <div class="card cream"><h2>Meus dados</h2><p style="font-size:14px;margin-bottom:10px">Este navegador guarda uma cópia. No painel fixado, o progresso também vai para a nuvem do painel e o Petrus lê de lá: <b id="sync">${esc(dbState)}</b>. Faça backup de vez em quando.</p>
      <div class="row"><button class="btn sm" data-act="syncNow">Sincronizar agora</button><button class="btn dk sm" data-act="exportProg">Exportar progresso.json</button><button class="btn ghost sm" data-act="exportAll">Backup completo</button><label class="btn ghost sm" style="margin:0;cursor:pointer">Importar backup<input type="file" accept=".json" id="imp" class="hide"></label></div></div>
  </div>`;
}

/* ---------- ações ---------- */
async function download(name, obj) { return downloadText(name, JSON.stringify(obj, null, 2), 'application/json'); }
async function downloadText(name, text, mime) {
  try { const c = window.claude; if (c && c.use) { const d = await c.use('downloads'); if (d) { await d.save({ filename: name, data: text }); return; } } } catch (e) { if (e && e.code === 'declined') return; }
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: mime || 'text/plain' })); a.download = name; a.click(); } catch (e) { toast('Não consegui baixar o arquivo.'); }
}
function copyText(t) {
  const ok = () => toast('Copiado. Cole no chat com o Petrus.');
  const fb = () => { try { const x = document.createElement('textarea'); x.value = t; document.body.appendChild(x); x.select(); document.execCommand('copy'); x.remove(); ok(); } catch (e) { toast('Não consegui copiar.'); } };
  try { navigator.clipboard.writeText(t).then(ok, fb); } catch (e) { fb(); }
}
function addErr(o) { S.errors.push(Object.assign({ id: uid(), d: today(), rev: {} }, o)); save(); }
/* revisão espaçada de questões: acertou em sequência, o intervalo cresce (1, 3, 7, 16, 35, 70 dias); errou, volta para amanhã */
const QINT = [1, 3, 7, 16, 35, 70];
/* o intervalo se ajusta: acerto alto na matéria alonga (x1,3); acerto baixo encurta (x0,7); cada erro naquela questão encurta mais (x0,85 por erro, mínimo x0,5) */
function matAcc() {
  const by = {}; allQ().forEach(q => { const m = q.materia || '', h = histOf(q); by[m] = by[m] || { n: 0, ok: 0 }; h.forEach(x => { by[m].n++; if (x.ok) by[m].ok++; }); });
  return m => { const v = by[m || '']; return v && v.n >= 8 ? v.ok / v.n : null; };
}
function qDueDate(q, acc) {
  const h = histOf(q); if (!h.length) return null;
  const last = h[h.length - 1]; if (!last.ok) return iso(addDays(parse(last.d), 1));
  let n = 0; for (let i = h.length - 1; i >= 0 && h[i].ok; i--) n++;
  const a = acc ? acc(q.materia) : null, lapses = h.filter(x => !x.ok).length;
  const f = clamp((a == null ? 1 : a >= .85 ? 1.3 : a < .6 ? .7 : 1) * Math.pow(.85, lapses), .5, 1.5);
  return iso(addDays(parse(last.d), Math.max(1, Math.round(QINT[Math.min(n - 1, QINT.length - 1)] * f))));
}
const dueQs = () => { const t = today(), acc = matAcc(); return allQ().filter(q => !q.anulada).map(q => [q, qDueDate(q, acc)]).filter(x => x[1] && x[1] <= t).sort((a, b) => a[1].localeCompare(b[1])).map(x => x[0]); };
let qDueOnly = false;
function startQuiz() {
  const mat = $('#qmat') ? $('#qmat').value : '', ex = $('#qex') ? $('#qex').value : '';
  const dq = new Set(dueQs().map(q => q.id));
  const pool = allQ().filter(q => !q.anulada && (!mat || q.materia === mat) && (!ex || q.exame === ex) && (!qDueOnly || dq.has(q.id)) && (!qIds || qIds.has(q.id)));
  if (!pool.length) { toast(qDueOnly ? 'Nenhuma questão vencida hoje.' : 'Nenhuma questão com esse filtro.'); return; }
  pool.sort((a, b) => (dq.has(b.id) - dq.has(a.id)) || (histOf(a).length - histOf(b).length) || (Math.random() - .5));
  quiz = { id: pool[0].id, pick: null };
}
/* ---------- efeitos sonoros (sintetizados no navegador, sem arquivos) ---------- */
const SFX = { ctx: null, last: 0, el: null };
const sfxOn = () => (S.ui || {}).sfx !== false && !(S.ui || {}).rm;
const sfxVol = () => ((S.ui || {}).vol == null ? 40 : Number(S.ui.vol)) / 100;
function sfxCtx() {
  if (!SFX.ctx) { try { SFX.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  try { if (SFX.ctx.state === 'suspended') { const p = SFX.ctx.resume(); if (p && p.catch) p.catch(() => { }); } } catch (e) { }
  return SFX.ctx;
}
function tone(c, f0, f1, dur, type, gain, at) {
  const t0 = c.currentTime + (at || 0), o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}
function sfx(kind) {
  if (!sfxOn()) return; const v = sfxVol(); if (v <= 0) return;
  const now = Date.now(); if (kind === 'hover' && now - SFX.last < 70) return; if (kind === 'hover') SFX.last = now;
  const c = sfxCtx(); if (!c) return;
  if (kind === 'hover') tone(c, 1500, 1800, 0.035, 'sine', 0.05 * v);
  else if (kind === 'click') { tone(c, 620, 360, 0.08, 'sine', 0.2 * v); tone(c, 1240, 720, 0.05, 'triangle', 0.05 * v); }
  else if (kind === 'ok') { tone(c, 660, 660, 0.12, 'sine', 0.2 * v); tone(c, 880, 880, 0.12, 'sine', 0.2 * v, 0.1); tone(c, 1320, 1320, 0.22, 'sine', 0.14 * v, 0.2); }
  else if (kind === 'no') { tone(c, 240, 150, 0.22, 'sawtooth', 0.12 * v); tone(c, 180, 110, 0.26, 'triangle', 0.14 * v, 0.07); }
}
document.addEventListener('mouseover', e => {
  if (!(S.ui || {}).hover || !(window.matchMedia && matchMedia('(hover:hover)').matches)) return;
  const t = e.target.closest && e.target.closest('.btn,.bi,.nav a,.cc,.pl,.sw,.fa,.chip,.fcard,.fq summary,.tabs button,.ltabs button');
  if (!t || t === SFX.el) return; SFX.el = t; sfx('hover');
});
/* menu do perfil (foto no topo) abre ao passar o mouse e fecha ao sair; o clique continua funcionando */
let pfT = null, pfHoverAt = 0;
document.addEventListener('mouseover', e => {
  if (!(window.matchMedia && matchMedia('(hover:hover)').matches) || !e.target.closest) return;
  if (!e.target.closest('.av, .pfm')) return;
  clearTimeout(pfT);
  if (false && e.target.closest('.av')) { pfOpen = true; pfHoverAt = Date.now(); const y = window.scrollY; render(); window.scrollTo(0, y); }
});
document.addEventListener('mouseout', e => {
  if (!pfOpen || !e.target.closest || !e.target.closest('.av, .pfm')) return;
  if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.av, .pfm')) return;
  clearTimeout(pfT); pfT = setTimeout(() => { if (!pfOpen) return; pfOpen = false; const y = window.scrollY; render(); window.scrollTo(0, y); }, 400);
});
let dockY = 0;
window.addEventListener('scroll', () => { const y = window.scrollY, d = document.getElementById('dock'); if (d && window.innerWidth < 900) { if (y > dockY + 6 && y > 120) d.classList.add('hid'); else if (y < dockY - 6) d.classList.remove('hid'); } dockY = y; }, { passive: true });
document.addEventListener('mouseout', e => { if (SFX.el && !(e.relatedTarget && SFX.el.contains(e.relatedTarget))) SFX.el = null; });
document.addEventListener('click', e => { try { if (e.target.closest && e.target.closest('button,a,[data-act],summary')) sfx('click'); } catch (x) { } }, true);
document.addEventListener('click', e => {
  if (pfOpen && !e.target.closest('.pfm') && !e.target.closest('.av')) { pfOpen = false; render(); }
  const ln = e.target.closest('a[href^="#/"]'); if (ln && !ln.dataset.act) { e.preventDefault(); go(ln.getAttribute('href')); return; }
  const tb = e.target.closest('.tools button[data-cmd]'); if (tb) { tool(tb); return; }
  if (document.body.classList.contains('bnav-open') && !e.target.closest('.bhandle') && !e.target.closest('.topbar .mb') && (window.innerWidth < 900 ? true : !e.target.closest('#bnav'))) document.body.classList.remove('bnav-open');
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, d = el.dataset;
  if (a === 'pfToggle') { if (pfOpen && Date.now() - pfHoverAt < 900) return; pfOpen = !pfOpen; render(); return; }
  if (a === 'pfSet') { S.profile = Object.assign({}, prof(), { [d.k]: d.v }); save(); render(); return; }
  if (a === 'pfReset') { S.profile = {}; save(); render(); return; }
  if (a === 'pfGo') { pfOpen = false; go('#/config'); return; }
  if (a === 'vmSel') { vmIdx[d.id] = Number(d.i); if (route().v === 'vade' && route().a === d.id) vmRender(); else go('#/vade/' + d.id); return; }
  if (a === 'vmLido') { const cu = vmCur(); if (cu) { vmSet(cu.L.id, cu.a, { l: !vmMark(cu.L.id, cu.a).l }); vmRender(); } return; }
  if (a === 'vmStar') { const cu = vmCur(); if (cu) { vmSet(cu.L.id, cu.a, { e: !vmMark(cu.L.id, cu.a).e }); vmRender(); } return; }
  if (a === 'vmNext') { const cu = vmCur(); if (cu) { vmSet(cu.L.id, cu.a, { l: true }); vmIdx[cu.L.id] = Math.min(cu.arts.length - 1, cu.i + 1); vmRender(); } return; }
  if (a === 'hqNota') { notaCur = d.id; hqQ = ''; go('#/notas'); return; }
  if (a === 'hqLeis') { vmAllQ = hqQ; hqQ = ''; go('#/vade'); vmRun(); return; }
  if (a === 'mapSel') { mapSel = Number(d.i); render(); return; }
  if (a === 'bookCol') { bookCol = !bookCol; try { localStorage.setItem('c48.bookcol', bookCol ? '1' : '0'); } catch (e) { } render(); return; }
  if (a === 'aulaGo') { AULA_STEP[d.k] = Number(d.i); const bx = document.querySelector('.aula-box'); if (bx) { const q = unitByKey(d.k); bx.outerHTML = aulaBox(d.k, q.m); const nb = document.querySelector('.aula-box'); if (nb) nb.scrollIntoView({ block: 'start' }); } return; }
  if (a === 'duvidaOpen') { const bx = document.getElementById('dvbox'); const h = `<div class="dvf"><textarea id="dvtxt" placeholder="Escreva a sua dúvida com as suas palavras"></textarea><div class="row"><button class="btn sm" data-act="duvidaSend" data-k="${d.k}">Enviar ao Petrus</button><span class="tiny">Copia a pergunta com o contexto e leva você à aba do Petrus.</span></div></div>`; if (bx) { bx.innerHTML = h; document.getElementById('dvtxt').focus(); } else { go('#/config'); } return; }
  if (a === 'duvidaSend') { const t = (document.getElementById('dvtxt') || {}).value || ''; if (!t.trim()) { toast('Escreva a dúvida primeiro.'); return; } const q = unitByKey(d.k), dv = { id: uid(), d: today(), mat: q.m.nome, unit: q.u, t: t.trim(), ok: false }; S.duvidas.push(dv); save(); copyText(duvidaTxt(dv)); go('#/config'); return; }
  if (a === 'duvidaCopy') { const dv = S.duvidas.find(x => x.id === d.id); if (dv) copyText(duvidaTxt(dv)); return; }
  if (a === 'duvidaOk') { const dv = S.duvidas.find(x => x.id === d.id); if (dv) { dv.ok = true; save(); render(); } return; }
  if (a === 'notaNew') { const n = { id: uid(), t: 'Nova nota', x: '', d: today() }; S.notas.unshift(n); notaCur = n.id; save(); render(); const t = document.getElementById('ntitle'); if (t) { t.focus(); t.select(); } return; }
  if (a === 'notaSel') { notaCur = d.id; render(); return; }
  if (a === 'notaDel') { S.notas = S.notas.filter(x => x.id !== d.id); notaCur = null; save(); render(); return; }
  if (a === 'trainMat') { PRESEL = d.m; go('#/sim'); return; }
  if (a === 'vmArt') { const ld = d.id; loadLei(ld).then(() => { const arts = (window.C48_LEIS[ld] || {}).arts || []; const i = d.n ? arts.findIndex(x => String(x.n) === d.n) : 0; vmIdx[ld] = i < 0 ? 0 : i; go('#/vade/' + ld); }); return; }
  if (a === 'vmGo') { const cu = vmCur(); if (cu) { vmIdx[cu.L.id] = clamp(cu.i + Number(d.d), 0, cu.arts.length - 1); vmRender(); } return; }
  if (a === 'vmCopy') { const cu = vmCur(); if (cu) copyText(`Petrus, explique o ${cu.a.n === 'Início' ? 'início' : 'art. ' + cu.a.n} do ${cu.L.curto} em linguagem simples e depois me faça UMA pergunta por vez para conferir se eu entendi (confira o texto na fonte oficial):\n\n${cu.a.t}`); return; }
  if (a === 'leve') { const tt = today(); S.leve = S.leve || {}; S.leve[tt] = !S.leve[tt]; save(); render(); return; }
  if (a === 'cfgSet') { S.ui = S.ui || {}; if (d.k === 'rm') S.ui.rm = d.v === '1'; else if (d.k === 'sfx') S.ui.sfx = d.v === '1'; else if (d.k === 'hover') S.ui.hover = d.v === '1'; else S.ui[d.k] = d.v; applyUi(); save(); render(); return; }
  if (a === 'cfgReset') { S.ui = {}; applyUi(); save(); render(); toast('Configurações restauradas.'); return; }
  if (a === 'pfTema') { S.theme = d.v; applyTheme(); save(); render(); return; }
  if (a === 'pfNoImg') { const q = Object.assign({}, prof()); delete q.img; S.profile = q; save(); render(); return; }
  if (a === 'fGo') { if (FOCO.run) { FOCO.run = false; clearInterval(FOCO.id); focoFlush(); render(); } else { FOCO.run = true; clearInterval(FOCO.id); FOCO.id = setInterval(focoTick, 1000); paintFoco(); } return; }
  if (a === 'fSkip') { focoNext(true); paintFoco(); return; }
  if (a === 'fReset') { clearInterval(FOCO.id); FOCO.run = false; focoFlush(); FOCO.phase = 'estudo'; FOCO.left = FOCO_LEN.estudo; FOCO.acc = 0; render(); return; }
  if (a === 'vidro') { S.vidro = !vidroOn(); applyTheme(); save(); render(); return; }
  if (a === 'bnavToggle' || (a === 'navToggle' && route().v === 'book')) { document.body.classList.toggle('bnav-open'); return; }
  if (a === 'navToggle') { if (navHoverMode()) navPinned = !navPinned; else navHidden = !navHidden; applyNav(); return; }
  if (a === 'navHide') { navHidden = true; navPinned = false; applyNav(); return; }
  if (a === 'navMat') { navMat = !navMat; render(); return; }
  if (a === 'libF') { libFilter = d.f; render(); return; }
  if (a === 'log') { const t = today(); S.hours[t] = Math.max(0, (S.hours[t] || 0) + Number(d.m)); if (Number(d.m) > 0) logSess(Number(d.m)); save(); render(); return; }
  if (a === 'cardShow') { CARD.show = !CARD.show; render(); return; }
  if (a === 'cardMiss') { const dk = cardDeck(), c = dk[CARD.i % dk.length]; dk.splice(Math.min(CARD.i + 4, dk.length), 0, c); CARD.i++; CARD.show = false; render(); return; }
  if (a === 'sfxTest') { setTimeout(() => sfx('ok'), 60); setTimeout(() => sfx('no'), 700); return; }
  if (a === 'cardNext') { CARD.i++; CARD.show = false; render(); return; }
  if (a === 'bkRead') { S.leitura = !S.leitura; save(); render(); return; }
  if (a === 'selDuvida') { const q = unitByKey(BK.k); if (q) { const dv = { id: uid(), d: today(), mat: q.m.nome, unit: q.u, t: 'Trecho: ' + String.fromCharCode(171) + d.t + String.fromCharCode(187) + '. Não entendi este trecho.', ok: false }; S.duvidas.push(dv); save(); copyText(duvidaTxt(dv)); } const sq = document.getElementById('selq'); if (sq) sq.remove(); go('#/config'); return; }
  if (a === 'bkOpen') { logSess(0, d.k); BK.k = d.k; BK.tab = 'aula'; const q = unitByKey(d.k); if (q) go('#/book/' + q.m.id); else render(); return; }
  if (a === 'nlmExport') { const m = MAT.find(x => x.id === d.id); if (m) { downloadText('caderno48-' + m.id + '-notebooklm.md', nlmText(m), 'text/markdown'); toast('Arquivo gerado. Suba como fonte no NotebookLM.'); } return; }
  if (a === 'bkWide') { S.wide = !S.wide; save(); document.body.classList.toggle('wide', !!S.wide); el.classList.toggle('on', !!S.wide); return; }
  if (a === 'ouvir') { const A = AULA()[d.k], sc = A && A.sec[Number(d.i)]; if (sc) { const on = ouvir(sc.t + '.\n' + sc.x, el); el.classList.toggle('on', !!on); el.title = on ? 'Parar leitura' : 'Ouvir esta etapa'; } return; }
  if (a === 'narVel') { const L = [0.85, 0.96, 1.08, 1.2], c = narVel(), nx = L.find(x => x > c + 0.01) || L[0]; S.ui = S.ui || {}; S.ui.vel = nx; save(); el.innerHTML = '<b>' + nx.toFixed(2).replace('.', ',') + 'x</b>'; return; }
  if (a === 'narTeste') { narParar(); ouvir('Olá. Eu sou o Petrus. O artigo sétimo do Estatuto da Advocacia trata das prerrogativas do advogado. Vamos estudar juntos, um passo de cada vez.', null); return; }
  if (a === 'fgvRedo') { if (S.fgvA) delete S.fgvA[d.id]; save(); const el = document.querySelector('.fq[data-id="' + d.id + '"]'); if (el) el.outerHTML = fgvQHtml(d.m, d.id, true); return; }
  if (a === 'fgvAns') { FGVA[d.id] = d.a; const q = qById(d.id); if (q) { addHist(q, d.a === q.gab); setTimeout(() => sfx(d.a === q.gab ? 'ok' : 'no'), 120);
    { const F0 = FGV()[d.m], fd0 = F0 && F0.q[d.id], tm0 = fd0 && F0.temas[fd0.t]; if (tm0) { S.touch = S.touch || {}; S.touch[d.m + ':' + tm0.unit] = today(); } }
    if (d.a !== q.gab && !q.anulada && !S.errors.some(e => e.fid === d.id)) { const F = FGV()[d.m], fd = F && F.q[d.id], tm = fd && F.temas[fd.t], mt = MAT.find(x => x.id === d.m);
      addErr({ fid: d.id, unit: tm ? d.m + ':' + tm.unit : '', materia: mt ? mt.nome : d.m, tipo: 'conceito', topico: (tm ? tm.label + ' · ' : '') + q.exame + ' exame Q' + q.num, enun: q.enun.slice(0, 80), minha: d.a, correta: q.gab, regra: fd ? fd.c : 'Revisar a questão e o fundamento' }); toast('Erro salvo no caderno. Revisões agendadas.'); }
    save(); } const el = document.querySelector('.fq[data-id="' + d.id + '"]'); if (el) el.outerHTML = fgvQHtml(d.m, d.id, true); return; }
  if (a === 'bkResumo') { BK.k = '_resumo'; render(); return; }
  if (a === 'bkBack') { BK.k = null; render(); return; }
  if (a === 'bkTab') { BK.tab = d.t; render(); return; }
  if (a === 'bkStep') { S.bk = S.bk || {}; S.bk[d.k] = Number(d.i); save(); render(); return; }
  if (a === 'bkDone') { if (!isDone(d.k)) { S.units[d.k] = Object.assign(S.units[d.k] || {}, { d: today(), rev: {} }); toast('Aula concluída. Revisões D1, D2, D7, D14 e D30 agendadas'); save(); } BK.tab = 'pratica'; render(); return; }
  if (a === 'bkMode') { BK.mode[d.id] = d.v === 'caderno' ? 'caderno' : 'curso'; render(); return; }
  if (a === 'toggleUnit') { e.stopPropagation(); if (isDone(d.k)) { if (confirm('Desmarcar este tópico? As revisões dele serão apagadas.')) delete S.units[d.k]; } else { S.units[d.k] = Object.assign(S.units[d.k] || {}, { d: today(), rev: {} }); toast('Revisões D1, D2, D7, D14 e D30 agendadas'); } save(); render(); return; }
  if (a === 'openUnit' && AULA()[d.k] && BK.mode[(unitByKey(d.k) || { m: {} }).m.id] !== 'caderno') { BK.k = d.k; BK.tab = 'aula'; go('#/book/' + unitByKey(d.k).m.id); return; }
  if (a === 'openUnit') { const q = unitByKey(d.k), pgs = pagesOf(q.m.id); let p = pgs.find(x => x.unit === d.k);
    if (!p) { p = seedUnit(q.m, q.u); p.unit = d.k; pgs.push(p); save(); } curPage[q.m.id] = p.id; if (route().a === q.m.id && route().v === 'book') render(); else go('#/book/' + q.m.id); return; }
  if (a === 'page') { savePage(); curPage[d.b] = d.p; render(); return; }
  if (a === 'goPage') { curPage[d.b] = d.p; go('#/book/' + d.b); return; }
  if (a === 'newPage') { savePage(); const p = { id: uid(), title: 'Nova página', notes: [], html: '<p><br></p>' }; pagesOf(d.b).push(p); curPage[d.b] = p.id; save(); render(); return; }
  if (a === 'delPage') { if (!confirm('Apagar esta página?')) return; const pgs = pagesOf(d.b); if (pgs.length < 2) { toast('Mantenha ao menos uma página.'); return; } S.pages[d.b] = pgs.filter(p => p.id !== d.p); save(); render(); return; }
  if (a === 'delNote') { el.closest('.note').remove(); savePage(); return; }
  if (a === 'copy') { copyText(decodeURIComponent(d.t)); return; }
  if (a === 'copyTest') { const q = unitByKey(d.k), u = S.units[d.k] || {}, ans = (u.test && u.test.ans) || '';
    copyText(`Petrus, estudei "${q.u}" (${q.m.nome}). Minha explicação com as minhas palavras:\n${ans || '(ainda não escrevi)'}\n\nMe corrija sem enrolar. Faça UMA pergunta por vez para conferir se eu entendi e, se eu errar, reforce o mesmo ponto antes de avançar.`); return; }
  if (a === 'toErr') { const q = unitByKey(d.k); addErr({ materia: q.m.nome, tipo: 'conceito', topico: q.u, enun: 'Teste do Petrus', regra: 'Revisar: ' + q.u }); toast('Adicionado ao caderno de erros'); return; }
  if (a === 'ck') { S.checklist[d.id] = !S.checklist[d.id]; save(); render(); return; }
  if (a === 'revDone') { const o = Number(d.o), obj = d.kind === 'u' ? S.units[d.k] : S.errors.find(x => x.id === d.k); if (obj) { obj.rev = obj.rev || {}; obj.rev[o] = !obj.rev[o]; save(); render(); } return; }
  if (a === 'delErr') { if (confirm('Apagar este erro?')) { S.errors = S.errors.filter(x => x.id !== d.id); save(); render(); } return; }
  if (a === 'errF') { errFilter = d.t; render(); return; }
  if (a === 'delLem') { S.lembretes = S.lembretes.filter(x => x.id !== d.id); save(); render(); return; }
  if (a === 'delLink') { (S.links[d.b] || []).splice(Number(d.i), 1); save(); render(); return; }
  if (a === 'delQ') { S.questions = S.questions.filter(x => x.id !== d.id); save(); render(); return; }
  if (a === 'qStart' || a === 'qNext') { if (a === 'qStart') { qIds = null; qTema = ''; } startQuiz(); render(); return; }
  if (a === 'qTemaOff') { qIds = null; qTema = ''; quiz = null; render(); return; }
  if (a === 'cpTreino') { const t = ((CER.mats[d.m] || {}).temas || [])[Number(d.i)]; if (!t) return; qIds = new Set(t.ids); qTema = t.t; startQuiz(); go('#/sim'); return; }
  if (a === 'cpClone') { qIds = new Set([d.a, d.b]); qTema = 'par de questões parecidas'; startQuiz(); go('#/sim'); return; }
  if (a === 'crFeito') { const k = d.d + '|' + d.i, tk = crTk(), t = window.C48_CRONO.dias[d.d].tarefas[Number(d.i)]; if (tk[k]) delete tk[k]; else tk[k] = today(); if (t && t.k === 'novo' && t.key) { const r = cpRead(); if (tk[k]) r[t.key] = r[t.key] || today(); else delete r[t.key]; } save(); const y = window.scrollY; render(); window.scrollTo(0, y); return; }
  if (a === 'crTreino') { const [mi, bi] = d.k.split(':'), b = ((CURP[mi] || {}).blocos || [])[Number(bi)], ts = (CER.mats[mi] || {}).temas || [], ix = b ? ts.findIndex(x => x.t === b.tema) : -1; if (ix < 0) { toast('Este bloco não tem questões reais ligadas.'); return; } qIds = new Set(ts[ix].ids); qTema = ts[ix].t; startQuiz(); go('#/sim'); return; }
  if (a === 'crBateria') { const ts = (CER.mats[d.m] || {}).temas || [], ids = [].concat(...ts.map(x => x.ids)); for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; } if (!ids.length) { toast('Sem questões para esta matéria.'); return; } qIds = new Set(ids.slice(0, 10)); qTema = 'bateria de ' + crMat(d.m).nome; startQuiz(); go('#/sim'); return; }
  if (a === 'cpLido') { const r = cpRead(); if (r[d.k]) delete r[d.k]; else r[d.k] = today(); save(); const y = window.scrollY; render(); window.scrollTo(0, y); return; }
  if (a === 'cardSrc') { CARD.src = d.s; CARD.deck = null; CARD.i = 0; CARD.show = false; go('#/cards'); return; }
  if (a === 'petrusTalk') { const L = FGVD(); if (!L.length) return; PET.f = (PET.f < 0 ? Math.floor(Date.now() / 864e5) : PET.f) + 1; const pd = document.getElementById('pdica'); if (pd) pd.outerHTML = fgvDicaHtml(PET.f); const c = document.querySelector('.pchar'); if (c) { c.classList.remove('talk'); void c.offsetWidth; c.classList.add('talk'); } return; }
  if (a === 'mockNew') { mockMonta(); go('#/mock'); return; }
  if (a === 'mockGo') { const M = S.mock; if (M) { M.i = clamp(Number(d.i), 0, M.ids.length - 1); M.conf = false; save(); render(); } return; }
  if (a === 'mockPick') { const M = S.mock; if (M && !M.done) { const id = M.ids[M.i]; M.ans[id] = M.ans[id] === d.l ? null : d.l; if (!M.ans[id]) delete M.ans[id]; M.conf = false; save(); render(); } return; }
  if (a === 'mockFim') { const M = S.mock; if (M && !M.done) { if (!M.conf && Object.keys(M.ans).length < M.ids.length) { M.conf = true; render(); } else { mockFecha(); render(); window.scrollTo(0, 0); } } return; }
  if (a === 'mockCancela') { if (S.mock) { S.mock.conf = false; render(); } return; }
  if (a === 'homeTab') { S.homeTab = d.v; save(); render(); return; }
  if (a === 'qDue') { qDueOnly = true; startQuiz(); qDueOnly = false; go('#/sim'); return; }
  if (a === 'dockSearch') { const i = document.getElementById('hq'); if (i) { i.scrollIntoView({ behavior: 'smooth', block: 'center' }); i.focus(); } return; }
  if (a === 'pick') { const q = allQ().find(x => x.id === quiz.id); quiz.pick = d.l; addHist(q, d.l === q.gab); setTimeout(() => sfx(d.l === q.gab ? 'ok' : 'no'), 120); save(); render(); return; }
  if (a === 'qErr') { const q = allQ().find(x => x.id === d.id); addErr({ materia: q.materia, tipo: 'conceito', topico: `${q.exame} exame${q.num ? ' Q' + q.num : ''}${q.tipoProva ? ' (tipo ' + q.tipoProva + ')' : ''}`, enun: q.enun.slice(0, 80), minha: quiz.pick, correta: q.gab, regra: 'Revisar a questão e o fundamento' }); toast('Adicionado ao caderno de erros'); return; }
  if (a === 'tmrGo') { timer.run = !timer.run; if (timer.run) timer.id = setInterval(() => { if (timer.left > 0) timer.left--; else { timer.run = false; clearInterval(timer.id); } const t = $('#tmr'); if (t) t.textContent = `${pad(Math.floor(timer.left / 3600))}:${pad(Math.floor(timer.left % 3600 / 60))}:${pad(timer.left % 60)}`; }, 1000); else clearInterval(timer.id); render(); return; }
  if (a === 'tmrReset') { clearInterval(timer.id); timer = { left: 5 * 3600, run: false, id: null }; render(); return; }
  if (a === 'notif') { if (!('Notification' in window)) return; Notification.requestPermission().then(p => { const s = $('#nst'); if (s) s.textContent = 'Permissão: ' + p; }); return; }
  if (a === 'exportProg') { download('progresso.json', progressObj()); return; }
  if (a === 'syncNow') { if (!DB) { toast('A nuvem só funciona no painel fixado.'); return; } dbLast = {}; dbPush(); toast('Sincronizando...'); return; }
  if (a === 'exportAll') { download('caderno48-backup.json', S); return; }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault();
  const v = Object.fromEntries(new FormData(f)), k = f.dataset.form;
  if (k === 'vmall') { vmAllQ = v.q || ''; vmRun(); return; }
  if (k === 'lem') S.lembretes.push({ id: uid(), d: v.d, t: v.t });
  else if (k === 'link') { (S.links[f.dataset.b] = S.links[f.dataset.b] || []).push({ t: v.t, u: v.u }); }
  else if (k === 'err') addErr({ materia: v.materia, tipo: v.tipo, topico: v.topico, enun: v.enun, minha: v.minha, correta: v.correta, regra: v.regra, peg: v.peg });
  else if (k === 'sim') S.simulados.push({ id: uid(), d: v.d, prova: v.prova, total: Number(v.tipo), acertos: Math.min(Number(v.acertos), Number(v.tipo)), min: v.min, temas: v.temas }), S.simDone[v.d] = true;
  else if (k === 'q') S.questions.push({ id: uid(), exame: v.exame, num: v.num, materia: v.materia, enun: v.enun, alts: { A: v.altA, B: v.altB, C: v.altC, D: v.altD }, gab: v.gab, hist: [] });
  save(); render();
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'sonoin') { S.sono = el.value || '23:00'; save(); render(); return; }
  if (el.id === 'pfimg' && el.files[0]) {
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const s = Math.min(im.width, im.height);
      cv.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) * 0.15, s, s, 0, 0, 256, 256);
      S.profile = Object.assign({}, prof(), { img: cv.toDataURL('image/jpeg', 0.85) }); save(); render(); toast('Imagem do perfil atualizada'); }; im.src = fr.result; };
    fr.readAsDataURL(el.files[0]); return;
  }
  if (el.dataset.cfg) { S.cfg[el.dataset.cfg] = Number(el.value); save(); render(); return; }
  if (el.dataset.act === 'rate') { S.rate[el.dataset.id] = el.value === '' ? null : Number(el.value); save(); return; }
  if (el.id === 'cfgvoz') { S.ui = S.ui || {}; S.ui.voz = el.value; save(); return; }
  if (el.id === 'imp' && el.files[0]) { const r = new FileReader(); r.onload = () => { try { S = Object.assign(defaults(), JSON.parse(r.result)); save(); render(); toast('Backup importado'); } catch (x) { toast('Arquivo inválido'); } }; r.readAsText(el.files[0]); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'bkans' && BK.k) { const k = BK.k; S.units[k] = S.units[k] || {}; S.units[k].test = Object.assign(S.units[k].test || { ans: '', self: '' }, { ans: e.target.value }); clearTimeout(notaT); notaT = setTimeout(save, 500); return; }
  if (e.target.id === 'bknote' && BK.k) { const k = BK.k; S.units[k] = S.units[k] || {}; S.units[k].note = e.target.value; clearTimeout(notaT); notaT = setTimeout(save, 500); return; }
  if (e.target.id === 'hq') { hqQ = e.target.value; const r = document.getElementById('hqres'); if (r) r.innerHTML = hqHtml(hqQ); return; }
  if (e.target.id === 'ntitle' || e.target.id === 'nbody') { const st = document.getElementById('nstat'); if (st) st.textContent = 'Salvando...'; clearTimeout(notaT); notaT = setTimeout(notaSave, 400); return; }
  if (e.target.id === 'vmq') { vmQ = e.target.value; const pos = e.target.selectionStart; render(); const n = $('#vmq'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } return; }
  if (e.target.id === 'vmnote') { const cu = vmCur(); if (cu) { const v = e.target.value; clearTimeout(vmNT); vmNT = setTimeout(() => vmSet(cu.L.id, cu.a, { n: v }), 400); } return; } if (e.target.id === 'q') { searchQ = e.target.value; const pos = e.target.selectionStart; render(); const n = $('#q'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } } });

/* ---------- nuvem (db do painel): o progresso fica onde o Petrus e os agentes conseguem ler ---------- */
let DB = null, dbTimer = null, dbBusy = false, dbLast = {}, dbState = 'só neste navegador';
function progressObj() {
  const N = nota(), P = progress();
  return { geradoEm: new Date().toISOString(), hoje: today(), minutosHoje: minToday(), metaMin: metaHoje(), diaLeve: !!S.leve[today()], treino: (fichaDoDia(today()) || {}).id || null, nivel: nivel().lv, conquistas: Object.keys(S.conq || {}), vade: Object.fromEntries((window.C48_LEIS_IDX || []).map(x => [x.id, { lidos: vmLidos(x.id), total: x.n }])), sequencia: streak(), horas: S.hours, horarios: (() => { const h = horarios(); return { melhorTurno: h.melhor, porTurno: h.tt, sessoes: h.n }; })(), duvidas: (S.duvidas || []).filter(x => !x.ok).map(x => ({ materia: x.mat, tema: x.unit, texto: x.t, data: x.d })), notas: (S.notas || []).length,
    nota: N.nota, unidadesEstudadas: P.done, unidadesTotal: P.total, consolidadas: P.ok, revisoesPendentes: pending().length, erros: S.errors.length, simulados: S.simulados, autoavaliacao: S.rate,
    unidades: Object.fromEntries(Object.entries(S.units).map(([k, u]) => { const q = unitByKey(k); return [k, { materia: q && q.m.nome, topico: q && q.u, estudadoEm: u.d, revisoes: u.rev || {}, auto: u.test && u.test.self || null }]; })) };
}
function dbDocs() {
  const rest = Object.assign({}, S); const pages = rest.pages || {}; delete rest.pages;
  const docs = { 'petrus/estado': rest, 'petrus/resumo': progressObj() };
  Object.keys(pages).forEach(k => { docs['petrus/pag-' + k] = { _t: S._t || 0, pages: pages[k] }; });
  return docs;
}
function dbSoon() { clearTimeout(dbTimer); if (DB) dbTimer = setTimeout(dbPush, 2500); }
async function dbPush() {
  if (!DB) return; if (dbBusy) { dbSoon(); return; }
  dbBusy = true;
  try {
    const docs = dbDocs();
    for (const [p, body] of Object.entries(docs)) {
      const s = JSON.stringify(body), key = p === 'petrus/resumo' ? JSON.stringify(Object.assign({}, body, { geradoEm: 0 })) : s;
      if (dbLast[p] === key) continue;
      if (s.length > 250000) continue;
      await DB.doc(p).set(JSON.parse(s)); dbLast[p] = key;
    }
    dbState = 'nuvem salva às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch (e) { dbState = 'erro ao salvar na nuvem'; }
  dbBusy = false; const el = $('#sync'); if (el) el.textContent = dbState;
}
async function dbInit() {
  try {
    const c = window.claude; if (!c || !c.use) return;
    return;
    const st = await DB.doc('petrus/estado').get(), d = st.exists ? st.data() : null;
    if (d && (d._t || 0) > (S._t || 0)) {
      const keep = S.pages; Object.assign(S, defaults(), d); S.pages = keep || {};
      for (const k of ['c48'].concat(MAT.map(m => m.id))) { const pd = await DB.doc('petrus/pag-' + k).get(); if (pd.exists && pd.data().pages) S.pages[k] = pd.data().pages; }
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
      dbState = 'nuvem carregada'; applyTheme(); render();
    } else { dbState = 'nuvem ligada'; dbPush(); }
    const el = $('#sync'); if (el) el.textContent = dbState;
  } catch (e) { DB = null; dbState = 'só neste navegador'; }
}
/* ---------- lembretes no navegador ---------- */
const sent = {};
setInterval(() => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const n = new Date(), slot = `${today()}-${n.getHours()}`; const marks = { 12: 0, 17: 0, 20: 0, 21: 30 };
  if (n.getHours() in marks && n.getMinutes() >= marks[n.getHours()] && !sent[slot] && minToday() < metaHoje()) {
    sent[slot] = 1; new Notification('Caderno 48', { body: `Hoje: ${hm(minToday())} de ${hm(metaHoje())}. Sem pressa: faltam ${hm(metaHoje() - minToday())}.` }); }
  const [bh, bm] = (S.sono || '23:00').split(':').map(Number), at = bh * 60 + bm - 30, nm = n.getHours() * 60 + n.getMinutes(), sk = `${today()}-sono`;
  if (nm >= at && nm < at + 10 && !sent[sk]) { sent[sk] = 1; new Notification('Caderno 48', { body: `Daqui a 30 minutos é a sua hora de dormir (${S.sono || '23:00'}). Feche o dia com calma.` }); }
}, 60000);

applyTheme();
applyNav();
render();
dbInit();

document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'cfgcolor') { S.ui = S.ui || {}; S.ui.accent = t.value; applyUi(); save(); }
  else if (t.id === 'cfgvol') { S.ui = S.ui || {}; S.ui.vol = Number(t.value); save(); const v = document.getElementById('cfgvolv'); if (v) v.textContent = t.value + '%'; sfx('click'); }
  else if (t.id === 'cfgvel') { S.ui = S.ui || {}; S.ui.vel = Number(t.value); save(); const v = document.getElementById('cfgvelv'); if (v) v.textContent = Number(t.value).toFixed(2).replace('.', ',') + 'x'; }
  else if (t.id === 'cfgfs') { S.ui = S.ui || {}; S.ui.fs = Number(t.value); applyUi(); save(); const v = document.getElementById('cfgfsv'); if (v) v.textContent = t.value + '%'; }
});
/* gesto: arrastar o dedo para a direita puxa o menu; para a esquerda fecha (celular) */
(() => {
  let sx = 0, sy = 0, st = 0;
  document.addEventListener('touchstart', e => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
  document.addEventListener('touchend', e => {
    if (window.innerWidth >= 900) return;
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6 || Date.now() - st > 800) return;
    if (e.target.closest && e.target.closest('textarea,input,[contenteditable],.mapa-svg,.tabs')) return;
    if (route().v === 'book') { if (dx > 0 && sx < 70) document.body.classList.add('bnav-open'); else if (dx < 0) document.body.classList.remove('bnav-open'); return; }
    if (dx > 0 && sx < 70 && navHidden) { navHidden = false; applyNav(); }
    else if (dx < 0 && !navHidden) { navHidden = true; applyNav(); }
  }, { passive: true });
})();
})();
