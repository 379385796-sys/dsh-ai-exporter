import { renderText, renderMarkdown } from "./renderers.js";
import { selectRounds } from "./core.js";
import { safeStem, saveExclusive, existingDirectory } from "./files.js";
async function exportTranscript(transcript, options) {
  if (!options.outputDir) throw Error("\u5FC5\u987B\u660E\u786E\u6307\u5B9A\u4FDD\u5B58\u6587\u4EF6\u5939");
  const root = await existingDirectory(options.outputDir);
  const formats = [...new Set(options.formats ?? ["txt", "md", "pdf"])];
  if (!formats.length || formats.some((f) => !["txt", "md", "pdf"].includes(f))) throw Error("\u4E0D\u652F\u6301\u7684\u5BFC\u51FA\u683C\u5F0F");
  if (!transcript.complete && !options.allowPartial) throw Error("\u5B58\u5728\u672A\u652F\u6301\u7684\u5185\u5BB9\u6216\u672A\u7ED3\u675F\u56DE\u590D\uFF1B\u8BF7\u67E5\u770B\u8BCA\u65AD\uFF0C\u660E\u786E\u5141\u8BB8\u90E8\u5206\u5BFC\u51FA\u540E\u91CD\u8BD5");
  const selected = selectRounds(transcript, options.range), at = options.exportedAt ?? Date.now(), cleanupWarnings = [], o = { ...options, outputDir: root, exportedAt: at, onCleanupWarning: (warning) => {
    cleanupWarnings.push(warning);
    options.onCleanupWarning?.(warning);
  } };
  const stem = options.fileStem ?? safeStem(selected.title, at, o.timeZone), files = [];
  if (options.fileStem && formats.length !== 1) throw Error("\u81EA\u5B9A\u4E49\u6587\u4EF6\u540D\u53EA\u9002\u7528\u4E8E\u5355\u683C\u5F0F");
  try {
    for (const f of formats) {
      o.signal?.throwIfAborted();
      o.onProgress?.(`\u6B63\u5728\u751F\u6210 ${f.toUpperCase()}`);
      const data = f === "txt" ? renderText(selected, o) : f === "md" ? renderMarkdown(selected, o) : await (await import("./pdf-isolated.js")).renderPdfIsolated(selected, o);
      files.push(await saveExclusive(root, stem, f, data, o.signal));
    }
    const report = { schemaVersion: 1, exportedAt: new Date(at).toISOString(), sessionId: transcript.id, capturedThroughSeq: transcript.capturedThroughSeq, messages: selected.messages.length, sourceStats: transcript.stats, complete: transcript.complete, diagnostics: transcript.diagnostics, files, cleanupWarnings };
    const reportFile = await saveExclusive(root, stem + ".report", "json", JSON.stringify(report, null, 2), o.signal);
    return { ...report, reportFile };
  } catch (error) {
    error.completedFiles = files;
    error.cleanupWarnings = [...cleanupWarnings, ...error.cleanupWarnings ?? []];
    throw error;
  }
}
export {
  exportTranscript
};
