export function addLanguageMiscDepthExercises({ choice }) {
  const cases = [
    ['proxy','严格模式中 set 陷阱返回 false','Proxy 的 set 陷阱返回 false。严格模式下执行 proxy.x=1 通常会怎样？','"use strict";const proxy=new Proxy({}, {set(){return false}});proxy.x=1;',['抛 TypeError；陷阱报告赋值失败','赋值成功，target.x 变成 1','赋值静默成功但 proxy.x 自动变 1','自动重试直到 set 返回 true'],['set 陷阱返回布尔成功状态。','严格模式对赋值失败会抛错。','没有转发写入 target。'],'set 返回 false 表示赋值失败；严格模式下该赋值抛 TypeError。'],
    ['proxy','has 陷阱控制 in 运算符','Proxy 定义 has 陷阱，始终对键 hidden 返回 false。执行 "hidden" in proxy 会怎样？','const target={hidden:1};const proxy=new Proxy(target,{has(t,key){return key==="hidden"?false:Reflect.has(t,key)}});',['返回 false；in 会调用 has 陷阱','返回 true；in 永远绕过 Proxy','删除 target.hidden 后返回 false','抛 TypeError，因为 has 陷阱不能返回布尔值'],['in 运算符是可被 Proxy 拦截的操作。','has 陷阱显式对 hidden 返回 false。','该属性可配置，未违反必须报告的限制。'],'has 陷阱可改变 in 的可见性；这里 hidden 被隐藏，结果为 false。'],
    ['eval','直接 eval 与间接 eval 的作用域','普通函数局部有 const secret=7。哪种调用可读取这个局部绑定？','function f(){const secret=7;return [eval("secret"),(0,eval)("typeof secret")]}',['直接 eval("secret") 可读取 7；间接 eval 在全局上下文求值','两种都只能读取全局 secret','两种都自动读取局部 secret','间接 eval 会自动把 secret 删除'],['直接 eval 保留调用处词法环境。','逗号表达式取出 eval 函数值，形成间接调用。','间接 eval 在全局环境执行。'],'直接 eval 可访问局部 secret；(0,eval) 是间接 eval，不使用同一局部环境。'],
    ['eval','合法表达式也可能带副作用','把用户输入直接 eval，并只检查它能否返回数字，为什么仍不安全？','const result=eval(userText);if(typeof result==="number")use(result);',['输入可先执行副作用再返回数字，结果类型检查来得太晚','只要结果是数字就不可能有副作用','eval 自动移除赋值和函数调用','typeof 会在执行前阻止输入运行'],['eval 会先执行输入代码。','代码可改变状态、调用函数或读取环境。','执行后的类型检查不能阻止已发生的行为。'],'输入可以在返回数字前执行任意副作用，因此不能用结果类型验证来限制 eval。'],
    ['eval','eval 对非字符串参数不执行代码','eval 接收数字 5，而不是字符串代码时，结果是什么？','eval(5);',['数字 5 原样返回','抛 SyntaxError','字符串 "5"','自动执行五次空语句'],['eval 只对字符串解析并执行。','其他类型参数按原值返回。','不会隐式把数字转成源码。'],'eval(5) 返回数字 5，不把它转成字符串后再执行。'],
    ['currying-partials','分步参数函数与普通二元调用不同','curryAdd 定义为 a=>b=>a+b。curryAdd(2,3) 的结果是什么？','const curryAdd=a=>b=>a+b;',['一个等待 b 的函数；第二个实参 3 被第一层忽略','数字 5','数字 NaN','抛 SyntaxError'],['第一层箭头函数只有形参 a。','额外实参不会自动传到返回的函数。','要得到 5 需调用 curryAdd(2)(3)。'],'柯里化把参数分布到多次调用；一次传两个参数不会自动调用第二层函数。'],
    ['currying-partials','重复使用第一段返回函数','const addTax=make(0.1) 返回一个函数。之后两次调用 addTax(100)、addTax(200)，为何都能复用同一税率？','const make=rate=>price=>price*(1+rate);',['内层闭包保留 rate 绑定，两个调用各自提供 price','第二次调用会覆盖 rate 为 200','price 与 rate 都被固定为第一次调用值','箭头函数只能调用一次'],['第一段创建带 rate 的函数。','每次第二段调用有新的 price。','rate 保存在外层词法环境。'],'局部应用固定税率，返回函数可针对多个价格重复执行。'],
    ['reference-type','条件表达式取出的函数失去原接收者','严格模式下，条件表达式选出 user.show 再立即调用。this 是否仍是 user？','"use strict";const user={name:"Lin",show(){return this.name}};(true?user.show:user.show)();',['不是；条件表达式结果是函数值，直接调用时 this 为 undefined','是；只要源码里出现 user.show 就保留 user','是；条件表达式自动调用 bind','this 变成条件值 true'],['成员访问产生的接收者信息可能被外层表达式丢掉。','条件表达式返回的是函数值。','严格模式下直接调用普通函数的 this 为 undefined。'],'条件表达式不保留原成员引用的接收者，调用 show 读取 this.name 会出错。'],
    ['reference-type','显式 call 可恢复需要的接收者','提取 obj.show 到变量 fn 后，哪种调用明确让 show 内 this 指向 obj？','const fn=obj.show;',['fn.call(obj)','fn()','(fn)()','fn.call(undefined)'],['变量 fn 只保存函数值。','call 第一个参数指定 this。','括号不会凭空恢复原对象。'],'fn.call(obj) 显式指定接收者，避免方法提取后丢失 this。'],
    ['bigint','先转 Number 会丢失大整数精度','十进制文本 "9007199254740993" 要保持精确。哪种转换路径正确？','',['直接 BigInt("9007199254740993")','先 Number(text)，再 BigInt(number)','parseFloat(text) 后再 BigInt','用 Number(text) 即可保持所有整数精度'],['该值超过 Number 的安全整数范围。','先转 Number 已可能舍入。','BigInt 可直接解析整数字符串。'],'直接从十进制整数字符串创建 BigInt，避免经 Number 中转造成不可恢复的精度损失。'],
    ['bigint','宽松相等不等于类型相同','表达式 2n == 2 与 2n === 2 分别是什么结果？','',['true 与 false','都为 true','都为 false','前者抛 TypeError，后者为 false'],['BigInt 与 Number 是不同类型。','宽松相等可在可比较数值间进行比较。','严格相等还要求类型相同。'],'2n == 2 为 true；2n === 2 为 false。比较可跨类型，混合算术仍需要显式转换。'],
    ['unicode','非 BMP 码点仍占两个 UTF-16 单元','String.fromCodePoint(0x1F642) 创建一个表情。其字符串 length 是多少？','',['2','1','4','0'],['单个 Unicode 码点不一定只占一个 UTF-16 单元。','该码点在 BMP 之外。','UTF-16 用一对代理项表示它。'],'这个表情是一个码点，但由两个 UTF-16 代码单元组成，length 为 2。'],
    ['unicode','码点数仍不等于用户感知字形数','字符串 "e" 加组合重音符号，看起来像一个带重音的字母。Array.from(text).length 通常是多少？','const text="e\u0301";',['2；两个码点可组成一个显示字形','1；Array.from 自动按字形簇分组','3；每个字符都占三个码点','0；组合符号会删除前面的 e'],['Array.from 字符串按码点迭代。','e 与组合重音是两个码点。','用户感知字形需要更高层的分段规则。'],'Array.from(text) 得到两个码点元素；码点长度不等于字形簇数量。']
  ];
  const indexes=new Map();
  for (const [lessonId,title,prompt,example,options,hints,explanation] of cases) {
    const index=(indexes.get(lessonId)||0)+1;
    indexes.set(lessonId,index);
    choice(lessonId+'-depth-'+String(index).padStart(2,'0'),lessonId,title,prompt,example,options,0,hints,explanation);
  }
}
