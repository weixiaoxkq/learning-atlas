# Room：Entity、DAO、关系与迁移

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 结构化数据怎样在本地保存与查询？
- 数据库结构变化后，旧数据怎样迁移？

## 讲解顺序

1. @Entity、@Dao 与 @Database 的定义。
2. 用 suspend 函数写入，返回 Flow 的查询自动更新界面。
3. 关系查询、索引，以及自动迁移与手动迁移。

## 动手练习

把贯穿案例的笔记存入 Room，并支持按标签筛选。

## 观察与验收

重启 App 后数据仍在，升级数据库版本后旧数据仍可读取。尚未实际完成。

## 备课参考

- [Android：Room](https://developer.android.com/training/data-storage/room)
