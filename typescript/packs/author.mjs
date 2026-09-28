export const ok = (name, code) => ({ name, code, expect: 'pass' });
export const bad = (name, code, codes = [2322, 2345, 2339, 2554, 2551, 2741, 2353, 2769, 2540]) => ({ name, code, expect: 'error', codes });
export const run = (name, code) => ({ name, code });
export function mc(lessonId, number, title, prompt, options, explanation, hints, extra = {}) {
  return { id: `${lessonId}-q${String(number).padStart(2, '0')}`, lessonId, kind: 'choice',
    stage: number >= 9 ? 'review' : 'predict', difficulty: '中等', title, prompt, options, answer: 0, explanation, hints, ...extra };
}
export function task(lessonId, number, title, prompt, files, solution, tests, explanation, hints, extra = {}) {
  return { id: `${lessonId}-q${String(number).padStart(2, '0')}`, lessonId, kind: 'code',
    stage: number >= 9 ? 'review' : number === 4 ? 'repair' : number === 6 ? 'design' : 'transfer',
    difficulty: '中等', title, prompt,
    files: typeof files === 'string' ? { 'main.ts': files } : files,
    solution: typeof solution === 'string' ? { 'main.ts': solution } : solution,
    tests, explanation, hints, ...extra };
}
