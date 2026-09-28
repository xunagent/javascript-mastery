export const REVIEW_DELAY = 3 * 24 * 60 * 60 * 1000;
export const emptyRecord = () => ({ attempts: [], hints: 0, assisted: false, lastActivity: 0, roundStartedAt: 0, skipped: false });
export const independent = (record) => Boolean(record?.attempts.some((a) => a.correct && a.independent));
export function prepare(record = emptyRecord(), now = Date.now()) {
  if (record.lastActivity && now - record.lastActivity >= REVIEW_DELAY) return { ...record, hints: 0, assisted: false, roundStartedAt: now, lastActivity: now };
  return record;
}
export function attempt(record, correct, now = Date.now()) {
  const helped = record.assisted || record.hints > 0 || record.attempts.some((a) => a.at >= record.roundStartedAt);
  return { ...record, skipped: false, lastActivity: now, attempts: [...record.attempts, { at: now, correct, independent: correct && !helped }] };
}
export function evidence(questions, progress, now = Date.now()) {
  const core = questions.filter((q) => q.stage !== 'review');
  const reviews = questions.filter((q) => q.stage === 'review');
  const passed = core.map((q) => ({ q, at: progress[q.id]?.attempts.find((a) => a.independent && a.correct)?.at }))
    .filter((r) => r.at !== undefined).sort((a, b) => a.at - b.at);
  const requiredStages = ['repair', 'design', 'transfer'].filter((stage) => core.some((q) => q.stage === stage));
  let initialAt = null;
  for (let i = 5; i < passed.length; i++) {
    const first = passed.slice(0, i + 1);
    if (requiredStages.every((stage) => first.some((r) => r.q.stage === stage))) { initialAt = passed[i].at; break; }
  }
  const dueAt = initialAt === null ? null : initialAt + REVIEW_DELAY;
  const reviewIds = dueAt === null ? [] : reviews.filter((q) => progress[q.id]?.attempts.some((a) => a.correct && a.independent && a.at >= dueAt)).map((q) => q.id);
  const ready = questions.length >= 10 && reviews.length >= 2;
  const mastered = ready && reviewIds.length >= 2;
  const due = dueAt !== null && now >= dueAt && !mastered;
  return {
    passed: passed.length, initialAt, dueAt, reviewIds, due, mastered, ready,
    missingStages: requiredStages.filter((stage) => !passed.some((r) => r.q.stage === stage)),
    status: !ready ? '题库编写中' : mastered ? '巩固通过' : due ? '到期复测' : initialAt !== null ? '初步通过' : passed.length ? `独立通过 ${passed.length} 题` : '待开始',
  };
}
export function normalizeProgress(value, ids) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('学习记录应为对象。');
  const result = {};
  for (const [id, r] of Object.entries(value)) {
    if (!ids.has(id)) continue;
    if (!r || !Array.isArray(r.attempts) || r.attempts.length > 10000) throw Error('答题记录无效。');
    const attempts = r.attempts.map((a) => {
      if (!a || !Number.isFinite(a.at) || a.at < 0 || a.at > Date.now() + 300000 || typeof a.correct !== 'boolean' || typeof a.independent !== 'boolean') throw Error('答题时间或结果无效。');
      return { at: a.at, correct: a.correct, independent: a.correct && a.independent };
    });
    result[id] = {
      attempts: [...new Map(attempts.map((a) => [JSON.stringify(a), a])).values()].sort((a, b) => a.at - b.at),
      hints: Number.isInteger(r.hints) ? Math.min(4, Math.max(0, r.hints)) : 0,
      assisted: Boolean(r.assisted),
      lastActivity: Math.max(Number.isFinite(r.lastActivity) ? Math.min(Date.now(), Math.max(0, r.lastActivity)) : 0, ...attempts.map((a) => a.at)),
      roundStartedAt: Number.isFinite(r.roundStartedAt) ? Math.min(Date.now(), Math.max(0, r.roundStartedAt)) : 0,
      skipped: Boolean(r.skipped),
    };
  }
  return result;
}
export function mergeProgress(left, right) {
  const merged = structuredClone(left);
  for (const [id, r] of Object.entries(right)) {
    if (!merged[id]) { merged[id] = r; continue; }
    const old = merged[id];
    const latest = old.lastActivity >= r.lastActivity ? old : r;
    merged[id] = { ...latest, assisted: old.roundStartedAt === r.roundStartedAt ? old.assisted || r.assisted : latest.assisted, hints: old.roundStartedAt === r.roundStartedAt ? Math.max(old.hints, r.hints) : latest.hints,
      attempts: [...new Map([...old.attempts, ...r.attempts].map((a) => [JSON.stringify(a), a])).values()].sort((a, b) => a.at - b.at) };
  }
  return merged;
}
export function normalizeDrafts(value, questions) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('代码草稿格式无效。');
  const output = {};
  for (const [id, draft] of Object.entries(value)) {
    const q = questions.find((q) => q.id === id);
    if (!q?.files) continue;
    if (!draft || !Number.isFinite(draft.at) || draft.at < 0 || draft.at > Date.now() + 300000 || !draft.files || typeof draft.files !== 'object') throw Error('代码草稿无效。');
    if (Object.keys(q.files).some((name) => typeof draft.files[name] !== 'string' || draft.files[name].length > 80000)) throw Error('代码草稿文件不完整或过长。');
    output[id] = { at: draft.at, files: Object.fromEntries(Object.keys(q.files).map((name) => [name, draft.files[name]])) };
  }
  return output;
}
