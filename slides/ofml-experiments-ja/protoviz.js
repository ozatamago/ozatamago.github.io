/* protoviz.js — render <div class="protoset" data-protocols="A B C M O;C B A M O" ...>
   into interactive module-colored protocol chains. Hovering a module type
   highlights every occurrence across the set (shows operation-level sharing).
   data attributes:
     data-protocols : ";"-separated protocol strings (letters = op types, e.g. "A B C M O")
     data-title     : optional HTML title above the chains
     data-kind      : "source" | "target" | "" (accent color)
     data-labels    : optional ";"-separated per-chain labels (same length as protocols)
     data-cols      : "1" to lay chains out in a multi-column grid
     data-legend    : "0" to hide the legend
*/
(function () {
  var NAMES = { A: '操作 A', B: '操作 B', C: '操作 C', D: '操作 D', M: '共有ミキサ M', O: '端末観測器 O' };
  function chipsOf(proto) {
    return proto.replace(/[^A-Za-z]/g, '').toUpperCase().split('');
  }
  function esc(s){return (s||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function render(el) {
    var raw = (el.getAttribute('data-protocols') || '').trim();
    if (!raw) return;
    var protos = raw.split(';').map(function (s) { return s.trim(); }).filter(Boolean);
    var labels = (el.getAttribute('data-labels') || '').split(';');
    var kind = el.getAttribute('data-kind') || '';
    var title = el.getAttribute('data-title') || '';
    var cols = el.getAttribute('data-cols') === '1';
    var showLegend = el.getAttribute('data-legend') !== '0';
    if (kind) el.classList.add('k-' + kind);

    var used = {};
    var html = '';
    if (title) html += '<div class="ptitle">' + title + '</div>';
    html += '<div class="pgrid' + (cols ? ' cols' : '') + '">';
    protos.forEach(function (p, i) {
      var chips = chipsOf(p);
      var lab = (labels[i] || '').trim();
      html += '<div class="pchain">';
      if (lab) html += '<span class="plabel">' + esc(lab) + '</span>';
      html += '<span class="pio">x</span>';
      chips.forEach(function (c) {
        used[c] = true;
        html += '<span class="parrow">&rsaquo;</span>';
        html += '<span class="pchip op-' + c + '" data-op="' + c + '" title="' + (NAMES[c] || c) + '">' + c + '</span>';
      });
      html += '<span class="parrow">&rsaquo;</span><span class="pio">y</span>';
      html += '</div>';
    });
    html += '</div>';
    if (showLegend) {
      html += '<div class="plegend">';
      ['A', 'B', 'C', 'D', 'M', 'O'].forEach(function (c) {
        if (used[c]) html += '<span data-op="' + c + '"><i class="sw op-' + c + '"></i>' + (NAMES[c] || c) + '</span>';
      });
      html += '</div>';
    }
    el.innerHTML = html;

    // hover: highlight all chips of the same op type across this set
    function setHi(op) {
      if (!op) { el.classList.remove('hilit'); el.querySelectorAll('.pchip.hl').forEach(function (n) { n.classList.remove('hl'); }); return; }
      el.classList.add('hilit');
      el.querySelectorAll('.pchip').forEach(function (n) {
        if (n.getAttribute('data-op') === op) n.classList.add('hl'); else n.classList.remove('hl');
      });
    }
    el.addEventListener('mouseover', function (e) {
      var t = e.target.closest('[data-op]'); if (t) setHi(t.getAttribute('data-op'));
    });
    el.addEventListener('mouseleave', function () { setHi(null); });
  }
  function init() { document.querySelectorAll('.protoset').forEach(render); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.__protoviz = { render: render, init: init };
})();
