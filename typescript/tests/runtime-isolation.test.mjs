import test from 'node:test';
import assert from 'node:assert/strict';
import { isolatedRuntime } from './runtime-isolation.mjs';

test('遗留拒绝只让当前提交失败，下一次仍可正常运行',async()=>{
  const failed=await isolatedRuntime({'main.js':'exports.run=()=>{Promise.reject("orphan");};'},[{name:'调用',code:'load("main.js").run();'}]);
  assert.equal(failed.every(c=>c.passed),false);
  assert.match(failed[0].message,/orphan/);
  const passed=await isolatedRuntime({'main.js':'exports.run=()=>Promise.resolve(3);'},[{name:'调用',code:'equal(await load("main.js").run(),3);'}]);
  assert.equal(passed.every(c=>c.passed),true);
});

test('无法结束的微任务与 Promise 都被隔离超时终止',async()=>{
  for(const code of [
    'exports.run=async()=>{while(true){await Promise.resolve();}};',
    'exports.run=()=>new Promise(()=>{});',
  ]){
    const result=await isolatedRuntime({'main.js':code},[{name:'调用',code:'await load("main.js").run();'}],100);
    assert.equal(result.every(c=>c.passed),false);
    assert.match(result[0].message,/超时|timed out/);
  }
});
