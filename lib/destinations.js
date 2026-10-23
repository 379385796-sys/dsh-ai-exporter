import { win32, basename, dirname, extname } from "node:path";
import { existingDirectory, safeStem } from "./files.js";
import { homedir } from "node:os";
import { pickNativeDestination } from "./native-dialog.js";
function validateFormats(formats) {
  if (!Array.isArray(formats) || !formats.length || formats.length > 3 || new Set(formats).size !== formats.length || formats.some((f) => !["txt", "md", "pdf"].includes(f))) throw Error("\u8BF7\u9009\u62E9\u6709\u6548\u5BFC\u51FA\u683C\u5F0F");
  return [...formats].sort();
}
function assertLocalPath(path) {
  if (typeof path !== "string" || !win32.isAbsolute(path) || !/^([A-Za-z]:[\\/])/.test(path) || /[\u0000-\u001f]/.test(path)) throw Error("\u8BF7\u9009\u62E9\u6709\u6548\u7684\u672C\u5730 Windows \u8DEF\u5F84\uFF0C\u68C0\u67E5\u672B\u5C3E\u6807\u70B9");
}
class DestinationGrants {
  constructor({ picker = pickNativeDestination, now = Date.now, validateDirectory = existingDirectory } = {}) {
    this.picker = picker;
    this.now = now;
    this.validateDirectory = validateDirectory;
    this.grants = /* @__PURE__ */ new Map();
    this.picking = false;
  }
  async choose({ sessionId, formats, title, initialDirectory }, signal) {
    const checked = validateFormats(formats);
    if (this.picking) throw Error("\u5DF2\u6709\u539F\u751F\u9009\u62E9\u7A97\u53E3\uFF0C\u8BF7\u5148\u5B8C\u6210\u6216\u53D6\u6D88");
    this.picking = true;
    try {
      let initial = homedir(), initialDirectoryUnavailable = false;
      if (initialDirectory) {
        try {
          assertLocalPath(initialDirectory);
          initial = await this.validateDirectory(initialDirectory);
        } catch {
          initialDirectoryUnavailable = true;
        }
      }
      const single = checked.length === 1, extension = checked[0];
      const path = await this.picker({ mode: single ? "file" : "folder", title: single ? "DSH AI Exporter - \u53E6\u5B58\u4E3A\uFF08\u540C\u540D\u81EA\u52A8\u7F16\u53F7\uFF0C\u4E0D\u8986\u76D6\uFF09" : "DSH AI Exporter - \u9009\u62E9\u5BFC\u51FA\u6587\u4EF6\u5939", initialDirectory: initial, fileName: single ? safeStem(title, this.now()) + "." + extension : "", extension, filter: `${extension.toUpperCase()} (*.${extension})|*.${extension}` }, signal);
      signal?.throwIfAborted();
      if (path === null) return { cancelled: true, ...initialDirectoryUnavailable ? { initialDirectoryUnavailable: true } : {} };
      assertLocalPath(path);
      if (single && win32.extname(path).toLowerCase() !== "." + extension) throw Error("\u6587\u4EF6\u6269\u5C55\u540D\u4E0E\u6240\u9009\u683C\u5F0F\u4E0D\u7B26\uFF0C\u8BF7\u91CD\u65B0\u53E6\u5B58\u4E3A");
      const directory = await this.validateDirectory(single ? win32.dirname(path) : path), fileStem = single ? win32.basename(path, win32.extname(path)) : void 0;
      if (fileStem && (/[<>:"/\\|?*\u0000-\u001f]/.test(fileStem) || /[. ]$/.test(fileStem) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(fileStem))) throw Error("Windows \u6587\u4EF6\u540D\u65E0\u6548\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9");
      for (const [id, g] of this.grants) if (g.expires < this.now()) this.grants.delete(id);
      if (this.grants.size > 32) throw Error("\u5F85\u786E\u8BA4\u7684\u4FDD\u5B58\u4F4D\u7F6E\u8FC7\u591A\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
      const grant = globalThis.crypto.randomUUID();
      this.grants.set(grant, { sessionId, formats: checked, outputDir: directory, fileStem, expires: this.now() + 3e5 });
      return { grant, directory, fileName: single ? win32.basename(path) : null, mode: single ? "file" : "folder", initialDirectoryUnavailable };
    } finally {
      this.picking = false;
    }
  }
  consume(id, sessionId, formats) {
    const g = this.grants.get(id);
    if (!g || g.expires < this.now()) throw Error("\u4FDD\u5B58\u4F4D\u7F6E\u6388\u6743\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9");
    if (g.sessionId !== sessionId || JSON.stringify(g.formats) !== JSON.stringify(validateFormats(formats))) throw Error("\u4F1A\u8BDD\u6216\u683C\u5F0F\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u4FDD\u5B58\u4F4D\u7F6E");
    this.grants.delete(id);
    return g;
  }
}
export {
  DestinationGrants,
  assertLocalPath,
  validateFormats
};
