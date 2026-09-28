import test from 'node:test';
import assert from 'node:assert/strict';
import {checker} from './helpers.mjs';
const project={configFile:'tsconfig.json'};
const files=(options,source='export const read=(v?:{name:string})=>v?.name;')=>({'tsconfig.json':JSON.stringify({compilerOptions:options,files:['main.ts']}),'main.ts':source});

test('真实输出按 target 降级语法，观察输出不会执行用户代码',()=>{
 const source='throw new Error("must not execute");export const read=(v?:{name:string})=>v?.name;';
 const modern=checker.emit(files({target:'ES2022'},source),{},project);
 const older=checker.emit(files({target:'ES2015'},source),{},project);
 assert.deepEqual(modern.diagnostics,[]);assert.deepEqual(older.diagnostics,[]);
 assert.match(modern.output['main.js'],/v\?\.name/);assert.doesNotMatch(older.output['main.js'],/\?\./);
 assert.match(older.output['main.js'],/=>/);
});

test('noEmit 与仅声明输出分别遵守真实配置',()=>{
 const none=checker.emit(files({noEmit:true}),{},project);
 assert.deepEqual(none.output,{});assert.deepEqual(none.diagnostics,[]);
 const declaration=checker.emit(files({declaration:true,emitDeclarationOnly:true,outDir:'dist'}),{},project);
 assert.deepEqual(declaration.diagnostics,[]);assert.deepEqual(Object.keys(declaration.output),['dist/main.d.ts']);
 assert.match(declaration.output['dist/main.d.ts'],/string \| undefined/);
});

test('noEmitOnError 决定有语义错误时是否仍生成代码',()=>{
 const source='export const value:number="wrong";';
 const stopped=checker.emit(files({noEmitOnError:true},source),{},project);
 const emitted=checker.emit(files({noEmitOnError:false},source),{},project);
 assert.deepEqual(stopped.diagnostics.map(d=>d.code),[2322]);assert.deepEqual(stopped.output,{});assert.equal(stopped.emitSkipped,true);
 assert.deepEqual(emitted.diagnostics.map(d=>d.code),[2322]);assert.ok(emitted.output['main.js']);assert.equal(emitted.emitSkipped,false);
});

test('输出判题拒绝不匹配的 target 和关闭输出，接受行为等价配置',()=>{
 const source='export const read=(v?:{name:string})=>v?.name;';
 const q={files:{'tsconfig.json':''},supportFiles:{'main.ts':source},project,tests:[],emissionTests:[{name:'目标语法',files:['main.js'],requiredSyntax:{'main.js':['ArrowFunction']},forbiddenSyntax:{'main.js':['QuestionDotToken']}}]};
 const submit=options=>({'tsconfig.json':files(options)['tsconfig.json']});
 assert.equal(checker.judge(q,submit({target:'ES2015'})).passed,true);
 assert.equal(checker.judge(q,submit({target:'ES2018'})).passed,true);
 assert.equal(checker.judge(q,submit({target:'ES2022'})).passed,false);
 assert.equal(checker.judge(q,submit({target:'ES2015',noEmit:true})).passed,false);
});

test('输出测试能注入只读错误案例，不能覆盖用户文件',()=>{
 const q={files:{'tsconfig.json':''},supportFiles:{'main.ts':'export const value:number=1;'},project,tests:[],emissionTests:[{name:'错误时不输出',supportFiles:{'main.ts':'export const value:number="bad";'},diagnosticCodes:[2322],files:[],emitSkipped:true}]};
 assert.equal(checker.judge(q,{'tsconfig.json':files({noEmitOnError:true})['tsconfig.json']}).passed,true);
 assert.equal(checker.judge(q,{'tsconfig.json':files({noEmitOnError:false})['tsconfig.json']}).passed,false);
 q.emissionTests[0].supportFiles={'tsconfig.json':'{}'};
 const result=checker.judge(q,{'tsconfig.json':files({})['tsconfig.json']});
 assert.equal(result.passed,false);assert.match(result.errors.join(),/只读/);
});
