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
var import_jsx_runtime = require("react/jsx-runtime");
var inject = ["slots"];
var endpoint = (name) => "api/ai-exporter." + name;
var preferenceKey = "dsh-ai-exporter.last-directory.v1";
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
  const [open, setOpen] = (0, import_react.useState)(false), [t, setT] = (0, import_react.useState)(null), [error, setError] = (0, import_react.useState)(""), [status, setStatus] = (0, import_react.useState)(""), [formats, setFormats] = (0, import_react.useState)(["txt", "md", "pdf"]), [range, setRange] = (0, import_react.useState)(""), [output, setOutput] = (0, import_react.useState)(lastDirectory), [times, setTimes] = (0, import_react.useState)(true), [models, setModels] = (0, import_react.useState)(false), [partial, setPartial] = (0, import_react.useState)(false), [busy, setBusy] = (0, import_react.useState)(false), [history, setHistory] = (0, import_react.useState)([]), [selected, setSelected] = (0, import_react.useState)(sessionId);
  const job = (0, import_react.useRef)(null), mounted = (0, import_react.useRef)(true), abort = (0, import_react.useRef)(null);
  const [jobReady, setJobReady] = (0, import_react.useState)(false);
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
  }, [sessionId]);
  (0, import_react.useEffect)(() => {
    if (!open || busy || !t?.diagnostics.some((d) => d.code === "open-turn" || d.code === "pending-user-input")) return;
    const timer = setTimeout(() => void load(), 1e3);
    return () => clearTimeout(timer);
  }, [open, busy, t, selected]);
  async function load(id = selected) {
    abort.current?.abort();
    const a = new AbortController();
    abort.current = a;
    setError("");
    setStatus("\u8BFB\u53D6\u5B8C\u6574\u4F1A\u8BDD\u2026");
    try {
      const transcript = await api("snapshot?" + new URLSearchParams({ sessionId: id }), { signal: a.signal });
      if (!a.signal.aborted) {
        setT(transcript);
        setStatus(`\u5DF2\u8BFB\u53D6 ${transcript.messages.length} \u6761\u6B63\u6587\uFF0C${transcript.stats.rounds} \u8F6E\uFF1B\u64A4\u56DE ${transcript.stats.rewoundMessages} \u6761`);
      }
    } catch (e) {
      if (!a.signal.aborted) setError(e.message);
    }
  }
  async function start() {
    setError("");
    setBusy(true);
    setJobReady(false);
    const a = new AbortController();
    abort.current = a;
    try {
      setStatus(formats.length === 1 ? "\u8BF7\u5728 Windows \u53E6\u5B58\u4E3A\u7A97\u53E3\u786E\u8BA4\u6587\u4EF6\u540D\u548C\u4F4D\u7F6E\u2026" : "\u8BF7\u5728 Windows \u6587\u4EF6\u5939\u7A97\u53E3\u9009\u62E9\u5BFC\u51FA\u4F4D\u7F6E\u2026");
      const destination = await api("destination", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: selected, formats, initialDirectory: output }), signal: a.signal });
      if (destination.cancelled) {
        setStatus((destination.initialDirectoryUnavailable ? "\u6700\u8FD1\u76EE\u5F55\u4E0D\u53EF\u7528\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u3002\n" : "") + "\u5DF2\u53D6\u6D88\u9009\u62E9\uFF0C\u672A\u521B\u5EFA\u5BFC\u51FA\u4EFB\u52A1");
        return;
      }
      setOutput(destination.directory);
      try {
        localStorage.setItem(preferenceKey, destination.directory);
      } catch {
      }
      const { id } = await api("start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: selected, grant: destination.grant, formats, range, timestamps: times, models, allowPartial: partial }), signal: a.signal });
      job.current = id;
      if (mounted.current) setJobReady(true);
      while (mounted.current && !a.signal.aborted) {
        const j = await api("job?id=" + id, { signal: a.signal });
        setStatus(j.progress);
        if (j.status === "done") {
          setStatus(`\u5DF2\u4FDD\u5B58 ${j.result.files.length} \u4E2A\u6587\u4EF6\uFF1A
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
    setStatus("\u6B63\u5728\u53D6\u6D88\u2026");
    try {
      await api("job?id=" + job.current, { method: "DELETE" });
    } catch (e) {
      setError(e.message);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { position: "relative" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !sessionId, onClick: () => {
      setOpen(!open);
      if (!open) void load();
    }, children: "\u5BFC\u51FA\u5BF9\u8BDD" }),
    open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { "aria-label": "DSH AI Exporter", style: { position: "fixed", right: 24, top: 70, zIndex: 1e3, width: "min(540px, calc(100vw - 48px))", maxHeight: "80vh", overflow: "auto", padding: 22, border: "1px solid #718095", borderRadius: 12, background: "var(--dsw-alias-bg-layer-1, white)", color: "var(--dsw-alias-label-primary, #1c283b)", boxShadow: "0 14px 48px #0004" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "DSH AI Exporter" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "\u5BFC\u51FA\u53EF\u6062\u590D\u7684\u804A\u5929\u6B63\u6587\uFF1B\u6392\u9664\u9690\u85CF\u63A8\u7406\u3001\u5DE5\u5177\u8BB0\u5F55\u4E0E\u5185\u90E8\u4E0A\u4E0B\u6587\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
          "\u4F1A\u8BDD ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { "aria-label": "\u5BFC\u51FA\u4F1A\u8BDD", disabled: busy, value: selected, onChange: (e) => {
            setSelected(e.target.value);
            setRange("");
            void load(e.target.value);
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: sessionId, children: "\u5F53\u524D\u6253\u5F00\u7684\u4F1A\u8BDD" }),
            history.filter((h) => h.id !== sessionId).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: h.id, children: [
              new Date(h.createdAt).toLocaleString(),
              " \xB7 ",
              h.id.slice(-12)
            ] }, h.id))
          ] })
        ] }),
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { disabled: busy, onClick: () => void api("sessions").then(setHistory).catch((e) => setError(e.message)), children: "\u52A0\u8F7D\u5386\u53F2\u4F1A\u8BDD" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { disabled: busy, onClick: () => void load(), children: "\u91CD\u65B0\u8BFB\u53D6\u4F1A\u8BDD" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
        "\u8F6E\u6B21\uFF08\u7559\u7A7A\u4E3A\u5168\u90E8\uFF09 ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { disabled: busy, "aria-label": "\u8F6E\u6B21", placeholder: "\u4F8B\u5982 1-3,5", value: range, onChange: (e) => setRange(e.target.value) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: ["txt", "md", "pdf"].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { marginRight: 16 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", disabled: busy, checked: formats.includes(f), onChange: (e) => setFormats(e.target.checked ? [...formats, f] : formats.filter((v) => v !== f)) }),
        f.toUpperCase()
      ] }, f)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", disabled: busy, checked: times, onChange: (e) => setTimes(e.target.checked) }),
          "\u65F6\u95F4\u6233"
        ] }),
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", disabled: busy, checked: models, onChange: (e) => setModels(e.target.checked) }),
          "\u6A21\u578B\u540D\u79F0"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
        "\u6700\u8FD1\u4FDD\u5B58\u76EE\u5F55\uFF1A",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", { "aria-label": "\u6700\u8FD1\u4FDD\u5B58\u76EE\u5F55", style: { display: "block", overflowWrap: "anywhere" }, children: output }),
        "\u4F7F\u7528\u539F\u751F\u7A97\u53E3\u4FEE\u6539\u4F4D\u7F6E\uFF1B\u53EF\u9009\u62E9\u5DE5\u4F5C\u533A\u5916\u7684\u672C\u5730\u6587\u4EF6\u5939\u3002\u540C\u540D\u81EA\u52A8\u7F16\u53F7\uFF0C\u4E0D\u8986\u76D6\uFF1B\u540C\u76EE\u5F55\u53E6\u9644\u8BCA\u65AD JSON\u3002"
      ] }),
      t && !t.complete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { role: "alert", children: [
        "\u6709 ",
        t.stats.unsupported,
        " \u9879\u672A\u652F\u6301\u5185\u5BB9\uFF0C\u8BF7\u68C0\u67E5\u8BCA\u65AD\u3002",
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: partial, onChange: (e) => setPartial(e.target.checked) }),
          "\u6211\u5DF2\u4E86\u89E3\uFF0C\u5141\u8BB8\u90E8\u5206\u5BFC\u51FA"
        ] })
      ] }),
      t && t.diagnostics.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: [
          "\u8BCA\u65AD\uFF08",
          t.diagnostics.length,
          "\uFF09"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { style: { whiteSpace: "pre-wrap" }, children: t.diagnostics.map((d) => `@${d.seq} ${d.code}: ${d.detail}`).join("\n") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere" }, role: "status", children: status }),
      error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "alert", style: { whiteSpace: "pre-wrap", color: "#c33" }, children: error }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { disabled: busy || !t || !formats.length || !t.complete && !partial, onClick: () => void start(), children: formats.length === 1 ? "\u53E6\u5B58\u4E3A\u5E76\u5BFC\u51FA" : "\u9009\u62E9\u6587\u4EF6\u5939\u5E76\u5BFC\u51FA" }),
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { disabled: !busy || !jobReady, onClick: () => void cancel(), children: "\u53D6\u6D88\u5BFC\u51FA" }),
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { disabled: busy, onClick: () => setOpen(false), children: "\u5173\u95ED" })
      ] })
    ] })
  ] });
}
function apply(ctx) {
  ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({ name: "conversation.session.header.utilities", id: "dsh-ai-exporter", order: 900 }, ExportPanel));
}

return module.exports;}});
