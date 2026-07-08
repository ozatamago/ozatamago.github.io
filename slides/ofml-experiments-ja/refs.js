window.__REFS__={
"thm:kt-main":{"kind":"定理","num":"1","title":"プロトコル組み替えに対する知識転移上界","statement":"<p>条件が成り立つとき、任意の候補モジュール集合 \\(H\\) と観測可能ノード \\(q\\in\\Obs(p_\\star)\\) について \\[ d_{\\star,q}(H,F^\\dagger) \\le C_{\\mathrm{KT}}(p_\\star,q)\\,d_{\\mathrm{train}}(H,F^\\dagger) + R_{\\mathrm{id/cov}}(p_\\star,q). \\] source 上の観測誤差が target 上の観測誤差を制御する条件付き主張。</p>"},
"lem:local-id":{"kind":"補題","num":"1","title":"目標関連モジュール識別","statement":"<p>局所入力被覆と目標関連識別可能性の下で、任意の \\(z\\in\\Zcal_j^\\star\\) について \\[ \\norm{\\Pi_{j,q}(h_j(z))-\\Pi_{j,q}(f_j^\\dagger(z))} \\le K_j\\,d_{\\mathrm{train}}(H,F^\\dagger)+r_{j,q}^{\\mathrm{id}}+\\rho_j. \\]</p>"},
"lem:dag-prop":{"kind":"補題","num":"2","title":"DAG 上の目標関連誤差伝播","statement":"<p>各ノード \\(v\\in\\Anc(q)\\) の目標関連局所誤差が \\(\\varepsilon^{\\mathrm{rel}}_{\\tau(v),q}\\) で抑えられるとき \\[ d_{\\star,q}(H,F^\\dagger)\\le\\sum_{v\\in\\Anc(q)}B_v(p_\\star,q)\\,\\varepsilon^{\\mathrm{rel}}_{\\tau(v),q}. \\] Lipschitz 積による下流増幅。</p>"},
"cor:learned":{"kind":"系","num":"1","title":"学習済みモデルの目標誤差","statement":"<p>\\(d_{\\mathrm{train}}(H_n,F^\\dagger)\\le\\epsilon_n+\\eta\\) なら \\(d_{\\star,q}(H_n,F^\\dagger)\\le C_{\\mathrm{KT}}(\\epsilon_n+\\eta)+R_{\\mathrm{id/cov}}\\)。特に \\(\\eta=0,r^{\\mathrm{id}}=0,\\rho=0,\\epsilon_n\\to0\\) なら \\(d_{\\star,q}\\to0\\)。</p>"},
"ass:vocab":{"kind":"仮定","num":"1","title":"同一モジュール語彙と同一操作的意味論","statement":"<p>目標プロトコルに現れるモジュール型は訓練プロトコル/事前分布で扱われる型集合に含まれ、両者は同じ入力構成写像 \\(\\iota_{p,v}\\) と実行規則に従う。</p>"},
"ass:coverage":{"kind":"仮定","num":"2","title":"局所入力領域の被覆","statement":"<p>\\(\\Zcal_j^\\star\\subseteq\\Zcal_j^{\\mathrm{train}}\\)（完全被覆）、または任意の \\(z\\in\\Zcal_j^\\star\\) に \\(\\norm{z-\\tilde z}\\le\\Delta_j\\) を満たす \\(\\tilde z\\in\\Zcal_j^{\\mathrm{train}}\\) が存在（有限被覆、残差 \\(\\rho_j\\)）。</p>"},
"ass:identify":{"kind":"仮定","num":"3","title":"目標関連識別可能性","statement":"<p>目標関連射影 \\(\\Pi_{j,q}\\) について \\(\\norm{\\Pi_{j,q}(g_j(z))-\\Pi_{j,q}(\\tilde g_j(z))}\\le K_j\\,d_{\\mathrm{train}}(G,\\widetilde G)+r_{j,q}^{\\mathrm{id}}\\)。\\(r_{j,q}^{\\mathrm{id}}\\) は訓練だけでは識別できない成分。</p>"},
"ass:lipschitz":{"kind":"仮定","num":"4","title":"Lipschitz 安定性","statement":"<p>各参照モジュールと入力構成写像は目標プロトコル上の局所入力領域で Lipschitz 連続。局所誤差は下流へ有限倍でしか伝播しない。</p>"},
"ass:realizable":{"kind":"仮定","num":"5","title":"実現可能性・近似可能性","statement":"<p>参照モジュール集合 \\(F^\\dagger\\in\\Hcal\\) が存在し、学習済みモデルは \\(d_{\\mathrm{train}}(H_n,F^\\dagger)\\le\\epsilon_n+\\eta\\)（\\(\\epsilon_n\\)＝統計/最適化誤差、\\(\\eta\\)＝近似誤差）。</p>"}
};
window.__CITES__={
"astudillo2021bofn":"[bofn] R. Astudillo and P. I. Frazier. Bayesian Optimization of Function Networks. NeurIPS, 2021.",
"buathong2024pkgfn":"[pKGFN] P. Buathong et al. Bayesian Optimization of Function Networks with Partial Evaluations. ICML, PMLR 235, 2024.",
"tom2024sdl":"[SDL] G. Tom et al. Self-Driving Laboratories for Chemistry and Materials Science. Chemical Reviews, 2024.",
"burger2020mobile":"[mobile-chemist] B. Burger et al. A mobile robotic chemist. Nature 583:237–241, 2020.",
"smith2026gpt5lab":"[GPT5-lab] A. A. Smith et al. Using a GPT-5-driven autonomous lab to optimize cell-free protein synthesis. bioRxiv, 2026.",
"boiko2023coscientist":"[Coscientist] D. A. Boiko et al. Autonomous chemical research with large language models. Nature 624:570–578, 2023.",
"bran2024chemcrow":"[ChemCrow] A. M. Bran et al. Augmenting large language models with chemistry tools. Nature Machine Intelligence 6:525–535, 2024.",
"swersky2013mtbo":"[MTBO] K. Swersky, J. Snoek, R. P. Adams. Multi-Task Bayesian Optimization. NeurIPS 26, 2013.",
"tighineanu2022gptransfer":"[GP-transfer] P. Tighineanu et al. Transfer Learning with Gaussian Processes for Bayesian Optimization. AISTATS, PMLR 151, 2022.",
"poloczek2017miso":"[MISO] M. Poloczek, J. Wang, P. I. Frazier. Multi-Information Source Optimization. NeurIPS 30, 2017.",
"damianou2013deepgp":"[DeepGP] A. Damianou, N. D. Lawrence. Deep Gaussian Processes. AISTATS, PMLR 31, 2013.",
"bartley2023labop":"[LabOP] B. Bartley et al. Building an Open Representation for Biological Protocols. ACM JETC 19(3), 2023."
};
// figure preview map: experiment-page basename -> {name, cap}. Figures live at <root>/figures/,
// and every target page is under <root>/experiments/, so "../figures/<name>" resolves relative
// to the referenced page regardless of where the link sits.
window.__FIGMAP__={
"c1-fig1.html":{name:"fig1_linear.png",cap:"図 1a — 線形ファミリの s0–s7 ゼロショット転移"},
"c1-order.html":{name:"order_identifiability_grid.png",cap:"図 4 — order 識別可能性グリッド"},
"c1-count.html":{name:"count_identifiability.png",cap:"図 5 — count 識別可能性（反復 / 外挿）"},
"c2-failures.html":{name:"fig1_nonlinear.png",cap:"図 1b — 非線形 s0–s7（正直な失敗を含む）"},
"c2-tradeoff.html":{name:"fig3_latent_tradeoff.png",cap:"図 3a — 識別可能性と容量のトレードオフ"},
"c3-dsweep.html":{name:"fig2_dsweep_curves.png",cap:"図 2 — 潜在次元 d を横断した能動学習曲線"},
"c3-gain.html":{name:"fig3_latent_tradeoff.png",cap:"図 3b,c — ランダムに対する能動学習の利得"},
"c4-s0.html":{name:"fig1_nonlinear_s0_traceablation2.png",cap:"図 6 — s0 中間観測アブレーション"},
"c4-order-linear.html":{name:"order_traceablation2_linear_obs_ABCM.png",cap:"図 7 — 観測下の order 識別（線形）"},
"c4-order-nonlinear.html":{name:"order_traceablation2_nonlinear_obs_ABCM.png",cap:"図 8 — 観測下の order 識別（非線形）"},
"c4-count.html":{name:"count_traceablation2_obs_AM.png",cap:"図 9 — 観測下の count 識別（サブセット AM）"}
};

// claim preview map: #anchor on experiments.html -> {n, color, title, body}.
window.__CLAIMMAP__={
"#c1":{n:"主張 1",color:"#0ea5a4",title:"合成は転移を助ける",body:"共有操作モジュールの合成として扱うと、source で学んだ知識を未知 target へ再結合できる。順序・構造が本質的な場面で決定的。"},
"#c2":{n:"主張 2",color:"#6366f1",title:"terminal-only の識別限界",body:"未知操作・意味論シフト・誤特定・三体相互作用はゼロショットで識別不能。余剰容量は識別を不安定化しうる。"},
"#c3":{n:"主張 3",color:"#f59e0b",title:"中間観測が限界を修復する",body:"学習中の中間観測は識別不能→可能へ変換。使えるのは合成的モデルのみ（ブラックボックスには不活性）。"},
"#c4":{n:"主張 4",color:"#0f766e",title:"能動学習が補正する（容量が許す限り）",body:"target ラベルで失敗した相互作用も補正。情報を用いた獲得がランダムに勝つには残差を表現できる容量が要る。"}
};
