function eventNote(event) {
  const d = event.data, keys = Object.keys(d);
  if (!Number.isSafeInteger(d.turn) || d.turn < 1) throw Error("\u7F3A\u5C11\u6709\u6548 turn");
  const base = { turn: d.turn, source: { seq: event.seq, type: event.type }, time: event.time };
  if (event.type === "workspace/changes") {
    if (keys.some((k) => k !== "turn")) throw Error("workspace/changes \u542B\u672A\u77E5\u5B57\u6BB5");
    return { ...base, kind: "workspace-changes", text: "\u5DE5\u4F5C\u533A\u53D8\u66F4\u8BB0\u5F55\uFF1A\u65E5\u5FD7\u4EC5\u4FDD\u5B58\u8F6E\u6B21\u5F15\u7528\uFF1B\u6587\u4EF6\u6E05\u5355\u548C\u5DEE\u5F02\u5FEB\u7167\u672A\u5D4C\u5165\uFF0C\u672A\u5C1D\u8BD5\u91CD\u5EFA\u3002" };
  }
  if (event.type !== "deliverables/presented" || typeof d.callId !== "string" || !d.callId || !Array.isArray(d.files) || !d.files.length || d.files.length > 1e3 || keys.some((k) => !["turn", "callId", "files"].includes(k))) throw Error("\u65E0\u6CD5\u8BC6\u522B\u4EA4\u4ED8\u7269\u4E8B\u4EF6");
  const files = d.files.map((f) => {
    if (!f || typeof f.path !== "string" || !f.path.trim() || f.path.length > 8192 || f.description !== void 0 && typeof f.description !== "string" || Object.keys(f).some((k) => !["path", "description"].includes(k))) throw Error("\u65E0\u6CD5\u8BC6\u522B\u4EA4\u4ED8\u7269\u6587\u4EF6\u5F15\u7528");
    return { path: f.path, ...f.description === void 0 ? {} : { description: f.description } };
  });
  return { ...base, kind: "deliverables", callId: d.callId, files };
}
function finalizeNotes(notes, messages, hidden) {
  const latestChanges = /* @__PURE__ */ new Map(), filesByTurn = /* @__PURE__ */ new Map();
  for (const note of notes) {
    if (hidden(note.source.seq)) continue;
    if (note.kind === "workspace-changes") latestChanges.set(note.turn, note);
    else {
      let files = filesByTurn.get(note.turn);
      if (!files) filesByTurn.set(note.turn, files = /* @__PURE__ */ new Map());
      for (const file of note.files) files.set(file.path, { ...note, files: [file] });
    }
  }
  const result = [...latestChanges.values(), ...[...filesByTurn.values()].flatMap((m) => [...m.values()])].sort((a, b) => a.source.seq - b.source.seq);
  return result.map((n) => {
    const message = messages.findLast((m) => m.turn === n.turn);
    return { ...n, ...message ? { afterMessageId: message.id, round: message.round } : {} };
  });
}
function noteText(note) {
  const clean = (s) => s.replace(/[\r\n\u0000-\u001f]/g, " ");
  return note.kind === "workspace-changes" ? note.text : "\u4EA4\u4ED8\u7269\u5F15\u7528\uFF08\u672A\u5D4C\u5165\u6587\u4EF6\uFF09\uFF1A\n" + note.files.map((f) => `\u2022 ${clean(f.path)}${f.description ? " \u2014 " + clean(f.description) : ""}`).join("\n");
}
export {
  eventNote,
  finalizeNotes,
  noteText
};
