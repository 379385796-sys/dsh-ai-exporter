# dsh-ai-exporter 0.1.3

[Current GitHub Release](https://github.com/379385796-sys/dsh-ai-exporter/releases/tag/v0.1.3) · [使用说明 / Usage](README.md) · [Compatibility](docs/COMPATIBILITY.md)

Windows DSH Desktop RC5 compatibility and the updated export dialog with typed/pasted directories and native destination confirmation. TXT, Markdown, searchable PDF, session selection, and round filtering remain available.

当前发布状态以上述 Release 为准。下载 tgz 和同名 SHA-256 文件，核对后通过官方插件界面安装。下方保留此前版本的历史记录，不代表本轮重新验收。

Use the linked Release and matching tgz/checksum. The historical notes below retain their original validation scope; this documentation-only revision does not rerun acceptance.

## Historical 0.1.2 notes

The exact host range omitted RC3. Add RC3 explicitly; keep the existing exporter implementation and privacy, native-save and PDF temporary-directory behavior.

No new features or core/Shell changes. Host range: 0.2.1-rc.2 || 0.2.1-rc.3.

Validation: real installed RC3 runtime, isolated official tgz installation, enable/disable/reload, settings persistence, coexistence with Packer 0.4.2, and human Desktop GUI acceptance. 70 automated regressions passed; native save, searchable Chinese PDF and round-2-only exported content were independently verified. RC2 automated coverage remains; full RC2 Desktop retest this maintenance is NOT TESTED.

MIT licenses and third-party notices retained.
