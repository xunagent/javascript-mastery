export const REVIEW_DELAY = 3 * 24 * 60 * 60 * 1000;

export function judge(question, raw) {
  if (question.kind === 'choice') return raw !== null && raw !== undefined && String(raw).trim() !== '' && Number(raw) === question.answer;
  if (question.kind === 'multi') return Array.isArray(raw) && raw.slice().sort().join(',') === question.answer.slice().sort().join(',');
  if (question.kind === 'order') return Array.isArray(raw) && raw.join(',') === question.answer.join(',');
  if (question.kind === 'input') return question.answers.some((answer) => String(raw).trim().toLowerCase() === String(answer).trim().toLowerCase());
  return false;
}

export function independentPass(record) {
  return Boolean(record?.attempts?.some((attempt) => attempt.independent && attempt.correct));
}

function independentAttempts(questions, progress) {
  return questions.flatMap((question) => (progress[question.id]?.attempts || [])
    .filter((attempt) => attempt.independent && attempt.correct)
    .map((attempt) => ({ questionId: question.id, at: attempt.at })))
    .sort((a, b) => a.at - b.at);
}

export function lessonEvidence(questions, progress, now = Date.now()) {
  const passes = independentAttempts(questions, progress);
  const unique = [...new Map(passes.slice().reverse().map((pass) => [pass.questionId, pass])).values()].sort((a, b) => a.at - b.at);
  const initial = unique.slice(0, 7);
  const initialAt = initial.length === 7 ? initial[6].at : null;
  const initialIds = new Set(initial.map((pass) => pass.questionId));
  const dueAt = initialAt === null ? null : initialAt + REVIEW_DELAY;
  const reviewIds = new Set(dueAt === null ? [] : passes.filter((pass) => !initialIds.has(pass.questionId) && pass.at >= dueAt).map((pass) => pass.questionId));
  return { passes: unique.length, initialAt, dueAt, initialIds: [...initialIds], reviewIds: [...reviewIds], reviewed: reviewIds.size >= 2, due: dueAt !== null && now >= dueAt && reviewIds.size < 2 };
}

export function reviewDue(questions, progress, now = Date.now()) {
  return lessonEvidence(questions, progress, now).due;
}

// An assisted/incorrect attempt never becomes independent by immediately retrying.
// After three days without activity on this question a new unassisted round can begin.
export function prepareAttempt(record = { attempts: [], hints: 0 }, now = Date.now()) {
  const latest = Math.max(record.lastActivity || 0, ...record.attempts.map((attempt) => attempt.at));
  if ((record.hints || record.attempts.length) && now - latest >= REVIEW_DELAY) {
    return { ...record, hints: 0, roundStartedAt: now, lastActivity: now };
  }
  return record;
}

export function answerQuestion(question, record, raw, now = Date.now()) {
  const correct = judge(question, raw);
  const helped = record.hints > 0 || record.attempts.some((attempt) => attempt.at >= (record.roundStartedAt || 0));
  return { ...record, lastActivity: now, skipped: false, attempts: [...record.attempts, { at: now, correct, helped, independent: correct && !helped, answer: raw }] };
}

export function normalizeProgress(value, knownIds) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('学习记录格式不正确');
  const entries = Object.entries(value).filter(([id]) => knownIds.has(id)).map(([id, record]) => {
    if (!record || typeof record !== 'object' || !Array.isArray(record.attempts)) throw Error('答题记录格式不正确');
    const attempts = record.attempts.map((attempt) => {
      if (!attempt || !Number.isFinite(attempt.at) || attempt.at < 0 || typeof attempt.correct !== 'boolean' || typeof attempt.independent !== 'boolean') throw Error('答题记录无效');
      return { at: attempt.at, correct: attempt.correct, independent: attempt.correct && attempt.independent, helped: Boolean(attempt.helped), answer: attempt.answer };
    });
    return [id, { attempts, hints: Number.isInteger(record.hints) ? Math.min(4, Math.max(0, record.hints)) : 0, skipped: Boolean(record.skipped), lastActivity: Number.isFinite(record.lastActivity) ? Math.max(0, record.lastActivity) : 0, roundStartedAt: Number.isFinite(record.roundStartedAt) ? Math.max(0, record.roundStartedAt) : 0 }];
  });
  return Object.fromEntries(entries);
}

export function mergeProgress(current, incoming) {
  const merged = structuredClone(current);
  for (const [id, record] of Object.entries(incoming)) {
    const old = merged[id];
    if (!old) { merged[id] = record; continue; }
    const activity = (r) => Math.max(r.lastActivity || 0, ...r.attempts.map((attempt) => attempt.at));
    const latest = activity(record) >= activity(old) ? record : old;
    const attempts = [...new Map([...old.attempts, ...record.attempts].map((attempt) => [JSON.stringify(attempt), attempt])).values()].sort((a, b) => a.at - b.at);
    merged[id] = { ...latest, attempts };
  }
  return merged;
}

export function lessonStatus(questions, progress, now = Date.now()) {
  const { passes, reviewed, due } = lessonEvidence(questions, progress, now);
  if (!questions.length) return '题目待补齐';
  if (questions.length < 12) return `${passes} 道独立通过 · 题库建设中`;
  if (passes >= 7) {
    if (reviewed) return '巩固通过';
    if (due) return '到期复测';
    return '初步通过 · 等待复测';
  }
  return passes ? `${passes} 道独立通过` : '待开始';
}
