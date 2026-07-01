#!/usr/bin/env python3
"""Static site generator for ozatamago.github.io.

Emits the Home page (/, /ja/) and one page per section
(Work Experience, Education, Research, Publications, Projects, Awards) in
English and Japanese, from the bilingual content below. Each page carries a
full-page background interaction (see assets/interactions.js) chosen per section.

Run:  python3 tools/build.py
Edit content here (single source of truth), then re-run to regenerate.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://ozatamago.github.io"
ASSET_VER = "11"  # bump when assets/interactions.js or assets/styles.css change (cache-busting)

NAME = {"en": "Yusuke Ozaki", "ja": "尾崎 勇介"}
NAV_LABEL = {"en": "Main navigation", "ja": "メインナビゲーション"}

# key, en label, ja label, en href, ja href, interaction
SECTIONS = [
    ("home",         "Home",            "Home",     "/",              "/ja/",              "boids"),
    ("experience",   "Work Experience", "職歴",     "/experience/",   "/ja/experience/",   "ant-colony"),
    ("education",    "Education",       "学歴",     "/education/",    "/ja/education/",    "dla"),
    ("research",     "Research",        "研究",     "/research/",     "/ja/research/",     "reaction-diffusion"),
    ("publications", "Publications",    "論文",     "/publications/", "/ja/publications/", "voronoi"),
    ("projects",     "Projects",        "Projects", "/projects/",     "/ja/projects/",     "langton"),
    ("awards",       "Awards",          "受賞",     "/awards/",       "/ja/awards/",       "life"),
]
EXTRA_NAV = [
    ("slides", "Slides", "発表資料", "/slides/", "/slides/"),
    ("cv",     "CV",     "CV",       "/cv/",     "/cv/"),
]

META = {key: (en, ja, en_h, ja_h, act) for (key, en, ja, en_h, ja_h, act) in SECTIONS}

# ---- section list content (raw HTML <li> bodies) ----
ITEMS = {
    "experience": {
        "en": [
            '<strong>RIKEN Center for Biosystems Dynamics Research, Laboratory for Biologically Inspired Computing</strong>, Research Part-timer II. <span class="meta">Jun. 2024 - Aug. 2025, Kobe, Japan.</span> Developed machine-learning based experimental simulators and protocol-aware active learning workflows for automated wet-lab experiments.',
            '<strong>Yachie Laboratory</strong>, Research Assistant. <span class="meta">Feb. 2025 - Aug. 2025, Osaka, Japan.</span> Assisted computational projects on gene regulatory network inference from single-cell RNA-seq and ATAC-seq data.',
            '<strong>Metadata Incorporated</strong>, Software Engineer, Part-time. <span class="meta">Apr. 2024 - Jun. 2024, Remote, Japan.</span> Developed and maintained web applications for AI-driven enterprise services, including backend APIs and data-processing components.',
        ],
        "ja": [
            '<strong>RIKEN Center for Biosystems Dynamics Research, Laboratory for Biologically Inspired Computing</strong> Research Part-timer II。<span class="meta">2024年6月 - 2025年8月、神戸。</span> AI・ロボティクス駆動の wet-lab automation に関する研究で、実験シミュレータや protocol-aware active learning workflow を開発しました。',
            '<strong>Yachie Laboratory</strong> Research Assistant。<span class="meta">2025年2月 - 2025年8月、大阪。</span> single-cell RNA-seq と ATAC-seq を用いた遺伝子制御ネットワーク推定の計算プロジェクトを支援しました。',
            '<strong>Metadata Incorporated</strong> Software Engineer, Part-time。<span class="meta">2024年4月 - 2024年6月、Remote。</span> AI-driven enterprise services の Web application、backend API、data-processing components の開発・保守に携わりました。',
        ],
    },
    "education": {
        "en": [
            '<strong>Kwansei Gakuin University</strong>, Bachelor of Engineering in Computer Science, School of Engineering. <span class="meta">Apr. 2022 - Mar. 2027 expected, Sanda, Hyogo, Japan.</span>',
            '<strong>University at Albany, SUNY</strong>, Exchange Student, Department of Computer Science. <span class="meta">Aug. 2025 - May 2026 expected, Albany, NY, USA.</span>',
        ],
        "ja": [
            '<strong>関西学院大学</strong> 工学部 情報工学課程、Bachelor of Engineering in Computer Science。<span class="meta">2022年4月 - 2027年3月修了予定、兵庫県三田市。</span>',
            '<strong>University at Albany, SUNY</strong> Department of Computer Science、交換留学生。<span class="meta">2025年8月 - 2026年5月予定、Albany, NY, USA。</span>',
        ],
    },
    "research": {
        "en": [
            '<strong>AI for bioengineering and biology:</strong> Graph neural networks for molecular and cellular systems, gene regulatory network inference, and single-cell omics analysis.',
            '<strong>Protocol-aware active learning:</strong> Bayesian optimization frameworks that autonomously drive scientific experiments and support data-efficient exploration of experimental conditions.',
            '<strong>Presentations:</strong> Poster at AutoML 2025 on Object-Flow Machine Learning; oral presentation at the RIKEN BDR Student Symposium 2025; poster at the Spring School for Theoretical Biology 2025.',
        ],
        "ja": [
            '<strong>AI for bioengineering and biology:</strong> 分子・細胞システムに対するグラフニューラルネットワーク、遺伝子制御ネットワーク推定、シングルセルオミクス解析に関心があります。',
            '<strong>Protocol-aware active learning:</strong> 科学実験を自律的に進めるベイズ最適化フレームワークと、実験条件を効率よく探索するためのラボオートメーション指向の機械学習を研究しています。',
            '<strong>発表:</strong> AutoML 2025 での Object-Flow Machine Learning に関するポスター発表、RIKEN BDR Student Symposium 2025 での口頭発表、Spring School for Theoretical Biology 2025 でのポスター発表。',
        ],
    },
    "publications": {
        "en": [
            '<strong>SPIN: Structural LLM Planning via Iterative Navigation for Industrial Tasks.</strong> '
            '<span class="meta"><strong>Yusuke Ozaki</strong>, Dhaval Patel. arXiv preprint arXiv:2605.14051 [cs.AI], 2026.</span> '
            '<span class="meta"><a href="https://arxiv.org/abs/2605.14051">arXiv</a> &middot; <a href="https://arxiv.org/pdf/2605.14051">PDF</a> &middot; <a href="/slides/viewer.html?id=spin-showcase">Visual summary</a></span>',
        ],
        "ja": [
            '<strong>SPIN: Structural LLM Planning via Iterative Navigation for Industrial Tasks.</strong> '
            '<span class="meta"><strong>尾崎 勇介</strong>, Dhaval Patel. arXiv preprint arXiv:2605.14051 [cs.AI], 2026年.</span> '
            '<span class="meta"><a href="https://arxiv.org/abs/2605.14051">arXiv</a> &middot; <a href="https://arxiv.org/pdf/2605.14051">PDF</a> &middot; <a href="/slides/viewer.html?id=spin-showcase">ビジュアル要約</a></span>',
        ],
    },
    "projects": {
        "en": [
            '<strong>Bayesian Optimization with Gaussian Process Panel Models:</strong> Studying preference-based Bayesian optimization with General Preference Embedding Models at the University at Albany, SUNY.',
            '<strong>Minimal-Edges Graph Neural Networks for Efficient Graph Learning:</strong> Designing graph neural network architectures that learn task-specific sparse adjacency structures layer by layer.',
            '<strong>Methodology for Asset Operation LLM Agents:</strong> Developing a software framework that combines large language models, structured task planning, tool calling, and evaluation pipelines. <span class="meta">See <a href="/publications/">SPIN (arXiv:2605.14051)</a>.</span>',
            '<strong>Campus Activity Recommender:</strong> Technical lead for a HackRPI 2025 team project that built a campus club and event recommender web application with a LinUCB bandit engine and Flask APIs.',
        ],
        "ja": [
            '<strong>Bayesian Optimization with Gaussian Process Panel Models:</strong> University at Albany, SUNY で、General Preference Embedding Models を用いた preference-based Bayesian optimization を研究しています。',
            '<strong>Minimal-Edges Graph Neural Networks for Efficient Graph Learning:</strong> タスクに応じた sparse adjacency structure を層ごとに学習する graph neural network architecture を設計しています。',
            '<strong>Methodology for Asset Operation LLM Agents:</strong> 大規模言語モデル、structured task planning、tool calling、evaluation pipelines を組み合わせた software framework を開発しています。<span class="meta">関連論文: <a href="/ja/publications/">SPIN (arXiv:2605.14051)</a>。</span>',
            '<strong>Campus Activity Recommender:</strong> HackRPI 2025 にて、LinUCB bandit engine と Flask APIs を用いた campus club / event recommender web application の technical lead を担当しました。',
        ],
    },
    "awards": {
        "en": [
            '<strong>Keyence Foundation Student Scholarship</strong>. <span class="meta">Jul. 2024.</span>',
            '<strong>Gyomu Super Japan Dream Foundation Study Abroad Scholarship</strong>. <span class="meta">Aug. 2025 - Present.</span>',
        ],
        "ja": [
            '<strong>キーエンス財団 奨学生</strong>。<span class="meta">2024年7月。</span>',
            '<strong>業務スーパージャパンドリーム財団 派遣留学奨学生</strong>。<span class="meta">2025年8月 - 現在。</span>',
        ],
    },
}

# ---- Home content ----
HOME = {
    "en": {
        "lead": "My name is Yusuke Ozaki. I am an undergraduate student in Computer Science at Kwansei Gakuin University and an exchange student in the Department of Computer Science at the University at Albany, SUNY.",
        "para": "My long-term goal is to create living organisms with arbitrary, desired functions. To pursue this vision, I am interested in laboratory automation, including automated experiment execution and automated experimental design/planning. My current research focuses on protocol-aware active learning and preference modeling using Bayesian optimization.",
        "ri_label": "Research interests:",
        "ri": "Bayesian Optimization, Active Learning, Graph Neural Networks (GNNs), AI for Science / Lab Automation, Single-cell omics &amp; GRN inference",
        "hobbies_label": "Hobbies:",
        "hobbies": "Brazilian Jiu-Jitsu, reading books.",
        "news_h": "News",
        "featured_h": "Featured",
        "news": [
            ("2026", 'Preprint: <em>SPIN — Structural LLM Planning via Iterative Navigation</em> (<a href="https://arxiv.org/abs/2605.14051">arXiv:2605.14051</a>).'),
            ("Aug. 2025", 'Began an exchange at the University at Albany, SUNY.'),
            ("2025", 'Poster at AutoML 2025 (Object-Flow Machine Learning) and an oral talk at the RIKEN BDR Student Symposium 2025.'),
            ("Jul. 2024", 'Awarded the Keyence Foundation Student Scholarship.'),
        ],
        "img_alt": "Headshot of Yusuke Ozaki",
        "cv": "View CV",
    },
    "ja": {
        "lead": "尾崎勇介です。関西学院大学 工学部 情報工学課程の学部生で、現在は University at Albany, SUNY の Department of Computer Science に交換留学しています。",
        "para": "長期的には、任意の望ましい機能を持つ生物を設計・創出できる技術に関心があります。そのために、実験の自動実行や実験計画の自動化を含むラボオートメーション、そしてベイズ最適化を用いた protocol-aware active learning と preference modeling を研究しています。",
        "ri_label": "研究関心：",
        "ri": "ベイズ最適化、能動学習、グラフニューラルネットワーク、AI for Science、ラボオートメーション、シングルセルオミクス、遺伝子制御ネットワーク推定",
        "hobbies_label": "趣味：",
        "hobbies": "ブラジリアン柔術、読書。",
        "news_h": "News",
        "featured_h": "主要論文",
        "news": [
            ("2026年", 'プレプリント: <em>SPIN — Structural LLM Planning via Iterative Navigation</em>（<a href="https://arxiv.org/abs/2605.14051">arXiv:2605.14051</a>）を公開。'),
            ("2025年8月", 'University at Albany, SUNY への交換留学を開始。'),
            ("2025年", 'AutoML 2025 でポスター発表（Object-Flow Machine Learning）、RIKEN BDR Student Symposium 2025 で口頭発表。'),
            ("2024年7月", 'キーエンス財団 奨学生に採択。'),
        ],
        "img_alt": "尾崎勇介の顔写真",
        "cv": "CVを見る",
    },
}

TITLES = {
    "home": ("Yusuke Ozaki — Personal Website | Computer Science Researcher",
             "尾崎 勇介 (Yusuke Ozaki) — 個人サイト | コンピュータサイエンス研究"),
    "experience": ("Work Experience — Yusuke Ozaki", "職歴 — 尾崎 勇介"),
    "education": ("Education — Yusuke Ozaki", "学歴 — 尾崎 勇介"),
    "research": ("Research — Yusuke Ozaki", "研究 — 尾崎 勇介"),
    "publications": ("Publications — Yusuke Ozaki", "論文 — 尾崎 勇介"),
    "projects": ("Projects — Yusuke Ozaki", "Projects — 尾崎 勇介"),
    "awards": ("Awards — Yusuke Ozaki", "受賞 — 尾崎 勇介"),
}
DESCS = {
    "home": ("Personal website of Yusuke Ozaki, a Computer Science researcher at Kwansei Gakuin University (exchange student at the University at Albany, SUNY). Bayesian optimization, active learning, graph neural networks, and AI for science.",
             "尾崎勇介の個人サイト。関西学院大学のCS学部生、University at Albany, SUNY 交換留学生。ベイズ最適化・能動学習・GNN・AI for Science。"),
    "experience": ("Work experience of Yusuke Ozaki — research at RIKEN BDR and the Yachie Laboratory, and software engineering.",
                   "尾崎勇介の職歴 — 理研BDR・八谷研究室での研究、ソフトウェアエンジニアリング。"),
    "education": ("Education of Yusuke Ozaki — Computer Science at Kwansei Gakuin University and exchange study at the University at Albany, SUNY.",
                  "尾崎勇介の学歴 — 関西学院大学 情報工学課程、University at Albany, SUNY への交換留学。"),
    "research": ("Research of Yusuke Ozaki — AI for biology, protocol-aware active learning, graph neural networks, and single-cell omics.",
                 "尾崎勇介の研究 — AI for biology、protocol-aware active learning、グラフニューラルネットワーク、シングルセルオミクス。"),
    "publications": ("Publications by Yusuke Ozaki, including SPIN: Structural LLM Planning via Iterative Navigation for Industrial Tasks (arXiv:2605.14051).",
                     "尾崎勇介の論文 — SPIN: Structural LLM Planning via Iterative Navigation for Industrial Tasks（arXiv:2605.14051）など。"),
    "projects": ("Projects by Yusuke Ozaki — Bayesian optimization, graph neural networks, LLM agents, and a campus activity recommender.",
                 "尾崎勇介のプロジェクト — ベイズ最適化、グラフニューラルネットワーク、LLMエージェント、キャンパス活動レコメンダー。"),
    "awards": ("Awards and scholarships received by Yusuke Ozaki, including the Keyence Foundation Student Scholarship.",
               "尾崎勇介の受賞・奨学金 — キーエンス財団奨学生など。"),
}

JSONLD = """  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Yusuke Ozaki",
    "alternateName": "尾崎 勇介",
    "url": "https://ozatamago.github.io/",
    "image": "https://ozatamago.github.io/assets/headshot.jpg",
    "jobTitle": "Computer Science Researcher",
    "knowsAbout": ["Bayesian Optimization", "Active Learning", "Graph Neural Networks", "AI for Science", "Laboratory Automation", "Single-cell omics"],
    "alumniOf": [
      { "@type": "CollegeOrUniversity", "name": "Kwansei Gakuin University" },
      { "@type": "CollegeOrUniversity", "name": "University at Albany, SUNY" }
    ],
    "sameAs": [
      "https://github.com/ozatamago",
      "https://jp.linkedin.com/in/yusuke-ozaki-6643882a6"
    ]
  }
  </script>
"""


def nav_links(lang, active):
    out = []
    for (key, en, ja, en_h, ja_h, _act) in SECTIONS:
        label = en if lang == "en" else ja
        href = en_h if lang == "en" else ja_h
        cls = ' class="active"' if key == active else ""
        out.append('      <a{cls} href="{href}">{label}</a>'.format(cls=cls, href=href, label=label))
    for (key, en, ja, en_h, ja_h) in EXTRA_NAV:
        label = en if lang == "en" else ja
        out.append('      <a href="{href}">{label}</a>'.format(href=en_h, label=label))
    return "\n".join(out)


def header(lang, active):
    en_h, ja_h = META[active][2], META[active][3]
    en_active = ' class="active" aria-current="page"' if lang == "en" else ""
    ja_active = ' class="active" aria-current="page"' if lang == "ja" else ""
    home_href = "/" if lang == "en" else "/ja/"
    switch = (
        '      <span class="lang-switch" role="group" aria-label="Language / 言語">\n'
        '        <a{ea} href="{eh}">EN</a>\n'
        '        <a{ja} href="{jh}">日本語</a>\n'
        '      </span>'
    ).format(ea=en_active, eh=en_h, ja=ja_active, jh=ja_h)
    return (
        '  <header class="site-header">\n'
        '    <a class="brand" href="{home}">{brand}</a>\n'
        '    <nav class="nav" aria-label="{navlabel}">\n'
        '{links}\n'
        '{switch}\n'
        '    </nav>\n'
        '  </header>'
    ).format(home=home_href, brand=NAME[lang], navlabel=NAV_LABEL[lang],
             links=nav_links(lang, active), switch=switch)


def head(lang, key):
    en_h, ja_h = META[key][2], META[key][3]
    title = TITLES[key][0 if lang == "en" else 1]
    desc = DESCS.get(key, (title, title))[0 if lang == "en" else 1]
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


def list_block(items):
    lis = "\n".join('        <li>{}</li>'.format(x) for x in items)
    return '      <ul class="item-list">\n{}\n      </ul>'.format(lis)


def section_page(lang, key):
    title = META[key][0] if lang == "en" else META[key][1]
    main = (
        '  <main class="content">\n'
        '    <h1 class="page-title">{title}</h1>\n'
        '    <div class="page-line"></div>\n'
        '{items}\n'
        '  </main>'
    ).format(title=title, items=list_block(ITEMS[key][lang]))
    return main


def home_page(lang):
    h = HOME[lang]
    buttons = (
        '        <div class="button-row">\n'
        '          <a class="button" href="/cv/">{cv}</a>\n'
        '          <a class="button secondary" href="https://github.com/ozatamago">GitHub</a>\n'
        '          <a class="button secondary" href="mailto:ozatamago40@gmail.com">Email</a>\n'
        '          <a class="button secondary" href="https://jp.linkedin.com/in/yusuke-ozaki-6643882a6">LinkedIn</a>\n'
        '        </div>'
    ).format(cv=h["cv"])
    news = "\n".join(
        '        <li><span class="when">{when}</span>{body}</li>'.format(when=w, body=b)
        for (w, b) in h["news"]
    )
    featured = list_block(ITEMS["publications"][lang])
    return (
        '  <section class="hero">\n'
        '    <div>\n'
        '      <h1>Yusuke Ozaki</h1>\n'
        '      <div class="hero-line"></div>\n'
        '    </div>\n'
        '  </section>\n\n'
        '  <main class="content">\n'
        '    <section class="intro">\n'
        '      <img class="headshot" src="/assets/headshot.jpg" alt="{alt}">\n'
        '      <div>\n'
        '        <p class="lead">{lead}</p>\n'
        '        <p>{para}</p>\n'
        '        <p><strong>{ri_label}</strong> {ri}</p>\n'
        '        <p><strong>{hob_label}</strong> {hob}</p>\n'
        '{buttons}\n'
        '      </div>\n'
        '    </section>\n\n'
        '    <section class="section">\n'
        '      <h2>{news_h}</h2>\n'
        '      <ul class="news-list">\n{news}\n      </ul>\n'
        '    </section>\n\n'
        '    <section class="section">\n'
        '      <h2>{featured_h}</h2>\n'
        '{featured}\n'
        '    </section>\n'
        '  </main>'
    ).format(alt=h["img_alt"], lead=h["lead"], para=h["para"], ri_label=h["ri_label"], ri=h["ri"],
             hob_label=h["hobbies_label"], hob=h["hobbies"], buttons=buttons,
             news_h=h["news_h"], news=news, featured_h=h["featured_h"], featured=featured)


def page(lang, key):
    interaction = META[key][4]
    body = home_page(lang) if key == "home" else section_page(lang, key)
    return (
        '{head}\n'
        '<body data-interaction="{it}">\n'
        '{header}\n\n'
        '{body}\n\n'
        '  <script src="/assets/interactions.js?v={ver}" defer></script>\n'
        '</body>\n'
        '</html>\n'
    ).format(head=head(lang, key), it=interaction, header=header(lang, key), body=body, ver=ASSET_VER)


def out_path(lang, key):
    href = META[key][2] if lang == "en" else META[key][3]
    rel = href.strip("/")
    if rel == "":
        rel = "index.html"
    elif rel == "ja":
        rel = "ja/index.html"
    else:
        rel = rel + "/index.html"
    return os.path.join(ROOT, rel)


def sitemap():
    urls = []
    for (key, en, ja, en_h, ja_h, _act) in SECTIONS:
        for href in (en_h, ja_h):
            urls.append(
                '  <url>\n'
                '    <loc>{loc}</loc>\n'
                '    <xhtml:link rel="alternate" hreflang="en" href="{en}"/>\n'
                '    <xhtml:link rel="alternate" hreflang="ja" href="{ja}"/>\n'
                '    <xhtml:link rel="alternate" hreflang="x-default" href="{en}"/>\n'
                '  </url>'.format(loc=BASE + href, en=BASE + en_h, ja=BASE + ja_h)
            )
    for href in ("/cv/", "/slides/"):
        urls.append('  <url>\n    <loc>{}</loc>\n  </url>'.format(BASE + href))
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(urls) + "\n</urlset>\n"
    )


def main():
    count = 0
    for (key, *_rest) in SECTIONS:
        for lang in ("en", "ja"):
            path = out_path(lang, key)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                f.write(page(lang, key))
            count += 1
            print("wrote", os.path.relpath(path, ROOT))
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(sitemap())
    print("wrote sitemap.xml")
    print("done:", count, "pages")


if __name__ == "__main__":
    main()
