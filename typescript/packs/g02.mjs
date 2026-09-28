import { mc, task, ok, bad, run } from './author.mjs';
const id=(n)=>`t02-l${String(n).padStart(2,'0')}`;
const m=(l,n,title,prompt,options,explanation,hints,extra={})=>mc(id(l),n,title,prompt,options,explanation,hints.split('|'),extra);
const t=(l,n,title,prompt,files,solution,tests,explanation,hints,extra={})=>task(id(l),n,title,prompt,files,solution,tests,explanation,hints.split('|'),extra);
export const questions=[
  m(1,1,'原始字符串与包装对象','当函数需要接收普通文本时，应使用哪种参数类型？',['string；String 描述包装对象等情况，不适合作为普通文本的默认标注','String；小写 string 只用于 JavaScript','二者在所有赋值场景完全一样','object；因为文本一定是对象'],'日常原始值使用小写类型。包装对象与原始字符串具有不同的值形态和兼容性，不能简单当作等价。','区分 "hello" 与 new String("hello")。|类型名称大小写有含义。|普通文本参数使用 string。'),
  m(1,2,'bigint 的加法','在支持 bigint 的目标设置下，下列代码怎样修复才能保持 bigint 计算？',['把右侧的 1 改为 1n','把返回类型改为 any，运算便自动正确','修改变量名即可','number 与 bigint 可直接混加，不用改'],'bigint 与 number 的算术不能随意混合。使用 bigint 字面量 1n 保持同类运算。','n 是 bigint。|右侧 1 是 number。|同类大整数运算应使用 1n。',{snippet:'const n = 9007199254740993n;\nconst next = n + 1;',stage:'reason'}),
  m(1,3,'两个 symbol','运行 Symbol("id") === Symbol("id") 的比较，下面解释最合理的是？',['通常为 false，因为两次调用创建不同 symbol，描述相同不代表身份相同','一定为 true，描述就是全局键','编译器把二者都转换为字符串','symbol 只能用于数组下标'],'Symbol 的描述帮助调试，不决定身份。与共享注册表相关的 Symbol.for 是另一种机制。','留意创建函数是否是 Symbol.for。|描述文本并不是身份。|两次 Symbol 调用产生不同值。'),
  t(1,4,'保持大整数精度','实现 increment(value: bigint): bigint，返回 value 加一，不得先转换成 number。',
    'export function increment(value: bigint): bigint { return value + 1; }',
    'export function increment(value: bigint): bigint { return value + 1n; }',[
      ok('大整数输入输出','import {increment} from "./main";const x:bigint=increment(2n);'),
      bad('不接收 number','import {increment} from "./main";increment(2);'),
    ],'使用 bigint 常量保留精度。先转 number 再转回 bigint 会损失大整数信息，运行用例专门覆盖安全整数范围之外。','出错的是两种数字类型混合。|bigint 字面量以 n 结尾。|直接执行 value + 1n。',{
      runtime:[run('普通大整数','equal(load("main.js").increment(3n),4n);'),run('超过安全整数范围仍精确','equal(load("main.js").increment(9007199254740993n),9007199254740994n);')],
    }),
  m(1,5,'缺失值不是同一种值','strictNullChecks 开启时，null 与 undefined 的关系是什么？',['它们有不同类型，允许哪种缺失值应在契约中明确','它们自动赋给任何 string','null 会被擦除成空字符串','undefined 只能出现在函数内部'],'严格空值检查让两种缺失值显式进入契约。需要二者时可写联合，不需要时不应任意放宽。','看参数的声明是否列出缺失值。|空字符串又是第三种实际值。|分别表达 null 与 undefined。',{stage:'reason'}),
  t(1,6,'明确地解析开关','实现 enabled(value: boolean): string，true 返回“开启”，false 返回“关闭”；不要接受字符串。',
    'export function enabled(value: string): string { return value ? "开启" : "关闭"; }',
    'export function enabled(value: boolean): string { return value ? "开启" : "关闭"; }',[
      ok('允许布尔值','import {enabled} from "./main";const x:string=enabled(false);'),bad('拒绝文本 false','import {enabled} from "./main";enabled("false");'),
    ],'布尔契约避免非空字符串 "false" 被当作真值。类型描述应贴合入口实际允许的值。','文本 false 和布尔 false 不同。|需要约束参数为布尔值。|条件根据 boolean 分支返回文本。',{
      runtime:[run('两种布尔状态','const {enabled}=load("main.js");equal(enabled(true),"开启");equal(enabled(false),"关闭");')],
    }),
  m(1,7,'typeof null 的历史行为','为什么处理 typeof value === "object" 的输入时还常要排除 null？',['JavaScript 的 typeof null 是 "object"，该判断还不能证明值可访问属性','TypeScript 删除了所有 null 判断','只有 class 才能出现 null','null 自动包含所有对象字段'],'typeof 是 JavaScript 运行行为；对象判断还要排除 null，然后继续检查结构。','先回忆运行时 typeof null。|object 判断仍可能包含缺失值。|增加 value !== null 再处理属性。',{stage:'reason'}),
  t(1,8,'迁移：限制文本输入','实现 initials(first:string,last:string)：各取第一个字符并转大写。空字符串对应空片段，禁止包装对象作为参数。',
    'export function initials(first: String, last: String): string { return first.charAt(0) + last.charAt(0); }',
    'export function initials(first: string, last: string): string { return (first.charAt(0) + last.charAt(0)).toUpperCase(); }',[
      ok('普通文本可用','import {initials} from "./main";const s:string=initials("ada","lovelace");'),bad('拒绝包装对象','import {initials} from "./main";initials(new String("ada"),"lin");'),
    ],'原始文本参数使用 string；charAt 对空文本返回空字符串，适合本题的缺字规则。','String 比普通文本入口需要的范围宽。|还需要实现大写规则。|使用小写 string，组合后调用 toUpperCase。',{
      runtime:[run('首字符大写','equal(load("main.js").initials("ada","lovelace"),"AL");'),run('空字段安全处理','equal(load("main.js").initials("","lin"),"L");')],
    }),
  m(1,9,'复测：number 能表示什么','下面哪个值仍属于 JavaScript number，却可能不符合“有效价格”？',['NaN','12n','"12"','Symbol("12")'],'number 包含 NaN、Infinity 等值；业务有效性需要额外检查。其他选项分别是 bigint、string、symbol。','从 typeof 分类出发。|业务合法性比原始类型更窄。|NaN 的类型仍是 number。'),
  t(1,10,'复测：有限非负价格','实现 validPrice(value: number): boolean，只允许有限且大于等于零的数字。',
    'export function validPrice(value: number): boolean { return value >= 0; }',
    'export function validPrice(value: number): boolean { return Number.isFinite(value) && value >= 0; }',[
      ok('返回布尔结果','import {validPrice} from "./main";const b:boolean=validPrice(2);'),bad('拒绝数字字符串','import {validPrice} from "./main";validPrice("2");'),
    ],'价格规则需要有限性与范围两项判断。仅 value >= 0 会允许 Infinity。','正无穷也大于零。|增加有限数检查。|结合 Number.isFinite 与非负条件。',{
      runtime:[run('允许零和小数','const {validPrice}=load("main.js");check(validPrice(0));check(validPrice(2.5));'),run('拒绝特殊数值','const {validPrice}=load("main.js");for(const n of [-1,NaN,Infinity,-Infinity])check(!validPrice(n));')],
    }),

  m(2,1,'初始化决定了什么','下列赋值为什么不能通过？',['name 从初始化被推断为 string，之后不能赋 number','let 变量不能再次赋值','字符串初始化一律导致 any','只有显式写注解才会类型检查'],'没有注解并不表示没有类型。let 允许改变值，但改变值仍受推断出的声明类型约束。','区分可变值与任意类型。|首次赋值已经给出信息。|name 的声明类型是 string。',{snippet:'let name = "Ada";\nname = 42;'}),
  m(2,2,'有上下文的回调','values: number[] 上调用 map(value => value.toFixed(2))，value 与结果分别是什么类型？',['value 为 number，结果为 string[]','value 为 any，结果为 number[]','value 为 string，结果为 string','value 为 never，结果为 never[]'],'map 的上下文提供元素参数类型；toFixed 返回 string，结果数组因此是 string[]。','输入数组给回调提供参数信息。|toFixed 用于格式化文本。|区分回调输入和输出的类型。',{stage:'reason'}),
  m(2,3,'未初始化变量会追踪赋值','本课程 strict 设置下，下面代码哪句出错？',['x.toUpperCase()，因为最后一次赋值已将当前 x 收窄为 number','两句都不会检查，x 永远是 any','x = 3，因为变量必须在声明时初始化','export {}，因为模块不支持 let'],'未初始化变量的控制流推断会跟踪赋值；不应套用“它永远完全不被检查”的旧式简化描述。','以固定编译器和配置为准。|观察使用前最后一次赋值。|当前 x 是数字，不能调用文本方法。',{snippet:'export {};\nlet x;\nx = 3;\nx.toUpperCase();',sourceIds:['inference','evolving']}),
  t(2,4,'补上允许切换的值类型','导出 let selected，初始值为 null；select(value:string) 更新它。selected 的声明应允许 string 或 null。',
    'export let selected = null;\nexport function select(value: string): void { selected = value; }',
    'export let selected: string | null = null;\nexport function select(value: string): void { selected = value; }',[
      ok('允许两种选中状态','import {selected,select} from "./main";const s:string|null=selected;select("x");'),bad('状态不保证非空','import {selected} from "./main";const s:string=selected;'),bad('选择必须是文本','import {select} from "./main";select(2);'),
    ],'null 初始化不能独自表达后续会保存文本的设计意图，需要给可变槽位声明完整候选范围。','初始值只覆盖一种状态。|变量后续需要接收 string。|在 selected 上标注字符串与 null 的联合类型。',{
      runtime:[run('更新导出状态','const m=load("main.js");equal(m.selected,null);m.select("lesson");equal(m.selected,"lesson");')],
    }),
  m(2,5,'只标注公共边界','给每一个局部变量都重复写出显而易见的类型，有什么取舍？',['可能增加维护负担；公共边界和推断不足处更值得明确注解','总能增加运行速度','能让所有网络响应自动合法','是 strict 的强制要求'],'注解应提供有用约束。可靠的局部推断可以减少重复；公共契约需要更主动的设计。','类型标注不直接提高运行速度。|考虑模型改变时需要修改多少处。|把注解用在能表达约束的位置。',{stage:'reason'}),
  t(2,6,'为坐标槽位声明候选范围','导出 let position，初值为 {x:0,y:0}；move(x:number,y:number) 更新两个值。不要把坐标限制为字面量 0。',
    'export let position: {x:0;y:0} = {x:0,y:0};\nexport function move(x: number,y: number): void { position = {x,y}; }',
    'export let position: {x:number;y:number} = {x:0,y:0};\nexport function move(x: number,y: number): void { position = {x,y}; }',[
      ok('坐标是可变数字','import {position,move} from "./main";const p:{x:number;y:number}=position;move(3,4);'),bad('不能把任意坐标当作原点','import {position} from "./main";const p:{x:0;y:0}=position;'),
    ],'初始数据是原点，不代表所有后续数据都只能是原点。契约应覆盖合法变化范围。','字面量 0 比 number 窄。|move 明确允许任意数字。|将属性类型表达为 number。',{
      runtime:[run('移动到新坐标','const m=load("main.js");m.move(3,-2);equal(m.position,{x:3,y:-2});')],
    }),
  m(2,7,'返回类型反向影响调用者','函数某分支返回数字、另一分支返回 null，没有返回注解时一般会发生什么？',['推断包含 number 与 null，调用者需要处理缺失','始终根据第一个 return 推断 number','所有函数返回 any','null 分支自动删除'],'在严格空值检查下，返回路径共同影响推断。若公共契约不允许 null，显式注解也能帮助发现遗漏。','检查所有返回路径。|不要只看第一句 return。|结果需要表达两种可能。',{stage:'reason'}),
  t(2,8,'迁移：明确搜索失败','实现 findIndexOf(values:string[], target:string): number | null，找到时返回索引，找不到时返回 null。',
    'export function findIndexOf(values: string[], target: string): number | null { return values.indexOf(target); }',
    'export function findIndexOf(values: string[], target: string): number | null { const i=values.indexOf(target);return i<0?null:i; }',[
      ok('搜索结果表达缺失','import {findIndexOf} from "./main";const n:number|null=findIndexOf([],"x");'),bad('调用方不能直接当成数字','import {findIndexOf} from "./main";const n:number=findIndexOf([],"x");'),
    ],'契约明确用 null 表示失败，因此应把底层 indexOf 的 -1 转为 null。显式类型仍不能独自保证业务约定。','底层 API 使用 -1。|本题对外约定使用 null。|根据 i < 0 转换失败值。',{
      runtime:[run('保留零索引','equal(load("main.js").findIndexOf(["a","b"],"a"),0);'),run('找不到返回 null','equal(load("main.js").findIndexOf(["a"],"b"),null);')],
    }),
  m(2,9,'复测：空数组的预期','在一个长期保存用户对象的状态槽里，初始化 [] 后就想表达 User[]，可靠做法是什么？',['根据状态契约显式声明 User[]，不要仅靠空数组提供元素信息','空数组总是自动知道 User','空数组在任何上下文都固定是 any[]','把变量名写成 users 即可推断字段'],'空数组推断受位置和上下文影响。状态槽的目标元素类型明确时，显式表达它比依赖名称或空值猜测可靠。','空值本身缺少成员结构信息。|推断还受上下文影响。|让公共状态类型明确为 User[]。'),
  t(2,10,'复测：空列表逐步累积','导出 names:string[] 初始为空，addName(name:string) 将名字追加到数组。要求错误元素类型被拒绝。',
    'export const names: [] = [];\nexport function addName(name: string): void { names.push(name); }',
    'export const names: string[] = [];\nexport function addName(name: string): void { names.push(name); }',[
      ok('可读取文本数组','import {names,addName} from "./main";const a:string[]=names;addName("林");'),bad('不能加入数字','import {names} from "./main";names.push(3);'),
    ],'[] 作为类型表示空元组，不是任意字符串数组。初始长度为零与永远长度为零是不同契约。','关注冒号后面的 []。|空元组没有可添加的元素类型。|改为 string[] 来表达可增长的文本列表。',{
      runtime:[run('连续追加名字','const m=load("main.js");m.addName("林");m.addName("雨");equal(m.names,["林","雨"]);')],
    }),

  m(3,1,'const 对象的属性','const request = {method:"GET"} 中，request.method 通常为何不能直接交给只接受 "GET" | "POST" 的函数？',['对象属性仍可改写，method 通常被扩大为 string','const 对象自动深只读，所以不能传参','method 自动成为 any','函数只能接收 class 属性'],'const 限制绑定重新赋值，不阻止对象属性修改。需要保留候选字面量时可明确注解或使用 const 断言。','const 保护的是哪一层？|属性后来可以被赋为别的文本。|普通可变属性通常推断为 string。'),
  m(3,2,'let 与 const','const a="ready"; let b="ready"; 的常见推断结果是什么？',['a 保留 "ready" 字面量，b 为 string','两者都只能是 "ready"','两者都是 any','a 为 string，b 为 never'],'不可重新赋值的原始常量可保留字面量；可变变量通常扩大到 string。','b 可以重新赋值。|a 的绑定不能改成其他值。|推断与可变性相关。',{stage:'reason'}),
  m(3,3,'字面量注解的边界','把变量声明为 let state: "ready" = "ready" 后再赋 "done"，会怎样？',['报错，因为显式类型只允许 "ready"','成功，因为 let 总能改变类型','自动把类型扩大到 string','变量被自动删除'],'显式字面量注解比普通 let 初始化更窄。变量可变不代表允许超出声明范围。','看冒号后的契约。|只列出了一个允许值。|要允许两种状态，应显式写联合。'),
  t(3,4,'修复请求配置扩大','导出 request，method 必须保留 "GET" 字面量，path 为 "/users"；导出 send(method:"GET"|"POST") 返回原方法。',
    'export const request = {method:"GET",path:"/users"};\nexport function send(method:"GET"|"POST"){return method;}\nsend(request.method);',
    'export const request = {method:"GET",path:"/users"} as const;\nexport function send(method:"GET"|"POST"){return method;}\nsend(request.method);',[
      ok('方法保留字面量','import {request,send} from "./main";const m:"GET"=request.method;send(request.method);'),bad('未知方法不能发送','import {send} from "./main";send("PATCH");'),
    ],'配置值需要作为特定候选使用，const 断言保留字面量。它同时产生只读属性，是本题可接受的配置约定。','问题在 request.method 的推断。|需要保留具体 GET。|配置末尾使用 as const，或等价的准确属性注解。',{
      runtime:[run('配置保留运行数据','const m=load("main.js");equal(m.request.path,"/users");equal(m.send(m.request.method),"GET");')],
    }),
  m(3,5,'字面量联合是运行数组吗','type Mode = "light" | "dark" 之后能否调用 Mode.includes("light")？',['不能，Mode 是类型，没有对应的运行数组','可以，联合会自动生成数组','只有 strict 关闭才可以','需要把 includes 改成 push'],'类型候选集合不自动产生运行值。需要另建数组或判断逻辑。','类型和值处于不同用途的位置。|运行方法需要实际对象。|联合声明并没有创建数组。',{stage:'reason'}),
  t(3,6,'为模式函数保留精确结果','实现 mode(dark:boolean)，返回 "dark" 或 "light"；类型要保留两个字面量候选，不扩大为 string。',
    'export function mode(dark: boolean): string { return dark ? "dark" : "light"; }',
    'export function mode(dark: boolean): "dark" | "light" { return dark ? "dark" : "light"; }',[
      ok('结果可用于有限候选','import {mode} from "./main";const m:"light"|"dark"=mode(true);'),bad('结果不能当作唯一 dark','import {mode} from "./main";const m:"dark"=mode(false);'),
    ],'函数对外结果只有两个候选，精确返回契约让调用者无需断言。仍不能把一般 boolean 调用当作一定为 dark。','string 范围比实际结果宽。|需要同时保留两个候选。|返回类型写为 dark 与 light 的字面量联合。',{
      runtime:[run('布尔与模式对应','const {mode}=load("main.js");equal(mode(true),"dark");equal(mode(false),"light");')],
    }),
  m(3,7,'as const 与可变需求','一份配置之后需要把 mode 从 light 改为 dark，直接对整个对象 as const 会带来什么？',['属性变成只读且过窄，需要按实际可变契约设计','自动允许任意字符串修改','只会改善运行性能','把对象转换为 Map'],'const 断言适合固定配置，不适合所有可变状态。应根据生命周期决定保留字面量还是声明可变联合。','未来需要修改属性。|as const 同时影响只读性与字面量。|可变联合状态应明确标注候选范围。',{stage:'reason'}),
  t(3,8,'迁移：可切换主题','导出 theme:{mode:"light"|"dark"}，初始 light；toggle() 在两种模式之间切换。',
    'export const theme = {mode:"light"} as const;\nexport function toggle(): void { theme.mode = theme.mode === "light" ? "dark" : "light"; }',
    'export const theme: {mode:"light"|"dark"} = {mode:"light"};\nexport function toggle(): void { theme.mode = theme.mode === "light" ? "dark" : "light"; }',[
      ok('主题是可变的有限候选','import {theme} from "./main";theme.mode="dark";'),bad('拒绝未知主题','import {theme} from "./main";theme.mode="blue";'),
    ],'固定绑定里的对象可以有可变属性。用字面量联合限制候选，同时允许业务需要的切换。','既要能修改，又要限制候选。|整个对象 as const 太严格。|给 mode 标注可变的两种字面量。',{
      runtime:[run('两次切换恢复初态','const m=load("main.js");equal(m.theme.mode,"light");m.toggle();equal(m.theme.mode,"dark");m.toggle();equal(m.theme.mode,"light");')],
    }),
  m(3,9,'复测：常量数组','const statuses = ["ready","done"] 的常见类型是什么？',['string[]，const 不自动将数组变成只读字面量元组','readonly ["ready","done"]，不需要其他标注','never[]','"ready" | "done"'],'const 限制数组变量被重新赋值，数组元素仍可变。固定元组信息需要明确表达。','数组本身仍能 push。|变量绑定和元素可变性分开看。|普通数组字面量常被推断为 string[]。'),
  t(3,10,'复测：固定导航配置','导出 tabs 为依次包含 "home"、"profile" 的只读元组；导出 firstTab()，返回第一个标签，返回类型应是 "home"。',
    'export const tabs = ["home","profile"];\nexport function firstTab(){return tabs[0];}',
    'export const tabs = ["home","profile"] as const;\nexport function firstTab(){return tabs[0];}',[
      ok('首标签精确可知','import {tabs,firstTab} from "./main";const a:readonly ["home","profile"]=tabs;const h:"home"=firstTab();'),bad('配置不可写','import {tabs} from "./main";tabs[0]="profile";'),
    ],'元组保留位置关系，因此索引 0 对应 home。只读配置限制通过该类型修改标签。','需要同时保留顺序与具体值。|普通 string[] 不表达第一个必为 home。|在数组字面量上使用 const 断言。',{
      runtime:[run('首项与列表一致','const m=load("main.js");equal(m.tabs,["home","profile"]);equal(m.firstTab(),"home");')],
    }),

  m(4,1,'unknown 的价值','把外部输入保持为 unknown，最直接的好处是什么？',['使用前必须提供类型或结构证据，防止直接访问未知成员','自动把输入转换为合法 JSON','完全禁止任何类型收窄','比 any 更快地运行'],'unknown 保持输入不可信的状态，要求检查后使用。它不执行校验，但会提醒你还缺证据。','想想直接调用 value.trim 是否允许。|unknown 保留不确定性。|实际检查后才能使用具体成员。'),
  m(4,2,'any 怎样传播','一个函数返回 any，调用者又读取 result.user.name，类型检查通常会怎样？',['很多成员访问被放行，错误可能一直到运行时才暴露','自动收窄为 {user:{name:string}}','任何调用都禁止','返回值一定变为 never'],'any 会削弱后续检查，不能把能访问成员当作成员存在的证明。','any 不要求具体成员存在。|链式访问可能继续产生 any。|危险会越过函数边界传播。',{stage:'reason'}),
  m(4,3,'never 表达什么','下面哪类返回类型最适合“函数总会抛出异常，没有正常返回”？',['never','unknown','null','any'],'never 表达没有正常返回值。void 通常表达调用方不使用返回结果，语义不同。','不是返回一个缺失值。|正常执行路径不会到达函数结尾。|没有可能的正常返回值。'),
  t(4,4,'从 unknown 读取文本长度','实现 textSize(value: unknown)：文本返回长度，其他值返回 null。',
    'export function textSize(value: unknown): number | null { return value.length; }',
    'export function textSize(value: unknown): number | null { return typeof value === "string" ? value.length : null; }',[
      ok('允许未知输入','import {textSize} from "./main";const n:number|null=textSize({length:3});'),bad('结果可能失败','import {textSize} from "./main";const n:number=textSize(null);'),
    ],'不应仅因为对象有 length 就当成文本。typeof 判断提供本题所需的准确证据。','value 可能是任意值。|本题只接受真正的字符串。|typeof 为 string 的分支才能读取文本长度。',{
      runtime:[run('只接受文本','const {textSize}=load("main.js");equal(textSize("TS"),2);equal(textSize({length:3}),null);equal(textSize(null),null);')],
    }),
  m(4,5,'unknown 能直接赋给 string 吗','let value: unknown = 外部输入；把它直接交给 string 参数会怎样？',['通常不允许，需要收窄或其他可靠证据','总是允许，unknown 等于 any','自动调用 String(value)','只要变量名叫 text 就允许'],'unknown 与 any 的核心差别之一，是 unknown 不能随意当作更具体类型使用。','目标函数需要确定的文本。|unknown 没有这份承诺。|通过运行判断建立证据。',{stage:'reason'}),
  t(4,6,'设计失败函数','实现 fail(message:string):never，总是抛出 Error(message)。',
    'export function fail(message: string): void { console.log(message); }',
    'export function fail(message: string): never { throw new Error(message); }',[
      ok('没有正常返回值','import {fail} from "./main";const x:never=fail("bad");'),bad('错误消息必须为文本','import {fail} from "./main";fail(3);'),
    ],'throw 终止正常返回路径，never 准确表达这种控制流。仅记录日志仍会正常返回 undefined。','当前实现会执行到函数末尾。|需要以异常结束。|返回类型 never，函数体抛出带消息的 Error。',{
      runtime:[run('保留错误消息','let caught;try{load("main.js").fail("无效任务");}catch(e){caught=e;}check(caught instanceof Error);equal(caught.message,"无效任务");')],
    }),
  m(4,7,'never 可以赋给其他类型吗','为什么穷尽分支中的 never 可以赋给 string，却不能把任意 string 赋给 never？',['never 没有可能值；任意字符串并不属于空集合','string 和 never 实际相等','never 在运行时会转换文本','只有空字符串能自动赋给 never'],'把类型看作允许值的集合能帮助理解：空集合属于所有集合，普通字符串集合不属于空集合。','考虑值集合的包含关系。|never 表示没有可能值。|方向不同，兼容性结论也不同。',{stage:'reason'}),
  t(4,8,'迁移：处理任意抛出值','实现 errorText(error: unknown)：Error 实例返回 message，字符串原样返回，其余返回“未知错误”。',
    'export function errorText(error: unknown): string { return error.message; }',
    'export function errorText(error: unknown): string { if(error instanceof Error)return error.message;if(typeof error==="string")return error;return "未知错误"; }',[
      ok('未知值能被安全处理','import {errorText} from "./main";const s:string=errorText(null);'),bad('结果不是 Error 对象','import {errorText} from "./main";const e:Error=errorText("x");'),
    ],'JavaScript 可以抛出非 Error 值。unknown 要求分别判断，避免错误处理本身再次抛错。','不是所有异常值都有 message。|Error 实例与字符串可分开处理。|最后提供明确回退。',{
      runtime:[run('处理三类错误','const {errorText}=load("main.js");equal(errorText(new Error("离线")),"离线");equal(errorText("超时"),"超时");equal(errorText(null),"未知错误");')],
    }),
  m(4,9,'复测：类型守卫也要正确','一个 value is User 的函数始终返回 true，会带来什么？',['可能误导编译器，错误数据通过后仍在运行时失败','编译器必定验证守卫的全部业务逻辑','unknown 自动变成合法用户','所有调用被自动拒绝'],'类型守卫的签名是一种承诺，编译器不会完整证明其实现逻辑。需要运行测试覆盖不合法输入。','区分签名承诺与实际检查。|始终 true 没有过滤能力。|守卫也需要正确实现与测试。'),
  t(4,10,'复测：安全的数字提取','实现 extractNumber(value: unknown)：有限 number 原样返回，其余返回 null。',
    'export function extractNumber(value: unknown): number | null { return Number(value); }',
    'export function extractNumber(value: unknown): number | null { return typeof value === "number" && Number.isFinite(value) ? value : null; }',[
      ok('保留 unknown 边界','import {extractNumber} from "./main";const n:number|null=extractNumber("2");'),bad('不能假设一定为数字','import {extractNumber} from "./main";const n:number=extractNumber(null);'),
    ],'本题是验证原值，不是转换。Number 会把 null 等值转成数字，不满足入口规则。','不要把验证改成强制转换。|先确认类型为 number。|再确认 Number.isFinite。',{
      runtime:[run('保留合法数值','equal(load("main.js").extractNumber(2.5),2.5);'),run('拒绝错误类型和特殊数值','for(const v of ["2",null,NaN,Infinity,{}])equal(load("main.js").extractNumber(v),null);')],
    }),

  m(5,1,'void 回调可以返回值吗','const cb: () => void = () => 3; 这段赋值一般如何解释？',['可接受，调用方约定不使用返回值，cb() 的静态类型是 void','必定错误，因为 void 回调实现不能返回任何值','cb() 自动变成 number','数字会被自动转换为 undefined 后写入函数体'],'上下文 void 回调允许返回值被忽略。它与明确标注返回 void 的函数体规则需要区分。','回调契约描述调用方怎样使用结果。|右侧函数有自己的返回行为。|通过 cb 看到的返回类型仍是 void。'),
  m(5,2,'void 与 never','日志函数正常执行后结束，与总是抛错的函数，分别适合什么返回类型？',['void 与 never','never 与 void','两者必须 any','两者都为 null'],'正常返回但不使用结果，常用 void；没有正常返回路径用 never。','能否正常执行到结尾？|不使用结果不等于不返回。|日志函数可结束，抛错函数中断。',{stage:'reason'}),
  m(5,3,'明确 void 的函数体','function f(): void { return 3; } 与“返回数字的函数赋给 void 回调”是同一规则吗？',['不同；显式 void 函数体返回数字会报错，回调赋值可允许忽略结果','完全相同，都无条件通过','显式 void 会把数字转成 null','只有函数名不同才影响结果'],'上下文赋值中的返回值忽略有特定用途。不要把它推广成任何 void 函数体都能显式返回任意值。','观察 void 写在函数签名还是变量契约。|需要区分实现检查与函数赋值兼容。|显式 void 的 return 3 不符合签名。'),
  t(5,4,'不要伪造返回值','实现 visit(values:number[], action:(value:number)=>void):void，按顺序调用 action，不返回计算结果。',
    'export function visit(values: number[], action: (value:number)=>void): void { return values.length; }',
    'export function visit(values: number[], action: (value:number)=>void): void { for(const value of values)action(value); }',[
      ok('可忽略回调的数值返回','import {visit} from "./main";const v:void=visit([1],n=>n*2);'),bad('不把 visit 当作计数函数','import {visit} from "./main";const n:number=visit([],n=>{});'),
    ],'visit 的职责是执行回调，调用者不使用其返回值。仍需运行测试确认每个元素都被依次处理。','删除与契约无关的长度返回。|遍历数组并调用 action。|不需要给回调结果创建任何变量。',{
      runtime:[run('逐项且按顺序访问','const seen=[];const r=load("main.js").visit([3,1,2],n=>seen.push(n));equal(seen,[3,1,2]);equal(r,undefined);')],
    }),
  m(5,5,'为什么 map 不能换成 forEach','需要获得一个新数组，却把 values.map(...) 改为 values.forEach(...)。类型能提示什么？',['forEach 的结果是 void，不能当成新数组使用','forEach 自动返回原数组','void 等于 number[]','只要回调返回数字，forEach 就返回数字数组'],'外层方法决定它如何使用回调结果。forEach 忽略回调返回值，map 收集返回值。','先看数组方法本身的返回契约。|回调返回不等于外层返回。|需要新数组应使用收集结果的方法。',{stage:'reason'}),
  t(5,6,'返回处理后的数组','实现 lengths(values:string[]):number[]，返回每个文本长度的新数组。',
    'export function lengths(values: string[]): number[] { return values.forEach(value=>value.length); }',
    'export function lengths(values: string[]): number[] { return values.map(value=>value.length); }',[
      ok('结果为数字数组','import {lengths} from "./main";const a:number[]=lengths(["x"]);'),bad('结果不是文本数组','import {lengths} from "./main";const a:string[]=lengths(["x"]);'),
    ],'map 收集每次回调返回的长度；forEach 只执行副作用。明确返回类型帮助捕捉方法选择错误。','需要收集回调结果。|forEach 返回 void。|改为 map 并保留 number[] 契约。',{
      runtime:[run('收集长度而非丢弃','equal(load("main.js").lengths(["TS","", "type"]),[2,0,4]);')],
    }),
  m(5,7,'async 的无结果任务','async 函数执行保存操作并正常结束，不提供结果数据，通常如何表达？',['Promise<void>','never','void，因为 async 不返回 Promise','Promise<never>，即使正常结束'],'async 的正常完成封装在 Promise 中，无业务结果用 Promise<void>。Promise<never> 不表示普通无结果任务。','async 总会返回 Promise。|正常完成仍然可能发生。|把无业务结果表达在 Promise 内部。',{stage:'reason'}),
  t(5,8,'迁移：完成通知','实现 async complete(name:string, notify:(text:string)=>void):Promise<void>，调用 notify("完成："+name) 一次并正常结束。',
    'export async function complete(name: string, notify:(text:string)=>void): Promise<void> { return name; }',
    'export async function complete(name: string, notify:(text:string)=>void): Promise<void> { notify("完成："+name); }',[
      ok('异步任务可等待','import {complete} from "./main";const p:Promise<void>=complete("TS",s=>{});'),bad('任务不返回名字数据','import {complete} from "./main";const p:Promise<string>=complete("TS",s=>{});'),
    ],'完成通知是副作用，Promise 的正常结果没有业务数据。类型和运行检查分别验证这两点。','当前 return name 与 Promise<void> 冲突。|业务要求通过回调通知。|调用 notify 后正常结束即可。',{
      runtime:[run('异步完成且只通知一次','const seen=[];const result=await load("main.js").complete("TS",s=>seen.push(s));equal(seen,["完成：TS"]);equal(result,undefined);')],
    }),
  m(5,9,'复测：永远抛错','function stop(): never { return; } 为什么错误？',['return 会正常返回 undefined，不满足没有正常返回路径的 never','never 只能用于变量','return 会自动抛出异常','只需把函数名改成 throw 即可'],'never 要求函数无法正常结束；裸 return 仍是正常返回。','无值 return 也是正常返回。|never 描述控制流。|可通过抛错表达无正常结束。'),
  t(5,10,'复测：丢弃回调结果','实现 repeat(times:number, action:()=>void):void，调用 action 恰好 times 次；times 假定为非负整数。',
    'export function repeat(times: number, action:()=>void): void { action(); }',
    'export function repeat(times: number, action:()=>void): void { for(let i=0;i<times;i++)action(); }',[
      ok('允许回调结果被忽略','import {repeat} from "./main";const v:void=repeat(2,()=>42);'),bad('不能把操作当成数值结果','import {repeat} from "./main";const n:number=repeat(2,()=>42);'),
    ],'外层只负责重复动作。回调返回值无论是什么都不属于 repeat 的对外结果。','输入次数决定调用数量。|零次不应触发回调。|循环只执行 action，不返回它的结果。',{
      runtime:[run('精确重复次数','let n=0;load("main.js").repeat(0,()=>n++);equal(n,0);load("main.js").repeat(3,()=>n++);equal(n,3);')],
    }),

  m(6,1,'宽范围给窄目标','let value: string | number 未收窄时，能直接赋给 string 吗？',['不能保证，value 还可能是 number','总能，string 会自动接收数字','只有变量名叫 text 才能','联合类型会随机选一个成员'],'目标要求所有可能值都满足约束。未收窄的联合还包含数字，不能直接承诺为字符串。','考虑联合的全部可能值。|目标只有 string。|需要检查或转换。'),
  m(6,2,'对象多一个字段','const full={name:"Ada",age:30}; const small:{name:string}=full; 通常如何判断？',['结构满足目标所需字段，可以赋值；实际对象仍保留 age','一定报错，因为对象必须字段完全一致','赋值会删除 age','small 自动获得 age 的静态字段'],'已有变量的结构兼容允许来源提供额外能力。目标视图更窄，不会在运行时裁剪对象。','这里传递的是已有变量。|目标只要求 name。|静态可访问范围不等于实际字段集合。',{stage:'reason'}),
  m(6,3,'数组方向','只读数字数组能否无条件交给需要可变 number[] 的函数？',['不能，后者可能修改数组而违背只读契约','可以，只读永远无意义','只读数组会自动复制一份','仅靠改参数名就能兼容'],'调用方承诺不允许通过该视图修改；可变参数允许写入，因此不应直接接收只读输入。可只读的函数应声明 readonly 参数。','考虑函数内部能调用 push。|只读输入不承诺写能力。|可以把不修改的函数参数声明为 readonly number[]。'),
  t(6,4,'修复只读输入的总和','实现 sum(values:readonly number[]):number，求和且不修改输入。让 as const 的数组也可以调用。',
    'export function sum(values: number[]): number { return values.reduce((a,b)=>a+b,0); }',
    'export function sum(values: readonly number[]): number { return values.reduce((a,b)=>a+b,0); }',[
      ok('接受只读与可变数组','import {sum} from "./main";const values:readonly number[]=[1,2];sum(values);sum([1,2]);'),bad('拒绝文本元素','import {sum} from "./main";sum(["1"]);'),
    ],'函数仅需要读取，不应无端要求写能力。readonly 参数扩大合法输入范围，同时限制实现误修改。','实现没有修改数组。|可把参数能力降到只读。|使用 readonly number[]。',{
      runtime:[run('求和并保留输入','const a=Object.freeze([3,4]);equal(load("main.js").sum(a),7);equal(load("main.js").sum([]),0);')],
    }),
  m(6,5,'同为字符串的 ID','type UserId=string; type OrderId=string; 会自动阻止两种 ID 混用吗？',['不会，简单别名仍是兼容的 string；需要更明确的设计才能区分','会，名字不同就名义不兼容','只在文件名相同的时候会','会自动加运行时前缀'],'类型别名不会凭名称创建新的独立身份。品牌类型等模式可以增加约束，但需可靠入口。','别名不等于新运行类型。|结构相同的基础类型仍兼容。|不要仅靠名字期待检查器区别业务身份。',{stage:'reason'}),
  t(6,6,'设计可空结果契约','实现 findName(names:string[], index:number):string|null，索引不是有效数组位置时返回 null；不要返回 undefined。',
    'export function findName(names: string[], index: number): string | null { return names[index]; }',
    'export function findName(names: string[], index: number): string | null { return Number.isInteger(index) && index>=0 && index<names.length ? names[index] ?? null : null; }',[
      ok('结果契约允许 null','import {findName} from "./main";const s:string|null=findName([],0);'),bad('结果不保证存在','import {findName} from "./main";const s:string=findName([],0);'),
    ],'类型兼容不能单独证明数组访问在界内。显式校验索引并把缺失值转为约定的 null。','数字索引可能越界或为小数。|数组访问可能在运行时返回 undefined。|验证整数与范围，并保留 null 失败契约。',{
      runtime:[run('合法索引','equal(load("main.js").findName(["Ada"],0),"Ada");'),run('非法索引一致返回 null','for(const i of [-1,1,0.5,NaN])equal(load("main.js").findName(["Ada"],i),null);')],
    }),
  m(6,7,'声明类型与当前类型','let value:string|number="a"; value=2; 之后能否再次赋 "b"？',['可以，声明类型仍允许 string；当前位置的收窄不永久改写契约','不可以，赋 2 后永远只能是 number','只能赋字面量 a','必须重新声明变量'],'控制流中的当前类型与变量声明范围不同。再次赋值的合法性仍看声明契约。','区分声明范围和当前位置状态。|初始声明明确列出两种类型。|收窄不是永久修改变量定义。',{stage:'reason'}),
  t(6,8,'迁移：统一数字标签','实现 label(value:string|number):string，文本原样返回，数字转成十进制文本。',
    'export function label(value: string | number): string { return value; }',
    'export function label(value: string | number): string { return typeof value === "string" ? value : String(value); }',[
      ok('两种输入统一为文本','import {label} from "./main";const a:string=label(3);const b:string=label("x");'),bad('拒绝布尔输入','import {label} from "./main";label(true);'),
    ],'结果约定比输入窄，必须通过实际转换保证。类型断言不会把数字变成字符串。','返回值必须总是文本。|数字分支需要真实转换。|使用 String 或数字的 toString。',{
      runtime:[run('保持输入含义','const {label}=load("main.js");equal(label("003"),"003");equal(label(3),"3");equal(label(-2),"-2");')],
    }),
  m(6,9,'复测：目标的要求','赋值时来源对象缺少目标要求的必需属性，通常会怎样？',['报错，需要补足属性或重新确认契约','自动补上空字符串','只比较第一个字段','将整个对象自动转换为 any'],'必需属性表达目标代码会使用的能力。类型系统不能凭空生成字段的实际值。','目标可能会直接读取该成员。|来源没有提供对应能力。|应补真实数据或调整明确的可选规则。'),
  t(6,10,'复测：从完整对象读取摘要','实现 summary(value:{name:string;age:number}):string 返回“name(age)”。允许具有额外字段的已有变量，但禁止缺少 age。',
    'export function summary(value: {name:string}): string { return value.name; }',
    'export function summary(value: {name:string;age:number}): string { return `${value.name}(${value.age})`; }',[
      ok('已有对象可有额外字段','import {summary} from "./main";const full={name:"Ada",age:30,role:"admin"};const s:string=summary(full);'),bad('缺年龄不合法','import {summary} from "./main";summary({name:"Ada"});'),
    ],'目标只要求业务所需字段，已有对象可以提供更多结构。额外字段不会妨碍读取所需数据。','输出需要两项真实信息。|参数契约要列出 age。|运行输出按名称和括号年龄组合。',{
      runtime:[run('格式化摘要','equal(load("main.js").summary({name:"Ada",age:30,role:"admin"}),"Ada(30)");')],
    }),

  m(7,1,'Map 的泛型参数','Map<string, number> 的两个类型参数分别限制什么？',['键和对应值的类型','数组长度和初始值','输入函数和输出函数','只能用于注释，没有调用检查'],'Map 的泛型保留键与值的契约，set 和 get 使用这些信息。get 找不到键时还需处理 undefined。','观察 set(key,value)。|两个参数对应不同角色。|键为 string，值为 number。'),
  m(7,2,'Date 类型的边界','一个值是 Date 实例，是否保证日期有效？',['不保证，仍可能是 Invalid Date，需要检查数值时间是否有效','保证，Date 类型只允许合法日期','Date 会自动校正所有错误字符串','只要变量名包含 date 就有效'],'Date 描述实例能力，不保证内部时间有效。可以检查 getTime 的结果是否为 NaN。','类型描述成员，不表达所有内部状态。|new Date("bad") 仍是 Date。|调用时间值并检查有效性。',{stage:'reason'}),
  m(7,3,'Promise 里的类型','Promise<string> 描述什么？',['正常完成时的值是 string；不自动指定拒绝原因的类型','函数只能同步返回文本','失败时也一定是 string','Promise 永远不会拒绝'],'泛型参数描述 fulfilled 值。异常路径需要由应用选择处理策略，不能据此认为失败值一定为某类型。','区分 resolve 与 reject。|只有正常完成值被该参数描述。|错误处理仍需面对真实抛出值。'),
  t(7,4,'修复 Map 中的数值','导出 counts 为 Map<string,number>，初始有 "ts" 对应 2；实现 countOf(key:string):number，缺失时返回 0。',
    'export const counts = new Map<string,number>([["ts",2]]);\nexport function countOf(key: string): number { return counts.get(key); }',
    'export const counts = new Map<string,number>([["ts",2]]);\nexport function countOf(key: string): number { return counts.get(key) ?? 0; }',[
      ok('按文本键查询','import {countOf,counts} from "./main";const n:number=countOf("ts");counts.set("js",3);'),bad('拒绝字符串计数','import {counts} from "./main";counts.set("ts","2");'),
    ],'Map.get 可能返回 undefined。用回退把缺失转换为业务约定的零，保留已有零值。','有键类型不代表键一定存在。|get 返回值包含 undefined。|用 ?? 0 处理缺失。',{
      runtime:[run('现有键与缺失键','const {countOf}=load("main.js");equal(countOf("ts"),2);equal(countOf("missing"),0);')],
    }),
  m(7,5,'标准库声明的作用','把 lib.es2022 加入类型检查会自动给旧运行环境安装新 API 吗？',['不会，它提供类型声明，运行实现需由环境或其他方式提供','会，所有 polyfill 自动打包','只会安装 Map','会把旧浏览器自动升级'],'lib 描述环境可以提供的能力，不能凭声明创造实现。部署环境与类型配置需要一致。','声明文件没有完整运行实现。|检查可用名字与运行支持分开。|选择 lib 后仍需确认目标环境。',{stage:'reason'}),
  t(7,6,'设计唯一标签集合','实现 uniqueTags(tags:readonly string[]):Set<string>，去除重复标签，保留原文本，不修改输入。',
    'export function uniqueTags(tags: readonly string[]): string[] { return [...tags]; }',
    'export function uniqueTags(tags: readonly string[]): Set<string> { return new Set(tags); }',[
      ok('返回文本集合','import {uniqueTags} from "./main";const s:Set<string>=uniqueTags(["a"] as const);'),bad('集合不接受数字','import {uniqueTags} from "./main";uniqueTags([]).add(2);'),
    ],'Set 描述无重复值集合，泛型保留元素类型。readonly 输入说明函数不需要修改调用者的数据。','题目需要集合能力而不是数组副本。|Set 可从可迭代值创建。|返回 new Set(tags)，保留 string 元素类型。',{
      runtime:[run('去重且不改文本','const a=["TS","TS","ts"];const s=load("main.js").uniqueTags(a);equal([...s],["TS","ts"]);equal(a,["TS","TS","ts"]);')],
    }),
  m(7,7,'泛型信息丢失','把 Map<string,number> 换成 Map<any,any> 的主要影响是什么？',['键和值的调用约束变弱，错误可能继续传播','运行时 Map 会自动变成普通对象','查询必定更快','所有值自动转为数字'],'泛型约束帮助检查 set/get 的使用。any 放弃信息，通常不是修复不匹配的正确方式。','观察错误 set 调用能否被发现。|any 会放宽两侧的要求。|应该修复数据或准确契约。',{stage:'reason'}),
  t(7,8,'迁移：异步计数','实现 async totalLength(values:readonly string[]):Promise<number>，返回所有字符串长度之和。',
    'export async function totalLength(values: readonly string[]): Promise<string> { return String(values.length); }',
    'export async function totalLength(values: readonly string[]): Promise<number> { return values.reduce((sum,value)=>sum+value.length,0); }',[
      ok('正常完成值为数字','import {totalLength} from "./main";const p:Promise<number>=totalLength(["TS"] as const);'),bad('不承诺文本结果','import {totalLength} from "./main";const p:Promise<string>=totalLength([]);'),
    ],'Promise 参数描述完成值。实现需要累加各文本长度，而不是返回元素数量或格式化文本。','输入元素数量不等于字符总数。|async 自动包裹正常返回值。|累加 value.length 并承诺 Promise<number>。',{
      runtime:[run('等待数字结果','equal(await load("main.js").totalLength(["TS","type"]),6);equal(await load("main.js").totalLength([]),0);')],
    }),
  m(7,9,'复测：Set 去重规则','Set<string> 中加入 "TS" 和 "ts" 会有几个元素？',['2；类型不会自动执行大小写归一化','1；string 自动忽略大小写','0；必须先转为对象','编译器会随机选择一个'],'Set 按实际值比较，字符串大小写不同。若业务需要忽略大小写，应明确预处理。','类型约束不修改字符串内容。|两个实际值并不相等。|需要业务归一化时显式执行。'),
  t(7,10,'复测：识别有效日期','实现 isValidDate(value:Date):boolean，合法时间返回 true，Invalid Date 返回 false。',
    'export function isValidDate(value: Date): boolean { return true; }',
    'export function isValidDate(value: Date): boolean { return !Number.isNaN(value.getTime()); }',[
      ok('接收 Date 实例','import {isValidDate} from "./main";const b:boolean=isValidDate(new Date());'),bad('拒绝未经解析的日期字符串','import {isValidDate} from "./main";isValidDate("2026-01-01");'),
    ],'实例类型与内部有效状态不同。读取时间数值并检查 NaN 可验证这里的有效性。','无效 Date 仍有 getTime 方法。|无效时间数值为 NaN。|用 Number.isNaN 检查并取反。',{
      runtime:[run('区分有效与无效日期','const {isValidDate}=load("main.js");check(isValidDate(new Date(0)));check(!isValidDate(new Date("not a date")));')],
    }),
];
