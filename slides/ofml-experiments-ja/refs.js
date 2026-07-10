window.__REFS__={
"ass:base-model":{"kind":"仮定","num":"1","title":"入力空間と潜在関数","statement":"<p>\\((\\Omega,\\mathcal{F},\\mathbb{P})\\) を確率空間、\\(\\mathcal{X}\\) を非空コンパクト距離空間とする。\\(C(\\mathcal{X})\\) は一様ノルムの下で可分バナッハ空間。未知の潜在関数 \\(G:\\Omega\\to C(\\mathcal{X})\\) はボレル可測で \\(\\mathbb{E}\\left\\lVert G\\right\\rVert_\\infty^2<\\infty\\)。</p>"},
"ass:correct-posterior":{"kind":"仮定","num":"2","title":"正しい事後分布","statement":"<p>各 \\(n\\) について \\(\\Pi_n=\\operatorname{Law}(G\\mid\\mathcal{H}_n)\\) を \\(G\\) の \\(\\mathcal{H}_n\\) に関する正則条件付き分布の版とする。</p>"},
"lem:banach-levy":{"kind":"補題","num":"2","title":"閉じた Banach 値 Lévy 上方収束","statement":"<p>可分バナッハ空間 \\(E\\) と \\(Z\\in L^1(\\Omega;E)\\) について \\(Z_n=\\mathbb{E}[Z\\mid\\mathcal{F}_n]\\) は \\(Z_\\infty=\\mathbb{E}[Z\\mid\\mathcal{F}_\\infty]\\) へ a.s. かつ \\(L^1\\) で収束する。</p>"},
"prop:common-moment-convergence":{"kind":"命題","num":"1","title":"共通事後モーメントの一様収束","statement":"<p>\\(\\mu_n\\to\\mu_\\infty\\) が \\(C(\\mathcal{X})\\) で、\\(M_n\\to M_\\infty\\) が \\(C(\\mathcal{X}\\times\\mathcal{X})\\) で a.s. 成り立ち、したがって \\(v_n\\to v_\\infty\\) も \\(C(\\mathcal{X})\\) で。Banach 値 Lévy 上方収束の帰結。</p>"},
"ass:noiseless":{"kind":"仮定","num":"3","title":"無雑音観測・MaxVar 近似最大化","statement":"<p>\\(Y_{n+1}=G(X_{n+1})\\)（無雑音）で \\(v_n(X_{n+1})\\ge\\sup_x v_n(x)-\\eta_n^{\\mathrm{MaxVar}}\\)、\\(\\eta_n^{\\mathrm{MaxVar}}\\to0\\)。</p>"},
"thm:noiseless-maxvar":{"kind":"定理","num":"1","title":"無雑音 MaxVar 関数学習一致性","statement":"<p>無雑音・MaxVar の下で \\(\\left\\lVert v_n\\right\\rVert_\\infty\\to0\\)、\\(G=\\mu_\\infty\\)、\\(\\left\\lVert\\mu_n-G\\right\\rVert_\\infty\\to0\\) が a.s.。補間性 \\(v_{n+1}(X_{n+1})=0\\) による導入例。</p>"},
"ass:finite-variance":{"kind":"仮定","num":"4","title":"加法的・条件付き不偏・有限分散観測","statement":"<p>\\(Y_{n+1}=G(X_{n+1})+\\varepsilon_{n+1}\\)、\\(\\mathbb{E}[\\varepsilon_{n+1}\\mid G,\\mathcal{H}_n,X_{n+1}]=0\\)、\\(\\operatorname{Var}(\\varepsilon_{n+1}\\mid\\cdots)\\le\\tau^2\\)。劣ガウス性は不要（\\(\\tau^2=0\\) で無雑音を含む）。</p>"},
"ass:full-support":{"kind":"仮定","num":"5","title":"台が全体である評価測度","statement":"<p>\\(\\lambda\\) は \\(\\mathcal{X}\\) 上の有限ボレル測度で \\(\\operatorname{supp}(\\lambda)=\\mathcal{X}\\)。残差不確実性 \\(H_n=\\int v_n\\,d\\lambda\\) を積分する測度。</p>"},
"ass:posterior-eq":{"kind":"仮定","num":"6","title":"事後二乗平均同程度連続性","statement":"<p>ある連続率 \\(\\rho\\)（\\(\\rho(r)\\to0\\)）で全 \\(n\\) と \\(x,u\\) に \\(\\mathbb{E}[(G(u)-G(x))^2\\mid\\mathcal{H}_n]\\le\\rho(d(u,x))^2\\)。</p>"},
"lem:supermartingale":{"kind":"補題","num":"3","title":"残差不確実性の上マルチンゲール性","statement":"<p>\\(H_n=\\int v_n\\,d\\lambda\\) は非負上マルチンゲールで、選択点で \\(D_n=H_n-\\mathbb{E}[H_{n+1}\\mid\\mathcal{H}_n]=\\Delta^{\\mathrm{IVR}}_n(X_{n+1})\\)。したがって \\(\\sup_x\\Delta^{\\mathrm{IVR}}_n(x)\\to0\\) a.s.</p>"},
"lem:linear-lower":{"kind":"補題","num":"4","title":"雑音付き IVR の線形予測子下界","statement":"<p>\\(\\displaystyle\\Delta^{\\mathrm{IVR}}_n(x)\\ge\\int_{\\mathcal{X}}\\frac{K_n(u,x)^2}{v_n(x)+\\tau^2}\\,\\lambda(du)\\)。\\(L^2\\) 直交射影による分散説明量の下界。</p>"},
"prop:global-vanishing":{"kind":"命題","num":"2","title":"雑音付き IVR/SUR による全域分散消失","statement":"<p>\\(\\left\\lVert v_n\\right\\rVert_\\infty\\to0\\) a.s.。分散が残ると近傍下界＋全台小球質量で \\(\\sup_x\\Delta^{\\mathrm{IVR}}_n\\) が正に残り矛盾（背理法）。</p>"},
"thm:cx-main":{"kind":"定理","num":"2","title":"雑音付き IVR/SUR 関数学習一致性（主定理）","statement":"<p>仮定 1–6 の下で、正しい \\(C(\\mathcal{X})\\) 値事後に対し \\(G=\\mu_\\infty\\)、\\(\\left\\lVert\\mu_n-G\\right\\rVert_\\infty\\to0\\) が a.s.。ガウス更新公式に依存しない。</p>"},
"ass:model-modulus":{"kind":"仮定","num":"7","title":"モデル水準の二乗可積分連続率","statement":"<p>非負確率変数 \\(\\Lambda\\)（\\(\\mathbb{E}[\\Lambda^2]<\\infty\\)）と \\(\\omega(r)\\to0\\) で \\(|G(u)-G(x)|\\le\\Lambda\\,\\omega(d(u,x))\\) a.s.</p>"},
"prop:model-modulus":{"kind":"命題","num":"3","title":"モデル水準連続率 → 事後同程度連続性","statement":"<p>仮定 7 から仮定 6 が従う。\\(\\mathbb{E}[\\Lambda^2\\mid\\mathcal{H}_n]\\) の上方収束で \\(\\rho(r)=\\sqrt{C_\\Lambda}\\,\\omega(r)\\)。</p>"},
"ass:transfer-diagnostics":{"kind":"仮定","num":"8","title":"OFML 転移診断 C1–C5","statement":"<p>C1 vocabulary・C2 semantics・C3 coverage（残差 \\(\\rho_j\\)）・C4 target-relevant identifiability（残差 \\(r^{\\mathrm{id}}_{j,q}\\)、定数 \\(K_j\\)）・C5 Lipschitz stability。任意 C6 realizability。転移が成立しうるかの診断条件。</p>"},
"prop:ofml-linear":{"kind":"命題","num":"4","title":"加法アフィン OFML の識別可能性（rank 条件）","statement":"<p>\\(r^{\\mathrm{id}}=0\\Leftrightarrow\\ker\\Phi\\subseteq\\ker\\Psi\\Leftrightarrow\\operatorname{row}(\\Psi)\\subseteq\\operatorname{row}(\\Phi)\\)。\\(\\Phi\\)＝source 感度作用素、\\(\\Psi\\)＝target 感度作用素。</p>"},
"lem:ofml-pushforward":{"kind":"補題","num":"5","title":"OFML target posterior の pushforward","statement":"<p>\\(T(\\theta)(x)=\\operatorname{Eval}_q(p_\\star;\\theta;x)\\) は可測で \\(G=T(\\theta)\\) は \\(C(\\mathbb{X})\\) 値二乗可積分。\\((T)_\\#\\Pi_n^\\theta=\\operatorname{Law}(G\\mid\\mathcal{H}_n^{\\mathrm{tar}})\\)。</p>"},
"lem:ofml-bridge":{"kind":"補題","num":"6","title":"OFML Lipschitz bridge","statement":"<p>DAG の module-wise Lipschitz 定数から \\(|G_\\theta(u)-G_\\theta(x)|\\le\\Lambda_{p_\\star,q}(\\theta)\\,d(u,x)\\)、\\(\\Lambda_{p_\\star,q}=\\sum_v c_v\\sum_{\\pi:v\\to q}\\prod_w L_{\\tau(w)}(\\theta)\\)。仮定 6 を discharge。</p>"},
"thm:ofml-active":{"kind":"定理","num":"3","title":"OFML target active correction の終端応答一致性","statement":"<p>pushforward・全台 \\(\\lambda\\)・Lipschitz bridge の下で主定理を \\(\\mathcal{X}=\\mathbb{X}\\) に適用し \\(\\left\\lVert\\mu_n-G\\right\\rVert_\\infty\\to0\\) a.s.。well-specified なら真の終端 \\(f_{p_\\star}^{\\dagger}\\) へ。</p>"},
"prop:ofml-rescue":{"kind":"命題","num":"5","title":"転移が破れても能動補正で救える","statement":"<p>\\(r^{\\mathrm{id}}>0\\) でも、target 終端の直接能動観測（source は初期履歴のみ）で \\(\\left\\lVert\\mu_n-f_{p_\\star}^{\\dagger}\\right\\rVert_\\infty\\to0\\) a.s.</p>"},
"prop:ofml-depth-limit":{"kind":"命題","num":"6","title":"深さが bridge 定数と近似推論に与える影響","statement":"<p>chain depth \\(D\\) で bridge 係数は \\(\\Lambda_{p_\\star,q}(\\theta)\\asymp\\prod_{k=1}^{D}L_k(\\theta)\\) を含む。中間観測・内部 node の部分評価は \\(\\Lambda_{p_\\star,q}\\) と近似推論誤差 \\(d_{\\Delta,n}\\) の両方を改善し深さ限界を緩める。</p>"}
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
