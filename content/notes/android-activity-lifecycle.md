# Activity 生命周期、配置变更与进程终止

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 旋转屏幕为什么可能让数据丢失？
- 系统杀死后台进程后，怎样恢复用户状态？

## 讲解顺序

1. 从 onCreate 到 onDestroy 的生命周期与 Lifecycle 组件。
2. 配置变更（旋转、深色模式、语言）导致 Activity 重建。
3. 进程终止后的状态保存：SavedStateHandle 与 rememberSaveable。

## 动手练习

输入笔记时旋转屏幕、模拟进程终止，确认内容不丢失。

## 观察与验收

能用开发者选项或 adb 模拟进程被回收，并验证状态恢复。尚未实际完成。

## 备课参考

- [Android：Activity 生命周期](https://developer.android.com/guide/components/activities/activity-lifecycle)
