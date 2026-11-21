# 开发者账号、证书、Bundle ID 与描述文件

> 学习中：已讲解；自测题和查看描述文件的练习都还没做，尚未确认掌握。

## 本节要解决的问题

- App 为什么必须签名？证书、App ID 与描述文件是什么关系？
- 免费 Apple 账号和付费开发者计划分别能做什么？

## 为什么要签名：信任链

iPhone 只运行签过名的代码。签名同时保证两件事：**是谁做的**，以及**签名之后没有被改过**。

1. Apple 是证书颁发方，iPhone 内置信任 Apple。
2. 你的 Mac 上有三样东西：
   - **私钥**：只存在这台 Mac 上，相当于盖章用的印章。
   - **证书**：公开的身份证明，由 Apple 担保。
   - **描述文件**：一张许可证，写明哪个 App 可以装到哪些设备上。
3. codesign 用私钥给 App 签名，并把描述文件打包进 App。
4. iPhone 在安装和启动时逐项检查：
   - 签名有效，内容没被改过；
   - 证书是 Apple 签发的；
   - 描述文件里包含这台设备；
   - App 申请的权限没有超出描述文件允许的范围。

![示意图：Apple 签发证书；Mac 上的私钥、证书和描述文件经 codesign 生成签好名的 App；iPhone 安装时检查四项](../../images/ios-signing/signing-trust-chain.svg)

*示意图：概念关系，不是界面截图。*

## 四个核心概念

| 概念 | 一句话 | 要点 |
|---|---|---|
| Team | 账号身份 | 免费的 Personal Team，或付费的 Apple Developer Program（99 美元/年）。Team ID 是团队的唯一标识 |
| 证书 + 私钥 | 公开的身份证明 + 本机的印章 | **只有证书没有私钥，就无法签名** |
| App ID | 在 Apple 登记的 App 身份 | 对应 Bundle ID |
| 描述文件 | 把上面三者拼起来的许可证 | 内容包括 App ID、证书、设备，以及允许使用的权限 |

### 证书

- **Apple Development**：属于个人，用于在设备上运行和调试。
- **Apple Distribution**：属于团队，用于分发到指定设备做测试，或者提交到 App Store Connect。每个团队每种分发证书只能有一张，只有 Account Holder 或 Admin 能创建。
- **换一台 Mac**：在 Xcode Settings 的账号页里打开 Manage Certificates，把证书导出成带密码的 `.p12` 文件，到新 Mac 上双击导入。Apple 建议文件和密码分开传送。由云端管理的证书会自动在团队内共享。
- **钥匙串弹窗**：构建时 codesign 请求使用私钥，输入 Mac 登录密码后点「始终允许」即可。

### App ID

- **显式 App ID**：完整的 Bundle ID，对应一个 App，一般都用这种。
- **通配符 App ID**：以 `*` 结尾，对应一组 App。需要显式 App ID 的能力不能用在通配符 App ID 上。
- App ID 上开启的能力相当于一份白名单：没开启的能力，这个 App 就不能用。

### 描述文件类型

| 类型 | 用途 | 含设备列表 |
|---|---|---|
| Development | 开发调试 | ✅ |
| Ad Hoc | 给指定设备装测试版 | ✅ |
| App Store | 上传到 App Store Connect（TestFlight 和上架） | ❌ |
| In-House | 企业内部分发，需要企业计划（299 美元/年） | ❌ |

付费账号每个会员年度内，每类设备最多注册 100 台。禁用设备不会释放名额，要到下一个会员年度才重置。

## Capability 与 Entitlements

- **Capability（能力）**：在 Signing & Capabilities 页点 + Capability 添加，例如推送通知、iCloud、Sign in with Apple、App Groups。添加后 Xcode 会编辑 entitlements 文件和 Info.plist、加入相关框架，并配置签名需要的资源。
- **Entitlements（权限声明）**：写进签名里的「我要使用哪些能力」，保存在 `.entitlements` 文件中。
- App 申请的权限必须在描述文件允许的范围内。

## 免费账号与付费账号

| | 免费（Personal Team） | 付费（99 美元/年） |
|---|---|---|
| 装到自己的设备 | ✅，7 天后过期需要重装 | ✅，有效期一年 |
| 设备与 App 数量 | 3 台设备，每台最多 3 个 App，10 个 App ID | 每类设备 100 台 |
| 推送通知等部分能力 | ❌ | ✅ |
| TestFlight 和 App Store | ❌ | ✅（TestFlight 外部测试员最多 1 万人） |

学习阶段用免费账号就够了；需要推送、给别人测试或上架时再付费。

## 常见签名报错与排查

| 报错关键词 | 含义 | 处理方法 |
|---|---|---|
| has no devices / No profiles … were found | 团队里没有注册设备，生成不了描述文件 | 连接 iPhone 后点 Try Again |
| failed to register bundle identifier | Bundle ID 已被别人占用 | 换一个 Bundle ID |
| Personal development teams … do not support … | 免费账号不支持这项能力 | 删掉这个 Capability，或升级付费账号 |
| 手机上提示「不受信任的开发者」 | 免费账号签名的 App 需要手动信任 | 设置 › 通用 › VPN与设备管理 |
| profile doesn't include the currently selected device | 新设备不在描述文件里 | 连接这台设备，让 Xcode 重新生成描述文件 |
| No signing certificate … / missing private key | 这台 Mac 上没有对应的私钥 | 导入 `.p12`，或让 Xcode 新建证书 |
| Signing for "AINotesTests" requires a development team | 签名是按 Target 设置的，测试 Target 没选 Team | 改用模拟器测试，或给该 Target 也选上 Team |
| App 一周后打不开 | 免费描述文件过期 | 用 Xcode 重新运行一次 |

**排查思路**：先抓住报错里的关键词，再对照信任链的四项检查，判断问题出在证书、App ID、设备还是权限。

## 与 AI 协作

- 签名交给 Xcode 自动管理，不要让 AI 手改 `DEVELOPMENT_TEAM` 或 `CODE_SIGN_*` 这类设置。
- `.p12` 文件、私钥和证书密码，绝不发给 AI，也不要提交到 Git。
- 用命令行给真机构建时，加上 `-allowProvisioningUpdates`，让 `xcodebuild` 自动处理签名。

## 动手练习（未完成）

在 Signing & Capabilities 页，点 Provisioning Profile 旁边的 ⓘ，查看描述文件用的是哪张证书、包含几台设备、有哪些权限、什么时候过期。

## 可选自测题（未作答）

1. 换了一台新 Mac，Xcode 提示找不到签名证书，为什么？
2. 免费账号添加推送通知能力时报错，为什么？
3. 描述文件为什么要包含设备列表？App Store 用的描述文件需要设备列表吗？

## 关联

- 实际遇到的签名提示：[模拟器、真机运行与调试基础](topic:ios-simulator-device)
- 后续的分发流程：[TestFlight 与 App Store Connect](topic:ios-testflight-asc)
- Android 对照：[发布构建与签名](topic:android-release-build)

## 记录范围

整理自 2026-11-21 的 Claude Code 学习会话。概念和限制查证自 Apple Account Help（证书概述、注册 App ID、创建开发描述文件、设备概述）、Xcode 文档（共享团队签名证书、添加 Capability）以及 Apple Developer Program 页面。尚未确认掌握。

## 来源

- [Apple：开发者账号帮助](https://developer.apple.com/help/account/)
- [Apple：Certificates overview](https://developer.apple.com/help/account/certificates/certificates-overview/)
- [Apple：Register an App ID](https://developer.apple.com/help/account/identifiers/register-an-app-id/)
- [Apple：Create a development provisioning profile](https://developer.apple.com/help/account/provisioning-profiles/create-a-development-provisioning-profile)
- [Apple：Devices overview](https://developer.apple.com/help/account/devices/devices-overview)
- [Apple：Sharing your team's signing certificates](https://developer.apple.com/documentation/xcode/sharing-your-teams-signing-certificates)
- [Apple：Adding capabilities to your app](https://developer.apple.com/documentation/xcode/adding-capabilities-to-your-app)
- [Apple Developer Program](https://developer.apple.com/programs/)
