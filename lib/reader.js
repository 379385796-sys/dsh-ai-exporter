import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createInterface } from "node:readline";
import { TranscriptReplay, LIMITS } from "./core.js";
async function readTranscript(path, options = {}) {
  if ((await stat(path)).size > LIMITS.bytes) throw Error("\u65E5\u5FD7\u8D85\u8FC7 64 MiB \u5B89\u5168\u4E0A\u9650\uFF1B\u8BF7\u5206\u6279\u5904\u7406\u6216\u63D0\u9AD8\u7ECF\u8FC7\u6D4B\u8BD5\u7684\u4E0A\u9650");
  const input = createReadStream(path, { encoding: "utf8", signal: options.signal });
  const lines = createInterface({ input, crlfDelay: Infinity });
  let n = 0, r;
  try {
    for await (let line of lines) {
      n++;
      if (n === 1) line = line.replace(/^\uFEFF/, "");
      if (!line.trim()) continue;
      if (Buffer.byteLength(line) > LIMITS.line) throw Error(`\u7B2C ${n} \u884C\u8FC7\u5927`);
      let e;
      try {
        e = JSON.parse(line);
      } catch {
        throw Error(`\u7B2C ${n} \u884C JSON \u635F\u574F\uFF0C\u62D2\u7EDD\u4E0D\u5B8C\u6574\u5BFC\u51FA`);
      }
      if (!r) r = new TranscriptReplay(e, options);
      else r.push(e);
      if (n % 200 === 0) {
        options.onProgress?.(n);
        await new Promise((resolve) => setImmediate(resolve));
      }
    }
    if (!r) throw Error("\u7A7A\u65E5\u5FD7");
    return r.finish();
  } finally {
    lines.close();
    input.destroy();
  }
}
export {
  readTranscript
};
