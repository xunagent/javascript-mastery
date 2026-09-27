export function addClassErrorDepthCodeExercises({ code }) {
  code('class-depth-03','class','实现有边界的计数器类','实现 BoundedCounter：构造参数 min、max、initial=min，均为整数且 min<=initial<=max，否则抛 RangeError；value getter 返回当前值；step(delta=1) 尝试累加整数 delta，若越界则保持原值并返回 false，否则更新并返回 true。实例状态互不干扰。',
    'class BoundedCounter {\n  // 在这里实现\n}',
    [['更新与边界','const c=new BoundedCounter(0,3);assert.equal(c.value,0);assert.equal(c.step(),true);assert.equal(c.step(2),true);assert.equal(c.value,3);assert.equal(c.step(),false);assert.equal(c.value,3)'],['负向与实例隔离','const a=new BoundedCounter(-2,2,0),b=new BoundedCounter(-2,2);assert.equal(a.step(-2),true);assert.equal(a.step(-1),false);assert.equal(a.value,-2);assert.equal(b.value,-2)'],['无效输入','assert.throws(()=>new BoundedCounter(2,1));assert.throws(()=>new BoundedCounter(0,2,3));const c=new BoundedCounter(0,2);assert.equal(c.step(0.5),false);assert.equal(c.value,0)']],
    ['构造器先验证整数与区间关系。','每个实例保存自己的当前值。','step 先验证 delta 和候选值，再决定是否修改。'],
    'class BoundedCounter{constructor(min,max,initial=min){if(!Number.isInteger(min)||!Number.isInteger(max)||!Number.isInteger(initial)||min>max||initial<min||initial>max)throw new RangeError("区间无效");this.min=min;this.max=max;this._value=initial}get value(){return this._value}step(delta=1){const next=this._value+delta;if(!Number.isInteger(delta)||next<this.min||next>this.max)return false;this._value=next;return true}}',
    '构造器建立有效不变量；step 在修改状态前验证候选值，越界时保留原状态。');

  code('class-inheritance-depth-03','class-inheritance','复用父类格式并增加子类标签','实现 Message 和 PriorityMessage：Message 构造器接收 text，format() 返回 text；PriorityMessage extends Message，构造器接收 text、priority，调用 super(text)；重写 format() 返回 "[{priority}] {父类 format() 的结果}"。之后修改实例 text 时，格式化应反映新值。',
    'class Message {\n  // 在这里实现\n}\nclass PriorityMessage extends Message {\n  // 在这里实现\n}',
    [['基本格式','const m=new PriorityMessage("hello","high");assert.equal(m.format(),"[high] hello");assert.ok(m instanceof Message)'],['复用父类与当前状态','const m=new PriorityMessage("A",2);m.text="B";assert.equal(m.format(),"[2] B")'],['基类独立','const m=new Message("base");assert.equal(m.format(),"base")']],
    ['父类构造器保存 text。','子类构造器先 super(text)，再保存 priority。','子类 format 用 super.format() 获取当前 text。'],
    'class Message{constructor(text){this.text=text}format(){return this.text}}class PriorityMessage extends Message{constructor(text,priority){super(text);this.priority=priority}format(){return "["+this.priority+"] "+super.format()}}',
    '子类通过 super 初始化基类部分，并在覆盖方法中复用父实现；格式化读取当前实例状态。');

  code('static-properties-methods-depth-03','static-properties-methods','可继承的静态 JSON 工厂','实现 RecordItem：构造器接收 id、label；静态 fromJSON(text) 解析 JSON，要求结果是对象、id 为整数且 label 为字符串，否则抛 TypeError；合法时用 new this(id,label) 创建实例。派生类继承该工厂后应创建派生类实例。',
    'class RecordItem {\n  // 在这里实现\n}',
    [['工厂创建','const x=RecordItem.fromJSON(JSON.stringify({id:2,label:"A"}));assert.ok(x instanceof RecordItem);assert.equal(x.id,2);assert.equal(x.label,"A")'],['子类继承工厂','class Special extends RecordItem{}const x=Special.fromJSON(JSON.stringify({id:3,label:"B"}));assert.ok(x instanceof Special);assert.equal(x.label,"B")'],['数据校验','for(const text of ["null","[]",JSON.stringify({id:"2",label:"A"}),JSON.stringify({id:1})])assert.throws(()=>RecordItem.fromJSON(text))']],
    ['JSON.parse 先解析文本。','验证非 null、非数组的对象及字段类型。','静态方法里使用 new this(...)，而非固定写 new RecordItem(...)。'],
    'class RecordItem{constructor(id,label){this.id=id;this.label=label}static fromJSON(text){const data=JSON.parse(text);if(!data||typeof data!=="object"||Array.isArray(data)||!Number.isInteger(data.id)||typeof data.label!=="string")throw new TypeError("记录无效");return new this(data.id,data.label)}}',
    '继承的静态方法以派生类为 this，new this 保留工厂多态性；解析与字段校验防止错误数据进入实例。');

  code('private-protected-properties-methods-depth-03','private-protected-properties-methods','私有库存与原子扣减','实现 Stock：构造参数 quantity 为非负整数，否则抛 RangeError；用真正的 # 私有字段保存库存。available getter 返回余量；take(count) 仅接受正整数且库存足够，成功扣减并返回 true，否则不改变库存并返回 false。不同实例独立。',
    'class Stock {\n  // 在这里实现\n}',
    [['扣减与边界','const s=new Stock(5);assert.equal(s.available,5);assert.equal(s.take(3),true);assert.equal(s.available,2);assert.equal(s.take(3),false);assert.equal(s.available,2)'],['非法数量与实例隔离','const a=new Stock(2),b=new Stock(2);assert.equal(a.take(0),false);assert.equal(a.take(1.5),false);assert.equal(a.take(1),true);assert.equal(b.available,2)'],['私有性与构造验证','assert.throws(()=>new Stock(-1));assert.throws(()=>new Stock(1.2));const s=new Stock(2);assert.equal(Object.hasOwn(s,"quantity"),false);assert.equal(Object.hasOwn(s,"#quantity"),false)']],
    ['声明 #quantity 私有字段。','构造器验证后赋初值。','take 在修改前检查 count 和库存。'],
    'class Stock{#quantity;constructor(quantity){if(!Number.isInteger(quantity)||quantity<0)throw new RangeError("库存无效");this.#quantity=quantity}get available(){return this.#quantity}take(count){if(!Number.isInteger(count)||count<=0||count>this.#quantity)return false;this.#quantity-=count;return true}}',
    '私有字段避免外部直接改写库存；take 先验证后扣减，失败时保持状态不变。');

  code('extend-natives-depth-03','extend-natives','扩展数组但让派生方法返回普通数组','实现 IdList extends Array：byId(id) 返回首个同 id 项或 undefined；静态 Symbol.species 返回 Array，使 map、filter 产生普通 Array，而非 IdList。保留 Array.isArray 对原实例为 true。',
    'class IdList extends Array {\n  // 在这里实现\n}',
    [['查询与数组身份','const list=new IdList({id:1},{id:2});assert.equal(list.byId(2).id,2);assert.equal(list.byId(9),undefined);assert.equal(Array.isArray(list),true)'],['派生方法返回类型','const list=new IdList({id:1},{id:2});const result=list.map(x=>x.id);assert.ok(Array.isArray(result));assert.equal(result instanceof IdList,false);assert.deepEqual(result,[1,2])'],['filter 结果类型','const list=new IdList({id:1},{id:2});assert.equal(list.filter(x=>x.id>1) instanceof IdList,false)']],
    ['继承 Array 后可直接使用 find。','byId 用 item.id===id 匹配。','静态 get [Symbol.species]() 返回 Array。'],
    'class IdList extends Array{static get [Symbol.species](){return Array}byId(id){return this.find(item=>item.id===id)}}',
    '子类添加领域查询方法；Symbol.species 控制 map/filter 等创建的结果类型，原实例仍是数组子类。');

  code('instanceof-depth-03','instanceof','手工检查默认原型链关系','实现 hasCtorPrototype(value,Ctor)：按默认 instanceof 的原型链规则判断 Ctor.prototype 是否出现在 value 的原型链上；null、原始值返回 false；若 Ctor.prototype 不是对象则抛 TypeError。忽略可能自定义的 Symbol.hasInstance。',
    'function hasCtorPrototype(value,Ctor){\n  // 在这里实现\n}',
    [['继承链','class A{}class B extends A{};const b=new B();assert.equal(hasCtorPrototype(b,A),true);assert.equal(hasCtorPrototype(b,B),true);assert.equal(hasCtorPrototype({},A),false)'],['伪造 constructor 不算','function A(){}const x={constructor:A};assert.equal(hasCtorPrototype(x,A),false);Object.setPrototypeOf(x,A.prototype);assert.equal(hasCtorPrototype(x,A),true)'],['边界与错误','assert.equal(hasCtorPrototype(null,Object),false);assert.equal(hasCtorPrototype(1,Number),false);function Bad(){}Bad.prototype=3;assert.throws(()=>hasCtorPrototype({},Bad))']],
    ['先检查 Ctor.prototype 是否为对象。','原始值和 null 没有要检查的对象原型链。','从 Object.getPrototypeOf(value) 开始逐层比较。'],
    'function hasCtorPrototype(value,Ctor){const target=Ctor.prototype;if(target===null||(typeof target!=="object"&&typeof target!=="function"))throw new TypeError("原型无效");if(value===null||(typeof value!=="object"&&typeof value!=="function"))return false;for(let proto=Object.getPrototypeOf(value);proto!==null;proto=Object.getPrototypeOf(proto))if(proto===target)return true;return false;}',
    '默认 instanceof 基于右侧 prototype 在左侧对象原型链中的出现位置；constructor 自有字段本身不能证明身份。');

  code('mixins-depth-03','mixins','用类混入时间戳能力','实现 withTimestamp(Base)：返回继承 Base 的新类。新实例有 updatedAt，初始为 null；touch(time) 保存 time 并返回 this。构造时应转发所有参数给 Base，基类方法继续可用；各实例的 updatedAt 互不影响。',
    'function withTimestamp(Base){\n  // 在这里实现\n}',
    [['保留基类构造与方法','class Base{constructor(name){this.name=name}label(){return this.name}}const Enhanced=withTimestamp(Base);const x=new Enhanced("A");assert.equal(x.label(),"A");assert.equal(x.updatedAt,null);assert.ok(x instanceof Base)'],['实例隔离与链式调用','const Enhanced=withTimestamp(class{});const a=new Enhanced(),b=new Enhanced();assert.equal(a.touch(123),a);assert.equal(a.updatedAt,123);assert.equal(b.updatedAt,null)'],['转发多个参数','class Pair{constructor(a,b){this.total=a+b}}const Enhanced=withTimestamp(Pair);assert.equal(new Enhanced(2,3).total,5)']],
    ['返回 class extends Base。','构造器接收 ...args 并调用 super(...args)。','每个实例单独初始化 updatedAt。'],
    'function withTimestamp(Base){return class extends Base{constructor(...args){super(...args);this.updatedAt=null}touch(time){this.updatedAt=time;return this}};}',
    '类混入保留基类的构造和原型行为，同时为每个派生实例增加独立状态与方法。');

  code('try-catch-depth-03','try-catch','只为无效 JSON 提供回退','实现 parseJsonOr(text,fallback)：JSON.parse(text) 成功时返回解析值；只有 SyntaxError 时返回原样的 fallback；若 JSON.parse 过程中出现其他类型错误，应原样继续抛出。不要把合法的 null、0、false 当成失败。',
    'function parseJsonOr(text,fallback){\n  // 在这里实现\n}',
    [['合法假值','assert.equal(parseJsonOr("null","x"),null);assert.equal(parseJsonOr("0","x"),0);assert.equal(parseJsonOr("false","x"),false)'],['语法错误使用同一回退引用','const fallback={ok:false};assert.equal(parseJsonOr("{",fallback),fallback)'],['其他错误不能吞掉','const error=new TypeError("convert");const bad={toString(){throw error}};let caught;try{parseJsonOr(bad,null)}catch(e){caught=e}assert.equal(caught,error)']],
    ['在 try 中仅调用 JSON.parse。','catch 中判断 error instanceof SyntaxError。','其他错误用 throw error 重新抛出。'],
    'function parseJsonOr(text,fallback){try{return JSON.parse(text)}catch(error){if(error instanceof SyntaxError)return fallback;throw error}}',
    '仅把可预期的 JSON 语法失败映射为回退值；其他异常保留给调用方诊断，合法假值原样返回。');

  code('custom-errors-depth-03','custom-errors','带操作上下文的超时错误','实现 TimeoutError extends Error：构造参数 operation、elapsed、可选 cause；message 为 "{operation} 超时：{elapsed}ms"，name 为 "TimeoutError"，保存 operation、elapsed 和 cause。实现 ensureWithin(operation,elapsed,limit)：elapsed>limit 时抛 TimeoutError，否则返回 elapsed；输入保证为有限数字。',
    'class TimeoutError extends Error {\n  // 在这里实现\n}\nfunction ensureWithin(operation,elapsed,limit){\n  // 在这里实现\n}',
    [['正常与边界','assert.equal(ensureWithin("load",100,100),100);assert.equal(ensureWithin("load",99,100),99)'],['错误类型与上下文','let error;try{ensureWithin("load",120,100)}catch(e){error=e}assert.ok(error instanceof TimeoutError);assert.ok(error instanceof Error);assert.equal(error.name,"TimeoutError");assert.equal(error.operation,"load");assert.equal(error.elapsed,120);assert.equal(error.message,"load 超时：120ms")'],['原因保留','const root=Error("root");const e=new TimeoutError("save",50,root);assert.equal(e.cause,root)']],
    ['子类构造器先调用 super(message,{cause})。','设置 name、operation、elapsed。','ensureWithin 只在 elapsed 超过 limit 时抛出。'],
    'class TimeoutError extends Error{constructor(operation,elapsed,cause){super(operation+" 超时："+elapsed+"ms",{cause});this.name="TimeoutError";this.operation=operation;this.elapsed=elapsed}}function ensureWithin(operation,elapsed,limit){if(elapsed>limit)throw new TimeoutError(operation,elapsed);return elapsed}',
    '自定义 Error 保留标准错误原型和 cause，同时增加可处理的业务上下文；边界等于 limit 时仍通过。');
}
