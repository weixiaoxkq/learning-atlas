import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { load } from '../src/lib/data.ts';
import {
  contentDigest,
  studyContext,
  startStudy,
  checkpointStudy,
  finishStudy,
  closeStudy,
  activeSession,
} from '../scripts/lib/study.ts';
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-study-'));
  fs.mkdirSync(path.join(root, 'content/courses'), { recursive: true });
  fs.mkdirSync(path.join(root, 'content/notes'), { recursive: true });
  execFileSync(process.execPath, [path.resolve('tests/fixtures/seed.mjs')], { cwd: root });
  const f = path.join(root, 'content/courses/rag.json'),
    c = JSON.parse(fs.readFileSync(f, 'utf8'));
  c.demo = false;
  fs.writeFileSync(f, JSON.stringify(c));
  return root;
}
function staged(root: string, topic = 'rag-4') {
  const s = startStudy(root, { courseId: 'rag', topicId: topic });
  checkpointStudy(root, {
    sessionId: s.id,
    current: topic,
    coveredTopicIds: [topic],
    summary: '解释了边界条件，仍需下次补一个例子。',
    openQuestions: ['哪些场景不适用？'],
    mastery: {},
  });
  return {
    sessionId: s.id,
    current: topic,
    notes: [
      {
        topicId: topic,
        markdown:
          fs.readFileSync(path.join(root, `content/notes/${topic}.md`), 'utf8') +
          '\n## 本次补充\n\n已讨论的边界。',
        status: 'learning' as const,
      },
    ],
  };
}
function run(name: string, fn: (root: string) => void) {
  test(name, () => {
    const root = fixture();
    try {
      fn(root);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}
run('context resumes saved position and ignores demo courses', (root) => {
  const c = studyContext(root);
  assert.equal(c.source, 'saved');
  assert.equal(c.courseId, 'rag');
  assert.equal(c.current?.id, 'rag-4');
  assert.equal(c.nextTopic?.id, 'rag-5');
});
run('chat checkpoints survive a new invocation without changing published content', (root) => {
  const before = contentDigest(root);
  const manifest = staged(root);
  assert.equal(contentDigest(root), before);
  const c = studyContext(root);
  assert.equal(c.source, 'session');
  assert.equal(c.session?.id, manifest.sessionId);
  assert.match(c.session!.summary, /边界/);
  assert.deepEqual(c.session?.openQuestions, ['哪些场景不适用？']);
});
run('next advances without claiming mastery of prerequisites', (root) => {
  startStudy(root, { courseId: 'rag' });
  const next = startStudy(root, { next: true });
  assert.equal(next.current, 'rag-5');
  assert.equal(load(root).progress.rag.current, 'rag-4');
  assert.equal(load(root).progress.rag.topics['rag-4'].status, 'learning');
});
run(
  'finish merges only covered files, preserves unrelated progress, and retries idempotently',
  (root) => {
    const m = staged(root),
      before = load(root),
      untouched = fs.readFileSync(path.join(root, 'content/notes/rag-1.md'), 'utf8');
    finishStudy(root, m);
    const first = contentDigest(root),
      after = load(root);
    assert.equal(after.progress.rag.current, 'rag-4');
    assert.equal(after.progress.rag.lastStudied, activeSession(root)!.updatedAt);
    assert.deepEqual(after.progress.redis, before.progress.redis);
    assert.deepEqual(after.progress.rag.topics['rag-1'], before.progress.rag.topics['rag-1']);
    assert.equal(fs.readFileSync(path.join(root, 'content/notes/rag-1.md'), 'utf8'), untouched);
    assert.equal(finishStudy(root, m).alreadyApplied, true);
    assert.equal(contentDigest(root), first);
    assert.ok(activeSession(root)?.applied);
    closeStudy(root, m.sessionId);
    assert.equal(activeSession(root), null);
    assert.equal(studyContext(root).source, 'saved');
  },
);
run('unconfirmed completed is rejected before any content write', (root) => {
  const m = staged(root),
    before = contentDigest(root);
  m.notes[0].status = 'completed' as any;
  assert.throws(() => finishStudy(root, m), /已掌握/);
  assert.equal(contentDigest(root), before);
});
run('recorded mastery evidence is required exactly and persists', (root) => {
  const m = staged(root),
    evidence = '用户明确说：这个节点我已掌握';
  checkpointStudy(root, {
    sessionId: m.sessionId,
    current: m.current,
    coveredTopicIds: [m.current],
    summary: '用户确认理解边界。',
    mastery: { [m.current]: evidence },
  });
  const note = { ...m.notes[0], status: 'completed', evidence };
  finishStudy(root, { ...m, notes: [note] });
  assert.equal(load(root).progress.rag.topics[m.current].status, 'completed');
  assert.equal(load(root).progress.rag.topics[m.current].evidence, evidence);
});
run('ordinary summary preserves an already mastered node', (root) => {
  const m = staged(root, 'rag-1');
  finishStudy(root, m);
  assert.equal(load(root).progress.rag.topics['rag-1'].status, 'completed');
});
run('unrelated, duplicate and omitted topics are rejected', (root) => {
  const m = staged(root),
    before = contentDigest(root);
  assert.throws(() => finishStudy(root, { ...m, notes: [...m.notes, m.notes[0]] }), /重复/);
  assert.throws(
    () => finishStudy(root, { ...m, notes: [{ ...m.notes[0], topicId: 'rag-6' }] }),
    /本次讨论/,
  );
  assert.equal(contentDigest(root), before);
});
run('invalid Markdown references roll back the entire content batch', (root) => {
  const m = staged(root),
    before = contentDigest(root);
  m.notes[0].markdown += '\n[bad](topic:missing-node)';
  assert.throws(() => finishStudy(root, m), /错误内部链接/);
  assert.equal(contentDigest(root), before);
  assert.equal(activeSession(root)?.applied, undefined);
});
run('external edits cannot be silently overwritten', (root) => {
  const m = staged(root);
  fs.appendFileSync(path.join(root, 'content/notes/rag-1.md'), '\n外部的新内容。');
  const changed = contentDigest(root);
  assert.throws(() => finishStudy(root, m), /正式内容已变化/);
  assert.equal(contentDigest(root), changed);
});
run('cannot close before apply or after new external edits', (root) => {
  const m = staged(root);
  assert.throws(() => closeStudy(root, m.sessionId), /尚未写入/);
  finishStudy(root, m);
  fs.appendFileSync(path.join(root, 'content/notes/rag-1.md'), '\n外部修改。');
  assert.throws(() => closeStudy(root, m.sessionId), /正式内容已变化/);
  assert.ok(activeSession(root));
});
run('wrong session and unknown checkpoints are rejected', (root) => {
  const s = startStudy(root, { courseId: 'rag' });
  assert.throws(
    () =>
      checkpointStudy(root, {
        sessionId: s.id,
        current: 'absent',
        coveredTopicIds: [],
        summary: '摘要',
      }),
    /未知知识点/,
  );
  assert.throws(() => startStudy(root, { courseId: 'redis' }), /另一主题/);
});
run('study command entry point produces resumable structured context', (root) => {
  const call = (...args: string[]) =>
    JSON.parse(
      execFileSync(
        process.execPath,
        ['--import', 'tsx', 'scripts/study.ts', ...args, '--root', root],
        { encoding: 'utf8' },
      ),
    );
  const initial = call('context');
  assert.equal(initial.current.id, 'rag-4');
  const s = call('start', '--course', 'rag');
  assert.ok(s.id);
  assert.equal(call('context').source, 'session');
});
run('explicit topic can reopen a fully mastered course without losing progress', (root) => {
  const f = path.join(root, 'content/progress.json'),
    p = JSON.parse(fs.readFileSync(f, 'utf8'));
  p.rag.current = null;
  for (const value of Object.values(p.rag.topics) as any[]) {
    value.status = 'completed';
    value.evidence = '先前用户确认';
  }
  fs.writeFileSync(f, JSON.stringify(p));
  const s = startStudy(root, { courseId: 'rag', topicId: 'rag-1' });
  assert.equal(s.current, 'rag-1');
  assert.equal(load(root).progress.rag.current, null);
});
run('an all-demo library does not start a real study session', (root) => {
  const f = path.join(root, 'content/courses/rag.json'),
    c = JSON.parse(fs.readFileSync(f, 'utf8'));
  c.demo = true;
  fs.writeFileSync(f, JSON.stringify(c));
  assert.equal(studyContext(root).source, 'empty');
  assert.throws(() => startStudy(root, { courseId: 'rag', topicId: 'rag-1' }), /正式主题/);
});
run(
  'revised finish can fix saved notes before close without bypassing external changes',
  (root) => {
    const m = staged(root);
    finishStudy(root, m);
    const revised = {
      ...m,
      notes: [{ ...m.notes[0], markdown: m.notes[0].markdown + '\n进一步修正表述。' }],
    };
    assert.equal(finishStudy(root, revised).alreadyApplied, false);
    assert.match(fs.readFileSync(path.join(root, 'content/notes/rag-4.md'), 'utf8'), /进一步修正/);
    closeStudy(root, m.sessionId);
  },
);
for (const useNext of [false, true])
  run(
    `resume after mastered stopping point does not restart or skip the next node (${useNext})`,
    (root) => {
      const f = path.join(root, 'content/progress.json'),
        p = JSON.parse(fs.readFileSync(f, 'utf8'));
      p.rag.topics['rag-4'] = {
        ...p.rag.topics['rag-4'],
        status: 'completed',
        evidence: '用户明确确认',
      };
      fs.writeFileSync(f, JSON.stringify(p));
      assert.equal(studyContext(root).current?.id, 'rag-5');
      assert.equal(startStudy(root, { courseId: 'rag', next: useNext }).current, 'rag-5');
    },
  );

run('collection keeps last note and has no automatic next lesson', (root) => {
  const file = path.join(root, 'content/courses/rag.json');
  const course = JSON.parse(fs.readFileSync(file, 'utf8'));
  course.mode = 'collection';
  fs.writeFileSync(file, JSON.stringify(course));
  const before = contentDigest(root);
  const context = studyContext(root, 'rag');
  assert.equal(context.mode, 'collection');
  assert.equal(context.nextTopic, null);
  assert.throws(() => startStudy(root, { courseId: 'rag', next: true }), /没有固定下一节/);
  assert.equal(contentDigest(root), before);
  const session = startStudy(root, { courseId: 'rag', topicId: 'rag-4' });
  assert.equal(session.current, 'rag-4');
});
run('empty collection waits for a concrete question', (root) => {
  const file = path.join(root, 'content/courses/rag.json');
  const course = JSON.parse(fs.readFileSync(file, 'utf8'));
  course.mode = 'collection';
  fs.writeFileSync(file, JSON.stringify(course));
  const fileP = path.join(root, 'content/progress.json');
  const progress = JSON.parse(fs.readFileSync(fileP, 'utf8'));
  progress.rag.current = null;
  fs.writeFileSync(fileP, JSON.stringify(progress));
  const context = studyContext(root, 'rag');
  assert.equal(context.source, 'empty');
  assert.match(context.message, /提出具体问题/);
});
run('adding a note preserves the active discussion and allows finalizing both notes', (root) => {
  fs.cpSync(path.resolve('templates'), path.join(root, 'templates'), { recursive: true });
  const manifest = staged(root);
  const before = activeSession(root)!;
  execFileSync(process.execPath, [
    '--import',
    'tsx',
    'scripts/cli.ts',
    'topic:new',
    '--root',
    root,
    '--course',
    'rag',
    '--module',
    'extra',
    '--name',
    'New question',
    '--template',
    'language',
  ]);
  const topic = load(root)
    .courses.find((c) => c.id === 'rag')!
    .topics.at(-1)!;
  const after = activeSession(root)!;
  assert.equal(after.id, before.id);
  assert.equal(after.summary, before.summary);
  assert.deepEqual(after.coveredTopicIds, before.coveredTopicIds);
  assert.equal(after.baseDigest, contentDigest(root));
  startStudy(root, { courseId: 'rag', topicId: topic.id });
  checkpointStudy(root, {
    sessionId: before.id,
    current: topic.id,
    coveredTopicIds: [topic.id],
    summary: 'Both questions',
    mastery: {},
    openQuestions: [],
  });
  finishStudy(root, {
    ...manifest,
    current: topic.id,
    notes: [
      ...manifest.notes,
      {
        topicId: topic.id,
        markdown: '# New question\n\nDiscussed explanation.',
        status: 'learning',
      },
    ],
  });
  assert.equal(load(root).progress.rag.topics[topic.id].status, 'learning');
});
