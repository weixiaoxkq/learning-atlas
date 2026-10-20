import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { load, validate, stats, courseMap, globalMap } from '../src/lib/data.ts';
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-source-'));
fs.mkdirSync(path.join(fixtureRoot, 'content/courses'), { recursive: true });
fs.mkdirSync(path.join(fixtureRoot, 'content/notes'), { recursive: true });
fs.cpSync('templates', path.join(fixtureRoot, 'templates'), { recursive: true });
execFileSync(process.execPath, [path.resolve('tests/fixtures/seed.mjs')], { cwd: fixtureRoot });
const source = load(fixtureRoot);
after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
const clone = () => structuredClone(source);
test('three demo courses and exact progress counts', () => {
  assert.equal(source.courses.length, 3);
  for (const c of source.courses) {
    assert.equal(c.demo, true);
    assert.equal(c.modules.length, 3);
    assert.deepEqual(stats(c, source.progress[c.id]), {
      not_started: 5,
      learning: 1,
      reviewing: 1,
      completed: 2,
      total: 9,
      percent: 22,
    });
  }
});
test('derived maps retain topic links and nested modules', () => {
  const d = clone(),
    c = d.courses.find((c) => c.id === 'rag')!;
  c.modules[0].children = [c.modules.pop()!];
  const md = courseMap(c, '/atlas/');
  assert.match(md, /  - 评估与实践/);
  for (const t of c.topics) assert.ok(md.includes(`/atlas/topics/${t.id}/`));
  assert.match(globalMap(d, '/atlas/'), /\/atlas\/courses\/redis\//);
});
const cases: [string, (d: typeof source) => void, RegExp][] = [
  ['duplicate course', (d) => d.courses.push(d.courses[0]), /重复 course/],
  ['duplicate topic', (d) => d.courses[0].topics.push(d.courses[0].topics[0]), /重复 topic/],
  ['missing category', (d) => (d.courses[0].category = 'absent'), /分类不存在/],
  ['missing prerequisite', (d) => (d.courses[0].topics[0].prerequisites = ['missing']), /前置知识/],
  [
    'cycle',
    (d) => (d.courses[0].topics[0].prerequisites = [d.courses[0].topics[1].id]),
    /循环依赖/,
  ],
  [
    'unknown state',
    (d) => ((d.progress.rag.topics['rag-1'] as any).status = 'done'),
    /Invalid enum/,
  ],
  ['missing progress', (d) => delete d.progress.rag.topics['rag-1'], /进度不一致/],
  ['roadmap mismatch', (d) => d.courses[0].modules[0].topics.pop(), /路线与知识点不一致/],
  ['invalid current', (d) => (d.progress.rag.current = 'missing'), /无效当前位置/],
  ['missing evidence', (d) => delete d.progress.rag.topics['rag-1'].evidence, /缺少证据/],
  [
    'duplicate module',
    (d) => (d.courses[0].modules[1].id = d.courses[0].modules[0].id),
    /重复 module/,
  ],
  ['invalid related', (d) => (d.courses[0].topics[0].related = ['absent']), /关联不存在/],
];
for (const [name, mutate, pattern] of cases)
  test(name, () => {
    const d = clone();
    mutate(d);
    assert.throws(() => validate(d, fixtureRoot), pattern);
  });
test('rename and module moves preserve progress', () => {
  const d = clone();
  d.courses[0].title = '新标题';
  d.courses[0].topics[0].title = '改名';
  d.courses[0].modules.reverse();
  validate(d, fixtureRoot);
  assert.deepEqual(d.progress, source.progress);
});
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-test-'));
  fs.cpSync(path.join(fixtureRoot, 'content'), path.join(root, 'content'), { recursive: true });
  fs.cpSync('templates', path.join(root, 'templates'), { recursive: true });
  return root;
}
test('missing Markdown and invalid internal links are rejected', () => {
  const root = fixture();
  try {
    fs.appendFileSync(path.join(root, 'content/notes/rag-1.md'), '\n[broken](topic:absent)');
    assert.throws(() => load(root), /错误内部链接/);
    fs.unlinkSync(path.join(root, 'content/notes/rag-1.md'));
    assert.throws(() => load(root), /缺失 Markdown/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
test('CLI creates courses and topics, preserves progress, guards completion', () => {
  const root = fixture();
  const cli = (...args: string[]) =>
    execFileSync(process.execPath, ['--import', 'tsx', 'scripts/cli.ts', ...args, '--root', root], {
      encoding: 'utf8',
      stdio: 'pipe',
    });
  try {
    cli('course:new', '--name', 'Kubernetes', '--category', '计算机科学');
    let d = load(root);
    const c = d.courses.find((c) => !c.demo)!;
    assert.equal(c.topics.length, 0);
    assert.equal(c.category, 'cs');
    cli('topic:new', '--course', c.id, '--module', 'basics', '--name', 'Pods');
    d = load(root);
    assert.deepEqual(d.progress.rag, source.progress.rag);
    const tid = d.courses.find((x) => x.id === c.id)!.topics[0].id;
    assert.equal(d.progress[c.id].topics[tid].status, 'not_started');
    assert.throws(() => cli('progress', '--course', c.id, '--topic', tid, '--status', 'completed'));
    cli('progress', '--course', c.id, '--topic', tid, '--status', 'completed', '--confirmed');
    assert.equal(load(root).progress[c.id].topics[tid].status, 'completed');
    assert.match(
      cli('progress', '--course', 'rag', '--topic', 'rag-5', '--status', 'learning'),
      /前置知识/,
    );
    cli('export');
    assert.ok(fs.existsSync(path.join(root, 'exports/atlas.json')));
    cli('maps');
    assert.ok(
      fs.readFileSync(path.join(root, 'exports/maps/global.md'), 'utf8').includes('Kubernetes'),
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('Markdown renders CJK headings, math, fenced and indented code, Mermaid and stable links', async () => {
  const { renderMarkdown } = await import('../src/lib/markdown.ts');
  const html = await renderMarkdown(
    '# 数学笔记\n\n## 二次公式\n\n$x^2$\n\n```typescript\nconst x = 1;\n```\n\n    code example\n\n```mermaid\ngraph LR\n A-->B\n```\n\n[已有知识](topic:rag-1)',
    '/atlas/',
  );
  assert.ok(html.includes('id="二次公式"'));
  assert.ok(html.includes('class="katex"'));
  assert.ok(html.includes('shiki'));
  assert.ok(html.includes('code example'));
  assert.ok(html.includes('class="mermaid"'));
  assert.ok(html.includes('/atlas/topics/rag-1/'));
});

for (const [repo, base] of [
  ['alice/learning-atlas', '/learning-atlas'],
  ['Alice/alice.github.io', '/'],
])
  test(`Pages config ${repo}`, () => {
    const result = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        "import c from './astro.config.mjs';console.log(JSON.stringify({base:c.base,site:c.site}))",
      ],
      {
        encoding: 'utf8',
        env: { ...process.env, GITHUB_REPOSITORY: repo, BASE_PATH: '', SITE_URL: '' },
      },
    );
    const config = JSON.parse(result);
    assert.equal(config.base, base);
    assert.equal(config.site, `https://${repo.split('/')[0]}.github.io`);
  });
