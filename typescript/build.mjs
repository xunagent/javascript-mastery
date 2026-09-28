import { mkdir, readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { transform } from 'esbuild';
import { chapters, lessons, sources } from './content.mjs';
import { questions } from './questions.mjs';
import { COMPILER_VERSION } from './compiler.mjs';
import ts from 'typescript';
import { domSource } from './dom-bundle.mjs';
const root=resolve(import.meta.dirname,'..');
const out=resolve(root,'dist/typescript');
const ids=new Set(),errors=[];
if(chapters.length!==14||lessons.length!==102)errors.push(`目录应该覆盖14关102小节，当前为${chapters.length}/${lessons.length}`);
for(const l of lessons) {
  if(!l.title||!l.goal||!l.note||!l.sourceIds.length)errors.push(`${l.id}:教学内容不完整`);
  if(l.sourceIds.some((id)=>!sources[id]))errors.push(`${l.id}:来源未定义`);
}
for(const q of questions) {
  const l=lessons.find((l)=>l.id===q.lessonId);
  if(!l||ids.has(q.id))errors.push(`${q.id}:小节不存在或ID重复`);
  ids.add(q.id);
  if(!q.title||!q.prompt||!q.explanation||q.hints?.length!==3||new Set(q.hints).size!==3||q.hints.some((h)=>!h.trim()))errors.push(`${q.id}:题面、提示或解析缺失`);
  if(q.sourceIds?.some((id)=>!sources[id]))errors.push(`${q.id}:来源未定义`);
  if(!['predict','reason','repair','design','transfer','review'].includes(q.stage))errors.push(`${q.id}:任务阶段未定义`);
  if(['choice','multi'].includes(q.kind)) {
    if(!Array.isArray(q.options)||q.options.length<3||new Set(q.options).size!==q.options.length)errors.push(`${q.id}:选项不足或重复`);
    const answers=q.kind==='multi'?q.answer:[q.answer];
    if(!answers.length||answers.some((a)=>!Number.isInteger(a)||a<0||a>=q.options.length))errors.push(`${q.id}:答案无效`);
  } else if(q.kind==='code') {
    if(q.runtimeEnvironment!==undefined&&q.runtimeEnvironment!=='dom')errors.push(`${q.id}:运行环境无效`);
    if(!q.files||!q.solution||Object.keys(q.files).join()!==Object.keys(q.solution).join())errors.push(`${q.id}:练习与答案文件不一致`);
    if(!q.tests?.some((t)=>t.expect==='pass')||!q.tests.some((t)=>t.expect==='error'))errors.push(`${q.id}:缺少正例或反例`);
    for(const test of q.tests||[])for(const [name,source]of Object.entries(test.supportFiles||{})) {
      if(!Object.hasOwn(q.supportFiles||{},name)||Object.hasOwn(q.files||{},name)||typeof source!=='string')errors.push(`${q.id}:模型变体必须替换已有只读文件`);
    }
    for(const check of q.emissionTests||[]) {
      if(!check.name)errors.push(`${q.id}:输出测试缺少名称`);
      for(const [name,source]of Object.entries(check.supportFiles||{}))if(!Object.hasOwn(q.supportFiles||{},name)||Object.hasOwn(q.files||{},name)||typeof source!=='string')errors.push(`${q.id}:输出变体必须替换已有只读文件`);
      if(check.diagnosticCodes&&(!Array.isArray(check.diagnosticCodes)||check.diagnosticCodes.some(code=>!Number.isInteger(code))))errors.push(`${q.id}:输出诊断码无效`);
      if(check.emitSkipped!==undefined&&typeof check.emitSkipped!=='boolean')errors.push(`${q.id}:输出跳过标记无效`);
      const validOutput=name=>typeof name==='string'&&name.length>0&&!name.startsWith('/')&&!name.split('/').includes('..');
      if(check.files&&(!Array.isArray(check.files)||check.files.some(name=>!validOutput(name))||new Set(check.files).size!==check.files.length))errors.push(`${q.id}:输出文件集合无效`);
      for(const field of ['requiredSyntax','forbiddenSyntax'])for(const [file,kinds]of Object.entries(check[field]||{}))if(!validOutput(file)||!Array.isArray(kinds)||!kinds.length||kinds.some(kind=>typeof ts.SyntaxKind[kind]!=='number'))errors.push(`${q.id}:输出语法约束无效`);
      if(check.files===undefined&&check.emitSkipped===undefined&&!check.requiredSyntax&&!check.forbiddenSyntax&&!check.diagnosticCodes)errors.push(`${q.id}:输出测试没有验证条件`);
    }
    if(q.project){
      const files={...q.supportFiles,...q.files};
      if(typeof q.project.configFile!=='string'||!Object.hasOwn(files,q.project.configFile)||!q.project.configFile.endsWith('.json'))errors.push(`${q.id}:项目配置文件无效`);
      if(q.project.requiredOptions&&(!q.project.requiredOptions||typeof q.project.requiredOptions!=="object"||Array.isArray(q.project.requiredOptions)||Object.entries(q.project.requiredOptions).some(([name,value])=>!name||!["boolean","string","number"].includes(typeof value))))errors.push(`${q.id}:项目选项要求无效`);
      if(q.project.extraRoots)errors.push(`${q.id}:题目不能设置判题专用入口`);
      for(const field of ['rootFiles','requiredFiles','excludedFiles','referenceFiles'])if(q.project[field]&&(!Array.isArray(q.project[field])||q.project[field].some(name=>!Object.hasOwn(files,name))))errors.push(`${q.id}:项目文件范围无效`);
    }
    for(const check of q.runtime||[]) {
      try { new Function('load','equal','check','return (async()=>{'+check.code+'\n})();'); }
      catch(error) { errors.push(`${q.id}:运行测试「${check.name}」语法错误：${error.message}`); }
    }
    for(const name of Object.keys({...q.files,...q.supportFiles}))if(!/^[\w@/-]+(?:\.[\w-]+)*\.(ts|js|json)$/.test(name)||name.includes('..')||name.startsWith('/')||name.startsWith('__test'))errors.push(`${q.id}:非法文件名`);
  } else errors.push(`${q.id}:不支持的题型`);
}
const coverage=lessons.map((l)=>({id:l.id,title:l.title,count:questions.filter((q)=>q.lessonId===l.id).length}));
if(process.argv.includes('--strict'))for(const l of coverage) {
  const qs=questions.filter((q)=>q.lessonId===l.id);
  if(l.count<10||l.count>14)errors.push(`${l.id}:需要10–14题，当前${l.count}`);
  if(qs.filter((q)=>q.stage==='review').length<2)errors.push(`${l.id}:需要2道独立复测题`);
  for(const stage of ['repair','design','transfer'])if(!qs.some((q)=>q.kind==='code'&&q.stage===stage))errors.push(`${l.id}:缺少真实${stage}任务`);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else{
  await mkdir(resolve(out,'data'),{recursive:true});await mkdir(resolve(out,'vendor'),{recursive:true});
  for(const name of ['index.html','app.js','style.css','compiler-worker.js','runtime-frame.html'])await copyFile(resolve(root,'typescript/site',name),resolve(out,name));
  for(const name of ['compiler.mjs','learning.mjs','runtime.mjs'])await copyFile(resolve(root,'typescript',name),resolve(out,name));
  await writeFile(resolve(out,'dom-runtime.mjs'),'export const DOM_SOURCE='+JSON.stringify(domSource())+';\n');
  await copyFile(resolve(root,'node_modules/linkedom/LICENSE'),resolve(out,'vendor/LICENSE-linkedom.txt'));
  const libPath=resolve(root,'node_modules/typescript/lib');
  const libraries={};
  for(const name of await readdir(libPath))if(/^lib\..*\.d\.ts$/.test(name))libraries[name]=await readFile(resolve(libPath,name),'utf8');
  await writeFile(resolve(out,'vendor/libraries.json'),JSON.stringify(libraries));
  const compiler=await transform(await readFile(resolve(libPath,'typescript.js'),'utf8'),{minify:true,target:'es2022',legalComments:'eof'});
  await writeFile(resolve(out,'vendor/typescript.js'),compiler.code);
  await copyFile(resolve(libPath,'../LICENSE.txt'),resolve(out,'vendor/LICENSE-typescript.txt'));
  const prepared=questions.map((q)=>{
    const item={...q,sourceIds:q.sourceIds||lessons.find((l)=>l.id===q.lessonId).sourceIds};
    if(q.options){
      let seed=[...q.id].reduce((a,c)=>(Math.imul(a,31)+c.charCodeAt(0))>>>0,13);
      const order=q.options.map((_,i)=>i);
      for(let i=order.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[order[i],order[j]]=[order[j],order[i]];}
      item.options=order.map((i)=>q.options[i]);item.answer=q.kind==='multi'?q.answer.map((a)=>order.indexOf(a)):order.indexOf(q.answer);
    }
    return item;
  });
  await writeFile(resolve(out,'data/course.json'),JSON.stringify({chapters,sources,compilerVersion:COMPILER_VERSION}));
  await writeFile(resolve(out,'data/questions.json'),JSON.stringify(prepared));
  await writeFile(resolve(root,'typescript/coverage.json'),JSON.stringify(coverage,null,2)+'\n');
  console.log(`TS course: ${chapters.length} chapters, ${lessons.length} lessons, ${questions.length} tasks; ${coverage.filter((l)=>l.count>=10).length} lessons with 10+ tasks.`);
}
