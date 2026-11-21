# 安全存储：Keystore 与凭据保护

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 登录 Token 等敏感信息怎样安全保存？
- Android Keystore 能提供什么保护？

## 讲解顺序

1. 用 Android Keystore 生成与使用密钥，加密本地数据。
2. 敏感数据的存储边界与备份规则。
3. 用 Credential Manager 统一处理密码、通行密钥与第三方登录。

## 动手练习

把同步接口的 Token 加密后保存。

## 观察与验收

能写出 Token 的保存、读取，以及退出登录时的清除。尚未实际完成。

## 备课参考

- [Android：Keystore 系统](https://developer.android.com/privacy-and-security/keystore)
- [Android：Credential Manager](https://developer.android.com/identity/sign-in/credential-manager)
