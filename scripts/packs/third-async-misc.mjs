export function addThirdAsyncMiscExercises({ choice, code }) {
  const scenarios = [
    ['callbacks','同步回调打破调用方时序假设','read 立即同步调用 callback。下面回调读取到的 ready 是什么？','let ready=false;function read(callback){callback(null,1)}read(()=>log(ready));ready=true;',['false；回调在 ready 赋 true 前同步执行','true；所有回调都自动异步执行','undefined；回调无法读取外层变量','抛 ReferenceError'],['回调是一种调用约定，不保证异步。','read 直接调用传入函数。','ready 的赋值写在 read 返回之后。'],'若 API 同步调用回调，回调会在 read 返回前运行，因此读到 false。'],
    ['promise-basics','执行函数里的同步异常','Promise 构造器的执行函数同步抛出 Error，会怎样影响这个 Promise？','const p=new Promise(()=>{throw Error("bad")});',['p 变为 rejected，异常作为拒绝原因','构造器一定同步向外抛出','p 永远 pending','p 自动 fulfilled 为 undefined'],['Promise 构造器会处理执行函数里的异常。','异常转为拒绝。','调用方需要处理 rejected 状态。'],'执行函数里的同步异常会让 Promise 拒绝，而不是使它保持 pending。'],
    ['promise-chaining','返回被拒绝的 Promise 会让链拒绝','第一个 then 返回 save(data)，而 save 返回 rejected Promise。后续成功分支 showDone 会运行吗？','load().then(data=>save(data)).then(()=>showDone());',['不会；链采用返回的 Promise 状态，进入拒绝路径','会；第一个 then 完成后一定运行下一个成功分支','会；只有同步 throw 才影响链','链会一直 pending'],['then 处理器返回 Promise。','链会等待并采用该 Promise 的最终状态。','拒绝会跳过后续成功处理器。'],'返回的 save Promise 若拒绝，链进入 rejected 状态，后续成功分支不会运行。'],
    ['promise-error-handling','finally 不会把失败变成功','Promise.reject(error).finally(()=>cleanup()) 后，如果 cleanup 正常完成，链的最终状态是什么？','',['仍然 rejected，原因是原 error','fulfilled 为 cleanup 的返回值','永远 pending','fulfilled 为 undefined'],['finally 主要做清理。','正常完成不会替换之前的结果。','若 finally 自身抛错则另当别论。'],'finally 正常执行后保留原来的拒绝状态和原因；它不会自动吞掉错误。'],
    ['promise-api','Promise.any 与 Promise.race','三个请求中只要任意一个成功就使用结果，失败的请求可忽略；全部失败才报错。应使用什么？','',['Promise.any','Promise.race','Promise.all','Promise.allSettled 后直接取第一个元素'],['race 可能先得到失败。','any 忽略单个拒绝，等待首个成功。','全部失败时 any 才拒绝。'],'Promise.any 返回第一个 fulfilled 结果；如果所有输入都拒绝，则以 AggregateError 拒绝。'],
    ['microtask-queue','同一 Promise 的多个 then','对一个已完成 Promise 先后注册 A、B 两个 then，再执行同步日志 C。顺序通常是什么？','const p=Promise.resolve();\np.then(()=>log("A"));\np.then(()=>log("B"));\nlog("C");',['C、A、B','A、B、C','B、A、C','C、B、A'],['then 回调进入微任务队列。','同步日志先执行。','A、B 按注册顺序入队。'],'同步 C 先输出，两个微任务按注册顺序输出 A、B。'],
    ['modules-intro','模块执行次数与多处导入','同一个模块被两个模块静态导入。其顶层初始化代码通常执行几次？','',['在同一模块图中通常只执行一次，再共享模块实例','每导入一次就重新执行一次','完全不执行','只在页面刷新第二次执行'],['模块有缓存/实例化语义。','多处导入共享同一模块记录。','模块状态因此可被多个导入者观察。'],'同一模块在同一模块图中通常实例化和执行一次，多处导入共享其导出绑定。'],
    ['import-export','重命名导入避免冲突','两个模块都导出名为 format 的函数。当前文件想同时使用它们，应怎样导入？','',['使用 import {format as formatDate} 与 import {format as formatMoney} 分别重命名','两个都直接 import {format} 到同一作用域','只要改变导入顺序即可','把其中一个写成 const format=... 自动覆盖'],['同一作用域不能有两个同名导入绑定。','命名导入支持 as。','调用处用语义化别名。'],'使用 as 给两个命名导出分别命名，可以在同一模块内同时使用并避免绑定冲突。'],
    ['modules-dynamic-imports','条件加载但不重复执行','用户多次打开同一功能，每次调用 import("./editor.js")。关于模块初始化，哪种说法更准确？','',['通常复用已加载的模块实例；每次 import() 仍返回 Promise','每次都重新执行模块顶层代码','第二次 import() 必定抛错','import() 只能在顶层执行一次'],['动态导入结果是 Promise。','模块实例通常缓存。','调用次数与顶层初始化次数不同。'],'同一模块通常只初始化一次，后续 import() 复用模块实例，但调用仍是异步 Promise 接口。'],
    ['proxy','代理转发时为何使用 Reflect','在 Proxy 的 get 陷阱里想保持普通属性访问语义，尤其涉及 getter 的 receiver，应优先用什么转发？','get(target,key,receiver){ /* ? */ }',['return Reflect.get(target,key,receiver)','return target[key] 且永远等价','return key','return Object.keys(target)'],['getter 可能依赖调用时的 this。','receiver 表示最初访问属性的对象。','Reflect.get 能接收 receiver。'],'Reflect.get(target,key,receiver) 按反射 API 转发访问，保留接收者语义；直接 target[key] 可能改变 getter 的 this。'],
    ['eval','直接 eval 与显式参数','团队为了计算用户填写的折扣，把字符串拼进 eval。哪种替代更稳妥？','const expression = "price * (1-discount)";',['把 price、discount 当数值参数传给普通函数并验证范围','把字符串先 encodeURIComponent 再 eval','把 eval 包进 setTimeout','把变量名改短后继续 eval'],['表达式结构是固定的。','变化的只是数据值。','普通函数和显式参数避免把数据变代码。'],'固定计算逻辑应写成普通函数并校验输入；动态 eval 增加错误和安全风险。'],
    ['reference-type','括号是否丢失方法接收者','下面哪个表达式调用 show 时仍让 this 指向 user？','const user={name:"Lin",show(){return this.name}};',['(user.show)()','(0,user.show)()','const fn=user.show; fn()','user.show.call(undefined)'],['单纯括号不会丢掉成员引用。','逗号运算符会先求出函数值。','提取到变量也会丢失原接收者。'],'(user.show)() 仍保留成员引用与 user 接收者；逗号表达式或变量提取会改变调用形式。'],
    ['bigint','BigInt 除法的整数结果','7n / 2n 的结果是什么？','',['3n；BigInt 除法向零截断小数部分','3.5n','3.5','抛出 TypeError'],['两个操作数都是 BigInt，可以相除。','BigInt 不表示小数。','除法结果向零截断。'],'7n/2n 的结果为 3n；BigInt 除法没有小数部分。']
  ];
  for (const [lessonId,title,prompt,example,options,hints,explanation] of scenarios) {
    choice(`${lessonId}-third-01`,lessonId,title,prompt,example,options,0,hints,explanation);
  }

  code('promisify-third-01','promisify','保留回调的多个成功结果',
    '实现 promisifyMany(fn)：fn 接收任意参数，最后一个参数为 callback(error,...values)。返回包装函数，保留动态 this 与参数；error 非 null/undefined 时拒绝，否则用 values 数组完成。同步抛出的错误也要转为拒绝。',
    'function promisifyMany(fn) {\n  // 在这里实现\n}',
    [['多个成功值','const f=promisifyMany((a,b,cb)=>cb(null,a+b,a*b));return f(2,3).then(v=>assert.deepEqual(v,[5,6]))'],['零个值与 this','const obj={base:4,run:promisifyMany(function(x,cb){cb(null,this.base+x)})};return Promise.all([obj.run(3),promisifyMany(cb=>cb(null))()]).then(([a,b])=>{assert.deepEqual(a,[7]);assert.deepEqual(b,[])})'],['拒绝与同步抛错','const error=Error("bad");const f=promisifyMany(cb=>cb(error));const g=promisifyMany(()=>{throw error});return Promise.all([f().then(()=>{throw Error("应拒绝")},e=>assert.equal(e,error)),g().then(()=>{throw Error("应拒绝")},e=>assert.equal(e,error))])']],
    ['包装函数使用普通 function 捕获本次 this。','new Promise 的 executor 内调用 fn.apply，并追加回调。','回调用 ...values 收集所有成功值；executor 内同步抛错会使 Promise 拒绝。'],
    'function promisifyMany(fn){return function(...args){return new Promise((resolve,reject)=>{fn.apply(this,[...args,(error,...values)=>error==null?resolve(values):reject(error)])})}}',
    '多结果回调不能只取第一个成功值；Rest 收集所有成功参数。Promise executor 会把同步异常转换为拒绝。','稍有难度');

  code('async-await-third-01','async-await','顺序执行异步转换并保留顺序',
    '实现 async mapSequential(items, transform)：按 items 顺序一次只启动一个 transform(item,index)，等待其完成后再处理下一个；返回对应结果数组。任何一步拒绝应停止后续处理并向外拒绝。',
    'async function mapSequential(items, transform) {\n  // 在这里实现\n}',
    [['顺序和结果','const seen=[];return mapSequential([3,1,2],async(x,i)=>{seen.push(i);return x*2}).then(r=>{assert.deepEqual(r,[6,2,4]);assert.deepEqual(seen,[0,1,2])})'], ['不能提前启动后续项','let release;const gate=new Promise(r=>release=r);const seen=[];const task=mapSequential([1,2],async x=>{seen.push(x);if(x===1) await gate;return x});assert.deepEqual(seen,[1]);release();return task.then(()=>assert.deepEqual(seen,[1,2]))'], ['失败后停止','const seen=[];return mapSequential([1,2,3],async x=>{seen.push(x);if(x===2) throw Error("bad");return x}).then(()=>{throw Error("应拒绝")},e=>{assert.equal(e.message,"bad");assert.deepEqual(seen,[1,2])})']],
    ['不能用 Promise.all(items.map(...))，那会并发启动。','用 for 循环逐个 await。','每次 await 后把结果 push 进数组。'],
    'async function mapSequential(items, transform) {\n  const results=[];\n  for(let index=0;index<items.length;index++) results.push(await transform(items[index],index));\n  return results;\n}',
    '循环中逐项 await 才保证一次只运行一个转换。抛错或拒绝会直接终止循环并使外层 async 函数拒绝。');

  code('generators-third-01','generators','按步长惰性生成整数',
    '实现生成器 rangeStep(start,end,step=1)：生成 start、start+step 等小于 end 的整数；step 必须是正整数，否则抛 RangeError。不要预先创建数组。',
    'function* rangeStep(start,end,step=1) {\n  // 在这里实现\n}',
    [['步长与终点','assert.deepEqual([...rangeStep(1,8,3)],[1,4,7])'], ['空范围与默认步长','assert.deepEqual([...rangeStep(3,3)],[]);assert.deepEqual([...rangeStep(1,4)],[1,2,3])'], ['非法步长','assert.throws(()=>[...rangeStep(0,3,0)]);assert.throws(()=>[...rangeStep(0,3,1.5)])']],
    ['生成器用 yield 逐个产出值。','用 for(let value=start;value<end;value+=step)。','生成器函数体在迭代时才运行，验证也会在迭代时发生。'],
    'function* rangeStep(start,end,step=1) {\n  if(!Number.isInteger(step)||step<=0) throw new RangeError("step 无效");\n  for(let value=start;value<end;value+=step) yield value;\n}',
    '生成器把迭代状态保留在函数中，调用者按需获取值；正步长验证避免死循环。');

  code('async-iterators-generators-third-01','async-iterators-generators','只消费异步序列前 N 项',
    '实现 async collectFirst(source, count)：source 是异步可迭代对象，收集前 count 项并返回数组；count 为非负整数，否则抛 RangeError。count=0 时不能开始迭代。',
    'async function collectFirst(source, count) {\n  // 在这里实现\n}',
    [['前两项','async function* values(){yield 1;yield 2;yield 3}return collectFirst(values(),2).then(r=>assert.deepEqual(r,[1,2]))'], ['零项不能启动','const source={[Symbol.asyncIterator](){throw Error("不应迭代")}};return collectFirst(source,0).then(r=>assert.deepEqual(r,[]))'], ['非法 count','return collectFirst({[Symbol.asyncIterator]:async function*(){}},-1).then(()=>{throw Error("应拒绝")},e=>assert.ok(e instanceof RangeError))']],
    ['先验证 count，并在 0 时直接返回 []。','for await...of 可消费异步迭代。','push 后达到 count 就 break。'],
    'async function collectFirst(source, count) {\n  if(!Number.isInteger(count)||count<0) throw new RangeError("count 无效");\n  if(count===0) return [];\n  const result=[];\n  for await (const value of source){result.push(value);if(result.length===count) break}\n  return result;\n}',
    'for await...of 逐步等待异步数据。达到数量后 break 可停止消费；零项时应避免触发迭代器。');

  code('currying-partials-third-01','currying-partials','两段传参并保留第一段的 this',
    '实现 curry2(fn)：返回 first(a)，first 返回 second(b)。调用 fn 时参数顺序为 a、b，this 应保持调用 first 时的接收者。每次 first 调用互不干扰。',
    'function curry2(fn) {\n  // 在这里实现\n}',
    [['基本柯里化','const add=curry2((a,b)=>a+b);assert.equal(add(2)(3),5)'], ['保留接收者','const obj={base:10,run:curry2(function(a,b){return this.base+a+b})};assert.equal(obj.run(1)(2),13)'], ['独立局部参数','const f=curry2((a,b)=>a*b);const a=f(2),b=f(3);assert.equal(a(4),8);assert.equal(b(4),12)']],
    ['外层返回普通 function，才能得到动态 this。','在 first 内保存 this 和 a。','内层调用 fn.call(receiver,a,b)。'],
    'function curry2(fn) {\n  return function first(a){\n    const receiver=this;\n    return function second(b){return fn.call(receiver,a,b)};\n  };\n}',
    '柯里化把一次双参数调用分成两次。闭包保存第一段参数和接收者，避免第二段的调用方式改变 this。');

  code('unicode-third-01','unicode','按 Unicode 码点截取前 N 个字符',
    '实现 takeCodePoints(text,count)：返回 text 的前 count 个 Unicode 码点。count 是非负整数，否则抛 RangeError。表情符号等代理对不能被截断成半个。',
    'function takeCodePoints(text,count) {\n  // 在这里实现\n}',
    [['代理对完整保留','assert.equal(takeCodePoints("A🙂B",2),"A🙂")'], ['零与越界','assert.equal(takeCodePoints("你好",0),"");assert.equal(takeCodePoints("ab",9),"ab")'], ['非法数量','assert.throws(()=>takeCodePoints("x",-1));assert.throws(()=>takeCodePoints("x",1.5))']],
    ['String.slice 按 UTF-16 代码单元切，可能截断代理对。','Array.from(text) 按码点得到元素。','先验证 count，再 slice(0,count).join("")。'],
    'function takeCodePoints(text,count) {\n  if(!Number.isInteger(count)||count<0) throw new RangeError("count 无效");\n  return Array.from(text).slice(0,count).join("");\n}',
    '字符串迭代器按 Unicode 码点遍历，避免把非 BMP 字符的代理对切开。码点仍不完全等于用户感知字形。');
}
