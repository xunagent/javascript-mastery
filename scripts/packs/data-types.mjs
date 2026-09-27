export function addDataTypeExercises({ code, choice }) {
  choice('primitives-methods-01','primitives-methods','原始值的方法调用',
    '判断输出与错误。',
    'const text = "js";\nconsole.log(text.toUpperCase(), typeof text);\nconst value = null;\nvalue.toString();',
    ['先输出 JS string，随后抛出 TypeError','先输出 JS object，随后输出 null','第一行就抛出 TypeError','先输出 js string，随后抛出 TypeError'],0,
    ['字符串原始值能调用方法。','方法调用不会永久改变 text 的类型。','null 不能像字符串那样使用方法。'],
    '字符串原始值可调用方法，但 text 仍是 string；在 null 上读取 toString 会抛出 TypeError。');

  code('primitives-methods-02','primitives-methods','避免调用缺失值的方法',
    '实现 normalizedName(value)：value 可能是字符串、null 或 undefined。字符串去除首尾空格并转成大写；缺失值返回 "匿名"。保留空字符串转换后的结果。',
    'function normalizedName(value) {\n  // 在这里实现\n}',
    [['正常字符串','assert.equal(normalizedName(" lin "),"LIN")'],['缺失值','assert.equal(normalizedName(null),"匿名");assert.equal(normalizedName(undefined),"匿名")'],['空白字符串','assert.equal(normalizedName("  "),"")']],
    ['先判断 null 或 undefined，再调用字符串方法。','?? 只处理这两种缺失值。','可写成 (value ?? "匿名").trim().toUpperCase()，但要注意“匿名”也会变成大写；所以先返回缺失值。'],
    'function normalizedName(value) {\n  if (value == null) return "匿名";\n  return value.trim().toUpperCase();\n}',
    'null 与 undefined 不能直接调用字符串方法。先处理缺失值，随后对真实字符串做转换。');

  code('number-01','number','解析严格的小数输入',
    '实现 parseAmount(text)：只接受可选负号、整数部分和可选小数部分的十进制字符串；允许首尾空格。非法格式或非有限结果返回 null。有效时返回 Number。比如 "12.5" 有效，"12元"、".5"、"1e3" 无效。',
    'function parseAmount(text) {\n  // 在这里实现\n}',
    [['合法数字','assert.equal(parseAmount(" -12.5 "),-12.5);assert.equal(parseAmount("0"),0)'],['拒绝部分解析','assert.equal(parseAmount("12元"),null);assert.equal(parseAmount(".5"),null);assert.equal(parseAmount("1e3"),null)'],['拒绝空与巨大值','assert.equal(parseAmount("  "),null);assert.equal(parseAmount("9".repeat(400)),null)']],
    ['parseFloat 会接受前缀数字，不能直接使用。','先用正则限制整个字符串。','通过 Number.isFinite 检查转换结果。'],
    'function parseAmount(text) {\n  const value=text.trim();\n  if (!/^-?\\d+(?:\\.\\d+)?$/.test(value)) return null;\n  const number=Number(value);\n  return Number.isFinite(number) ? number : null;\n}',
    '先校验完整输入，再转换为数字。parseFloat("12元") 会返回 12，与本题要求不符。');

  choice('number-02','number','浮点数不能直接比较的场景',
    '判断输出及原因。',
    'console.log(0.1 + 0.2 === 0.3);',
    ['true，因为加法遵循十进制','false，因为二进制浮点表示存在舍入误差','false，因为 === 不比较数字','抛出 RangeError'],1,
    ['JavaScript 普通数字使用二进制浮点格式。','0.1 和 0.2 无法精确表示。','结果不是精确的 0.3。'],
    '结果为 false。普通 Number 的二进制浮点表示无法精确存储这些十进制小数，计算会有微小误差。');

  code('string-01','string','按 Unicode 字符截取',
    '实现 firstCharacters(text, count)：按 Unicode 码点截取前 count 个字符，而不是按 UTF-16 代码单元截取。count 为非负整数。',
    'function firstCharacters(text, count) {\n  // 在这里实现\n}',
    [['普通字符','assert.equal(firstCharacters("JavaScript",4),"Java")'],['表情字符不拆开','assert.equal(firstCharacters("😀好A",2),"😀好")'],['零与超出','assert.equal(firstCharacters("你好",0),"");assert.equal(firstCharacters("你好",9),"你好")']],
    ['String.slice 按 UTF-16 代码单元操作。','字符串是可迭代的，迭代单位是码点。','Array.from(text).slice(0,count).join("")。'],
    'function firstCharacters(text, count) {\n  return Array.from(text).slice(0,count).join("");\n}',
    'Array.from 按字符串迭代器产生码点，避免把代理对中的表情字符切成两半。组合字符仍可能由多个码点组成。');

  code('string-02','string','不区分重音的前缀搜索',
    '实现 startsWithFolded(text, prefix)：大小写和组合重音不敏感。例如 "Café" 匹配 "cafe"，"Cafe\u0301" 匹配 "CAFÉ"。只需处理拉丁字符与组合重音。',
    'function startsWithFolded(text, prefix) {\n  // 在这里实现\n}',
    [['大小写','assert.equal(startsWithFolded("JavaScript","java"),true)'],['组合重音','assert.equal(startsWithFolded("Café","cafe"),true);assert.equal(startsWithFolded("Cafe\u0301","CAFÉ"),true)'],['错误前缀','assert.equal(startsWithFolded("Café","tea"),false)']],
    ['先标准化字符串，再比较。','NFD 分解预组合重音字符。','删除组合标记并转小写后调用 startsWith。'],
    'function startsWithFolded(text, prefix) {\n  const fold=s=>s.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase();\n  return fold(text).startsWith(fold(prefix));\n}',
    'NFD 将重音字符拆开，再去除组合标记并折叠大小写。题目限定拉丁字符，以免误称适用于所有文字。','稍有难度');

  code('array-01','array','删除空值但保留有效假值',
    '实现 compactPresent(values)：返回新数组，只删除 null 和 undefined；保留 0、false、空字符串和 NaN，且不修改输入。',
    'function compactPresent(values) {\n  // 在这里实现\n}',
    [['保留假值','const r=compactPresent([0,false,"",NaN,null,undefined]);assert.equal(r.length,4);assert.equal(r[0],0);assert.equal(r[1],false);assert.equal(r[2],"");assert.ok(Number.isNaN(r[3]))'],['空数组','assert.deepEqual(compactPresent([]),[])'],['不修改输入','const x=[null,1];compactPresent(x);assert.equal(x.length,2)']],
    ['filter(Boolean) 会误删哪些值？','只把 null 和 undefined 视为缺失。','使用 value != null。'],
    'function compactPresent(values) {\n  return values.filter(value => value != null);\n}',
    'value != null 同时排除 null 和 undefined；它不会删除 0、false、空字符串和 NaN。');

  choice('array-02','array','length 与数组空位',
    '判断两个值。',
    'const values = [1, 2, 3];\nvalues.length = 5;\nconsole.log(values.length, 3 in values);',
    ['5、true','5、false','3、false','抛出 RangeError'],1,
    ['增大 length 会创建值为 undefined 的实际元素吗？','in 检查索引属性是否存在。','新增位置是空位，没有索引 3 属性。'],
    'length 变为 5，但索引 3 和 4 是空位，不是显式存储的 undefined，因此 3 in values 为 false。');

  code('iterable-01','iterable','让数字范围支持 for...of',
    '实现 range(start, end)：返回可迭代对象，for...of 依次产生 start 到 end 的整数（包含两端）。start 大于 end 时为空。每次迭代都应从头开始。',
    'function range(start, end) {\n  // 在这里实现\n}',
    [['包含端点','assert.deepEqual([...range(2,4)],[2,3,4])'],['空范围','assert.deepEqual([...range(5,2)],[])'],['重复迭代','const r=range(1,2);assert.deepEqual([...r],[1,2]);assert.deepEqual([...r],[1,2])']],
    ['对象需要实现 Symbol.iterator。','每次调用迭代器方法都要创建新的状态。','可在 Symbol.iterator 方法中返回一个 generator。'],
    'function range(start, end) {\n  return { *[Symbol.iterator]() { for(let n=start;n<=end;n++) yield n; } };\n}',
    'Symbol.iterator 每次调用都会创建新的 generator，因此同一个范围对象可以反复遍历。','稍有难度');

  choice('iterable-02','iterable','可迭代和类数组不同',
    '哪个对象可以直接用于 for...of？',
    'const a = {0:"x",1:"y",length:2};\nconst b = {0:"x",1:"y",length:2,[Symbol.iterator]:Array.prototype[Symbol.iterator]};',
    ['只有 a','只有 b','a 与 b 都可以','a 与 b 都不可以'],1,
    ['for...of 查找哪个协议？','有 length 不等于实现迭代器。','b 有 Symbol.iterator。'],
    'b 实现了 Symbol.iterator，可以直接被 for...of 遍历；a 只是类数组对象。');

  code('weakmap-weakset-01','weakmap-weakset','按对象身份缓存昂贵计算',
    '实现 memoByObject(compute)：返回包装函数。相同对象参数只计算一次，后续返回缓存结果；不同对象即使内容相同也分别计算。允许 compute 返回 undefined。',
    'function memoByObject(compute) {\n  // 在这里实现\n}',
    [['相同对象缓存','let calls=0;const m=memoByObject(x=>{calls++;return x.n*2});const x={n:2};assert.equal(m(x),4);assert.equal(m(x),4);assert.equal(calls,1)'],['不同身份分别计算','let calls=0;const m=memoByObject(x=>{calls++;return x.n});m({n:1});m({n:1});assert.equal(calls,2)'],['undefined 也缓存','let calls=0;const m=memoByObject(()=>{calls++});const x={};m(x);m(x);assert.equal(calls,1)']],
    ['对象引用可以作为 WeakMap 的键。','缓存值为 undefined 不能代表“未缓存”。','先用 has 检查，再用 get 读取。'],
    'function memoByObject(compute) {\n  const cache=new WeakMap();\n  return function(obj) {\n    if(cache.has(obj)) return cache.get(obj);\n    const result=compute(obj);\n    cache.set(obj,result);\n    return result;\n  };\n}',
    'WeakMap 按对象身份存取缓存，has 与 get 分开处理，避免 undefined 结果被反复计算。');

  choice('weakmap-weakset-02','weakmap-weakset','弱集合能做什么',
    '选择关于 WeakSet 最准确的描述。',
    'const seen = new WeakSet();\nconst item = {};\nseen.add(item);',
    ['可以用 [...seen] 列出全部对象','可以检查 seen.has(item)，但不能枚举全部成员','可以把字符串直接加入 WeakSet','WeakSet 会阻止 item 被垃圾回收'],1,
    ['WeakSet 的成员是否可枚举？','弱引用集合主要用于跟踪对象。','可以检查特定对象，却不能列出所有成员。'],
    'WeakSet 可用于记录对象是否见过，但不提供遍历全部成员的方法；弱持有也不应被当作阻止回收的强引用。');

  code('keys-values-entries-01','keys-values-entries','把对象数据转换为查询参数',
    '实现 toQuery(data)：按 Object.entries(data) 的顺序，忽略值为 null 或 undefined 的项，将其余项转换为 URLSearchParams 字符串。0 与空字符串要保留。',
    'function toQuery(data) {\n  // 在这里实现\n}',
    [['编码与顺序','assert.equal(toQuery({q:"a b",page:2}),"q=a+b&page=2")'],['跳过缺失值','assert.equal(toQuery({a:null,b:undefined,c:0,d:""}),"c=0&d=")'],['空对象','assert.equal(toQuery({}),"")']],
    ['Object.entries 提供键值对。','过滤时不要把 0 和空字符串删掉。','把剩余的键值对传给 URLSearchParams。'],
    'function toQuery(data) {\n  const entries=Object.entries(data).filter(([,value])=>value!=null);\n  return new URLSearchParams(entries).toString();\n}',
    'Object.entries 保持属性的原生枚举顺序；URLSearchParams 负责正确编码空格和特殊字符。');

  choice('keys-values-entries-02','keys-values-entries','Object.keys 会看到哪些属性',
    '判断 Object.keys(value) 的结果。',
    'const proto = { inherited: 1 };\nconst value = Object.create(proto);\nvalue.own = 2;\nObject.defineProperty(value, "hidden", { value: 3, enumerable: false });\nconsole.log(Object.keys(value));',
    ['["inherited", "own", "hidden"]','["own", "hidden"]','["own"]','[]'],2,
    ['Object.keys 是否包含继承属性？','不可枚举属性会出现吗？','只有对象自身可枚举的字符串键。'],
    'Object.keys 只包含自身、可枚举、字符串类型的键，因此只有 own。');

  code('date-01','date','按 UTC 日期分组事件',
    '实现 groupByUtcDay(events)：每项有 ISO 时间字符串 at。返回对象，键为 YYYY-MM-DD（UTC 日期），值为原事件组成的数组；保留输入顺序，不修改事件。',
    'function groupByUtcDay(events) {\n  // 在这里实现\n}',
    [['跨时区边界','const a={at:"2025-01-01T23:30:00-02:00"};const b={at:"2025-01-02T05:00:00Z"};const r=groupByUtcDay([a,b]);assert.equal(r["2025-01-02"].length,2)'],['多日','const r=groupByUtcDay([{at:"2025-01-01T00:00:00Z"},{at:"2025-01-02T00:00:00Z"}]);assert.equal(Object.keys(r).length,2)'],['空输入','assert.deepEqual(groupByUtcDay([]),{})']],
    ['字符串上的日期前缀可能是本地偏移日期，不一定是 UTC 日期。','先用 Date 解析，再输出 UTC 格式。','new Date(at).toISOString().slice(0,10)。'],
    'function groupByUtcDay(events) {\n  const result={};\n  for(const event of events) {\n    const day=new Date(event.at).toISOString().slice(0,10);\n    (result[day] ??= []).push(event);\n  }\n  return result;\n}',
    'toISOString 输出 UTC 时间，取前十个字符得到 UTC 日期。不能直接截取输入字符串，因为其中可能带时区偏移。');

  choice('date-02','date','毫秒时间戳的比较',
    '判断结果。',
    'const a = new Date("2025-01-01T00:00:00Z");\nconst b = new Date("2024-12-31T19:00:00-05:00");\nconsole.log(a.getTime() === b.getTime());',
    ['true','false','取决于用户的本地时区','抛出 Invalid Date'],0,
    ['两个字符串表示的是否是同一个瞬间？','-05:00 表示当地时间比 UTC 慢五小时。','19:00-05:00 对应次日 00:00Z。'],
    '两者表示同一个 UTC 瞬间，getTime 都返回相同的毫秒时间戳；比较结果不依赖浏览器本地时区。');
}
