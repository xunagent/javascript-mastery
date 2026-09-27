export function addObjectModelDepthCodeExercises({ code }) {
  code('property-descriptors-depth-03','property-descriptors','按完整描述符复制对象','实现 cloneDescriptors(source)：返回新对象，原型与 source 相同，所有自有属性（含 Symbol 和不可枚举属性）的 value/get/set 以及标志都保留。复制过程不能执行 getter；不复制继承来的属性。',
    'function cloneDescriptors(source){\n  // 在这里实现\n}',
    [['标志与独立对象','const source={};Object.defineProperty(source,"id",{value:7,writable:false,enumerable:false,configurable:false});const copy=cloneDescriptors(source);assert.ok(copy!==source);assert.deepEqual(Object.getOwnPropertyDescriptor(copy,"id"),Object.getOwnPropertyDescriptor(source,"id"))'],['不触发 getter且保留 Symbol','let reads=0;const s=Symbol("s");const source={[s]:3};Object.defineProperty(source,"x",{get(){reads++;return 1},enumerable:true});const copy=cloneDescriptors(source);assert.equal(reads,0);assert.equal(copy[s],3);assert.equal(typeof Object.getOwnPropertyDescriptor(copy,"x").get,"function")'],['原型不变但不复制继承属性','const base={parent:true};const source=Object.create(base);source.own=2;const copy=cloneDescriptors(source);assert.equal(Object.getPrototypeOf(copy),base);assert.equal(Object.hasOwn(copy,"parent"),false);assert.equal(copy.own,2)']],
    ['Object.getOwnPropertyDescriptors 返回全部自有属性描述符。','Object.create(Object.getPrototypeOf(source)) 保留原型。','Object.defineProperties 在新对象上批量定义属性。'],
    'function cloneDescriptors(source){return Object.defineProperties(Object.create(Object.getPrototypeOf(source)),Object.getOwnPropertyDescriptors(source));}',
    '描述符复制保留 getter、setter、Symbol 键和标志，且读取描述符不会执行 getter；新对象沿用原型。','稍有难度');

  code('property-accessors-depth-03','property-accessors','双向同步姓名访问器','实现 createPerson(first,last)：返回含 first、last 和可枚举访问器 fullName 的对象。读取 fullName 返回两段姓名用空格连接；设置 fullName 时，去除首尾空白并按连续空白拆分，必须恰好得到两段非空文本，否则抛 RangeError，且不修改原 first/last。',
    'function createPerson(first,last){\n  // 在这里实现\n}',
    [['读取最新字段','const p=createPerson("Lin","Yu");assert.equal(p.fullName,"Lin Yu");p.first="Q";assert.equal(p.fullName,"Q Yu")'],['设置与可枚举','const p=createPerson("A","B");p.fullName="  Chen   Li  ";assert.equal(p.first,"Chen");assert.equal(p.last,"Li");assert.ok(Object.keys(p).includes("fullName"))'],['失败不改变状态','const p=createPerson("A","B");for(const value of ["Only","A B C","   "])assert.throws(()=>{p.fullName=value});assert.equal(p.fullName,"A B")']],
    ['用 getter 在读取时计算当前 first、last。','setter 先解析并验证文本，再一次性更新两个字段。','对象字面量的 get/set 属性默认可枚举。'],
    'function createPerson(first,last){return {first,last,get fullName(){return this.first+" "+this.last},set fullName(value){const parts=value.trim().split(/\\s+/);if(parts.length!==2||parts.some(part=>part===""))throw new RangeError("姓名需两段");this.first=parts[0];this.last=parts[1]}};}',
    'getter 实时组合当前字段；setter 先验证完整输入，再写入两个字段，避免无效输入造成部分更新。');

  code('prototype-inheritance-depth-03','prototype-inheritance','找出属性实际归属的对象','实现 ownerOf(obj,key)：沿 obj 的原型链向上查找，返回第一个自己拥有 key 的对象；若整个链都没有该属性返回 null。key 可为字符串或 Symbol，obj 保证为对象。',
    'function ownerOf(obj,key){\n  // 在这里实现\n}',
    [['继承与遮蔽','const base={x:1};const child=Object.create(base);assert.equal(ownerOf(child,"x"),base);child.x=2;assert.equal(ownerOf(child,"x"),child)'],['Symbol 与缺失','const s=Symbol("s"),base={[s]:3},child=Object.create(base);assert.equal(ownerOf(child,s),base);assert.equal(ownerOf(child,"missing"),null)'],['无原型对象','const dict=Object.create(null);dict.x=1;assert.equal(ownerOf(dict,"x"),dict);assert.equal(ownerOf(dict,"y"),null)']],
    ['从 obj 开始循环。','每层用 Object.hasOwn 检查，不要只比较 value 是否为 undefined。','用 Object.getPrototypeOf 走到 null。'],
    'function ownerOf(obj,key){for(let current=obj;current!==null;current=Object.getPrototypeOf(current))if(Object.hasOwn(current,key))return current;return null;}',
    '属性查找从对象自身向上逐层进行；Object.hasOwn 可正确处理值为 undefined、Symbol 键和无原型对象。');

  code('function-prototype-depth-03','function-prototype','给现有与未来实例添加共享方法','实现 installMethod(Ctor,name,fn)：在 Ctor.prototype 上定义不可枚举、可写、可配置的方法 name，返回 Ctor。不能替换 Ctor.prototype 对象；调用已有实例或新实例都应找到同一函数。name 可以是 Symbol。',
    'function installMethod(Ctor,name,fn){\n  // 在这里实现\n}',
    [['共享给旧实例与新实例','function Item(v){this.v=v}const old=new Item();const proto=Item.prototype;const read=function(){return this.v};installMethod(Item,"read",read);const fresh=new Item(5);old.v=2;assert.equal(old.read(),2);assert.equal(fresh.read(),5);assert.equal(old.read,fresh.read);assert.equal(Item.prototype,proto)'],['属性描述符','function Item(){}const fn=()=>1;assert.equal(installMethod(Item,"run",fn),Item);const d=Object.getOwnPropertyDescriptor(Item.prototype,"run");assert.equal(d.value,fn);assert.equal(d.enumerable,false);assert.equal(d.writable,true);assert.equal(d.configurable,true)'],['Symbol 名','function Item(){}const s=Symbol("m");installMethod(Item,s,function(){return 7});assert.equal(new Item()[s](),7)']],
    ['保留原来的 Ctor.prototype 引用。','在该对象上用 Object.defineProperty 定义属性。','显式设置 enumerable:false、writable:true、configurable:true。'],
    'function installMethod(Ctor,name,fn){Object.defineProperty(Ctor.prototype,name,{value:fn,writable:true,configurable:true,enumerable:false});return Ctor;}',
    '修改同一个原型对象，旧实例与新实例都能沿原型链找到方法；描述符让方法不进入常规枚举。');

  code('native-prototypes-depth-03','native-prototypes','借用数组方法复制类数组','实现 toArrayLike(value)：用 Array.prototype.slice.call 把带 length 和数字索引的类数组复制为真正数组。输入可能是 arguments 或普通类数组；不能修改输入。',
    'function toArrayLike(value){\n  // 在这里实现\n}',
    [['普通类数组','const source={0:"a",1:"b",length:2};const result=toArrayLike(source);assert.deepEqual(result,["a","b"]);assert.ok(Array.isArray(result));assert.equal(source.length,2)'],['arguments 对象','function collect(){return toArrayLike(arguments)}assert.deepEqual(collect(1,2,3),[1,2,3])'],['空类数组','assert.deepEqual(toArrayLike({length:0}),[])']],
    ['slice 是 Array.prototype 上的通用方法。','call 可以把类数组对象设为 this。','空参数等同于从头复制。'],
    'function toArrayLike(value){return Array.prototype.slice.call(value);}',
    '借用原生数组方法按 length 和数字索引读取类数组，结果是真正的数组，不改变原对象。');

  code('prototype-methods-depth-03','prototype-methods','列出原型链直到 null','实现 prototypeChain(obj)：返回数组，从 obj 的直接原型开始，依次包含更上层原型，直到但不包含 null；不要把 obj 本身放入结果。输入保证为对象。',
    'function prototypeChain(obj){\n  // 在这里实现\n}',
    [['自定义链','const base=Object.create(null);const middle=Object.create(base);const item=Object.create(middle);assert.deepEqual(prototypeChain(item),[middle,base])'],['普通对象与无原型对象','assert.deepEqual(prototypeChain({}),[Object.prototype]);assert.deepEqual(prototypeChain(Object.create(null)),[])'],['不修改对象','const base={},item=Object.create(base);prototypeChain(item);assert.equal(Object.getPrototypeOf(item),base)']],
    ['从 Object.getPrototypeOf(obj) 开始。','每次把非 null 原型放入结果。','继续向上读取，直到 null。'],
    'function prototypeChain(obj){const result=[];for(let current=Object.getPrototypeOf(obj);current!==null;current=Object.getPrototypeOf(current))result.push(current);return result;}',
    '原型链可逐层用 Object.getPrototypeOf 遍历，null 是终点；结果不包含原对象。');
}
