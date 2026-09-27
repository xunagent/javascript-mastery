export function addBasicDepthExercises({ choice, code }) {
  const cases = [
    ['hello-world','defer 脚本与文档解析','页面中两个外部经典脚本都带 defer，A 在 B 前面。B 下载得更快。页面解析结束后，哪种执行顺序符合要求？','<script defer src="a.js"></script>\n<script defer src="b.js"></script>',['先 A 后 B，且两者在 DOMContentLoaded 之前执行','先 B 后 A，因为 B 先下载完','A 与 B 都要等 load 事件之后','两个脚本并行执行，可以同时修改同一变量'],['defer 下载可以并行。','defer 执行保持文档顺序。','DOMContentLoaded 等待这些脚本执行完成。'],'defer 不阻塞解析，外部经典脚本仍按文档顺序执行；DOMContentLoaded 在它们执行完后触发。'],
    ['hello-world','异步脚本不适合顺序依赖','analytics.js 依赖 config.js 先建立全局配置。把两个标签都改成 async 后，偶尔报配置不存在。最直接的原因是什么？','<script async src="config.js"></script>\n<script async src="analytics.js"></script>',['async 脚本在下载完成后执行，不保证标签顺序','async 脚本只能在 body 中写','async 会禁止读取全局变量','DOMContentLoaded 一定先于两个脚本执行'],['网络完成顺序可能变化。','async 不保证执行顺序。','有依赖关系时应显式管理加载关系。'],'async 脚本独立下载，下载完成即可执行；analytics 可能先于 config 执行。'],
    ['structure','模板字符串中的换行','要让一段消息包含实际换行，并插入变量 name。哪种写法满足要求？','const name="Lin";',['const message = `你好，${name}\n欢迎回来`;','const message = "你好，${name}\\n欢迎回来";','const message = "你好，" + name + "\\n欢迎回来";','const message = \'你好，${name}\\n欢迎回来\';'],['双引号与单引号不会做 ${} 插值。','模板字符串会插值。','模板字符串中写的换行会成为字符串内容。'],'反引号模板字符串会计算 ${name}，其内部换行也会保留为字符串中的换行。'],
    ['structure','块作用域与意外泄漏','执行后在块外读取 token 会怎样？','if (true) { let token = "secret"; }\nconsole.log(token);',['抛出 ReferenceError','输出 secret','输出 undefined','输出 null'],['let 的作用域是当前块。','花括号形成新的块级作用域。','未声明标识符在读取时抛错。'],'token 只在 if 代码块内有效，块外读取会抛出 ReferenceError。'],
    ['strict-mode','严格模式下独立调用的 this','在严格模式中直接调用普通函数 inspect()，返回值是什么？','"use strict";\nfunction inspect(){ return this; }\ninspect();',['undefined','window','globalThis','一个新建空对象'],['严格模式不会给普通函数调用自动绑定全局对象。','调用处没有接收者。','此处函数体只返回 this，没有访问属性。'],'严格模式下直接调用的普通函数 this 为 undefined。'],
    ['strict-mode','只读属性赋值的结果','尝试修改不可写属性时，严格模式与非严格模式的典型差别是什么？','const box={}; Object.defineProperty(box,"id",{value:1,writable:false}); box.id=2;',['严格模式抛 TypeError；非严格模式通常静默失败','两种模式都把 id 改为 2','严格模式静默失败；非严格模式抛错','两种模式都删除 id'],['属性描述符禁止写入。','严格模式让某些静默错误变成异常。','赋值并未修改原属性。'],'对不可写属性赋值在严格模式中会抛出 TypeError；非严格模式下通常不会生效。'],
    ['strict-mode','严格模式中的 eval 局部变量','严格模式中直接 eval 声明 var secret，eval 结束后外层能读取这个变量吗？','"use strict";\neval("var secret=7");\nconsole.log(typeof secret);',['不能，输出 "undefined"','能，输出 "number"','能，输出 "7"','eval 在严格模式中必然抛 SyntaxError'],['严格模式下 eval 有自己的变量环境。','eval 中的 var 不会泄漏到调用者作用域。','typeof 未声明标识符返回字符串 undefined。'],'严格模式中的直接 eval 不会把 var 声明泄漏到外层；typeof secret 为 "undefined"。'],
    ['variables','var 循环中的共享绑定','以下三个函数依次返回什么？','var f=[]; for(var i=0;i<3;i++){ f.push(()=>i); }\nf.map(fn=>fn());',['[3,3,3]','[0,1,2]','[1,2,3]','[undefined,undefined,undefined]'],['var 的 i 不是每轮新建的块级绑定。','三个闭包读取同一个变量。','循环结束时 i 是 3。'],'var 循环中的三个回调共享同一个 i；调用时循环已结束，i 为 3。'],
    ['variables','块内同名绑定与外层变量','下面两次输出分别是什么？','let count=5;\n{ let count=9; console.log(count); }\nconsole.log(count);',['9、5','9、9','5、5','抛出重复声明错误'],['两个 let 声明位于不同作用域。','块内名称遮蔽外层名称。','离开块后访问外层绑定。'],'块内 count 是独立绑定，只在块内遮蔽外层的 count。'],
    ['types','BigInt 与 Number 混算','假设 total 是 10n，执行 total + 1 会怎样？若必须得到 BigInt 11n，最直接的修复是什么？','let total=10n; total+1;',['抛 TypeError；改成 total + 1n','返回 11n；无需处理','返回 11；改成 total + 1n','返回字符串 "101"'],['BigInt 与 Number 不能直接用 + 混算。','两个操作数需属于兼容的数值类型。','整数常量后缀 n 表示 BigInt。'],'BigInt 与 Number 直接相加会抛 TypeError；使用 1n 可得到 11n。'],
    ['types','Symbol 键不会被普通枚举发现','对象同时有字符串键 id 和 Symbol 键 secret。Object.keys(obj) 会返回什么？','const secret=Symbol("secret"); const obj={id:1,[secret]:2};',['只包含 "id"','包含 "id" 和 Symbol 键','只包含 Symbol 键','返回空数组'],['Object.keys 返回可枚举的自身字符串键。','Symbol 键需要其他方式获取。','Reflect.ownKeys 可同时取得两种键。'],'Object.keys 不列出 Symbol 键；可用 Object.getOwnPropertySymbols 或 Reflect.ownKeys 获取。'],
    ['alert-prompt-confirm','输入字符串 false 的陷阱','用户在 prompt 中输入文本 false，下面 if 会走哪支？','const answer=prompt("继续？");\nif(answer){ run(); }',['会调用 run，因为非空字符串是真值','不会调用，因为文本 false 等于布尔 false','prompt 会直接返回布尔 false','会因字符串不能用于 if 而抛错'],['prompt 的正常输入结果是字符串。','非空字符串即使写着 false 也是真值。','需要按业务规则解析文本。'],'prompt 返回的 "false" 是非空字符串，if 条件为真。'],
    ['alert-prompt-confirm','取消时不要调用字符串方法','用户取消 prompt，下面代码在哪一步出错？','const value=prompt("名称");\nconst name=value.trim();',['value.trim() 抛 TypeError，因为 value 是 null','prompt 立即抛 RangeError','trim 返回空字符串','取消会返回 undefined，所以 trim 安全'],['取消返回 null。','null 没有 trim 方法。','在调用字符串方法前要先区分取消。'],'取消时 value 为 null，对它调用 trim 会抛 TypeError。'],
    ['type-conversions','数组参与字符串转换','下列两个表达式分别是什么？','String([1,null,3]);\nNumber([]);',['"1,,3" 和 0','"1,null,3" 和 NaN','"[1,null,3]" 和 0','"1,,3" 和 NaN'],['数组字符串化通常连接元素。','null 数组项在 join 效果中变为空段。','空数组转原始值后得到空字符串，再转数字为 0。'],'String([1,null,3]) 为 "1,,3"；空数组经字符串原始值 "" 转数字得到 0。'],
    ['type-conversions','显式布尔转换不解析单词','下列哪个结果组合正确？','Boolean("false"); Boolean("0"); Boolean(0);',['true、true、false','false、false、false','true、false、false','false、true、true'],['布尔转换字符串看是否为空。','"false" 并不会按语义解析。','数字 0 是假值。'],'两个非空字符串都转换为 true，数字 0 转换为 false。'],
    ['operators','赋值表达式的返回值','下面代码输出什么？','let a=1; let b=0;\nconsole.log(b=(a+=2),a,b);',['3、3、3','0、3、0','3、1、3','抛 SyntaxError'],['a+=2 先更新 a，并产生结果 3。','再把该结果赋给 b。','赋值表达式自身也产生被赋的值。'],'a+=2 将 a 改成 3，赋值表达式结果也为 3，b 因而变成 3。'],
    ['operators','前置和后置自增的求值','下列输出是什么？','let n=4;\nconst before=n++;\nconst after=++n;\nconsole.log(before,after,n);',['4、6、6','5、6、6','4、5、6','5、5、6'],['n++ 先返回旧值，再增加。','++n 先增加，再返回新值。','第二次操作开始时 n 已经是 5。'],'before 得到旧值 4；n 先到 5，前置自增再到 6，after 与最终 n 都是 6。'],
    ['comparison','独立对象不会因内容相同而相等','下面三个比较分别是什么？','const a={id:1}; const b={id:1}; const c=a;\na===b; a===c; Object.is(a,b);',['false、true、false','true、true、true','false、false、false','true、false、true'],['对象比较的是身份。','b 是另一个对象。','c 保存 a 的同一引用。'],'a 和 b 内容相同但身份不同；c 引用 a，所以只有 a===c 为真。'],
    ['comparison','undefined 的关系比较','下面两个比较结果是什么？','undefined < 1; undefined >= 1;',['false、false','true、false','false、true','true、true'],['关系比较需要数值转换。','undefined 转数字得到 NaN。','涉及 NaN 的大小比较均为 false。'],'undefined 数值转换得到 NaN，两个关系比较都返回 false。'],
    ['ifelse','悬挂 else 绑定到哪个 if','outer 为 true、inner 为 false 时，下面最终输出什么？','if(outer)\n  if(inner) result="A";\n  else result="B";\nconsole.log(result);',['B','A','undefined','SyntaxError'],['else 绑定最近的未匹配 if。','outer 为 true，会进入内部判断。','inner 为 false，执行其 else。'],'没有花括号时 else 归属于最近的 if(inner)，所以执行 B 分支。'],
    ['ifelse','条件表达式不要掩盖缺省值','flag 为 0，表达式结果是什么？','const result=flag ? "启用" : "禁用";',['"禁用"','"启用"','0','undefined'],['条件位置会进行布尔转换。','0 是假值。','条件表达式只返回两个分支之一。'],'0 转换为 false，因此返回 "禁用"；若 0 是有意义状态，应单独设计判断条件。'],
    ['logical-operators','逻辑优先级与副作用','调用顺序是什么？','let calls=[];\nconst a=()=>{calls.push("A");return true};\nconst b=()=>{calls.push("B");return false};\nconst c=()=>{calls.push("C");return true};\na() || b() && c();',['只调用 A','调用 A、B、C','调用 B、C','只调用 A、B'],['&& 优先级高于 ||。','左侧 a() 已返回 true。','|| 短路，右侧整体不执行。'],'表达式按 a() || (b() && c()) 解析；a 返回真值，右侧完全跳过。'],
    ['logical-operators','惰性默认值只在需要时生成','缓存值 cached 为 0 时，表达式会调用 fallback 吗？','const value=cached || fallback();',['会，且 value 是 fallback() 的结果','不会，value 是 0','会，但 value 仍是 0','抛错，因为 0 不能参与 ||'],['|| 把 0 当作假值。','右侧是函数调用。','短路只在左侧为真值时发生。'],'cached 为 0 时 || 会求值右侧，可能误覆盖有效的零值。'],
    ['nullish-coalescing-operator','惰性空值赋值','配置 timeout 为 0，运行 timeout ??= expensiveDefault() 后会怎样？','let timeout=0; timeout ??= expensiveDefault();',['timeout 保持 0，函数不调用','timeout 变成函数返回值','timeout 变成 undefined','先调用函数再决定是否赋值'],['??= 只在左侧为 null 或 undefined 时求值右侧。','0 是有效的非空值。','因此右侧可以保持惰性。'],'0 不会触发 ??=，expensiveDefault 不运行。'],
    ['nullish-coalescing-operator','null 与 false 的配置合并','enabled 为 false、label 为 null 时，结果是什么？','const enabled=false; const label=null;\n[enabled ?? true,label ?? "默认"];',['[false,"默认"]','[true,"默认"]','[false,null]','[true,null]'],['?? 与真假值无关。','false 不是空值。','null 会触发备用值。'],'?? 保留 false，只替换 null 或 undefined。'],
    ['while-for','for...in 与 for...of 的选择','要遍历数组中的商品对象，且不把自定义属性名当作商品，最合适的循环是哪种？','const items=[{id:1},{id:2}]; items.extra="meta";',['for (const item of items) { /* item 是商品对象 */ }','for (const item in items) { /* item 是商品对象 */ }','for (const item of Object.keys(items)) { /* item 是商品对象 */ }','for (const item in Object.keys(items)) { /* item 是商品对象 */ }'],['for...of 遍历可迭代对象的值。','for...in 遍历可枚举属性名。','数组自定义属性不应进入商品列表。'],'for...of 直接遍历数组值；for...in 会遍历包括 extra 在内的可枚举键。'],
    ['while-for','do...while 至少执行一次','tries 从 0 开始，条件 tries < 0。下面循环后 tries 是多少？','let tries=0; do { tries++; } while (tries<0);',['1','0','-1','无限循环'],['do 的循环体先执行。','然后才检查条件。','初次检查前 tries 已加 1。'],'do...while 至少执行一次，随后条件不成立，tries 为 1。'],
    ['switch','break 只跳出 switch','switch 位于 for 循环内部，case 中执行 break。它会跳出哪一层？','for(let i=0;i<3;i++){ switch(i){ case 1: break; default: log(i); } }',['只跳出 switch，for 继续后续迭代','同时跳出 switch 与 for','仅跳出当前 if','跳出整个函数'],['break 作用于最近的可中断结构。','最近的是 switch。','循环仍会更新 i 并继续。'],'case 中的 break 结束 switch；外层 for 会继续。'],
    ['switch','case 表达式的副作用','switch 已匹配首个 case 且其中 break。后面的 case 表达式会求值吗？','switch(1){ case 1: log("hit"); break; case sideEffect(): log("later"); }',['不会','会先调用 sideEffect 再执行首个 case','会调用 sideEffect 但不执行后面的语句','只在严格模式会'],['case 测试按顺序寻找匹配。','找到匹配后从匹配位置执行语句。','break 终止整个 switch。'],'首个 case 已匹配并 break，后面的 case 表达式不需要再求值。'],
    ['function-basics','return 后的换行','以下函数调用返回什么？','function get(){ return\n  {ok:true}; }\nget();',['undefined','{ok:true}','null','SyntaxError'],['return 后换行可触发自动分号插入。','对象字面量没有作为返回表达式。','函数没有显式返回值。'],'return 后换行等于 return;，函数返回 undefined。'],
    ['function-basics','局部参数重新赋值不会修改调用者绑定','执行后输出什么？','let input=5;\nfunction update(x){ x=9; return x; }\nconsole.log(update(input),input);',['9、5','9、9','5、5','undefined、5'],['调用时数字值传给形参 x。','x 是函数内部局部绑定。','修改 x 不会改变 input。'],'函数形参是独立局部绑定；update 返回 9，但外层 input 仍是 5。'],
    ['function-expressions','条件选择回调后调用','两个函数表达式中，最终执行的是哪一个？','const ok=false;\nconst handler=ok ? function(){return "A";} : function(){return "B";};\nhandler();',['返回 "B"','返回 "A"','抛 ReferenceError','返回 undefined'],['条件表达式先选择一个函数值。','ok 是 false。','随后 handler() 调用被选中的函数。'],'函数表达式是值，可在条件表达式中选择并稍后调用；这里选择返回 B 的函数。'],
    ['function-expressions','IIFE 的局部变量不会泄漏','以下代码执行后读取 secret 会怎样？','(function(){ const secret=7; })();\nconsole.log(secret);',['抛 ReferenceError','输出 7','输出 undefined','输出 null'],['IIFE 创建函数作用域。','secret 是函数内局部绑定。','函数调用结束后外部不能按名字访问它。'],'立即调用函数表达式内的 const 变量不会暴露到外部作用域。'],
    ['arrow-functions-basics','箭头函数中的 arguments 来自外层','普通函数 make 返回箭头函数，下面调用得到什么？','function make(x){ return ()=>arguments[0]; }\nmake("A")("B");',['"A"','"B"','undefined','抛 TypeError'],['箭头函数没有自己的 arguments。','arguments 来自 make 的调用。','后续对箭头函数传参不会改变外层 arguments。'],'箭头函数捕获 make 的 arguments，第一项是 "A"。'],
    ['arrow-functions-basics','对象字面量的隐式返回','哪种箭头函数在调用时返回 {ok:true} 对象？','',['const make=()=>({ok:true});','const make=()=>{ok:true};','const make=()=>{return;{ok:true}};','const make=()=>({ok:true}); 然后只读取 make 而不调用'],['花括号在箭头后可能是函数体。','想隐式返回对象，需用圆括号包住。','函数值本身不是对象返回值。'],'()=>({ok:true}) 用圆括号把对象字面量标为表达式。'],
    ['javascript-specials','typeof 未声明标识符','在没有同名声明的普通作用域内，typeof missing 与直接读取 missing 分别怎样？','',['前者是 "undefined"；后者抛 ReferenceError','两者都返回 undefined','前者抛错；后者返回 undefined','两者都抛 SyntaxError'],['typeof 对真正未声明的标识符有特殊处理。','直接读取仍会失败。','若标识符在 TDZ 中，情况另有区别。'],'typeof 未声明标识符返回字符串 "undefined"；直接求值会抛 ReferenceError。'],
    ['javascript-specials','对象在条件中总是真值','条件中的空对象会使哪支运行？','if ({}) { log("yes"); } else { log("no"); }',['yes','no','两支都运行','抛 TypeError'],['对象是否为空不影响布尔转换。','所有对象都是真值。','条件会运行第一个分支。'],'空对象仍是真值，因此执行 yes 分支。']
  ];
  const indexes=new Map();
  for (const [lessonId,title,prompt,example,options,hints,explanation] of cases) {
    const index=(indexes.get(lessonId)||0)+1;
    indexes.set(lessonId,index);
    choice(`${lessonId}-depth-${String(index).padStart(2,'0')}`,lessonId,title,prompt,example,options,0,hints,explanation);
  }

  code('hello-world-depth-03','hello-world','用确定的依赖顺序启动模块','实现 start(loadConfig, loadApp)：先等待 loadConfig() 完成，再把它的返回配置传给 loadApp(config)，最后返回 loadApp 的结果。任何一步失败都应原样拒绝。',
    'async function start(loadConfig, loadApp) {\n  // 在这里实现\n}',
    [['依赖顺序','return (async()=>{let trace=[];const r=await start(async()=>{trace.push("config");return {v:2}},async c=>{trace.push("app");return c.v});assert.equal(r,2);assert.deepEqual(trace,["config","app"]);})()'],['等待配置完成','return (async()=>{let resolve;const pending=new Promise(r=>resolve=r);let called=false;const result=start(()=>pending,()=>{called=true;return 1});await Promise.resolve();assert.equal(called,false);resolve({});await result;assert.equal(called,true);})()'],['错误传播','return (async()=>{const error=new Error("config");let caught;try{await start(()=>Promise.reject(error),()=>1)}catch(e){caught=e}assert.equal(caught,error);})()']],
    ['依赖必须按完成顺序组织。','先 await loadConfig()。','将得到的配置交给 loadApp 并返回其结果。'],
    'async function start(loadConfig, loadApp){ const config=await loadConfig(); return await loadApp(config); }',
    '先等待配置，再启动依赖配置的模块。async 函数会把失败作为拒绝传播。');

  code('structure-depth-03','structure','构建多行状态消息','实现 formatStatus(name, count)：返回两行字符串，第一行为「用户：{name}」，第二行为「待办：{count}」。name 和 count 按原值插入；不要产生额外空格或空行。',
    'function formatStatus(name,count){\n  // 在这里实现\n}',
    [['基本插值','assert.equal(formatStatus("Lin",3),"用户：Lin\\n待办：3")'],['保留零值与特殊字符','assert.equal(formatStatus("A:B",0),"用户：A:B\\n待办：0")']],
    ['使用模板字符串插入两个值。','中间写一个换行符。','检查字符串前后没有额外换行。'],
    'function formatStatus(name,count){ return `用户：${name}\n待办：${count}`; }',
    '模板字符串同时支持表达式插值和换行；此处恰好产生两行。');

  code('variables-depth-03','variables','每个计时回调记住自己的序号','实现 makeCallbacks(n)：返回长度为 n 的函数数组，第 i 个函数在之后被调用时返回 i（从 0 开始）。回调创建后才调用，不能靠调用时重新计算位置。',
    'function makeCallbacks(n){\n  // 在这里实现\n}',
    [['独立绑定','assert.deepEqual(makeCallbacks(4).map(fn=>fn()),[0,1,2,3])'],['空数组','assert.deepEqual(makeCallbacks(0),[])'],['多次调用稳定','const a=makeCallbacks(2);assert.equal(a[1](),1);assert.equal(a[0](),0);assert.equal(a[1](),1)']],
    ['循环中创建函数。','使用 let 让每轮迭代有独立绑定。','不要让所有函数读取同一个结束后的 var。'],
    'function makeCallbacks(n){const result=[];for(let i=0;i<n;i++)result.push(()=>i);return result;}',
    'for 循环的 let 为各轮建立独立绑定，延迟调用时仍得到对应索引。');

  code('types-depth-03','types','保留特殊数值的比较','实现 sameNumber(a,b)：两者都是 number 时按 Object.is 语义比较，非 number 输入一律返回 false。要求 NaN 与 NaN 相同，+0 与 -0 不同。',
    'function sameNumber(a,b){\n  // 在这里实现\n}',
    [['特殊数字','assert.equal(sameNumber(NaN,NaN),true);assert.equal(sameNumber(0,-0),false)'],['普通数值','assert.equal(sameNumber(3,3),true);assert.equal(sameNumber(3,4),false)'],['类型边界','assert.equal(sameNumber(3,"3"),false);assert.equal(sameNumber(null,null),false)']],
    ['先判断两者是否都是 number。','=== 无法让 NaN 等于自身，也不区分两个零。','Object.is 可以处理这两个边界。'],
    'function sameNumber(a,b){return typeof a==="number"&&typeof b==="number"&&Object.is(a,b);}',
    '类型检查限制函数输入；Object.is 处理 NaN 和有符号零的特殊相等语义。');

  code('alert-prompt-confirm-depth-03','alert-prompt-confirm','区分取消、空输入和正常输入','实现 normalizePrompt(answer)：模拟 prompt 结果；null 返回 {kind:"cancel"}，只含空白的字符串返回 {kind:"empty"}，其余字符串去除首尾空白后返回 {kind:"value",value:文本}。',
    'function normalizePrompt(answer){\n  // 在这里实现\n}',
    [['取消','assert.deepEqual(normalizePrompt(null),{kind:"cancel"})'],['空白','assert.deepEqual(normalizePrompt("  \\n "),{kind:"empty"})'],['正常与零文本','assert.deepEqual(normalizePrompt("  Lin  "),{kind:"value",value:"Lin"});assert.deepEqual(normalizePrompt("0"),{kind:"value",value:"0"})']],
    ['先判断 null，再调用字符串方法。','trim 后再判断是否为空。','普通文本应保留为字符串，包括 "0"。'],
    'function normalizePrompt(answer){if(answer===null)return {kind:"cancel"};const value=answer.trim();return value===""?{kind:"empty"}:{kind:"value",value};}',
    'prompt 取消与提交空白是不同用户行为；先分支处理 null，才能安全调用 trim。');

  code('type-conversions-depth-03','type-conversions','拒绝部分可解析的数字文本','实现 parseFinite(text)：只接受字符串；去除首尾空白后，空串或无法完整转换为有限数时返回 null，否则返回对应 Number。可以接受指数形式，不接受带单位的前缀解析。',
    'function parseFinite(text){\n  // 在这里实现\n}',
    [['有效输入','assert.equal(parseFinite(" 12.5 "),12.5);assert.equal(parseFinite("1e2"),100);assert.equal(parseFinite("0"),0)'],['非法前缀与空白','assert.equal(parseFinite("12px"),null);assert.equal(parseFinite("   "),null)'],['类型与无穷','assert.equal(parseFinite(12),null);assert.equal(parseFinite("Infinity"),null)']],
    ['先限制输入类型并排除 trim 后的空串。','Number 要求整个字符串可转换。','Number.isFinite 排除 NaN 和 Infinity。'],
    'function parseFinite(text){if(typeof text!=="string"||text.trim()==="")return null;const n=Number(text);return Number.isFinite(n)?n:null;}',
    'Number 做完整数值转换；额外排除空串和非有限结果，避免 Number("") 被误认为有效的 0。');

  code('operators-depth-03','operators','循环索引映射到非负范围','实现 wrapIndex(index,size)：size 为正整数，index 为整数，可为负数；返回 0 到 size-1 的循环索引。不能使用循环逐步调整。',
    'function wrapIndex(index,size){\n  // 在这里实现\n}',
    [['正向环绕','assert.equal(wrapIndex(7,5),2);assert.equal(wrapIndex(0,5),0)'],['负向环绕','assert.equal(wrapIndex(-1,5),4);assert.equal(wrapIndex(-6,5),4)'],['整周期','assert.equal(wrapIndex(10,5),0);assert.equal(wrapIndex(-10,5),0)']],
    ['先计算 index % size。','负数余数仍可能为负。','通过 (余数 + size) % size 归一化。'],
    'function wrapIndex(index,size){return ((index%size)+size)%size;}',
    'JavaScript 的 % 是余数而非总为非负的数学模；二次取余把负索引规范到目标范围。');

  code('comparison-depth-03','comparison','只接受两个有限数比较','实现 compareFinite(a,b)：仅当两者均为有限 number 时返回 -1、0、1，分别表示 a 小于、等于、大于 b；其他输入返回 null。不得依赖字符串隐式转换。',
    'function compareFinite(a,b){\n  // 在这里实现\n}',
    [['顺序','assert.equal(compareFinite(2,3),-1);assert.equal(compareFinite(3,2),1);assert.equal(compareFinite(2,2),0)'],['拒绝非法数值','assert.equal(compareFinite(NaN,2),null);assert.equal(compareFinite(Infinity,2),null)'],['拒绝字符串','assert.equal(compareFinite("2",3),null);assert.equal(compareFinite(null,0),null)']],
    ['先验证 Number.isFinite(a) 与 Number.isFinite(b)。','再分别判断小于和大于。','剩余情况是相等。'],
    'function compareFinite(a,b){if(!Number.isFinite(a)||!Number.isFinite(b))return null;if(a<b)return -1;if(a>b)return 1;return 0;}',
    '先排除 NaN、无穷和隐式转换输入，才可用三分支比较得到可靠排序结果。');

  code('ifelse-depth-03','ifelse','用明确分支处理容量状态','实现 capacityStatus(used,limit)：仅接受两个非负整数且 limit 大于 0，否则返回 "无效"；used=0 返回 "空"；used<limit 返回 "可用"；used=limit 返回 "已满"；used>limit 返回 "超限"。',
    'function capacityStatus(used,limit){\n  // 在这里实现\n}',
    [['状态边界','assert.equal(capacityStatus(0,3),"空");assert.equal(capacityStatus(2,3),"可用");assert.equal(capacityStatus(3,3),"已满");assert.equal(capacityStatus(4,3),"超限")'],['无效输入','assert.equal(capacityStatus(-1,3),"无效");assert.equal(capacityStatus(1,0),"无效");assert.equal(capacityStatus(1.2,3),"无效");assert.equal(capacityStatus("1",3),"无效")']],
    ['先验证整数与范围。','零用量要先于小于上限判断。','依次比较小于、等于与大于上限。'],
    'function capacityStatus(used,limit){if(!Number.isInteger(used)||!Number.isInteger(limit)||used<0||limit<=0)return "无效";if(used===0)return "空";if(used<limit)return "可用";if(used===limit)return "已满";return "超限";}',
    '分支顺序决定边界值的分类；先验证输入，再处理零、未满、刚满、超限。');

  code('logical-operators-depth-03','logical-operators','只在权限通过时执行动作','实现 runIfAllowed(user, action)：user?.active 为真且 user?.role 等于 "admin" 时调用 action(user) 并返回其结果；否则不调用 action，返回 null。',
    'function runIfAllowed(user,action){\n  // 在这里实现\n}',
    [['管理员','let count=0;assert.equal(runIfAllowed({active:true,role:"admin"},()=>++count),1);assert.equal(count,1)'],['短路禁止调用','let called=false;const action=()=>{called=true};assert.equal(runIfAllowed(null,action),null);assert.equal(runIfAllowed({active:false,role:"admin"},action),null);assert.equal(runIfAllowed({active:true,role:"reader"},action),null);assert.equal(called,false)'],['返回动作的假值','assert.equal(runIfAllowed({active:true,role:"admin"},()=>0),0)']],
    ['先判断 user 是否有效、active 与 role。','用 && 的短路避免无权限时执行动作。','动作结果可能是 0，不要用 || 改写其返回值。'],
    'function runIfAllowed(user,action){if(user?.active&&user?.role==="admin")return action(user);return null;}',
    '条件表达式短路保证无权限时不会执行 action；直接返回调用结果，保留 0 等假值。');

  code('nullish-coalescing-operator-depth-03','nullish-coalescing-operator','只补空值配置且惰性计算','实现 ensureTimeout(config, makeDefault)：若 config.timeout 为 null 或 undefined，调用 makeDefault() 一次并赋值；否则不调用。返回 config.timeout，并直接修改传入的 config。',
    'function ensureTimeout(config,makeDefault){\n  // 在这里实现\n}',
    [['只补空值','let calls=0;const c={timeout:null};assert.equal(ensureTimeout(c,()=>{calls++;return 300}),300);assert.equal(c.timeout,300);assert.equal(calls,1)'],['保留零与假值','let calls=0;const f=()=>{calls++;return 300};const a={timeout:0};const b={timeout:false};assert.equal(ensureTimeout(a,f),0);assert.equal(ensureTimeout(b,f),false);assert.equal(calls,0)'],['缺失字段','const c={};assert.equal(ensureTimeout(c,()=>100),100);assert.equal(c.timeout,100)']],
    ['??= 会在左侧为空值时才求值右侧。','config.timeout ??= makeDefault()。','赋值后直接返回属性。'],
    'function ensureTimeout(config,makeDefault){config.timeout ??= makeDefault();return config.timeout;}',
    '??= 惰性补全 null/undefined，保留 0、false 等有效设置。');

  code('while-for-depth-03','while-for','跨过非数值并停在第一个超限值','实现 collectBeforeLimit(values,limit)：从左到右收集有限数字；遇到第一个大于 limit 的有限数字时停止，不包含该值；其他类型、NaN、Infinity 都跳过。返回新数组。',
    'function collectBeforeLimit(values,limit){\n  // 在这里实现\n}',
    [['提前停止','assert.deepEqual(collectBeforeLimit([1,"x",3,8,2],5),[1,3])'],['跳过无效','assert.deepEqual(collectBeforeLimit([NaN,Infinity,-1,0],2),[-1,0])'],['第一个就超限','assert.deepEqual(collectBeforeLimit([6,1],5),[])']],
    ['用循环逐项读取。','先跳过非有限数字。','有效数超限时 break，否则 push 到结果。'],
    'function collectBeforeLimit(values,limit){const result=[];for(const value of values){if(!Number.isFinite(value))continue;if(value>limit)break;result.push(value)}return result;}',
    'continue 跳过无效项，break 保证遇到第一个有效超限值后不再读取后续元素。');

  code('switch-depth-03','switch','多个状态共享处理分支','实现 renderState(state)："queued" 与 "waiting" 返回 "排队中"；"running" 返回 "执行中"；"done" 返回 "已完成"；其他输入返回 "未知"。使用 switch，并让共享分支只写一次返回语句。',
    'function renderState(state){\n  // 用 switch 实现\n}',
    [['共享状态','assert.equal(renderState("queued"),"排队中");assert.equal(renderState("waiting"),"排队中")'],['其他状态','assert.equal(renderState("running"),"执行中");assert.equal(renderState("done"),"已完成");assert.equal(renderState("failed"),"未知")'],['严格匹配','assert.equal(renderState(null),"未知");assert.equal(renderState(1),"未知")']],
    ['把两个 case 标签放在一起。','return 会直接结束函数，无需 break。','default 处理未知值。'],
    'function renderState(state){switch(state){case "queued":case "waiting":return "排队中";case "running":return "执行中";case "done":return "已完成";default:return "未知";}}',
    '连续 case 标签让两个状态走同一返回语句；其余状态分别处理，default 收束未知输入。');

  code('function-basics-depth-03','function-basics','合并任意数量的有限数','实现 sumFinite(...values)：忽略非有限数和非 number 参数，对其余数字求和；无有效参数时返回 0。必须使用 rest 参数接收任意数量的实参。',
    'function sumFinite(...values){\n  // 在这里实现\n}',
    [['基本累加','assert.equal(sumFinite(1,2,3),6);assert.equal(sumFinite(),0)'],['过滤非法','assert.equal(sumFinite(2,NaN,"3",Infinity,-1),1)'],['单个零值','assert.equal(sumFinite(0),0)']],
    ['rest 参数收集为数组。','遍历时用 Number.isFinite 检查。','从 0 开始累计。'],
    'function sumFinite(...values){let total=0;for(const value of values)if(Number.isFinite(value))total+=value;return total;}',
    'rest 参数接收任意多个值；Number.isFinite 同时排除非数字、NaN 和无穷。');

  code('function-expressions-depth-03','function-expressions','按条件选择可复用处理函数','实现 chooseFormatter(upper)：返回一个函数。upper 为真时，返回函数把传入字符串转大写；否则把传入字符串转小写。选择只在创建时进行，之后调用返回函数不重新读取 upper。',
    'function chooseFormatter(upper){\n  // 在这里实现\n}',
    [['大写与小写','const up=chooseFormatter(true),low=chooseFormatter(false);assert.equal(up("aB"),"AB");assert.equal(low("aB"),"ab")'],['返回函数可复用','const f=chooseFormatter(true);assert.equal(f("x"),"X");assert.equal(f("yz"),"YZ")']],
    ['函数表达式可以作为值返回。','创建时用条件选择两个函数之一。','返回后再由调用者传入文本。'],
    'function chooseFormatter(upper){return upper?function(text){return text.toUpperCase()}:function(text){return text.toLowerCase()};}',
    '函数表达式是普通值；创建时选择并返回一个可反复调用的处理函数。');

  code('arrow-functions-basics-depth-03','arrow-functions-basics','从对象方法保留接收者','实现 createReader()：返回对象 {value:10, make()}；调用对象的 make() 返回箭头函数，之后即使把该返回函数当作另一个对象的方法调用，也要读到原对象当前的 value。',
    'function createReader(){\n  // 在这里实现\n}',
    [['保留原对象','const box=createReader();const read=box.make();assert.equal(read(),10);box.value=23;assert.equal(read(),23)'],['传给其他对象','const box=createReader();const other={value:99,read:box.make()};assert.equal(other.read(),10)']],
    ['make 用普通方法以获取调用接收者。','在 make 内返回箭头函数。','箭头函数捕获 make 的 this，执行时读取当前 value。'],
    'function createReader(){return {value:10,make(){return ()=>this.value}};}',
    'make 的 this 指向原对象；箭头函数捕获这个 this，而不是采用后续调用它的对象。');

  code('javascript-specials-depth-03','javascript-specials','显式区分空值和其他假值','实现 describe(value)：null 或 undefined 返回 "缺失"；false、0、空字符串分别返回 "否"、"零"、"空文本"；其他值返回 "有值"。不要把空数组或空对象当缺失。',
    'function describe(value){\n  // 在这里实现\n}',
    [['各类假值','assert.equal(describe(null),"缺失");assert.equal(describe(undefined),"缺失");assert.equal(describe(false),"否");assert.equal(describe(0),"零");assert.equal(describe(""),"空文本")'],['对象是真值','assert.equal(describe([]),"有值");assert.equal(describe({}),"有值");assert.equal(describe("0"),"有值")']],
    ['不要先用 if(!value) 把所有假值混为一类。','null 和 undefined 可用 value == null 同时判断。','其余用严格相等区分。'],
    'function describe(value){if(value==null)return "缺失";if(value===false)return "否";if(value===0)return "零";if(value==="")return "空文本";return "有值";}',
    '真假值集合包含不同业务含义；按严格比较逐个分支，空对象和空数组自然保留为“有值”。');
}
