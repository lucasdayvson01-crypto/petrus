/* PETRUS · efeitos sonoros (v2). Tudo é sintetizado na hora (Web Audio), sem arquivos. Timbres macios: toque de vidro, marimba suave no
   menu, sino de cristal no acerto, folha de papel na biblioteca, gota de líquido e brilho de magia na pílula. Há um eco leve de sala
   e um compressor, para nada estourar nem soar seco. Pode ser desligado em Ajustes. */
(function () {
  var P = window.P, S = P.S;
  if (S.set.sound == null) S.set.sound = 'on';
  var ctx = null, master = null, noiseBuf = null, rev = null, echo = null, last = {};
  var PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093]; /* dó maior pentatônica: nunca desafina */
  function on() { return S.set.sound !== 'off'; }

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC();
    var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .2;
    master = ctx.createGain(); master.gain.value = .6; master.connect(comp); comp.connect(ctx.destination);
    var n = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, n, n); var d = noiseBuf.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    /* sala pequena: resposta ao impulso curta, escurecida */
    var len = Math.floor(ctx.sampleRate * 1.3), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var ch = ir.getChannelData(c); for (var k = 0; k < len; k++) { var e = Math.pow(1 - k / len, 3.2); ch[k] = (Math.random() * 2 - 1) * e * (1 - Math.min(1, k / len * .55)); } }
    rev = ctx.createConvolver(); rev.buffer = ir; var rw = ctx.createGain(); rw.gain.value = .32; rev.connect(rw); rw.connect(master);
    return ctx;
  }
  function t0() { return ctx.currentTime + .006; }
  function env(g, t, a, peak, dur) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + dur); }
  function out(g, wet) { g.connect(master); if (wet) { var s = ctx.createGain(); s.gain.value = wet; g.connect(s); s.connect(rev); } }

  /* nota de vidro/sino: fundamental + parciais, decaimento natural */
  function sino(f, t, dur, peak, wet, bright) {
    var parts = [[1, 1], [2.01, .28 * (bright || 1)], [3.02, .1 * (bright || 1)]];
    parts.forEach(function (p) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * p[0];
      env(g, t, .004, peak * p[1], dur / (p[0] > 1 ? 1.6 : 1)); o.connect(g); out(g, wet); o.start(t); o.stop(t + dur + .05);
    });
  }
  /* nota macia (marimba/madeira): senoide com ataque curtíssimo e filtro */
  function suave(f, t, dur, peak, wet, f2) {
    var o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur * .8);
    lp.type = 'lowpass'; lp.frequency.value = Math.min(5200, f * 4); env(g, t, .006, peak, dur); o.connect(lp); lp.connect(g); out(g, wet); o.start(t); o.stop(t + dur + .05);
  }
  function ruido(t, dur, peak, type, f, q, f2, wet) {
    var s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuf; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q || .8;
    env(g, t, .014, peak, dur); s.connect(fl); fl.connect(g); out(g, wet); s.start(t, Math.random() * .5); s.stop(t + dur + .05);
  }

  var SND = {
    /* toque geral: "tic" de vidro, curto e discreto */
    tap: function (t) { sino(1568, t, .09, .05, .08, .5); ruido(t, .02, .015, 'highpass', 6000, .5); },
    /* menu lateral: marimba suave; cada ícone tem sua nota (guardada em P.somNota) */
    nav: function (t) { var f = PENTA[(P.somNota || 0) % 7]; suave(f, t, .32, .09, .22); suave(f * 2, t, .16, .025, .15); },
    abre: function (t) { ruido(t, .3, .022, 'lowpass', 500, .6, 2400, .15); sino(PENTA[4], t + .05, .4, .03, .3, .4); },
    /* marcar tarefa: bolha que sobe + brilho */
    pop: function (t) { suave(520, t, .13, .08, .1, 980); sino(PENTA[7], t + .05, .3, .04, .25, .6); },
    folha: function (t) { /* folha de papel: sopro grave e macio, sem chiado agudo */
      ruido(t, .3, .12, 'bandpass', 2600, .7, 1500, .08); ruido(t + .03, .22, .07, 'bandpass', 1800, .6, 1100);
      for (var i = 0; i < 4; i++) ruido(t + .06 + i * .05 + Math.random() * .018, .05, .04, 'bandpass', 2600 + Math.random() * 1000, 1.1);
    },
    folhas: function (t) { SND.folha(t); SND.folha(t + .19); },
    bolha: function (t) { suave(300, t, .16, .07, .2, 760); ruido(t, .1, .012, 'lowpass', 800, .6); },
    liquido: function (t) { SND.bolha(t); suave(430, t + .11, .16, .05, .25, 820); ruido(t, .4, .03, 'bandpass', 700, 1.2, 1500, .15); },
    /* magia: sinos de cristal subindo na pentatônica, com cauda de sala e um leve "ar" */
    magia: function (t) {
      [5, 6, 7, 8, 9, 10].forEach(function (n, i) { sino(PENTA[n], t + .02 + i * .075, .9, .06 - i * .004, .55, 1); });
      sino(PENTA[2] / 2, t, .7, .07, .35, .4); ruido(t, .9, .018, 'highpass', 4500, .5, 9000, .4);
    },
    feche: function (t) { sino(PENTA[7], t, .35, .05, .4, .5); sino(PENTA[4], t + .08, .45, .05, .4, .5); },
    ok: function (t) { sino(PENTA[2], t, .5, .09, .4, .8); sino(PENTA[5], t + .11, .7, .09, .45, .8); },
    erro: function (t) { suave(196, t, .3, .1, .12, 130); suave(147, t + .02, .34, .07, .1, 110); },
    troca: function (t) { var d = document.documentElement.getAttribute('data-mode') === 'dark'; sino(PENTA[d ? 5 : 2], t, .3, .06, .3, .6); sino(PENTA[d ? 2 : 5], t + .09, .4, .06, .3, .6); }
  };
  P.som = function (nome) {
    if (!on() || !SND[nome]) return; var ag = Date.now(); if (last[nome] && ag - last[nome] < 110) return; last[nome] = ag;
    var c = init(); if (!c) return; try { SND[nome](t0()); } catch (e) { if (window.console) console.warn('som', nome, e && e.message); }
  };
  /* o navegador só libera o áudio depois de um toque: prepara no primeiro gesto */
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, function () { if (on()) init(); }, { passive: true, capture: true }); });

  /* ---------- gatilhos ---------- */
  var lastFolha = 0, lastAbre = 0;
  function folha(n) { lastFolha = Date.now(); P.som(n || 'folha'); }
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    if (t.closest('[data-rend],[data-rpclose],[data-lmgo],[data-lmclose]')) return;
    var rail = t.closest('.rail a'); if (rail) { var as = Array.prototype.slice.call(document.querySelectorAll('.rail a')); P.somNota = Math.max(0, as.indexOf(rail)); return P.som('nav'); }
    if (t.closest('.folder')) return folha('folhas');
    if (t.closest('a[href^="#/aula/"], .pg a, .aula-nav a, [data-aula]')) return folha('folha');
    if (t.closest('#theme')) return P.som('troca');
    if (t.closest('.chk, .sw')) return P.som('pop');
    if (t.closest('.qopt')) return; /* o teste decide acerto ou erro */
    if (t.closest('button, .btn, a.card, .tap, .qk, .chip, .wk, a.row, .row.tap')) P.som('tap');
  }, true);
  window.addEventListener('hashchange', function () {
    if (/^#\/(aula|materia)\//.test(location.hash) && Date.now() - lastFolha > 350) folha('folha');
  });
  /* o menu lateral em pílula abre ao passar o mouse: um sopro suave, no máximo a cada 2 s */
  document.addEventListener('mouseover', function (e) {
    var r = e.target.closest && e.target.closest('.rail'); if (r && !(e.relatedTarget && r.contains(e.relatedTarget)) && Date.now() - lastAbre > 2000) { lastAbre = Date.now(); P.som('abre'); }
    var t = e.target.closest && e.target.closest('[data-rend]'); if (t && !(e.relatedTarget && t.contains(e.relatedTarget))) P.som('bolha');
  });
})();
