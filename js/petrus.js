/* Petrus 2D: personagem flat animado (olhos seguem o mouse, humores, piscar), sala de aula com a dúvida enviada ao Claude e o medidor de velocidade da voz. */
(function () {
  'use strict';
  var uid = 0;
  var MOUTH = {
    happy: 'M44 62 Q50 67 56 62',
    sad: 'M45 64.5 Q50 60.5 55 64.5',
    wow: 'M47.4 62 Q50 68.4 52.6 62 Q50 59.4 47.4 62Z',
    smirk: 'M44.5 63.4 Q51 66.4 56.8 60.8'
  };
  var BROW = {
    happy: ['rotate(0 42 36)', 'rotate(0 58 36)'],
    sad: ['translate(0 1.2) rotate(-14 42 36)', 'translate(0 1.2) rotate(14 58 36)'],
    wow: ['translate(0 -2.6)', 'translate(0 -2.6)'],
    smirk: ['rotate(0 42 36)', 'translate(0 -1.8) rotate(-8 58 36)']
  };
  window.PETRUS_AV = function () {
    var k = 'p' + (++uid);
    return '<svg class="pt" data-mood="happy" viewBox="0 0 100 100" role="img" aria-label="Petrus, o professor">' +
      '<defs><clipPath id="' + k + '"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#' + k + ')">' +
      '<rect width="100" height="100" fill="#D6EEDF"/>' +
      '<path d="M4 100C6 85 24 79 50 79S94 85 96 100Z" fill="#7FA582"/>' +
      '<path d="M41 79L50 91L59 79Z" fill="#F7F3EA"/>' +
      '<rect x="44" y="65" width="12" height="15" rx="4.5" fill="#E3AD88"/>' +
      '<path d="M50 82L41.5 78V86Z M50 82L58.5 78V86Z" fill="#E4772B"/><rect x="47.6" y="79.6" width="4.8" height="5.4" rx="1.6" fill="#C85E16"/>' +
      '<ellipse cx="31" cy="48" rx="3" ry="4.4" fill="#E8B692"/><ellipse cx="69" cy="48" rx="3" ry="4.4" fill="#E8B692"/>' +
      '<ellipse cx="50" cy="46" rx="19" ry="23" fill="#F2C6A2"/>' +
      '<path d="M31 48C31 64 39 72 50 72C61 72 69 64 69 48C66 56 61 58 50 58C39 58 34 56 31 48Z" fill="#3A251A"/>' +
      '<g fill="#2E1B12"><path d="M31 43C29 27 38 21 50 21C62 21 71 27 69 43C67 34 62 30 50 30C38 30 33 34 31 43Z"/><circle cx="36" cy="25" r="5.2"/><circle cx="44.5" cy="21" r="5.6"/><circle cx="54" cy="20.5" r="5.6"/><circle cx="62.5" cy="24" r="5.2"/><circle cx="68" cy="31" r="4.4"/><circle cx="32" cy="32" r="4.4"/></g>' +
      '<circle cx="37" cy="52.5" r="3.4" fill="#F28C7E" opacity=".28"/><circle cx="63" cy="52.5" r="3.4" fill="#F28C7E" opacity=".28"/>' +
      '<ellipse cx="50" cy="50.6" rx="3" ry="2.5" fill="#E1A483"/>' +
      '<path d="M41 56.4Q50 52 59 56.4Q54 60.2 50 57.4Q46 60.2 41 56.4Z" fill="#2E1B12"/>' +
      '<g class="pt-eyeL"><ellipse cx="42" cy="44" rx="3.9" ry="4.3" fill="#FFFFFF"/><circle class="pt-pupil" cx="42" cy="44.2" r="2" fill="#2A1910"/></g>' +
      '<g class="pt-eyeR"><ellipse cx="58" cy="44" rx="3.9" ry="4.3" fill="#FFFFFF"/><circle class="pt-pupil" cx="58" cy="44.2" r="2" fill="#2A1910"/></g>' +
      '<g fill="none" stroke="#2A1910" stroke-width="1.5" stroke-linecap="round"><circle cx="42" cy="44" r="6.6"/><circle cx="58" cy="44" r="6.6"/><path d="M48.6 43.4Q50 42.2 51.4 43.4"/><path d="M35.4 43.4L31.4 42.4M64.6 43.4L68.6 42.4"/></g>' +
      '<path class="pt-browL" d="M37 36.8Q42 34.2 47 36.8" fill="none" stroke="#2A1910" stroke-width="1.9" stroke-linecap="round"/>' +
      '<path class="pt-browR" d="M53 36.8Q58 34.2 63 36.8" fill="none" stroke="#2A1910" stroke-width="1.9" stroke-linecap="round"/>' +
      '<path class="pt-mouth" d="' + MOUTH.happy + '" fill="none" stroke="#F3D9C7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</g></svg>';
  };

  var mood = 'happy', moodUntil = 0, lastX = null, lastY = null;
  var HERO = { radiante: 'happy', contente: 'happy', atento: 'smirk', preocupado: 'sad', triste: 'sad', bravo: 'sad' };
  function applyMood(s, m) {
    s.setAttribute('data-mood', m);
    var mo = s.querySelector('.pt-mouth'); if (mo) { mo.setAttribute('d', MOUTH[m] || MOUTH.happy); mo.setAttribute('fill', m === 'wow' ? '#7A3A2E' : 'none'); }
    var bl = s.querySelector('.pt-browL'), br = s.querySelector('.pt-browR'); var b = BROW[m] || BROW.happy;
    if (bl) bl.setAttribute('transform', b[0]); if (br) br.setAttribute('transform', b[1]);
    var er = s.querySelector('.pt-eyeR'); if (er) er.setAttribute('transform', m === 'smirk' ? 'translate(0 30.8) scale(1 .3)' : '');
    s.classList.remove('pt-pop'); void s.getBoundingClientRect(); if (m !== 'happy') s.classList.add('pt-pop');
  }
  function heroMood(s) { var h = s.closest && s.closest('.petrus-hero'); if (!h) return null; var k = (h.className.match(/m-(\w+)/) || [])[1]; return HERO[k] || 'happy'; }
  function setMood(m, ms) {
    mood = m; moodUntil = ms ? Date.now() + ms : 0;
    [].forEach.call(document.querySelectorAll('svg.pt'), function (s) { var hm = heroMood(s); applyMood(s, hm || m); });
  }
  /* o Petrus da tela inicial reflete como estão os estudos (radiante, contente, atento, preocupado, triste) */
  setInterval(function () { [].forEach.call(document.querySelectorAll('.petrus-hero svg.pt'), function (s) { var hm = heroMood(s); if (hm && s.getAttribute('data-mood') !== hm) applyMood(s, hm); }); }, 600);  window.PETRUS_MOOD = setMood;

  function look() {
    if (lastX == null) return;
    [].forEach.call(document.querySelectorAll('svg.pt'), function (s) {
      var r = s.getBoundingClientRect(); if (!r.width) return;
      var cx = r.left + r.width / 2, cy = r.top + r.height * 0.44, dx = lastX - cx, dy = lastY - cy, d = Math.sqrt(dx * dx + dy * dy) || 1;
      var m = Math.min(1.7, d / 70), ox = dx / d * m, oy = dy / d * m * 0.8;
      [].forEach.call(s.querySelectorAll('.pt-pupil'), function (p) { p.setAttribute('transform', 'translate(' + ox.toFixed(2) + ' ' + oy.toFixed(2) + ')'); });
    });
  }
  document.addEventListener('pointermove', function (e) { lastX = e.clientX; lastY = e.clientY; look(); }, { passive: true });

  /* piscar e humor: feliz na maior parte do tempo, às vezes triste, surpreso ou com uma piscadela */
  function blink() {
    [].forEach.call(document.querySelectorAll('svg.pt .pt-eyeL, svg.pt .pt-eyeR'), function (g) {
      if (mood === 'smirk' && g.getAttribute('class') === 'pt-eyeR') return;
      g.style.transformOrigin = '50% 44%'; g.style.transformBox = 'fill-box'; g.style.transition = 'transform .08s'; g.style.transform = 'scaleY(.12)';
      setTimeout(function () { g.style.transform = ''; }, 120);
    });
    setTimeout(blink, 2600 + Math.random() * 3800);
  }
  setTimeout(blink, 2200);
  function wander() {
    if (!moodUntil || Date.now() > moodUntil) {
      var r = Math.random();
      if (mood !== 'happy') setMood('happy');
      else if (r < .28) setMood('sad', 2600);
      else if (r < .5) setMood('wow', 1700);
      else if (r < .7) setMood('smirk', 1900);
    }
    setTimeout(wander, 7000 + Math.random() * 7000);
  }
  setTimeout(wander, 6000);
  document.addEventListener('mouseover', function (e) { if (e.target.closest && e.target.closest('.whob .av')) { setMood('wow', 900); setTimeout(function () { setMood('happy', 0); }, 900); } });

  /* utilidades */
  function toast(t) { var e = document.createElement('div'); e.className = 'toast'; e.textContent = t; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 3200); }
  function contexto() { var t = (document.querySelector('.lstep h2, .chero h1, .top h1') || {}).textContent || ''; return { t: t.trim() }; }

  /* sala de aula */
  function closePetrus() { var m = document.getElementById('ptm'); if (m) { m.classList.remove('on'); setTimeout(function () { m.remove(); }, 260); } setMood('happy'); }
  function openPetrus() {
    if (document.getElementById('ptm')) return;
    setMood('happy');
    var m = document.createElement('div'); m.id = 'ptm'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Sala de aula do Petrus');
    m.innerHTML = '<div class="ptc"><button class="ptx" aria-label="Fechar">×</button><div class="ptt"><div class="ptav">' + window.PETRUS_AV() + '</div><h3>Oi, eu sou o Petrus.</h3><p>Qual é a sua dúvida? Escreva do seu jeito. Eu abro uma conversa com o Claude, já com o contexto de onde você está estudando.</p><textarea id="ptq" rows="4" placeholder="Ex.: não entendi a diferença entre incompatibilidade e impedimento"></textarea><div class="ptb"><button class="ptgo" id="ptgo">Tirar dúvida no Claude</button><button class="ptno" id="ptno">Agora não</button></div><small>Abre em uma nova aba. Confira sempre a lei e o edital.</small></div></div>';
    document.body.appendChild(m);
    requestAnimationFrame(function () { m.classList.add('on'); });
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('.ptx') || e.target.id === 'ptno') closePetrus(); });
    document.getElementById('ptgo').addEventListener('click', function () {
      var q = (document.getElementById('ptq').value || '').trim(); if (!q) { toast('Escreva a dúvida primeiro.'); document.getElementById('ptq').focus(); return; }
      var c = contexto();
      var p = 'Atue como Petrus, professor de cursinho para o Exame de Ordem (OAB). Estou estudando para o 48º Exame (1ª fase em 10/01/2027).' + (c.t ? ' Estou na parte: "' + c.t + '".' : '') + '\n\nMinha dúvida: ' + q + '\n\nExplique do zero, em linguagem simples, e depois me faça UMA pergunta por vez para conferir se entendi. Não invente artigo, súmula ou número: se não tiver certeza, diga "confira na lei".';
      try { if (navigator.clipboard) navigator.clipboard.writeText(p); } catch (e) { }
      var w = window.open('https://claude.ai/new?q=' + encodeURIComponent(p), '_blank', 'noopener');
      toast(w ? 'Abri o Claude. O texto também foi copiado.' : 'Texto copiado. Abra claude.ai e cole.');
      closePetrus();
    });
    setTimeout(function () { var q = document.getElementById('ptq'); if (q) q.focus(); }, 300);
  }
  document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-act="petrusOpen"]'); if (t) { e.preventDefault(); e.stopPropagation(); openPetrus(); } }, true);

  /* medidor de velocidade da voz */
  function closeVel() { var p = document.getElementById('vpop'); if (p) p.remove(); }
  function fmt(v) { return Number(v).toFixed(2).replace('.', ',') + 'x'; }
  function vozHtml() {
    var Z = window.PETRUS_VOZ; if (!Z) return '';
    var l = Z.list(); if (!l.length) return '<div class="vpz"><small>Este navegador não tem voz em português. Abra no Edge, Chrome ou Safari.</small></div>';
    var cur = Z.get(), has = l.some(function (x) { return x.nat; });
    return '<div class="vpz"><label for="vps">Voz</label><select id="vps">' + l.map(function (x) { return '<option value="' + esc2(x.id) + '"' + (x.id === cur ? ' selected' : '') + '>' + esc2(x.name) + (x.nat ? ' · natural' : '') + '</option>'; }).join('') + '</select>' + (has ? '' : '<small>Para uma voz mais natural, abra no Edge (Windows) ou no Safari (iPhone).</small>') + '</div>';
  }
  function esc2(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function openVel(btn) {
    closeVel();
    var V = window.PETRUS_VEL; if (!V) return;
    var cur = V.get(), p = document.createElement('div'); p.id = 'vpop';
    p.innerHTML = '<div class="vph"><span>Velocidade da voz</span><b id="vpv">' + fmt(cur) + '</b></div><input id="vpr" type="range" min="0.7" max="1.4" step="0.02" value="' + cur + '" aria-label="Velocidade da voz"><div class="vpl"><span>Lenta</span><span>Normal</span><span>Rápida</span></div>' + vozHtml();
    document.body.appendChild(p);
    var r = btn.getBoundingClientRect(), w = p.offsetWidth, left = Math.max(12, Math.min(innerWidth - w - 12, r.left - 8));
    p.style.left = left + 'px'; p.style.top = (r.bottom + 10) + 'px';
    requestAnimationFrame(function () { p.classList.add('on'); });
    var rg = document.getElementById('vpr'), pv = document.getElementById('vpv');
    function fill() { var pc = (rg.value - rg.min) / (rg.max - rg.min) * 100; rg.style.background = 'linear-gradient(90deg,#2F8F6B ' + pc + '%,rgba(15,34,23,.14) ' + pc + '%)'; }
    fill();
    var vs = document.getElementById('vps'); if (vs) vs.addEventListener('change', function () { window.PETRUS_VOZ.set(vs.value); });
    rg.addEventListener('input', function () { var v = Math.round(Number(rg.value) * 100) / 100; V.set(v); pv.textContent = fmt(v); btn.innerHTML = '<b>' + fmt(v) + '</b>'; fill(); });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-act="narVel"]');
    if (b) { e.preventDefault(); e.stopPropagation(); if (document.getElementById('vpop')) closeVel(); else openVel(b); return; }
    if (!(e.target.closest && e.target.closest('#vpop'))) closeVel();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closePetrus(); closeVel(); } });
  window.addEventListener('hashchange', closeVel);
  window.PETRUS_OPEN = openPetrus;
})();
