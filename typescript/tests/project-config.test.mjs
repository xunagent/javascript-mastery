import test from 'node:test';
import assert from 'node:assert/strict';
import {checker} from './helpers.mjs';
const project={configFile:'tsconfig.json'};

test('项目配置按 include 和 exclude 选择入口，导入仍带入依赖',()=>{
  const files={
    'tsconfig.json':'{"include":["src/**/*.ts"],"exclude":["src/**/*.test.ts","shared"]}',
    'src/main.ts':'import {value} from "../shared/value";export const n:number=value;',
    'src/main.test.ts':'export const bad:number="bad";',
    'shared/value.ts':'export const value=1;',
    'scratch.ts':'export const bad:number="bad";',
  };
  const result=checker.compile(files,{},project);
  assert.deepEqual(result.diagnostics,[]);assert.deepEqual(result.rootNames,['src/main.ts']);
  assert.ok(result.program.getSourceFile('/course/shared/value.ts'));
  assert.equal(result.program.getSourceFile('/course/scratch.ts'),undefined);
});

test('files 指定入口不被 exclude 移除，被导入的排除文件仍需检查',()=>{
  const files={'tsconfig.json':'{"files":["main.ts"],"exclude":["**/*"]}','main.ts':'import {value} from "./excluded/value";export {value};','excluded/value.ts':'export const value:number="wrong";'};
  const result=checker.compile(files,{},project);
  assert.deepEqual(result.rootNames,['main.ts']);
  assert.ok(result.diagnostics.some(d=>d.file==='excluded/value.ts'&&d.code===2322));
});

test('配置支持 JSONC、extends 和相对于配置来源的路径',()=>{
  const files={'tsconfig.json':'{ // extends a local config\n"extends":"./config/base.json", }','config/base.json':'{"compilerOptions":{"strict":true,"noUncheckedIndexedAccess":true},"include":["../src/**/*.ts"]}','src/main.ts':'export const values:number[]=[];export const first:number=values[0];','other.ts':'export const bad:number="wrong";'};
  const result=checker.compile(files,{},project);
  assert.deepEqual(result.rootNames,['src/main.ts']);
  assert.ok(result.diagnostics.some(d=>d.file==='src/main.ts'&&d.code===2322));
  assert.equal(result.options.noUncheckedIndexedAccess,true);
});

test('配置缺失、语法错误和不存在的入口都有诊断',()=>{
  assert.ok(checker.compile({'main.ts':'export {};'}, {},project).diagnostics.some(d=>d.code===5083));
  assert.ok(checker.compile({'tsconfig.json':'{ broken','main.ts':'export {};'}, {},project).diagnostics.length);
  assert.ok(checker.compile({'tsconfig.json':'{"files":["missing.ts"]}'}, {},project).diagnostics.some(d=>d.code===6053));
});

test('配置不能排除判题文件，noCheck 不能绕过负例检查',()=>{
  const q={files:{'tsconfig.json':''},supportFiles:{'src/main.ts':'export const value=1;'},project:{...project,rootFiles:['src/main.ts'],requiredFiles:['src/main.ts']},tests:[
    {name:'正例',expect:'pass',code:'import {value} from "./src/main";const n:number=value;'},
    {name:'反例',expect:'error',codes:[2322],code:'import {value} from "./src/main";const n:string=value;'},
  ]};
  const good={'tsconfig.json':'{"files":["src/main.ts"],"exclude":["**/*"],"compilerOptions":{"noCheck":true}}'};
  assert.equal(checker.judge(q,good).passed,true);
  const result=checker.compile({...q.supportFiles,...good,'__test_0.ts':'const n:number="wrong";'}, {},{...project,extraRoots:['__test_0.ts']});
  assert.ok(result.diagnostics.some(d=>d.file==='__test_0.ts'&&d.code===2322));
  const wrong={'tsconfig.json':'{"files":[],"include":[]}'};
  assert.equal(checker.judge(q,wrong).passed,false);
});

test('项目实际文件范围和严格选项分别参与判题',()=>{
  const q={files:{'tsconfig.json':''},supportFiles:{'src/main.ts':'export const value=1;','extra.ts':'export const other=2;'},project:{...project,rootFiles:['src/main.ts'],excludedFiles:['extra.ts']},tests:[
    {name:'正例',expect:'pass',code:'const value:number=1;'},
    {name:'严格空值检查',expect:'error',codes:[2322],code:'const value:number=undefined;'},
  ]};
  assert.equal(checker.judge(q,{'tsconfig.json':'{"files":["src/main.ts"],"compilerOptions":{"strict":true}}'}).passed,true);
  assert.equal(checker.judge(q,{'tsconfig.json':'{"include":["**/*.ts"]}'}).passed,false);
  assert.equal(checker.judge(q,{'tsconfig.json':'{"files":["src/main.ts"],"compilerOptions":{"strict":false}}'}).passed,false);
});

test('题目要求的实际项目选项不能被改成只看起来等价的配置',()=>{
 const q={files:{'tsconfig.json':''},supportFiles:{'main.js':'/** @type {number} */ export const value=1;'},project:{configFile:'tsconfig.json',rootFiles:['main.js'],requiredOptions:{allowJs:true,checkJs:true}},tests:[]};
 const config=checkJs=>({'tsconfig.json':JSON.stringify({compilerOptions:{allowJs:true,checkJs},files:['main.js']})});
 assert.equal(checker.judge(q,config(true)).passed,true);
 const wrong=checker.judge(q,config(false));assert.equal(wrong.passed,false);
 assert.ok(wrong.checks.some(check=>check.name.includes('checkJs')&&!check.passed));
});
