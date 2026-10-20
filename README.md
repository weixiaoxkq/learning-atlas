# Learning Atlas

在 Codex 中学习，在网页中回看。

告诉 Codex 想学什么，它读取主题的路径和位置接着教学。结束时说 **“整理本次学习”**，它把本次内容合并到 Markdown，更新位置，再构建主题目录、思维导图和全文搜索。

网页只负责阅读和查找，不做规划、打卡或写回进度。

## 日常使用

```text
我要学习 XXX。
继续上次的内容。
这里没理解，换个例子。
讲下一节。
今天学到这里，整理一下。
```

在本项目目录中聊天即可。项目 Skill 为 `$learning-atlas`；若当前列表未显示，可让 Codex 读取 AGENTS.md 指向的文件。项目使用 [Codex 官方支持的仓库 Skill 目录](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills) `.agents/skills/`。

聊天期间只写本机的精简断点；收到整理命令才更新正式笔记和网页。关闭聊天不会触发后台整理。“已讲解”和“已掌握”分开记录，不强制先把全部前置标记完成才能继续。

[完整使用方法](docs/learning-workflow.md) · [AGENTS.md](AGENTS.md) · [教学 Skill](.agents/skills/learning-atlas/SKILL.md)

## 本地网页

Node.js 22.22+：

```sh
npm install
npm run dev
```

全文搜索在构建时生成；需要验证最终效果时：

```sh
npm run build
npm run preview
```

打开终端显示的地址。Astro 预览在后台运行，`npx astro preview stop` 停止。网页修改由源码与构建提供，不是保存到浏览器 localStorage。

## 文件怎么分

```text
AGENTS.md                         项目不变规则和入口
.agents/skills/learning-atlas/     教学与本次学习整理流程
content/
  categories.json                领域
  courses/<id>.json              主题、章节、节点与路径
  notes/<topic-id>.md             正式知识正文
  progress.json                  已整理的学习状态与位置
.learning/                       本地未整理断点和清单（不入 Git）
scripts/cli.ts                   课程、节点、进度与导出命令
scripts/study.ts                 会话命令入口
scripts/lib/study.ts             会话、整理、冲突检查
src/                             Astro 阅读界面和内容模型
templates/                       学科笔记模板
tests/fixtures/                  隔离 Demo 数据，仅用于测试
docs/                            使用、模型、导入范围与验证说明
```

Markdown 为正文事实来源。每个主题一张思维导图、一份学习路径，每个节点一份 Markdown。标题可以改，ID 不随之改变。新增学科不需要改网页路由。

当前 AI 主题来自“AI学习路线梳理”，有 7 章、19 个节点；17 个有讲解或回顾记录，预训练 2 个节点未学习。记录位置在第 06 节 MoE；[读取范围与重建说明](docs/ai-history-import.md) 保留在笔记来源中。

## 内容维护

日常让 Codex 操作即可，命令只负责确定性的文件处理：

```sh
npm run course:new -- --name "数据库索引" --category "计算机科学"
npm run topic:new -- --course COURSE_ID --module basics --module-title "基础" --name "B+ 树" --template programming
npm run study:context
npm run progress
npm run validate
npm test
npm run check
npm run build
npm run maps
npm run export
```

话题创建与拓展由 Codex 设计，脚本不会假装生成课程。整理后的导图、目录和搜索自动更新。导出文件位于 exports/，源内容可以迁移到其他工具。

## 发布

远程仓库：[weixiaoxkq/learning-atlas](https://github.com/weixiaoxkq/learning-atlas)。当前代码尚未推送和部署。

“整理”不包含提交或发布。要发布时，对 Codex 说 **“提交并发布最新知识库”**，或在配置 GitHub 凭据后：

```sh
git add .
git commit -m "Update learning notes"
git push -u origin main
```

在 GitHub Settings → Pages 将 Source 设为 GitHub Actions。main 推送自动测试、构建并部署。配置从 GITHUB_REPOSITORY 推断项目路径，兼容 username.github.io 根仓库；SITE_URL、BASE_PATH 可覆盖。

[数据模型](docs/data-model.md) · [验证记录](docs/verification.md)
