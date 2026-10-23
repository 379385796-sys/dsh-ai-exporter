import { TranscriptReplay, LIMITS } from "./core.js";
async function getTranscript(ctx, id, signal) {
  if (typeof id !== "string" || !/^[-\w]{1,180}$/.test(id)) throw Error("\u65E0\u6548\u4F1A\u8BDD ID");
  const query = ctx.get("sessionQuery");
  if (typeof query?.readSession !== "function") throw Error("\u5F53\u524D DSH \u7F3A\u5C11\u5DF2\u9A8C\u8BC1\u7684 sessionQuery.readSession\uFF0C\u8BF7\u4F7F\u7528\u72EC\u7ACB\u5DE5\u5177");
  signal?.throwIfAborted();
  const { session, events } = await query.readSession(id);
  signal?.throwIfAborted();
  if (events.length > LIMITS.events) throw Error("\u4F1A\u8BDD\u4E8B\u4EF6\u6570\u91CF\u8D85\u8FC7\u5B89\u5168\u4E0A\u9650");
  const r = new TranscriptReplay(session, { signal });
  let bytes = 0;
  for (let i = 0; i < events.length; i++) {
    bytes += Buffer.byteLength(JSON.stringify(events[i]));
    if (bytes > LIMITS.bytes) throw Error("\u4F1A\u8BDD\u8D85\u8FC7 64 MiB \u5B89\u5168\u4E0A\u9650");
    r.push(events[i]);
    if (i % 200 === 0) await new Promise((done) => setImmediate(done));
  }
  return r.finish();
}
async function listSessions(ctx, signal) {
  const query = ctx.get("sessionQuery");
  if (typeof query?.listSessions !== "function") throw Error("\u4F1A\u8BDD\u67E5\u8BE2\u670D\u52A1\u4E0D\u53EF\u7528");
  const records = await query.listSessions(signal);
  return records.map((r) => ({ id: r.header.id, createdAt: r.header.createdAt, live: r.live }));
}
export {
  getTranscript,
  listSessions
};
