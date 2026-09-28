import { mc, task, ok, bad, run } from './author.mjs';
const id=n=>`t03-l${String(n).padStart(2,'0')}`;
const m=(l,n,title,prompt,options,explanation,hints,extra={})=>mc(id(l),n,title,prompt,options,explanation,hints.split('｜'),extra);
const t=(l,n,title,prompt,files,solution,tests,explanation,hints,extra={})=>task(id(l),n,title,prompt,files,solution,tests,explanation,hints.split('｜'),extra);
export const questions=[
  m(1,1,'联合是其中一种','string | number 最准确的含义是什么？',['当前值可以是文本或数字之一，使用独有能力前要区分','每个值必须同时是文本和数字','编译后变成含两项的数组','只能接收第一个列出的类型'],'联合描述候选范围，不把多个值组合成一个容器。','想想一个变量当前能保存几个实际值。｜竖线表达可选的类型分支。｜需要在使用前确定当前分支。'),
  m(1,2,'标识符的入口','业务 ID 允许数字或字符串，但不允许布尔。哪种类型更直接？',['string | number','any','string & number','unknown 且不做检查'],'有限且已知的入口范围可以直接用联合表达。any 过宽，交叉要求同时满足，unknown 则表达更广泛未知。','业务已给出完整候选范围。｜不需要放行任意类型。｜用联合表达两种输入。',{stage:'reason'}),
  m(1,3,'联合不会自动转换','format(value:string|number) 内想返回 value.toUpperCase()，为什么需要分支？',['number 没有该方法，联合并不自动把数字转成文本','联合会删除所有方法','toUpperCase 只能用于字面量','number 自动转换发生在函数返回之后'],'候选类型不同，使用文本方法前需要判断或真正转换成字符串。','检查每个候选支持的成员。｜数字没有文本的大写方法。｜先判断或者显式转换。'),
  t(1,4,'安全的大写 ID','实现 upperId(value:string|number):string：文本转大写，数字转为文本。',
    'export function upperId(value:string|number):string {return value.toUpperCase();}',
    'export function upperId(value:string|number):string {return typeof value==="string"?value.toUpperCase():String(value);}',[
      ok('接受两类 ID','import {upperId} from "./main";const a:string=upperId("ab");const b:string=upperId(12);'),bad('不允许第三种类型','import {upperId} from "./main";upperId(false);'),
    ],'typeof 建立分支证据；数字分支执行真实的文本转换，返回值统一为 string。','先区分文本与数字。｜文本分支可调用大写方法。｜数字分支使用 String(value)。',{
      runtime:[run('两个分支都处理','const {upperId}=load("main.js");equal(upperId("ab"),"AB");equal(upperId(12),"12");')],
    }),
  m(1,5,'更宽的联合带来什么','把 string|number 随手改成 string|number|boolean，但实现没有新增处理，应该注意什么？',['所有新增候选也必须被正确处理，放宽契约会扩大实现责任','只影响文档，不影响调用范围','boolean 自动走字符串分支','编译器自动生成业务逻辑'],'联合是函数对外接受范围的承诺。每个新增成员都可能进入实现，必须检查对应逻辑。','调用者现在能传入布尔值。｜实现是否知道怎样处理它？｜接口变化需要验证所有分支。',{stage:'reason'}),
  t(1,6,'设计批量输入入口','实现 list(value:string|string[]):string[]：文本包装为单元素数组，数组则返回一份副本。',
    'export function list(value:string|string[]):string[] {return [value];}',
    'export function list(value:string|string[]):string[] {return typeof value==="string"?[value]:[...value];}',[
      ok('两类合法输入','import {list} from "./main";const a:string[]=list("x");const b:string[]=list(["x"]);'),bad('拒绝数值数组','import {list} from "./main";list([1]);'),
    ],'联合中的数组分支应展开复制，不能整体再嵌套一层。返回副本避免调用者修改结果时影响原数组。','字符串分支和数组分支的构造方式不同。｜数组不能再包装成二维结构。｜使用展开操作复制数组。',{
      runtime:[run('统一为一维新数组','const {list}=load("main.js");equal(list("x"),["x"]);const a=["x","y"];const b=list(a);equal(b,a);check(a!==b);')],
    }),
  m(1,7,'联合中的空值','number | null 和 number | undefined 可以无条件互相替换吗？',['不可以，严格检查下两种缺失值不同，业务契约也可能不同','可以，null 和 undefined 永远相等','可以，都会自动变成零','只有变量名相同时才可以'],'缺失值属于契约的一部分。转换缺失表示时要明确处理，而非假设类型会自动代换。','目标是否列出了另一种缺失值？｜严格空值检查区分它们。｜需要明确转换规则。',{stage:'reason'}),
  t(1,8,'迁移：缺省数量','实现 quantity(value:number|null|undefined):number，null 或 undefined 返回 1，其余原样返回，包括 0。',
    'export function quantity(value:number|null|undefined):number {return value || 1;}',
    'export function quantity(value:number|null|undefined):number {return value ?? 1;}',[
      ok('所有候选有明确结果','import {quantity} from "./main";const n:number=quantity(undefined);quantity(null);quantity(0);'),bad('文本不属于候选','import {quantity} from "./main";quantity("0");'),
    ],'空值合并只回退 null 和 undefined。|| 还会把零当作缺省，不符合本题。','零也是假值，但不是缺失。｜需要同时处理两种空值。｜使用 ?? 表达缺省。',{
      runtime:[run('缺失与零分开','const {quantity}=load("main.js");equal(quantity(null),1);equal(quantity(undefined),1);equal(quantity(0),0);equal(quantity(5),5);')],
    }),
  m(1,9,'复测：候选顺序','number|string 与 string|number 的候选顺序会决定运行时优先转换方向吗？',['不会，联合类型不执行转换，候选顺序不是运行规则','会，永远转为第一个类型','会，最后一个类型会被忽略','取决于变量名字'],'联合类型在编译后不产生分支选择逻辑。实际转换或分支应由代码明确执行。','类型表达式不是运行指令。｜没有自动转换行为。｜调整候选顺序不改变业务逻辑。'),
  t(1,10,'复测：显示布尔或文本','实现 display(value:boolean|string):string，布尔显示“是”或“否”，文本原样返回。',
    'export function display(value:boolean|string):string {return value?"是":"否";}',
    'export function display(value:boolean|string):string {return typeof value==="string"?value:value?"是":"否";}',[
      ok('联合入口合法','import {display} from "./main";const s:string=display(false);display("未设置");'),bad('拒绝数字','import {display} from "./main";display(0);'),
    ],'先区分类型再解释布尔值，避免把任意非空文本都误当成“是”。','文本不应通过真值性被替换。｜先判断是否为 string。｜剩下的分支才处理 boolean。',{
      runtime:[run('文本与布尔保持区别','const {display}=load("main.js");equal(display("待定"),"待定");equal(display(""),"");equal(display(false),"否");equal(display(true),"是");')],
    }),

  m(2,1,'同名字段不同类型','A={value:string}，B={value:number}，读取 (A|B).value 的类型是什么？',['string | number','string，因为 A 写在前面','never，因为同名属性冲突','any'],'两个分支都拥有 value，因此可以直接读取；值类型仍包含两种候选。','字段存在与字段类型一致是两回事。｜这里两个分支都提供字段。｜结果保留两种值类型。'),
  m(2,2,'同名方法能否调用','两个候选都有 run，但一个要求 string，另一个要求 number，能否随意传 string？',['不能保证，必须确认实际分支或找同时安全的参数','可以，同名方法一律等价','会自动执行两个 run','编译器自动转换为 number'],'共有成员并不保证任意调用都安全。调用参数必须满足当前可能的方法签名。','不只看方法名字。｜分别检查参数要求。｜要对所有候选都安全才可直接调用。',{stage:'reason'}),
  m(2,3,'共有方法返回值','string|number 上调用 toString() 为什么常可行？',['二者都支持无参数调用，且返回文本','联合自动先转换成字符串','所有方法都能直接调用','toString 只在 TS 中存在'],'两个候选都支持该操作，因此无需先区分。这个结论不能推广到其中一个类型独有的方法。','检查两种类型的方法契约。｜无参数 toString 对二者安全。｜共同能力可以直接使用。'),
  t(2,4,'只读取共有名称','导出 Cat={name:string;meow:()=>string}、Dog={name:string;bark:()=>string}；实现 getName(animal:Cat|Dog):string，只返回 name。',
    'export type Cat={name:string;meow:()=>string};\nexport type Dog={name:string;bark:()=>string};\nexport function getName(animal:Cat|Dog):string {return animal.meow();}',
    'export type Cat={name:string;meow:()=>string};\nexport type Dog={name:string;bark:()=>string};\nexport function getName(animal:Cat|Dog):string {return animal.name;}',[
      ok('两种动物都能读名称','import {getName,Cat,Dog} from "./main";const c:Cat={name:"咪",meow:()=>"m"};const d:Dog={name:"旺",bark:()=>"b"};getName(c);getName(d);'),bad('缺少名称被拒绝','import {getName} from "./main";getName({bark:()=>"b"});'),
    ],'name 是两个分支共有的文本字段，独有的 meow 不能未经区分就调用。','任务只需要名称。｜两种动物都有哪些属性？｜直接读取共有的 name。',{
      runtime:[run('不触发独有动作','const {getName}=load("main.js");equal(getName({name:"咪",meow:()=>{throw Error("不应调用")}}),"咪");equal(getName({name:"旺",bark:()=>"b"}),"旺");')],
    }),
  m(2,5,'可选字段不代表都有值','两个分支都声明 label?:string，直接 label.trim() 为什么仍可能报错？',['共有字段的读取结果仍可能为 undefined','可选字段会被删除','trim 不能用于属性值','共有字段必须是 number'],'共有意味着字段属于可访问契约，但可选性仍然保留。使用具体方法前还需处理缺失。','能读取不等于一定有文本值。｜问号允许属性不存在。｜给缺失值一个明确处理分支。',{stage:'reason'}),
  t(2,6,'设计共有载荷读取','导出 Text={kind:"text";value:string}、Count={kind:"count";value:number}；实现 valueOf(item:Text|Count):string|number，返回 value。',
    'export type Text={kind:"text";value:string};\nexport type Count={kind:"count";value:number};\nexport function valueOf(item:Text|Count):string {return item.value;}',
    'export type Text={kind:"text";value:string};\nexport type Count={kind:"count";value:number};\nexport function valueOf(item:Text|Count):string|number {return item.value;}',[
      ok('保留载荷两种类型','import {valueOf} from "./main";const x:string|number=valueOf({kind:"count",value:3});'),bad('不能假设全为文本','import {valueOf} from "./main";const x:string=valueOf({kind:"text",value:"x"});'),bad('载荷和 kind 必须一致','import {valueOf} from "./main";valueOf({kind:"count",value:"3"});'),
    ],'共有字段允许读取，但值类型需要保留分支差异。本题没有要求根据参数重载精确返回，只承诺联合结果。','读取 value 是合法的。｜问题在返回类型过窄。｜让返回契约覆盖文本和数字。',{
      runtime:[run('值不被强制转换','const {valueOf}=load("main.js");equal(valueOf({kind:"count",value:3}),3);equal(valueOf({kind:"text",value:"003"}),"003");')],
    }),
  m(2,7,'相同字段名不能证明分支','User 和 Product 都有 id:string，判断 typeof value.id === "string" 可以区分它们吗？',['不能，两者都满足，需其他证据','可以，User 会被优先选中','可以，id 在任何对象中唯一标识类型','会把 Product 删除'],'区分条件必须在候选之间产生差异。共有字段相同类型不能证明是哪个分支。','条件对两个分支分别是否成立？｜都成立就没有区分能力。｜选择专属属性或判别字段。',{stage:'reason'}),
  t(2,8,'迁移：共同面积入口','导出 Square={side:number;area:()=>number}、Circle={radius:number;area:()=>number}；实现 areaOf(shape:Square|Circle) 调用共同 area 方法。',
    'export type Square={side:number;area:()=>number};\nexport type Circle={radius:number;area:()=>number};\nexport function areaOf(shape:Square|Circle):number {return shape.side*shape.side;}',
    'export type Square={side:number;area:()=>number};\nexport type Circle={radius:number;area:()=>number};\nexport function areaOf(shape:Square|Circle):number {return shape.area();}',[
      ok('两种形状都支持面积方法','import {areaOf} from "./main";areaOf({side:2,area:()=>4});areaOf({radius:2,area:()=>12});'),bad('面积方法不能返回文本','import {areaOf} from "./main";areaOf({side:2,area:()=>"4"});'),
    ],'抽象入口可以依赖共同方法，避免知道每个形状的全部字段。方法实现负责具体面积逻辑。','题目提供了统一的 area 能力。｜side 只属于一种形状。｜调用 shape.area()。',{
      runtime:[run('使用各对象提供的面积','const {areaOf}=load("main.js");equal(areaOf({side:2,area:()=>4}),4);equal(areaOf({radius:3,area:()=>28}),28);')],
    }),
  m(2,9,'复测：共有可调用成员','两种候选的 method 都是 ()=>string，可以直接 method() 吗？',['可以，调用形式和返回契约都兼容','不能，联合禁止调用任何方法','只有同一个 class 的实例才可以','会同时调用两个分支的方法'],'当前实际对象只有自己的方法；联合要求这次调用对所有候选都安全。','逐个比较签名。｜两边都接受零参数并返回文本。｜这次调用有共同安全契约。'),
  t(2,10,'复测：共同时间字段','导出 Created={createdAt:number;name:string} 和 Updated={createdAt:number;revision:number}，实现 timestamp(value:Created|Updated):number 返回 createdAt。',
    'export type Created={createdAt:number;name:string};\nexport type Updated={createdAt:number;revision:number};\nexport function timestamp(value:Created|Updated):number {return value.revision;}',
    'export type Created={createdAt:number;name:string};\nexport type Updated={createdAt:number;revision:number};\nexport function timestamp(value:Created|Updated):number {return value.createdAt;}',[
      ok('共同时间可读取','import {timestamp} from "./main";timestamp({createdAt:1,name:"x"});timestamp({createdAt:2,revision:3});'),bad('缺时间不能调用','import {timestamp} from "./main";timestamp({name:"x"});'),
    ],'业务要求的是共有时间字段，不应误用某一候选的版本号。类型检查可帮助发现这样的字段选择错误。','revision 并非两个分支都有。｜createdAt 的契约一致。｜返回共同字段。',{
      runtime:[run('时间不是版本','const {timestamp}=load("main.js");equal(timestamp({createdAt:10,name:"x"}),10);equal(timestamp({createdAt:20,revision:2}),20);')],
    }),

  m(3,1,'真值过滤丢了什么','if (value) 用来判断 string|null 时，空字符串会进入哪一侧？',['与 null 一起进入假分支，可能误把有效空文本当作缺失','一定进入真分支，因为类型是 string','编译器禁止这种写法','自动改成 value !== null'],'真值性关注运行值，空字符串是假值。需要仅排除 null 时应使用明确判断。','空字符串的布尔值是什么？｜业务缺失与 JS 假值未必一致。｜显式 null 判断能保留空文本。'),
  m(3,2,'相等判断的交集','a:string|number，b:string|boolean，若 a===b 成立，分支内共同类型是什么？',['string','number','boolean','never'],'相等要求实际值相同，两组候选的共同部分是 string。','比较两边允许的类型集合。｜寻找交集。｜两边共同支持 string。',{stage:'reason'}),
  m(3,3,'提前返回后的类型','if (typeof value!=="string") return; 后继续执行的代码中，value 为什么可按 string 使用？',['其他候选已在前面退出，控制流只剩字符串情况','return 会把任意值转成 string','函数名会控制推断','所有 unknown 都会自动变成 string'],'控制流分析不仅看 if 内，也看哪些分支还能到达当前位置。','分析能到达后续语句的路径。｜非字符串路径已经返回。｜余下路径建立字符串证据。'),
  t(3,4,'保留合法的零','实现 double(value:number|null):number|null，null 返回 null，数字翻倍，包括 0。',
    'export function double(value:number|null):number|null {return value?value*2:null;}',
    'export function double(value:number|null):number|null {return value===null?null:value*2;}',[
      ok('允许数字和空值','import {double} from "./main";const x:number|null=double(0);double(null);'),bad('不接收 undefined','import {double} from "./main";double(undefined);'),
    ],'真值分支会错误处理零。显式排除 null 后，剩余路径确定为 number。','先检查零输入。｜仅 null 应返回 null。｜把真值判断改为精确空值比较。',{
      runtime:[run('零和缺失不同','const {double}=load("main.js");equal(double(0),0);equal(double(null),null);equal(double(-2),-4);')],
    }),
  m(3,5,'短路与业务默认值','为什么 value || fallback 与 value ?? fallback 不能总互换？',['前者会回退所有假值，后者只回退 null 和 undefined','两者运行完全一致','?? 会验证任意对象结构','|| 只处理 undefined'],'默认值运算需要符合业务的缺失定义。0、false、空字符串在很多场景都有效。','列出假值集合。｜比较其中哪些不是空值。｜根据业务定义选择回退条件。',{stage:'reason'}),
  t(3,6,'设计文本长度入口','实现 lengthOrZero(value:string|undefined):number，undefined 返回 0，其余返回字符串长度。用提前返回完成收窄。',
    'export function lengthOrZero(value:string|undefined):number {return value.length;}',
    'export function lengthOrZero(value:string|undefined):number {if(value===undefined)return 0;return value.length;}',[
      ok('处理可能缺失的文本','import {lengthOrZero} from "./main";const n:number=lengthOrZero(undefined);'),bad('拒绝数值输入','import {lengthOrZero} from "./main";lengthOrZero(2);'),
    ],'提前处理缺失后，后续语句只会收到 string。实现不需要断言。','undefined 不存在 length。｜可以先退出缺失路径。｜剩下的代码直接读取 length。',{
      runtime:[run('缺失和文本长度','const {lengthOrZero}=load("main.js");equal(lengthOrZero(undefined),0);equal(lengthOrZero("abc"),3);equal(lengthOrZero(""),0);')],
    }),
  m(3,7,'收窄证据会失效吗','在确认变量为 string 后，又把该变量赋成 number，原来的字符串证据还能直接沿用吗？',['不能，赋值改变当前位置的类型信息','能，首次判断永久锁定变量','变量会自动变回 string','赋值被忽略但不报错'],'控制流会追踪更新。使用成员时要根据当前位置的证据，而不是曾经满足过的条件。','检查调用之前是否重新赋值。｜当前值不再是当时的值。｜按最近可达的赋值重新分析。',{stage:'reason'}),
  t(3,8,'迁移：匹配共享文本','实现 sameText(a:string|number,b:string|boolean):string|null；只有严格相等且为文本时返回该文本，其他返回 null。',
    'export function sameText(a:string|number,b:string|boolean):string|null {return String(a);}',
    'export function sameText(a:string|number,b:string|boolean):string|null {return a===b?a:null;}',[
      ok('输入候选正确','import {sameText} from "./main";const x:string|null=sameText("a","a");sameText(1,false);'),bad('拒绝左侧布尔输入','import {sameText} from "./main";sameText(true,"a");'),
    ],'相等分支内只剩共有的 string 类型。不能通过强制转换把不相等的值伪装成匹配。','先检查严格相等。｜两边的共有类型是 string。｜相等时返回 a，不相等返回 null。',{
      runtime:[run('只返回相同文本','const {sameText}=load("main.js");equal(sameText("a","a"),"a");equal(sameText("", ""),"");equal(sameText(1,"1"),null);equal(sameText("a",false),null);')],
    }),
  m(3,9,'复测：宽泛的 object 判断','typeof value === "object" 可以证明 value 不是 null 吗？',['不能，还要显式排除 null','可以，TS 修正了运行时 typeof 结果','只有 strict 关闭才不能','能证明它一定是数组'],'typeof 的运行语义仍是 JavaScript 规则，null 需要单独处理，数组也需要进一步区分。','回忆 typeof null。｜object 还包含多种结构。｜一步判断通常不足以证明完整数据形状。'),
  t(3,10,'复测：数字或文本的空白处理','实现 clean(value:string|number|null):string|null；null 保持 null，文本 trim，数字转为文本。',
    'export function clean(value:string|number|null):string|null {return value?String(value).trim():null;}',
    'export function clean(value:string|number|null):string|null {if(value===null)return null;return typeof value==="string"?value.trim():String(value);}',[
      ok('三种候选都接收','import {clean} from "./main";const x:string|null=clean(0);clean(null);'),bad('布尔值被拒绝','import {clean} from "./main";clean(false);'),
    ],'精确区分缺失、文本和数字，才能保留零与空字符串。泛用真值回退会损失合法信息。','检查 0 和空字符串的结果。｜只有 null 应保持缺失。｜逐个分支处理真实类型。',{
      runtime:[run('三分支与边界','const {clean}=load("main.js");equal(clean(null),null);equal(clean(0),"0");equal(clean("  "),"");equal(clean(" TS "),"TS");')],
    }),

  m(4,1,'in 检查什么','"swim" in animal 的作用更接近哪一项？',['检查属性是否存在于对象或其原型链，帮助排除不可能分支','检查 swim 的值必定是函数','只检查对象自身可枚举属性','检查类名字等于 Swim'],'in 建立属性存在的证据，不自动证明任意未知属性的值类型。读取未知数据时通常还需验证值。','属性存在与属性类型是两个问题。｜in 还会检查原型链。｜不要把存在当作可调用。'),
  m(4,2,'可选属性出现在哪侧','Fish={swim:()=>void}，Human={swim?:()=>void}。检查 "swim" in value 后，Human 能否只出现在假侧？',['不能，可选属性可能存在，因此 Human 可出现在两侧','可以，可选总表示不存在','Human 自动变成 Fish','检查会给 Human 补上函数'],'可选意味着可能有也可能没有，不能用于唯一识别 Human。','分别考虑有 swim 的人和没有 swim 的人。｜两个对象都符合 Human。｜条件不能排除所有 Human。',{stage:'reason'}),
  m(4,3,'instanceof 的证据','value instanceof Date 为 true 时，可以进一步检查什么？',['Date 方法和内部时间有效性；实例检查不保证日期有效','value 必定是有效 ISO 字符串','所有属性自动只读','任何接口都能放在 instanceof 右侧'],'instanceof 建立类实例证据。接口没有运行时值，Date 实例也可能含无效时间。','右侧是实际构造函数。｜实例身份与内部合法性不同。｜可以调用 getTime 再验证。'),
  t(4,4,'区分鱼和鸟','导出 Fish={swim:()=>string}、Bird={fly:()=>string}，实现 move(value:Fish|Bird):string，按实际分支调用对应动作。',
    'export type Fish={swim:()=>string};export type Bird={fly:()=>string};\nexport function move(value:Fish|Bird):string{return value.swim();}',
    'export type Fish={swim:()=>string};export type Bird={fly:()=>string};\nexport function move(value:Fish|Bird):string{return "swim" in value?value.swim():value.fly();}',[
      ok('支持两种结构','import {move} from "./main";move({swim:()=>"游"});move({fly:()=>"飞"});'),bad('动作必须是函数','import {move} from "./main";move({swim:"游"});'),
    ],'本题输入已经由联合契约限制为两类对象，swim 属性存在可以区分分支。未知 JSON 还需额外验证可调用性。','两个分支有不同的必需属性。｜用 in 检查 swim。｜另一侧确定为 Bird，再调用 fly。',{
      runtime:[run('选择实际动作','const {move}=load("main.js");equal(move({swim:()=>"游"}),"游");equal(move({fly:()=>"飞"}),"飞");')],
    }),
  m(4,5,'对象入口先排除什么','对 unknown 使用 "name" in value 之前，为什么通常先判断 typeof value === "object" && value !== null？',['in 需要合适的对象右值，未知输入可能是原始值或 null','这样会自动给对象添加 name','typeof 会把原始值变成对象','这是为了提高 JSON 下载速度'],'运行判断先保证操作本身安全，再验证属性存在和值类型。','unknown 可能是数字、空值或文本。｜直接 in 运算不一定安全。｜按从宽到窄的顺序建立证据。',{stage:'reason'}),
  t(4,6,'设计未知对象的名字读取','实现 readName(value:unknown):string|null，仅当 value 是非 null 对象，且 name 字段为 string 时返回 name。',
    'export function readName(value:unknown):string|null{return value.name;}',
    'export function readName(value:unknown):string|null{if(typeof value!=="object"||value===null||!("name" in value))return null;return typeof value.name==="string"?value.name:null;}',[
      ok('入口保留未知类型','import {readName} from "./main";const x:unknown=null;const s:string|null=readName(x);'),bad('不能保证一定成功','import {readName} from "./main";const s:string=readName({});'),
    ],'先验证对象，再验证字段存在，最后验证字段类型。仅属性存在不够，本题要求真实文本。','不要先对 null 使用 in。｜字段存在也可能是数字。｜三层判断后才能返回可信文本。',{
      runtime:[run('接受名字对象','equal(load("main.js").readName({name:"林"}),"林");'),run('拒绝缺失和错型','for(const v of [null,3,"x",{}, {name:2}])equal(load("main.js").readName(v),null);')],
    }),
  m(4,7,'数组也是对象','typeof value === "object" 能唯一识别普通记录对象吗？',['不能，数组、Date 等也可能满足，需要额外结构判断','可以，数组的 typeof 是 array','可以，Date 的 typeof 是 date','只能识别接口实例'],'运行时对象类别宽泛，typeof 只是第一层证据。应根据业务要求继续检查。','回忆 typeof []。｜不同对象共享 object 分类。｜字段与容器性质需另外验证。',{stage:'reason'}),
  t(4,8,'迁移：日期或文本时间','实现 timestamp(value:Date|string):number|null，把 Date 或日期文本转成有效时间戳，无效日期返回 null。',
    'export function timestamp(value:Date|string):number|null{return value.getTime();}',
    'export function timestamp(value:Date|string):number|null{const n=value instanceof Date?value.getTime():new Date(value).getTime();return Number.isNaN(n)?null:n;}',[
      ok('两种时间入口','import {timestamp} from "./main";const n:number|null=timestamp(new Date(0));timestamp("1970-01-01T00:00:00Z");'),bad('不接受未约定的数字','import {timestamp} from "./main";timestamp(0);'),
    ],'instanceof 区分 Date 与文本。两条路径都可能得到无效时间，所以在汇合处验证数值。','Date 方法不能直接用于文本。｜字符串路径需要创建日期对象。｜两种路径都检查 NaN。',{
      runtime:[run('两种有效输入','const {timestamp}=load("main.js");equal(timestamp(new Date(0)),0);equal(timestamp("1970-01-01T00:00:00Z"),0);'),run('无效日期一致失败','const {timestamp}=load("main.js");equal(timestamp("bad"),null);equal(timestamp(new Date("bad")),null);')],
    }),
  m(4,9,'复测：存在不等于非空','若对象类型有 note?:string，"note" in obj 成立就能在所有配置下直接 note.trim() 吗？',['不能一概而论，可选写入规则与字段类型仍可能允许 undefined','一定可以，in 自动转成 string','一定不能读取任何属性','in 只检查真假值'],'属性存在不总等于值非 undefined，必须结合 exactOptionalPropertyTypes 与字段声明判断。','属性可以存在但保存 undefined。｜配置影响可选字段的写入语义。｜必要时再检查 typeof 字段。'),
  t(4,10,'复测：读取数值容量','实现 capacity(value:unknown):number|null，仅返回非 null 对象中有限的 number 类型 capacity 字段，其余 null。',
    'export function capacity(value:unknown):number|null{return 0;}',
    'export function capacity(value:unknown):number|null{if(typeof value!=="object"||value===null||!("capacity" in value))return null;return typeof value.capacity==="number"&&Number.isFinite(value.capacity)?value.capacity:null;}',[
      ok('未知对象入口','import {capacity} from "./main";const n:number|null=capacity({capacity:3});'),bad('不承诺一直返回数字','import {capacity} from "./main";const n:number=capacity(null);'),
    ],'结构验证与数值有效性需要共同完成。字段同名但类型不对仍应拒绝。','先验证对象形态。｜再验证字段存在。｜最后要求 number 且有限。',{
      runtime:[run('保留有效容量','equal(load("main.js").capacity({capacity:0}),0);equal(load("main.js").capacity({capacity:5}),5);'),run('拒绝无效容量','for(const v of [null,{}, {capacity:"5"},{capacity:Infinity}])equal(load("main.js").capacity(v),null);')],
    }),

  m(5,1,'很多可选属性的问题','{status:"success"|"error";data?:string;error?:string} 容易允许什么非法状态？',['success 却没有 data，或同时携带互相矛盾的数据','完全无法表示 success','所有字段自动必需','对象自动成为 never'],'单个对象上的独立可选字段没有把状态与有效载荷关联起来。判别联合可明确各分支要求。','状态变化是否控制字段要求？｜现在 data 总是可选。｜用分支对象表达对应关系。'),
  m(5,2,'正确的判别字段','适合作为联合分支判别字段的是哪种设计？',['各分支共享 kind 字段，但它的字面量值分别固定为不同值','各分支都有 name:string，名字任意','各分支都有 id:number，可能相同','各分支全部没有共同字段'],'共享字段上的不同字面量值提供稳定区分证据。任意 name 或 id 无法直接排除其他分支。','字段名共享，字段值有明确差异。｜区别来自类型中的字面量。｜例如 kind 为 success 或 error。',{stage:'reason'}),
  m(5,3,'访问成功数据','Result={ok:true;data:string}|{ok:false;error:string}，在 if(result.ok) 内为何能读 data？',['ok 的字面量值唯一确定成功分支','所有布尔字段都自动创造 data','error 字段被运行时删除','TS 自动请求服务器补数据'],'判别条件排除了失败分支，成功分支明确含 data。它不修改实际对象。','比较两个分支的 ok 类型。｜true 只对应成功分支。｜data 是该分支的必需字段。'),
  t(5,4,'修复请求状态模型','导出 Result，成功形态为 {status:"success";data:string}，失败为 {status:"error";error:string}。实现 message(result) 返回对应载荷。',
    'export type Result={status:"success"|"error";data?:string;error?:string};\nexport function message(result:Result):string{return result.status==="success"?result.data:result.error;}',
    'export type Result={status:"success";data:string}|{status:"error";error:string};\nexport function message(result:Result):string{return result.status==="success"?result.data:result.error;}',[
      ok('两个有效状态','import {message} from "./main";message({status:"success",data:"好"});message({status:"error",error:"坏"});'),bad('成功必须有数据','import type {Result} from "./main";const r:Result={status:"success"};'),bad('失败载荷不能写成成功数据','import type {Result} from "./main";const r:Result={status:"error",data:"错位"};'),
    ],'两个分支各自要求有效载荷，状态检查能精确收窄。补断言只会掩盖原模型允许非法状态的问题。','问题不只在 return 行。｜目前 success 允许缺少 data。｜把一个对象拆成两个有明确字段的分支。',{
      runtime:[run('按状态读载荷','const {message}=load("main.js");equal(message({status:"success",data:"好"}),"好");equal(message({status:"error",error:"坏"}),"坏");')],
    }),
  m(5,5,'状态模型要保留关联','把 status 和 data 分别放进两个没有关系的变量，之后按 status 判断 data，可能有什么问题？',['关联信息可能丢失，检查器无法证明 data 属于那个状态','任何解构永远不会收窄','data 自动变成成功值','变量名相同就能恢复关联'],'收窄依赖可识别的关联与控制流。保留联合对象通常更清晰；具体解构能否保留关联要看写法和后续赋值。','不要把两个独立变量当作天然相关。｜检查器需要结构或控制流证据。｜优先在联合对象上判断和读取。',{stage:'reason'}),
  t(5,6,'设计加载状态','导出 State：loading 无载荷、ready 必有 items:string[]、failed 必有 reason:string。实现 count(state):number，ready 返回数组长度，其他返回 0。',
    'export type State={kind:string;items?:string[];reason?:string};\nexport function count(state:State):number{return state.items?.length??0;}',
    'export type State={kind:"loading"}|{kind:"ready";items:string[]}|{kind:"failed";reason:string};\nexport function count(state:State):number{return state.kind==="ready"?state.items.length:0;}',[
      ok('三种合法状态','import {count,State} from "./main";const a:State={kind:"loading"};count(a);count({kind:"ready",items:[]});count({kind:"failed",reason:"断网"});'),bad('ready 不能缺载荷','import type {State} from "./main";const s:State={kind:"ready"};'),bad('未知状态不能进入','import type {State} from "./main";const s:State={kind:"other"};'),
    ],'每个状态有独立的数据要求。加载中没有 items，不应通过一堆可选字段弱化 ready 的契约。','先列出三种对象形态。｜ready 的 items 是必需字段。｜判断 ready 后可以直接读取数组长度。',{
      runtime:[run('只统计成功数据','const {count}=load("main.js");equal(count({kind:"ready",items:["a","b"]}),2);equal(count({kind:"loading"}),0);equal(count({kind:"failed",reason:"x"}),0);')],
    }),
  m(5,7,'判别联合负责运行校验吗','把远端 JSON 的静态类型断言成 State，能保证它符合各分支吗？',['不能，仍需运行时校验；联合只约束受检查的代码','能，联合会自动验证必需字段','能，status 文本会被自动纠正','只要有三个分支就能'],'声明和断言不处理真实远端数据。判别联合应与入口验证配合。','看是否实际执行了检查。｜类型声明在运行时不可遍历。｜先校验再使用可信状态。',{stage:'reason'}),
  t(5,8,'迁移：付款方式','导出 Payment：{kind:"card";last4:string} 或 {kind:"cash";received:number}；实现 describe(payment)，分别返回“卡号尾号 xxxx”与“现金 n”。',
    'export type Payment={kind:"card"|"cash";last4?:string;received?:number};\nexport function describe(payment:Payment):string{return String(payment.last4);}',
    'export type Payment={kind:"card";last4:string}|{kind:"cash";received:number};\nexport function describe(payment:Payment):string{return payment.kind==="card"?`卡号尾号 ${payment.last4}`:`现金 ${payment.received}`;}',[
      ok('两种支付方式','import {describe} from "./main";describe({kind:"card",last4:"0123"});describe({kind:"cash",received:20});'),bad('现金必须有金额','import type {Payment} from "./main";const p:Payment={kind:"cash"};'),bad('银行卡不能用现金载荷替代','import type {Payment} from "./main";const p:Payment={kind:"card",received:20};'),
    ],'把状态与载荷绑定后，处理函数可安全使用对应字段。卡号尾号需要保留文本中的前导零。','两种付款方式的字段不同。｜用不同 kind 字面量表达它们。｜在分支里格式化各自的载荷。',{
      runtime:[run('对应载荷对应描述','const {describe}=load("main.js");equal(describe({kind:"card",last4:"0123"}),"卡号尾号 0123");equal(describe({kind:"cash",received:20}),"现金 20");')],
    }),
  m(5,9,'复测：共同字段的类型','成功分支 kind:"ok"、失败分支 kind:string，是否形成同样清晰的判别联合？',['不够，失败分支的 string 也包含 ok，无法唯一排除它','一样清晰，分支顺序决定优先级','失败分支自动变成 never','string 自动排除其他字面量'],'判别值需能区分分支。过宽的 string 覆盖所有文本字面量，会产生重叠。','string 包含 ok 吗？｜两个候选都可能满足 kind===ok。｜为失败使用不同固定字面量。'),
  t(5,10,'复测：文件上传结果','导出 Upload：{ok:true;url:string} 或 {ok:false;retryable:boolean}。实现 status(result):string，成功返回 url，失败按 retryable 返回“重试”或“停止”。',
    'export type Upload={ok:boolean;url?:string;retryable?:boolean};\nexport function status(result:Upload):string{return result.url??"重试";}',
    'export type Upload={ok:true;url:string}|{ok:false;retryable:boolean};\nexport function status(result:Upload):string{return result.ok?result.url:result.retryable?"重试":"停止";}',[
      ok('上传结果可处理','import {status} from "./main";status({ok:true,url:"/a"});status({ok:false,retryable:false});'),bad('成功必须有 url','import type {Upload} from "./main";const r:Upload={ok:true};'),bad('失败必须有重试标志','import type {Upload} from "./main";const r:Upload={ok:false};'),
    ],'布尔字面量同样能作为判别字段。每条分支的必需信息在类型中明确，逻辑据此处理。','ok:true 与 ok:false 是不同候选。｜失败分支需要 retryable。｜先分成功失败，再分是否可重试。',{
      runtime:[run('上传三种业务结果','const {status}=load("main.js");equal(status({ok:true,url:"/a"}),"/a");equal(status({ok:false,retryable:true}),"重试");equal(status({ok:false,retryable:false}),"停止");')],
    }),

  m(6,1,'守卫的返回签名','value is User 的意义是什么？',['函数返回 true 时，调用方可把该值收窄为 User；实现必须真正保证它','返回值是一个 User 对象','自动调用 User 构造函数','返回 false 时会删除输入对象'],'类型谓词为控制流提供证据，实际正确性仍依赖判断逻辑。','它描述布尔结果与参数的关系。｜不是返回对象本身。｜true 路径提供类型承诺。'),
  m(6,2,'布尔函数与守卫','为什么一个普通返回 boolean 的辅助函数不一定能提供所需收窄？',['检查器必须识别它与参数类型的关系；明确谓词和可靠实现能表达该关系','boolean 函数无法返回 true','所有 boolean 函数都是守卫','只要函数名以 is 开头就能收窄'],'名称不是证据。部分现代推断可识别谓词，但复杂逻辑不能依赖名字；需要明确关系与实际测试。','检查器并不按英文名字理解业务。｜重点是返回值和参数类型的关系。｜用明确的类型谓词表达承诺。',{stage:'reason'}),
  m(6,3,'只有属性存在还不够','isUser 只检查 "name" in value，便声明 value is {name:string}，遗漏了什么？',['name 的值可能不是 string，还需检查值类型','名字必须叫 userName','所有对象都没有 name','只需检查变量名'],'属性存在与字段类型是独立条件。不完整守卫会把错误数据包装成可信数据。','{name:2} 也存在 name。｜目标却要求文本。｜补上 typeof value.name 判断。'),
  t(6,4,'修复不完整守卫','导出 User={name:string}，实现 isUser(value:unknown):value is User，拒绝 null、原始值及非文本 name。',
    'export type User={name:string};\nexport function isUser(value:unknown):value is User {return typeof value==="object"&&value!==null;}',
    'export type User={name:string};\nexport function isUser(value:unknown):value is User {return typeof value==="object"&&value!==null&&"name" in value&&typeof value.name==="string";}',[
      ok('true 分支能读取名字','import {isUser} from "./main";declare const x:unknown;if(isUser(x)){const n:string=x.name;}'),bad('守卫前不能直接读','declare const x:unknown;const n:string=x.name;',[18046]),
    ],'签名不能替代实现。逐步检查对象、属性和值类型，才有理由让 true 分支收窄为 User。','考虑空对象与 {name:2}。｜它们都能通过原有对象判断。｜增加属性存在与 string 类型检查。',{
      runtime:[run('接受合法结构','check(load("main.js").isUser({name:"Ada"}));'),run('拒绝伪用户','const {isUser}=load("main.js");for(const v of [null,3,"x",{}, {name:2}])check(!isUser(v));')],
    }),
  m(6,5,'过滤结果的类型','items:unknown[] 通过可靠的 isUser 谓词过滤后，结果为什么能成为 User[]？',['filter 的类型签名可以利用谓词提供的元素约束','filter 会自动给元素补 name','所有过滤函数都会产生 User[]','unknown 在数组里等于 User'],'谓词把每个被保留元素与 User 关系连接起来；filter 的重载可利用这一信息。','过滤回调提供类型谓词。｜保留下来的元素满足承诺。｜依然需要守卫逻辑实际正确。',{stage:'reason'}),
  t(6,6,'设计文本数组守卫','实现 isStringArray(value:unknown):value is string[]，要求为数组且每个现有元素都是字符串；空数组合法。',
    'export function isStringArray(value:unknown):value is string[] {return Array.isArray(value);}',
    'export function isStringArray(value:unknown):value is string[] {return Array.isArray(value)&&value.every(item=>typeof item==="string");}',[
      ok('守卫后得到文本数组','import {isStringArray} from "./main";declare const v:unknown;if(isStringArray(v)){const a:string[]=v;}'),bad('守卫前未知数组不可直接用','declare const v:unknown;const a:string[]=v;',[2322]),
    ],'数组身份不包含元素类型保证。every 检查每个现有元素；题面明确空数组合法，本题不处理稀疏槽位的额外业务要求。','[1] 也是数组。｜需要检查每个元素。｜组合 Array.isArray 与 every 的字符串判断。',{
      runtime:[run('验证容器和元素','const {isStringArray}=load("main.js");check(isStringArray([]));check(isStringArray(["a","b"]));for(const v of [["a",1],{},null,"a"])check(!isStringArray(v));')],
    }),
  m(6,7,'错误谓词的代价','守卫声明 value is number，实际仅检查 value !== null，会出现什么风险？',['文本和对象也可能通过，让后续数字方法在运行时失败','编译器必定阻止这种函数声明','所有值都会被转换成数字','null 会变成零'],'检查条件必须足以支持谓词。排除一种错误情况不能证明剩下都属于目标类型。','排除 null 后还剩很多类型。｜目标却只有 number。｜针对每种非法输入测试守卫。',{stage:'reason'}),
  t(6,8,'迁移：提取有效分数','实现 isScore(value:unknown):value is number（有限数字且 0..100）；实现 scores(values:unknown[]):number[]，保留满足该守卫的元素。',
    'export function isScore(value:unknown):value is number{return typeof value==="number";}\nexport function scores(values:unknown[]):number[]{return values.filter(isScore);}',
    'export function isScore(value:unknown):value is number{return typeof value==="number"&&Number.isFinite(value)&&value>=0&&value<=100;}\nexport function scores(values:unknown[]):number[]{return values.filter(isScore);}',[
      ok('输出数字数组','import {scores,isScore} from "./main";const a:number[]=scores([2,"3"]);declare const v:unknown;if(isScore(v)){const n:number=v;}'),bad('不承诺文本数组','import {scores} from "./main";const a:string[]=scores([]);'),
    ],'类型谓词描述 number 这一静态事实，分数范围由真实判断额外保证。过滤后的运行数据也必须符合范围。','数字类型仍含 NaN 和越界值。｜增加有限性与范围条件。｜让 filter 复用完整守卫。',{
      runtime:[run('筛出合法分数并保留边界','equal(load("main.js").scores([0,100,50,-1,101,"80",NaN,Infinity]),[0,100,50]);')],
    }),
  m(6,9,'复测：守卫不是类型转换','isUser(value) 为 true 后，value 是否被自动复制为一个只含 User 字段的新对象？',['不会，判断不自动复制或裁剪数据','会，额外字段全部删除','会，所有字段转成字符串','会，原对象被冻结'],'守卫建立使用证据，不改变对象形状，除非函数实现自己执行了修改；好的校验函数通常避免隐式副作用。','类型收窄不是对象重建。｜查看函数是否实际创建了对象。｜谓词签名本身不修改值。'),
  t(6,10,'复测：安全事件守卫','导出 Event={type:"click";x:number}，实现 isClick(value:unknown):value is Event，要求 type 精确等于 click，x 为有限数字。',
    'export type Event={type:"click";x:number};\nexport function isClick(value:unknown):value is Event{return true;}',
    'export type Event={type:"click";x:number};\nexport function isClick(value:unknown):value is Event{return typeof value==="object"&&value!==null&&"type" in value&&value.type==="click"&&"x" in value&&typeof value.x==="number"&&Number.isFinite(value.x);}',[
      ok('守卫提供事件字段','import {isClick} from "./main";declare const v:unknown;if(isClick(v)){const k:"click"=v.type;const x:number=v.x;}'),bad('事件类型不接受其他名字','import type {Event} from "./main";const e:Event={type:"move",x:2};'),
    ],'联合或字面量字段的守卫要验证具体值，不能只检查它是字符串。数值字段同样需要验证有限性。','始终 true 没有任何验证。｜检查对象、判别值和坐标类型。｜坐标还需 Number.isFinite。',{
      runtime:[run('验证事件形状与值','const {isClick}=load("main.js");check(isClick({type:"click",x:0}));for(const v of [null,{}, {type:"move",x:2},{type:"click",x:"2"},{type:"click",x:NaN}])check(!isClick(v));')],
    }),

  m(7,1,'穷尽检查为什么用 never','switch 已处理联合的全部成员，默认分支把值交给 never 参数，目的是什么？',['当以后新增成员未处理时，使剩余类型无法赋给 never','在运行时删除所有默认分支','让所有返回值都变成 never','提高 switch 执行速度'],'检查器证明当前没有剩余成员；新成员加入后该证明失败，提醒补齐处理。','never 表示不应有剩余值。｜考虑联合增加成员后发生什么。｜默认分支是变化时的检查点。'),
  m(7,2,'默认返回会掩盖遗漏吗','处理任务状态时 default: return "未知"，相比 never 检查有什么取舍？',['可能让新增状态静默走默认值，失去必须补处理的提醒','一定无法编译','会自动处理所有新增业务语义','默认分支在 TS 中不执行'],'回退可能是有意设计，但若要求每种状态明确处理，应使用穷尽检查发现遗漏。','思考新增 paused 状态。｜它会直接走默认文本。｜是否需要编译器提醒取决于业务目标。',{stage:'reason'}),
  m(7,3,'枚举外部未知值','类型中已穷尽的 switch 是否证明远端传来的任意 JSON 都不会进入 default？',['不证明，运行数据可能违反声明，仍需要入口校验','证明，TS 会拦截网络数据','证明，never 会转换错误状态','只要启用 strict 就证明'],'穷尽检查建立在输入类型成立的前提上。实际不可信输入仍要先验证，运行默认分支也可抛错作为防线。','输入声明是否经过真实校验？｜编译证明有前提。｜运行环境可能给出契约之外的值。'),
  t(7,4,'补上缺失的状态处理','导出 State="idle"|"running"|"done"，实现 text(state):string，分别返回“等待”“进行中”“完成”，并保留 never 检查。',
    'export type State="idle"|"running"|"done";\nfunction unreachable(value:never):never{throw new Error("未处理状态");}\nexport function text(state:State):string{switch(state){case "idle":return "等待";case "running":return "进行中";default:return unreachable(state);}}',
    'export type State="idle"|"running"|"done";\nfunction unreachable(value:never):never{throw new Error("未处理状态");}\nexport function text(state:State):string{switch(state){case "idle":return "等待";case "running":return "进行中";case "done":return "完成";default:return unreachable(state);}}',[
      ok('全部状态可调用','import {text} from "./main";const s:string=text("done");text("idle");text("running");'),bad('未知状态不允许','import {text} from "./main";text("paused");'),
    ],'未处理的 done 仍能到达 default，因此不能传给 never。补充分支后才没有剩余候选。','看传入 unreachable 的剩余类型。｜联合声明列出三个状态。｜增加 done 分支并返回完成。',{
      runtime:[run('覆盖三种状态','const {text}=load("main.js");equal(text("idle"),"等待");equal(text("running"),"进行中");equal(text("done"),"完成");')],
    }),
  m(7,5,'收窄后的剩余类型','State="a"|"b"|"c"，前两个 if 分别处理 a 与 b 并返回，最后剩余是什么？',['"c"，还不能当作 never','never，因为写了两个 if','string，丢失所有信息','any'],'每个退出分支移除已处理成员，未处理的 c 仍然可能到达后面。','按执行路径逐个排除候选。｜a 与 b 已退出。｜c 还没有被处理。',{stage:'reason'}),
  t(7,6,'设计不可能分支助手','实现 assertNever(value:never):never，抛出 Error("未覆盖分支")；用于有穷尽要求的分支结尾。',
    'export function assertNever(value:unknown):void {}',
    'export function assertNever(value:never):never {throw new Error("未覆盖分支");}',[
      ok('只接受已被证明不可能的值','import {assertNever} from "./main";declare const n:never;const x:never=assertNever(n);'),bad('普通候选不能冒充不可能','import {assertNever} from "./main";assertNever("pending");'),
    ],'参数 never 强制调用者证明没有剩余值，返回 never 表示异常路径不会正常继续。unknown 参数会失去静态穷尽约束。','参数太宽就发现不了遗漏。｜函数不应正常返回。｜参数与返回均为 never，运行时抛错。',{
      runtime:[run('契约外运行调用会抛错','let error;try{load("main.js").assertNever("unexpected");}catch(e){error=e;}check(error instanceof Error);equal(error.message,"未覆盖分支");')],
    }),
  m(7,7,'给穷尽检查加断言','为了让 assertNever(state) 通过而写成 assertNever(state as never)，会发生什么？',['绕过了检查器对剩余成员的证明，可能掩盖未处理分支','会自动增加缺失分支','能更严格地检测所有状态','运行时会把 state 删除'],'强制断言为 never 取消了这项检查原本要求的证据。应修复未处理成员或重新审视契约。','断言会替代检查器实际推断。｜错误可能正是在提醒遗漏。｜不要消除提醒而不补业务处理。',{stage:'reason'}),
  t(7,8,'迁移：处理支付动作','导出 Action={type:"pay";amount:number}|{type:"refund";amount:number}|{type:"cancel"}；实现 delta(action):number，支付返回负 amount，退款返回正 amount，取消为0。',
    'export type Action={type:"pay";amount:number}|{type:"refund";amount:number}|{type:"cancel"};\nexport function delta(action:Action):number {if(action.type==="pay")return -action.amount;return 0;}',
    'export type Action={type:"pay";amount:number}|{type:"refund";amount:number}|{type:"cancel"};\nexport function delta(action:Action):number {switch(action.type){case "pay":return -action.amount;case "refund":return action.amount;case "cancel":return 0;default:{const neverAction:never=action;throw new Error(String(neverAction));}}}',[
      ok('完整动作集合','import {delta} from "./main";const n:number=delta({type:"refund",amount:2});delta({type:"cancel"});'),bad('退款不能缺金额','import type {Action} from "./main";const a:Action={type:"refund"};'),bad('拒绝未定义动作','import {delta} from "./main";delta({type:"charge"});'),
    ],'默认零会掩盖退款动作被忽略。每个业务分支明确实现，never 分支用于提醒后续扩展遗漏。','先列出每种动作的金额方向。｜refund 与 cancel 结果不同。｜用 switch 逐个处理并在末尾检查剩余值。',{
      runtime:[run('每种动作都有结果','const {delta}=load("main.js");equal(delta({type:"pay",amount:5}),-5);equal(delta({type:"refund",amount:5}),5);equal(delta({type:"cancel"}),0);')],
    }),
  m(7,9,'复测：新增暂停状态','状态联合加入 paused 后，带 never 检查的旧处理函数报错。最有意义的修复是什么？',['为 paused 设计并实现正确的处理分支，再检查其他消费者','删除 paused 类型但继续发送它','把 never 改为 any','把报错注释掉'],'报错提供了变化影响的位置。新增状态的语义应落实到所有相关处理逻辑。','这是模型变化带来的提醒。｜先确定 paused 如何展示或计算。｜补充业务分支后再验证所有状态。'),
  t(7,10,'复测：四种下载状态','导出 Download="queued"|"active"|"paused"|"done"；实现 label(state)，分别返回“排队”“下载中”“已暂停”“已完成”。',
    'export type Download="queued"|"active"|"paused"|"done";\nexport function label(state:Download):string{switch(state){case "queued":return "排队";case "active":return "下载中";case "done":return "已完成";default:{const rest:never=state;throw new Error(String(rest));}}}',
    'export type Download="queued"|"active"|"paused"|"done";\nexport function label(state:Download):string{switch(state){case "queued":return "排队";case "active":return "下载中";case "paused":return "已暂停";case "done":return "已完成";default:{const rest:never=state;throw new Error(String(rest));}}}',[
      ok('新增状态可处理','import {label} from "./main";const s:string=label("paused");'),bad('其他状态被拒绝','import {label} from "./main";label("failed");'),
    ],'paused 是明确的新候选，不能继续让它到达 never。补全后其余分支仍应保持原行为。','找出联合有但 switch 没有的成员。｜新增的是 paused。｜为它返回已暂停并保留穷尽检查。',{
      runtime:[run('覆盖全部下载状态','const {label}=load("main.js");equal(["queued","active","paused","done"].map(label),["排队","下载中","已暂停","已完成"]);')],
    }),
];
