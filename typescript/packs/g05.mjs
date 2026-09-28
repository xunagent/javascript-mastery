import { mc, task, ok, bad, run } from './author.mjs';
const id=n=>`t05-l${String(n).padStart(2,'0')}`;
const m=(l,n,title,prompt,options,explanation,hints,extra={})=>mc(id(l),n,title,prompt,options,explanation,hints.split('｜'),extra);
const t=(l,n,title,prompt,files,solution,tests,explanation,hints,extra={})=>task(id(l),n,title,prompt,files,solution,tests,explanation,hints.split('｜'),extra);
export const questions=[
 m(1,1,'参数不是从调用记录倒推','严格模式下 function double(value){return value*2} 后面只有 double(2)，为什么 value 仍可能报隐式 any？',['普通函数声明的参数不会根据后面的调用全局反推类型','乘法不能用于参数','返回值必须显式声明为 any','只要调用一次就会自动推断参数为 2'],'没有上下文类型的普通参数需要明确类型。调用点可以检查已声明的契约，但不会反向收集所有使用来决定声明。','函数声明位置有上下文类型吗？｜后续调用不是参数标注来源。｜给 value 声明 number。'),
 m(1,2,'返回值推断也有用','function lengthOf(value:string){return value.length} 的返回类型会怎样？',['可推断为 number，不必为了通过检查重复标注','一定是 any','一定是字符串字面量的长度类型','没有返回标注就不能导出'],'编译器可以根据函数体推断返回类型。显式标注适合固定公共契约、及早发现错误，并非所有函数都必须手写。','return 表达式本身具有什么类型？｜字符串 length 是 number。｜函数返回类型可以由此推断。'),
 m(1,3,'遗漏分支返回的后果','function find(flag:boolean){if(flag)return "yes"} 在严格空值检查下，返回类型是什么？',['string | undefined','string','never','boolean'],'false 路径走到函数末尾，运行时返回 undefined。推断会保留这一可能，不能只根据有 return 的分支判断。','分别沿 true 和 false 路径执行。｜false 路径没有返回表达式。｜函数末尾隐式返回 undefined。'),
 t(1,4,'修复未覆盖的返回路径','实现 classify(value:number):"negative"|"zero"|"positive"，按数值正负与零分类。输入保证是有限数值。',
  'export function classify(value:number):"negative"|"zero"|"positive"{if(value>0)return "positive";if(value<0)return "negative";}',
  'export function classify(value:number):"negative"|"zero"|"positive"{if(value>0)return "positive";if(value<0)return "negative";return "zero";}',[
   ok('返回值属于完整分类','import {classify} from "./main";const result:"negative"|"zero"|"positive"=classify(0);'),
   bad('结果不是任意数字','import {classify} from "./main";const n:number=classify(0);'),
   bad('拒绝文本输入','import {classify} from "./main";classify("1");'),
  ],'明确返回类型会在函数定义处暴露漏掉的路径。业务分类需要单独处理零，不能用默认正数掩盖遗漏。','正数和负数之外还有一种有限数值情况。｜这一条路径会走到函数末尾。｜补充 zero 的返回值。',{
   runtime:[run('覆盖三种结果','const {classify}=load("main.js");equal(classify(-3),"negative");equal(classify(0),"zero");equal(classify(-0),"zero");equal(classify(2),"positive");')],
  }),
 m(1,5,'void 不代表调用返回 undefined 的承诺','const f:()=>void=()=>123; const result=f(); result 在调用方的静态类型是什么？',['void，调用方不能依赖返回数字','number，因为实现返回 123','123','undefined，运行时结果必定被删除'],'上下文返回 void 表示调用者忽略返回值，可以接收有返回值的实现。但运行时不会删除那个返回值，静态契约也不让调用者当作数字使用。','区分实现的实际返回与对外签名。｜f 的公开签名是 ()=>void。｜调用者不得依赖实现额外返回的值。',{stage:'reason'}),
 t(1,6,'设计可失败的数值解析','实现 parseCount(text:string):number|undefined。去除两端空白后，只接受一位或多位十进制数字，且转换结果必须是安全整数；其他输入返回 undefined。允许前导零。',
  'export function parseCount(text:string):number|undefined{return Number(text);}',
  'export function parseCount(text:string):number|undefined{const value=text.trim();if(!/^\\d+$/.test(value))return undefined;const count=Number(value);return Number.isSafeInteger(count)?count:undefined;}',[
   ok('返回契约包含失败','import {parseCount} from "./main";const value:number|undefined=parseCount("12");'),
   bad('调用方必须处理失败','import {parseCount} from "./main";const n:number=parseCount("12");'),
   bad('入口只接受文本','import {parseCount} from "./main";parseCount(12);'),
  ],'返回类型说明失败如何表示，实际实现必须验证输入格式与安全范围。Number 本身会接受空串、科学计数法等本题不允许的形式。','先标准化，再检查是否全部是数字字符。｜数字转换后还要检查安全整数范围。｜失败路径统一返回 undefined。',{
   runtime:[run('格式和安全范围共同验证','const {parseCount}=load("main.js");equal(parseCount(" 0012 "),12);equal(parseCount("0"),0);for(const text of [""," ","-1","1.2","1e2","0x10","12x","9007199254740992"])equal(parseCount(text),undefined);equal(parseCount("9007199254740991"),9007199254740991);')],
  }),
 m(1,7,'明确契约暴露重构错误','原函数承诺返回 number，重构后某个分支改成返回 "缺失"。显式 number 返回标注的价值是什么？',['在定义处发现承诺被破坏，而不是悄悄把返回类型扩大','把文本自动转换为数字','运行时过滤这个分支','保证函数永远不抛异常'],'推断可能忠实地扩大结果类型；显式契约则要求实现继续满足已有承诺，帮助控制公共 API 的变化。','需要的是发现契约变化而非隐藏它。｜文本不满足 number。｜错误定位在实现违反承诺的位置。',{stage:'reason'}),
 t(1,8,'迁移：返回结构化结果','导出 Result={ok:true;value:number}|{ok:false;reason:"empty"|"invalid"}；实现 parse(text)，空白输入返回 empty，非空但无法转换成有限数值返回 invalid，否则返回成功数值。此题允许小数与科学计数法。',
  'export type Result={ok:true;value:number}|{ok:false;reason:"empty"|"invalid"};\nexport function parse(text:string):Result{return {ok:true,value:Number(text)};}',
  'export type Result={ok:true;value:number}|{ok:false;reason:"empty"|"invalid"};\nexport function parse(text:string):Result{if(text.trim()==="")return {ok:false,reason:"empty"};const value=Number(text);return Number.isFinite(value)?{ok:true,value}:{ok:false,reason:"invalid"};}',[
   ok('结果必须按状态读取','import {parse,Result} from "./main";const r:Result=parse("1");if(r.ok){const n:number=r.value;}else{const reason:"empty"|"invalid"=r.reason;}'),
   bad('调用方不能直接当成数值','import {parse} from "./main";const n:number=parse("1");'),
   bad('成功结果必须携带数值','import {Result} from "./main";const r:Result={ok:true};'),
  ],'返回结构化联合可以传达不同失败原因，比单个 undefined 提供更多信息。类型不替代校验，空白输入还需在 Number 转换之前处理。','先区分空输入与无效数值。｜Number 的 NaN 和 Infinity 都不是有限值。｜用不同的联合分支表达结果。',{
   runtime:[run('结果区分原因','const {parse}=load("main.js");equal(parse(" "),{ok:false,reason:"empty"});equal(parse("x"),{ok:false,reason:"invalid"});equal(parse("Infinity"),{ok:false,reason:"invalid"});equal(parse("1e2"),{ok:true,value:100});equal(parse("0"),{ok:true,value:0});')],
  }),
 m(1,9,'复测：never 与抛错','function fail(message:string):never{throw new Error(message)} 为什么能声明 never？',['任何正常路径都不返回给调用方，执行会抛出异常','因为返回值可以是任意类型','因为函数没有参数','因为所有抛错函数在运行时被删除'],'never 描述不存在正常完成的结果。它不是 undefined 或 void 的另一种拼写，也不表示函数没有副作用。','函数是否可能正常返回？｜抛出异常结束当前调用路径。｜没有正常结果可供消费。'),
 t(1,10,'复测：固定公共计算契约','实现 ratio(part:number,total:number):number|undefined。当 total 为 0 或任一输入不是有限数时返回 undefined；计算结果非有限时也返回 undefined，否则返回 part/total。',
  'export function ratio(part:number,total:number):number{return part/total;}',
  'export function ratio(part:number,total:number):number|undefined{if(total===0||!Number.isFinite(part)||!Number.isFinite(total))return undefined;const result=part/total;return Number.isFinite(result)?result:undefined;}',[
   ok('调用方看到可能失败','import {ratio} from "./main";const value:number|undefined=ratio(1,2);'),
   bad('不能当作必有数字','import {ratio} from "./main";const n:number=ratio(1,2);'),
   bad('参数数目不能不足','import {ratio} from "./main";ratio(1);'),
  ],'number 类型仍包括 NaN 和 Infinity，类型标注不能替代数值有效性检查。返回契约和实现必须共同表达不可计算的情况。','先排除非法输入和零分母。｜有限输入相除也可能溢出。｜检查结果后再返回。',{
   runtime:[run('常规与不可计算输入','const {ratio}=load("main.js");equal(ratio(1,2),0.5);equal(ratio(0,2),0);for(const [a,b] of [[1,0],[NaN,2],[1,Infinity],[Number.MAX_VALUE,Number.MIN_VALUE]])equal(ratio(a,b),undefined);')],
  }),
 m(2,1,'可选参数在函数体内的类型','function greet(name?:string) 内部，name 的类型是什么？',['string | undefined','string','unknown','null | string'],'允许调用者省略参数，函数体就必须处理 undefined。可选标记改变调用要求，不会自动补默认文本。','不传参数时 JavaScript 得到什么？｜可选不等于有默认值。｜使用字符串方法前需处理 undefined。'),
 m(2,2,'默认值的触发条件','function count(value=3){return value}。count(undefined)、count(0)、count(null) 在仅考虑运行行为时分别返回什么？',['3、0、null','3、3、3','undefined、0、null','3、0、3'],'默认参数只在值为 undefined 或参数省略时触发。严格类型检查会拒绝这里的 null 调用，但 JavaScript 的默认值规则本身不会把 null 当成 undefined。','题目区分了类型检查与运行规则。｜默认初始化只对 undefined 生效。｜零与 null 都不会触发默认值。'),
 m(2,3,'默认参数在必需参数前','function join(prefix="app",name:string){}。怎样使用默认 prefix 并提供 name？',['join(undefined,"main")','join("main")','join(null,"main")','join(,"main")'],'前置默认参数仍占据一个位置，后面的必需参数不能自动左移。显式 undefined 可以触发默认值。','参数绑定按位置而不是按语义猜测。｜name 在第二个位置。｜第一个位置传 undefined。'),
 t(2,4,'修复可选标题','实现 title(name?:string):string，省略或显式 undefined 时返回 "未命名"，否则去除两端空白并返回；空字符串不使用默认标题。',
  'export function title(name?:string):string{return name.trim();}',
  'export function title(name:string="未命名"):string{return name.trim();}',[
   ok('可省略也可显式 undefined','import {title} from "./main";const s:string=title();title(undefined);title("");'),
   bad('null 不是允许的缺省输入','import {title} from "./main";title(null);'),
   bad('不接受数字','import {title} from "./main";title(1);'),
  ],'默认参数补足 undefined 的情况后，函数体获得 string。空文本是已经提供的值，应继续按文本规则处理。','name 可能为 undefined。｜默认参数只补 undefined。｜默认补好后统一 trim。',{
   runtime:[run('区分省略和空文本','const {title}=load("main.js");equal(title(),"未命名");equal(title(undefined),"未命名");equal(title(""),"");equal(title(" Lin "),"Lin");')],
  }),
 m(2,5,'剩余参数为什么用数组','function sum(...values:number[]) 的调用契约是什么？',['可以接收零个或多个数字参数，函数内 values 是数组','只能接收一个数字数组实参','至少接收一个数字','最多接收两个数字'],'剩余参数将多个实参收集到数组。若要求至少一项，应使用必需首项或带剩余部分的元组。','调用时是多个参数，内部才收集成数组。｜number[] 允许空数组。｜这里没有首项必需的约束。'),
 t(2,6,'设计至少一个数的求和','实现 sum，接受至少一个数字及任意多个后续数字，返回总和。不接受零参数调用，也不接受单个数组实参。',
  'export function sum(...values:number[]):number{return values.reduce((total,value)=>total+value,0);}',
  'export function sum(first:number,...rest:number[]):number{return rest.reduce((total,value)=>total+value,first);}',[
   ok('一个或多个数字','import {sum} from "./main";const n:number=sum(1);sum(1,2,3);'),
   bad('首项不能省略','import {sum} from "./main";sum();',[2554,2555]),
   bad('数组不是单个合法数字','import {sum} from "./main";sum([1,2]);'),
   bad('后续项也必须为数字','import {sum} from "./main";sum(1,"2");'),
  ],'必需首参加剩余数组可以表达至少一项。使用 [number,...number[]] 作为剩余参数类型也可以满足同样契约。','普通剩余数组允许零项。｜把第一项单独设为必需。｜后续数字用剩余参数累加。',{
   runtime:[run('首项也参加计算','const {sum}=load("main.js");equal(sum(5),5);equal(sum(0,2,3),5);equal(sum(-1,2,-3),-2);')],
  }),
 m(2,7,'可选与 undefined 联合并不等价','function a(x?:number){} 和 function b(x:number|undefined){} 有何调用差别？',['a() 合法，b() 缺少必需参数；b(undefined) 合法','两者都可以省略参数','b 不能接收 undefined','a 只能接收 undefined'],'值域包含 undefined 不自动让参数位置可省略。可选参数同时改变调用时的参数数量要求。','分别看参数是否带问号。｜b 的位置仍然必需。｜显式 undefined 能满足 b 的值类型。',{stage:'reason'}),
 t(2,8,'迁移：有固定前缀的日志参数','实现 line(level:"info"|"error",...parts:string[]):string，至少一个文本片段；返回 "["+level+"] "+片段用单空格连接。要求类型禁止没有片段的调用。',
  'export function line(level:"info"|"error",...parts:string[]):string{return "["+level+"] "+parts.join(" ");}',
  'export function line(level:"info"|"error",...parts:[string,...string[]]):string{return "["+level+"] "+parts.join(" ");}',[
   ok('级别后允许多个片段','import {line} from "./main";const s:string=line("info","ready");line("error","request","failed");'),
   bad('片段至少一个','import {line} from "./main";line("info");',[2554,2555]),
   bad('级别范围固定','import {line} from "./main";line("debug","x");'),
   bad('片段不接受数字','import {line} from "./main";line("info","count",1);'),
  ],'元组剩余参数在一个位置序列中表达必需首项和任意尾项。至少一个片段是调用约束，不是运行时通过补默认文本来伪造。','日志级别本身不算文本片段。｜剩余参数可使用带首项的元组。｜用 join 保持片段顺序。',{
   runtime:[run('格式与空片段','const {line}=load("main.js");equal(line("info","ready"),"[info] ready");equal(line("error","request","failed"),"[error] request failed");equal(line("info","","x"),"[info]  x");')],
  }),
 m(2,9,'复测：默认值会不会验证范围','function retry(times=3){} 会自动拒绝负数、NaN 或小数吗？',['不会，默认值只处理缺省，数值范围需要另外检查','会，3 会把类型限制为正整数','会，默认参数自动执行 Number.isInteger','只拒绝 NaN'],'参数推断为 number，默认值不建立正整数约束。需要业务验证时应明确编写，不能把初始值当成校验器。','默认值是否包含判断逻辑？｜number 允许多种不适合业务的数值。｜缺省规则和有效性规则应分开。'),
 t(2,10,'复测：前置默认参数','实现 fileName(prefix:string|undefined,name:string):string。name 必须提供；prefix 省略值即 undefined 时使用 "app"，空前缀保留。返回 prefix+"-"+name。可用默认参数实现，但不能让 name 变成可选。',
  'export function fileName(prefix:string|undefined,name?:string):string{return (prefix||"app")+"-"+name;}',
  'export function fileName(prefix:string="app",name:string):string{return prefix+"-"+name;}',[
   ok('显式跳过前置默认参数','import {fileName} from "./main";const s:string=fileName(undefined,"main");fileName("","main");'),
   bad('后置名称不可省略','import {fileName} from "./main";fileName("main");'),
   bad('null 不触发合法默认调用','import {fileName} from "./main";fileName(null,"main");'),
  ],'默认参数在必需参数之前时，可以通过 undefined 触发默认，而不是省掉位置让后续参数自动补位。|| 还会错误替换空前缀。','name 必须保留在第二个位置。｜prefix 的默认只处理 undefined。｜默认参数不应让后置参数变成可选。',{
   runtime:[run('位置和默认行为','const {fileName}=load("main.js");equal(fileName(undefined,"main"),"app-main");equal(fileName("","main"),"-main");equal(fileName("web","main"),"web-main");')],
  }),
 m(3,1,'回调参数从哪里获得类型','[1,2].map(value=>value.toFixed(1)) 中没有给 value 写类型，为何仍能识别 toFixed？',['map 的调用上下文提供了元素参数类型 number','所有箭头函数参数都默认为 number','编译器执行数组后再推断','toFixed 使任意变量自动变成数字'],'有明确上下文的函数表达式可以获得参数类型。这不同于没有上下文的独立函数声明，不能概括为所有参数都可省略标注。','map 已知道当前数组元素类型。｜其回调签名提供上下文。｜value 因此被推断为 number。'),
 m(3,2,'可选回调参数表示谁可以省略','类型 callback:(value:string,index?:number)=>void 中的 index? 表达什么？',['调用回调的一方可能不提供 index，因此回调实现必须考虑 undefined','回调作者可以选择不声明 index，但调用方保证提供','index 总会是 0','回调只能在数组为空时执行'],'可选性是调用契约，表示调用者允许不传。回调实现本来就可以忽略额外参数，不必为此将回调签名参数设为可选。','谁调用这个回调？｜问号赋予调用者省略该参数的权利。｜实现内部就不能假定它始终有值。'),
 m(3,3,'参数较少的回调','forEach 的回调类型提供 value 和 index，但传入 value=>console.log(value) 为什么可以？',['函数可以忽略调用方提供的额外参数','forEach 自动把 index 改成可选并改变元素类型','箭头函数不进行参数检查','所有参数数量不一致的函数都可互换'],'回调可以只使用需要的参数。反过来要求调用方未承诺提供的额外必需参数，则不能认为安全。','回调没有索取更多数据。｜未声明的额外实参可被忽略。｜少用参数和多要求参数是不同方向。'),
 t(3,4,'修复总会提供的索引类型','实现 visit(values:readonly string[],callback)，按顺序对每项恰好调用一次 callback(value,index)。index 总会提供，应为必需 number；返回 void。',
  'export function visit(values:readonly string[],callback:(value:string,index?:number)=>void):void{values.forEach((value,index)=>callback(value,index));}',
  'export function visit(values:readonly string[],callback:(value:string,index:number)=>void):void{values.forEach((value,index)=>callback(value,index));}',[
   ok('索引可直接作为数字使用','import {visit} from "./main";visit(["a"],(value,index)=>{const s:string=value;const n:number=index;index.toFixed();});visit(["a"],value=>{});'),
   bad('元素不是数值','import {visit} from "./main";visit(["a"],(value:number,index:number)=>{});'),
   bad('不能要求未承诺的第三参数','import {visit} from "./main";visit(["a"],(value:string,index:number,extra:boolean)=>{});'),
  ],'既然实现始终提供 index，就应在回调契约中如实声明。用户只需要 value 时可以忽略第二参数，并不需要把它标成可选。','回调实际会收到哪些参数？｜index 总由实现生成。｜去掉问号，让上下文推断获得 number。',{
   runtime:[run('顺序和次数正确','const {visit}=load("main.js");const seen=[];visit(Object.freeze(["a","b"]),(v,i)=>seen.push([v,i]));equal(seen,[["a",0],["b",1]]);let calls=0;visit([],()=>calls++);equal(calls,0);')],
  }),
 m(3,5,'void 回调可以返回数字','const out:number[]=[]; [1,2].forEach(value=>out.push(value)) 为什么可通过？',['forEach 忽略回调返回值，push 返回数字不影响 void 回调契约','push 实际返回 void','void 表示任何返回值都会自动加入结果数组','forEach 的结果是 number[]'],'返回 void 的回调契约允许有值返回但调用方忽略它。这不会把 forEach 变成 map，也不会使 out.push 的结果被收集。','push 的返回值确实是数组长度。｜forEach 不消费这个值。｜void 在此描述调用方的使用方式。',{stage:'reason'}),
 t(3,6,'设计有结果的变换回调','实现 mapText(values:readonly number[],transform:(value:number,index:number)=>string):string[]。按顺序调用 transform 并收集每个返回值，不修改输入。',
  'export function mapText(values:readonly number[],transform:(value:number,index:number)=>string):string[]{values.forEach(transform);return [];}',
  'export function mapText(values:readonly number[],transform:(value:number,index:number)=>string):string[]{return values.map((value,index)=>transform(value,index));}',[
   ok('回调上下文保留参数类型','import {mapText} from "./main";const out:string[]=mapText([2],(value,index)=>value.toFixed()+":"+index.toFixed());'),
   bad('返回值必须为文本','import {mapText} from "./main";mapText([2],value=>value*2);'),
   bad('不能提供 void 回调','import {mapText} from "./main";mapText([2],value=>{});'),
  ],'当调用方需要回调结果时，应声明具体返回类型并实际收集结果。void 不适合描述变换函数，forEach 也不会替你返回新数组。','这个回调的输出是业务所需数据。｜把返回类型固定为 string。｜每次调用结果都要进入结果数组。',{
   runtime:[run('收集回调输出并保持顺序','const {mapText}=load("main.js");const seen=[];const result=mapText(Object.freeze([4,7]),(value,index)=>{seen.push([value,index]);return index+":"+value;});equal(result,["0:4","1:7"]);equal(seen,[[4,0],[7,1]]);equal(mapText([],()=>"x"),[]);')],
  }),
 m(3,7,'同步 void 回调与异步实现','一个同步函数接收 ()=>void，却传入 async ()=>{await work()}；类型上可能被接受，是否意味着调用方会等待？',['不意味着，调用方必须实际处理返回的 Promise 才会等待','意味着 void 会自动 await','意味着 async 会被转换成同步函数','意味着所有异常会自动由调用方捕获'],'void 回调的兼容规则可能允许异步函数，但不保证调用方消费 Promise。异步协作应明确约定 Promise 返回及等待行为。','类型兼容并不改写调用方流程。｜async 始终返回 Promise。｜不 await 就不会因为类型自动等待。',{stage:'reason',sourceIds:['functions','builtin']}),
 t(3,8,'迁移：可注入的筛选规则','实现 select(values:readonly string[],accept:(value:string,index:number)=>boolean):string[]，仅保留回调返回 true 的原始元素，顺序不变，回调每项恰好调用一次。',
  'export function select(values:readonly string[],accept:(value:string,index:number)=>boolean):string[]{return [...values];}',
  'export function select(values:readonly string[],accept:(value:string,index:number)=>boolean):string[]{return values.filter((value,index)=>accept(value,index));}',[
   ok('规则使用文本及位置','import {select} from "./main";const out:string[]=select(["a"],(value,index)=>value.length>index);'),
   bad('规则必须返回布尔','import {select} from "./main";select(["a"],value=>value.length);'),
   bad('不能把元素当作数字','import {select} from "./main";select(["a"],(value:number)=>value>0);'),
  ],'把规则作为回调传入可复用遍历逻辑，但类型必须准确表达规则结果。此题主动要求 boolean，避免接受含糊的真假值返回。','回调决定保留与否，而不是转换元素。｜结果保留原来的字符串。｜filter 可保证顺序并逐项调用规则。',{
   runtime:[run('筛选结果不变换元素','const {select}=load("main.js");const seen=[];const input=Object.freeze(["a","bb","c"]);equal(select(input,(v,i)=>{seen.push([v,i]);return i!==1;}),["a","c"]);equal(seen,[["a",0],["bb",1],["c",2]]);equal(select(input,()=>false),[]);')],
  }),
 m(3,9,'复测：高要求的回调不安全','调用方承诺可能传入 string|number。只接受 string 的回调为何在严格函数检查下不安全？',['调用方可能传数字，而回调没有处理能力','联合类型不能传给任何函数','字符串函数必须返回字符串','参数名字不一致导致不兼容'],'回调参数约束必须覆盖调用方承诺可能提供的值。不能把要求更窄的实现塞给会提供更广输入的调用方。','找一个回调无法处理的合法调用值。｜数字属于调用方承诺范围。｜回调必须能处理它。'),
 t(3,10,'复测：延迟提供缺省值','实现 valueOr(value:string|undefined,fallback:()=>string):string。value 不为 undefined 时原样返回且不调用 fallback，否则恰好调用一次 fallback 并返回其结果。',
  'export function valueOr(value:string|undefined,fallback:()=>string):string{const defaultValue=fallback();return value??defaultValue;}',
  'export function valueOr(value:string|undefined,fallback:()=>string):string{return value===undefined?fallback():value;}',[
   ok('回调返回文本','import {valueOr} from "./main";const s:string=valueOr(undefined,()=>"default");valueOr("",()=>"fallback");'),
   bad('回调不能返回数字','import {valueOr} from "./main";valueOr(undefined,()=>1);'),
   bad('不能要求调用方提供参数','import {valueOr} from "./main";valueOr(undefined,(key:string)=>key);'),
  ],'传入函数而不是直接值可以实现按需计算，但只有在需要时调用才真正保持惰性。提前执行会造成多余开销或副作用。','先判断值是否缺失。｜已有值时不能触发回调。｜缺失分支再调用 fallback 一次。',{
   runtime:[run('按需执行且次数精确','const {valueOr}=load("main.js");let calls=0;const fallback=()=>{calls++;return "fallback";};equal(valueOr("",fallback),"");equal(valueOr("ready",fallback),"ready");equal(calls,0);equal(valueOr(undefined,fallback),"fallback");equal(calls,1);')],
  }),
 m(4,1,'async 的返回包装','async function count(){return 3} 的调用结果是什么类型？',['Promise<number>','number','Promise<Promise<number>>','void'],'async 将正常完成的结果放入 Promise。函数体返回数值，不代表调用方立即拿到数值。','区分函数体 return 与调用表达式。｜async 的调用结果是 Promise。｜等待后才获得数字。'),
 m(4,2,'Promise 的类型参数表示什么','Promise<User> 是否声明了拒绝时一定抛出 Error？',['没有，它描述成功结果为 User，不编码拒绝原因类型','是，所有 Promise 都只能拒绝 Error','是，User 同时描述错误对象','没有，因此 Promise 不允许失败'],'Promise 的类型参数主要描述兑现结果。JavaScript 可以抛出或拒绝任意值，catch 中仍需要判断原因类型。','一个类型参数没有分别描述成功和失败。｜拒绝原因可能来自外部代码。｜不能直接假设 catch 值拥有 message。'),
 m(4,3,'返回 Promise 会多包一层吗','async function load(){return Promise.resolve(3)} 的返回类型是什么？',['Promise<number>','Promise<Promise<number>>','number','Promise<void>'],'async 会采用返回 Promise 的最终状态，不要求调用者等待两层 Promise 才得到数值。','async 的返回会采用可等待值的状态。｜嵌套的等待关系会被展开。｜最终成功值仍是数字。'),
 t(4,4,'修复异步返回标注','实现 readLength(load:()=>Promise<string>):Promise<number>，调用 load 一次，等待文本后返回长度；失败保持拒绝，不吞掉错误。',
  'export async function readLength(load:()=>Promise<string>):number{return (await load()).length;}',
  'export async function readLength(load:()=>Promise<string>):Promise<number>{return (await load()).length;}',[
   ok('结果必须等待','import {readLength} from "./main";const result:Promise<number>=readLength(async()=>"abc");'),
   bad('不能同步读取数值','import {readLength} from "./main";const n:number=readLength(async()=>"abc");'),
   bad('加载器必须返回文本','import {readLength} from "./main";readLength(async()=>3);'),
  ],'async 函数的返回标注必须体现 Promise。await 获得文本后才能读取长度；没有捕获的拒绝会向调用者传播。','错误在函数的公开返回标注。｜async 返回 Promise<number>。｜等待 load 后读取 length。',{
   runtime:[run('等待结果并传播原始失败','const {readLength}=load("main.js");let calls=0;equal(await readLength(async()=>{calls++;await Promise.resolve();return "abc";}),3);equal(calls,1);const marker={reason:"offline"};let rejected=false;try{await readLength(async()=>{throw marker;});}catch(error){rejected=true;check(error===marker);}check(rejected);')],
  }),
 m(4,5,'forEach 不会等待回调','await items.forEach(async item=>save(item)) 能保证所有 save 完成后继续吗？',['不能，forEach 返回 void，不收集回调的 Promise','能，前面的 await 会自动等待全部回调','能，只要 save 返回 Promise<void>','只能保证等待最后一项'],'await 只能等待其表达式提供的值。forEach 没有把异步任务组合成 Promise，需要用顺序循环或 Promise.all 等明确组织。','forEach 实际返回什么？｜回调结果是否被收集？｜等待 undefined 不能代表任务全部完成。',{stage:'reason'}),
 t(4,6,'设计顺序异步处理','实现 saveAll(items:readonly string[],save:(item:string)=>Promise<void>):Promise<void>，按顺序逐项等待保存，上一项完成才开始下一项；失败立即停止并传播原始原因。',
  'export async function saveAll(items:readonly string[],save:(item:string)=>Promise<void>):Promise<void>{items.forEach(async item=>{await save(item);});}',
  'export async function saveAll(items:readonly string[],save:(item:string)=>Promise<void>):Promise<void>{for(const item of items){await save(item);}}',[
   ok('异步流程返回完成信号','import {saveAll} from "./main";const p:Promise<void>=saveAll(["a"],async item=>{const s:string=item;});'),
   bad('保存器需要 Promise','import {saveAll} from "./main";saveAll(["a"],item=>{});'),
   bad('输入是文本集合','import {saveAll} from "./main";saveAll([1],async()=>{});'),
  ],'for...of 中逐次 await 建立明确的先后关系。Promise.all 是并发组合，不满足本题的顺序约束；forEach 则没有完成信号。','每次开始前都要等待上次完成。｜使用可以在循环体 await 的结构。｜让异常自然中断循环并向外传播。',{
   runtime:[run('启动顺序与完成顺序一致','const {saveAll}=load("main.js");const events=[];await saveAll(Object.freeze(["a","b"]),async item=>{events.push("start:"+item);await Promise.resolve();events.push("end:"+item);});equal(events,["start:a","end:a","start:b","end:b"]);'),run('失败阻止后续调用','const {saveAll}=load("main.js");const seen=[];const marker={failure:true};let rejected=false;try{await saveAll(["a","b","c"],async item=>{seen.push(item);if(item==="b")throw marker;});}catch(error){rejected=true;check(error===marker);}check(rejected);equal(seen,["a","b"]);')],
   wrongSolutions:[{'main.ts':'export async function saveAll(items:readonly string[],save:(item:string)=>Promise<void>):Promise<void>{await Promise.all(items.map(save));}'}],
  }),
 m(4,7,'Promise.all 的结果顺序','Promise.all([slow(),fast()]) 中 fast 先完成，成功结果数组按什么顺序排列？',['按输入顺序，slow 的值仍在第一项','按完成先后，fast 的值在第一项','按结果值大小排序','结果顺序不确定'],'Promise.all 保留输入位置关系，完成时间不决定输出位置。它会在所有任务成功后兑现，任一拒绝则整体拒绝。','位置对应关系对调用者很重要。｜并发完成顺序和结果数组顺序不同。｜输出按传入次序排列。',{stage:'reason'}),
 t(4,8,'迁移：并发加载且保留位置','实现 pair(first:()=>Promise<string>,second:()=>Promise<number>):Promise<[string,number]>，两项都立即启动而不等待第一项完成，全部成功后按输入顺序返回元组。',
  'export async function pair(first:()=>Promise<string>,second:()=>Promise<number>):Promise<[string,number]>{return [await first(),await second()];}',
  'export async function pair(first:()=>Promise<string>,second:()=>Promise<number>):Promise<[string,number]>{return Promise.all([first(),second()]);}',[
   ok('保留位置类型','import {pair} from "./main";const result:Promise<[string,number]>=pair(async()=>"a",async()=>2);'),
   bad('第二项必须是数值','import {pair} from "./main";pair(async()=>"a",async()=>"b");'),
   bad('不能颠倒结果位置','import {pair} from "./main";const result:Promise<[number,string]>=pair(async()=>"a",async()=>2);'),
  ],'先调用两个加载器再等待组合 Promise，才能建立并发启动。Promise.all 保留位置，并根据上下文形成元组返回。','数组元素里的 await 会导致顺序等待。｜先取得两个 Promise。｜用 Promise.all 组合结果。',{
   runtime:[run('在第一项完成前启动第二项','const {pair}=load("main.js");const events=[];let release;const first=()=>{events.push("first");return new Promise(resolve=>{release=resolve;});};const second=()=>{events.push("second");return Promise.resolve(7);};const pending=pair(first,second);const started=events.slice();release("ready");equal(await pending,["ready",7]);equal(started,["first","second"]);')],
  }),
 m(4,9,'复测：await 与 catch','try{return task()}catch(error){...} 和 try{return await task()}catch(error){...} 在异步函数里有什么相关区别？',['后者可在该 try/catch 捕获 Promise 的异步拒绝，前者直接返回 Promise 时不能靠该 catch 捕获后续拒绝','两者都自动忽略拒绝','前者一定会捕获所有拒绝，后者不会','return await 会把拒绝变成成功值'],'try/catch 捕获当前执行中抛出的异常。await 会把拒绝在等待位置抛出，使周围 catch 可以处理；直接返回 Promise 则交给调用方等待。','拒绝发生时 try 块是否仍在等待？｜await 将拒绝转换为此处抛出。｜需要本地捕获时等待位置很重要。'),
 t(4,10,'复测：将异步失败变成结果','导出 Result={ok:true;value:string}|{ok:false;message:string}。实现 attempt(task:()=>Promise<string>):Promise<Result>，成功保留文本；失败为 Error 时取 message，否则使用 String(error)。同步抛出也应转为失败结果。',
  'export type Result={ok:true;value:string}|{ok:false;message:string};\nexport async function attempt(task:()=>Promise<string>):Promise<Result>{return {ok:true,value:await task()};}',
  'export type Result={ok:true;value:string}|{ok:false;message:string};\nexport async function attempt(task:()=>Promise<string>):Promise<Result>{try{return {ok:true,value:await task()};}catch(error){return {ok:false,message:error instanceof Error?error.message:String(error)};}}',[
   ok('结果联合封装在 Promise 中','import {attempt,Result} from "./main";const p:Promise<Result>=attempt(async()=>"a");'),
   bad('不能假定总是成功对象','import {attempt} from "./main";const p:Promise<{ok:true;value:string}>=attempt(async()=>"a");'),
   bad('成功文本契约不可放宽','import {attempt} from "./main";attempt(async()=>3);'),
  ],'明确选择结果联合后，需要在异步等待周围捕获失败。错误原因是 unknown，应先判断 Error，再处理其他可抛出的值。','try 必须包住调用与 await。｜catch 里的值不保证是 Error。｜两条路径返回不同的判别联合成员。',{
   runtime:[run('成功、异步拒绝与同步抛出','const {attempt}=load("main.js");equal(await attempt(async()=>""),{ok:true,value:""});equal(await attempt(async()=>{throw new Error("offline");}),{ok:false,message:"offline"});equal(await attempt(async()=>{throw 7;}),{ok:false,message:"7"});equal(await attempt(()=>{throw "sync";}),{ok:false,message:"sync"});')],
  }),
 m(5,1,'调用方看到哪些签名','函数声明了 (x:string):string 和 (x:number):number 两个重载，实现签名为 (x:string|number):string|number。调用方能直接使用实现签名接收 string|number 变量吗？',['不能，调用时需要匹配公开重载，必要时另加联合重载','能，实现签名总是第三个公开重载','能，所有重载自动合并为一个联合','不能，因为联合变量永远不能传给函数'],'实现签名用于实现体检查，不自动对外提供额外调用方式。联合实参可能无法独立匹配任何一个具体重载。','区分重载声明和带函数体的实现。｜调用解析只看公开签名。｜想接受联合实参，需要公开支持它。'),
 m(5,2,'重载需要几个运行函数','TypeScript 函数重载在输出 JavaScript 后通常保留什么？',['一个实现函数，重载声明被擦除','每个重载生成一个运行函数','一个自动按参数类型分发的代理','所有声明都作为校验器运行'],'重载描述多种调用契约，不生成业务分支。单个实现仍需要根据实际输入选择正确行为。','哪个声明具有函数体？｜纯类型声明会被擦除。｜真实分支需要自己编写。'),
 m(5,3,'相同输出还需要重载吗','length(value:string) 和 length(value:readonly string[]) 都返回 number，且应支持联合变量，通常如何建模更直接？',['用一个 string|readonly string[] 参数与 number 返回值','一定要使用两个重载且禁止联合参数','用 any 参数以免重复声明','为每一个字符串长度写一个重载'],'当返回关系不需要按输入区分时，联合参数通常足够，也自然支持已经为联合类型的实参。重载应服务于真实调用关系。','两种输入的返回承诺有没有差异？｜这里结果都为 number。｜联合能直接表达两种候选。'),
 t(5,4,'恢复输入输出的对应关系','实现 convert：传 number 返回其十进制文本；传 string 返回去空白后的文本长度。调用方必须得到对应的 string 或 number，不能只得到宽联合。可用重载表达。',
  'export function convert(value:number|string):string|number{return typeof value==="number"?String(value):value.trim().length;}',
  'export function convert(value:number):string;\nexport function convert(value:string):number;\nexport function convert(value:number|string):string|number{return typeof value==="number"?String(value):value.trim().length;}',[
   ok('每类调用有确定结果','import {convert} from "./main";const a:string=convert(12);const b:number=convert(" a ");'),
   bad('数字输入不返回数值','import {convert} from "./main";const a:number=convert(12);'),
   bad('不支持布尔','import {convert} from "./main";convert(true);'),
  ],'公开签名保留输入与输出的联系，宽实现签名则允许在函数体中处理所有分支。运行测试仍检查分支行为，防止签名与实现不一致。','一个宽返回联合会丢失对应关系。｜分别声明两种输入的返回值。｜单个实现用 typeof 处理实际输入。',{
   runtime:[run('签名与实际返回对应','const {convert}=load("main.js");equal(convert(12),"12");equal(convert(0),"0");equal(convert(" a "),1);equal(convert(""),0);')],
   wrongSolutions:[{'main.ts':'export function convert(value:number):string;export function convert(value:string):number;export function convert(value:number|string):string|number{return typeof value==="number"?value:value;}'}],
  }),
 m(5,5,'实现兼容不是完整业务证明','重载承诺 number 输入返回 string、string 输入返回 number，实现返回类型为 string|number；如果实现故意颠倒分支，类型检查一定能发现吗？',['不一定，宽实现签名可能兼容，所以仍需测试分支对应关系','一定，编译器会穷举每个运行输入','不会，但重载在运行时自动纠正返回值','会，只要给参数加 readonly'],'重载兼容检查并非对每个分支的语义证明。实现返回宽联合时，可能存在符合宽类型却违背具体重载承诺的行为。','实现体主要依据哪个签名检查？｜宽联合允许两种返回类型。｜还要用运行测试验证对应关系。',{stage:'reason'}),
 t(5,6,'支持联合实参的格式化接口','实现 format：字符串转大写并返回 string，数字数组逐项保留一位小数并返回 string[]。既支持具体输入的精确返回，也支持 string|readonly number[] 变量返回 string|string[]。',
  'export function format(value:string):string;\nexport function format(value:readonly number[]):string[];\nexport function format(value:string|readonly number[]):string|string[]{return typeof value==="string"?value.toUpperCase():value.map(n=>n.toFixed(1));}',
  'export function format(value:string):string;\nexport function format(value:readonly number[]):string[];\nexport function format(value:string|readonly number[]):string|string[];\nexport function format(value:string|readonly number[]):string|string[]{return typeof value==="string"?value.toUpperCase():value.map(n=>n.toFixed(1));}',[
   ok('具体与联合调用都成立','import {format} from "./main";const a:string=format("x");const b:string[]=format([1]);declare const mixed:string|readonly number[];const c:string|string[]=format(mixed);'),
   bad('文本结果不是数组','import {format} from "./main";const a:string[]=format("x");'),
   bad('数组元素不能是文本','import {format} from "./main";format(["x"]);'),
  ],'加入公开联合重载才能让联合变量参与调用；将具体重载保留在前面，让具体调用仍获得更精确结果。实现签名本身不充当公开兜底。','初始实现已处理所有运行分支。｜缺的是调用方可见的联合签名。｜在具体签名后增加联合重载。',{
   runtime:[run('保留文本或集合结构','const {format}=load("main.js");equal(format("abc"),"ABC");equal(format(Object.freeze([1,2.25])),["1.0","2.3"]);equal(format([]),[]);')],
  }),
 m(5,7,'重载不是依赖返回目标选参','给函数结果写 const result:string，能否让 TypeScript 自动选择一个本来不接受当前实参的重载？',['不能，重载首先必须匹配实参，目标返回类型不能让非法输入合法','能，只要存在 string 返回重载','能，所有类型都由左边决定','只有开启 strict 才可以'],'返回目标的标注会检查结果是否兼容，但不能代替重载对参数的要求。不要依靠接收变量的类型修复输入不匹配。','先判断调用本身是否有效。｜目标变量不是另一套实参。｜重载必须支持传入值。',{stage:'reason'}),
 t(5,8,'迁移：同步与异步模式','实现 read(mode,source)：mode 为 "sync" 时 source:()=>string，立即调用并返回 string；mode 为 "async" 时 source:()=>Promise<string>，调用并返回 Promise<string>。两种输入必须配对，拒绝交叉组合。',
  'export function read(mode:"sync"|"async",source:(()=>string)|(()=>Promise<string>)):string|Promise<string>{return source();}',
  'export function read(mode:"sync",source:()=>string):string;\nexport function read(mode:"async",source:()=>Promise<string>):Promise<string>;\nexport function read(mode:"sync"|"async",source:(()=>string)|(()=>Promise<string>)):string|Promise<string>{return source();}',[
   ok('模式与来源配对','import {read} from "./main";const a:string=read("sync",()=>"a");const b:Promise<string>=read("async",async()=>"b");'),
   bad('同步模式不接收异步来源','import {read} from "./main";read("sync",async()=>"a");'),
   bad('异步模式不接收同步来源','import {read} from "./main";read("async",()=>"a");'),
  ],'多个参数分别用独立联合会允许交叉组合。重载把参数关系组织为两套合法调用，并提供对应返回类型。','约束不只在单个参数，还在参数配对。｜分别声明两套模式与来源。｜实现仍只需调用一次 source。',{
   runtime:[run('两种模式都只调用一次','const {read}=load("main.js");let count=0;equal(read("sync",()=>{count++;return "a";}),"a");equal(count,1);const p=read("async",async()=>{count++;return "b";});check(typeof p.then==="function");equal(await p,"b");equal(count,2);')],
  }),
 m(5,9,'复测：不要凭空开放实现签名','公开重载只支持 1 个或 3 个数字参数，实现体有三个参数且后两个可选。两参数调用是否因此自动合法？',['不合法，公开重载没有承诺这种调用','合法，实现可选参数自动公开','合法，只要第二个参数是零','取决于调用方变量名'],'实现中的可选参数便于覆盖多种合法模式，不会自动扩展公开调用面。要支持两个参数必须明确公开相应签名。','分别数公开签名接受几个参数。｜实现兼容范围可以更大。｜调用契约只来自公开声明。'),
 t(5,10,'复测：关联参数数量与输出','实现 pack：一个 string 参数时返回原字符串；三个 string 参数时返回 [a,b,c] 元组。禁止零参数、两参数和四参数调用，具体返回类型保持精确。',
  'export function pack(a:string,b?:string,c?:string):string|[string,string,string]{return b===undefined||c===undefined?a:[a,b,c];}',
  'export function pack(a:string):string;\nexport function pack(a:string,b:string,c:string):[string,string,string];\nexport function pack(a:string,b?:string,c?:string):string|[string,string,string]{return b===undefined||c===undefined?a:[a,b,c];}',[
   ok('两种合法参数数量','import {pack} from "./main";const a:string=pack("a");const b:[string,string,string]=pack("a","b","c");'),
   bad('不支持两参数','import {pack} from "./main";pack("a","b");',[2575,2554]),
   bad('不支持四参数','import {pack} from "./main";pack("a","b","c","d");'),
   bad('不支持零参数','import {pack} from "./main";pack();'),
  ],'公开重载同时约束参数数量和对应输出。检查 undefined 而非真假值可以保留空字符串作为有效参数。','公开一参数和三参数两种模式。｜实现中用可选参数覆盖两种情况。｜空文本不是未提供参数。',{
   runtime:[run('空文本也占据参数位置','const {pack}=load("main.js");equal(pack("a"),"a");equal(pack("a","","c"),["a","","c"]);equal(pack("","",""),["","",""]);')],
  }),
 m(6,1,'this 参数占几个实参','function scale(this:{factor:number},value:number){return this.factor*value} 的 this 标注会在 JavaScript 中增加一个普通形参吗？',['不会，它是会被擦除的特殊类型参数位置','会，调用时要先传一个 this 对象','会，value 自动变为第三个参数','不会，因为整个函数都被删除'],'TypeScript 的 this 参数描述调用接收者，编译后被擦除。实际接收者由方法调用、call、apply 或 bind 等机制决定。','this 标注不是普通业务实参。｜它只描述接收者契约。｜通过 call 时第一个参数指定接收者。'),
 m(6,2,'提取方法后的接收者','const action=obj.run; action() 与 obj.run() 的 this 一定相同吗？',['不一定，普通函数的 this 取决于调用方式，提取会丢失对象接收者','相同，函数永远记住原对象','相同，只要变量声明为 const','不同，但 TypeScript 自动修复绑定'],'普通方法不会仅因最初放在某个对象里就永久绑定。需要安全提取时，可以绑定接收者或使用适当的闭包。','函数保存在哪与如何调用是两回事。｜独立调用没有 obj. 前缀。｜显式 this 参数可帮助发现错误调用。'),
 m(6,3,'箭头函数的 this','把 function callback(){return this.value} 改成箭头函数后，还能依赖 callback.call(other) 改变箭头内部的 this 吗？',['不能，箭头函数使用词法 this，call 不能重新绑定它','能，call 对所有函数都重新绑定','能，只要 other 有 value','只有严格模式不能，非严格模式可以'],'箭头函数捕获外层 this。它适合保留外层上下文，但不适合需要调用方动态提供接收者的回调。','箭头函数是否有自己的动态 this？｜它沿词法作用域获取 this。｜call 不会覆盖这种捕获。'),
 t(6,4,'修复接收者类型','导出 Context={factor:number}，实现普通函数 scale，要求 this 为 Context，接受 value:number，返回 this.factor*value。禁止无接收者直接调用。',
  'export type Context={factor:number};\nexport function scale(value:number):number{return this.factor*value;}',
  'export type Context={factor:number};\nexport function scale(this:Context,value:number):number{return this.factor*value;}',[
   ok('通过 call 提供接收者','import {scale} from "./main";const n:number=scale.call({factor:3},2);'),
   bad('禁止丢失接收者','import {scale} from "./main";scale(2);',[2684]),
   bad('接收者字段类型错误','import {scale} from "./main";scale.call({factor:"3"},2);'),
  ],'显式 this 参数让实现体和调用方共享接收者契约。它不占用普通形参位置，也不会自动绑定函数。','this 在函数体里缺少明确类型。｜将 this:Context 放在参数列表第一位。｜普通数值参数仍只有 value。',{
   runtime:[run('接收者决定倍率','const {scale}=load("main.js");equal(scale.call({factor:3},2),6);equal(scale.call({factor:0},9),0);equal(scale.call({factor:-2},3),-6);')],
  }),
 m(6,5,'this:void 的用途','API 要求 callback:(this:void)=>void，主要表达什么？',['回调不能要求调用者提供特定对象作为 this','回调只能返回 undefined 且不能有副作用','回调在运行时永远不会被调用','回调可以任意修改外层 this'],'this:void 描述不依赖对象接收者的调用契约。它可以拒绝明确要求特定 this 的普通函数，不代表没有闭包或副作用。','this 类型与返回类型是两个位置。｜这里约束的是接收者需求。｜使用闭包捕获数据仍然可能。',{stage:'reason'}),
 t(6,6,'设计可以独立调用的计数器','导出 Counter={value:number;next:()=>number}。实现 create(start:number):Counter，next 可以从对象上取出后独立调用，每次将对应 Counter.value 加一并返回新值；多个计数器互不影响。',
  'export type Counter={value:number;next:()=>number};\nexport function create(start:number):Counter{return {value:start,next(){return ++this.value;}};}',
  'export type Counter={value:number;next:()=>number};\nexport function create(start:number):Counter{const counter:Counter={value:start,next:()=>++counter.value};return counter;}',[
   ok('返回独立可调用函数','import {create,Counter} from "./main";const c:Counter=create(1);const next:()=>number=c.next;const n:number=next();'),
   bad('起始值必须是数字','import {create} from "./main";create("1");'),
   bad('调用结果不是文本','import {create} from "./main";const s:string=create(1).next();'),
  ],'普通对象方法提取后可能丢失接收者。闭包直接捕获所属对象，可以实现不依赖动态 this 的调用接口，同时保持公开 value 更新。','测试会将 next 存到独立变量后调用。｜不能依赖调用前缀。｜使用闭包捕获本次创建的 counter。',{
   runtime:[run('独立调用与实例隔离','const {create}=load("main.js");const a=create(0);const b=create(10);const next=a.next;equal(next(),1);equal(next(),2);equal(a.value,2);equal(b.next(),11);equal(b.value,11);a.value=20;equal(next(),21);equal(b.value,11);')],
  }),
 m(6,7,'call 和 bind 的区别','对 function f(this:Ctx,x:number):number，f.call(ctx,2) 与 f.bind(ctx) 的结果有什么差别？',['call 立即调用得到 number，bind 返回已绑定的新函数','两者都立即调用并返回 number','两者都返回 Promise<number>','bind 修改原函数对象，使所有调用永久使用 ctx'],'call 执行调用；bind 创建包装函数并固定接收者，不会修改原函数的所有调用行为。正确选择取决于现在执行还是交给以后执行。','一个是执行，一个是准备以后执行。｜bind 的结果仍然可调用。｜原函数没有被全局改写。',{stage:'reason'}),
 t(6,8,'迁移：调用带上下文的规则','导出 Context={offset:number}；实现 applyRule(context:Context,value:number,rule:(this:Context,value:number)=>number):number，调用 rule 一次并把 context 作为 this、value 作为普通参数。',
  'export type Context={offset:number};\nexport function applyRule(context:Context,value:number,rule:(this:Context,value:number)=>number):number{return rule(value);}',
  'export type Context={offset:number};\nexport function applyRule(context:Context,value:number,rule:(this:Context,value:number)=>number):number{return rule.call(context,value);}',[
   ok('上下文参数可在规则里使用','import {applyRule} from "./main";const n:number=applyRule({offset:3},2,function(value){return this.offset+value;});'),
   bad('上下文不能缺少 offset','import {applyRule} from "./main";applyRule({},2,function(value){return value;});'),
   bad('规则结果必须是数字','import {applyRule} from "./main";applyRule({offset:1},2,function(value){return "x";});'),
  ],'this 参数要求调用者提供合适接收者。call 可以明确分开接收者与普通实参，同时保留回调的原始返回结果。','直接 rule(value) 没有 context 接收者。｜使用 call 传入上下文。｜普通 value 参数跟在接收者后面。',{
   runtime:[run('使用原接收者且只调用一次','const {applyRule}=load("main.js");const context={offset:4};let calls=0;equal(applyRule(context,3,function(value){calls++;check(this===context);return this.offset*value;}),12);equal(calls,1);')],
  }),
 m(6,9,'复测：this 标注能替代绑定吗','只给方法加 this:Context 标注，再把它传给稍后裸调用的 API，是否已经解决运行时接收者丢失？',['没有，标注只帮助检查，仍需 bind、包装函数或闭包等正确调用方式','是，编译器会自动插入 bind','是，Context 会被保存为隐藏参数','只有类型叫 Context 才会自动绑定'],'类型信息不改变 JavaScript 的调用方式。显式 this 参数可以让不安全调用暴露，但不会自动修复运行代码。','编译后的 this 类型标注还存在吗？｜绑定需要真实执行代码。｜检查与修复是两步。'),
 t(6,10,'复测：交付安全的延迟格式器','导出 Prefix={prefix:string}；实现 bindFormatter(context:Prefix,format:(this:Prefix,text:string)=>string):(text:string)=>string，返回稍后可独立调用的函数。创建时不调用 format，调用时使用原 context。',
  'export type Prefix={prefix:string};\nexport function bindFormatter(context:Prefix,format:(this:Prefix,text:string)=>string):(text:string)=>string{return format;}',
  'export type Prefix={prefix:string};\nexport function bindFormatter(context:Prefix,format:(this:Prefix,text:string)=>string):(text:string)=>string{return format.bind(context);}',[
   ok('绑定后只需要文本参数','import {bindFormatter} from "./main";const bound=bindFormatter({prefix:"x"},function(text){return this.prefix+text;});const s:string=bound("a");'),
   bad('绑定上下文必须正确','import {bindFormatter} from "./main";bindFormatter({prefix:1},function(text){return text;});'),
   bad('返回函数不能接收数字','import {bindFormatter} from "./main";const f=bindFormatter({prefix:"x"},function(text){return text;});f(1);'),
  ],'返回原函数没有建立运行时绑定，即使较弱的目标函数类型可能接受它。bind 或捕获 context 的包装函数才能兑现独立调用的承诺。','检查是否真的创建了固定接收者的调用方式。｜创建阶段不能执行 format。｜返回 format.bind(context) 或等价包装。',{
   runtime:[run('延迟执行并保持原上下文','const {bindFormatter}=load("main.js");const context={prefix:"A:"};let calls=0;const f=bindFormatter(context,function(text){calls++;check(this===context);return this.prefix+text;});equal(calls,0);equal(f("x"),"A:x");context.prefix="B:";equal(f("y"),"B:y");equal(calls,2);')],
  }),
 m(7,1,'按输入输出关系选工具','接受字符串或数组，始终返回长度 number，且要支持联合变量，哪种接口最直接？',['联合参数','为每个可能长度写重载','返回 any 的泛型','只接受 unknown 且不检查'],'同一输出契约不需要额外建立输入输出映射。联合参数能表达有限候选，并支持已有的联合变量。','先看返回类型是否随输入种类改变。｜这里只返回 number。｜联合参数已经足够。'),
 m(7,2,'需要保留任意类型时','希望 echo 传入任意类型后返回同一种类型，连对象的额外字段也保留，哪种设计适合？',['泛型 echo<T>(value:T):T','echo(value:string|number):string|number','echo(value:unknown):unknown','echo(value:any):any'],'泛型将本次调用的输入类型与输出关联。unknown 安全但丢失具体结果信息，any 则丢失检查，固定联合无法覆盖任意结构。','需要保留的是每次调用的具体类型。｜用同一个类型参数连接两端。｜不必枚举全部可能类型。'),
 m(7,3,'有限模式对应不同结果','parse("text",source) 返回 string，parse("count",source) 返回 number，只有这两种模式。哪种设计可以清晰表达关系？',['按模式声明重载，或使用能表达同样关联的泛型条件类型','两个参数独立联合且返回 any','所有调用统一返回 unknown，且无需收窄','仅把参数名改成 text 或 count'],'有限且明确的模式映射适合重载。关键是保留对应关系，不是形式上一定选择某个关键字；复杂条件泛型需要衡量可读性。','模式会影响结果类型。｜宽返回联合会丢失特定调用的信息。｜为每种合法模式明确输出承诺。'),
 t(7,4,'修复没有必要的重载限制','实现 size(value:string|readonly number[]):number，字符串返回字符长度，数组返回元素个数；必须接受已声明为联合类型的变量。具体输入无需不同返回类型。',
  'export function size(value:string):number;\nexport function size(value:readonly number[]):number;\nexport function size(value:string|readonly number[]):number{return value.length;}',
  'export function size(value:string|readonly number[]):number{return value.length;}',[
   ok('联合变量直接可用','import {size} from "./main";declare const value:string|readonly number[];const n:number=size(value);size("a");size([1,2]);'),
   bad('不接受普通数字','import {size} from "./main";size(1);'),
   bad('数组元素限定为数字','import {size} from "./main";size(["a"]);'),
  ],'删除不必要的重载，公开实现本来就支持的联合参数即可。也可增加联合重载，但当所有输出相同，它通常增加维护成本而没有新能力。','实现体已能处理两种输入。｜问题是公开调用范围过窄。｜一个联合签名就能覆盖需求。',{
   runtime:[run('两种结构的长度','const {size}=load("main.js");equal(size("abc"),3);equal(size(Object.freeze([1,2])),2);equal(size([]),0);equal(size(""),0);')],
  }),
 m(7,5,'泛型不是类型转换指令','function make<T>():T 仅凭调用者指定 T，能否自动构造任意 T 的合法值？',['不能，类型参数不会提供运行时构造规则','能，编译器自动生成字段默认值','能，返回空对象就满足任意 T','只要使用 as T 就真实构造成功'],'任意类型可能有必需字段和约束。没有输入值、工厂或其他证据，类型参数本身不足以创建它。断言不能补足真实数据。','T 在运行时是否存在？｜它可能代表任意复杂类型。｜需要实际值或构造能力，而不是仅有名字。',{stage:'reason'}),
 t(7,6,'设计保留调用类型的 echo','实现 echo<T>(value:T):T，原样返回输入。T 是本次调用的类型占位符，参数和返回共用 T；要求字符串字面量、数组和对象字段信息都保留，对象引用也不变。',
  'export function echo(value:unknown):unknown{return value;}',
  'export function echo<T>(value:T):T{return value;}',[
   ok('保留多种具体类型','import {echo} from "./main";const literal:"ready"=echo("ready");const object=echo({id:"a",count:2});const n:number=object.count;const array:number[]=echo([1,2]);'),
   bad('结果不能任意冒充其他类型','import {echo} from "./main";const s:string=echo(1);'),
   bad('不存在的字段不能读取','import {echo} from "./main";echo({id:"a"}).missing;'),
  ],'T 将参数与结果连接起来，每次调用单独推断。实现不需要知道 T 的具体结构，因为只原样传递，不对它执行专属操作。','unknown 返回不会保留具体字段。｜在函数名后声明 <T>。｜参数与返回都使用同一个 T。',{
   runtime:[run('原始值和对象引用保持','const {echo}=load("main.js");const object={id:"a"};check(echo(object)===object);const array=[1,2];check(echo(array)===array);equal(echo(false),false);equal(echo(null),null);')],
  }),
 m(7,7,'没有关系的泛型参数','function log<T>(message:string):void 中 T 未在参数、返回或约束中使用，通常有什么问题？',['T 没有表达任何有用关系，应考虑删除','T 会自动把 message 转换成调用者类型','T 让日志在运行时更快','没有 T 就不能调用 console.log'],'泛型应服务于类型关系。孤立且未使用的类型参数只增加接口复杂度，不会凭空增强安全性或性能。','查找 T 出现在哪些位置。｜没有参与任何输入输出联系。｜删掉它不会损失现有类型信息。',{stage:'reason'}),
 t(7,8,'迁移：按标记选择结果结构','实现 describe：mode="text" 时接受 value:number 并返回 String(value)；mode="object" 时返回 {value:number}。调用方对每种模式应获得精确结果，拒绝其他模式。可用重载实现。',
  'export function describe(mode:"text"|"object",value:number):string|{value:number}{return mode==="text"?String(value):{value};}',
  'export function describe(mode:"text",value:number):string;\nexport function describe(mode:"object",value:number):{value:number};\nexport function describe(mode:"text"|"object",value:number):string|{value:number}{return mode==="text"?String(value):{value};}',[
   ok('模式确定结果类型','import {describe} from "./main";const text:string=describe("text",1);const object:{value:number}=describe("object",2);'),
   bad('对象模式不返回文本','import {describe} from "./main";const text:string=describe("object",1);'),
   bad('模式范围固定','import {describe} from "./main";describe("array",1);'),
  ],'有限模式决定不同形状的结果，重载可直接呈现这种关系。宽联合实现仍需正确分支，不能只添加签名后忽略业务。','输入变化不是任意类型，而是固定模式。｜为每个模式声明对应结果。｜函数体根据 mode 返回正确形状。',{
   runtime:[run('模式与实际结构对应','const {describe}=load("main.js");equal(describe("text",0),"0");equal(describe("object",0),{value:0});equal(describe("object",-2),{value:-2});')],
  }),
 m(7,9,'复测：一个 T 还是两个','函数将两个可能不同类型的输入原样放进二元组，为什么通常用 <A,B>(a:A,b:B):[A,B]？',['两个类型参数保留各自位置的信息，不强迫两项共用同一类型','因为单个 T 只能用于数字','因为元组只允许泛型类型','因为两个参数会自动执行深复制'],'独立输入类型应各自保留，再由元组位置表达关联。一个共同联合可能使每个位置都变宽，丢失哪个值属于哪个位置的信息。','两个输入是否必须同类型？｜位置一和位置二应分别保留类型。｜两个占位符表达两个独立来源。'),
 t(7,10,'复测：保留两个输入的位置关系','实现 pair<A,B>(first:A,second:B):[A,B]。返回新元组，两个元素分别是原输入，不克隆输入对象；调用方应保留每个位置的具体类型。',
  'export function pair(first:unknown,second:unknown):[unknown,unknown]{return [first,second];}',
  'export function pair<A,B>(first:A,second:B):[A,B]{return [first,second];}',[
   ok('不同位置有不同类型','import {pair} from "./main";const value=pair({id:"a"},3);const id:string=value[0].id;const n:number=value[1];const other:[boolean,string]=pair(true,"x");'),
   bad('第一项不能假设为数字','import {pair} from "./main";const n:number=pair("x",3)[0];'),
   bad('第二项不能假设为文本','import {pair} from "./main";const s:string=pair("x",3)[1];'),
  ],'泛型保留两个独立来源，元组保留位置。函数只组合现有值，无需断言，也不需要知道具体结构；下一章会进一步展开约束与推断。','声明两个独立类型参数。｜返回元组的每个位置使用对应参数。｜实现直接返回 [first,second]。',{
   runtime:[run('新元组但元素引用不变','const {pair}=load("main.js");const a={id:"a"};const b=[1];const result=pair(a,b);check(Array.isArray(result));equal(result.length,2);check(result[0]===a);check(result[1]===b);check(pair(a,b)!==result);')],
  }),
];
