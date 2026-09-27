import { readFileSync } from 'node:fs';

const outline = JSON.parse(readFileSync(new URL('../dist/data/outline.json', import.meta.url)));
const questions = JSON.parse(readFileSync(new URL('../dist/data/questions.json', import.meta.url)));
const byLesson = new Map();
for (const question of questions) byLesson.set(question.lessonId, (byLesson.get(question.lessonId) || 0) + 1);
const chapters = outline.flatMap((part) => part.chapters);
const lessons = chapters.flatMap((chapter) => chapter.lessons);
const covered = lessons.filter((lesson) => byLesson.has(lesson.id));
const uncovered = lessons.filter((lesson) => !byLesson.has(lesson.id));
const reviewReady = lessons.filter((lesson) => (byLesson.get(lesson.id) || 0) >= 2);
const singleQuestion = lessons.filter((lesson) => (byLesson.get(lesson.id) || 0) === 1);
const deepPractice = lessons.filter((lesson) => (byLesson.get(lesson.id) || 0) >= 3);
const TARGET_QUESTIONS = 1800;
const PRACTICE_FLOOR = 6;
const practiceReady = lessons.filter((lesson) => (byLesson.get(lesson.id) || 0) >= PRACTICE_FLOOR);
const byKind = questions.reduce((totals, question) => {
  const kind = question.runtime === 'dom' ? 'DOM 编码' : question.kind === 'code' ? 'JavaScript 编码' : '选择判断';
  totals[kind] = (totals[kind] || 0) + 1;
  return totals;
}, {});

console.log(`章节 ${chapters.length}/27，知识小节覆盖 ${covered.length}/${lessons.length}，正式题目 ${questions.length}/${TARGET_QUESTIONS}`);
console.log(`具备不同题延迟复测的小节 ${reviewReady.length}/${lessons.length}；至少 3 题的小节 ${deepPractice.length}/${lessons.length}；仅有 1 题的小节 ${singleQuestion.length}`);
console.log(`达到每节至少 ${PRACTICE_FLOOR} 题训练底线的小节 ${practiceReady.length}/${lessons.length}`);
console.log(`题型：${Object.entries(byKind).map(([kind, count]) => `${kind} ${count}`).join('，')}`);
console.log(`其中调试修复题 ${questions.filter((question) => question.exerciseType === 'repair').length}`);
console.log('每章题量：');
for (const chapter of chapters) {
  const count = chapter.lessons.reduce((sum, lesson) => sum + (byLesson.get(lesson.id) || 0), 0);
  const lessonCoverage = chapter.lessons.filter((lesson) => byLesson.has(lesson.id)).length;
  const chapterReviewReady = chapter.lessons.filter((lesson) => (byLesson.get(lesson.id) || 0) >= 2).length;
  console.log(`${String(count).padStart(3)}  ${chapter.title}  (${lessonCoverage}/${chapter.lessons.length} 覆盖，${chapterReviewReady}/${chapter.lessons.length} 可复测)`);
}
if (uncovered.length) {
  console.log(`尚未覆盖的 ${uncovered.length} 个小节：`);
  for (const lesson of uncovered) console.log(`- ${lesson.title}  ${lesson.url}`);
}
if (process.argv.includes('--detail') && singleQuestion.length) {
  console.log('缺少独立复测题的小节：');
  for (const lesson of singleQuestion) console.log(`- ${lesson.id}：${lesson.title}`);
}
if (process.argv.includes('--strict') && (uncovered.length || practiceReady.length < lessons.length || questions.length < TARGET_QUESTIONS)) {
  console.error('完整版本验收未通过：目录、每节训练底线及总题量目标尚未同时满足。');
  process.exitCode = 1;
}
