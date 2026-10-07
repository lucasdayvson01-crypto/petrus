/* PETRUS · efeitos sonoros (v3). Sintetizados na hora (Web Audio), sem arquivos. O líquido e a magia da pílula de rendimento são os
   originais. Os demais sons são notas limpas e curtas (sem ruído de fundo): toque, nota do menu, pop, acerto, erro e troca de tema,
   além de um farfalhar de folha bem leve na biblioteca. Pode ser desligado em Ajustes. */
(function () {
  var P = window.P, S = P.S;
  if (S.set.sound == null) S.set.sound = 'on';
  var ctx = null, master = null, noiseBuf = null, delay = null, wet = null, last = {};
  var PENTA = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33]; /* dó maior pentatônica: nunca desafina */
  function on() { return S.set.sound !== 'off'; }
  function vol() { var v = S.set.vol == null ? 40 : +S.set.vol; return Math.max(0, Math.min(100, v)) / 100 * .9; }
  P.somAplicar = function () { if (master) master.gain.value = vol(); };

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = vol(); var suav = ctx.createBiquadFilter(); suav.type = 'lowpass'; suav.frequency.value = 2400; suav.Q.value = .4; master.connect(suav); suav.connect(ctx.destination);
    var n = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, n, n); var d = noiseBuf.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    /* eco curto, usado só pela magia (como na primeira versão) */
    delay = ctx.createDelay(.6); delay.delayTime.value = .21; var fb = ctx.createGain(); fb.gain.value = .38; wet = ctx.createGain(); wet.gain.value = .5;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(wet); wet.connect(master);
    return ctx;
  }
  function t0() { return ctx.currentTime + .005; }
  function env(g, t, a, peak, dur) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + dur); }
  function tone(type, f1, f2, t, dur, peak, toDelay) {
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f1, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur * .85);
    env(g, t, .008, peak, dur); o.connect(g); g.connect(master); if (toDelay) g.connect(delay); o.start(t); o.stop(t + dur + .05);
  }
  function noise(t, dur, peak, type, f, q, f2) {
    var s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuf; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q || .8;
    env(g, t, .012, peak, dur); s.connect(fl); fl.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + dur + .05);
  }
  /* nota limpa: senoide pura com ataque suave, sem ruído nem eco */
  function nota(f, t, dur, peak, f2) { tone('sine', f, f2 || 0, t, dur, peak); }
  /* gota d'água: senoide que sobe rápido de tom e some, sem nenhum ruído */
  function gota(f, t, peak, dur) {
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.9, t + .085);
    env(g, t, .005, peak, dur || .2); o.connect(g); g.connect(master); o.start(t); o.stop(t + (dur || .2) + .05);
  }

  var SND = {
    /* ---- os dois originais, mantidos ---- */
    bolha: function (t) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(980, t + .13); env(g, t, .01, .12, .2);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + .25); noise(t, .12, .03, 'lowpass', 900, .7);
    },
    liquido: function (t) { SND.bolha(t); tone('sine', 420, 760, t + .09, .12, .06); noise(t, .35, .05, 'bandpass', 700, 1.4, 1500); },
    magia: function (t) {
      var notas = [659, 784, 988, 1175, 1319, 1568, 1976, 2349];
      notas.forEach(function (f, i) { tone(i % 2 ? 'sine' : 'triangle', f * (1 + (Math.random() - .5) * .004), 0, t + .02 + i * .055, .5, .07, true); });
      noise(t, .9, .05, 'highpass', 3000, .5, 9000); tone('sine', 196, 392, t, .5, .08);
    },
    /* ---- sons novos: limpos e curtos ---- */
    tap: function (t) { gota(330, t, .03, .12); },
    nav: function (t) { var f = PENTA[(P.somNota || 0) % 7]; nota(f, t, .26, .07); nota(f * 1.5, t + .05, .18, .025); },
    pop: function (t) { gota(240, t, .06, .2); gota(330, t + .09, .045, .24); },
    ok: function (t) { nota(329.63, t, .24, .07); nota(392, t + .11, .24, .07); nota(523.25, t + .22, .4, .07); },
    erro: function (t) { nota(165, t, .26, .07, 130); nota(123, t + .15, .34, .06, 105); },
    troca: function (t) { var d = document.documentElement.getAttribute('data-mode') === 'dark'; nota(d ? 392 : 261.63, t, .16, .055); nota(d ? 261.63 : 392, t + .11, .26, .055); },
    feche: function (t) { nota(392, t, .16, .05, 300); },
    /* folha: farfalhar leve (um sopro curto e macio, sem chiado agudo) */
    folha: function (t) { var b = [210, 250, 290, 330][Math.floor(Math.random() * 4)]; gota(b, t, .07, .3); gota(b * 1.5, t + .13, .045, .28); gota(b * 1.25, t + .25, .03, .34); },
    folhas: function (t) { gota(190, t, .07, .32); gota(285, t + .11, .055, .3); gota(230, t + .23, .045, .3); gota(340, t + .36, .03, .38); }
  };
  P.som = function (nome) {
    if (!on() || !SND[nome] || vol() <= 0) return; var ag = Date.now(); if (last[nome] && ag - last[nome] < 110) return; last[nome] = ag;
    var c = init(); if (!c) return; try { SND[nome](t0()); } catch (e) { if (window.console) console.warn('som', nome, e && e.message); }
  };
  /* o navegador só libera o áudio depois de um toque: prepara no primeiro gesto */
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, function () { if (on()) init(); }, { passive: true, capture: true }); });

  /* ---------- gatilhos ---------- */
  var lastFolha = 0;
  function folha(n) { lastFolha = Date.now(); P.som(n || 'folha'); }
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    if (t.closest('[data-rend],[data-rpclose],[data-lmgo],[data-lmclose]')) return;
    var rail = t.closest('.rail a'); if (rail) { var as = Array.prototype.slice.call(document.querySelectorAll('.rail a')); P.somNota = Math.max(0, as.indexOf(rail)); return P.som('nav'); }
    if (t.closest('.folder')) return folha('folha');
    if (t.closest('a[href^="#/aula/"], .pg a, .aula-nav a, [data-aula]')) return folha('folha');
    if (t.closest('#theme')) return P.som('troca');
    if (t.closest('.chk, .sw')) return P.som('pop');
    if (t.closest('.qopt')) return; /* o teste decide acerto ou erro */
    if (t.closest('button, .btn, a.card, .tap, .qk, .chip, .wk, a.row, .row.tap')) P.som('tap');
  }, true);
  window.addEventListener('hashchange', function () {
    if (/^#\/(aula|materia)\//.test(location.hash) && Date.now() - lastFolha > 350) folha('folha');
  });
  /* só a pílula de rendimento responde ao passar o mouse (gota de líquido) */
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest && e.target.closest('[data-rend]'); if (t && !(e.relatedTarget && t.contains(e.relatedTarget))) P.som('bolha');
  });
})();
