# Slides & Artifacts — authoring guide

Host slides, PDFs, images, video, and **interactive HTML artifacts** on the site,
either individually or grouped into a **project**. Visibility modes:

- **Public artifact** — listed in the gallery at `/slides/`, opens with one click.
- **Locked artifact** — encrypted; **not** listed; shared by a direct link + password.
- **Project** — a password-protected *collection* of artifacts (e.g. everything
  about one paper). Shows in the gallery as a 🔒 card; tapping it asks for the
  password, then reveals a grid of the inner artifacts to open individually. (Can
  also be `--unlisted`, shared by link like a locked artifact.)

Encryption is real: locked files are AES-256-GCM encrypted, and the repo only
ever contains ciphertext. Decryption happens in the visitor's browser after they
type the password. (Security note: the ciphertext is public, so resistance to
brute force depends on using a strong password — prefer a passphrase.)

**Remembered passwords:** after a visitor unlocks an item, the viewer offers
"Remember on this device" (checked by default) and stores that item's password
in the browser (localStorage) so reloads/return visits don't re-prompt. It is
per-item and only saved after a correct entry. To clear saved passwords on a
device, open `/slides/viewer.html?forget=1`. Unchecking the box keeps it only
for the current tab. Note: on a *shared* computer, remembering leaves the
password in that browser — uncheck it there. If you change an item's password,
a stale saved one is detected and the visitor is re-prompted automatically.

There are two equivalent tools. Use whichever you like; output is identical.

---

## Option 1 — CLI (`tools/seal.py`)  ← recommended for collaborators

Requires Python 3.8+ and the `cryptography` package:

```bash
pip install cryptography
```

```bash
# Locked slide deck (prompts for the password; nothing in shell history)
python3 tools/seal.py seal talk.pdf --lock --title "AutoML 2025" --hint "passphrase I shared"
#   -> writes slides/data/<random>.enc and prints a share link

# Locked multi-file interactive HTML artifact (package a whole folder)
python3 tools/seal.py seal ./my-demo/ --lock --title "Interactive Demo"
#   (the folder's index.html becomes the entry point)

# Public artifact (no password) — also added to slides/manifest.json
python3 tools/seal.py seal poster.pdf --public --title "Poster" --date 2025-09

# PROJECT: one password unlocks a collection of artifacts.
# Lay out a folder where each subfolder / loose file is one item:
#   glycine-project/
#     paper/manuscript.pdf        -> item "paper"  (slides)
#     demo/index.html + js/...    -> item "demo"   (interactive web)
#     poster.png                  -> item "poster" (image)
#     project.json                -> OPTIONAL: titles + ordering (see below)
python3 tools/seal.py project ./glycine-project/ --title "Glycine paper (2025)" \
    --hint "passphrase I emailed" --date 2025-06 --summary "Manuscript, demo, poster"
#   -> writes slides/data/<random>.enc, adds a 🔒 project card to the gallery
#   add --unlisted to keep it out of the gallery and get a ?k= share link instead

# Verify a sealed file or project decrypts (and optionally extract it)
python3 tools/seal.py open slides/data/<file>.enc --out ./extracted
```

Then **commit the new file(s)** (and the updated `manifest.json` for public
items) and push.

The password may also come from the `SEAL_PASSWORD` env var instead of the prompt.

---

## Option 2 — Browser tool (`tools/encrypt.html`)

Runs entirely in your browser; files never upload anywhere. It uses JS modules,
so it must be served over http (not opened as a `file://`):

```bash
python3 -m http.server      # in the repo root
# then visit http://localhost:8000/tools/encrypt.html
```

Drop a file (or pick a folder), set a title, choose Locked/Public, and click
**Seal & download**. It downloads the sealed file and shows you exactly what to
do next (share link for locked items, or a `manifest.json` snippet for public
items). Move the downloaded file into `slides/data/` and commit.

---

## Supported formats

| Type | Extensions | In the viewer |
|------|-----------|---------------|
| Slides / papers / posters | `.pdf` | page-by-page slide viewer (← / →, fullscreen) |
| Images | `.png .jpg .gif .webp .svg .avif` | inline image |
| Interactive HTML (single or multi-file) | `.html` + `js/css/assets` | sandboxed iframe (relative paths & `fetch()` work) |
| Video | `.mp4 .webm .mov` | inline player |
| Audio | `.mp3 .wav .ogg` | inline player |
| Markdown / text / data | `.md .txt .csv .json` | rendered text |
| Anything else | `.pptx .key .docx .xlsx .ipynb .zip .glb …` | secure Download button |

Unknown types always at least decrypt to a download. For multi-file interactive
artifacts, bundle a folder containing an `index.html`.

## Projects (collections)

A project is one encrypted bundle containing several artifacts; one password
unlocks the whole set, then the viewer shows a grid to open each item.

- **Layout**: under the project root, each immediate **subfolder** is one item
  (a subfolder with an `index.html` becomes an interactive web item; otherwise
  its files are grouped). Each **loose file** at the root is a single-file item.
- **`project.json`** (optional, in the root) overrides item titles/order:
  ```json
  {
    "title": "Glycine paper (2025)",
    "items": [
      { "dir": "paper",      "title": "Manuscript" },
      { "dir": "demo",       "title": "Interactive demo" },
      { "file": "poster.png","title": "Poster" }
    ]
  }
  ```
  Items not listed are appended alphabetically.
- **Each web item must be self-contained** with relative paths (it's mounted at
  its own root in the viewer). The CLI warns if an item's files escape its folder.
- **Size**: the whole project downloads + decrypts on unlock. Keep it under
  ~50 MB; host large video as a separate link-only artifact instead.
- **What's public** for a listed project: only the manifest row (project title,
  and any `--date`/`--summary` you set) + the random filename + the total
  ciphertext size. Item titles, types, filenames, and all bytes stay encrypted
  until the password is entered.

## How it fits together

- `assets/seal.js` — shared crypto + bundle format (browser).
- `tools/seal.py` — same format, for the CLI. **Keep the two in sync.**
- `slides/manifest.json` — the public gallery list (locked items are absent).
- `slides/viewer.html` — password gate + renderer.
- `slides/sw.js` — service worker that serves decrypted multi-file artifacts
  from memory under `/slides/_a/<token>/…`.
