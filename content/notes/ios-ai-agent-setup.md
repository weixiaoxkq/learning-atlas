# AI 编码代理的工作环境：项目说明与命令行构建

> 学习中：已讲解，并在本机练手工程上实际跑过命令行构建；自测题未作答，尚未确认掌握。

## 本节要解决的问题

- AI 编码代理怎样了解一个 iOS 项目的结构和约定？
- 不打开 Xcode 界面时，怎样构建、测试和启动模拟器？

## 项目说明文件

AI 每开一个新会话都不记得你的项目。放在项目根目录的说明文件会在会话开始时被自动读取。

| 工具 | 读取的文件 |
|---|---|
| Claude Code | 项目根目录的 `CLAUDE.md`；在 Claude Code 里运行 `/init` 可以生成初稿；支持用 `@路径` 导入其他文件；没有 `CLAUDE.md` 时也能读取 `AGENTS.md` |
| Codex | 开始工作前读取 `AGENTS.md` |

推荐做法：正文写在 `AGENTS.md` 里，`CLAUDE.md` 里只写一行 `@AGENTS.md`，两个工具就共用同一份说明。

说明里应该写这些内容：

- **技术栈和最低系统版本**。新建工程时模板默认填最新系统，本机为 iOS 26.4；正式 App 可以考虑调低，覆盖更多用户。
- **目录约定**：App 代码、单元测试、UI 测试各放在哪里。
- **构建和测试命令**，以及完成标准（例如看到 `BUILD SUCCEEDED` 才算完成）。
- **禁止事项**：不手改 `project.pbxproj`、不改签名设置、不擅自添加第三方依赖、不提交 `xcuserdata/` 和 `build/`。

> 说明：AINotes 只是练手工程，用户不打算用 AI 或 Git 管理它，所以没有往里面写这些文件。本节内容留到以后开发正式 App 时使用。

## 命令行构建与测试

```bash
xcodebuild -list
xcodebuild -scheme AINotes -destination 'platform=iOS Simulator,name=iPhone 17 Pro' build
xcodebuild test -scheme AINotes -destination 'platform=iOS Simulator,name=iPhone 17 Pro'
```

- 当前目录里只有一个工程时，可以省略 `-project`。
- **本机实测**（Xcode 26.4.1）：构建约 5 秒，最后一行输出 `** BUILD SUCCEEDED **`。中间那条 `appintentsmetadataprocessor` 警告的意思是工程没用 App Intents，跳过了相关处理，可以忽略。
- **构建产物位置**：默认在 `~/Library/Developer/Xcode/DerivedData/AINotes-<随机串>/Build/Products/Debug-iphonesimulator/`。加上 `-derivedDataPath build` 参数，产物会固定放在项目里的 `build/` 目录下。

### 怎么判断成功还是失败

- **看最后一行**：`** BUILD SUCCEEDED **` 表示成功，`** BUILD FAILED **` 表示失败。也可以看命令的退出码。
- **失败时**：找以 `error:` 开头的行，格式是 `文件:行:列: error: 原因`。
- **日志很长时**：把完整日志存到文件，再筛出关键行交给 AI，能节省上下文。

```bash
xcodebuild … build > build.log 2>&1; grep -E "error:|warning:|BUILD" build.log
```

### 不打开 Xcode，在模拟器里运行

```bash
xcrun simctl boot "iPhone 17 Pro" && open -a Simulator
xcrun simctl install booted build/Build/Products/Debug-iphonesimulator/AINotes.app
xcrun simctl launch booted <Bundle ID>
```

## Xcode 自带的 AI 代理（Xcode 26.3 起）

- 2026 年 2 月发布的 Xcode 26.3 起，内置了 Anthropic 的 Claude Agent 和 OpenAI 的 Codex。
- Xcode 还通过 MCP（让 AI 调用外部工具的标准协议）开放自身能力：搜索文档、浏览文件结构、修改项目设置、截取 Preview 画面、构建和测试。
- **让外部 Claude Code 或 Codex 使用这些能力**：
  1. 在 Xcode › Settings › Intelligence 中，把 Allow External Agents to Use Xcode Tools 设为 Always 或 While Xcode is Open。
  2. 运行 `claude mcp add --transport stdio xcode -- xcrun mcpbridge`；Codex 用 `codex mcp add xcode -- xcrun mcpbridge`。
  3. 向 AI 提问之前，先在 Xcode 里打开对应的工程。
- **建议**：命令行构建是基础，任何 AI 工具都能用，结果也最明确；MCP 是在此之上的便利层。

## 小步协作节奏

![示意图：读项目说明、小步修改、命令行构建、看结果；成功则 git commit，失败则交回 AI 或 git restore](../../images/ios-ai-agent-setup/small-step-build-loop.svg)

*示意图：流程关系，不是界面截图。*

1. AI 先读项目说明。
2. 每次只做一个小改动。
3. 改完就在命令行构建。
4. 看结果：成功就 `git commit` 留一个存档点；失败就把 `error:` 那几行交回给 AI 修，或者用 `git restore .` 回到上一个存档点。注意 `git restore .` 会丢掉所有未提交的改动，执行前先看 `git diff`。

`.gitignore` 里通常要忽略 `.DS_Store`、`xcuserdata/`、`build/`；`xcshareddata/`（共享的 Scheme）要提交。

## 可选自测题（未作答）

1. 新开一个 AI 会话，它怎么知道你的 Bundle ID 和构建命令？
2. 在终端里怎么判断构建成功还是失败？失败时先看哪几行？
3. 让 AI 大改代码之前，Git 要先做什么？

## 关联

- 下一步：[让 AI 自我验证](topic:ios-ai-verify-loop)
- Android 对照：[Android 的 AI 代理环境](topic:android-ai-agent-setup)

## 记录范围

整理自 2026-11-21 的 Claude Code 学习会话。`xcodebuild` 用法查证自 Apple TN2339 并在本机实测；Claude Code 和 Codex 读取说明文件的规则查证自官方文档；Xcode 26.3 的代理与 MCP 功能查证自 Apple Newsroom 和 Xcode 文档。尚未确认掌握。

## 来源

- [Apple TN2339：用命令行构建 Xcode 项目](https://developer.apple.com/library/archive/technotes/tn2339/_index.html)
- [Apple Newsroom：Xcode 26.3 agentic coding](https://www.apple.com/newsroom/2026/02/xcode-26-point-3-unlocks-the-power-of-agentic-coding/)
- [Apple：Giving external agents access to Xcode](https://developer.apple.com/documentation/xcode/giving-external-agents-access-to-xcode)
- [Claude Code：Memory（CLAUDE.md）](https://code.claude.com/docs/en/memory)
- [Codex：AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Anthropic：Claude Code 最佳实践](https://www.anthropic.com/engineering/claude-code-best-practices)
