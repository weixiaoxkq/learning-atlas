import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
export const status = ['not_started', 'learning', 'reviewing', 'completed'] as const;
export const labels = {
  not_started: '未开始',
  learning: '学习中',
  reviewing: '待复习',
  completed: '已掌握',
};
const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);
const topic = z.object({
  id,
  title: z.string().min(1),
  minutes: z.number().positive(),
  updated: z.string().datetime(),
  prerequisites: z.array(id).default([]),
  related: z.array(id).default([]),
  tags: z.array(z.string()).default([]),
});
const moduleSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id,
    title: z.string(),
    topics: z.array(id),
    children: z.array(moduleSchema).default([]),
  }),
);
export const courseSchema = z.object({
  id,
  title: z.string().min(1),
  category: id,
  description: z.string(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  mode: z.enum(['path', 'collection']).default('path'),
  demo: z.boolean().default(false),
  created: z.string().datetime(),
  updated: z.string().datetime(),
  tags: z.array(z.string()),
  modules: z.array(moduleSchema),
  topics: z.array(topic),
});
export const progressSchema = z.object({
  current: z.string().nullable(),
  lastStudied: z.string().datetime().nullable(),
  topics: z.record(
    z.object({
      status: z.enum(status),
      updated: z.string().datetime(),
      evidence: z.string().optional(),
    }),
  ),
});
export type Course = z.infer<typeof courseSchema>;
export type Progress = z.infer<typeof progressSchema>;
export function flattenModules(modules: any[]): any[] {
  return modules.flatMap((m) => [m, ...flattenModules(m.children || [])]);
}
export function load(root = process.cwd()) {
  const read = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
  const categories = z
    .array(
      z.object({
        id,
        title: z.string(),
        english: z.string(),
        symbol: z.string(),
        color: z.string(),
      }),
    )
    .parse(read('content/categories.json'));
  const courses = fs
    .readdirSync(path.join(root, 'content/courses'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => courseSchema.parse(read(`content/courses/${f}`)));
  const progress: Record<string, Progress> = read('content/progress.json');
  validate({ categories, courses, progress }, root);
  for (const c of courses) {
    const byId = new Map(c.topics.map((t) => [t.id, t]));
    c.topics = flattenModules(c.modules).flatMap((m) =>
      m.topics.map((id: string) => byId.get(id)!),
    );
  }
  return { categories, courses, progress };
}
export function validate(
  data: { categories: any[]; courses: Course[]; progress: Record<string, Progress> },
  root = process.cwd(),
) {
  const fail = (s: string) => {
    throw new Error(s);
  };
  const unique = (ids: string[], label: string) => {
    if (new Set(ids).size !== ids.length) fail(`重复 ${label} ID`);
  };
  unique(
    data.categories.map((c) => c.id),
    'category',
  );
  unique(
    data.courses.map((c) => c.id),
    'course',
  );
  data.courses.forEach((c) => courseSchema.parse(c));
  const all = data.courses.flatMap((c) => c.topics);
  unique(
    all.map((t) => t.id),
    'topic',
  );
  const ids = new Set(all.map((t) => t.id));
  const graph = new Map(all.map((t) => [t.id, t.prerequisites]));
  const visited = new Set<string>(),
    active = new Set<string>();
  const visit = (key: string) => {
    if (active.has(key)) fail(`循环依赖: ${key}`);
    if (visited.has(key)) return;
    active.add(key);
    for (const p of graph.get(key) || []) {
      if (!ids.has(p)) fail(`不存在的前置知识 ${p}`);
      visit(p);
    }
    active.delete(key);
    visited.add(key);
  };
  all.forEach((t) => visit(t.id));
  for (const c of data.courses) {
    if (!data.categories.some((x) => x.id === c.category)) fail(`分类不存在: ${c.category}`);
    const p = progressSchema.parse(data.progress[c.id]);
    const members = flattenModules(c.modules).flatMap((m) => m.topics);
    unique(
      flattenModules(c.modules).map((m) => m.id),
      'module',
    );
    unique(members, 'roadmap topic');
    if (
      members.length !== c.topics.length ||
      members.some((x) => !c.topics.some((t) => t.id === x))
    )
      fail(`路线与知识点不一致: ${c.id}`);
    if (Object.keys(p.topics).length !== c.topics.length || c.topics.some((t) => !p.topics[t.id]))
      fail(`路线与进度不一致: ${c.id}`);
    if (p.current && !c.topics.some((t) => t.id === p.current)) fail(`无效当前位置: ${c.id}`);
    for (const t of c.topics) {
      if (p.topics[t.id].status === 'completed' && !p.topics[t.id].evidence)
        fail(`掌握状态缺少证据: ${t.id}`);
      if (t.related.some((r) => !ids.has(r))) fail(`关联不存在: ${t.id}`);
      const file = path.join(root, 'content/notes', `${t.id}.md`);
      if (!fs.existsSync(file)) fail(`缺失 Markdown: ${t.id}`);
      const body = fs.readFileSync(file, 'utf8');
      for (const match of body.matchAll(/\]\(topic:([a-z0-9-]+)\)/g))
        if (!ids.has(match[1])) fail(`错误内部链接: ${match[1]}`);
      for (const match of body.matchAll(/\]\(([^\s)]+)\)/g)) {
        const href = match[1];
        if (/^(https?:|mailto:|topic:|#)/.test(href)) continue;
        if (
          !href.endsWith('.md') ||
          path.dirname(path.resolve(path.dirname(file), href)) !==
            path.join(root, 'content/notes') ||
          !ids.has(path.basename(href, '.md')) ||
          !fs.existsSync(path.resolve(path.dirname(file), href))
        )
          fail(`不支持或不存在的内部链接: ${href}`);
      }
    }
  }
  if (Object.keys(data.progress).some((k) => !data.courses.some((c) => c.id === k)))
    fail('进度中存在未知课程');
}
export function stats(c: Course, p: Progress) {
  const counts = Object.fromEntries(
    status.map((s) => [s, c.topics.filter((t) => p.topics[t.id].status === s).length]),
  ) as Record<(typeof status)[number], number>;
  return {
    ...counts,
    total: c.topics.length,
    percent: c.topics.length ? Math.round((counts.completed / c.topics.length) * 100) : 0,
  };
}
export function courseMap(c: Course, base = '/') {
  const walk = (modules: any[], depth: number): string =>
    modules
      .map(
        (m) =>
          `${'  '.repeat(depth)}- ${m.title}\n${m.topics.map((id: string) => `${'  '.repeat(depth + 1)}- [${c.topics.find((t) => t.id === id)!.title}](${base}topics/${id}/)`).join('\n')}\n${walk(m.children || [], depth + 1)}`,
      )
      .join('\n');
  return `# ${c.title}\n${walk(c.modules, 0)}`;
}
export function globalMap(data: ReturnType<typeof load>, base = '/') {
  return (
    '# Learning Atlas\n' +
    data.categories
      .map(
        (cat) =>
          `## ${cat.title}\n` +
          data.courses
            .filter((c) => c.category === cat.id)
            .map(
              (c) =>
                `### [${c.title}](${base}courses/${c.id}/)\n` +
                c.modules.map((m) => `- ${m.title}`).join('\n'),
            )
            .join('\n'),
      )
      .join('\n')
  );
}
export const url = (p = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${p}`;
