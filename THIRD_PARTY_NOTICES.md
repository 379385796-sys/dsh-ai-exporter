# 第三方依赖

运行依赖固定版本：markdown-it 14.1.0（MIT），highlight.js 11.11.1（BSD-3-Clause），playwright-core 1.56.1（Apache-2.0）。构建依赖：esbuild 0.25.12（MIT），React 18.3.1（MIT；浏览器运行时使用 DSH 提供的 React）。完整传递依赖版本在 pnpm-lock.yaml。

发布包不打包 Edge、DSH 或其品牌资源。浏览器和 DSH 由用户已有安装提供。PDF worker 打包了 Markdown 渲染器和语法高亮代码，保留依赖许可证副本于 lib/licenses。

DSH 官方实现只作为接口/行为参考，未整体复制。对 dsh-rewind-plugin 0.17.0 的兼容规则以成功命令的参数和 sourceEventSeq 为依据独立实现；测试脚本从已安装的 MIT 插件中只读提取纯函数作为独立判定，不随产品打包其代码。

测试工具 pypdf（BSD-3-Clause）、Pillow（HPND）与 Poppler（GPL-2.0-or-later）仅用于本地验收，不是插件运行依赖，不随插件分发。

## 明确复用的 MIT 源码

- `src/vendor/code-fence.js` 来自 nuncaeslupus/ai-chat-exporter 提交 `e69fc4da8c597b54a6329a328eaaef0d75b17041` 的 `src/core/exporters/structured-md-exporter.ts`，用于 TXT 动态代码围栏；Copyright (c) 2026 AI Chat Exporter Contributors。完整许可证保存在 `licenses/nuncaeslupus-ai-chat-exporter.txt` 和插件包的 `lib/licenses/`。
- `src/vendor/filename.js` 来自 pinguarmy/ai-chat-exporter 提交 `d760b045dd19ae17af4f21c7765e1c14e5d29671` 的 `src/lib/filename.ts`，用于 Windows 安全命名与双向控制字符清理；Copyright (c) 2024 AI Chat Exporter Contributors。完整许可证保存在 `licenses/pinguarmy-ai-chat-exporter.txt` 和插件包的 `lib/licenses/`。

移植只去除 TypeScript 标注、增加模块导出及说明，项目外围另有独占写入和路径约束。未复制二者的 provider 登录/采集代码、UI 组件或品牌资源。PDF 渲染器只用于隔离研究，没有加入产品。相关研究记录未随本公开仓库分发；本文列出可核对的复用来源和许可路径。

运行包内 `lib/licenses/DEPENDENCIES.json` 列出全部 9 个生产依赖/转依赖；完整 LICENSE、NOTICE 和 Playwright ThirdPartyNotices 位于 `lib/licenses/dependencies/`。字体在系统内由本机浏览器使用，未将 Windows 字体文件复制进插件。
