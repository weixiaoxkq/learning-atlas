# ViewModel、UI State 与单向数据流

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- ViewModel 为什么能在屏幕旋转后保留数据？
- 单向数据流怎样让界面状态可预测？

## 讲解顺序

1. ViewModel 的生命周期与 viewModelScope。
2. 用不可变 UiState 描述页面，事件通过函数传入。
3. 用 SavedStateHandle 保存进程终止后需要恢复的状态。

## 动手练习

为笔记列表页实现 ViewModel 与 UiState。

## 观察与验收

旋转屏幕和进程恢复后，页面状态都正确。尚未实际完成。

## 备课参考

- [Android：ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel)
- [Android：界面层](https://developer.android.com/topic/architecture/ui-layer)
