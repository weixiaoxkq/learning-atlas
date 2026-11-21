# URLSession 与 async/await 网络请求

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- App 怎样向服务器发送请求并读取响应？
- 状态码错误、超时与无网络时应该怎样处理？

## 讲解顺序

1. HTTP 基础：方法、请求头、状态码与 JSON 正文。
2. URLSession 的 data(for:) 与 URLRequest 配置。
3. 处理 HTTP 错误、超时、无网络与 App Transport Security。

## 动手练习

从一个公开测试 API 获取数据并显示在列表中。

## 观察与验收

断网或服务器报错时，界面能给出明确反馈。尚未实际完成。

## 备课参考

- [Apple：URLSession](https://developer.apple.com/documentation/foundation/urlsession)
