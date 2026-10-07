/* PETRUS · efeitos sonoros. Tudo é sintetizado na hora (Web Audio), sem arquivos: toque suave, folha de papel na biblioteca,
   bolha de líquido na pílula de rendimento e brilho de magia quando ela abre. Pode ser desligado em Ajustes. */
(function () {
  var P = window.P, S = P.S;
  if (S.set.sound == null) S.set.sound = 'on';
  var ctx = null, master = null, noiseBuf = null, delay = null, last = {};
  function on() { return S.set.sound !== 'off'; }
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination);
    var n = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, n, n); var d = noiseBuf.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    /* eco curto para o brilho de magia */
    delay = ctx.createDelay(.6); delay.delayTime.value = .21; var fb = ctx.createGain(); fb.gain.value = .38, wet = ctx.createGain(); wet.gain.value = .5;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(wet); wet.connect(master);
    return ctx;
  }
  var wet;
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
  var SND = {
    tap: function (t) { tone('sine', 560, 400, t, .07, .07); },
    pop: function (t) { tone('sine', 640, 1050, t, .1, .1); tone('triangle', 1280, 1500, t + .02, .06, .03); },
    folha: function (t) { /* folha de papel: sopro de ruído filtrado com tremor */
      noise(t, .26, .17, 'bandpass', 3600, .9, 2200); noise(t + .02, .2, .12, 'highpass', 5200, .6, 3200);
      for (var i = 0; i < 4; i++) noise(t + .05 + i * .045 + Math.random() * .015, .05, .07, 'bandpass', 4200 + Math.random() * 1600, 1.2);
    },
    folhas: function (t) { SND.folha(t); SND.folha(t + .17); },
    bolha: function (t) { /* gota de líquido */
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(980, t + .13); env(g, t, .01, .12, .2);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + .25); noise(t, .12, .03, 'lowpass', 900, .7);
    },
    liquido: function (t) { SND.bolha(t); tone('sine', 420, 760, t + .09, .12, .06); noise(t, .35, .05, 'bandpass', 700, 1.4, 1500); },
    magia: function (t) { /* arpejo brilhante com eco + varredura de brilho */
      var notas = [659, 784, 988, 1175, 1319, 1568, 1976, 2349];
      notas.forEach(function (f, i) { tone(i % 2 ? 'sine' : 'triangle', f * (1 + (Math.random() - .5) * .004), 0, t + .02 + i * .055, .5, .07, true); });
      noise(t, .9, .05, 'highpass', 3000, .5, 9000); tone('sine', 196, 392, t, .5, .08);
    },
    feche: function (t) { tone('sine', 880, 330, t, .22, .07, true); noise(t, .25, .03, 'bandpass', 2400, 1, 800); },
    ok: function (t) { tone('triangle', 659, 0, t, .22, .09, true); tone('triangle', 988, 0, t + .09, .3, .09, true); },
    erro: function (t) { tone('sawtooth', 200, 140, t, .24, .05); tone('sine', 150, 110, t, .26, .1); },
    troca: function (t) { tone('sine', 520, 0, t, .09, .07); tone('sine', 780, 0, t + .07, .12, .07); }
  };
  P.som = function (nome) {
    if (!on() || !SND[nome]) return; var ag = Date.now(); if (last[nome] && ag - last[nome] < 90) return; last[nome] = ag;
    var c = init(); if (!c) return; try { SND[nome](t0()); } catch (e) {}
  };
  P.somVol = function () { return S.set.sound !== 'off'; };
  /* o navegador só libera o áudio depois de um toque: prepara no primeiro gesto */
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, function () { if (on()) init(); }, { once: false, passive: true, capture: true }); });

  /* ---------- gatilhos gerais ---------- */
  var lastFolha = 0;
  function folha(n) { lastFolha = Date.now(); P.som(n || 'folha'); }
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    if (t.closest('[data-rend],[data-rpclose]')) return; /* a pílula toca o próprio som */
    if (t.closest('.folder')) return folha('folhas');
    if (t.closest('a[href^="#/aula/"], .pg a, .aula-nav a, [data-aula]')) return folha('folha');
    if (t.closest('#theme')) return P.som('troca');
    if (t.closest('.chk, .sw')) return P.som('pop');
    if (t.closest('.qopt')) return; /* o teste decide acerto ou erro */
    if (t.closest('button, .btn, a.card, .tap, .rail a, .qk, .chip, .wk, a.row, .row.tap')) P.som('tap');
  }, true);
  window.addEventListener('hashchange', function () {
    if (/^#\/(aula|materia)\//.test(location.hash) && Date.now() - lastFolha > 350) folha('folha');
  });
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest && e.target.closest('[data-rend]'); if (!t || (e.relatedTarget && t.contains(e.relatedTarget))) return;
    P.som('bolha');
  });
})();
