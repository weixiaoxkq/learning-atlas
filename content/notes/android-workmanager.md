# WorkManager、前台服务与后台执行限制

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- App 关闭后仍需完成的工作应该怎样安排？
- 为什么 Android 对后台执行有这么多限制？

## 讲解顺序

1. 后台执行限制与任务类型的选择。
2. WorkManager 的一次性任务、周期任务与约束条件（CoroutineWorker）。
3. 前台服务的类型声明与使用条件。

## 动手练习

用 WorkManager 在有网络时同步笔记。

## 观察与验收

重启手机后，周期任务仍会执行。尚未实际完成。

## 备课参考

- [Android：WorkManager](https://developer.android.com/topic/libraries/architecture/workmanager)
- [Android：后台任务概览](https://developer.android.com/develop/background-work/background-tasks)
