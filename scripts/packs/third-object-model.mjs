export function addThirdObjectModelExercises({ choice, code }) {
  const scenarios = [
    ['rest-parameters-spread','展开时是否复制嵌套对象','const clone=[...source] 后，clone[0].name="B"。source[0].name 会怎样？','const source=[{name:"A"}];\nconst clone=[...source];\nclone[0].name="B";',['也变成 "B"；外层数组新建，但内部对象仍共享','保持 "A"，因为展开是深拷贝','变成 undefined','抛出 TypeError'],['展开只复制当前容器。','数组里的对象仍是同一引用。','要隔离内部修改还需复制元素对象。'],'数组展开创建新数组，但其元素对象引用未被深拷贝，所以修改内部属性两边都能看到。'],
    ['var','var 在块中的作用域','下面循环结束后，typeof i 与 typeof j 分别是什么？','for(var i=0;i<1;i++){let j=1;}\ntypeof i; typeof j;',['"number" 与 "undefined"','都为 "undefined"','都为 "number"','"undefined" 与 "number"'],['var 没有块级作用域。','let j 只在循环体的块里可用。','typeof 不存在的变量为 undefined 字符串。'],'var i 在外层函数/脚本作用域仍可访问；let j 离开块后不可访问。'],
    ['global-object','globalThis 与顶层 let','在浏览器的经典脚本中执行顶层 let token=1。globalThis.token 是否必然为 1？','let token=1;\nglobalThis.token;',['不必然；顶层 let 绑定不等同于全局对象属性','必然是 1','必然抛出 SyntaxError','只有严格模式下才是 1'],['全局词法绑定与全局对象属性不同。','顶层 var 与 let 的表现不同。','不要用全局对象属性替代模块状态。'],'顶层 let 创建词法绑定，不保证成为 globalThis 的同名属性。'],
    ['function-object','函数 length 与默认/rest 参数','function f(a,b=1,...rest){} 的 f.length 是多少？','',['1','2','3','0'],['length 统计第一个默认参数之前的形参。','rest 不计入。','a 是唯一被计数的形参。'],'f.length 为 1，默认参数及其后参数不计入该值。'],
    ['new-function','动态函数看不到调用者局部变量','下面调用得到什么？','function make(){const secret=7;return new Function("return typeof secret");}\nmake()();',['"undefined"；new Function 不捕获 make 的局部词法环境','7','"number"','抛出 ReferenceError'],['new Function 的环境不是调用者的局部作用域。','typeof 未声明标识符返回字符串 undefined。','需要数据时可显式传参。'],'new Function 创建的函数不闭包捕获 make 内的 secret，因此 typeof secret 为 "undefined"。'],
    ['settimeout-setinterval','清理定时器与组件生命周期','组件每次挂载都调用 setInterval，卸载时不清理。多次挂载后最可能怎样？','',['多个定时器继续运行并重复更新；应保存句柄并在卸载时 clearInterval','浏览器自动只保留最后一个 interval','只有第一个 interval 会运行','定时器会把组件自动重新挂载'],['interval 会重复触发。','卸载组件不必然取消浏览器定时器。','生命周期结束时主动清理。'],'持续定时器若未清理，会造成重复工作和资源占用。'],
    ['bind','绑定参数与动态参数顺序','f.bind(obj,1) 得到 g，再调用 g(2,3)。原函数接收的参数顺序是什么？','',['1、2、3','2、3、1','只有 1','只有 2、3'],['bind 可预置前面的参数。','调用时的新参数接在后面。','绑定 this 与预置参数是两个作用。'],'bind 预置的 1 在前，调用时的 2、3 依次追加。'],
    ['arrow-functions','箭头函数没有 arguments 绑定','普通函数内返回箭头函数，箭头函数里读取 arguments。它通常读取哪一层的 arguments？','function outer(x){ return () => arguments[0]; }',['outer 调用时的 arguments','箭头函数自己的 arguments','全局 arguments','一定抛出 SyntaxError'],['箭头函数没有自己的 arguments。','它沿词法环境查找。','outer 是普通函数，拥有 arguments。'],'箭头函数读取外层普通函数 outer 的 arguments，而不是创建独立的参数对象。'],
    ['property-descriptors','不可写不等于不可配置','属性描述符为 writable:false、configurable:true。哪种操作仍可能合法？','',['通过 Object.defineProperty 重新定义其 value','直接 obj.key=新值必然成功','delete 永远被禁止','属性自动变成 getter'],['writable 管赋值。','configurable 管重新定义与删除。','两者是不同标志。'],'不可写属性不能通过普通赋值修改，但可配置属性仍可重新定义或删除。'],
    ['property-accessors','getter 不是固定字段','对象 getter fullName 基于 first 和 last 计算。修改 first 后，下次读取 fullName 会怎样？','',['重新执行 getter，通常反映最新 first','仍固定在对象创建时的字符串','自动删除 last','getter 只能执行一次'],['getter 在读取属性时运行。','它可读取当前其他字段。','除非自己缓存，否则不会固定旧值。'],'getter 是计算访问器，每次读取可根据当前 first、last 重新计算。'],
    ['prototype-inheritance','继承的 setter 会接收子对象','parent 定义了 value 的 setter。给 child.value 赋值时会怎样？','const parent={set value(v){this.saved=v}};\nconst child=Object.create(parent);\nchild.value=3;',['child.saved 为 3；setter 中的 this 是 child','parent.saved 为 3；setter 中的 this 是 parent','child 自动生成自身 value 数据属性','赋值必然抛 TypeError'],['读取到继承的访问器属性。','赋值会调用 setter。','setter 的 this 是发生赋值的接收者 child。'],'继承的 setter 会被调用，this 指向 child，所以在子对象上写入 saved。'],
    ['function-prototype','替换构造器 prototype 后的 constructor','把 Maker.prototype 整体替换为普通对象后，新实例的 constructor 属性为何可能不再指向 Maker？','Maker.prototype={speak(){}};',['新对象没有自有 constructor，原型链上可能继承 Object 的 constructor','new 不再工作','Maker 自动变成箭头函数','所有实例都失去原型'],['函数默认 prototype 对象通常有 constructor 属性。','整体替换会丢掉原对象上的属性。','如需该约定可显式恢复 constructor。'],'整体替换 prototype 会丢失默认 constructor 属性；新实例查找时可能落到 Object.prototype.constructor。'],
    ['native-prototypes','修改内建原型的风险','团队想给 Array.prototype 添加业务方法 report()。为什么共享应用中要谨慎？','',['可能与未来标准或其他库同名冲突，并影响所有数组','只会影响当前一个数组','会让 Array.isArray 失效','必须通过 new Array 才能调用'],['内建原型是全局共享的。','所有数组都会看到新增方法。','未来 API 或库可能使用相同名称。'],'修改内建原型会扩大影响范围并产生兼容冲突，业务逻辑通常更适合普通函数或自有类型。'],
    ['class-inheritance','super 方法调用仍使用当前实例','Child 重写 greet()，其中调用 super.greet()。父类方法里读取 this.name，会读到什么？','class Parent{greet(){return this.name}}\nclass Child extends Parent{constructor(){super();this.name="Lin"}greet(){return super.greet()+"!"}}',['"Lin"；super 指向父类方法，但调用接收者仍是 Child 实例','undefined；父类方法的 this 永远是 Parent.prototype','抛 TypeError；super 只能在构造器中用','"Parent"；this 自动切换为父类构造器'],['super.greet 找到父类方法。','方法调用时的 this 仍是当前子类实例。','实例 name 在构造时设置为 Lin。'],'super 查找父类实现，但不会把 this 改成 Parent.prototype；父方法仍读取当前 Child 实例的 name。'],
    ['static-properties-methods','子类静态字段遮蔽父类字段','Parent 有静态 category="base"。给 Child.category 赋 "child" 后，两者分别是什么？','class Parent{static category="base"}\nclass Child extends Parent{}\nChild.category="child";',['Parent 为 "base"，Child 为 "child"','两者都变成 "child"','两者都保持 "base"','Parent 变成 undefined，Child 为 "child"'],['子类构造器继承父类的静态属性。','给 Child 赋值可创建自身同名属性。','父类属性不会因此修改。'],'子类赋值创建或更新自身静态属性，遮蔽继承值；Parent.category 仍是 base。'],
    ['private-protected-properties-methods','私有字段不能靠括号访问','类声明 #value 私有字段。类外代码能否用 obj["#value"] 读取真实私有值？','',['不能；这是普通字符串键，不是私有字段访问','能；方括号语法绕过私有检查','能，但只能在严格模式','能，只要 obj 是实例'],['# 私有字段不是普通字符串属性。','方括号读取的是名为 "#value" 的公开属性。','私有字段只能在声明它的类体内使用语法访问。'],'obj["#value"] 不会访问真正的 #value 私有字段，不能以动态字符串绕过封装。'],
    ['extend-natives','用 Symbol.species 改变派生结果','Array 子类重写静态 Symbol.species getter 返回 Array。调用 map 后结果是哪种实例？','class Scores extends Array{static get [Symbol.species](){return Array}}\nconst out=new Scores(1,2).map(x=>x*2);',['out 是 Array，但不是 Scores','out 仍是 Scores','out 是 Set','map 返回原 Scores 本身'],['map 会创建结果数组。','Symbol.species 指定创建结果使用的构造器。','getter 返回了 Array。'],'重写 Symbol.species 让 map 创建普通 Array，而不是 Scores 子类实例。'],
    ['instanceof','自定义 Symbol.hasInstance 会改变检查规则','类定义静态 Symbol.hasInstance，把任何带 ok:true 的对象视为实例。普通对象 {ok:true} 的 instanceof 结果如何？','class Marker{static [Symbol.hasInstance](x){return x?.ok===true}}\n({ok:true}) instanceof Marker;',['true；自定义检查覆盖默认原型链判断','false；必须由 new Marker 创建','抛 TypeError','只有把 Marker.prototype 设为该对象才为 true'],['右侧类可自定义 instanceof 的判定方法。','代码按 ok 属性返回布尔值。','不需要真实原型关系。'],'Symbol.hasInstance 可定义品牌检查；此处普通对象符合 ok:true 条件，结果为 true。'],
    ['mixins','Object.assign 不复制不可枚举方法','某 mixin 的 hidden 方法被定义为不可枚举属性。Object.assign(Target.prototype,mixin) 后会怎样？','const mixin={};Object.defineProperty(mixin,"hidden",{value(){return 1}});',['hidden 不会被复制；Object.assign 只复制可枚举自有属性','hidden 会被复制并保持不可枚举','hidden 会被复制且自动变成静态方法','Target.prototype 会变成 mixin 的原型'],['Object.defineProperty 默认 enumerable:false。','Object.assign 只读取可枚举自有属性。','若要复制描述符需另用反射 API。'],'Object.assign 不会复制这个不可枚举方法，混入实现若依赖描述符应显式处理。'],
    ['try-catch','同步 try/catch 不会等 Promise 拒绝','下面 catch 能否捕获稍后发生的 Promise 拒绝？','try { Promise.reject(new Error("bad")); } catch (e) { log(e); }',['不能；需要 await 后 try/catch，或对 Promise 使用 catch','能，因为 reject 等于同步 throw','只有在浏览器中能','Promise 会自动转成返回值'],['Promise 拒绝是异步结果。','try 块里的调用并没有同步抛出该错误。','await 可把拒绝转成当前 async 函数里的异常。'],'同步 try/catch 不会捕获未 await 的 Promise 拒绝；应 await 或挂接 .catch。']
  ];
  for (const [lessonId,title,prompt,example,options,hints,explanation] of scenarios) {
    choice(`${lessonId}-third-01`,lessonId,title,prompt,example,options,0,hints,explanation);
  }

  code('recursion-third-01','recursion','递归提取树中所有叶子',
    '实现 leafIds(tree)：节点格式为 {id, children?}。按深度优先、从左到右顺序返回所有叶子节点的 id；children 为空数组也算叶子。不能修改输入。',
    'function leafIds(tree) {\n  // 在这里实现\n}',
    [['嵌套顺序','assert.deepEqual(leafIds({id:"root",children:[{id:"a"},{id:"b",children:[{id:"c"},{id:"d"}]}]}),["a","c","d"])'], ['根节点也是叶子','assert.deepEqual(leafIds({id:"only",children:[]}),["only"])'], ['输入不变','const t={id:1,children:[{id:2}]};leafIds(t);assert.deepEqual(t,{id:1,children:[{id:2}]})']],
    ['没有子节点或 children 为空时返回当前 id。','否则递归处理每个子树。','用 flatMap 或结果数组保持从左到右顺序。'],
    'function leafIds(tree) {\n  if(!tree.children?.length) return [tree.id];\n  return tree.children.flatMap(leafIds);\n}',
    '递归把大树问题拆成子树问题；叶子是没有非空 children 的节点，flatMap 保留深度优先顺序。');

  code('closure-third-01','closure','创建有容量限制的缓存',
    '实现 createRecentCache(limit)：返回 {put(key,value),get(key),keys()}。最多保留 limit 个不同键；更新已有键时它变成最近使用；get 命中时也变成最近使用；超限淘汰最久未使用键。keys() 从旧到新返回键数组。limit 必须是正整数。',
    'function createRecentCache(limit) {\n  // 在这里实现\n}',
    [['更新与淘汰','const c=createRecentCache(2);c.put("a",1);c.put("b",2);c.put("a",3);c.put("c",4);assert.deepEqual(c.keys(),["a","c"]);assert.equal(c.get("b"),undefined);assert.equal(c.get("a"),3)'], ['读取会刷新顺序','const c=createRecentCache(2);c.put("a",1);c.put("b",2);assert.equal(c.get("a"),1);c.put("c",3);assert.deepEqual(c.keys(),["a","c"])'], ['边界与隔离','assert.throws(()=>createRecentCache(0));const a=createRecentCache(1),b=createRecentCache(1);a.put("x",1);assert.deepEqual(b.keys(),[])']],
    ['每个缓存实例需要自己的 Map。','Map 按插入顺序迭代；删除再插入可刷新顺序。','超限时删除 Map.keys().next().value。'],
    'function createRecentCache(limit) {\n  if(!Number.isInteger(limit)||limit<=0) throw new RangeError("limit 无效");\n  const items=new Map();\n  const refresh=(key,value)=>{items.delete(key);items.set(key,value)};\n  return {\n    put(key,value){refresh(key,value);if(items.size>limit) items.delete(items.keys().next().value)},\n    get(key){if(!items.has(key)) return undefined;const value=items.get(key);refresh(key,value);return value},\n    keys(){return [...items.keys()]},\n  };\n}',
    '闭包隔离每个实例的 Map。借助插入顺序，删除再插入把访问过的键移到队尾，队首即最久未使用。', '稍有难度');

  code('call-apply-decorators-third-01','call-apply-decorators','失败后重试且保留调用语义',
    '实现 retry(fn, maxAttempts)：返回包装函数。同步调用 fn 最多 maxAttempts 次，首次成功即返回结果；全部失败时抛出最后一次的原始错误。每次都要保留包装函数被调用时的 this 与参数。maxAttempts 为正整数，否则抛 RangeError。',
    'function retry(fn, maxAttempts) {\n  // 在这里实现\n}',
    [['失败后成功','let calls=0;const wrapped=retry(function(x){calls++;if(calls<3)throw Error("retry");return this.base+x},3);assert.equal(wrapped.call({base:4},5),9);assert.equal(calls,3)'],['耗尽后抛最后一个错误','let calls=0;const last=Error("last");const wrapped=retry(()=>{calls++;throw calls===2?last:Error("first")},2);let caught;try{wrapped()}catch(e){caught=e}assert.equal(caught,last);assert.equal(calls,2)'],['参数和无效次数','const calls=[];const wrapped=retry(function(...args){calls.push([this.id,...args]);return 0},2);assert.equal(wrapped.call({id:7},"a",1),0);assert.deepEqual(calls,[[7,"a",1]]);assert.throws(()=>retry(()=>1,0))']],
    ['先验证重试次数。','包装函数用普通 function，以便取得调用时的 this。','循环内用 fn.apply(this,args) 调用；捕获失败后继续，耗尽时抛最后错误。'],
    'function retry(fn,maxAttempts){if(!Number.isInteger(maxAttempts)||maxAttempts<1)throw new RangeError("次数无效");return function(...args){let last;for(let i=0;i<maxAttempts;i++){try{return fn.apply(this,args)}catch(error){last=error}}throw last;};}',
    '装饰器用 apply 转发接收者与参数；成功立即返回，失败只在允许次数内重试，并保留最后一次原始异常。','稍有难度');

  code('prototype-methods-third-01','prototype-methods','在不修改父对象的前提下继承行为',
    '实现 createSession(base, token)：返回一个以 base 为原型的新对象，并有自身 token 属性；base 不得被修改。',
    'function createSession(base, token) {\n  // 在这里实现\n}',
    [['继承方法','const base={greet(){return this.token}};const x=createSession(base,"abc");assert.equal(x.greet(),"abc");assert.equal(Object.getPrototypeOf(x),base)'], ['自身字段与父对象不变','const base={token:"old"};const x=createSession(base,"new");assert.ok(Object.hasOwn(x,"token"));assert.equal(x.token,"new");assert.equal(base.token,"old")'], ['实例互不干扰','const b={};const x=createSession(b,1),y=createSession(b,2);x.token=3;assert.equal(y.token,2)']],
    ['Object.create(base) 创建指定原型的新对象。','给新对象设置 token 属性。','不要调用 Object.setPrototypeOf(base, ...)。'],
    'function createSession(base, token) {\n  const session=Object.create(base);\n  session.token=token;\n  return session;\n}',
    '原型提供共享行为，自身属性保存实例状态。创建子对象即可，不需要改动父对象。');

  code('class-third-01','class','实现有界任务队列',
    '实现 TaskQueue 类。构造参数 limit 为正整数；enqueue(task) 在未满时追加并返回 true，满时返回 false；dequeue() 移除并返回最早任务，空时返回 undefined；size getter 返回当前数量。实例内部任务数组不应对外暴露。',
    'class TaskQueue {\n  // 在这里实现\n}',
    [['容量与 FIFO','const q=new TaskQueue(2);assert.equal(q.enqueue("a"),true);assert.equal(q.enqueue("b"),true);assert.equal(q.enqueue("c"),false);assert.equal(q.size,2);assert.equal(q.dequeue(),"a");assert.equal(q.dequeue(),"b")'], ['空队列与实例隔离','const a=new TaskQueue(1),b=new TaskQueue(1);a.enqueue(1);assert.equal(b.size,0);assert.equal(b.dequeue(),undefined)'], ['非法容量','assert.throws(()=>new TaskQueue(0));assert.throws(()=>new TaskQueue(1.5))']],
    ['类的构造器验证 limit。','每个实例需要独立的数组，私有字段适合保存。','enqueue 用长度判断，dequeue 可使用 shift。'],
    'class TaskQueue {\n  #tasks=[];\n  constructor(limit){if(!Number.isInteger(limit)||limit<=0) throw new RangeError("limit 无效");this.limit=limit}\n  enqueue(task){if(this.#tasks.length>=this.limit) return false;this.#tasks.push(task);return true}\n  dequeue(){return this.#tasks.shift()}\n  get size(){return this.#tasks.length}\n}',
    '私有字段保存队列状态，构造器保证容量有效。enqueue 先检查容量，dequeue 按插入顺序取最早任务。');

  code('custom-errors-third-01','custom-errors','把底层错误包装成业务错误',
    '实现 ValidationError extends Error：构造函数接收 message 和 field，可选 cause；实例 name 为 "ValidationError"、field 为传入值，并保留 cause。实现 parsePositiveInt(text)：只有整串正整数（不含 0）才返回数字，否则抛 ValidationError，field 为 "count"。',
    'class ValidationError extends Error {\n  // 在这里实现\n}\nfunction parsePositiveInt(text) {\n  // 在这里实现\n}',
    [['成功解析','assert.equal(parsePositiveInt("12"),12)'], ['错误类型与字段','for(const value of ["0","-1","1x",""]){try{parsePositiveInt(value);throw Error("应失败")}catch(e){assert.ok(e instanceof ValidationError);assert.equal(e.name,"ValidationError");assert.equal(e.field,"count")}}'], ['cause 保留','const root=Error("root");const e=new ValidationError("bad","age",root);assert.equal(e.cause,root);assert.equal(e.field,"age")']],
    ['自定义错误类调用 super(message,{cause})。','设置 name 和 field。','正整数格式可先用 /^[1-9]\\d*$/ 检查，再转数字；还要确认安全整数。'],
    'class ValidationError extends Error {\n  constructor(message,field,cause){super(message,{cause});this.name="ValidationError";this.field=field}\n}\nfunction parsePositiveInt(text) {\n  if(!/^[1-9]\\d*$/.test(text)||!Number.isSafeInteger(Number(text))) throw new ValidationError("需要正整数","count");\n  return Number(text);\n}',
    '自定义 Error 类提供可识别的错误类型与字段信息；格式校验后还需检查安全整数范围，避免静默丢失精度。', '稍有难度');
}
