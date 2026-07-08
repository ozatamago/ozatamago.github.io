// sw.js — serves decrypted artifact files under /slides/_a/<token>/...
// The page (viewer.html) decrypts and posts the file map here. Files are kept
// in memory for speed AND mirrored into the Cache API, so the mount survives the
// browser terminating this (idle) service worker. Without the cache, in-artifact
// navigation after ~30s of inactivity used to 410 ("artifact session expired");
// the cache fallback lets a restarted worker keep serving the same artifact.

const mounts = new Map(); // token -> Map(path -> { buf:ArrayBuffer, mime })
const CACHE_PREFIX = "artifact-";
const keyFor = (token, path) => "/slides/_a/" + token + "/" + path;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Mirror one artifact's files into a per-token cache. The viewer shows one
// artifact at a time and re-mounts on every load, so we keep only the current
// token's cache and drop the rest to bound storage.
async function persist(token, files) {
  try {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_PREFIX + token)
          .map((k) => caches.delete(k))
    );
    const cache = await caches.open(CACHE_PREFIX + token);
    await Promise.all([...files].map(([path, f]) =>
      cache.put(
        keyFor(token, path),
        new Response(f.buf.slice(0), {
          headers: { "Content-Type": f.mime || "application/octet-stream", "Cache-Control": "no-store" },
        })
      )
    ));
  } catch (_) { /* cache is best-effort; the in-memory map still serves this session */ }
}

self.addEventListener("message", (e) => {
  const msg = e.data || {};
  if (msg.type === "mount") {
    const files = new Map();
    for (const [path, f] of msg.files) files.set(path, f);
    mounts.set(msg.token, files);
    if (e.source) e.source.postMessage({ type: "mounted", token: msg.token }); // memory mount is ready now
    e.waitUntil(persist(msg.token, files));                                    // mirror to Cache in the background
  } else if (msg.type === "unmount") {
    mounts.delete(msg.token);
    e.waitUntil(caches.delete(CACHE_PREFIX + msg.token).catch(() => {}));
  }
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const m = url.pathname.match(/\/slides\/_a\/([^/]+)\/(.*)$/);
  if (!m) return; // not ours — fall through to network
  const token = m[1];
  let path = decodeURIComponent(m[2]) || "index.html";
  if (path.endsWith("/")) path += "index.html";
  e.respondWith((async () => {
    // 1) in-memory (fast path, current session)
    const files = mounts.get(token);
    if (files) {
      const f = files.get(path) || (files.has(path + "/index.html") ? files.get(path + "/index.html") : null);
      if (f) return new Response(f.buf, { headers: { "Content-Type": f.mime || "application/octet-stream", "Cache-Control": "no-store" } });
    }
    // 2) Cache API fallback (survives the worker being terminated while idle)
    if (await caches.has(CACHE_PREFIX + token)) {
      const cache = await caches.open(CACHE_PREFIX + token);
      const resp = (await cache.match(keyFor(token, path))) || (await cache.match(keyFor(token, path + "/index.html")));
      if (resp) return resp;
      return new Response("not found: " + path, { status: 404 });
    }
    if (files) return new Response("not found: " + path, { status: 404 });
    return new Response("artifact session expired", { status: 410 });
  })());
});
