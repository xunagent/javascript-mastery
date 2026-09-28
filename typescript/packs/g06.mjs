import { mc, task, ok, bad, run } from './author.mjs';
const id=n=>`t06-l${String(n).padStart(2,'0')}`;
const m=(l,n,title,prompt,options,explanation,hints,extra={})=>mc(id(l),n,title,prompt,options,explanation,hints.split('｜'),extra);
const t=(l,n,title,prompt,files,solution,tests,explanation,hints,extra={})=>task(id(l),n,title,prompt,files,solution,tests,explanation,hints.split('｜'),extra);
export const questions=[
 m(1,1,'泛型连接什么','function wrap<T>(value:T):{value:T} 的主要价值是什么？',['结果中的 value 与本次输入类型保持关联','使所有输入都转成对象字符串','让函数体能直接访问任意属性','为每一种 T 生成一个独立运行函数'],'同一个 T 连接参数和结果，调用方保留具体信息。它不授权任意操作，也不会自动执行转换。','观察 T 同时出现在哪里。｜输入决定了结果字段的类型。｜关联是静态信息，不是运行转换。'),
 m(1,2,'unknown 的安全与信息损失','wrap(value:unknown):{value:unknown} 也安全，为什么泛型版本更适合原样包装？',['泛型能在不放弃检查的情况下保留调用方类型，unknown 返回需要重新收窄','unknown 不能作为属性类型','unknown 在运行时丢弃数据','泛型可以忽略任何报错'],'unknown 适合未知边界，但已知输入原样传出时可以保留它与输出的关系。泛型不等于 any，它仍检查不合法使用。','输入类型本来已经明确。｜返回 unknown 会抹去这部分静态信息。｜T 可以把信息传到结果。'),
 m(1,3,'T 在函数体内有多少能力','function echo<T>(value:T) 内直接调用 value.trim() 为什么不行？',['T 没有保证是字符串，调用方可以选择其他类型','泛型函数不能调用任何方法','trim 只支持字面量','类型参数必须先转成 any 才能使用'],'无约束 T 代表调用方可能选择的各种类型。实现只能执行对允许范围都成立的操作，专属能力需要约束或运行检查。','考虑调用 echo(1)。｜数字没有 trim。｜函数体必须对所有允许的 T 成立。'),
 t(1,4,'修复包装时丢失的信息','实现 box<T>(value:T):{value:T}，创建一个新对象包装输入，不复制或转换输入值。对象字段类型应与输入一致。',
  'export function box(value:unknown):{value:unknown}{return {value};}',
  'export function box<T>(value:T):{value:T}{return {value};}',[
   ok('保留不同载荷的结构','import {box} from "./main";const a:number=box(2).value;const b:string=box("x").value;const c:number=box({count:1}).value.count;'),
   bad('不能把数值载荷当成文本','import {box} from "./main";const s:string=box(2).value;'),
   bad('不存在的载荷属性不能访问','import {box} from "./main";box({count:1}).value.missing;'),
  ],'泛型将输入类型传递到容器字段，同时实现只做包装。外层容器是新的，内部对象仍是原引用。','参数和返回字段需要同一个类型占位符。｜在函数上声明 <T>。｜返回对象字面量 {value}。',{
   runtime:[run('新容器与原载荷','const {box}=load("main.js");const value={count:1};const a=box(value);check(a!==value);check(a.value===value);check(box(value)!==a);equal(box(null),{value:null});')],
  }),
 m(1,5,'泛型首项为什么还可能缺失','first<T>(items:readonly T[]):T|undefined 中为什么不能因为有 T 就删掉 undefined？',['数组仍可能为空，泛型只保留元素类型，不保证长度','所有 T 都包含 undefined','泛型数组只能存一个元素','undefined 是泛型语法必需部分'],'类型参数描述元素关系，非空性是另一项约束。若输入只是普通数组，就必须如实保留空数组产生的缺失。','T 解决类型关系，不解决数组长度。｜空数组也是合法输入。｜返回契约要反映这个运行路径。',{stage:'reason'}),
 t(1,6,'设计通用的最后一项读取','实现 last<T>(items:readonly T[]):T|undefined，空数组返回 undefined，否则返回最后一项；输入只读，结果保留元素类型。',
  'export function last(items:readonly unknown[]):unknown{return items[items.length-1];}',
  'export function last<T>(items:readonly T[]):T|undefined{return items[items.length-1];}',[
   ok('保留元素类型与缺失','import {last} from "./main";const a:number|undefined=last([1,2]);const values:readonly {id:string}[]=[{id:"a"}];const b:{id:string}|undefined=last(values);'),
   bad('不能假设一定存在','import {last} from "./main";const a:number=last([1]);'),
   bad('不能把数字元素当文本','import {last} from "./main";const a:string|undefined=last([1]);'),
  ],'T 将数组元素连接到结果，undefined 表达空集合。两者承担不同职责，不能为了精确类型抹去实际边界。','让输入数组元素为 T。｜结果必须允许空数组。｜索引使用 length-1。',{
   runtime:[run('最后位置与空集合','const {last}=load("main.js");equal(last([]),undefined);equal(last([0,2,5]),5);const object={id:"a"};check(last(Object.freeze([object]))===object);')],
  }),
 m(1,7,'显式类型参数会转换值吗','box<number>("3") 应怎样理解？',['应报错，显式 number 要求实参兼容 number，不会转换文本','会自动返回 {value:3}','会在运行时调用 Number','总能通过，因为调用者决定 T'],'显式类型参数是对检查关系的选择，不是转换指令。传入值仍需满足选择的类型。','类型参数最终是否保留在 JavaScript 中？｜它不会执行 Number。｜文本不满足 number 参数。',{stage:'reason'}),
 t(1,8,'迁移：保留类型的复制与反转','实现 reversed<T>(items:readonly T[]):T[]，返回反向排列的新数组，不改变输入；元素对象引用保持不变。',
  'export function reversed<T>(items:readonly T[]):T[]{return [...items];}',
  'export function reversed<T>(items:readonly T[]):T[]{return [...items].reverse();}',[
   ok('只读输入和具体结果','import {reversed} from "./main";const source:readonly {id:string}[]=[{id:"a"}];const result:{id:string}[]=reversed(source);const numbers:number[]=reversed([1,2]);'),
   bad('结果元素不能任意变型','import {reversed} from "./main";const result:string[]=reversed([1,2]);'),
   bad('显式类型约束仍检查实参','import {reversed} from "./main";reversed<number>(["1"]);'),
  ],'泛型不要求理解元素内部结构，因此可以安全地操作容器顺序。先复制容器再反转，保留元素引用并满足只读输入契约。','修改顺序不需要查看 T 的属性。｜reverse 会修改被调用数组。｜先展开复制，再调用 reverse。',{
   runtime:[run('容器复制而元素保持','const {reversed}=load("main.js");const a={id:"a"},b={id:"b"};const source=Object.freeze([a,b]);const result=reversed(source);check(result!==source);check(result[0]===b);check(result[1]===a);equal(source,[a,b]);equal(reversed([]),[]);')],
  }),
 m(1,9,'复测：每次调用的 T','同一泛型函数先 box(1)，再 box("a")，第二次调用必须继续使用第一次的 number 吗？',['不必，泛型函数每次调用可以独立推断类型参数','必须，第一次调用永久固定 T','必须，除非重新声明函数','只在异步函数里才能独立推断'],'函数级类型参数属于一次调用。将类型参数放到容器或接口层级则可能在实例使用时固定，这是后续小节要区分的位置。','T 是在哪一层声明的？｜这里属于函数调用。｜不同调用有各自的推断结果。'),
 t(1,10,'复测：保留输入的分组关系','实现 partition<T>(items:readonly T[],accept:(item:T)=>boolean):[T[],T[]]，第一组保存通过的元素，第二组保存未通过的元素，各组保持原顺序，不复制元素对象；每项只判断一次。',
  'export function partition<T>(items:readonly T[],accept:(item:T)=>boolean):[T[],T[]]{return [[...items],[]];}',
  'export function partition<T>(items:readonly T[],accept:(item:T)=>boolean):[T[],T[]]{const yes:T[]=[];const no:T[]=[];for(const item of items){(accept(item)?yes:no).push(item);}return [yes,no];}',[
   ok('回调与两组结果共享元素类型','import {partition} from "./main";const [yes,no]=partition([{id:1}],item=>item.id>0);const a:{id:number}[]=yes;const b:{id:number}[]=no;'),
   bad('回调不能假定另一种元素','import {partition} from "./main";partition([1,2],(item:string)=>item.length>0);'),
   bad('结果不能丢失元素类型','import {partition} from "./main";const pair:[string[],string[]]=partition([1],item=>true);'),
  ],'同一个 T 连接输入元素、判断回调和两个输出数组。类型契约还不足以保证分组顺序和调用次数，运行测试补足这些要求。','为两个结果数组都声明 T[]。｜逐个判断后只加入对应一组。｜不要用两次 filter 导致每项判断两次。',{
   runtime:[run('分组、顺序与引用','const {partition}=load("main.js");const a={id:1},b={id:2},c={id:3};let calls=0;const [yes,no]=partition(Object.freeze([a,b,c]),item=>{calls++;return item.id%2===1;});equal(calls,3);check(yes[0]===a&&yes[1]===c&&no[0]===b);equal(partition([],()=>true),[[],[]]);')],
  }),
 m(2,1,'泛型放置位置','interface Identity {<T>(value:T):T} 与 interface Handler<T>{(value:T):T} 的区别是什么？',['前者每次调用选择 T，后者使用 Handler<T> 时先固定 T','二者都只能处理第一次调用的类型','前者只能用于类，后者只能用于对象','T 放哪都没有区别'],'调用签名上的类型参数属于调用；接口自身的类型参数在选择接口实例类型时固定，影响该接口所有成员。','观察 <T> 写在接口名后还是调用签名前。｜声明层级决定选择时机。｜Handler<number> 已经固定参数和结果。'),
 m(2,2,'容器接口的共享类型','interface Box<T>{get():T;set(value:T):void} 中两处 T 表示什么？',['同一个 Box 实例类型的读写值保持一致','get 与 set 每次可以分别选择完全无关的类型','T 自动变成所有调用的联合','set 的类型只由 get 的第一次运行结果决定'],'把 T 放到接口层级可让多个成员共享一个类型选择。Box<number> 的读写都受 number 约束。','接口只有一个 T 参数。｜所有成员引用同一个选择。｜不能给数字盒子写入字符串。'),
 m(2,3,'泛型调用签名的实现责任','const identity: <T>(value:T)=>T = (value:number)=>value 为什么不成立？',['目标要求处理任意 T，而实现只处理 number','泛型函数不能存入变量','返回值为 number 会被擦除','参数变量名字必须叫 T'],'一个泛型调用签名承诺每次调用可选择不同类型，只有数字能力的函数不能满足这个更广泛的承诺。','调用者可能传字符串。｜实现的 number 参数无法接受它。｜实现需真正保持任意输入类型。'),
 t(2,4,'修复固定类型处理器','导出 Handler<T>，表示 (value:T)=>T；导出 increment:Handler<number>，返回输入加一。不能把 Handler 写成每次调用都可任意选择类型的接口。',
  'export interface Handler<T>{<U>(value:U):U}\nexport const increment:Handler<number>=(value:number)=>value+1;',
  'export interface Handler<T>{(value:T):T}\nexport const increment:Handler<number>=(value:number)=>value+1;',[
   ok('接口使用时固定类型','import {Handler,increment} from "./main";const n:number=increment(1);const trim:Handler<string>=value=>value.trim();'),
   bad('数字处理器不接收文本','import {increment} from "./main";increment("1");'),
   bad('返回类型与接口参数一致','import {Handler} from "./main";const wrong:Handler<number>=(value:number)=>String(value);'),
  ],'Handler<number> 应固定为数字变换，而不是对任何 U 都有效的泛型函数。直接在调用签名中使用接口的 T。','接口 T 被声明后是否真的用到了？｜多写的 <U> 创建了另一层承诺。｜让参数与返回都引用外层 T。',{
   runtime:[run('数字处理器行为','const {increment}=load("main.js");equal(increment(0),1);equal(increment(-2),-1);')],
  }),
 m(2,5,'不同容器实例是否共享 T','一个文件里同时声明 Box<number> 和 Box<string>，它们的 T 会互相影响吗？',['不会，每次类型应用选择自己的参数','会，后声明的覆盖前声明的','会，T 最终变成 any','只有接口名不同才独立'],'泛型类型像参数化的结构模板，应用不同参数会得到不同的具体类型。它不是运行时全局可变变量。','T 是类型参数，不是共享存储。｜Box<number> 与 Box<string> 是不同的类型应用。｜声明顺序不改变参数。',{stage:'reason'}),
 t(2,6,'设计读写一致的单元','导出 Cell<T>={get:()=>T;set:(value:T)=>void}；实现 createCell<T>(initial:T):Cell<T>，get 读取最新值，set 替换值。每个单元独立，不复制值。',
  'export interface Cell<T>{get():T;set(value:T):void}\nexport function createCell<T>(initial:T):Cell<T>{return {get:()=>initial,set(value){}};}',
  'export interface Cell<T>{get:()=>T;set:(value:T)=>void}\nexport function createCell<T>(initial:T):Cell<T>{let current=initial;return {get:()=>current,set:value=>{current=value;}};}',[
   ok('读写同一种类型','import {createCell,Cell} from "./main";const cell:Cell<number>=createCell(1);cell.set(2);const n:number=cell.get();const text=createCell("a");text.set("b");'),
   bad('不能写入异类值','import {createCell} from "./main";createCell(1).set("2");'),
   bad('读取不能冒充文本','import {createCell} from "./main";const s:string=createCell(1).get();'),
  ],'接口层 T 将所有读写操作固定到同一种值类型，工厂函数则为每个创建动作推断 T。闭包保存各自当前值，实现运行时独立性。','需要一个可更新的闭包变量。｜set 更新它，get 返回它。｜每次调用 createCell 都建立自己的变量。',{
   runtime:[run('读写更新与实例独立','const {createCell}=load("main.js");const a=createCell(1),b=createCell(10);a.set(3);equal(a.get(),3);equal(b.get(),10);const value={id:"a"};const c=createCell(value);check(c.get()===value);const next={id:"b"};c.set(next);check(c.get()===next);')],
  }),
 m(2,7,'接口参数传递给其他泛型','interface Page<T>{items:T[];total:number}，Page<User> 中 items 的类型是什么？',['User[]','T[] 且调用者无法知道 T','unknown[]','Page<User>[]'],'泛型应用会将 T 代入成员的类型表达式，包括其他容器中的位置。它不自动递归创建 Page 或转换运行时数据。','T 出现在数组元素位置。｜当前选择是 User。｜因此数组元素为 User。',{stage:'reason'}),
 t(2,8,'迁移：分页容器保持数据类型','导出 Page<T>={items:T[];total:number}；实现 page<T>(items:readonly T[],total:number):Page<T>，items 复制为新数组，total 原样保存，元素引用保留。',
  'export interface Page<T>{items:T[];total:number}\nexport function page<T>(items:readonly T[],total:number):Page<T>{return {items:[],total:items.length};}',
  'export interface Page<T>{items:T[];total:number}\nexport function page<T>(items:readonly T[],total:number):Page<T>{return {items:[...items],total};}',[
   ok('具体页面保留模型字段','import {Page,page} from "./main";const p:Page<{id:string}>=page([{id:"a"}],20);const id:string=p.items[0].id;const nums:Page<number>=page([1,2],10);'),
   bad('页面不能把模型替换为另一类','import {Page,page} from "./main";const p:Page<string>=page([1],10);'),
   bad('总数必须是数字','import {page} from "./main";page([1],"10");'),
  ],'Page<T> 保留项目元素类型，total 是独立的业务总数，不能误用当前页长度替代。复制数组容器可以避免共享可变数组。','类型和实现分别检查。｜总数来自参数，不是 items.length。｜用展开复制当前页数组。',{
   runtime:[run('页面长度与总数不混淆','const {page}=load("main.js");const item={id:"a"};const source=Object.freeze([item]);const p=page(source,20);equal(p.total,20);check(p.items!==source);check(p.items[0]===item);equal(page([],0),{items:[],total:0});')],
  }),
 m(2,9,'复测：应该在哪层选择类型','一个转换器对象固定处理 User，而它的 run 方法可能被调用很多次。若希望每次都保持 User，T 通常应放在哪里？',['放在 Converter<T> 的接口层，run 使用这个 T','每次 run 都重新声明不受约束的 U','所有成员都使用 any','只把 T 写在注释里'],'对象级契约固定处理一种数据时，让接口或类层级持有类型参数更直接。方法级泛型则表示每次调用可选择新的类型。','对象是固定一种类型还是通用调用器？｜这里要求同一转换器一直处理 User。｜接口层固定 T。'),
 t(2,10,'复测：真正的通用调用接口','导出 Identity 接口，其调用签名为 <T>(value:T)=>T；导出 identity:Identity，允许同一个变量分别处理数字、字符串和对象并原样返回。不能把接口固定为某一种数据类型。',
  'export interface Identity{(value:unknown):unknown}\nexport const identity:Identity=value=>value;',
  'export interface Identity{<T>(value:T):T}\nexport const identity:Identity=value=>value;',[
   ok('一个变量多次保留不同类型','import {identity,Identity} from "./main";const n:number=identity(1);const s:string=identity("a");const id:string=identity({id:"x"}).id;const f:Identity=identity;'),
   bad('数值结果不是文本','import {identity} from "./main";const s:string=identity(1);'),
   bad('只会处理数字的函数不能冒充通用函数','import {Identity} from "./main";const f:Identity=(value:number)=>value;'),
  ],'本题接口描述一个每次调用都能选择 T 的函数，因此类型参数位于调用签名。上下文推断让实现仍保持泛型，无需 any 或断言。','不是 Identity<number> 这种固定类型容器。｜<T> 写在调用签名之前。｜实现直接原样返回参数。',{
   runtime:[run('不同输入原样返回','const {identity}=load("main.js");equal(identity(1),1);equal(identity("a"),"a");const value={id:"x"};check(identity(value)===value);')],
  }),
 m(3,1,'extends 是最小能力要求','T extends {length:number} 对 T 的要求是什么？',['至少有 number 类型的 length，仍可有其他字段','只能有 length 一个字段','必须继承名为 length 的类','运行时自动补 length:0'],'约束描述允许的类型范围，保留实际 T 的其他信息。它不是精确对象限制，也不会生成属性。','约束是输入必须提供的能力。｜额外结构仍属于具体 T。｜类型不会构造运行数据。'),
 m(3,2,'约束不授权任意构造','function reset<T extends {id:string}>():T{return {id:"new"}} 为什么不安全？',['调用者的 T 可能还有其他必需字段，基础对象不一定满足它','id 不能是字符串字面量','泛型函数不允许返回对象','extends 要求返回 null'],'T 可以比约束更具体。满足 {id:string} 只满足下限，不足以证明满足调用者选择的全部 T。','设想 T 是 {id:string;name:string}。｜返回对象缺少 name。｜约束不能替代具体类型的全部要求。'),
 m(3,3,'约束越具体越好吗','函数只读取 length，却把 T 约束成 string[]，会有什么代价？',['不必要地拒绝字符串、只读数组或其他具有 length 的对象','使运行时读取更快','自动获得深只读能力','保证所有对象长度都正确'],'约束应反映真正依赖的能力。过窄的约束限制复用，并不能单靠类型提升运行性能或验证业务长度。','实现是否需要 push 或字符串元素？｜如果只读 length，就不需要整个可变数组能力。｜最小约束提高可用范围。'),
 t(3,4,'修复读取长度的无约束泛型','实现 lengthOf<T extends {length:number}>(value:T):number，只读取 length。允许字符串、只读数组和自定义带 length 对象，拒绝不含 length 的数字。',
  'export function lengthOf<T>(value:T):number{return value.length;}',
  'export function lengthOf<T extends {length:number}>(value:T):number{return value.length;}',[
   ok('只要求最小长度能力','import {lengthOf} from "./main";const values:readonly number[]=[1];const n:number=lengthOf(values);lengthOf("abc");lengthOf({length:7,tag:"custom"});'),
   bad('数字不提供 length','import {lengthOf} from "./main";lengthOf(3);'),
   bad('length 必须为数值','import {lengthOf} from "./main";lengthOf({length:"3"});'),
  ],'给 T 增加最小约束后，实现能安全读取 length。这里的泛型还允许直接传入拥有额外字段的对象字面量。','错误来自 T 没有声明读取能力。｜只补充 length:number 约束。｜不必限制为某种具体数组。',{
   runtime:[run('读取不同结构的长度','const {lengthOf}=load("main.js");equal(lengthOf("abc"),3);equal(lengthOf(Object.freeze([1,2])),2);equal(lengthOf({length:7,tag:"custom"}),7);')],
  }),
 m(3,5,'返回约束类型会丢什么','function keep<T extends {id:string}>(value:T):{id:string}{return value} 与返回 T 相比，调用方丢失什么？',['静态结果不再保留输入的其他字段，即使运行对象仍有它们','运行时所有额外字段被删除','id 被转换成 unknown','函数不能接受子类型'],'约束类型只是公共下限，写成返回类型会舍弃更具体的静态结构。若函数原样返回输入，应返回 T 来保持关联。','返回标注决定调用方可见信息。｜基础结构只有 id。｜T 才代表本次完整输入类型。',{stage:'reason'}),
 t(3,6,'设计保留完整对象的检查函数','实现 requireId<T extends {id:string}>(value:T):T。id 去两端空白后为空时抛 Error("empty id")，否则原样返回 value；不修剪或修改原字段。',
  'export function requireId<T extends {id:string}>(value:T):{id:string}{return {id:value.id.trim()};}',
  'export function requireId<T extends {id:string}>(value:T):T{if(value.id.trim()==="")throw new Error("empty id");return value;}',[
   ok('检查后仍保留额外字段','import {requireId} from "./main";const user=requireId({id:"a",name:"Lin",age:2});const name:string=user.name;const age:number=user.age;'),
   bad('ID 必须存在','import {requireId} from "./main";requireId({name:"Lin"});'),
   bad('ID 必须为字符串','import {requireId} from "./main";requireId({id:1});'),
  ],'约束授权读取 id，返回 T 保留其他信息。验证与标准化是不同操作，本题只验证并原样返回，不应悄悄修改数据。','返回类型不要退回基础约束。｜检查 trim 后是否为空。｜通过后返回原引用 value。',{
   runtime:[run('验证失败与保持原对象','const {requireId}=load("main.js");const value=Object.freeze({id:" a ",name:"Lin"});check(requireId(value)===value);equal(value.id," a ");for(const id of ["","  "]){let failed=false;try{requireId({id});}catch(error){failed=true;equal(error.message,"empty id");}check(failed);}')],
  }),
 m(3,7,'泛型约束会验证网络响应吗','声明 T extends {id:string} 后，把外部 JSON 直接断言为 T，是否已经验证 id 存在且是字符串？',['没有，泛型约束与断言不执行运行检查','已经验证，因为 extends 会检查 JSON','仅生产构建会验证','只有网络请求成功时自动验证'],'约束帮助检查编译期已知类型，不能证明未校验外部数据的实际形状。边界应使用 unknown 并执行校验或解析。','数据在编译之后才到达。｜类型参数在运行时被擦除。｜真实字段检查仍需代码。',{stage:'reason'}),
 t(3,8,'迁移：选择得分更高的原对象','实现 better<T extends {score:number}>(a:T,b:T):T，返回 score 更高的原对象，分数相同返回 a。输入保证 score 为有限数值。保留 T 的其他字段，不创建替代对象。',
  'export function better<T extends {score:number}>(a:T,b:T):{score:number}{return {score:Math.max(a.score,b.score)};}',
  'export function better<T extends {score:number}>(a:T,b:T):T{return a.score>=b.score?a:b;}',[
   ok('获胜对象保留模型','import {better} from "./main";const winner=better({score:1,name:"a"},{score:2,name:"b"});const name:string=winner.name;const score:number=winner.score;'),
   bad('分数字段必须存在','import {better} from "./main";better({name:"a"},{name:"b"});'),
   bad('分数不能是文本','import {better} from "./main";better({score:"1"},{score:"2"});'),
  ],'只需比较约束提供的字段，然后返回已有 T，就能保留完整结构。自行构造只有 score 的对象无法满足可能更具体的 T。','不要重新拼一个基础对象。｜比较后从 a、b 里选择原值。｜相等时用 >= 保留 a。',{
   runtime:[run('胜者引用和相同分数规则','const {better}=load("main.js");const a={score:1,name:"a"},b={score:2,name:"b"};check(better(a,b)===b);check(better(b,a)===b);const c={score:1,name:"c"};check(better(a,c)===a);')],
  }),
 m(3,9,'复测：访问可选能力','T extends {name?:string} 是否允许函数体无条件执行 value.name.trim()？',['不允许，约束保留了 name 可能缺失的事实','允许，因为 extends 自动让属性必需','允许，所有 T 都会补空字符串','不允许，因为泛型不能有可选字段'],'约束中的可选性同样生效。要无条件使用文本方法，需要必需字符串约束或在实现中处理缺失。','问号仍允许属性不存在。｜读取结果包含 undefined。｜先回退或判断，再调用 trim。'),
 t(3,10,'复测：按最小能力生成展示文本','实现 display<T extends {name?:string;id:string}>(value:T):string，name 去空白后非空则返回修剪后的名称，否则返回 id。接受额外属性，不修改输入。',
  'export function display<T extends {name?:string;id:string}>(value:T):string{return value.name.trim()||value.id;}',
  'export function display<T extends {name?:string;id:string}>(value:T):string{const name=value.name?.trim();return name?name:value.id;}',[
   ok('有无名称都合法','import {display} from "./main";const a:string=display({id:"u1"});display({id:"u2",name:" Lin ",role:"admin"});'),
   bad('标识必需','import {display} from "./main";display({name:"Lin"});'),
   bad('可选字段存在时仍需正确类型','import {display} from "./main";display({id:"u1",name:3});'),
  ],'约束授权读取字段但不移除可选性。先处理可能缺失的 name，再根据业务选择名称或标识。这里空白名称也要回退，与单纯 ?? 规则不同。','先保护可选名称。｜修剪后为空也属于需要回退的情况。｜保留输入，仅返回展示文本。',{
   runtime:[run('可选和空白名称都回退','const {display}=load("main.js");equal(display({id:"u1"}),"u1");equal(display({id:"u2",name:"  "}),"u2");const user=Object.freeze({id:"u3",name:" Lin ",role:"admin"});equal(display(user),"Lin");equal(user.name," Lin ");')],
  }),
 m(4,1,'变换前后未必同类型','把 User[] 变成 string[] 的函数 map，为什么通常需要输入 T 与输出 U 两个类型参数？',['输入元素和回调结果扮演不同角色，不能强制同类型','泛型函数规定至少两个类型参数','U 总会自动变成 string','两个参数会让遍历运行更快'],'两个参数描述不同的信息来源：数组提供 T，回调返回 U，结果数组保存 U。它们建立关系而不是增加运行时性能。','先看转换前后的元素是否相同。｜用户名提取会把对象变成文本。｜T 和 U 各自负责一个角色。'),
 m(4,2,'类型参数需要有用途','function map<T,U,V>(items:T[],fn:(value:T)=>U):U[] 中 V 没有出现于其他位置，通常应怎样处理？',['删除无意义的 V，避免制造额外调用负担','把 V 改成 any','增加一个运行参数以凑齐数量','保留，因为越多泛型越安全'],'类型参数应参与可解释的关系。没有出现在输入、输出或约束中的 V 没有提供这里所需的信息。','查找 V 的使用位置。｜它没有连接任何数据。｜删除不会损失当前契约。'),
 m(4,3,'共同元素类型与位置类型','返回 (A|B)[] 与返回 [A,B] 的区别是什么？',['前者丢失每个位置对应哪类值的信息，后者保留位置关系','前者总有两个元素','后者不允许 A 与 B 不同','二者运行时使用不同容器'],'联合元素数组描述每项候选，元组描述指定位置。若结果确实是一对关联值，元组提供更准确的调用信息。','调用者读取索引零时知道什么？｜联合数组仍可能是 A 或 B。｜元组首项明确为 A。'),
 t(4,4,'修复输入输出被绑成同类','实现 mapValues<T,U>(items:readonly T[],convert:(value:T,index:number)=>U):U[]，逐项转换并保留顺序，每项只调用一次。',
  'export function mapValues<T>(items:readonly T[],convert:(value:T,index:number)=>T):T[]{return items.map(convert);}',
  'export function mapValues<T,U>(items:readonly T[],convert:(value:T,index:number)=>U):U[]{return items.map((value,index)=>convert(value,index));}',[
   ok('对象变为文本或数字','import {mapValues} from "./main";const names:string[]=mapValues([{name:"Lin"}],item=>item.name);const values:number[]=mapValues(["ab"],(value,index)=>value.length+index);'),
   bad('输出由回调决定不能冒充','import {mapValues} from "./main";const values:number[]=mapValues([1],value=>String(value));'),
   bad('回调输入必须兼容元素','import {mapValues} from "./main";mapValues([1],(value:string)=>value);'),
  ],'T 描述来源，U 描述回调产物。把二者都写成 T 会错误地要求变换前后相同，失去最常见的映射能力。','输入和输出是两个独立角色。｜新增 U 用于回调返回与结果元素。｜实现按原顺序收集结果。',{
   runtime:[run('关系和顺序同时成立','const {mapValues}=load("main.js");const seen=[];equal(mapValues(Object.freeze([2,4]),(value,index)=>{seen.push([value,index]);return index+":"+value;}),["0:2","1:4"]);equal(seen,[[2,0],[4,1]]);equal(mapValues([],()=>1),[]);')],
  }),
 m(4,5,'组合函数的中间关系','compose<A,B,C>(first:(a:A)=>B,second:(b:B)=>C) 中 B 起什么作用？',['连接第一步输出与第二步输入，防止管道断开','只用来给函数排序','自动把任何输出转成第二步所需类型','要求 A、B、C 都是同一种类型'],'中间类型参数是两步之间的契约。如果前一步返回 number，后一步却只接受 Date，应该拒绝而不是隐式转换。','关注同一个 B 出现的两处。｜一个是输出，一个是输入。｜它们必须兼容。',{stage:'reason'}),
 t(4,6,'设计异类数组配对','实现 zip<A,B>(left:readonly A[],right:readonly B[]):[A,B][]，按索引配对，长度取较短的一边，保留元素引用，不修改输入。',
  'export function zip<T>(left:readonly T[],right:readonly T[]):[T,T][]{return [];}',
  'export function zip<A,B>(left:readonly A[],right:readonly B[]):[A,B][]{const result:[A,B][]=[];for(let index=0;index<Math.min(left.length,right.length);index++){result.push([left[index],right[index]]);}return result;}',[
   ok('不同来源分别保留类型','import {zip} from "./main";const pairs:[number,string][]=zip([1,2],["a"]);const objects:[{id:string},boolean][]=zip([{id:"x"}],[true]);'),
   bad('左右位置不可反转','import {zip} from "./main";const pairs:[string,number][]=zip([1],["a"]);'),
   bad('第二项不能丢失类型','import {zip} from "./main";const n:number=zip([1],["a"])[0][1];'),
  ],'独立的 A、B 保留来源差异，元组记录左右位置。循环上界由较短数组决定，防止制造包含缺失值的配对。','两个数组不必拥有相同元素类型。｜结果每项是 [A,B]。｜只遍历两侧都存在的索引。',{
   runtime:[run('截断到较短长度','const {zip}=load("main.js");equal(zip([1,2,3],["a","b"]),[[1,"a"],[2,"b"]]);equal(zip([],["a"]),[]);equal(zip([1],[]),[]);const item={id:"x"};check(zip(Object.freeze([item]),Object.freeze([true]))[0][0]===item);')],
  }),
 m(4,7,'多个参数不表示运行时类型对象','声明 <A,B> 后，能在函数体执行 new A() 或读取 B.name 来获知类型吗？',['不能，类型参数本身不是运行时值，需要显式传入构造器等能力','能，编译器为每个类型创建构造器','只有 A 可以，因为排在前面','只有显式指定类型参数时可以'],'泛型参数会被擦除。需要构造实例或读取运行元信息，应让调用方传入实际值，而不是将类型名字当变量。','类型空间和运行值空间不同。｜泛型名字不对应构造器对象。｜运行能力需要通过参数传递。',{stage:'reason'}),
 t(4,8,'迁移：连接两步变换','实现 pipe<A,B,C>(first:(value:A)=>B,second:(value:B)=>C):(value:A)=>C，返回延迟执行的组合函数；调用时先 first 再 second，各执行一次，创建时不执行。',
  'export function pipe<A,B,C>(first:(value:A)=>B,second:(value:B)=>C):(value:A)=>C{return value=>second(first(first(value)));}',
  'export function pipe<A,B,C>(first:(value:A)=>B,second:(value:B)=>C):(value:A)=>C{return value=>second(first(value));}',[
   ok('中间类型连接两端','import {pipe} from "./main";const f=pipe((value:string)=>value.length,(length:number)=>length>2);const result:boolean=f("abc");'),
   bad('中间类型不匹配','import {pipe} from "./main";pipe((value:string)=>value.length,(value:Date)=>value.toISOString());'),
   bad('最终函数入口保持 A','import {pipe} from "./main";const f=pipe((value:string)=>value.length,(length:number)=>String(length));f(1);'),
  ],'A、B、C 分别承担入口、中间与出口，B 将步骤连接。组合函数不执行类型转换，只把第一步的实际结果传给第二步。','first 接受 A 而不是 B。｜每一步只需要调用一次。｜返回闭包，在它被调用时执行 second(first(value))。',{
   runtime:[run('延迟执行且每步一次','const {pipe}=load("main.js");const events=[];const f=pipe(value=>{events.push("first");return value.length;},value=>{events.push("second");return value*2;});equal(events,[]);equal(f("abc"),6);equal(events,["first","second"]);')],
  }),
 m(4,9,'复测：结果类型与错误类型','type Result<T,E>={ok:true;value:T}|{ok:false;error:E} 中为何分开 T 与 E？',['成功载荷与失败信息可以是不同类型，应分别表达','E 必须是 Error 类而 T 必须是 string','两个类型参数会自动捕获异常','T 与 E 不能使用相同类型'],'成功和失败是不同角色，独立参数允许同一容器用于不同领域。参数化结构不自动产生捕获异常的行为。','成功数据和失败信息不一定同形状。｜独立参数避免错误绑定。｜是否捕获异常仍由函数实现决定。'),
 t(4,10,'复测：只变换成功载荷','导出 Result<T,E>={ok:true;value:T}|{ok:false;error:E}。实现 mapResult<T,U,E>(result:Result<T,E>,convert:(value:T)=>U):Result<U,E>，成功时调用 convert 一次，失败时不调用并保留原错误对象。',
  'export type Result<T,E>={ok:true;value:T}|{ok:false;error:E};\nexport function mapResult<T,U,E>(result:Result<T,E>,convert:(value:T)=>U):Result<U,E>{throw new Error("todo");}',
  'export type Result<T,E>={ok:true;value:T}|{ok:false;error:E};\nexport function mapResult<T,U,E>(result:Result<T,E>,convert:(value:T)=>U):Result<U,E>{return result.ok?{ok:true,value:convert(result.value)}:result;}',[
   ok('成功变化而错误保留','import {Result,mapResult} from "./main";declare const input:Result<number,{code:string}>;const out:Result<string,{code:string}>=mapResult(input,value=>String(value));'),
   bad('错误类型不能被回调改变','import {Result,mapResult} from "./main";declare const input:Result<number,{code:string}>;const out:Result<string,number>=mapResult(input,value=>String(value));'),
   bad('回调输入与成功载荷一致','import {Result,mapResult} from "./main";declare const input:Result<number,string>;mapResult(input,(value:Date)=>value.toISOString());'),
  ],'T 到 U 描述成功变换，E 独立贯穿失败分支。泛型关系清楚后，运行逻辑只需按判别字段决定是否调用回调。','三个参数分别代表旧值、新值、错误。｜只在 ok 分支调用 convert。｜失败分支可以原样返回 result。',{
   runtime:[run('失败不会触发变换','const {mapResult}=load("main.js");let calls=0;const convert=value=>{calls++;return String(value);};equal(mapResult({ok:true,value:2},convert),{ok:true,value:"2"});equal(calls,1);const error={code:"offline"};const result=mapResult({ok:false,error},convert);check(result.error===error);equal(calls,1);')],
  }),
 m(5,1,'默认类型不覆盖推断','function wrap<T=string>(value:T):T{return value} 调用 wrap(3) 的结果会被强制变成 string 吗？',['不会，实参可推断出数值类型，默认类型不是强制转换','会，默认类型总是最高优先级','会，3 在运行时变成 "3"','不允许传入任何非字符串'],'默认类型为省略且未得到适用推断的类型参数提供后备，不覆盖已有输入关系，也不执行值转换。','参数值是否提供了 T 的线索？｜3 提供了数值类型。｜默认值并非强制类型。'),
 m(5,2,'没有推断来源时','function empty<T=string>():T[]{return []} 调用 empty() 得到什么类型？',['string[]','never[]','unknown[]','T[]，调用方无法使用'],'没有实参为 T 提供候选时，声明的默认类型会生效。返回空数组本身满足任何 T[]，不会自动填入默认元素。','函数没有输入。｜T 明确提供了默认 string。｜默认类型不生成数组内容。'),
 m(5,3,'显式参数仍受约束','function empty<T extends {id:string}={id:string}>():T[]{return []}，empty<number>() 会怎样？',['报错，显式类型参数仍必须满足约束','通过，显式指定会跳过 extends','通过并返回 {id:string}[]','运行时才检查 number 是否有 id'],'默认值和显式选择都必须符合约束。类型参数不是关闭检查的开关。','number 能提供 id:string 吗？｜显式选择仍在允许范围内检查。｜不满足约束就拒绝。'),
 t(5,4,'补上无输入时的默认类型','实现 empty<T=string>():T[]，每次返回新空数组。未写类型参数时得到 string[]；显式 empty<number>() 得到 number[]。',
  'export function empty<T>():T[]{return [];}',
  'export function empty<T=string>():T[]{return [];}',[
   ok('默认和显式调用','import {empty} from "./main";const text:string[]=empty();text.push("a");const nums:number[]=empty<number>();nums.push(1);'),
   bad('默认集合拒绝数字','import {empty} from "./main";const result=empty();result.push(1);'),
   bad('显式数字集合拒绝文本','import {empty} from "./main";const result=empty<number>();result.push("a");'),
  ],'函数没有推断来源，使用默认类型让调用更方便。类型默认与运行值默认不同，结果仍然是空数组。','没有参数可推断 T。｜在类型参数上写 =string。｜实现每次创建 []。',{
   runtime:[run('空集合不共享引用','const {empty}=load("main.js");const a=empty(),b=empty();equal(a,[]);equal(b,[]);check(a!==b);a.push("x");equal(b,[]);')],
  }),
 m(5,5,'空数组推断需要上下文','const values:string[]=[] 与泛型调用 identity([]) 中的空数组，是否必然获得相同的元素类型？',['不一定，前者有 string[] 上下文，后者的具体推断取决于泛型与上下文','一定，空数组永远是 string[]','一定，空数组永远是 any[]','空数组不能参与类型推断'],'空数组没有元素证据，上下文与声明位置会影响推断。应检查实际类型，在必要时提供类型参数或数组标注，而不是一概断言。','数组内没有值提供元素类型。｜前者已有明确上下文。｜泛型调用需要看其具体签名。',{stage:'reason'}),
 t(5,6,'设计可推断的默认集合','实现 list<T=string>(items:readonly T[]=[]):T[]，复制输入。无参数时返回默认 string[]；传入数字或对象数组时根据输入推断，不强制 string。',
  'export function list<T=string>(items:readonly string[]=[]):string[]{return [...items];}',
  'export function list<T=string>(items:readonly T[]=[]):T[]{return [...items];}',[
   ok('实参推断覆盖后备类型','import {list} from "./main";const a:string[]=list();const b:number[]=list([1,2]);const c:{id:string}[]=list([{id:"a"}]);const source:readonly number[]=[1];list(source);'),
   bad('默认结果不接收数字','import {list} from "./main";const a=list();a.push(1);'),
   bad('显式参数检查输入','import {list} from "./main";list<number>(["a"]);'),
  ],'类型默认必须与参数中的 T 建立关系才有意义。输入有类型证据时可推断出其他 T，没有输入时才采用 string。','初始代码虽然声明 T，但没有使用它。｜把输入元素和结果都改为 T。｜保留运行参数的默认空数组。',{
   runtime:[run('复制不同类型集合','const {list}=load("main.js");equal(list(),[]);const source=Object.freeze([1,2]);const out=list(source);equal(out,[1,2]);check(out!==source);const value={id:"a"};check(list([value])[0]===value);')],
  }),
 m(5,7,'后面的默认类型引用前面的参数','type Pair<T,U=T>=[T,U]。Pair<number> 与 Pair<number,string> 分别是什么？',['[number,number] 与 [number,string]','都为 [number,number]','都为 [number,string]','前者非法，因为 U 不能引用 T'],'后面的默认参数可以引用前面已声明的类型参数。显式传入第二参数时使用显式类型，否则使用基于 T 的默认。','先为 T 代入 number。｜缺省 U 时取 T。｜显式 string 会替换 U 的后备。',{stage:'reason'}),
 t(5,8,'迁移：带默认错误类型的结果','导出 Result<T,E=Error>={ok:true;value:T}|{ok:false;error:E}，以及 success<T>(value:T):Result<T>，构造成功结果。默认失败类型为 Error，但允许显式选择字符串错误类型。',
  'export type Result<T,E=string>={ok:true;value:T}|{ok:false;error:E};\nexport function success<T>(value:T):Result<T>{return {ok:true,value};}',
  'export type Result<T,E=Error>={ok:true;value:T}|{ok:false;error:E};\nexport function success<T>(value:T):Result<T>{return {ok:true,value};}',[
   ok('默认 Error 与显式字符串错误','import {Result,success} from "./main";const a:Result<number>={ok:false,error:new Error("x")};const b:Result<number,string>={ok:false,error:"x"};const c:Result<{id:string}>=success({id:"a"});'),
   bad('默认失败类型不是字符串','import {Result} from "./main";const a:Result<number>={ok:false,error:"x"};'),
   bad('成功载荷仍必须匹配 T','import {Result} from "./main";const a:Result<number>={ok:true,value:"1"};'),
  ],'默认类型让常用实例只写一个参数，显式 E 保留扩展能力。默认 Error 只是结构契约，不会自动把抛出的任意值转换成 Error。','错误参数 E 是可以省略的第二项。｜把默认类型设为 Error。｜成功构造仍保留 T 的输入关系。',{
   runtime:[run('成功值不被转换','const {success}=load("main.js");const value={id:"a"};const result=success(value);equal(result.ok,true);check(result.value===value);equal(success(0),{ok:true,value:0});')],
  }),
 m(5,9,'复测：显式指定不是部分推断占位符','函数声明 <A,B=string>，调用时只显式写 <number>，是否表示 B 一定继续根据第二个实参自由推断？',['不能这样假设，省略的 B 会采用声明默认，TypeScript 没有在此把省略当作任意推断占位符','是，默认值在任何情况下都被忽略','是，B 永远推断为 number','显式写一个类型参数会自动删除 B'],'显式提供一部分类型参数时，后续可省略参数会使用其默认。若希望两者都从实参推断，通常省略整个类型参数列表。','区分完全省略类型参数与只显式提供前面部分。｜后续参数已有合法默认。｜必要时写全参数或让整个调用推断。'),
 t(5,10,'复测：精确的空集合工厂调用','辅助文件导出 create<T=string>():T[]。在 main.ts 中导出 numbers:number[]，由 create 创建并加入 1、2；导出 labels:string[]，由默认 create 创建并加入 "a"。修复调用处，不修改辅助文件。',
  {'main.ts':'import {create} from "./factory";\nexport const numbers=create();numbers.push(1,2);\nexport const labels=create();labels.push("a");'},
  {'main.ts':'import {create} from "./factory";\nexport const numbers=create<number>();numbers.push(1,2);\nexport const labels=create();labels.push("a");'},[
   ok('两种集合保持独立类型','import {numbers,labels} from "./main";const a:number[]=numbers;const b:string[]=labels;'),
   bad('数字集合不能追加文本','import {numbers} from "./main";numbers.push("3");'),
   bad('标签集合不能追加数字','import {labels} from "./main";labels.push(3);'),
  ],'无实参的泛型工厂无法从后续 push 反向推断 T。需要在创建时指定数字类型，默认调用则保持字符串集合。','后续操作不会回头改变工厂调用的类型选择。｜数字集合创建时写 <number>。｜标签集合可以使用默认。',{
   supportFiles:{'factory.ts':'export function create<T=string>():T[]{return [];}'},
   runtime:[run('构造时就选择类型','const {numbers,labels}=load("main.js");equal(numbers,[1,2]);equal(labels,["a"]);check(numbers!==labels);')],
  }),
 m(6,1,'为什么 key 不能只是 string','get<T>(object:T,key:string) 直接返回 object[key] 为什么缺少类型保证？',['任意字符串不一定是 T 的合法属性名','所有对象都不能动态索引','泛型只能通过点语法访问','key 必须是 number 才能索引'],'对象类型 T 可能只声明有限键。string 没有把 key 与对象结构关联，K extends keyof T 才能表达合法属性范围。','设想对象只有 id。｜字符串 missing 是否存在？｜约束 key 来自 keyof T。'),
 m(6,2,'T[K] 保留什么','get<T,K extends keyof T>(object:T,key:K):T[K] 比统一返回 unknown 有什么价值？',['结果与本次选定的属性类型对应','自动生成对象不存在的属性','保证字段值永远不是 undefined','对对象做深复制'],'索引访问类型 T[K] 将选定键与值类型连接。如果选中可选属性，它仍保留缺失可能；不会凭空创造更强保证。','K 表示本次选择的键。｜T[K] 查询这个键对应的值类型。｜属性自身的可选性也会保留。'),
 m(6,3,'keyof 不总是 string','对象包含数字键和 symbol 键时，将 K 直接限制为 string 会有什么影响？',['可能排除原本合法的数字或 symbol 键','不会，所有 TypeScript 键只能是字符串','会把所有值转换成字符串','会自动丢弃数字字段'],'TypeScript 属性键可以是字符串、数字或 symbol。通用属性访问应根据 keyof T 约束，而不是无条件假定只有 string。','看看对象是否允许 symbol 属性。｜类型层面也保留数字键信息。｜keyof T 比 string 更贴合对象。'),
 t(6,4,'修复动态键读取','实现 get<T,K extends keyof T>(object:T,key:K):T[K]，返回对应属性。支持字符串、数字与 symbol 键，不接受不存在的键。',
  'export function get<T>(object:T,key:string):unknown{return object[key];}',
  'export function get<T,K extends keyof T>(object:T,key:K):T[K]{return object[key];}',[
   ok('不同键保留对应值类型','import {get} from "./main";const user={name:"Lin",age:2};const s:string=get(user,"name");const n:number=get(user,"age");const numeric:string=get({0:"zero"},0);const token=Symbol();const b:boolean=get({[token]:true},token);'),
   bad('拒绝不存在的键','import {get} from "./main";get({id:"a"},"missing");'),
   bad('字段值不能冒充其他类型','import {get} from "./main";const s:string=get({age:2},"age");'),
  ],'K 的约束保证可索引，T[K] 保留属性类型。实现就是普通属性读取，泛型只描述原本存在的关系。','需要把 key 和 object 的类型连接。｜K extends keyof T 表达合法键。｜返回标注使用 T[K]。',{
   runtime:[run('原始属性读取','const {get}=load("main.js");equal(get({name:"Lin",age:2},"age"),2);equal(get({0:"zero"},0),"zero");const key=Symbol();const value={id:"x"};check(get({[key]:value},key)===value);')],
  }),
 m(6,5,'可选属性仍需处理缺失','type User={name:string;nickname?:string}，get(user,"nickname") 的类型应是什么？',['string | undefined','string','never','unknown，与键无关'],'T[K] 获取属性原有类型，不会因键属于 keyof T 就证明该可选属性一定有值。合法字段名与字段当前有值是不同条件。','问号表达允许省略。｜keyof 证明名字合法。｜不能据此排除 undefined。',{stage:'reason'}),
 t(6,6,'设计字段值对应的更新','实现 set<T,K extends keyof T>(object:T,key:K,value:T[K]):void，更新指定字段，其他字段保持不变。这里练习可变对象与单个具体键的调用。',
  'export function set<T,K extends keyof T>(object:T,key:K,value:unknown):void{object[key]=value;}',
  'export function set<T,K extends keyof T>(object:T,key:K,value:T[K]):void{object[key]=value;}',[
   ok('具体键对应正确值','import {set} from "./main";const user={name:"Lin",age:2};set(user,"name","Jia");set(user,"age",3);'),
   bad('数值字段不接受文本','import {set} from "./main";set({age:2},"age","3");'),
   bad('不能更新不存在的键','import {set} from "./main";set({age:2},"missing",3);'),
  ],'类型参数让写入值与所选字段关联。这里的保证针对具体键；如果 K 自身为联合，T[K] 也会成为联合，不能误以为它解决了所有动态关联问题。','unknown 不保证适合所选字段。｜value 使用 T[K]。｜运行时执行一次对应字段赋值。',{
   runtime:[run('只更新目标字段','const {set}=load("main.js");const user={name:"Lin",age:2};equal(set(user,"age",3),undefined);equal(user,{name:"Lin",age:3});set(user,"name","");equal(user,{name:"",age:3});')],
  }),
 m(6,7,'联合键的关联边界','T={name:string;age:number}，K="name"|"age" 时，T[K] 是什么？能仅靠它保证运行时键和值一一对应吗？',['是 string|number；不能仅凭这个联合保证当前键与值的对应关系','是 never，因此所有赋值都被禁止','是 string，name 写在前面','是 number，而且编译器会自动转换文本'],'索引联合得到值的联合，但两个独立联合不等于成对关系。需要更强的更新接口时，可以用判别联合元组等方式表达合法配对。','先计算两个键各自的值类型。｜合并后得到联合。｜联合集合不保存当前值来自哪个键。',{stage:'reason'}),
 t(6,8,'迁移：从列表提取字段','实现 pluck<T,K extends keyof T>(items:readonly T[],key:K):T[K][]，按原顺序收集每项的指定字段，保留可选属性的 undefined，不修改输入。',
  'export function pluck<T,K extends keyof T>(items:readonly T[],key:K):T[K][]{return [];}',
  'export function pluck<T,K extends keyof T>(items:readonly T[],key:K):T[K][]{return items.map(item=>item[key]);}',[
   ok('提取字段保留原类型','import {pluck} from "./main";const names:string[]=pluck([{name:"Lin",age:2}],"name");const input:readonly {id:string;nick?:string}[]=[{id:"a"}];const nicks:(string|undefined)[]=pluck(input,"nick");'),
   bad('字段必须属于元素','import {pluck} from "./main";pluck([{id:"a"}],"missing");'),
   bad('不能抹掉可选属性缺失','import {pluck} from "./main";declare const input:readonly {nick?:string}[];const values:string[]=pluck(input,"nick");'),
  ],'泛型把列表元素、字段名与结果数组元素连接。提取不等于过滤，缺失值也要保留在对应位置。','返回每一项的 item[key]。｜不能为了返回 string[] 而过滤缺失。｜map 保持数量与顺序。',{
   runtime:[run('位置与缺失保留','const {pluck}=load("main.js");equal(pluck([{id:1},{id:2}],"id"),[1,2]);equal(pluck([{nick:"a"},{},{nick:""}],"nick"),["a",undefined,""]);equal(pluck([],"id"),[]);')],
  }),
 m(6,9,'复测：外部字符串不是自动合法键','从输入框得到 key:string，为什么不能直接传给只接受 "name"|"age" 的 get？',['需要先确认它属于合法键集合，string 范围过宽','输入框不能用于 TypeScript','把参数名改成 keyof 就会自动通过','任何字符串在运行时都自动成为已有字段'],'用户输入属于外部数据，类型系统不能假设它符合有限候选。应做实际分支检查或解析，不应随手断言成 keyof。','输入可能是 missing。｜有限键集合比 string 更窄。｜需要运行时证据来收窄。'),
 t(6,10,'复测：记录选中的键和值','实现 entry<T,K extends keyof T>(object:T,key:K):{key:K;value:T[K]}，创建记录，键和属性值都原样保留；具体调用保留键的字面量类型。',
  'export function entry<T,K extends keyof T>(object:T,key:K):{key:keyof T;value:T[keyof T]}{return {key,value:object[key]};}',
  'export function entry<T,K extends keyof T>(object:T,key:K):{key:K;value:T[K]}{return {key,value:object[key]};}',[
   ok('具体键值信息不扩大','import {entry} from "./main";const e=entry({name:"Lin",age:2},"name");const key:"name"=e.key;const value:string=e.value;'),
   bad('不能选择无效键','import {entry} from "./main";entry({id:"a"},"missing");'),
   bad('值不因包装变成其他类型','import {entry} from "./main";const n:number=entry({name:"Lin",age:2},"name").value;'),
  ],'keyof T 表示全部合法键，而 K 表示本次选定的键。返回时退回全部键会扩大信息，应该持续使用 K 与 T[K]。','找出返回标注中哪一处过宽。｜使用本次选择 K，而非所有键 keyof T。｜值同样使用 T[K]。',{
   runtime:[run('记录原键和值引用','const {entry}=load("main.js");const value={id:"a"};const result=entry({payload:value},"payload");equal(result.key,"payload");check(result.value===value);equal(entry({count:0},"count"),{key:"count",value:0});')],
  }),
 m(7,1,'调用者选择不等于数据可信','function parse<T>(text:string):T{return JSON.parse(text)} 看似方便，核心风险是什么？',['调用者可指定任意 T，但实现没有验证 JSON 是否满足它','JSON.parse 不能在泛型函数里调用','T 会自动限制 JSON 字符串格式','泛型会导致 JSON.parse 运行两次'],'JSON.parse 的宽松返回类型可以绕过静态检查，但并未证明实际数据符合 T。泛型承诺应来自输入关系、校验器或真实构造逻辑。','类型参数由谁选择？｜实现是否检查了目标字段？｜仅指定 T 不构成运行证据。'),
 m(7,2,'安全的解析边界','不知道外部 JSON 的结构时，更合理的基础返回类型是什么？',['unknown，要求后续校验或收窄','any，便于直接访问所有字段','调用者任意指定的 T，无需输入依据','never，表示可能解析失败'],'unknown 保留未知事实，迫使使用者验证结构。语法解析成功不代表业务结构符合预期，失败是否抛错则是另一项约定。','有效 JSON 可能是数字、数组或对象。｜结构还没有验证。｜unknown 避免假装已知。'),
 m(7,3,'类型参数只出现一次的信号','函数只读取输入的 length 并返回 number，是否一定需要 <T extends {length:number}>？',['不一定，若不需要保留其他类型关系，直接接收 {length:number} 也可；还需考虑字面量额外属性的调用体验','一定，读取属性只能用泛型','不需要，应该改成 any','一定，泛型会自动验证真实长度'],'泛型应为关系或调用能力服务。只有一次出现时可以检查是否多余，但不能机械删除而忽略额外属性检查等接口差异。','是否有返回 T 或其他成员关系？｜仅有基础能力时简单接口可能足够。｜还要评估调用方的实际数据形式。'),
 t(7,4,'撤销没有证据的返回承诺','实现 parse(text:string):unknown，使用 JSON.parse 解析并返回，保留语法错误抛出。禁止让调用者通过类型参数声称返回某个业务结构。',
  'export function parse<T>(text:string):T{return JSON.parse(text);}',
  'export function parse(text:string):unknown{return JSON.parse(text);}',[
   ok('未知数据允许安全接收','import {parse} from "./main";const value:unknown=parse("{}");'),
   bad('必须先验证才能访问字段','import {parse} from "./main";parse("{}").id;',[2571,18046]),
   bad('不能任意指定结果类型','import {parse} from "./main";parse<{id:string}>("{}");',[2558]),
   bad('未知结果不能直接赋给业务模型','import {parse} from "./main";const value:{id:string}=parse("{}");'),
  ],'删除无证据的泛型承诺，并把边界结果限制为 unknown。这样语法解析与业务校验的责任保持清楚，调用者不能仅写类型参数就跳过验证。','实现没有关于目标模型的任何证据。｜不应开放任意 T 返回。｜使用 unknown 让调用方继续检查。',{
   runtime:[run('保留 JSON 的真实结果和异常','const {parse}=load("main.js");equal(parse(JSON.stringify({id:1})),{id:1});equal(parse("null"),null);equal(parse("[1,2]"),[1,2]);let failed=false;try{parse("{");}catch(error){failed=true;}check(failed);')],
  }),
 m(7,5,'校验器提供什么证据','parseWith<T>(text,guard:(value:unknown)=>value is T) 比让调用者只填写 <T> 多了什么？',['多了运行时校验步骤，但 guard 的实现仍需要正确且接受测试','自动证明任何 guard 都正确','使 JSON.parse 不再可能失败','让 T 在运行时成为类构造器'],'类型谓词是一项由实现者承担的承诺。传入校验器可以建立可执行检查，但错误或恒真谓词仍可能撒谎，所以要审查实际逻辑。','guard 会被真实调用。｜返回 true 是否有充分检查仍由实现决定。｜类型谓词不是自动生成的证明。',{stage:'reason'}),
 t(7,6,'设计以校验器为依据的解析','实现 parseWith<T>(text:string,guard:(value:unknown)=>value is T):T|undefined。JSON 语法无效或 guard 返回 false 时返回 undefined；校验成功返回原数据。guard 自身抛错时传播，不当作 JSON 语法错误吞掉。',
  'export function parseWith<T>(text:string,guard:(value:unknown)=>value is T):T|undefined{return JSON.parse(text);}',
  'export function parseWith<T>(text:string,guard:(value:unknown)=>value is T):T|undefined{let value:unknown;try{value=JSON.parse(text);}catch{return undefined;}return guard(value)?value:undefined;}',[
   ok('结果来自校验器类型','import {parseWith} from "./main";const n:number|undefined=parseWith("1",(value:unknown):value is number=>typeof value==="number");'),
   bad('不能抹去失败可能','import {parseWith} from "./main";const n:number=parseWith("1",(value:unknown):value is number=>typeof value==="number");'),
   bad('结果不能任意冒充另一类型','import {parseWith} from "./main";const s:string|undefined=parseWith("1",(value:unknown):value is number=>typeof value==="number");'),
  ],'先把 JSON 结果保留为 unknown，再让 guard 提供类型证据。try 范围只包语法解析，避免把校验器自身的程序错误误判成输入语法错误。','把语法失败和校验器异常分开处理。｜guard 返回 true 后 value 才可作为 T。｜只捕获 JSON.parse 的失败。',{
   runtime:[run('校验成功与拒绝','const {parseWith}=load("main.js");const isNumber=value=>typeof value==="number";equal(parseWith("1",isNumber),1);equal(parseWith(JSON.stringify("1"),isNumber),undefined);let calls=0;equal(parseWith("{",()=>{calls++;return true;}),undefined);equal(calls,0);const marker={bug:true};let caught=false;try{parseWith("1",()=>{throw marker;});}catch(error){caught=true;check(error===marker);}check(caught);')],
  }),
 m(7,7,'凭空构造 T 的替代方案','需要创建调用方指定类型的多个新对象，哪种参数提供了真实构造能力？',['传入 factory:()=>T，并由函数实际调用','只接收泛型 T','返回 {} as T','读取字符串 "T" 并自动生成属性'],'工厂函数将构造能力作为运行值传入，T 则保留工厂产物的类型关系。仅有泛型名字不能创建对象。','类型参数不包含构造代码。｜工厂是真实可调用值。｜它返回 T，为结果提供来源。',{stage:'reason'}),
 t(7,8,'迁移：用工厂构造独立元素','实现 createMany<T>(count:number,factory:(index:number)=>T):T[]，对 0 到 count-1 各调用一次工厂并收集结果。输入保证 count 是非负整数；不能只构造一次再用 fill 重复。',
  'export function createMany<T>(count:number,factory:(index:number)=>T):T[]{return Array(count).fill(factory(0));}',
  'export function createMany<T>(count:number,factory:(index:number)=>T):T[]{return Array.from({length:count},(_,index)=>factory(index));}',[
   ok('返回类型由工厂产物确定','import {createMany} from "./main";const objects:{id:number}[]=createMany(2,index=>({id:index}));const texts:string[]=createMany(1,index=>String(index));'),
   bad('不能任意指定不匹配产物','import {createMany} from "./main";createMany<string>(2,index=>index);'),
   bad('计数参数必须为数字','import {createMany} from "./main";createMany("2",index=>index);'),
  ],'工厂提供合法 T 的来源，泛型只保持产物类型。逐项调用也保证工厂有机会创建各自独立的对象，而非让所有位置共享同一次产物。','fill 接收的是一个已经算好的值。｜需要每个索引分别调用 factory。｜零数量时不应调用工厂。',{
   runtime:[run('工厂调用次数与索引','const {createMany}=load("main.js");const seen=[];const values=createMany(3,index=>{seen.push(index);return {id:index};});equal(seen,[0,1,2]);equal(values,[{id:0},{id:1},{id:2}]);check(values[0]!==values[1]);let calls=0;equal(createMany(0,()=>{calls++;return {}; }),[]);equal(calls,0);')],
  }),
 m(7,9,'复测：泛型安全设计的依据','判断一个返回 T 的函数是否可信，优先检查什么？',['T 的值是否来自相关输入、校验结果或真实工厂，并且实现保留该关系','函数名是否带 generic','泛型参数是否至少三个','是否在所有 return 前写 as T'],'类型参数应有真实数据来源与可检查的联系。断言可以绕开编译器，却不能补足不存在的证据。','沿着返回值向前追踪来源。｜看看是否存在实际输入或构造能力。｜不应以断言数量判断安全性。'),
 t(7,10,'复测：缓存工厂产物而非伪造 T','实现 once<T>(factory:()=>T):()=>T。创建阶段不运行 factory；首次调用成功后缓存结果，后续调用返回同一值，包括 undefined、0、false；首次调用抛错则不缓存失败，允许下一次重试。',
  'export function once<T>(factory:()=>T):()=>T{return ()=>factory();}',
  'export function once<T>(factory:()=>T):()=>T{let state:{ready:false}|{ready:true;value:T}={ready:false};return ()=>{if(!state.ready){state={ready:true,value:factory()};}return state.value;};}',[
   ok('缓存函数保留工厂结果类型','import {once} from "./main";const get=once(()=>({id:"a"}));const id:string=get().id;const count:number=once(()=>1)();'),
   bad('结果不能伪装为另一类型','import {once} from "./main";const s:string=once(()=>1)();'),
   bad('工厂不能要求未提供的参数','import {once} from "./main";once((index:number)=>index);'),
  ],'T 来自真实工厂。缓存状态必须与缓存值分开，否则假值会被误认为尚未计算；只有成功返回后才设置 ready，保留失败后的重试能力。','不要使用缓存值的真假值判断是否就绪。｜用独立判别状态保存 T。｜工厂成功后才写入就绪状态。',{
   runtime:[run('惰性、假值和引用缓存','const {once}=load("main.js");for(const value of [undefined,0,false,{id:"a"}]){let calls=0;const get=once(()=>{calls++;return value;});equal(calls,0);check(get()===value);check(get()===value);equal(calls,1);}'),run('异常不被当作成功缓存','const {once}=load("main.js");let calls=0;const marker={failure:true};const get=once(()=>{calls++;if(calls===1)throw marker;return "ok";});let failed=false;try{get();}catch(error){failed=true;check(error===marker);}check(failed);equal(get(),"ok");equal(get(),"ok");equal(calls,2);')],
  }),
];
