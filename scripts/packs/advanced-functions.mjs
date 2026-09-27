export function addAdvancedFunctionExercises({ code, choice }) {
  code('recursion-01','recursion','统计树中所有可见节点',
    '实现 countVisible(nodes)：每个节点有 hidden 布尔值和可选 children 数组。隐藏节点及其所有后代不计入数量；可见节点计 1。不能修改输入。',
    'function countVisible(nodes) {\n  // 在这里实现\n}',
    [['嵌套结构','const tree=[{hidden:false,children:[{hidden:false},{hidden:true,children:[{}]}]},{hidden:false}];assert.equal(countVisible(tree),3)'],['隐藏分支整体跳过','assert.equal(countVisible([{hidden:true,children:[{},{}]}]),0)'],['空树和缺少 children','assert.equal(countVisible([]),0);assert.equal(countVisible([{}]),1)']],
    ['每个节点可决定是否继续进入 children。','隐藏时直接跳过整个分支。','对可见节点累加 1 + countVisible(children ?? [])。'],
    'function countVisible(nodes) {\n  let total=0;\n  for(const node of nodes) {\n    if(node.hidden) continue;\n    total += 1 + countVisible(node.children ?? []);\n  }\n  return total;\n}',
    '递归的基线是空数组返回 0。隐藏节点直接跳过，不再遍历其后代。');

  code('recursion-02','recursion','查找树中的第一条路径',
    '实现 findPath(nodes, targetId)：树节点有 id 与可选 children。按深度优先顺序查找，返回从根到目标的 id 数组；找不到返回 null。',
    'function findPath(nodes, targetId) {\n  // 在这里实现\n}',
    [['嵌套路径','const t=[{id:"a",children:[{id:"b",children:[{id:"c"}]}]}];assert.deepEqual(findPath(t,"c"),["a","b","c"])'],['根节点与不存在','const t=[{id:"a"}];assert.deepEqual(findPath(t,"a"),["a"]);assert.equal(findPath(t,"x"),null)'],['按深度优先选第一个','const t=[{id:"a",children:[{id:"x"}]},{id:"b",children:[{id:"x"}]}];assert.deepEqual(findPath(t,"x"),["a","x"])']],
    ['递归函数返回找到的子路径或 null。','命中当前节点时返回只含当前 id 的数组。','找到子路径时把当前 id 放到开头。'],
    'function findPath(nodes, targetId) {\n  for(const node of nodes) {\n    if(node.id===targetId) return [node.id];\n    const child=findPath(node.children ?? [],targetId);\n    if(child) return [node.id,...child];\n  }\n  return null;\n}',
    '递归函数返回局部路径。父节点收到子路径后在前面加上自己的 id。按数组顺序遍历自然得到第一个深度优先结果。','稍有难度');

  code('rest-parameters-spread-01','rest-parameters-spread','汇总任意数量的成绩段',
    '实现 averageScores(...groups)：每个参数是数字数组。把所有数组中的有限数字合并计算平均值；没有有效数字时返回 null。不能修改输入。',
    'function averageScores(...groups) {\n  // 在这里实现\n}',
    [['多组数据','assert.equal(averageScores([1,2],[3]),2)'],['过滤非有限值','assert.equal(averageScores([NaN,4],[Infinity,6]),5)'],['没有有效分数','assert.equal(averageScores(),null);assert.equal(averageScores([NaN]),null)']],
    ['Rest 参数让 groups 成为所有传入数组的集合。','先展开或遍历每一组。','有效项由 Number.isFinite 判定，最后用总和除以个数。'],
    'function averageScores(...groups) {\n  const values=groups.flat().filter(Number.isFinite);\n  return values.length ? values.reduce((sum,n)=>sum+n,0)/values.length : null;\n}',
    'Rest 收集不定数量的数组，flat 展开一层，过滤掉 NaN 和 Infinity 后再求平均。');

  choice('rest-parameters-spread-02','rest-parameters-spread','Rest 与 Spread 的位置',
    '哪个调用能让 sum(...numbers) 接收数组里的每个数字为独立参数？',
    'function sum(...numbers) { return numbers.reduce((a,b)=>a+b,0); }\nconst values=[1,2,3];',
    ['sum(values)','sum(...values)','sum([values])','sum(...[values])'],1,
    ['定义中的 ... 和调用中的 ... 作用不同。','调用处要展开 values 数组。','sum(...values) 传入 1、2、3 三个参数。'],
    '定义中的 Rest 把多个参数收集成数组；调用中的 Spread 把数组展开成多个参数。');

  choice('var-01','var','var 在块中的作用域',
    '判断结果。',
    'function run() {\n  if (true) { var value = 3; }\n  return value;\n}\nconsole.log(run());',
    ['3','undefined','ReferenceError','SyntaxError'],0,
    ['var 是否有块级作用域？','if 块内的 var 属于整个函数作用域。','离开 if 块后仍可读取。'],
    'var 具有函数作用域而不是块级作用域，value 在 run 整个函数内可访问。');

  choice('var-02','var','声明提升与初始化',
    '判断两次日志。',
    'function run() {\n  console.log(value);\n  var value = 9;\n  console.log(value);\n}\nrun();',
    ['undefined、9','9、9','ReferenceError、9','undefined、undefined'],0,
    ['var 声明会在函数入口建立绑定。','赋值仍在原语句位置执行。','第一次读取到 undefined，第二次读取到 9。'],
    'var 声明被提升，但赋值没有提前执行。函数开始时 value 是 undefined，赋值后变为 9。');

  choice('global-object-01','global-object','不同运行环境里的全局对象',
    '如果一段普通 JavaScript 代码需要在浏览器和 Node.js 中访问全局对象，哪个标识符最适合？',
    'const root = /* 这里填什么 */;',
    ['window','global','globalThis','document'],2,
    ['window 与 document 属于浏览器环境。','global 是 Node.js 的传统名称。','globalThis 提供跨环境的统一入口。'],
    'globalThis 在常见 JavaScript 环境中提供统一的全局对象引用。window 和 document 不存在于普通 Node.js 环境。');

  choice('global-object-02','global-object','顶层 let 与 window',
    '假设以下代码作为浏览器中的普通脚本运行，结果是什么？',
    'let course = "JS";\nconsole.log(window.course);',
    ['"JS"','undefined','ReferenceError','取决于是否启用严格模式'],1,
    ['顶层 let 声明会成为全局对象的属性吗？','全局词法绑定与 window 属性不同。','window.course 为 undefined。'],
    '普通脚本顶层 let 创建全局词法绑定，但不会自动创建 window.course 属性。');

  code('function-object-01','function-object','为函数包装器记录调用次数',
    '实现 counted(fn)：返回包装函数，调用时保持 this 和参数，返回 fn 的结果，并在包装函数的 calls 属性上记录已调用次数；初始为 0。',
    'function counted(fn) {\n  // 在这里实现\n}',
    [['计数和返回值','const f=counted(x=>x*2);assert.equal(f.calls,0);assert.equal(f(3),6);assert.equal(f.calls,1);f(4);assert.equal(f.calls,2)'],['保留 this','const obj={n:4,run:counted(function(x){return this.n+x})};assert.equal(obj.run(2),6)'],['每个包装器独立','const a=counted(()=>0),b=counted(()=>0);a();assert.equal(a.calls,1);assert.equal(b.calls,0)']],
    ['函数也可以拥有自己的属性。','包装器需要普通 function 才有动态 this。','每次调用先增加 wrapper.calls，再用 fn.apply。'],
    'function counted(fn) {\n  function wrapper(...args) {\n    wrapper.calls++;\n    return fn.apply(this,args);\n  }\n  wrapper.calls=0;\n  return wrapper;\n}',
    '函数是对象，可以在包装函数上保存 calls 属性。普通函数包装器保留调用者的 this。');

  choice('function-object-02','function-object','函数的 length 属性',
    '判断两个 length 的值。',
    'function first(a,b=1,c) {}\nfunction second(...args) {}\nconsole.log(first.length, second.length);',
    ['3、1','1、0','2、0','3、0'],1,
    ['length 只统计第一个默认参数之前的形参。','Rest 参数不计入 length。','first 只统计 a；second 为 0。'],
    'first.length 为 1，因为默认参数 b 及其后面的形参不计入；Rest 参数也不计入，所以 second.length 为 0。');

  choice('new-function-01','new-function','动态创建函数的作用域',
    '判断 created() 的执行结果。',
    'function outer() {\n  const secret = 7;\n  const created = new Function("return secret");\n  return created();\n}\nouter();',
    ['7','undefined','ReferenceError','SyntaxError'],2,
    ['new Function 创建的函数会捕获 outer 的局部变量吗？','它从全局环境解析变量。','secret 在全局环境中不存在。'],
    'new Function 创建的函数不捕获创建位置的局部词法环境；这里读取不到 secret，抛出 ReferenceError。');

  choice('new-function-02','new-function','动态函数的参数',
    '假设未定义全局变量 rate，哪一种写法能让动态函数计算 100 × rate？',
    'const rate = 0.8;',
    ['new Function("return 100 * rate")()','new Function("rate", "return 100 * rate")(rate)','new Function("return 100 * this.rate")()','new Function("return 100 * rate").bind(null)()'],1,
    ['动态函数无法直接捕获局部 rate。','可以显式传入参数。','把 rate 作为动态函数的形参，再调用时传入值。'],
    'new Function 可以显式声明参数并传值；它不会自动闭包捕获周围的局部变量。');

  code('settimeout-setinterval-01','settimeout-setinterval','可控计时器实现防抖',
    '实现 debounce(fn, delay, timers)：timers 有 setTimeout(callback, delay) 和 clearTimeout(id)。连续调用时取消上一次等待，只在最后一次等待结束后调用 fn，并保留最后一次调用的 this 与参数。',
    'function debounce(fn, delay, timers) {\n  // 在这里实现\n}',
    [['只执行最后一次','let next=0;const pending=new Map();const t={setTimeout(cb){pending.set(++next,cb);return next},clearTimeout(id){pending.delete(id)}};const out=[];const f=debounce(x=>out.push(x),100,t);f(1);f(2);assert.equal(pending.size,1);[...pending.values()][0]();assert.deepEqual(out,[2])'],['传递延迟和 this','let call;const t={setTimeout(cb,ms){call={cb,ms};return 1},clearTimeout(){}};const obj={base:4,run:debounce(function(x){this.base+=x},25,t)};obj.run(3);assert.equal(call.ms,25);call.cb();assert.equal(obj.base,7)']],
    ['包装函数需要保存上一次定时器 id。','每次调用先清除旧定时器，再创建新定时器。','在包装函数中保存 this 和参数到局部变量，供回调使用。'],
    'function debounce(fn, delay, timers) {\n  let id;\n  return function(...args) {\n    if(id !== undefined) timers.clearTimeout(id);\n    const context=this;\n    id=timers.setTimeout(()=>fn.apply(context,args),delay);\n  };\n}',
    '每次调用取消旧任务并安排新任务。回调闭包捕获最后一次调用的参数和 this，测试通过注入的计时器完成，不依赖真实等待。','稍有难度');

  choice('settimeout-setinterval-02','settimeout-setinterval','清除定时器之前保存 ID',
    '下面哪种做法能取消尚未执行的 setTimeout 回调？',
    'const id = setTimeout(doWork, 1000);',
    ['clearTimeout(doWork)','clearTimeout(id)','clearInterval(doWork)','id = null'],1,
    ['取消函数需要哪一个标识？','setTimeout 的返回值可用于清理。','调用 clearTimeout(id)。'],
    'setTimeout 返回计时器 ID；把 ID 传给 clearTimeout 才能取消尚未执行的回调。');

  code('call-apply-decorators-01','call-apply-decorators','记录耗时但保留调用行为',
    '实现 timed(fn, now, report)：返回包装函数。调用前后各执行一次 now()，用 report(耗时) 记录差值，并返回 fn 的结果；保持 this 和参数。若 fn 抛错，也要报告耗时后再次抛出原错误。',
    'function timed(fn, now, report) {\n  // 在这里实现\n}',
    [['结果与上下文','let tick=0,spent;const obj={n:4,run:timed(function(x){return this.n+x},()=>tick++*5,x=>spent=x)};assert.equal(obj.run(3),7);assert.equal(spent,5)'],['错误也报告','let tick=0,spent;const error=Error("x");const f=timed(()=>{throw error},()=>tick++*2,x=>spent=x);try{f();throw Error("未抛出")}catch(e){assert.ok(e===error)}assert.equal(spent,2)'],['参数传递','const f=timed((a,b)=>a+b,()=>0,()=>{});assert.equal(f(2,3),5)']],
    ['try/finally 能在成功和失败后都执行报告。','包装函数用普通 function 取得动态 this。','在 finally 中调用 report(now()-start)。'],
    'function timed(fn, now, report) {\n  return function(...args) {\n    const start=now();\n    try { return fn.apply(this,args); }\n    finally { report(now()-start); }\n  };\n}',
    'try/finally 保证成功或抛错都报告耗时，且不会吞掉原函数异常。apply 保持上下文和参数。','稍有难度');

  choice('call-apply-decorators-02','call-apply-decorators','借用数组方法处理类数组',
    '在现代 JavaScript 中，如何把类数组对象转换为真正的数组？',
    'const list={0:"a",1:"b",length:2};',
    ['Array.prototype.slice.call(list)','list.slice()','[...list]','Array.prototype.slice(list)'],0,
    ['list 没有自己的 slice 方法。','类数组没有 Symbol.iterator，Spread 不能直接使用。','用 call 指定 slice 的 this。'],
    'Array.prototype.slice.call(list) 借用数组方法，按索引和 length 生成新数组。也可以使用 Array.from(list)，但不在选项中。');

  choice('arrow-functions-01','arrow-functions','箭头函数的 this 从哪里来',
    '判断 result 的值。',
    'const obj = {\n  value: 4,\n  create() { return () => this.value; }\n};\nconst fn = obj.create();\nconst result = fn.call({ value: 9 });',
    ['4','9','undefined','TypeError'],0,
    ['箭头函数会通过 call 改变 this 吗？','箭头函数捕获 create 执行时的 this。','create 由 obj 调用，this 是 obj。'],
    '箭头函数没有自己的 this，会捕获 create 执行时的 obj。后续使用 call 不能改变它的 this，因此结果是 4。');

  code('arrow-functions-02','arrow-functions','返回稳定读取当前状态的回调',
    '实现 reader(store)：返回无参数函数，调用时读取 store.current.value。即使 store.current 被替换，回调也要读取新对象；即使以其他对象的方法方式调用，结果也应正确。',
    'function reader(store) {\n  // 在这里实现\n}',
    [['读取最新对象','const s={current:{value:1}};const f=reader(s);s.current={value:8};assert.equal(f(),8)'],['不依赖调用 this','const s={current:{value:3}};const f=reader(s);assert.equal(({f}).f(),3)'],['多实例隔离','const a=reader({current:{value:1}}),b=reader({current:{value:2}});assert.equal(a(),1);assert.equal(b(),2)']],
    ['不要在创建回调时先读取 value。','回调闭包捕获 store，每次调用重新读取路径。','返回 () => store.current.value。'],
    'function reader(store) {\n  return () => store.current.value;\n}',
    '闭包捕获 store 对象，调用时再读取 current；箭头函数也不会因为被放到别的对象上调用而改变读取目标。');
}
