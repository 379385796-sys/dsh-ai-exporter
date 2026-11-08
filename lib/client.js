window.__ModuleLoader__.load({id:"dsh-ai-exporter",factory:(require)=>{var module={exports:{}};var exports=module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.jsx
var client_exports = {};
__export(client_exports, {
  ExportPanel: () => ExportPanel,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");

// src/export-styles.js
var EXPORT_STYLES = `
.dse-trigger{display:inline-flex;align-items:center;justify-content:center;gap:6px;appearance:none;font:inherit;font-size:.86em;font-weight:500;line-height:1.35;color:var(--dsw-alias-label-secondary,#687080);background:transparent;border:1px solid transparent;border-radius:8px;padding:6px 10px;min-height:30px;cursor:pointer;white-space:nowrap}
.dse-trigger:hover:enabled{color:var(--dsw-alias-label-primary,#262a32);background:var(--dsw-alias-interactive-bg-hover,#f2f4f8)}
.dse-trigger:focus-visible{outline:2px solid var(--dsw-focus-ring-color,#4569d4);outline-offset:2px}
.dse-trigger:disabled{opacity:.45;cursor:default}
.dse-trigger svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.dse-backdrop{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.28);color:var(--dsw-alias-label-primary,#262a32);font:inherit;line-height:1.5}
.dse-backdrop *{box-sizing:border-box}
.dse-dialog{width:min(680px,100%);max-height:calc(100dvh - 40px);display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2,#e3e5e9);border-radius:16px;background:var(--dsw-alias-bg-layer-1,#fff);box-shadow:0 20px 72px #0003;outline:0;overflow:hidden}
.dse-header{display:flex;gap:16px;align-items:flex-start;justify-content:space-between;padding:24px 26px 20px;border-bottom:1px solid var(--dsw-alias-border-l2,#e3e5e9)}
.dse-header h2{font:inherit;font-weight:650;font-size:1.28em;margin:0;display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.dse-header h2 span{font-size:.65em;font-weight:450;color:var(--dsw-alias-label-secondary,#687080)}
.dse-header p,.dse-footer p{margin:5px 0 0;color:var(--dsw-alias-label-secondary,#687080);font-size:.86em}
.dse-body{padding:4px 26px 18px;overflow:auto;overscroll-behavior:contain;min-height:0}
.dse-group{padding:18px 0;border-bottom:1px solid var(--dsw-alias-border-l2,#e3e5e9)}
.dse-group h3{font:inherit;font-weight:600;margin:0 0 12px}
.dse-backdrop button,.dse-backdrop input,.dse-backdrop select{font:inherit;color:inherit}
.dse-backdrop button{appearance:none;cursor:pointer;border:1px solid var(--dsw-alias-border-l2,#d9dce3);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:8px;min-height:36px;padding:7px 12px;line-height:1.35;flex-shrink:0}
.dse-backdrop button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,#f2f4f8)}
.dse-backdrop button:disabled{cursor:default;opacity:.45}
.dse-header .dse-icon{border:0;background:transparent;font-size:1.5em;line-height:1;padding:5px 9px;min-height:32px}
.dse-backdrop input:not([type=checkbox]),.dse-backdrop select{min-width:0;border:1px solid var(--dsw-alias-border-l2,#d9dce3);border-radius:8px;background:var(--dsw-alias-bg-base,var(--dsw-alias-bg-layer-1,#fff));padding:9px 11px;min-height:38px;width:100%}
.dse-session,.dse-location{display:flex;gap:8px;align-items:center}.dse-session select{flex:1}.dse-location input{flex:1}
.dse-field{display:grid;grid-template-columns:160px 1fr;gap:12px;align-items:center;margin-top:14px}.dse-field>span{display:flex;flex-direction:column}.dse-field small{font-size:.8em;color:var(--dsw-alias-label-secondary,#687080)}
.dse-formats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.dse-format{display:grid;grid-template-columns:auto 1fr;gap:2px 8px;align-items:center;border:1px solid var(--dsw-alias-border-l2,#e0e3e9);border-radius:10px;padding:12px;cursor:pointer}
.dse-format span{font-weight:600}.dse-format small{grid-column:2;color:var(--dsw-alias-label-secondary,#687080);font-size:.78em;overflow-wrap:anywhere}
.dse-checks{display:flex;gap:20px;flex-wrap:wrap;margin-top:14px}.dse-checks label,.dse-alert label{display:flex;gap:8px;align-items:center}
.dse-note{margin:9px 0 0;color:var(--dsw-alias-label-secondary,#687080);font-size:.82em;overflow-wrap:anywhere}
.dse-details{margin-top:14px;font-size:.86em}.dse-details summary,.dse-alert summary{cursor:pointer;color:var(--dsw-alias-label-secondary,#687080)}.dse-details summary span{margin-left:7px}
.dse-backdrop pre{font:inherit;font-size:.9em;white-space:pre-wrap;overflow-wrap:anywhere;max-height:200px;overflow:auto;margin:10px 0 0;padding:12px;border-radius:8px;background:var(--dsw-alias-bg-base,#f5f6f8)}
.dse-alert{margin:16px 0 0;border-left:3px solid var(--dsw-alias-state-error-primary,#bd4e5c);padding:10px 12px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#bd4e5c) 7%,transparent);border-radius:0 8px 8px 0;font-size:.9em;overflow-wrap:anywhere}
.dse-alert p{margin:5px 0 10px}.dse-status{margin-top:14px;font-size:.86em;color:var(--dsw-alias-label-secondary,#687080);overflow-wrap:anywhere;min-height:1.5em}
.dse-footer{padding:16px 26px 20px;border-top:1px solid var(--dsw-alias-border-l2,#e3e5e9);flex-shrink:0}.dse-footer p{margin:0 0 12px}.dse-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
.dse-sr{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.dse-backdrop{animation:dse-overlay-in 160ms ease-out}
.dse-dialog{animation:dse-surface-in 180ms ease-out;border-radius:var(--dsw-radius-xl,16px)}
.dse-trigger,.dse-backdrop button,.dse-format,.dse-backdrop input,.dse-backdrop select{transition:background-color 120ms ease,border-color 120ms ease,color 120ms ease,box-shadow 120ms ease}
.dse-backdrop button:active:not(:disabled),.dse-trigger:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active,#e8eaef)}
.dse-format.is-selected{border-color:var(--dsw-alias-brand-primary,#4d6bfe);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 5%,transparent)}
.dse-backdrop input[type=checkbox]{width:16px;height:16px;margin:0;flex-shrink:0;accent-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dse-backdrop :focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary,#4d6bfe));outline-offset:3px}
.dse-actions .dse-primary{background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4d6bfe));border-radius:var(--dsw-radius-md,8px);border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff);font-weight:600;padding-inline:22px}
.dse-actions .dse-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-brand-primary,#4d6bfe));filter:none}
.dse-actions .dse-primary:active:not(:disabled){background:var(--dsw-alias-button-primary-active,var(--dsw-alias-button-primary-fill,#4d6bfe))}
.dse-path{font-size:.82em;margin-top:8px;color:var(--dsw-alias-label-secondary,#687080)}
.dse-path summary{cursor:pointer}.dse-path span{display:block;margin-top:6px;overflow-wrap:anywhere;user-select:text}
.dse-status.is-error{color:var(--dsw-alias-state-error-primary,#bd4e5c)}
@keyframes dse-overlay-in{from{opacity:0}to{opacity:1}}
@keyframes dse-surface-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:560px){.dse-backdrop{padding:10px}.dse-dialog{max-height:calc(100dvh - 20px);border-radius:12px}.dse-header{padding:18px}.dse-body{padding:0 18px 14px}.dse-footer{padding:14px 18px}.dse-session{flex-wrap:wrap}.dse-session select{flex-basis:100%}.dse-field{grid-template-columns:1fr;gap:6px}.dse-format{padding:9px;gap:3px 5px}.dse-actions button{flex:1}.dse-header p{font-size:.82em}}
@media(max-width:400px){.dse-formats{grid-template-columns:1fr}.dse-format{grid-template-columns:auto 1fr auto}.dse-format small{grid-column:3}}
@media(prefers-reduced-motion:reduce){.dse-trigger,.dse-backdrop,.dse-backdrop *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

// src/copy.js
var zh = { title: "\u5BFC\u51FA\u5BF9\u8BDD", scope: "\u5BFC\u51FA\u53EF\u8BFB\u6B63\u6587\uFF1B\u4E0D\u542B\u601D\u8003\u3001\u5DE5\u5177\u539F\u59CB\u8BB0\u5F55\u548C\u9644\u4EF6\u6587\u4EF6\u3002", session: "\u4F1A\u8BDD\u8303\u56F4", current: "\u5F53\u524D\u6253\u5F00\u7684\u4F1A\u8BDD", history: "\u5386\u53F2\u4F1A\u8BDD", reload: "\u91CD\u65B0\u8BFB\u53D6", selectSession: "\u5BFC\u51FA\u4F1A\u8BDD", range: "\u5BFC\u51FA\u8F6E\u6B21", all: "\u7559\u7A7A\u5BFC\u51FA\u5168\u90E8", rangeExample: "\u4F8B\u5982 1-3,5", options: "\u5BFC\u51FA\u9009\u9879", txt: "\u7EAF\u6587\u672C", md: "Markdown", pdf: "\u53EF\u641C\u7D22\u6587\u6863", times: "\u5305\u542B\u65F6\u95F4\u6233", models: "\u5305\u542B\u6A21\u578B\u540D\u79F0", destination: "\u4FDD\u5B58\u4F4D\u7F6E", localPath: "Windows \u672C\u5730\u4FDD\u5B58\u76EE\u5F55", path: "\u4FDD\u5B58\u76EE\u5F55", pathHint: "\u8F93\u5165\u6216\u7C98\u8D34 Windows \u672C\u5730\u76EE\u5F55", browse: "\u6D4F\u89C8\u2026", pathNote: "\u624B\u8F93\u4F4D\u7F6E\u9700\u7ECF Windows \u786E\u8BA4\u3002\u540C\u540D\u81EA\u52A8\u7F16\u53F7\uFF0C\u4E0D\u8986\u76D6\u5DF2\u6709\u6587\u4EF6\u3002", coverage: "\u9644\u4EF6\u4E0E\u4EA4\u4ED8\u7269\u4EC5\u4FDD\u7559\u5F15\u7528\uFF1B\u6B64\u5BFC\u51FA\u4E0D\u662F\u539F\u59CB\u4F1A\u8BDD\u5907\u4EFD\u3002", partialTitle: "\u6B64\u5FEB\u7167\u5305\u542B\u672A\u5B8C\u6574\u652F\u6301\u7684\u5185\u5BB9", partialHint: "\u67E5\u770B\u8BCA\u65AD\u540E\uFF0C\u53EF\u4EC5\u5BF9\u5F53\u524D\u5DF2\u5BA1\u9605\u5FEB\u7167\u5141\u8BB8\u90E8\u5206\u5BFC\u51FA\u3002", partial: "\u6211\u5DF2\u4E86\u89E3\uFF0C\u5141\u8BB8\u6B64\u5FEB\u7167\u90E8\u5206\u5BFC\u51FA", diagnostics: "\u8BE6\u7EC6\u8BCA\u65AD", errorDetails: "\u67E5\u770B\u9519\u8BEF\u4E0E\u5DF2\u5B8C\u6210\u6587\u4EF6", files: "\u4FDD\u5B58\u7ED3\u679C\u4E0E\u6587\u4EF6\u660E\u7EC6", local: "\u4EC5\u5728\u672C\u5730\u4FDD\u5B58 \xB7 \u540C\u76EE\u5F55\u4FDD\u7559\u8BCA\u65AD\u62A5\u544A", saveAs: "\u53E6\u5B58\u4E3A\u6587\u4EF6\u2026", close: "\u5173\u95ED", closeLabel: "\u5173\u95ED\u5BFC\u51FA", cancel: "\u53D6\u6D88\u5BFC\u51FA", export: "\u5BFC\u51FA", working: "\u5904\u7406\u4E2D\u2026", reading: "\u6B63\u5728\u8BFB\u53D6\u4F1A\u8BDD\u2026", read: "\u5DF2\u8BFB\u53D6 {messages} \u6761\u6B63\u6587 \xB7 {rounds} \u8F6E", choose: "\u8BF7\u5728 Windows \u7A97\u53E3\u9009\u62E9\u4FDD\u5B58\u6587\u4EF6\u5939\u2026", chooseCancelled: "\u5DF2\u53D6\u6D88\u9009\u62E9\uFF0C\u672A\u521B\u5EFA\u5BFC\u51FA\u4EFB\u52A1", chosen: "\u4FDD\u5B58\u6587\u4EF6\u5939\u5DF2\u901A\u8FC7 Windows \u786E\u8BA4\u3002", fallback: "\u539F\u8F93\u5165\u76EE\u5F55\u4E0D\u53EF\u7528\uFF0C\u5DF2\u91C7\u7528\u91CD\u65B0\u9009\u62E9\u7684\u6587\u4EF6\u5939\u3002", confirm: "\u8BF7\u5728 Windows \u7A97\u53E3\u786E\u8BA4\u6B64\u4FDD\u5B58\u4F4D\u7F6E\u2026", confirmAs: "\u8BF7\u5728 Windows \u53E6\u5B58\u4E3A\u7A97\u53E3\u786E\u8BA4\u6587\u4EF6\u540D\u4E0E\u4F4D\u7F6E\u2026", saved: "\u5DF2\u4FDD\u5B58 {count} \u4E2A\u6587\u4EF6", report: "\u8BCA\u65AD\u62A5\u544A", cleanup: "\u6E05\u7406\u63D0\u793A", completed: "\u5DF2\u5B8C\u6210", cancelled: "\u5DF2\u53D6\u6D88", cancelling: "\u6B63\u5728\u7B49\u5F85\u5B89\u5168\u53D6\u6D88\u2026", snapshotChanged: "\u4F1A\u8BDD\u6570\u636E\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u5E76\u68C0\u67E5\u8BCA\u65AD\u3002", invalidSnapshot: "\u8BFB\u53D6\u7ED3\u679C\u4E0E\u6240\u9009\u4F1A\u8BDD\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u91CD\u8BD5\u3002", stageRead: "\u8BFB\u53D6\u5B8C\u6574\u4F1A\u8BDD", stageGenerate: "\u6B63\u5728\u751F\u6210" };
var en = { title: "Export conversation", scope: "Export readable message bodies, without reasoning, raw tool records or attachment files.", session: "Conversation", current: "Currently open conversation", history: "History", reload: "Reload", selectSession: "Conversation to export", range: "Turns to export", all: "Leave empty for all turns", rangeExample: "For example, 1-3,5", options: "Export options", txt: "Plain text", md: "Markdown", pdf: "Searchable document", times: "Include timestamps", models: "Include model names", destination: "Save location", localPath: "Local Windows save folder", path: "Save folder", pathHint: "Enter or paste a local Windows folder", browse: "Browse\u2026", pathNote: "Typed locations require Windows confirmation. Existing files are kept; duplicates receive a number.", coverage: "Attachments and deliverables are references only. This is not a raw session backup.", partialTitle: "This snapshot contains unsupported content", partialHint: "Review the diagnostics before allowing a partial export of this exact snapshot.", partial: "I understand; allow a partial export of this snapshot", diagnostics: "Diagnostics", errorDetails: "Error and completed files", files: "Saved files and details", local: "Saved locally \xB7 Diagnostic report in the same folder", saveAs: "Save as file\u2026", close: "Close", closeLabel: "Close export", cancel: "Cancel export", export: "Export", working: "Working\u2026", reading: "Reading conversation\u2026", read: "Read {messages} message bodies \xB7 {rounds} turns", choose: "Choose a save folder in the Windows dialog\u2026", chooseCancelled: "Selection cancelled; no export task was created", chosen: "Save folder confirmed in Windows.", fallback: "The previous folder was unavailable. Your new selection is used.", confirm: "Confirm this location in the Windows dialog\u2026", confirmAs: "Confirm the file name and location in Windows\u2026", saved: "Saved {count} files", report: "Diagnostic report", cleanup: "Cleanup notice", completed: "Completed", cancelled: "Cancelled", cancelling: "Waiting for safe cancellation\u2026", snapshotChanged: "Conversation changed. Reload and review the diagnostics.", invalidSnapshot: "The response does not match the selected conversation. Please retry.", stageRead: "Reading complete conversation", stageGenerate: "Generating" };
function defaultText(key, params = {}) {
  return (zh[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ""));
}

// src/client.jsx
var import_jsx_runtime = require("react/jsx-runtime");
var inject = ["slots", "locale"];
var endpoint = (name) => "api/ai-exporter." + name;
var preferenceKey = "dsh-ai-exporter.last-directory.v1";
var formatKey = (values) => [...values].sort().join(",");
function lastDirectory() {
  try {
    const value = localStorage.getItem(preferenceKey);
    if (value && value.length < 8192 && /^[A-Za-z]:[\\/]/.test(value)) return value;
  } catch {
  }
  return "";
}
async function api(name, options) {
  const response = await fetch(endpoint(name), options);
  const data = await response.json();
  if (!response.ok) throw Error(data.error ?? `HTTP ${response.status}`);
  return data;
}
function ExportPanel({ sessionId, t: tr = defaultText }) {
  const [open, setOpen] = (0, import_react.useState)(false), [snapshot, setSnapshot] = (0, import_react.useState)(null), [error, setError] = (0, import_react.useState)(""), [status, setStatus] = (0, import_react.useState)("");
  const [formats, setFormats] = (0, import_react.useState)(["txt", "md", "pdf"]), [range, setRange] = (0, import_react.useState)(""), [output, setOutput] = (0, import_react.useState)(lastDirectory);
  const [times, setTimes] = (0, import_react.useState)(true), [models, setModels] = (0, import_react.useState)(false), [partialKey, setPartialKey] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false), [reading, setReading] = (0, import_react.useState)(false), [history, setHistory] = (0, import_react.useState)([]), [selected, setSelected] = (0, import_react.useState)(sessionId), [jobReady, setJobReady] = (0, import_react.useState)(false);
  const job = (0, import_react.useRef)(null), mounted = (0, import_react.useRef)(true), read = (0, import_react.useRef)({ generation: 0, abort: null }), operation = (0, import_react.useRef)(null), poll = (0, import_react.useRef)(null), historyRead = (0, import_react.useRef)(null), grant = (0, import_react.useRef)(null), trigger = (0, import_react.useRef)(null), panel = (0, import_react.useRef)(null), busyRef = (0, import_react.useRef)(false), scope = (0, import_react.useRef)({ sessionId, selected, open }), titleId = (0, import_react.useId)(), pathId = (0, import_react.useId)(), rangeId = (0, import_react.useId)();
  scope.current = { sessionId, selected, open };
  busyRef.current = busy;
  const current = snapshot?.id === selected && snapshot.ownerSession === sessionId ? snapshot : null;
  const partial = Boolean(current && partialKey === current.snapshotKey);
  function invalidate() {
    read.current.abort?.abort();
    read.current = { generation: read.current.generation + 1, abort: null };
  }
  function clearPreview() {
    invalidate();
    setSnapshot(null);
    setPartialKey(null);
    setReading(false);
    grant.current = null;
  }
  function close() {
    if (busyRef.current) return;
    scope.current.open = false;
    clearPreview();
    historyRead.current?.abort();
    setOpen(false);
  }
  (0, import_react.useEffect)(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      invalidate();
      historyRead.current?.abort();
      operation.current?.abort();
      poll.current?.abort();
    };
  }, []);
  (0, import_react.useEffect)(() => {
    clearPreview();
    setSelected(sessionId);
    setRange("");
    setError("");
  }, [sessionId]);
  (0, import_react.useEffect)(() => {
    if (!open || busy || !current?.diagnostics.some((d) => d.code === "open-turn" || d.code === "pending-user-input")) return;
    const timer = setTimeout(() => void load(), 1e3);
    return () => clearTimeout(timer);
  }, [open, busy, current, selected]);
  (0, import_react.useEffect)(() => {
    if (!open) return;
    panel.current?.focus();
    const keys = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        const items = [...panel.current.querySelectorAll('button,input,select,summary,[tabindex="0"]')].filter((e2) => !e2.disabled && e2.getClientRects().length);
        const first = items[0], last = items.at(-1);
        if (!first) return;
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const element = panel.current;
    element.addEventListener("keydown", keys);
    return () => {
      element.removeEventListener("keydown", keys);
      trigger.current?.focus();
    };
  }, [open]);
  function remember(directory) {
    setOutput(directory);
    try {
      localStorage.setItem(preferenceKey, directory);
    } catch {
    }
  }
  function changeDirectory(value) {
    setOutput(value);
    grant.current = null;
    setError("");
  }
  function changeFormats(value) {
    setFormats(value);
    grant.current = null;
  }
  async function load(id = scope.current.selected) {
    if (busyRef.current) return;
    invalidate();
    const a = new AbortController(), generation = read.current.generation, owner = scope.current.sessionId;
    read.current.abort = a;
    setSnapshot(null);
    setPartialKey(null);
    setReading(true);
    setError("");
    setStatus(tr("reading"));
    const valid = () => mounted.current && !a.signal.aborted && generation === read.current.generation && scope.current.sessionId === owner && scope.current.selected === id && scope.current.open;
    try {
      const value = await api("snapshot?" + new URLSearchParams({ sessionId: id }), { signal: a.signal });
      if (valid()) {
        if (value.id !== id || typeof value.snapshotKey !== "string") throw Error(tr("invalidSnapshot"));
        setSnapshot({ ...value, ownerSession: owner });
        setStatus(tr("read", { messages: value.messages.length, rounds: value.stats.rounds }));
      }
    } catch (e) {
      if (valid()) setError(e.message);
    } finally {
      if (valid()) setReading(false);
    }
  }
  async function listHistory() {
    historyRead.current?.abort();
    const a = new AbortController();
    historyRead.current = a;
    try {
      const value = await api("sessions", { signal: a.signal });
      if (mounted.current && !a.signal.aborted && scope.current.open) setHistory(value);
    } catch (e) {
      if (!a.signal.aborted && mounted.current) setError(e.message);
    }
  }
  function select(id) {
    scope.current.selected = id;
    clearPreview();
    setSelected(id);
    setRange("");
    void load(id);
  }
  function launch() {
    scope.current.open = true;
    setOpen(true);
    void load();
  }
  async function browse() {
    if (busyRef.current || !current || reading) return;
    busyRef.current = true;
    const a = new AbortController();
    operation.current = a;
    grant.current = null;
    setError("");
    setBusy(true);
    setStatus(tr("choose"));
    try {
      const d = await api("destination", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: selected, formats, initialDirectory: output, folderOnly: true }), signal: a.signal });
      if (!mounted.current) return;
      if (d.cancelled) {
        setStatus(tr("chooseCancelled"));
        return;
      }
      remember(d.directory);
      grant.current = { ...d, sessionId: selected, formats: formatKey(formats), expires: Date.now() + 24e4 };
      setStatus(tr(d.initialDirectoryUnavailable ? "fallback" : "chosen"));
    } catch (e) {
      if (mounted.current && !a.signal.aborted) setError(e.message);
    } finally {
      operation.current = null;
      busyRef.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function start(saveAs = false) {
    if (busyRef.current || reading || !current || !formats.length || !current.complete && !partial) return;
    const reviewed = current, owner = scope.current.sessionId, idSelected = selected;
    busyRef.current = true;
    setError("");
    setBusy(true);
    setJobReady(false);
    const a = new AbortController();
    operation.current = a;
    try {
      let destination = grant.current;
      if (saveAs || !destination || destination.sessionId !== selected || destination.formats !== formatKey(formats) || destination.directory !== output || destination.expires < Date.now()) {
        grant.current = null;
        setStatus(tr(saveAs ? "confirmAs" : "confirm"));
        destination = await api("destination", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: selected, formats, initialDirectory: output, folderOnly: !saveAs, strictInitialDirectory: Boolean(output.trim()) }), signal: a.signal });
      }
      a.signal.throwIfAborted();
      if (!mounted.current) return;
      if (destination.cancelled) {
        setStatus(tr("chooseCancelled"));
        return;
      }
      if (scope.current.sessionId !== owner || scope.current.selected !== idSelected) throw Error(tr("snapshotChanged"));
      remember(destination.directory);
      grant.current = null;
      operation.current = null;
      const { id } = await api("start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: idSelected, reviewedSnapshot: reviewed.snapshotKey, grant: destination.grant, formats, range, timestamps: times, models, allowPartial: partial }) });
      job.current = id;
      if (!mounted.current) return;
      setJobReady(true);
      const observer = new AbortController();
      poll.current = observer;
      while (mounted.current && !observer.signal.aborted) {
        const j = await api("job?id=" + id, { signal: observer.signal });
        if (!mounted.current || observer.signal.aborted) break;
        setStatus(j.progress === "\u8BFB\u53D6\u5B8C\u6574\u4F1A\u8BDD" ? tr("stageRead") : String(j.progress ?? "").replace("\u6B63\u5728\u751F\u6210", tr("stageGenerate")));
        if (j.status === "done") {
          setStatus(`${tr("saved", { count: j.result.files.length })}
${j.result.files.join("\n")}
${tr("report")}\uFF1A${j.result.reportFile}` + (j.result.cleanupWarnings?.length ? "\n" + tr("cleanup") + "\uFF1A" + j.result.cleanupWarnings.join("\n") : ""));
          break;
        }
        if (j.status === "error" || j.status === "cancelled") throw Error((j.status === "cancelled" ? tr("cancelled") : j.error) + (j.completedFiles?.length ? "\n" + tr("completed") + "\uFF1A" + j.completedFiles.join("\n") : "") + (j.cleanupWarnings?.length ? "\n" + tr("cleanup") + "\uFF1A" + j.cleanupWarnings.join("\n") : ""));
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    } catch (e) {
      if (mounted.current) setError(e.message);
    } finally {
      job.current = null;
      operation.current = null;
      poll.current = null;
      busyRef.current = false;
      if (mounted.current) {
        setBusy(false);
        setJobReady(false);
      }
    }
  }
  async function cancel() {
    if (!job.current) return;
    setStatus(tr("cancelling"));
    try {
      await api("job?id=" + job.current, { method: "DELETE" });
    } catch (e) {
      if (mounted.current) setError(e.message);
    }
  }
  const disabled = busy || reading || !current || !formats.length || !current.complete && !partial;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: EXPORT_STYLES }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { ref: trigger, type: "button", className: "dse-trigger", disabled: !sessionId || busy, onClick: launch, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { "aria-hidden": "true", focusable: "false", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tr("title") })
    ] }),
    open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dse-backdrop", onMouseDown: (e) => {
      if (e.target === e.currentTarget) close();
    }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { ref: panel, className: "dse-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, tabIndex: -1, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "dse-header", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { id: titleId, children: [
            tr("title"),
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "AI Exporter" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: tr("scope") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dse-icon", "aria-label": tr("closeLabel"), disabled: busy, onClick: close, children: "\xD7" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-body", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dse-group", "aria-labelledby": titleId + "-scope", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { id: titleId + "-scope", children: tr("session") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-session", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { "aria-label": tr("selectSession"), disabled: busy, value: selected, onChange: (e) => select(e.target.value), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: sessionId, children: tr("current") }),
              history.filter((h) => h.id !== sessionId).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: h.id, children: [
                new Date(h.createdAt).toLocaleString(),
                " \xB7 ",
                h.id.slice(-12)
              ] }, h.id))
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => void listHistory(), children: tr("history") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => void load(), children: tr("reload") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dse-field", htmlFor: rangeId, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              tr("range"),
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: tr("all") })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { id: rangeId, disabled: busy, placeholder: tr("rangeExample"), value: range, onChange: (e) => setRange(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dse-group", "aria-labelledby": titleId + "-options", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { id: titleId + "-options", children: tr("options") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dse-formats", children: ["txt", "md", "pdf"].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dse-format " + (formats.includes(f) ? "is-selected" : ""), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", disabled: busy, checked: formats.includes(f), onChange: (e) => changeFormats(e.target.checked ? [...formats, f] : formats.filter((v) => v !== f)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f.toUpperCase() }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: tr(f) })
          ] }, f)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-checks", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", disabled: busy, checked: times, onChange: (e) => setTimes(e.target.checked) }),
              tr("times")
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", disabled: busy, checked: models, onChange: (e) => setModels(e.target.checked) }),
              tr("models")
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dse-note", children: tr("coverage") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dse-group", "aria-labelledby": titleId + "-destination", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { id: titleId + "-destination", children: tr("destination") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dse-sr", htmlFor: pathId, children: tr("path") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-location", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { id: pathId, "aria-label": tr("path"), disabled: busy, value: output, title: output, placeholder: tr("pathHint"), spellCheck: false, autoComplete: "off", onChange: (e) => changeDirectory(e.target.value) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy || reading || !current, onClick: () => void browse(), children: tr("browse") })
          ] }),
          output && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "dse-path", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: tr("localPath") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: output })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dse-note", children: tr("pathNote") })
        ] }),
        current && !current.complete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-alert", role: "alert", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: tr("partialTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: tr("partialHint") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", disabled: busy, checked: partial, onChange: (e) => setPartialKey(e.target.checked ? current.snapshotKey : null) }),
            tr("partial")
          ] })
        ] }),
        current && current.diagnostics.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "dse-details", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: [
            tr("diagnostics"),
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: current.diagnostics.length })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: current.diagnostics.map((d) => `@${d.seq} ${d.code}: ${d.detail}`).join("\n") })
        ] }),
        error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-alert", role: "alert", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: error.split("\n")[0] }),
          error.includes("\n") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: tr("errorDetails") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: error })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dse-status" + (error ? " is-error" : ""), role: "status", "aria-live": "polite", "aria-busy": reading || busy, children: status?.split("\n")[0] }),
        status?.includes("\n") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "dse-details", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: tr("files") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: status })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { className: "dse-footer", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: tr("local") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-actions", children: [
          formats.length === 1 && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled, onClick: () => void start(true), children: tr("saveAs") }),
          busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !jobReady, onClick: () => void cancel(), children: tr("cancel") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: close, children: tr("close") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dse-primary", disabled, onClick: () => void start(), children: tr(busy ? "working" : "export") })
        ] })
      ] })
    ] }) })
  ] });
}
function apply(ctx) {
  ctx.effect(() => ctx.locale.register("ai-exporter", { zh, en }), "ai-exporter: locale");
  ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({ name: "conversation.session.header.utilities", id: "dsh-ai-exporter", locale: "ai-exporter", order: 900 }, ExportPanel));
}

return module.exports;}});
