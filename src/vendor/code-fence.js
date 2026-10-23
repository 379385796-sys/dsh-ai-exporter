/**
 * Derived from nuncaeslupus/ai-chat-exporter, MIT.
 * Copyright (c) 2026 AI Chat Exporter Contributors.
 * Source e69fc4da8c597b54a6329a328eaaef0d75b17041:
 * src/core/exporters/structured-md-exporter.ts (longestBacktickRun/codeFence).
 * Changes: JavaScript module exports; use in readable TXT code boundaries.
 * Full license: lib/licenses/nuncaeslupus-ai-chat-exporter.txt.
 */
function longestBacktickRun(text) {
  const runs = text.match(/`+/g);
  return runs ? Math.max(...runs.map((run) => run.length)) : 0;
}
export function codeFence(content) {
  return '`'.repeat(Math.max(3, longestBacktickRun(content) + 1));
}
