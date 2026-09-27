export function addRemainingLanguageExercises({ code, choice }) {
  choice('intro-01','intro','语言能力与浏览器能力的边界',
    '同一段 JavaScript 希望同时在浏览器和普通 Node.js 中运行。哪项能力不能直接假定存在？',
    'const result = [1,2,3].map(n=>n*2);\n// 接下来需要读取页面标题',
    ['Array.prototype.map','Promise','document.title','JSON.parse'],2,
    ['JavaScript 语言提供数组、Promise 和 JSON。','页面对象由浏览器环境提供。','普通 Node.js 没有 document。'],
    'document 是浏览器提供的页面接口，不是 JavaScript 语言本身的内建对象。');

  choice('manuals-specifications-01','manuals-specifications','查找语法规则还是实现兼容性',
    '你需要确认某个新语法的精确行为，同时还要知道目标浏览器版本是否支持它。最合适的资料组合是什么？',
    '',
    ['只查一个博客示例','语言规范用于行为定义，兼容性资料用于实现支持情况','只看本地编辑器提示','只读包管理器的版本号'],1,
    ['“规定应该怎样”与“某环境是否已实现”是两类问题。','规范和兼容性表各有职责。','用规范理解行为，用兼容性资料检查支持。'],
    '语言规范定义行为，兼容性资料记录各环境的实现情况；两者不能互相替代。');

  choice('code-editors-01','code-editors','编辑器提示与真实运行结果',
    '编辑器没有提示某个对象属性不存在，但浏览器运行时报错。排查时哪一步最直接？',
    'const value = response.user.name;',
    ['相信编辑器提示，不检查数据','在实际运行环境暂停并检查 response 的真实结构','换一种代码字体','关闭浏览器错误提示'],1,
    ['静态提示基于已知类型或推断。','运行时数据可能与假设不同。','查看实际 response 和调用栈。'],
    '编辑器提示不能证明运行时数据一定符合预期。先检查真实的 response，确认缺失发生在哪一层。');

  choice('devtools-01','devtools','断点停在错误之前',
    '一个点击处理函数有时把旧结果显示到页面。要确认是哪次请求覆盖了最新结果，最有帮助的操作是什么？',
    '',
    ['只清空 Console','在更新页面的语句设断点，查看请求标识、调用栈和当前变量','反复刷新直到问题消失','删除所有异步代码'],1,
    ['需要知道错误更新那一刻的状态。','断点可暂停执行并检查当前作用域。','比较响应顺序和更新时持有的请求标识。'],
    '在实际写入页面的位置暂停，能检查是哪一个异步响应、以什么状态触发了更新。');

  choice('debugging-chrome-01','debugging-chrome','定位异步回调里的异常',
    '异常发生在 Promise 回调中。Console 只显示错误消息时，哪项信息最有助于定位源代码位置？',
    '',
    ['页面的背景颜色','异常的堆栈与源代码映射后的文件行号','浏览器窗口尺寸','当地时间'],1,
    ['错误来自哪一个函数、哪一行？','调用栈给出执行路径。','若代码被打包，源代码映射帮助回到原文件。'],
    '调用栈与源代码映射能把运行时异常定位到原始文件和行号，再用断点检查数据。');

  choice('coding-style-01','coding-style','减少条件嵌套的重构',
    '一个函数先检查输入是否为空，再检查权限，最后处理数据。哪种重构通常最容易保持清晰？',
    '',
    ['把所有条件压成一行三元表达式','用明确的早返回处理失败条件，再写主要流程','把变量名统一缩成一个字母','去掉所有空行和缩进'],1,
    ['读者需要先识别失败分支。','早返回可减少主要流程的嵌套。','清晰命名和结构比行数短更重要。'],
    '早返回处理无效输入和权限失败，主要流程保持较少嵌套，更容易阅读和维护。');

  choice('comments-01','comments','注释解释原因',
    '哪条注释最能帮助维护者理解下面的代码？',
    'const retryDelay = 1200;',
    ['// 把 retryDelay 设为 1200','// 毫秒','// 服务端限流窗口约为 1 秒；额外留 200 毫秒避免边界重复请求','// 很重要，别改'],2,
    ['代码本身已告诉读者数值是什么。','注释更应解释外部约束和选择原因。','第三条给出可验证的设计依据。'],
    '好的注释补充代码无法直接表达的原因和约束，而不是复述赋值语句。');

  choice('ninja-code-01','ninja-code','找出会增加维护成本的写法',
    '要处理多个用户分组，哪种写法最可能让后续排错困难？',
    '',
    ['给函数和变量取表达用途的名字','把多个中间结果都复用同一个单字母变量，并混合不同类型','把复杂逻辑拆成小函数','在关键边界添加测试'],1,
    ['可读性包括跟踪变量含义。','同一变量反复承担不同角色，会增加理解负担。','第二项最容易掩盖数据变化。'],
    '复用含义不稳定的短变量名会让执行过程难以追踪，尤其是复杂数据转换。');

  choice('testing-mocha-01','testing-mocha','测试边界行为',
    '一个函数 parseCount("3") 应返回 3。为了更有力地验证需求，下一个测试最值得添加什么？',
    'function parseCount(text) { /* 实现未知 */ }',
    ['再次测试 parseCount("3")','测试空输入、非法字符和 0 的约定行为','只测试函数是否存在','把实现代码复制进测试断言'],1,
    ['正常样例只覆盖一种路径。','边界与异常输入更容易暴露错误假设。','明确 0、空输入和非法值的预期。'],
    '有意义的测试覆盖需求边界和错误路径，避免只是重复验证同一个正常输入。');

  choice('polyfills-01','polyfills','转译与 Polyfill 的分工',
    '目标浏览器不支持某种新语法，也缺少某个新内建方法。最准确的处理方式是什么？',
    '',
    ['语法靠 Polyfill，内建方法靠转译','语法通过转译处理；缺失的运行时方法需要 Polyfill 或替代实现','两者都只能通过修改 HTML 解决','只要编辑器不报错就无需处理'],1,
    ['语法需要在运行前变成旧环境能解析的代码。','运行时缺少的方法需要提供实现。','二者是不同层面的问题。'],
    '转译把新语法转换为目标环境可解析的代码；Polyfill 为缺失的运行时能力提供实现。');

  code('callbacks-01','callbacks','错误优先回调只调用一次',
    '实现 loadOnce(loader, callback)：loader 接收一个错误优先回调 (error, value)，它可能错误地多次回调。保证外部 callback 只接收第一次结果，并原样传递 error 和 value。',
    'function loadOnce(loader, callback) {\n  // 在这里实现\n}',
    [['第一次成功','const got=[];loadOnce(done=>{done(null,1);done(null,2)},(...args)=>got.push(args));assert.deepEqual(got,[[null,1]])'],['第一次错误','const e=Error("bad"),got=[];loadOnce(done=>{done(e);done(null,2)},(...args)=>got.push(args));assert.equal(got.length,1);assert.ok(got[0][0]===e)'],['异步重复','return new Promise((resolve,reject)=>{const got=[];loadOnce(done=>{setTimeout(()=>done(null,1),0);setTimeout(()=>done(null,2),5)},(...args)=>got.push(args));setTimeout(()=>{try{assert.deepEqual(got,[[null,1]]);resolve()}catch(e){reject(e)}},10)})']],
    ['用闭包保存是否已经处理过结果。','包装 loader 的回调，而不是改变 loader。','第一次调用后设置 settled=true；后续直接返回。'],
    'function loadOnce(loader, callback) {\n  let settled=false;\n  loader((error,value)=>{\n    if(settled) return;\n    settled=true;\n    callback(error,value);\n  });\n}',
    '错误优先回调的第一参数表示错误。闭包中的 settled 保证外部只观察第一次完成结果。');

  choice('callbacks-02','callbacks','回调嵌套中的错误传播',
    '三个依赖步骤都使用回调。哪个组织方式最能保证每一步失败都被交给同一个失败处理函数？',
    '',
    ['每一步都只写成功分支','每一步回调先检查 error 并立即交给统一的失败处理函数','只在最外层包一个 try/catch，然后忽略回调中的 error 参数','在最后一步再检查第一步的错误'],1,
    ['错误优先回调把错误作为参数传入。','异步回调的错误不会自动传播到先前同步 try/catch。','每层先处理 error，再进入下一步。'],
    '错误优先回调需要在每个异步步骤明确检查 error，否则后续步骤可能继续使用无效数据。');

  choice('promise-chaining-01','promise-chaining','忘记返回 Promise 会怎样',
    '判断最后一个 then 会收到什么。',
    'Promise.resolve(2)\n  .then(n => { Promise.resolve(n * 3); })\n  .then(value => console.log(value));',
    ['6','2','undefined','Promise 对象'],2,
    ['第一个 then 回调使用花括号，却没有 return。','链的下一步收到回调的返回值。','返回值是 undefined。'],
    '第一个 then 没有返回内部 Promise 或结果，因此链的下一步收到 undefined。');

  code('promise-chaining-02','promise-chaining','按顺序处理异步记录',
    '实现 processSequential(ids, load, save)：按 ids 顺序逐个 await load(id)，再 await save(record)；返回 save 的全部结果数组。必须等上一项保存完成才处理下一项。',
    'async function processSequential(ids, load, save) {\n  // 在这里实现\n}',
    [['顺序和结果','const events=[];const load=async id=>{events.push(`load${id}`);return{id}};const save=async r=>{events.push(`save${r.id}`);return r.id*2};return processSequential([1,2],load,save).then(r=>{assert.deepEqual(r,[2,4]);assert.deepEqual(events,["load1","save1","load2","save2"])})'],['空数组','return processSequential([],()=>{throw Error("bad")},()=>{}).then(r=>assert.deepEqual(r,[]))'],['错误停止后续','let n=0;return processSequential([1,2],async id=>id,async()=>{n++;throw Error("stop")}).then(()=>{throw Error("应拒绝")},()=>assert.equal(n,1))']],
    ['for...of 可以按顺序遍历。','在循环体里分别 await load 与 save。','把 save 的结果放入数组，最后返回。'],
    'async function processSequential(ids, load, save) {\n  const results=[];\n  for(const id of ids) {\n    const record=await load(id);\n    results.push(await save(record));\n  }\n  return results;\n}',
    '循环里的 await 让每一项的加载和保存按顺序完成；任一步拒绝会停止后续项。','稍有难度');

  code('promise-error-handling-01','promise-error-handling','只恢复可预期的请求错误',
    '实现 requestOrCache(request, cache)：request 返回 Promise。若拒绝且错误的 code 为 "OFFLINE"，返回 cache() 的结果；其他错误继续拒绝。cache 可以同步返回值或 Promise。',
    'function requestOrCache(request, cache) {\n  // 在这里实现\n}',
    [['正常请求','return requestOrCache(()=>Promise.resolve(5),()=>0).then(x=>assert.equal(x,5))'],['离线回退','return requestOrCache(()=>Promise.reject({code:"OFFLINE"}),()=>Promise.resolve(7)).then(x=>assert.equal(x,7))'],['其他错误传播','const e=Error("bad");return requestOrCache(()=>Promise.reject(e),()=>0).then(()=>{throw Error("未拒绝")},actual=>assert.ok(actual===e))']],
    ['在 Promise 链的 catch 中判断错误。','返回 cache() 的结果，链会等待其 Promise。','未知错误使用 throw error 再次抛出。'],
    'function requestOrCache(request, cache) {\n  return Promise.resolve().then(request).catch(error=>{\n    if(error?.code==="OFFLINE") return cache();\n    throw error;\n  });\n}',
    '只恢复明确允许的离线错误。返回 cache() 的 Promise 会被链吸收并等待；其他异常继续传播。');

  choice('promise-error-handling-02','promise-error-handling','finally 不会替换正常结果',
    '判断链最终收到的值。',
    'Promise.resolve(3).finally(() => 99).then(value => console.log(value));',
    ['3','99','undefined','Promise 对象'],0,
    ['finally 用于清理。','只要 finally 没有抛错或返回拒绝的 Promise，它不会改变原结果。','最后仍收到 3。'],
    'finally 的普通返回值不会替换先前的 fulfilled 值，最终 then 收到 3。');

  code('promisify-01','promisify','把错误优先回调包装成 Promise',
    '实现 promisify(fn)：fn(...args, callback) 的 callback 形式为 (error, value)。返回的新函数把原参数传给 fn，成功时 resolve(value)，错误时 reject(error)，并保留调用时的 this。',
    'function promisify(fn) {\n  // 在这里实现\n}',
    [['成功与 this','const obj={base:4,run:promisify(function(x,cb){cb(null,this.base+x)})};return obj.run(3).then(v=>assert.equal(v,7))'],['错误传播','const e=Error("bad");const f=promisify((cb)=>cb(e));return f().then(()=>{throw Error("应拒绝")},actual=>assert.ok(actual===e))'],['多参数','const f=promisify((a,b,cb)=>cb(null,a+b));return f(2,5).then(v=>assert.equal(v,7))']],
    ['返回包装函数，内部创建 Promise。','把新回调接在参数数组末尾。','调用原函数时用 fn.call(this,...args,callback)。'],
    'function promisify(fn) {\n  return function(...args) {\n    return new Promise((resolve,reject)=>{\n      fn.call(this,...args,(error,value)=>error ? reject(error) : resolve(value));\n    });\n  };\n}',
    'Promise 构造器把回调式完成信号转为 resolve 或 reject；包装函数保持动态 this。');

  choice('promisify-02','promisify','一次回调与 Promise 状态',
    '错误的旧 API 连续调用回调两次。用标准 Promise 包装后，最终状态会怎样？',
    'new Promise((resolve,reject)=>{resolve(1);reject(Error("late"));});',
    ['先成功后失败','最终 rejected','最终 fulfilled，值为 1','永远 pending'],2,
    ['Promise 状态只能改变一次。','第一次 settle 之后的 reject 无效。','最终保持 fulfilled(1)。'],
    'Promise 一旦从 pending 变为 fulfilled，就不能再改为 rejected；后面的 reject 不会改变结果。');

  code('generators-01','generators','按需生成斐波那契数列',
    '实现 generator 函数 fibonacci(count)：依次 yield 前 count 个非负斐波那契数，序列从 0、1 开始。count 为非负整数。',
    'function* fibonacci(count) {\n  // 在这里实现\n}',
    [['前六项','assert.deepEqual([...fibonacci(6)],[0,1,1,2,3,5])'],['零与一项','assert.deepEqual([...fibonacci(0)],[]);assert.deepEqual([...fibonacci(1)],[0])'],['可重复创建迭代器','assert.deepEqual([...fibonacci(3)],[0,1,1]);assert.deepEqual([...fibonacci(3)],[0,1,1])']],
    ['维护当前项与下一项两个变量。','每次循环先 yield 当前项，再更新。','使用 [a,b]=[b,a+b]。'],
    'function* fibonacci(count) {\n  let a=0,b=1;\n  for(let i=0;i<count;i++) { yield a; [a,b]=[b,a+b]; }\n}',
    'Generator 只有被迭代时才产生下一个值；每次调用 fibonacci 得到独立迭代器。');

  choice('generators-02','generators','next 向 yield 传值',
    '判断第二次 next 的结果 value。',
    'function* calc(){const x=yield 2;return x*3}\nconst it=calc();\nit.next();\nconsole.log(it.next(4).value);',
    ['2','4','12','undefined'],2,
    ['第二次 next(4) 的参数成为上一个 yield 表达式的结果。','x 得到 4。','return x*3 得到 12。'],
    '第一次 next 在 yield 2 暂停；第二次 next(4) 让 yield 表达式得到 4，然后返回 12。');

  code('async-iterators-generators-01','async-iterators-generators','分页数据的异步迭代',
    '实现 async generator allItems(fetchPage)：从页码 1 开始逐页 await fetchPage(page)，每页返回数组。逐项 yield；遇到空数组停止，不请求更后面的页。',
    'async function* allItems(fetchPage) {\n  // 在这里实现\n}',
    [['按页输出','const calls=[];const fetch=async p=>{calls.push(p);return p===1?["a","b"]:p===2?["c"]:[]};return (async()=>{const out=[];for await(const x of allItems(fetch))out.push(x);assert.deepEqual(out,["a","b","c"]);assert.deepEqual(calls,[1,2,3])})()'],['首个空页','let n=0;return (async()=>{for await(const x of allItems(async()=>{n++;return []})){}assert.equal(n,1)})()']],
    ['用 for 循环维护页码。','每页先 await，若空则 return。','遍历结果数组并逐项 yield。'],
    'async function* allItems(fetchPage) {\n  for(let page=1;;page++) {\n    const items=await fetchPage(page);\n    if(items.length===0) return;\n    for(const item of items) yield item;\n  }\n}',
    '异步 generator 把分页请求和逐项消费组合起来；空页是停止信号。','稍有难度');

  choice('async-iterators-generators-02','async-iterators-generators','消费异步可迭代对象',
    '一个对象实现了 Symbol.asyncIterator，哪个语法可以按顺序读取它的值？',
    'const stream={async *[Symbol.asyncIterator](){yield 1;yield 2}};',
    ['for (const x of stream)','for await (const x of stream)','stream.map(x=>x)','[...stream]'],1,
    ['同步 for...of 需要 Symbol.iterator。','异步迭代使用 for await...of。','在异步函数中使用 for await。'],
    'for await...of 消费 Symbol.asyncIterator 返回的异步迭代器。');

  choice('modules-intro-01','modules-intro','模块的独立作用域',
    '两个 ES 模块都声明了顶层 const name，但互相没有导入。最准确的结果是什么？',
    '',
    ['两个模块顶层声明会互相覆盖','每个模块有自己的顶层作用域，通常不会冲突','第二个模块必然抛出重复声明错误','变量自动成为 window.name'],1,
    ['模块与普通脚本的顶层作用域不同。','模块之间需要显式导出和导入。','同名顶层绑定可以分别存在。'],
    'ES 模块各有自己的顶层作用域。跨模块使用值需要显式 export/import。');

  choice('import-export-01','import-export','命名导出与默认导入',
    '假设 module.js 同时有 export const limit = 5 和 export default function run(){}，哪种导入写法正确？',
    '',
    ['import { run, limit } from "./module.js"','import run, { limit } from "./module.js"','import { default, limit } from "./module.js"','import limit, { run } from "./module.js"'],1,
    ['默认导出不使用命名导入语法中的普通标识符。','命名导出 limit 放在花括号里。','run 是默认导入，limit 是命名导入。'],
    '默认导出可作为 run 导入；命名导出 limit 需要放在花括号内。');

  choice('modules-dynamic-imports-01','modules-dynamic-imports','动态导入的返回结果',
    '动态 import("./module.js") 返回什么？',
    '',
    ['立即返回模块默认导出的函数','返回 Promise，成功后得到模块命名空间对象','返回普通字符串','只允许写在文件顶层'],1,
    ['动态导入是异步操作。','成功结果包含模块的导出。','返回 Promise<ModuleNamespace>。'],
    'import() 返回 Promise，兑现值是包含该模块导出的命名空间对象，可按需加载模块。');

  code('proxy-01','proxy','代理对象校验赋值',
    '实现 positiveSettings(target)：返回 Proxy。对它的 timeout 属性赋值时，只有正的有限数字才允许，否则抛出 RangeError；其他属性正常设置。',
    'function positiveSettings(target) {\n  // 在这里实现\n}',
    [['正常赋值','const p=positiveSettings({});p.timeout=5;p.label="x";assert.equal(p.timeout,5);assert.equal(p.label,"x")'],['拒绝非法值','const p=positiveSettings({timeout:1});assert.throws(()=>{p.timeout=0});assert.throws(()=>{p.timeout=Infinity});assert.equal(p.timeout,1)'],['目标对象同步','const x={};const p=positiveSettings(x);p.timeout=3;assert.equal(x.timeout,3)']],
    ['Proxy 的 set 捕捉器处理属性赋值。','仅对 key === "timeout" 校验。','通过 Reflect.set 完成实际写入并返回布尔结果。'],
    'function positiveSettings(target) {\n  return new Proxy(target,{set(object,key,value,receiver){\n    if(key==="timeout" && (!Number.isFinite(value) || value<=0)) throw new RangeError("timeout 无效");\n    return Reflect.set(object,key,value,receiver);\n  }});\n}',
    'set 捕捉器在写入前验证指定属性；Reflect.set 保留正常赋值语义。');

  choice('proxy-02','proxy','代理拦截的对象是谁',
    'Proxy 的 get 捕捉器返回固定值，判断 proxy.count 和 target.count。',
    'const target={count:1};\nconst proxy=new Proxy(target,{get(obj,key){if(key==="count")return 9;return Reflect.get(obj,key)}});\nconsole.log(proxy.count,target.count);',
    ['9、9','1、1','9、1','1、9'],2,
    ['只有经由 proxy 的读取会经过捕捉器。','直接读取 target 绕过代理。','分别是 9 和 1。'],
    'proxy.count 经过 get 捕捉器得到 9；直接读取 target.count 仍是原值 1。');

  choice('eval-01','eval','执行外部字符串的风险',
    '一个搜索框收到用户输入，需求只是把输入作为文本显示。哪种做法正确？',
    'const input = userProvidedText;',
    ['eval(input)','new Function(input)()','element.textContent = input','element.innerHTML = input'],2,
    ['需求是显示文本，不是执行代码。','textContent 会把输入作为文本处理。','不要把输入当作代码或 HTML 解释。'],
    'textContent 将输入作为文本显示。eval 和 new Function 执行代码，innerHTML 则会解析成 HTML，都不符合需求。');

  code('currying-partials-01','currying-partials','分步调用的通用求和',
    '实现 curry2(fn)：把两个参数的函数转换成可分步调用的函数。curry2(fn)(a)(b) 应等于 fn(a,b)。确保每次第一次调用得到独立的后续函数。',
    'function curry2(fn) {\n  // 在这里实现\n}',
    [['求和','const f=curry2((a,b)=>a+b);assert.equal(f(2)(3),5)'],['独立预置值','const f=curry2((a,b)=>a-b);const minus10=f(10),minus5=f(5);assert.equal(minus10(2),8);assert.equal(minus5(2),3)'],['返回任意类型','const f=curry2((a,b)=>({a,b}));assert.deepEqual(f("x")("y"),{a:"x",b:"y"})']],
    ['返回一个接收 a 的函数，再返回接收 b 的函数。','闭包保存 a。','最终调用 fn(a,b)。'],
    'function curry2(fn) {\n  return a => b => fn(a,b);\n}',
    '每次调用第一层函数都会建立独立闭包保存 a，第二层再传入 b。');

  choice('currying-partials-02','currying-partials','柯里化与参数预置',
    '对原函数 f(a,b) 而言，哪项最准确地描述 curry2(f)(a)(b)？',
    '',
    ['把两个参数改为分步提供，最终仍调用 f(a,b)','自动并发调用 f 两次','把 f 转成字符串','永远忽略第二个参数'],0,
    ['注意调用形式从一次传两个参数变为两次各传一个。','中间函数可以保存第一个参数。','最终应用两个参数。'],
    '柯里化把多参数函数转换为分步接收参数的函数，便于预置部分参数并复用。');

  choice('reference-type-01','reference-type','取出方法后丢失接收者',
    '判断 detached() 的结果。严格模式下运行。',
    '"use strict";\nconst obj={value:5,read(){return this.value}};\nconst detached=obj.read;\ndetached();',
    ['5','undefined','TypeError','ReferenceError'],2,
    ['成员调用 obj.read() 与普通调用 detached() 的 this 不同。','detached 没有接收者。','this 是 undefined，读取 this.value 抛错。'],
    '方法取出后再普通调用，不保留原对象作为 this；严格模式下 this 为 undefined。');

  choice('bigint-01','bigint','BigInt 与 Number 混合运算',
    '判断运算结果。',
    '1n + 2;',
    ['3n','3','TypeError','NaN'],2,
    ['算术运算允许直接混合 BigInt 与 Number 吗？','需要显式转换其中一个操作数。','直接相加抛出 TypeError。'],
    'BigInt 与 Number 不能直接混合做加法；必须显式转换并考虑精度范围。');

  code('bigint-02','bigint','安全累加大整数输入',
    '实现 sumBigIntegers(values)：values 是十进制整数字符串数组。用 BigInt 精确求和，返回结果的十进制字符串；空数组返回 "0"。',
    'function sumBigIntegers(values) {\n  // 在这里实现\n}',
    [['超安全整数范围','assert.equal(sumBigIntegers(["9007199254740993","7"]),"9007199254741000")'],['负数与空数组','assert.equal(sumBigIntegers(["-5","2"]),"-3");assert.equal(sumBigIntegers([]),"0")']],
    ['不要先用 Number 转换，会丢精度。','逐个 BigInt(text) 再相加。','最后调用 toString()。'],
    'function sumBigIntegers(values) {\n  let total=0n;\n  for(const text of values) total+=BigInt(text);\n  return total.toString();\n}',
    'BigInt 在整数范围内精确计算。字符串直接转换为 BigInt，避免经过可能丢精度的 Number。');

  code('unicode-01','unicode','统一组合字符的比较形式',
    '实现 normalizedEqual(a,b)：把两个字符串转换为 NFC 规范化形式后比较，返回布尔值；大小写仍须严格区分。',
    'function normalizedEqual(a,b) {\n  // 在这里实现\n}',
    [['预组合与分解形式','assert.equal(normalizedEqual("é","e\u0301"),true)'],['大小写仍区分','assert.equal(normalizedEqual("A","a"),false)'],['其他字符','assert.equal(normalizedEqual("你好","你好"),true)']],
    ['看起来相同的字符可能采用不同码点序列。','String.prototype.normalize("NFC") 统一形式。','规范化后用 === 比较。'],
    'function normalizedEqual(a,b) {\n  return a.normalize("NFC")===b.normalize("NFC");\n}',
    'Unicode 允许同一可见字符有不同的码点序列。NFC 规范化后可做精确字符串比较，但不会折叠大小写。');

  choice('unicode-02','unicode','表情字符的字符串长度',
    '判断两个值。',
    'console.log("😀".length, Array.from("😀").length);',
    ['1、1','2、1','1、2','2、2'],1,
    ['字符串 length 统计 UTF-16 代码单元。','这个表情字符需要一对代理项。','按字符串迭代器展开得到一个码点。'],
    '"😀" 占两个 UTF-16 代码单元，所以 length 是 2；Array.from 按码点迭代，得到 1 项。');
}
