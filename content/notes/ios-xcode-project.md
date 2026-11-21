# Xcode 工程结构：Project、Target、Scheme 与构建配置

> 学习中：已讲解并做了自测（3 题答对 2 题，第 2 题讲解后补上），尚未确认掌握。

## 本节要解决的问题

- 一个 iOS App 工程由哪些部分组成，各自负责什么？
- Debug 与 Release 构建有什么不同，Bundle ID 和版本号写在哪里？

## 核心关系

| 概念 | 一句话 | 包含什么 |
|---|---|---|
| Project（`.xcodeproj`） | 容器 | 文件、多个 Target、项目级 Build Settings、Build Configuration（默认 Debug / Release） |
| Target | **造什么**：一个产物的完整配方 | 属于它的源文件与资源、自己的 Build Settings、Build Phases、依赖、签名；产出 `.app`、小组件 `.appex`、测试 `.xctest` |
| Scheme | **怎么跑**：遥控器上每个按钮的设定 | Run / Test / Profile / Analyze / Archive 各自构建哪些 Target、用哪个配置、启动参数与环境变量、跑哪些测试 |
| Build Configuration | 连接两者的一套参数 | Debug（不优化、带 `DEBUG` 条件）、Release（优化） |

![示意图：左边三个 Target 是“造什么”，右边 Scheme 的 Run、Archive、Test 动作是“怎么跑”](../../images/ios-xcode-project/target-vs-scheme.svg)

*示意图：概念关系，不是界面截图。*

- Scheme 本身不含代码，也不含编译设置。在 Product › Scheme › Edit Scheme（⌘<）里查看。新模板通常 Run / Test / Analyze 用 Debug，Profile / Archive 用 Release。共享 Scheme 存在 `xcshareddata`，可以提交到 Git。
- 一个文件属于哪个 Target，看右侧 File inspector 的 **Target Membership**。
- 比喻：工程是工厂，Target 是生产线，Configuration 是生产标准，Scheme 是遥控器。加 Target 等于加一条生产线（例如小组件）；改 Scheme 只是换遥控器或调整按钮设定。
- 工具栏中间的「AINotes › iPhone 17 Pro」：左半是 **Scheme**，右半是**运行目标**（destination）。运行目标既不属于 Scheme，也不属于 Target。命令行用的也是这两个参数：`xcodebuild -scheme AINotes -destination '…' build`。

## 想做什么，改哪里

| 想做的事 | 改哪里 |
|---|---|
| 新文件要被 App 编译 | Target：File inspector › Target Membership |
| 改 Bundle ID、图标、版本号 | Target 的 General 页 |
| 只改 Debug 下的某个设置 | Target 的 Build Settings，展开后改 Debug 行 |
| 加小组件、App 扩展 | 新增 Target |
| 运行时加启动参数或环境变量 | Scheme：Edit Scheme › Run › Arguments |
| 用 Release 配置运行测性能 | Scheme：Edit Scheme › Run › Info › Build Configuration |
| 换模拟器 | 运行目标，两者都不是 |

## Build Settings

- **位置**：在导航器里点蓝色工程图标 → 在 Targets 下选 AINotes → 打开 Build Settings 标签 → 选 **All** 并在搜索框输入设置名。只选 Basic 时很多设置会被隐藏。
- **只改 Debug**：点设置名左侧的三角展开，出现 Debug 和 Release 两行；双击 Debug 行的值修改，Release 不受影响。

![示意图：选中工程、Target、Build Settings、All 和搜索后展开设置，双击 Debug 行修改](../../images/ios-xcode-project/build-settings-debug-only.svg)

*示意图：按 Xcode 26.4 界面简化绘制，不是真实截图；编号对应操作顺序。*
- **例子**：`Active Compilation Conditions` 在 Debug 下是 `DEBUG`，在 Release 下为空。`#if DEBUG` 能生效靠的就是它：

```swift
#if DEBUG
let baseURL = "https://test.example.com"
#else
let baseURL = "https://api.example.com"
#endif
```

- **优先级**（Apple 文档）：`xcodebuild` 命令行参数 > Target > 映射到 Target 的 xcconfig > Project > 映射到 Project 的 xcconfig > 系统默认。
  - 改不生效时，切到 **Levels** 视图，看最终值来自哪一层。
  - 一般在 Target 层修改。在 Project 层修改会被所有 Target 继承，除非某个 Target 自己覆盖。
- Run 正常，不代表 Archive 时 Release 配置下的行为也一样。

## 版本号、构建号与 Bundle ID

- **版本号** `MARKETING_VERSION`：用户看到的 1.0、1.1，发新版给用户时才改。
- **构建号** `CURRENT_PROJECT_VERSION`：同一版本号下，每次上传都必须不同并且递增。
- **Bundle ID** `PRODUCT_BUNDLE_IDENTIFIER`：等于 Organization Identifier + `.` + Product Name。
  - 用反向域名：有域名 `example.com` 就填 `com.example`；没有域名可以用 `io.github.<GitHub 用户名>`。
  - Apple 规定只能用字母、数字、连字符和点，不区分大小写。
  - **上传到 App Store Connect 后就不能再改**。
  - 建议全小写，不用中文和下划线，以后所有 App 共用同一个前缀。
- 新模板默认开启 `GENERATE_INFOPLIST_FILE`，没有单独的 Info.plist 文件，在 Target 的 General / Info 页修改。

## 新建工程与第一次运行

- **新建对话框**：
  - Product Name 用英文（AINotes），显示名称可以设成「AI 随手记」。
  - Team 可以先不选，模拟器照样能运行。
  - Testing System 选带 Swift Testing 的选项。
  - Storage 保持 None，Host in CloudKit 不勾。
- **生成的文件**：`AINotesApp.swift`（`@main` 程序入口）、`ContentView.swift`、`Assets.xcassets`。
- **运行步骤**：
  1. 点工具栏中间的设备名（或菜单 Product › Destination），在 iOS Simulators 下选一个 iPhone。**Any iOS Device (arm64)** 只能构建，不能运行。
  2. 点 ▶ 或按 ⌘R 运行；点 ■ 或按 ⌘. 停止。
  3. 第一次启动模拟器较慢，看到地球图标和 Hello, world! 就成功了。

![示意图：点工具栏设备名打开列表，在 iOS Simulators 下选 iPhone，点运行按钮，模拟器显示 Hello, world!](../../images/ios-xcode-project/run-on-simulator.svg)

*示意图：按 Xcode 26.4 界面简化绘制，不是真实截图；不同版本的 Xcode 工具栏布局略有差别。*
- **列表里没有模拟器**：在 Xcode › Settings › Components 下载 iOS 平台，或者在设备管理窗口里添加。新版设备管理窗口叫 Device Hub，旧版叫 Devices and Simulators。

## 与 AI 协作的约定

- 不要手改 `project.pbxproj`。
- Xcode 16 起支持可构建文件夹（buildable folder）：项目文件只记录文件夹路径，放进文件夹的文件自动属于工程。旧的 group 可以用 Convert to Folder 转换。
- `xcodebuild -list` 可以列出 Target、配置和 Scheme。在本机 AINotes 工程上实测的结果：Targets 为 AINotes、AINotesTests、AINotesUITests，配置为 Debug、Release，Scheme 为 AINotes。

## Android 对照

| iOS | Android |
|---|---|
| Target | module 及其产物 |
| Bundle ID | applicationId |
| Build Configuration | buildTypes |
| 版本号 / 构建号 | versionName / versionCode |
| Scheme | Run Configuration + Build Variant |

参见 [Gradle 构建](topic:android-gradle)。

## 自测记录

1. 给 App 加桌面小组件，应该新增 Target 还是 Scheme？——答 Target，✅ 正确。小组件是 Widget Extension，通过 File › New › Target 添加，Xcode 会顺带询问是否激活为它新建的 Scheme。
2. 只改 Debug 配置下的某个设置怎么操作？——没答出来，反问 Build Settings 在哪里，讲解后补上。
3. 版本号和构建号，哪个每次上传都必须变？——答构建号，✅ 正确。

## 记录范围

整理自 2026-11-21 的 Claude Code 学习会话。Build Settings 优先级、Bundle ID 规则和可构建文件夹查证自 Apple 文档；`xcodebuild -list` 的结果来自本机 Xcode 26.4.1 实测。尚未确认掌握。

## 来源

- [Apple：Xcode 文档](https://developer.apple.com/documentation/xcode)
- [Apple：Build settings reference](https://developer.apple.com/documentation/xcode/build-settings-reference)
- [Apple：CFBundleIdentifier](https://developer.apple.com/documentation/bundleresources/information-property-list/cfbundleidentifier)
