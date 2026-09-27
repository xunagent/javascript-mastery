import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chapters } from './content.mjs';
import { questions } from './questions.mjs';
import { shuffleChoices } from './shuffle.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist/network');
const preparedQuestions = questions.map(shuffleChoices);
const lessons = chapters.flatMap((chapter) => chapter.lessons);
const lessonIds = new Set(lessons.map((lesson) => lesson.id));
const questionIds = new Set();
const problems = [];

if (chapters.length !== 10) problems.push(`Expected 10 chapters, found ${chapters.length}`);
if (lessons.length !== 72) problems.push(`Expected 72 lessons, found ${lessons.length}`);
if (lessonIds.size !== lessons.length) problems.push('Duplicate lesson IDs');
for (const lesson of lessons) {
  if (!lesson.title || !lesson.goal || !lesson.explain || !lesson.source) problems.push(`${lesson.id}: missing teaching content`);
  if (!lesson.source.startsWith('https://')) problems.push(`${lesson.id}: invalid source URL`);
  if (!lesson.sourceLabel) problems.push(`${lesson.id}: missing source label`);
  if (lesson.book !== '—' && !/^\d+\.\d+(\.\d+)?$/.test(lesson.book)) problems.push(`${lesson.id}: invalid book reference`);
}
for (const q of preparedQuestions) {
  if (questionIds.has(q.id)) problems.push(`${q.id}: duplicate question ID`);
  questionIds.add(q.id);
  if (!lessonIds.has(q.lessonId)) problems.push(`${q.id}: missing lesson`);
  if (!q.title || !q.prompt || !q.explanation || q.hints?.length !== 3) problems.push(`${q.id}: incomplete content`);
  if (q.hints?.some((hint) => typeof hint !== 'string' || !hint.trim()) || new Set(q.hints).size !== 3) problems.push(`${q.id}: incomplete or repeated hints`);
  if (q.options && new Set(q.options).size !== q.options.length) problems.push(`${q.id}: duplicate options`);
  if (!['choice', 'multi', 'order', 'input'].includes(q.kind)) problems.push(`${q.id}: unsupported question kind`);
  if (q.kind === 'choice' && (!Array.isArray(q.options) || q.options.length < 2 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)) problems.push(`${q.id}: invalid choice`);
  if (q.kind === 'multi' && (!Array.isArray(q.options) || !Array.isArray(q.answer) || !q.answer.length || q.answer.some((n) => !Number.isInteger(n) || n < 0 || n >= q.options.length))) problems.push(`${q.id}: invalid multi choice`);
  if (q.kind === 'order' && (!Array.isArray(q.items) || q.items.length < 3 || q.answer?.slice().sort().join(',') !== q.items.map((_, i) => i).join(','))) problems.push(`${q.id}: invalid order`);
  if (q.kind === 'input' && (!Array.isArray(q.answers) || !q.answers.length)) problems.push(`${q.id}: invalid input`);
}

const coverage = new Map(lessons.map((lesson) => [lesson.id, 0]));
for (const q of preparedQuestions) coverage.set(q.lessonId, (coverage.get(q.lessonId) || 0) + 1);
if (process.argv.includes('--strict')) {
  for (const [id, count] of coverage) if (count < 14 || count > 16) problems.push(`${id}: ${count} questions, expected 14–16`);
  if (preparedQuestions.length < 1008) problems.push(`Only ${preparedQuestions.length} questions; need at least 1008`);
  for (const [kind, minimum] of [['multi', 60], ['order', 30], ['input', 25]]) {
    const count = preparedQuestions.filter((question) => question.kind === kind).length;
    if (count < minimum) problems.push(`Only ${count} ${kind} questions; need ${minimum}`);
  }
}
if (problems.length) {
  for (const problem of problems) console.error(problem);
  process.exitCode = 1;
} else {
  await mkdir(resolve(output, 'data'), { recursive: true });
  for (const file of ['index.html', 'app.js', 'quiz.mjs', 'style.css']) await copyFile(resolve(root, 'network/site', file), resolve(output, file));
  await writeFile(resolve(output, 'data/chapters.json'), JSON.stringify(chapters));
  await writeFile(resolve(output, 'data/questions.json'), JSON.stringify(preparedQuestions));
  console.log(`Network course: ${chapters.length} chapters, ${lessons.length} lessons, ${preparedQuestions.length} questions; ${[...coverage.values()].filter((n) => n >= 12).length} lessons ready for mastery.`);
}
