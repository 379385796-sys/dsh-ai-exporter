import { mkdir, mkdtemp, rm, rmdir } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
const roots = /* @__PURE__ */ new Map();
async function acquireTemp(base, onWarning = () => {
}) {
  base = resolve(base);
  let state = roots.get(base);
  if (!state) {
    state = { refs: 0, ready: (async () => {
      await mkdir(dirname(base), { recursive: true });
      try {
        await mkdir(base);
        return true;
      } catch (error) {
        if (error.code === "EEXIST") return false;
        throw error;
      }
    })() };
    roots.set(base, state);
  }
  state.refs++;
  let leaf;
  try {
    await state.ready;
    leaf = await mkdtemp(join(base, "export-job-"));
  } catch (error) {
    if (!--state.refs) roots.delete(base);
    throw error;
  }
  let released = false;
  return { path: leaf, async release() {
    if (released) return;
    released = true;
    try {
      await rm(leaf, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch (error) {
      onWarning(`\u4E34\u65F6\u6587\u4EF6\u6E05\u7406\u5931\u8D25\uFF1A${leaf} (${error.code ?? error.message})`);
    }
    if (!--state.refs) {
      roots.delete(base);
      if (await state.ready) {
        try {
          await rmdir(base);
        } catch (error) {
          if (error.code !== "ENOENT") onWarning(`\u4E34\u65F6\u6839\u76EE\u5F55\u4FDD\u7559\uFF1A${base} (${error.code ?? error.message})`);
        }
      }
    }
  } };
}
export {
  acquireTemp
};
