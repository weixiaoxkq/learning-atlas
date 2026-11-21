# 持续集成与自动发布：CI 构建、测试与上传 Play

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 怎样做到每次提交都自动构建和测试？
- 上传 Play 测试轨道能否自动化？

## 讲解顺序

1. 在 GitHub Actions 等 CI 中运行 Gradle 构建、测试与 Lint。
2. CI 中签名密钥与服务账号的安全管理。
3. 用 Play Developer API 或 Gradle Play Publisher 自动上传。

## 动手练习

配置一条“推送 main 分支→构建→测试→上传内部测试轨道”的流程。

## 观察与验收

一次提交后，无需手动操作即可在测试轨道收到新版本。尚未实际完成。

## 备课参考

- [Google Play Developer API](https://developer.android.com/google/play/developer-api)
- [Gradle Play Publisher](https://github.com/Triple-T/gradle-play-publisher)
