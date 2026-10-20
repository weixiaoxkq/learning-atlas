import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { prepareTopicAddition } from './lib/study.ts';
import {
  load,
  validate,
  courseSchema,
  stats,
  courseMap,
  globalMap,
  status,
  flattenModules,
} from '../src/lib/data.ts';
const [command, ...args] = process.argv.slice(2);
const options = Object.fromEntries(
  args.flatMap((a, i) =>
    a.startsWith('--')
      ? [[a.slice(2), args[i + 1]?.startsWith('--') ? 'true' : args[i + 1] || 'true']]
      : [],
  ),
);
const root = path.resolve(options.root || '.');
const save = (p: string, v: unknown) => {
  const f = path.join(root, p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f + '.tmp', JSON.stringify(v, null, 2) + '\n');
  fs.renameSync(f + '.tmp', f);
};
const required = (key: string) => {
  if (!options[key]) throw new Error(`缺少 --${key}`);
  return options[key];
};
const uid = (name: string) =>
  `${
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 45) || 'item'
  }-${randomUUID().slice(0, 8)}`;
try {
  const data = load(root),
    now = new Date().toISOString();
  if (command === 'validate') {
    console.log(
      `✓ ${data.courses.length} courses / ${data.courses.flatMap((c) => c.topics).length} topics validated`,
    );
  } else if (command === 'course:new') {
    const name = required('name'),
      catName = required('category');
    let category = data.categories.find((c) => c.id === catName || c.title === catName);
    if (!category) {
      category = {
        id: uid(catName),
        title: catName,
        english: catName,
        symbol: '◇',
        color: '#587ca4',
      };
      data.categories.push(category);
    }
    const c = courseSchema.parse({
      id: uid(name),
      title: name,
      category: category.id,
      description:
        options.description || `${name} 的个人学习课程。请通过 Codex 工作流设计课程大纲。`,
      difficulty: options.difficulty || 'Beginner',
      mode: options.mode || 'path',
      demo: false,
      created: now,
      updated: now,
      tags: [],
      modules: [],
      topics: [],
    });
    data.courses.push(c);
    data.progress[c.id] = { current: null, lastStudied: null, topics: {} };
    validate(data, root);
    save('content/categories.json', data.categories);
    save(`content/courses/${c.id}.json`, c);
    save('content/progress.json', data.progress);
    console.log(`已创建 ${c.id}。课程为空；由 Codex 设计教学大纲，不由脚本生成教学内容。`);
  } else if (command === 'topic:new') {
    const c = data.courses.find((c) => c.id === required('course'));
    if (!c) throw new Error('课程不存在');
    const synchronizeSession = prepareTopicAddition(root, c.id);
    const moduleId = required('module');
    let m = flattenModules(c.modules).find((m) => m.id === moduleId);
    if (!m) {
      m = { id: moduleId, title: options['module-title'] || moduleId, topics: [], children: [] };
      c.modules.push(m);
    }
    const name = required('name'),
      id = uid(name);
    const t = {
      id,
      title: name,
      minutes: Number(options.minutes || 30),
      updated: now,
      prerequisites: (options.prerequisites || '').split(',').filter(Boolean),
      related: [],
      tags: [],
    };
    c.topics.push(t);
    m.topics.push(id);
    c.updated = now;
    data.progress[c.id].topics[id] = { status: 'not_started', updated: now };
    const note = fs
      .readFileSync(path.join(root, 'templates', `${options.template || 'default'}.md`), 'utf8')
      .replaceAll('{{title}}', name);
    const file = path.join(root, `content/notes/${id}.md`);
    fs.writeFileSync(file, note);
    try {
      validate(data, root);
    } catch (e) {
      fs.unlinkSync(file);
      throw e;
    }
    save(`content/courses/${c.id}.json`, c);
    save('content/progress.json', data.progress);
    synchronizeSession();
    console.log(`已添加 ${id}；已有进度已保留。`);
  } else if (command === 'progress') {
    if (!options.course) {
      for (const c of data.courses)
        console.log(
          `${c.demo ? '[demo] ' : ''}${c.id}: ${JSON.stringify(stats(c, data.progress[c.id]))}`,
        );
    } else {
      const c = data.courses.find((c) => c.id === options.course);
      if (!c) throw new Error('课程不存在');
      const topic = required('topic'),
        s = required('status');
      if (!c.topics.some((t) => t.id === topic) || !status.includes(s as any))
        throw new Error('无效知识点或状态');
      if (s === 'completed' && options.confirmed !== 'true' && !options.evidence)
        throw new Error('已掌握需要 --confirmed 或 --evidence');
      const target = c.topics.find((t) => t.id === topic)!;
      if (
        (s === 'learning' || s === 'completed') &&
        target.prerequisites.some(
          (p) => !Object.values(data.progress).some((v) => v.topics[p]?.status === 'completed'),
        )
      )
        console.log('提示：部分前置知识未标记为已掌握，必要时简要回顾；不阻止记录学习位置。');
      const p = data.progress[c.id];
      p.topics[topic] = {
        status: s as any,
        updated: now,
        ...(s === 'completed' ? { evidence: options.evidence || '用户明确确认掌握' } : {}),
      };
      p.lastStudied = now;
      // Store the actual stopping point. study:context derives the next node when it is mastered.
      p.current = topic;
      validate(data, root);
      save('content/progress.json', data.progress);
      console.log('进度已保存到 Git 文件。');
    }
  } else if (command === 'maps') {
    fs.mkdirSync(path.join(root, 'exports/maps'), { recursive: true });
    for (const c of data.courses)
      fs.writeFileSync(path.join(root, `exports/maps/${c.id}.md`), courseMap(c));
    fs.writeFileSync(path.join(root, 'exports/maps/global.md'), globalMap(data));
    console.log('导图已从课程结构重新生成到 exports/maps/');
  } else if (command === 'export') {
    save('exports/atlas.json', {
      ...data,
      notes: Object.fromEntries(
        data.courses
          .flatMap((c) => c.topics)
          .map((t) => [t.id, fs.readFileSync(path.join(root, `content/notes/${t.id}.md`), 'utf8')]),
      ),
    });
    console.log('已导出 exports/atlas.json');
  } else throw new Error(`未知命令 ${command}`);
} catch (e) {
  console.error(`✗ ${(e as Error).message}`);
  process.exitCode = 1;
}
