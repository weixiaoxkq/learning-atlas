# UserDefaults、@AppStorage 与文件系统

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 设置项、缓存和用户文件分别存放在哪里？
- App 沙盒中有哪些目录？

## 讲解顺序

1. 用 UserDefaults 与 @AppStorage 保存少量设置。
2. FileManager 与 Documents、Caches 等沙盒目录。
3. 用 Codable 把数据写成 JSON 文件。

## 动手练习

保存“排序方式”设置，并把笔记导出为 JSON 文件。

## 观察与验收

能说明为什么不应把大量数据或敏感信息放进 UserDefaults。尚未实际完成。

## 备课参考

- [Apple：UserDefaults](https://developer.apple.com/documentation/foundation/userdefaults)
- [Apple：FileManager](https://developer.apple.com/documentation/foundation/filemanager)
