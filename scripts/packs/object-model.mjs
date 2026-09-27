export function addObjectModelExercises({ code, choice }) {
  code('property-descriptors-01','property-descriptors','创建只读但可枚举的配置项',
    '实现 defineVersion(target, version)：在 target 上创建自有属性 version。它可枚举、不可重新赋值、不可删除。返回 target。',
    'function defineVersion(target, version) {\n  // 在这里实现\n}',
    [['值和返回值','const x={};assert.ok(defineVersion(x,"1.0")===x);assert.equal(x.version,"1.0")'],['属性标志','const x={};defineVersion(x,"1.0");const d=Object.getOwnPropertyDescriptor(x,"version");assert.equal(d.enumerable,true);assert.equal(d.writable,false);assert.equal(d.configurable,false)'],['出现在枚举里','const x={};defineVersion(x,2);assert.deepEqual(Object.keys(x),["version"])']],
    ['普通赋值创建的属性通常可写、可配置。','Object.defineProperty 能分别设置属性标志。','指定 value、enumerable:true、writable:false、configurable:false。'],
    'function defineVersion(target, version) {\n  Object.defineProperty(target,"version",{value:version,enumerable:true,writable:false,configurable:false});\n  return target;\n}',
    '属性描述符把枚举、写入和配置分开控制。使用 defineProperty 时，未写出的布尔标志默认是 false。');

  choice('property-descriptors-02','property-descriptors','默认属性描述符',
    '判断 Object.keys(data) 与 data.count = 2 的行为。严格模式下运行。',
    '"use strict";\nconst data={};\nObject.defineProperty(data,"count",{value:1});\nconsole.log(Object.keys(data));\ndata.count=2;',
    ['先输出 ["count"]，赋值成功','先输出 []，赋值成功','先输出 []，赋值抛出 TypeError','先输出 ["count"]，赋值抛出 TypeError'],2,
    ['defineProperty 的布尔属性标志默认是什么？','严格模式下给只读属性赋值会怎样？','不可枚举，所以 keys 为空；不可写，所以赋值抛错。'],
    '使用 defineProperty 时未提供的 enumerable、writable 和 configurable 默认是 false。严格模式赋值只读属性抛出 TypeError。');

  code('property-accessors-01','property-accessors','带校验的温度访问器',
    '实现 createThermostat(initial)：返回对象，暴露可读写的 celsius 属性；只有有限数字才能写入，否则抛出 TypeError。对象另有只读的 fahrenheit 访问器，按摄氏度换算。',
    'function createThermostat(initial) {\n  // 在这里实现\n}',
    [['换算与更新','const t=createThermostat(0);assert.equal(t.fahrenheit,32);t.celsius=100;assert.equal(t.fahrenheit,212)'],['拒绝非法输入','const t=createThermostat(20);assert.throws(()=>{t.celsius=NaN});assert.throws(()=>{t.celsius="25"});assert.equal(t.celsius,20)'],['华氏度只读','const d=Object.getOwnPropertyDescriptor(createThermostat(0),"fahrenheit");assert.equal(typeof d.get,"function");assert.equal(d.set,undefined)']],
    ['把真实状态放在闭包变量中。','对象字面量可以定义 get 与 set。','fahrenheit 只提供 getter，celsius 同时提供 getter 和 setter。'],
    'function createThermostat(initial) {\n  let value=initial;\n  return {\n    get celsius() { return value; },\n    set celsius(next) { if(!Number.isFinite(next)) throw new TypeError("温度无效"); value=next; },\n    get fahrenheit() { return value*9/5+32; }\n  };\n}',
    '访问器让读取和赋值看起来像普通属性，同时把校验和派生值计算放在方法里。');

  choice('property-accessors-02','property-accessors','getter 是否会在定义时运行',
    '判断 calls 的最终值。',
    'let calls=0;\nconst item={get price(){calls++;return 10}};\nconst a=Object.getOwnPropertyDescriptor(item,"price");\nconst b=item.price;\nconsole.log(calls);',
    ['0','1','2','取决于浏览器'],1,
    ['创建 getter 不等于读取属性。','读取描述符只是拿到 getter 函数。','只有 item.price 读取时执行一次 getter。'],
    '获取属性描述符不会调用 getter；真正读取 item.price 时 getter 运行一次，因此 calls 为 1。');

  code('prototype-inheritance-01','prototype-inheritance','区分继承值和自有值',
    '实现 makeChild(parent, overrides)：返回以 parent 为原型的新对象。把 overrides 的自有属性复制到子对象上；不要修改 parent。',
    'function makeChild(parent, overrides) {\n  // 在这里实现\n}',
    [['继承和覆盖','const p={theme:"light",lang:"zh"};const c=makeChild(p,{theme:"dark"});assert.equal(c.theme,"dark");assert.equal(c.lang,"zh");assert.ok(Object.getPrototypeOf(c)===p)'],['父对象不变','const p={theme:"light"};makeChild(p,{theme:"dark"});assert.equal(p.theme,"light")'],['只复制自有属性','const base={bad:1};const x=Object.create(base);x.good=2;const c=makeChild({},x);assert.ok(Object.hasOwn(c,"good"));assert.ok(!Object.hasOwn(c,"bad"))']],
    ['Object.create 可以指定新对象的原型。','Object.entries 只遍历自有可枚举字符串键。','创建子对象后，用 Object.assign 复制 overrides 的自有可枚举属性。'],
    'function makeChild(parent, overrides) {\n  return Object.assign(Object.create(parent),overrides);\n}',
    'Object.create(parent) 建立原型关系；Object.assign 只复制 overrides 的自有可枚举属性，不改动 parent。');

  choice('prototype-inheritance-02','prototype-inheritance','写入继承的数据属性',
    '判断 child.count 与 parent.count。',
    'const parent={count:1};\nconst child=Object.create(parent);\nchild.count=5;\nconsole.log(child.count,parent.count);',
    ['5、5','1、1','5、1','抛出 TypeError'],2,
    ['读取 child.count 起初会向原型查找。','给 child.count 赋值时，普通可写数据属性会发生什么？','子对象创建自己的 count，父对象仍是 1。'],
    '写入会在 child 上创建自有 count 属性，遮蔽原型上的值。parent.count 不改变。');

  code('function-prototype-01','function-prototype','在原型上共享实例方法',
    '实现 Account(owner, balance)：用构造函数保存实例自己的 owner 和 balance；所有实例共享 deposit(amount) 方法，它增加 balance 并返回新余额。',
    'function Account(owner, balance) {\n  // 在这里实现\n}',
    [['实例状态','const a=new Account("A",10),b=new Account("B",2);assert.equal(a.deposit(5),15);assert.equal(b.balance,2)'],['方法共享','const a=new Account("A",1),b=new Account("B",1);assert.ok(a.deposit===b.deposit);assert.ok(!Object.hasOwn(a,"deposit"))'],['构造器关系','const a=new Account("A",1);assert.ok(a instanceof Account)']],
    ['构造函数负责每个实例独立的数据。','方法放在 Account.prototype 上。','在构造函数定义之后给 Account.prototype.deposit 赋值。'],
    'function Account(owner, balance) {\n  this.owner=owner;\n  this.balance=balance;\n}\nAccount.prototype.deposit=function(amount) {\n  this.balance+=amount;\n  return this.balance;\n};',
    '实例各自保存余额，deposit 放在同一个原型对象上，因此所有实例共享一个方法函数。');

  choice('function-prototype-02','function-prototype','更换 prototype 的时机',
    '判断 first 与 second 的 greet() 结果。',
    'function Person() {}\nPerson.prototype.greet=()=>"old";\nconst first=new Person();\nPerson.prototype={greet:()=>"new"};\nconst second=new Person();\nconsole.log(first.greet(),second.greet());',
    ['old、old','new、new','old、new','TypeError'],2,
    ['旧实例的 [[Prototype]] 会随构造函数 prototype 属性重新赋值而变化吗？','first 指向旧原型对象，second 指向新原型对象。','输出 old、new。'],
    '更换 Person.prototype 只影响之后创建的实例。first 保留对旧原型对象的引用。');

  choice('native-prototypes-01','native-prototypes','数组方法从哪里来',
    '判断三个表达式的结果。',
    'const list=[];\nconsole.log(Object.hasOwn(list,"map"), list.map===Array.prototype.map, Object.getPrototypeOf(list)===Array.prototype);',
    ['true、true、true','false、true、true','false、false、true','false、true、false'],1,
    ['普通数组实例自己有 map 吗？','方法通常在 Array.prototype 上共享。','后两项为 true，第一项为 false。'],
    '数组实例通常不自带 map 属性，而是沿原型链从 Array.prototype 取得共享方法。');

  code('native-prototypes-02','native-prototypes','借用数组方法处理参数对象',
    '实现 argsToArray()：把函数收到的 arguments 类数组转换为真正数组并返回，保持参数顺序。不要修改 Array.prototype。',
    'function argsToArray() {\n  // 在这里实现\n}',
    [['多参数','assert.deepEqual(argsToArray(1,"x",false),[1,"x",false])'],['空参数','assert.deepEqual(argsToArray(),[])'],['确实是数组','assert.ok(Array.isArray(argsToArray(1)))']],
    ['arguments 有 length 和索引，但不是数组。','Array.from 可以处理类数组。','返回 Array.from(arguments)。'],
    'function argsToArray() {\n  return Array.from(arguments);\n}',
    'Array.from 接收类数组对象，创建真正数组；不需要更改内建原型。');

  code('prototype-methods-01','prototype-methods','创建无原型字典',
    '实现 createDictionary(entries)：entries 是 [key,value] 数组。返回无原型对象，按顺序写入全部键值对，允许键名 "__proto__"。',
    'function createDictionary(entries) {\n  // 在这里实现\n}',
    [['无原型','const d=createDictionary([["a",1]]);assert.equal(Object.getPrototypeOf(d),null);assert.equal(d.a,1)'],['特殊键为普通数据','const d=createDictionary([["__proto__",7]]);assert.equal(d["__proto__"],7);assert.ok(Object.hasOwn(d,"__proto__"))'],['重复键取最后值','const d=createDictionary([["x",1],["x",2]]);assert.equal(d.x,2)']],
    ['Object.create(null) 创建没有原型的对象。','此时 __proto__ 不再是继承的特殊访问器。','循环写入每个键值对。'],
    'function createDictionary(entries) {\n  const result=Object.create(null);\n  for(const [key,value] of entries) result[key]=value;\n  return result;\n}',
    '无原型对象不继承 Object.prototype 的访问器和方法，适合把任意字符串作为普通键。');

  choice('prototype-methods-02','prototype-methods','改变对象的原型',
    '判断读取 child.kind 的结果。',
    'const first={kind:"A"};\nconst second={kind:"B"};\nconst child=Object.create(first);\nObject.setPrototypeOf(child,second);\nconsole.log(child.kind);',
    ['A','B','undefined','TypeError'],1,
    ['child 有没有自己的 kind？','setPrototypeOf 后会沿哪个原型查找？','新的原型是 second。'],
    'child 自身没有 kind，改变原型后属性查找会在 second 找到 "B"。');

  code('class-01','class','封装带方法的购物车项目',
    '定义 CartItem 类。构造器接收 sku、price 和可选 quantity（默认 1），实例有 total() 方法返回 price × quantity，add(count) 增加数量并返回新数量。',
    'class CartItem {\n  // 在这里实现\n}',
    [['默认数量与金额','const x=new CartItem("A",12);assert.equal(x.quantity,1);assert.equal(x.total(),12)'],['修改数量','const x=new CartItem("A",12,2);assert.equal(x.add(3),5);assert.equal(x.total(),60)'],['方法共享','const a=new CartItem("A",1),b=new CartItem("B",2);assert.ok(a.total===b.total)']],
    ['构造器初始化实例字段。','方法写在 class 主体中，不写成构造器里的箭头函数属性。','total 和 add 使用 this 访问实例状态。'],
    'class CartItem {\n  constructor(sku,price,quantity=1) { this.sku=sku;this.price=price;this.quantity=quantity; }\n  total() { return this.price*this.quantity; }\n  add(count) { return this.quantity+=count; }\n}',
    'class 方法位于原型上供实例共享；构造器初始化每个实例独立的数据。');

  choice('class-02','class','类方法提取后的 this',
    '代码在严格模式下运行。直接调用 detached() 会怎样？',
    'class User { constructor(name){this.name=name} getName(){return this.name} }\nconst user=new User("Lin");\nconst detached=user.getName;\ndetached();',
    ['返回 Lin','返回 undefined','抛出 TypeError','自动绑定 user'],2,
    ['类方法不会自动绑定实例。','detached 是普通函数调用，this 是什么？','读取 undefined.name 会抛错。'],
    '提取类方法后失去调用接收者。类方法在严格模式下执行，此处 this 为 undefined，读取 this.name 抛出 TypeError。');

  code('class-inheritance-01','class-inheritance','扩展基类并复用方法',
    '已有 BaseItem 类。定义 DiscountedItem extends BaseItem：构造器接收 price 和 discount，保留基类的 price 初始化；重写 total()，返回基类 total() × (1-discount)。',
    'class BaseItem { constructor(price){ this.price=price; } total(){ return this.price; } }\nclass DiscountedItem extends BaseItem {\n  // 在这里实现\n}',
    [['继承关系和结果','const x=new DiscountedItem(100,0.2);assert.ok(x instanceof BaseItem);assert.equal(x.total(),80)'],['读取基类状态','const x=new DiscountedItem(50,0.5);assert.equal(x.price,50);assert.equal(x.discount,0.5)'],['多实例独立','const a=new DiscountedItem(10,0),b=new DiscountedItem(10,0.5);assert.equal(a.total(),10);assert.equal(b.total(),5)']],
    ['派生类构造器使用 this 前必须调用 super。','super.total() 可调用基类方法。','在 total 中乘以 1-this.discount。'],
    'class BaseItem { constructor(price){ this.price=price; } total(){ return this.price; } }\nclass DiscountedItem extends BaseItem {\n  constructor(price,discount) { super(price); this.discount=discount; }\n  total() { return super.total()*(1-this.discount); }\n}',
    'super(price) 完成基类初始化；重写 total 时通过 super.total() 复用基类行为。');

  choice('class-inheritance-02','class-inheritance','派生类构造器调用顺序',
    '下面代码创建 new Child() 时会怎样？',
    'class Parent {}\nclass Child extends Parent {\n  constructor() {\n    this.ready=true;\n    super();\n  }\n}',
    ['创建成功','抛出 ReferenceError','抛出 TypeError','只在非严格模式下成功'],1,
    ['派生类的 this 何时可用？','super() 必须先完成基类初始化。','在 super() 前访问 this 会抛错。'],
    '派生类构造器必须先调用 super()，然后才能访问 this；这里会抛出 ReferenceError。');

  code('static-properties-methods-01','static-properties-methods','静态工厂方法创建实例',
    '定义 User 类：构造器接收 name 和 role；静态方法 guest(name) 返回 role 为 "guest" 的 User 实例。guest 不应作为实例方法出现。',
    'class User {\n  // 在这里实现\n}',
    [['工厂结果','const u=User.guest("Lin");assert.ok(u instanceof User);assert.equal(u.name,"Lin");assert.equal(u.role,"guest")'],['静态位置','const u=User.guest("A");assert.equal(u.guest,undefined);assert.equal(typeof User.guest,"function")']],
    ['方法前的 static 决定它属于类对象。','工厂方法内部可以 new User。','构造器保存 name、role。'],
    'class User {\n  constructor(name,role) { this.name=name;this.role=role; }\n  static guest(name) { return new User(name,"guest"); }\n}',
    '静态方法属于类对象 User，适合充当构造入口；实例不会继承这个静态方法。');

  choice('static-properties-methods-02','static-properties-methods','静态方法的继承',
    '判断 Child.label() 的结果。',
    'class Parent { static label(){return this.name;} }\nclass Child extends Parent {}\nconsole.log(Child.label());',
    ['Parent','Child','undefined','TypeError'],1,
    ['子类能继承静态方法吗？','静态方法中的 this 由调用对象决定。','Child.label() 的 this 是 Child。'],
    '子类继承静态方法，调用 Child.label() 时 this 指向 Child，所以返回它的类名。');

  code('private-protected-properties-methods-01','private-protected-properties-methods','真正私有的余额字段',
    '定义 Wallet 类。构造器接收初始余额，使用私有字段保存；提供 deposit(amount) 更新并返回余额、getBalance() 读取余额。直接访问 wallet.balance 不应得到私有值。',
    'class Wallet {\n  // 在这里实现\n}',
    [['读写余额','const w=new Wallet(10);assert.equal(w.deposit(5),15);assert.equal(w.getBalance(),15)'],['私有字段','const w=new Wallet(7);assert.equal(w.balance,undefined);assert.deepEqual(Object.keys(w),[])'],['实例独立','const a=new Wallet(1),b=new Wallet(2);a.deposit(3);assert.equal(b.getBalance(),2)']],
    ['使用 # 开头的私有字段。','在类内部可通过 this.#balance 访问。','不要再创建公开的 balance 属性。'],
    'class Wallet {\n  #balance;\n  constructor(initial) { this.#balance=initial; }\n  deposit(amount) { return this.#balance+=amount; }\n  getBalance() { return this.#balance; }\n}',
    '#balance 是语言级私有字段，不会作为可枚举的公开属性出现。');

  choice('private-protected-properties-methods-02','private-protected-properties-methods','私有字段的访问范围',
    '判断下面的第二行会怎样。',
    'class Box { #value=3; read(){return this.#value;} }\nnew Box().#value;',
    ['得到 3','得到 undefined','抛出 SyntaxError','抛出 TypeError'],2,
    ['#value 可以在类定义外部直接访问吗？','私有字段的语法会在解析阶段检查。','类外直接使用 #value 是语法错误。'],
    '类外直接访问私有字段在语法层面非法，解析时抛出 SyntaxError。应通过类提供的公开方法访问。');

  choice('extend-natives-01','extend-natives','扩展数组后的方法结果类型',
    '在没有覆盖 Symbol.species 的情况下，判断 filtered 的类型。',
    'class MyList extends Array {}\nconst list=new MyList(1,2,3);\nconst filtered=list.filter(n=>n>1);\nconsole.log(filtered instanceof MyList);',
    ['true','false','取决于浏览器','filter 会抛错'],0,
    ['数组方法创建结果时会考虑派生类。','默认 species 指向当前构造器。','filter 结果通常仍为 MyList 实例。'],
    '默认情况下，继承自 Array 的过滤方法会通过 species 创建结果，因此 filtered 仍是 MyList 实例。');

  code('extend-natives-02','extend-natives','扩展数组并增加汇总方法',
    '定义 Scores extends Array，提供 average()：只统计有限数字，忽略 NaN 和 Infinity；没有有效数值时返回 null。保留数组原有行为。',
    'class Scores extends Array {\n  // 在这里实现\n}',
    [['平均分','const s=new Scores(1,2,3);assert.equal(s.average(),2);assert.equal(s.length,3)'],['过滤无效值','assert.equal(new Scores(4,NaN,Infinity,6).average(),5)'],['空集合','assert.equal(new Scores().average(),null)']],
    ['方法中可以遍历 this。','用 Number.isFinite 筛掉无效值。','统计总和和数量，无有效项时返回 null。'],
    'class Scores extends Array {\n  average() {\n    const values=this.filter(Number.isFinite);\n    return values.length ? values.reduce((a,b)=>a+b,0)/values.length : null;\n  }\n}',
    '子类继承数组的索引、length 与方法，同时可以增加领域方法。计算时只使用有限数字。');

  choice('instanceof-01','instanceof','改变原型后 instanceof 的结果',
    '判断两个输出。',
    'function Shape() {}\nconst x=new Shape();\nconsole.log(x instanceof Shape);\nShape.prototype={};\nconsole.log(x instanceof Shape);',
    ['true、true','true、false','false、true','false、false'],1,
    ['instanceof 检查当前 Shape.prototype 是否在 x 的原型链中。','替换 prototype 后，x 的原型链没有自动变化。','第一次 true，第二次 false。'],
    'x 创建时指向旧原型对象；后来 Shape.prototype 换成新对象，当前原型不再出现在 x 的原型链里。');

  code('instanceof-02','instanceof','跨原型链的品牌识别',
    '实现 isDate(value)：仅当 value 是 Date 实例（含 Date 子类）时返回 true。不要把普通对象 { getTime() {} } 当作 Date。',
    'function isDate(value) {\n  // 在这里实现\n}',
    [['Date 与子类','class X extends Date{};assert.equal(isDate(new Date()),true);assert.equal(isDate(new X()),true)'],['伪装对象','assert.equal(isDate({getTime(){return 0}}),false);assert.equal(isDate(null),false)']],
    ['方法形状不足以证明实例类型。','这里可用 instanceof Date。','返回 value instanceof Date。'],
    'function isDate(value) {\n  return value instanceof Date;\n}',
    'instanceof 检查 Date.prototype 是否在原型链上，也适用于 Date 子类。跨 iframe Realm 是更复杂的特例，本题未要求。');

  code('mixins-01','mixins','给类混入事件能力',
    '实现 withEvents(Base)：返回继承 Base 的新类，提供 on(name, handler) 与 emit(name, value)。on 支持同名多个处理函数；emit 按注册顺序调用，并把实例作为 handler 的 this。每个实例的订阅互不干扰。',
    'function withEvents(Base) {\n  // 在这里实现\n}',
    [['事件顺序与参数','class A{};const E=withEvents(A);const x=new E();const out=[];x.on("change",v=>out.push(v));x.on("change",v=>out.push(v*2));x.emit("change",3);assert.deepEqual(out,[3,6])'],['实例隔离','class A{};const E=withEvents(A);const a=new E(),b=new E();let n=0;a.on("x",()=>n++);b.emit("x");assert.equal(n,0)'],['继承与 this','class A{hello(){return 1}};const E=withEvents(A);const x=new E();let seen;x.on("x",function(){seen=this});x.emit("x");assert.ok(x instanceof A);assert.ok(seen===x);assert.equal(x.hello(),1)']],
    ['返回 class extends Base。','订阅数据必须属于每个实例。','emit 遍历处理函数，用 handler.call(this, value)。'],
    'function withEvents(Base) {\n  return class extends Base {\n    #events=new Map();\n    on(name,handler) {\n      if(!this.#events.has(name)) this.#events.set(name,[]);\n      this.#events.get(name).push(handler);\n    }\n    emit(name,value) {\n      for(const handler of this.#events.get(name) ?? []) handler.call(this,value);\n    }\n  };\n}',
    'Mixin 函数通过返回子类给任意基类增加能力。每个实例持有自己的事件表，避免订阅相互串扰。','稍有难度');

  choice('mixins-02','mixins','混入方法冲突的风险',
    '两个 mixin 都会给原型添加同名方法 save。顺序调用 Object.assign(Target.prototype, first, second) 后，Target 实例使用哪个 save？',
    'const first={save(){return "A"}};\nconst second={save(){return "B"}};\nObject.assign(Target.prototype,first,second);',
    ['first 的 A','second 的 B','两个方法都会依次调用','抛出冲突错误'],1,
    ['Object.assign 对同名键如何处理？','后面的源对象覆盖前面的键。','second 的 save 覆盖 first 的 save。'],
    'Object.assign 按源对象顺序复制属性，后面的同名属性覆盖前面的。混入时需明确冲突规则。');

  choice('try-catch-01','try-catch','finally 中的 return 会发生什么',
    '判断 run() 的返回值。',
    'function run() {\n  try { return "try"; }\n  finally { return "finally"; }\n}\nrun();',
    ['"try"','"finally"','undefined','SyntaxError'],1,
    ['finally 在函数返回之前执行。','finally 自己的 return 会覆盖之前的返回。','最终返回 finally。'],
    'finally 中的 return 覆盖 try 中的 return；这通常会掩盖原本的结果或错误，应谨慎使用。');

  code('try-catch-02','try-catch','只处理预期错误并转抛其他错误',
    '实现 loadOrDefault(loader)：调用 loader()；若抛出 SyntaxError，返回空对象；其他错误必须原样抛出。',
    'function loadOrDefault(loader) {\n  // 在这里实现\n}',
    [['成功结果','assert.deepEqual(loadOrDefault(()=>({a:1})),{a:1})'],['预期错误','assert.deepEqual(loadOrDefault(()=>{throw new SyntaxError("bad")}),{})'],['未知错误原样抛出','const e=new RangeError("bad");try{loadOrDefault(()=>{throw e});throw Error("未抛出")}catch(actual){assert.ok(actual===e)}']],
    ['catch 不应该把所有错误吞掉。','用 instanceof SyntaxError 判断预期错误。','其他错误使用 throw error 原样转抛。'],
    'function loadOrDefault(loader) {\n  try { return loader(); }\n  catch(error) {\n    if(error instanceof SyntaxError) return {};\n    throw error;\n  }\n}',
    '只为明确可以恢复的错误提供默认值，其他错误继续传播，避免掩盖真正的问题。');

  code('custom-errors-01','custom-errors','携带字段名的校验错误',
    '定义 ValidationError extends Error：构造器接收 field 与 message；name 为 "ValidationError"，保存 field，保留 message，并且 instanceof Error 为 true。',
    'class ValidationError extends Error {\n  // 在这里实现\n}',
    [['继承信息','const e=new ValidationError("email","格式错误");assert.ok(e instanceof Error);assert.ok(e instanceof ValidationError);assert.equal(e.message,"格式错误")'],['自定义属性','const e=new ValidationError("age","无效");assert.equal(e.name,"ValidationError");assert.equal(e.field,"age")']],
    ['派生类构造器先调用 super(message)。','随后设置 name 和 field。','保持 Error 的原型关系。'],
    'class ValidationError extends Error {\n  constructor(field,message) {\n    super(message);\n    this.name="ValidationError";\n    this.field=field;\n  }\n}',
    '扩展 Error 后调用 super(message) 初始化错误对象，再增加领域字段，调用方可按错误类型和字段处理。');

  choice('custom-errors-02','custom-errors','错误包装与原始原因',
    '要在抛出新错误时保留底层错误作为原因，以下哪一种标准写法合适？',
    'const original = new TypeError("字段格式错误");',
    ['throw new Error("保存失败", { cause: original })','throw new Error("保存失败", original)','throw Error.cause(original)','throw original.message'],0,
    ['Error 构造器支持 options 对象。','cause 字段保存底层错误。','第二个参数写成 { cause: original }。'],
    'Error 的 options 参数可包含 cause，既给调用方新的上下文，也保留原始错误供排查。');
}
