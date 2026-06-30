// sw.js — serves decrypted artifact files from memory under /slides/_a/<token>/...
// Decryption happens in the page (viewer.html); the page posts the decrypted
// file map here so interactive HTML artifacts can use relative URLs and fetch().
// Nothing is persisted: the map lives only in this worker's memory.

const mounts = new Map(); // token -> Map(path -> { buf:ArrayBuffer, mime })

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("message", (e) => {
  const msg = e.data || {};
  if (msg.type === "mount") {
    const files = new Map();
    for (const [path, f] of msg.files) files.set(path, f);
    mounts.set(msg.token, files);
    if (e.source) e.source.postMessage({ type: "mounted", token: msg.token });
  } else if (msg.type === "unmount") {
    mounts.delete(msg.token);
  }
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const m = url.pathname.match(/\/slides\/_a\/([^/]+)\/(.*)$/);
  if (!m) return; // not ours — fall through to network
  const files = mounts.get(m[1]);
  if (!files) {
    e.respondWith(new Response("artifact session expired", { status: 410 }));
    return;
  }
  let path = decodeURIComponent(m[2]) || "index.html";
  if (path.endsWith("/")) path += "index.html";
  let f = files.get(path);
  if (!f && files.has(path + "/index.html")) f = files.get(path + "/index.html");
  if (!f) {
    e.respondWith(new Response("not found: " + path, { status: 404 }));
    return;
  }
  e.respondWith(
    new Response(f.buf, {
      headers: {
        "Content-Type": f.mime || "application/octet-stream",
        "Cache-Control": "no-store",
      },
    })
  );
});
