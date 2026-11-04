# dsh-ai-exporter 0.1.4

[Current GitHub Release](https://github.com/379385796-sys/dsh-ai-exporter/releases/tag/v0.1.4) · [使用说明 / Usage](README.md) · [Compatibility](docs/COMPATIBILITY.md)

DSH Desktop **0.2.2-rc.1** compatibility release. 0.2.2-rc.1 refuses to load a plugin whose `engines.dsh` does not name the running host, so 0.1.3 was skipped at boot; 0.1.4 declares and verifies the new host. Export behaviour, UI, native destination grants and privacy filters are unchanged.

DSH Desktop **0.2.2-rc.1** 兼容性发布。该宿主会跳过 `engines.dsh` 未声明当前版本的插件，0.1.3 因此无法加载；0.1.4 声明并通过实际验证。导出行为、界面、原生目录授权与隐私过滤均未改动。

## What was verified on 0.2.2-rc.1

- Session V4 replay through `sessionQuery.readSession`, including persisted (non-live) sessions after a host restart.
- Exact `/api/ai-exporter.snapshot|sessions|destination|start|job` Fetch routes through the owner-authenticated connection.
- TXT, Markdown and searchable PDF output with Chinese text, Markdown headings, tables, code fences and emoji preserved.
- Round filtering, exclusive no-overwrite writes (`name (1).md`), and single-use destination grants that reject replay.
- Typed/pasted directory normalization still accepts a quoted, padded Windows path and still rejects relative paths.
- 73 automated regressions pass. No source change outside `package.json` and documentation.

## Install

Download `dsh-ai-exporter-0.1.4.tgz`, verify it against `dsh-ai-exporter-0.1.4.tgz.sha256`, then install through the official plugin interface. Node 22+; PDF export additionally needs a local Edge or Chrome.

## Historical 0.1.3 notes

Windows DSH Desktop RC5 compatibility and the updated export dialog with typed/pasted directories and native destination confirmation. TXT, Markdown, searchable PDF, session selection and round filtering remain available.

## Historical 0.1.2 notes

The exact host range omitted RC3. Add RC3 explicitly; keep the existing exporter implementation and privacy, native-save and PDF temporary-directory behavior. 70 automated regressions passed; RC2 automated coverage remains; full RC2 Desktop retest that maintenance is NOT TESTED.

MIT licenses and third-party notices retained.
