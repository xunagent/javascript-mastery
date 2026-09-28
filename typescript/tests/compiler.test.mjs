import test from 'node:test';
import assert from 'node:assert/strict';
import { checker, fullJudge } from './helpers.mjs';
import { questions } from '../questions.mjs';
test('真实检查类型而非只做转译',()=>{assert.ok(checker.compile({'main.ts':'export const n: number = "text";'}).diagnostics.some((d)=>d.code===2322));});
test('跨文件导入与类型库可用',()=>{assert.deepEqual(checker.compile({'model.ts':'export interface User {name: string}','main.ts':'import type {User} from "./model";export const list: Promise<User[]> = Promise.resolve([{name:"林"}]);'}).diagnostics,[]);});
test('正例通过且负例被拒绝，错误类型不能伪造结果',()=>{
  const q={files:{'main.ts':''},tests:[{name:'正例',expect:'pass',code:'import {n} from "./main";const s:string=n;'}, {name:'反例',expect:'error',codes:[2322],code:'import {n} from "./main";const b:boolean=n;'}]};
  assert.equal(checker.judge(q,{'main.ts':'export const n="hello";'}).passed,true);
  assert.equal(checker.judge(q,{'main.ts':'export const n=2;'}).passed,false);
  assert.equal(checker.judge(q,{'main.ts':'export const n = JSON.parse("null");'}).passed,false,'隐式 any 也无法通过拒绝用例');
  assert.equal(checker.judge({...q,tests:[q.tests[0],{...q.tests[1],code:'import {missing} from "./main";'}]},{'main.ts':'export const n="hello";'}).passed,false,'导入错误不能冒充预期的赋值错误');
});
test('禁止忽略诊断、any 和绕过断言，允许文字中的这些字符',()=>{
  assert.ok(checker.restrictions({'main.ts':'// @ts-ignore\nexport const n:number="x";'}).length);
  assert.ok(checker.restrictions({'main.ts':'export const n:any=1;'}).length);
  assert.ok(checker.restrictions({'main.ts':'export const n = 1 as unknown as string;'}).length);
  assert.deepEqual(checker.restrictions({'main.ts':'export const text="// @ts-ignore any";export const x=[1] as const;'}),[]);
});
test('不允许删除所需文件或注入测试文件',()=>{
  const q={files:{'main.ts':''},tests:[]};
  assert.equal(checker.judge(q,{}).passed,false);
  assert.equal(checker.judge(q,{'main.ts':'','__test_0.ts':'export {};'}).passed,false);
});
test('编译成功但业务结果错误仍失败',async()=>{
  const q=questions.find((q)=>q.id==='t01-l02-q04');
  const wrong=await fullJudge(q,q.files);
  assert.equal(wrong.checks[0].passed,true);
  assert.equal(wrong.passed,false);
  assert.equal((await fullJudge(q,q.solution)).passed,true);
});
test('运行器支持多文件本地模块',async()=>{
  const q=questions.find((q)=>q.id==='t01-l04-q04');
  assert.equal((await fullJudge(q,q.solution)).passed,true);
});

test('派生类型必须跟随只读模型变化，不能硬编码当前字段',()=>{
  const q={files:{'main.ts':''},supportFiles:{'model.ts':'export type Model={id:string};'},tests:[
    {name:'当前键',expect:'pass',code:'import type {Key} from "./main";const key:Key="id";'},
    {name:'新增键',expect:'pass',supportFiles:{'model.ts':'export type Model={id:string;active:boolean};'},code:'import type {Key} from "./main";const key:Key="active";'},
    {name:'删除键',expect:'error',codes:[2322],supportFiles:{'model.ts':'export type Model={active:boolean};'},code:'import type {Key} from "./main";const key:Key="id";'},
  ]};
  assert.equal(checker.judge(q,{'main.ts':'import type {Model} from "./model";export type Key=keyof Model;'}).passed,true);
  assert.equal(checker.judge(q,{'main.ts':'export type Key="id";'}).passed,false);
  const invalid={...q,tests:[{...q.tests[0],supportFiles:{'main.ts':'export type Key=string;'}}]};
  const result=checker.judge(invalid,{'main.ts':'export type Key="id";'});
  assert.equal(result.passed,false);assert.match(result.errors[0],/只读文件/);
});

test('声明文件参与类型检查，实际 JavaScript 实现参与运行判题',async()=>{
  const q={files:{'vendor.d.ts':'export function twice(value:number):number;'},supportFiles:{'vendor.js':'export function twice(value){return value*2;}','main.ts':'import {twice} from "./vendor";export function run(value:number):number{return twice(value);}'},compilerOptions:{skipLibCheck:false},tests:[
    {name:'正确输入',expect:'pass',code:'import {twice} from "./vendor";const result:number=twice(2);'},
    {name:'错误输入',expect:'error',codes:[2345],code:'import {twice} from "./vendor";twice("2");'},
  ],runtime:[{name:'真实实现',code:'equal(load("main.js").run(3),6);'}]};
  const result=await fullJudge(q,q.files);assert.equal(result.passed,true,JSON.stringify(result));
  assert.ok(result.output['vendor.js']);assert.equal(result.output['vendor.d.js'],undefined);
  const wrong={...q,supportFiles:{...q.supportFiles,'vendor.js':'export function twice(value){return value+1;}'}};
  const incorrect=await fullJudge(wrong,wrong.files);assert.equal(incorrect.checks[0].passed,true);assert.equal(incorrect.passed,false);
  assert.equal(checker.judge(q,{'vendor.d.ts':'export function twice(value:string):number;'}).passed,false);
});

test('allowJs 和 checkJs 控制 JavaScript 的语义检查',()=>{
  const files={'main.js':'/** @param {number} value */\nexport function twice(value){return value*2;}\ntwice("x");'};
  assert.deepEqual(checker.compile(files,{allowJs:true,checkJs:false}).diagnostics,[]);
  assert.ok(checker.compile(files,{allowJs:true,checkJs:true}).diagnostics.some(d=>d.code===2345));
});

test('虚拟包 types 入口切换与显式 @types 模块解析独立于自动全局类型',()=>{
  const files={'main.ts':'import {size} from "measure";const result:number=size("abc");','node_modules/measure/package.json':'{"name":"measure","types":"current.d.ts"}','node_modules/measure/current.d.ts':'export function size(value:string):number;','node_modules/measure/legacy.d.ts':'export function size(value:number):string;'};
  assert.deepEqual(checker.compile(files,{types:[]}).diagnostics,[]);
  const changed={...files,'node_modules/measure/package.json':'{"name":"measure","types":"legacy.d.ts"}'};
  assert.ok(checker.compile(changed,{types:[]}).diagnostics.some(d=>d.code===2345));
  const external={'main.ts':'import {scale} from "legacy-math";const result:number=scale(2,3);','node_modules/legacy-math/index.js':'exports.scale=(value,factor)=>value*factor;','node_modules/@types/legacy-math/index.d.ts':'export function scale(value:number,factor:number):number;'};
  assert.deepEqual(checker.compile(external,{types:[]}).diagnostics,[]);
});
