/* refs.js — ProtocolUCB cross-reference tables (SKELETON).
   Same shape as the OFML artifact: fill each map as the content lands.
   - __REFS__     : theorem/lemma/assumption previews, keyed by anchor id
   - __CITES__    : bibliography previews, keyed by cite-<key>
   - __FIGMAP__   : experiment page -> headline figure
   - __CLAIMMAP__ : #c1..#cN -> claim card preview
   - __PAGEMAP__  : page basename -> one-line page summary (hover fallback)
*/
window.__REFS__={
"ass:placeholder":{"kind":"仮定","num":"1","title":"（TODO）設定と仮定","statement":"<p>TODO：ProtocolUCB の基本設定（アーム空間・報酬モデル・雑音）をここに書く。</p>"},
"thm:placeholder":{"kind":"定理","num":"1","title":"（TODO）主定理：リグレット上界","statement":"<p>TODO：主定理の主張をここに書く。</p>"}
};
window.__CITES__={
"cite-auer2002ucb":{title:"Finite-time Analysis of the Multiarmed Bandit Problem",body:"P. Auer, N. Cesa-Bianchi, P. Fischer. <em>Machine Learning</em>, 47:235–256, 2002."},
"cite-srinivas2010gpucb":{title:"GP-UCB",body:"N. Srinivas, A. Krause, S. M. Kakade, M. Seeger. <em>ICML</em>, 2010."}
};
window.__FIGMAP__={};
window.__CLAIMMAP__={
"#c1":{n:"主張 1",color:"#0ea5a4",title:"（TODO）主張 1",body:"TODO：1 つ目の実験主張を 1–2 文で。"},
"#c2":{n:"主張 2",color:"#0f766e",title:"（TODO）主張 2",body:"TODO：2 つ目の実験主張を 1–2 文で。"}
};
window.__PAGEMAP__={
"index.html":{title:"Overview",body:"ProtocolUCB の全体像。TODO：1–2 文の要約。"},
"background.html":{title:"Background",body:"TODO：バンディット／自律実験の文脈と先行研究の位置づけ。"},
"problem.html":{title:"Problem setting",body:"TODO：アーム空間・報酬・雑音・リグレット指標の定式化。"},
"method.html":{title:"ProtocolUCB",body:"TODO：アルゴリズムの構成と信頼上界の作り方。"},
"theory.html":{title:"Theoretical statement and proofs",body:"TODO：主定理とその証明。"},
"experiments.html":{title:"Experiments",body:"TODO：実験目的・設定・結果・考察。"},
"references.html":{title:"References",body:"参考文献。"}
};
