import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom/worker';

const outline = JSON.parse(readFileSync(new URL('../dist/data/outline.json', import.meta.url)));
const questions = JSON.parse(readFileSync(new URL('../dist/data/questions.json', import.meta.url)));
const lessons = new Set(outline.flatMap((part) => part.chapters.flatMap((chapter) => chapter.lessons.map((lesson) => lesson.id))));

test('directory reflects all source chapters and lessons', () => {
  assert.equal(outline.length, 3);
  assert.equal(outline.flatMap((part) => part.chapters).length, 27);
  assert.equal(lessons.size, 174);
});

test('every lesson has at least three distinct questions for practice and delayed review', () => {
  const counts = new Map();
  for (const question of questions) counts.set(question.lessonId, (counts.get(question.lessonId) || 0) + 1);
  for (const lessonId of lessons) assert.ok((counts.get(lessonId) || 0) >= 3, lessonId);
});

test('questions have stable IDs, valid lessons and complete teaching content', () => {
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  for (const question of questions) {
    assert.ok(lessons.has(question.lessonId), question.id);
    assert.ok(question.title && question.prompt?.length && question.explanation, question.id);
    assert.equal(question.hints?.length, 3, question.id);
    if (question.kind === 'code') {
      assert.ok(question.starter && question.solution && question.checks?.length >= 2, question.id);
      assert.ok(question.checks.every((check) => check.name && check.code), question.id);
      if (question.runtime === 'dom') assert.ok(question.fixture, question.id);
    } else {
      assert.ok(question.options?.length >= 3, question.id);
      assert.equal(new Set(question.options).size, question.options.length, question.id);
      assert.ok(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < question.options.length, question.id);
    }
  }
});

test('correct choices are not concentrated in one position', () => {
  const choices = questions.filter((question) => question.kind === 'choice');
  const counts = [0, 1, 2, 3].map((index) => choices.filter((question) => question.correct === index).length);
  assert.ok(counts.every((count) => count >= choices.length * 0.15 && count <= choices.length * 0.35), counts.join(', '));
});

test('all reference implementations pass their stated checks', async () => {
  const verdict = {
    equal(actual, expected, label) { assert.equal(actual, expected, label); },
    deepEqual(actual, expected, label) { assert.deepEqual(actual, expected, label); },
    ok(value, label) { assert.ok(value, label); },
    throws(callback, label) { assert.throws(callback, undefined, label); },
  };
  for (const question of questions.filter((item) => item.kind === 'code' && item.runtime !== 'dom')) {
    for (const check of question.checks) {
      try {
        const run = new Function('assert', `"use strict";\n${question.solution}\n${check.code}`);
        await run(verdict);
      } catch (error) {
        assert.fail(`${question.id} / ${check.name}: ${error.message}`);
      }
    }
  }
});

test('DOM reference implementations pass in the isolated DOM runtime', async () => {
  const verdict = {
    equal: assert.equal, deepEqual: assert.deepEqual, ok: assert.ok,
    throws: (callback) => assert.throws(callback),
  };
  for (const question of questions.filter((item) => item.runtime === 'dom')) {
    const { document, window } = parseHTML(`<!doctype html><html><body>${question.fixture}</body></html>`);
    const Event = window.Event;
    const MouseEvent = window.MouseEvent || window.Event;
    const CustomEvent = window.CustomEvent;
    try {
      new Function('document', 'window', 'Event', 'MouseEvent', 'CustomEvent', `"use strict";\n${question.solution}`)(document, window, Event, MouseEvent, CustomEvent);
      for (const check of question.checks) {
        const run = new Function('document', 'window', 'Event', 'MouseEvent', 'CustomEvent', 'assert', `"use strict";\n${check.code}`);
        await run(document, window, Event, MouseEvent, CustomEvent, verdict);
      }
    } catch (error) {
      assert.fail(`${question.id}: ${error.message}`);
    }
  }
});

test('common incorrect solutions are rejected for representative questions', async () => {
  const bad = {
    'object-copy-01': 'function createDraft(profile) { return { ...profile }; }',
    'array-methods-01': 'function mergeCart(items) { return items; }',
    'closure-02': 'function once(fn) { return (...args) => fn(...args); }',
    'json-01': 'function parseConfig(json) { return JSON.parse(json); }',
  };
  const verdict = {
    equal: assert.equal, deepEqual: assert.deepEqual, ok: assert.ok,
    throws: (callback) => assert.throws(callback),
  };
  for (const [id, source] of Object.entries(bad)) {
    const question = questions.find((item) => item.id === id);
    let failures = 0;
    for (const check of question.checks) {
      try { await new Function('assert', `"use strict";\n${source}\n${check.code}`)(verdict); }
      catch { failures++; }
    }
    assert.ok(failures > 0, `${id} accepted a known incorrect implementation`);
  }
});

test('repair exercises start with a localized fault that tests expose', async () => {
  const verdict = {
    equal: assert.equal, deepEqual: assert.deepEqual, ok: assert.ok,
    throws: (callback) => assert.throws(callback),
  };
  for (const question of questions.filter((item) => item.exerciseType === 'repair')) {
    const parent = questions.find((item) => item.id === question.family);
    assert.ok(parent && parent.lessonId === question.lessonId, question.id);
    let passed = 0;
    let failed = 0;
    for (const check of question.checks) {
      const run = new Function('assert', `"use strict";\n${question.starter}\n${check.code}`);
      try { await run(verdict); passed++; }
      catch { failed++; }
    }
    assert.ok(passed >= 1 && failed >= 1, `${question.id}: ${passed} passed, ${failed} failed`);
  }
});
