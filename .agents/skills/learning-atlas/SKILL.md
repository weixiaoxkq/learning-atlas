---
name: learning-atlas
description: 在 Learning Atlas 项目中按文件记录继续教学、创建学习主题，并在“整理本次学习／今天学到这里，整理一下”时沉淀 Markdown 与学习位置。适用于该知识库的学习聊天和收尾整理；不用于普通问答或网站界面开发。
---

# Learning Atlas 学习与整理

先读仓库根目录 AGENTS.md。以下命令均在项目根目录运行。路径说明在 README.md，数据模型在 docs/data-model.md；需要填写会话文件时才读 [会话文件约定](references/session-format.md)。教学与知识提炼由你执行，Node 命令只做定位、校验和保存。

## 从用户的意图进入

- “我要学习 XXX”：搜索现有 course、Topic、tags、Markdown，能复用则复用。新主题按用户背景给出合适的参考路径，使用 course:new、topic:new 和模板初始化。主题不硬编码，所有新节点 not_started。只创建必要的提纲，不冒充已学习内容。不因用户说“想学”就写完整已学笔记。
- “继续学习／开始学习 XXX”：先 `npm run validate`，再 `npm run study:context`，指定主题时加 `-- --course COURSE_ID`。优先恢复未整理会话；否则读取最近正式主题的 current。读取返回的 coursePath、notePath、前后章节和会话 summary/openQuestions，正式停止节点若已确认掌握，context 会定位其后的未完成节点；说明一句“上次到哪里”，直接教学。不要求用户重复提供背景。若 session.applied 已存在，先补完验证与 close，再按当前请求继续，不丢弃待验证成果。
- “讲下一个／继续下一节”：这是明确的前进请求。执行 `npm run study:start -- --next`，它会从现有会话或正式停止位置选择下一节点；没有会话也不必先 start 一次，避免跳过节点。不要因为上一节点未 completed 拒绝前进，更不要自动标完成。前置完全没有记录时先做短回顾，必要时说明知识缺口。
- 追问、“不理解”、“深入一点”：停在当前节点换方式解释，不换位置。用户说“先暂停”只保留本地断点；不要自动整理、构建、提交或推送。
- “整理本次学习／今天学到这里，整理一下／结束并保存”：执行下方整理流程，不再开始新知识。
- 单独说“总结一下”：默认只在聊天中总结；“整理到页面／保存笔记”才触发正式落盘。若上下文已明确指保存，无需反复确认。

## 教学时

执行 `npm run study:start` 或 `npm run study:start -- --course COURSE_ID --topic TOPIC_ID`。已有同主题会话会恢复；另一主题尚未整理时不要覆盖它，先说明现有会话并让用户选择何时整理。没有正式主题时帮助创建，不将 Demo 当真实进度。

每次围绕一个节点解释：先回答具体问题，再用学科合适的例子、反例或推导连接上下文。依据已学记录调节深度，不重新完整讲解所有前置知识。允许用户自由追问，不强制答题或打卡。对需要核实的技术事实查证官方或原始资料；不确定之处明确说明。

每完成一段实质教学，更新 `.learning/checkpoint.json` 并运行 `npm run study:checkpoint -- --file .learning/checkpoint.json`：

- coveredTopicIds 只加实际讲解或讨论的节点；不把整条路线算作本次学习。
- summary 保存能让下一次聊天接上的简短语义摘要，openQuestions 保存未解决疑问；不用原始聊天记录，不保存无关个人信息。
- mastery 仅保存用户明确确认或预先定义检查的真实证据。讲解、用户说“继续”或助手夸奖都不是掌握证据。没有明确证据就空对象。
- 除下述资料型主题的空条目初始化外，不改正式 content、updated 或 lastStudied；网页此时仍展示上次整理结果。不每轮跑构建与测试。

若用户只说“我已经掌握”而当前有明确节点，记录该节点证据到会话；到整理时正式保存。若明确要求立即保存进度，按用户指令收尾相关内容，不把立即保存扩大为发布。

## 整理本次学习

1. 读 `study:context` 与 `.learning/session.json`，确认 coveredTopicIds、当前节点、摘要、真实确认及疑问。结合本次对话恢复知识；断点过短时不要捏造细节。没有讨论记录时说明没有可整理的新内容，保留已有笔记。
2. 对每个 covered 节点读取旧 Markdown，将本次新理解、纠正、例子、关联、疑问与资料合并成完整新正文；保留先前仍有效内容、原有来源范围说明与未解决疑问，去掉寒暄和整段对话。不为未讲解节点补写已学内容。
3. 创建 `.learning/finish.json`（格式见参考）。notes 恰好覆盖本次讨论节点；已学未确认为 learning，明确请求复习才 reviewing；completed 的 evidence 必须与会话 mastery 一致。current 保留真实停止位置，不提前跳到下一节。
4. `npm run study:finish -- --file .learning/finish.json`。命令合并写笔记、更新时间和正式位置，检查链接；已写入但未验证的会话仍保留。正式数据在会话期间被外部修改时会拒绝覆盖：检查差异后人工合并，不能绕过摘要校验或直接删会话丢内容。
5. 依次 `npm run validate`、`npm test`、`npm run build`。代码变动另加 `npm run check`。构建自动生成目录、导图和搜索；不独立维护导图。失败则修复，保留会话，不声称整理完成。笔记表述需修正时修改 finish 清单并再次执行 finish；没有外部正式内容变动时可接受修订，不直接改 digest。不要用 format 重排整个 content，避免改动未涉及节点。
6. 全部通过后 `npm run study:close -- --session SESSION_ID`。确认本地预览是构建结果，给出主题和笔记链接，简要报告整理了哪些节点、停在哪里、遗留疑问。不会自行开启下一节。

整理是本地内容保存；只有用户明确说“提交并发布”才检查凭据、提交、推送与检查部署。关闭聊天不会触发后台整理，用户必须发出整理命令，或下次恢复未整理会话后再发出。

## 资料型主题（collection）

日语采用此模式。开始前运行 validate，读取分类、主题 JSON、progress 与相关 Markdown。先按问题、同义表达、tags 和笔记检索，已有知识点补充原 ID。没有固定下一节，不按分类顺序教学；继续日语只恢复未解决的问题，没有待续问题时询问用户本次想讨论什么。current 仅为会话恢复指针，不代表路线进度。

新问题尚无条目时，用 `npm run topic:new -- --course COURSE_ID --module MODULE_ID --name "知识点" --template language` 初始化 not_started 提纲，然后 `study:start -- --course COURSE_ID --topic TOPIC_ID` 开始讨论。仅这个命令允许在同主题未整理会话中追加空条目：它检查内容基线并同步会话摘要校验，保留已有讨论。不要手动修改 digest；跨主题或已有外部修改时先处理现有会话。其他路线调整仍先整理。不要预先编写已学内容或更新学习时间。

按语法、词汇、表达辨析、阅读笔记分类；一个具体问题一份 Markdown，相关知识通过 related 引用。分类可随内容发展，不生成完整待学路线。说“整理本次学习”时仍按通常流程合并完整正文、验证、测试和构建。
