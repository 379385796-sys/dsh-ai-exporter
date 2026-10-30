import { getTranscript, listSessions } from "./adapter.js";
import { exportTranscript } from "./exporter.js";
import { DestinationGrants } from "./destinations.js";
const name = "dsh-ai-exporter";
const inject = ["connection", "sessionQuery"];
function validOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin || origin === "dsh-app://app") return true;
  try {
    const host = request.headers.get("host");
    return origin === (host ? new URL("http://" + host).origin : new URL(request.url).origin);
  } catch {
    return false;
  }
}
function apply(ctx) {
  const jobs = /* @__PURE__ */ new Map(), destinations = new DestinationGrants(), lifetime = new AbortController();
  let disposed = false;
  ctx.effect(() => () => {
    disposed = true;
    lifetime.abort();
    for (const j of jobs.values()) j.abort.abort();
    jobs.clear();
    destinations.grants.clear();
  }, "ai-exporter job lifecycle");
  const route = (path, methods, fetch) => ctx.connection.fetch.register({ path: "/api/ai-exporter." + path, methods, requestBody: "buffered", fetch: async (request) => {
    try {
      if (disposed) throw Error("\u63D2\u4EF6\u5DF2\u5378\u8F7D");
      if (request.method === "POST") {
        if (!validOrigin(request)) throw Error("\u62D2\u7EDD\u8DE8\u7AD9\u5BFC\u51FA\u8BF7\u6C42");
        if (!request.headers.get("content-type")?.startsWith("application/json")) throw Error("\u9700\u8981 JSON \u8BF7\u6C42");
      }
      return await fetch(request);
    } catch (e) {
      return Response.json({ error: e.message }, { status: 400, headers: { "cache-control": "no-store" } });
    }
  } });
  route("snapshot", ["GET"], async (request) => Response.json(await getTranscript(ctx, new URL(request.url).searchParams.get("sessionId"), request.signal), { headers: { "cache-control": "no-store" } }));
  route("sessions", ["GET"], async (request) => Response.json(await listSessions(ctx, request.signal), { headers: { "cache-control": "no-store" } }));
  route("destination", ["POST"], async (request) => {
    const body = await request.json(), signal = AbortSignal.any([request.signal, lifetime.signal]);
    const transcript = await getTranscript(ctx, body.sessionId, signal);
    return Response.json(await destinations.choose({ sessionId: body.sessionId, formats: body.formats, title: transcript.title, initialDirectory: body.initialDirectory, folderOnly: body.folderOnly, strictInitialDirectory: body.strictInitialDirectory }, signal), { headers: { "cache-control": "no-store" } });
  });
  route("start", ["POST"], async (request) => {
    const body = await request.json();
    request.signal.throwIfAborted();
    for (const [key, value] of jobs) if (value.finished && Date.now() - value.finished > 3e5) jobs.delete(key);
    if ([...jobs.values()].filter((j) => !j.finished).length >= 2) throw Error("\u5DF2\u6709\u5BFC\u51FA\u4EFB\u52A1\uFF0C\u8BF7\u7B49\u5F85\u5B8C\u6210");
    if (jobs.size >= 32) for (const [key, value] of jobs) {
      if (value.finished) {
        jobs.delete(key);
        break;
      }
    }
    const destination = destinations.consume(body.grant, body.sessionId, body.formats);
    const abort = new AbortController(), id = globalThis.crypto.randomUUID(), job = { abort, status: "running", progress: "\u8BFB\u53D6\u5B8C\u6574\u4F1A\u8BDD", created: Date.now() };
    jobs.set(id, job);
    const options = { outputDir: destination.outputDir, fileStem: destination.fileStem, tempDirectory: process.env.DSH_EXPORTER_TEMP, formats: body.formats, range: body.range, timestamps: body.timestamps !== false, models: body.models === true, allowPartial: body.allowPartial === true, bom: true, newline: "crlf", timeZone: "Australia/Sydney", signal: abort.signal, onProgress: (text) => job.progress = text };
    void (async () => {
      try {
        const t = await getTranscript(ctx, body.sessionId, abort.signal);
        job.result = await exportTranscript(t, options);
        job.status = "done";
      } catch (e) {
        job.status = abort.signal.aborted ? "cancelled" : "error";
        job.error = e.message;
        job.completedFiles = e.completedFiles ?? [];
        job.cleanupWarnings = e.cleanupWarnings ?? [];
      } finally {
        job.finished = Date.now();
      }
    })();
    for (const [key, value] of jobs) if (value.finished && Date.now() - value.finished > 3e5) jobs.delete(key);
    return Response.json({ id });
  });
  route("job", ["GET", "DELETE"], async (request) => {
    const id = new URL(request.url).searchParams.get("id"), job = jobs.get(id);
    if (!job) throw Error("\u4EFB\u52A1\u4E0D\u5B58\u5728");
    if (request.method === "DELETE") job.abort.abort();
    const { abort, ...safe } = job;
    return Response.json(safe, { headers: { "cache-control": "no-store" } });
  });
}
export {
  apply,
  inject,
  name,
  validOrigin
};
