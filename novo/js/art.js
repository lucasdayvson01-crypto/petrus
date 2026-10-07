/* PETRUS · ilustracao 2D gerada em codigo (camadas planas estilo Coreetz/Loch/Segesta).
   PArt.scene({hue, seed, kind, mini, figure}) devolve um <svg class="art"> com camadas .ly[data-d] para parallax. */
window.PArt = (function () {
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hsl(h, s, l, a) { h = ((h % 360) + 360) % 360; return 'hsl(' + h.toFixed(0) + ' ' + s + '% ' + l + '%' + (a != null ? ' / ' + a : '') + ')'; }
  function ridge(r, w, base, amp, n) {
    var pts = [[0, base]], step = w / n;
    for (var i = 0; i <= n; i++) { var peak = i % 2 === 0; pts.push([i * step, base - (peak ? amp * (.45 + r() * .55) : amp * r() * .22)]); }
    pts.push([w, base + 4], [w, 9999], [0, 9999]);
    return 'M' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('L') + 'Z';
  }
  function hill(r, w, base, amp) {
    var d = 'M0,' + base, x = 0, n = 3 + Math.floor(r() * 2), step = w / n;
    for (var i = 0; i < n; i++) { var y1 = base - amp * (.3 + r() * .7), y2 = base - amp * r() * .5; d += ' Q' + (x + step / 2).toFixed(1) + ',' + y1.toFixed(1) + ' ' + (x + step).toFixed(1) + ',' + y2.toFixed(1); x += step; }
    return d + ' L' + w + ',9999 L0,9999Z';
  }
  function pine(x, y, s, col) {
    x = +x; y = +y; s = +s;
    var P = function (a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); };
    return '<g fill="' + col + '"><polygon points="' + P([[x, y - 2.6 * s], [x - .55 * s, y - 1.5 * s], [x + .55 * s, y - 1.5 * s]]) + '"/><polygon points="' + P([[x, y - 1.95 * s], [x - .85 * s, y - .65 * s], [x + .85 * s, y - .65 * s]]) + '"/><polygon points="' + P([[x, y - 1.2 * s], [x - 1.1 * s, y + .1 * s], [x + 1.1 * s, y + .1 * s]]) + '"/><rect x="' + (x - .1 * s).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (.2 * s).toFixed(1) + '" height="' + (.4 * s).toFixed(1) + '"/></g>';
  }
  function pines(r, w, base, n, col, smin, smax, from, to) {
    var o = '';
    for (var i = 0; i < n; i++) { var x = from + (to - from) * r(), s = smin + (smax - smin) * r(); o += pine(x.toFixed(1), (base + 8 + r() * 14).toFixed(1), s.toFixed(1), col); }
    return o;
  }
  function city(r, w, base, col, col2) {
    var o = '', x = -10;
    while (x < w) { var bw = 40 + r() * 70, bh = 90 + r() * 240; o += '<rect x="' + x.toFixed(1) + '" y="' + (base - bh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (bh + 400).toFixed(1) + '" fill="' + (r() > .5 ? col : col2) + '"/>';
      for (var wy = base - bh + 14; wy < base - 10; wy += 20) for (var wx = x + 8; wx < x + bw - 10; wx += 16) if (r() > .72) o += '<rect x="' + wx.toFixed(1) + '" y="' + wy.toFixed(1) + '" width="7" height="9" rx="1.5" fill="rgba(255,236,170,.85)"/>';
      x += bw + 4 + r() * 6; }
    return o;
  }
  function figure(x, y, s, col, col2) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><ellipse cx="0" cy="2" rx="22" ry="4" fill="rgba(0,0,0,.14)"/><rect x="-7" y="-46" width="14" height="40" rx="6" fill="' + col + '"/><rect x="-14" y="-42" width="9" height="26" rx="4" fill="' + col2 + '"/><circle cx="0" cy="-58" r="9" fill="#F2C9A8"/><path d="M-9,-60 q9,-12 18,0 z" fill="' + col2 + '"/><rect x="-6" y="-6" width="5" height="22" rx="2.5" fill="#2c2a4a"/><rect x="2" y="-6" width="5" height="22" rx="2.5" fill="#2c2a4a" transform="rotate(8 4 -6)"/></g>';
  }
  var uid = 0;
  function scene(o) {
    o = o || {};
    var hue = o.hue == null ? 255 : o.hue, seed = o.seed == null ? 7 : o.seed, kind = o.kind || 0, mini = !!o.mini;
    var W = 1200, H = mini ? 520 : 640, r = rng(seed * 9973 + 11), id = 'g' + (++uid);
    var night = kind === 1, top = night ? hsl(hue, 45, 22) : hsl(hue, 70, 80), bot = night ? hsl(hue + 20, 55, 42) : hsl(hue + 28, 85, 93);
    var far = night ? hsl(hue + 10, 40, 34) : hsl(hue + 12, 48, 75), mid = night ? hsl(hue + 6, 40, 27) : hsl(hue + 6, 46, 62), near = night ? hsl(hue, 38, 20) : hsl(hue, 42, 49), front = night ? hsl(hue - 10, 34, 14) : hsl(hue - 14, 38, 34), tree = night ? hsl(hue - 6, 30, 11) : hsl(hue - 6, 34, 27);
    var s = '<svg class="art" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + top + '"/><stop offset="1" stop-color="' + bot + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + ')"/>';
    var sx = 220 + r() * 760;
    s += '<g class="ly" data-d="0.04">' + (night ? '<circle cx="' + sx + '" cy="' + (H * .2) + '" r="46" fill="' + hsl(hue + 30, 60, 92) + '"/><circle cx="' + (sx + 18) + '" cy="' + (H * .2 - 8) + '" r="42" fill="' + top + '"/>' + (function () { var o2 = ''; for (var i = 0; i < 26; i++) o2 += '<circle cx="' + (r() * W).toFixed(0) + '" cy="' + (r() * H * .5).toFixed(0) + '" r="' + (1 + r() * 1.6).toFixed(1) + '" fill="#fff" opacity="' + (.4 + r() * .6).toFixed(2) + '"/>'; return o2; })() : '<circle cx="' + sx + '" cy="' + (H * .3) + '" r="' + (mini ? 70 : 96) + '" fill="' + hsl(hue + 40, 95, 90) + '" opacity=".9"/><circle cx="' + sx + '" cy="' + (H * .3) + '" r="' + (mini ? 110 : 150) + '" fill="' + hsl(hue + 40, 95, 92) + '" opacity=".35"/>') + '</g>';
    if (!mini) s += '<g class="ly" data-d="0.08">' + [0, 1, 2].map(function (i) { var cx = r() * W, cy = H * (.16 + r() * .2); return '<g fill="#fff" opacity="' + (.55 + r() * .3).toFixed(2) + '"><ellipse cx="' + cx.toFixed(0) + '" cy="' + cy.toFixed(0) + '" rx="' + (90 + r() * 60).toFixed(0) + '" ry="22"/><ellipse cx="' + (cx + 50).toFixed(0) + '" cy="' + (cy - 14).toFixed(0) + '" rx="64" ry="24"/></g>'; }).join('') + '</g>';
    if (kind === 3) {
      s += '<g class="ly" data-d="0.14"><path d="' + ridge(r, W, H * .66, H * .34, 7) + '" fill="' + far + '"/></g>';
      s += '<g class="ly" data-d="0.26">' + city(r, W, H * .78, mid, near) + '</g>';
      s += '<g class="ly" data-d="0.42"><path d="' + hill(r, W, H * .9, H * .12) + '" fill="' + front + '"/></g>';
    } else {
      s += '<g class="ly" data-d="0.14"><path d="' + ridge(r, W, H * .62, H * .36, 8) + '" fill="' + far + '"/></g>';
      s += '<g class="ly" data-d="0.24"><path d="' + ridge(r, W, H * .74, H * .34, 7) + '" fill="' + mid + '"/>' + (mini ? '' : '<path d="M0,' + H * .74 + ' L' + W + ',' + H * .74 + ' L' + W + ',' + H + ' L0,' + H + 'Z" fill="' + mid + '"/>') + '</g>';
      if (kind === 2) s += '<g class="ly" data-d="0.3"><rect x="0" y="' + H * .76 + '" width="' + W + '" height="' + H + '" fill="' + hsl(hue + 8, 60, 70) + '"/><rect x="' + (sx - 60) + '" y="' + H * .79 + '" width="120" height="6" rx="3" fill="rgba(255,255,255,.55)"/><rect x="' + (sx - 30) + '" y="' + H * .83 + '" width="60" height="5" rx="2.5" fill="rgba(255,255,255,.4)"/></g>';
      s += '<g class="ly" data-d="0.34"><path d="' + ridge(r, W, H * .86, H * .26, 6) + '" fill="' + near + '"/>' + pines(r, W, H * .86, mini ? 9 : 16, tree, 18, 34, W * .55, W + 20) + '</g>';
      s += '<g class="ly" data-d="0.5"><path d="' + hill(r, W, H * .95, H * .14) + '" fill="' + front + '"/>' + pines(r, W, H * .96, mini ? 4 : 8, tree, 30, 54, -20, W * .3) + (o.figure ? figure(W * .5, H * .93, mini ? 1.2 : 1.6, hsl(hue + 150, 60, 62), '#FFC93C') : '') + '</g>';
    }
    if (!mini && kind !== 3) s += '<g class="ly" data-d="0.18" opacity=".55"><polygon points="' + (sx - 40) + ',0 ' + (sx + 40) + ',0 ' + (sx + 420) + ',' + H + ' ' + (sx - 200) + ',' + H + '" fill="url(#' + id + 'b)" opacity=".35"/></g>';
    if (!mini) s += '<g class="ly" data-d="0.3" fill="none" stroke="' + (night ? '#fff' : hsl(hue, 40, 28)) + '" stroke-width="2.4" stroke-linecap="round" opacity=".6"><path d="M' + (W * .3) + ',' + H * .22 + ' q9,-9 18,0 q9,-9 18,0"/><path d="M' + (W * .36) + ',' + H * .28 + ' q7,-7 14,0 q7,-7 14,0"/></g>';
    return s + '</svg>';
  }
  /* ===== fundo da pagina: paisagem 2D suave (montanha com neve, nevoa, pinheiros, lua) em vetor 1920x1080 ===== */
  function bgScene(o) {
    o = o || {};
    var h1 = o.hue == null ? 262 : o.hue, h2 = o.hue2 == null ? 330 : o.hue2, night = !!o.night, S = o.sat == null ? 1 : o.sat, r = rng((o.seed || 5) * 7919 + 3), W = 1920, H = 1080, id = 'b' + (++uid);
    var C = function (h, s, l, a) { return hsl(h, Math.round(s * S * (night ? .5 : 1)), night ? Math.max(9, Math.round(l * .58)) : l, a); };
    var P2 = function (a) { return a.map(function (p) { return p[0].toFixed(0) + ',' + p[1].toFixed(0); }).join(' '); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C(h1, 52, 64) + '"/><stop offset=".45" stop-color="' + C(h1 + 10, 58, 74) + '"/><stop offset=".78" stop-color="' + C(h2, 82, 84) + '"/><stop offset="1" stop-color="' + C(h1 + 14, 48, 62) + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'g" cx=".82" cy=".6" r=".55"><stop offset="0" stop-color="' + C(h2, 78, 84, .62) + '"/><stop offset="1" stop-color="' + C(h2, 78, 84, 0) + '"/></radialGradient>' +
      '<linearGradient id="' + id + 'm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C(h1, 40, 94, 0) + '"/><stop offset=".5" stop-color="' + C(h1, 45, 92, night ? .38 : .7) + '"/><stop offset="1" stop-color="' + C(h1, 40, 94, 0) + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C(h1, 36, 46) + '"/><stop offset="1" stop-color="' + C(h1, 40, 34) + '"/></linearGradient>' +
      '<filter id="' + id + 'b" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="22"/></filter>' +
      '<mask id="' + id + 'k"><rect width="' + W + '" height="' + H + '" fill="#fff"/><circle cx="' + (W * .52 + 15) + '" cy="' + (H * .17 - 6) + '" r="26" fill="#000"/></mask></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 's)"/><rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'g)"/>';
    if (night || o.stars) { s += '<g fill="#fff">'; for (var i = 0; i < (night ? 110 : 45); i++) s += '<circle cx="' + (r() * W).toFixed(0) + '" cy="' + (r() * H * .46).toFixed(0) + '" r="' + (.6 + r() * 1.1).toFixed(1) + '" opacity="' + ((night ? .35 : .3) + r() * .5).toFixed(2) + '"/>'; s += '</g>'; }
    if (o.sun) s += '<circle cx="' + W * .64 + '" cy="' + H * .5 + '" r="230" fill="' + C(h2, 95, 90, .35) + '"/><circle cx="' + W * .64 + '" cy="' + H * .5 + '" r="110" fill="' + C(h2, 95, 94, .9) + '"/>';
    else s += '<circle cx="' + W * .52 + '" cy="' + H * .17 + '" r="26" fill="#fff" opacity=".95" mask="url(#' + id + 'k)"/>';
    s += '<path d="' + ridge(r, W, H * .62, H * .2, 11) + '" fill="' + C(h1 + 8, 34, 72, .95) + '"/>';
    var peak = function (cx, base, w, hg, dk, lt) {
      var a = [[cx - w / 2, base], [cx - w * .18, base - hg * .55], [cx - w * .06, base - hg * .72], [cx, base - hg], [cx + w * .1, base - hg * .74], [cx + w * .22, base - hg * .5], [cx + w / 2, base]],
        b = [[cx, base - hg], [cx + w * .1, base - hg * .74], [cx + w * .22, base - hg * .5], [cx + w / 2, base], [cx + w * .06, base], [cx + w * .03, base - hg * .42], [cx - w * .02, base - hg * .66]];
      return '<polygon points="' + P2(a) + '" fill="' + dk + '"/><polygon points="' + P2(b) + '" fill="' + lt + '"/>';
    };
    s += peak(W * .36, H * .68, W * .2, H * .15, C(h1 + 4, 34, 62), C(h2, 50, 86)) + peak(W * .64, H * .68, W * .22, H * .17, C(h1 + 4, 34, 60), C(h2, 50, 86)) + peak(W * .5, H * .7, W * .36, H * .34, C(h1, 36, 50), C(h2, 55, 90));
    s += '<g filter="url(#' + id + 'b)"><rect x="-100" y="' + H * .56 + '" width="' + (W + 200) + '" height="' + H * .14 + '" fill="url(#' + id + 'm)"/></g>';
    s += '<g>' + pines(r, W, H * .71, 90, C(h1, 30, 58, .6), 9, 14, 0, W) + '</g><g filter="url(#' + id + 'b)"><rect x="-100" y="' + H * .66 + '" width="' + (W + 200) + '" height="' + H * .13 + '" fill="url(#' + id + 'm)" opacity=".8"/></g>';
    s += '<g>' + pines(r, W, H * .77, 70, C(h1, 32, 50, .7), 12, 20, 0, W) + '</g><g filter="url(#' + id + 'b)"><rect x="-100" y="' + H * .73 + '" width="' + (W + 200) + '" height="' + H * .12 + '" fill="url(#' + id + 'm)" opacity=".7"/></g>';
    s += '<g>' + pines(r, W, H * .82, 46, C(h1, 34, 42, .85), 16, 26, 0, W * .6) + '</g>';
    s += '<path d="M0,' + H * .8 + ' C' + W * .35 + ',' + H * .87 + ' ' + W * .7 + ',' + H * .74 + ' ' + W + ',' + H * .6 + ' L' + W + ',' + H + ' L0,' + H + 'Z" fill="url(#' + id + 'f)"/>';
    s += '<path d="M0,' + H * .92 + ' C' + W * .4 + ',' + H * .86 + ' ' + W * .75 + ',' + H * .96 + ' ' + W + ',' + H * .84 + ' L' + W + ',' + H + ' L0,' + H + 'Z" fill="' + C(h1, 40, 30) + '"/>';
    s += '<g fill="' + C(h1, 40, 34) + '">' + [[.84, .66, .26, .026], [.89, .64, .19, .02], [.945, .66, .33, .03]].map(function (t) { var x = W * t[0], b = H * t[1], hg = H * t[2], w = W * t[3]; return '<polygon points="' + P2([[x, b - hg], [x - w, b], [x + w, b]]) + '"/>'; }).join('') + '</g>';
    s += '<g>' + pines(r, W, H * .76, 7, C(h1, 38, 36), 24, 36, W * .02, W * .24) + '</g>';
    return s + '</svg>';
  }
  /* cores por materia: matiz distinto para cada uma (azul, roxo, verde, laranja, rosa...) */
  var HUES = { fgv: 262, etica: 214, const: 288, dh: 340, civil: 24, pcivil: 196, penal: 6, ppenal: 330, adm: 166, trib: 44, trab: 150, ptrab: 100, emp: 228, cons: 12, eca: 176, fil: 270, amb: 130, int: 200, prev: 56, elei: 310, fin: 84 };
  function hueOf(id) { return HUES[id] != null ? HUES[id] : 250; }
  function kindOf(id) { var ks = Object.keys(HUES), i = ks.indexOf(id); return [0, 2, 1, 3, 0, 2][i < 0 ? 0 : i % 6]; }
  function grad(id) { var h = hueOf(id); return ['hsl(' + h + ' 70% 88%)', 'hsl(' + (h + 24) + ' 62% 76%)']; }
  return { scene: scene, bg: bgScene, hueOf: hueOf, kindOf: kindOf, grad: grad };
})();
