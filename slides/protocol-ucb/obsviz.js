/* obsviz.js — draw a serial protocol x → ops → O → y with optional observer
   modules O_op hanging off each observed op as a 90° side branch (op ↓ O_op → y_op).
   Used by the Method composer and the §8 experiment "observer-subset" widgets.
   - drawChain(ops, observed) -> SVG markup string
   - wireHover(container)     -> delegated hover: highlight all chips of the same op type
   - auto-inits <div class="obswidget" data-protocol="A B C M" data-observable="A,B,C,M" data-title="…">
*/
(function () {
  var FILL = { A: '#dbeafe', B: '#dcfce7', C: '#ede9fe', D: '#ffe4e6', M: '#eef1f4', O: '#e5e7eb' };
  var STK = { A: '#2563eb', B: '#16a34a', C: '#7c3aed', D: '#e11d48', M: '#64748b', O: '#475569' };
  var uid = 0;

  function drawChain(ops, observed) {
    var isObs = (observed instanceof Set) ? function (o) { return observed.has(o); }
                                          : function (o) { return !!(observed && observed[o]); };
    var n = ops.length;
    var anyObs = false; for (var k = 0; k < n; k++) if (isObs(ops[k])) anyObs = true;
    var step = anyObs ? 100 : 82, padL = 52, bw = 46, bh = 32, topY = 42;
    var cx = []; for (var i = 0; i < n; i++) cx.push(padL + i * step);
    var oCx = padL + n * step, yCx = oCx + 56;
    var W = yCx + 28, H = anyObs ? 178 : 96;
    var id = 'ov' + (++uid);
    var A = function (x1, y1, x2, y2, col, mk) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="2" marker-end="url(#' + id + mk + ')"/>'; };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" xmlns="http://www.w3.org/2000/svg" class="ovsvg">';
    s += '<defs><marker id="' + id + 't" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#0f766e"/></marker>';
    s += '<marker id="' + id + 'g" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#16a34a"/></marker></defs>';
    s += '<style>.ovl{font-family:inherit;font-weight:800;font-size:15px;fill:#10151c;text-anchor:middle}.ovs{font-family:inherit;font-size:9px;fill:#5a6573;text-anchor:middle}.ovi{font-family:inherit;font-style:italic;font-weight:700;font-size:13px;fill:#5a6573;text-anchor:middle}.ovob{font-family:inherit;font-weight:800;font-size:12px;fill:#0f766e;text-anchor:middle}</style>';
    // x + first arrow
    s += '<text x="' + (padL - 38) + '" y="' + (topY + 5) + '" class="ovi">x</text>';
    s += A(padL - 28, topY, cx.length ? cx[0] - bw / 2 - 2 : oCx - bw / 2 - 2, topY, '#0f766e', 't');
    // main chain arrows
    for (var i = 0; i < n; i++) { var nx = (i < n - 1) ? cx[i + 1] : oCx; s += A(cx[i] + bw / 2, topY, nx - bw / 2 - 2, topY, '#0f766e', 't'); }
    s += A(oCx + bw / 2, topY, yCx - 11, topY, '#0f766e', 't');
    s += '<text x="' + yCx + '" y="' + (topY + 5) + '" class="ovi">y</text>';
    // op boxes
    for (var i = 0; i < n; i++) {
      var c = cx[i], op = ops[i], ob = isObs(op);
      s += '<rect x="' + (c - bw / 2) + '" y="' + (topY - bh / 2) + '" width="' + bw + '" height="' + bh + '" rx="9" fill="' + (FILL[op] || '#eee') + '" stroke="' + (STK[op] || '#888') + '" stroke-width="' + (ob ? 2.6 : 2) + '" data-op="' + op + '" class="ovchip"/>';
      s += '<text x="' + c + '" y="' + (topY + 5) + '" class="ovl" data-op="' + op + '">' + op + '</text>';
    }
    // terminal O + main-y already drawn; O box on top
    s += '<rect x="' + (oCx - bw / 2) + '" y="' + (topY - bh / 2) + '" width="' + bw + '" height="' + bh + '" rx="9" fill="' + FILL.O + '" stroke="' + STK.O + '" stroke-width="2"/><text x="' + oCx + '" y="' + (topY + 5) + '" class="ovl">O</text>';
    // observer side branches  op ↓ O_op → y_op
    for (var i = 0; i < n; i++) {
      var op = ops[i]; if (!isObs(op)) continue; var c = cx[i];
      var oy = topY + 60;
      s += A(c, topY + bh / 2 + 1, c, oy - 2, '#16a34a', 'g');
      s += '<rect x="' + (c - 25) + '" y="' + oy + '" width="50" height="30" rx="8" fill="#ecfdf5" stroke="#16a34a" stroke-width="1.8" data-op="' + op + '" class="ovchip"/>';
      s += '<text x="' + c + '" y="' + (oy + 19) + '" class="ovob" data-op="' + op + '">O<tspan baseline-shift="sub" font-size="8">' + op + '</tspan></text>';
      var oyc = oy + 15;
      s += A(c + 25, oyc, c + 40, oyc, '#16a34a', 'g');
      s += '<text x="' + (c + 52) + '" y="' + (oyc + 4) + '" class="ovi" fill="#166534">y<tspan baseline-shift="sub" font-size="8">' + op + '</tspan></text>';
      s += '<text x="' + c + '" y="' + (oy + 44) + '" class="ovs">' + op + ' 直後 s*<tspan baseline-shift="sub" font-size="7">' + op + '</tspan>（2D・学習時のみ）</text>';
    }
    return s + '</svg>';
  }

  function wireHover(container) {
    container.addEventListener('mouseover', function (e) {
      var t = e.target.closest && e.target.closest('[data-op]'); if (!t) return;
      var op = t.getAttribute('data-op'), svg = t.ownerSVGElement || container.querySelector('svg'); if (!svg) return;
      svg.classList.add('ovhl');
      svg.querySelectorAll('[data-op]').forEach(function (nn) { nn.classList.toggle('ovon', nn.getAttribute('data-op') === op); });
    });
    container.addEventListener('mouseleave', function () {
      container.querySelectorAll('svg.ovhl').forEach(function (svg) { svg.classList.remove('ovhl'); svg.querySelectorAll('.ovon').forEach(function (nn) { nn.classList.remove('ovon'); }); });
    });
  }

  function initWidget(el) {
    var ops = (el.getAttribute('data-protocol') || 'A B C M').replace(/[^A-Za-z ]/g, '').trim().split(/\s+/).filter(Boolean);
    var observable = (el.getAttribute('data-observable') || 'A,B,C,M').split(/[ ,]+/).filter(Boolean);
    var title = el.getAttribute('data-title') || '';
    var observed = {};
    var h = '';
    if (title) h += '<div class="obwtitle">' + title + '</div>';
    h += '<div class="obwbar"><span class="obwlab">観測する操作型 S：</span>';
    observable.forEach(function (op) { h += '<button type="button" class="obwtog op-' + op + '" data-op="' + op + '">O<sub>' + op + '</sub></button>'; });
    h += '<button type="button" class="obwtog util" data-act="all">全部</button><button type="button" class="obwtog util" data-act="none">なし</button>';
    h += '<span class="obwcount"></span></div><div class="obwstage"></div><div class="obwmsg"></div>';
    el.innerHTML = h;
    var stage = el.querySelector('.obwstage'), msg = el.querySelector('.obwmsg'), cnt = el.querySelector('.obwcount');
    function render() {
      stage.innerHTML = drawChain(ops, observed);
      el.querySelectorAll('.obwtog[data-op]').forEach(function (b) { b.classList.toggle('on', !!observed[b.getAttribute('data-op')]); });
      var S = observable.filter(function (o) { return observed[o]; });
      cnt.textContent = '（' + (S.length ? 'S = {' + S.join(', ') + '}' : 'S = ∅（端末のみ）') + '  ·  全 2⁴ = 16 通り）';
      msg.innerHTML = S.length
        ? '選んだ操作型の直後に観測器 <b>' + S.map(function (o) { return 'O_' + o; }).join('・') + '</b> が置かれ、直列プロトコルの横（下）に <b>op ↓ O<sub>op</sub> → y<sub>op</sub></b> として並ぶ（学習時のみ・並列非破壊）。モジュール型にカーソルを合わせると、共有される同一操作が全体で強調される（重み共有）。'
        : '観測部分集合は空（S = ∅ ＝ 端末観測のみ）。上のボタンで S を選ぶと、その操作型の直後に観測器 O<sub>op</sub> が並ぶ（全 16 通り）。';
    }
    el.querySelector('.obwbar').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.op) observed[b.dataset.op] = !observed[b.dataset.op];
      else if (b.dataset.act === 'all') observable.forEach(function (o) { observed[o] = true; });
      else if (b.dataset.act === 'none') observable.forEach(function (o) { observed[o] = false; });
      render();
    });
    wireHover(stage);
    render();
  }

  function init() { document.querySelectorAll('.obswidget').forEach(initWidget); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.__obsviz = { drawChain: drawChain, wireHover: wireHover, initWidget: initWidget };
})();
