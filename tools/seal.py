#!/usr/bin/env python3
"""seal.py — encrypt/package artifacts for the slides gallery.

Byte-compatible with assets/seal.js (browser). A file sealed here decrypts in
the browser viewer, and vice versa.

Requirements: Python 3.8+ and the `cryptography` package:
    pip install cryptography

Usage
-----
  # Locked slide deck (prompts for the password securely):
  python3 tools/seal.py seal talk.pdf --lock --title "AutoML 2025" --hint "passphrase I shared"
      -> writes slides/data/<random>.enc and prints a share link

  # Locked multi-file interactive HTML artifact (whole folder):
  python3 tools/seal.py seal ./my-demo/ --lock --title "Interactive Demo"

  # Public artifact (no password) -> also added to slides/manifest.json so it
  # shows up in the gallery:
  python3 tools/seal.py seal poster.pdf --public --title "Public Poster"

  # Verify / extract a sealed bundle back to files:
  python3 tools/seal.py open slides/data/<file>.enc --out ./extracted

Password can also be supplied via the SEAL_PASSWORD environment variable to
avoid shell history, or with --password (least safe).
"""
import argparse
import json
import mimetypes
import os
import re
import secrets
import struct
import sys
from getpass import getpass
from hashlib import pbkdf2_hmac
from pathlib import Path

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:
    sys.exit("error: missing dependency. Run:  pip install cryptography")

MAGIC_ENC = b"SLDE"
MAGIC_PUB = b"SLDP"
VERSION = 1
ITERS = 250000
SALT_LEN = 16
IV_LEN = 12

# Resolve repo paths relative to this script so it works from any cwd.
SCRIPT_DIR = Path(__file__).resolve().parent
SITE_ROOT = SCRIPT_DIR.parent
DATA_DIR = SITE_ROOT / "slides" / "data"
MANIFEST = SITE_ROOT / "slides" / "manifest.json"

mimetypes.add_type("text/markdown", ".md")
mimetypes.add_type("application/x-ipynb+json", ".ipynb")
mimetypes.add_type("model/gltf-binary", ".glb")


def guess_mime(name: str) -> str:
    return mimetypes.guess_type(name)[0] or "application/octet-stream"


def collect_entries(path: Path):
    """Return [(relpath, mime, bytes)] and the detected `main` html entry."""
    entries = []
    if path.is_dir():
        files = sorted(f for f in path.rglob("*") if f.is_file())
        if not files:
            sys.exit(f"error: no files found in {path}")
        for f in files:
            rel = f.relative_to(path).as_posix()
            entries.append((rel, guess_mime(rel), f.read_bytes()))
    elif path.is_file():
        entries.append((path.name, guess_mime(path.name), path.read_bytes()))
    else:
        sys.exit(f"error: not found: {path}")

    paths = [e[0] for e in entries]
    main = None
    # Prefer a top-level index.html, then any index.html, then a lone .html file.
    for p in paths:
        if p == "index.html":
            main = p
            break
    if main is None:
        for p in paths:
            if os.path.basename(p) == "index.html":
                main = p
                break
    if main is None and len(paths) == 1 and re.search(r"\.html?$", paths[0], re.I):
        main = paths[0]
    return entries, main


def pack_bundle(entries, title, hint, main, kind=None, project=None) -> bytes:
    # Fixed key order (v, title, hint, main, [kind], [project], entries), matching
    # assets/seal.js. kind/project are omitted for normal artifacts. (JSON whitespace
    # / key order do not affect cross-tool decryption — each side computes its own
    # headerLen and parses with a JSON reader — but we keep them aligned anyway.)
    header = {"v": VERSION, "title": title or "", "hint": hint or "", "main": main}
    if kind:
        header["kind"] = kind
    if project:
        header["project"] = project
    header["entries"] = [{"path": p, "mime": m, "size": len(b)} for (p, m, b) in entries]
    hb = json.dumps(header, ensure_ascii=False).encode("utf-8")
    out = bytearray()
    out += struct.pack("<I", len(hb))
    out += hb
    for (_p, _m, b) in entries:
        out += b
    return bytes(out)


def seal_bytes(plain: bytes, password):
    if not password:
        return MAGIC_PUB + bytes([VERSION]) + plain
    salt = secrets.token_bytes(SALT_LEN)
    iv = secrets.token_bytes(IV_LEN)
    key = pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERS, 32)
    ct = AESGCM(key).encrypt(iv, plain, None)  # ct includes the 16-byte tag
    return MAGIC_ENC + bytes([VERSION]) + struct.pack("<I", ITERS) + salt + iv + ct


def open_bytes(blob: bytes, password):
    magic = blob[:4]
    if magic == MAGIC_PUB:
        return blob[5:]
    if magic == MAGIC_ENC:
        if not password:
            raise ValueError("password required")
        if len(blob) < 5 + 4 + SALT_LEN + IV_LEN + 16:
            raise ValueError("truncated or corrupt encrypted file")
        o = 5
        iters = struct.unpack_from("<I", blob, o)[0]; o += 4
        salt = blob[o:o + SALT_LEN]; o += SALT_LEN
        iv = blob[o:o + IV_LEN]; o += IV_LEN
        ct = blob[o:]
        key = pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iters, 32)
        try:
            return AESGCM(key).decrypt(iv, ct, None)
        except Exception:
            raise ValueError("bad password (decryption failed)")
    raise ValueError("unknown format")


def unpack_bundle(plain: bytes):
    (hlen,) = struct.unpack_from("<I", plain, 0)
    header = json.loads(plain[4:4 + hlen].decode("utf-8"))
    off = 4 + hlen
    files = []
    for e in header["entries"]:
        files.append((e["path"], e["mime"], plain[off:off + e["size"]]))
        off += e["size"]
    return header, files


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return s or "artifact"


def resolve_password(args):
    if args.password:
        return args.password
    env = os.environ.get("SEAL_PASSWORD")
    if env:
        return env
    while True:
        p1 = getpass("Password: ")
        if not p1:
            sys.exit("error: empty password")
        p2 = getpass("Confirm:  ")
        if p1 == p2:
            return p1
        print("Passwords did not match, try again.", file=sys.stderr)


def artifact_kind(main, entries):
    if main:
        return "web"
    if len(entries) == 1:
        mime = entries[0][1]
        if mime == "application/pdf":
            return "slides"
        if mime.startswith("image/"):
            return "image"
        if mime.startswith("video/"):
            return "video"
        if mime.startswith("audio/"):
            return "audio"
    return "file"


def update_manifest(entry):
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    if MANIFEST.exists():
        data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    else:
        data = {"artifacts": []}
    data.setdefault("artifacts", [])
    data["artifacts"] = [a for a in data["artifacts"] if a.get("id") != entry["id"]]
    data["artifacts"].append(entry)
    MANIFEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def detect_main_in(paths):
    for p in paths:
        if os.path.basename(p) == "index.html":
            return p
    if len(paths) == 1 and re.search(r"\.html?$", paths[0], re.I):
        return paths[0]
    return None


def assemble_project(root: Path):
    """Folder-of-items convention: each immediate subfolder (or loose file) under
    `root` becomes one project item. Returns (items, entries) where entries are
    (relpath-from-root, mime, bytes) and items reference those paths."""
    if not root.is_dir():
        sys.exit("error: project input must be a directory (a folder of items)")
    items = []
    entries = []
    seen = set()

    def add_file(f: Path):
        rel = f.relative_to(root).as_posix()
        if rel not in seen:
            entries.append((rel, guess_mime(rel), f.read_bytes()))
            seen.add(rel)
        return rel

    for child in sorted(root.iterdir(), key=lambda p: p.name.lower()):
        if child.name.startswith(".") or child.name == "project.json":
            continue
        if child.is_dir():
            files = sorted(f for f in child.rglob("*") if f.is_file())
            if not files:
                continue
            paths = [add_file(f) for f in files]
            main = detect_main_in(paths)
            kind = artifact_kind(main, [(p, guess_mime(p), b"") for p in paths])
            items.append({"id": slugify(child.name), "title": child.name, "kind": kind, "main": main, "files": paths})
        elif child.is_file():
            rel = add_file(child)
            main = rel if re.search(r"\.html?$", rel, re.I) else None
            kind = artifact_kind(main, [(rel, guess_mime(rel), b"")])
            items.append({"id": slugify(child.stem), "title": child.stem, "kind": kind, "main": main, "files": [rel]})

    # warn about web items whose files escape their own folder (would 404 in the viewer SW)
    for it in items:
        if it["main"]:
            base = it["main"].rsplit("/", 1)[0] + "/" if "/" in it["main"] else ""
            stray = [p for p in it["files"] if base and not p.startswith(base)]
            if stray:
                print(f"  ! warning: web item {it['title']!r} has files outside its folder; "
                      f"keep each web item self-contained with relative paths: {stray}", file=sys.stderr)
    return items, entries


def apply_sidecar(root: Path, items, cli_title):
    """Optional project.json in the root overrides title/id/kind and ordering."""
    sidecar = root / "project.json"
    title = cli_title
    if not sidecar.exists():
        return items, title
    sc = json.loads(sidecar.read_text(encoding="utf-8"))
    title = title or sc.get("title")
    order = []
    by_slug = {}
    for it in sc.get("items", []):
        # Mirror assemble_project's id derivation: dirs use the full name, loose
        # files use the stem (so a folder named "v1.2" still matches).
        if it.get("dir"):
            s = slugify(it["dir"])
        elif it.get("file"):
            s = slugify(os.path.splitext(it["file"])[0])
        elif it.get("id"):
            s = slugify(it["id"])
        else:
            continue
        by_slug[s] = it
        order.append(s)
    # Sort FIRST (on the original matched ids), then apply overrides incl. id renames.
    if order:
        items.sort(key=lambda it: order.index(it["id"]) if it["id"] in order else len(order))
    for item in items:
        ov = by_slug.get(item["id"])
        if ov:
            if ov.get("title"):
                item["title"] = ov["title"]
            if ov.get("kind"):
                item["kind"] = ov["kind"]
            if ov.get("id"):
                item["id"] = slugify(ov["id"])
    return items, title


def cmd_project(args):
    root = Path(args.input)
    items, entries = assemble_project(root)
    items, title = apply_sidecar(root, items, args.title)
    title = title or root.name
    if not items:
        sys.exit("error: no items found (the project root needs files or subfolders)")

    # Ensure every item id is unique (deep links target ids) even after sidecar renames.
    used = set()
    for it in items:
        base = it["id"]
        cand = base
        n = 2
        while cand in used:
            cand = f"{base}-{n}"
            n += 1
        it["id"] = cand
        used.add(cand)

    password = resolve_password(args)  # projects are always locked in v1
    project_block = {"items": [
        {"id": it["id"], "title": it["title"], "kind": it["kind"], "main": it["main"], "files": it["files"]}
        for it in items
    ]}
    plain = pack_bundle(entries, title, args.hint, None, kind="project", project=project_block)
    blob = seal_bytes(plain, password)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    fname = (args.name or secrets.token_hex(12)) + ".enc"
    out_path = DATA_DIR / fname
    out_path.write_bytes(blob)
    rel = f"data/{fname}"

    total = sum(len(b) for (_p, _m, b) in entries)
    print(f"\n  wrote {out_path}  ({len(blob):,} bytes, {len(items)} item(s), {len(entries)} file(s))")
    for it in items:
        print(f"    - {it['title']}  [{it['kind']}]  ({len(it['files'])} file(s))")
    if total > 50 * 1024 * 1024:
        print(f"\n  ! large project ({total / 1048576:.0f} MB): visitors download + decrypt all of it on unlock.")
        print("    Consider hosting large video as a separate link-only artifact instead.")

    if args.unlisted:
        link = f"{args.base_url.rstrip('/')}/slides/viewer.html?k={rel}"
        print("\n  Unlisted project (not in the gallery). Share this link + the password privately:")
        print(f"    {link}\n")
    else:
        eid = args.id or slugify(title)
        entry = {"id": eid, "title": title, "kind": "project", "locked": True, "listed": True, "file": rel}
        if args.date:
            entry["date"] = args.date
        if args.summary:
            entry["summary"] = args.summary
        update_manifest(entry)
        print("\n  Listed locked project added to slides/manifest.json (shows a 🔒 card).")
        print(f"    {args.base_url.rstrip('/')}/slides/viewer.html?id={eid}\n")
    print("  Next: commit the new file(s) and push.\n")


def cmd_seal(args):
    if args.lock == args.public:
        sys.exit("error: choose exactly one of --lock or --public")
    src = Path(args.input)
    entries, main = collect_entries(src)
    title = args.title or (src.stem if src.is_file() else src.name)
    password = resolve_password(args) if args.lock else None

    plain = pack_bundle(entries, title, args.hint, main)
    blob = seal_bytes(plain, password)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if args.lock:
        fname = (args.name or secrets.token_hex(12)) + ".enc"
    else:
        fname = (args.name or slugify(title)) + ".bundle"
    out_path = DATA_DIR / fname
    out_path.write_bytes(blob)

    rel = f"data/{fname}"
    kind = artifact_kind(main, entries)
    print(f"\n  wrote {out_path}  ({len(blob):,} bytes, {len(entries)} file(s), kind={kind})")

    if args.lock:
        link = f"{args.base_url.rstrip('/')}/slides/viewer.html?k={rel}"
        print("\n  Locked. Commit the .enc file, then share this link + the password privately:")
        print(f"    {link}")
        print("  (It is NOT listed in the public gallery.)\n")
    else:
        eid = args.id or slugify(title)
        manifest_entry = {
            "id": eid,
            "title": title,
            "kind": kind,
            "file": rel,
            "mime": entries[0][1] if len(entries) == 1 else "text/html",
        }
        if args.date:
            manifest_entry["date"] = args.date
        if args.summary:
            manifest_entry["summary"] = args.summary
        update_manifest(manifest_entry)
        print("\n  Public. Added to slides/manifest.json — it will appear in the gallery.")
        print(f"    {args.base_url.rstrip('/')}/slides/viewer.html?id={eid}\n")
    print("  Next: commit the new file(s) and push.\n")


def cmd_open(args):
    blob = Path(args.input).read_bytes()
    password = None
    if blob[:4] == MAGIC_ENC:
        password = args.password or os.environ.get("SEAL_PASSWORD") or getpass("Password: ")
    plain = open_bytes(blob, password)
    header, files = unpack_bundle(plain)
    print(f"title: {header.get('title')!r}  kind: {header.get('kind')!r}  main: {header.get('main')!r}  files: {len(files)}")
    if header.get("kind") == "project":
        items = (header.get("project") or {}).get("items", [])
        print(f"project items: {len(items)}")
        for it in items:
            print(f"  - [{it.get('kind')}] {it.get('title')!r}  (id={it.get('id')}, {len(it.get('files', []))} file(s), main={it.get('main')})")
    if args.out:
        outdir = Path(args.out)
        for (p, _m, b) in files:
            dest = outdir / p
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(b)
            print(f"  extracted {dest}")
    else:
        for (p, m, b) in files:
            print(f"  {p}  ({m}, {len(b):,} bytes)")


def main():
    ap = argparse.ArgumentParser(description="Encrypt/package artifacts for the slides gallery.")
    sub = ap.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("seal", help="package and (optionally) encrypt an artifact")
    s.add_argument("input", help="file or directory to package")
    g = s.add_mutually_exclusive_group()
    g.add_argument("--lock", action="store_true", help="password-protect (hidden from gallery)")
    g.add_argument("--public", action="store_true", help="no password; listed in the gallery")
    s.add_argument("--title")
    s.add_argument("--hint", help="password hint (stored inside the encrypted bundle)")
    s.add_argument("--password", help="password (prefer the prompt or SEAL_PASSWORD env)")
    s.add_argument("--name", help="output filename stem (default: random for locked)")
    s.add_argument("--id", help="manifest id for public artifacts")
    s.add_argument("--date", help="display date for public artifacts, e.g. 2025-09")
    s.add_argument("--summary", help="short description for the gallery card")
    s.add_argument("--base-url", default="https://ozatamago.github.io", help="origin for share links")
    s.set_defaults(func=cmd_seal)

    p = sub.add_parser("project", help="package multiple artifacts into one password-protected project")
    p.add_argument("input", help="project root folder (each subfolder/loose file = one item)")
    p.add_argument("--title")
    p.add_argument("--hint", help="password hint (stored inside the encrypted bundle)")
    p.add_argument("--password", help="password (prefer the prompt or SEAL_PASSWORD env)")
    p.add_argument("--name", help="output filename stem (default: random)")
    p.add_argument("--id", help="manifest id (default: from title)")
    p.add_argument("--date", help="display date for the gallery card, e.g. 2025-06")
    p.add_argument("--summary", help="short public description for the gallery card")
    p.add_argument("--unlisted", action="store_true", help="don't list in gallery; share by ?k= link")
    p.add_argument("--base-url", default="https://ozatamago.github.io", help="origin for share links")
    p.set_defaults(func=cmd_project)

    o = sub.add_parser("open", help="decrypt/inspect or extract a sealed bundle")
    o.add_argument("input", help=".enc or .bundle file")
    o.add_argument("--password")
    o.add_argument("--out", help="directory to extract files into")
    o.set_defaults(func=cmd_open)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
