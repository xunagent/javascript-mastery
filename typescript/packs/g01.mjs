import { mc, task, ok, bad, run } from './author.mjs';
const id = (n) => `t01-l${String(n).padStart(2,'0')}`;
export const questions = [
  mc(id(1),1,'购物车为什么变成 23','在 strict 模式下，下列代码的描述哪项准确？',[
    'qty 的类型与调用不兼容；忽略错误执行现有 JS 逻辑可能得到字符串 23',
    'TS 会在调用前把字符串自动转成数字，结果为 5',
    '把扩展名改成 .ts 后，+ 只支持数字加法',
    '有类型注解就会在运行时抛出 TypeError',
  ],'qty 声明为 number，字符串调用会被拒绝。类型标注不会插入 Number 转换；若强行运行相应 JS，2 + "3" 仍会连接字符串。',[
    '分别观察编译检查与 JavaScript 的 + 运算。','参数注解不产生输入转换。','先判断 "3" 是否满足 number，再考虑忽略检查后的实际值。',
  ],{snippet:'function total(qty: number) { return 2 + qty; }\ntotal("3");'}),
  mc(id(1),2,'改名后出现红线','一份 JS 工具改成 .ts 后，函数参数出现 implicit any 报错。哪种处理最有助于保留业务契约？',[
    '检查真实调用场景，为参数添加合适的类型，并验证调用者',
    '全局关闭 strict，之后便不需要类型设计',
    '把所有参数统一标为 any，契约就完成了',
    '把所有函数返回值都写成 string',
  ],'TS 可以从上下文推断某些参数，但独立函数的无注解参数未必有推断依据。应从合法调用与实现能力确定参数类型。',[
    '报错指出信息缺失，不一定说明运行逻辑错误。','想一想这个函数实际允许什么输入。','补的是函数边界的契约，而不是随便一种类型。',
  ],{stage:'reason'}),
  mc(id(1),3,'注解不是数据清洗','服务端可能返回 "12"。把变量注解为 number 后，以下哪项仍然必须由程序明确完成？',[
    '校验或转换原始值，并处理转换失败',
    'TS 编译器会自动选择十进制解析',
    '接口字段声明会自动过滤字母字符',
    'number 注解能保证结果不是 NaN',
  ],'类型只描述静态约定。字符串转数字、检查有限数和处理失败都属于运行时逻辑；number 本身还包含 NaN 和 Infinity。',[
    '类型声明不是解析函数。','Number("abc") 的结果仍属于 number。','数据进入系统时需要真正执行检查。',
  ]),
  task(id(1),4,'修复金额计算','修复 subtotal，让它接收数字单价和数量，返回两者乘积；字符串参数必须被拒绝。',
    'export function subtotal(price, quantity) {\n  return price + quantity;\n}',
    'export function subtotal(price: number, quantity: number): number {\n  return price * quantity;\n}',[
      ok('数字输入得到 number','import {subtotal} from "./main"; const n: number = subtotal(12, 3);'),
      bad('拒绝字符串单价','import {subtotal} from "./main"; subtotal("12", 3);'),
      bad('拒绝字符串数量','import {subtotal} from "./main"; subtotal(12, "3");'),
    ],'标注输入和输出后，还需要修正实际运算。类型系统无法知道 subtotal 这个名称要求乘法，所以用运行测试验证业务规则。',[
      '函数既有类型缺失，也有业务运算错误。','两个参数都表示数量化的数据。','结果是单价乘数量，返回类型为 number。',
    ],{runtime:[run('三件商品的金额','equal(load("main.js").subtotal(12,3),36);'),run('零件商品的金额','equal(load("main.js").subtotal(12,0),0);')]}),
  mc(id(1),5,'复用普通 JS 表达式','下面哪种变化只提供静态描述，不改变正常运行的求和逻辑？',[
    '为参数与返回值加 number 注解，仍保留 a + b',
    '把 a + b 改成 String(a) + String(b)',
    '用 if 分支把负数改为零',
    '在返回前把结果乘以 100',
  ],'注解表达既有数字契约；转换、分支和运算都会改变实际行为。迁移时应分清补类型与改逻辑。',[
    '找出编译后通常被移除的内容。','注解和运算表达式有不同作用。','数字参数与返回注解可以不改变加法。',
  ],{stage:'reason'}),
  task(id(1),6,'定义通知入口','实现 notify(name, unread)：返回 `${name}: ${unread}`。name 必须是 string，unread 必须是 number。',
    'export function notify(name, unread) {\n  return "";\n}',
    'export function notify(name: string, unread: number): string {\n  return `${name}: ${unread}`;\n}',[
      ok('接受合法通知','import {notify} from "./main"; const text: string = notify("Lin",2);'),
      bad('拒绝颠倒参数','import {notify} from "./main"; notify(2,"Lin");'),
    ],'参数类型与业务角色一致，返回值由模板字符串生成。类型与运行测试共同检查契约和文本内容。',[
      '名称和数量是不同角色。','返回的是一段文本，不是带字段的对象。','用参数注解约束调用，再拼接模板字符串。',
    ],{runtime:[run('保留名称与未读数','equal(load("main.js").notify("Lin",2),"Lin: 2");'),run('零未读仍有效','equal(load("main.js").notify("小雨",0),"小雨: 0");')]}),
  mc(id(1),7,'注解会限制真实对象吗','JS 对象包含 name 与 age，而函数只要求 {name: string}。讨论类型时首先应关注什么？',[
    '目标契约需要的结构与调用写法，不能仅凭对象有额外字段就断言一定错误',
    'TS 会在运行时删除 age',
    '所有 TS 对象只允许有声明过的字段',
    '对象必须继承一个同名类',
  ],'TS 的对象兼容性主要关注结构，另有对象字面量额外属性检查。类型注解不会自动删除真实属性。后续对象关会区分这些情况。',[
    '静态结构描述不负责修改对象。','传变量和直接写字面量可能有不同检查。','先确认目标需要哪些能力。',
  ],{stage:'reason'}),
  task(id(1),8,'把标签生成器迁移到 TS','给 label 增加正确类型，保留既有行为：名称首尾去空白后加 # 前缀，空白名称返回 #未命名。',
    'export function label(name) {\n  return "#" + (name.trim() || "未命名");\n}',
    'export function label(name: string): string {\n  return "#" + (name.trim() || "未命名");\n}',[
      ok('字符串输入保留文本返回','import {label} from "./main"; const x: string = label(" TS ");'),
      bad('数字不能执行文本入口','import {label} from "./main"; label(12);'),
    ],'迁移先保留已知行为，再为边界添加类型。字符串的 trim 和空白回退由运行逻辑提供。',[
      '观察实现调用了哪种值的方法。','输入与输出都是文本。','不需要改动 trim 与回退，只补足契约。',
    ],{runtime:[run('去掉两端空白','equal(load("main.js").label(" TS "),"#TS");'),run('空白名使用默认值','equal(load("main.js").label("  "),"#未命名");')]}),
  mc(id(1),9,'跨场景：库存减少','库存函数的两个参数都标注为 number，但写成了加法。它编译通过意味着什么？',[
    '类型兼容，但减少库存的业务规则仍需测试',
    '编译器已经证明库存不会出错',
    'TS 根据函数名自动把加法改成减法',
    'number 标注自动禁止负数',
  ],'类型检查约束值的类型与使用方式，不会从函数名推导所有业务规则。库存边界和运算结果都需要明确实现及测试。',[
    '函数名不是形式化业务规范。','加法与减法都能接受数字。','检查能否编译与检查减少行为是两项任务。',
  ]),
  task(id(1),10,'复测：折扣后的价格','实现 discounted(price, rate)，返回 price * (1 - rate)。两参数和返回值均为数字，保留小数。',
    'export function discounted(price, rate) {\n  return price - rate;\n}',
    'export function discounted(price: number, rate: number): number {\n  return price * (1 - rate);\n}',[
      ok('合法折扣调用','import {discounted} from "./main"; const n: number=discounted(80,0.25);'),
      bad('拒绝文字折扣','import {discounted} from "./main"; discounted(80,"25%");'),
    ],'明确数字接口后仍需按比例计算。返回值是数字，不应使用 toFixed 直接把结果变成字符串。',[
      'rate 是比例而不是减去的金额。','先求剩余比例，再乘原价。','返回 price * (1 - rate)，补齐参数与返回注解。',
    ],{runtime:[run('四分之一折扣','equal(load("main.js").discounted(80,0.25),60);'),run('零折扣保持原价','equal(load("main.js").discounted(19.5,0),19.5);')]}),

  mc(id(2),1,'零作除数','下面代码能通过类型检查，但输入 0 时返回 Infinity。这说明什么？',[
    'number 不表达非零约束，需要运行时验证业务条件',
    'TypeScript 的所有数字都是正数',
    'strict 会禁止除法',
    '编译器一定会自动插入除零异常',
  ],'number 允许零、无穷和 NaN。非零约束需要在函数边界用运行逻辑保证。',[
    '考虑 number 包含哪些值。','参数值可能直到运行时才知道。','类型兼容不等于满足所有数值业务约束。',
  ],{snippet:'function perItem(count: number) { return 100 / count; }'}),
  mc(id(2),2,'成功请求与成功数据','收到 HTTP 200 后立刻把 JSON 当成用户对象。哪个检查仍然必要？',[
    '确认 JSON 的字段和业务格式符合要求',
    '200 已经保证所有字段符合 TS interface',
    '只改文件扩展名即可验证 JSON',
    '把返回值写成 Promise<User> 就能过滤错误值',
  ],'传输成功只是一层证据。远端数据没有自动遵守本地静态声明，需要实际校验结构。',[
    'HTTP 状态码不认识本地接口。','类型声明不会发到服务器约束响应。','验证应发生在不可信数据进入系统时。',
  ],{stage:'reason'}),
  mc(id(2),3,'两种失败','以下哪个问题通常能由静态检查直接指出？',[
    '给明确要求 string 的参数传 number',
    '服务器在明天返回了错误字段',
    '用户输入了业务上不允许的名字但类型为 string',
    '一次网络请求耗时超过预期',
  ],'调用参数类型冲突是已有静态信息。其他情况依赖运行环境或业务规则，需要额外的运行检查。',[
    '寻找编译时已经知道的事实。','字符串内部是否合法与它是不是 string 是两件事。','参数与声明类型不同是直接冲突。',
  ]),
  task(id(2),4,'安全地计算平均值','实现 average(total,count)：两参数为 number；count 必须为正的有限数，否则返回 null；合法时返回 total/count。total 可假定为有限数。',
    'export function average(total: number, count: number): number | null {\n  return total / count;\n}',
    'export function average(total: number, count: number): number | null {\n  if (!Number.isFinite(count) || count <= 0) return null;\n  return total / count;\n}',[
      ok('结果允许失败值','import {average} from "./main"; const n: number|null=average(10,2);'),
      bad('调用者必须处理 null','import {average} from "./main"; const n: number=average(10,2);'),
      bad('拒绝字符串 count','import {average} from "./main"; average(10,"2");'),
    ],'number 注解无法排除零和 Infinity，条件分支负责实际验证；返回联合类型让调用者处理失败。',[
      '先确定不能相除的 count。','有限且大于零才是合法分母。','失败返回 null，成功返回商，并在返回类型中表达两种结果。',
    ],{runtime:[run('正常平均值','equal(load("main.js").average(9,3),3);'),run('拒绝零、负数和非有限数','const {average}=load("main.js"); for(const c of [0,-1,Infinity,NaN]) equal(average(8,c),null);')]}),
  mc(id(2),5,'为什么补测试','一段折扣函数参数类型正确，却把 0.2 当作减去 0.2 元。最直接的防线是什么？',[
    '测试业务输入输出，例如 100 与 0.2 应得到 80',
    '把所有 number 改成 any',
    '给函数换一个更长的名字',
    '只运行转译工具',
  ],'价格和比例都可表示为 number，静态类型未表达公式。实际输入输出的测试验证业务运算。',[
    '现有类型不足以表达折扣公式。','需要检查程序具体做了什么。','挑选能区分错误公式和正确公式的输入。',
  ],{stage:'reason'}),
  task(id(2),6,'未知值里的用户名','实现 readName(value: unknown)：只有字符串且 trim 后非空时返回去空白文本，其余返回 null。',
    'export function readName(value: unknown): string | null {\n  return value.trim();\n}',
    'export function readName(value: unknown): string | null {\n  if (typeof value !== "string") return null;\n  return value.trim() || null;\n}',[
      ok('未知输入可以交给校验入口','import {readName} from "./main"; const x: unknown = 2; const n: string|null=readName(x);'),
      bad('结果不能当作一定成功','import {readName} from "./main"; const n: string=readName(" ");'),
    ],'unknown 保留边界。先验证为字符串再使用 trim，空白输入仍需通过业务判断拒绝。',[
      'unknown 上不能直接调用 trim。','typeof 可以建立字符串证据。','检查类型后清理空白，空结果返回 null。',
    ],{runtime:[run('清理有效名字','equal(load("main.js").readName(" Ada "),"Ada");'),run('拒绝错误类型与空白','const {readName}=load("main.js");for(const v of [0,null,{}," "])equal(readName(v),null);')]}),
  mc(id(2),7,'描述不等于验证','为什么给 JSON 的结果加一个 User 类型断言不能证明它真的有 name？',[
    '断言通常不产生验证字段的运行代码',
    '接口只能包含数字',
    'User 名称太短导致检查失效',
    '所有 JSON 字段都被 TypeScript 自动删除',
  ],'断言调整编译器对值的看法，没有凭空建立服务器字段正确的证据。应使用解析或校验函数。',[
    '观察编译后的代码是否多了判断。','类型断言与 if 检查的区别在于是否执行。','本题需要的是实际字段存在的证据。',
  ],{stage:'reason'}),
  task(id(2),8,'页码也要验证','实现 pageNumber(text: string)：Number(text) 后必须是大于零的整数，并且原文本不能全为空白；合法返回该数，否则返回 null。',
    'export function pageNumber(text: string): number | null {\n  return Number(text);\n}',
    'export function pageNumber(text: string): number | null {\n  if (!text.trim()) return null;\n  const n = Number(text);\n  return Number.isInteger(n) && n > 0 ? n : null;\n}',[
      ok('转换结果有失败分支','import {pageNumber} from "./main"; const n: number|null=pageNumber("2");'),
      bad('入口要求文本','import {pageNumber} from "./main"; pageNumber(2);'),
    ],'Number 做转换，后续条件验证业务范围。类型层面 number 不会自动保证整数或正数。',[
      '转换成功与页码合法并不等价。','空字符串会被 Number 转成零。','检查非空、整数与大于零三个条件。',
    ],{runtime:[run('接受正整数文本','equal(load("main.js").pageNumber(" 12 "),12);'),run('拒绝不合法页码','const {pageNumber}=load("main.js");for(const v of [""," ","0","-1","1.5","abc","Infinity"])equal(pageNumber(v),null);')]}),
  mc(id(2),9,'复测：数组内容','类型声明写着 items: string[]，远端却传来 [1,2]。只加注解会有什么效果？',[
    '注解无法改变远端实际元素，需要检查数组元素',
    '所有数字被自动调用 String',
    '数组会变成空数组',
    '编译器会提前拦截未来的响应',
  ],'外部协议和本地声明可能不一致。数组元素的运行验证应在数据入口完成。',[
    '远端响应到达时编译通常早已结束。','标注不改变值。','验证不能只停留在 Array.isArray。',
  ]),
  task(id(2),10,'复测：安全读取年龄','实现 age(value: unknown)：仅接受 0 到 150 之间的整数，其他值返回 null。不得把数字字符串视为年龄。',
    'export function age(value: unknown): number | null {\n  return null;\n}',
    'export function age(value: unknown): number | null {\n  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 150 ? value : null;\n}',[
      ok('接受任何输入并明确返回','import {age} from "./main"; const n: number|null=age({});'),
      bad('结果可能为空','import {age} from "./main"; const n:number=age(2);'),
    ],'先验证类型，再验证整数和范围。这里不执行强制转换，保持输入规则明确。',[
      '字符串即使长得像数字，也不符合要求。','先 typeof，再判断数值范围。','边界 0 与 150 合法，NaN、Infinity 和小数都不合法。',
    ],{runtime:[run('接受年龄边界','const {age}=load("main.js");equal(age(0),0);equal(age(150),150);'),run('拒绝非法年龄','const {age}=load("main.js");for(const v of [-1,151,2.5,"20",NaN,Infinity,null])equal(age(v),null);')]}),

  mc(id(3),1,'接口能用于 instanceof 吗','为什么下列判断不能使用？',[
    '接口只在类型空间中存在，没有可用于 instanceof 的构造函数',
    'instanceof 只能检查字符串',
    '对象字面量不能赋给接口',
    '所有接口都会变成同名 class',
  ],'interface 不生成运行时构造函数。需要检查字段，或在确实使用类创建实例时检查相应类。',[
    'instanceof 的右侧需要运行时的值。','查看 interface 编译后是否还存在。','类型名不是同名构造函数。',
  ],{snippet:'interface User { name: string }\nfunction isUser(value: unknown) { return value instanceof User; }'}),
  mc(id(3),2,'编译后剩下什么','下面哪项在普通编译后仍包含可执行逻辑？',[
    'if (typeof value === "string") return value.trim();',
    'interface User { name: string }',
    'type Id = string;',
    '函数参数后面的 : number 注解',
  ],'条件判断与方法调用是 JavaScript 逻辑。接口、类型别名和参数注解主要用于检查，编译时擦除。',[
    '找出真正处理值的语句。','类型描述与运行表达式不同。','if 和 trim 需要在运行时执行。',
  ],{stage:'reason'}),
  mc(id(3),3,'断言不会数值转换','执行 Number("12") 和把 "12" 断言成 number 的根本区别是什么？',[
    '前者执行转换，后者只影响静态认知且未必允许直接断言',
    '两者都一定产生数字 12',
    '断言比 Number 多一层运行校验',
    'Number 只改变类型而不改变值',
  ],'Number 是运行时函数。类型断言不改变实际值，且 TS 对明显不相交类型的直接断言也可能报错。',[
    '观察运行时 typeof 的结果。','编译后的断言部分不再存在。','必须区分“告诉检查器”与“执行转换”。',
  ]),
  task(id(3),4,'给字符串入口补上真实判断','实现 normalize(value: unknown)：字符串转为小写，其余返回空字符串；使用运行判断而不是接口或断言。',
    'export function normalize(value: unknown): string {\n  return value.toLowerCase();\n}',
    'export function normalize(value: unknown): string {\n  return typeof value === "string" ? value.toLowerCase() : "";\n}',[
      ok('入口接收 unknown','import {normalize} from "./main"; const x: unknown={}; const s:string=normalize(x);'),
      bad('返回值不是数字','import {normalize} from "./main"; const n:number=normalize(3);'),
    ],'运行判断既保护执行，也帮助 TS 收窄类型。它不会像类型标注一样被擦除。',[
      'unknown 不能直接访问字符串方法。','只有字符串分支可以调用 toLowerCase。','其他分支明确返回空文本。',
    ],{runtime:[run('真实转换字符串','equal(load("main.js").normalize("HeLLo"),"hello");'),run('错误值安全回退','equal(load("main.js").normalize({}),"");equal(load("main.js").normalize(null),"");')]}),
  mc(id(3),5,'类型别名不是新构造器','type UserId = string 声明之后，哪种说法准确？',[
    'UserId 是类型别名，不能调用 new UserId() 来创建字符串',
    '所有字符串都会变成 UserId 类实例',
    'UserId 会自动拒绝空字符串',
    'UserId 有默认的运行时校验器',
  ],'别名为类型提供名字，不自动创建值、校验器或新的运行时身份。空字符串约束要另外实现。',[
    'type 声明不产生函数体。','名字表达业务含义，但不自动增加验证。','类型空间与值空间需要分别考虑。',
  ],{stage:'reason'}),
  task(id(3),6,'有值的状态表','导出 statuses（含 loading 与 done 两个字符串值的只读元组），以及 isStatus(value: string): boolean，判断文本是否是其中之一。',
    'export type Status = "loading" | "done";\nexport const statuses = [];\nexport function isStatus(value: string): boolean { return false; }',
    'export type Status = "loading" | "done";\nexport const statuses = ["loading", "done"] as const;\nexport function isStatus(value: string): boolean { return value === "loading" || value === "done"; }',[
      ok('元组保留顺序与字面量','import {statuses} from "./main"; const s: readonly ["loading","done"] = statuses;'),
      bad('状态表不能原地修改','import {statuses} from "./main"; statuses[0]="done";'),
    ],'联合类型供编译器使用；实际数组和判断函数供运行时使用。as const 保留元组类型，但没有冻结数组的运行时实现。',[
      '类型别名不能被遍历，需要另外提供实际值。','让数组保留两个位置的字面量信息。','显式比较两个有效状态，并导出只读元组。',
    ],{runtime:[run('导出的状态表有真实值','equal(load("main.js").statuses,["loading","done"]);'),run('判断候选值','const {isStatus}=load("main.js");check(isStatus("done"));check(!isStatus("failed"));')]}),
  mc(id(3),7,'readonly 能阻止外部脚本吗','把字段声明为 readonly 后，能否保证其他未经 TS 检查的脚本永远改不了对象？',[
    '不能，readonly 是静态约束；运行时防修改需要相应机制',
    '能，所有属性会变成不可写描述符',
    '能，编译后会自动深冻结所有对象',
    '不能，因为 readonly 只支持数字字段',
  ],'readonly 限制通过该类型写入，不会自动生成深冻结代码。运行时对象仍遵循 JavaScript 属性规则。',[
    '观察编译是否生成 Object.freeze。','静态别名还可能共享同一个对象。','不要把类型约束等同于运行时属性描述符。',
  ],{stage:'reason'}),
  task(id(3),8,'迁移：显式冻结配置','实现 config(mode: string)，返回包含 mode 字段的只读对象，并使用 Object.freeze 让该浅层对象运行时被冻结。',
    'export function config(mode: string): Readonly<{mode: string}> {\n  return {mode};\n}',
    'export function config(mode: string): Readonly<{mode: string}> {\n  return Object.freeze({mode});\n}',[
      ok('读取配置','import {config} from "./main"; const s:string=config("dark").mode;'),
      bad('类型层面拒绝写入','import {config} from "./main"; config("dark").mode="light";'),
    ],'只读返回类型提供静态限制，Object.freeze 提供本题所需的浅层运行时冻结。两者职责不同。',[
      '目前的类型正确，但缺少运行行为。','JavaScript 提供冻结对象的函数。','把实际返回对象交给 Object.freeze。',
    ],{runtime:[run('配置在运行时被冻结','const c=load("main.js").config("dark");equal(c.mode,"dark");check(Object.isFrozen(c));')]}),
  mc(id(3),9,'复测：断言与校验','函数体只有 return value as Product。它是否证明了 value.price 是有效价格？',[
    '没有，它没有执行任何字段或数值校验',
    '证明了，as 会读取接口的每个字段',
    '证明了，接口会自动转换 JSON',
    '只有函数名以 parse 开头时才会证明',
  ],'命名和断言都不建立运行时证据。需实际检查对象及其价格字段。',[
    '先找真正执行的条件语句。','断言编译后剩下什么？','没有校验逻辑就没有验证字段。',
  ]),
  task(id(3),10,'复测：运行时的布尔解析','实现 parseEnabled(text: string)：仅 "true" 返回 true，"false" 返回 false，其余返回 null。',
    'export function parseEnabled(text: string): boolean | null {\n  return Boolean(text);\n}',
    'export function parseEnabled(text: string): boolean | null {\n  if (text === "true") return true;\n  if (text === "false") return false;\n  return null;\n}',[
      ok('返回布尔或失败','import {parseEnabled} from "./main"; const v:boolean|null=parseEnabled("true");'),
      bad('输入必须是文本','import {parseEnabled} from "./main"; parseEnabled(true);'),
    ],'Boolean("false") 为 true，因为非空字符串是真值。题目要求按内容解析，必须写出分支。',[
      'Boolean 检查真值性，不解析单词。','只有两个精确文本被允许。','分别处理 true、false，其他返回 null。',
    ],{runtime:[run('解析两个文本值','const {parseEnabled}=load("main.js");equal(parseEnabled("true"),true);equal(parseEnabled("false"),false);'),run('拒绝其他文本','equal(load("main.js").parseEnabled("1"),null);equal(load("main.js").parseEnabled(""),null);')]}),

  mc(id(4),1,'有输出文件就成功了吗','项目编译后出现 main.js，但终端也打印了类型错误。应如何判断？',[
    '检查结果与输出是否生成要分别看，某些配置允许有错时仍输出',
    '只要有 JS 文件，类型检查必定通过',
    'TS 永远不会在错误时输出任何文件',
    '删除 tsconfig 就能证明代码正确',
  ],'编译输出策略受 noEmit、noEmitOnError 等设置影响。不能以文件存在替代检查退出结果。',[
    '观察控制输出的编译选项。','类型检查和文件生成并非同一个结论。','查明确切错误及退出状态。',
  ]),
  mc(id(4),2,'只检查类型','已有打包工具负责 JS 输出，想让 tsc 专门做类型检查，应优先考虑什么？',[
    '在项目中明确 noEmit，并运行项目类型检查',
    '删除所有类型声明文件',
    '将每个参数都改成 any',
    '只检查构建产物中有没有字符串 type',
  ],'noEmit 让编译器不输出文件，但仍进行语义检查。打包和类型检查可以是不同步骤。',[
    '任务并不需要第二份 JS 输出。','寻找控制 emit 的配置。','noEmit 不等于 noCheck。',
  ],{stage:'reason'}),
  mc(id(4),3,'为什么使用项目命令','在项目里执行 tsc -p tsconfig.json 的主要意义是什么？',[
    '按指定项目配置和文件关系进行检查',
    '只运行名为 tsconfig 的 JavaScript 文件',
    '将浏览器 API 自动安装到 Node',
    '保证外部接口数据都合法',
  ],'-p 指定项目配置。它影响文件集合和编译选项，不提供运行时库或数据校验。',[
    'p 指向的是 project。','配置决定项目分析条件。','文件范围和检查选项都要对应实际项目。',
  ]),
  task(id(4),4,'修复模块入口','main.ts 调用 math.ts 的 sum。修复导出与类型，使 total() 返回 5，sum 仅接受数字。',
    {'math.ts':'function sum(a: number,b: number) { return a+b; }','main.ts':'import {sum} from "./math";\nexport function total(): number { return sum(2,3); }'},
    {'math.ts':'export function sum(a: number,b: number): number { return a+b; }','main.ts':'import {sum} from "./math";\nexport function total(): number { return sum(2,3); }'},[
      ok('入口与工具模块能连接','import {total} from "./main"; const n:number=total();'),
      bad('工具仍拒绝错误参数','import {sum} from "./math"; sum("2",3);'),
    ],'模块中的函数必须导出才能被另一文件具名导入。跨文件契约和函数计算都需检查。',[
      '检查 math.ts 对外提供了哪些名字。','main.ts 采用具名导入。','为 sum 增加 export，保留数字参数。',
    ],{runtime:[run('多文件实际运行','equal(load("main.js").total(),5);')]}),
  mc(id(4),5,'类型库与运行平台','给 Node 项目的 lib 加上 DOM 后，document 不报错了。这是否说明 Node 一定有 document？',[
    '不说明，类型声明不会提供运行时 DOM',
    '说明，tsc 自动启动浏览器',
    '说明，lib 配置会安装 DOM 实现',
    '只要把 document 写成大写就会出现',
  ],'lib 是检查器的声明来源。运行平台是否存在某个 API 必须单独确认。',[
    '类型文件只描述 API。','配置没有创建实际对象。','能识别名字与能执行调用是两件事。',
  ],{stage:'reason'}),
  task(id(4),6,'建立公共模型文件','在 model.ts 导出 Product 接口（id 为 string，price 为 number）；main.ts 实现 cost(product, quantity)，返回价格乘数量。',
    {'model.ts':'// 定义并导出 Product\nexport {};','main.ts':'import type {Product} from "./model";\nexport function cost(product: Product, quantity: number): number { return 0; }'},
    {'model.ts':'export interface Product { id: string; price: number }','main.ts':'import type {Product} from "./model";\nexport function cost(product: Product, quantity: number): number { return product.price * quantity; }'},[
      ok('公共类型与函数保持一致','import {cost} from "./main"; import type {Product} from "./model";const p:Product={id:"a",price:4};const n:number=cost(p,3);'),
      bad('错误价格类型被拒绝','import {cost} from "./main"; cost({id:"a",price:"4"},3);'),
    ],'类型可独立放在模块中并用 import type 引入。业务函数仍有真实实现，不能只补接口而不计算。',[
      '两个文件需要共享同一模型。','Product 的字段与调用样例保持一致。','导出接口后，在 cost 中读取 price 并乘 quantity。',
    ],{runtime:[run('模型支持计算','equal(load("main.js").cost({id:"a",price:4},3),12);')]}),
  mc(id(4),7,'编辑器与命令行不一致','编辑器没有红线，而项目类型检查报错。最合理的第一步是什么？',[
    '确认双方使用的 TS 版本、项目配置和文件范围',
    '直接删除所有测试',
    '认为命令行一定有 bug',
    '把源码文件移出项目以隐藏错误',
  ],'检查条件不同会产生不同结果。先找编译器版本、实际配置与包含文件，再定位代码。',[
    '两个工具未必读取同一个项目。','类型检查受版本和选项影响。','先对齐条件再解释差异。',
  ],{stage:'reason'}),
  task(id(4),8,'迁移：拆分格式工具','format.ts 导出 money(value:number):string，保留两位小数。main.ts 导出 receipt(value:number):string，在格式结果前加 ¥。',
    {'format.ts':'export function money(value) { return value; }','main.ts':'import {money} from "./format";\nexport function receipt(value: number): string { return "¥"+money(value); }'},
    {'format.ts':'export function money(value: number): string { return value.toFixed(2); }','main.ts':'import {money} from "./format";\nexport function receipt(value: number): string { return "¥"+money(value); }'},[
      ok('两模块返回文本','import {money} from "./format";import {receipt} from "./main";const x:string=money(3);const y:string=receipt(3);'),
      bad('格式工具拒绝文本输入','import {money} from "./format";money("3");'),
    ],'公共工具应暴露正确类型与行为。toFixed 返回字符串，适合金额展示；这与数值计算函数的返回约定不同。',[
      '格式化的输出与输入不是同一种类型。','保留两位小数可以使用 toFixed。','money 输出文本，receipt 组合前缀。',
    ],{runtime:[run('跨文件格式化','equal(load("main.js").receipt(3),"¥3.00");equal(load("main.js").receipt(2.5),"¥2.50");')]}),
  mc(id(4),9,'复测：构建快但漏错','某工具只是去掉类型语法并输出 JS。它能代替课程的类型检查吗？',[
    '不能，转译成功不代表已验证类型关系',
    '能，删除注解等于证明注解正确',
    '能，JS 文件扩展名保证程序正确',
    '只有文件超过一百行才需要检查',
  ],'转译关注语法变换；语义检查关注类型关系。工程中要安排实际类型检查步骤。',[
    '工具是否真的比较了参数和调用？','语法转换与语义验证不同。','课程使用编译器语义诊断作为证据。',
  ]),
  task(id(4),10,'复测：修复消息模块','message.ts 导出 greet(name:string):string；main.ts 导出 welcome(name:string):string 调用 greet。要求 greet 返回“你好，名字”。',
    {'message.ts':'export function greet(name: string) { return name.length; }','main.ts':'import {greet} from "./message";\nexport function welcome(name: string): string { return greet(name); }'},
    {'message.ts':'export function greet(name: string): string { return `你好，${name}`; }','main.ts':'import {greet} from "./message";\nexport function welcome(name: string): string { return greet(name); }'},[
      ok('入口返回问候','import {welcome} from "./main";const s:string=welcome("小雨");'),
      bad('入口拒绝数值名字','import {welcome} from "./main";welcome(1);'),
    ],'错误显示在入口返回处，但源头是下游 greet 返回了数字。修正真正的模块契约，而非在入口断言。',[
      '沿导入关系查看返回类型。','greet 当前计算的是长度。','让 greet 返回实际问候文本。',
    ],{runtime:[run('返回所需问候','equal(load("main.js").welcome("小雨"),"你好，小雨");')]}),

  mc(id(5),1,'错误指向深层字段','报错说 profile.address.zip: number 不能赋给 string，最佳定位方式是？',[
    '沿字段路径确认 zip 的来源和约定，再修正不一致的一端',
    '把整个 profile 改成 any',
    '改动与 zip 无关的 name',
    '删除 address 字段，无需查看业务要求',
  ],'嵌套报错表达实际类型与目标类型的冲突路径。应修正业务契约或转换边界，不应盲目扩大整个对象类型。',[
    '错误消息已经提供属性路径。','找最深层不兼容的字段。','明确邮编需要保留什么信息，例如前导零。',
  ]),
  mc(id(5),2,'报错位置不一定是根因','total() 声明返回 number，但 return formatPrice() 报错。formatPrice 返回 string。应先做什么？',[
    '确认 total 应返回可计算数字还是展示文本，再调整职责',
    '在 return 后追加 as number',
    '相信函数名会自动转换结果',
    '把错误行移到另一个文件',
  ],'类型错误暴露职责冲突。计算与展示需要不同返回类型，不能只把返回值断言为想要的类型。',[
    '先明确调用方期望得到什么。','格式化与计算可能应该分开。','修复契约而不是换行隐藏报错。',
  ],{stage:'reason'}),
  mc(id(5),3,'cannot find name','一个函数中使用 userId 却只声明了 userID。这里首先应排查什么？',[
    '标识符拼写、大小写和作用域',
    '增加所有 DOM 类型库',
    '将 string 改为 String',
    '设置任意返回值为 unknown',
  ],'名字无法找到与类型不兼容不是同类错误。先检查名字是否在当前位置可见。',[
    '留意大小写是否一致。','这里可能还没有进入类型比较。','确认实际声明的名字与使用处一致。',
  ]),
  task(id(5),4,'修复邮编模型','showAddress 接收 {city:string,zip:string} 并返回“城市 邮编”。修复默认地址的错误，保留邮编 00120 的前导零。',
    'export function showAddress(address: {city:string;zip:string}): string { return `${address.city} ${address.zip}`; }\nexport const defaultAddress = {city:"杭州", zip:120};\nexport const preview: string = showAddress(defaultAddress);',
    'export function showAddress(address: {city:string;zip:string}): string { return `${address.city} ${address.zip}`; }\nexport const defaultAddress = {city:"杭州", zip:"00120"};\nexport const preview: string = showAddress(defaultAddress);',[
      ok('邮编保持文本','import {defaultAddress} from "./main";const z:string=defaultAddress.zip;'),
      bad('错误结构不能传入','import {showAddress} from "./main";showAddress({city:"杭州",zip:120});'),
    ],'邮编不是用于算术的数字。根据业务语义修正数据源为文本，避免转换后丢失前导零。',[
      '冲突发生在 zip 字段。','前导零对标识类数据有意义。','将默认 zip 写成完整字符串，不改变函数的正确契约。',
    ],{runtime:[run('保留完整邮编','equal(load("main.js").preview,"杭州 00120");')]}),
  mc(id(5),5,'隐式 any 和 unknown','函数参数隐式 any 报错，直接改成 unknown 后访问属性又报错。这意味着什么？',[
    'unknown 要求建立实际证据，应根据入口契约选择具体类型或校验',
    'unknown 与 any 完全相同，编译器错误了',
    '必须关闭 strict 才能处理对象',
    '所有参数都应该删除',
  ],'unknown 保持未知输入的安全边界，使用前需要检查。若函数本来只允许特定对象，也可以直接声明具体契约。',[
    'unknown 不承诺任何成员。','先区分公共未知入口与内部已知对象。','检查或明确约束，不能仅换一个关键词。',
  ],{stage:'reason'}),
  task(id(5),6,'从错误推导函数契约','实现 fullName(user)，要求 user 包含 first、last 两个 string 字段，返回“first last”，禁止缺失 last 的调用。',
    'export function fullName(user) { return user.first + " " + user.last; }',
    'export function fullName(user: {first:string;last:string}): string { return user.first + " " + user.last; }',[
      ok('完整名字可以格式化','import {fullName} from "./main";const s:string=fullName({first:"Ada",last:"Lovelace"});'),
      bad('拒绝缺少姓氏','import {fullName} from "./main";fullName({first:"Ada"});'),
      bad('拒绝错误字段类型','import {fullName} from "./main";fullName({first:"Ada",last:1});'),
    ],'从成员使用可以看出函数需要什么结构。把这些字段放进参数契约，调用方就能在传入不完整对象时得到提示。',[
      '实现实际读取了两个字段。','两个字段都参与字符串拼接。','把必需的 first 与 last 标为 string。',
    ],{runtime:[run('生成完整名字','equal(load("main.js").fullName({first:"Ada",last:"Lovelace"}),"Ada Lovelace");')]}),
  mc(id(5),7,'只读字段报错','写入 readonly id 时报错时，哪种思路最合理？',[
    '确认是否应创建新对象，或契约是否确实需要允许修改',
    '只读标注会自动把赋值转为新对象',
    '用 as any 是唯一办法',
    '把字段名字换成大写即可绕过检查并保留语义',
  ],'报错反映当前契约不允许该写入。不可变更新可以创建新对象，但也应核对业务是否允许改变身份字段。',[
    'readonly 是当前类型允许的操作限制。','业务更新不一定需要原地赋值。','选择与契约一致的更新策略。',
  ],{stage:'reason'}),
  task(id(5),8,'迁移：可选名的错误','实现 greeting(name?: string)，缺少参数时返回“你好，访客”，其他时候返回“你好，姓名”；空字符串按原值保留。',
    'export function greeting(name?: string): string {\n  return "你好，" + name.toUpperCase();\n}',
    'export function greeting(name?: string): string {\n  return "你好，" + (name ?? "访客");\n}',[
      ok('允许缺省和字符串','import {greeting} from "./main";const a:string=greeting();const b:string=greeting("林");'),
      bad('拒绝数字姓名','import {greeting} from "./main";greeting(4);'),
    ],'可选参数包含 undefined。空值回退 ?? 只处理缺失，|| 会把空字符串也当成缺失，不符合这里的规则。',[
      '可选参数可能没有值。','本题要求保留空字符串，不能用真值回退替代。','用 ?? 提供访客默认值，并保持原姓名。',
    ],{runtime:[run('分别处理缺省、空串和姓名','const {greeting}=load("main.js");equal(greeting(),"你好，访客");equal(greeting(""),"你好，");equal(greeting("林"),"你好，林");')]}),
  mc(id(5),9,'复测：参数个数','Expected 2 arguments, but got 1 最直接提示你检查什么？',[
    '函数签名需要几个参数，以及当前调用遗漏了什么',
    '输出文件有没有安装',
    '接口字段是否按字母排序',
    '函数返回值是否大于一',
  ],'参数数量错误应该先对照调用与签名，确认遗漏的是必需参数还是签名需要调整为可选。',[
    'arguments 在这里指调用参数。','找到报错对应的函数声明。','用真实调用需求判断缺失参数是否合理。',
  ]),
  task(id(5),10,'复测：修正折叠的模型错误','formatTicket 接收 ticket.owner.name 为 string，返回“工单：姓名”。修复样例中的字段类型，不改变正确函数契约。',
    'export function formatTicket(ticket: {owner:{name:string}}): string {return `工单：${ticket.owner.name}`;}\nexport const ticket = {owner:{name:42}};\nexport const text = formatTicket(ticket);',
    'export function formatTicket(ticket: {owner:{name:string}}): string {return `工单：${ticket.owner.name}`;}\nexport const ticket = {owner:{name:"42"}};\nexport const text = formatTicket(ticket);',[
      ok('姓名类型正确','import {ticket} from "./main";const n:string=ticket.owner.name;'),
      bad('拒绝原错误结构','import {formatTicket} from "./main";formatTicket({owner:{name:42}});'),
    ],'沿 ticket.owner.name 定位后修复数据，避免扩大整个 ticket 的类型。这里要求把样例值作为文本姓名保留。',[
      '报错的最深层字段是 name。','目标接口已经描述了文本姓名。','修复样例中的 42 为字符串 "42"。',
    ],{runtime:[run('生成工单文本','equal(load("main.js").text,"工单：42");')]}),

  mc(id(6),1,'严格空值检查','strict 下，可选参数 name?: string 被直接调用 trim，为什么报错？',[
    'name 可能为 undefined，需要先处理缺省情况',
    'string 没有 trim 方法',
    '所有可选参数都被推断为 never',
    '严格模式禁止函数',
  ],'可选参数包含缺省可能。严格空值检查要求先建立存在的证据，再使用字符串方法。',[
    '调用者可以不传参数。','这种情况下运行值是什么？','先处理 undefined，再调用 trim。',
  ]),
  mc(id(6),2,'strict 并非所有选项','开启 strict 后，应怎样对待 noUncheckedIndexedAccess 等其他检查选项？',[
    '查明是否需要单独开启，并在题目或项目中显式说明',
    '认为所有以 no 开头的选项都已经开启',
    '认为所有数组读取都必定不含 undefined',
    '认为 strict 只改变输出格式',
  ],'strict 是一组特定检查的集合，不代表所有额外严格选项。数组和字典访问的表现要根据实际配置判断。',[
    '配置名并不意味着包含所有检查。','额外索引访问检查需要单独核对。','固定配置才能解释相同代码的结果。',
  ],{stage:'reason'}),
  mc(id(6),3,'自动推断是否违反严格模式','strict 下 const n = 3 没有显式注解，为什么仍可通过？',[
    '初始化提供了可靠推断，严格模式不要求每个变量都写注解',
    'const 变量完全跳过类型检查',
    '严格模式只检查注释',
    'n 会一直是 any',
  ],'严格检查与推断可以同时工作。编译器能从初始化取得足够信息，无需重复标注每个变量。',[
    '变量的初始化已经明确。','推断也是类型信息来源。','noImplicitAny 针对无法确定类型而隐式使用 any 的情况。',
  ]),
  task(id(6),4,'修复可能为空的名称','实现 upper(name: string | undefined)：缺失时返回“未知”，其他字符串转大写；空字符串仍返回空字符串。',
    'export function upper(name: string | undefined): string { return name.toUpperCase(); }',
    'export function upper(name: string | undefined): string { return name === undefined ? "未知" : name.toUpperCase(); }',[
      ok('允许字符串与 undefined','import {upper} from "./main";const a:string=upper(undefined);const b:string=upper("ts");'),
      bad('拒绝 null','import {upper} from "./main";upper(null);'),
    ],'按具体缺失值判断，既满足检查器，也保留空字符串的有效语义。不能用非空断言假装 name 永远存在。',[
      '缺失与空字符串需要不同处理。','先检查 undefined。','在已知字符串分支调用 toUpperCase。',
    ],{runtime:[run('缺失和空串区别处理','const {upper}=load("main.js");equal(upper(undefined),"未知");equal(upper(""),"");equal(upper("ts"),"TS");')]}),
  mc(id(6),5,'类型检查被关掉后的后果','为了通过构建把 noImplicitAny 关掉，原来缺失参数类型的业务接口获得了什么？',[
    '只是放宽检查，并没有获得更准确的契约',
    '自动得到了完整泛型关系',
    '参数会在运行时逐个验证',
    '所有函数都变成纯函数',
  ],'关闭检查不会补上缺失的信息。迁移时可以逐步收紧配置，但必须认识到检查范围变化，不能把消失的红线当作正确性证据。',[
    '选项改变的是检查行为。','没有新增类型标注或运行判断。','错误不再报告不等于问题被修复。',
  ],{stage:'reason'}),
  task(id(6),6,'为映射函数补足契约','实现 doubleAll(values)，只接受 number[]，返回每个元素翻倍的新数组，保留原数组。',
    'export function doubleAll(values) { return values.map(value => value * 2); }',
    'export function doubleAll(values: number[]): number[] { return values.map(value => value * 2); }',[
      ok('输入输出都是数字数组','import {doubleAll} from "./main";const n:number[]=doubleAll([1,2]);'),
      bad('拒绝混合数组','import {doubleAll} from "./main";doubleAll([1,"2"]);'),
    ],'参数注解给数组和 map 回调提供上下文，回调参数可自动推断。无需给每个局部变量重复注解。',[
      '外层数组类型决定回调元素类型。','参数只接受数字数组。','map 创建新数组，保留原数组。',
    ],{runtime:[run('翻倍且不修改输入','const a=[1,2,0];equal(load("main.js").doubleAll(a),[2,4,0]);equal(a,[1,2,0]);')]}),
  mc(id(6),7,'严格模式与数据来源','严格模式项目读取 localStorage 得到 string | null，合理做法是？',[
    '处理缺失的 null，并根据需要进一步解析文本',
    '使用 ! 后认为数据一定存在且正确',
    '认为 strict 会填充默认数据',
    '把所有读取都改成 number',
  ],'严格模式暴露 API 的真实可空契约。缺失与解析失败都应根据业务处理，不能用非空断言生成默认值。',[
    'localStorage 中可能没有这个键。','非空断言没有运行效果。','先处理 null，再决定如何解析实际文本。',
  ],{stage:'reason'}),
  task(id(6),8,'迁移：安全的标签长度','实现 labelLength(text: string | null)，null 返回 0，其余返回文本长度；不得使用断言。',
    'export function labelLength(text: string | null): number { return text.length; }',
    'export function labelLength(text: string | null): number { return text === null ? 0 : text.length; }',[
      ok('接受可空文本','import {labelLength} from "./main";const n:number=labelLength(null);'),
      bad('拒绝 undefined','import {labelLength} from "./main";labelLength(undefined);'),
    ],'使用实际分支处理 null，既避免运行异常，也让编译器知道另一分支是 string。null 与 undefined 不应混为一谈。',[
      '题目只允许 null 作为缺失值。','空字符串也是合法文本。','null 分支返回零，字符串分支读取 length。',
    ],{runtime:[run('计算可空文本长度','const {labelLength}=load("main.js");equal(labelLength(null),0);equal(labelLength("TS"),2);equal(labelLength(""),0);')]}),
  mc(id(6),9,'复测：推断回调参数','已知 names: string[]，names.map(name => name.length) 中的 name 在 strict 下需要手动标注吗？',[
    '不一定，数组方法的上下文已经提供 string 类型',
    '必须把 name 写成 any',
    '每个箭头函数都不能使用推断',
    'name 会是 number，因为返回了 length',
  ],'上下文类型可以推断回调参数。回调返回 number 不会把输入字符串改成数字。',[
    'map 来自 string[]。','输入类型与返回类型不同。','严格检查允许基于上下文的可靠推断。',
  ]),
  task(id(6),10,'复测：有默认值的总价','实现 withFee(price:number, fee?:number)：fee 缺失时加 5，显式为 0 时不加费用。',
    'export function withFee(price: number, fee?: number): number { return price + fee; }',
    'export function withFee(price: number, fee?: number): number { return price + (fee ?? 5); }',[
      ok('可省略费用','import {withFee} from "./main";const n:number=withFee(10);'),
      bad('拒绝字符串费用','import {withFee} from "./main";withFee(10,"5");'),
    ],'可选参数可能是 undefined。使用 ?? 区分缺失与有效的零，避免 || 把零费用误换成默认费用。',[
      '需要处理 undefined，而不是所有假值。','零费用是有效输入。','用空值合并给 fee 提供默认值。',
    ],{runtime:[run('区分默认与零费用','const {withFee}=load("main.js");equal(withFee(10),15);equal(withFee(10,0),10);equal(withFee(10,2),12);')]}),
];
