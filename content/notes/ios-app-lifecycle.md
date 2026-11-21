# App、Scene 与应用生命周期

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- App 启动、进入后台、回到前台时，代码怎样响应？
- 为什么需要在进入后台时保存数据？

## 讲解顺序

1. @main App 与 WindowGroup 场景。
2. 用 scenePhase 监听前台、非活跃与后台状态。
3. 需要 UIApplicationDelegateAdaptor 的场景，例如注册推送。

## 动手练习

进入后台时自动保存未完成的笔记草稿。

## 观察与验收

能列出 App 状态切换时应做的保存与清理工作。尚未实际完成。

## 备课参考

- [Apple：App 协议](https://developer.apple.com/documentation/swiftui/app)
