# AsyncSequence、取消与超时

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 怎样处理“逐步到达”的数据，例如大模型的流式输出？
- 用户离开页面后，任务怎样取消？

## 讲解顺序

1. 用 for await 遍历 AsyncSequence。
2. 用 AsyncStream 把回调转换成异步序列。
3. 任务取消检查与超时处理。

## 动手练习

用 AsyncStream 模拟逐字输出的文本，并在页面消失时取消。

## 观察与验收

能保证页面关闭后后台任务不再继续更新界面。尚未实际完成。

## 备课参考

- [Apple：AsyncSequence](https://developer.apple.com/documentation/swift/asyncsequence)
- [Apple：AsyncStream](https://developer.apple.com/documentation/swift/asyncstream)
