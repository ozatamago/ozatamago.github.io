window.__REFS__={
"ass:base-model":{"kind":"Assumption","num":"1","title":"Input space and latent function","statement":"<p>\\((\\Omega,\\mathcal{F},\\mathbb{P})\\) is a probability space and \\(\\mathcal{X}\\) a non-empty compact metric space. \\(C(\\mathcal{X})\\) is a separable Banach space under the uniform norm. The latent function \\(G:\\Omega\\to C(\\mathcal{X})\\) is Borel measurable with \\(\\mathbb{E}\\left\\lVert G\\right\\rVert_\\infty^2<\\infty\\).</p>"},
"ass:correct-posterior":{"kind":"Assumption","num":"2","title":"Correct posterior","statement":"<p>For each \\(n\\), \\(\\Pi_n=\\operatorname{Law}(G\\mid\\mathcal{H}_n)\\) is a version of the regular conditional distribution of \\(G\\) given \\(\\mathcal{H}_n\\).</p>"},
"lem:banach-levy":{"kind":"Lemma","num":"2","title":"Closed Banach-valued Lévy upward convergence","statement":"<p>For a separable Banach space \\(E\\) and \\(Z\\in L^1(\\Omega;E)\\), \\(Z_n=\\mathbb{E}[Z\\mid\\mathcal{F}_n]\\) converges to \\(Z_\\infty=\\mathbb{E}[Z\\mid\\mathcal{F}_\\infty]\\) a.s. and in \\(L^1\\).</p>"},
"prop:common-moment-convergence":{"kind":"Proposition","num":"1","title":"Uniform convergence of common posterior moments","statement":"<p>\\(\\mu_n\\to\\mu_\\infty\\) in \\(C(\\mathcal{X})\\) and \\(M_n\\to M_\\infty\\) in \\(C(\\mathcal{X}\\times\\mathcal{X})\\) a.s.; hence \\(v_n\\to v_\\infty\\) in \\(C(\\mathcal{X})\\). A consequence of Banach-valued Lévy upward convergence.</p>"},
"ass:noiseless":{"kind":"Assumption","num":"3","title":"Noiseless observation and MaxVar approximate maximization","statement":"<p>\\(Y_{n+1}=G(X_{n+1})\\) (noiseless) with \\(v_n(X_{n+1})\\ge\\sup_x v_n(x)-\\eta_n^{\\mathrm{MaxVar}}\\), \\(\\eta_n^{\\mathrm{MaxVar}}\\to0\\).</p>"},
"thm:noiseless-maxvar":{"kind":"Theorem","num":"1","title":"Noiseless MaxVar function-learning consistency","statement":"<p>Under noiseless observation and MaxVar, \\(\\left\\lVert v_n\\right\\rVert_\\infty\\to0\\), \\(G=\\mu_\\infty\\), \\(\\left\\lVert\\mu_n-G\\right\\rVert_\\infty\\to0\\) a.s. A warm-up using interpolation \\(v_{n+1}(X_{n+1})=0\\).</p>"},
"ass:finite-variance":{"kind":"Assumption","num":"4","title":"Additive, conditionally unbiased, finite-conditional-variance observation","statement":"<p>\\(Y_{n+1}=G(X_{n+1})+\\varepsilon_{n+1}\\), \\(\\mathbb{E}[\\varepsilon_{n+1}\\mid G,\\mathcal{H}_n,X_{n+1}]=0\\), \\(\\operatorname{Var}(\\varepsilon_{n+1}\\mid\\cdots)\\le\\tau^2\\). Sub-Gaussianity is not assumed (\\(\\tau^2=0\\) includes the noiseless case).</p>"},
"ass:full-support":{"kind":"Assumption","num":"5","title":"Full-support evaluation measure","statement":"<p>\\(\\lambda\\) is a finite Borel measure on \\(\\mathcal{X}\\) with \\(\\operatorname{supp}(\\lambda)=\\mathcal{X}\\); it integrates the residual uncertainty \\(H_n=\\int v_n\\,d\\lambda\\).</p>"},
"ass:posterior-eq":{"kind":"Assumption","num":"6","title":"Posterior mean-square equicontinuity","statement":"<p>For some modulus \\(\\rho\\) (\\(\\rho(r)\\to0\\)), for all \\(n\\) and \\(x,u\\): \\(\\mathbb{E}[(G(u)-G(x))^2\\mid\\mathcal{H}_n]\\le\\rho(d(u,x))^2\\).</p>"},
"lem:supermartingale":{"kind":"Lemma","num":"3","title":"Supermartingale property of residual uncertainty","statement":"<p>\\(H_n=\\int v_n\\,d\\lambda\\) is a nonnegative supermartingale, and at the queried point \\(D_n=H_n-\\mathbb{E}[H_{n+1}\\mid\\mathcal{H}_n]=\\Delta^{\\mathrm{IVR}}_n(X_{n+1})\\); hence \\(\\sup_x\\Delta^{\\mathrm{IVR}}_n(x)\\to0\\) a.s.</p>"},
"lem:linear-lower":{"kind":"Lemma","num":"4","title":"Linear-predictor lower bound for the noisy IVR","statement":"<p>\\(\\displaystyle\\Delta^{\\mathrm{IVR}}_n(x)\\ge\\int_{\\mathcal{X}}\\frac{K_n(u,x)^2}{v_n(x)+\\tau^2}\\,\\lambda(du)\\). A lower bound on explained variance via \\(L^2\\) orthogonal projection.</p>"},
"prop:global-vanishing":{"kind":"Proposition","num":"2","title":"Global variance vanishing via noisy IVR/SUR","statement":"<p>\\(\\left\\lVert v_n\\right\\rVert_\\infty\\to0\\) a.s. If variance persisted, the near-diagonal lower bound plus full-support small-ball mass would keep \\(\\sup_x\\Delta^{\\mathrm{IVR}}_n\\) positive — a contradiction.</p>"},
"thm:cx-main":{"kind":"Theorem","num":"2","title":"Noisy IVR/SUR function-learning consistency (main theorem)","statement":"<p>Under Assumptions 1–6, for a correct \\(C(\\mathcal{X})\\)-valued posterior, \\(G=\\mu_\\infty\\) and \\(\\left\\lVert\\mu_n-G\\right\\rVert_\\infty\\to0\\) a.s. No Gaussian-update formula is required.</p>"},
"ass:model-modulus":{"kind":"Assumption","num":"7","title":"Model-level square-integrable modulus","statement":"<p>There exist \\(\\Lambda\\ge0\\) (\\(\\mathbb{E}[\\Lambda^2]<\\infty\\)) and \\(\\omega(r)\\to0\\) with \\(|G(u)-G(x)|\\le\\Lambda\\,\\omega(d(u,x))\\) a.s.</p>"},
"prop:model-modulus":{"kind":"Proposition","num":"3","title":"Model modulus implies posterior equicontinuity","statement":"<p>Assumption 7 implies Assumption 6, with \\(\\rho(r)=\\sqrt{C_\\Lambda}\\,\\omega(r)\\) from the upward convergence of \\(\\mathbb{E}[\\Lambda^2\\mid\\mathcal{H}_n]\\).</p>"},
"ass:transfer-diagnostics":{"kind":"Assumption","num":"8","title":"OFML transfer diagnostics C1–C5","statement":"<p>C1 vocabulary, C2 semantics, C3 coverage (residual \\(\\rho_j\\)), C4 target-relevant identifiability (residual \\(r^{\\mathrm{id}}_{j,q}\\), constant \\(K_j\\)), C5 Lipschitz stability; optional C6 realizability. Conditions diagnosing whether transfer can hold.</p>"},
"prop:ofml-linear":{"kind":"Proposition","num":"4","title":"Identifiability of additive-affine OFML (rank condition)","statement":"<p>\\(r^{\\mathrm{id}}=0\\Leftrightarrow\\ker\\Phi\\subseteq\\ker\\Psi\\Leftrightarrow\\operatorname{row}(\\Psi)\\subseteq\\operatorname{row}(\\Phi)\\). \\(\\Phi\\) = source sensitivity operator, \\(\\Psi\\) = target sensitivity operator.</p>"},
"lem:ofml-pushforward":{"kind":"Lemma","num":"5","title":"Pushforward of the OFML target posterior","statement":"<p>\\(T(\\theta)(x)=\\operatorname{Eval}_q(p_\\star;\\theta;x)\\) is measurable and \\(G=T(\\theta)\\) is a \\(C(\\mathbb{X})\\)-valued square-integrable random function; \\((T)_\\#\\Pi_n^\\theta=\\operatorname{Law}(G\\mid\\mathcal{H}_n^{\\mathrm{tar}})\\).</p>"},
"lem:ofml-bridge":{"kind":"Lemma","num":"6","title":"OFML Lipschitz bridge","statement":"<p>From the module-wise Lipschitz constants of the DAG, \\(|G_\\theta(u)-G_\\theta(x)|\\le\\Lambda_{p_\\star,q}(\\theta)\\,d(u,x)\\), \\(\\Lambda_{p_\\star,q}=\\sum_v c_v\\sum_{\\pi:v\\to q}\\prod_w L_{\\tau(w)}(\\theta)\\); discharges Assumption 6.</p>"},
"thm:ofml-active":{"kind":"Theorem","num":"3","title":"Terminal-response consistency of OFML target active correction","statement":"<p>Under the pushforward, full-support \\(\\lambda\\), and the Lipschitz bridge, applying the main theorem with \\(\\mathcal{X}=\\mathbb{X}\\) gives \\(\\left\\lVert\\mu_n-G\\right\\rVert_\\infty\\to0\\) a.s.; if well-specified, to the true terminal \\(f_{p_\\star}^{\\dagger}\\).</p>"},
"prop:ofml-rescue":{"kind":"Proposition","num":"5","title":"Active correction rescues even when transfer breaks","statement":"<p>Even with \\(r^{\\mathrm{id}}>0\\), direct active observation of the target terminal (the source enters only as initial history) yields \\(\\left\\lVert\\mu_n-f_{p_\\star}^{\\dagger}\\right\\rVert_\\infty\\to0\\) a.s.</p>"},
"prop:ofml-depth-limit":{"kind":"Proposition","num":"6","title":"Effect of depth on the bridge constant and approximate inference","statement":"<p>For chain depth \\(D\\) the bridge coefficient contains \\(\\Lambda_{p_\\star,q}(\\theta)\\asymp\\prod_{k=1}^{D}L_k(\\theta)\\). Intermediate observation / partial evaluation of internal nodes improves both \\(\\Lambda_{p_\\star,q}\\) and the approximate-inference error \\(d_{\\Delta,n}\\), relaxing the depth limit.</p>"}
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
"c1-fig1.html":{name:"fig1_linear.png",cap:"Fig 3a — linear family s0–s7 zero-shot transfer"},
"c2-failures.html":{name:"fig1_nonlinear.png",cap:"Fig 1b — nonlinear s0–s7 (including honest failures)"},
"c3-dsweep.html":{name:"al_curves_grid_r10.png",cap:"Fig — full-surrogate AL race at depth-5"},
"c4-s0.html":{name:"fig1_nonlinear_s0_traceablation2.png",cap:"Fig 6 — s0 intermediate-observation ablation"},
"c4-order-linear.html":{name:"order_traceablation2_linear_obs_ABCM.png",cap:"Fig 7 — order identification under observation (linear)"},
"c4-order-nonlinear.html":{name:"order_traceablation2_nonlinear_obs_ABCM.png",cap:"Fig 8 — order identification under observation (nonlinear)"},
"c4-count.html":{name:"count_traceablation2_obs_AM.png",cap:"Fig 9 — count identification under observation (subset AM)"}
,"cost-indexed.html":{name:"fig2_cost_indexed_full.png",cap:"Fig 2 — cost-indexed forward transfer + adaptation"}
};

// claim preview map: #anchor on experiments.html -> {n, color, title, body}.
window.__CLAIMMAP__={
"#c1":{n:"Claim 1",color:"#0ea5a4",title:"Transfer (b=0): when the conditions hold, OFML aids forward transfer",body:"When compositional representation, identifiability, and model specification hold, OFML zero-shot transfers to an unseen target even terminal-only. If they break it fails, and intermediate observation during training (1-C) recovers the conditions."},
"#c2":{n:"Claim 2",color:"#0f766e",title:"Active learning (b>0): even when transfer fails, structure drives the error down faster",body:"Even when identification breaks at b=0, actively observing the target terminal drives the error below the aliasing floor, and compositional OFML adapts faster than unstructured baselines."}
};
// page preview map (Wikipedia-style fallback for any internal .xref link).
window.__PAGEMAP__={
"hardware.html":{title:"Hardware integration",body:"A preliminary demo connecting OFML to a Tecan Fluent autonomous lab (liquid handler + ODTC + Magellan): active learning on the dye-mixing ColorMix task, learning from the terminal measurement only, run on real hardware."},
"index.html":{title:"Overview",body:"Summary of the whole paper. OFML learns experimental protocols as a composition of shared operation modules and performs forward transfer and closed-loop active correction from terminal-only observations."},
"background.html":{title:"Background",body:"Context of autonomous experimentation and surrogate modeling. Interactively shows the error-attribution ambiguity of terminal-only observation and its resolution by intermediate observation."},
"problem.html":{title:"Problem setting",body:"Formalizes protocols as operation DAGs and observations as terminal scalars. Defines the evaluation axis of forward transfer (b=0) and active learning (b>0)."},
"method.html":{title:"Object-Flow Machine Learning",body:"The method that composes shared per-operation modules into a surrogate: latent-state passing, terminal readout, and active-learning policies (MaxVar/IVR)."},
"theory.html":{title:"Theoretical statement and proofs",body:"Consistency of C(X)-valued Bayesian active learning (Theorem 2) and OFML identifiability (Prop 4), pushforward, active correction (Theorem 3), and depth limits (Prop 6)."},
"experiments.html":{title:"Experiments",body:"Two claims verified on a unified cost-indexed curve. Claim 1: transfer (b=0); Claim 2: active learning (b>0)."},
"references.html":{title:"References",body:"Bibliography (BOFN, pKGFN, autonomous labs, GP transfer, etc.)."},
"c1-order.html":{title:"Fig 3b — order identification (linear)",body:"In settings where operation order changes the outcome, tests whether compositional OFML captures order and transfers, contrasted with order-blind baselines."},
"c1-count.html":{title:"Fig 3c — count extrapolation",body:"Extrapolation to more operation repetitions (count) than seen in training; shows OFML's structural advantage over count-descriptor baselines."},
"c2-tradeoff.html":{title:"Φ/Ψ audit — the rank condition for identifiability",body:"A rank audit of the source/target sensitivity operators Φ, Ψ numerically verifies r_id=0 ⟺ ker Φ ⊆ ker Ψ and delineates the success/failure boundary of transfer."}
};
