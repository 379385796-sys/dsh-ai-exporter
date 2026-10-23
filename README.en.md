# Conversation Export (dsh-ai-exporter)

[简体中文](README.md)

Export current or historical DSH conversations as TXT, Markdown, and searchable PDF.

An independently maintained DSH integration. Third-party code retains its own attribution and license.

## Compatibility and status

Version **0.1.1**. Tested on Windows with DSH Desktop **0.2.1-rc.2**. Other platforms are untested. 

Choose the destination in the native Windows dialog. The initial location is the current user home; saved recent directories are retained. PDF uses the system temporary directory or DSH_EXPORTER_TEMP, without a drive-letter restriction. Unknown events, unfinished replies and unsupported content block export by default; explicitly allowing partial export retains diagnostics. Attachments are referenced, never read or embedded; math and Mermaid remain source text. This is not a lossless session archive.

## Install, use, and uninstall

Download the prebuilt tgz from Releases, verify its SHA-256, and select it in the official plugin manager, or use `dsh plugin --profile <profile> add <absolute-tgz-path>`. Restart DSH and verify the plugin ID and version. Back up your configuration before updating. To uninstall, use the official manager or `dsh plugin --profile <profile> remove dsh-ai-exporter`. Do not edit node_modules or app.asar. Removing the plugin does not erase existing exports, history, or retained preferences.

Use Export Conversation in the conversation header. Select formats, rounds, and timestamp/model display, then choose a destination in the native Windows dialog.

## Development and troubleshooting

Use Node.js 22+, configure your local cache and temporary directories, then run `pnpm install --frozen-lockfile --ignore-scripts` and `npm run check`. Exporter’s native WinForms helper requires the existing Windows .NET Framework C# compiler. Prebuilt runtime files are included; installation requires no build-time script. Verify host version, Profile selection, checksums, and import errors before troubleshooting. Do not disable safety checks or overwrite host files. See [validation scope](docs/COMPATIBILITY.md).

## License

See LICENSE and the retained third-party notices.

## Plugin manager

![中文](assets/manager-zh.png)

![English](assets/manager-en.png)
