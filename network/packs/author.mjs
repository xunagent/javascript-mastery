// Each row is an authored scenario, not a runtime-generated question.
export function makePack(chapter, lessons) {
  return lessons.flatMap(({ concept, rows }, lesson) => rows.map((row, index) => {
    const [title, context, prompt, options, answer, explanation, clue, method] = row;
    const lessonId = `g${String(chapter).padStart(2, '0')}-l${String(lesson + 1).padStart(2, '0')}`;
    return {
      id: `${lessonId}-q${String(index + 1).padStart(2, '0')}`, lessonId,
      title, context, prompt, options, answer, explanation,
      kind: Array.isArray(answer) ? 'multi' : 'choice',
      hints: [concept, clue, method], difficulty: index >= 8 ? '进阶' : '中等',
    };
  }));
}
