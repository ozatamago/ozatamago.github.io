/* interactions.js — a small framework that runs one full-page background
 * interaction per page. Each page sets <body data-interaction="NAME">; the
 * matching entry in INTERACTIONS is drawn on a fixed canvas behind the content.
 * The framework owns the canvas, control panel (on/off + per-interaction
 * controls + reset), prefers-reduced-motion handling, resize/visibility, and
 * pointer routing. Each interaction is a famous model of emergence / collective
 * behaviour, rendered as faint coral tints so page text stays readable. */
(function () {
  "use strict";

  var CORAL = "255,90,102";
  var mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = mq ? mq.matches : false;
  var isJa = (document.documentElement.lang || "").toLowerCase().indexOf("ja") === 0;

  function t(o) { return o ? (isJa ? (o.ja || o.en) : o.en) : ""; }
  function load(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function loadNum(k, d) { var v = parseFloat(load(k, d)); return isNaN(v) ? d : v; }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function coral(a) { return "rgba(" + CORAL + "," + a + ")"; }
  function vw() { return window.innerWidth || document.documentElement.clientWidth || 1024; }
  function vh() { return window.innerHeight || document.documentElement.clientHeight || 768; }
  function wantRunning() { var p = load("bg.on", null); return reduced ? false : (p === null ? true : p === "1"); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  var UI = isJa
    ? { anim: "アニメーション", reset: "リセット", open: "背景の設定", close: "閉じる" }
    : { anim: "Animation", reset: "Reset", open: "Background settings", close: "Close" };

  /* ---- shared little helpers for grid interactions ---- */
  function tintPalette(n) {
    var p = [null], deep = [40, 28, 46];
    for (var i = 1; i < n; i++) {
      var f = n > 2 ? (i - 1) / (n - 2) : 0;
      var r = Math.round(255 + (deep[0] - 255) * 0.5 * f);
      var g = Math.round(90 + (deep[1] - 90) * 0.5 * f);
      var b = Math.round(102 + (deep[2] - 102) * 0.5 * f);
      p[i] = "rgba(" + r + "," + g + "," + b + "," + (0.07 + 0.15 * (i / n)).toFixed(3) + ")";
    }
    return p;
  }

  /* ==================================================================== */
  /* INTERACTIONS                                                         */
  /* ==================================================================== */
  var INTERACTIONS = {

    /* ---------- Boids (Reynolds 1987) — Home ---------- */
    boids: {
      icon: "🐦",
      title: { en: "Boids — flocking", ja: "Boids — 群れ" },
      desc: { en: "Reynolds 1987: separation · alignment · cohesion", ja: "Reynolds 1987：分離・整列・結合" },
      controls: [
        { kind: "range", id: "n", label: { en: "boids", ja: "個体数" }, min: 40, max: 200, step: 10, value: 120,
          resetOnChange: true, apply: function (e, v) { e.n = v; } }
      ],
      setup: function (e) {
        e.b = [];
        for (var i = 0; i < (e.n || 120); i++) {
          e.b.push({ x: Math.random() * e.W, y: Math.random() * e.H, vx: Math.random() * 2 - 1, vy: Math.random() * 2 - 1 });
        }
        e.mouseOn = false;
      },
      pointer: function (e, x, y, type) {
        e.mx = x; e.my = y; e.mouseOn = true;
        clearTimeout(e._mt); e._mt = setTimeout(function () { e.mouseOn = false; }, 1600);
      },
      frame: function (e) {
        var c = e.ctx, b = e.b, W = e.W, H = e.H, i, j;
        c.clearRect(0, 0, W, H);
        var R2 = 44 * 44, sep2 = 15 * 15, maxv = 2.3;
        for (i = 0; i < b.length; i++) {
          var bi = b[i], ax = 0, ay = 0, cx = 0, cy = 0, sx = 0, sy = 0, cnt = 0;
          for (j = 0; j < b.length; j++) {
            if (i === j) continue;
            var dx = b[j].x - bi.x, dy = b[j].y - bi.y, d2 = dx * dx + dy * dy;
            if (d2 < R2) { cnt++; ax += b[j].vx; ay += b[j].vy; cx += b[j].x; cy += b[j].y; if (d2 < sep2) { sx -= dx; sy -= dy; } }
          }
          if (cnt > 0) {
            bi.vx += (ax / cnt) * 0.012 + (cx / cnt - bi.x) * 0.0015 + sx * 0.02;
            bi.vy += (ay / cnt) * 0.012 + (cy / cnt - bi.y) * 0.0015 + sy * 0.02;
          }
          if (e.mouseOn) { bi.vx += (e.mx - bi.x) * 0.0006; bi.vy += (e.my - bi.y) * 0.0006; }
          var sp = Math.sqrt(bi.vx * bi.vx + bi.vy * bi.vy);
          if (sp > maxv) { bi.vx = bi.vx / sp * maxv; bi.vy = bi.vy / sp * maxv; }
          else if (sp < 0.5) { bi.vx *= 1.08; bi.vy *= 1.08; }
          bi.x += bi.vx; bi.y += bi.vy;
          if (bi.x < 0) bi.x += W; else if (bi.x >= W) bi.x -= W;
          if (bi.y < 0) bi.y += H; else if (bi.y >= H) bi.y -= H;
        }
        c.fillStyle = coral(0.5);
        for (i = 0; i < b.length; i++) {
          var bk = b[i], a = Math.atan2(bk.vy, bk.vx);
          c.beginPath();
          c.moveTo(bk.x + Math.cos(a) * 5.5, bk.y + Math.sin(a) * 5.5);
          c.lineTo(bk.x + Math.cos(a + 2.5) * 3.5, bk.y + Math.sin(a + 2.5) * 3.5);
          c.lineTo(bk.x + Math.cos(a - 2.5) * 3.5, bk.y + Math.sin(a - 2.5) * 3.5);
          c.closePath(); c.fill();
        }
      }
    },

    /* ---------- Ant colony optimization / stigmergy — Work Experience ---------- */
    "ant-colony": {
      icon: "🐜",
      title: { en: "Ant colony optimization", ja: "蟻コロニー最適化" },
      desc: { en: "Stigmergy: evaporating pheromone finds the shortest path", ja: "スティグマジー：蒸発するフェロモンで最短経路が創発" },
      controls: [
        { kind: "range", id: "rho", label: { en: "evaporation ρ", ja: "蒸発 ρ" }, min: 0.004, max: 0.05, step: 0.001, value: 0.012,
          fmt: function (v) { return v.toFixed(3); }, apply: function (e, v) { e.rho = v; } }
      ],
      setup: function (e) {
        var cell = cellFor(7);
        e.acell = cell; e.gw = Math.ceil(e.W / cell); e.gh = Math.ceil(e.H / cell);
        e.cw = e.W / e.gw; e.ch = e.H / e.gh;
        e.toFood = new Float32Array(e.gw * e.gh);
        e.toHome = new Float32Array(e.gw * e.gh);
        e.nest = { x: e.W * 0.2, y: e.H * 0.6, r: 13 };
        e.food = { x: e.W * 0.82, y: e.H * 0.32, r: 14 };
        e.ants = [];
        for (var i = 0; i < 190; i++) e.ants.push({ x: e.nest.x, y: e.nest.y, a: Math.random() * 6.283, s: 0, d: 1 });
        e.pg = document.createElement("canvas"); e.pg.width = e.gw; e.pg.height = e.gh;
        e.pctx = e.pg.getContext("2d"); e.img = e.pctx.createImageData(e.gw, e.gh);
      },
      pointer: function (e, x, y, type) {
        if (type === "down") { e.food.x = x; e.food.y = y; e.dragging = true; }
        else if (type === "move") { if (e.dragging) { e.food.x = x; e.food.y = y; } }
        else if (type === "up") { e.dragging = false; }
      },
      frame: function (e) {
        var idxAt = function (x, y) { var gx = x / e.cw | 0, gy = y / e.ch | 0; if (gx < 0 || gy < 0 || gx >= e.gw || gy >= e.gh) return -1; return gy * e.gw + gx; };
        var sample = function (f, x, y) { var i = idxAt(x, y); return i < 0 ? 0 : f[i]; };
        var sd = 10, sa = 0.6, turn = 0.55, speed = 1.25, dep = 0.65, sub, k;
        for (sub = 0; sub < 2; sub++) {
          for (k = 0; k < e.ants.length; k++) {
            var an = e.ants[k], f = an.s === 0 ? e.toFood : e.toHome;
            var cc = sample(f, an.x + Math.cos(an.a) * sd, an.y + Math.sin(an.a) * sd);
            var l = sample(f, an.x + Math.cos(an.a - sa) * sd, an.y + Math.sin(an.a - sa) * sd);
            var r = sample(f, an.x + Math.cos(an.a + sa) * sd, an.y + Math.sin(an.a + sa) * sd);
            if (cc >= l && cc >= r) {} else if (l > r) an.a -= turn * Math.random(); else if (r > l) an.a += turn * Math.random(); else an.a += (Math.random() - 0.5) * turn;
            an.a += (Math.random() - 0.5) * 0.32;
            var nx = an.x + Math.cos(an.a) * speed, ny = an.y + Math.sin(an.a) * speed;
            if (nx < 2 || nx > e.W - 2) { an.a = Math.PI - an.a; nx = clamp(nx, 2, e.W - 2); }
            if (ny < 2 || ny > e.H - 2) { an.a = -an.a; ny = clamp(ny, 2, e.H - 2); }
            an.x = nx; an.y = ny;
            var lay = an.s === 0 ? e.toHome : e.toFood, gi = idxAt(an.x, an.y);
            if (gi >= 0) lay[gi] = Math.min(1.6, lay[gi] + an.d * dep);
            an.d = Math.max(0, an.d - 1 / 340);
            var dfx = an.x - e.food.x, dfy = an.y - e.food.y, dnx = an.x - e.nest.x, dny = an.y - e.nest.y;
            if (an.s === 0 && dfx * dfx + dfy * dfy < e.food.r * e.food.r) { an.s = 1; an.d = 1; an.a += Math.PI; }
            else if (an.s === 1 && dnx * dnx + dny * dny < e.nest.r * e.nest.r) { an.s = 0; an.d = 1; an.a += Math.PI; }
          }
          var ev = 1 - e.rho;
          for (k = 0; k < e.toFood.length; k++) { e.toFood[k] *= ev; e.toHome[k] *= ev; }
        }
        var d = e.img.data;
        for (k = 0; k < e.toFood.length; k++) {
          var ff = Math.min(1, e.toFood[k]), hh = Math.min(1, e.toHome[k]), p = k * 4;
          var m = ff > hh ? ff : hh;
          if (m < 0.02) { d[p + 3] = 0; continue; }
          var food = ff / (ff + hh + 1e-6); /* coral = trail to food, teal = trail home */
          d[p] = Math.round(232 * food + 63 * (1 - food));
          d[p + 1] = Math.round(96 * food + 150 * (1 - food));
          d[p + 2] = Math.round(104 * food + 190 * (1 - food));
          d[p + 3] = Math.min(205, (m * 900) | 0);
        }
        e.pctx.putImageData(e.img, 0, 0);
        var c = e.ctx; c.clearRect(0, 0, e.W, e.H);
        c.imageSmoothingEnabled = false; c.drawImage(e.pg, 0, 0, e.W, e.H); /* crisp trails, no blur */
        c.fillStyle = "rgba(63,150,180,0.95)"; c.beginPath(); c.arc(e.nest.x, e.nest.y, e.nest.r, 0, 6.283); c.fill();
        c.fillStyle = coral(0.98); c.beginPath(); c.arc(e.food.x, e.food.y, e.food.r, 0, 6.283); c.fill();
        /* the foraging ants: dark while searching, amber while carrying food — clearly visible */
        for (k = 0; k < e.ants.length; k++) {
          var a2 = e.ants[k];
          c.fillStyle = a2.s === 0 ? "#2b211d" : "#c5531c";
          c.beginPath(); c.arc(a2.x, a2.y, 2.6, 0, 6.283); c.fill();
        }
      }
    },

    /* ---------- Diffusion-limited aggregation — Education ---------- */
    dla: {
      icon: "❄️",
      title: { en: "Diffusion-limited aggregation", ja: "拡散律速凝集 (DLA)" },
      desc: { en: "Random walkers stick on contact — dendritic growth", ja: "ランダムウォークが接触で凝着し樹枝状に成長" },
      controls: [
        { kind: "range", id: "walkers", label: { en: "walkers", ja: "粒子数" }, min: 120, max: 900, step: 60, value: 480,
          resetOnChange: true, apply: function (e, v) { e.nw = v; } }
      ],
      setup: function (e) {
        var cell = cellFor(5);
        e.dcell = cell; e.gw = Math.ceil(e.W / cell); e.gh = Math.ceil(e.H / cell);
        e.stuck = new Uint16Array(e.gw * e.gh);
        e.age = 1;
        e.seeds = 5;
        var s;
        for (s = 0; s < e.seeds; s++) {
          var sx = Math.floor((0.15 + 0.7 * Math.random()) * e.gw), sy = Math.floor((0.15 + 0.7 * Math.random()) * e.gh);
          e.stuck[sy * e.gw + sx] = 1;
        }
        e.walkers = [];
        for (s = 0; s < (e.nw || 480); s++) e.walkers.push({ x: Math.floor(Math.random() * e.gw), y: Math.floor(Math.random() * e.gh) });
        e.dpal = tintPalette(64);
        e.ctx.clearRect(0, 0, e.W, e.H);
        // redraw existing seeds
        for (var gi = 0; gi < e.stuck.length; gi++) if (e.stuck[gi]) e.drawStuck(e, gi % e.gw, (gi / e.gw) | 0, e.stuck[gi]);
      },
      drawStuck: function (e, gx, gy, v) {
        var c = e.ctx, cell = e.dcell, col = e.dpal[Math.min(63, v)] || coral(0.2);
        c.fillStyle = col; c.fillRect(gx * cell, gy * cell, cell, cell);
      },
      pointer: function (e, x, y, type) {
        if (type === "down") { var gx = clamp(x / e.dcell | 0, 0, e.gw - 1), gy = clamp(y / e.dcell | 0, 0, e.gh - 1), a = e.age | 0; e.stuck[gy * e.gw + gx] = a; e.drawStuck(e, gx, gy, a); }
      },
      frame: function (e) {
        var gw = e.gw, gh = e.gh, stuck = e.stuck, w = e.walkers, steps = 16, k, s;
        var col = Math.min(63, e.age | 0);
        for (s = 0; s < steps; s++) {
          for (k = 0; k < w.length; k++) {
            var p = w[k];
            p.x += (Math.random() * 3 | 0) - 1; p.y += (Math.random() * 3 | 0) - 1;
            if (p.x < 0) p.x = gw - 1; else if (p.x >= gw) p.x = 0;
            if (p.y < 0) p.y = gh - 1; else if (p.y >= gh) p.y = 0;
            var x = p.x, y = p.y;
            var xl = x ? x - 1 : gw - 1, xr = x + 1 < gw ? x + 1 : 0, yu = y ? y - 1 : gh - 1, yd = y + 1 < gh ? y + 1 : 0;
            if (stuck[y * gw + xl] || stuck[y * gw + xr] || stuck[yu * gw + x] || stuck[yd * gw + x]) {
              stuck[y * gw + x] = col;
              e.drawStuck(e, x, y, col);
              p.x = Math.floor(Math.random() * gw); p.y = Math.floor(Math.random() * gh);
            }
          }
        }
        if ((e.age += 0.14) > 63) e.age = 63;
      }
    },

    /* ---------- Reaction–diffusion (Gray–Scott) — Research ---------- */
    "reaction-diffusion": {
      icon: "🐆",
      title: { en: "Reaction–diffusion", ja: "反応拡散系" },
      desc: { en: "Gray–Scott: Turing patterns from two chemicals", ja: "Gray–Scott：2物質が生む Turing パターン" },
      controls: [
        { kind: "select", id: "preset", label: { en: "pattern", ja: "模様" }, value: "coral",
          options: [
            { value: "coral", label: { en: "coral", ja: "サンゴ" } },
            { value: "mitosis", label: { en: "mitosis", ja: "分裂" } },
            { value: "maze", label: { en: "maze", ja: "迷路" } }
          ],
          apply: function (e, v) { var m = { coral: [0.0545, 0.062], mitosis: [0.0367, 0.0649], maze: [0.029, 0.057] }[v] || [0.0545, 0.062]; e.F = m[0]; e.kk = m[1]; }, resetOnChange: true }
      ],
      setup: function (e) {
        var cell = cellFor(6);
        e.rcell = cell; e.gw = Math.ceil(e.W / cell); e.gh = Math.ceil(e.H / cell);
        var n = e.gw * e.gh;
        e.u = new Float32Array(n); e.v = new Float32Array(n);
        e.u2 = new Float32Array(n); e.v2 = new Float32Array(n);
        for (var i = 0; i < n; i++) { e.u[i] = 1; e.v[i] = 0; }
        for (var s = 0; s < 9; s++) {
          var cx = 3 + Math.floor(Math.random() * Math.max(1, e.gw - 6)), cy = 3 + Math.floor(Math.random() * Math.max(1, e.gh - 6));
          for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) {
            var x = cx + dx, y = cy + dy;
            if (x >= 0 && y >= 0 && x < e.gw && y < e.gh) { e.v[y * e.gw + x] = 1; }
          }
        }
        e.pg = document.createElement("canvas"); e.pg.width = e.gw; e.pg.height = e.gh;
        e.pctx = e.pg.getContext("2d"); e.img = e.pctx.createImageData(e.gw, e.gh);
        e.rdSteps = 0; e.rdTick = 0;
        if (e.F == null) { e.F = 0.0545; e.kk = 0.062; }
      },
      pointer: function (e, x, y, type) {
        if (type !== "down") return;
        var cx = clamp(x / e.rcell | 0, 0, e.gw - 1), cy = clamp(y / e.rcell | 0, 0, e.gh - 1);
        for (var dy = -3; dy <= 3; dy++) for (var dx = -3; dx <= 3; dx++) {
          var gx = cx + dx, gy = cy + dy;
          if (gx >= 0 && gy >= 0 && gx < e.gw && gy < e.gh) e.v[gy * e.gw + gx] = 1;
        }
        e.rdSteps = Math.max(0, e.rdSteps - 400); /* let the injected blob settle in, then re-freeze */
      },
      frame: function (e) {
        /* forms quickly, then holds still — a calm, non-nauseating texture */
        if (e.rdSteps >= 1600) return;
        var gw = e.gw, gh = e.gh, F = e.F, K = e.kk, Du = 0.16, Dv = 0.08, x, y, it;
        for (it = 0; it < 2 && e.rdSteps < 1600; it++) { /* 2 iterations/frame — fast formation */
          var u = e.u, v = e.v, un = e.u2, vn = e.v2;
          for (y = 0; y < gh; y++) {
            var yu = (y ? y - 1 : gh - 1) * gw, yd = (y + 1 < gh ? y + 1 : 0) * gw, yc = y * gw;
            for (x = 0; x < gw; x++) {
              var xl = x ? x - 1 : gw - 1, xr = x + 1 < gw ? x + 1 : 0, i = yc + x;
              var lu = u[yc + xl] + u[yc + xr] + u[yu + x] + u[yd + x] - 4 * u[i];
              var lv = v[yc + xl] + v[yc + xr] + v[yu + x] + v[yd + x] - 4 * v[i];
              var uvv = u[i] * v[i] * v[i];
              un[i] = u[i] + (Du * lu - uvv + F * (1 - u[i]));
              vn[i] = v[i] + (Dv * lv + uvv - (F + K) * v[i]);
            }
          }
          e.u = un; e.u2 = u; e.v = vn; e.v2 = v;
          e.rdSteps++;
        }
        var d = e.img.data, out = e.v;
        for (var k = 0; k < out.length; k++) {
          var p = k * 4;
          d[p] = 232; d[p + 1] = 96; d[p + 2] = 104; d[p + 3] = out[k] >= 0.2 ? 185 : 0; /* hard edge — defined spots, no fade */
        }
        e.pctx.putImageData(e.img, 0, 0);
        var c = e.ctx; c.clearRect(0, 0, e.W, e.H); c.imageSmoothingEnabled = false; c.drawImage(e.pg, 0, 0, e.W, e.H);
      }
    },

    /* ---------- Kuramoto synchronization — Publications ---------- */
    kuramoto: {
      icon: "✨",
      title: { en: "Kuramoto synchronization", ja: "蔵本モデル（同期）" },
      desc: { en: "Coupled oscillators (fireflies) lock in phase as K rises", ja: "結合振動子（ホタル）が K の増加で位相同期" },
      controls: [
        { kind: "range", id: "k", label: { en: "coupling K", ja: "結合 K" }, min: 0, max: 4, step: 0.1, value: 1.6,
          fmt: function (v) { return v.toFixed(1); }, apply: function (e, v) { e.K = v; } }
      ],
      readout: function (e) { return (isJa ? "秩序 r = " : "order r = ") + (e.r || 0).toFixed(2); },
      setup: function (e) {
        var n = 240;
        e.osc = [];
        for (var i = 0; i < n; i++) {
          e.osc.push({ x: Math.random() * e.W, y: Math.random() * e.H, th: Math.random() * 6.283, w: 0.6 + (Math.random() - 0.5) * 0.7 });
        }
        e.r = 0;
      },
      frame: function (e) {
        var o = e.osc, n = o.length, i, dt = 0.05, sc = 0, ss = 0;
        for (i = 0; i < n; i++) { sc += Math.cos(o[i].th); ss += Math.sin(o[i].th); }
        var r = Math.sqrt(sc * sc + ss * ss) / n, psi = Math.atan2(ss, sc);
        e.r = r;
        var K = e.K == null ? 1.6 : e.K;
        for (i = 0; i < n; i++) { o[i].th += dt * (o[i].w + K * r * Math.sin(psi - o[i].th)); }
        var c = e.ctx; c.clearRect(0, 0, e.W, e.H);
        for (i = 0; i < n; i++) {
          var b = (1 + Math.sin(o[i].th)) * 0.5;
          c.fillStyle = coral(0.12 + 0.66 * b * b);
          var rad = 2.2 + 3.4 * b;
          c.beginPath(); c.arc(o[i].x, o[i].y, rad, 0, 6.283); c.fill();
        }
      }
    },

    /* ---------- Voronoi + Lloyd's relaxation (k-means) — Publications ---------- */
    voronoi: {
      icon: "🔷",
      title: { en: "Voronoi — Lloyd's relaxation", ja: "ボロノイ — Lloyd 緩和" },
      desc: { en: "Sites drift to their cell centroids (k-means) until even, then rest", ja: "各点がセル重心へ移動（k-means）し均等化して静止" },
      controls: [
        { kind: "range", id: "sites", label: { en: "sites", ja: "点の数" }, min: 16, max: 90, step: 2, value: 46,
          resetOnChange: true, apply: function (e, v) { e.nsites = v; } }
      ],
      setup: function (e) {
        var cell = cellFor(11);
        e.vcell = cell; e.gw = Math.ceil(e.W / cell); e.gh = Math.ceil(e.H / cell);
        e.owner = new Int16Array(e.gw * e.gh);
        e.sites = [];
        for (var i = 0; i < (e.nsites || 46); i++) e.sites.push({ x: Math.random() * e.gw, y: Math.random() * e.gh });
        e.lloyd = 0; e.vtick = 0;
      },
      pointer: function (e, x, y, type) {
        if (type !== "down") return;
        e.sites.push({ x: clamp(x / e.vcell, 0, e.gw - 1), y: clamp(y / e.vcell, 0, e.gh - 1) });
        e.owner = new Int16Array(e.gw * e.gh);
        e.lloyd = Math.max(0, e.lloyd - 26); /* resume relaxing to absorb the new site, then rest */
      },
      frame: function (e) {
        if (e.lloyd >= 80) return;        /* converged — hold the tessellation still */
        if (++e.vtick % 3) return;        /* relax gently */
        var gw = e.gw, gh = e.gh, sites = e.sites, ns = sites.length, owner = e.owner, s, x, y;
        var sx = new Float32Array(ns), sy = new Float32Array(ns), cn = new Float32Array(ns);
        for (y = 0; y < gh; y++) for (x = 0; x < gw; x++) {
          var best = 0, bd = 1e9;
          for (s = 0; s < ns; s++) { var dx = sites[s].x - x, dy = sites[s].y - y, dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; best = s; } }
          owner[y * gw + x] = best; sx[best] += x; sy[best] += y; cn[best]++;
        }
        for (s = 0; s < ns; s++) if (cn[s] > 0) { sites[s].x = sx[s] / cn[s]; sites[s].y = sy[s] / cn[s]; }
        e.lloyd++;
        var c = e.ctx, cw = e.vcell, i;
        c.clearRect(0, 0, e.W, e.H);
        c.strokeStyle = coral(0.42); c.lineWidth = 1; c.beginPath();
        for (i = 0; i < owner.length; i++) {
          var col = i % gw, row = (i / gw) | 0;
          if (col + 1 < gw && owner[i] !== owner[i + 1]) { var xb = (col + 1) * cw; c.moveTo(xb, row * cw); c.lineTo(xb, (row + 1) * cw); }
          if (row + 1 < gh && owner[i] !== owner[i + gw]) { var yb = (row + 1) * cw; c.moveTo(col * cw, yb); c.lineTo((col + 1) * cw, yb); }
        }
        c.stroke();
        c.fillStyle = coral(0.75);
        for (s = 0; s < ns; s++) { c.beginPath(); c.arc(sites[s].x * cw, sites[s].y * cw, 2.4, 0, 6.283); c.fill(); }
      }
    },

    /* ---------- Physarum transport network (slime mould) — Slides ---------- */
    physarum: {
      icon: "🍄",
      title: { en: "Physarum transport network", ja: "Physarum 輸送網（粘菌）" },
      desc: { en: "Agents follow and reinforce a diffusing trail — slime-mould networks", ja: "エージェントが拡散する痕跡を辿り強化し、粘菌の経路網が創発" },
      controls: [
        { kind: "range", id: "decay", label: { en: "trail persistence", ja: "痕跡の持続" }, min: 0.9, max: 0.99, step: 0.005, value: 0.965,
          fmt: function (v) { return v.toFixed(3); }, apply: function (e, v) { e.decay = v; } }
      ],
      setup: function (e) {
        var cell = cellFor(4);
        e.pcell = cell; e.gw = Math.ceil(e.W / cell); e.gh = Math.ceil(e.H / cell);
        e.trail = new Float32Array(e.gw * e.gh);
        e.trail2 = new Float32Array(e.gw * e.gh);
        var n = Math.max(300, Math.min(1300, Math.round(e.gw * e.gh / 44)));
        e.agents = [];
        for (var i = 0; i < n; i++) e.agents.push({ x: Math.floor(e.gw * (0.2 + 0.6 * Math.random())), y: Math.floor(e.gh * (0.2 + 0.6 * Math.random())), dir: Math.floor(Math.random() * 4) });
        e.pg = document.createElement("canvas"); e.pg.width = e.gw; e.pg.height = e.gh;
        e.pctx = e.pg.getContext("2d"); e.img = e.pctx.createImageData(e.gw, e.gh);
        e.ptick = 0;
      },
      pointer: function (e, x, y, type) {
        if (type !== "down") return;
        var gx = clamp(x / e.pcell | 0, 0, e.gw - 1), gy = clamp(y / e.pcell | 0, 0, e.gh - 1);
        for (var k = 0; k < 30; k++) e.agents.push({ x: gx, y: gy, dir: Math.floor(Math.random() * 4) });
        if (e.agents.length > 1800) e.agents.splice(0, e.agents.length - 1800);
      },
      frame: function (e) {
        if (++e.ptick % 2) return; /* slower — advance every other frame (~30 steps/sec) */
        var gw = e.gw, gh = e.gh, tr = e.trail, ag = e.agents, sd = 4, k, x, y;
        var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0]; /* 0=up 1=right 2=down 3=left — axis-aligned only */
        var samp = function (px, py) { var gx = ((px % gw) + gw) % gw, gy = ((py % gh) + gh) % gh; return tr[gy * gw + gx]; };
        for (k = 0; k < ag.length; k++) {
          var a = ag[k], ld = (a.dir + 3) & 3, rd = (a.dir + 1) & 3;
          var cf = samp(a.x + DX[a.dir] * sd, a.y + DY[a.dir] * sd);
          var lf = samp(a.x + DX[ld] * sd, a.y + DY[ld] * sd);
          var rf = samp(a.x + DX[rd] * sd, a.y + DY[rd] * sd);
          if (cf >= lf && cf >= rf) {} else if (lf > rf) a.dir = ld; else if (rf > lf) a.dir = rd; else a.dir = Math.random() < 0.5 ? ld : rd;
          if (Math.random() < 0.03) a.dir = Math.random() < 0.5 ? ld : rd; /* occasional right-angle turn */
          a.x += DX[a.dir]; a.y += DY[a.dir];
          if (a.x < 0) a.x += gw; else if (a.x >= gw) a.x -= gw;
          if (a.y < 0) a.y += gh; else if (a.y >= gh) a.y -= gh;
          var gi = a.y * gw + a.x; tr[gi] = Math.min(6, tr[gi] + 1.2);
        }
        var dec = e.decay || 0.96;
        for (k = 0; k < tr.length; k++) tr[k] *= dec; /* pure decay, no spatial blur -> thin straight trails with right-angle corners */
        var d = e.img.data, out = tr;
        for (k = 0; k < out.length; k++) { var p = k * 4; d[p] = 232; d[p + 1] = 96; d[p + 2] = 104; d[p + 3] = out[k] >= 0.35 ? 175 : 0; /* hard threshold — crisp filaments, no fade */ }
        e.pctx.putImageData(e.img, 0, 0);
        var c = e.ctx; c.clearRect(0, 0, e.W, e.H); c.imageSmoothingEnabled = false; c.drawImage(e.pg, 0, 0, e.W, e.H);
      }
    },

    /* ---------- Langton's ant / turmite CA — Projects ---------- */
    langton: {
      icon: "🔲",
      title: { en: "Langton's ant", ja: "ラングトンの蟻" },
      desc: { en: "A turmite cellular automaton — order emerges from chaos", ja: "turmite セルオートマトン：混沌から秩序が創発" },
      controls: [
        { kind: "select", id: "preset", label: { en: "rule", ja: "規則" }, value: "RL",
          options: [
            { value: "RL", label: { en: "RL — classic (highway)", ja: "RL — 古典（ハイウェイ）" } },
            { value: "RLR", label: { en: "RLR — triangle", ja: "RLR — 三角形" } },
            { value: "LLRR", label: { en: "LLRR — symmetric", ja: "LLRR — 対称" } },
            { value: "LRRRRRLLR", label: { en: "LRRRRRLLR — spiral", ja: "LRRRRRLLR — 渦" } },
            { value: "LLRRRLRLRLLR", label: { en: "LLRRRLRLRLLR — chaotic", ja: "LLRRRLRLRLLR — カオス" } }
          ],
          apply: function (e, v) { e.rule = parseTurmite(v); }, resetOnChange: true, mirror: "custom" },
        { kind: "text", id: "custom", label: { en: "custom (L R N U)", ja: "カスタム (L R N U)" }, value: "RL", mono: true,
          apply: function (e, v) { e.rule = parseTurmite(v); }, resetOnChange: true }
      ],
      setup: function (e) {
        var cell = cellFor(8);
        e.lcell = cell; e.gw = Math.ceil(e.W / cell); e.gh = Math.ceil(e.H / cell);
        if (!e.rule) e.rule = "RL";
        e.grid = new Uint8Array(e.gw * e.gh);
        e.lpal = tintPalette(e.rule.length);
        var n = Math.max(2, Math.min(9, Math.round((e.gw * e.gh) / 7000)));
        e.ants = []; e.heads = [];
        for (var i = 0; i < n; i++) e.ants.push({ x: Math.floor(e.gw * (i + 0.5) / n) % e.gw, y: Math.floor(e.gh * ((i * 0.618) % 1)), dir: i & 3 });
        e.ctx.clearRect(0, 0, e.W, e.H);
      },
      frame: function (e) {
        var TURN = { L: 3, R: 1, N: 0, U: 2 }, DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
        var c = e.ctx, cell = e.lcell, gw = e.gw, gh = e.gh, rule = e.rule, k, h;
        var drawCell = function (x, y, col) { var px = x * cell, py = y * cell; c.clearRect(px, py, cell, cell); if (col > 0) { c.fillStyle = e.lpal[col]; c.fillRect(px, py, cell, cell); } };
        for (k = 0; k < e.heads.length; k++) { h = e.heads[k]; drawCell(h.x, h.y, e.grid[h.y * gw + h.x]); }
        for (k = 0; k < 150; k++) {
          var a = e.ants[k % e.ants.length], gi = a.y * gw + a.x, col = e.grid[gi];
          e.grid[gi] = (col + 1) % rule.length; drawCell(a.x, a.y, e.grid[gi]);
          a.dir = (a.dir + TURN[rule.charAt(col)]) & 3;
          a.x += DX[a.dir]; a.y += DY[a.dir];
          if (a.x < 0) a.x = gw - 1; else if (a.x >= gw) a.x = 0;
          if (a.y < 0) a.y = gh - 1; else if (a.y >= gh) a.y = 0;
        }
        e.heads.length = 0; c.fillStyle = coral(0.85);
        for (k = 0; k < e.ants.length; k++) { var an = e.ants[k]; e.heads.push({ x: an.x, y: an.y }); c.fillRect(an.x * cell, an.y * cell, cell, cell); }
      }
    },

    /* ---------- Conway's Game of Life — Awards ---------- */
    life: {
      icon: "🦠",
      title: { en: "Conway's Game of Life", ja: "ライフゲーム" },
      desc: { en: "Four rules of birth and death — universal computation", ja: "誕生と死の4規則：万能計算が宿る" },
      controls: [
        { kind: "range", id: "gps", label: { en: "speed", ja: "速さ" }, min: 2, max: 20, step: 1, value: 8,
          apply: function (e, v) { e.gps = v; } },
        { kind: "button", id: "rand", label: { en: "Randomize", ja: "ランダム" }, onClick: function (e) { e.seed(e, 0.16); } }
      ],
      setup: function (e) {
        var cell = cellFor(8);
        e.gcell = cell; e.gw = Math.ceil(e.W / cell); e.gh = Math.ceil(e.H / cell);
        e.cur = new Uint8Array(e.gw * e.gh); e.nxt = new Uint8Array(e.gw * e.gh);
        e.acc = 0;
        e.seed = function (env, p) {
          for (var i = 0; i < env.cur.length; i++) env.cur[i] = Math.random() < p ? 1 : 0;
          env._draw(env);
        };
        e._draw = function (env) {
          var c = env.ctx, cl = env.gcell; c.clearRect(0, 0, env.W, env.H); c.fillStyle = coral(0.4);
          for (var i = 0; i < env.cur.length; i++) if (env.cur[i]) c.fillRect((i % env.gw) * cl, ((i / env.gw) | 0) * cl, cl - 1, cl - 1);
        };
        e.seed(e, 0.16);
      },
      pointer: function (e, x, y, type) {
        if (type !== "down") return;
        var cx = clamp(x / e.gcell | 0, 0, e.gw - 1), cy = clamp(y / e.gcell | 0, 0, e.gh - 1);
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var gx = (cx + dx + e.gw) % e.gw, gy = (cy + dy + e.gh) % e.gh; e.cur[gy * e.gw + gx] = 1;
        }
        e._draw(e);
      },
      frame: function (e) {
        e.acc += (e.gps || 8);
        if (e.acc < 60) return;
        e.acc = 0;
        var gw = e.gw, gh = e.gh, cur = e.cur, nxt = e.nxt, x, y, alive = 0;
        for (y = 0; y < gh; y++) {
          var yu = y ? y - 1 : gh - 1, yd = y + 1 < gh ? y + 1 : 0;
          for (x = 0; x < gw; x++) {
            var xl = x ? x - 1 : gw - 1, xr = x + 1 < gw ? x + 1 : 0;
            var n = cur[yu * gw + xl] + cur[yu * gw + x] + cur[yu * gw + xr] + cur[y * gw + xl] + cur[y * gw + xr] + cur[yd * gw + xl] + cur[yd * gw + x] + cur[yd * gw + xr];
            var c0 = cur[y * gw + x];
            nxt[y * gw + x] = (c0 && (n === 2 || n === 3)) || (!c0 && n === 3) ? 1 : 0;
            if (nxt[y * gw + x]) alive++;
          }
        }
        e.cur = nxt; e.nxt = cur;
        e._draw(e);
        if (alive < gw * gh * 0.02) e.seed(e, 0.16);
      }
    }
  };

  function parseTurmite(s) {
    s = String(s || "").toUpperCase().replace(/[^LRNU]/g, "");
    if (s.length < 2) s = "RL";
    if (s.length > 24) s = s.slice(0, 24);
    return s;
  }

  /* ==================================================================== */
  /* FRAMEWORK                                                            */
  /* ==================================================================== */
  var canvas, ctx, W, H, raf, running, spec, env, switchEl, readoutEl, frameNo = 0, lastTs = 0;
  var STEP = 1000 / 60;

  /* keep grid sims to a bounded cell count regardless of viewport size, so a 4K
   * or ultrawide display does not multiply per-frame cost (cell size grows) */
  function cellFor(base) { return Math.max(base, Math.ceil(Math.max(env.W, env.H) / 340)); }

  function sizeCanvas() {
    W = vw(); H = vh();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    env.W = W; env.H = H;
    ctx.clearRect(0, 0, W, H);
  }
  function doSetup() { sizeCanvas(); spec.setup(env); }
  function frame(ts) {
    if (!running) { raf = null; return; }
    raf = window.requestAnimationFrame(frame);
    /* throttle every sim to ~60 steps/sec so behaviour + cost are the same on
     * 60Hz and 120/144Hz displays (rAF fires at the refresh rate) */
    if (lastTs && ts - lastTs < STEP - 1) return;
    lastTs = ts;
    spec.frame(env);
    if (spec.readout && readoutEl && (++frameNo % 12 === 0)) readoutEl.textContent = spec.readout(env);
  }
  function start() { if (!raf && running && !document.hidden) raf = window.requestAnimationFrame(frame); }
  function stop() { if (raf) { window.cancelAnimationFrame(raf); raf = null; } }

  var rt;
  function onResize() {
    window.clearTimeout(rt);
    rt = window.setTimeout(function () {
      /* ignore pure viewport-height jitter (mobile URL bar show/hide) so the sim
       * is not torn down and reseeded on every scroll-direction change */
      if (vw() === W && Math.abs(vh() - H) < 120) return;
      var r = running; stop(); doSetup(); running = r; start();
    }, 200);
  }

  function initialVal(c) {
    var key = "bg." + spec.name + "." + c.id;
    return c.persist ? load(key, c.value) : c.value;
  }

  function makeRow() { var d = document.createElement("div"); d.className = "bg-row"; return d; }
  function makeLabel(c, forId) { var l = document.createElement("label"); l.className = "bg-label"; l.textContent = t(c.label); if (forId) l.setAttribute("for", forId); return l; }

  function buildPanel() {
    var panel = document.createElement("div");
    panel.className = "bg-panel collapsed";

    var fab = document.createElement("button");
    fab.type = "button"; fab.className = "bg-fab";
    fab.setAttribute("aria-label", UI.open); fab.setAttribute("aria-expanded", "false"); fab.setAttribute("aria-controls", "bg-panel-body");
    fab.innerHTML = "<span class='bg-fab-glyph' aria-hidden='true'></span>";
    fab.firstChild.textContent = spec.icon || "🐜";

    var body = document.createElement("div");
    body.className = "bg-body"; body.id = "bg-panel-body"; body.setAttribute("role", "group"); body.setAttribute("aria-labelledby", "bg-panel-title");

    var head = document.createElement("div"); head.className = "bg-head";
    var title = document.createElement("span"); title.className = "bg-title"; title.id = "bg-panel-title"; title.textContent = t(spec.title);
    var close = document.createElement("button"); close.type = "button"; close.className = "bg-close"; close.setAttribute("aria-label", UI.close); close.textContent = "×";
    head.appendChild(title); head.appendChild(close);
    body.appendChild(head);

    if (spec.desc) { var ds = document.createElement("p"); ds.className = "bg-desc"; ds.textContent = t(spec.desc); body.appendChild(ds); }

    var swRow = document.createElement("label"); swRow.className = "bg-row bg-switch-row";
    var swText = document.createElement("span"); swText.textContent = UI.anim;
    var sw = document.createElement("input"); sw.type = "checkbox"; sw.className = "bg-switch"; sw.checked = running; switchEl = sw;
    swRow.appendChild(swText); swRow.appendChild(sw); body.appendChild(swRow);
    sw.addEventListener("change", function () { running = sw.checked; save("bg.on", running ? "1" : "0"); if (running) start(); else stop(); });

    var mirrors = {};
    (spec.controls || []).forEach(function (c) {
      var row = makeRow(), key = "bg." + spec.name + "." + c.id;
      if (c.kind === "range") {
        var id = "bg-c-" + c.id; row.appendChild(makeLabel(c, id));
        var wrap = document.createElement("div"); wrap.className = "bg-range";
        var inp = document.createElement("input"); inp.type = "range"; inp.id = id; inp.min = c.min; inp.max = c.max; inp.step = c.step; inp.value = initialVal(c);
        var out = document.createElement("span"); out.className = "bg-out"; out.textContent = c.fmt ? c.fmt(parseFloat(inp.value)) : inp.value;
        inp.addEventListener("input", function () {
          var v = parseFloat(inp.value); out.textContent = c.fmt ? c.fmt(v) : v; c.apply(env, v);
          if (c.persist) save(key, String(v));
          if (c.resetOnChange) { doSetup(); if (running) start(); }
        });
        wrap.appendChild(inp); wrap.appendChild(out); row.appendChild(wrap);
      } else if (c.kind === "select") {
        var sid = "bg-c-" + c.id; row.appendChild(makeLabel(c, sid));
        var sel = document.createElement("select"); sel.id = sid;
        c.options.forEach(function (o) { var op = document.createElement("option"); op.value = o.value; op.textContent = t(o.label); sel.appendChild(op); });
        sel.value = initialVal(c);
        sel.addEventListener("change", function () {
          c.apply(env, sel.value); if (c.persist) save(key, sel.value);
          if (c.mirror && mirrors[c.mirror]) mirrors[c.mirror].value = sel.value;
          if (c.resetOnChange) { doSetup(); if (running) start(); }
        });
        mirrors[c.id] = sel; row.appendChild(sel);
      } else if (c.kind === "text") {
        var tid = "bg-c-" + c.id; row.appendChild(makeLabel(c, tid)); row.className += " bg-textrow";
        var box = document.createElement("div"); box.className = "bg-textbox";
        var ti = document.createElement("input"); ti.type = "text"; ti.id = tid; ti.value = initialVal(c); ti.maxLength = 24; if (c.mono) ti.className = "bg-mono";
        var ap = document.createElement("button"); ap.type = "button"; ap.className = "bg-btn"; ap.textContent = isJa ? "適用" : "Apply";
        var applyText = function () { c.apply(env, ti.value); ti.value = env.rule || ti.value; if (mirrors.preset) mirrors.preset.value = env.rule; if (c.persist) save(key, ti.value); if (c.resetOnChange) { doSetup(); if (running) start(); } };
        ap.addEventListener("click", applyText);
        ti.addEventListener("keydown", function (ev) { if (ev.key === "Enter") applyText(); });
        box.appendChild(ti); box.appendChild(ap); row.appendChild(box); mirrors[c.id] = ti;
      } else if (c.kind === "button") {
        var b = document.createElement("button"); b.type = "button"; b.className = "bg-btn bg-wide"; b.textContent = t(c.label);
        b.addEventListener("click", function () { c.onClick(env); }); row.appendChild(b);
      }
      body.appendChild(row);
    });

    if (spec.readout) { readoutEl = document.createElement("p"); readoutEl.className = "bg-readout"; readoutEl.textContent = spec.readout(env); body.appendChild(readoutEl); }

    var resetRow = document.createElement("div"); resetRow.className = "bg-row";
    var reset = document.createElement("button"); reset.type = "button"; reset.className = "bg-btn bg-wide"; reset.textContent = UI.reset;
    reset.addEventListener("click", function () { doSetup(); if (running) start(); });
    resetRow.appendChild(reset); body.appendChild(resetRow);

    panel.appendChild(fab); panel.appendChild(body);
    document.body.appendChild(panel);

    function expand(open) { panel.classList.toggle("collapsed", !open); fab.setAttribute("aria-expanded", open ? "true" : "false"); if (open) sw.focus(); }
    fab.addEventListener("click", function () { expand(panel.classList.contains("collapsed")); });
    close.addEventListener("click", function () { expand(false); fab.focus(); });
    panel.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && !panel.classList.contains("collapsed")) { expand(false); fab.focus(); } });
  }

  function init() {
    var name = document.body.getAttribute("data-interaction");
    spec = name && INTERACTIONS[name];
    if (!spec) return;
    spec.name = name;

    canvas = document.createElement("canvas"); canvas.id = "bg-canvas"; canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    document.body.classList.add("bg-active");
    ctx = canvas.getContext("2d");
    env = { ctx: ctx, W: 0, H: 0, coral: coral, drawStuck: spec.drawStuck, name: name };

    running = wantRunning();
    (spec.controls || []).forEach(function (c) { if (c.apply) c.apply(env, initialVal(c)); });
    doSetup();
    buildPanel();

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (running) start(); });
    if (mq) {
      var mf = function () { reduced = mq.matches; running = wantRunning(); if (switchEl) switchEl.checked = running; if (running) start(); else stop(); };
      if (mq.addEventListener) mq.addEventListener("change", mf); else if (mq.addListener) mq.addListener(mf);
    }
    if (spec.pointer) {
      window.addEventListener("pointermove", function (e) { spec.pointer(env, e.clientX, e.clientY, "move"); });
      window.addEventListener("pointerdown", function (e) {
        var el = e.target;
        if (el && el.closest && el.closest("a,button,input,select,textarea,.bg-panel,header")) return;
        spec.pointer(env, e.clientX, e.clientY, "down");
      });
      window.addEventListener("pointerup", function (e) { spec.pointer(env, e.clientX, e.clientY, "up"); });
    }
    if (location.hash.indexOf("bgdebug") >= 0) {
      window.__BG = { env: env, spec: spec, render: function (n) { n = n || 60; for (var i = 0; i < n; i++) spec.frame(env); if (spec.readout && readoutEl) readoutEl.textContent = spec.readout(env); } };
    }
    start();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
