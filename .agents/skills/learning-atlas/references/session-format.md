# 会话文件约定

从 `npm run study:start` 的输出获取真实 sessionId、courseId 与 current，不能使用示例 ID。`.learning/` 不被 Git 跟踪、不参与网页构建；它用于同一工作目录内跨聊天恢复，不是跨设备同步。

## 教学断点

Codex 提炼后写 `.learning/checkpoint.json`：

```json
{
  "sessionId": "从命令输出取得的 UUID",
  "current": "当前实际讲到的 Topic ID",
  "coveredTopicIds": ["本次实际讨论的 Topic ID"],
  "summary": "已经解释的要点、用户的具体理解与纠正，以及接下来从哪句话接上。",
  "openQuestions": ["尚未回答或用户仍不理解的问题"],
  "mastery": {}
}
```

执行 `npm run study:checkpoint -- --file .learning/checkpoint.json`。命令合并已讨论 ID 与掌握证据，替换摘要和疑问。新增明确确认时，mastery 为 `{ "TOPIC_ID": "用户明确确认的内容或真实掌握检查结果" }`。不含明确确认就保持空。

## 整理清单

读取全部旧笔记，合并本次内容后写 `.learning/finish.json`：

```json
{
  "sessionId": "从命令输出取得的 UUID",
  "current": "与会话当前位置一致的 Topic ID",
  "notes": [
    {
      "topicId": "本次实际讨论的 Topic ID",
      "markdown": "# 标题\n\n合并旧笔记与本次学习后的完整 Markdown。",
      "status": "learning"
    }
  ]
}
```

notes 恰好覆盖 session.coveredTopicIds，不含重复项或其他节点。`markdown` 是完整合并后的正文，不是只含本次增量的短摘要。将状态设 completed 时增加 evidence，且必须等于 session.mastery 中该节点的证据。普通整理不会静默把已有 completed 降为 learning。

执行 `npm run study:finish -- --file .learning/finish.json`，然后验证、测试、构建，最后用真实 ID 执行 `study:close`。相同清单重复执行 finish 不会重复写笔记；需要修正时可修改清单再次 finish，但前提是上次写入后没有外部 content 改动；写入后内容变化会拒绝直接关闭。

## 文件约束

- session.json 由命令管理，不手动修改 baseDigest、applied 等字段来绕过冲突检查。
- 先创建或调整主题结构，再 start。资料型主题可用 topic:new 在同主题会话内追加空提纲；命令验证旧基线并同步新基线。其他结构调整先整理已有内容再修改；不要在正式内容变化后强行覆盖。
- 未整理会话需要继续时读 session.summary，不把临时文件当作正式已学笔记。
- 同一 checkout 一次只维护一个学习会话。多文件写入有异常回滚，但不是支持并发或断电事务的数据库。
- 永久的疑问与结论放在对应 Markdown；临时会话关闭后不再是续课依赖。已在 .learning 中生成的清单属于本地缓存，不加入 Git。
