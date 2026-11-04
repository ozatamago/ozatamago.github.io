#!/usr/bin/env python3
"""Static site generator for ozatamago.github.io.

Emits the four navigation pages (About, Research Experience, Publications, CV)
in English and Japanese from the bilingual content below, redirect stubs for
retired URLs, and sitemap.xml. It also rewrites the navigation of the
hand-written Slides pages so every page shares one menu. Research Experience,
Publications and the CV PDF follow the PhD-application CV
(document_drafts/cv/tex/CV_PhD.tex).

Run:  python3 tools/build.py
Edit content here (single source of truth), then re-run to regenerate.
Inline math is written in TeX as \\( ... \\) and pre-rendered with KaTeX, which needs
Node.js and a one-time `npm install` in tools/.
"""
import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://ozatamago.github.io"
ASSET_VER = "21"  # bump when assets/styles.css changes (cache-busting)
KATEX_VER = "0.16.11"  # KaTeX version vendored in assets/katex/ (tools/package.json)
CV_PDF = "/assets/cv.pdf?v=20261104c"  # bump the date when assets/cv.pdf is replaced

NAME = {"en": "Yusuke Ozaki", "ja": "尾崎 勇介"}
NAV_LABEL = {"en": "Main navigation", "ja": "メインナビゲーション"}
EMAIL = "ozatamago40@gmail.com"
GITHUB = "https://github.com/ozatamago"
LINKEDIN = "https://jp.linkedin.com/in/yusuke-ozaki-6643882a6"

# key, en label, ja label, en href, ja href
SECTIONS = [
    ("home",         "About",               "プロフィール", "/",              "/ja/"),
    ("research",     "Research Experience", "研究経歴",     "/research/",     "/ja/research/"),
    ("publications", "Publications",        "論文",         "/publications/", "/ja/publications/"),
    ("cv",           "CV",                  "CV",           "/cv/",           "/ja/cv/"),
]
META = {key: (en, ja, en_h, ja_h) for (key, en, ja, en_h, ja_h) in SECTIONS}

# old URL (en, ja) -> new URL (en, ja); emitted as noindex redirect stubs
RETIRED = [
    (("/experience/", "/ja/experience/"), ("/research/", "/ja/research/")),
    (("/projects/", "/ja/projects/"), ("/research/", "/ja/research/")),
    (("/education/", "/ja/education/"), ("/#education", "/ja/#education")),
    (("/awards/", "/ja/awards/"), ("/#awards", "/ja/#awards")),
]

# hand-written pages whose <nav> is rewritten to the shared menu: path, lang, en href, ja href
HAND_PAGES = [
    ("slides/index.html", "en", "/slides/", "/ja/slides/"),
    ("ja/slides/index.html", "ja", "/slides/", "/ja/slides/"),
    ("slides/viewer.html", "en", None, None),
]

ME = "<strong>Yusuke Ozaki</strong>"

# ---- About ----
ABOUT = {
    "en": {
        "bio": [
            'I am an undergraduate student in Computer Science at Kwansei Gakuin University '
            'and a Research Part-timer II in the Laboratory for Biologically Inspired Computing (PI: <a href="https://www.bdr.riken.jp/en/research/labs/takahashi-k/index.html">Koichi Takahashi</a>) at the '
            'RIKEN Center for Biosystems Dynamics Research (BDR), also affiliated with the RIKEN AGIS program. '
            'From August 2025 to May 2026, I was an exchange student in the Department of Computer Science at the University at Albany, SUNY, '
            'where I continue to work with <a href="https://chong-l.github.io/">Chong Liu</a>.',
            'My long-term goal is to create living organisms with arbitrary, desired functions. To pursue this vision, I am interested in '
            'laboratory automation, including automated experiment execution and automated experimental design/planning.',
            'Outside research, I practice Brazilian Jiu-Jitsu (blue belt) and enjoy reading and running.',
        ],
        "interests_h": "Research interests",
        "interests_lead": "My research is on Bayesian optimization, bandits, and active learning for self-driving laboratories, "
                          "and on the infrastructure that lets AI agents operate laboratory instruments. Recently I have been working on:",
        # (topic, anchor of its Research Experience entry, publication refs)
        "interests": [
            ('Machine learning on experimental protocols: OFML and ProtocolUCB', "protocols",
             "{ref:ofml} {ref:protocolucb}"),
            ('Cumulative regret analysis of Lipschitz bandits', "lipschitz", "{ref:lipschitz}"),
            ('Structured planning for LLM agents', "spin", "{ref:spin}"),
            ('Laboratory automation and experiment infrastructure', "lab-automation", ""),
            ('Quantum algorithms for Gaussian-process Bayesian optimization', "quantum", ""),
        ],
        "interests_more": 'Details of each project are on the <a href="/research/">Research Experience</a> page; '
                          'papers and talks are listed on <a href="/publications/">Publications</a>.',
        "news_h": "News",
        "news": [
            ("2026", 'Workshop paper <em>Bayesian Optimization of Protocols</em> accepted at the NeurIPS 2026 Workshop on AI for Drug Discovery (AI4DD).'),
            ("Aug. 2026", 'Poster on Object-Flow Machine Learning at the 66th Summer School of the Biophysical Society of Japan Young Researchers (SPIRAL).'),
            ("Jun. 16, 2026", 'Started a Research Part-timer II appointment at the RIKEN Center for Biosystems Dynamics Research.'),
            ("May 13, 2026", 'Preprint: <em>SPIN — Structural LLM Planning via Iterative Navigation</em> (<a href="https://arxiv.org/abs/2605.14051">arXiv:2605.14051</a>).'),
            ("Feb. 2026", 'Began research on Lipschitz bandits under the supervision of Chong Liu.'),
            ("Aug. 2025", 'Began an exchange at the University at Albany, SUNY.'),
            ("2025", 'Poster at AutoML 2025 (Object-Flow Machine Learning) and an oral talk at the RIKEN BDR Student Symposium 2025.'),
            ("Jul. 2024", 'Received the Keyence Foundation “Ganbare! Nihon no Daigakusei” student support grant.'),
        ],
        "education_h": "Education",
        "education": [
            '<strong>Kwansei Gakuin University</strong>, B.Eng. in Computer Science, School of Engineering. '
            '<span class="meta">Apr. 2022 – Mar. 2027 (expected), Sanda, Hyogo, Japan. Research advisor: Akihiro Inokuchi.</span>',
            '<strong>University at Albany, SUNY</strong>, Exchange Student, Department of Computer Science. '
            '<span class="meta">Aug. 2025 – May 2026, Albany, NY, USA. Research advisor: Chong Liu.</span>',
        ],
        "awards_h": "Awards",
        "awards": [
            '<strong>Gyomu Super Japan Dream Foundation Study Abroad Scholarship</strong>. <span class="meta">Aug. 2025 – Jul. 2026.</span>',
            '<strong>Keyence Foundation “Ganbare! Nihon no Daigakusei” Student Support Grant</strong>. <span class="meta">Jul. 2024.</span>',
        ],
        "links_h": "Links",
        "links": [
            ("Email", "mailto:" + EMAIL), ("GitHub", GITHUB), ("LinkedIn", LINKEDIN),
            ("CV (PDF)", CV_PDF), ("Slides &amp; artifacts", "/slides/"),
        ],
        "img_alt": "Photo of Yusuke Ozaki",
    },
    "ja": {
        "bio": [
            '関西学院大学 工学部 情報工学課程の学部生です。理化学研究所 生命機能科学研究センター（BDR）バイオコンピューティング研究チーム'
            '（チームディレクター：<a href="https://www.bdr.riken.jp/jp/research/labs/takahashi-k/index.html">高橋 恒一</a>）の研究パートタイマーIIとして研究に取り組んでおり、理研 TRIP事業本部 科学研究基盤モデル開発プログラム（AGIS）にも所属しています。'
            '2025年8月から2026年5月まで University at Albany, SUNY のコンピュータサイエンス学科に交換留学し、現在も <a href="https://chong-l.github.io/">Chong Liu</a> 先生と研究を続けています。',
            '長期的には、任意の望ましい機能を持つ生物を設計・創出できる技術に関心があります。そのために、実験の自動実行や実験計画の自動化を含むラボオートメーションを研究しています。',
            '研究以外では、ブラジリアン柔術（青帯）に取り組み、読書とランニングを楽しんでいます。',
        ],
        "interests_h": "研究関心",
        "interests_lead": "自律実験（self-driving laboratory）のためのベイズ最適化、バンディット、能動学習と、"
                          "AI エージェントが実験装置を操作するための基盤を研究しています。最近のテーマ：",
        "interests": [
            ('実験プロトコルを扱う機械学習：OFML と ProtocolUCB', "protocols", "{ref:ofml} {ref:protocolucb}"),
            ('リプシッツ・バンディットの累積リグレット解析', "lipschitz", "{ref:lipschitz}"),
            ('LLM エージェントの構造的プランニング', "spin", "{ref:spin}"),
            ('実験自動化と実験基盤の開発', "lab-automation", ""),
            ('量子計算によるガウス過程ベイズ最適化', "quantum", ""),
        ],
        "interests_more": '各研究の詳細は<a href="/ja/research/">研究経歴</a>に、論文と発表の一覧は<a href="/ja/publications/">論文</a>にまとめています。',
        "news_h": "News",
        "news": [
            ("2026年", 'ワークショップ論文 <em>Bayesian Optimization of Protocols</em> が NeurIPS 2026 Workshop on AI for Drug Discovery（AI4DD）に採択。'),
            ("2026年8月", '第66回 生物物理若手の会 夏の学校（SPIRAL）でオブジェクトフロー機械学習についてポスター発表。'),
            ("2026年6月16日", '理化学研究所 生命機能科学研究センターで研究パートタイマーIIとして勤務を開始。'),
            ("2026年5月13日", 'プレプリント: <em>SPIN — Structural LLM Planning via Iterative Navigation</em>（<a href="https://arxiv.org/abs/2605.14051">arXiv:2605.14051</a>）を公開。'),
            ("2026年2月", 'Chong Liu先生の指導の下、リプシッツ連続性に基づくバンディット問題の解析を開始。'),
            ("2025年8月", 'University at Albany, SUNY への交換留学を開始。'),
            ("2025年", 'AutoML 2025 でポスター発表（Object-Flow Machine Learning）、RIKEN BDR Student Symposium 2025 で口頭発表。'),
            ("2024年7月", 'キーエンス財団「がんばれ！日本の大学生」応援給付金に採択。'),
        ],
        "education_h": "学歴",
        "education": [
            '<strong>関西学院大学</strong> 工学部 情報工学課程 学士（工学）。'
            '<span class="meta">2022年4月 – 2027年3月（卒業見込み）、兵庫県三田市。研究指導教員：猪口 明博 教授。</span>',
            '<strong>University at Albany, SUNY</strong> コンピュータサイエンス学科、交換留学生。'
            '<span class="meta">2025年8月 – 2026年5月、米国ニューヨーク州オールバニ。研究指導教員：Chong Liu 助教。</span>',
        ],
        "awards_h": "受賞・奨学金",
        "awards": [
            '<strong>業務スーパージャパンドリーム財団 派遣留学奨学生</strong>。<span class="meta">2025年8月 – 2026年7月。</span>',
            '<strong>キーエンス財団「がんばれ！日本の大学生」応援給付金</strong>。<span class="meta">2024年7月。</span>',
        ],
        "links_h": "リンク",
        "links": [
            ("Email", "mailto:" + EMAIL), ("GitHub", GITHUB), ("LinkedIn", LINKEDIN),
            ("CV（PDF）", CV_PDF), ("発表資料", "/ja/slides/"),
        ],
        "img_alt": "尾崎勇介の写真",
    },
}

# ---- Research Experience (full version) ----
# One entry per project. The per-program CVs (document_drafts/cv/tex/programs/) excerpt from this list.
# (project, dates, organization / advisor, location, note or "", [bullets])
BDR_LAB = {"en": "RIKEN BDR, Laboratory for Biologically Inspired Computing (PI: Koichi Takahashi)",
           "ja": "理化学研究所 生命機能科学研究センター（BDR）バイオコンピューティング研究チーム（チームディレクター：高橋 恒一）"}
ALBANY_LIU = {"en": "University at Albany, SUNY, Department of Computer Science (Advisor: Chong Liu)",
              "ja": "University at Albany, SUNY コンピュータサイエンス学科（指導教員：Chong Liu）"}
# Anchor id of each Research Experience entry, in the order of RESEARCH (the same in both languages).
RESEARCH_IDS = ["protocols", "lipschitz", "spin", "lab-automation", "quantum", "preference-bo", "gnn", "grn"]
RESEARCH = {
    "en": [
        ("Machine Learning on Experimental Protocols: OFML and ProtocolUCB",
         "Jun. 2024 – Aug. 2025, Jun. 2026 – Present",
         BDR_LAB["en"] + "; with Kazunari Kaizu", "Kobe, Japan",
         "Developed a machine-learning system that predicts experimental outcomes from experimental protocols, written in the "
         "lab's Object-Flow Programming Language, and their conditions. Responsible for the whole project, from conceiving and "
         "designing the method through theory, implementation, numerical and physical experiments, and paper writing. "
         "Research Part-timer II; also affiliated with the RIKEN AGIS program (since Jun. 2026).",
         ['<strong>Operation-level surrogate model.</strong> Proposed OFML, which represents an experimental protocol as a typed '
          'directed acyclic graph and composes surrogate models shared by operation type {ref:ofml}. Implemented it with neural '
          'networks and, by learning from final measurements without labels for intermediate states, developed a way to predict '
          'the outcomes of unobserved protocols that recombine operations.',
          '<strong>Theory and numerical experiments.</strong> Under stated assumptions, proved uniform convergence of the posterior '
          'mean under active learning by integrated variance reduction {ref:ofml}, and convergence of the ProtocolUCB recommendation '
          'to the set of global maximizers {ref:protocolucb}. Also analyzed conditions for prediction on unobserved protocols, and '
          'in numerical experiments on synthetic protocols compared prediction error and mean protocol-wise simple regret across '
          'model-sharing and experiment-selection choices.',
          '<strong>Closed loop on a physical instrument.</strong> Mapped OFML\'s operation-level surrogates to the operation modules '
          'of a Tecan Fluent and connected them to colored-water experiments. Ran a loop that repeats execution, measurement, and '
          'model updates, demonstrating that operation-level modeling, matched to the instrument\'s modules, links experiments '
          'and learning {ref:ofml}.']),
        ("Lipschitz Bandits: Cumulative Regret Analysis", "Feb. 2026 – Present",
         ALBANY_LIU["en"], "Albany, NY, USA", "",
         ['<strong>Motivation and method.</strong> Examined the classical Piyavskii–Shubert algorithm from the viewpoint of '
          'cumulative regret, focusing on the problem that observation noise breaks its guaranteed upper bounds on function values. '
          'Proposed LiP-UCB, which handles noise through a statistical correction that propagates confidence intervals, estimated '
          'from nearby observations, to the whole domain via Lipschitz continuity {ref:lipschitz}.',
          '<strong>Cumulative regret analysis and lower bounds revisited.</strong> In the noiseless setting, proved a bound of '
          r'\(2L\), independent of the horizon \(T\), in one dimension and a bound of '
          r'\(3\sqrt{d}\,L\,T^{1-1/d}\) for \(d\ge2\). In the noisy '
          'setting, showed that the expected cumulative regret matches the lower bound up to logarithmic factors. Also identified '
          'a problem in an existing lower-bound proof and re-derived the lower bound under Gaussian noise {ref:lipschitz}.',
          '<strong>Numerical experiments.</strong> In the one-dimensional noiseless setting, tracked cumulative regret against the '
          r'number of observations and confirmed that the Piyavskii–Shubert algorithm stays within the theoretical bound \(2L\). '
          'In the noisy setting, compared LiP-UCB with existing minimax-optimal methods and showed comparable performance in the '
          'settings tested {ref:lipschitz}.']),
        ("SPIN: Planning with Large Language Models", "Aug. 2025 – May 2026",
         "University at Albany, SUNY, with IBM (Collaborator: Dhaval Patel, IBM)", "Albany, NY, USA",
         "",
         ['<strong>Team leadership and collaboration.</strong> Led a student development team in an IBM-partnered capstone project '
          'and grew it into a research collaboration. Over about a year, researched and developed LLM agents for industrial asset '
          'operations together with their execution and evaluation infrastructure, building a system that covers prompt design, '
          'execution-trace logging, and structural validation and automatic evaluation of plans.',
          '<strong>Motivation and method.</strong> Noting that external tool calls can dominate operating cost in industrial use, '
          'developed SPIN, which suppresses redundant execution and structural defects in plans. It validates and repairs a plan '
          'as a directed acyclic graph, evaluates the predicted outcome of a partial plan, and stops execution once it judges '
          'the result sufficient to answer {ref:spin}.',
          '<strong>Numerical experiments.</strong> On 261 AssetOpsBench scenarios, reduced the average number of tool calls per run '
          'from 11.81 to 6.82 (about 42%) compared with an existing configuration. Also evaluated on 18 MCP-Bench tasks with two '
          'language models, confirming improvements in metrics for plan validity, tool selection, and dependency awareness {ref:spin}.']),
        ("Laboratory Automation and Experiment Infrastructure", "Jun. 2026 – Present",
         BDR_LAB["en"], "Kobe, Japan", "",
         ['<strong>Problem setting and system design.</strong> Identified as the problem that each instrument requires familiarity '
          'with its own GUI operations and procedure settings, and aimed to reduce the operating burden and setup errors for both '
          'experimental and computational researchers. Conceived a system in which an agent turns the goals and conditions of an '
          'experiment, given in chat, into a procedure the instrument can execute, and set the development plan.',
          '<strong>Analysis of control software and the execution environment.</strong> Directed the agent to the parts to read and '
          'the points to check in the FluentControl device definitions and operation scripts and in the Maholo control software, '
          'and advanced the analysis while matching it against the physical layout and labware. Organized the operation '
          'specifications, communication protocols, and execution conditions, and led the development of SiLA 2 connectors '
          '(<a href="' + GITHUB + '/tecan-fluent">tecan-fluent</a>, <a href="' + GITHUB + '/inheco-odtc">inheco-odtc</a>) and execution scripts, building an environment in which the agent, with human approval, creates and runs '
          'procedures and checks instrument state without per-experiment procedure authoring in the GUI. On the Fluent, the '
          'connectors cover the pipetting arm, gripper, deck cameras and deck state, an Inheco ODTC thermal cycler, an '
          'Infinite 200 PRO plate reader, and a BioShake shaker.',
          '<strong>Design and execution of physical tests, and procedure improvement.</strong> Defined the goals, experimental '
          'conditions, and the division of roles between people and the agent for the demos, and led supervised tests on the '
          'instruments: water dispensing, plate transport, and 30 thermal cycles on the Fluent, and nine steps including '
          'dispensing, sealing, mixing, and seal peeling in four protocols on the Maholo. When the agent failed, investigated the '
          'cause from instrument state and run logs and revised the procedure; for a plate left in the ODTC after a stop command '
          'failed following PCR, had the agent write a recovery procedure and retrieve the plate.',
          '<strong>Control of related instruments and extension to lab automation.</strong> Developed a SiLA 2 connector for a '
          'Franka Research 3 arm that reads robot state, operates it through Desk, and captures camera images. Now working on '
          'automating <em>E. coli</em> transformation on the Fluent with the instrument-control infrastructure built here.']),
        ("Quantum Algorithms for Gaussian-Process Bayesian Optimization", "Jun. 2026 – Present",
         ALBANY_LIU["en"] + "; Collaborator: Chaowen Guan, University of Cincinnati", "Albany, NY, USA", "",
         ['Studying whether the quantum singular value transformation (QSVT) and quantum linear system (QLS) solvers can approximately '
          'maximize the GP-UCB acquisition function at lower cost than classical linear algebra.']),
        ("Preference-Based Bayesian Optimization", "May 2025 – Jan. 2026",
         ALBANY_LIU["en"], "Albany, NY, USA", "",
         ['Study Bayesian optimization with a Generalized Preference Model, analyzing regret bounds and identifiability when '
          'learned embeddings are combined with Gaussian-process models.']),
        ("Graph Neural Networks That Learn Sparse Structure", "May 2024 – Apr. 2025",
         "Kwansei Gakuin University, Inokuchi Lab (Advisor: Akihiro Inokuchi)", "Sanda, Hyogo, Japan", "",
         ['Designed a graph neural network that learns task-specific sparse adjacency layer by layer, with an actor–critic '
          'edge-selection module trained by policy gradient, to reduce the edges used in convolution '
          '(<a href="' + GITHUB + '/MEG">MEG</a>).']),
        ("Gene Regulatory Network Inference from Single-Cell Omics", "Feb. 2025 – Aug. 2025",
         "The University of Osaka, PRIMe, Yachie Lab (PI: Nozomu Yachie)", "Osaka, Japan", "Research Assistant.",
         ['<strong>Data analysis toward gene regulatory network inference.</strong> Surveyed existing methods, aiming at gene '
          'regulatory network inference that integrates RNA expression and chromatin accessibility. Preprocessed a 10x Genomics '
          'Multiome dataset of embryonic day 18 (E18) mouse brain and, using both measurements paired in the same nuclei, prepared '
          'data for testing hypotheses about regulatory relationships and for training and evaluating expression-prediction models.',
          '<strong>Modeling grounded in prior findings.</strong> Reviewed the literature on the relationship between chromatin '
          'accessibility and gene expression, and organized the finding that similar accessibility can accompany both rising and '
          'falling expression. Building on prior work, examined the assumptions and limits of explaining expression state or the '
          'direction of its change from accessibility alone.',
          '<strong>Implementation and exploratory evaluation of expression-prediction models.</strong> Worked on predicting the '
          'per-cell expression of a single gene from genome-wide chromatin accessibility and gene expression. Implemented '
          'neural-network and Transformer models and, through training and prediction experiments, explored how far the two '
          'measurements together can predict expression.']),
    ],
    "ja": [
        ("実験プロトコルを扱う機械学習：OFML と ProtocolUCB",
         "2024年6月 – 2025年8月、2026年6月 – 現在",
         BDR_LAB["ja"] + "、共同研究者：海津 一成", "兵庫県神戸市",
         "研究室で開発された Object-Flow Programming Language で記述された実験プロトコルと実験条件から、実験結果を予測する機械学習システムの"
         "開発に取り組んだ。具体的な手法の着想・設計から、理論解析、実装、数値実験、実機実験、論文執筆までを担当した。"
         "研究パートタイマーII。2026年6月から理研 TRIP事業本部 科学研究基盤モデル開発プログラム（AGIS）にも所属。",
         ['<strong>操作単位の代理モデルの提案・実装。</strong>実験プロトコルを型付き有向非巡回グラフとして表現し、操作の種類ごとに共有する'
          '代理モデルを合成する OFML を提案した {ref:ofml}。ニューラルネットワークで実装し、中間状態の教師データを用いずに最終測定結果から'
          '学習することで、操作を組み替えた未観測プロトコルの結果を予測する仕組みを開発した。',
          '<strong>理論解析と数値実験。</strong>所定の仮定の下で、積分分散削減による能動学習での事後平均の一様収束 {ref:ofml} と、'
          'ProtocolUCB の推奨解の大域的最適解集合への収束 {ref:protocolucb} を証明した。未観測プロトコルへの予測条件も解析し、'
          '合成プロトコルを用いた数値実験で、モデル共有と実験選択について予測誤差・平均プロトコル別単純リグレットを比較評価した。',
          '<strong>実機との接続と学習ループの実証。</strong>OFML の操作単位の代理モデルを実機の操作モジュールに対応づけ、Tecan Fluent'
          ' による色水実験と接続した。実験の実行、測定結果の取得、モデル更新を繰り返す学習ループを動作させ、操作単位のモデル化と'
          '実機の操作モジュールとの対応を利用して、実験と学習を連携できることを実証した {ref:ofml}。']),
        ("リプシッツ・バンディットの累積リグレット解析", "2026年2月 – 現在",
         ALBANY_LIU["ja"], "米国ニューヨーク州オールバニ", "",
         ['<strong>研究の動機と手法の提案。</strong>古典的な Piyavskii–Shubert 法を累積リグレットの観点から検討し、観測雑音によって'
          '関数値の上界が保証されなくなる問題に着目した。近傍の観測から推定した信頼区間を Lipschitz 連続性に基づいて空間全体へ伝播させる'
          '統計的補正を導入し、雑音に対応する LiP-UCB を提案した {ref:lipschitz}。',
          r'<strong>累積リグレット解析と下界の再検討。</strong>雑音なしでは、一次元で時間長 \(T\) に依存しない上界 \(2L\)、'
          r'\(d\ge2\) で上界 \(3\sqrt{d}\,L\,T^{1-1/d}\) を証明した。'
          '雑音ありでは期待累積リグレットが下界と対数因子を除いて一致することを示した。また、既存の下界証明の問題を指摘し、'
          'ガウス雑音下の下界を導き直した {ref:lipschitz}。',
          '<strong>数値実験による検証。</strong>一次元の雑音なし設定で、観測回数に伴う累積リグレットの推移を評価し、Piyavskii–Shubert 法の'
          r'累積リグレットが理論上界 \(2L\) 以下に収まることを確認した。雑音ありでは LiP-UCB を既存のミニマックス最適手法と比較し、'
          '検証した設定で比肩する性能を示した {ref:lipschitz}。']),
        ("SPIN：大規模言語モデルを用いた計画生成", "2025年8月 – 2026年5月",
         "University at Albany, SUNY × IBM（共同研究者：Dhaval Patel、IBM）", "米国ニューヨーク州オールバニ",
         "",
         ['<strong>開発チームの運営と共同研究。</strong>IBM 連携の Capstone プロジェクトで学生開発チームを率い、共同研究へと発展させた。'
          '約1年間にわたり、産業資産運用向けの大規模言語モデルエージェントと、その実行・評価基盤を研究・開発した。プロンプト設計、'
          '実行履歴の記録、計画の構造検証と自動評価を含むシステムを構築した。',
          '<strong>研究の動機と手法の開発。</strong>産業用途では外部ツールの呼び出しが運用コストを支配しうる点に着目し、冗長な実行と'
          '計画の構造的不備を抑える SPIN を開発した。計画を有向非巡回グラフとして検証・修正し、途中までの計画の予測結果を評価して、'
          '回答に十分と判断した段階で実行を停止する仕組みを構築した {ref:spin}。',
          '<strong>数値実験による評価。</strong>AssetOpsBench の261シナリオで既存構成と比較し、1実行あたりの平均ツール呼び出し回数を'
          '11.81回から6.82回へ約42%削減した。MCP-Bench の18課題でも2種類の言語モデルで評価し、計画の有効性、ツール選択、'
          '依存関係の把握に関する評価指標の改善を確認した {ref:spin}。']),
        ("実験自動化と実験基盤の開発", "2026年6月 – 現在",
         BDR_LAB["ja"], "兵庫県神戸市", "",
         ['<strong>課題設定とシステムの設計。</strong>装置固有の GUI 操作や手順設定への習熟が必要な点を課題と捉え、実験系・計算系の'
          '研究者の操作負担と設定ミスを減らすことを目指した。実験の目的や条件をチャットで伝えると、エージェントが装置上で実行可能な'
          '手順へ変換するシステムを構想し、開発方針を定めた。',
          '<strong>制御ソフトウェアの解析と実行環境の構築。</strong>FluentControl の装置定義・操作スクリプトと Maholo の制御ソフトウェア'
          'について、参照箇所や確認事項をエージェントに指示し、実機の配置・器具情報と照合しながら解析を進めた。操作仕様・通信方式・'
          '実行条件を整理し、SiLA 2 コネクタ（<a href="' + GITHUB + '/tecan-fluent">tecan-fluent</a>、<a href="' + GITHUB + '/inheco-odtc">inheco-odtc</a>）と実行スクリプトの開発を主導して、実験ごとの GUI での手順作成を介さず、'
          'エージェントが人の承認の下で手順の作成・実行・状態確認を行える環境を構築した。Fluent では、分注アーム、グリッパー、'
          'デッキカメラ・状態管理、Inheco ODTC サーマルサイクラー、Infinite 200 PRO プレートリーダー、BioShake シェーカーに対応した。',
          '<strong>実機検証の設計・実施と手順の改善。</strong>デモの目的・実験条件・人とエージェントの役割分担を定め、人の監督下での'
          '実機検証を主導した。Fluent では水の分注・搬送・30サイクルの温度制御を、Maholo では分注・シール・撹拌などの9工程を'
          '4つのプロトコルで検証した。エージェントが失敗した場合は、装置状態と実行ログに基づいて原因を調べて手順を修正し、PCR 後の'
          '停止命令の失敗で ODTC 内に残ったプレートについては、エージェントに回収手順を作成させ取り出させた。',
          '<strong>関連機器の制御と実験自動化への展開。</strong>Franka Research 3 の状態取得、Desk を介した操作、カメラ撮影に対応する'
          ' SiLA 2 コネクタを開発した。現在は、構築した装置制御基盤を用いて、Fluent 上での大腸菌の形質転換の自動化に取り組んでいる。']),
        ("量子計算によるガウス過程ベイズ最適化の計算量の検討", "2026年6月 – 現在",
         ALBANY_LIU["ja"] + "、共同研究者：Chaowen Guan（シンシナティ大学）", "米国ニューヨーク州オールバニ", "",
         ['量子特異値変換（QSVT）や量子線形システム解法（QLS）を用いて、GP-UCB の獲得関数を近似的に最大化し、古典的な線形代数計算'
          'より計算量を減らせるかを検討している。']),
        ("選好に基づくベイズ最適化", "2025年5月 – 2026年1月",
         ALBANY_LIU["ja"], "米国ニューヨーク州オールバニ", "",
         ['Generalized Preference Model を用いたベイズ最適化を研究し、学習した埋め込みとガウス過程モデルを組み合わせたときの'
          'リグレット上界と識別可能性を解析。']),
        ("疎なグラフ構造を学習するグラフニューラルネットワーク", "2024年5月 – 2025年4月",
         "関西学院大学 猪口研究室（指導教員：猪口 明博 教授）", "兵庫県三田市", "",
         ['畳み込みに用いるエッジ数を減らすため、タスクに応じた疎な隣接構造を層ごとに学習するグラフニューラルネットワークを設計'
          '（方策勾配で学習するアクター・クリティック型のエッジ選択モジュールを含む。<a href="' + GITHUB + '/MEG">MEG</a>）。']),
        ("単一細胞オミクスからの遺伝子制御ネットワーク推定", "2025年2月 – 2025年8月",
         "大阪大学 ヒューマン・メタバース疾患研究拠点（PRIMe）谷内江研究室（PI：谷内江 望 教授）", "大阪府", "リサーチアシスタント。",
         ['<strong>遺伝子制御ネットワーク推定に向けたデータ解析。</strong>RNA 発現とクロマチンアクセシビリティを統合した遺伝子制御'
          'ネットワーク推定を目指し、既存手法を調査した。10x Genomics の胎生18日マウス脳 Multiome データを前処理し、同一核で対応する'
          '両測定を用いて、制御関係の仮説検証と発現予測モデルの学習・評価に用いるデータを整備した。',
          '<strong>既存知見に基づくモデル化の検討。</strong>クロマチンアクセシビリティと遺伝子発現の関係に関する文献を調査し、同程度の'
          'アクセシビリティでも発現の増加・減少の両局面が生じうることを整理した。既存研究の知見を踏まえ、アクセシビリティ単独で'
          '発現状態や変化の方向を説明する際の仮定と限界を検討した。',
          '<strong>発現予測モデルの実装と探索的評価。</strong>ゲノム全体のクロマチンアクセシビリティと遺伝子発現情報から、単一遺伝子の'
          '細胞ごとの発現量を予測する課題に取り組んだ。ニューラルネットワークと Transformer による予測モデルを実装し、学習・予測実験を'
          '通じて、両測定の情報を用いた発現予測の可能性を探索的に検討した。']),
    ],
}
SOFTWARE_H = {"en": "Software", "ja": "ソフトウェア"}
SOFTWARE = {
    "en": [
        ("tecan-fluent", GITHUB + "/tecan-fluent", "SiLA 2 connector for a Tecan Fluent 780 (arm, gripper, deck cameras, thermal cycler, plate reader, shaker), built with the UniteLabs CDK."),
        ("inheco-odtc", GITHUB + "/inheco-odtc", "SiLA 2 connector for an Inheco ODTC 96 thermal cycler integrated in the Fluent."),
        ("cx_bayes_al", GITHUB + "/cx_bayes_al", "Lean 4 formalization and experiments for global consistency of cost-aware Bayesian active learning."),
        ("MEG", GITHUB + "/MEG", "Minimal Edges Generator, a sparse-adjacency graph neural network."),
    ],
    "ja": [
        ("tecan-fluent", GITHUB + "/tecan-fluent", "Tecan Fluent 780（アーム、グリッパー、デッキカメラ、サーマルサイクラー、プレートリーダー、シェーカー）の SiLA 2 コネクタ。UniteLabs CDK で構築。"),
        ("inheco-odtc", GITHUB + "/inheco-odtc", "Fluent に組み込まれた Inheco ODTC 96 サーマルサイクラーの SiLA 2 コネクタ。"),
        ("cx_bayes_al", GITHUB + "/cx_bayes_al", "コストを考慮したベイズ能動学習の大域的一致性に関する Lean 4 での形式化と実験。"),
        ("MEG", GITHUB + "/MEG", "Minimal Edges Generator：疎な隣接構造を学習するグラフニューラルネットワーク。"),
    ],
}

# ---- Publications (from CV_PhD.tex) ----
# (heading, label prefix, [(anchor id, title, authors, status / venue, links html or "")]);
# a newline in the status starts a new line (e.g. review status, then the preprint).
# Shown as: title, then authors, then status, then links.
# Papers under review: don't name the venue (double-blind review; title + authors + venue together de-anonymize).
OFML_TITLE = "Object-Flow Machine Learning: Operation-Level Surrogate Modeling for Self-Driving Laboratories"
LIPSCHITZ_TITLE = "Cumulative Regret Analysis of the Piyavskii–Shubert Algorithm in Lipschitz Bandits"
SPIN_TITLE = "SPIN: Structural LLM Planning via Iterative Navigation for Industrial Tasks"
KAIZU_TAKAHASHI = "{me}, Kazunari Kaizu, and Koichi Takahashi"
# title and authors as listed on OpenReview (accepted, non-archival)
AUTOML_TITLE = "Object-Flow Machine Learning: Active learning framework utilizing protocols information"
AUTOML_LINKS = ('<a href="https://openreview.net/forum?id=7k2vOhYPnd">OpenReview</a> · '
                '<a href="https://doi.org/10.5281/zenodo.16741262">Zenodo</a> · '
                '<a href="https://github.com/kaizu/ofplang/tree/ofml">Code</a>')
SPIN_LINKS = ('<a href="https://arxiv.org/abs/2605.14051">arXiv</a> · <a href="https://arxiv.org/pdf/2605.14051">PDF</a> · '
              '<a href="/slides/viewer.html?id=spin-showcase">{}</a>')
PUBS = {
    "en": [
        ("Workshop papers", "W", [
            ("protocolucb", "Bayesian Optimization of Protocols", KAIZU_TAKAHASHI,
             "<em>NeurIPS 2026 Workshop on AI for Drug Discovery (AI4DD)</em>, 2026.", ""),
        ]),
        ("Under review", "R", [
            ("ofml", OFML_TITLE, KAIZU_TAKAHASHI, "Under review.",
             '<a href="/slides/viewer.html?id=ofml-active-learning-en">Slides</a> · '
             '<a href="/slides/viewer.html?id=ofml-active-learning">Japanese version</a>'),
            ("lipschitz", LIPSCHITZ_TITLE, "{me} and Chong Liu",
             "Under review.", ""),
            ("spin", SPIN_TITLE, "{me} and Dhaval Patel",
             "Under review.\n"
             "Preprint: arXiv:2605.14051, 2026.", SPIN_LINKS.format("Visual summary")),
        ]),
        ("Presentations", "", [
            ("", "Object-Flow Machine Learning: Knowledge Transfer and Active Learning across Experimental Protocols with "
                 "Operation-Level Surrogate Models", KAIZU_TAKAHASHI,
             "Poster, <em>66th Summer School of the Biophysical Society of Japan Young Researchers (SPIRAL)</em>, Nagano, Japan, "
             "Aug. 2026. (In Japanese.)", ""),
            ("", AUTOML_TITLE, KAIZU_TAKAHASHI,
             "Poster, <em>AutoML Conference 2025, Non-Archival Content Track</em>, New York City, USA, Sep. 2025.", AUTOML_LINKS),
            ("", "Development of a Machine Learning Method Utilizing Experimental Protocols to Predict Outcomes and an Active "
                 "Learning Framework Employing the Method", "{me}",
             "Oral, <em>RIKEN BDR Student Symposium 2025</em>, Kobe, Japan, May 2025.", ""),
            ("", "Development of a Machine Learning Method Utilizing Protocols to Predict Experimental Outcomes", "{me}",
             "Oral, <em>Spring School for Theoretical Biology 2025</em>, Hiroshima University, Japan, Feb. 2025.", ""),
        ]),
    ],
    "ja": [
        ("ワークショップ論文", "W", [
            ("protocolucb", "Bayesian Optimization of Protocols", KAIZU_TAKAHASHI,
             "<em>NeurIPS 2026 Workshop on AI for Drug Discovery（AI4DD）</em>採択、2026年。", ""),
        ]),
        ("査読中", "R", [
            ("ofml", OFML_TITLE, KAIZU_TAKAHASHI, "査読中。",
             '<a href="/slides/viewer.html?id=ofml-active-learning">解説スライド</a> · '
             '<a href="/slides/viewer.html?id=ofml-active-learning-en">英語版</a>'),
            ("lipschitz", LIPSCHITZ_TITLE, "{me} and Chong Liu",
             "査読中。", ""),
            ("spin", SPIN_TITLE, "{me} and Dhaval Patel",
             "査読中。\n"
             "プレプリント：arXiv:2605.14051（2026年）。", SPIN_LINKS.format("ビジュアル要約")),
        ]),
        ("学会発表", "", [
            ("", "オブジェクトフロー機械学習：操作レベルの代理モデルによる実験プロトコル間の知識転移と能動学習",
             "<strong>尾崎 勇介</strong>、海津 一成、高橋 恒一",
             "ポスター発表、<em>第66回 生物物理若手の会 夏の学校（SPIRAL）</em>、長野県、2026年8月。", ""),
            ("", AUTOML_TITLE, "<strong>尾崎 勇介</strong>、海津 一成、高橋 恒一",
             "ポスター発表、<em>AutoML Conference 2025, Non-Archival Content Track</em>、米国ニューヨーク市、2025年9月。", AUTOML_LINKS),
            ("", "実験プロトコルを活用した実験結果予測のための機械学習手法の開発と、その手法を用いた能動学習フレームワーク",
             "<strong>尾崎 勇介</strong>",
             "口頭発表、<em>理化学研究所 生命機能科学研究センター 学生シンポジウム 2025</em>、兵庫県神戸市、2025年5月。", ""),
            ("", "プロトコルを活用した実験結果予測のための機械学習手法の開発", "<strong>尾崎 勇介</strong>",
             "口頭発表、<em>理論生物学春の学校 2025</em>、広島大学、2025年2月。", ""),
        ]),
    ],
}

CV = {
    "en": {"lead": "My CV as a PDF (updated November 3, 2026).", "download": "Download CV (PDF)",
           "fallback": "Your browser cannot display the PDF here."},
    "ja": {"lead": "CV の PDF 版です（2026年11月3日更新、英語）。", "download": "CVをダウンロード（PDF）",
           "fallback": "このブラウザでは PDF を表示できません。"},
}

TITLES = {
    "home": ("Yusuke Ozaki", "尾崎 勇介 (Yusuke Ozaki)"),
    "research": ("Research Experience — Yusuke Ozaki", "研究経歴 — 尾崎 勇介"),
    "publications": ("Publications — Yusuke Ozaki", "論文 — 尾崎 勇介"),
    "cv": ("CV — Yusuke Ozaki", "CV — 尾崎 勇介"),
}
DESCS = {
    "home": ("Yusuke Ozaki, an undergraduate at Kwansei Gakuin University and Research Part-timer II at RIKEN BDR. Bayesian optimization, bandits, and active learning for self-driving laboratories.",
             "関西学院大学の学部生・理化学研究所BDRの研究パートタイマーII、尾崎勇介の個人サイト。自律実験のためのベイズ最適化、バンディット、能動学習。"),
    "research": ("Research experience of Yusuke Ozaki at RIKEN BDR, the University at Albany, SUNY, Kwansei Gakuin University, IBM, and the University of Osaka.",
                 "尾崎勇介の研究経歴。理研BDR、University at Albany, SUNY、関西学院大学、IBM、大阪大学。"),
    "publications": ("Publications and presentations by Yusuke Ozaki: Bayesian optimization of protocols, Object-Flow Machine Learning, Lipschitz bandits, and SPIN.",
                     "尾崎勇介の論文・学会発表。プロトコルのベイズ最適化、オブジェクトフロー機械学習、リプシッツ・バンディット、SPIN。"),
    "cv": ("Curriculum vitae of Yusuke Ozaki (PDF).", "尾崎勇介の CV（PDF）。"),
}

JSONLD = """  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Yusuke Ozaki",
    "alternateName": "尾崎 勇介",
    "url": "https://ozatamago.github.io/",
    "image": "https://ozatamago.github.io/assets/headshot.jpg",
    "jobTitle": "Undergraduate Student and Research Part-timer II",
    "knowsAbout": [
      "Bayesian Optimization",
      "Bandits",
      "Active Learning",
      "Self-Driving Laboratories",
      "Laboratory Automation",
      "Graph Neural Networks",
      "Structured LLM Planning"
    ],
    "alumniOf": [
      {
        "@type": "CollegeOrUniversity",
        "name": "University at Albany, SUNY"
      }
    ],
    "sameAs": [
      "https://github.com/ozatamago",
      "https://jp.linkedin.com/in/yusuke-ozaki-6643882a6"
    ],
    "affiliation": [
      {
        "@type": "CollegeOrUniversity",
        "name": "Kwansei Gakuin University"
      },
      {
        "@type": "Organization",
        "name": "RIKEN Center for Biosystems Dynamics Research"
      }
    ]
  }
  </script>
"""


def nav(lang, active, en_h, ja_h):
    out = []
    for (key, en, ja, e_h, j_h) in SECTIONS:
        label = en if lang == "en" else ja
        href = e_h if lang == "en" else j_h
        cls = ' class="active"' if key == active else ""
        out.append('      <a{cls} href="{href}">{label}</a>'.format(cls=cls, href=href, label=label))
    if en_h:
        en_active = ' class="active" aria-current="page"' if lang == "en" else ""
        ja_active = ' class="active" aria-current="page"' if lang == "ja" else ""
        out.append(
            '      <span class="lang-switch" role="group" aria-label="Language / 言語">\n'
            '        <a{ea} href="{eh}">EN</a>\n'
            '        <a{ja} href="{jh}">日本語</a>\n'
            '      </span>'.format(ea=en_active, eh=en_h, ja=ja_active, jh=ja_h))
    return (
        '    <nav class="nav" aria-label="{navlabel}">\n'
        '{links}\n'
        '    </nav>'
    ).format(navlabel=NAV_LABEL[lang], links="\n".join(out))


def header(lang, active):
    return '  <header class="site-header">\n{}\n  </header>'.format(nav(lang, active, META[active][2], META[active][3]))


def head(lang, key):
    en_h, ja_h = META[key][2], META[key][3]
    title = TITLES[key][0 if lang == "en" else 1]
    desc = DESCS[key][0 if lang == "en" else 1]
    canonical = BASE + (en_h if lang == "en" else ja_h)
    og_locale = "en_US" if lang == "en" else "ja_JP"
    og_alt = "ja_JP" if lang == "en" else "en_US"
    parts = [
        '<!doctype html>',
        '<html lang="{}">'.format(lang),
        '<head>',
        '  <meta charset="utf-8" />',
        '  <meta name="viewport" content="width=device-width,initial-scale=1" />',
    ]
    if key == "home" and lang == "en":
        parts.append('  <meta name="google-site-verification" content="Sbo6Nd1grieFwSqdgQMoZZsaIiLJxnaERxbTDKaRBXU" />')
    parts += [
        '  <title>{}</title>'.format(title),
        '  <meta name="description" content="{}" />'.format(desc),
        '  <meta name="author" content="Yusuke Ozaki" />',
        '  <meta name="robots" content="index, follow" />',
        '  <link rel="canonical" href="{}" />'.format(canonical),
        '  <link rel="alternate" hreflang="en" href="{}" />'.format(BASE + en_h),
        '  <link rel="alternate" hreflang="ja" href="{}" />'.format(BASE + ja_h),
        '  <link rel="alternate" hreflang="x-default" href="{}" />'.format(BASE + en_h),
        '  <link rel="icon" href="/assets/headshot.jpg" />',
        '  <meta property="og:type" content="{}" />'.format("profile" if key == "home" else "website"),
        '  <meta property="og:title" content="{}" />'.format(title),
        '  <meta property="og:description" content="{}" />'.format(desc),
        '  <meta property="og:url" content="{}" />'.format(canonical),
        '  <meta property="og:image" content="{}/assets/headshot.jpg" />'.format(BASE),
        '  <meta property="og:locale" content="{}" />'.format(og_locale),
        '  <meta property="og:locale:alternate" content="{}" />'.format(og_alt),
        '  <meta name="twitter:card" content="summary" />',
        '  <link rel="stylesheet" href="/assets/styles.css?v={}" />'.format(ASSET_VER),
    ]
    if key == "home":
        parts.append(JSONLD.rstrip("\n"))
    parts.append('</head>')
    return "\n".join(parts)


def list_block(items, indent="      "):
    lis = "\n".join('{}  <li>{}</li>'.format(indent, x) for x in items)
    return '{i}<ul class="item-list">\n{l}\n{i}</ul>'.format(i=indent, l=lis)


def title_block(lang, key):
    title = META[key][0] if lang == "en" else META[key][1]
    return '    <h1 class="page-title">{}</h1>\n    <div class="page-line"></div>\n'.format(title)


def home_page(lang):
    a = ABOUT[lang]
    bio = "\n".join('      <p{}>{}</p>'.format(' class="lead"' if i == 0 else "", p) for i, p in enumerate(a["bio"]))
    research = "/research/" if lang == "en" else "/ja/research/"
    interests = "\n".join('          <li><a href="{}#{}">{}</a>{}</li>'.format(research, anchor, label,
                                                                          " " + cite_pubs(lang, refs) if refs else "")
                          for (label, anchor, refs) in a["interests"])
    news = "\n".join('          <li><span class="when">{}</span>{}</li>'.format(w, b) for (w, b) in a["news"])
    links = "\n".join('        <li><a href="{}">{}</a></li>'.format(href, label) for (label, href) in a["links"])
    return (
        '  <main class="content about">\n'
        '    <div class="about-main">\n'
        '{bio}\n\n'
        '      <section class="section" id="interests">\n'
        '        <h2>{ih}</h2>\n'
        '        <p>{il}</p>\n'
        '        <ol class="topic-list">\n{interests}\n        </ol>\n'
        '        <p>{im}</p>\n'
        '      </section>\n\n'
        '      <section class="section" id="news">\n'
        '        <h2>{nh}</h2>\n'
        '        <ul class="news-list">\n{news}\n        </ul>\n'
        '      </section>\n\n'
        '      <section class="section" id="education">\n'
        '        <h2>{eh}</h2>\n'
        '{education}\n'
        '      </section>\n\n'
        '      <section class="section" id="awards">\n'
        '        <h2>{ah}</h2>\n'
        '{awards}\n'
        '      </section>\n'
        '    </div>\n\n'
        '    <aside class="about-side">\n'
        '      <img class="headshot" src="/assets/headshot.jpg" alt="{alt}">\n'
        '      <h2 class="side-title">{lh}</h2>\n'
        '      <ul class="link-list">\n{links}\n      </ul>\n'
        '    </aside>\n'
        '  </main>'
    ).format(bio=bio, ih=a["interests_h"], il=a["interests_lead"], interests=interests, im=a["interests_more"],
             nh=a["news_h"], news=news, eh=a["education_h"], education=list_block(a["education"], "        "),
             ah=a["awards_h"], awards=list_block(a["awards"], "        "),
             alt=a["img_alt"], lh=a["links_h"], links=links)


def cite_pubs(lang, text):
    """Turn {ref:<anchor>} into a "[W1]"-style link, numbered as on the publications page."""
    labels = {anchor: "[{}{}]".format(prefix, n)
              for (_, prefix, items) in PUBS[lang] if prefix
              for n, item in enumerate(items, 1) for anchor in [item[0]]}
    base = "/publications/" if lang == "en" else "/ja/publications/"
    return re.sub(r"\{ref:([\w-]+)\}",
                  lambda m: '<a class="pub-ref" href="{}#{}">{}</a>'.format(base, m.group(1), labels[m.group(1)]), text)


def research_page(lang):
    out = []
    assert len(RESEARCH_IDS) == len(RESEARCH[lang])
    for ident, (org, when, role, where, note, bullets) in zip(RESEARCH_IDS, RESEARCH[lang]):
        bullets = [cite_pubs(lang, b) for b in bullets]
        block = (
            '    <section class="entry" id="{ident}">\n'
            '      <div class="entry-head"><h2>{org}</h2><span class="entry-when">{when}</span></div>\n'
            '      <div class="entry-sub"><em>{role}</em><span>{where}</span></div>\n'
        ).format(ident=ident, org=org, when=when, role=role, where=where)
        if note:
            block += '      <p class="entry-note">{}</p>\n'.format(note)
        block += list_block(bullets) + '\n    </section>'
        out.append(block)
    soft = "\n".join('        <li><a href="{}"><strong>{}</strong></a>: {}</li>'.format(url, name, desc)
                     for (name, url, desc) in SOFTWARE[lang])
    out.append(
        '    <section class="section">\n'
        '      <h2>{}</h2>\n'
        '      <ul class="item-list">\n{}\n      </ul>\n'
        '    </section>'.format(SOFTWARE_H[lang], soft))
    return '  <main class="content">\n' + title_block(lang, "research") + "\n\n".join(out) + '\n  </main>'


def publications_page(lang):
    out = []
    for (heading, prefix, items) in PUBS[lang]:
        lis = []
        for n, (anchor, title, authors, status, links) in enumerate(items, 1):
            label = '<span class="pub-label">[{}{}]</span>'.format(prefix, n) if prefix else ""
            ident = ' id="{}"'.format(anchor) if anchor else ""
            venue = "".join('<span class="pub-venue">{}</span>'.format(line) for line in status.split("\n"))
            body = ('<div class="pub-body"><span class="pub-title">{}</span>'
                    '<span class="pub-authors">{}</span>{}{}</div>').format(
                title, authors.format(me=ME), venue,
                '<span class="pub-links">{}</span>'.format(links) if links else "")
            lis.append('        <li{}>{}{}</li>'.format(ident, label, body))
        out.append(
            '    <section class="section">\n'
            '      <h2>{}</h2>\n'
            '      <ul class="pub-list">\n{}\n      </ul>\n'
            '    </section>'.format(heading, "\n".join(lis)))
    return '  <main class="content">\n' + title_block(lang, "publications") + "\n\n".join(out) + '\n  </main>'


def cv_page(lang):
    c = CV[lang]
    return (
        '  <main class="content">\n'
        '{title}'
        '    <p>{lead}</p>\n'
        '    <div class="button-row">\n'
        '      <a class="button" href="{pdf}">{dl}</a>\n'
        '    </div>\n'
        '    <object class="pdf-frame" data="{pdf}" type="application/pdf">\n'
        '      <p>{fb} <a href="{pdf}">{dl}</a></p>\n'
        '    </object>\n'
        '  </main>'
    ).format(title=title_block(lang, "cv"), lead=c["lead"], pdf=CV_PDF, dl=c["download"], fb=c["fallback"])


BODIES = {"home": home_page, "research": research_page, "publications": publications_page, "cv": cv_page}


MATH = re.compile(r"\\\((.+?)\\\)")


def render_math(html):
    """Pre-render inline TeX written as \\( ... \\) with KaTeX (tools/katex_render.js; run npm install in tools/)."""
    texs = MATH.findall(html)
    if not texs:
        return html, False
    res = subprocess.run(["node", os.path.join(ROOT, "tools", "katex_render.js")],
                         input=json.dumps(texs), capture_output=True, text=True)
    if res.returncode != 0:
        raise SystemExit("KaTeX failed:\n" + res.stderr)
    rendered = iter(json.loads(res.stdout))
    return MATH.sub(lambda m: next(rendered), html), True


def page(lang, key):
    body, has_math = render_math(BODIES[key](lang))
    hd = head(lang, key)
    if has_math:
        hd = hd.replace('</head>', '  <link rel="stylesheet" href="/assets/katex/katex.min.css?v={}" />\n</head>'.format(KATEX_VER))
    return (
        '{head}\n'
        '<body>\n'
        '{header}\n\n'
        '{body}\n'
        '</body>\n'
        '</html>\n'
    ).format(head=hd, header=header(lang, key), body=body)


def redirect_page(lang, target):
    return (
        '<!doctype html>\n'
        '<html lang="{lang}">\n'
        '<head>\n'
        '  <meta charset="utf-8" />\n'
        '  <meta name="robots" content="noindex" />\n'
        '  <meta http-equiv="refresh" content="0; url={t}" />\n'
        '  <link rel="canonical" href="{base}{t}" />\n'
        '  <title>{name}</title>\n'
        '</head>\n'
        '<body>\n'
        '  <p><a href="{t}">{t}</a></p>\n'
        '</body>\n'
        '</html>\n'
    ).format(lang=lang, t=target, base=BASE, name=NAME[lang])


def href_path(href):
    rel = href.split("#")[0].strip("/")
    return os.path.join(ROOT, rel, "index.html") if rel else os.path.join(ROOT, "index.html")


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print("wrote", os.path.relpath(path, ROOT))


def sync_hand_page(rel, lang, en_h, ja_h):
    path = os.path.join(ROOT, rel)
    with open(path, encoding="utf-8") as f:
        src = f.read()
    new, n = re.subn(r'    <nav class="nav".*?</nav>', lambda m: nav(lang, None, en_h, ja_h), src, count=1, flags=re.S)
    if n != 1:
        raise SystemExit("no <nav> in " + rel)
    new = re.sub(r'/assets/styles\.css\?v=\d+', '/assets/styles.css?v=' + ASSET_VER, new)
    if new != src:
        write(path, new)


def sitemap():
    urls = []
    for (key, en, ja, en_h, ja_h) in SECTIONS:
        for href in (en_h, ja_h):
            urls.append(
                '  <url>\n'
                '    <loc>{loc}</loc>\n'
                '    <xhtml:link rel="alternate" hreflang="en" href="{en}"/>\n'
                '    <xhtml:link rel="alternate" hreflang="ja" href="{ja}"/>\n'
                '    <xhtml:link rel="alternate" hreflang="x-default" href="{en}"/>\n'
                '  </url>'.format(loc=BASE + href, en=BASE + en_h, ja=BASE + ja_h)
            )
    for href in ("/slides/", "/ja/slides/"):
        urls.append('  <url>\n    <loc>{}</loc>\n  </url>'.format(BASE + href))
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(urls) + "\n</urlset>\n"
    )


def main():
    for (key, *_rest) in SECTIONS:
        for i, lang in enumerate(("en", "ja")):
            write(href_path(META[key][2 + i]), page(lang, key))
    for (old, new) in RETIRED:
        for i, lang in enumerate(("en", "ja")):
            write(href_path(old[i]), redirect_page(lang, new[i]))
    for (rel, lang, en_h, ja_h) in HAND_PAGES:
        sync_hand_page(rel, lang, en_h, ja_h)
    write(os.path.join(ROOT, "sitemap.xml"), sitemap())


if __name__ == "__main__":
    main()
