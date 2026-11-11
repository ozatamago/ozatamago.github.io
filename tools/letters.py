#!/usr/bin/env python3
"""letters.py — writes the unlisted recommendation-letter pages, one per recommender.

    python3 tools/letters.py

Each page lives at /letters/<slug>/ with `noindex`, is linked from nowhere on the
site, and is left out of sitemap.xml. The repository is public, so these pages
hold only what is fine to be seen: the request, the submission flow, the deadline
table, and the recommender's memo. Transcripts, manuscripts under review, and the
research-goals draft go in a password-protected bundle (tools/seal.py project
--unlisted); its ?k= link is set in LOCKED below.

The memo PDFs are built in document_drafts/recommenders/ and copied next to each page.
"""
import html
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEMOS = os.path.join(os.path.dirname(ROOT), "document_drafts", "recommenders")
CV = "/assets/cv.pdf?v=20261110"

# Set once known; None shows a "to be confirmed" placeholder on the page.
REGISTER_BY = None   # e.g. ("11月17日", "Nov 17") — when all requests will be sent
WAIVE = True         # True = I waive my right to see the letters, False = I don't
LOCKED = "/slides/viewer.html?k=data/772029a167d0876756b091db.enc"  # password-protected bundle (tools/seal.py project ... --unlisted)

# ---- deadline table (checked on official pages 2026-11-10; times to confirm in portals) ----
# from: which recommenders each school asks for (T, I, L); "I?" = only if a 3rd letter is accepted.
TBD = {"ja": "（時刻確認中）", "en": " (time to be confirmed)"}
ROWS = [
    dict(school=("NYU Tandon 生体医工学 PhD（Jef Boeke）",
                 "NYU Tandon, Biomedical Engineering PhD (Jef Boeke)"),
         letters=("推薦フォーム2件（推薦状は任意）", "2 recommendation forms; a letter is optional"),
         frm="T L I?",
         deadline=("12月1日" + TBD["ja"], "Dec 1, 2026" + TBD["en"]), by=("11月24日", "Nov 24"),
         notes=("オンラインのフォームへの記入が必須で、推薦状だけでは受理されません。推薦状をアップロードする場合は、"
                "所属機関のレターヘッドで、所属機関のメールアドレスから提出する必要があります。",
                "The online form must be completed; a letter alone does not count. An uploaded letter must be "
                "on institutional letterhead, from an institutional email address.")),
    dict(school=("Northwestern 学際生物科学（IBiS）PhD（Julius Lucks）",
                 "Northwestern, Interdisciplinary Biological Sciences (IBiS) PhD (Julius Lucks)"),
         letters=("3通", "3"), frm="T I L",
         deadline=("12月1日" + TBD["ja"], "Dec 1, 2026" + TBD["en"]), by=("11月24日", "Nov 24"),
         notes=("推薦状の中で IBiS の課程名に触れていただくよう求められています。学業上の能力と、"
                "独立して研究を進める能力について。提出は大学からのリンク経由のみで、郵送や他のサービスは使えません。",
                "Asks recommenders to mention the IBiS program in the letter; academic ability and ability "
                "to do research independently. Letters only through the school's link (no mail or other services).")),
    dict(school=("Cornell 食品科学・技術 PhD（Stephan Lane）",
                 "Cornell, Food Science and Technology PhD (Stephan Lane)"),
         letters=("2〜3通", "2–3"), frm="T I L",
         deadline=("12月1日" + TBD["ja"], "Dec 1, 2026" + TBD["en"]), by=("11月24日", "Nov 24"),
         notes=("リンク先で、オンラインの推薦フォームへの記入と推薦状のアップロードの両方が必要です。締切は厳格です。",
                "The link asks for an online reference form plus an uploaded letter. Deadlines are strict.")),
    dict(school=("UC Berkeley 化学・生体分子工学 PhD（Jay Keasling）",
                 "UC Berkeley, Chemical and Biomolecular Engineering PhD (Jay Keasling)"),
         letters=("3通（うち2通以上は学術関係者から）", "3; at least 2 academic"), frm="T I L",
         deadline=("日本時間 12月2日 13:59", "Dec 1, 2026, 8:59 pm PT"), by=("11月24日", "Nov 24"),
         notes=("リンク先で評価フォームへの記入と推薦状のアップロードがあります。知的能力、研究への適性、人柄、これまでの仕事の質についての所見が求められています。",
                "An evaluation form plus an uploaded letter. Asks for your impressions of intellectual ability, research aptitude, character, and the "
                "quality of previous work.")),
    dict(school=("UC Santa Barbara 生体工学 PhD（Max Wilson、Michelle O’Malley）",
                 "UC Santa Barbara, Bioengineering PhD (Max Wilson, Michelle O’Malley)"),
         letters=("3通", "3"), frm="T I L",
         deadline=("日本時間 12月3日 16:59", "Dec 2, 2026, 11:59 pm PT"), by=("11月25日", "Nov 25"),
         notes=("依頼メールは gradadmissions@graddiv.ucsb.edu から届きます。迷惑メールに振り分けられないようご注意ください。",
                "Request emails come from gradadmissions@graddiv.ucsb.edu; please make sure they are not "
                "filtered as spam.")),
    dict(school=("Stanford 計算機科学 PhD（Stefano Ermon、Chris Ré、Jure Leskovec）",
                 "Stanford, Computer Science PhD (Stefano Ermon, Chris Ré, Jure Leskovec)"),
         letters=("ちょうど3通", "Exactly 3"), frm="T I L",
         deadline=("日本時間 12月9日 16:59", "Dec 8, 2026, 11:59 pm PT"), by=("12月1日", "Dec 1"),
         notes=("評価フォームでは、比較の対象となる集団、これまで何年間で何人の学生を評価されたか、その中での私の位置、"
                "入学の推薦度を尋ねられます。推薦状では、知的な自立性、分析力、表現力が問われます。推薦状は（翻訳も含めて）先生ご自身でお書きいただく決まりです。Interfolio は使えません。",
                "Rating form: comparison group, how many students you have evaluated over how many years, my "
                "relative standing, and an overall recommendation. Letter: intellectual independence, "
                "analytical ability, expression. Letters must be written (and, if needed, translated) by you alone. No Interfolio.")),
    dict(school=("Boston University コンピュータ工学 PhD（Douglas Densmore）",
                 "Boston University, Computer Engineering PhD (Douglas Densmore)"),
         letters=("2〜3通", "2–3"), frm="T I L",
         deadline=("日本時間 12月16日 13:59", "Dec 15, 2026, 11:59 pm ET"), by=("12月8日", "Dec 8"),
         notes=("締切後に届いた推薦状は審査されない可能性があります。依頼メールは gradadmissions@bu.edu から届きます。",
                "Letters arriving after the deadline may not be reviewed. Request emails come from "
                "gradadmissions@bu.edu.")),
    dict(school=("Columbia 生体医工学 PhD（Harris Wang）",
                 "Columbia, Biomedical Engineering PhD (Harris Wang)"),
         letters=("3通", "3"), frm="T I L",
         deadline=("12月15日" + TBD["ja"], "Dec 15, 2026" + TBD["en"]), by=("12月8日", "Dec 8"),
         notes=("依頼メールは seasgradmit@columbia.edu から届きます。リンク先で短い評価フォームへの記入と、"
                "レターヘッド付きの推薦状のアップロードの両方が必要です。本人確認のため、所属機関の教職員名簿のリンクか名刺の画像を求められます。"
                "Columbia から確認の連絡が来ることがあります。研究に焦点を当てた推薦状が勧められています（Interfolio やメールでの送付は不可）。",
                "Request email from seasgradmit@columbia.edu. A brief evaluation form plus a letter on letterhead. "
                "You will be asked for a link to your official directory page or a business card to verify identity, "
                "and Columbia may contact you to verify the letter. Research-focused letters are encouraged (no "
                "Interfolio or email).")),
    dict(school=("UC Riverside 化学・環境工学 PhD（Ian Wheeldon）",
                 "UC Riverside, Chemical and Environmental Engineering PhD (Ian Wheeldon)"),
         letters=("3通以上（うち2通以上は教員から）", "At least 3; at least 2 from professors"), frm="T I L",
         deadline=("日本時間 2027年1月6日 16:59（奨学金の優先締切。日付は確認中）",
                   "Jan 5, 2027, 11:59 pm PT, fellowship priority deadline (date to be confirmed)"),
         by=("12月8日", "Dec 8"),
         notes=("所属機関のメールアドレスからのご提出が必要です（個人のアドレスは不可）。学科は、学業成績、研究経験の質、"
                "博士課程への意欲、勤勉さ、粘り強さについて書かれた推薦状を求めています。"
                "学科のページには12月15日という古い記載もあるため、早めのお願い日にしています。",
                "Must be submitted from an institutional email address (no personal accounts). The department "
                "asks about academic achievement, quality of research experience, motivation for PhD study, "
                "work ethic, and resilience. An older department page says Dec 15, so the suggested date is early.")),
]

PEOPLE = {
    "takahashi": dict(
        slug="takahashi-5ad488", code="T", lang="ja", name="高橋 恒一 先生",
        memos=[("memo_takahashi_ja.pdf", "高橋先生用の資料（日本語）"),
               ("memo_takahashi.pdf", "同じ資料の英語版")],
        contact="ご不明な点は、Slack でいつでもご連絡ください。"),
    "inokuchi": dict(
        slug="inokuchi-49d5f0", code="I", lang="ja", name="猪口 明博 先生",
        memos=[("memo_inokuchi_ja.pdf", "猪口先生用の資料（日本語）"),
               ("memo_inokuchi.pdf", "同じ資料の英語版")],
        contact="ご不明な点は、メールでいつでもご連絡ください。"),
    "liu": dict(
        slug="liu-a76e60", code="L", lang="en", name="Prof. Chong Liu",
        memos=[("memo_liu.pdf", "Memo for Prof. Liu")],
        contact="If you have any questions, please message me on Slack at any time."),
}
# shown when a school takes this recommender only if it accepts a 3rd letter ("I?" in ROWS)
COND = {"ja": "（3人目の推薦者を受け付ける場合のみお願いします）",
        "en": " (only if the school accepts a third recommender)"}

T = {
    "ja": dict(
        title="推薦状のお願い", thanks=(
            "推薦状をお引き受けいただき、ありがとうございます。2027年秋入学の博士課程（9課程）に出願します。"
            "締切、提出の流れ、資料をこのページにまとめました。このページは検索には表示されず、"
            "URL をお伝えした方にだけご案内しています。"),
        h_ask="お願いしたいこと",
        ask=[
            "英語の推薦状を1通ご用意いただければ、すべての課程で共通にお使いいただけます"
            "（所属機関のレターヘッド、署名と日付入り）。",
            "提出用のリンクは、各大学の出願システムから先生宛てにメールで個別に届きます。"
            "メールが届く前に、推薦状本体のご準備を先に進めていただけると助かります。",
            "一部の大学では、リンク先で評価項目や設問にもお答えいただく必要があります（下の表の「推薦者向けの注意」）。",
            "「提出のお願い日」は締切の約1週間前です。ご都合に合わせて調整しますので、お知らせください。",
        ],
        h_flow="提出の流れ",
        flow=lambda reg, waive: [
            "私が各大学の出願システムに、先生を推薦者として登録します（" + reg + "）。",
            "各大学から先生宛てに、その大学専用の提出リンクが入ったメールが届きます。迷惑メールフォルダに入ることもあります。",
            "リンク先で推薦状をアップロードし、設問がある場合はお答えのうえ、ご提出ください。推薦状の内容は私には見えません。",
            waive,
            "提出状況は私も出願システムで確認し、未提出のものがあれば締切前にお知らせします。",
        ],
        reg=lambda r: r[0] + "までに全課程分" if r else "全課程分の登録日は確認中",
        waive=lambda w: ("私は推薦状を閲覧する権利を放棄します（waive）。" if w is True else
                         "私は推薦状を閲覧する権利を放棄しません。" if w is False else
                         "推薦状を閲覧する権利を放棄するか（waive）は確認中です。"),
        h_table="出願先と締切",
        table_note="締切は、日本時間が分かるものは日本時間で示しています。要件は2026年11月10日時点の公式ページによります。",
        cols=["", "大学・課程（志望教員）", "必要な推薦状", "締切", "提出のお願い日", "推薦者向けの注意"],
        h_docs="資料",
        cv="CV（PDF、英語）",
        locked="研究目標・成績証明書・主要原稿（パスワード付き）",
        locked_note="パスワードは別途お送りします。",
        locked_tbd="研究目標・成績証明書・主要原稿（パスワード付き、準備中）",
        h_contact="連絡先", updated="更新：2026年11月11日", tbd_cls="（確認中）"),
    "en": dict(
        title="Recommendation letters", thanks=(
            "Thank you for agreeing to write for me. I am applying to 9 PhD programs for Fall 2027 entry. "
            "This page collects the deadlines, how submission works, and the materials. It is not listed "
            "on the site or in search engines; only people I send the link to are directed here."),
        h_ask="What I am asking",
        ask=[
            "One English letter, on institutional letterhead, signed and dated, works for every program.",
            "Each school emails you its own submission link from its application system. It would help if "
            "you could prepare the letter before those emails arrive.",
            "Some schools also ask rating questions on the submission page (see “Notes for recommenders” below).",
            "“Please submit by” is about one week before each deadline; happy to adjust to your schedule.",
        ],
        h_flow="How submission works",
        flow=lambda reg, waive: [
            "I register you as a recommender in each school's application system (" + reg + ").",
            "Each school emails you a link for that school only. It may land in your spam folder.",
            "Upload the letter at the link, answer any questions, and submit. I cannot see the letters.",
            waive,
            "I will also track the status in each system and let you know before a deadline if anything is missing.",
        ],
        reg=lambda r: "for all programs by " + r[1] if r else "registration date to be confirmed",
        waive=lambda w: ("I waive my right to see the letters." if w is True else
                         "I do not waive my right to see the letters." if w is False else
                         "Whether I waive my right to see the letters: to be confirmed."),
        h_table="Programs and deadlines",
        table_note="Requirements as listed on the official pages checked on 2026-11-10.",
        cols=["", "School / program (faculty of interest)", "Letters", "Deadline", "Please submit by",
              "Notes for recommenders"],
        h_docs="Materials",
        cv="CV (PDF)",
        locked="Research goals, transcripts, and main manuscripts (password-protected)",
        locked_note="I will send the password separately.",
        locked_tbd="Research goals, transcripts, and main manuscripts (password-protected; in preparation)",
        h_contact="Contact", updated="Updated: Nov 11, 2026", tbd_cls=" (to be confirmed)"),
}

CSS = """
  .letters h2 { margin: 40px 0 12px; font-size: 24px; font-weight: 400; }
  .letters ol, .letters ul { padding-left: 22px; }
  .letters li { margin: 6px 0; }
  .letters .note { color: var(--muted); font-size: 14px; }
  .letters .tbd { color: #b35c00; }
  .table-wrap { overflow-x: auto; margin: 0 -4px; }
  .dl { width: 100%; min-width: 760px; border-collapse: collapse; font-size: 14px; }
  .dl th, .dl td { padding: 9px 8px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
  .dl th { font-weight: 500; border-bottom: 2px solid var(--ink); white-space: nowrap; }
  .dl td:first-child { color: var(--muted); }
  .dl td.by { color: var(--accent); font-weight: 500; white-space: nowrap; }
  .dl td.notes { min-width: 260px; }
  .dl td.school { min-width: 200px; }
  .dl td.dead { min-width: 128px; }
  .doc-list { list-style: none; padding-left: 0 !important; }
  .doc-list li { padding: 8px 0; border-bottom: 1px solid var(--line); }
"""


def esc(s):
    return html.escape(s, quote=True)


def mark_tbd(s, t):
    """Show "(to be confirmed)" parts in orange."""
    for frag in (TBD["ja"], TBD["en"], "（ポータルで確認中）", " (to be confirmed in the portal)"):
        s = s.replace(esc(frag), '<span class="tbd">' + esc(frag) + "</span>")
    return s


def page(key, p):
    lang, t = p["lang"], T[p["lang"]]
    i = 0 if lang == "ja" else 1
    rows = [r for r in ROWS if p["code"] in r["frm"].split() or p["code"] + "?" in r["frm"].split()]
    body = []
    body.append('<h1 class="page-title">%s</h1>\n    <div class="page-line"></div>' % esc(t["title"]))
    body.append('<p class="meta">%s · %s</p>' % (esc(p["name"]), esc(t["updated"])))
    body.append("<p>%s</p>" % esc(t["thanks"]))

    body.append("<h2>%s</h2>\n    <ul>\n%s\n    </ul>" % (
        esc(t["h_ask"]), "\n".join("      <li>%s</li>" % esc(a) for a in t["ask"])))

    reg = t["reg"](REGISTER_BY)
    waive = t["waive"](WAIVE)
    flow = t["flow"](reg, waive)
    items = []
    for s in flow:
        e = esc(s)
        for frag in (reg if not REGISTER_BY else None, waive if WAIVE is None else None):
            if frag:
                e = e.replace(esc(frag), '<span class="tbd">%s</span>' % esc(frag))
        items.append("      <li>%s</li>" % e)
    body.append("<h2>%s</h2>\n    <ol>\n%s\n    </ol>" % (esc(t["h_flow"]), "\n".join(items)))

    trs = []
    for n, r in enumerate(rows, 1):
        trs.append(
            "        <tr><td>%d</td><td class=\"school\">%s</td><td>%s</td><td class=\"dead\">%s</td><td class=\"by\">%s</td>"
            "<td class=\"notes\">%s</td></tr>" % (
                n, esc(r["school"][i]),
                esc(r["letters"][i]) + ('<br><span class="tbd">%s</span>' % esc(COND[lang])
                                        if p["code"] + "?" in r["frm"].split() else ""),
                mark_tbd(esc(r["deadline"][i]), t),
                esc(r["by"][i]), esc(r["notes"][i])))
    body.append(
        "<h2>%s</h2>\n    <p class=\"note\">%s</p>\n    <div class=\"table-wrap\">\n      <table class=\"dl\">\n"
        "        <tr>%s</tr>\n%s\n      </table>\n    </div>" % (
            esc(t["h_table"]), esc(t["table_note"]),
            "".join("<th>%s</th>" % esc(c) for c in t["cols"]), "\n".join(trs)))

    docs = ['      <li><a href="%s">%s</a> (PDF)</li>' % (esc(f), esc(label)) if lang == "en" else
            '      <li><a href="%s">%s</a>（PDF）</li>' % (esc(f), esc(label)) for f, label in p["memos"]]
    docs.append('      <li><a href="%s">%s</a></li>' % (CV, esc(t["cv"])))
    if LOCKED:
        docs.append('      <li><a href="%s">%s</a><br><span class="note">%s</span></li>' % (
            esc(LOCKED), esc(t["locked"]), esc(t["locked_note"])))
    else:
        docs.append('      <li><span class="tbd">%s</span></li>' % esc(t["locked_tbd"]))
    body.append('<h2>%s</h2>\n    <ul class="doc-list">\n%s\n    </ul>' % (esc(t["h_docs"]), "\n".join(docs)))
    body.append("<h2>%s</h2>\n    <p>%s</p>" % (esc(t["h_contact"]), esc(p["contact"])))

    return """<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>{title} — {name}</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta name="referrer" content="no-referrer" />
  <link rel="icon" href="/assets/headshot.jpg" />
  <link rel="stylesheet" href="/assets/styles.css?v=21" />
  <style>{css}</style>
</head>
<body>
  <main class="content letters">
    {body}
  </main>
</body>
</html>
""".format(lang=lang, title=esc(t["title"]), name=esc(p["name"]), css=CSS, body="\n\n    ".join(body))


def main():
    for key, p in PEOPLE.items():
        out = os.path.join(ROOT, "letters", p["slug"])
        os.makedirs(out, exist_ok=True)
        for f, _ in p["memos"]:
            shutil.copy2(os.path.join(MEMOS, f), os.path.join(out, f))
        with open(os.path.join(out, "index.html"), "w", encoding="utf-8") as fh:
            fh.write(page(key, p))
        print("/letters/%s/" % p["slug"])


if __name__ == "__main__":
    main()
