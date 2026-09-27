export function addObjectDepthExercises({ choice, code }) {
  const cases = [
    ['object','属性存在与值为 undefined','config 有一个显式设置但值为 undefined 的 timeout 属性。哪种检查能准确区分“存在但值为 undefined”和“根本不存在”？','const config={timeout:undefined};',['Object.hasOwn(config,"timeout") 为 true；Object.hasOwn({},"timeout") 为 false','config.timeout !== undefined 为 true','Boolean(config.timeout) 为 true','config.timeout ?? 100 会保留 undefined'],['读取属性值无法区分缺失和显式 undefined。','需要检查对象自身是否拥有该键。','Object.hasOwn 不把原型链上的属性当作自有属性。'],'Object.hasOwn 检查自有属性是否存在，独立于属性值；显式 undefined 仍算存在。'],
    ['object','动态属性名必须使用方括号','key 为 "theme"，下面两个读取分别是什么？','const settings={theme:"dark",key:"literal"}; const key="theme";\nsettings[key]; settings.key;',['"dark" 与 "literal"','"literal" 与 "dark"','都为 "dark"','都为 undefined'],['方括号会计算 key 变量的值。','点号后是字面属性名 key。','对象恰好同时有 theme 与 key。'],'settings[key] 读取 settings.theme；settings.key 读取字面键 key。'],
    ['object-copy','Object.assign 的目标会被修改','期望保留原配置 base，下面写法会满足要求吗？','const base={mode:"light"};\nconst next=Object.assign(base,{mode:"dark"});',['不满足；next 与 base 是同一个对象，base.mode 也变为 dark','满足；Object.assign 总会返回新对象','满足；只有嵌套属性会被修改','不满足；Object.assign 会自动删除 mode'],['Object.assign 的第一个参数是目标。','返回值就是被修改的目标。','要新对象可用空对象作为目标。'],'Object.assign(base, ...) 原地修改 base 并返回它；不可变更新应把 {} 作为目标或使用展开。'],
    ['garbage-collection','弱引用缓存不保活键对象','用 WeakMap 以 DOM 节点为键保存附加信息。节点从页面移除后，所有其他强引用也消失。WeakMap 的键会阻止节点被回收吗？','',['不会；WeakMap 不因为键关系而使键对象保持可达','会；所有 Map 与 WeakMap 都强持有键','会；DOM 节点永远不会被回收','只有调用 clear() 才可能回收'],['WeakMap 的键是弱持有。','回收时机不由程序精确控制。','仍需确认没有其他强引用。'],'WeakMap 不因键关系而保活对象；若节点没有其他强引用，它可成为回收候选。'],
    ['garbage-collection','Map 的键会保持强引用','应用级 Map 以节点对象为键缓存信息。节点从页面移除，外部变量也清空，但 Map 仍可达。节点是否仍被 Map 保持？','',['是；Map 强持有键，需要删除记录或让 Map 本身不可达','否；Map 和 WeakMap 的键一样都是弱引用','否；remove() 会自动清除 Map 中的键','只有缓存值是对象时，键才会被保持'],['Map 与 WeakMap 的键引用语义不同。','Map 自身仍可从根访问。','通过 Map 仍能枚举并取得键。'],'可达 Map 会强持有其键，DOM 移除不自动清除缓存记录；可按需 delete 或改用合适的弱键缓存。'],
    ['garbage-collection','回收时机不能当作业务时钟','一个临时对象已经不可达。能否据此保证“下一毫秒内 GC 一定运行”，并把保存数据的操作放到回收回调里？','',['不能；回收与最终清理时机不可预测，关键保存逻辑要显式执行','能；失去最后引用后立即同步回收','能；setTimeout(...,0) 保证先回收再运行','能；只要对象小于 1KB 就会立即回收'],['不可达只表示具备回收资格。','运行时决定实际回收时机。','持久化关键业务不能依赖不确定的清理回调。'],'垃圾回收没有可用于业务逻辑的时间保证；保存与关闭资源应由明确流程完成。'],
    ['object-methods','call 指定接收者','把方法从对象取出后，通过 call 让它读取另一个对象的 name，结果是什么？','"use strict"; const a={name:"A",read(){return this.name}};\nconst fn=a.read; fn.call({name:"B"});',['"B"','"A"','undefined','抛 TypeError'],['call 的第一个参数指定本次调用的 this。','函数体通过 this.name 读取。','方法最初定义在哪个对象上不决定这次接收者。'],'fn.call({name:"B"}) 显式指定 this，返回 B。'],
    ['object-methods','箭头函数捕获外层方法的 this','obj.make() 返回一个箭头函数。把它放到 other.read 后调用，会读取哪个对象的 value？','const obj={value:2,make(){return ()=>this.value}};\nconst other={value:9,read:obj.make()}; other.read();',['2','9','undefined','抛 TypeError'],['箭头函数没有自己的 this。','它创建于 obj.make() 调用期间。','other.read() 不会改写其词法 this。'],'返回的箭头函数捕获 make 执行时的 this，即 obj。'],
    ['constructor-new','构造器返回原始值','用 new 调用构造器，但构造器显式 return 7。结果是什么？','function Box(){this.value=3;return 7;}\nconst box=new Box();',['box.value 为 3；原始返回值被忽略','box 等于数字 7','box 为 undefined','调用 new 时立即抛错'],['new 创建并绑定一个新对象。','显式返回对象才会替换默认实例。','返回原始值不会替换实例。'],'构造器返回原始值会被忽略，new 仍返回创建的实例，其中 value 为 3。'],
    ['constructor-new','更换 prototype 不追溯旧实例','先创建一个实例，再把构造器的 prototype 指向新对象。旧实例的原型会自动变成新对象吗？','function Item(){}; const first=new Item();\nItem.prototype={kind:"new"}; const second=new Item();',['不会；first 保留旧原型，second 使用新原型','会；所有实例自动更新到新原型','两个实例的原型都会变成 null','只有访问 first.kind 时才会更新'],['new 创建实例时设置原型链接。','之后重赋 Item.prototype 只影响后续创建。','已存在实例的原型引用不会被追溯替换。'],'first 在创建时连接旧原型，second 连接新原型；重赋构造器的 prototype 不会修改旧实例。'],
    ['constructor-new','new.target 区分调用形式','普通函数 Factory 想在忘写 new 时转成构造调用。函数内部哪种判断能区分两种调用形式？','',['if (!new.target) return new Factory(...arguments)','if (!this) 表示任何调用都没有接收者','if (Factory.prototype) 表示本次用了 new','if (arguments.length === 0) 表示本次没用 new'],['new.target 在构造调用时指向被调用的构造器。','普通调用时为 undefined。','this 或参数数量不是可靠判据。'],'new.target 可直接判断函数本次是否由 new 调用；普通调用时可显式补上构造调用。'],
    ['optional-chaining','可选链会跳过计算属性名','当 user 为 null，下面的 key() 会被调用吗？','const user=null; let calls=0; const key=()=>{calls++;return "name"};\nconst value=user?.[key()];',['不会，calls 仍为 0，value 为 undefined','会，calls 为 1，value 为 undefined','会，随后抛 TypeError','不会，但 value 为 null'],['?. 左侧为空值时会短路整个后续成员访问。','计算属性名属于该成员访问的一部分。','短路结果是 undefined。'],'user 为 null 时可选链短路，key() 不执行，整个表达式值为 undefined。'],
    ['optional-chaining','可选调用只保护空值','callback 是字符串 "done"，执行 callback?.() 会怎样？','const callback="done"; callback?.();',['抛 TypeError，因为非空值并非可调用函数','静默返回 undefined','返回字符串 "done"','把字符串自动转为函数并调用'],['?.() 只检查 null 与 undefined。','非空值仍必须可调用。','类型不符合要求时照常抛错。'],'可选调用只在值为空时跳过；字符串不是函数，因此会抛 TypeError。'],
    ['symbol','全局符号注册表的复用','同一网页中的两段代码都调用 Symbol.for("shared-key")。这两个 Symbol 比较结果是什么？','',['相等；Symbol.for 通过全局注册表复用同名键','不相等；所有 Symbol 调用都创建新值','相等；因为 description 相同，即使都用 Symbol() 也相等','会抛错；Symbol.for 只能调用一次'],['Symbol() 与 Symbol.for() 的机制不同。','Symbol.for 先查注册表。','相同注册键取得同一个符号。'],'Symbol.for("shared-key") 两次取得同一注册符号，所以严格相等。'],
    ['symbol','JSON 序列化不会包含 Symbol 键','对象有字符串键和 Symbol 键。JSON.stringify 通常输出什么？','const s=Symbol("secret"); const data={id:1,[s]:2};\nJSON.stringify(data);',['"{\\"id\\":1}"','"{\\"id\\":1,\\"Symbol(secret)\\":2}"','"{\\"id\\":1,\\"secret\\":2}"','undefined'],['JSON 只包含符合规则的字符串键。','Symbol 键不会自动转成描述文本。','id 是普通可枚举字符串键。'],'JSON.stringify 会忽略 Symbol 键，保留 id。'],
    ['symbol','Symbol 作为属性值的序列化','对象的普通字符串键 id 的值是 Symbol。JSON.stringify 后是什么？','const data={id:Symbol("x"),ok:true};\nJSON.stringify(data);',['"{\\"ok\\":true}"','"{\\"id\\":null,\\"ok\\":true}"','"{\\"id\\":\\"Symbol(x)\\",\\"ok\\":true}"','抛 TypeError'],['Symbol 作为对象属性值时，该属性会被忽略。','它不会自动转换成 description。','ok 仍是可序列化的布尔值。'],'JSON.stringify 遇到对象属性值为 Symbol 会省略该属性，输出只含 ok 的对象。'],
    ['object-toprimitive','普通对象的 valueOf 仍返回对象','对象未定义 Symbol.toPrimitive，valueOf 返回对象，toString 返回 "7"。Number(obj) 的结果是什么？','const obj={valueOf(){return this},toString(){return "7"}};\nNumber(obj);',['7','NaN','"7"','抛 TypeError'],['Number 需要原始值。','valueOf 返回对象，不满足。','之后可尝试 toString 返回的字符串。'],'数值转换先尝试 valueOf；它仍返回对象，于是尝试 toString 得到 "7"，再转换为数字 7。'],
    ['object-toprimitive','Symbol.toPrimitive 必须返回原始值','自定义 Symbol.toPrimitive 却返回对象。执行 String(item) 会发生什么？','const item={[Symbol.toPrimitive](){return {x:1}}};\nString(item);',['抛 TypeError','输出 "[object Object]"','输出 "{x:1}"','输出 undefined'],['该钩子负责给出最终原始值。','返回对象不满足原始值要求。','引擎不会忽略该钩子再尝试其他方法。'],'Symbol.toPrimitive 返回对象违反转换契约，直接抛 TypeError。']
  ];
  const indexes=new Map();
  for (const [lessonId,title,prompt,example,options,hints,explanation] of cases) {
    const index=(indexes.get(lessonId)||0)+1;
    indexes.set(lessonId,index);
    choice(`${lessonId}-depth-${String(index).padStart(2,'0')}`,lessonId,title,prompt,example,options,0,hints,explanation);
  }

  code('object-depth-03','object','根据运行时字段名构建记录','实现 pickField(source,key)：若 source 自身拥有 key 属性，返回只包含该键及对应值的新对象；否则返回空对象。key 可能含空格或为 Symbol，不能修改 source。',
    'function pickField(source,key){\n  // 在这里实现\n}',
    [['动态字符串键','assert.deepEqual(pickField({"display name":"Lin"},"display name"),{"display name":"Lin"})'],['显式 undefined 与缺失','const a=pickField({x:undefined},"x");assert.equal(Object.hasOwn(a,"x"),true);assert.deepEqual(pickField({},"x"),{})'],['Symbol 与原型属性','const s=Symbol("s");const a=pickField({[s]:3},s);assert.equal(a[s],3);assert.equal(Object.hasOwn(a,s),true);assert.deepEqual(pickField({},"toString"),{})']],
    ['先用 Object.hasOwn 检查自有属性。','计算属性名可写为 { [key]: source[key] }。','不要把 undefined 值误判为缺失。'],
    'function pickField(source,key){return Object.hasOwn(source,key)?{[key]:source[key]}:{};}',
    'Object.hasOwn 区分缺失与值为 undefined；计算属性名允许动态字符串和 Symbol 键。');

  code('object-copy-depth-02','object-copy','复制会被修改的数组和对象','实现 addTag(profile,tag)：返回新 profile，新 tags 数组在末尾追加 tag；原 profile 和原 tags 不变。未修改的 settings 对象应沿用原引用。',
    'function addTag(profile,tag){\n  // 在这里实现\n}',
    [['追加和独立性','const p={tags:["js"],settings:{theme:"dark"}};const n=addTag(p,"css");assert.deepEqual(n.tags,["js","css"]);assert.deepEqual(p.tags,["js"]);assert.ok(n!==p);assert.ok(n.tags!==p.tags)'],['未变部分共享','const p={tags:[],settings:{theme:"light"}};const n=addTag(p,"a");assert.ok(n.settings===p.settings)'],['保留其他字段','const p={id:2,tags:["a"],settings:{}};const n=addTag(p,"b");assert.equal(n.id,2)']],
    ['复制外层 profile。','tags 是要修改的路径，也要复制并追加。','settings 未变，可以共享原引用。'],
    'function addTag(profile,tag){return {...profile,tags:[...profile.tags,tag]};}',
    '只复制变化路径上的外层对象和 tags 数组；settings 保持共享，输入不被修改。');

  code('object-methods-depth-03','object-methods','在回调中固定 this 但读取新数据','实现 makeReader(store)：返回一个无参数函数，不论之后如何被调用，都返回 store.current；若 store.current 后来变化，也应读到新值。要求使用 bind 绑定方法。',
    'function makeReader(store){\n  // 在这里实现\n}',
    [['固定上下文','const s={current:2};const fn=makeReader(s);assert.equal(fn(),2);assert.equal(({current:99,fn}).fn(),2)'],['后续变化','const s={current:2};const fn=makeReader(s);s.current=7;assert.equal(fn(),7)']],
    ['定义普通函数读取 this.current。','通过 .bind(store) 返回固定接收者的新函数。','不要在创建时把 current 的值复制出来。'],
    'function makeReader(store){function read(){return this.current}return read.bind(store);}',
    'bind 固定函数调用时的 this 为 store；每次执行仍读取 store.current 的最新值。');

  code('optional-chaining-depth-03','optional-chaining','安全读取嵌套联系人','实现 primaryEmail(user)：返回 user.profile.contacts[0].email；沿途任一对象或数组不存在，或没有首个联系人时返回 null。空字符串 email 是有效值，必须保留。',
    'function primaryEmail(user){\n  // 在这里实现\n}',
    [['正常与空文本','assert.equal(primaryEmail({profile:{contacts:[{email:"a@b"}]}}),"a@b");assert.equal(primaryEmail({profile:{contacts:[{email:""}]}}),"")'],['缺失路径','assert.equal(primaryEmail(null),null);assert.equal(primaryEmail({}),null);assert.equal(primaryEmail({profile:{contacts:[]}}),null)'],['显式 null','assert.equal(primaryEmail({profile:{contacts:[{email:null}]}}),null)']],
    ['每个可能为空的路径节点后使用 ?.。','最后用 ?? null 把缺失结果归一化。','不要用 || null，否则会吞掉空字符串。'],
    'function primaryEmail(user){return user?.profile?.contacts?.[0]?.email ?? null;}',
    '可选链保护每段可能缺失的路径；?? 仅把 null/undefined 转为 null，保留空字符串。');

  code('object-toprimitive-depth-03','object-toprimitive','阻止票号被当作数字计算','实现 makeTicket(code)：返回对象。String(ticket) 与模板字符串插值应得到 "T-{code}"，但 Number(ticket) 和一元 +ticket 必须抛出 TypeError；ticket + "!" 应得到 "T-{code}!"。使用 Symbol.toPrimitive。',
    'function makeTicket(code){\n  // 在这里实现\n}',
    [['字符串展示','const t=makeTicket(12);assert.equal(String(t),"T-12");assert.equal(`${t}`,"T-12")'],['拒绝数字转换','const t=makeTicket(12);for(const read of [()=>Number(t),()=>+t]){let error;try{read()}catch(e){error=e}assert.ok(error instanceof TypeError)}'],['默认提示可拼接','assert.equal(makeTicket(12)+"!","T-12!")']],
    ['Symbol.toPrimitive 会收到 hint。','number 提示时明确抛出 TypeError。','string 和 default 提示返回带前缀的字符串。'],
    'function makeTicket(code){return {[Symbol.toPrimitive](hint){if(hint==="number")throw new TypeError("票号不是数字");return "T-"+code}};}',
    '票号虽包含数字字符，仍不是用于算术的数字。转换钩子区分 number 与 string/default 提示，防止意外计算。');
}
