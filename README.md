# 对话导出（dsh-ai-exporter）

## 0.1.3 rc.5 兼容维护（2026-10-30）

宿主范围：`0.2.1-rc.2 || 0.2.1-rc.3 || 0.2.1-rc.5`。仅更新经接口核对的版本声明，不改变功能、UI 或数据格式。当前验收使用隔离 Windows rc.5 Host 与浏览器；正式安装留待统一验收。以下旧版章节保留为历史记录。

## 0.1.2 兼容性维护（2026-10-25）

宿主范围：`0.2.1-rc.2 || 0.2.1-rc.3`。本次以 Windows Desktop 0.2.1-rc.3 / Electron 44.7.0 / Node 24.21.0 实测。修复加载前版本拒绝，不新增功能。

隔离真实宿主、三插件与 Packer 0.4.2 共存、启停、设置与重启回归已验证；用户完成真实 Desktop GUI 验收。70 项自动回归、原生保存、中文可搜索 PDF 与第 2 轮筛选文件独立核对通过。保留原 RC2 支持及自动测试；本轮完整 RC2 Desktop 复测为 NOT TESTED。具体边界见 [兼容性记录](docs/COMPATIBILITY.md)。

[English](README.en.md)

将当前或历史 DSH 会话导出为 TXT、Markdown 和可搜索 PDF。

独立维护的 DSH 插件。第三方代码和宿主参考材料保留各自的许可和署名。

## 兼容性与状态

版本 **0.1.3**。当前目标：Windows、DSH Desktop **0.2.1-rc.5**；保留此前 RC2 支持和自动回归，本轮 RC2 Desktop 全量复测为 NOT TESTED。其他平台未测试。

保存位置由 Windows 原生对话框明确选择；默认从当前用户主目录开始，保留已保存的最近目录。PDF 使用系统临时目录或 DSH_EXPORTER_TEMP 指定目录，不再限制盘符。未知事件、未结束回复和不支持内容默认阻止导出；仅在明确允许部分导出后继续，并保留诊断报告。附件仅保留说明，不读取或嵌入附件；数学与 Mermaid 保留原文，不宣称无损转换。

## 安装与卸载

在 Releases 下载与本版本对应的预构建 tgz，先核对 SHA-256，再通过 DSH 官方插件界面选择该包，或执行：

```text
dsh plugin --profile <你的Profile> add <安装包完整路径>
```

重启 DSH 后，在插件管理器核对名称、ID 和版本。更新前备份自己的配置；不要手动修改 node_modules 或 app.asar。卸载使用插件管理器的卸载入口，或 `dsh plugin --profile <你的Profile> remove dsh-ai-exporter`。卸载不保证删除已导出的文件、历史或保留偏好。

## 使用

在会话顶部选择“导出对话”，选择会话范围、轮次、格式及显示信息。保存目录可以输入、粘贴或通过“浏览”选择；手输目录仍须在 Windows 原生窗口确认，目录无效时不会静默改用其他位置。浏览选定的授权只使用一次，会话、格式或路径变化后需要重新确认。单一格式也保留“另存为文件”。历史会话可从导出面板加载，详细诊断默认折叠。

## 构建、测试与排错

安装 Node.js 22+，在本仓库目录配置工具缓存和 TEMP 后运行 `pnpm install --frozen-lockfile --ignore-scripts`、`npm run check`。仅 exporter 的原生 WinForms 辅助程序构建要求 Windows 既有 .NET Framework C# 编译器。

预构建 lib 已随源码保留，因此 GitHub 源码安装不需要运行安装期构建脚本。安装失败先检查 DSH 版本、Profile、包校验值和模块加载错误。不要通过关闭安全策略或覆盖宿主文件排错。完整范围见 [兼容与验证](docs/COMPATIBILITY.md)。

## 许可

见 [LICENSE](LICENSE)；第三方声明见对应许可文件。

## 插件管理器

![中文](assets/manager-zh.png)

![English](assets/manager-en.png)
