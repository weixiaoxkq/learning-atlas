import fs from 'node:fs';
import path from 'node:path';
import { studyContext, startStudy, checkpointStudy, finishStudy, closeStudy } from './lib/study.ts';
const [command, ...args] = process.argv.slice(2);
const options = Object.fromEntries(
  args.flatMap((a, i) =>
    a.startsWith('--')
      ? [[a.slice(2), !args[i + 1] || args[i + 1].startsWith('--') ? 'true' : args[i + 1]]]
      : [],
  ),
);
const root = path.resolve(options.root || '.');
const input = () => {
  if (!options.file) throw new Error('需要 --file JSON_FILE');
  return JSON.parse(fs.readFileSync(path.resolve(root, options.file), 'utf8'));
};
try {
  let result;
  if (command === 'context') result = studyContext(root, options.course);
  else if (command === 'start')
    result = startStudy(root, {
      courseId: options.course,
      topicId: options.topic,
      next: options.next === 'true',
    });
  else if (command === 'checkpoint') result = checkpointStudy(root, input());
  else if (command === 'finish') result = finishStudy(root, input());
  else if (command === 'close') result = closeStudy(root, options.session || '');
  else throw new Error(`未知学习命令: ${command}`);
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error((e as Error).message);
  process.exitCode = 1;
}
