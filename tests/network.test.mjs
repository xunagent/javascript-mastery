import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters } from '../network/content.mjs';
import { questions } from '../network/questions.mjs';
import { judge, lessonStatus, reviewDue, REVIEW_DELAY, prepareAttempt, answerQuestion, normalizeProgress, mergeProgress, lessonEvidence } from '../network/site/quiz.mjs';
import { shuffleChoices } from '../network/shuffle.mjs';

test('network course outline has the planned 10 chapters and 72 unique lessons', () => {
  const lessons = chapters.flatMap((chapter) => chapter.lessons);
  assert.equal(chapters.length, 10);
  assert.equal(lessons.length, 72);
  assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 72);
  assert.ok(lessons.every((lesson) => lesson.explain && lesson.source.startsWith('https://')));
  assert.ok(questions.every((question) => lessons.some((lesson) => lesson.id === question.lessonId)));
});

test('each automatically graded answer type accepts the intended response only', () => {
  assert.equal(judge({ kind: 'choice', answer: 2 }, 2), true);
  assert.equal(judge({ kind: 'choice', answer: 2 }, 1), false);
  assert.equal(judge({ kind: 'multi', answer: [0, 2] }, [2, 0]), true);
  assert.equal(judge({ kind: 'multi', answer: [0, 2] }, [0]), false);
  assert.equal(judge({ kind: 'order', answer: [2, 0, 1] }, [2, 0, 1]), true);
  assert.equal(judge({ kind: 'order', answer: [2, 0, 1] }, [0, 1, 2]), false);
  assert.equal(judge({ kind: 'input', answers: ['304', 'Not Modified'] }, ' not modified '), true);
});

test('choice shuffling keeps the correct option attached to the answer', () => {
  const original = { id: 'shuffle-check', kind: 'choice', options: ['wrong A', 'correct', 'wrong B', 'wrong C'], answer: 1 };
  const shuffled = shuffleChoices(original);
  assert.equal(shuffled.options[shuffled.answer], 'correct');
  assert.deepEqual(shuffleChoices(original), shuffled);
  const multiple = shuffleChoices({ id: 'shuffle-many', kind: 'multi', options: ['correct A', 'wrong', 'correct B'], answer: [0, 2] });
  assert.deepEqual(multiple.answer.map((index) => multiple.options[index]).sort(), ['correct A', 'correct B']);
});

test('mastery requires enough questions and a different independent pass after three days', () => {
  const items = Array.from({ length: 12 }, (_, index) => ({ id: `q${index}` }));
  const now = 1_000_000_000;
  const early = Object.fromEntries(items.slice(0, 7).map((question) => [question.id, { attempts: [{ at: now - REVIEW_DELAY - 1, independent: true, correct: true }] }]));
  assert.equal(reviewDue(items, early, now), true);
  assert.equal(lessonStatus(items, early, now), '到期复测');
  const helped = structuredClone(early);
  helped.q7 = { attempts: [{ at: now, independent: false, correct: true, helped: true }] };
  assert.equal(reviewDue(items, helped, now), true);
  const reviewed = structuredClone(early);
  reviewed.q7 = { attempts: [{ at: now, independent: true, correct: true }] };
  assert.equal(reviewDue(items, reviewed, now), true);
  reviewed.q8 = { attempts: [{ at: now, independent: true, correct: true }] };
  assert.equal(reviewDue(items, reviewed, now), false);
  assert.equal(lessonStatus(items, reviewed, now), '巩固通过');
  assert.match(lessonStatus(items.slice(0, 6), reviewed, now), /题库建设中/);
});

test('review clock starts after the seventh distinct pass, not the first correct answer', () => {
  const items = Array.from({ length: 12 }, (_, i) => ({ id: `q${i}` }));
  const now = 1_000_000_000;
  const progress = Object.fromEntries(items.slice(0, 7).map((q, i) => [q.id, { attempts: [{ at: i === 6 ? now : now - REVIEW_DELAY * 2, correct: true, independent: true }] }]));
  assert.equal(reviewDue(items, progress, now), false);
  assert.equal(lessonEvidence(items, progress, now).dueAt, now + REVIEW_DELAY);
  progress.q0.attempts.push({ at: now + REVIEW_DELAY, correct: true, independent: true });
  assert.equal(lessonEvidence(items, progress, now + REVIEW_DELAY).reviewIds.length, 0, 'repeating an initial qualifying question is not a new review scenario');
});

test('wrong answers and hints cannot be retried immediately for independent credit, but learning never dead-ends', () => {
  const q = { kind: 'choice', answer: 1 };
  const now = 1_000_000_000;
  let record = answerQuestion(q, { attempts: [], hints: 0 }, 0, now);
  record = answerQuestion(q, record, 1, now + 1);
  assert.equal(record.attempts.at(-1).independent, false);
  assert.equal(prepareAttempt(record, now + 2), record);
  record = prepareAttempt(record, now + REVIEW_DELAY + 2);
  record = answerQuestion(q, record, 1, now + REVIEW_DELAY + 3);
  assert.equal(record.attempts.at(-1).independent, true);
  const hinted = answerQuestion(q, { attempts: [], hints: 1, lastActivity: now }, 1, now + 1);
  assert.equal(hinted.attempts[0].independent, false);
  const fresh = prepareAttempt(hinted, now + REVIEW_DELAY + 2);
  assert.equal(fresh.hints, 0);
  assert.equal(answerQuestion(q, fresh, 1, now + REVIEW_DELAY + 3).attempts.at(-1).independent, true);
});

test('malformed imports fail before replacing progress, and valid device records merge without duplicates', () => {
  const known = new Set(['q0', 'q1']);
  assert.throws(() => normalizeProgress({ q0: { attempts: 'bad' } }, known));
  assert.throws(() => normalizeProgress({ q0: { attempts: [{ at: 'yesterday' }] } }, known));
  const first = { at: 100, correct: true, independent: true, helped: false, answer: 1 };
  const second = { at: 200, correct: false, independent: false, helped: false, answer: 0 };
  const current = normalizeProgress({ q0: { attempts: [first], hints: 0 } }, known);
  const incoming = normalizeProgress({ q0: { attempts: [first, second], hints: 1 }, q1: { attempts: [], skipped: true }, unknown: { bad: true } }, known);
  const merged = mergeProgress(current, incoming);
  assert.equal(merged.q0.attempts.length, 2);
  assert.equal(merged.q0.hints, 1);
  assert.equal(merged.q1.skipped, true);
  assert.equal(merged.unknown, undefined);
  assert.equal(current.q0.attempts.length, 1);
});
