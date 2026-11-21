# Keychain：安全保存 Token 与凭据

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 登录 Token、密码为什么不能存在 UserDefaults？
- Keychain 的基本读写流程是什么？

## 讲解顺序

1. Keychain 的用途与安全属性。
2. 增、查、改、删的基本调用与错误码。
3. 可访问性选项、Face ID 保护，以及“通过 Apple 登录”等登录方式的位置。

## 动手练习

把同步接口的 Token 改存到 Keychain。

## 观察与验收

能写出 Token 的保存、读取，以及退出登录时的删除。尚未实际完成。

## 备课参考

- [Apple：Keychain 服务](https://developer.apple.com/documentation/security/keychain-services)
