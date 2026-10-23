const WINDOWS_RESERVED_BASENAMES = /* @__PURE__ */ new Set([
  "con",
  "prn",
  "aux",
  "nul",
  ...Array.from({ length: 9 }, (_, i) => `com${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `lpt${i + 1}`)
]);
function sanitizeFilename(text) {
  const sanitized = String(text || "").replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "").replace(/[<>:"/\\|?*\x00-\x1F]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").replace(/^\.+/, "").replace(/[.\s]+$/, "").substring(0, 200).replace(/[.\s]+$/, "");
  return sanitized.split("-").map((segment) => WINDOWS_RESERVED_BASENAMES.has(segment.toLowerCase()) ? `_${segment}` : segment).join("-");
}
export {
  sanitizeFilename
};
