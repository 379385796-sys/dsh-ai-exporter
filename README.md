# 对话导出 · DSH AI Exporter

[English](README.en.md) · [下载 v0.1.3](https://github.com/379385796-sys/dsh-ai-exporter/releases/tag/v0.1.3) · [兼容记录](docs/COMPATIBILITY.md)

将 DSH 当前或历史对话导出为 **TXT、Markdown 和可搜索 PDF**，用于本地阅读、检索和整理。导出在本机完成，不上传聊天正文。

## 能做什么

- 读取当前会话，也可从面板选择历史会话。
- 导出全部轮次，或用 `1-3,5` 这样的范围只保留所需轮次。
- 选择一种或多种格式，控制时间戳和模型信息的显示。
- 输入、粘贴或浏览本地目录，通过 Windows 原生窗口确认；记住最近目录，保留单一格式的“另存为”。已有文件不会被覆盖。
- 识别已支持的撤回事件并过滤内部内容；遇到未知事件或未完成回复时给出诊断，默认阻止不完整导出。

附件只保留说明，不读取或嵌入附件；数学与 Mermaid 保留原文，不保证无损转换。导出文件不能用于恢复 DSH 环境。

## 安装

当前版本 **0.1.3**，面向 Windows DSH Desktop。包声明接受 `0.2.1-rc.2 || 0.2.1-rc.3 || 0.2.1-rc.5`，Node 要求 **22+**。当前 RC5、历史 RC2/RC3 验证的区别见[兼容记录](docs/COMPATIBILITY.md)；其他平台未验证。

**PDF 另需本机已有的 Edge 或 Chrome。** 插件不附带或自动下载浏览器。找不到浏览器时，可在启动 DSH 的环境中设置 `DSH_EXPORTER_BROWSER` 为 Chromium/Chrome 可执行文件的完整路径。TXT、Markdown 不依赖 PDF 浏览器。

1. 从 [v0.1.3 Release](https://github.com/379385796-sys/dsh-ai-exporter/releases/tag/v0.1.3) 下载 `dsh-ai-exporter-0.1.3.tgz` 及同名 `.sha256`，不要把 Source code ZIP 当作安装包。
2. 用 PowerShell 核对本地哈希，与校验文件中的值比较：

   ```powershell
   Get-FileHash -Algorithm SHA256 -LiteralPath '<tgz完整路径>'
   ```

3. 在 DSH 插件管理器安装本地 tgz。若已配置 DSH CLI，也可替换 Profile 名和实际路径后执行：

   ```text
   dsh plugin --profile <你的Profile> add <tgz完整路径>
   ```

4. 重启 DSH，核对包名 `dsh-ai-exporter`、入口 ID `ai-exporter` 和版本 `0.1.3`。

升级前保留配置与旧包，使用官方插件安装入口，无需手改 `node_modules` 或 `app.asar`。

## 第一次导出

1. 在会话顶部点击“导出对话”，选当前或历史会话。
2. 选择 TXT、Markdown、PDF；轮次留空表示全部，输入 `2` 可只导出第 2 轮。
3. 按需调整时间戳、模型信息。遇到不支持内容时先查看诊断，再决定是否明确允许部分导出。
4. 输入已有本地目录或点击“浏览”，在原生窗口确认。仅选一种格式时也可“另存为文件”。
5. 等待任务完成，按结果中的路径打开文件。

手输目录仍需原生确认；无效目录会阻止导出。保存授权仅使用一次，会话、格式或路径变化后需要重新确认。只接受本地 Windows 绝对路径，不支持 UNC/网络路径。

## 常见问题

**为什么 PDF 失败，但 TXT 可以导出？** 先检查 Edge/Chrome 和 `DSH_EXPORTER_BROWSER`，再检查临时目录权限。PDF 使用系统临时目录，或启动 DSH 前指定的 `DSH_EXPORTER_TEMP`。路径应指向浏览器程序，不是浏览器安装包。

**为什么要求允许部分导出？** 未知事件、不支持内容或未结束回复可能使结果不完整。默认停止以免误认为内容齐全；明确允许后会保留诊断报告。重要会话建议等待回复结束，并检查导出结果。

**能完整保存附件、公式和图表吗？** 附件仅保留说明，数学和 Mermaid 保留源码；不承诺与原界面渲染一致。

**如何卸载？** 使用插件管理器，或 `dsh plugin --profile <你的Profile> remove dsh-ai-exporter`。已导出的文件需自行管理；卸载不清除会话历史，也不保证清除最近目录偏好。

## 开发与依赖

安装预构建 tgz 无需本地构建。源码保留 `lib/`；运行依赖为 `markdown-it`、`highlight.js`、`playwright-core`，浏览器端 React 由宿主提供，不依赖另外三款 DSH 插件。

开发需要 Node.js 22+、仓库声明的 pnpm，以及 Windows 既有 .NET Framework C# 编译器（用于原生 WinForms 保存助手）。配置缓存、临时目录及 pnpm store 后运行：

```text
pnpm install --frozen-lockfile --ignore-scripts
npm run check
```

具体版本见 [package.json](package.json) 和 [pnpm-lock.yaml](pnpm-lock.yaml)。功能验证范围见[兼容记录](docs/COMPATIBILITY.md)，版本历史见 [CHANGELOG](CHANGELOG.md)。

## 界面资料与许可

现有插件管理器卡片仅展示安装识别信息，不代表导出面板：

![中文插件管理器卡片](assets/manager-zh.png)

后续建议补充脱敏的导出面板与中文 PDF 示例，并标明实际宿主版本。

独立维护的 DSH 插件。许可见 [MIT](LICENSE)，复用代码与依赖署名见[第三方声明](THIRD_PARTY_NOTICES.md)。
