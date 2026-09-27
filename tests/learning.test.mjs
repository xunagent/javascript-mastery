import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewCandidates, questionStatus, lessonStatus, reviewOrigin, selectDiagnosticQuestions, isFirstAttemptIndependent, REVIEW_DELAY } from '../dist/learning.mjs';

const questions = [
  { id: 'a', lessonId: 'same' },
  { id: 'b', lessonId: 'same' },
  { id: 'c', lessonId: 'other' },
];
const now = 1_800_000_000_000;

test('a distinct unseen question becomes due only after the delay', () => {
  const progress = { a: { attempts: 1, independent: true, independentAt: now - REVIEW_DELAY - 1 } };
  assert.deepEqual(reviewCandidates(questions, progress, now).map(({ variant }) => variant.id), ['b']);
  assert.equal(questionStatus(questions[1], progress, new Set(['b'])), '待复测');
  assert.equal(reviewOrigin(questions[1], questions, progress, now)?.id, 'a');
  assert.equal(reviewOrigin(questions[0], questions, progress, now), null);
  assert.deepEqual(reviewCandidates(questions, progress, now - REVIEW_DELAY), []);
});

test('repeating an attempted or assisted question cannot prove delayed mastery', () => {
  const origin = { attempts: 1, independent: true, independentAt: now - REVIEW_DELAY - 1 };
  assert.deepEqual(reviewCandidates(questions, { a: origin, b: { attempts: 1, passed: false } }, now), []);
  assert.deepEqual(reviewCandidates(questions, { a: origin, b: { assisted: true } }, now), []);
  assert.equal(reviewOrigin(questions[1], questions, { a: origin, b: { attempts: 1 } }, now), null);
  assert.equal(reviewOrigin(questions[1], questions, { a: origin, b: { assisted: true } }, now), null);
});

test('repairing the same exercise cannot count as a distinct review', () => {
  const variants = [
    { id: 'a', lessonId: 'same' },
    { id: 'a-repair', lessonId: 'same', family: 'a' },
    { id: 'b', lessonId: 'same' },
  ];
  const progress = { a: { attempts: 1, independent: true, independentAt: now - REVIEW_DELAY - 1 } };
  assert.equal(reviewCandidates(variants, progress, now)[0].variant.id, 'b');
  assert.equal(reviewOrigin(variants[1], variants, progress, now), null);
  assert.equal(reviewOrigin(variants[2], variants, progress, now)?.id, 'a');
});

test('a linked review pair has a distinct status', () => {
  const progress = { a: { independent: true, reviewedWith: 'b' }, b: { independent: true, reviewedWith: 'a' } };
  assert.deepEqual(reviewCandidates(questions, progress, now), []);
  assert.equal(questionStatus(questions[0], progress), '巩固通过');
  assert.equal(lessonStatus('same', questions, progress), '巩固通过');
});

test('lesson status tracks independent evidence without confusing practice with mastery', () => {
  assert.equal(lessonStatus('same', questions, {}), '待验证');
  assert.equal(lessonStatus('same', questions, { a: { attempts: 1 } }), '需补齐');
  assert.equal(lessonStatus('same', questions, { a: { attempts: 2, passed: true } }), '练习中');
  assert.equal(lessonStatus('same', questions, { a: { attempts: 1, independent: true } }), '初步通过');
  assert.equal(lessonStatus('same', questions, { a: { attempts: 1, independent: true } }, new Set(['b'])), '待复测');
  assert.equal(lessonStatus('same', questions, { a: { reviewedWith: 'b' }, b: {} }), '待验证');
});

test('chapter diagnostic samples distinct lessons across the chapter', () => {
  const chapter = { lessons: Array.from({ length: 12 }, (_, index) => ({ id: `lesson-${index}` })) };
  const bank = chapter.lessons.map((lesson) => ({ id: `${lesson.id}-q`, lessonId: lesson.id }));
  const selected = selectDiagnosticQuestions(chapter, bank, 5);
  assert.deepEqual(selected.map((question) => question.lessonId), ['lesson-0','lesson-3','lesson-6','lesson-8','lesson-11']);
  assert.deepEqual(selectDiagnosticQuestions(chapter, [], 5), []);
});

test('only an unassisted first attempt can validate independent understanding', () => {
  assert.equal(isFirstAttemptIndependent({}, 0, false), true);
  assert.equal(isFirstAttemptIndependent({ attempts: 1, passed: false }, 0, false), false);
  assert.equal(isFirstAttemptIndependent({ assisted: true }, 0, false), false);
  assert.equal(isFirstAttemptIndependent({}, 1, false), false);
  assert.equal(isFirstAttemptIndependent({}, 0, true), false);
});
