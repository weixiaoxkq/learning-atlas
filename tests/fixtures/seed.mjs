import fs from 'node:fs';
if (fs.existsSync('content/progress.json') || fs.existsSync('content/categories.json')) {
  throw new Error('测试夹具不能覆盖已有知识库；请只在空临时目录中运行。');
}
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
write('content/categories.json', [
  {
    id: 'ai',
    title: '人工智能',
    english: 'Artificial Intelligence',
    symbol: '✧',
    color: '#7464c4',
  },
  { id: 'cs', title: '计算机科学', english: 'Computer Science', symbol: '⌘', color: '#438ba3' },
  { id: 'languages', title: '语言学习', english: 'Languages', symbol: 'あ', color: '#b98248' },
]);
const defs = [
  [
    'rag',
    'RAG · 检索增强生成',
    'ai',
    '让大语言模型连接你的知识。从检索原理到构建可信赖的问答系统。',
    [
      ['理解 RAG', '为什么需要 RAG', 'Embedding 与语义空间', 'RAG 的整体架构'],
      ['构建检索管线', '文档分块 Chunking', '向量索引与检索', '重排序 Reranking'],
      ['评估与实践', '上下文与提示词', '评估检索质量', '构建知识库问答'],
    ],
  ],
  [
    'redis',
    'Redis 核心与实践',
    'cs',
    '理解内存数据结构，建立高效缓存与可靠服务的完整知识框架。',
    [
      ['认识 Redis', 'Redis 的设计理念', '字符串与哈希', '列表与集合'],
      ['缓存与持久化', '缓存更新策略', 'RDB 与 AOF', '过期与内存淘汰'],
      ['可靠性与应用', '事务与 Lua', '主从复制', '缓存穿透与雪崩'],
    ],
  ],
  [
    'japanese',
    '日语语法 · 从基础到表达',
    'languages',
    '从句子的基本结构出发，在语境中理解语法，逐步建立表达能力。',
    [
      ['句子的骨架', 'は与が的区别', 'です与ます', '助词を・に・で'],
      ['动词与连接', '动词的分类', 'て形与连接', 'た形与过去'],
      ['表达与语感', '条件表达と・ば・たら', '授受表达', '敬语入门'],
    ],
  ],
];
const progress = {};
const notes = {
  'rag-1': [
    '为什么需要 RAG',
    '语言模型的参数知识无法随业务文档实时更新。检索增强生成（Retrieval-Augmented Generation）在回答前检索外部资料，再将相关片段作为上下文交给模型。',
    '它适合需要引用私有资料、频繁更新信息或提供可追溯回答的任务。检索本身不保证正确，仍需检查资料质量与答案依据。',
    '用户提问 → 检索文档 → 组织上下文 → 生成带出处的回答。',
    '问「公司的报销上限是多少？」时，先检索当前报销制度，再基于对应条款回答。',
  ],
  'redis-1': [
    'Redis 的设计理念',
    'Redis 是以键值访问为基础、提供丰富数据结构的数据存储系统。许多操作在内存中完成，适合延迟敏感的访问。',
    '缓存可以减轻主数据库的重复读取，但需要明确缓存失效、一致性与故障降级策略。',
    '客户端发送命令，服务器执行相应的数据结构操作；持久化与复制提供不同层面的恢复能力。',
    '```redis\nSET greeting "hello"\nGET greeting\nEXPIRE greeting 60\n```',
  ],
  'japanese-1': [
    'は与が的区别',
    '「は」通常标记话题，也可表达对比；「が」通常标记主语，在识别、呈现新信息等语境中常见。',
    '理解话题与焦点有助于解释：两句语法都成立，却传递不同重点。',
    '不要把「は」简单等同于主语标记。语境、已知信息与说话者关注点共同决定表达。',
    '田中さんは先生です。以田中为话题说明身份。\n\n誰が先生ですか。田中さんが先生です。回答「谁」时，「が」突出所识别的人。',
  ],
};
for (const [id, title, category, description, groups] of defs) {
  const now = '2026-10-19T09:00:00.000Z';
  const topics = groups
    .flatMap((g) => g.slice(1))
    .map((title, i) => ({
      id: `${id}-${i + 1}`,
      title,
      minutes: 20 + i * 5,
      updated: now,
      prerequisites: i ? [`${id}-${i}`] : [],
      related: [],
      tags: [id, i < 3 ? '基础' : '实践'],
    }));
  const modules = groups.map((g, i) => ({
    id: `${id}-module-${i + 1}`,
    title: g[0],
    topics: topics.slice(i * 3, i * 3 + 3).map((t) => t.id),
    children: [],
  }));
  write(`content/courses/${id}.json`, {
    id,
    title,
    category,
    description,
    difficulty: 'Beginner',
    demo: true,
    created: now,
    updated: now,
    tags:
      category === 'languages'
        ? ['日语', '语法', '表达']
        : category === 'ai'
          ? ['LLM', '检索', '知识库']
          : ['数据库', '缓存', '后端'],
    modules,
    topics,
  });
  progress[id] = {
    current: `${id}-4`,
    lastStudied: now,
    topics: Object.fromEntries(
      topics.map((t, i) => [
        t.id,
        {
          status:
            i < 2 ? 'completed' : i === 2 ? 'reviewing' : i === 3 ? 'learning' : 'not_started',
          updated: now,
          ...(i < 2 ? { evidence: 'demo：模拟用户确认，仅用于展示' } : {}),
        },
      ]),
    ),
  };
  for (const t of topics) {
    const n = notes[t.id];
    fs.writeFileSync(
      `content/notes/${t.id}.md`,
      n
        ? `# ${n[0]}\n\n> Demo 示例笔记，不代表你的真实学习记录。\n\n## 核心概念\n\n${n[1]}\n\n## 为什么需要这个知识\n\n${n[2]}\n\n## 工作原理\n\n${n[3]}\n\n## 示例\n\n${n[4]}\n\n## 常见误区\n\n单个例子不能代替完整的适用条件。请结合实际场景验证理解。\n\n## 与其他知识的关联\n\n${topics[1].id !== t.id ? `[${topics[1].title}](topic:${topics[1].id})` : '结合课程路线查看前后知识点。'}\n\n## 我的疑问\n\n哪些场景不适合使用这一概念？\n\n## 总结\n\n能够用自己的话说明核心概念，并解释一个具体例子，是下一步掌握检查的目标。\n\n## 参考资料\n\n${id === 'redis' ? '[Redis 官方文档](https://redis.io/docs/)' : id === 'rag' ? '[RAG 原始论文](https://arxiv.org/abs/2005.11401)' : '[日本語教育コンテンツ共有システム](https://www.nihongo-ews.bunka.go.jp/)'}\n`
        : `# ${t.title}\n\n> Demo 学习提纲，尚未完成讲解与笔记整理。\n\n## 学习目标\n\n理解「${t.title}」的适用条件，能够解释一个例子并辨别常见误区。\n\n## 掌握检查\n\n- 用自己的话说明概念。\n- 举出一个应用场景。\n- 解释一个不适用的情况。\n\n## 我的疑问\n\n学习时记录需要进一步解释的问题。\n`,
    );
  }
}
write('content/progress.json', progress);
