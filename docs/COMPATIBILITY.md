# Compatibility / 兼容与验证

保存位置由 Windows 原生对话框明确选择；默认从当前用户主目录开始，保留已保存的最近目录。PDF 使用系统临时目录或 DSH_EXPORTER_TEMP 指定目录，不再限制盘符。未知事件、未结束回复和不支持内容默认阻止导出；仅在明确允许部分导出后继续，并保留诊断报告。附件仅保留说明，不读取或嵌入附件；数学与 Mermaid 保留原文，不宣称无损转换。

Choose the destination in the native Windows dialog. The initial location is the current user home; saved recent directories are retained. PDF uses the system temporary directory or DSH_EXPORTER_TEMP, without a drive-letter restriction. Unknown events, unfinished replies and unsupported content block export by default; explicitly allowing partial export retains diagnostics. Attachments are referenced, never read or embedded; math and Mermaid remain source text. This is not a lossless session archive.

- Windows / DSH Desktop 0.2.1-rc.2 is the validation target. Other platforms and host versions are NOT TESTED.
- Native destinations remain local absolute Windows paths. UNC/network paths remain unsupported. Missing/unwritable destinations fail without minting a grant. Existing files are never overwritten.
- C/D/other-drive path acceptance is covered by unit tests. Actual browser/export I/O uses an isolated test directory; this does not claim a second physical machine or VM test.
- Development: Node 22+, Windows .NET Framework compiler, installed Edge or DSH_EXPORTER_BROWSER pointing to Chromium/Chrome. No browser is bundled or downloaded.
- Functional checks include synthetic historical sessions, unknown-event/partial-export diagnostics, rounds, TXT/Markdown/PDF, cancellation and cleanup. No real user conversation is used.
- Bilingual plugin cards and lifecycle validation use the actual isolated host and headless Edge. Manual full Desktop GUI acceptance is recorded separately.

## v0.1.1 release validation

- Build + static checks and 70 synthetic automated tests: PASS on Windows.
- Real Chromium PDF creation and independent Chinese/English text extraction: PASS.
- Official clean Profile installation and DSH 0.2.1-rc.2 host cold start: PASS.
- Actual isolated host UI in headless Edge: Chinese/English metadata/icons, light/dark icons, official disable/enable and restart: PASS.
- The test Profile has no connection to the maintainer source directory; package dependencies resolve from its own installation.
- No second physical machine/VM, actual C-drive file creation, or manual native dialog click-through is claimed.

## 0.1.2 — 2026-10-25

Installed target verified from immutable app.asar metadata: DSH and Shell 0.2.1-rc.3; Shell commit be72761ee1a6736ebcdf4f3739363b083ae53c98; Electron 44.7.0, Node 24.21.0, ABI 149.

Extend the explicit host range to RC3 after inspecting the installed runtime. Retain exporter routes, privacy filters, native destinations and DSH_EXPORTER_TEMP behavior.

70 automated regressions passed; native save, searchable Chinese PDF and round-2-only exported content were independently verified. All three maintained plugins coexist with Packer 0.4.2 in an isolated RC3 Profile; the final headless Web-host pass has no page, console or HTTP errors. The human user completed actual Desktop GUI checks. Headless and Desktop results are recorded separately. No compatibility exemption was used. Prior RC2 support remains; full RC2 Desktop retesting this maintenance is NOT TESTED.
