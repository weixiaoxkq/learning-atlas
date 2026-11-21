# StateFlow、SharedFlow 与生命周期感知收集

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 界面状态为什么适合用 StateFlow？
- 一次性事件（如提示消息）应该怎样传递？

## 讲解顺序

1. StateFlow 与 SharedFlow 的区别，以及 stateIn、shareIn。
2. 在 Compose 中用 collectAsStateWithLifecycle 收集。
3. 一次性事件的处理方式与常见误区。

## 动手练习

把笔记列表状态改为 StateFlow，并在界面中收集。

## 观察与验收

App 进入后台时停止收集，回到前台后恢复。尚未实际完成。

## 备课参考

- [Android：StateFlow 与 SharedFlow](https://developer.android.com/kotlin/flow/stateflow-and-sharedflow)
