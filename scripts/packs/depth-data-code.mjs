export function addDataDepthCodeExercises({ code }) {
  code('primitives-methods-depth-03','primitives-methods','安全调用字符串方法','实现 upperText(value)：字符串原始值和 String 包装对象都返回其大写原始字符串；其他值（含 null、undefined）返回 null。不能把数字先转成字符串。',
    'function upperText(value){\n  // 在这里实现\n}',
    [['原始字符串','assert.equal(upperText("ab"),"AB");assert.equal(upperText(""),"")'],['包装对象','const r=upperText(new String("MiX"));assert.equal(r,"MIX");assert.equal(typeof r,"string")'],['拒绝其他值','assert.equal(upperText(null),null);assert.equal(upperText(undefined),null);assert.equal(upperText(12),null)']],
    ['先识别 typeof value 为 string 或 value instanceof String。','包装对象可通过 value.valueOf() 取原始字符串。','只对确认是字符串的值调用 toUpperCase。'],
    'function upperText(value){if(typeof value==="string")return value.toUpperCase();if(value instanceof String)return value.valueOf().toUpperCase();return null;}',
    '原始字符串可直接使用方法；String 包装对象先拆箱。类型检查让 null、数字等输入不会被误转换。');

  code('number-depth-03','number','用整数分构造金额文本','实现 formatCents(cents)：仅接受非负安全整数，返回固定两位小数的金额字符串，例如 5 → "0.05"、123 → "1.23"。非法输入返回 null。不要先把金额转换为浮点数再做小数舍入。',
    'function formatCents(cents){\n  // 在这里实现\n}',
    [['两位补零','assert.equal(formatCents(0),"0.00");assert.equal(formatCents(5),"0.05");assert.equal(formatCents(123),"1.23")'],['跨元边界','assert.equal(formatCents(100),"1.00");assert.equal(formatCents(12345),"123.45")'],['非法输入','assert.equal(formatCents(-1),null);assert.equal(formatCents(1.5),null);assert.equal(formatCents("5"),null);assert.equal(formatCents(Number.MAX_SAFE_INTEGER+1),null)']],
    ['先用 Number.isSafeInteger 验证。','整数除以 100 的商给出元，余数给出分。','余数转字符串并 padStart(2,"0")。'],
    'function formatCents(cents){if(!Number.isSafeInteger(cents)||cents<0)return null;return String(Math.floor(cents/100))+"."+String(cents%100).padStart(2,"0");}',
    '金额在整数分中保持精确；商和余数组装字符串，避免浮点金额相加与舍入问题。');

  code('string-depth-03','string','跨平台拆分并清理非空行','实现 cleanLines(text)：同时识别 CRLF、CR 和 LF 换行；每行去除首尾空白；丢弃清理后的空行，返回新数组。输入保证为字符串。',
    'function cleanLines(text){\n  // 在这里实现\n}',
    [['多种换行','assert.deepEqual(cleanLines(" a\\r\\n b\\rc\\n"),["a","b","c"])'],['空白行','assert.deepEqual(cleanLines(" \\n A \\n\\t\\nB "),["A","B"])'],['空输入','assert.deepEqual(cleanLines(""),[])']],
    ['先用适当的正则拆分三种换行。','map 对每行 trim。','filter 去掉空字符串。'],
    'function cleanLines(text){return text.split(/\\r\\n|\\r|\\n/).map(line=>line.trim()).filter(line=>line!=="");}',
    '换行在不同来源可能使用不同表示；拆分后清理、过滤，保留原始非空行顺序。');

  code('array-depth-03','array','删除指定位置并保留原数组','实现 removeAt(items,index)：index 为 0 到 length-1 的整数时返回移除该位置元素的新数组；其他索引返回内容相同的新数组。任何情况下都不能修改原数组，返回值也不能与原数组是同一引用。',
    'function removeAt(items,index){\n  // 在这里实现\n}',
    [['中间和边界','assert.deepEqual(removeAt(["a","b","c"],1),["a","c"]);assert.deepEqual(removeAt([1],0),[])'],['原数组不变','const a=[1,2,3];const r=removeAt(a,1);assert.deepEqual(a,[1,2,3]);assert.ok(r!==a)'],['无效索引仍返回新数组','const a=[1,2];const r=removeAt(a,-1);assert.deepEqual(r,a);assert.ok(r!==a);assert.deepEqual(removeAt(a,2),a)']],
    ['不要对传入数组直接调用 splice。','有效索引可拼接前后两个 slice。','无效索引使用 slice() 复制整数组。'],
    'function removeAt(items,index){if(!Number.isInteger(index)||index<0||index>=items.length)return items.slice();return items.slice(0,index).concat(items.slice(index+1));}',
    'slice 与 concat 生成新数组，不修改原数组；索引无效也显式复制，保持返回值独立。');

  code('iterable-depth-03','iterable','从任意可迭代对象取前几项','实现 take(iterable,limit)：返回前 limit 个值组成的新数组；limit 为 0 时不读取迭代器。只读取需要的值，并在足够后立即结束 for...of，以便自定义迭代器执行关闭逻辑。limit 保证为非负整数。',
    'function take(iterable,limit){\n  // 在这里实现\n}',
    [['数组与集合','assert.deepEqual(take([1,2,3],2),[1,2]);assert.deepEqual(take(new Set(["a","b"]),1),["a"])'],['零值不启动迭代','let calls=0;const source={[Symbol.iterator](){calls++;return [1][Symbol.iterator]()}};assert.deepEqual(take(source,0),[]);assert.equal(calls,0)'],['提前关闭','let closed=false;function* source(){try{yield 1;yield 2}finally{closed=true}}assert.deepEqual(take(source(),1),[1]);assert.equal(closed,true)']],
    ['limit 为 0 时先返回空数组。','用 for...of 逐项 push。','达到 limit 时 break，而不是先展开全部值。'],
    'function take(iterable,limit){const result=[];if(limit===0)return result;for(const value of iterable){result.push(value);if(result.length===limit)break}return result;}',
    'for...of 支持任意可迭代对象；提前 break 会触发迭代器关闭，且无需先读完所有值。');

  code('map-set-depth-03','map-set','按 id 保留第一条记录','实现 firstById(rows)：同一 id 只保留第一次出现的整条记录，结果保持首次出现顺序。id 可能是数字或字符串，二者必须区分；不能修改输入或记录对象。',
    'function firstById(rows){\n  // 在这里实现\n}',
    [['去重并保序','const a={id:"x",v:1};const b={id:"x",v:2};assert.deepEqual(firstById([a,{id:"y"},b]),[a,{id:"y"}])'],['键类型不同','assert.deepEqual(firstById([{id:1},{id:"1"}]).map(x=>x.id),[1,"1"])'],['不修改输入','const a=[{id:1},{id:1}];const r=firstById(a);assert.equal(a.length,2);assert.ok(r[0]===a[0])']],
    ['用 Set 记录已见过的 id。','对每条记录先检查是否在 Set 中。','第一次出现时加入 Set 和结果数组。'],
    'function firstById(rows){const seen=new Set();const result=[];for(const row of rows){if(seen.has(row.id))continue;seen.add(row.id);result.push(row)}return result;}',
    'Set 不把数字 1 和字符串 "1" 混为一个键；结果数组保留第一次出现顺序与原记录引用。');

  code('keys-values-entries-depth-03','keys-values-entries','只转换可枚举的自身字符串属性','实现 mapVisibleValues(obj,transform)：返回新对象，键来自 Object.entries(obj)，每个值改为 transform(value,key)。不包含继承属性、不可枚举属性或 Symbol 键；不修改原对象。',
    'function mapVisibleValues(obj,transform){\n  // 在这里实现\n}',
    [['转换值与键','assert.deepEqual(mapVisibleValues({a:2,b:3},(v,k)=>k+v),{a:"a2",b:"b3"})'],['过滤不可见键','const s=Symbol("s");const p={inherited:9};const o=Object.create(p);o.a=1;o[s]=2;Object.defineProperty(o,"hidden",{value:3});assert.deepEqual(mapVisibleValues(o,v=>v*2),{a:2})'],['原对象不变','const o={a:2};mapVisibleValues(o,v=>v+1);assert.equal(o.a,2)']],
    ['Object.entries 给出可枚举自有字符串键值对。','map 每个 [key,value] 对。','Object.fromEntries 把新条目转回对象。'],
    'function mapVisibleValues(obj,transform){return Object.fromEntries(Object.entries(obj).map(([key,value])=>[key,transform(value,key)]));}',
    'Object.entries 的可见范围正好符合题意；转换值后用 Object.fromEntries 构建新对象。');

  code('destructuring-assignment-depth-03','destructuring-assignment','给缺失的嵌套坐标设置默认值','实现 pointOf(input)：返回 {left,top}，分别读取 input.position.x 与 y；input 或 position 缺失，以及单个坐标为 undefined 时对应值用 0。明确传入 0 要保留。无需处理显式 null 的 position。',
    'function pointOf(input){\n  // 在这里实现\n}',
    [['完全缺失','assert.deepEqual(pointOf(),{left:0,top:0});assert.deepEqual(pointOf({}),{left:0,top:0})'],['部分缺失和零','assert.deepEqual(pointOf({position:{x:4}}),{left:4,top:0});assert.deepEqual(pointOf({position:{x:0,y:5}}),{left:0,top:5})'],['重命名','assert.deepEqual(pointOf({position:{x:2,y:3}}),{left:2,top:3})']],
    ['先给整个 input 默认空对象。','给 position 默认空对象。','在嵌套解构里把 x 重命名为 left，把 y 重命名为 top，并各设默认 0。'],
    'function pointOf({position:{x:left=0,y:top=0}={}}={}){return {left,top};}',
    '多层默认值分别处理缺失的参数、position 和坐标；重命名让返回字段直接匹配业务接口。');

  code('date-depth-03','date','按 UTC 计算月末日期','实现 daysInUtcMonth(year,month)：year 为 1900～2100 的整数，month 为 1～12 的整数；返回该月天数，其余输入返回 null。使用 Date.UTC 与 UTC 日期方法，不依赖本地时区。',
    'function daysInUtcMonth(year,month){\n  // 在这里实现\n}',
    [['平年与闰年','assert.equal(daysInUtcMonth(2024,2),29);assert.equal(daysInUtcMonth(2023,2),28);assert.equal(daysInUtcMonth(2000,2),29);assert.equal(daysInUtcMonth(1900,2),28)'],['大小月','assert.equal(daysInUtcMonth(2025,4),30);assert.equal(daysInUtcMonth(2025,1),31)'],['无效输入','assert.equal(daysInUtcMonth(2025,13),null);assert.equal(daysInUtcMonth(2025,0),null);assert.equal(daysInUtcMonth(2025,2.5),null);assert.equal(daysInUtcMonth("2025",2),null)']],
    ['先验证年份和月份。','Date.UTC(year,month,0) 表示目标月的最后一天。','用 getUTCDate() 取得月份中的日数。'],
    'function daysInUtcMonth(year,month){if(!Number.isInteger(year)||year<1900||year>2100||!Number.isInteger(month)||month<1||month>12)return null;return new Date(Date.UTC(year,month,0)).getUTCDate();}',
    '传入下一个月的第 0 天可定位目标月月末；UTC getter 避免本地时区影响。');

  code('json-depth-03','json','序列化时递归隐藏敏感字段','实现 serializePublic(data)：用 JSON.stringify 的 replacer，在任意深度省略键名为 password 或 token 的对象属性，其他内容按 JSON 规则序列化。不能修改输入。',
    'function serializePublic(data){\n  // 在这里实现\n}',
    [['顶层与嵌套','const data={name:"A",password:"p",profile:{token:"t",city:"X"}};assert.equal(serializePublic(data),JSON.stringify({name:"A",profile:{city:"X"}}))'],['数组内对象','assert.equal(serializePublic([{token:"x",id:1},{password:"y",id:2}]),JSON.stringify([{id:1},{id:2}]))'],['输入不变','const data={password:"p"};serializePublic(data);assert.equal(data.password,"p")']],
    ['JSON.stringify 的第二个参数可接收 replacer 函数。','replacer 对嵌套属性也会调用。','匹配敏感键时返回 undefined，其余值原样返回。'],
    'function serializePublic(data){return JSON.stringify(data,(key,value)=>key==="password"||key==="token"?undefined:value);}',
    'replacer 在序列化遍历中递归处理属性；返回 undefined 会让对应对象属性被省略，不需要修改源对象。');
}
