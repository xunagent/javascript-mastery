import { mc, task, ok, bad } from './author.mjs';
const id=n=>`t12-l${String(n).padStart(2,'0')}`;
const m=(l,n,title,prompt,options,explanation,hints,extra={})=>mc(id(l),n,title,prompt,options,explanation,hints.split('｜'),extra);
const t=(l,n,title,prompt,files,solution,tests,explanation,hints,extra={})=>task(id(l),n,title,prompt,files,solution,tests,explanation,hints.split('｜'),extra);
export const questions=[
 m(1,1,'项目入口与依赖','tsconfig 的 files/include 选中的文件，与整个程序最终包含的文件是否必然相同？',['不必然，入口的导入或引用还可能带入其他文件','必然，所有 import 都被忽略','不必然，因为编译器随机加入文件','必然，exclude 会阻止任何依赖进入'],'配置选择入口，模块依赖会继续扩展程序文件图。理解报错来源时要同时查看入口规则和导入关系。','先区分入口集合和依赖图。｜import 仍需检查目标。｜最终程序可能包含更多文件。'),
 m(1,2,'exclude 不是禁止导入','把 generated 目录放进 exclude，是否保证该目录的文件永远不参与检查？',['不能，若被入口导入，仍可能进入程序','能，exclude 是运行时访问控制','能，编译器会删除该目录','不能，因为 exclude 从不影响文件选择'],'exclude 主要影响 include 的扫描结果，不是禁止依赖进入的规则。被显式文件列表或导入关系纳入时仍需处理。','exclude 过滤的是哪一步？｜导入产生新的依赖。｜不能用排除代替修复必需代码。'),
 m(1,3,'files 和通配符','files 数组更适合表达什么？',['明确列出的入口文件清单，通配扫描通常使用 include','要忽略的目录','包管理器安装列表','只参与运行不参与检查的文件'],'files 明确指定文件；include 表达匹配范围。选择哪种方式取决于希望精确列举还是按目录发现入口。','看是否需要逐个列出。｜通配范围由 include 表达。｜两者都可能引入后续依赖。'),
 t(1,4,'修复包含了临时文件的配置','只编辑 tsconfig.json，使项目入口仅包含 src/main.ts；scratch.ts 是不应进入项目的临时错误代码。可用 files 或合适的 include 表达范围，不关闭类型检查。',
  {'tsconfig.json':'{"include":["**/*.ts"]}'},
  {'tsconfig.json':'{"include":["src/**/*.ts"]}'},[
   ok('项目入口的导出可用','import {value} from "./src/main";const n:number=value;'),
   bad('类型错误仍应报告','import {value} from "./src/main";const s:string=value;'),
  ],'修正入口范围可以排除无关临时文件，但不能关闭类型检查。判题同时核对实际入口集合，避免只靠忽略诊断过关。','当前通配符扫描了整个项目。｜目标代码位于 src。｜缩小入口范围或显式列出入口。',{project:{configFile:'tsconfig.json',rootFiles:['src/main.ts'],excludedFiles:['scratch.ts']},supportFiles:{'src/main.ts':'export const value=1;','scratch.ts':'export const temporary:number="unfinished";'}}),
 m(1,5,'显式入口与排除','配置同时有 files:["main.ts"] 和 exclude:["main.ts"]，main.ts 是否仍是显式入口？',['是，exclude 不会从 files 的显式清单中删除它','不是，exclude 总有最高优先级','配置一定被当作空项目','main.ts 会自动改名'],'files 是明确入口清单，exclude 不是对所有纳入机制进行统一否决。不要用它推断显式入口不存在。','先看 files 已经列出了什么。｜exclude 主要过滤扫描结果。｜显式列举有独立语义。'),
 t(1,6,'设计单入口及导入依赖','配置入口仅为 entry.ts。它会导入 deps/value.ts，该依赖必须被检查，但不作为额外入口。unused.ts 不进入程序。只编辑 tsconfig.json，不删除导入或改其他文件。',
  {'tsconfig.json':'{"include":["**/*.ts"]}'},
  {'tsconfig.json':'{"files":["entry.ts"]}'},[
   ok('导入依赖中的值可用','import {result} from "./entry";const value:number=result;'),
   bad('实际结果类型受检查','import {result} from "./entry";const value:boolean=result;'),
  ],'单入口仍会带入其导入的依赖。只需列出 entry.ts，依赖不是必须逐个重复列成入口；未使用文件则可保持在项目外。','显式列出 entry.ts。｜依赖由 import 带入。｜检查入口和程序集合的区别。',{project:{configFile:'tsconfig.json',rootFiles:['entry.ts'],requiredFiles:['entry.ts','deps/value.ts'],excludedFiles:['unused.ts']},supportFiles:{'entry.ts':'import {value} from "./deps/value";export const result=value+1;','deps/value.ts':'export const value=2;','unused.ts':'export const unused:number="unfinished";'}}),
 m(1,7,'继承配置中的相对路径','base.json 中 include 的相对路径被 extends 继承时，通常应相对于哪里理解？',['定义该路径的配置文件所在目录','永远相对于运行终端目录','永远相对于最下层子配置','相对于浏览器地址'],'配置继承需要保留路径声明的来源位置。把基配置移动到其他目录时，应重新确认路径指向。','路径写在哪份配置里？｜来源位置影响解析。｜继承不等于把文本直接粘贴到子文件。'),
 t(1,8,'迁移：排除不能隐藏导入错误','tsconfig 已只列 src/main.ts，并 exclude src/dependency.ts，但 main 仍导入它。修复 dependency.ts 的 value:number，使其数值为 2；保持单入口和依赖关系，不关闭检查。',
  {'tsconfig.json':'{"files":["src/main.ts"],"exclude":["src/dependency.ts"]}','src/dependency.ts':'export const value:number="2";'},
  {'tsconfig.json':'{"files":["src/main.ts"],"exclude":["src/dependency.ts"]}','src/dependency.ts':'export const value:number=2;'},[
   ok('必需依赖确实检查','import {result} from "./src/main";const value:number=result;import {value as source} from "./src/dependency";const n:number=source;'),
   bad('依赖值不能当字符串','import {value} from "./src/dependency";const text:string=value;'),
  ],'dependency.ts 虽被排除在扫描外，仍因 import 进入程序，所以必须修复实际类型错误。排除规则不应被当成掩盖必要依赖错误的手段。','main 的 import 没有消失。｜修复 dependency 中的真实数值。｜保留入口与依赖的结构。',{project:{configFile:'tsconfig.json',rootFiles:['src/main.ts'],requiredFiles:['src/dependency.ts']},supportFiles:{'src/main.ts':'import {value} from "./dependency";export const result=value+1;'},runtime:[{name:'依赖实际提供数值',code:'equal(load("src/main.js").result,3);'}]}),
 m(1,9,'复测：JSONC 配置','tsconfig.json 中的注释和尾随逗号应如何处理？',['按 TypeScript 支持的配置解析规则读取，不能简单等同于严格 JSON.parse','全部当作 JavaScript 执行','遇到注释就忽略整个配置','必须先改成 YAML'],'TypeScript 配置支持相应 JSONC 语法。工具应使用正确解析器，并把配置错误报告出来，而不是悄悄丢掉配置。','文件名与解析规则要一起看。｜TypeScript 提供配置解析能力。｜不能只用严格 JSON 假设。'),
 t(1,10,'复测：保留基配置的范围与检查','只读 config/base.json 启用严格索引检查，并扫描 src 中非测试代码。编辑顶层 tsconfig.json，继承它，项目入口应只有 src/main.ts，src/main.test.ts 不进入程序；保留 noUncheckedIndexedAccess=true。',
  {'tsconfig.json':'{"extends":"./config/base.json","exclude":[]}'},
  {'tsconfig.json':'{"extends":"./config/base.json"}'},[
   ok('源文件正常检查','import {value} from "./src/main";const n:number=value;'),
   bad('继承的索引检查仍有效','const values:number[]=[];const value:number=values[0];'),
  ],'子配置的 exclude 会覆盖继承值，空数组可能重新纳入测试文件。保留基配置的范围与检查规则，比只修掉表面报错更完整。','基配置已经给出正确排除规则。｜去掉不必要的 exclude 覆盖。｜继承严格索引检查。',{project:{configFile:'tsconfig.json',rootFiles:['src/main.ts'],excludedFiles:['src/main.test.ts']},supportFiles:{'config/base.json':'{"compilerOptions":{"strict":true,"noUncheckedIndexedAccess":true},"include":["../src/**/*.ts"],"exclude":["../src/**/*.test.ts"]}','src/main.ts':'export const value=1;','src/main.test.ts':'export const unfinished:number="test";'}}),
 m(2,1,'strict 是否包含所有检查','开启 strict 后，是否意味着 noUncheckedIndexedAccess 和 exactOptionalPropertyTypes 也自动开启？',['不是，这些选项需要单独确认配置','是，strict 等于所有检查选项','只有数组索引检查自动开启','只有精确可选属性自动开启'],'strict 是一组严格检查的组合，不等于所有可用的检查开关。具体项目还需明确额外选项，不凭名称推断。','组合开关不代表全部选项。｜检查实际配置。｜区分默认严格组与额外检查。'),
 m(2,2,'严格空值检查的作用','strictNullChecks 开启后，为什么不能把 string|null 直接当 string 使用？',['null 是需要处理的独立可能，必须先排除或定义缺失行为','所有字符串都变成 null','编译器会自动补上默认文本','字符串方法被禁用'],'严格空值检查让缺失状态出现在类型关系中。程序应根据业务决定返回、抛错或默认值，而不是隐藏该状态。','联合包含两个分支。｜字符串操作不适用于 null。｜需要真实处理缺失路径。'),
 m(2,3,'noImplicitAny 的边界','noImplicitAny 是否禁止所有显式 any？',['不是，它主要报告无法推断而隐式产生的相关 any；显式 any 仍需其他规则约束','是，任何 any 都会被该选项拒绝','不是，因为它完全不检查参数','是，并且会自动把 any 替换成 unknown'],'隐式 any 检查不能代替团队对显式 any 的约束。本课程另有限制和反例测试，避免用显式 any 绕过题目目标。','先区分隐式与显式。｜选项名称强调 implicit。｜不要夸大开关的保证。'),
 t(2,4,'修复被关闭的空值与参数检查','只编辑 tsconfig.json，使严格空值与隐式 any 检查生效，保留 main.ts 为唯一入口。可使用 strict:true，不要关闭检查。main.ts 本身已正确，测试将提供缺失值和未标注参数反例。',
  {'tsconfig.json':'{"compilerOptions":{"strict":false},"files":["main.ts"]}'},
  {'tsconfig.json':'{"compilerOptions":{"strict":true},"files":["main.ts"]}'},[
   ok('合法代码仍通过','import {length} from "./main";const value:number=length("abc");'),
   bad('严格空值检查拒绝 null','const text:string=null;'),
   bad('隐式参数类型不能漏检','function identity(value){return value;}export {identity};',[7006]),
  ],'开启严格检查后，合法模块仍应通过，而错误空值与无上下文参数应被拒绝。负例测试验证实际效果，不只查看配置文本是否含某个词。','检查 strict 当前值。｜开启严格组合检查。｜保留原入口清单。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'main.ts':'export function length(text:string):number{return text.length;}'}}),
 m(2,5,'索引检查增加的可能','noUncheckedIndexedAccess 开启时，对普通 string[] 使用 values[index]，为什么通常需要考虑 undefined？',['索引位置可能不存在，数组元素类型本身不保证长度','所有字符串会自动变成 undefined','编译器禁止数组索引','因为数组只支持字符串键'],'该选项揭示未证明存在的索引读取。它不意味着每次读取都失败，而是提醒调用方处理缺失可能。','数组可以为空。｜index 也可能越界。｜需要证据或失败分支。'),
 t(2,6,'设计安全的首次元素读取','编辑配置启用 strict 和 noUncheckedIndexedAccess，且 main.ts 是唯一入口。实现 firstOr(values:readonly string[],fallback:string):string：有首项返回首项，空数组返回 fallback；空字符串必须保留。',
  {'tsconfig.json':'{"compilerOptions":{"strict":true,"noUncheckedIndexedAccess":false},"files":["main.ts"]}','main.ts':'export function firstOr(values:readonly string[],fallback:string):string{return values[0];}'},
  {'tsconfig.json':'{"compilerOptions":{"strict":true,"noUncheckedIndexedAccess":true},"files":["main.ts"]}','main.ts':'export function firstOr(values:readonly string[],fallback:string):string{return values[0]??fallback;}'},[
   ok('合法调用返回文本','import {firstOr} from "./main";const value:string=firstOr([],"default");'),
   bad('配置实际检查索引缺失','const values:string[]=[];const value:string=values[0];'),
   bad('输入不能混入数字','import {firstOr} from "./main";firstOr([1],"default");'),
  ],'配置暴露缺失可能，代码再用 ?? 定义缺失时的行为。使用 || 会错误替换合法的空字符串。','打开独立的索引检查。｜读取结果可能 undefined。｜用空值回退而不是真值回退。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},runtime:[{name:'空集合与空字符串分别处理',code:'const {firstOr}=load("main.js");equal(firstOr([],"fallback"),"fallback");equal(firstOr([""],"fallback"),"");equal(firstOr(["a","b"],"fallback"),"a");'}]}),
 m(2,7,'精确可选属性与读取','开启 exactOptionalPropertyTypes 是否让 optional?:string 的未检查读取直接变成 string？',['不会，它主要精确区分缺失与显式 undefined 的写入，读取仍可能缺失','会，属性自动变成必需','会，缺失自动变为空字符串','不会，但所有写入都被禁止'],'更精确的写入规则不改变属性可以省略的事实。读取与写入需要分别分析，不能误以为该选项消除了空值。','属性仍有问号。｜空对象仍可能合法。｜读取依然要处理缺失。'),
 t(2,8,'迁移：启用精确可选属性并修复构造','启用 strict 和 exactOptionalPropertyTypes，唯一入口 main.ts。实现 options(label:string|undefined):{label?:string}，undefined 时省略 label，字符串则保留，包括空字符串。',
  {'tsconfig.json':'{"compilerOptions":{"strict":true,"exactOptionalPropertyTypes":false},"files":["main.ts"]}','main.ts':'export function options(label:string|undefined):{label?:string}{return {label};}'},
  {'tsconfig.json':'{"compilerOptions":{"strict":true,"exactOptionalPropertyTypes":true},"files":["main.ts"]}','main.ts':'export function options(label:string|undefined):{label?:string}{return label===undefined?{}:{label};}'},[
   ok('省略与合法值仍允许','import {options} from "./main";const a:{label?:string}=options(undefined);const b:{label?:string}={label:"a"};'),
   bad('配置拒绝未声明的显式 undefined','const value:{label?:string}={label:undefined};',[2375]),
   bad('读取仍须考虑缺失','declare const value:{label?:string};const label:string=value.label;'),
  ],'打开配置之后，原先写入 undefined 的构造需要改为省略属性。类型反例验证开关生效，运行测试验证对象确实没有这个键。','先启用精确可选检查。｜undefined 分支返回空对象。｜字符串分支保留字段。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},runtime:[{name:'省略键而不是存 undefined',code:'const {options}=load("main.js");check(!Object.hasOwn(options(undefined),"label"));equal(options(""),{label:""});equal(options("a"),{label:"a"});'}]}),
 m(2,9,'复测：严格函数参数检查','关闭 strictFunctionTypes 来接纳只能处理窄输入的通用回调，真正解决了什么？',['只是放宽了检查，未让窄回调具备处理其他输入的能力','自动生成了运行时适配器','自动把数字转换为文本','证明所有回调都安全'],'检查选项不会改变函数本身的能力。应根据完整输入契约修复回调或添加真实守卫，而不是仅消除诊断。','代码的运行逻辑有没有改变？｜检查放宽不等于能力增加。｜处理完整输入或显式适配。'),
 t(2,10,'复测：恢复严格回调检查','只编辑 tsconfig.json，保留 strict:true 和 main.ts 入口，并使 strictFunctionTypes 生效。main.ts 导出 Handler=(value:string|number)=>void；仅接收 string 的函数不应可赋给它，接收 unknown 的可以。',
  {'tsconfig.json':'{"compilerOptions":{"strict":true,"strictFunctionTypes":false},"files":["main.ts"]}'},
  {'tsconfig.json':'{"compilerOptions":{"strict":true,"strictFunctionTypes":true},"files":["main.ts"]}'},[
   ok('更宽输入函数可以替代','import type {Handler} from "./main";const handler:Handler=(value:unknown)=>{};'),
   bad('窄输入回调不能冒充通用处理器','import type {Handler} from "./main";const handler:Handler=(value:string)=>{};'),
   bad('空值检查仍保留','const value:number=undefined;'),
  ],'strict 子项可以被显式关闭，所以必须检查覆盖项。恢复该选项后，函数属性/函数类型按严格输入方向检查；方法签名的特殊规则另行讨论。','查看显式覆盖的 strictFunctionTypes。｜恢复它或去掉 false 覆盖。｜保留 strict 的其他检查。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'main.ts':'export type Handler=(value:string|number)=>void;'}}),
 m(3,1,'语法与运行库是两件事','把 target 调低之后，代码中的新标准库方法会自动获得兼容实现吗？',['不会，语法转换与运行库补齐需要分别处理','会，所有方法都会内联为兼容实现','会，但只对数组方法有效','不会，因为 target 完全不影响输出'],'target 影响可降级语法的输出形式；库方法是否存在取决于运行环境或实际提供的兼容实现。','区分语法与 API。｜方法声明不是方法实现。｜检查实际运行环境。'),
 m(3,2,'lib 增加了什么','将 lib 从 ES2015 改成 ES2022，直接增加的是什么？',['编译器可使用的标准库类型声明','浏览器里的新方法实现','对所有输入的运行时检查','自动下载的 polyfill'],'lib 控制参与检查的内置声明。增加声明表示告诉编译器环境具有这些能力，不会安装这些能力。','关注编译阶段。｜声明描述环境。｜实际能力需要环境提供。'),
 m(3,3,'没有 DOM 的运行环境','一个只在服务端运行且没有 DOM 的模块，应如何理解加入 DOM lib 的影响？',['可能让不存在的浏览器全局通过检查，因此必须按真实环境选择','会创建 document 对象','会让服务端自动成为浏览器','只影响代码缩进'],'声明与真实宿主不一致会造成编译成功、运行失败。应提供真实宿主能力对应的声明。','运行时是否真的存在 document？｜声明不创建全局变量。｜检查环境契约。'),
 t(3,4,'保留箭头，降级可选链','只修改 tsconfig.json，使 main.js 保留箭头函数，但不再包含可选链语法；正常生成 main.js，不生成其他文件。main.ts 只读，可通过“查看编译输出”观察结果。',
 {'tsconfig.json':'{"compilerOptions":{"target":"ES2022"},"files":["main.ts"]}'},
 {'tsconfig.json':'{"compilerOptions":{"target":"ES2015"},"files":["main.ts"]}'},[
 ok('可选输入返回可能缺失的名称','import {read} from "./main";const name:string|undefined=read();read({name:"x"});'),
 bad('输入属性仍受检查','import {read} from "./main";read({name:3});'),
 ],'ES2015 到 ES2019 的目标均可满足本题输出要求，不要求配置文本和参考答案完全一致。现代类型检查语法与最终 JavaScript 语法不是同一层。','当前 target 保留了可选链。｜选择支持箭头但尚不支持可选链的目标。｜用生成文件确认配置效果。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'main.ts':'export const read=(value?:{name:string})=>value?.name;'},emissionTests:[{name:'实际输出保留箭头并降级可选链',files:['main.js'],requiredSyntax:{'main.js':['ArrowFunction']},forbiddenSyntax:{'main.js':['QuestionDotToken']}}]}),
 m(3,5,'旧语法目标配合较新 lib','target 为 ES2015，显式 lib 为 ES2022 的组合应如何理解？',['语法按目标转换，类型检查可使用较新 API 声明，运行环境仍须提供 API','配置必然非法','所有较新 API 都会变为 ES2015 实现','输出一定保留全部 ES2022 语法'],'语法支持和标准库能力可以分别配置，但必须与部署环境实际能力相匹配。','两项选项职责不同。｜较新 API 声明可以显式加入。｜兼容能力仍需另行验证。'),
 t(3,6,'为已有 API 提供正确声明','环境已提供 Array.prototype.at，但要求输出语法保留箭头并降级可选链。只编辑 tsconfig，使只读 main.ts 通过检查并输出 main.js。不能改写方法或声称 lib 会补齐它。',
 {'tsconfig.json':'{"compilerOptions":{"target":"ES2015","lib":["ES2015"]},"files":["main.ts"]}'},
 {'tsconfig.json':'{"compilerOptions":{"target":"ES2015","lib":["ES2022"]},"files":["main.ts"]}'},[
 ok('较新数组 API 声明可用','import {last} from "./main";const value:string|undefined=last(["a"]);const n:number|undefined=[1].at(-1);'),
 bad('元素类型不被放宽','import {last} from "./main";last([1]);'),
 ],'显式增加 ES2022 声明后 at 可以参与检查，target 仍负责降低可选链。本题已声明宿主提供 at；其他部署环境需要另行确认。','报错来自 at 的声明缺失。｜保留语法目标，调整 lib。｜输出中的方法调用仍依赖宿主。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'main.ts':'export const last=(values?:readonly string[])=>values?.at(-1);'},emissionTests:[{name:'生成目标语法',files:['main.js'],requiredSyntax:{'main.js':['ArrowFunction']},forbiddenSyntax:{'main.js':['QuestionDotToken']}}],runtime:[{name:'宿主提供 at 时正确处理边界',code:'const {last}=load("main.js");equal(last(),undefined);equal(last([]),undefined);equal(last(["a","b"]),"b");'}]}),
 m(3,7,'类型通过但运行失败','代码调用一个运行环境缺少的方法，添加 lib 后编译成功，下一步应做什么？',['确认宿主支持，或提供兼容实现，或改用受支持的方法','认为错误已彻底修复','再加一个类型断言就会创建方法','关闭 strict 会自动添加方法'],'编译器基于声明推理，不检测部署机器上的真实对象。修复需要发生在环境能力或运行代码层。','声明不是环境探测。｜选择真实兼容策略。｜运行验证要覆盖部署环境。'),
 t(3,8,'迁移到仅有 ES2015 API 的环境','配置只读，lib 为 ES2015。实现 hasLabel，判断只读字符串数组是否包含指定文本，精确匹配且不修改输入。不能添加全局声明或依赖较新的 includes 方法。',
 'export function hasLabel(values:readonly string[],label:string):boolean{return values.includes(label);}',
 'export function hasLabel(values:readonly string[],label:string):boolean{return values.indexOf(label)!==-1;}',[
 ok('只读文本集合可用','import {hasLabel} from "./main";const yes:boolean=hasLabel(["a"],"a");'),
 bad('非文本输入拒绝','import {hasLabel} from "./main";hasLabel([1],"1");'),
 ],'对字符串集合，indexOf 或逐项相等比较都可以满足精确匹配要求。不要把此结论直接推广到包含 NaN 的任意数值集合，其与 includes 的比较语义有差异。','寻找环境已有的查找方法。｜找不到时 indexOf 返回 -1。｜首项位置 0 也表示找到。',{supportFiles:{'tsconfig.json':'{"compilerOptions":{"target":"ES2015","lib":["ES2015"]},"files":["main.ts"]}'},project:{configFile:'tsconfig.json',rootFiles:['main.ts']},runtime:[{name:'首项、空串、缺失及输入不变',code:'const {hasLabel}=load("main.js");const values=Object.freeze(["","Alpha","b"]);equal(hasLabel(values,""),true);equal(hasLabel(values,"Alpha"),true);equal(hasLabel(values,"alpha"),false);equal(hasLabel([],""),false);equal(values,["","Alpha","b"]);'}]}),
 m(3,9,'复测：降低目标能转换一切吗','包含 BigInt 字面量的代码，是否可以只靠降低 target 就适配任意旧引擎？',['不可以，BigInt 字面量有目标要求，不能假设编译器会提供任意旧环境兼容','可以，自动改为普通 number 且精度不变','可以，只要加入 DOM lib','可以，关闭严格检查即可'],'部分语言能力不能简单改写为语义等价的旧语法。目标诊断应结合实际部署约束处理，不能仅通过声明配置假装环境支持。','大整数与普通 number 语义不同。｜查看目标要求。｜不能默认一切都有降级实现。'),
 t(3,10,'复测：大整数目标与声明','宿主支持 ES2020 BigInt。只编辑配置，使只读 addOne 通过检查并生成 main.js，输出保留大整数字面量；不生成声明或映射文件。函数必须保持 bigint 参数和返回契约。',
 {'tsconfig.json':'{"compilerOptions":{"target":"ES2015","lib":["ES2015"]},"files":["main.ts"]}'},
 {'tsconfig.json':'{"compilerOptions":{"target":"ES2020","lib":["ES2020"]},"files":["main.ts"]}'},[
 ok('BigInt 声明和函数契约可用','import {addOne} from "./main";const value:bigint=addOne(BigInt("9007199254740993"));'),
 bad('不能混入普通数字','import {addOne} from "./main";addOne(1);'),
 ],'BigInt 需要适当的目标与声明，并且宿主必须实际支持。本题确认宿主能力后才调整配置；运行测试检查超过安全整数范围的精确结果。','字面量和 BigInt 函数声明都要可用。｜选择 ES2020 或更新目标及对应 lib。｜保持 bigint 运算不转换为 number。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'main.ts':'export function addOne(value:bigint):bigint{return value+1n;}'},emissionTests:[{name:'生成包含大整数字面量的 JavaScript',files:['main.js'],requiredSyntax:{'main.js':['BigIntLiteral']}}],runtime:[{name:'保持大整数精度',code:'const {addOne}=load("main.js");equal(addOne(9007199254740993n),9007199254740994n);equal(addOne(-1n),0n);'}]}),

 m(4,1,'生成与寻找的分工','module 与 moduleResolution 的主要职责如何区分？',['前者参与决定模块输出与解释方式，后者决定导入说明符如何寻找文件或包','前者下载依赖，后者启动服务器','前者只控制缩进，后者只控制类型严格程度','二者是同一个选项的不同拼写'],'两者职责不同但需要兼容。应结合实际运行器或打包器选择配置，而不是只追求诊断消失。','先看生成什么。｜再看导入指向什么。｜运行环境决定组合。'),
 m(4,2,'打包解析不等于直接运行','一个相对导入没有扩展名，在 bundler 解析下通过检查，是否说明生成文件可直接交给 Node ESM 执行？',['不能，打包器和 Node ESM 的解析要求可能不同','能，编译成功证明所有运行器都支持','能，moduleResolution 会自动添加任意需要的扩展名','不能，因为 bundler 模式完全不检查导入'],'检查使用的是某种解析模型。输出能否直接执行，还要满足实际加载器的规则；由打包器接手和直接运行生成文件是不同部署方式。','是谁最终加载文件？｜检查器采用哪种规则？｜不能把一种环境的通过推广到另一种。'),
 m(4,3,'NodeNext 与包类型','在 NodeNext 模式中，邻近 package.json 的 type 字段为什么值得检查？',['它参与决定普通 .ts 对应文件按 ESM 还是 CommonJS 解释和输出','它决定是否允许 number 类型','它自动下载所有类型声明','它只改变 IDE 配色'],'NodeNext 模拟 Node 的模块规则，文件扩展名和包上下文都可能影响模块格式。本节通过实际生成结果观察普通 .ts 文件的差异。','配置之外还有包上下文。｜同一 .ts 内容可能对应不同格式。｜观察生成文件确认。'),
 t(4,4,'修复交给打包器的模块配置','只编辑 tsconfig：main.ts 的输出交给打包器，使用 bundler 解析并保留 ESM export 语法。修复当前不兼容组合，正常生成且只生成 main.js。',
 {'tsconfig.json':'{"compilerOptions":{"module":"CommonJS","moduleResolution":"Bundler"},"files":["main.ts"]}'},
 {'tsconfig.json':'{"compilerOptions":{"module":"ESNext","moduleResolution":"Bundler"},"files":["main.ts"]}'},[
 ok('公开类型保持','import {value} from "./main";const n:number=value;'),
 bad('公开值不是文本','import {value} from "./main";const n:string=value;'),
 ],'ESNext 与 Bundler 是本题可用组合。判题检查实际 ESM 输出，不要求与参考配置逐字相同；保留模块语法的其他兼容配置也可以满足要求。','当前 CommonJS 与 Bundler 不兼容。｜打包器需要保留 ESM 模块语法。｜查看输出中的 export。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'main.ts':'export const value:number=3;'},emissionTests:[{name:'保留 ESM 导出',files:['main.js'],requiredSyntax:{'main.js':['ExportKeyword']}}]}),
 m(4,5,'不要用解析模式掩盖部署问题','准备直接在 Node ESM 执行生成文件，出现相对导入扩展名诊断，改成 Bundler 使诊断消失是否足够？',['不够，应修复导入以满足目标加载器，或明确改为真正经过打包的流程','足够，检查器会替 Node 加载文件','足够，生成目录会自动成为打包产物','不够，因为 Node 永远不能执行 ESM'],'改检查模型可能隐藏真实部署约束。应先明确直接运行还是打包后运行，再修复相应代码和配置。','实际执行流程改变了吗？｜去掉诊断不等于加载成功。｜让检查模型与运行方式一致。'),
 t(4,6,'配置直接运行的 Node ESM 项目','只修改配置，采用与 Node ESM 规则一致的配对 module/moduleResolution。只读 package.json 已声明 type:module，main.ts 使用 ./value.js。只生成 main.js 和 value.js，main 保留 import/export。',
 {'tsconfig.json':'{"compilerOptions":{"module":"NodeNext","moduleResolution":"Bundler"},"files":["main.ts"]}'},
 {'tsconfig.json':'{"compilerOptions":{"module":"NodeNext","moduleResolution":"NodeNext"},"files":["main.ts"]}'},[
 ok('Node ESM 说明符找到源文件','import {result} from "./main.js";const n:number=result;'),
 bad('返回值契约保持','import {result} from "./main.js";const n:string=result;'),
 bad('Node ESM 拒绝省略相对扩展名','import {result} from "./main";void result;',[2835]),
 ],'NodeNext 的模块与解析选项需要配合。源码写 .js 的说明符可以解析到对应 .ts，而生成文件中的说明符仍适合直接运行。','先修复两项选项的组合。｜package.json 确定 ESM 上下文。｜解析源文件与输出说明符不是同一操作。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'package.json':'{"type":"module"}','main.ts':'import {value} from "./value.js";export const result=value+1;','value.ts':'export const value=2;'},emissionTests:[{name:'输出 ESM 文件图',files:['main.js','value.js'],requiredSyntax:{'main.js':['ImportDeclaration','ExportKeyword']}}]}),
 m(4,7,'路径别名的边界','为 @shared/* 设置 paths 后类型检查通过，普通 tsc 输出是否因此保证真实加载器认识这个别名？',['不保证，paths 主要描述解析映射，运行器或打包器仍需要相应配置或合法路径','保证，paths 自动安装加载器','保证，所有说明符都会被改为绝对磁盘路径','保证，别名从此成为 JavaScript 标准语法'],'类型解析映射与运行加载是两层能力。应确认生成说明符和运行工具配置，而不是仅观察编辑器能否跳转。','编辑器跳转说明了哪一层？｜检查实际输出。｜加载器也必须理解路径。'),
 t(4,8,'迁移：修复 ESM 相对导入','配置和包类型只读，目标是 Node ESM。修复 main.ts 的导入说明符，继续导出 total:number，值为 value+2。保持 value.ts 依赖，不关闭检查。',
 'import {value} from "./value";export const total=value+2;',
 'import {value} from "./value.js";export const total=value+2;',[
 ok('导出数值','import {total} from "./main.js";const n:number=total;'),
 bad('导出不是字符串','import {total} from "./main.js";const n:string=total;'),
 ],'在这种直接运行 ESM 的流程里，源码导入使用目标 .js 扩展名；TypeScript 可以找到对应 .ts 源文件。运行测试还验证实际计算，避免只删除导入绕过错误。','诊断来自目标解析规则。｜输出文件扩展名是什么？｜把说明符改为 ./value.js。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts'],requiredFiles:['value.ts']},supportFiles:{'tsconfig.json':'{"compilerOptions":{"module":"NodeNext","moduleResolution":"NodeNext"},"files":["main.ts"]}','package.json':'{"type":"module"}','value.ts':'export const value=5;'},emissionTests:[{name:'保留模块依赖输出',files:['main.js','value.js'],requiredSyntax:{'main.js':['ImportDeclaration','ExportKeyword']}}],runtime:[{name:'导入后正确计算',code:'equal(load("main.js").total,7);'}]}),
 m(4,9,'复测：module 不等于 moduleResolution','把 moduleResolution 改成 NodeNext，却保留不兼容的 module 设置，出现配置诊断时应如何处理？',['依据实际运行环境配置兼容组合，并检查包类型与导入方式','删除全部类型标注','关闭 strictNullChecks','只修改输出目录就一定能修复'],'配置诊断需要在配置层处理。随后还要确认模块格式与运行环境一致，不应以修改无关类型选项掩盖原因。','诊断指向哪一层？｜两项模式必须兼容。｜再检查包和路径规则。'),
 t(4,10,'复测：按包上下文生成 CommonJS','只编辑 tsconfig，按 Node 的包类型规则决定输出格式；package.json 的 type 为 commonjs。只生成 main.js，输出应转换导出，不保留 ESM export 语法。只读 main.ts 的 value 保持 number。测试还会把包类型切换为 module，此时必须生成 ESM 导出。',
 {'tsconfig.json':'{"compilerOptions":{"module":"ESNext","moduleResolution":"Bundler"},"files":["main.ts"]}'},
 {'tsconfig.json':'{"compilerOptions":{"module":"NodeNext","moduleResolution":"NodeNext"},"files":["main.ts"]}'},[
 ok('公开值契约','import {value} from "./main";const n:number=value;'),
 bad('数值不接受文本使用','import {value} from "./main";const n:string=value;'),
 ],'NodeNext 并不意味着每个普通 .ts 文件都输出为 ESM。在 CommonJS 包上下文中，这段导出会转成相应 CommonJS 形式；检查真实输出比只看配置名字更可靠。','检查 package.json 的 type。｜选择符合任务的配对模式。｜生成文件不应继续带 export 关键字。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'package.json':'{"type":"commonjs"}','main.ts':'export const value:number=7;'},emissionTests:[{name:'按 CommonJS 上下文转换导出',files:['main.js'],requiredSyntax:{'main.js':['CallExpression']},forbiddenSyntax:{'main.js':['ExportKeyword','ExportDeclaration','ImportDeclaration']}},{name:'包类型改变时改为 ESM 输出',supportFiles:{'package.json':'{"type":"module"}'},files:['main.js'],requiredSyntax:{'main.js':['ExportKeyword']}}]}),

 m(5,1,'有文件不等于检查通过','构建目录里出现 main.js，能否单凭这一点证明 TypeScript 类型检查成功？',['不能，有些配置允许存在错误时仍输出，还可能残留旧文件','能，TypeScript 永远不会输出带类型错误的代码','能，只要文件扩展名是 js','不能，因为 TypeScript 从来不会生成 JavaScript'],'应检查本次检查结果和构建退出状态，输出存在不是通过证据。旧构建产物也可能造成误判。','先确认是否本次生成。｜错误是否阻止输出取决于配置。｜检查诊断和退出状态。'),
 m(5,2,'noEmit 的含义','开启 noEmit 后，哪种描述正确？',['编译器仍可检查项目，但不写出 JavaScript、声明和映射等编译产物','所有类型错误被自动忽略','只禁止 JavaScript，声明仍无条件生成','源文件会从磁盘删除'],'noEmit 常用于由其他工具负责转译的流程。它约束输出，不等于 noCheck，也不表示业务代码经过运行验证。','区分检查与写文件。｜不输出仍可报错。｜运行验证是另一层。'),
 m(5,3,'仅声明构建','希望只生成类型声明供另一个构建流程使用，应如何组合选项？',['启用 declaration 与 emitDeclarationOnly，并确保没有 noEmit 阻止输出','仅开启 noEmit','仅把 target 改为 ESNext','关闭 strict 就会只输出声明'],'declaration 开启声明生成，emitDeclarationOnly 限制只输出声明。noEmit 会阻止产物生成，应检查继承配置是否有覆盖。','先允许生成声明。｜再限制输出类别。｜排查阻止全部输出的选项。'),
 t(5,4,'把独立检查步骤设为不输出','只编辑 tsconfig，main.ts 仍是唯一入口并接受严格检查，但本步骤不生成任何文件。其他工具负责 JavaScript 构建，不要排除源文件来假装完成。',
 {'tsconfig.json':'{"compilerOptions":{"strict":true},"files":["main.ts"]}'},
 {'tsconfig.json':'{"compilerOptions":{"strict":true,"noEmit":true},"files":["main.ts"]}'},[
 ok('项目导出继续受检查','import {value} from "./main";const n:number=value;'),
 bad('空值检查仍生效','const value:number=undefined;'),
 ],'noEmit 保留检查但取消写出。入口检查防止用空项目替代任务；负例确认严格检查没有被关闭。','项目仍需包含 main.ts。｜设置 noEmit。｜不要通过排除全部文件达到零输出。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'main.ts':'export const value:number=1;'},emissionTests:[{name:'检查步骤不写任何产物',files:[]}]}),
 m(5,5,'声明文件能运行吗','库只发布 .d.ts，却要求消费者调用其中声明的函数，为什么可能失败？',['声明只描述契约，还需要真实实现或由宿主提供实现','声明文件里的函数体总会自动生成','导入类型会自动下载实现','声明会把调用转换成空操作'],'类型入口与运行入口必须分别成立。仅类型工具库可以只提供类型；提供运行函数的库则需要相应实现。','声明有没有函数体？｜消费者是否需要运行行为？｜类型入口不能代替运行入口。'),
 t(5,6,'生成仅类型分发包','只编辑 tsconfig，为只读 main.ts 生成 types/main.d.ts，且不生成 JavaScript 或其他文件。保留 main.ts 入口和导出契约。',
 {'tsconfig.json':'{"compilerOptions":{"declaration":true,"outDir":"types"},"files":["main.ts"]}'},
 {'tsconfig.json':'{"compilerOptions":{"declaration":true,"emitDeclarationOnly":true,"outDir":"types"},"files":["main.ts"]}'},[
 ok('公开模型可用','import type {Item} from "./main";const item:Item={id:"a",done:false};'),
 bad('模型必需字段保留','import type {Item} from "./main";const item:Item={id:"a"};'),
 ],'声明输出保留公共类型契约，不包含实现执行过程。此题只检查类型产物；实际发布运行库时还需要另外提供对应实现。','当前还生成了 JavaScript。｜限制为只输出声明。｜查看 types/main.d.ts。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'main.ts':'export interface Item{id:string;done:boolean}\nexport function label(item:Item):string{return item.id;}'},emissionTests:[{name:'只生成公开声明',files:['types/main.d.ts'],requiredSyntax:{'types/main.d.ts':['InterfaceDeclaration','FunctionDeclaration']},forbiddenSyntax:{'types/main.d.ts':['Block']}}]}),
 m(5,7,'noEmitOnError 与 noEmit','noEmitOnError:true 和 noEmit:true 的关键区别是什么？',['前者在有编译错误时阻止输出，后者不论是否有错误都不输出','前者关闭类型检查，后者打开检查','前者只适用于 CSS','二者在所有情况下完全等价'],'是否存在错误和是否允许输出是两个维度。需要用正常和错误输入分别验证配置，不能只试一个成功案例。','无错误时会发生什么？｜有错误时会发生什么？｜分别检查两个分支。'),
 t(5,8,'迁移：出错时阻止生成','只编辑配置：正常 main.ts 应生成 main.js；若同一源文件出现类型错误，则不能生成任何文件。测试会替换只读源文件引入 number 赋值错误，不能使用 noEmit 禁掉全部输出。',
 {'tsconfig.json':'{"compilerOptions":{"noEmitOnError":false},"files":["main.ts"]}'},
 {'tsconfig.json':'{"compilerOptions":{"noEmitOnError":true},"files":["main.ts"]}'},[
 ok('正常代码通过','import {value} from "./main";const n:number=value;'),
 bad('错误使用受检查','import {value} from "./main";const n:string=value;'),
 ],'正常案例验证构建确实工作，错误变体验证失败时停止写出。noEmit 会让正常案例也没有产物，因此不满足需求。','必须同时满足成功和失败两种行为。｜使用条件性阻止输出的选项。｜查看错误诊断及输出集合。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'main.ts':'export const value:number=1;'},emissionTests:[{name:'正常项目生成 JavaScript',files:['main.js'],emitSkipped:false},{name:'类型错误阻止本次输出',supportFiles:{'main.ts':'export const value:number="wrong";'},diagnosticCodes:[2322],files:[],emitSkipped:true}]}),
 m(5,9,'复测：失败后的旧产物','启用 noEmitOnError 后一次检查失败，输出目录还留着上次成功构建的文件，这说明什么？',['阻止本次输出不等于清理历史产物，构建流程仍需管理旧文件','noEmitOnError 一定失效','历史文件已经自动通过本次检查','旧文件会被 TypeScript 自动标记为不可执行'],'noEmitOnError 控制本次生成，不保证删除此前文件。发布流程应避免把残留文件误认为当前成功构建结果。','文件是什么时候生成的？｜停止输出与清理目录不同。｜发布时依据本次构建状态。'),
 t(5,10,'复测：同时交付实现与声明','只编辑配置，生成 build/main.js 与 build/main.d.ts，除此之外没有其他产物；公开函数 double 仍需接受 number 并返回 number。当前配置只输出声明，请修复。',
 {'tsconfig.json':'{"compilerOptions":{"declaration":true,"emitDeclarationOnly":true,"outDir":"build"},"files":["main.ts"]}'},
 {'tsconfig.json':'{"compilerOptions":{"declaration":true,"outDir":"build"},"files":["main.ts"]}'},[
 ok('公开调用有效','import {double} from "./main";const n:number=double(2);'),
 bad('公开参数受约束','import {double} from "./main";double("2");'),
 ],'普通 declaration 构建可以同时生成实现和声明；emitDeclarationOnly 会取消实现输出。生成的声明不包含函数体，而 JavaScript 必须保留实际计算。','当前哪一项禁止了实现输出？｜保留 declaration，取消仅声明限制。｜对比两个文件的函数体。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'main.ts':'export function double(value:number):number{return value*2;}'},emissionTests:[{name:'实现与声明成对生成',files:['build/main.js','build/main.d.ts'],requiredSyntax:{'build/main.js':['ReturnStatement'],'build/main.d.ts':['FunctionDeclaration']},forbiddenSyntax:{'build/main.d.ts':['Block']}}],runtime:[{name:'实现保持计算行为',code:'const {double}=load("main.js");equal(double(0),0);equal(double(-3),-6);equal(double(1.5),3);'}]}),

 m(6,1,'转译成功的证据范围','某工具能把 const count:number="3" 转换成 JavaScript，这说明了什么？',['只说明该转换流程接受并处理了源码，不能证明它完成了语义类型检查','说明字符串已经被转换成数字','说明所有 TypeScript 错误都是可忽略的','说明 count 在运行时一定是 number'],'去掉类型标注不一定伴随语义检查。应确认实际使用的工具链是否另有检查步骤，并观察其结果。','类型标注会在运行时存在吗？｜转换与检查是不同工作。｜确认真正执行语义检查的步骤。'),
 m(6,2,'检查、Lint、打包','以下哪种理解更适合设计构建流程？',['明确各步骤职责：类型检查验证静态契约，Lint 按规则发现问题，打包组织产物，并另做必要运行测试','打包成功必然意味着所有 Lint 规则通过','Lint 默认等价于完整 TypeScript 类型检查','类型检查通过就不需要测试业务行为'],'工具能力依赖具体配置，不应假定一个成功状态覆盖全部质量要求。流程应显式包含需要的验证并处理失败。','确认每个工具实际做了什么。｜检查通过不代表所有业务规则成立。｜失败结果要影响后续发布。'),
 m(6,3,'并行启动检查与发布','CI 同时启动类型检查和发布任务，但发布不等待检查结果，主要问题是什么？',['可能在检查失败前已经发布，应让发布依赖必须通过的检查','并行一定会改变 TypeScript 类型系统','所有并行任务都必须禁止','发布会自动读取检查结果，不必建立依赖'],'可并行执行相互独立的验证，但发布必须等待所需验证成功。依赖关系比单纯启动顺序更重要。','谁等待谁？｜检查尚未结束时能否发布？｜给发布建立明确成功依赖。'),
 t(6,4,'修复被转译掩盖的返回类型错误','formatTotal 接受 number，返回形如 total=12 的字符串。当前实现可能被仅转译工具接受，但返回标注与实际值矛盾。修复公开契约和实现，保持原格式；不能通过断言绕过检查。',
 'export function formatTotal(total:number):number{return `total=${total}`;}',
 'export function formatTotal(total:number):string{return `total=${total}`;}',[
 ok('返回文本契约','import {formatTotal} from "./main";const text:string=formatTotal(12);'),
 bad('不能冒充数值返回','import {formatTotal} from "./main";const value:number=formatTotal(12);'),
 bad('输入仍须是数字','import {formatTotal} from "./main";formatTotal("12");'),
 ],'应让类型标注反映真实接口，而不是改变业务需求迎合错误标注。仅擦除标注不会修复契约；语义检查与运行测试分别验证接口和格式。','实际拼接结果是什么类型？｜需求明确要求字符串。｜修改返回契约后验证输出格式。',{runtime:[{name:'保留输出格式和数值内容',code:'const {formatTotal}=load("main.js");equal(formatTotal(12),"total=12");equal(formatTotal(0),"total=0");equal(formatTotal(-2.5),"total=-2.5");'}]}),
 m(6,5,'tsc 的普通多文件输出','普通 ES 模块项目使用 tsc 并指定 outDir，是否意味着依赖已打包进一个可直接发布的单文件？',['不意味着，通常仍按模块生成文件，打包、资源处理等需由实际流程承担','意味着，outDir 自动打开单文件打包','意味着，所有 npm 依赖自动嵌入','不意味着，因为 tsc 永远不能生成文件'],'编译输出目录不等于打包结果。不同配置具有不同输出行为，不能把普通逐模块编译误认成应用打包。','目录与单文件是不同概念。｜查看生成文件图。｜确认谁处理依赖和资源。'),
 t(6,6,'让构建等待类型检查','实现 buildAfterCheck(check:()=>Promise<void>,bundle:()=>Promise<string>):Promise<string>。先等待 check 成功，再且仅调用一次 bundle 并返回其结果；任一步拒绝都原样传播，检查失败不得启动 bundle。',
 'export async function buildAfterCheck(check:()=>Promise<void>,bundle:()=>Promise<string>):Promise<string>{check();return bundle();}',
 'export async function buildAfterCheck(check:()=>Promise<void>,bundle:()=>Promise<string>):Promise<string>{await check();return bundle();}',[
 ok('异步结果契约','import {buildAfterCheck} from "./main";const value:Promise<string>=buildAfterCheck(async()=>{},async()=>"artifact");'),
 bad('打包结果必须是文本标识','import {buildAfterCheck} from "./main";buildAfterCheck(async()=>{},async()=>1);'),
 ],'调用检查函数不等于等待检查完成。await 建立检查成功后才能打包的依赖；不吞掉异常才能让上层流程正确失败。此题用回调模拟工具步骤，不会实际执行 shell 或发布。','观察 check 返回的 Promise。｜检查完成之前不能调用 bundle。｜让拒绝沿返回 Promise 传播。',{runtime:[{name:'检查完成之前不启动构建',code:'const {buildAfterCheck}=load("main.js");let release;const gate=new Promise(r=>release=r);const events=[];const pending=buildAfterCheck(async()=>{events.push("check:start");await gate;events.push("check:end");},async()=>{events.push("bundle");return "dist";});await Promise.resolve();equal(events,["check:start"]);release();equal(await pending,"dist");equal(events,["check:start","check:end","bundle"]);'},{name:'失败阻止构建并保留原错误',code:'const {buildAfterCheck}=load("main.js");const failure={stage:"check"};let calls=0;let caught;try{await buildAfterCheck(async()=>{throw failure;},async()=>{calls++;return "bad";});}catch(error){caught=error;}check(caught===failure);equal(calls,0);const bundleError={stage:"bundle"};try{await buildAfterCheck(async()=>{},async()=>{throw bundleError;});throw Error("missing rejection");}catch(error){check(error===bundleError);}'}]}),
 m(6,7,'单文件转换的限制','开启 isolatedModules 的主要用途更接近哪一项？',['发现某些不适合单文件转换流程的写法，不等于替代全部语义检查或自动打包','让所有文件自动运行在独立进程','关闭跨文件导入','自动把全部对象冻结'],'单文件转换器缺少完整程序信息，某些写法需要显式表达。该选项提供相关约束，不能代替类型检查、运行测试或构建工具。','一个转换器能看到多少文件信息？｜类型和值是否需要明确区分？｜选项不会执行构建流程。'),
 t(6,8,'迁移到单文件转换流程','项目开启 isolatedModules 与 verbatimModuleSyntax。修复 main.ts 的统一出口：从 model.ts 仅重新导出类型 Item，从 runtime.ts 重新导出值 createItem。保留真实函数出口，不把类型变成运行值。',
 'export {Item} from "./model";export {createItem} from "./runtime";',
 'export type {Item} from "./model";export {createItem} from "./runtime";',[
 ok('类型与值分别可用','import {createItem} from "./main";import type {Item} from "./main";const item:Item=createItem("a");'),
 bad('类型不能当构造函数','import type {Item} from "./main";new Item();',[2693]),
 bad('真实函数参数受检查','import {createItem} from "./main";createItem(1);'),
 ],'显式 export type 告诉转换器该出口应被擦除。实际函数仍需普通值导出，否则消费者没有运行实现。','区分 Item 与 createItem。｜只给类型出口加 type。｜保留运行出口供消费者调用。',{compilerOptions:{isolatedModules:true,verbatimModuleSyntax:true},supportFiles:{'model.ts':'export interface Item{id:string}','runtime.ts':'import type {Item} from "./model";export function createItem(id:string):Item{return {id};}'},runtime:[{name:'出口确实提供运行实现',code:'const {createItem}=load("main.js");equal(createItem("a"),{id:"a"});equal(createItem(""),{id:""});'}]}),
 m(6,9,'复测：全绿仍可能有业务错误','类型检查和打包均成功，分页函数却把 11 条数据、每页 10 条算成 1 页，缺失了哪类证据？',['针对业务规则与边界值的运行测试','只能通过增加 lib 修复','说明 TypeScript 的 number 类型完全失效','应删除全部类型标注'],'类型检查可以证明使用满足静态契约，但 number 类型本身不会表达“必须向上取整”这样的业务要求。运行测试应覆盖边界。','返回值确实仍是 number。｜错误发生在计算规则。｜测试整除和有余数的情况。'),
 t(6,10,'复测：类型正确但业务错误','实现 pageCount(total:number,size:number):number。total 必须是非负安全整数，size 必须是正安全整数，否则抛 RangeError。合法输入返回向上取整的页数；total 为 0 返回 0。当前代码类型正确但业务错误。',
 'export function pageCount(total:number,size:number):number{return Math.floor(total/size);}',
 'export function pageCount(total:number,size:number):number{if(!Number.isSafeInteger(total)||total<0||!Number.isSafeInteger(size)||size<=0)throw new RangeError("invalid pagination");return Math.ceil(total/size);}',[
 ok('数值接口保持','import {pageCount} from "./main";const pages:number=pageCount(11,10);'),
 bad('拒绝文本参数','import {pageCount} from "./main";pageCount("11",10);'),
 ],'类型检查无法单凭 number 判断安全整数、范围和取整业务规则。先验证参数，再计算；运行测试覆盖合法边界与非法值。','先识别不能参与分页的输入。｜使用安全整数与范围检查。｜有余数时需要额外一页。',{runtime:[{name:'页数边界',code:'const {pageCount}=load("main.js");equal(pageCount(0,10),0);equal(pageCount(10,10),1);equal(pageCount(11,10),2);equal(pageCount(1,100),1);equal(pageCount(Number.MAX_SAFE_INTEGER,1),Number.MAX_SAFE_INTEGER);'},{name:'非法输入拒绝',code:'const {pageCount}=load("main.js");for(const [total,size] of [[-1,10],[1.5,10],[NaN,10],[Infinity,10],[1,0],[1,-1],[1,0.5],[1,Infinity],[Number.MAX_SAFE_INTEGER+1,1],[1,Number.MAX_SAFE_INTEGER+1]]){let error;try{pageCount(total,size);}catch(e){error=e;}check(error&&error.name==="RangeError");}'}]}),

 m(7,1,'extends 与 references','两者的职责如何区分？',['extends 复用配置，references 描述项目依赖边界；共享配置并不自动建立项目依赖','二者都只控制代码缩进','extends 自动把所有项目打包成一个文件','references 会把依赖的所有选项复制到当前项目'],'配置继承和依赖图是两件事。多项目可以共享基础检查选项，同时保留各自环境和输出设置。','一个解决配置复用。｜另一个表达项目关系。｜不能把共享选项当成依赖图。'),
 m(7,2,'复用配置仍要匹配环境','浏览器应用和无 DOM 的服务端库共享基础配置时，更合理的做法是什么？',['共享通用检查规则，各项目分别设置真实环境需要的 lib 等选项','基础配置无条件加入所有宿主全局','全部项目都关闭 strict','把服务端声明成浏览器即可获得 DOM'],'共享配置应减少重复而非抹平环境差异。声明应描述真实能力，否则静态通过仍可能在运行时失败。','哪些规则通用？｜哪些全局只属于某个环境？｜环境配置放到合适层级。'),
 m(7,3,'引用项目的构建边界','消费者引用一个 composite 项目时，直接检查消费者和按依赖顺序构建整个项目图是否相同？',['不同，消费者可能需要依赖项目已有的声明产物；构建模式负责组织依赖构建','相同，普通检查一定自动生成所有依赖产物','相同，references 会删除依赖边界','不同，因为引用项目永远不能被构建'],'项目引用让依赖拥有独立构建边界。缺少所需产物时应构建依赖，例如按项目配置使用构建模式，而不是假定一次消费者检查会代劳。','先区分消费产物与构建产物。｜诊断可能提示依赖尚未构建。｜按依赖顺序构建项目图。'),
 t(7,4,'继承严格规则并修复覆盖','只编辑 tsconfig.json，继续 extends ./base.json 并保留 main.ts 单入口。移除或修复关闭严格空值检查的覆盖，让 base 提供的 strict 规则生效；本步骤不输出文件。',
 {'tsconfig.json':'{"extends":"./base.json","compilerOptions":{"strictNullChecks":false},"files":["main.ts"]}'},
 {'tsconfig.json':'{"extends":"./base.json","files":["main.ts"]}'},[
 ok('正常契约可用','import {value} from "./main";const n:number=value;'),
 bad('继承空值检查生效','const n:number=undefined;'),
 ],'子配置可以覆盖基础配置的选项。看到 extends 不等于所有基础规则都原样有效，需要检查覆盖项。输出测试还确认继承的 noEmit 生效。','基础配置已经开启 strict。｜找到子配置中相反的覆盖。｜保留继承以复用无输出设置。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts']},supportFiles:{'base.json':'{"compilerOptions":{"strict":true,"noEmit":true}}','main.ts':'export const value:number=1;'},emissionTests:[{name:'继承检查步骤不输出',files:[]}]}),
 m(7,5,'composite 的用途','为什么被引用项目需要满足 composite 等约束？',['让编译器可以可靠地描述项目边界与产物，并组织项目依赖构建','为了把所有类型改为 any','为了禁止公开类型','为了让项目永远不输出声明'],'项目引用需要可预测的边界与输出。composite 对文件范围和声明等提出约束，不能仅把它当作无影响的标记。','依赖项目有自己的产物。｜构建器需要知道边界。｜选项带来实际约束。'),
 t(7,6,'修复不满足引用要求的依赖配置','仅修改 lib/tsconfig.json，使它可被根项目引用。保持 files:["value.ts"] 与 outDir:"dist"，启用 composite。练习已提供上次构建的 lib/dist/value.d.ts；这里检查消费者，不自动重建依赖。',
 {'lib/tsconfig.json':'{"compilerOptions":{"outDir":"dist"},"files":["value.ts"]}'},
 {'lib/tsconfig.json':'{"compilerOptions":{"composite":true,"outDir":"dist"},"files":["value.ts"]}'},[
 ok('消费者取得公开契约','import {result} from "./main";const n:number=result;'),
 bad('消费者契约不被放宽','import {result} from "./main";const n:string=result;'),
 ],'真实引用检查会拒绝缺少 composite 的依赖配置。已有声明供消费者读取，并不意味着此练习执行了依赖构建；缺失声明时应在实际工程构建依赖。','根配置已经引用 lib。｜诊断指出依赖配置缺少的选项。｜保留声明路径与入口。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts'],referenceFiles:['lib/tsconfig.json'],requiredFiles:['lib/dist/value.d.ts'],excludedFiles:['lib/value.ts']},supportFiles:{'tsconfig.json':'{"files":["main.ts"],"references":[{"path":"./lib"}]}','main.ts':'import {value} from "./lib/value";export const result:number=value;','lib/value.ts':'export const value:number=1;','lib/dist/value.d.ts':'export declare const value:number;'}}),
 m(7,7,'不存在的引用声明','报错提示某个输出声明尚未从源文件构建，最贴近问题根源的处理是什么？',['检查依赖项目配置并生成匹配的声明产物，确认消费者引用的路径','直接删掉所有 references 并声称边界不变','增加 DOM lib','关闭格式检查'],'应核对依赖构建状态、输出位置和项目路径。移除引用可能改为直接检查源码，改变边界，而不是修复原有构建关系。','错误指向输入还是依赖产物？｜确认产物位置。｜保持需要的项目边界。'),
 t(7,8,'迁移：修复消费者引用路径','只编辑根 tsconfig，把错误引用路径修复为提供的 lib 项目，保持 main.ts 单入口。消费者应读取已构建的 lib/dist/value.d.ts，不把 lib/value.ts 直接并入当前检查。',
 {'tsconfig.json':'{"files":["main.ts"],"references":[{"path":"./missing"}]}'},
 {'tsconfig.json':'{"files":["main.ts"],"references":[{"path":"./lib"}]}'},[
 ok('消费者公开结果','import {result} from "./main";const n:number=result;'),
 bad('公开结果不是字符串','import {result} from "./main";const n:string=result;'),
 ],'修复引用路径后，编译器可以找到依赖配置和声明产物。判题检查直接引用与实际文件图，删除 references 不能替代修复。','哪个目录实际存在配置？｜引用应指向 lib。｜检查程序读取声明而不是依赖源码。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts'],referenceFiles:['lib/tsconfig.json'],requiredFiles:['lib/dist/value.d.ts'],excludedFiles:['lib/value.ts']},supportFiles:{'main.ts':'import {value} from "./lib/value";export const result:number=value;','lib/tsconfig.json':'{"compilerOptions":{"composite":true,"outDir":"dist"},"files":["value.ts"]}','lib/value.ts':'export const value:number=1;','lib/dist/value.d.ts':'export declare const value:number;'}}),
 m(7,9,'复测：references 会继承吗','基础配置包含 references，子配置只有 extends。是否可以据此认为子项目拥有相同的直接引用？',['不可以，references 不通过 extends 继承，需要在项目中明确声明','可以，全部配置属性都会深度合并','可以，源文件同名就自动引用','不可以，因为 extends 从不继承任何选项'],'references 是配置继承中的特殊项，不会通过 extends 继承。应检查最终项目关系，而不只是看到基础文件里存在引用。','并非每个属性都按同一方式继承。｜项目关系应在当前项目明确。｜查看最终引用集合。'),
 t(7,10,'复测：继承规则后补回项目引用','根 tsconfig 继承 base.json，但没有实际建立对 lib 的直接引用。保持继承和 main.ts 入口，补充引用，使消费者读取已有声明产物。不能删除项目边界。',
 {'tsconfig.json':'{"extends":"./base.json","files":["main.ts"]}'},
 {'tsconfig.json':'{"extends":"./base.json","files":["main.ts"],"references":[{"path":"./lib"}]}'},[
 ok('正常消费者','import {result} from "./main";const n:number=result;'),
 bad('严格空值规则保留','const value:number=undefined;'),
 ],'基础规则可以继承，直接项目引用需要另行声明。这里检查最终引用集合和依赖声明是否进入程序，避免把未报类型错误认为已建立引用。','查看当前配置实际 references。｜extends 不会带入基础文件的引用。｜显式增加 lib 引用。',{project:{configFile:'tsconfig.json',rootFiles:['main.ts'],referenceFiles:['lib/tsconfig.json'],requiredFiles:['lib/dist/value.d.ts'],excludedFiles:['lib/value.ts']},supportFiles:{'base.json':'{"compilerOptions":{"strict":true},"references":[{"path":"./lib"}]}','main.ts':'import {value} from "./lib/value";export const result:number=value;','lib/tsconfig.json':'{"compilerOptions":{"composite":true,"outDir":"dist"},"files":["value.ts"]}','lib/value.ts':'export const value:number=1;','lib/dist/value.d.ts':'export declare const value:number;'}}),

 m(8,1,'先确认正在检查什么','编辑器提示与 CI 不同，开始排查时哪组信息最有价值？',['双方使用的 TypeScript 版本、实际配置、文件范围与依赖版本','先把所有 strict 选项关闭','先给全部表达式加断言','只比较主题和字体'],'不同版本、配置和依赖可能产生不同诊断。应先复现同一检查上下文，再判断代码或环境的具体差异。','检查条件是否一致？｜确认实际读取的配置和文件。｜再根据诊断修复根因。'),
 m(8,2,'排查模块找不到','遇到找不到模块或类型声明的错误，更合理的调查顺序是什么？',['核对说明符、文件与包是否存在、解析模式及包的类型入口','把所有导入都改成 any','关闭所有运行测试','增加与项目无关的 DOM 声明'],'模块解析错误需要沿真实寻找路径排查。类型入口、包导出和解析模式都可能参与，不能用无关选项代替证据。','错误在寻找哪个模块？｜对应文件和入口在哪里？｜再检查解析规则。'),
 m(8,3,'skipLibCheck 的边界','打开 skipLibCheck 后库声明内部的错误不再报告，是否证明库声明已被修复？',['没有，只是跳过了部分声明检查，声明仍会影响消费者类型','证明所有声明都正确','声明文件完全不再参与类型推断','库的 JavaScript 会自动改正'],'跳过声明检查与修复声明不同。是否采用该选项需要理解成本，但不能把被隐藏的错误当作已消失的契约问题。','报错是否只是不再检查？｜消费者仍使用哪些类型？｜区分跳过检查与修复内容。'),
 t(8,4,'找回被配置漏掉的应用入口','只编辑 tsconfig。真实应用入口是 src/app.ts，应包含其依赖 src/model.ts；tools/scratch.ts 是无关临时文件，不应成为入口。当前配置只检查临时文件。修复入口范围，不关闭严格检查。',
 {'tsconfig.json':'{"compilerOptions":{"strict":true},"files":["tools/scratch.ts"]}'},
 {'tsconfig.json':'{"compilerOptions":{"strict":true},"files":["src/app.ts"]}'},[
 ok('真实入口导出可用','import {label} from "./src/app";const text:string=label;'),
 bad('严格空值检查不被关闭','const value:string=undefined;'),
 ],'先确认被检查的是正确项目入口。依赖通过 import 带入，不必把所有文件都列成入口；临时文件不能代表应用的检查结果。','查看 files 当前指向谁。｜应用实际入口在 src/app.ts。｜确认依赖进入且临时文件排除。',{project:{configFile:'tsconfig.json',rootFiles:['src/app.ts'],requiredFiles:['src/model.ts'],excludedFiles:['tools/scratch.ts']},supportFiles:{'src/app.ts':'import type {Item} from "./model";const item:Item={id:"a"};export const label=item.id;','src/model.ts':'export interface Item{id:string}','tools/scratch.ts':'export const unfinished:number="later";'}}),
 m(8,5,'声明与真实实现不一致','类型声明说函数返回 number，但实际 JavaScript 在未找到时返回 undefined，正确方向是什么？',['根据真实契约修正声明并让调用者处理缺失，必要时同时修复实现','加一个 number 断言会改变实际返回值','把 lib 改成 ESNext 就会产生数字','只要编译成功便无须检查实现'],'声明不是运行时转换。应核对实现与文档，修复契约，并测试缺失等分支；只调整消费者断言可能扩大问题。','看真实返回分支。｜让声明描述它们。｜调用处也要处理缺失。'),
 t(8,6,'修复供应库的过度承诺','只编辑 vendor.d.ts。真实 vendor.js 的 parseCount 接受 string；仅全由十进制数字组成时返回数值，否则返回 undefined。声明必须如实表达；不要更改实现或用 any。',
 {'vendor.d.ts':'export function parseCount(text:string):number;'},
 {'vendor.d.ts':'export function parseCount(text:string):number|undefined;'},[
 ok('缺失分支可表达','import {parseCount} from "./vendor";const value:number|undefined=parseCount("bad");'),
 bad('调用者必须处理缺失','import {parseCount} from "./vendor";const value:number=parseCount("bad");'),
 bad('库不接受数字参数','import {parseCount} from "./vendor";parseCount(3);'),
 ],'初始声明本身可以通过检查，但它对运行结果作了过度承诺。反例要求消费者处理 undefined，运行测试确认声明所描述的实际分支。','阅读只读实现的返回分支。｜不是所有输入都返回 number。｜返回联合类型并保留输入约束。',{supportFiles:{'vendor.js':'export function parseCount(text){return /^[0-9]+$/.test(text)?Number(text):undefined;}'},runtime:[{name:'核对供应库真实行为',code:'const {parseCount}=load("vendor.js");equal(parseCount("0"),0);equal(parseCount("12"),12);equal(parseCount(""),undefined);equal(parseCount("12x"),undefined);equal(parseCount("-1"),undefined);'}]}),
 m(8,7,'同名类型却不兼容','两个目录都有同名 Item，编辑器显示其 id 类型不同，应优先核查什么？',['实际导入路径、别名映射和读取到的声明文件，而不只看类型名称','同名类型必然完全相同','把所有 id 改为 any','只修改编译器输出目录'],'同名不代表同一来源或相同结构。错误的路径映射、旧声明入口可能让消费者使用另一份契约，需要沿解析结果定位。','Item 来自哪个文件？｜是否命中了旧目录？｜修复来源而非盲目放宽类型。'),
 t(8,8,'迁移：纠正指向旧模型的别名','只编辑 tsconfig，@model 应解析 current/model.ts，而非 archive/model.ts。保持 src/main.ts 单入口、严格检查和 noEmit。当前应用需要字符串 id；不要修改只读模型或应用。此题只验证类型解析，别名运行加载仍需工具支持。',
 {'tsconfig.json':'{"compilerOptions":{"strict":true,"noEmit":true,"paths":{"@model":["./archive/model.ts"]}},"files":["src/main.ts"]}'},
 {'tsconfig.json':'{"compilerOptions":{"strict":true,"noEmit":true,"paths":{"@model":["./current/model.ts"]}},"files":["src/main.ts"]}'},[
 ok('应用使用当前模型','import type {Item} from "@model";const item:Item={id:"a",active:true};'),
 bad('不再接受旧版数值 id','import type {Item} from "@model";const item:Item={id:1,active:true};'),
 ],'别名名称没变不代表来源正确。实际文件图要求 current 进入且 archive 不进入；本题不声称 paths 会重写运行说明符。','比较两份模型的 id。｜修正 paths 的目标文件。｜查看实际纳入的模型。',{project:{configFile:'tsconfig.json',rootFiles:['src/main.ts'],requiredFiles:['current/model.ts'],excludedFiles:['archive/model.ts']},supportFiles:{'src/main.ts':'import type {Item} from "@model";export const item:Item={id:"a",active:true};','current/model.ts':'export interface Item{id:string;active:boolean}','archive/model.ts':'export interface Item{id:number;active:boolean}'},emissionTests:[{name:'保留仅检查流程',files:[]}]}),
 m(8,9,'复测：最小复现的作用','缩小到几个文件后某个工程错误消失，最合理的下一步是什么？',['逐步恢复配置与依赖差异，定位哪个条件触发问题','宣称完整项目问题已经解决','把完整项目删到同样大小即可','停止记录原始诊断'],'最小复现用于识别必要条件。错误消失说明删掉了相关条件，需逐步比较并恢复，不能把未复现当作原项目已修复。','哪些条件被移除了？｜逐个恢复并观察。｜最终在原场景验证修复。'),
 t(8,10,'复测：修复声明冲突而非隐藏诊断','只编辑 shapes.d.ts，公开 Size 必须有 width:number 和 height:number。当前重复声明 width 且类型冲突，skipLibCheck 已固定为 false。修复声明，保持只读 area 实现可用，不能关闭检查。',
 {'shapes.d.ts':'export interface Size{width:number;width:string;height:number}'},
 {'shapes.d.ts':'export interface Size{width:number;height:number}'},[
 ok('尺寸与计算契约','import type {Size} from "./shapes";import {area} from "./main";const size:Size={width:3,height:4};const n:number=area(size);'),
 bad('拒绝文本宽度','import type {Size} from "./shapes";const size:Size={width:"3",height:4};'),
 bad('高度不可省略','import type {Size} from "./shapes";const size:Size={width:3};'),
 ],'相同属性的重复声明必须兼容。这里修复契约本身，并用消费者和运行测试验证；关闭声明检查无法完成要求。','冲突发生在同名属性上。｜需求规定宽高均为 number。｜保留完整公开模型再验证消费者。',{compilerOptions:{skipLibCheck:false},supportFiles:{'main.ts':'import type {Size} from "./shapes";export function area(size:Size):number{return size.width*size.height;}'},runtime:[{name:'声明对应实际计算',code:'const {area}=load("main.js");equal(area({width:3,height:4}),12);equal(area({width:0,height:5}),0);equal(area({width:1.5,height:2}),3);'}]}),

];

// Both the option and the implementation must be repaired in these combined tasks.
for (const number of [6,8]) {
 const question=questions.find(q=>q.id===`t12-l02-q${String(number).padStart(2,'0')}`);
 question.wrongSolutions=[
  {...question.solution,'tsconfig.json':question.files['tsconfig.json']},
  {...question.files,'tsconfig.json':question.solution['tsconfig.json']},
 ];
}

// Output tasks must distinguish a working build from merely suppressing files.
for(const [lesson,number,options] of [
 [4,10,{module:'CommonJS',moduleResolution:'Node10'}],
 [5,6,{declaration:true,emitDeclarationOnly:true,outDir:'types',noEmit:true}],
 [5,8,{noEmit:true,noEmitOnError:true}],
 [5,10,{declaration:false,outDir:'build'}],
]) {
 const question=questions.find(q=>q.id===`t12-l${String(lesson).padStart(2,'0')}-q${String(number).padStart(2,'0')}`);
 question.wrongSolutions=[{'tsconfig.json':JSON.stringify({compilerOptions:options,files:['main.ts']})}];
}
