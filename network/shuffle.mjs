import { createHash } from 'node:crypto';

export function shuffleChoices(question) {
  if (!['choice', 'multi'].includes(question.kind)) return question;
  const order = question.options.map((_, index) => index).sort((a, b) => {
    const keyA = createHash('sha256').update(`${question.id}:${a}`).digest('hex');
    const keyB = createHash('sha256').update(`${question.id}:${b}`).digest('hex');
    return keyA.localeCompare(keyB);
  });
  return {
    ...question,
    options: order.map((index) => question.options[index]),
    answer: question.kind === 'choice' ? order.indexOf(question.answer) : question.answer.map((index) => order.indexOf(index)).sort((a, b) => a - b),
  };
}
