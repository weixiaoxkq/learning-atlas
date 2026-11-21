# 持续集成与自动发布：Xcode Cloud 与 fastlane

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 怎样做到每次提交都自动构建和测试？
- 上传 TestFlight 能否自动化？

## 讲解顺序

1. Xcode Cloud 工作流：触发条件、测试与分发。
2. 用 fastlane 管理签名、截图与上传。
3. CI 环境中证书与密钥的安全管理。

## 动手练习

配置一条“推送 main 分支→构建→测试→上传 TestFlight”的流程。

## 观察与验收

一次提交后，无需手动操作即可在 TestFlight 收到新版本。尚未实际完成。

## 备课参考

- [Apple：Xcode Cloud](https://developer.apple.com/xcode-cloud/)
- [fastlane 文档](https://docs.fastlane.tools/)
