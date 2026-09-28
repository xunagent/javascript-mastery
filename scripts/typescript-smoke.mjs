import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import ts from 'typescript';
import { RUNTIME_SOURCE } from '../typescript/runtime.mjs';
const root=resolve(import.meta.dirname,'../dist');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css'};
const server=createServer(async(req,res)=>{
  try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=resolve(root,'.'+path+(path.endsWith('/')?'index.html':''));if(!file.startsWith(root+'/'))throw Error();res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}
  catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}/typescript/`;
const course=JSON.parse(await readFile(resolve(root,'typescript/data/course.json'),'utf8'));
const questions=JSON.parse(await readFile(resolve(root,'typescript/data/questions.json'),'utf8'));
const storageKey='typescript-mastery-v1';
let browser;
try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
    const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const visit=async(hash)=>{await page.goto(base+'#/'+hash);await page.locator('.topbar').waitFor();};
    const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.goto(base+'../');await page.locator('a[href="./typescript/"]').waitFor();await noOverflow();
    assert.equal(await page.locator('a[href="./network/"]').count(),1);
    await visit('map');assert.equal(await page.locator('.lesson-card').count(),102);await noOverflow();
    const search=await page.locator('#lesson-search').elementHandle();await search.focus();const ime=await context.newCDPSession(page);
    for(const text of ['fan','泛型']){await ime.send('Input.imeSetComposition',{text,selectionStart:text.length,selectionEnd:text.length});assert.equal(await search.evaluate(e=>e.isConnected&&document.activeElement===e),true);assert.equal(await page.locator('.lesson-card').count(),102);}
    await ime.send('Input.insertText',{text:'泛型'});assert.equal(await search.inputValue(),'泛型');assert.ok(await page.locator('.lesson-card').count()<102);await noOverflow();
    for(const chapter of course.chapters)for(const l of chapter.lessons){await visit(`lesson/${l.id}`);assert.equal(await page.locator('.question-list a').count(),questions.filter(q=>q.lessonId===l.id).length);for(const id of l.sourceIds)assert.ok(await page.locator(`.resources a[href="${course.sources[id].url}"]`).count());await noOverflow();}
    const choice=questions.find(q=>q.kind==='choice');await visit('question/'+choice.id);await page.locator(`input[name=answer][value="${choice.answer}"]`).check();await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor();
    let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),storageKey);assert.equal(saved.progress[choice.id].attempts.at(-1).independent,true);
    const q=questions.find(q=>q.id==='t01-l01-q04');await visit('question/'+q.id);await noOverflow();
    const editor=await page.locator('#code-editor').elementHandle();await editor.focus();
    await editor.fill('// ');for(const text of ['zhong','中文']){await ime.send('Input.imeSetComposition',{text,selectionStart:text.length,selectionEnd:text.length});assert.equal(await editor.evaluate(e=>e.isConnected&&document.activeElement===e),true);}
    await ime.send('Input.insertText',{text:'中文'});assert.match(await editor.inputValue(),/中文/);await ime.detach();
    await editor.fill(q.solution['main.ts']);await page.locator('[data-hint="1"]').click();assert.equal(await editor.evaluate(e=>e.isConnected),true);assert.equal(await editor.inputValue(),q.solution['main.ts']);
    await page.reload();await page.locator('#code-editor').waitFor();assert.equal(await page.locator('#code-editor').inputValue(),q.solution['main.ts']);
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});
    assert.match(await page.locator('.feedback h2').innerText(),/练习通过/);
    saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),storageKey);assert.equal(saved.progress[q.id].attempts.at(-1).independent,false);
    const multi=questions.find(q=>q.id==='t01-l04-q04');await visit('question/'+multi.id);
    for(const [name,code]of Object.entries(multi.solution)){await page.locator(`[data-file="${name}"]`).click();await page.locator('#code-editor').fill(code);}
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});assert.match(await page.locator('.feedback h2').innerText(),/独立通过/);await noOverflow();
    // A semantically valid but incorrect function must fail actual runtime checks.
    const wrong=questions.find(q=>q.id==='t01-l02-q04');await visit('question/'+wrong.id);await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});assert.match(await page.locator('.feedback').innerText(),/拒绝零/);
    await page.locator('#code-editor').fill(wrong.solution['main.ts']);await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});assert.match(await page.locator('.feedback h2').innerText(),/练习通过/);
    // Infinite student code is bounded and leaves the editor usable.
    await page.locator('#code-editor').fill('export function average(total: number, count: number): number | null { while (true) {} }');
    await page.locator('#submit-answer').click();await page.getByText('本次未能完成检查').waitFor({timeout:30000});assert.equal(await page.locator('#submit-answer').isEnabled(),true);
    // Reopen after a terminated run and prove compilation still works.
    await page.locator('#code-editor').fill(wrong.solution['main.ts']);await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});
    // A dangling async rejection fails only this submission, not the application.
    const asyncTask=questions.find(q=>q.id==='t05-l04-q06');await visit('question/'+asyncTask.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    assert.equal(await page.locator('#submit-answer').isEnabled(),true);
    await page.locator('#code-editor').fill(asyncTask.solution['main.ts']);
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});
    const parallel=questions.find(q=>q.id==='t05-l04-q08');await visit('question/'+parallel.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    await page.locator('#code-editor').fill(parallel.solution['main.ts']);await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});
    // Derivation tasks must survive source-model changes, not just today's shape.
    const derived=questions.find(q=>q.id==='t07-l02-q04');await visit('question/'+derived.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    assert.match(await page.locator('.feedback').innerText(),/模型增加字段/);
    await page.locator('[data-file="model.ts"]').click();assert.equal(await page.locator('#code-editor').isEditable(),false);
    await page.locator('[data-file="main.ts"]').click();await page.locator('#code-editor').fill(derived.solution['main.ts']);
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});
    // Declaration edits must describe the real JavaScript module, not replace it.
    const declaration=questions.find(q=>q.id==='t11-l04-q04');await visit('question/'+declaration.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    await page.locator('[data-file="vendor.js"]').click();assert.equal(await page.locator('#code-editor').isEditable(),false);
    await page.locator('[data-file="vendor.d.ts"]').click();await page.locator('#code-editor').fill(declaration.solution['vendor.d.ts']);
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});
    const packageEntry=questions.find(q=>q.id==='t11-l06-q04');await visit('question/'+packageEntry.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    await page.locator('#code-editor').fill(packageEntry.solution['node_modules/measure/package.json']);
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});
    const projectConfig=questions.find(q=>q.id==='t12-l01-q10');await visit('question/'+projectConfig.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    await page.locator('#code-editor').fill(projectConfig.solution['tsconfig.json']);
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});
    assert.match(await page.locator('.feedback').innerText(),/项目入口文件符合要求/);
    const emitted=questions.find(q=>q.id==='t12-l03-q04');await visit('question/'+emitted.id);
    await page.locator('#inspect-output').click();await page.getByRole('heading',{name:'编译输出',exact:true}).waitFor({timeout:30000});
    assert.match(await page.locator('#feedback pre').innerText(),/\?\./);
    let inspected=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),storageKey);
    assert.equal(inspected.progress[emitted.id]?.attempts?.length||0,0);
    await page.locator('#code-editor').fill(emitted.solution['tsconfig.json']);
    await page.locator('#inspect-output').click();await page.getByRole('heading',{name:'编译输出',exact:true}).waitFor({timeout:30000});
    assert.doesNotMatch(await page.locator('#feedback pre').innerText(),/\?\./);await noOverflow();
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});
    const declarationOutput=questions.find(q=>q.id==='t12-l05-q06');await visit('question/'+declarationOutput.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    await page.locator('#code-editor').fill(declarationOutput.solution['tsconfig.json']);
    await page.locator('#inspect-output').click();await page.getByRole('heading',{name:'编译输出',exact:true}).waitFor({timeout:30000});
    assert.equal(await page.locator('#feedback h3').count(),1);assert.equal(await page.locator('#feedback h3').innerText(),'types/main.d.ts');
    assert.match(await page.locator('#feedback pre').innerText(),/interface Item/);await noOverflow();
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});
    const referenceConfig=questions.find(q=>q.id==='t12-l07-q08');await visit('question/'+referenceConfig.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    await page.locator('#code-editor').fill(referenceConfig.solution['tsconfig.json']);
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});
    assert.match(await page.locator('.feedback').innerText(),/直接项目引用符合要求/);
    await page.locator('[data-file="lib/dist/value.d.ts"]').click();assert.equal(await page.locator('#code-editor').isEditable(),false);await noOverflow();
    const domTask=questions.find(q=>q.id==='t13-l01-q06');await visit('question/'+domTask.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    await page.locator('#code-editor').fill(domTask.solution['main.ts']);
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});await noOverflow();
    for(const id of ['t13-l02-q08','t13-l03-q08']) {
      const task=questions.find(q=>q.id===id);await visit('question/'+id);
      await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
      await page.locator('#code-editor').fill(task.solution['main.ts']);
      await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});await noOverflow();
    }
    const jsConfig=questions.find(q=>q.id==='t13-l05-q10');await visit('question/'+jsConfig.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    await page.locator('#code-editor').fill(jsConfig.solution['tsconfig.json']);
    await page.locator('[data-file="legacy.js"]').click();await page.locator('#code-editor').fill(jsConfig.solution['legacy.js']);
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});await noOverflow();
    const capstoneModel=questions.find(q=>q.id==='t14-l01-q10');await visit('question/'+capstoneModel.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    await page.locator('#code-editor').fill(capstoneModel.solution['main.ts']);
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});await noOverflow();
    for(const id of ['t13-l07-q08','t14-l02-q10']) {
      const task=questions.find(q=>q.id===id);await visit('question/'+id);
      await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
      await page.locator('#code-editor').fill(task.solution['main.ts']);
      await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});await noOverflow();
    }
    const asyncProject=questions.find(q=>q.id==='t14-l03-q06');await visit('question/'+asyncProject.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    await page.locator('#code-editor').fill(asyncProject.solution['main.ts']);
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});await noOverflow();
    const finalProject=questions.find(q=>q.id==='t14-l07-q10');await visit('question/'+finalProject.id);
    await page.locator('#submit-answer').click();await page.locator('.feedback.incorrect').waitFor({timeout:30000});
    for(const [name,code] of Object.entries(finalProject.solution)) {
      await page.locator(`[data-file="${name}"]`).click();
      await page.locator('#code-editor').fill(code);
    }
    await page.locator('[data-file="app.ts"]').click();assert.equal(await page.locator('#code-editor').isEditable(),false);
    await page.locator('#submit-answer').click();await page.locator('.feedback.correct').waitFor({timeout:30000});await noOverflow();
    // Verify DOM task behavior against native Chromium, independently of the structural worker DOM.
    const nativeDOM=await context.newPage();
    for(const task of questions.filter(q=>q.runtimeEnvironment==='dom'&&q.kind==='code')) {
      for(const [files,expected] of [[task.solution,true],[task.files,false],...(task.wrongSolutions||[]).map(files=>[files,false])]) {
        const output=Object.fromEntries(Object.entries({...task.supportFiles,...files}).filter(([name])=>/\.(ts|js)$/.test(name)&&!name.endsWith('.d.ts')).map(([name,code])=>[name.replace(/\.(ts|js)$/,'.js'),ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},fileName:name}).outputText]));
        const checks=await nativeDOM.evaluate(({source,payload})=>new Function('payload',source+';return runCourseTests(payload);')(payload),{source:RUNTIME_SOURCE,payload:{output,tests:task.runtime}});
        assert.equal(checks.every(check=>check.passed),expected,task.id+': native DOM '+JSON.stringify(checks));
      }
    }
    await nativeDOM.close();
    await visit('review');assert.ok(await page.locator('.review-link').count()>0);
    await visit('profile');await page.locator('#import-progress').setInputFiles({name:'wrong.json',mimeType:'application/json',buffer:Buffer.from('{"course":"network"}')});await page.getByText(/导入失败/).waitFor();
    const download=page.waitForEvent('download');await page.locator('#export-progress').click();const artifact=await download;const exported=JSON.parse(await readFile(await artifact.path(),'utf8'));assert.equal(exported.course,'typescript-mastery');assert.ok(exported.drafts[q.id]);
    await page.locator('#import-progress').setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await page.getByText('已合并记录和较新的代码草稿。').waitFor();
    if(process.env.TYPESCRIPT_SCREENSHOTS){await mkdir(process.env.TYPESCRIPT_SCREENSHOTS,{recursive:true});await visit('map');await page.screenshot({path:resolve(process.env.TYPESCRIPT_SCREENSHOTS,`map-${viewport.width}.png`)});await visit('question/'+q.id);await page.screenshot({path:resolve(process.env.TYPESCRIPT_SCREENSHOTS,`editor-${viewport.width}.png`)});}
    assert.deepEqual(errors,[]);await context.close();console.log(`TS browser regression passed at ${viewport.width}px`);
  }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
