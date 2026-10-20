# 验证记录

## 聊天教学与结束整理（2026-10-20）

- AGENTS.md 保留项目约定，教学流程集中到 .agents/skills/learning-atlas/。
- 使用 Skill 初始化器建立 metadata，quick_validate 检查通过。
- 会话只在 .learning/ 保存语义断点，Git 忽略；正式 AI 笔记与进度保持原值。
- 教学命令 context / start / checkpoint / finish / close 可执行，Node 脚本不包含大模型推理。
- 新会话测试在临时目录中执行，覆盖恢复、前进不冒充掌握、精确整理节点、掌握证据、幂等重试、异常回滚、外部修改冲突及关闭约束。
- 历史 Demo 生成器移至 tests/fixtures/，并禁止覆盖已有 content。

最终验证结果：

- npm run validate：1 个正式主题、19 个节点通过。
- npm test：38 项通过、0 失败。
- npm run check：0 errors / 0 warnings / 0 hints。
- npm run build：26 页，Pagefind 索引 18 个内容页。
- Skill quick_validate：通过。
- 独立临时 checkout 的完整命令演练：start --next → checkpoint → finish → validate / test / build → close，构建后的节点 HTML 含合并内容，会话已关闭。
- 真实项目 study:context 仍返回原 MoE 位置、原学习时间且无未整理会话。

## 现有内容

正式主题为“AI · 大语言模型原理”，7 章、19 个节点。当前为 ai-dense-moe；17 个有讲解/回顾记录，2 个预训练提纲未学习。来源范围见 [导入说明](ai-history-import.md)。本次工程整理没有进行新的教学或更改学习时间。

## 阅读界面

保留主题目录、学习路径、Markmap、章节 Markdown、全文搜索及深浅色模式。此前浏览器已检查：导图展开 27 个节点；LM Head 的两组公式无 KaTeX 错误；KV Cache 全文搜索正常；主要页面在 390px 无横向溢出。

## 发布

GitHub 仓库已创建且 origin 已连接；当前代码未推送，Pages 未部署。本次只整理本地项目，不执行发布。
