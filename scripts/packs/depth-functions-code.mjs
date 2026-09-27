export function addFunctionDepthCodeExercises({ code }) {
  code('recursion-depth-03','recursion','求任意分支树的最大深度','实现 maxDepth(node)：根节点深度为 1，children 为空或不存在时也是 1；否则返回所有子树中的最大深度加 1。节点格式为 {children?}，输入保证为无环树。',
    'function maxDepth(node){\n  // 在这里实现\n}',
    [['单节点与宽树','assert.equal(maxDepth({}),1);assert.equal(maxDepth({children:[{},{}]}),2)'],['不等深分支','assert.equal(maxDepth({children:[{children:[{}]},{children:[{children:[{}]}]}]}),4)'],['空子节点数组','assert.equal(maxDepth({children:[]}),1)']],
    ['没有非空 children 时直接返回 1。','递归计算每个孩子的深度。','当前深度为 1 + 孩子深度最大值。'],
    'function maxDepth(node){if(!node.children?.length)return 1;return 1+Math.max(...node.children.map(maxDepth));}',
    '递归每次处理一棵更小的子树；基础情形是叶子，分支节点取所有子树中的最大深度。');

  code('rest-parameters-spread-depth-03','rest-parameters-spread','按最短输入并行合并数组','实现 zipShortest(...lists)：接收任意个数组，按相同索引组成二维数组，只处理到最短数组长度；没有数组参数时返回 []，不修改任何输入。',
    'function zipShortest(...lists){\n  // 在这里实现\n}',
    [['并行配对','assert.deepEqual(zipShortest([1,2],["a","b"]),[[1,"a"],[2,"b"]])'],['按最短结束','assert.deepEqual(zipShortest([1,2,3],["a"],[true,false]),[[1,"a",true]])'],['边界与不修改输入','assert.deepEqual(zipShortest(),[]);const a=[1,2];zipShortest(a,[3]);assert.deepEqual(a,[1,2]);assert.deepEqual(zipShortest([],["a"]),[])']],
    ['Rest 参数把所有数组收进 lists。','没有输入时先返回 []。','用 Math.min(...lists.map(list=>list.length)) 求最短长度，再按索引生成每行。'],
    'function zipShortest(...lists){if(lists.length===0)return [];const length=Math.min(...lists.map(list=>list.length));return Array.from({length},(_,i)=>lists.map(list=>list[i]));}',
    'Rest 收集任意数量的数组，Spread 把长度列表传给 Math.min；按索引读取而不修改输入。');

  code('closure-depth-02','closure','用闭包管理订阅与取消订阅','实现 makeNotifier()：返回 {subscribe,emit}。subscribe(fn) 登记回调并返回取消订阅函数；emit(value) 按订阅顺序调用当前回调。若回调在本次 emit 期间取消另一个订阅，本次通知仍按开始时的订阅快照继续；下次不再通知已取消者。每个实例互不干扰。',
    'function makeNotifier(){\n  // 在这里实现\n}',
    [['订阅与取消','const n=makeNotifier(),seen=[];const off=n.subscribe(x=>seen.push(x));n.emit(1);off();n.emit(2);assert.deepEqual(seen,[1])'],['发射快照','const n=makeNotifier(),seen=[];let offB;n.subscribe(()=>{seen.push("A");offB()});offB=n.subscribe(()=>seen.push("B"));n.emit();n.emit();assert.deepEqual(seen,["A","B","A"])'],['实例隔离','const a=makeNotifier(),b=makeNotifier();let count=0;a.subscribe(()=>count++);b.emit();assert.equal(count,0)']],
    ['在工厂函数局部保存订阅集合。','subscribe 返回可删除对应回调的闭包。','emit 先复制订阅列表，再逐个调用。'],
    'function makeNotifier(){const listeners=new Set();return {subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn)},emit(value){for(const fn of [...listeners])fn(value)}};}',
    '每次创建实例都有独立 listeners 闭包；快照保证本次通知不被中途取消操作改变。','稍有难度');

  code('new-function-depth-03','new-function','动态函数显式接收外部参数','实现 compileLinear(a,b)：创建并返回一个函数 f(x)，返回 a*x+b。核心计算函数必须用 new Function 创建，a、b 要通过参数显式传入，不能假定动态函数能读取 compileLinear 的局部绑定。',
    'function compileLinear(a,b){\n  // 在这里实现\n}',
    [['系数计算','assert.equal(compileLinear(2,3)(4),11);assert.equal(compileLinear(-1,5)(2),3)'],['实例隔离','const a=compileLinear(2,0),b=compileLinear(3,1);assert.equal(a(4),8);assert.equal(b(4),13)'],['零系数','assert.equal(compileLinear(0,7)(100),7)']],
    ['new Function 可以声明 x、a、b 三个形参。','动态函数体写 return a*x+b。','返回外层包装函数，在调用时把 x、a、b 传给动态函数。'],
    'function compileLinear(a,b){const calculate=new Function("x","a","b","return a*x+b");return x=>calculate(x,a,b);}',
    '动态函数不捕获创建位置的局部变量；将系数作为显式实参传入，外层包装函数负责保存系数。');

  code('settimeout-setinterval-depth-03','settimeout-setinterval','实现只在首次调用时执行的节流','实现 throttleLeading(fn,wait,timers)：首次调用立即执行 fn，返回其结果，并用 timers.setTimeout(callback,wait) 开始冷却；冷却期内调用不执行 fn，返回 undefined；定时回调触发后下一次调用可再次执行。保留首次调用时的 this 和参数。',
    'function throttleLeading(fn,wait,timers){\n  // 在这里实现\n}',
    [['冷却内只执行一次','const jobs=[];const timer={setTimeout(fn,ms){jobs.push([fn,ms])}};let count=0;const run=throttleLeading(x=>{count++;return x*2},100,timer);assert.equal(run(2),4);assert.equal(run(3),undefined);assert.equal(count,1);assert.equal(jobs[0][1],100)'],['冷却结束可继续','const jobs=[];const timer={setTimeout(fn){jobs.push(fn)}};let count=0;const run=throttleLeading(()=>++count,50,timer);assert.equal(run(),1);jobs.shift()();assert.equal(run(),2)'],['this 与参数','const jobs=[];const timer={setTimeout(fn){jobs.push(fn)}};const obj={base:5,run:throttleLeading(function(x){return this.base+x},20,timer)};assert.equal(obj.run(3),8)']],
    ['闭包保存是否正在冷却。','首次调用设置冷却并安排恢复回调。','用 fn.apply(this,args) 保留调用形式。'],
    'function throttleLeading(fn,wait,timers){let cooling=false;return function(...args){if(cooling)return undefined;cooling=true;timers.setTimeout(()=>{cooling=false},wait);return fn.apply(this,args)};}',
    '闭包隔离冷却状态；定时器回调仅解除冷却，函数在每段冷却期首个调用时立即执行。');

  code('call-apply-decorators-depth-03','call-apply-decorators','带校验的函数装饰器','实现 guard(fn,allowed)：返回包装函数。每次调用先以相同 this 和参数执行 allowed；若结果为假，不调用 fn，返回 undefined；若为真，执行 fn 并原样返回结果。fn 的异常不应被吞掉。',
    'function guard(fn,allowed){\n  // 在这里实现\n}',
    [['阻止不允许的调用','let calls=0;const run=guard(()=>{calls++;return 1},x=>x>0);assert.equal(run(-1),undefined);assert.equal(calls,0);assert.equal(run(1),1)'],['接收者与参数','const o={min:3,base:5,run:guard(function(x,y){return this.base+x+y},function(x,y){return this.min<=x+y})};assert.equal(o.run(1,2),8);assert.equal(o.run(1,1),undefined)'],['保留假值与异常','assert.equal(guard(()=>0,()=>true)(),0);const error=Error("x");let caught;try{guard(()=>{throw error},()=>true)()}catch(e){caught=e}assert.equal(caught,error)']],
    ['包装函数使用普通 function 取得动态 this。','校验函数用 apply(this,args) 调用。','通过时再用同样方式调用 fn，并直接返回结果。'],
    'function guard(fn,allowed){return function(...args){if(!allowed.apply(this,args))return undefined;return fn.apply(this,args)};}',
    '两个函数都在原调用的接收者和参数下执行；包装器只决定是否转发，不篡改返回值或异常。');

  code('bind-depth-03','bind','把对象方法固定后交给回调','实现 bindMethod(obj,name,...preset)：读取 obj[name]，若不是函数抛 TypeError；返回用 bind 固定 obj 为 this、并预置 preset 参数的新函数。创建后即使 obj[name] 被替换，返回函数仍调用原方法。',
    'function bindMethod(obj,name,...preset){\n  // 在这里实现\n}',
    [['接收者与预置参数','const o={base:2,add(a,b){return this.base+a+b}};const f=bindMethod(o,"add",3);assert.equal(f(4),9);assert.equal(({base:99,f}).f(4),9)'],['方法替换不影响已绑定函数','const o={value:1,read(){return this.value}};const f=bindMethod(o,"read");o.read=()=>99;o.value=7;assert.equal(f(),7)'],['非法方法','assert.throws(()=>bindMethod({}, "missing"));assert.throws(()=>bindMethod({x:1},"x"))']],
    ['先保存 obj[name] 到局部变量。','验证 typeof method 是 function。','return method.bind(obj,...preset)。'],
    'function bindMethod(obj,name,...preset){const method=obj[name];if(typeof method!=="function")throw new TypeError("不是函数");return method.bind(obj,...preset);}',
    'bind 返回新函数，固定原方法与接收者；预置实参与后续实参按顺序合并。');

  code('arrow-functions-depth-03','arrow-functions','可脱离实例传递的箭头处理器','实现 Meter 类：构造参数 start 默认为 0，实例有 value；实例字段 increment 是箭头函数，接受 delta 默认 1，累加到 value 并返回新值。将 increment 提取给其他对象调用时仍修改原实例。不同实例的 increment 应是不同函数对象。',
    'class Meter {\n  // 在这里实现\n}',
    [['累加与默认值','const m=new Meter(4);assert.equal(m.increment(),5);assert.equal(m.increment(3),8);assert.equal(m.value,8)'],['脱离调用仍保留实例','const m=new Meter(2);const fn=m.increment;assert.equal(fn.call({value:100},4),6);assert.equal(m.value,6)'],['实例隔离','const a=new Meter(),b=new Meter();assert.ok(a.increment!==b.increment);a.increment();assert.equal(a.value,1);assert.equal(b.value,0)']],
    ['在类中声明 increment = (delta=1) => {...}。','箭头函数捕获初始化时的实例 this。','构造器给 value 赋 start。'],
    'class Meter{increment=(delta=1)=>{this.value+=delta;return this.value};constructor(start=0){this.value=start}}',
    '箭头类字段为每个实例创建函数并捕获该实例，作为回调传递时仍修改原对象。');
}
