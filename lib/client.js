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
.dse-trigger{font:inherit}
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
.dse-backdrop :focus-visible{outline:2px solid var(--dsw-alias-accent-primary,#4569d4);outline-offset:3px}
.dse-header .dse-icon{border:0;background:transparent;font-size:1.5em;line-height:1;padding:5px 9px;min-height:32px}
.dse-backdrop input:not([type=checkbox]),.dse-backdrop select{min-width:0;border:1px solid var(--dsw-alias-border-l2,#d9dce3);border-radius:8px;background:var(--dsw-alias-bg-base,var(--dsw-alias-bg-layer-1,#fff));padding:9px 11px;min-height:38px;width:100%}
.dse-session,.dse-location{display:flex;gap:8px;align-items:center}.dse-session select{flex:1}.dse-location input{flex:1}
.dse-field{display:grid;grid-template-columns:160px 1fr;gap:12px;align-items:center;margin-top:14px}.dse-field>span{display:flex;flex-direction:column}.dse-field small{font-size:.8em;color:var(--dsw-alias-label-secondary,#687080)}
.dse-formats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.dse-format{display:grid;grid-template-columns:auto 1fr;gap:2px 8px;align-items:center;border:1px solid var(--dsw-alias-border-l2,#e0e3e9);border-radius:10px;padding:12px;cursor:pointer}
.dse-format.is-selected{border-color:var(--dsw-alias-accent-primary,#4569d4);background:color-mix(in srgb,var(--dsw-alias-accent-primary,#4569d4) 5%,transparent)}
.dse-format span{font-weight:600}.dse-format small{grid-column:2;color:var(--dsw-alias-label-secondary,#687080);font-size:.78em;overflow-wrap:anywhere}
.dse-backdrop input[type=checkbox]{width:16px;height:16px;margin:0;accent-color:var(--dsw-alias-accent-primary,#4569d4);flex-shrink:0}
.dse-checks{display:flex;gap:20px;flex-wrap:wrap;margin-top:14px}.dse-checks label,.dse-alert label{display:flex;gap:8px;align-items:center}
.dse-note{margin:9px 0 0;color:var(--dsw-alias-label-secondary,#687080);font-size:.82em;overflow-wrap:anywhere}
.dse-details{margin-top:14px;font-size:.86em}.dse-details summary,.dse-alert summary{cursor:pointer;color:var(--dsw-alias-label-secondary,#687080)}.dse-details summary span{margin-left:7px}
.dse-backdrop pre{font:inherit;font-size:.9em;white-space:pre-wrap;overflow-wrap:anywhere;max-height:200px;overflow:auto;margin:10px 0 0;padding:12px;border-radius:8px;background:var(--dsw-alias-bg-base,#f5f6f8)}
.dse-alert{margin:16px 0 0;border-left:3px solid var(--dsw-alias-state-error-primary,#bd4e5c);padding:10px 12px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#bd4e5c) 7%,transparent);border-radius:0 8px 8px 0;font-size:.9em;overflow-wrap:anywhere}
.dse-alert p{margin:5px 0 10px}.dse-status{margin-top:14px;font-size:.86em;color:var(--dsw-alias-label-secondary,#687080);overflow-wrap:anywhere;min-height:1.5em}
.dse-footer{padding:16px 26px 20px;border-top:1px solid var(--dsw-alias-border-l2,#e3e5e9);flex-shrink:0}.dse-footer p{margin:0 0 12px}.dse-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
.dse-actions .dse-primary{background:var(--dsw-alias-accent-primary,#4569d4);border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff);font-weight:600;padding-inline:22px}.dse-actions .dse-primary:hover:not(:disabled){background:var(--dsw-alias-accent-primary,#4569d4);filter:brightness(1.05)}
.dse-sr{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:560px){.dse-backdrop{padding:10px}.dse-dialog{max-height:calc(100dvh - 20px);border-radius:12px}.dse-header{padding:18px}.dse-body{padding:0 18px 14px}.dse-footer{padding:14px 18px}.dse-session{flex-wrap:wrap}.dse-session select{flex-basis:100%}.dse-field{grid-template-columns:1fr;gap:6px}.dse-format{padding:9px;gap:3px 5px}.dse-actions button{flex:1}.dse-header p{font-size:.82em}}
@media(max-width:400px){.dse-formats{grid-template-columns:1fr}.dse-format{grid-template-columns:auto 1fr auto}.dse-format small{grid-column:3}}
@media(prefers-reduced-motion:reduce){.dse-backdrop *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

// src/client.jsx
var import_jsx_runtime = require("react/jsx-runtime");
var inject = ["slots"];
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
function ExportPanel({ sessionId }) {
  const [open, setOpen] = (0, import_react.useState)(false), [t, setT] = (0, import_react.useState)(null), [error, setError] = (0, import_react.useState)(""), [status, setStatus] = (0, import_react.useState)("");
  const [formats, setFormats] = (0, import_react.useState)(["txt", "md", "pdf"]), [range, setRange] = (0, import_react.useState)(""), [output, setOutput] = (0, import_react.useState)(lastDirectory);
  const [times, setTimes] = (0, import_react.useState)(true), [models, setModels] = (0, import_react.useState)(false), [partial, setPartial] = (0, import_react.useState)(false);
  const [busy, setBusy] = (0, import_react.useState)(false), [reading, setReading] = (0, import_react.useState)(false), [history, setHistory] = (0, import_react.useState)([]), [selected, setSelected] = (0, import_react.useState)(sessionId), [jobReady, setJobReady] = (0, import_react.useState)(false);
  const job = (0, import_react.useRef)(null), mounted = (0, import_react.useRef)(true), abort = (0, import_react.useRef)(null), grant = (0, import_react.useRef)(null), trigger = (0, import_react.useRef)(null), panel = (0, import_react.useRef)(null), busyRef = (0, import_react.useRef)(false), titleId = (0, import_react.useId)(), pathId = (0, import_react.useId)(), rangeId = (0, import_react.useId)();
  busyRef.current = busy;
  (0, import_react.useEffect)(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abort.current?.abort();
      if (job.current) void api("job?id=" + job.current, { method: "DELETE" }).catch(() => {
      });
    };
  }, []);
  (0, import_react.useEffect)(() => {
    setSelected(sessionId);
    setT(null);
    setRange("");
    setError("");
    grant.current = null;
  }, [sessionId]);
  (0, import_react.useEffect)(() => {
    if (!open || busy || !t?.diagnostics.some((d) => d.code === "open-turn" || d.code === "pending-user-input")) return;
    const timer = setTimeout(() => void load(), 1e3);
    return () => clearTimeout(timer);
  }, [open, busy, t, selected]);
  (0, import_react.useEffect)(() => {
    if (!open) return;
    panel.current?.focus();
    const keys = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!busyRef.current) setOpen(false);
      } else if (e.key === "Tab") {
        const items = [...panel.current.querySelectorAll('button,input,select,summary,[tabindex="0"]')].filter((e2) => !e2.disabled && e2.getClientRects().length);
        const first = items[0], last = items.at(-1);
        if (!first) return;
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
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
  async function load(id = selected) {
    abort.current?.abort();
    const a = new AbortController();
    abort.current = a;
    setReading(true);
    setError("");
    setStatus("\u6B63\u5728\u8BFB\u53D6\u4F1A\u8BDD\u2026");
    try {
      const transcript = await api("snapshot?" + new URLSearchParams({ sessionId: id }), { signal: a.signal });
      if (!a.signal.aborted) {
        setT(transcript);
        setStatus(`\u5DF2\u8BFB\u53D6 ${transcript.messages.length} \u6761\u6B63\u6587 \xB7 ${transcript.stats.rounds} \u8F6E`);
      }
    } catch (e) {
      if (!a.signal.aborted) setError(e.message);
    } finally {
      if (mounted.current && !a.signal.aborted) setReading(false);
    }
  }
  async function browse() {
    const a = new AbortController();
    abort.current = a;
    grant.current = null;
    setError("");
    setBusy(true);
    setStatus("\u8BF7\u5728 Windows \u7A97\u53E3\u9009\u62E9\u4FDD\u5B58\u6587\u4EF6\u5939\u2026");
    try {
      const d = await api("destination", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: selected, formats, initialDirectory: output, folderOnly: true }), signal: a.signal });
      if (d.cancelled) {
        setStatus("\u5DF2\u53D6\u6D88\u9009\u62E9\uFF0C\u4FDD\u5B58\u4F4D\u7F6E\u672A\u6539\u53D8\uFF0C\u672A\u521B\u5EFA\u5BFC\u51FA\u4EFB\u52A1");
        return;
      }
      remember(d.directory);
      grant.current = { ...d, sessionId: selected, formats: formatKey(formats), expires: Date.now() + 24e4 };
      setStatus(d.initialDirectoryUnavailable ? "\u539F\u8F93\u5165\u76EE\u5F55\u4E0D\u53EF\u7528\uFF0C\u5DF2\u91C7\u7528\u4F60\u5728 Windows \u4E2D\u91CD\u65B0\u9009\u62E9\u7684\u6587\u4EF6\u5939\u3002" : "\u4FDD\u5B58\u6587\u4EF6\u5939\u5DF2\u901A\u8FC7 Windows \u786E\u8BA4\u3002");
    } catch (e) {
      setError(e.message);
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function start(saveAs = false) {
    setError("");
    setBusy(true);
    setJobReady(false);
    const a = new AbortController();
    abort.current = a;
    try {
      let destination = grant.current;
      if (saveAs || !destination || destination.sessionId !== selected || destination.formats !== formatKey(formats) || destination.directory !== output || destination.expires < Date.now()) {
        grant.current = null;
        setStatus(saveAs ? "\u8BF7\u5728 Windows \u53E6\u5B58\u4E3A\u7A97\u53E3\u786E\u8BA4\u6587\u4EF6\u540D\u4E0E\u4F4D\u7F6E\u2026" : "\u8BF7\u5728 Windows \u7A97\u53E3\u786E\u8BA4\u6B64\u4FDD\u5B58\u4F4D\u7F6E\u2026");
        destination = await api("destination", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: selected, formats, initialDirectory: output, folderOnly: !saveAs, strictInitialDirectory: Boolean(output.trim()) }), signal: a.signal });
      }
      if (destination.cancelled) {
        setStatus("\u5DF2\u53D6\u6D88\u786E\u8BA4\uFF0C\u672A\u521B\u5EFA\u5BFC\u51FA\u4EFB\u52A1");
        return;
      }
      remember(destination.directory);
      grant.current = null;
      const { id } = await api("start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: selected, grant: destination.grant, formats, range, timestamps: times, models, allowPartial: partial }), signal: a.signal });
      job.current = id;
      if (mounted.current) setJobReady(true);
      while (mounted.current && !a.signal.aborted) {
        const j = await api("job?id=" + id, { signal: a.signal });
        setStatus(j.progress);
        if (j.status === "done") {
          setStatus(`\u5DF2\u4FDD\u5B58 ${j.result.files.length} \u4E2A\u6587\u4EF6
${j.result.files.join("\n")}
\u8BCA\u65AD\uFF1A${j.result.reportFile}` + (j.result.cleanupWarnings?.length ? "\n\u6E05\u7406\u63D0\u793A\uFF1A" + j.result.cleanupWarnings.join("\n") : ""));
          break;
        }
        if (j.status === "error" || j.status === "cancelled") throw Error((j.status === "cancelled" ? "\u5DF2\u53D6\u6D88" : j.error) + (j.completedFiles?.length ? "\n\u5DF2\u5B8C\u6210\uFF1A" + j.completedFiles.join("\n") : "") + (j.cleanupWarnings?.length ? "\n\u6E05\u7406\u63D0\u793A\uFF1A" + j.cleanupWarnings.join("\n") : ""));
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    } catch (e) {
      if (mounted.current) setError(a.signal.aborted ? "\u5DF2\u53D6\u6D88" : e.message);
    } finally {
      job.current = null;
      if (mounted.current) {
        setBusy(false);
        setJobReady(false);
      }
    }
  }
  async function cancel() {
    if (!job.current) return;
    setStatus("\u6B63\u5728\u7B49\u5F85\u5B89\u5168\u53D6\u6D88\u2026");
    try {
      await api("job?id=" + job.current, { method: "DELETE" });
    } catch (e) {
      setError(e.message);
    }
  }
  const disabled = busy || reading || !t || !formats.length || !t.complete && !partial;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: EXPORT_STYLES }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { ref: trigger, type: "button", className: "dse-trigger", disabled: !sessionId, onClick: () => {
      setOpen(true);
      void load();
    }, children: "\u5BFC\u51FA\u5BF9\u8BDD" }),
    open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dse-backdrop", onMouseDown: (e) => {
      if (e.target === e.currentTarget && !busy) setOpen(false);
    }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { ref: panel, className: "dse-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-label": "DSH AI Exporter", tabIndex: -1, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "dse-header", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { id: titleId, children: [
            "\u5BFC\u51FA\u5BF9\u8BDD ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "AI Exporter" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "\u4FDD\u7559\u53EF\u6062\u590D\u6B63\u6587\uFF0C\u6392\u9664\u9690\u85CF\u63A8\u7406\u4E0E\u5185\u90E8\u4E0A\u4E0B\u6587\u3002" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dse-icon", "aria-label": "\u5173\u95ED\u5BFC\u51FA", disabled: busy, onClick: () => setOpen(false), children: "\xD7" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-body", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dse-group", "aria-labelledby": titleId + "-scope", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { id: titleId + "-scope", children: "\u4F1A\u8BDD\u8303\u56F4" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-session", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { "aria-label": "\u5BFC\u51FA\u4F1A\u8BDD", disabled: busy, value: selected, onChange: (e) => {
              setSelected(e.target.value);
              setRange("");
              grant.current = null;
              setT(null);
              void load(e.target.value);
            }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: sessionId, children: "\u5F53\u524D\u6253\u5F00\u7684\u4F1A\u8BDD" }),
              history.filter((h) => h.id !== sessionId).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: h.id, children: [
                new Date(h.createdAt).toLocaleString(),
                " \xB7 ",
                h.id.slice(-12)
              ] }, h.id))
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => void api("sessions").then(setHistory).catch((e) => setError(e.message)), children: "\u5386\u53F2\u4F1A\u8BDD" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy || reading, onClick: () => void load(), children: "\u91CD\u65B0\u8BFB\u53D6" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dse-field", htmlFor: rangeId, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              "\u5BFC\u51FA\u8F6E\u6B21 ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "\u7559\u7A7A\u5BFC\u51FA\u5168\u90E8" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { id: rangeId, disabled: busy, "aria-label": "\u8F6E\u6B21", placeholder: "\u4F8B\u5982 1-3,5", value: range, onChange: (e) => setRange(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dse-group", "aria-labelledby": titleId + "-options", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { id: titleId + "-options", children: "\u5BFC\u51FA\u9009\u9879" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dse-formats", children: ["txt", "md", "pdf"].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dse-format " + (formats.includes(f) ? "is-selected" : ""), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", disabled: busy, checked: formats.includes(f), onChange: (e) => changeFormats(e.target.checked ? [...formats, f] : formats.filter((v) => v !== f)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f.toUpperCase() }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: f === "txt" ? "\u7EAF\u6587\u672C" : f === "md" ? "Markdown" : "\u53EF\u641C\u7D22\u6587\u6863" })
          ] }, f)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-checks", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", disabled: busy, checked: times, onChange: (e) => setTimes(e.target.checked) }),
              "\u5305\u542B\u65F6\u95F4\u6233"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", disabled: busy, checked: models, onChange: (e) => setModels(e.target.checked) }),
              "\u5305\u542B\u6A21\u578B\u540D\u79F0"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dse-group", "aria-labelledby": titleId + "-destination", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { id: titleId + "-destination", children: "\u4FDD\u5B58\u4F4D\u7F6E" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dse-sr", htmlFor: pathId, children: "Windows \u672C\u5730\u4FDD\u5B58\u76EE\u5F55" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-location", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { id: pathId, "aria-label": "\u4FDD\u5B58\u76EE\u5F55", disabled: busy, value: output, placeholder: "\u8F93\u5165\u6216\u7C98\u8D34 Windows \u672C\u5730\u76EE\u5F55", spellCheck: false, autoComplete: "off", onChange: (e) => changeDirectory(e.target.value) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy || reading || !t, onClick: () => void browse(), children: "\u6D4F\u89C8\u2026" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dse-note", children: "\u624B\u8F93\u4F4D\u7F6E\u9700\u7ECF Windows \u786E\u8BA4\uFF1B\u6D4F\u89C8\u9009\u5B9A\u540E\u53EF\u76F4\u63A5\u5BFC\u51FA\u3002\u540C\u540D\u81EA\u52A8\u7F16\u53F7\uFF0C\u4E0D\u8986\u76D6\u5DF2\u6709\u6587\u4EF6\u3002" })
        ] }),
        t && !t.complete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-alert", role: "alert", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u6B64\u4F1A\u8BDD\u5305\u542B\u672A\u5B8C\u6574\u652F\u6301\u7684\u5185\u5BB9" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "\u8BF7\u5148\u67E5\u770B\u8BCA\u65AD\uFF0C\u518D\u51B3\u5B9A\u662F\u5426\u5141\u8BB8\u90E8\u5206\u5BFC\u51FA\u3002" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", disabled: busy, checked: partial, onChange: (e) => setPartial(e.target.checked) }),
            "\u6211\u5DF2\u4E86\u89E3\uFF0C\u5141\u8BB8\u90E8\u5206\u5BFC\u51FA"
          ] })
        ] }),
        t && t.diagnostics.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "dse-details", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: [
            "\u8BE6\u7EC6\u8BCA\u65AD ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.diagnostics.length })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: t.diagnostics.map((d) => `@${d.seq} ${d.code}: ${d.detail}`).join("\n") })
        ] }),
        error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-alert", role: "alert", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: error.split("\n")[0] }),
          error.includes("\n") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "\u67E5\u770B\u9519\u8BEF\u4E0E\u5DF2\u5B8C\u6210\u6587\u4EF6" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: error })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dse-status", role: "status", "aria-live": "polite", children: status?.split("\n")[0] }),
        status?.includes("\n") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "dse-details", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "\u4FDD\u5B58\u7ED3\u679C\u4E0E\u6587\u4EF6\u660E\u7EC6" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: status })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { className: "dse-footer", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "\u4EC5\u5728\u672C\u5730\u4FDD\u5B58 \xB7 \u540C\u76EE\u5F55\u4FDD\u7559\u8BCA\u65AD\u62A5\u544A" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dse-actions", children: [
          formats.length === 1 && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled, onClick: () => void start(true), children: "\u53E6\u5B58\u4E3A\u6587\u4EF6\u2026" }),
          busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !jobReady, onClick: () => void cancel(), children: "\u53D6\u6D88\u5BFC\u51FA" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setOpen(false), children: "\u5173\u95ED" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dse-primary", disabled, onClick: () => void start(), children: busy ? "\u5904\u7406\u4E2D\u2026" : "\u5BFC\u51FA" })
        ] })
      ] })
    ] }) })
  ] });
}
function apply(ctx) {
  ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({ name: "conversation.session.header.utilities", id: "dsh-ai-exporter", order: 900 }, ExportPanel));
}

return module.exports;}});
