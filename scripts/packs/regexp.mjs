export function addRegexpExercises({ code, choice }) {
  choice('regexp-introduction-01', 'regexp-introduction', '全局与大小写不敏感的组合',
    '要在文本中找到全部 JS、js、Js（但不匹配 JSS），哪种正则与使用方式最合适？',
    'const text = "JS js Js JSS";',
    ['text.match(/\\bjs\\b/gi)', 'text.match(/js/i)', 'text.match(/^js$/g)', 'text.match(/js/g)'], 0,
    ['g 负责找全部匹配。', 'i 负责忽略大小写。', '词边界可避免把 JSS 的前两字符当成独立单词。'],
    '使用 /\\bjs\\b/gi 能匹配所有大小写变体，同时要求两侧是词边界；match 没有 g 时只返回首个匹配。');

  code('regexp-character-classes-01', 'regexp-character-classes', '提取日志中的两位状态码',
    '实现 extractStatusCodes(log)：只提取形如 status= 后紧跟恰好两位十进制数字，且下一位不是数字的状态码，返回数字数组。',
    'function extractStatusCodes(log) {\n  // 在这里实现\n}',
    [['多个匹配', 'assert.deepEqual(extractStatusCodes("status=20; status=04"),[20,4])'], ['不能截断更长数字', 'assert.deepEqual(extractStatusCodes("status=200 status=7 status=99"),[99])'], ['无匹配', 'assert.deepEqual(extractStatusCodes("status=ok"),[])']],
    ['\\d 表示数字，{2} 表示恰好两次。', '还需防止第三位也是数字。', '用 (?!\\d) 检查后面不是数字，再从 matchAll 的捕获组转成 Number。'],
    'function extractStatusCodes(log) {\n  return Array.from(log.matchAll(/status=(\\d{2})(?!\\d)/g), match => Number(match[1]));\n}',
    '匹配两位数字后增加负向前瞻，避免把 200 的前两位误认为独立状态码；捕获组只留下需要转换的数字。');

  code('regexp-unicode-01', 'regexp-unicode', '提取多语言字母片段',
    '实现 letterRuns(text)：提取连续 Unicode 字母片段，返回字符串数组。中文、拉丁字母都算字母；数字与空格分隔片段。',
    'function letterRuns(text) {\n  // 在这里实现\n}',
    [['中英文混合', 'assert.deepEqual(letterRuns("Hi你好 42世界"),["Hi你好","世界"])'], ['非 BMP 字母', 'assert.deepEqual(letterRuns("A𐐷B 7"),["A𐐷B"])'], ['没有字母', 'assert.deepEqual(letterRuns("123 !"),[])']],
    ['\\w 主要是 ASCII 单词字符，不适合多语言字母。', 'Unicode 属性转义使用 \\p{L}。', '属性转义需要 u 标志；全局查找还需要 g。'],
    'function letterRuns(text) {\n  return text.match(/\\p{L}+/gu) ?? [];\n}',
    '\\p{L} 表示 Unicode 字母类别，u 标志启用 Unicode 属性转义；g 找出所有连续片段。');

  code('regexp-anchors-01', 'regexp-anchors', '整串验证工单编号',
    '实现 isTicketId(value)：仅接受整串格式为 T- 后跟 4 位 ASCII 数字的编号。前后空格或多余字符都应拒绝。',
    'function isTicketId(value) {\n  // 在这里实现\n}',
    [['有效编号', 'assert.equal(isTicketId("T-0042"),true)'], ['前后多余内容', 'assert.equal(isTicketId(" T-0042"),false);assert.equal(isTicketId("T-0042x"),false)'], ['长度与前缀', 'assert.equal(isTicketId("T-42"),false);assert.equal(isTicketId("t-0042"),false)']],
    ['验证整串时需要起点与终点锚点。', '只允许 T- 和恰好四位数字。', '使用 /^T-[0-9]{4}$/。'],
    'function isTicketId(value) {\n  return /^T-[0-9]{4}$/.test(value);\n}',
    '^ 和 $ 将匹配限制到整串，避免从较长字符串中截出看似合法的片段。');

  code('regexp-multiline-mode-01', 'regexp-multiline-mode', '只提取行首 TODO',
    '实现 todoLines(text)：找出每行以 TODO: 开头的内容（冒号后可有空格），返回去掉标记和首尾空格后的文本。行中间的 TODO: 不算。',
    'function todoLines(text) {\n  // 在这里实现\n}',
    [['多行', 'assert.deepEqual(todoLines("TODO: A\\nnot TODO: B\\nTODO: C"),["A","C"])'], ['允许空格与空内容', 'assert.deepEqual(todoLines("TODO:   first   \\nTODO:"),["first",""])'], ['没有匹配', 'assert.deepEqual(todoLines("note TODO: X"),[])']],
    ['m 让 ^ 匹配每一行开头。', 'g 用于找多行；冒号后捕获到换行前。', '对每个捕获结果调用 trim。'],
    'function todoLines(text) {\n  return Array.from(text.matchAll(/^TODO:([^\\r\\n]*)/gm), match => match[1].trim());\n}',
    '没有 m 时 ^ 只对应整个文本开头；有 m 后可从每行开头识别 TODO。捕获范围排除换行。');

  choice('regexp-boundary-01', 'regexp-boundary', '词边界不是空格边界',
    '在 ASCII 文本中，/\\bcat\\b/g 会匹配哪些片段？',
    '"cat scatter cat! cat_"',
    ['只匹配开头 cat', '匹配开头 cat 和感叹号前 cat，但不匹配 scatter 或 cat_', '匹配所有四个 cat', '只匹配 scatter 中的 cat'], 1,
    ['\\b 检查单词字符与非单词字符的交界。', '下划线属于单词字符。', 'scatter 中的 cat 左边也是单词字符。'],
    '开头和感叹号前的 cat 两侧形成词边界；scatter 内部和 cat_ 后面的边界条件不满足。');

  code('regexp-escaping-01', 'regexp-escaping', '把用户输入当作字面文本搜索',
    '实现 countLiteral(text, query)：统计 query 在 text 中不重叠的出现次数，query 可包含 .、*、[、\\ 等正则特殊字符；空 query 返回 0。区分大小写。',
    'function countLiteral(text, query) {\n  // 在这里实现\n}',
    [['点号按字面匹配', 'assert.equal(countLiteral("a.b axb a.b","a.b"),2)'], ['特殊符号与反斜杠', 'assert.equal(countLiteral("x[y] x[y]","[y]"),2);assert.equal(countLiteral("a\\\\b a\\\\b","\\\\"),2)'], ['空文本与空查询', 'assert.equal(countLiteral("abc",""),0);assert.equal(countLiteral("","x"),0)']],
    ['不能把 query 直接传给 RegExp。', '先对正则元字符做转义。', '用 query.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")，再构造全局正则。'],
    'function countLiteral(text, query) {\n  if (!query) return 0;\n  const escaped = query.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");\n  return (text.match(new RegExp(escaped, "g")) ?? []).length;\n}',
    '动态生成正则前要先转义用户文本中的元字符，否则 .、[ 等会改变匹配语义，甚至使正则构造失败。', '稍有难度');

  code('regexp-character-sets-and-ranges-01', 'regexp-character-sets-and-ranges', '识别十六进制颜色',
    '实现 hexColors(text)：提取形如 #RGB 或 #RRGGBB 的独立颜色值，大小写均可；后面如果仍是十六进制字符则不应截断成短颜色。返回出现顺序中的原始文本。',
    'function hexColors(text) {\n  // 在这里实现\n}',
    [['三位与六位', 'assert.deepEqual(hexColors("#abc and #A0b1C2"),["#abc","#A0b1C2"])'], ['拒绝截断四五位', 'assert.deepEqual(hexColors("#abcd #abcde #1234567"),[])'], ['标点分隔', 'assert.deepEqual(hexColors("(#f0a),#001122!"),["#f0a","#001122"])']],
    ['字符集写作 [0-9a-f]，再使用 i 标志。', '六位分支应放在三位分支之前。', '结尾要确认下一字符不是十六进制字符。'],
    'function hexColors(text) {\n  return text.match(/#(?:[0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-f])/gi) ?? [];\n}',
    '选择分支时先尝试六位，再尝试三位；负向前瞻防止把较长连续十六进制串的前缀误判为颜色。');

  code('regexp-quantifiers-01', 'regexp-quantifiers', '限定用户代号长度',
    '实现 validHandle(text)：只接受 3～12 位 ASCII 字母、数字、下划线组成的整串，首位必须是字母或下划线。',
    'function validHandle(text) {\n  // 在这里实现\n}',
    [['边界长度', 'assert.equal(validHandle("_ab"),true);assert.equal(validHandle("a12345678901"),true)'], ['长度越界', 'assert.equal(validHandle("ab"),false);assert.equal(validHandle("a123456789012"),false)'], ['非法字符', 'assert.equal(validHandle("1ab"),false);assert.equal(validHandle("ab-c"),false)']],
    ['第一位单独写规则。', '剩下需要 2～11 位。', '用起止锚点和 {2,11}。'],
    'function validHandle(text) {\n  return /^[A-Za-z_][A-Za-z0-9_]{2,11}$/.test(text);\n}',
    '总长度 3～12，首位占一位，所以后续量词范围是 2～11。锚点阻止局部匹配。');

  code('regexp-greedy-and-lazy-01', 'regexp-greedy-and-lazy', '提取多段方括号内容',
    '实现 bracketValues(text)：提取每对方括号内的内容，允许空内容，但不处理嵌套括号；返回字符串数组。',
    'function bracketValues(text) {\n  // 在这里实现\n}',
    [['多段不能合并', 'assert.deepEqual(bracketValues("[a] x [b]"),["a","b"])'], ['空段与标点', 'assert.deepEqual(bracketValues("[] [x y]"),["","x y"])'], ['未闭合忽略', 'assert.deepEqual(bracketValues("[open"),[])']],
    ['贪婪 .* 可能把多段合并成一段。', '惰性 .*? 会尽早停在右括号。', '也可以用排除右括号的字符集 [^\\]]*。'],
    'function bracketValues(text) {\n  return Array.from(text.matchAll(/\\[(.*?)\\]/g), match => match[1]);\n}',
    '惰性量词让每次匹配在最近的右括号结束，避免 [a] x [b] 被贪婪的 .* 合并。');

  code('regexp-groups-01', 'regexp-groups', '从日期文本提取命名字段',
    '实现 parseIsoDay(value)：仅接受 YYYY-MM-DD 格式，返回 {year,month,day} 三个数字字段；格式不符返回 null。这里仅检查格式，不验证真实日历日期。',
    'function parseIsoDay(value) {\n  // 在这里实现\n}',
    [['有效格式', 'assert.deepEqual(parseIsoDay("2026-09-07"),{year:2026,month:9,day:7})'], ['必须整串匹配', 'assert.equal(parseIsoDay("x2026-09-07"),null);assert.equal(parseIsoDay("2026-9-07"),null)'], ['格式与日期验证分开', 'assert.deepEqual(parseIsoDay("2026-99-99"),{year:2026,month:99,day:99})']],
    ['用捕获组分别保留三个字段。', '命名组可读性更高：(?<year>...)。', '匹配整串后，把 groups 中的字符串转成数字。'],
    'function parseIsoDay(value) {\n  const match = /^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$/.exec(value);\n  if (!match) return null;\n  return { year:Number(match.groups.year), month:Number(match.groups.month), day:Number(match.groups.day) };\n}',
    '命名捕获组让字段含义明确。正则只验证格式；真实日期的有效性需要额外逻辑，不应由这个题目的测试暗中要求。');

  code('regexp-backreferences-01', 'regexp-backreferences', '找出连续重复的单词',
    '实现 repeatedWords(text)：找出连续重复的 ASCII 单词，例如 "go go"，忽略大小写；返回第一次出现的单词原样组成的数组。单词间可以有多个空白字符。',
    'function repeatedWords(text) {\n  // 在这里实现\n}',
    [['大小写与空白', 'assert.deepEqual(repeatedWords("Go go and NO  no"),["Go","NO"])'], ['不同单词不算重复', 'assert.deepEqual(repeatedWords("go gone"),[])'], ['多个片段', 'assert.deepEqual(repeatedWords("a a, b b"),["a","b"])']],
    ['先捕获一个单词。', '后面用反向引用要求重复同一内容。', 'i 标志忽略大小写，g 标志找全部。'],
    'function repeatedWords(text) {\n  return Array.from(text.matchAll(/\\b([A-Za-z]+)\\s+\\1\\b/gi), match => match[1]);\n}',
    '反向引用 \\1 要求第二个单词与捕获的第一个单词相同；词边界避免把 go gone 的前缀当成重复。');

  choice('regexp-alternation-01', 'regexp-alternation', '选择分支顺序影响结果',
    '执行下面的 match，返回哪个字符串？',
    '"catalog".match(/cat|catalog/)[0]',
    ['catalog', 'cat', '两个结果都返回', 'null'], 1,
    ['分支从左到右尝试。', '左侧 cat 已经成功匹配。', '正则不会因为右边更长就自动改选右侧。'],
    '结果是 cat。选择分支按从左到右尝试，先成功的 cat 已足够；如需优先完整词，应调整顺序或边界。');

  code('regexp-lookahead-lookbehind-01', 'regexp-lookahead-lookbehind', '读取等号后的数字但不包括等号',
    '实现 settingValues(text)：仅提取 key= 后面的十进制数字，key 固定小写，数字之后不能继续是数字或字母；返回数字数组。',
    'function settingValues(text) {\n  // 在这里实现\n}',
    [['多个设置', 'assert.deepEqual(settingValues("key=12; key=03"),[12,3])'], ['拒绝后缀', 'assert.deepEqual(settingValues("key=12x key=4a key=7"),[7])'], ['不接受其他键', 'assert.deepEqual(settingValues("mykey=4 other=2"),[])']],
    ['负向后瞻可要求 key 前面不是其他单词字符。', '捕获数字，然后用负向前瞻检查数字后面。', '从捕获组取数值，不把 key= 放入结果。'],
    'function settingValues(text) {\n  return Array.from(text.matchAll(/(?<![A-Za-z0-9_])key=(\\d+)(?![A-Za-z0-9])/g), match => Number(match[1]));\n}',
    '负向后瞻防止从 mykey 中间开始匹配，负向前瞻阻止截断带字母后缀的值；捕获组只保留数字。', '稍有难度');

  choice('regexp-catastrophic-backtracking-01', 'regexp-catastrophic-backtracking', '识别可能指数级回溯的模式',
    '攻击者能控制输入字符串。以下哪个正则最应警惕长串 a 后再跟 ! 时的灾难性回溯？',
    '',
    ['/^a+$/', '/^(a+)+$/', '/^a{1,20}$/', '/^a*?$/'], 1,
    ['关注嵌套的重复量词。', '多种切分方式会在失败时被反复尝试。', '内层 a+ 与外层 + 重叠。'],
    '/^(a+)+$/ 的嵌套重复可以把同一段 a 以大量方式切分；尾部失败时可能产生极高回溯成本。对不可信长输入应改写为简单的 /^a+$/。');

  code('regexp-sticky-01', 'regexp-sticky', '从指定偏移处精确读取令牌',
    '实现 readWordAt(text, offset)：只在 offset 位置开始读取连续 ASCII 字母，返回 {value,next}；该位置不是字母则返回 null。不能跳过空格寻找后面的单词。',
    'function readWordAt(text, offset) {\n  // 在这里实现\n}',
    [['指定位置', 'assert.deepEqual(readWordAt("ab cd",3),{value:"cd",next:5})'], ['不能向后搜索', 'assert.equal(readWordAt("ab cd",2),null)'], ['起点与末尾', 'assert.deepEqual(readWordAt("Hello!",0),{value:"Hello",next:5});assert.equal(readWordAt("Hi",2),null)']],
    ['粘性 y 要求从 lastIndex 位置匹配。', '先设置 regex.lastIndex = offset。', '执行 exec，匹配成功后 lastIndex 是下一位置。'],
    'function readWordAt(text, offset) {\n  const pattern = /[A-Za-z]+/y;\n  pattern.lastIndex = offset;\n  const match = pattern.exec(text);\n  return match ? { value:match[0], next:pattern.lastIndex } : null;\n}',
    'y 标志要求匹配从 lastIndex 精确开始；普通 g 标志在当前位置失败后可能继续向后搜索，不符合词法扫描要求。');

  code('regexp-methods-02', 'regexp-methods', '用回调安全替换占位符',
    '实现 renderTemplate(template, values)：替换 {{key}} 占位符，key 只允许字母和下划线开头、后续字母数字下划线。若 values 自身没有该键，原样保留占位符。值要转成字符串，允许值里包含 $& 等特殊字符。',
    'function renderTemplate(template, values) {\n  // 在这里实现\n}',
    [['替换已知键', 'assert.equal(renderTemplate("Hi {{name}}",{name:"Lin"}),"Hi Lin")'], ['保留缺失键', 'assert.equal(renderTemplate("{{known}} {{missing}}",{known:0}),"0 {{missing}}")'], ['值中的替换元字符按字面保留', 'assert.equal(renderTemplate("{{x}}",{x:"$&"}),"$&")'], ['不读取继承属性', 'const v=Object.create({secret:"x"});assert.equal(renderTemplate("{{secret}}",v),"{{secret}}")']],
    ['String.replace 接受回调函数。', '回调返回值不会把 $& 当成替换指令再次展开。', '用 Object.hasOwn 区分自身键与原型链属性。'],
    'function renderTemplate(template, values) {\n  return template.replace(/\\{\\{([A-Za-z_][A-Za-z0-9_]*)\\}\\}/g, (whole, key) => Object.hasOwn(values,key) ? String(values[key]) : whole);\n}',
    'replace 的回调形式适合动态值：返回的 $& 会按字面插入。使用 Object.hasOwn 可以避免意外读取原型链上的属性。', '稍有难度');

  const reviewVariants = [
    ['regexp-introduction-02','正则对象的状态为何改变','同一个带 g 标志的正则对象连续调用 test，为什么第二次可能得到 false？','const pattern=/a/g;\npattern.test("a");\npattern.test("a");',['因为 g 正则会记录 lastIndex，第一次匹配后位置改变','因为 test 会删除输入字符串','因为第二次调用自动关闭 i 标志','因为 JavaScript 正则只能调用一次'],0,['g 正则有可变的 lastIndex。','第一次成功后 lastIndex 移动到匹配末尾。','第二次从末尾开始找，失败后才可能重置。'],'带 g 或 y 的同一个 RegExp 对象在 test/exec 之间保留 lastIndex，复用时要理解其状态。'],
    ['regexp-character-classes-02','区分数字与任意字符','验证四位数字 PIN，以下哪种写法能拒绝 12a4 与 12345？','',['/^\\d{4}$/','/\\d{4}/','/^.{4}$/','/\\d+/'],0,['需要数字类和精确次数。','还要限制整串匹配。','没有锚点会接受更长文本中的四位数字。'],'^\\d{4}$ 要求整个字符串恰好由四位数字组成。'],
    ['regexp-unicode-02','点号与 Unicode 码点','在带 u 标志时，/^.$/u 测试单个非 BMP 表情符号（例如 🙂）的结果通常是什么？','',['true，因为 u 模式按 Unicode 码点处理该字符','false，因为表情符号永远是两个字符','抛出 SyntaxError','只有加 g 才为 true'],0,['JavaScript 字符串用代理对表示部分字符。','u 标志改变正则对代理对的处理。','点号在 u 模式下可匹配一个完整码点。'],'u 模式使正则按 Unicode 码点处理代理对，单个非 BMP 表情符号可以被一个点号匹配。'],
    ['regexp-anchors-02','只接受完整参数','下列哪个正则能验证整串是 yes 或 no，而不会接受 yesterday？','',['/^(?:yes|no)$/','/^yes|no$/','/yes|no/','/^(yes|no)/'],0,['分组应把两个候选词放在同一范围。','起点和终点都要约束整组。','/^yes|no$/ 的锚点分别只作用于对应分支。'],'/^(?:yes|no)$/ 对两个候选词整体使用首尾锚点；把选择分支放在锚点之外会造成局部匹配。'],
    ['regexp-multiline-mode-02','m 标志改变什么','文本为 "a\\nb"。执行 /^b/m.test(text) 与 /^b/.test(text) 分别得到什么？','',['true、false','false、true','true、true','false、false'],0,['m 让 ^ 也能匹配换行后的行首。','没有 m 时 ^ 只匹配整个文本开头。','第二行以 b 开头。'],'带 m 时 ^ 可匹配第二行开头，因此为 true；不带 m 时整个文本开头是 a，因此为 false。'],
    ['regexp-boundary-02','中文词边界的陷阱','开发者想用 /\\b你好\\b/ 判断中文词语“你好”是否作为独立词出现。为什么这个方案不可靠？','',['JavaScript 的常规单词边界主要围绕单词字符定义，不能直接当中文分词器','因为 b 只能匹配数字','因为中文不能出现在 JavaScript 字符串中','因为 g 标志必须存在'],0,['\\b 基于单词字符与非单词字符的边界。','中文分词比 ASCII 单词边界复杂。','按产品语义设计分隔规则或使用分词工具。'],'常规 \\b 不是通用的自然语言分词边界；中文词界需要按业务规则或专门的分词方法处理。'],
    ['regexp-escaping-02','正则字面量中的点号','想只匹配文件名 report.txt，且不接受 reportXtxt，哪种正则正确？','',['/^report\\.txt$/','/^report.txt$/','/report.txt/','/^report[.]txt/gi'],0,['点号未转义时匹配任意单字符。','还需首尾锚点。','\\. 代表字面句点。'],'/^report\\.txt$/ 把句点转义并约束整串；未转义的点号可能匹配任意字符。'],
    ['regexp-character-sets-and-ranges-02','字符集里的横杠','需要匹配单个小写字母或字面横杠，且不想让横杠表示范围。哪种写法清楚可靠？','',['/[a-z-]/','/[a-z]/','/[a-z0-9]/','/[a-z]/g'],0,['横杠放在字符集末尾可按字面理解。','只写 [a-z] 不包含横杠。','字符集只匹配一个字符。'],'[a-z-] 把横杠放在末尾，表示小写字母或字面横杠。'],
    ['regexp-quantifiers-02','可选段重复次数','要匹配 2 到 4 个连续的十六进制字符，且整串不能有其他内容，哪个正则正确？','',['/^[0-9a-fA-F]{2,4}$/','/[0-9a-fA-F]{2,4}/','/^[0-9a-fA-F]{2,}$/','/^[0-9a-fA-F]{4}$/'],0,['字符集包含 0-9、a-f、A-F。','{2,4} 规定最小与最大次数。','锚点避免只匹配较长字符串中的一段。'],'区间量词 {2,4} 与首尾锚点组合，限制整个值只包含 2～4 个十六进制字符。'],
    ['regexp-greedy-and-lazy-02','惰性量词是否总能防跨标签','文本为 "<b>甲</b><i>乙</i>"。/<.*?>/g 相比 /<.*>/g 的主要差别是什么？','',['前者通常分段匹配各标签，后者可能从第一个 < 贪婪跨到最后一个 >','前者只能匹配 b 标签','后者是惰性的','两者结果一定完全相同'],0,['.* 会尽量多吃字符。','.*? 会优先尝试较早结束。','这仍不是完整 HTML 解析器。'],'惰性 .*? 在每次匹配中尽早寻找 >，贪婪 .* 则可能跨越多个标签。处理真实 HTML 应使用解析器。'],
    ['regexp-groups-02','非捕获组何时使用','想把两个词作为一个整体重复，但只需要捕获后面的数字。哪个模式能让数字出现在 match[1]？','const text="abab42";',['/^(?:ab)+([0-9]+)$/','/^(ab)+([0-9]+)$/','/^ab+([0-9]+)$/','/^([0-9]+)(?:ab)+$/'],0,['普通括号会占用一个捕获组编号。','(?:...) 分组但不捕获。','数字应成为第一个捕获组。'],'非捕获组 (?:ab) 可以组合并重复 ab，却不占用捕获索引，使数字落在 match[1]。'],
    ['regexp-backreferences-02','反向引用匹配同一分隔符','要匹配单引号或双引号包围的短文本，并确保结束引号与开始引号相同，哪种思路正确？','',['先捕获开头引号，再用反向引用匹配结尾','开始和结束分别用 ["\']，无需关联','只匹配文本内容，不检查引号','只使用 g 标志'],0,['两个字符集独立匹配会允许混用单双引号。','捕获开头的符号。','结尾引用同一个捕获组。'],'反向引用要求结束分隔符与开头捕获的分隔符一致；两个独立字符集不能保证这一点。'],
    ['regexp-alternation-02','替代分支的优先级','要匹配完整的 gray 或 grey，且不接受 grayish，哪种表达式正确？','',['/^gr(?:a|e)y$/','/^gray|grey$/','/gr(a|e)y/','/^(gray|grey)/'],0,['a/e 只影响一个位置。','整体需要首尾锚点。','非捕获组不影响结果语义。'],'/^gr(?:a|e)y$/ 同时约束两种拼写的完整字符串；缺少整体锚点可能接受附加字符。'],
    ['regexp-lookahead-lookbehind-02','不消费后续字符的检查','要提取后面紧跟 px 的数字，但返回结果中不含 px，哪个模式更直接？','',['/\\d+(?=px)/g','/\\d+px/g','/px(?=\\d+)/g','/^px\\d+$/g'],0,['前瞻检查后续文本但不消耗它。','数字才是希望返回的匹配内容。','(?=px) 要求当前位置后面是 px。'],'正向前瞻 (?=px) 要求数字后紧跟 px，却不把 px 放入整体匹配。'],
    ['regexp-catastrophic-backtracking-02','减少回溯风险的改写','只想验证整串由一个或多个 a 组成。现有 /^(a+)+$/ 在长输入失败时变慢，应优先如何改写？','',['/^a+$/','/^(a*)+$/','/^(a+)*$/','/^(a+)+$/g'],0,['避免对同一字符片段嵌套重复。','单层 a+ 已表达需求。','增加 g 不会消除嵌套回溯。'],'/^a+$/ 直接表达一个或多个 a，消除内外量词之间的大量分配方式。'],
    ['regexp-sticky-02','g 与 y 的当前位置语义','pattern.lastIndex=2 后，在 "a b" 上执行 /b/g 与 /b/y。哪种说法正确？','',['g 可从位置 2 往后寻找，y 必须恰好从位置 2 开始；本例两者都可能匹配 b','g 与 y 都只允许位置 0','g 必须位置 2，y 可以向后搜索','y 会忽略 lastIndex'],0,['字符串位置 2 恰好是 b。','g 可向后寻找，y 要求精确起点。','换成 lastIndex=1 时行为会不同。'],'g 从 lastIndex 起向后搜索，y 要求从 lastIndex 精确匹配；本例位置 2 恰好是 b，所以都能成功。'],
    ['regexp-methods-03','split 中的捕获组','下面 split 的结果为什么包含逗号和分号？','"a,b;c".split(/([,;])/);',['分隔符被捕获组包住，split 会把捕获内容放进结果','split 永远保留全部分隔符','因为使用了 g 标志','因为字符串包含两个分隔符'],0,['括号建立捕获组。','split 对捕获到的分隔符有特殊返回行为。','去掉括号可只保留字段。'],'split 的分隔正则含捕获组时，匹配到的分隔符也会进入结果；这可用于需要保留分隔符的解析。']
  ];
  for (const [id,title,prompt,example,options,correct,hints,explanation] of reviewVariants) {
    choice(id,id.replace(/-\d+$/, ''),title,prompt,example,options,correct,hints,explanation);
  }
}
