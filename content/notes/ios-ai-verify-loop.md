# 让 AI 自我验证：构建错误、测试与模拟器截图闭环

> 学习中：已讲解，并在本机练手工程上演示了测试运行和截图；用户自己运行测试时遇到了签名和模拟器问题。自测题未作答，尚未确认掌握。

## 本节要解决的问题

- 怎样让 AI 不只是「写完」，而是能证明修改有效？
- 编译错误、运行时错误和界面问题，分别靠什么发现？

## 核心原则

写完不等于做对。AI 每次修改后都要拿出证据，并主动列出**哪些还没验证**。

## 四层检查（像四层筛子）

![示意图：AI 的一次修改带着问题依次经过构建、单元测试、截图或 UI 测试、人工和真机四层筛子](../../images/ios-ai-verify-loop/verification-layers.svg)

*示意图：概念比喻，不是界面截图。*

| 层 | 工具 | 能拦住 | 拦不住 |
|---|---|---|---|
| 构建 | `xcodebuild build` | 拼写、类型、语法错误 | 逻辑是否正确 |
| 单元测试 | `xcodebuild test` | 逻辑算错 | 界面长什么样 |
| 截图 / UI 测试 | `simctl` 截图、XCUITest | 界面没显示、布局乱 | 手感和性能 |
| 人工 / 真机 | 自己看、在真机上试 | 手感、性能、硬件问题 | ——（最后兜底） |

### 第一层：构建错误

- 把 `error:` 开头的行原样交给 AI，里面有文件、行号和原因。
- 警告也要处理。例如修完 bug 后忘了删的 `let parts = …`，编译器会提示「这个值从未被使用」。

### 第二层：单元测试

**测试通过不等于功能正确，还要看测试检查了什么。** 本机演示时 `** TEST SUCCEEDED **`、1 个测试通过，但那个测试是模板自带的空函数 `example()`，什么都没检查。

真正有用的测试（Swift Testing）：

```swift
import Testing
@testable import AINotes

@MainActor
struct CharacterCountTests {
    @Test("中文没有空格也能数对")
    func chinese() { #expect(ContentView().characterCount("你好世界") == 4) }

    @Test("空格不算字")
    func ignoresSpaces() { #expect(ContentView().characterCount("今天 学习 Xcode") == 9) }

    @Test("空字符串是 0")
    func empty() { #expect(ContentView().characterCount("") == 0) }
}
```

- `@Test` 声明一个测试，`#expect` 写出期望成立的条件，`@testable import` 让测试能访问 App 内部的代码。
- 工程设置里 `SWIFT_DEFAULT_ACTOR_ISOLATION = MainActor`，代码默认都在主线程上，所以测试结构体也要标 `@MainActor`。详见后面的 [并发与 Swift 6](topic:ios-sendable-swift6)。
- 测试的价值在于回归检查：以后不管怎么改，这几个用例都能告诉你功能有没有被改坏。另外，把逻辑从界面里拆出来会更容易测试。
- 只跑单元测试、并把结果存成结果包：

```bash
xcodebuild test -scheme AINotes -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  -only-testing:AINotesTests -resultBundlePath result.xcresult
xcrun xcresulttool get test-results summary --path result.xcresult
```

`summary` 会输出 JSON，包含 `result`、`passedTests`、`failedTests`、`testFailures` 等字段，适合直接交给 AI 读。本机这次运行耗时约 1 分 30 秒，大部分时间花在启动模拟器上。

### 第三层：截图与 UI 测试

- **命令行截图**：`xcrun simctl io <设备> screenshot shot.png`。本机演示截到的是初始界面：输入框、「统计字数」按钮、「共 0 个字」都显示正常。这只能证明 App 能启动、布局正常，**不能证明统计逻辑是对的**。

  ![实际截图：AINotes 初始界面，有“写点什么”输入框、“统计字数”按钮和“共 0 个字”](../../images/ios-ai-verify-loop/ainotes-simulator-initial.png)

  *实际截图：iPhone 17 Pro 模拟器（iOS 26.4），2026-11-21 用 `xcrun simctl io … screenshot` 截取，已缩小。*
- **UI 测试（XCUITest）**：能模拟「输入 → 点击 → 检查结果」，还能用 `XCTAttachment(screenshot:)` 保存截图。模板里的 `AINotesUITestsLaunchTests` 就是启动后截一张图。下面这个示例没有实际运行过：

```swift
@MainActor
func testCountButton() throws {
    let app = XCUIApplication()
    app.launch()
    let field = app.textFields["写点什么"]
    field.tap()
    field.typeText("你好世界")
    app.buttons["统计字数"].tap()
    XCTAssertTrue(app.staticTexts["共 4 个字"].exists)
}
```

- 按显示文字查找控件不够稳定，正式项目建议给控件加 `.accessibilityIdentifier(...)`，测试按标识查找。
- AI 本身能读懂截图。Xcode 26.3 起，AI 代理还能通过 MCP 截取 Preview 画面。

### 第四层：只能靠人

真机手感、动画是否流畅、长文本时的性能、深色模式、硬件功能，这些需要你自己看、自己试。

## 验收报告模板

```text
✅ 构建：BUILD SUCCEEDED（0 error，1 个无害警告）
✅ 测试：AINotesTests 3/3 通过
✅ 截图：iPhone 17 Pro 模拟器，界面显示正常
⚠️ 未验证：真机运行、长文本性能、深色模式
```

本节的验收标准：AI 每次修改后，都能说清楚通过了哪几层检查、还有哪些没有验证。

## 运行测试时遇到的问题

- **Signing for "AINotesTests" requires a development team**：签名是按 Target 分别设置的，原来只有 App Target 选了 Team。在真机上测试时，每个要装上设备的 Target 都必须签名；模拟器不需要。
  - 推荐做法：把运行目标换成模拟器。
  - 如果一定要在真机上测试，就给 AINotesTests 和 AINotesUITests 都选上 Team。注意免费账号的限制：每个测试 Target 都有自己的 Bundle ID，会占用 App ID 名额；UI 测试还会额外装一个 AINotesUITests-Runner App，占用每台设备最多 3 个 App 的名额。
- **Failed to install or launch the test runner（Invalid device state / server died）**：模拟器的后台服务出了问题，不是代码的问题。按顺序尝试：
  1. 退出 Simulator 和 Xcode，执行 `xcrun simctl shutdown all`；
  2. 执行 `killall -9 com.apple.CoreSimulator.CoreSimulatorService`（服务会自动重启）；
  3. 对模拟器执行 Erase All Content and Settings，或重启 Mac。
- **在哪里看测试输出**：
  - 测试函数旁边的菱形：绿色表示通过，红色表示失败；
  - 测试导航器（⌘6）；
  - 报告导航器（⌘9）里那一次 Test 记录的报告和日志；
  - 控制台（⇧⌘C）里的 `print` 输出；
  - Xcode 每次测试的结果包保存在 `DerivedData/AINotes-<随机串>/Logs/Test/*.xcresult`，也可以用 `xcresulttool` 读取。
- **省时间**：⌘U 会连同较慢的 UI 测试一起运行。点 AINotesTests 或单个测试旁边的菱形，可以只跑单元测试。

## 动手练习（可选，未完成）

1. 把 `CharacterCountTests` 粘贴到 `AINotesTests.swift`，按 ⌘U 运行。
2. 把 `characterCount` 改回按空格切分的错误版本，看测试变红。

## 可选自测题（未作答）

1. 显示「1 个测试通过」，能说明字数统计是对的吗？
2. 编译错误、逻辑错误和界面问题，分别靠什么发现？
3. AI 说「已完成」时，应该要求它给出哪些证据？

## 关联

- 后续深入：[Swift Testing](topic:ios-swift-testing)、[UI 测试与 Preview](topic:ios-ui-testing-previews)
- 测试思想：[回归测试与失败分析](topic:item-2af8d5bf)、[验收标准与 Evals](topic:evals-9878ab5d)
- Android 对照：[Android 的 AI 验证闭环](topic:android-ai-verify-loop)

## 记录范围

整理自 2026-11-21 的 Claude Code 学习会话。测试、结果包和截图结果来自本机 Xcode 26.4.1 在练手工程上的只读演示（只写入 DerivedData 和模拟器，没有改动工程文件）。用户自己运行测试时遇到的问题，根据本机测试结果包分析得出。尚未确认掌握。

## 来源

- [Apple：Swift Testing](https://developer.apple.com/documentation/testing)
- [Apple：XCUIAutomation](https://developer.apple.com/documentation/xcuiautomation)
- [Apple TN2339：用命令行构建 Xcode 项目](https://developer.apple.com/library/archive/technotes/tn2339/_index.html)
