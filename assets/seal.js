// seal.js — shared crypto + bundle core for the slides/artifacts feature.
// Used by tools/encrypt.html (authoring) and slides/viewer.html (viewing).
// Byte-compatible with tools/seal.py (Python CLI). Do not change parameters
// without updating both sides.
//
// Container layout
//   Encrypted bundle (SLDE):
//     'S''L''D''E' (4) | version u8 (1) | iters u32le (4) | salt (16) | iv (12) | AES-GCM(ct||tag)
//   Public bundle (SLDP):
//     'S''L''D''P' (4) | version u8 (1) | <plaintext bundle>
//
//   plaintext bundle = headerLen u32le (4) | headerJSON (utf8) | concatenated file bytes
//   headerJSON = { v, title, hint, main, entries:[{path, mime, size}] }

export const MAGIC_ENC = "SLDE";
export const MAGIC_PUB = "SLDP";
export const VERSION = 1;
export const PBKDF2_ITERS = 250000;
const SALT_LEN = 16;
const IV_LEN = 12;

const te = new TextEncoder();
const td = new TextDecoder();

function u32le(n) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n >>> 0, true);
  return b;
}
function readU32le(bytes, off) {
  return new DataView(bytes.buffer, bytes.byteOffset + off, 4).getUint32(0, true);
}
function ascii(bytes, off, len) {
  let s = "";
  for (let i = 0; i < len; i++) s += String.fromCharCode(bytes[off + i]);
  return s;
}

const MIME = {
  pdf: "application/pdf",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
  webp: "image/webp", svg: "image/svg+xml", avif: "image/avif", bmp: "image/bmp",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/mp4",
  mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4",
  html: "text/html", htm: "text/html", js: "text/javascript", mjs: "text/javascript",
  css: "text/css", json: "application/json", csv: "text/csv", tsv: "text/tab-separated-values",
  md: "text/markdown", txt: "text/plain", xml: "application/xml",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  key: "application/vnd.apple.keynote",
  ipynb: "application/x-ipynb+json",
  zip: "application/zip", glb: "model/gltf-binary", gltf: "model/gltf+json",
  wasm: "application/wasm", woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf",
};
export function guessMime(name) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  return MIME[ext] || "application/octet-stream";
}

function packBundle({ title, hint, main, entries, kind, project }) {
  // Fixed key order (v, title, hint, main, [kind], [project], entries). kind/project
  // are omitted entirely for normal artifacts so their bytes are unchanged.
  const header = { v: VERSION, title: title || "", hint: hint || "", main: main || null };
  if (kind) header.kind = kind;
  if (project) header.project = project;
  header.entries = entries.map((e) => ({ path: e.path, mime: e.mime || guessMime(e.path), size: e.bytes.length }));
  const headerBytes = te.encode(JSON.stringify(header));
  let total = 4 + headerBytes.length;
  for (const e of entries) total += e.bytes.length;
  const out = new Uint8Array(total);
  out.set(u32le(headerBytes.length), 0);
  out.set(headerBytes, 4);
  let off = 4 + headerBytes.length;
  for (const e of entries) {
    out.set(e.bytes, off);
    off += e.bytes.length;
  }
  return out;
}

function unpackBundle(plain) {
  const headerLen = readU32le(plain, 0);
  const header = JSON.parse(td.decode(plain.subarray(4, 4 + headerLen)));
  let off = 4 + headerLen;
  const files = new Map();
  for (const e of header.entries) {
    files.set(e.path, { bytes: plain.subarray(off, off + e.size), mime: e.mime });
    off += e.size;
  }
  return {
    title: header.title || "",
    hint: header.hint || "",
    main: header.main || null,
    kind: header.kind || null,
    project: header.project || null,
    files,
  };
}

async function deriveKey(password, salt, iters) {
  const baseKey = await crypto.subtle.importKey("raw", te.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: iters, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// entries: [{ path, mime?, bytes:Uint8Array }]. password omitted/empty => public bundle.
// kind/project: optional, used for "project" collections (kind:"project").
export async function seal({ entries, title, hint, main, password, kind, project }) {
  const plain = packBundle({ title, hint, main, entries, kind, project });
  if (!password) {
    const out = new Uint8Array(5 + plain.length);
    out.set(te.encode(MAGIC_PUB), 0);
    out[4] = VERSION;
    out.set(plain, 5);
    return out;
  }
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(password, salt, PBKDF2_ITERS);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
  const out = new Uint8Array(4 + 1 + 4 + SALT_LEN + IV_LEN + ct.length);
  let o = 0;
  out.set(te.encode(MAGIC_ENC), o); o += 4;
  out[o] = VERSION; o += 1;
  out.set(u32le(PBKDF2_ITERS), o); o += 4;
  out.set(salt, o); o += SALT_LEN;
  out.set(iv, o); o += IV_LEN;
  out.set(ct, o);
  return out;
}

export function inspect(bytes) {
  const magic = ascii(bytes, 0, 4);
  return { magic, encrypted: magic === MAGIC_ENC, public: magic === MAGIC_PUB, isBundle: magic === MAGIC_ENC || magic === MAGIC_PUB };
}

// Returns { title, hint, main, files:Map<path,{bytes,mime}> }.
// Throws Error('PASSWORD_REQUIRED'), Error('BAD_PASSWORD'), or Error('UNKNOWN_FORMAT').
export async function open(bytes, password) {
  const { magic } = inspect(bytes);
  if (magic === MAGIC_PUB) {
    return unpackBundle(bytes.subarray(5));
  }
  if (magic === MAGIC_ENC) {
    if (password == null || password === "") throw new Error("PASSWORD_REQUIRED");
    let o = 4;
    o += 1; // version
    const iters = readU32le(bytes, o); o += 4;
    const salt = bytes.subarray(o, o + SALT_LEN); o += SALT_LEN;
    const iv = bytes.subarray(o, o + IV_LEN); o += IV_LEN;
    const ct = bytes.subarray(o);
    const key = await deriveKey(password, salt, iters);
    let plainBuf;
    try {
      plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    } catch (_) {
      throw new Error("BAD_PASSWORD");
    }
    return unpackBundle(new Uint8Array(plainBuf));
  }
  throw new Error("UNKNOWN_FORMAT");
}

// Wrap raw (non-bundle) bytes — e.g. a plain data/x.pdf referenced from the
// manifest — as a single-entry artifact so the viewer has one code path.
export function wrapRaw(bytes, name, mime) {
  const files = new Map();
  const m = mime || guessMime(name);
  files.set(name, { bytes, mime: m });
  const main = /\.html?$/i.test(name) ? name : null;
  return { title: "", hint: "", main, kind: null, project: null, files };
}
