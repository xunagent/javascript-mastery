import { DOM_SOURCE } from './dom-runtime.mjs';
import { emptyRecord, independent, prepare, attempt, evidence, normalizeProgress, mergeProgress, normalizeDrafts } from './learning.mjs';
import { RUNTIME_SOURCE } from './runtime.mjs';

const KEY = 'typescript-mastery-v1';
const app = document.querySelector('#app');
const stageNames = { predict: '读码预测', reason: '辨析原因', repair: '修复代码', design: '设计类型', transfer: '迁移应用', review: '延后复测' };
const state = { chapters: [], questions: [], sources: {}, progress: {}, drafts: {}, filter: '', view: 'map', id: '', activeFile: '', message: '', busy: false, request: 0 };
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const allLessons = () => state.chapters.flatMap((c) => c.lessons);
const lesson = (id) => allLessons().find((l) => l.id === id);
const question = () => state.questions.find((q) => q.id === state.id);
const siblings = (id) => state.questions.filter((q) => q.lessonId === id);
const record = (id) => state.progress[id] || emptyRecord();
const date = (at) => new Date(at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
let compiler, frame, timer, rejectPending;

function save() {
  try { localStorage.setItem(KEY, JSON.stringify({ progress: state.progress, drafts: state.drafts })); }
  catch { state.message = '当前浏览器无法继续保存，请到学习记录导出存档。'; const n = app.querySelector('#message'); if (n) { n.textContent = state.message; n.hidden = false; } }
}
function update(id, patch) { state.progress[id] = { ...record(id), ...patch }; save(); }
function markHelp() { const q = question(); if (q) update(q.id, { assisted: true, lastActivity: Date.now() }); }
function qStatus(q) {
  const r = record(q.id);
  return independent(r) ? '独立通过' : r.attempts.some((a) => a.correct) ? '练习通过' : r.skipped ? '暂时不会' : r.attempts.length ? '继续尝试' : '未作答';
}
function resources(ids, inQuestion = false) {
  return `<div class="resources">${[...new Set(ids)].map((id) => state.sources[id] ? `<a ${inQuestion ? 'data-resource' : ''} href="${esc(state.sources[id].url)}" target="_blank" rel="noopener noreferrer">${esc(state.sources[id].label)} ↗</a>${state.sources[id].section ? `<small>阅读位置：${esc(state.sources[id].section)}</small>` : ''}` : '').join('')}</div>`;
}
function shell(content) {
  return `<header class="topbar"><div class="topbar-inner"><a class="brand" href="#/map"><b>TS</b>TypeScript 闯关</a><nav aria-label="主导航">${[['map','知识地图'],['review','错题与复测'],['profile','学习记录']].map(([id,label]) => `<a href="#/${id}" ${state.view === id || (id === 'map' && ['lesson','question'].includes(state.view)) ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav><span class="version">TS ${esc(state.version)} · strict</span></div></header><main class="wrap"><div id="message" class="notice" role="status" ${state.message ? '' : 'hidden'}>${esc(state.message)}</div>${content}</main><footer class="footer"><span>原创题目与解析 · 阅读资料保留来源 · 无需 AI 或账号</span><nav><a href="../">JavaScript ↗</a><a href="../network/">网络与 HTTP ↗</a></nav></footer>`;
}
function mapResults() {
  const filtered = state.chapters.map((c) => ({ ...c, lessons: c.lessons.filter((l) => `${c.title} ${l.title} ${l.goal} ${l.note}`.toLowerCase().includes(state.filter.trim().toLowerCase())) })).filter((c) => c.lessons.length);
  return filtered.map((c) => `<section class="chapter"><div class="chapter-heading"><span class="number">${c.id.slice(1)}</span><div><h2>${esc(c.title)}</h2><p>${esc(c.summary)}</p></div></div><div class="lesson-grid">${c.lessons.map((l) => `<a class="lesson-card" href="#/lesson/${l.id}"><span class="lesson-number">${l.id.slice(1).replace('-l','.')}</span><h3>${esc(l.title)}</h3><p>${esc(l.goal)}</p><span class="lesson-state">${evidence(siblings(l.id), state.progress).status} · ${siblings(l.id).length} 题 ↗</span></a>`).join('')}</div></section>`).join('') || '<p class="empty">没有找到匹配的知识点，试试“泛型”或“函数”。</p>';
}
function mapView() {
  return shell(`<div class="hero"><div><p class="eyebrow">READ · REPAIR · DESIGN · APPLY</p><h1>把类型，变成你的工具。</h1><p>读懂报错，修好代码，再独立完成一个项目。每道题都能回到对应教程，每一次进步都有实际证据。</p></div><div class="hero-art">type Progress =<br>&nbsp; '理解' | '修复' | '设计';<span>✓ 让正确的用法通过<br>✓ 让错误的用法被发现</span></div></div><div class="metrics"><span><strong>${state.chapters.length}</strong>大关</span><span><strong>${allLessons().length}</strong>小节</span><span><strong>${state.questions.length}</strong>练习任务</span><span><strong>${allLessons().filter((l) => evidence(siblings(l.id),state.progress).mastered).length}</strong>已巩固小节</span></div><label class="search-label" for="lesson-search">找一个知识点</label><input class="search" id="lesson-search" type="search" value="${esc(state.filter)}" placeholder="例如：泛型、联合类型、声明文件"><div id="map-results">${mapResults()}</div>`);
}
function questionList(items, current = '') {
  return `<ol class="question-list">${items.map((q, i) => `<li><a href="#/question/${q.id}" class="${current === q.id ? 'current' : ''}"><span>${i + 1}. ${esc(q.title)}</span><small>${stageNames[q.stage]} · ${qStatus(q)}</small></a></li>`).join('')}</ol>`;
}
function nextFor(l) {
  const qs = siblings(l.id), e = evidence(qs,state.progress);
  return (e.due ? qs.find((q) => q.stage === 'review' && !e.reviewIds.includes(q.id)) : null)
    || qs.find((q) => q.stage !== 'review' && !record(q.id).attempts.length && !record(q.id).skipped)
    || qs.find((q) => q.stage !== 'review' && !independent(record(q.id))) || qs[0];
}
function lessonView() {
  const l = lesson(state.id);
  if (!l) return missing();
  const qs = siblings(l.id), e = evidence(qs,state.progress), next = nextFor(l);
  return shell(`<div class="lesson-layout"><div><a class="back" href="#/map">← 知识地图</a><p class="eyebrow">第 ${l.id.slice(1).replace('-l','.')} 小节</p><h1>${esc(l.title)}</h1><p>${esc(l.goal)}</p><section class="panel"><h2>先理解</h2><p>${esc(l.note)}</p><p>可以先做题，再按卡住的地方补知识。读完资料后，换一个场景独立完成，才能验证是否掌握。</p></section><section class="panel"><h2>对应教程</h2>${resources(l.sourceIds)}<p><small>题目以 TS ${state.version} 和题内设置为准。旧教程的版本差异会在相关题目中说明。</small></p></section>${l.prerequisite ? `<a href="#/lesson/${l.prerequisite}">← 回看前一个知识点</a>` : ''}</div><aside><section class="panel"><h2>${e.status}</h2><p>独立通过 ${e.passed} 道核心题。</p><div class="progress-bar"><span style="width:${Math.min(100,e.passed / 6 * 100)}%"></span></div><p>先独立完成至少 6 道，包含本节的修复、设计和迁移任务；三天后用 2 道不同场景复测。</p>${e.missingStages.length ? `<p>还需验证：${e.missingStages.map((s) => stageNames[s]).join('、')}</p>` : ''}${e.dueAt ? `<p>${e.due ? '复测已到期' : `复测时间：${date(e.dueAt)}`} · 已完成 ${e.reviewIds.length}/2</p>` : ''}${next ? `<a class="button primary" href="#/question/${next.id}">开始 / 继续练习 →</a>` : '<p>该节题目正在编写。</p>'}</section><section class="panel"><h2>本节任务</h2>${questionList(qs)}</section></aside></div>`);
}
function filesFor(q) { return state.drafts[q.id]?.files || q.files; }
function editor(q) {
  const all = { ...filesFor(q), ...q.supportFiles };
  if (!(state.activeFile in all)) state.activeFile = Object.keys(q.files)[0];
  const writable = state.activeFile in q.files;
  return `<div class="editor"><div class="file-tabs" role="tablist" aria-label="练习文件">${Object.keys(all).map((name) => `<button role="tab" data-file="${esc(name)}" aria-selected="${name === state.activeFile}">${esc(name)}${name in q.files ? '' : ' · 只读'}</button>`).join('')}</div><label for="code-editor">${esc(state.activeFile)}${writable ? ' · 在这里修改代码' : ' · 题目提供的辅助文件'}</label><textarea id="code-editor" spellcheck="false" autocomplete="off" autocapitalize="off" ${writable ? '' : 'readonly'} aria-label="${esc(state.activeFile)} 代码">${esc(all[state.activeFile])}</textarea><div class="editor-footer"><span id="draft-status">草稿保存在当前浏览器</span><span>Ctrl / ⌘ + Enter 提交</span></div></div>`;
}
function hints(q) {
  const r = record(q.id);
  return `<h2>一步步解开问题</h2><p><small>用提示、看解析或阅读资料后，本轮记为学习练习。换题独立验证，或间隔三天再试。</small></p>${q.hints.map((h,i) => `<div class="hint">${r.hints > i ? `<p><b>提示 ${i+1}</b><br>${esc(h)}</p>` : `<button data-hint="${i+1}" ${i > r.hints ? 'disabled' : ''}>展开提示 ${i+1}</button>`}</div>`).join('')}<button id="show-solution">查看完整解析</button>${r.hints === 4 ? solution(q) : ''}`;
}
function solution(q) {
  return `<div class="solution"><h3>参考思路</h3><p>${esc(q.explanation)}</p>${q.kind === 'code' ? Object.entries(q.solution).map(([name,code]) => `<p>${esc(name)}</p><pre>${esc(code)}</pre>`).join('') : `<p><b>参考答案：</b>${esc(q.kind === 'multi' ? q.answer.map((i)=>q.options[i]).join('；') : q.options[q.answer])}</p>`}${q.pitfall ? `<p><b>容易误判：</b>${esc(q.pitfall)}</p>` : ''}</div>`;
}
function questionView() {
  const q = question(); if (!q) return missing();
  const l = lesson(q.lessonId), qs = siblings(l.id);
  const body = q.kind === 'code' ? `${editor(q)}<details><summary>这道题怎样验证</summary><ul class="test-spec">${q.tests.map((t) => `<li>${esc(t.name)}</li>`).join('')}${(q.emissionTests||[]).map(t=>`<li>${esc(t.name)}（编译输出）</li>`).join('')}${(q.runtime || []).map((t) => `<li>${esc(t.name)}（运行结果）</li>`).join('')}</ul></details>`
    : `<fieldset class="options"><legend>${q.kind === 'multi' ? '选择所有正确项' : '选择最合适的一项'}</legend>${q.options.map((opt,i) => `<label><input name="answer" type="${q.kind === 'multi' ? 'checkbox' : 'radio'}" value="${i}"><span>${esc(opt)}</span></label>`).join('')}</fieldset>`;
  return shell(`<div class="lab-layout"><div><a class="back" href="#/lesson/${l.id}">← ${esc(l.title)}</a><p class="eyebrow">第 ${qs.indexOf(q)+1}/${qs.length} 题 · ${esc(q.difficulty || '中等')}</p><h1>${esc(q.title)}</h1><span class="tag">${stageNames[q.stage]}</span><span class="tag">${q.kind === 'code' ? '编译器验证' : '理解与判断'}</span>${q.stage === 'review' ? '<p class="notice">这道题用于换场景复测。现在也能练习，但须在本节初步通过三天后独立作答，才计入巩固。</p>' : ''}<p class="task-prompt">${esc(q.prompt)}</p>${q.snippet ? `<pre>${esc(q.snippet)}</pre>` : ''}${q.kind === 'code' ? `<p class="muted"><small>本题约束：${q.rules?.allowAny ? '允许显式 any（本题会验证它的影响）' : '保留类型检查，不使用 any'}；${q.rules?.allowAssertions ? '允许题目所需断言' : '不用类型断言或非空断言绕过检查'}。${q.runtimeEnvironment==='dom'?'DOM 行为在隔离的结构 DOM 环境验证，不含布局与页面导航。':''}${q.project ? `配置读取自 ${esc(q.project.configFile)}；判题始终保留类型检查。` : ''}${Object.entries(q.compilerOptions || {}).map(([k,v]) => `${k}=${v}`).join(' · ')}</small></p>` : ''}${body}<div class="actions"><button class="primary" id="submit-answer">检查答案</button>${q.kind === 'code' ? `<button id="inspect-code">查看类型错误</button>${q.emissionTests?.length?'<button id="inspect-output">查看编译输出</button>':''}` : ''}<button id="skip-question">暂时不会</button></div><div id="feedback" aria-live="polite"></div></div><aside class="lab-aside"><section class="panel" id="hints">${hints(q)}</section><section class="panel"><h2>涉及的知识点</h2><p>${esc(l.goal)}</p>${resources(q.sourceIds || l.sourceIds,true)}<a href="#/lesson/${l.id}">回看本节短讲 →</a></section><section class="panel"><h2>本节任务</h2>${questionList(qs,q.id)}</section></aside></div>`);
}
function reviewView() {
  const due = allLessons().filter((l) => evidence(siblings(l.id),state.progress).due);
  const weak = state.questions.filter((q) => {const r=record(q.id); return !independent(r) && (r.attempts.length || r.hints || r.assisted || r.skipped);});
  return shell(`<p class="eyebrow">把薄弱点变成掌握的证据</p><h1>错题与复测</h1><p class="muted">同一题本轮答错或借助提示后，三天无活动可重新独立作答。已通过小节使用另外两道题延后复测。</p><div class="review-grid"><section class="panel"><h2>到期复测 · ${due.length}</h2>${due.map((l) => `<a class="review-link" href="#/lesson/${l.id}">${esc(l.title)} →</a>`).join('') || '<p>暂时没有到期的小节。</p>'}</section><section class="panel"><h2>需要补强 · ${weak.length}</h2>${weak.map((q) => `<a class="review-link" href="#/question/${q.id}">${esc(q.title)} <small>· ${qStatus(q)}</small></a>`).join('') || '<p>目前没有错题或辅助练习。</p>'}</section></div>`);
}
function profileView() {
  return shell(`<p class="eyebrow">学习记录属于你</p><h1>保存进度，继续出发。</h1><div class="metrics"><span><strong>${state.questions.filter((q)=>record(q.id).attempts.length).length}</strong>已练习</span><span><strong>${state.questions.filter((q)=>independent(record(q.id))).length}</strong>独立通过</span><span><strong>${Object.keys(state.drafts).length}</strong>代码草稿</span></div><section class="panel"><h2>跨设备迁移</h2><p>进度和草稿保存在当前浏览器，不会自动云同步。导出存档后在另一台设备导入：答题记录合并，同一道题保留更新时间较新的草稿。</p><div class="actions"><button class="primary" id="export-progress">导出存档与草稿</button></div><label class="file-import">导入 TS 学习存档<input type="file" id="import-progress" accept="application/json,.json"></label><p id="import-status" role="status"></p></section><section class="panel"><h2>怎样算掌握</h2><p>每节至少 6 道核心题独立通过，并包含修复、设计、迁移任务；三天后用两道不同场景题复测。辅助练习同样保存，之后可以再次独立验证。</p><p>本课程题目和测试随网站公开，用于自主学习。通过说明当前用例得到满足，仍需结合解析理解适用边界。</p></section>`);
}
function missing() { return shell('<h1>没有找到这项内容</h1><a href="#/map">返回知识地图</a>'); }
function render() { app.innerHTML = state.view === 'map' ? mapView() : state.view === 'lesson' ? lessonView() : state.view === 'question' ? questionView() : state.view === 'review' ? reviewView() : profileView(); bind(); }
function stopWork() {
  state.request++;
  clearTimeout(timer); frame?.remove(); frame = null;
  if (state.busy) { compiler?.terminate(); compiler = null; rejectPending?.(Error('操作已取消')); }
  state.busy = false;
}
function route() {
  stopWork();
  let parts; try { parts = decodeURIComponent(location.hash.replace(/^#\/?/, '') || 'map').split('/'); } catch { parts = ['map']; }
  state.view = ['map','lesson','question','review','profile'].includes(parts[0]) ? parts[0] : 'map';
  state.id = parts[1] || ''; state.activeFile = '';
  if (question()) { state.progress[state.id] = prepare(record(state.id)); save(); }
  render(); window.scrollTo(0,0);
}
function codeFiles() { const q=question(); return structuredClone(filesFor(q)); }
function compilerRequest(data) {
  compiler ||= new Worker('./compiler-worker.js');
  const id = crypto.randomUUID();
  return new Promise((resolve,reject) => {
    rejectPending = reject;
    timer = setTimeout(() => { compiler?.terminate(); compiler=null; reject(Error('类型检查超时。请检查是否出现过深的递归类型，再重试。')); },20000);
    compiler.onmessage = ({data:message}) => { if(message.id !== id) return; clearTimeout(timer); rejectPending=null; message.error ? reject(Error(message.error)) : resolve(message.result); };
    compiler.onerror = () => { clearTimeout(timer); compiler?.terminate(); compiler=null; reject(Error('编译器未能加载，请检查网络后重试。')); };
    compiler.postMessage({id,...data});
  });
}
function runtimeRequest(output,tests,environment) {
  return new Promise((resolve,reject) => {
    frame=document.createElement('iframe');frame.sandbox='allow-scripts';frame.hidden=true;frame.src='./runtime-frame.html';
    const current=frame, token=crypto.randomUUID();
    const done=(error,checks) => {clearTimeout(timer);removeEventListener('message',receive);current.remove();if(frame===current)frame=null;error?reject(Error(error)):resolve(checks);};
    const receive=(event) => {if(event.source===current.contentWindow&&event.data?.token===token)done(event.data.error,event.data.checks);};
    addEventListener('message',receive);
    rejectPending=(error)=>done(error.message);
    current.onload=()=>current.contentWindow.postMessage({source:(environment==='dom'?DOM_SOURCE+'\n':'')+RUNTIME_SOURCE,payload:{output,tests,environment},token},'*');
    timer=setTimeout(()=>done('运行环境启动超时，请稍后重试。'),7000);
    document.body.append(current);
  });
}
function busy(value) {
  state.busy=value;
  app.querySelectorAll('#submit-answer,#inspect-code,#inspect-output,[data-file]').forEach((b)=>{b.disabled=value;});
  const q=question(), input=app.querySelector('#code-editor'); if(input)input.readOnly=value||!(state.activeFile in q.files);
}
function diagnosticHtml(ds=[]) {return ds.slice(0,12).map((d)=>`<p class="diagnostic">${esc(d.file)}${d.line?`:${d.line}:${d.column}`:''} TS${d.code}\n${esc(d.message)}</p>`).join('');}
async function submit(inspect=false) {
  if(state.busy)return;
  const q=question(), request=++state.request, feedback=app.querySelector('#feedback');
  if(!q)return;
  let result;
  if(q.kind==='code') {
    busy(true);feedback.innerHTML='<p class="loading" role="status">正在检查类型与用例…首次使用需要加载编译器。</p>';
    try {
      const files=codeFiles();
      result=await compilerRequest(inspect?{action:inspect==='emit'?'emit':'inspect',files:{...q.supportFiles,...files},options:q.compilerOptions,project:q.project}:{action:'judge',question:q,files});
      if(request!==state.request)return;
      if(inspect==='emit'){feedback.innerHTML=`<section class="feedback"><h2>编译输出</h2>${diagnosticHtml(result.diagnostics)}${Object.entries(result.output||{}).map(([name,code])=>`<h3>${esc(name)}</h3><pre>${esc(code)}</pre>`).join('')||'<p>本次没有生成文件。</p>'}<p>这里只观察配置产生的输出；完整用例需要点击“检查答案”。</p></section>`;return;}
      if(inspect) {feedback.innerHTML=`<section class="feedback"><h2>${result.diagnostics.length?'发现类型问题':'没有类型错误'}</h2>${diagnosticHtml(result.diagnostics)}<p>这里只检查类型；完整用例需要点击“检查答案”。</p></section>`;return;}
      if(result.passed&&q.runtime?.length) {const checks=await runtimeRequest(result.output,q.runtime,q.runtimeEnvironment);result.checks.push(...checks);result.passed=checks.every((c)=>c.passed);}
    } catch(error) {if(request===state.request)feedback.innerHTML=`<section class="feedback incorrect"><h2>本次未能完成检查</h2><p>${esc(error.message)}</p><p>未记为答错，可重试。</p></section>`;return;}
    finally {if(request===state.request)busy(false);}
  } else {
    const values=[...app.querySelectorAll('input[name=answer]:checked')].map((e)=>Number(e.value));
    if(!values.length){feedback.innerHTML='<p role="status">请先选择答案。</p>';return;}
    result={passed:q.kind==='multi'?values.sort().join(',')===q.answer.slice().sort().join(','):values[0]===q.answer,checks:[],diagnostics:[],errors:[]};
  }
  if(request!==state.request)return;
  const r=attempt(record(q.id),result.passed);state.progress[q.id]=r;save();
  const qs=siblings(q.lessonId), next=qs[qs.indexOf(q)+1];
  feedback.innerHTML=`<section class="feedback ${result.passed?'correct':'incorrect'}"><h2>${result.passed?(r.attempts.at(-1).independent?'独立通过':'练习通过'):'还需要调整'}</h2><p>${result.passed?'本次用例已通过。对照解析确认你理解了原因。':'根据下面的反馈定位问题，也可以展开右侧提示。'}</p>${result.errors?.map((e)=>`<p>${esc(e)}</p>`).join('')||''}<ul>${result.checks.map((c)=>`<li>${c.passed?'✓':'✕'} ${esc(c.name)}${c.message?`：${esc(c.message)}`:''}</li>`).join('')}</ul>${diagnosticHtml(result.diagnostics)}${result.passed?solution(q):''}${next?`<a class="button" href="#/question/${next.id}">下一题 →</a>`:`<a class="button" href="#/lesson/${q.lessonId}">查看本节进度 →</a>`}</section>`;
  app.querySelectorAll('.question-list a.current small').forEach((el)=>{el.textContent=`${stageNames[q.stage]} · ${qStatus(q)}`;});
}
function bindHints() {
  app.querySelectorAll('[data-hint]').forEach((b)=>b.onclick=()=>{const q=question();update(q.id,{hints:Number(b.dataset.hint),assisted:true,lastActivity:Date.now()});app.querySelector('#hints').innerHTML=hints(q);bindHints();});
  const show=app.querySelector('#show-solution');if(show)show.onclick=()=>{const q=question();update(q.id,{hints:4,assisted:true,lastActivity:Date.now()});app.querySelector('#hints').innerHTML=hints(q);bindHints();};
}
function bindEditor() {
  const q=question();
  app.querySelectorAll('[data-file]').forEach((b)=>b.onclick=()=>{state.activeFile=b.dataset.file;app.querySelector('.editor').outerHTML=editor(q);bindEditor();});
  const input=app.querySelector('#code-editor');if(!input)return;
  const persist=()=>{if(!(state.activeFile in q.files))return;const files=codeFiles();files[state.activeFile]=input.value;state.drafts[q.id]={files,at:Date.now()};save();app.querySelector('#draft-status').textContent='草稿已保存';};
  input.addEventListener('input',persist);
  input.addEventListener('keydown',(event)=>{
    if(event.isComposing||event.keyCode===229)return;
    if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();submit();}
    if(event.key==='Tab'&&!input.readOnly){event.preventDefault();input.setRangeText('  ',input.selectionStart,input.selectionEnd,'end');persist();}
  });
}
function bind() {
  const search=app.querySelector('#lesson-search');let composing=false;
  const filter=()=>{state.filter=search.value;app.querySelector('#map-results').innerHTML=mapResults();};
  search?.addEventListener('compositionstart',()=>{composing=true;});search?.addEventListener('compositionend',()=>{composing=false;filter();});search?.addEventListener('input',(e)=>{if(!composing&&!e.isComposing)filter();});
  bindHints();if(question()?.kind==='code')bindEditor();
  app.querySelectorAll('[data-resource]').forEach((a)=>a.addEventListener('click',markHelp));
  const submitButton=app.querySelector('#submit-answer');if(submitButton)submitButton.onclick=()=>submit();
  const inspectButton=app.querySelector('#inspect-code');if(inspectButton)inspectButton.onclick=()=>submit(true);
  const outputButton=app.querySelector('#inspect-output');if(outputButton)outputButton.onclick=()=>submit('emit');
  const skip=app.querySelector('#skip-question');if(skip)skip.onclick=()=>{const q=question();update(q.id,{skipped:true,lastActivity:Date.now()});location.hash=`/lesson/${q.lessonId}`;};
  const exportButton=app.querySelector('#export-progress');if(exportButton)exportButton.onclick=()=>{
    const blob=new Blob([JSON.stringify({course:'typescript-mastery',schema:1,compiler:state.version,exportedAt:Date.now(),progress:state.progress,drafts:state.drafts},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`typescript-progress-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  app.querySelector('#import-progress')?.addEventListener('change',async(event)=>{
    const output=app.querySelector('#import-status'),file=event.target.files[0];if(!file)return;
    try {
      if(file.size>15*1024*1024)throw Error('文件过大，请选择本课程导出的存档。');
      const data=JSON.parse(await file.text());
      if(data.course!=='typescript-mastery'||data.schema!==1)throw Error('请选择 TS 闯关存档；JS 和网络课程的存档不能混用。');
      const progress=normalizeProgress(data.progress,new Set(state.questions.map((q)=>q.id)));
      const drafts=normalizeDrafts(data.drafts||{},state.questions);
      state.progress=mergeProgress(state.progress,progress);
      for(const[id,d]of Object.entries(drafts))if(!state.drafts[id]||d.at>state.drafts[id].at)state.drafts[id]=d;
      save();output.textContent='已合并记录和较新的代码草稿。';
    }catch(error){output.textContent=`导入失败：${error.message} 原有记录保留。`;}
  });
}
async function boot() {
  try {
    const [course,questions]=await Promise.all(['./data/course.json','./data/questions.json'].map(async(path)=>{const response=await fetch(path);if(!response.ok)throw Error('课程文件加载失败');return response.json();}));
    state.chapters=course.chapters;state.sources=course.sources;state.version=course.compilerVersion;state.questions=questions;
    try {const stored=JSON.parse(localStorage.getItem(KEY)||'{"progress":{},"drafts":{}}');state.progress=normalizeProgress(stored.progress,new Set(questions.map((q)=>q.id)));state.drafts=normalizeDrafts(stored.drafts||{},questions);}
    catch{state.message='未能读取本地存档。如有备份，可在学习记录页面导入。';}
    addEventListener('hashchange',route);route();
  }catch(error){app.innerHTML=`<main class="wrap"><h1>课程暂时未能加载</h1><p>${esc(error.message)}</p><button onclick="location.reload()">重新加载</button></main>`;}
}
boot();
