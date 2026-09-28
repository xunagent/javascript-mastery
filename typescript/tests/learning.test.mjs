import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyRecord,prepare,attempt,evidence,mergeProgress,normalizeProgress,normalizeDrafts,REVIEW_DELAY} from '../learning.mjs';
const now=Date.now()-REVIEW_DELAY*2;
const qs=Array.from({length:10},(_,i)=>({id:`q${i}`,stage:i>7?'review':i===3?'repair':i===5?'design':i===7?'transfer':'predict'}));
const pass=(at)=>({...emptyRecord(),lastActivity:at,attempts:[{correct:true,independent:true,at}]});
test('单靠选择题不能初步通过，必须包含实际技能',()=>{
  const p=Object.fromEntries(qs.slice(0,7).map((q,i)=>[q.id,pass(now+i)]));
  assert.equal(evidence(qs,p,now+20).initialAt,null);
  p.q7=pass(now+10);assert.equal(evidence(qs,p,now+20).initialAt,now+10);
});
test('预先练过复测题不计延后巩固，期限后需要两题',()=>{
  const p=Object.fromEntries(qs.map((q,i)=>[q.id,pass(now+i)]));
  const first=evidence(qs,p,now+REVIEW_DELAY+100);
  assert.equal(first.mastered,false);assert.equal(first.due,true);
  p.q8.attempts.push({at:first.dueAt+1,correct:true,independent:true});
  assert.equal(evidence(qs,p,first.dueAt+5).mastered,false);
  p.q9.attempts.push({at:first.dueAt+2,correct:true,independent:true});
  assert.equal(evidence(qs,p,first.dueAt+5).mastered,true);
});
test('提示与答错污染本轮，间隔三天可重新独立验证',()=>{
  let r=attempt(emptyRecord(),false,now);
  r=attempt(r,true,now+1);assert.equal(r.attempts.at(-1).independent,false);
  r=prepare(r,now+REVIEW_DELAY+2);r=attempt(r,true,now+REVIEW_DELAY+3);
  assert.equal(r.attempts.at(-1).independent,true);
  assert.equal(attempt({...emptyRecord(),assisted:true},true,now).attempts[0].independent,false);
});
test('导入合并保留两端记录和同轮帮助证据',()=>{
  const old={q0:{...pass(now),hints:3}},incoming={q0:{...pass(now+1),hints:0}};
  const m=mergeProgress(old,incoming);assert.equal(m.q0.attempts.length,2);assert.equal(m.q0.hints,3);
  assert.equal(mergeProgress(m,incoming).q0.attempts.length,2);
  assert.throws(()=>normalizeProgress({q0:{attempts:[{at:'bad'}]}},new Set(['q0'])));
});
test('草稿导入只保留题目文件并拒绝不完整草稿',()=>{
  const q=[{id:'x',files:{'main.ts':''}}];
  assert.throws(()=>normalizeDrafts({x:{at:now,files:{}}},q));
  assert.deepEqual(normalizeDrafts({x:{at:now,files:{'main.ts':'ok','hacked.ts':'no'}}},q),{x:{at:now,files:{'main.ts':'ok'}}});
});
