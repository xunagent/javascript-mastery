import { questions } from './questions.mjs';
import { fullJudge } from './tests/helpers.mjs';
const errors=[];
let checked=0;
for(const q of questions.filter((q)=>q.kind==='code')) {
  const solution=await fullJudge(q,q.solution);
  if(!solution.passed)errors.push({id:q.id,problem:'参考答案未通过',result:solution});
  const starter=await fullJudge(q,q.files);
  if(starter.passed)errors.push({id:q.id,problem:'初始代码直接通过，缺少有效任务'});
  for(const [index,wrong] of (q.wrongSolutions||[]).entries())if((await fullJudge(q,wrong)).passed)errors.push({id:q.id,problem:`典型错误答案${index+1}未被拒绝`});
  checked++;
}
if(errors.length){console.error(JSON.stringify(errors,null,2));process.exitCode=1;}else console.log(`TS semantic audit: ${checked} reference answers passed, all ${checked} starters rejected.`);
