import { open, mkdir, realpath, unlink, stat, access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { dateText } from "./renderers.js";
import { sanitizeFilename } from "./vendor/filename.js";
function safeStem(title, at = Date.now(), zone = "Australia/Sydney") {
  let name = sanitizeFilename(title).replace(/\u007f/g, "_").replace(/[. ]+$/, "").trim();
  if (!name) name = "\u4F1A\u8BDD";
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) name = "_" + name;
  name = Array.from(name).slice(0, 65).join("");
  return name + "_" + dateText(at, zone).replace(/[-:]/g, "").replace(" ", "-");
}
async function existingDirectory(directory) {
  if (typeof directory !== "string" || !directory.trim() || /[\u0000-\u001f]/.test(directory)) throw Error("\u4FDD\u5B58\u76EE\u5F55\u65E0\u6548\u6216\u672B\u5C3E\u542B\u8BEF\u8F93\u5165\u6807\u70B9\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9");
  try {
    const root = await realpath(directory);
    if (!(await stat(root)).isDirectory()) throw Error("\u4E0D\u662F\u6587\u4EF6\u5939");
    await access(root, 2);
    return root;
  } catch (e) {
    throw Error("\u4FDD\u5B58\u76EE\u5F55\u4E0D\u5B58\u5728\u3001\u4E0D\u53EF\u5199\u6216\u4E0D\u662F\u6587\u4EF6\u5939\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\uFF08" + (e.code ?? e.message) + "\uFF09");
  }
}
async function saveExclusive(directory, stem, ext, data, signal) {
  if (!/^[a-z]+$/.test(ext) || /[\\/]/.test(stem) || stem === "..") throw Error("\u65E0\u6548\u6587\u4EF6\u540D");
  const root = await existingDirectory(directory);
  for (let n = 0; n < 1e4; n++) {
    signal?.throwIfAborted();
    const file = join(root, stem + (n ? ` (${n})` : "") + "." + ext);
    if (file.length > 240) throw Error("\u4FDD\u5B58\u8DEF\u5F84\u8FC7\u957F\uFF0C\u8BF7\u9009\u62E9\u8F83\u77ED\u7684\u6587\u4EF6\u5939");
    let handle;
    try {
      handle = await open(file, "wx");
    } catch (e) {
      if (e.code === "EEXIST") continue;
      throw e;
    }
    try {
      await handle.writeFile(data);
      signal?.throwIfAborted();
      await handle.close();
      return resolve(file);
    } catch (e) {
      await handle.close().catch(() => {
      });
      await unlink(file).catch((cleanup) => {
        if (cleanup.code !== "ENOENT") e.cleanupWarnings = [...e.cleanupWarnings ?? [], `\u672A\u5B8C\u6210\u6587\u4EF6\u6E05\u7406\u5931\u8D25\uFF1A${file} (${cleanup.code ?? cleanup.message})`];
      });
      throw e;
    }
  }
  throw Error("\u540C\u540D\u6587\u4EF6\u8FC7\u591A");
}
export {
  existingDirectory,
  safeStem,
  saveExclusive
};
