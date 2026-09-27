export function addThirdRegexpExercises({ choice, code }) {
  const scenarios = [
    ['regexp-introduction','matchAll 的全局要求','以下哪种写法能逐个遍历文本中的所有数字片段，并读取每个匹配的 index？','const text="a12 b34";',['for (const match of text.matchAll(/\\d+/g)) { /* match.index */ }','for (const match of text.matchAll(/\\d+/)) {}','text.match(/\\d+/).forEach(match=>match.index)','text.test(/\\d+/g)'],['matchAll 返回可迭代匹配结果。','传入 RegExp 时通常需要 g 标志。','每个结果带 index 属性。'],'matchAll 配合全局正则会按顺序产生所有匹配，并提供捕获组与起始位置。'],
    ['regexp-character-classes','空白字符不只有普通空格','要把一段文本里的制表符、换行和普通空格都当作分隔符，哪种字符类更合适？','',['\\s','[ ]','\\d','\\w'],['普通空格只是空白的一种。','\\s 包含多种空白字符。','\\d 与 \\w 含义不同。'],'\\s 匹配多种空白字符，可覆盖空格、制表符和换行等情况。'],
    ['regexp-anchors','行模式下整串验证的陷阱','验证整个输入只能是四位数字，为什么不该随意加 m 标志？','/^[0-9]{4}$/m.test("1234\nABCD")',['m 让 ^/$ 匹配行边界，可能只匹配其中一行而接受多行输入','m 会让数字变成字母','m 会强制匹配两次','m 只影响大小写'],['m 改变 ^ 和 $ 的锚点语义。','整串验证需要限制整个输入。','多行模式可能接受其中一行匹配。'],'m 模式下锚点可匹配行首行尾，不能无条件当作整串校验；需要按输入合同选择锚点和标志。'],
    ['regexp-boundary','下划线影响 ASCII 单词边界','/\\bfoo\\b/ 测试 "foo_bar" 会怎样？','',['不匹配；下划线通常属于单词字符，foo 后面没有词边界','匹配 foo','匹配 foo_bar 整串','抛出 SyntaxError'],['\\b 在单词字符与非单词字符之间成立。','下划线属于常规单词字符。','foo 后紧跟下划线。'],'foo 与下划线之间不是词边界，因此该模式不会把 foo 从 foo_bar 中切出。'],
    ['regexp-escaping','动态拼接正则前要转义什么','用户搜索词是 "a.b"，代码 new RegExp(query) 却把 "axb" 也匹配上。根因和修复是什么？','',['点号是元字符；先转义用户词中的正则特殊字符','只要加 g 标志即可','把字符串转成大写即可','用 i 标志关闭点号含义'],['正则里的 . 可匹配任意单字符。','用户词应按字面值处理。','构造 RegExp 前先转义。'],'动态正则必须转义用户文本中的元字符，才能把点号等符号当作普通字符匹配。'],
    ['regexp-character-sets-and-ranges','否定字符集的停止位置','模式 /[^,]+/g 用于处理 "a,b,c"，每段会在什么地方停止？','',['遇到逗号就停止，因为 [^,] 只匹配非逗号字符','只在句号处停止','永远不会停止','在任意数字处停止'],['字符集开头的 ^ 表示否定。','[^,] 排除逗号。','+ 使非逗号连续重复。'],'[^,]+ 每次匹配一段连续的非逗号字符，可用于简单的逗号分段，但不处理带引号的 CSV 语义。'],
    ['regexp-quantifiers','可选段的量词放在哪里','想匹配 color 和 colour 两种完整拼写，哪种模式最直接？','',['/^colou?r$/','/^color?u$/','/^colo?r$/','/^colou+r$/'],['两种拼写差一个 u。','问号使前一个字符可出现零或一次。','整串要有起止锚点。'],'colou?r 中 u 可出现零或一次，分别得到 color 与 colour。'],
    ['regexp-greedy-and-lazy','惰性匹配仍不是 HTML 解析器','/<.*?>/g 能拆出许多简单标签，但遇到带引号属性里的 > 时可能出错。最合适的结论是什么？','',['惰性量词只改变回溯偏好，真实 HTML 应交给 DOM/HTML 解析器','加 i 标志就能正确解析全部 HTML','把 .*? 改成 .* 就能正确解析','只要标签是 div 就绝不会出错'],['惰性只决定尽早结束。','HTML 语法有引号、注释和嵌套等结构。','正则示例不能替代完整解析器。'],'/<.*?>/g 可演示惰性匹配，但不能可靠处理所有 HTML 语法；真实内容用解析器。'],
    ['regexp-backreferences','非捕获组不会占用反向引用编号','模式 /(?:ab)(c)\\1/ 测试 "abcc" 会怎样？','',['匹配；\\1 引用第一个捕获组 c','不匹配；\\1 引用 ab','抛出 SyntaxError','只匹配 abc'],['(?:ab) 只分组，不捕获。','(c) 才是第一个捕获组。','\\1 要求后面再次出现 c。'],'非捕获组不计入捕获编号，因此 \\1 对应 c，abcc 能完整匹配。'],
    ['regexp-alternation','边界使左分支失败后再试右分支','对字符串 "catalog" 执行 /cat\\b|catalog/，得到哪个匹配？','',['catalog；cat 后面仍是单词字符，左分支边界失败后尝试右分支','cat；左分支永远优先','null；左分支失败就停止整个正则','两个分支都返回'],['分支左侧先尝试 cat\\b。','cat 后面的 a 仍是单词字符，\\b 不成立。','正则继续尝试同起点的右分支。'],'cat 后没有词边界，因此左分支失败；右侧 catalog 随后成功。'],
    ['regexp-catastrophic-backtracking','只限制输入长度够不够','一个正则有嵌套重叠量词，攻击者可提交长字符串。最根本的改进是什么？','',['重写模式以消除大量等价回溯路径，再视场景限制输入长度','只把 g 标志打开','只增加捕获组','只把超时设得更长'],['性能问题来自模式结构。','长度限制可缓解但不消除根因。','简化重叠重复通常更可靠。'],'灾难性回溯应从模式结构上消除歧义；输入长度限制是额外防线。'],
    ['regexp-sticky','粘性匹配失败后的 lastIndex','带 y 标志的正则 lastIndex=2，但位置 2 不匹配。exec 失败后，lastIndex 通常变成什么？','const r=/[a-z]+/y; r.lastIndex=2; r.exec("12!abc");',['0','2','3','字符串长度'],['y 要求在 lastIndex 精确位置匹配。','失败会重置状态。','与手动的游标变量区分。'],'带 g/y 的 RegExp 在 exec 失败后通常将 lastIndex 重置为 0；词法扫描器应管理自己的读取位置。']
  ];
  for (const [lessonId,title,prompt,example,options,hints,explanation] of scenarios) {
    choice(`${lessonId}-third-01`,lessonId,title,prompt,example,options,0,hints,explanation);
  }

  code('regexp-unicode-third-01','regexp-unicode','识别文本是否包含汉字',
    '实现 containsHan(text)：只要 text 中包含 Unicode Han 脚本字符就返回 true，否则 false。不能只检查固定的常用汉字码位范围。',
    'function containsHan(text) {\n  // 在这里实现\n}',
    [['常用汉字','assert.equal(containsHan("Hello 中文"),true)'], ['扩展汉字','assert.equal(containsHan("𠀀"),true)'], ['其他文字','assert.equal(containsHan("Hello 🙂 한글"),false)']],
    ['Unicode 属性转义可按 Script 分类。','Han 脚本写作 \\p{Script=Han}。','需要 u 标志。'],
    'function containsHan(text) {\n  return /\\p{Script=Han}/u.test(text);\n}',
    'Unicode 属性转义按文字系统识别字符，覆盖基本区以外的汉字；固定码位范围容易遗漏扩展区。');

  code('regexp-multiline-mode-third-01','regexp-multiline-mode','提取每行的错误消息',
    '实现 errorMessages(log)：只提取以 ERROR: 开头的行，冒号后可有空格或制表符；返回去除首尾空白后的消息数组。行中间出现 ERROR: 不算。',
    'function errorMessages(log) {\n  // 在这里实现\n}',
    [['多行和行中间内容','assert.deepEqual(errorMessages("ERROR: one\\nINFO: ERROR: skip\\nERROR:\\t two"),["one","two"])'], ['空消息','assert.deepEqual(errorMessages("ERROR:   \\nOK"),[""])'], ['没有匹配','assert.deepEqual(errorMessages("info only"),[])']],
    ['^ 配合 m 才能匹配每行开头。','不要用 \\s* 跨过换行，使用 [ \\t]*。','捕获到行尾前但排除换行。'],
    'function errorMessages(log) {\n  return Array.from(log.matchAll(/^ERROR:[ \\t]*([^\\r\\n]*)/gm),match=>match[1].trim());\n}',
    '多行模式让 ^ 对每行生效。只允许横向空白，避免把下一行内容错误吞入当前错误消息。');

  code('regexp-groups-third-01','regexp-groups','解析带命名组的审计记录',
    '实现 parseAudit(line)：仅接受形如 "WARN:AB12" 的整串，其中级别为 INFO、WARN、ERROR，代码为两个大写字母后跟两位数字。返回 {level,code}；格式不符返回 null。',
    'function parseAudit(line) {\n  // 在这里实现\n}',
    [['合法记录','assert.deepEqual(parseAudit("WARN:AB12"),{level:"WARN",code:"AB12"})'], ['拒绝局部匹配','assert.equal(parseAudit("xWARN:AB12"),null);assert.equal(parseAudit("INFO:AB123"),null)'], ['级别与代码约束','assert.equal(parseAudit("TRACE:AB12"),null);assert.equal(parseAudit("ERROR:Ab12"),null)']],
    ['用 ^ 和 $ 限制整串。','命名组分别捕获 level 与 code。','级别可用选择分支，代码用 [A-Z]{2}\\d{2}。'],
    'function parseAudit(line) {\n  const match=/^(?<level>INFO|WARN|ERROR):(?<code>[A-Z]{2}\\d{2})$/.exec(line);\n  return match ? {level:match.groups.level,code:match.groups.code} : null;\n}',
    '命名捕获组避免依赖数字位置读取字段；起止锚点保证整条记录都符合协议。');

  code('regexp-lookahead-lookbehind-third-01','regexp-lookahead-lookbehind','提取 USD 前的整数金额',
    '实现 usdAmounts(text)：提取紧挨着 " USD" 的独立十进制整数，返回数字数组。整数前不能是字母、数字或下划线；USD 后不能继续接字母。',
    'function usdAmounts(text) {\n  // 在这里实现\n}',
    [['多笔金额','assert.deepEqual(usdAmounts("12 USD; 003 USD"),[12,3])'], ['拒绝粘连','assert.deepEqual(usdAmounts("x12 USD 7 USDx 4 USD"),[4])'], ['无匹配','assert.deepEqual(usdAmounts("12 EUR"),[])']],
    ['负向后瞻排除金额前的单词字符。','正向前瞻要求数字后是空格和 USD。','USD 后再用负向前瞻排除字母。'],
    'function usdAmounts(text) {\n  return Array.from(text.matchAll(/(?<![A-Za-z0-9_])\\d+(?= USD(?![A-Za-z]))/g),match=>Number(match[0]));\n}',
    '前后断言限制金额的上下文但不把单位放入匹配结果，避免把标识符中间的数字误作金额。', '稍有难度');

  code('regexp-methods-third-01','regexp-methods','用替换回调标准化键值对',
    '实现 normalizeAssignments(text)：把所有形如 key = value 的片段标准化成 key=value，key 只能由字母开头、后续字母数字下划线组成，value 是连续数字；等号两边允许空格或制表符。不改动其他文本。',
    'function normalizeAssignments(text) {\n  // 在这里实现\n}',
    [['多处替换','assert.equal(normalizeAssignments("a = 12; b\\t=\\t3"),"a=12; b=3")'], ['不处理非法键','assert.equal(normalizeAssignments("1a = 2; a-b = 3"),"1a = 2; a-b = 3")'], ['保留其他文本','assert.equal(normalizeAssignments("note: x = 7!"),"note: x=7!")']],
    ['使用全局 replace。','捕获 key 和 value，回调返回 `${key}=${value}`。','限制 key 前不能是单词字符或连字符，避免从非法键中截取尾部。'],
    'function normalizeAssignments(text) {\n  return text.replace(/(?<![A-Za-z0-9_-])([A-Za-z][A-Za-z0-9_]*)[ \\t]*=[ \\t]*(\\d+)/g,(_,key,value)=>`${key}=${value}`);\n}',
    'replace 回调按捕获组重建规范形式。前置边界防止从 1a、a-b 等非法键中截出看似合法的后缀。', '稍有难度');
}
