import { writeFileSync } from 'node:fs';
import { addDataTypeExercises } from './packs/data-types.mjs';
import { addAdvancedFunctionExercises } from './packs/advanced-functions.mjs';
import { addObjectModelExercises } from './packs/object-model.mjs';
import { addRemainingLanguageExercises } from './packs/language-remaining.mjs';
import { addBrowserDomExercises } from './packs/browser-dom.mjs';
import { addBrowserUiExercises } from './packs/browser-ui.mjs';
import { addAdvancedBrowserExercises } from './packs/advanced-browser.mjs';
import { addRegexpExercises } from './packs/regexp.mjs';
import { addAdvancedBrowserReviewExercises } from './packs/advanced-browser-review.mjs';
import { addFoundationReviewExercises } from './packs/review-foundations.mjs';
import { addBrowserReviewExercises } from './packs/review-browser.mjs';
import { addAdvancedBrowserCodeExercises } from './packs/advanced-browser-code.mjs';
import { addThirdFoundationExercises } from './packs/third-foundations.mjs';
import { addThirdObjectDataExercises } from './packs/third-object-data.mjs';
import { addThirdObjectModelExercises } from './packs/third-object-model.mjs';
import { addThirdAsyncMiscExercises } from './packs/third-async-misc.mjs';
import { addThirdBrowserExercises } from './packs/third-browser.mjs';
import { addThirdAdvancedBrowserExercises } from './packs/third-advanced-browser.mjs';
import { addThirdRegexpExercises } from './packs/third-regexp.mjs';
import { addIntroDepthExercises } from './packs/depth-intro.mjs';
import { addBasicDepthExercises } from './packs/depth-basics.mjs';
import { addCodeQualityDepthExercises } from './packs/depth-quality.mjs';
import { addObjectDepthExercises } from './packs/depth-object.mjs';
import { addDataDepthExercises } from './packs/depth-data.mjs';
import { addDataDepthCodeExercises } from './packs/depth-data-code.mjs';
import { addFunctionDepthExercises } from './packs/depth-functions.mjs';
import { addFunctionDepthCodeExercises } from './packs/depth-functions-code.mjs';
import { addObjectModelDepthExercises } from './packs/depth-object-model.mjs';
import { addObjectModelDepthCodeExercises } from './packs/depth-object-model-code.mjs';
import { addClassErrorDepthExercises } from './packs/depth-classes-errors.mjs';
import { addClassErrorDepthCodeExercises } from './packs/depth-classes-errors-code.mjs';
import { addAsyncDepthExercises } from './packs/depth-async.mjs';
import { addAsyncDepthCodeExercises } from './packs/depth-async-code.mjs';
import { addGeneratorModuleDepthExercises } from './packs/depth-generators-modules.mjs';
import { addGeneratorDepthCodeExercises } from './packs/depth-generators-code.mjs';
import { addLanguageMiscDepthExercises } from './packs/depth-language-misc.mjs';
import { addLanguageMiscDepthCodeExercises } from './packs/depth-language-misc-code.mjs';
import { addDocumentDepthExercises } from './packs/depth-document.mjs';
import { addDocumentDepthCodeExercises } from './packs/depth-document-code.mjs';
import { addEventDepthExercises } from './packs/depth-events.mjs';
import { addEventDepthCodeExercises } from './packs/depth-events-code.mjs';
import { addUiDepthExercises } from './packs/depth-ui.mjs';
import { addUiDepthCodeExercises } from './packs/depth-ui-code.mjs';
import { addFormDepthExercises } from './packs/depth-forms.mjs';
import { addFormDepthCodeExercises } from './packs/depth-forms-code.mjs';
import { addLoadingDepthExercises } from './packs/depth-loading.mjs';
import { addBrowserMiscDepthExercises } from './packs/depth-browser-misc.mjs';
import { addWindowDepthExercises } from './packs/depth-windows.mjs';
import { addBinaryDepthExercises } from './packs/depth-binary.mjs';
import { addBinaryDepthCodeExercises } from './packs/depth-binary-code.mjs';
import { addFetchDepthExercises } from './packs/depth-fetch.mjs';
import { addFetchDepthCodeExercises } from './packs/depth-fetch-code.mjs';
import { addNetworkDepthExercises } from './packs/depth-network.mjs';
import { addNetworkDepthCodeExercises } from './packs/depth-network-code.mjs';
import { addStorageAnimationDepthExercises } from './packs/depth-storage-animation.mjs';
import { addAnimationDepthCodeExercises } from './packs/depth-animation-code.mjs';
import { addWebComponentsDepthExercises } from './packs/depth-webcomponents.mjs';
import { addRegexFoundationDepthExercises } from './packs/depth-regex-foundations.mjs';
import { addRegexAdvancedDepthExercises } from './packs/depth-regex-advanced.mjs';
import { addDebuggingExercises } from './packs/debugging.mjs';
import { addObjectModelExpansion } from './packs/expansion-object-model.mjs';
import { addClassErrorExpansion } from './packs/expansion-classes-errors.mjs';
import { addAsyncModuleExpansion } from './packs/expansion-async-modules.mjs';
import { addDomFoundationExpansion } from './packs/expansion-dom-foundations.mjs';
import { addDomLayoutExpansion } from './packs/expansion-dom-layout.mjs';
import { addNetworkFetchExpansion } from './packs/expansion-network-fetch.mjs';
import { addNetworkRealtimeExpansion } from './packs/expansion-network-realtime.mjs';
import { addObjectBasicsExpansion } from './packs/expansion-object-basics.mjs';
import { addQualityExpansion } from './packs/expansion-quality.mjs';
import { addBasicsExpansionA } from './packs/expansion-basics-a.mjs';
import { addBasicsExpansionB } from './packs/expansion-basics-b.mjs';
import { addDataTypesExpansion } from './packs/expansion-data-types.mjs';
import { addFunctionsExpansion } from './packs/expansion-functions.mjs';
import { addMiscBinaryExpansion } from './packs/expansion-misc-binary.mjs';
import { addStorageAnimationExpansion } from './packs/expansion-storage-animation.mjs';
import { addBrowserEventsExpansion } from './packs/expansion-browser-events.mjs';
import { addBrowserUiExpansion } from './packs/expansion-browser-ui.mjs';
import { addWebComponentsExpansion } from './packs/expansion-webcomponents.mjs';
import { addRegexFoundationExpansion } from './packs/expansion-regex-foundations.mjs';
import { addRegexAdvancedExpansion } from './packs/expansion-regex-advanced.mjs';

const questions = [];
function shuffleChoices(id, options, correct) {
  let seed = 2166136261;
  for (const char of id) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const indexed = options.map((value, index) => ({ value, index }));
  for (let index = indexed.length - 1; index > 0; index--) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    const swap = (seed >>> 0) % (index + 1);
    [indexed[index], indexed[swap]] = [indexed[swap], indexed[index]];
  }
  return { options: indexed.map((item) => item.value), correct: indexed.findIndex((item) => item.index === correct) };
}
const code = (id, lessonId, title, prompt, starter, checks, hints, solution, explanation, difficulty = '中等') => {
  questions.push({ id, lessonId, title, kind: 'code', difficulty, prompt: Array.isArray(prompt) ? prompt : [prompt], starter, checks: checks.map(([name, code]) => ({ name, code })), hints, solution, explanation });
};
const choice = (id, lessonId, title, prompt, example, options, correct, hints, explanation, difficulty = '中等') => {
  questions.push({ id, lessonId, title, kind: 'choice', difficulty, prompt: Array.isArray(prompt) ? prompt : [prompt], example, ...shuffleChoices(id, options, correct), hints, explanation });
};
const dom = (id, lessonId, title, prompt, fixture, starter, checks, hints, solution, explanation, difficulty = '中等') => {
  questions.push({ id, lessonId, title, kind: 'code', runtime: 'dom', difficulty, prompt: Array.isArray(prompt) ? prompt : [prompt], fixture, starter, checks: checks.map(([name, code]) => ({ name, code })), hints, solution, explanation });
};

code('object-copy-01','object-copy','编辑草稿不能改动原数据',
 '实现 createDraft(profile)：返回可以独立编辑 name 和 preferences.theme 的草稿。要求不修改原对象，且不复制无关的 tags 数组。',
 'function createDraft(profile) {\n  // 在这里实现\n}',
 [['外层对象独立','const p={name:"A",preferences:{theme:"light"},tags:["js"]};const d=createDraft(p);assert.ok(d!==p);assert.equal(d.name,"A")'],['嵌套偏好独立','const p={name:"A",preferences:{theme:"light"},tags:["js"]};const d=createDraft(p);d.preferences.theme="dark";assert.equal(p.preferences.theme,"light")'],['其余数据共享','const p={name:"A",preferences:{theme:"light"},tags:["js"]};const d=createDraft(p);assert.ok(d.tags===p.tags)'],['修改姓名不影响原对象','const p={name:"A",preferences:{theme:"light"},tags:[]};const d=createDraft(p);d.name="B";assert.equal(p.name,"A")']],
 ['先画出 profile、preferences、tags 的引用关系。','只需要复制会被编辑的对象层级。','外层和 preferences 各创建一个新对象；tags 沿用原引用。'],
 'function createDraft(profile) {\n  return { ...profile, preferences: { ...profile.preferences } };\n}',
 '展开运算符只复制当前层。草稿需要独立的外层对象和 preferences；题目要求 tags 继续共享，所以不复制它。');

choice('object-copy-02','object-copy','浅拷贝后的引用关系',
 '不运行代码，判断最后两个比较的结果。',
 'const source = { settings: { dark: false } };\nconst copy = { ...source };\ncopy.settings.dark = true;\nconsole.log(source.settings.dark, source.settings === copy.settings);',
 ['false false','false true','true false','true true'],3,
 ['展开操作创建了哪个对象？','settings 属性里保存的仍是什么？','外层是新对象，settings 指向同一个内层对象。'],
 '结果是 true true。展开只创建新的外层对象，内层 settings 仍共享；修改其中属性会同时被两边观察到。');

code('object-copy-03','object-copy','更新路径上的对象',
 '实现 setTheme(state, theme)：返回新状态，只复制 state 和 state.settings，保留 state.history 的原引用，不修改输入。',
 'function setTheme(state, theme) {\n  // 在这里实现\n}',
 [['更新主题','const s={settings:{theme:"light",lang:"zh"},history:[1]};const n=setTheme(s,"dark");assert.equal(n.settings.theme,"dark");assert.equal(n.settings.lang,"zh")'],['不修改输入','const s={settings:{theme:"light"},history:[1]};setTheme(s,"dark");assert.equal(s.settings.theme,"light")'],['正确的引用关系','const s={settings:{theme:"light"},history:[1]};const n=setTheme(s,"dark");assert.ok(n!==s);assert.ok(n.settings!==s.settings);assert.ok(n.history===s.history)']],
 ['先确定哪个路径发生变化。','只复制从根到 theme 的对象。','返回 { ...state, settings: { ...state.settings, theme } }。'],
 'function setTheme(state, theme) {\n  return { ...state, settings: { ...state.settings, theme } };\n}',
 '不可变更新不等于深拷贝所有内容。复制发生变化的路径，未变化的 history 可以沿用。');

choice('object-methods-01','object-methods','方法传递后 this 指向哪里',
 '分别判断两次调用的输出。代码在严格模式下运行。',
 '"use strict";\nconst user = { name: "Lin", show() { return this.name; } };\nconst fn = user.show;\nconsole.log(user.show());\nconsole.log(fn());',
 ['Lin，然后 Lin','Lin，然后 undefined','Lin，然后抛出 TypeError','两次都抛出 TypeError'],2,
 ['函数体相同，调用形式是否相同？','user.show() 和 fn() 的接收者分别是谁？','严格模式下普通函数直接调用时 this 是 undefined。'],
 '第一次通过 user 调用，this 是 user；第二次直接调用 fn，this 是 undefined，读取 this.name 会抛出 TypeError。');

code('object-methods-02','object-methods','保留回调的对象上下文',
 '实现 makeFormatter(user)：返回一个函数。之后调用返回函数时，始终返回「name: score」，其中数据从传入的 user 读取；即使 user.score 后续变化也应反映最新值。',
 'function makeFormatter(user) {\n  // 在这里实现\n}',
 [['返回函数','const u={name:"Lin",score:3};const fn=makeFormatter(u);assert.equal(typeof fn,"function");assert.equal(fn(),"Lin: 3")'],['读取最新值','const u={name:"Lin",score:3};const fn=makeFormatter(u);u.score=9;assert.equal(fn(),"Lin: 9")'],['传递后仍正确','const u={name:"Q",score:5};const fn=makeFormatter(u);const obj={fn};assert.equal(obj.fn(),"Q: 5")']],
 ['不要在创建时把 score 固定到字符串里。','返回的函数可以闭包捕获 user。','在返回函数执行时读取 user.name 和 user.score。'],
 'function makeFormatter(user) {\n  return () => `${user.name}: ${user.score}`;\n}',
 '闭包保留对 user 对象的访问，执行时读取当前属性。返回函数不依赖调用它的对象。');

code('array-methods-01','array-methods','稳定合并购物车',
 '实现 mergeCart(items)：按 id 合并 quantity，结果保留首次出现的商品顺序。不能修改输入数组或其中的商品对象。',
 'function mergeCart(items) {\n  // 返回新数组\n}',
 [['合并并保序','const r=mergeCart([{id:"a",quantity:2},{id:"b",quantity:1},{id:"a",quantity:3}]);assert.deepEqual(r,[{id:"a",quantity:5},{id:"b",quantity:1}])'],['空输入','assert.deepEqual(mergeCart([]),[])'],['不修改输入','const items=[{id:"a",quantity:1},{id:"a",quantity:2}];mergeCart(items);assert.deepEqual(items,[{id:"a",quantity:1},{id:"a",quantity:2}])'],['结果对象独立','const items=[{id:"a",quantity:1}];const r=mergeCart(items);assert.ok(r[0]!==items[0])']],
 ['需要同时记住商品第一次出现的位置和当前累计值。','Map 可以把 id 映射到结果对象。','第一次出现时复制商品并放进结果；之后只改结果对象的 quantity。'],
 'function mergeCart(items) {\n  const found = new Map();\n  const result = [];\n  for (const item of items) {\n    if (found.has(item.id)) found.get(item.id).quantity += item.quantity;\n    else { const copy = { ...item }; found.set(item.id, copy); result.push(copy); }\n  }\n  return result;\n}',
 '用 Map 定位已有商品，用数组保留首次出现顺序。复制每个首次出现的商品，避免修改输入对象。','稍有难度');

code('array-methods-02','array-methods','多条件排序且不污染原数组',
 '实现 rankStudents(students)：按 score 从高到低排序，同分按 name 的字典序升序。返回新数组，原数组顺序不能改变。',
 'function rankStudents(students) {\n  // 在这里实现\n}',
 [['分数与同分规则','const r=rankStudents([{name:"Z",score:7},{name:"B",score:9},{name:"A",score:9}]);assert.deepEqual(r.map(x=>x.name),["A","B","Z"])'],['不修改数组顺序','const a=[{name:"Z",score:1},{name:"A",score:3}];rankStudents(a);assert.deepEqual(a.map(x=>x.name),["Z","A"])'],['重复调用稳定','const a=[{name:"A",score:2},{name:"B",score:2}];assert.deepEqual(rankStudents(a).map(x=>x.name),["A","B"])']],
 ['sort 会修改调用它的数组。','先复制数组，再排序。','比较器先比较 score，若相等再比较 name。'],
 'function rankStudents(students) {\n  return [...students].sort((a,b) => b.score - a.score || a.name.localeCompare(b.name));\n}',
 'sort 原地修改数组，因此先复制外层数组。比较器返回负数表示 a 排在 b 前面，同分时再比较姓名。');

code('array-methods-03','array-methods','只保留最新一条记录',
 '实现 latestById(events)：同一 id 只保留时间戳 ts 最大的一条；时间戳相同保留后出现的记录。结果按 id 首次出现的顺序排列，不能修改输入。',
 'function latestById(events) {\n  // 在这里实现\n}',
 [['最大时间戳','const r=latestById([{id:"a",ts:2},{id:"b",ts:1},{id:"a",ts:3}]);assert.deepEqual(r,[{id:"a",ts:3},{id:"b",ts:1}])'],['相同时保留后者','const r=latestById([{id:"a",ts:2,v:1},{id:"a",ts:2,v:2}]);assert.equal(r[0].v,2)'],['不能用 id 排序','const r=latestById([{id:"z",ts:1},{id:"a",ts:1}]);assert.deepEqual(r.map(x=>x.id),["z","a"])'],['输入不变','const x=[{id:"a",ts:2},{id:"a",ts:3}];latestById(x);assert.equal(x.length,2)']],
 ['记录每个 id 第一次出现的位置。','比较当前记录与已保存记录的 ts。','相等时也替换：使用 >=。'],
 'function latestById(events) {\n  const positions = new Map();\n  const result = [];\n  for (const event of events) {\n    if (!positions.has(event.id)) { positions.set(event.id,result.length); result.push(event); }\n    else { const index=positions.get(event.id); if (event.ts >= result[index].ts) result[index]=event; }\n  }\n  return result;\n}',
 'Map 记录首次出现位置，结果数组保持该顺序。遇到同 id 且时间戳更大或相等的记录时，替换原位置。','稍有难度');

choice('array-methods-04','array-methods','map 与 forEach 的返回值',
 '不运行代码，判断 result 的值。',
 'const values = [1, 2, 3];\nconst result = values.forEach((n) => n * 2);\nconsole.log(result);',
 ['[2, 4, 6]','[1, 2, 3]','undefined','TypeError'],2,
 ['回调返回值是否会成为 forEach 的返回值？','需要新数组时通常用什么方法？','forEach 自身返回 undefined。'],
 'forEach 返回 undefined。若希望得到每项转换后的新数组，应使用 map。');

code('map-set-01','map-set','按标签汇总数量',
 '实现 countTags(articles)：每篇文章的 tags 是字符串数组。返回 Map，键为标签，值为包含该标签的文章数量；同一篇文章内的重复标签只算一次。',
 'function countTags(articles) {\n  // 返回 Map\n}',
 [['统计多篇文章','const r=countTags([{tags:["js","css"]},{tags:["js"]}]);assert.ok(r instanceof Map);assert.equal(r.get("js"),2);assert.equal(r.get("css"),1)'],['单篇去重','const r=countTags([{tags:["js","js"]}]);assert.equal(r.get("js"),1)'],['空输入','assert.equal(countTags([]).size,0)']],
 ['对每篇文章单独去重。','Set 可以去重；Map 可以累计。','遍历 new Set(article.tags)，更新 Map 中的计数。'],
 'function countTags(articles) {\n  const counts = new Map();\n  for (const article of articles) for (const tag of new Set(article.tags)) counts.set(tag,(counts.get(tag) || 0)+1);\n  return counts;\n}',
 'Set 负责单篇去重，Map 负责跨文章累计。两个集合承担不同职责。');

code('destructuring-assignment-01','destructuring-assignment','给配置项提供安全默认值',
 '实现 normalizeOptions(options)：返回 { delay, retries }。未传 delay 时用 300，未传 retries 时用 2；明确传入 0 必须保留。允许 options 不传。',
 'function normalizeOptions(options) {\n  // 在这里实现\n}',
 [['完全缺省','assert.deepEqual(normalizeOptions(),{delay:300,retries:2})'],['部分缺省','assert.deepEqual(normalizeOptions({delay:150}),{delay:150,retries:2})'],['零值保留','assert.deepEqual(normalizeOptions({delay:0,retries:0}),{delay:0,retries:0})']],
 ['不要用 || 设置默认值，0 会被替换。','解构默认值只在值为 undefined 时生效。','先给整个参数默认空对象，再解构属性。'],
 'function normalizeOptions({ delay = 300, retries = 2 } = {}) {\n  return { delay, retries };\n}',
 '参数默认值处理未传对象；属性默认值处理未传字段。0 是有效值，不应被默认值覆盖。');

code('closure-01','closure','互不干扰的计数器',
 '实现 createCounter(initial = 0)：返回包含 inc()、dec()、value() 的对象。每个实例维护自己的计数值。',
 'function createCounter(initial = 0) {\n  // 在这里实现\n}',
 [['基本增减','const c=createCounter(3);assert.equal(c.inc(),4);assert.equal(c.dec(),3);assert.equal(c.value(),3)'],['实例隔离','const a=createCounter();const b=createCounter(10);a.inc();assert.equal(a.value(),1);assert.equal(b.value(),10)'],['方法提取后仍工作','const {inc,value}=createCounter(2);assert.equal(inc(),3);assert.equal(value(),3)']],
 ['状态应该放在哪里，才能让方法共享、实例之间又隔离？','在 createCounter 内声明局部变量。','返回的三个函数都访问同一个局部变量。'],
 'function createCounter(initial = 0) {\n  let current = initial;\n  return { inc: () => ++current, dec: () => --current, value: () => current };\n}',
 '每次调用 createCounter 都创建独立的词法环境；同一实例的三个方法闭包捕获其中的 current。');

code('closure-02','closure','只执行一次但缓存结果',
 '实现 once(fn)：包装函数只在第一次调用时执行 fn，并把首次返回值缓存下来。后续调用即使参数不同，也返回首次结果；调用时的 this 和参数要原样传给 fn。',
 'function once(fn) {\n  // 在这里实现\n}',
 [['只调用一次','let n=0;const f=once(x=>{n++;return x*2});assert.equal(f(3),6);assert.equal(f(8),6);assert.equal(n,1)'],['保留 this','const obj={base:5,run:once(function(x){return this.base+x})};assert.equal(obj.run(2),7)'],['允许 undefined 返回值','let n=0;const f=once(()=>{n++});f();f();assert.equal(n,1)']],
 ['不能用缓存结果是否为 undefined 来判断是否调用过。','需要一个布尔变量记录首次调用。','包装函数使用普通 function，以便接收动态 this，再用 fn.apply。'],
 'function once(fn) {\n  let called = false;\n  let result;\n  return function(...args) {\n    if (!called) { called = true; result = fn.apply(this,args); }\n    return result;\n  };\n}',
 'called 与 result 分开保存，才能正确处理 fn 返回 undefined 的情况。普通函数保留调用时的 this。','稍有难度');

choice('closure-03','closure','循环里的异步输出',
 '不运行代码，判断三个定时器打印的值。',
 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
 ['0 1 2','1 2 3','3 3 3','undefined 三次'],2,
 ['回调什么时候执行？','var 会为每次循环创建新的绑定吗？','循环结束时 i 已经是 3，回调共享同一个绑定。'],
 '输出 3、3、3。var 只创建一个 i 绑定，三个回调在循环结束后读取它。改用 let 可以为每次迭代建立独立绑定。');

code('bind-01','bind','预置参数且保留调用上下文',
 '实现 partial(fn, ...preset)：返回一个函数，把预置参数放在新参数前面，并让 fn 使用新函数被调用时的 this。',
 'function partial(fn, ...preset) {\n  // 在这里实现\n}',
 [['参数顺序','const f=partial((a,b,c)=>[a,b,c],1,2);assert.deepEqual(f(3),[1,2,3])'],['动态 this','const obj={factor:4,run:partial(function(a,b){return this.factor*(a+b)},2)};assert.equal(obj.run(3),20)'],['多次调用不串值','const f=partial((a,b)=>a+b,5);assert.equal(f(1),6);assert.equal(f(2),7)']],
 ['箭头函数没有自己的动态 this。','返回普通函数，收集后续参数。','使用 fn.apply(this, [...preset, ...later])。'],
 'function partial(fn, ...preset) {\n  return function(...later) { return fn.apply(this,[...preset,...later]); };\n}',
 '偏应用只固定部分参数；上下文由包装函数的调用位置决定。与直接对 fn.bind(null, ...) 不同。');

choice('promise-01','promise-basics','Promise 构造器与同步代码',
 '判断四条日志的执行顺序。',
 'console.log("A");\nnew Promise(resolve => { console.log("B"); resolve(); }).then(() => console.log("C"));\nconsole.log("D");',
 ['A B C D','A B D C','A D B C','B A D C'],1,
 ['Promise 构造器的 executor 什么时候运行？','then 回调什么时候进入微任务队列？','executor 同步执行，then 回调稍后作为微任务执行。'],
 'A、B、D、C。Promise 构造器的执行函数同步运行；then 回调排入微任务，在当前同步代码结束后执行。');

code('promise-all-01','promise-api','保留顺序地加载数据',
 '实现 loadAll(ids, fetchById)：并发调用 fetchById，返回一个 Promise，最终结果顺序必须与 ids 一致。任意一个请求失败时整体拒绝。',
 'function loadAll(ids, fetchById) {\n  // 在这里实现\n}',
 [['结果顺序','const f=id=>Promise.resolve({id});return loadAll([3,1,2],f).then(r=>assert.deepEqual(r.map(x=>x.id),[3,1,2]))'],['空数组','return loadAll([],()=>{throw Error("不应调用")}).then(r=>assert.deepEqual(r,[]))'],['失败向外传播','return loadAll([1,2],id=>id===2?Promise.reject(Error("bad")):Promise.resolve(id)).then(()=>{throw Error("应拒绝")},e=>assert.equal(e.message,"bad"))']],
 ['数组 map 可以立即发起全部请求。','Promise.all 会保持输入 Promise 的顺序。','返回 Promise.all(ids.map(fetchById))。'],
 'function loadAll(ids, fetchById) {\n  return Promise.all(ids.map(id => fetchById(id)));\n}',
 'Promise.all 并发等待全部任务，并按传入顺序提供结果；任意 Promise 拒绝时整体拒绝。');

choice('microtask-01','microtask-queue','同步、微任务和定时器',
 '判断输出顺序。',
 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nqueueMicrotask(() => console.log("D"));\nconsole.log("E");',
 ['A E C D B','A C D E B','A E B C D','A E D C B'],0,
 ['先完成当前同步任务。','微任务队列与定时器任务队列谁先处理？','C 和 D 都是微任务，按入队顺序执行。'],
 'A、E、C、D、B。先执行同步语句，再清空微任务队列，最后执行定时器回调。');

choice('async-await-01','async-await','await 后的代码如何继续',
 '判断输出顺序。',
 'async function run() {\n  console.log("A");\n  await Promise.resolve();\n  console.log("B");\n}\nrun();\nconsole.log("C");',
 ['A B C','A C B','C A B','A C，B 不执行'],1,
 ['调用 async 函数时，await 前面的代码何时执行？','await 后面的代码不会立刻继续。','同步输出 A、C，再通过微任务继续输出 B。'],
 'A、C、B。run() 立即开始执行到 await，之后暂停；同步的 C 先输出，随后恢复 run。');

code('async-await-02','async-await','失败时返回可用的备用数据',
 '实现 getUserOrFallback(id, fetchUser)：成功时返回用户；请求失败时返回 { id, name: "访客" }。不要吞掉同步参数错误：id 为 null 或 undefined 时应抛出 TypeError。',
 'async function getUserOrFallback(id, fetchUser) {\n  // 在这里实现\n}',
 [['成功结果','return getUserOrFallback(2,()=>Promise.resolve({id:2,name:"Lin"})).then(r=>assert.equal(r.name,"Lin"))'],['异步失败','return getUserOrFallback(3,()=>Promise.reject(Error("offline"))).then(r=>assert.deepEqual(r,{id:3,name:"访客"}))'],['缺失 id 拒绝','return getUserOrFallback(null,()=>Promise.resolve()).then(()=>{throw Error("应拒绝")},e=>assert.ok(e instanceof TypeError))']],
 ['先验证 id，再进入请求的 try 块。','在 catch 中只处理 fetchUser 的失败。','用 async/await，catch 返回备用对象。'],
 'async function getUserOrFallback(id, fetchUser) {\n  if (id == null) throw new TypeError("缺少 id");\n  try { return await fetchUser(id); }\n  catch { return { id, name: "访客" }; }\n}',
 '参数检查位于 try 外，缺失 id 不会被降级成访客。await 让 Promise 拒绝进入 catch，返回备用数据会使外层 Promise 成功。');

code('json-01','json','安全解析配置并保留默认值',
 '实现 parseConfig(json)：json 是字符串。合法 JSON 对象时返回 { theme, pageSize }，缺失字段分别默认为 "light" 和 20；非法 JSON、数组或 null 时返回默认配置。0 是合法 pageSize。',
 'function parseConfig(json) {\n  // 在这里实现\n}',
 [['合法配置','assert.deepEqual(parseConfig("{\\"theme\\":\\"dark\\",\\"pageSize\\":5}"),{theme:"dark",pageSize:5})'],['保留零值','assert.deepEqual(parseConfig("{\\"pageSize\\":0}"),{theme:"light",pageSize:0})'],['非法值','assert.deepEqual(parseConfig("oops"),{theme:"light",pageSize:20});assert.deepEqual(parseConfig("null"),{theme:"light",pageSize:20})'],['数组不是配置','assert.deepEqual(parseConfig("[]"),{theme:"light",pageSize:20})']],
 ['JSON.parse 会抛错，先处理解析失败。','typeof null 也是 object；数组也要排除。','用 ?? 提供缺省值，保留 0。'],
 'function parseConfig(json) {\n  const fallback = { theme: "light", pageSize: 20 };\n  try {\n    const value = JSON.parse(json);\n    if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;\n    return { theme: value.theme ?? fallback.theme, pageSize: value.pageSize ?? fallback.pageSize };\n  } catch { return fallback; }\n}',
 'JSON.parse 可能得到任意 JSON 值。先确认是非数组对象，再用空值合并运算符处理缺省，避免把 0 当成缺失。');

choice('event-bubbling-01','bubbling-and-capturing','捕获与冒泡的先后',
 '点击 button，判断日志顺序。假设没有阻止传播。',
 'parent.addEventListener("click", () => log("A"), true);\nparent.addEventListener("click", () => log("B"));\nbutton.addEventListener("click", () => log("C"));',
 ['A B C','C A B','A C B','B C A'],2,
 ['第三个参数 true 表示什么阶段？','事件先从外到内，再从内到外。','parent 捕获先执行，然后 button，最后 parent 冒泡。'],
 'A、C、B。捕获阶段先到 parent，然后到目标 button，随后冒泡回 parent。');

choice('event-delegation-01','event-delegation','动态按钮的事件委托',
 '列表会动态增加按钮。选择最能持续处理所有按钮点击的方案。',
 '<ul id="list"><li><button data-id="1">第一项</button></li></ul>',
 ['页面初始化时仅给现有 button 添加监听','给 list 添加 click 监听，并通过 event.target.closest("button[data-id]") 查找按钮，再确认它属于 list','每次点击时重新查询所有 button 并添加监听','给 document 添加监听，任何点击都当成按钮点击'],1,
 ['新按钮并不存在于初始化时。','点击可能发生在 button 内部子元素。','委托到稳定的 list，使用 closest 并限定范围。'],
 '把监听器放在持续存在的 list 上。点击时使用 closest 找到按钮，并确认按钮在 list 内；动态新增的按钮也能被处理。');

code('regexp-01','regexp-methods','提取全部命名占位符',
 '实现 placeholders(template)：提取形如 {{name}} 的全部占位符名称，名称只允许字母、数字和下划线，首字符必须是字母或下划线。保持出现顺序，包括重复项。',
 'function placeholders(template) {\n  // 返回字符串数组\n}',
 [['基本提取','assert.deepEqual(placeholders("Hi {{user}}, {{count}}!"),["user","count"])'],['重复项','assert.deepEqual(placeholders("{{x}} + {{x}}"),["x","x"])'],['拒绝非法名称','assert.deepEqual(placeholders("{{1x}} {{a-b}} {{_ok}}"),["_ok"])'],['无匹配','assert.deepEqual(placeholders("hello"),[])']],
 ['需要全局匹配，并取出捕获组。','名称可写成 [A-Za-z_][A-Za-z0-9_]*。','可使用 matchAll 和 Array.from。'],
 'function placeholders(template) {\n  return Array.from(template.matchAll(/\\{\\{([A-Za-z_][A-Za-z0-9_]*)\\}\\}/g), match => match[1]);\n}',
 '正则中的捕获组只匹配合法名称；matchAll 遍历所有匹配，返回值保留重复和原始顺序。');

code('object-01','object','只更新存在的属性',
 '实现 updateIfPresent(target, key, value)：如果 target 自身拥有 key，就更新并返回 true；否则不修改 target，返回 false。属性存在但值为 undefined 时，也应更新。',
 'function updateIfPresent(target, key, value) {\n  // 在这里实现\n}',
 [['存在但值为 undefined','const x={a:undefined};assert.equal(updateIfPresent(x,"a",3),true);assert.equal(x.a,3)'],['不存在不新增','const x={};assert.equal(updateIfPresent(x,"a",3),false);assert.ok(!Object.hasOwn(x,"a"))'],['继承属性不算自身','const x=Object.create({a:1});assert.equal(updateIfPresent(x,"a",2),false);assert.ok(!Object.hasOwn(x,"a"))']],
 ['不能用 target[key] 是否为 undefined 判断存在性。','in 会把原型链上的属性也算进去。','使用 Object.hasOwn(target, key)。'],
 'function updateIfPresent(target, key, value) {\n  if (!Object.hasOwn(target,key)) return false;\n  target[key]=value;\n  return true;\n}',
 '读取结果为 undefined 不表示属性不存在；in 又会检查原型链。Object.hasOwn 只检查对象自己的属性。');

choice('object-02','object','数字属性键的枚举顺序',
 '判断 Object.keys 的结果。',
 'const data = {};\ndata.b = 1;\ndata["2"] = 2;\ndata.a = 3;\ndata["1"] = 4;\nconsole.log(Object.keys(data));',
 ['["b", "2", "a", "1"]','["1", "2", "b", "a"]','["b", "a", "1", "2"]','顺序完全随机'],1,
 ['哪些键是整数形式的字符串？','整数索引键与普通字符串键的顺序规则不同。','整数索引键按升序，普通字符串键按创建顺序。'],
 '整数索引键 "1" 和 "2" 先按数值升序出现；普通字符串键 b、a 按加入顺序出现。');

choice('garbage-collection-01','garbage-collection','互相引用是否阻止回收',
 '两个对象互相引用。执行下面代码后，从程序根对象已无法访问它们。最准确的判断是什么？',
 'let a = {};\nlet b = {};\na.other = b;\nb.other = a;\na = null;\nb = null;',
 ['两个对象永远不会被回收，因为存在循环引用','只会回收 a，不会回收 b','两个对象都可能被垃圾回收，因为从根已不可达','必须手动 delete 两个 other 属性才能回收'],2,
 ['垃圾回收关注对象是否从根可达。','对象之间互相引用，但外部还有引用吗？','一个不可达的对象群即使内部有循环，也可能整体被回收。'],
 '循环引用本身不会使对象永久存活。关键是是否存在从全局变量、执行中的局部变量等根到它们的路径。');

choice('garbage-collection-02','garbage-collection','关闭弹窗后留下的引用',
 '一个缓存 Map 把 DOM 元素作为键，并长期存在。弹窗从页面移除后，如果键仍在 Map 中，最可能的问题是什么？',
 'const cache = new Map();\ncache.set(dialogElement, expensiveData);\ndialogElement.remove();',
 ['remove 会自动清空 Map','Map 中的键仍是强引用，元素及关联数据可能继续占用内存','DOM 元素不能作为 Map 的键','expensiveData 会立即被释放'],1,
 ['从页面移除，不等于程序里没有引用。','Map 是否仍持有那个元素？','Map 的键是强引用；可显式删除，或按需求考虑 WeakMap。'],
 'Map 仍持有元素键与数据。若缓存不再需要，应删除条目；若数据生命周期应跟随元素且不需要遍历，WeakMap 可作为另一种选择。');

choice('constructor-new-01','constructor-new','构造器返回对象的规则',
 '判断 new Maker() 的结果。',
 'function Maker() {\n  this.name = "inner";\n  return { name: "outer" };\n}\nconst result = new Maker();\nconsole.log(result.name);',
 ['inner','outer','undefined','TypeError'],1,
 ['构造函数显式返回了什么类型的值？','new 在返回对象时会采用它。','显式返回的对象替代默认创建的实例。'],
 '输出 outer。构造器显式返回对象时，new 表达式的结果是该对象；返回原始值则仍使用默认实例。');

code('constructor-new-02','constructor-new','兼容漏写 new 的构造器',
 '实现 Person(name)：用 new 调用或直接调用都返回一个 Person 实例，实例有 name 属性。直接调用时不能污染全局对象。',
 'function Person(name) {\n  // 在这里实现\n}',
 [['标准调用','const p=new Person("Lin");assert.ok(p instanceof Person);assert.equal(p.name,"Lin")'],['直接调用','const p=Person("Q");assert.ok(p instanceof Person);assert.equal(p.name,"Q")'],['实例独立','const a=Person("A"),b=Person("B");assert.ok(a!==b);assert.equal(a.name,"A")']],
 ['如何判断当前函数是否通过 new 调用？','new.target 在普通调用时为 undefined。','普通调用时返回 new Person(name)。'],
 'function Person(name) {\n  if (!new.target) return new Person(name);\n  this.name=name;\n}',
 'new.target 能区分构造调用与普通调用。普通调用显式创建实例，避免严格模式下 this 为 undefined。');

choice('optional-chaining-01','optional-chaining','可选链的短路边界',
 '判断 i 和 result 的值。',
 'let i = 0;\nconst user = null;\nconst result = user?.[i++];\nconsole.log(i, result);',
 ['0 undefined','1 undefined','1 null','0 null'],0,
 ['可选链在左侧为 null 时是否继续求值方括号里的表达式？','i++ 属于被跳过的求值路径。','整个可选链结果是 undefined，i 不变。'],
 '输出 0 和 undefined。左侧为 null 时可选链短路，索引表达式 i++ 不会执行。');

code('optional-chaining-02','optional-chaining','安全调用可选回调',
 '实现 notify(options, message)：若 options.onMessage 是函数，调用它并返回结果；未提供则返回 undefined。options 本身也可能为 null。',
 'function notify(options, message) {\n  // 在这里实现\n}',
 [['调用已有回调','let seen;const r=notify({onMessage(x){seen=x;return 8}},"hi");assert.equal(seen,"hi");assert.equal(r,8)'],['未提供回调','assert.equal(notify({},"hi"),undefined);assert.equal(notify(null,"hi"),undefined)'],['回调 this 指向 options','const x={base:2,onMessage(v){return this.base+v}};assert.equal(notify(x,3),5)']],
 ['需要安全处理 options 本身为空。','?.() 调用时会保留对象方法的 this。','可先检查 typeof，再调用 options.onMessage(message)。'],
 'function notify(options, message) {\n  if (typeof options?.onMessage !== "function") return undefined;\n  return options.onMessage(message);\n}',
 '只用 options?.onMessage?.(message) 会在属性存在但不是函数时抛错；本题要求只在它确实是函数时调用。');

choice('symbol-01','symbol','相同描述不代表相同 symbol',
 '判断两个比较的结果。',
 'const a = Symbol("token");\nconst b = Symbol("token");\nconst c = Symbol.for("token");\nconst d = Symbol.for("token");\nconsole.log(a === b, c === d);',
 ['true true','true false','false true','false false'],2,
 ['Symbol 每次创建的是唯一值。','Symbol.for 会查询或创建全局注册表。','前一组不同，后一组相同。'],
 'Symbol("token") 每次返回不同值；Symbol.for("token") 使用同一个注册表项。');

code('symbol-02','symbol','枚举字符串键与 symbol 键',
 '实现 ownKeysByType(obj)：返回 { strings, symbols }，分别包含对象自己的字符串键和 symbol 键。两个数组都要保留 JavaScript 的原生键顺序。',
 'function ownKeysByType(obj) {\n  // 在这里实现\n}',
 [['两类键','const s=Symbol("x");const obj={a:1,[s]:2};const r=ownKeysByType(obj);assert.deepEqual(r.strings,["a"]);assert.equal(r.symbols[0],s)'],['不可枚举键也包含','const obj={};Object.defineProperty(obj,"secret",{value:1,enumerable:false});assert.deepEqual(ownKeysByType(obj).strings,["secret"])'],['原生顺序','const x={b:1,2:2,a:3,1:4};assert.deepEqual(ownKeysByType(x).strings,["1","2","b","a"])']],
 ['Object.keys 会漏掉什么？','Reflect.ownKeys 返回自己的全部键。','用 typeof key 将 Reflect.ownKeys 的结果拆分。'],
 'function ownKeysByType(obj) {\n  const keys=Reflect.ownKeys(obj);\n  return { strings:keys.filter(key=>typeof key==="string"), symbols:keys.filter(key=>typeof key==="symbol") };\n}',
 'Reflect.ownKeys 包括不可枚举属性和 symbol 属性，并遵循原生键顺序；Object.keys 只返回可枚举字符串键。');

choice('object-toprimitive-01','object-toprimitive','对象转换时的 hint',
 '判断三次转换传给 Symbol.toPrimitive 的 hint 顺序。',
 'const seen=[];\nconst value={ [Symbol.toPrimitive](hint){seen.push(hint);return 2;} };\nString(value);\n+value;\nvalue + 1;\nconsole.log(seen);',
 ['["string","number","default"]','["default","number","string"]','["string","default","number"]','["number","number","number"]'],0,
 ['String(...) 明确需要字符串。','一元 + 明确需要数字。','二元 + 使用 default hint。'],
 '顺序是 string、number、default。二元加法先进行对象到原始值转换，使用 default hint，再决定数字运算或字符串拼接。');

code('object-toprimitive-02','object-toprimitive','定义可预测的金额转换',
 '实现 makePrice(amount)：返回对象。String(price) 应得到 "¥" 加金额；+price 应得到数字金额；price + 5 应得到金额加 5。',
 'function makePrice(amount) {\n  // 在这里实现\n}',
 [['字符串形式','assert.equal(String(makePrice(12)),"¥12")'],['数值形式','assert.equal(+makePrice(12),12)'],['默认加法','assert.equal(makePrice(12)+5,17)']],
 ['转换入口是 Symbol.toPrimitive。','hint 为 string 时返回带货币符号的字符串。','hint 为 number 或 default 时返回 amount。'],
 'function makePrice(amount) {\n  return { [Symbol.toPrimitive](hint) { return hint === "string" ? `¥${amount}` : amount; } };\n}',
 'Symbol.toPrimitive 可以按 hint 返回原始值。这里 string 供展示使用，number 和 default 保持数值运算。');

addDataTypeExercises({ code, choice });
addAdvancedFunctionExercises({ code, choice });
addObjectModelExercises({ code, choice });
addRemainingLanguageExercises({ code, choice });
addBrowserDomExercises({ dom });
addBrowserUiExercises({ code, choice, dom });
addAdvancedBrowserExercises({ code, choice, dom });
addRegexpExercises({ code, choice, dom });
addAdvancedBrowserReviewExercises({ code, choice, dom });
addFoundationReviewExercises({ code, choice, dom });
addBrowserReviewExercises({ code, choice, dom });
addAdvancedBrowserCodeExercises({ code, choice, dom });
addThirdFoundationExercises({ code, choice, dom });
addThirdObjectDataExercises({ code, choice, dom });
addThirdObjectModelExercises({ code, choice, dom });
addThirdAsyncMiscExercises({ code, choice, dom });
addThirdBrowserExercises({ code, choice, dom });
addThirdAdvancedBrowserExercises({ code, choice, dom });
addThirdRegexpExercises({ code, choice, dom });
addIntroDepthExercises({ code, choice, dom });
addBasicDepthExercises({ code, choice });
addCodeQualityDepthExercises({ choice });
addObjectDepthExercises({ choice, code });
addDataDepthExercises({ choice, code });
addDataDepthCodeExercises({ code });
addFunctionDepthExercises({ choice });
addFunctionDepthCodeExercises({ code });
addObjectModelDepthExercises({ choice });
addObjectModelDepthCodeExercises({ code });
addClassErrorDepthExercises({ choice });
addClassErrorDepthCodeExercises({ code });
addAsyncDepthExercises({ choice });
addAsyncDepthCodeExercises({ code });
addGeneratorModuleDepthExercises({ choice });
addGeneratorDepthCodeExercises({ code });
addLanguageMiscDepthExercises({ choice });
addLanguageMiscDepthCodeExercises({ code });
addDocumentDepthExercises({ choice });
addDocumentDepthCodeExercises({ dom });
addEventDepthExercises({ choice });
addEventDepthCodeExercises({ dom });
addUiDepthExercises({ choice });
addUiDepthCodeExercises({ code });
addFormDepthExercises({ choice });
addFormDepthCodeExercises({ code, dom });
addLoadingDepthExercises({ choice });
addBrowserMiscDepthExercises({ choice });
addWindowDepthExercises({ choice });
addBinaryDepthExercises({ choice });
addBinaryDepthCodeExercises({ code });
addFetchDepthExercises({ choice });
addFetchDepthCodeExercises({ code });
addNetworkDepthExercises({ choice });
addNetworkDepthCodeExercises({ code });
addStorageAnimationDepthExercises({ choice });
addAnimationDepthCodeExercises({ code });
addWebComponentsDepthExercises({ choice });
addRegexFoundationDepthExercises({ choice });
addRegexAdvancedDepthExercises({ choice });
addObjectModelExpansion({ choice });
addClassErrorExpansion({ choice });
addAsyncModuleExpansion({ choice });
addDomFoundationExpansion({ choice });
addDomLayoutExpansion({ choice });
addNetworkFetchExpansion({ choice });
addNetworkRealtimeExpansion({ choice });
addObjectBasicsExpansion({ choice });
addQualityExpansion({ choice });
addBasicsExpansionA({ choice });
addBasicsExpansionB({ choice });
addDataTypesExpansion({ choice });
addFunctionsExpansion({ choice });
addMiscBinaryExpansion({ choice });
addStorageAnimationExpansion({ choice });
addBrowserEventsExpansion({ choice });
addBrowserUiExpansion({ choice });
addWebComponentsExpansion({ choice });
addRegexFoundationExpansion({ choice });
addRegexAdvancedExpansion({ choice });

choice('hello-world-01','hello-world','脚本标签的执行位置',
 '页面按所示顺序解析。若脚本没有 async、defer 或 type="module"，最可能发生什么？',
 '<script>console.log(document.querySelector("#message"));</script>\n<p id="message">你好</p>',
 ['输出 p 元素','输出 null','脚本自动等页面加载后才执行','浏览器拒绝运行脚本'],1,
 ['普通脚本会暂停 HTML 解析并立即执行。','执行脚本时 p 元素是否已被解析？','查询发生在 p 元素出现之前。'],
 '普通脚本执行时，后面的 p 元素尚未进入 DOM，因此 querySelector 返回 null。');

choice('structure-01','structure','换行与自动分号插入',
 '判断函数返回值。',
 'function make() {\n  return\n  { ok: true };\n}\nconsole.log(make());',
 ['{ ok: true }','undefined','true','SyntaxError'],1,
 ['return 后的换行有没有特殊规则？','JavaScript 会在 return 后插入分号。','对象字面量没有成为返回值。'],
 'return 后的换行触发自动分号插入，函数实际返回 undefined。这个例子也说明不要依赖自动分号插入判断代码意图。');

choice('strict-mode-01','strict-mode','严格模式阻止意外全局变量',
 '下面代码在独立脚本中运行，会发生什么？',
 '"use strict";\nfunction save() { result = 42; }\nsave();',
 ['创建全局变量 result','抛出 ReferenceError','返回 42','抛出 TypeError'],1,
 ['result 有没有声明？','严格模式下能否给未声明的标识符赋值？','会抛出 ReferenceError。'],
 '严格模式禁止给未声明的变量赋值，避免意外创建全局变量。');

choice('variables-01','variables','const 固定的是绑定',
 '判断执行结果。',
 'const settings = { dark: false };\nsettings.dark = true;\nconsole.log(settings.dark);\nsettings = { dark: false };',
 ['先输出 true，然后 TypeError','先输出 false，然后 TypeError','两步都成功','第一行修改属性就抛出 TypeError'],0,
 ['const 约束的是变量绑定还是对象内容？','改属性和重新给 settings 赋值是两种操作。','属性可修改；重新赋值会失败。'],
 'const 不能让 settings 指向另一个对象，但不冻结当前对象。属性修改成功，重新赋值抛出 TypeError。');

choice('types-01','types','null、undefined 与 typeof',
 '判断输出。',
 'console.log(typeof null, typeof undefined, null == undefined, null === undefined);',
 ['"null" "undefined" true false','"object" "undefined" true false','"object" "undefined" false false','"object" "object" true true'],1,
 ['typeof null 有历史遗留结果。','宽松相等与严格相等规则不同。','typeof null 是 object，null == undefined 为 true。'],
 'typeof null 返回 "object" 是语言早期遗留行为；null 与 undefined 宽松相等，但类型不同，严格相等为 false。');

code('alert-prompt-confirm-01','alert-prompt-confirm','安全处理 prompt 的返回值',
 '实现 parseAge(answer)：模拟 prompt 返回值，可能是字符串或 null。只有去除首尾空格后完全由十进制数字组成、且年龄在 0 到 130 之间时返回数字；其余返回 null。',
 'function parseAge(answer) {\n  // 在这里实现\n}',
 [['有效输入','assert.equal(parseAge(" 25 "),25);assert.equal(parseAge("0"),0)'],['取消和空输入','assert.equal(parseAge(null),null);assert.equal(parseAge("  "),null)'],['无效字符','assert.equal(parseAge("12abc"),null);assert.equal(parseAge("2.5"),null);assert.equal(parseAge("-1"),null)'],['范围','assert.equal(parseAge("131"),null)']],
 ['prompt 取消时返回 null。','Number(空字符串) 会得到 0，不能直接转换。','先 trim，使用只接受数字的正则校验，再转换并检查范围。'],
 'function parseAge(answer) {\n  if (answer === null) return null;\n  const text=answer.trim();\n  if (!/^\\d+$/.test(text)) return null;\n  const age=Number(text);\n  return age<=130 ? age : null;\n}',
 'prompt 返回字符串或 null。先验证完整输入，再做数值转换，可以避免空字符串变 0 和 parseInt 截断部分无效内容。');

choice('type-conversions-01','type-conversions','不同类型转换的组合',
 '判断三个表达式的值。',
 'Boolean("0");\nNumber(null);\nNumber(undefined);',
 ['false、0、0','true、0、NaN','true、NaN、NaN','false、NaN、0'],1,
 ['非空字符串的布尔值是什么？','null 和 undefined 转数字的结果不同。','"0" 是非空字符串；Number(null)=0；Number(undefined)=NaN。'],
 '非空字符串 "0" 转布尔值为 true；null 转数字为 0；undefined 转数字为 NaN。');

choice('operators-01','operators','二元加法与一元加法',
 '判断结果。',
 'console.log("5" + 2, +"5" + 2, "5" - 2);',
 ['"52"、7、3','7、7、3','"52"、"52"、3','"52"、7、NaN'],0,
 ['二元 + 遇到字符串时可能拼接。','一元 + 会先做数字转换。','减法执行数字运算。'],
 '"5" + 2 是拼接得到 "52"；+"5" 先得到数字 5；减法把 "5" 转为数字。');

choice('comparison-01','comparison','null 的比较陷阱',
 '判断两个表达式的结果。',
 'console.log(null > 0, null >= 0);',
 ['false、false','true、true','false、true','true、false'],2,
 ['关系比较时 null 会如何转为数字？','大于与大于等于的结果可以不同。','null 转数字为 0，所以 0 > 0 为 false，0 >= 0 为 true。'],
 '关系比较把 null 转为 0，因此 null > 0 是 false，而 null >= 0 是 true。');

code('ifelse-01','ifelse','区分缺省分数和零分',
 '实现 grade(score)：score 为 null 或 undefined 时返回 "未评分"；0～59 返回 "未通过"；60～100 返回 "通过"；其他值返回 "无效"。输入保证是数字或 null/undefined。',
 'function grade(score) {\n  // 在这里实现\n}',
 [['缺省与零分','assert.equal(grade(null),"未评分");assert.equal(grade(undefined),"未评分");assert.equal(grade(0),"未通过")'],['边界','assert.equal(grade(59),"未通过");assert.equal(grade(60),"通过");assert.equal(grade(100),"通过")'],['非法范围','assert.equal(grade(-1),"无效");assert.equal(grade(101),"无效")']],
 ['不能用 if (!score) 判断未评分，0 会误判。','先检查 score == null。','再检查范围，最后按 60 分界。'],
 'function grade(score) {\n  if (score == null) return "未评分";\n  if (score < 0 || score > 100) return "无效";\n  return score >= 60 ? "通过" : "未通过";\n}',
 '题目的关键是区分 0 与缺省值，并按顺序检查无效范围和通过线。');

choice('logical-operators-01','logical-operators','逻辑运算符返回操作数',
 '判断 result 的值。',
 'const result = "" || 0 || "ready" && 7;\nconsole.log(result);',
 ['"ready"','7','0','true'],1,
 ['&& 的优先级高于 ||。','逻辑运算符返回操作数，不一定返回布尔值。','"ready" && 7 得到 7，前面两个都是假值。'],
 '先计算 "ready" && 7 得到 7，再由 || 返回第一个真值 7。');

code('nullish-coalescing-operator-01','nullish-coalescing-operator','保留用户设置的零值和空字符串',
 '实现 displaySettings(input)：返回 { volume, label }。只有对应值为 null 或 undefined 才使用默认值 50 与 "未命名"；输入本身可以为 null。',
 'function displaySettings(input) {\n  // 在这里实现\n}',
 [['保留有效假值','assert.deepEqual(displaySettings({volume:0,label:""}),{volume:0,label:""})'],['字段缺失','assert.deepEqual(displaySettings({}),{volume:50,label:"未命名"})'],['输入为空','assert.deepEqual(displaySettings(null),{volume:50,label:"未命名"})']],
 ['|| 会把 0 和空字符串都当作需要默认值。','?. 能处理 input 为 null。','分别使用 input?.volume ?? 50 与 input?.label ?? "未命名"。'],
 'function displaySettings(input) {\n  return { volume: input?.volume ?? 50, label: input?.label ?? "未命名" };\n}',
 '空值合并运算符只把 null 和 undefined 当作缺省；0 与空字符串保留。');

code('while-for-01','while-for','跳过无效数据后提前停止',
 '实现 firstLimit(values, limit)：从左到右查找第一个大于等于 limit 的有限数字，跳过 NaN 与 Infinity；找到就返回索引，找不到返回 -1。',
 'function firstLimit(values, limit) {\n  // 在这里实现\n}',
 [['找到最早索引','assert.equal(firstLimit([1,5,9],5),1)'],['跳过非有限值','assert.equal(firstLimit([NaN,Infinity,3,8],5),3)'],['找不到','assert.equal(firstLimit([1,2],5),-1);assert.equal(firstLimit([],5),-1)']],
 ['需要索引，所以选择能访问索引的循环。','Number.isFinite 可以筛掉 NaN 和 Infinity。','满足条件后立即 return；循环结束返回 -1。'],
 'function firstLimit(values, limit) {\n  for (let i=0;i<values.length;i++) {\n    if (!Number.isFinite(values[i])) continue;\n    if (values[i]>=limit) return i;\n  }\n  return -1;\n}',
 'continue 跳过无效值；一旦找到立即返回，避免扫描后续数据。');

choice('switch-01','switch','switch 的严格匹配与贯穿',
 '判断结果。',
 'let result="";\nswitch ("2") {\n  case 2: result += "A";\n  case "2": result += "B";\n  default: result += "C";\n}\nconsole.log(result);',
 ['A','AB','BC','C'],2,
 ['switch 的匹配是否把字符串转换成数字？','匹配到 case 后，缺少 break 会怎样？','"2" 匹配字符串 case，再继续执行 default。'],
 'switch 用严格相等匹配，因此跳过数字 2 的 case；从字符串 "2" 开始执行，缺少 break，最后得到 BC。');

code('function-basics-01','function-basics','带上限的可选折扣',
 '实现 finalPrice(price, discount = 0)：discount 取值可为 0～1，返回 price × (1-discount)，但最终价格不能小于 0。若 discount 超出 0～1，则抛出 RangeError。',
 'function finalPrice(price, discount = 0) {\n  // 在这里实现\n}',
 [['默认参数','assert.equal(finalPrice(100),100);assert.equal(finalPrice(100,0),100)'],['正常折扣','assert.equal(finalPrice(100,0.25),75);assert.equal(finalPrice(20,1),0)'],['无效折扣','assert.throws(()=>finalPrice(100,1.2));assert.throws(()=>finalPrice(100,-0.1))']],
 ['先验证折扣范围。','默认参数只在未传值或传入 undefined 时生效。','检查后返回 Math.max(0,price*(1-discount))。'],
 'function finalPrice(price, discount = 0) {\n  if (discount < 0 || discount > 1) throw new RangeError("折扣无效");\n  return Math.max(0, price * (1-discount));\n}',
 '参数默认值处理省略折扣。验证后计算价格，Math.max 保证最终结果不低于 0。');

choice('function-expressions-01','function-expressions','函数声明与表达式的可用时机',
 '判断代码的执行情况。',
 'console.log(declared());\nconsole.log(expressed());\nfunction declared() { return "A"; }\nconst expressed = function () { return "B"; };',
 ['输出 A、B','先输出 A，然后抛出 ReferenceError','先抛出 ReferenceError，什么都不输出','先输出 A，然后输出 undefined'],1,
 ['函数声明会在其所在作用域初始化时可用。','const 声明在执行到初始化语句之前处于暂时性死区。','先成功调用 declared，再在读取 expressed 时抛错。'],
 '函数声明可在声明前调用；const 变量在初始化前处于暂时性死区，所以第二次调用抛出 ReferenceError。');

code('arrow-functions-basics-01','arrow-functions-basics','转换为卡片摘要',
 '实现 summarize(items)：用数组方法返回新数组，每项是 { id, title }。缺失 title 时使用 "无标题"；原对象不能修改。',
 'function summarize(items) {\n  // 在这里实现\n}',
 [['转换结构','assert.deepEqual(summarize([{id:1,title:"A",body:"x"}]),[{id:1,title:"A"}])'],['缺省标题与空标题','assert.deepEqual(summarize([{id:2},{id:3,title:""}]),[{id:2,title:"无标题"},{id:3,title:""}])'],['不修改输入','const x=[{id:1,body:"x"}];summarize(x);assert.deepEqual(x,[{id:1,body:"x"}])']],
 ['使用 map 返回新数组。','箭头函数直接返回对象字面量时要加括号。','标题使用 item.title ?? "无标题"。'],
 'function summarize(items) {\n  return items.map(item => ({ id:item.id, title:item.title ?? "无标题" }));\n}',
 'map 为每项生成一个新的摘要对象。箭头函数中的对象字面量需用括号包住，否则花括号会被解释为函数体。');

choice('javascript-specials-01','javascript-specials','识别真假值与空数组',
 '判断三个表达式的结果。',
 'Boolean([]);\n[] == false;\n[] === false;',
 ['true、true、false','false、true、false','true、false、false','false、false、false'],0,
 ['对象即使是空数组，布尔转换仍为 true。','宽松相等会进行类型转换。','严格相等不转换类型。'],
 '空数组是对象，所以 Boolean([]) 为 true；宽松比较会转换，[] == false 为 true；严格比较类型不同，为 false。');

addDebuggingExercises({ questions });

const out = new URL('../dist/data/questions.json', import.meta.url);
writeFileSync(out, JSON.stringify(questions, null, 2) + '\n');
console.log(`generated ${questions.length} questions`);
