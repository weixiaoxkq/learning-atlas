# Learning Atlas

本项目的日常流程：在 Codex 里聊天学习 → 根据路径和位置接着教学 → 用户说“整理本次学习” → 保存 Markdown、进度并构建阅读网页。

## 任务入口

学习、继续、追问、新主题和“整理本次学习”使用项目 Skill：[learning-atlas](.agents/skills/learning-atlas/SKILL.md)。如果当前技能列表尚未刷新，直接读取该文件执行；不要因未自动加载而停止。普通网站开发、“整理项目文件”等工程请求不启动学习会话。

## 固定约定

- 开始前 `npm run validate`。续课运行 `npm run study:context`：优先恢复 `.learning/session.json`，否则读正式主题的 current 和 lastStudied；不靠聊天猜测。
- 聊天时只维护 `.learning/` 的精简语义断点，正式 content 和网页在用户发出整理命令后更新。不每轮写正式笔记或构建，不假装存在关闭聊天后自动运行的后台任务。
- “继续学习”默认继续当前节点；正式停止节点已确认掌握时定位其后未完成节点。“讲下一节”才前进。追问不跳节。未标记 completed 不阻止继续教学，不自动补记掌握。前置没有任何记录时先简要衔接或说明缺口。
- 已讲解、已有记录、已掌握不同。completed 需要用户明确确认或预先约定的掌握检查证据；不能采用助手自称“你已经掌握”作为证据。
- Markdown 为正文事实来源；course JSON 为结构来源；progress 为已整理的位置和状态。导图与索引均由构建派生，不独立维护重复内容。
- 稳定 ID 不因标题或章节移动改变。复用已有知识用 related、prerequisites 与 topic:ID 链接。删除需有用户意图，并处理全部引用。
- Demo 不是真实历史；导入聊天必须说明可读范围和重建部分。未经核实的细节、练习完成情况、掌握证据不能捏造。
- 维护网页的简洁阅读定位：主题目录、学习路径、思维导图、章节和 Markdown 搜索。不要重新引入 Dashboard、打卡、统计卡片、掌握率或复习清单界面。

## 文件职责

| 路径                                                  | 内容                                     |
| ----------------------------------------------------- | ---------------------------------------- |
| content/courses、content/notes、content/progress.json | 正式结构、笔记、学习位置                 |
| .learning/（Git 忽略）                                | 同一工作目录中的未整理会话与清单         |
| .agents/skills/learning-atlas/                        | 教学与结束整理工作流                     |
| scripts/cli.ts                                        | 主题、节点、进度、导出等确定性维护       |
| scripts/study.ts、scripts/lib/study.ts                | 会话定位、断点、整理写入、冲突检查       |
| src/                                                  | 静态阅读网页及共享内容模型               |
| templates/                                            | 学科 Markdown 模板                       |
| tests/fixtures/                                       | 隔离的 Demo 测试数据，不写入真实 content |
| docs/                                                 | 使用、数据模型、来源和验证说明           |

## 收尾与发布

正式内容修改：`npm run validate` → `npm test` → `npm run build`。代码修改再运行 `npm run check`。仅临时断点变化不必全量测试。学习整理在检查全部通过后关闭会话，不自动开启下一节。

“整理”只保存本地内容，不包含发布。用户明确说“提交并发布”才检查差异、凭据并 git commit / push；GitHub Pages 由 main 推送触发。没有凭据或网络时如实报告，不能声称部署成功。

## 资料型主题

course.mode 为 collection（目前日语）时，不使用线性路线或自动下一节。先搜索已有知识点，按具体问题归档到分类；current 仅用于恢复未解决讨论。没有待续问题时询问本次想讨论的内容，不自行安排课程。分类与导图仍从 modules 派生。
