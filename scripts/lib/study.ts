import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { load } from '../../src/lib/data.ts';

const iso = z.string().datetime();
const sessionSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string(),
  current: z.string(),
  startedAt: iso,
  updatedAt: iso,
  baseDigest: z.string(),
  coveredTopicIds: z.array(z.string()),
  summary: z.string(),
  openQuestions: z.array(z.string()),
  mastery: z.record(z.string().trim().min(1)),
  applied: z.object({ manifestHash: z.string(), digest: z.string() }).optional(),
});
export type StudySession = z.infer<typeof sessionSchema>;
export const checkpointSchema = z
  .object({
    sessionId: z.string().uuid(),
    current: z.string(),
    summary: z.string().trim().min(1),
    coveredTopicIds: z.array(z.string()),
    openQuestions: z.array(z.string()).default([]),
    mastery: z.record(z.string().trim().min(1)).default({}),
  })
  .strict();
export const finishSchema = z
  .object({
    sessionId: z.string().uuid(),
    current: z.string(),
    notes: z
      .array(
        z
          .object({
            topicId: z.string(),
            markdown: z.string().trim().min(1),
            status: z.enum(['learning', 'reviewing', 'completed']).default('learning'),
            evidence: z.string().trim().min(1).optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();
const file = (root: string) => path.join(root, '.learning/session.json');
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
function saveSession(root: string, session: StudySession) {
  fs.mkdirSync(path.dirname(file(root)), { recursive: true });
  fs.writeFileSync(file(root) + '.tmp', json(session));
  fs.renameSync(file(root) + '.tmp', file(root));
}
export function contentDigest(root: string) {
  const digest = createHash('sha256');
  const walk = (dir: string) => {
    for (const entry of fs
      .readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile()) {
        digest.update(path.relative(root, p));
        digest.update(fs.readFileSync(p));
      }
    }
  };
  walk(path.join(root, 'content'));
  return digest.digest('hex');
}
export function activeSession(root: string) {
  if (!fs.existsSync(file(root))) return null;
  const session = sessionSchema.parse(JSON.parse(fs.readFileSync(file(root), 'utf8')));
  const data = load(root),
    c = data.courses.find((c) => c.id === session.courseId);
  if (!c || c.demo) throw new Error('会话主题不存在或属于 demo');
  for (const id of [session.current, ...session.coveredTopicIds, ...Object.keys(session.mastery)])
    if (!c.topics.some((t) => t.id === id)) throw new Error(`会话含未知知识点: ${id}`);
  return session;
}
export function studyContext(root: string, courseId?: string) {
  const data = load(root),
    session = activeSession(root);
  if (session && courseId && session.courseId !== courseId)
    throw new Error('已有另一主题的未整理会话，请先整理该会话');
  const candidates = data.courses
    .filter((c) => !c.demo && (!courseId || c.id === courseId))
    .sort(
      (a, b) =>
        Number(b.topics.some((t) => data.progress[b.id].topics[t.id].status === 'learning')) -
          Number(a.topics.some((t) => data.progress[a.id].topics[t.id].status === 'learning')) ||
        (data.progress[b.id].lastStudied || '').localeCompare(
          data.progress[a.id].lastStudied || '',
        ),
    );
  const c = session ? data.courses.find((c) => c.id === session.courseId) : candidates[0];
  if (!c) return { source: 'empty', message: '没有可继续的正式主题，请先创建主题。' };
  const p = data.progress[c.id];
  const savedIndex = c.topics.findIndex((t) => t.id === p.current);
  const savedCurrent =
    c.mode === 'collection'
      ? p.current
      : p.current && p.topics[p.current].status !== 'completed'
        ? p.current
        : c.topics.slice(savedIndex + 1).find((t) => p.topics[t.id].status !== 'completed')?.id;
  const current = session?.current || savedCurrent;
  if (!current)
    return {
      source: 'empty',
      courseId: c.id,
      mode: c.mode,
      message:
        c.mode === 'collection'
          ? '这是随学随记的资料主题，请提出具体问题；没有固定下一节。'
          : '没有当前节点，请指定要查看的内容。',
    };
  const t = c.topics.find((t) => t.id === current)!;
  const next =
    c.mode === 'collection'
      ? null
      : c.topics.slice(c.topics.indexOf(t) + 1).find((t) => p.topics[t.id].status !== 'completed');
  return {
    source: session ? 'session' : 'saved',
    courseId: c.id,
    title: c.title,
    mode: c.mode,
    current: t,
    nextTopic: next || null,
    lastStudied: session?.updatedAt || p.lastStudied,
    session,
    notePath: `content/notes/${t.id}.md`,
    coursePath: `content/courses/${c.id}.json`,
    prerequisites: t.prerequisites.map((id) => ({
      id,
      status: Object.values(data.progress).find((p) => p.topics[id])?.topics[id].status,
    })),
    message: session?.applied
      ? '笔记已写入，等待完成验证并关闭会话。'
      : c.mode === 'collection'
        ? '按具体问题记录，没有固定下一节；最近笔记仅用于接上未解决的问题。'
        : '默认继续当前节点；只有用户要求下一节时才前进。',
  };
}
export function startStudy(
  root: string,
  options: { courseId?: string; topicId?: string; next?: boolean } = {},
) {
  const context = studyContext(root, options.courseId);
  if (options.next && context.mode === 'collection')
    throw new Error('资料型主题没有固定下一节，请指定要讨论的知识点');
  if (!context.current && !options.topicId) throw new Error(context.message);
  const previous = activeSession(root);
  if (previous?.applied) throw new Error('本次整理已写入，请先验证并关闭会话');
  if (options.next && options.topicId) throw new Error('--next 与 --topic 不能同时指定');
  const data = load(root);
  const c = data.courses.find((c) => c.id === (options.courseId || context.courseId));
  if (!c || c.demo) throw new Error('需要存在的正式主题');
  const anchor = previous?.current || data.progress[c.id].current;
  const following = c.topics
    .slice(c.topics.findIndex((t) => t.id === anchor) + 1)
    .find((t) => data.progress[c.id].topics[t.id].status !== 'completed');
  const current = options.topicId || (options.next ? following?.id : context.current?.id);
  if (!current) throw new Error('当前节点之后没有未完成节点，不会重复从头开始');
  if (!c.topics.some((t) => t.id === current)) throw new Error('指定节点不属于该主题');
  const now = new Date().toISOString();
  const s: StudySession = previous
    ? { ...previous, current }
    : {
        id: randomUUID(),
        courseId: c.id,
        current,
        startedAt: now,
        updatedAt: now,
        baseDigest: contentDigest(root),
        coveredTopicIds: [],
        summary: '',
        openQuestions: [],
        mastery: {},
      };
  saveSession(root, s);
  return s;
}
export function checkpointStudy(root: string, input: unknown) {
  const patch = checkpointSchema.parse(input),
    session = activeSession(root);
  if (!session || patch.sessionId !== session.id) throw new Error('会话 ID 不匹配');
  if (session.applied) throw new Error('本次整理已写入，不能再修改该会话');
  const c = load(root).courses.find((c) => c.id === session.courseId)!;
  const covered = [...new Set([...session.coveredTopicIds, ...patch.coveredTopicIds])];
  for (const id of [patch.current, ...covered, ...Object.keys(patch.mastery)])
    if (!c.topics.some((t) => t.id === id)) throw new Error(`未知知识点: ${id}`);
  for (const id of Object.keys(patch.mastery))
    if (!covered.includes(id)) throw new Error('掌握证据必须对应本次已讨论节点');
  const result = {
    ...session,
    current: patch.current,
    summary: patch.summary,
    coveredTopicIds: covered,
    openQuestions: patch.openQuestions,
    mastery: { ...session.mastery, ...patch.mastery },
    updatedAt: new Date().toISOString(),
  };
  saveSession(root, result);
  return result;
}
export function finishStudy(root: string, input: unknown) {
  const manifest = finishSchema.parse(input),
    session = activeSession(root);
  if (!session || manifest.sessionId !== session.id) throw new Error('会话 ID 不匹配');
  const hash = createHash('sha256').update(json(manifest)).digest('hex');
  if (session.applied?.manifestHash === hash) {
    if (session.applied.digest !== contentDigest(root))
      throw new Error('已写入的整理内容发生变化，请核对后继续');
    return { alreadyApplied: true, courseId: session.courseId, current: session.current };
  }
  // Permit a revised summary after a failed build, but never overwrite external edits.
  if ((session.applied?.digest || session.baseDigest) !== contentDigest(root))
    throw new Error('会话开始后正式内容已变化；请先核对差异，不能覆盖已有修改');
  if (manifest.current !== session.current) throw new Error('整理位置必须与本次会话当前位置一致');
  const ids = manifest.notes.map((n) => n.topicId);
  if (new Set(ids).size !== ids.length) throw new Error('整理清单含重复知识点');
  if (
    ids.length !== session.coveredTopicIds.length ||
    ids.some((id) => !session.coveredTopicIds.includes(id))
  )
    throw new Error('整理清单必须且只包含本次讨论过的节点');
  const data = load(root),
    c = data.courses.find((c) => c.id === session.courseId)!,
    p = data.progress[c.id];
  const now = new Date().toISOString(),
    changes = new Map<string, string>();
  for (const note of manifest.notes) {
    const t = c.topics.find((t) => t.id === note.topicId)!;
    const previous = p.topics[t.id];
    if (note.status === 'completed' && (!note.evidence || note.evidence !== session.mastery[t.id]))
      throw new Error('已掌握必须匹配会话中记录的明确确认或检查证据');
    // A summary never silently downgrades an already mastered node.
    p.topics[t.id] =
      previous.status === 'completed' && note.status === 'learning'
        ? previous
        : {
            status: note.status,
            updated: session.updatedAt,
            ...(note.evidence ? { evidence: note.evidence } : {}),
          };
    t.updated = now;
    changes.set(`content/notes/${t.id}.md`, note.markdown + '\n');
  }
  c.updated = now;
  p.current = session.current;
  p.lastStudied = session.updatedAt;
  changes.set(`content/courses/${c.id}.json`, json(c));
  changes.set('content/progress.json', json(data.progress));
  const originals = new Map(
    [...changes.keys()].map((p) => [p, fs.readFileSync(path.join(root, p), 'utf8')]),
  );
  try {
    for (const [p, body] of changes) {
      const f = path.join(root, p);
      fs.writeFileSync(f + '.tmp', body);
      fs.renameSync(f + '.tmp', f);
    }
    load(root);
    saveSession(root, { ...session, applied: { manifestHash: hash, digest: contentDigest(root) } });
  } catch (e) {
    for (const [p, body] of originals) fs.writeFileSync(path.join(root, p), body);
    throw e;
  }
  return {
    alreadyApplied: false,
    courseId: c.id,
    current: p.current,
    notes: ids,
    needsVerification: true,
  };
}
export function closeStudy(root: string, sessionId: string) {
  const session = activeSession(root);
  if (!session || session.id !== sessionId) throw new Error('会话 ID 不匹配');
  if (!session.applied || session.applied.digest !== contentDigest(root))
    throw new Error('整理尚未写入或正式内容已变化，不能关闭会话');
  fs.unlinkSync(file(root));
  return { closed: true, courseId: session.courseId };
}

// Only the deterministic topic:new path may extend a running session's structure.
export function prepareTopicAddition(root: string, courseId: string) {
  const session = activeSession(root);
  if (!session) return () => {};
  if (session.courseId !== courseId || session.applied)
    throw new Error('请先整理现有会话，再修改其他主题或已写入的结构');
  if (session.baseDigest !== contentDigest(root))
    throw new Error('正式内容已有外部修改，不能追加节点覆盖断点基线');
  return () => {
    const current = activeSession(root);
    if (!current || current.id !== session.id) throw new Error('追加节点期间会话已变化');
    saveSession(root, { ...current, baseDigest: contentDigest(root) });
  };
}
