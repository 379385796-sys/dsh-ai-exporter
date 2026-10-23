import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
async function pickNativeDestination(options, signal) {
  if (process.platform !== "win32") throw Error("Windows \u539F\u751F\u9009\u62E9\u5668\u4EC5\u652F\u6301 Windows Desktop");
  signal?.throwIfAborted();
  const program = join(dirname(fileURLToPath(import.meta.url)), "native-dialog.exe");
  return new Promise((done, reject) => {
    const child = spawn(program, [], { shell: false, windowsHide: false, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "", stderr = "", settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
      error ? reject(error) : done(value);
    };
    const cancel = () => {
      child.kill();
      finish(Error("\u5DF2\u53D6\u6D88\u9009\u62E9"));
    };
    const timer = setTimeout(() => {
      child.kill();
      finish(Error("\u539F\u751F\u6587\u4EF6\u9009\u62E9\u8D85\u65F6\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9"));
    }, 18e4);
    signal?.addEventListener("abort", cancel, { once: true });
    child.on("error", (error) => finish(Error("\u65E0\u6CD5\u542F\u52A8 Windows \u539F\u751F\u9009\u62E9\u5668\uFF1A" + error.message)));
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (b) => {
      stdout += b;
      if (stdout.length > 65536) {
        child.kill();
        finish(Error("\u9009\u62E9\u5668\u8FD4\u56DE\u6570\u636E\u8FC7\u957F"));
      }
    });
    child.stderr.on("data", (b) => {
      stderr = (stderr + b).slice(-1e3);
    });
    child.on("close", (code) => {
      try {
        const result = JSON.parse(stdout.replace(/^\uFEFF/, ""));
        if (code !== 0 || result.error) throw Error(result.error ?? stderr ?? "\u9009\u62E9\u5668\u5931\u8D25");
        if (result.path !== null && typeof result.path !== "string") throw Error("\u65E0\u6548\u539F\u751F\u9009\u62E9\u7ED3\u679C");
        finish(null, result.path);
      } catch (e) {
        finish(Error("\u539F\u751F\u9009\u62E9\u5668\u5931\u8D25\uFF1A" + e.message));
      }
    });
    child.stdin.on("error", () => {
    });
    child.stdin.end(JSON.stringify(options) + "\n", () => child.stdin.destroy());
    if (signal?.aborted) cancel();
  });
}
export {
  pickNativeDestination
};
