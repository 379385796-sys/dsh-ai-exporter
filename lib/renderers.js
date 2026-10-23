import MarkdownIt from "markdown-it";
import hljs from "highlight.js/lib/common";
import { lf } from "./core.js";
import { codeFence } from "./vendor/code-fence.js";
import { noteText } from "./session-notes.js";
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const md = new MarkdownIt({ html: false, linkify: true, typographer: false, breaks: false, highlight(code, language) {
  try {
    if (hljs.getLanguage(language)) return hljs.highlight(code, { language, ignoreIllegals: true }).value;
  } catch {
  }
  return escapeHtml(code);
} });
md.renderer.rules.image = (tokens, i) => `<span class="attachment">[\u56FE\u7247\u672A\u5D4C\u5165\uFF1A${escapeHtml(tokens[i].content)}\uFF1B${escapeHtml(tokens[i].attrGet("src") ?? "")}]</span>`;
const originalFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, i, options, env, self) => `<div style="font-size:8pt;color:#607082;break-after:avoid">${escapeHtml(tokens[i].info || "code")}</div>` + originalFence(tokens, i, options, env, self);
function bodyHtml(message) {
  const prior = md.options.breaks;
  md.options.breaks = message.role === "user";
  try {
    return md.render(message.body);
  } finally {
    md.options.breaks = prior;
  }
}
function dateText(value, zone = "Australia/Sydney") {
  if (!Number.isFinite(+new Date(value))) return "";
  return new Intl.DateTimeFormat("sv-SE", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date(value));
}
function label(m, o = {}) {
  return `[${String(m.index).padStart(3, "0")}] ${m.role === "user" ? "\u7528\u6237" : "AI"}${o.timestamps !== false && m.time ? ` | ${dateText(m.time, o.timeZone)}` : ""}${o.models && m.model ? ` | ${m.model}` : ""}`;
}
function metadata(t, o) {
  return `\u4F1A\u8BDD\uFF1A${t.title}
\u5BFC\u51FA\u65F6\u95F4\uFF1A${dateText(o.exportedAt ?? Date.now(), o.timeZone)}
\u65F6\u533A\uFF1A${o.timeZone ?? "Australia/Sydney"}
\u6D88\u606F\uFF1A${t.messages.length}${t.selection ? ` | \u8F6E\u6B21\uFF1A${t.selection}` : ""}${!t.complete ? "\n\u6CE8\u610F\uFF1A\u542B\u672A\u652F\u6301\u5185\u5BB9\uFF0C\u8BE6\u89C1\u5BFC\u51FA\u8BCA\u65AD\u3002" : ""}`;
}
const textMd = new MarkdownIt({ html: false, linkify: false, typographer: false });
textMd.inline.ruler.before("text", "windows_path", (state, silent) => {
  const rest = state.src.slice(state.pos, state.posMax);
  if (!/^[A-Za-z]:\\|^\\\\/.test(rest) && !(/^[A-Za-z]:$/.test(state.src.slice(Math.max(0, state.pos - 2), state.pos)) && rest.startsWith("\\"))) return false;
  const value = rest.match(/^[^`\n<>]+/)?.[0];
  if (!value) return false;
  if (!silent) state.pending += value;
  state.pos += value.length;
  return true;
});
function readableTarget(url = "") {
  if (/^[A-Za-z]:(?:[\\/]|%5c)|^file:/i.test(url)) {
    try {
      return decodeURIComponent(url);
    } catch {
    }
  }
  return url;
}
function inline(tokens = []) {
  return tokens.map((t, i) => {
    switch (t.type) {
      case "text":
      case "code_inline":
        return t.content;
      case "softbreak":
      case "hardbreak":
        return "\n";
      case "image":
        return `[\u56FE\u7247\uFF1A${t.content} (${readableTarget(t.attrGet("src") ?? "")})]`;
      case "link_close": {
        let j = i - 1;
        while (j >= 0 && tokens[j].type !== "link_open") j--;
        const url = readableTarget(tokens[j]?.attrGet("href"));
        const label2 = tokens.slice(j + 1, i).filter((t2) => ["text", "code_inline"].includes(t2.type)).map((t2) => t2.content).join("");
        return url && url !== label2 ? ` (${url})` : "";
      }
      default:
        return "";
    }
  }).join("");
}
const graphemes = new Intl.Segmenter("und", { granularity: "grapheme" });
function displayWidth(s) {
  let n = 0;
  for (const { segment } of graphemes.segment(s)) {
    if (new RegExp("\\p{Emoji_Presentation}|\\p{Regional_Indicator}|\\uFE0F|\\u20E3", "u").test(segment)) {
      n += 2;
      continue;
    }
    for (const c of segment) {
      const v = c.codePointAt(0);
      if (new RegExp("\\p{Mark}", "u").test(c) || v === 8205 || v === 65039) continue;
      n += v >= 4352 && (v <= 4447 || v >= 11904 && v <= 42191 || v >= 44032 && v <= 55203 || v >= 63744 && v <= 64255 || v >= 65040 && v <= 65135 || v >= 65280 && v <= 65376) ? 2 : 1;
    }
  }
  return n;
}
function textTable(tokens, source) {
  const rows = [];
  let row;
  for (const t of tokens) {
    if (t.type === "tr_open") {
      row = [];
      rows.push(row);
    }
    if (t.type === "inline" && row) row.push(inline(t.children));
  }
  if (!rows.length) return "";
  const countCells = (line) => {
    let s = line.trim().replace(/^(?:>\s*)+/, "");
    const boundaries = [...s.matchAll(/(?<!\\)\|/g)].map((m) => m.index);
    return boundaries.length + 1 - (boundaries[0] === 0 ? 1 : 0) - (boundaries.at(-1) === s.length - 1 ? 1 : 0);
  };
  const sourceRows = source.split("\n").filter((_, i) => i !== 1);
  if (sourceRows.length !== rows.length || sourceRows.some((s) => countCells(s) !== rows[0].length)) return "\u8868\u683C\u539F\u6587\uFF08\u7ED3\u6784\u590D\u6742\uFF0C\u4FDD\u7559\u539F\u59CB\u5355\u5143\u683C\u5185\u5BB9\uFF09\uFF1A\n" + source + "\n\n";
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => displayWidth(r[i] ?? ""))));
  if (widths.reduce((a, b) => a + b + 3, 0) > 100 || rows.some((r) => r.some((c) => /[|\n\t]|<br\s*\/?\s*>/i.test(c)))) return rows.slice(1).map((r, i) => `\u8BB0\u5F55 ${i + 1}
` + r.map((c, j) => `  \u5217 ${j + 1}\uFF08${rows[0][j] || "\u672A\u547D\u540D"}\uFF09\uFF1A${c.replace(/\n/g, "\n    ")}`).join("\n")).join("\n\n") + (rows.length === 1 ? "\u8868\u683C\u5B57\u6BB5\uFF1A" + rows[0].join("\uFF1B") : "") + "\n\n";
  return rows.map((r, i) => r.map((c, j) => c + " ".repeat(Math.max(0, widths[j] - displayWidth(c)))).join(" | ") + (i === 0 ? "\n" + widths.map((w) => "-".repeat(w)).join("-+-") : "")).join("\n") + "\n\n";
}
function markdownToText(body) {
  const source = lf(body), lines = source.split("\n"), tokens = textMd.parse(source, {});
  let out = "", quote = 0, lists = [], item = false, lastInlineEnd;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i], prefix = () => "> ".repeat(quote) + "  ".repeat(Math.max(0, lists.length - 1));
    switch (t.type) {
      case "table_open": {
        let j = i + 1;
        while (j < tokens.length && tokens[j].type !== "table_close") j++;
        out += textTable(tokens.slice(i, j + 1), lines.slice(...t.map).join("\n"));
        i = j;
        break;
      }
      case "blockquote_open":
        quote++;
        break;
      case "blockquote_close":
        quote--;
        break;
      case "bullet_list_open":
        lists.push({ ordered: false, n: 1 });
        break;
      case "ordered_list_open":
        lists.push({ ordered: true, n: +(t.attrGet("start") ?? 1) });
        break;
      case "bullet_list_close":
      case "ordered_list_close":
        lists.pop();
        break;
      case "list_item_open": {
        const l = lists.at(-1);
        out += prefix() + (l?.ordered ? `${l.n++}. ` : "\u2022 ");
        item = true;
        break;
      }
      case "list_item_close":
        if (!out.endsWith("\n")) out += "\n";
        item = false;
        break;
      case "inline":
        out += (item ? "" : prefix()) + inline(t.children).replace(/\n/g, "\n" + prefix());
        item = false;
        lastInlineEnd = t.map?.[1];
        break;
      case "paragraph_close":
      case "heading_close": {
        const next = tokens.slice(i + 1).find((t2) => t2.map)?.map?.[0];
        const gap = next === void 0 ? 1 : Math.max(1, next - (lastInlineEnd ?? next) + 1);
        out += "\n".repeat(gap);
        break;
      }
      case "fence":
      case "code_block": {
        const p = prefix(), language = t.info?.trim() || "code";
        const fence = codeFence(t.content);
        out += `${p}${fence}${language}
` + t.content.split("\n").map((line, index, array) => index === array.length - 1 && !line ? "" : p + line).join("\n") + `${t.content.endsWith("\n") ? "" : "\n"}${p}${fence}

`;
        break;
      }
      case "hr":
        out += "----------------------------------------\n\n";
        break;
      case "html_block":
        out += t.content + "\n";
        break;
    }
  }
  return out.replace(/\n+$/, "");
}
function renderText(t, o = {}) {
  let text = metadata(t, o) + "\n\n" + t.messages.map((m) => "========================================\n" + label(m, o) + "\n========================================\n\n" + markdownToText(m.body) + notesAfter(t, m).map((n) => "\n\n[\u4F1A\u8BDD\u9644\u6CE8]\n" + noteText(n)).join("")).join("\n\n") + notesAfter(t, null).map((n) => "\n\n[\u4F1A\u8BDD\u9644\u6CE8]\n" + noteText(n)).join("") + "\n";
  if (o.newline === "crlf") text = lf(text).replace(/\n/g, "\r\n");
  return (o.bom ? "\uFEFF" : "") + text;
}
function closedBody(body) {
  const tokens = md.parse(body, {});
  const fence = tokens.at(-1);
  if (fence?.type === "fence" && fence.map?.[1] === body.split("\n").length) {
    const lines = body.split("\n");
    const ending = lines.at(-1)?.trim();
    if (!new RegExp(`^${fence.markup[0]}{${fence.markup.length},}\\s*$`).test(ending ?? "")) return body + "\n" + fence.markup + "\n";
  }
  return body;
}
const mdEscape = (s) => String(s).replace(/\r?\n/g, " ").replace(/([\\`*_[\]{}<>!|#])/g, "\\$1");
function notesAfter(t, m) {
  return (t.annotations ?? []).filter((n) => m ? n.afterMessageId === m.id : !n.afterMessageId);
}
function markdownNotes(notes) {
  return notes.map((n) => "\n\n**\u4F1A\u8BDD\u9644\u6CE8**\n\n" + (n.kind === "workspace-changes" ? mdEscape(n.text) : n.files.map((f) => "- " + mdEscape(f.path) + (f.description ? " \u2014 " + mdEscape(f.description) : "")).join("\n"))).join("");
}
function renderMarkdown(t, o = {}) {
  return `# ${mdEscape(t.title)}

${metadata(t, o).split("\n").slice(1).map(mdEscape).join("  \n")}

` + t.messages.map((m) => `---

## ${mdEscape(label(m, o))}

${closedBody(m.body)}${markdownNotes(notesAfter(t, m))}
`).join("\n") + markdownNotes(notesAfter(t, null)) + "\n";
}
const PDF_CSS = `
@page{size:A4;margin:17mm 15mm 19mm}*{box-sizing:border-box}html{color:#1c283b;background:white;font:11pt/1.65 'Microsoft YaHei','Noto Sans CJK SC','Segoe UI','Segoe UI Emoji',sans-serif}body{margin:0}header{border-bottom:2px solid #235d79;padding:0 0 12pt;margin-bottom:22pt}header h1{font-size:23pt;line-height:1.3;margin:0 0 8pt}header p{color:#607082;font-size:9pt;white-space:pre-line;margin:0}.message{margin:0 0 21pt}.message-label{font-size:9pt;color:#235d79;border-left:3px solid #397e9c;padding:5pt 9pt;background:#eff5f8;break-after:avoid}.user .body{background:#f7f8fa;padding:9pt 12pt;border-radius:5pt}.body{overflow-wrap:anywhere;min-width:0}h1,h2,h3,h4,h5,h6{line-height:1.4;break-after:avoid}h1{font-size:20pt}h2{font-size:17pt}h3{font-size:14pt}p{margin:7pt 0}pre{font:8.4pt/1.55 Consolas,'Microsoft YaHei','Segoe UI Emoji',monospace;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-all;background:#f0f3f6;border:1px solid #dce3e8;border-radius:4pt;padding:9pt;box-decoration-break:clone}code{font-family:Consolas,'Microsoft YaHei',monospace}table{border-collapse:collapse;width:100%;table-layout:fixed;margin:10pt 0;font-size:9pt}thead{display:table-header-group}th,td{border:1px solid #cbd6df;padding:5pt 6pt;overflow-wrap:anywhere;vertical-align:top}th{background:#ebf1f5}tr{break-inside:avoid}blockquote{border-left:3px solid #a7bbc8;margin-left:0;padding-left:12pt;color:#4e6173}a{color:#175f8a;text-decoration:underline}img{max-width:100%;height:auto}.attachment{color:#667889;font-size:9pt}.hljs-keyword,.hljs-selector-tag,.hljs-built_in{color:#8250df}.hljs-string,.hljs-attr{color:#116329}.hljs-comment{color:#6e7781}.hljs-number,.hljs-literal{color:#0550ae}.notice{color:#8b5000;font-size:9pt}
`;
function renderHtml(t, o = {}) {
  const notesHtml = (notes) => notes.map((n) => `<aside class="notice" style="white-space:pre-wrap">\u4F1A\u8BDD\u9644\u6CE8\uFF1A${escapeHtml(noteText(n))}</aside>`).join("");
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src 'self'; img-src 'none'; base-uri 'none'; form-action 'none'"><title>${escapeHtml(t.title)}</title><style>${PDF_CSS}</style></head><body><header><h1>${escapeHtml(t.title)}</h1><p>${escapeHtml(metadata(t, o).split("\n").slice(1).join("\n"))}</p></header><p class="notice">\u6570\u5B66\u8868\u8FBE\u5F0F\u4E0E Mermaid \u4FDD\u7559\u539F\u6587\uFF1B\u56FE\u7247\u4E0E\u9644\u4EF6\u4EE5\u8BF4\u660E\u663E\u793A\uFF0C\u79BB\u7EBF\u5BFC\u51FA\u4E0D\u52A0\u8F7D\u5916\u90E8\u8D44\u6E90\u3002</p>${t.messages.map((m) => `<section class="message ${m.role}"><div class="message-label">${escapeHtml(label(m, o))}</div><div class="body">${bodyHtml(m)}</div>${notesHtml(notesAfter(t, m))}</section>`).join("")}${notesHtml(notesAfter(t, null))}</body></html>`;
}
export {
  PDF_CSS,
  dateText,
  displayWidth,
  escapeHtml,
  label,
  markdownToText,
  renderHtml,
  renderMarkdown,
  renderText
};
