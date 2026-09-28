import test from 'node:test';
import assert from 'node:assert/strict';
import {checker} from './helpers.mjs';
const project={configFile:'tsconfig.json'};
const fixture=()=>({
 'tsconfig.json':'{"files":["main.ts"],"references":[{"path":"./lib"}]}',
 'main.ts':'import {value} from "./lib/value";export const result:number=value;',
 'lib/tsconfig.json':'{"compilerOptions":{"composite":true,"outDir":"dist"},"files":["value.ts"]}',
 'lib/value.ts':'export const value:number=1;',
 'lib/dist/value.d.ts':'export declare const value:number;',
});
test('引用消费声明产物，不把依赖源文件直接并入当前程序',()=>{
 const files=fixture();const result=checker.compile(files,{},project);
 assert.deepEqual(result.diagnostics,[]);
 assert.ok(result.program.getSourceFile('/course/lib/dist/value.d.ts'));
 assert.equal(result.program.getSourceFile('/course/lib/value.ts').fileName,'/course/lib/dist/value.d.ts');
 assert.equal(result.program.getSourceFiles().some(file=>file.fileName==='/course/lib/value.ts'),false);
 files['lib/dist/value.d.ts']='export declare const value:string;';
 assert.ok(checker.compile(files,{},project).diagnostics.some(d=>d.code===2322));
});
test('引用目标必须 composite 且具有所需声明产物',()=>{
 const files=fixture();files['lib/tsconfig.json']='{"compilerOptions":{"outDir":"dist"},"files":["value.ts"]}';
 assert.ok(checker.compile(files,{},project).diagnostics.some(d=>d.code===6306));
 const missing=fixture();delete missing['lib/dist/value.d.ts'];
 assert.ok(checker.compile(missing,{},project).diagnostics.some(d=>d.code===6305));
});
test('不存在的引用配置被报告，目录扫描支持引用项目 include',()=>{
 const files=fixture();files['lib/tsconfig.json']='{"compilerOptions":{"composite":true,"outDir":"dist"},"include":["*.ts"]}';
 assert.deepEqual(checker.compile(files,{},project).diagnostics,[]);
 delete files['lib/tsconfig.json'];
 assert.ok(checker.compile(files,{},project).diagnostics.some(d=>d.code===6053||d.code===5083));
});
test('extends 不继承 references，引用要求不能用删除引用绕过',()=>{
 const files=fixture();files['base.json']=files['tsconfig.json'];files['tsconfig.json']='{"extends":"./base.json"}';
 const result=checker.compile(files,{},project);assert.deepEqual(result.diagnostics,[]);
 assert.equal(result.program.getResolvedProjectReferences(),undefined);
 const {['tsconfig.json']:config,...supportFiles}=files;
 const q={files:{'tsconfig.json':''},supportFiles,project:{...project,referenceFiles:['lib/tsconfig.json']},tests:[]};
 assert.equal(checker.judge(q,{'tsconfig.json':config}).passed,false);
 assert.equal(checker.judge(q,{'tsconfig.json':'{"extends":"./base.json","references":[{"path":"./lib"}]}'}).passed,true);
});
