# kotlinx.serialization 与 JSON 建模

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- JSON 怎样自动转换为 Kotlin 类型？
- 字段名不一致或字段缺失时怎么办？

## 讲解顺序

1. @Serializable 与 Json 配置。
2. @SerialName、默认值与 ignoreUnknownKeys。
3. sealed 类型的多态序列化与解析错误定位。

## 动手练习

为贯穿案例的同步接口定义请求与响应模型。

## 观察与验收

能根据解析错误信息找到出错字段。尚未实际完成。

## 备课参考

- [Kotlin：序列化](https://kotlinlang.org/docs/serialization.html)
