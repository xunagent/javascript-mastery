export const REVIEW_DELAY = 3 * 24 * 60 * 60 * 1000;

export function isFirstAttemptIndependent(record, hintLevel, reveal) {
  return !record.attempts && !record.assisted && hintLevel === 0 && !reveal;
}

export function selectDiagnosticQuestions(chapter, questions, limit = 6) {
  const candidates = chapter.lessons.map((lesson) => questions.find((question) => question.lessonId === lesson.id)).filter(Boolean);
  const count = Math.min(limit, candidates.length);
  if (!count) return [];
  if (count === 1) return [candidates[0]];
  return Array.from({ length: count }, (_, index) => candidates[Math.round(index * (candidates.length - 1) / (count - 1))]);
}

export function reviewCandidates(questions, progress, now = Date.now()) {
  const available = new Map();
  for (const question of questions) {
    const record = progress[question.id] || {};
    if (record.attempts || record.assisted) continue;
    if (!available.has(question.lessonId)) available.set(question.lessonId, []);
    available.get(question.lessonId).push(question);
  }
  const output = [];
  for (const origin of questions) {
    const record = progress[origin.id] || {};
    const independentAt = record.independentAt || record.lastAt;
    if (!record.independent || record.reviewedWith || !independentAt || now - independentAt < REVIEW_DELAY) continue;
    const pool = available.get(origin.lessonId) || [];
    const index = pool.findIndex((question) => (question.family || question.id) !== (origin.family || origin.id));
    const variant = index < 0 ? null : pool.splice(index, 1)[0];
    if (variant) {
      output.push({ origin, variant });
    }
  }
  return output;
}

export function questionStatus(question, progress, reviewIds = new Set()) {
  const record = progress[question.id] || {};
  if (record.reviewedWith) return '巩固通过';
  if (reviewIds.has(question.id)) return '待复测';
  if (record.independent) return '初步通过';
  if (!record.attempts) return '待验证';
  if (record.passed) return '练习中';
  return '需补齐';
}

export function lessonStatus(lessonId, questions, progress, reviewIds = new Set()) {
  const items = questions.filter((question) => question.lessonId === lessonId);
  if (items.some((question) => {
    const partner = progress[question.id]?.reviewedWith;
    return partner && progress[partner]?.reviewedWith === question.id;
  })) return '巩固通过';
  if (items.some((question) => reviewIds.has(question.id))) return '待复测';
  if (items.some((question) => progress[question.id]?.independent)) return '初步通过';
  if (items.some((question) => progress[question.id]?.passed)) return '练习中';
  if (items.some((question) => progress[question.id]?.attempts)) return '需补齐';
  return '待验证';
}

export function reviewOrigin(question, questions, progress, now = Date.now()) {
  const current = progress[question.id] || {};
  if (current.assisted || current.attempts) return null;
  return questions.find((origin) => {
    if (origin.id === question.id || origin.lessonId !== question.lessonId || (origin.family || origin.id) === (question.family || question.id)) return false;
    const record = progress[origin.id] || {};
    const independentAt = record.independentAt || record.lastAt;
    return record.independent && !record.reviewedWith && independentAt && now - independentAt >= REVIEW_DELAY;
  }) || null;
}
