# Gradle 构建：Kotlin DSL、版本目录与构建变体

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- Gradle 在 Android 项目中做了哪些事？
- 依赖版本应该怎样统一管理？

## 讲解顺序

1. settings.gradle.kts、项目级与模块级 build.gradle.kts 的分工。
2. libs.versions.toml 版本目录：插件与依赖声明。
3. buildTypes、productFlavors 构建变体与 BuildConfig。

## 动手练习

为贯穿案例添加一个依赖，并让 debug 与 release 使用不同的服务器地址。

## 观察与验收

能读懂构建失败信息，定位到出错的依赖或配置。尚未实际完成。

## 备课参考

- [Android：构建配置](https://developer.android.com/build)
- [Android：迁移到版本目录](https://developer.android.com/build/migrate-to-catalogs)
