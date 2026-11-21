# 启动与包体优化：Baseline Profile 与 R8

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 怎样让 App 启动更快、滑动更流畅？
- R8 做了什么，为什么 release 包会出现 debug 下没有的问题？

## 讲解顺序

1. 用 Baseline Profile 与 Macrobenchmark 衡量并改善启动。
2. R8 的代码缩减、混淆与优化。
3. keep 规则、映射文件与 release 构建问题排查。

## 动手练习

为贯穿案例生成 Baseline Profile，并测量启动时间。

## 观察与验收

能用 release 构建复现并修复一个混淆导致的问题。尚未实际完成。

## 备课参考

- [Android：Baseline Profile](https://developer.android.com/topic/performance/baselineprofiles/overview)
- [Android：缩减、混淆与优化](https://developer.android.com/build/shrink-code)
