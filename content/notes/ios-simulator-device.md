# 模拟器、真机运行与调试基础

> 学习中：已讲解，并追问了真机签名提示、LLDB 命令和控制台位置；自测题未作答，尚未确认掌握。

## 本节要解决的问题

- 模拟器和真机运行有哪些差别？
- 程序出错时怎样用断点和控制台定位问题？

## 模拟器与真机

Apple 的原话大意：模拟器运行在 Mac 上，不复现真机的性能和功能，部分硬件功能不可用。代码要用框架提供的可用性 API 处理功能缺失的情况；要确认最终行为，必须在真机上运行。

| | 模拟器 | 真机 |
|---|---|---|
| 速度 | 用 Mac 的处理器，通常比手机快 | 真实性能 |
| 硬件 | 部分不可用（例如摄像头拍照） | 全部可用 |
| 适合做什么 | 日常改界面、改逻辑 | 上线前验证性能、硬件和手感 |
| 需要什么 | 什么都不用 | Apple ID 和签名 |

⚠️ 模拟器上很流畅，不代表真机上也流畅。

可以用命令行控制模拟器，方便 AI 自动化：

```bash
xcrun simctl list devices                          # 列出模拟器
xcrun simctl io booted screenshot ~/Desktop/shot.png  # 截图
xcrun simctl ui booted appearance dark             # 切到深色模式
```

## 真机运行（免费 Apple ID 即可）

1. 在 Xcode › Settings › **Apple Accounts**（旧版叫 Accounts）登录 Apple ID。免费账号会显示为 Personal Team。
2. 在 Target 的 Signing & Capabilities 页勾选 **Automatically manage signing**，选择 Team。Bundle ID 必须全球唯一；如果出现 Register 按钮就点一下。
3. 用数据线连接 iPhone，在手机上点「信任此电脑」。
4. 在 iPhone 上打开 设置 › 隐私与安全性 › 安全性 › **开发者模式** → 按提示重启 → 重启后确认「打开」并输入锁屏密码。这个开关要在开始和 Xcode 配对之后才会出现。
5. 在运行目标里选这台 iPhone，按 ⌘R。第一次运行时，Xcode 会注册这台设备，并创建包含它的描述文件。
6. 如果手机提示「不受信任的开发者」，到 设置 › 通用 › VPN与设备管理 里信任你的开发者账号。

新版 Xcode 的设备管理窗口叫 **Device Hub**（运行目标菜单里的 Manage Devices…），旧版叫 Devices and Simulators。

**免费账号的限制**（Apple 会员对比页）：
- 描述文件 7 天过期，过期后要用 Xcode 重新安装。
- 最多 3 台设备，每台设备最多装 3 个 App，App ID 最多 10 个。
- TestFlight 和上架 App Store 需要付费会员。

## 真机运行时遇到的两个提示

- **Communication with Apple failed / Your team has no devices… / No profiles for '…' were found**
  - 不是网络问题，也不是代码错误。自动签名要生成开发描述文件，而描述文件需要三样东西：证书（谁签的）、App ID（哪个 App）、设备（装到哪台）。团队里还没有任何注册设备，所以生成不了。
  - 只用模拟器时可以忽略。要装到真机：连上 iPhone，在运行目标里选它，再点 Try Again 或直接按 ⌘R。状态显示 Xcode Managed Profile 就说明好了。

  ![示意图：证书和 App ID 已有，设备缺失，三样齐了才能生成描述文件](../../images/ios-simulator-device/profile-missing-device.svg)

  *示意图：概念关系，不是界面截图。*
  - 提示里说的「到 Certificates, Identifiers & Profiles 手动添加设备」需要付费会员；免费账号只能靠连接真机来注册设备。
- **钥匙串弹窗：codesign 想访问钥匙串里的 Apple Development 密钥**
  - codesign 是 Xcode 构建时调用的签名工具，签名要用到存在「登录」钥匙串里的私钥。
  - 输入 Mac 登录密码（不是 Apple ID 密码），然后点「始终允许」，以后构建就不会反复弹出。点「拒绝」会导致签名失败、构建失败。
  - 背后的原理见 [签名与证书](topic:ios-signing)。

## 断点调试

用一个故意写错的例子来练习：

```swift
func characterCount(_ text: String) -> Int {
    let parts = text.split(separator: " ")
    return parts.count   // 中文没有空格，「你好世界」会返回 1
}
```

![示意图：断点停在 return 行，调试栏有继续和单步按钮，左下变量视图，右下 LLDB 控制台](../../images/ios-simulator-device/breakpoint-debug-area.svg)

*示意图：按 Xcode 26.4 界面简化绘制，不是真实截图；编号 1–4 依次是断点、单步控制、变量视图、LLDB 控制台。*

1. **设断点**：在 `return` 那一行的行号上点一下，出现蓝色标签。运行后程序会停在这一行，整行绿色高亮。
2. **调试区**：暂停时通常自动出现，没有出现就按 ⇧⌘Y（View › Debug Area › Show Debug Area）。左半是变量视图，右半是控制台。
3. **单步执行**：继续 ⌃⌘Y，跳过一行（Step Over）F6，进入函数（Step Into）F7，跳出函数（Step Out）F8。
4. **LLDB 控制台**：只能在程序暂停时使用。按 ⇧⌘C（Activate Console）让光标进入控制台，在 `(lldb)` 后面输入命令并回车。
   - 不是在系统终端里输入，也不是写在代码编辑器里。
   - 手动点「暂停」通常会停在系统代码里，看不到自己函数的变量，所以要用断点。

   ![示意图：Xcode 窗口下方调试区右半是控制台，在最下面的 (lldb) 后输入命令](../../images/ios-simulator-device/lldb-console-location.svg)

   *示意图：按 Xcode 26.4 界面简化绘制，不是真实截图。*
5. **找到原因并修复**：`po parts` 显示只有 1 个元素，`po text.count` 得到 4，说明问题出在按空格切分上。改成：

```swift
return text.filter { !$0.isWhitespace }.count
```

### LLDB 常用命令

| 命令 | 全称 | 作用 | 注意 |
|---|---|---|---|
| `v 变量` | frame variable | 直接从内存读取当前作用域的变量 | 不执行代码，速度快，没有副作用；不能调用方法或读计算属性（`v text.count` 会报错）。变量视图就是它的图形版 |
| `po 表达式` | expression --object-description | 把输入当成 Swift 代码编译并执行，再打印对象描述 | 可以调用方法、读计算属性、写闭包；较慢，偶尔编译失败；如果写了修改数据的代码，会真的改变程序状态 |
| `p 表达式` | dwim-print（Xcode 15 起） | 能直接读就按 `v` 的方式读，否则执行表达式 | 会显示类型和值 |
| `e 赋值` | expression | 在暂停时修改变量，例如 `e count = 100` | 继续运行就能看到效果 |

推荐顺序：先用 `v`，读不到再用 `po`。修复方案可以先在调试器里试算，例如 `po text.filter { !$0.isWhitespace }.count`，确认结果对了再改代码。

### 其他技巧

- **条件断点**：右键断点 › Edit Breakpoint，可以设置只在某个条件成立时才停下。
- **打日志不改代码**：在断点上加 Log Message 动作，并勾选自动继续。
- `print()` 和 `os.Logger` 的输出都显示在控制台里。
- **和 AI 协作**：把断点处的变量值和控制台输出发给 AI，比只说「结果不对」有效得多。

## 动手练习

在 ContentView 里加上上面的函数和一个按钮，用断点找到并修复这个 bug。可选：把 App 装到真机上。

## 可选自测题（未作答）

1. 模拟器上流畅，能说明真机上也流畅吗？
2. `v` 和 `po` 有什么区别？
3. 用免费账号装的 App，一周后打不开了，为什么？

## Android 对照

参见 [模拟器与 adb](topic:android-emulator-adb) 和 [调试与性能分析](topic:android-debug-profiler)。

## 记录范围

整理自 2026-11-21 的 Claude Code 学习会话。真机运行步骤、开发者模式、模拟器与真机的差别和免费账号限制，查证自 Apple 文档与会员对比页。签名提示来自用户真机运行时的实际截图。尚未确认掌握。

## 来源

- [Apple：Running your app on simulated or physical devices](https://developer.apple.com/documentation/xcode/running-your-app-on-simulated-or-physical-devices)
- [Apple：Enabling Developer Mode on a device](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device)
- [Apple：Compare memberships](https://developer.apple.com/support/compare-memberships/)
