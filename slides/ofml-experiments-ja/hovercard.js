/* hovercard.js — shared cross-reference preview (Wikipedia-style).
   Hover a .xref/.cite to preview:
     - data-ref  -> theorem/assumption statement (window.__REFS__)
     - data-cite -> bibliography entry (window.__CITES__)
     - .xref href #c1..#c4 on experiments.html -> that claim (window.__CLAIMMAP__)
     - .xref href #<theorem/lemma/assumption key> -> that statement (window.__REFS__)
     - .xref href to an experiment page in window.__FIGMAP__ -> that figure
   Self-attaches document listeners on load. Loaded after refs.js. */
(function () {
  var card = null, hideT = null;
  function mk() {
    if (card) return card;
    card = document.createElement('div'); card.className = 'hovercard';
    document.body.appendChild(card);
    card.addEventListener('mouseenter', function () { clearTimeout(hideT); });
    card.addEventListener('mouseleave', hide);
    return card;
  }
  function hide() { hideT = setTimeout(function () { if (card) card.style.display = 'none'; }, 180); }
  function place(a, c) {
    var r = a.getBoundingClientRect();
    c.style.top = (window.scrollY + r.bottom + 8) + 'px';
    var left = window.scrollX + r.left;
    left = Math.min(left, window.scrollX + document.documentElement.clientWidth - c.offsetWidth - 16);
    c.style.left = Math.max(8, left) + 'px';
  }
  function figFor(a) {
    var M = window.__FIGMAP__ || {}; var href = a.getAttribute('href'); if (!href) return null;
    var page; try { page = new URL(href, a.baseURI); } catch (e) { return null; }
    var fname = page.pathname.split('/').pop(); var f = M[fname]; if (!f) return null;
    var url; try { url = new URL('../figures/' + f.name, page).href; } catch (e) { return null; }
    return { url: url, cap: f.cap };
  }
  // Preview for an in-text .xref that jumps to a page anchor: a claim
  // (#c1..#c4 on experiments.html) or a theorem/lemma/assumption anchor
  // (fragment present as a key in __REFS__). Returns HTML or null.
  function anchorHtml(a) {
    var href = a.getAttribute('href'); if (!href) return null;
    var u; try { u = new URL(href, a.baseURI); } catch (e) { return null; }
    var hash = u.hash.replace(/^#/, ''); if (!hash) return null;
    var page = u.pathname.split('/').pop();
    var CM = window.__CLAIMMAP__ || {};
    if (page === 'experiments.html' && CM['#' + hash]) {
      var cl = CM['#' + hash];
      return '<div class="hc-k" style="color:' + cl.color + '">' + cl.n + ' &middot; ' + cl.title + '</div><div class="hc-b">' + cl.body + '</div>';
    }
    var R = window.__REFS__ || {};
    if (R[hash]) {
      var r = R[hash];
      return '<div class="hc-k">' + r.kind + ' ' + r.num + (r.title ? ' &middot; ' + r.title : '') + '</div><div class="hc-b">' + r.statement + '</div>';
    }
    return null;
  }
  function show(a) {
    var ref = a.getAttribute('data-ref'), cite = a.getAttribute('data-cite');
    var R = window.__REFS__ || {}, C = window.__CITES__ || {};
    var htmlc = '', fig = false;
    if (ref && R[ref]) {
      htmlc = '<div class="hc-k">' + R[ref].kind + ' ' + R[ref].num + (R[ref].title ? ' &middot; ' + R[ref].title : '') + '</div><div class="hc-b">' + R[ref].statement + '</div>';
    } else if (cite && C[cite]) {
      htmlc = '<div class="hc-b">' + C[cite] + '</div>';
    } else if (a.classList.contains('xref')) {
      var ah = anchorHtml(a);
      if (ah) { htmlc = ah; }
      else {
        var f = figFor(a); if (!f) return;
        htmlc = '<div class="hc-k">' + f.cap + '</div><img alt="" src="' + f.url + '">';
        fig = true;
      }
    } else return;
    var c = mk(); clearTimeout(hideT);
    c.className = 'hovercard' + (fig ? ' fig' : '');
    c.innerHTML = htmlc; c.style.display = 'block';
    place(a, c);
    if (fig) { var im = c.querySelector('img'); if (im) im.addEventListener('load', function () { place(a, c); }, { once: true }); }
    if (window.MathJax && MathJax.typesetPromise) { MathJax.typesetClear && MathJax.typesetClear([c]); MathJax.typesetPromise([c]); }
  }
  document.addEventListener('mouseover', function (e) { var a = e.target.closest && e.target.closest('.xref,.cite'); if (a) { clearTimeout(hideT); show(a); } });
  document.addEventListener('mouseout', function (e) { var a = e.target.closest && e.target.closest('.xref,.cite'); if (a) hide(); });
})();
