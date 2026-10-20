# 数据模型

## 正式知识（进入 Git 与网页）

| 文件                           | 职责                            |
| ------------------------------ | ------------------------------- |
| content/categories.json        | 领域元数据                      |
| content/courses/COURSE_ID.json | 主题、嵌套章节与稳定节点元数据  |
| content/notes/TOPIC_ID.md      | 知识正文，Markdown 唯一事实来源 |
| content/progress.json          | 最近一次整理的学习位置与状态    |

Zod 模型及跨文件校验在 src/lib/data.ts。结构为 Category → Course → 嵌套 Module → Topic；网页称“主题”，文件兼容现有 course ID。

Course 字段：id、title、category、description、difficulty、demo、created、updated、tags、modules、topics。Module 为 id、title、topics（有序引用）、children（递归子章节）。Topic 为 id、title、minutes、updated、prerequisites、related、tags。难度与估时是后台兼容元数据，不在阅读页面做规划展示。

路线顺序为模块树深度优先顺序。每个 Topic 在本课程的树中恰好出现一次；关联和依赖可指向其他主题的 Topic。ID 不随标题变化；改名和移动模块不重新生成笔记或进度。正文用 `[关联](topic:TOPIC_ID)`，也可用 notes 内相对 `.md` 链接。

Progress 为每个 course ID 保存 current、lastStudied、topics。节点状态是 not_started / learning / reviewing / completed，附 updated 与可选 evidence；completed 必须有证据。网页将后三种派生为已有记录，不把已讲解显示为已掌握。

未标记 completed 不阻止沿路径继续。prerequisites 用于教学衔接，缺失引用和依赖循环仍属数据错误。CLI 在前置未掌握时提示，不能通过自动标记前置已掌握来绕过。

## 未整理会话（仅本机，不进入网页）

`scripts/lib/study.ts` 管理 `.learning/session.json`：

| 字段                   | 含义                                                |
| ---------------------- | --------------------------------------------------- |
| id、courseId           | 会话 UUID 与主题 ID                                 |
| current                | 本次实际当前位置                                    |
| startedAt、updatedAt   | 会话开始与最近实质教学断点时间                      |
| coveredTopicIds        | 本次实际讨论的节点集合                              |
| summary、openQuestions | 简短语义摘要及未解决疑问，不能全量复制聊天          |
| mastery                | 节点到用户明确确认/真实检查证据的映射               |
| baseDigest             | 会话开始时 content 的摘要，用于检测外部修改         |
| applied                | 整理清单摘要和写入后 content 摘要，供重试与关闭检查 |

临时会话可跨同一 checkout 的聊天恢复，不跨设备同步；不作为正式已学笔记，不在 export 中输出。`.learning/checkpoint.json`、`.learning/finish.json` 是 Codex 生成的命令输入，格式见 [Skill 会话约定](../.agents/skills/learning-atlas/references/session-format.md)。

resume 默认使用未整理会话；没有会话则按 learning 与 lastStudied 选择正式主题，读取 current；若正式停止节点已掌握，续课定位其后的未完成节点。`--next` 只在用户明确要求下一节时使用，按路径在当前位置之后寻找节点，不从第一个 learning 节点重新开始。

## 整理写入

study:finish 要求节点集合与本次讨论集合完全一致。Codex 提供每个节点的完整合并 Markdown；脚本不做 AI 摘要。completed 必须匹配会话 mastery，普通补充不降级已有掌握状态。

成功写入后：

- 更新本次节点 Markdown、Topic.updated 与 Course.updated。
- 只更新本次节点状态及该课程位置，不改其他课程/节点状态。
- lastStudied 使用会话最近教学断点时间，不用构建时间冒充学习时间。
- 导图、目录、搜索在构建时从正式文件派生。

相同清单重复执行不会重新写入；没有外部变动时可以提交修订清单修复已保存笔记；会话期间其他 content 变化会拒绝覆盖。写入错误或内容校验失败会恢复本批原文件，会话仍保留。验证、测试、构建通过后再 study:close；检查失败不能清理会话后声称完成。

这不是数据库事务：多进程并发和进程被强制中止需人工检查，因此一次只在同一 checkout 中维护一个会话。

## 校验与迁移

校验重复 ID、缺失分类/笔记、非法状态、未知/循环依赖、错误关联/内部链接、路线进度不一致、无效位置和完成证据。新增节点同时建立元数据、模块引用、Markdown 与 not_started 记录。

`npm run export` 导出正式元数据、进度与 Markdown 原文到 exports/atlas.json。`npm run maps` 导出派生导图 Markdown。二者均不改变正式内容；原文件可迁移到其他静态站或知识工具。

## 主题模式

课程 mode 默认为 path。collection 为资料型主题，modules 是分类目录，不表示学习顺序。页面隐藏进度位置和前后课链接；续聊只恢复具体问题，不推导下一节。日语初始分类为语法、词汇、表达辨析、阅读笔记，初始没有已学笔记。
