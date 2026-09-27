export function addBasicsExpansionB({ choice }) {
  const cases = [
    ['ifelse','条件表达式只求值一个分支','表达式执行后 calls 是多少？','let calls=0;const x=true ? (calls++,1) : (calls++,2);',["1，x 为 1","2，x 为 1","2，x 为 2","0，x 为 1"],'?: 先判断条件|仅选中的分支会求值|另一个 calls++ 不运行','条件为真时只计算第二操作数，因此仅增加一次。'],
    ['ifelse','条件赋值的副作用','为何下面的分支会执行？','let ready=false;if(ready=true){run();}',["条件中执行赋值且赋值表达式结果为 true","条件会忽略赋值表达式","false 会自动转 true","run 会无条件执行"],'区分 = 和 ===|赋值表达式有返回值|返回的新值为 true','条件里写了赋值，ready 变为 true，条件也为 true。'],
    ['ifelse','悬挂 else 匹配最近的 if','当 a 为真、b 为假时调用哪个函数？','if(a) if(b) yes(); else no();',["no()","yes()","两者都不调用","两者都调用"],'缺少花括号时看语法配对|else 匹配最近的未配对 if|b 为假','else 属于内层 if(b)，所以调用 no()。'],
    ['ifelse','三元表达式嵌套的结合方向','x=0 时表达式返回什么？','const result=x ? "A" : x===0 ? "B" : "C";',["B","A","C","SyntaxError"],'条件运算符可嵌套|第一个条件为假，求后半段|x===0 为真','后半段是另一个条件表达式，结果为 B。'],
    ['logical-operators','逻辑或返回操作数','表达式最终返回什么？','const value="" || 0 || "ready";',["字符串 ready","布尔 true","数字 0","空字符串"],'|| 返回某个操作数|依次跳过假值|第一个真值是 ready','|| 返回第一个真值操作数，而不自动变成布尔值。'],
    ['logical-operators','逻辑与的短路保留左值','函数调用多少次，result 是什么？','let n=0;const result=0 && ++n;',["0 次；result 为 0","1 次；result 为 1","0 次；result 为 false","1 次；result 为 0"],'&& 遇到假值就停|右侧不会执行|返回原操作数 0','0 是假值，&& 直接返回 0，不执行 ++n。'],
    ['logical-operators','双重非把值归一为布尔值','!![] 与 !!"" 分别是什么？','console.log(!![],!!"");',["true、false","false、false","true、true","[]、空字符串"],'数组是对象|空字符串是假值|! 运算符产出布尔值','数组对象为真值，空字符串为假值，双重非对应 true、false。'],
    ['logical-operators','或赋值只在左侧假值时赋值','下列代码后 count 与 hits 是多少？','let count=0,hits=0;count ||= ++hits;',["1、1","0、1","0、0","1、0"],'||= 依照 || 的短路规则|0 是假值|右侧自增后赋给 count','左侧 0 为假，求值 ++hits 得 1，并赋给 count。'],
    ['nullish-coalescing-operator','空字符串不会触发空值后备','下列三项结果是什么？','["" ?? "X", 0 ?? 9, false ?? true]',["空字符串、0、false","X、9、true","X、0、false","空字符串、9、true"],'?? 只对 null/undefined 回退|空字符串不是空值|0 与 false 也会保留','三个左侧值都不是 null 或 undefined，所以原样返回。'],
    ['nullish-coalescing-operator','混用逻辑运算符需要括号','下面表达式为什么无法直接解析？','a ?? b || c',["?? 与 || 直接混用会触发 SyntaxError，需用括号明确优先关系","?? 总比 || 优先","|| 总比 ?? 优先","只要 a 非空就能解析"],'这是语法层面的限制|不取决于 a 的运行时值|写成 (a ?? b) || c 等','JavaScript 不允许在同一表达式中不加括号地混用 ?? 与 ||。'],
    ['nullish-coalescing-operator','空值赋值只求值必要的右侧','side 调用多少次？','let x=0,n=0;function side(){n++;return 7}x ??= side();',["0 次，x 仍为 0","1 次，x 为 7","0 次，x 为 7","1 次，x 仍为 0"],'??= 仅在左侧是空值时求右侧|数字 0 不是空值|无需调用 side','x=0 不触发空值赋值，右侧被短路。'],
    ['nullish-coalescing-operator','默认参数与空值合并处理 null 不同','f(undefined) 与 f(null) 的结果分别是什么？','function f(x=5){return x??7}',["5、7","7、7","5、5","undefined、null"],'默认参数只接管 undefined|显式 null 不触发默认值|函数内 ?? 接管 null','undefined 先被默认成 5；null 保留到 ??，返回 7。'],
    ['while-for','continue 不执行 for 的循环体尾部','输出的数组是什么？','let out=[];for(let i=0;i<4;i++){if(i%2===0)continue;out.push(i)}',["[1,3]","[0,2]","[0,1,2,3]","[]"],'continue 跳过当前轮剩余代码|for 的更新表达式仍运行|只在奇数轮 push','偶数轮跳过 push，奇数轮添加 1、3。'],
    ['while-for','循环条件中的自增先返回旧值','最终 n 与次数是多少？','let n=0,c=0;while(n++<2)c++;',["n=3，c=2","n=2，c=2","n=3，c=3","n=2，c=3"],'n++ 比较时给出旧值|条件为假时仍执行 n++|比较旧值 0、1、2','两次进入循环，第三次测试失败但 n 已增加到 3。'],
    ['while-for','for let 为每次迭代建立绑定','依次调用函数得到什么？','const f=[];for(let i=0;i<3;i++)f.push(()=>i);f.map(fn=>fn());',["[0,1,2]","[3,3,3]","[0,0,0]","ReferenceError"],'for 的 let 在每轮有独立绑定|闭包捕获各轮的 i|对照 var 的共享绑定','每个函数保留各自那一轮的 i，依次得到 0、1、2。'],
    ['while-for','带标签的 break 退出外层循环','执行完 count 是多少？','let count=0;outer:for(let i=0;i<3;i++)for(let j=0;j<3;j++){count++;if(j===1)break outer}',["2","3","6","9"],'break outer 退出标记的外层循环|从 i=0 开始|j=1 时累计两次','在第一轮内层循环 j=1 时跳出整个外层，count=2。'],
    ['switch','case 使用严格比较','传入字符串 2 会走哪个分支？','switch("2"){case 2: console.log("number");break;default:console.log("other")}',["other","number","两个都输出","SyntaxError"],'switch 匹配不做宽松转换|字符串与数字类型不同|进入 default','case 2 不匹配字符串 "2"，因此执行 default。'],
    ['switch','没有 break 会贯穿后续 case','最终 out 是什么？','let out="";switch(1){case 1:out+="A";case 2:out+="B";break;default:out+="C"}',["AB","A","ABC","BC"],'匹配后开始执行|没有 break 则继续下一 case|case 2 后停止','case 1 后贯穿到 case 2，得到 AB。'],
    ['switch','多个 case 可共享一个实现','哪种写法能让 A 和 B 使用同一分支？','switch(kind){ /* 填写 */ }',["case 'A': case 'B': handle(); break;","case 'A' || 'B': handle(); break;","case ['A','B']: handle(); break;","case 'A','B': handle(); break;"],'case 后的表达式需单独匹配|相邻 case 可贯穿|用两个标签共享代码','相邻 case 标签没有语句时自然落入同一个处理块。'],
    ['switch','default 可以放在中间但仍贯穿','x 不匹配任何 case 时输出什么？','switch(x){default:out.push("D");case 1:out.push("1");break;case 2:out.push("2")}',["D、1","只有 D","只有 1","D、2"],'default 位置不必最后|匹配失败从 default 进入|没有 break 就继续 case 1','执行 default 后继续贯穿 case 1，直至 break。'],
    ['function-basics','声明提升但默认参数在调用时求值','下面两次调用结果是什么？','let base=1;function f(x=base){return x}const a=f();base=4;const b=f();',["1、4","1、1","4、4","ReferenceError"],'默认参数表达式在调用时执行|第一次 base 是 1|第二次 base 已改变','每次省略参数都会重新计算默认值。'],
    ['function-basics','默认参数不能提前读取后续参数','调用 f() 会怎样？','function f(a=b,b=2){return a} f();',["抛 ReferenceError","返回 2","返回 undefined","抛 SyntaxError"],'默认参数按从左到右初始化|计算 a 的默认值时 b 尚未初始化|读取处于暂时性死区的 b','a 的默认值试图提前读取尚未初始化的 b，触发 ReferenceError。'],
    ['function-basics','实参与形参的对象引用','调用后 user.name 是什么？','function rename(person){person.name="B";person={name:"C"}}const user={name:"A"};rename(user);',["B","A","C","undefined"],'对象属性修改会影响同一对象|随后 person 重新指向新对象|不会改调用方变量的指向','原对象先被改为 B，局部形参再赋新对象不影响 user。'],
    ['function-basics','剩余参数与 arguments 的区别','普通函数调用 f(1,2,3) 的结果是什么？','function f(a,...rest){return [a,rest.length,arguments.length]}',["[1,2,3]","[1,3,2]","[1,2,2]","TypeError"],'rest 只收剩余参数|arguments 收到所有实参|a 占一个位置','a=1，rest 有两个元素，arguments 长度为 3。'],
    ['function-expressions','函数表达式在赋值前不可调用','下列代码在第一行发生什么？','run();const run=function(){return 1};',["ReferenceError，run 尚在暂时性死区","返回 1","TypeError，run 是 undefined","只在严格模式报错"],'const 绑定已建立但未初始化|函数表达式要等赋值执行|读取 run 会触发 TDZ','在 const 初始化前读取 run 产生 ReferenceError。'],
    ['function-expressions','命名函数表达式可自我递归','哪种调用在外部变量改名后仍可递归？','let f=function inner(n){return n ? n*inner(n-1) : 1};let g=f;f=null;g(3)',["6","TypeError","0","ReferenceError"],'函数内部名称 inner 独立于外部 f|g 仍指向该函数|递归计算 3×2×1','命名函数表达式内部可用 inner 稳定引用自身。'],
    ['function-expressions','回调表达式只在条件通过后执行','calls 最终为多少？','let calls=0;const make=()=>{calls++;return ()=>1};if(false){const fn=make();fn()}',["0","1","2","ReferenceError"],'函数表达式 make 已创建|但函数体仅在调用时运行|if 分支未进入','没有执行 make()，因此 calls 保持 0。'],
    ['function-expressions','表达式可以按条件赋给同一变量','若 flag=false，handler() 返回什么？','const handler=flag ? function(){return "A"} : function(){return "B"};',["B","A","undefined","SyntaxError"],'条件运算只选一个表达式|flag 为 false|右侧函数被赋给 handler','handler 指向第二个函数，调用得到 B。'],
    ['arrow-functions-basics','箭头函数不绑定自己的 this','方法中的箭头函数返回什么？','const user={name:"Lin",get(){return ()=>this.name}};user.get()();',["Lin","undefined","Window","TypeError"],'get 作为方法调用|箭头函数捕获 get 的 this|随后调用仍读取 user.name','箭头函数沿用创建位置的 this，返回 Lin。'],
    ['arrow-functions-basics','箭头函数不能用 new 调用','下面操作会怎样？','const Person=(name)=>({name});new Person("A");',["TypeError，箭头函数不是构造器","得到 {name:'A'}","得到空对象","SyntaxError"],'箭头函数没有构造能力|返回对象不等于可用 new|new 会先检查构造器','箭头函数不可作为构造器使用。'],
    ['arrow-functions-basics','花括号箭头函数需要显式 return','map 的结果是什么？','[1,2].map(x=>{x*2});',["[undefined,undefined]","[2,4]","[]","SyntaxError"],'花括号是函数体|表达式求值不会自动返回|没有 return 就是 undefined','每次回调都没有返回值，map 生成两个 undefined。'],
    ['arrow-functions-basics','async 箭头函数的返回值会被包装','result 是什么？','const twice=async x=>x*2;const result=twice(3);',["一个最终兑现为 6 的 Promise","数字 6","返回 undefined 的函数","抛 TypeError"],'async 函数调用立即返回 Promise|函数体中 x*2 的结果为 6|6 成为兑现值','async 箭头函数和普通 async 函数一样，调用结果是 Promise。'],
    ['javascript-specials','数组和对象都是真值','条件是否执行？','if([] && {}){run()}',["会；空数组和空对象都是真值","不会；二者都是空值","不会；[] 转换为数字 0","抛 TypeError"],'布尔转换对象不看内容|数组和普通对象都是对象|&& 两边均为真值','空数组和空对象在条件判断中均是真值。'],
    ['javascript-specials','加号与减号采用不同转换','结果分别是什么？','"4"+1; "4"-1;',["'41'、3","5、3","'41'、'3'","NaN、3"],'二元 + 可做字符串拼接|- 会转为数值计算|两个表达式规则不同','加号拼接成 41；减号转换字符串数字后得到 3。'],
    ['javascript-specials','宽松相等与关系比较不能类推','下面结果是什么？','null == undefined; null < 1;',["true、true","false、true","true、false","false、false"],'null 与 undefined 在 == 下相等|关系比较会转换 null 为 0|0<1','宽松相等为 true；关系比较时 0<1 也为 true。'],
    ['javascript-specials','可选链阻止访问但不替代所有校验','obj 为 null 时表达式结果是什么？','const result=obj?.profile?.name ?? "访客";',["访客","undefined","null","TypeError"],'可选链遇到 null 停止访问|结果为 undefined|?? 提供后备值','obj 为 null 时链式访问返回 undefined，?? 最终给出访客。']
  ];
  const counts=new Map();
  for (const [lesson,title,prompt,example,options,hints,explanation] of cases) {
    const n=(counts.get(lesson)||0)+1;counts.set(lesson,n);
    choice(`${lesson}-exp-${String(n).padStart(2,'0')}`,lesson,title,prompt,example,options,0,hints.split(/(?<!\|)\|(?!\|)/),explanation,'中等');
  }
}
