# 副作用：LaunchedEffect、DisposableEffect 与 rememberCoroutineScope

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 进入页面时加载数据、离开时释放资源，应该写在哪里？
- 按钮点击后启动协程应该用什么？

## 讲解顺序

1. LaunchedEffect 与 key 控制重启。
2. DisposableEffect 的注册与清理。
3. rememberCoroutineScope、rememberUpdatedState 与 SideEffect。

## 动手练习

进入详情页时加载内容，离开时观察任务取消。

## 观察与验收

能解释副作用意外重复执行的原因。尚未实际完成。

## 备课参考

- [Android：Compose 中的附带效应](https://developer.android.com/develop/ui/compose/side-effects)
