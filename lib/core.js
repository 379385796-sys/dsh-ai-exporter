import { eventNote, finalizeNotes } from "./session-notes.js";
const LIMITS = Object.freeze({ bytes: 64 * 1024 * 1024, line: 8 * 1024 * 1024, events: 25e4 });
const INTERNAL = /* @__PURE__ */ new Set(["permission/preset", "sandbox/mode", "approval/policy", "agent-preset/selected", "agent/inbox/spliced", "turn/start", "turn/end", "step/start", "step/end", "system/message", "developer/message", "request/header", "request/context", "session/title", "session/title-llm-request", "session-log-deepseek/delivery-accepted", "tool/call", "tool/result", "command/run", "command/done", "session/end-seed", "assistant/attempt", "llm/retry", "compaction/start", "compaction/end", "compaction/summary", "tool/ptc-dispatch", "session/metadata"]);
for (const type of ["model/selection", "plan/mode", "approval/asked", "approval/decided", "llm/retry-started", "subagent/catalog", "subagent/descriptor", "subagent/model-selection-policy", "hook/invoked", "hook/result", "goal/change", "schedule/change", "job/registered", "job/settled"]) INTERNAL.add(type);
const lf = (text) => text.replace(/\r\n?/g, "\n");
class TranscriptReplay {
  constructor(header, options = {}) {
    if (!header || header.type !== void 0 && header.type !== "session") throw Error("\u7F3A\u5C11 session \u6587\u4EF6\u5934");
    if (header.version !== 4 || typeof header.id !== "string" || !Number.isFinite(header.createdAt)) throw Error("\u4EC5\u652F\u6301\u5B8C\u6574\u7684 DSH session V4\uFF1B\u8BF7\u4FDD\u7559\u539F\u6587\u4EF6\u5E76\u66F4\u65B0\u9002\u914D\u5668");
    this.header = header;
    this.options = options;
    this.messages = [];
    this.notes = [];
    this.commands = /* @__PURE__ */ new Map();
    this.steps = /* @__PURE__ */ new Map();
    this.cuts = [];
    this.turn = 0;
    this.last = -1;
    this.title = "\u672A\u547D\u540D\u4F1A\u8BDD";
    this.stats = { events: 0, byType: {}, filteredInternal: 0, filteredBlocks: 0, rewoundMessages: 0, replayedMessages: 0, unsupported: 0 };
    this.diagnostics = [];
    this.ids = /* @__PURE__ */ new Map();
    this.openTurn = false;
    this.inbox = /* @__PURE__ */ new Map();
    this.rewindMarkers = /* @__PURE__ */ new Set();
  }
  diagnostic(code, seq, detail, unsupported = false) {
    this.diagnostics.push({ code, seq, detail });
    if (unsupported) this.stats.unsupported++;
  }
  content(blocks, seq) {
    if (!Array.isArray(blocks)) throw Error(`\u4E8B\u4EF6 ${seq} \u7684\u6B63\u6587\u4E0D\u662F\u5185\u5BB9\u5757\u6570\u7EC4`);
    const parts = [];
    for (const b of blocks) {
      if (b?.type === "text" && typeof b.text === "string") parts.push(lf(b.text));
      else if (["reasoning", "redacted-reasoning", "tool-call", "tool-result"].includes(b?.type)) this.stats.filteredBlocks++;
      else if (["image", "file", "audio", "video"].includes(b?.type)) {
        const a = b.attachment ?? {};
        parts.push(`
[\u9644\u4EF6\uFF1A${b.type}\uFF1B${String(a.name ?? a.attachmentId ?? "\u672A\u547D\u540D").replace(/[\r\n]/g, " ")}\uFF1B\u672A\u5D4C\u5165]
`);
        this.diagnostic("attachment-reference", seq, "\u4FDD\u7559\u9644\u4EF6\u8BF4\u660E\uFF1B\u4E0D\u4F1A\u8BFB\u53D6\u9644\u4EF6\u8DEF\u5F84\u6216\u52A0\u8F7D\u8FDC\u7A0B\u8D44\u6E90");
      } else {
        parts.push(`
[\u4E0D\u652F\u6301\u7684\u5185\u5BB9\u5757\uFF1A${String(b?.type ?? "unknown").replace(/[\r\n<>]/g, "_")}]
`);
        this.diagnostic("unsupported-block", seq, String(b?.type ?? "unknown"), true);
      }
    }
    return parts.join("");
  }
  add(event, role, body, source, id, key) {
    if (!body.trim()) {
      if (role === "assistant" && key) {
        const previous = this.steps.get(key);
        if (previous) previous.active = false;
      }
      return;
    }
    const identity = role + ":" + id;
    if (id && this.ids.has(identity)) {
      const prior = this.ids.get(identity);
      if (prior.body !== body) throw Error(`\u4E8B\u4EF6 ${event.seq} \u7684\u6D88\u606F ID \u51B2\u7A81\uFF0C\u62D2\u7EDD\u9759\u9ED8\u8986\u76D6`);
      this.stats.replayedMessages++;
      return;
    }
    const m = { id: id ?? `event-${event.seq}`, role, body, time: event.time, turn: this.turn, model: role === "assistant" ? source?.model : void 0, source: { seq: event.seq, type: event.type }, active: true };
    if (role === "assistant" && key) {
      const previous = this.steps.get(key);
      if (previous) previous.active = false;
      this.steps.set(key, m);
    }
    this.messages.push(m);
    if (id) this.ids.set(identity, m);
  }
  push(e) {
    this.options.signal?.throwIfAborted();
    if (!e || !Number.isSafeInteger(e.seq) || e.seq !== this.last + 1) throw Error(`\u4E8B\u4EF6\u5E8F\u53F7\u4E0D\u8FDE\u7EED\uFF08\u671F\u671B ${this.last + 1}\uFF0C\u6536\u5230 ${e?.seq}\uFF09\uFF0C\u4E0D\u80FD\u4FDD\u8BC1\u5386\u53F2\u5B8C\u6574`);
    if (typeof e.type !== "string" || !Number.isFinite(e.time) || !e.data || typeof e.data !== "object") throw Error(`\u4E8B\u4EF6 ${e.seq} \u7ED3\u6784\u65E0\u6548`);
    this.last = e.seq;
    if (++this.stats.events > LIMITS.events) throw Error("\u4E8B\u4EF6\u6570\u91CF\u8D85\u8FC7\u5B89\u5168\u4E0A\u9650");
    this.stats.byType[e.type] = (this.stats.byType[e.type] ?? 0) + 1;
    const d = e.data;
    if (e.type === "turn/start") {
      this.turn = d.turn;
      this.openTurn = true;
    }
    if (e.type === "turn/end") this.openTurn = false;
    if (e.type === "agent/inbox/spliced") {
      const pending = this.inbox.get(d.target) ?? [];
      if (!Number.isSafeInteger(d.start) || d.start < 0 || d.start > pending.length || !Array.isArray(d.inserted)) throw Error(`\u65E0\u6548 Inbox \u64CD\u4F5C @${e.seq}`);
      pending.splice(d.start, d.removedCount ?? 0, ...d.inserted);
      this.inbox.set(d.target, pending);
    }
    if (e.type === "llm/retry") {
      const previous = this.steps.get(`${d.turn ?? this.turn}:${d.step ?? 0}`);
      if (previous) previous.active = false;
    }
    if (e.type === "session/title" && typeof d.title === "string") this.title = d.title;
    if (e.type === "command/run") this.commands.set(d.commandId, d);
    if (e.type === "command/done" && d.kind === "success") {
      const c = this.commands.get(d.commandId);
      if (c && ["rewind", "rewind-plugin"].includes(c.name) && !/(preview|__candidates)/.test(c.args ?? "") && Number.isSafeInteger(d.sourceEventSeq)) {
        const target = (c.args ?? "").match(/@(\d+)/);
        if (target && +target[1] <= d.sourceEventSeq && d.sourceEventSeq < e.seq) this.cuts.push({ start: +target[1], end: d.sourceEventSeq });
        else this.diagnostic("invalid-rewind", e.seq, "\u65E0\u6CD5\u8BC6\u522B\u64A4\u56DE\u76EE\u6807", true);
      }
    }
    if (e.type === "user/message") {
      if (d.source?.kind === "user" && e.surfaceOp === "append") this.add(e, "user", this.content(d.content, e.seq), d.source, d.id);
      else {
        this.stats.filteredInternal++;
        if (d.source?.kind === "dsh-rewind") {
          this.rewindMarkers.add(e.seq);
          this.diagnostic("rewind-marker", e.seq, "\u5185\u90E8\u64A4\u56DE\u5360\u4F4D\u6D88\u606F\u5DF2\u6392\u9664");
        }
      }
    } else if (e.type === "assistant/message") {
      if (e.surfaceOp === "append") this.add(e, "assistant", this.content(d.message?.content, e.seq), d.message?.source, d.message?.id, `${d.turn ?? this.turn}:${d.step ?? 0}`);
      else this.stats.filteredInternal++;
    } else if (["workspace/changes", "deliverables/presented"].includes(e.type)) {
      try {
        this.notes.push(eventNote(e));
        this.diagnostic("visible-reference", e.seq, e.type === "workspace/changes" ? "\u5DE5\u4F5C\u533A\u53D8\u66F4\u4EC5\u4FDD\u5B58\u5F15\u7528\uFF0C\u4E0D\u5305\u542B\u6587\u4EF6\u5DEE\u5F02\u5FEB\u7167" : "\u4FDD\u7559\u4EA4\u4ED8\u7269\u6587\u4EF6\u8DEF\u5F84\u548C\u8BF4\u660E\uFF0C\u4E0D\u8BFB\u53D6\u6587\u4EF6\u5185\u5BB9");
      } catch (error) {
        this.diagnostic("unsupported-event-data", e.seq, e.type + ": " + error.message, true);
      }
    } else if (e.type === "assistant/live-chunk") {
      this.diagnostic("uncommitted-live-chunk", e.seq, "\u672A\u63D0\u4EA4\u7684\u5B9E\u65F6\u7247\u6BB5\uFF1A\u8BF7\u7B49\u5F85\u56DE\u590D\u5B8C\u6210\u540E\u5BFC\u51FA", true);
      this.stats.filteredInternal++;
    } else {
      this.stats.filteredInternal++;
      if (!INTERNAL.has(e.type)) this.diagnostic("unknown-event", e.seq, e.type, true);
    }
    if (e.surfaceOp && e.surfaceOp !== "append") {
      if (e.surfaceOp.op !== "replace" || !Number.isSafeInteger(e.surfaceOp.startSeq) || !Number.isSafeInteger(e.surfaceOp.endSeq)) throw Error(`\u672A\u77E5 surface \u64CD\u4F5C @${e.seq}`);
      this.diagnostic("model-context-replacement", e.seq, "\u6A21\u578B\u4E0A\u4E0B\u6587\u66FF\u6362\u4E0D\u81EA\u52A8\u5220\u9664\u804A\u5929\u5386\u53F2\uFF1B\u804A\u5929\u64A4\u56DE\u4EE5\u547D\u4EE4\u7ED3\u679C\u4E3A\u51C6");
      if (!["dsh-rewind", "compact-checkpoint", "runtime-context"].includes(d.source?.kind) && !["tool/result", "system/message", "developer/message"].includes(e.type)) this.diagnostic("unknown-replacement", e.seq, "\u672A\u77E5\u4E0A\u4E0B\u6587\u66FF\u6362\u6765\u6E90\uFF0C\u8BF7\u6838\u5BF9\u754C\u9762", true);
    }
  }
  finish() {
    for (const seq of this.rewindMarkers) if (!this.cuts.some((c) => c.end === seq)) this.diagnostic("unresolved-rewind", seq, "\u64A4\u56DE\u6807\u8BB0\u6CA1\u6709\u5339\u914D\u7684\u6210\u529F\u547D\u4EE4\uFF0C\u65E0\u6CD5\u786E\u8BA4\u754C\u9762\u53EF\u89C1\u6027", true);
    for (const pending of this.inbox.values()) if (pending.some((m) => m.source?.kind === "user")) this.diagnostic("pending-user-input", this.last, "\u4ECD\u6709\u6392\u961F\u7684\u7528\u6237\u6D88\u606F\u5C1A\u672A\u63D0\u4EA4\u6B63\u6587\uFF0C\u8BF7\u7B49\u5F85\u540E\u91CD\u65B0\u8BFB\u53D6", true);
    const cuts = this.cuts.sort((a, b) => a.start - b.start), merged = [];
    for (const c of cuts) {
      const p = merged.at(-1);
      if (p && c.start <= p.end) p.end = Math.max(p.end, c.end);
      else merged.push({ ...c });
    }
    let ci = 0, round = 0, prevTurn;
    const messages = [];
    for (const m of this.messages) {
      while (ci < merged.length && merged[ci].end < m.source.seq) ci++;
      if (merged[ci] && merged[ci].start <= m.source.seq) {
        this.stats.rewoundMessages++;
        continue;
      }
      if (!m.active) continue;
      if (m.turn !== prevTurn || !round) {
        round++;
        prevTurn = m.turn;
      }
      const { active, ...clean } = m;
      messages.push({ ...clean, round, index: messages.length + 1 });
    }
    if (this.openTurn) this.diagnostic("open-turn", this.last, "\u6700\u540E\u4E00\u8F6E\u5C1A\u672A\u7ED3\u675F\uFF1B\u53EA\u542B\u5DF2\u63D0\u4EA4\u6B63\u6587", true);
    const annotations = finalizeNotes(this.notes, messages, (seq) => merged.some((c) => c.start <= seq && seq <= c.end));
    return { schemaVersion: 1, id: this.header.id, title: this.title, createdAt: this.header.createdAt, capturedThroughSeq: this.last, messages, annotations, diagnostics: this.diagnostics, stats: { ...this.stats, messages: messages.length, rounds: round }, complete: this.stats.unsupported === 0 };
  }
}
function replay(header, events, options = {}) {
  const r = new TranscriptReplay(header, options);
  for (const e of events) r.push(e);
  return r.finish();
}
function selectRounds(transcript, range) {
  if (!range) return transcript;
  const wanted = /* @__PURE__ */ new Set();
  for (const part of range.split(",")) {
    const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!m) throw Error("\u8F6E\u6B21\u683C\u5F0F\u5E94\u4E3A 1-3,5");
    const a = +m[1], b = +(m[2] ?? m[1]);
    if (a < 1 || b < a || b > transcript.stats.rounds) throw Error("\u9009\u62E9\u7684\u8F6E\u6B21\u8D85\u51FA\u4F1A\u8BDD\u8303\u56F4");
    for (let i = a; i <= b; i++) wanted.add(i);
  }
  return { ...transcript, messages: transcript.messages.filter((m) => wanted.has(m.round)), annotations: transcript.annotations?.filter((n) => wanted.has(n.round)), selection: range };
}
export {
  LIMITS,
  TranscriptReplay,
  lf,
  replay,
  selectRounds
};
