export function addIntroDepthExercises({ choice }) {
  const scenarios = [
    ['intro','跨环境脚本如何处理宿主能力','一个工具函数要在浏览器主线程和 Web Worker 中复用，只有浏览器主线程才更新页面。哪种设计最稳妥？','',['把纯计算与 DOM 更新分开；在拥有 document 的环境中调用 DOM 层','在公共函数里直接读取 document.body','把 document 当作 ECMAScript 内建对象','在 Worker 里把 window 设为任意空对象就能操作真实页面'],['纯计算不需要宿主 DOM。','Worker 无法直接访问页面节点。','通过消息把结果交给主线程渲染。'],'把计算逻辑写成可移植函数，页面操作留在浏览器主线程；Worker 可以通过消息传递计算结果。'],
    ['intro','脚本、宿主和标准的职责','同一段 JavaScript 中，哪项能力主要由 ECMAScript 语言标准定义，而不是浏览器页面 API？','',['Array.prototype.map 的基本行为','document.querySelector','window.localStorage','HTMLButtonElement.click'],['语言内建对象与网页宿主对象不同。','Array 是 JavaScript 语言的内建类型。','document、window 与 HTML 元素来自浏览器平台。'],'Array.prototype.map 属于语言内建行为；DOM 和 Web Storage 属于浏览器提供的 Web API。'],
    ['intro','在 Worker 中更新页面的路径','Worker 计算出统计结果后需要显示到页面。哪种通信流程正确？','',['Worker postMessage(result)，主线程接收 message 后更新 DOM','Worker 直接 document.querySelector("#result").textContent=...','Worker 调用 window.alert 后自动同步页面','把结果存入 Worker 的局部变量，页面会自动观察到'],['Worker 没有页面 DOM。','消息是线程间传递数据的通道。','主线程负责更新页面。'],'Worker 用 postMessage 把数据交给主线程，由主线程访问和修改 DOM。'],
    ['manuals-specifications','哪个标准负责 DOM 查询','你需要确认 querySelectorAll 返回的集合是否会随 DOM 变化自动更新。应优先查哪类规范？','',['DOM 标准及权威 API 文档，再用目标浏览器验证','只查 ECMAScript 数值运算章节','只查 CSS 颜色规范','只查 HTTP 状态码表'],['querySelectorAll 是 DOM API。','返回集合语义由 DOM 标准定义。','目标环境还需要兼容性验证。'],'DOM 查询集合行为应在 DOM 标准或权威 API 文档核对；它不是 ECMAScript 算术规则。'],
    ['manuals-specifications','提案阶段与生产兼容','一个新语法仍处于提案阶段，教程示例能在最新浏览器实验标志下运行。能否直接假定所有目标用户都支持？','',['不能；核对标准化状态、目标环境兼容性及构建转译方案','能；实验标志表示稳定标准','能；教程出现过就代表全部浏览器支持','只需更换编辑器主题即可'],['实验实现与普遍可用不同。','语法支持与运行时 API 支持也不同。','目标用户的浏览器矩阵决定发布策略。'],'提案和实验实现不能替代目标环境兼容性验证；必要时采用转译或替代方案。'],
    ['manuals-specifications','如何处理资料相互矛盾','两份文章对同一语言边界情况给出不同结论。哪种核对顺序最可靠？','',['查当前规范条文与官方测试/目标引擎实测，记录版本和条件','选发布时间更早的文章','选字数更多的文章','把两个结论平均'],['边界行为可能受版本影响。','规范给出预期语义。','最小可复现测试揭示实际实现。'],'先明确语法版本和运行条件，再用规范与目标环境验证，而不是按文章篇幅或印象判断。'],
    ['code-editors','静态检查与单元测试分工','编辑器的类型检查已通过，是否就能证明异步请求乱序时页面一定显示最新结果？','',['不能；仍需构造乱序响应的行为测试','能；类型检查保证所有执行顺序','能；代码格式化后更能保证','只要文件扩展名为 .ts 就能'],['类型检查关注静态约束。','竞态取决于运行时完成顺序。','用可控 Promise 测试旧请求晚到。'],'静态检查无法证明异步时序正确；需要针对竞态的运行测试。'],
    ['code-editors','自动保存后的代码格式变化','编辑器保存时自动格式化，把多行表达式合并为一行。若行为测试失败，应先判断什么？','',['查看实际 diff 与失败用例，确认是语义变化还是原有逻辑问题','只要格式化成功就忽略测试','先删除全部测试','把文件改名为 .txt'],['格式化通常不应改变语义。','失败证据来自实际 diff 和用例。','不要仅凭视觉变化推断根因。'],'比较代码差异与测试失败条件，才能确认是配置/工具问题还是原本的业务缺陷。'],
    ['code-editors','代码补全不是 API 支持证明','编辑器能补全某浏览器 API，但旧版目标浏览器运行时不存在该 API。最合适的处理是什么？','',['查看目标版本兼容性并做特性检测或替代实现','因为编辑器有补全，所以忽略运行错误','只在代码里添加注释','把 API 名改成小写'],['补全基于类型声明或索引。','运行时支持取决于具体浏览器版本。','可检测能力并提供降级。'],'编辑器提示不能证明部署环境支持；必须按目标浏览器兼容性设计。'],
    ['devtools','区分请求成功与页面解析失败','Network 显示接口返回 200，但页面仍展示空数据。下一步哪组证据最有帮助？','',['查看 Response 内容、Console 异常和调用栈，确认解析与渲染步骤','只看状态码 200 就宣布页面正常','只清除浏览器历史','只检查屏幕亮度'],['HTTP 200 只说明请求层状态。','响应内容可能不符合预期。','解析或渲染也可能抛错。'],'同时检查响应体和运行时异常，才能区分数据、解析与渲染环节的问题。'],
    ['devtools','断点的单步方式','断点停在调用 parse(data) 的一行。想进入 parse 函数内部逐行看执行，通常选择哪种调试操作？','',['Step into','Step over','Resume','Disable breakpoints'],['into 表示进入被调用函数。','over 表示把调用当一步跨过。','resume 继续运行直到下一断点。'],'Step into 会进入当前调用的函数内部，有助于查看 parse 的具体执行。'],
    ['devtools','定位布局卡顿的证据','滚动页面时偶尔明显卡顿，怀疑 scroll 回调造成频繁布局。开发者工具里最适合先检查什么？','',['Performance 录制中的长任务、布局计算和调用栈','只看 Network 的 favicon','只看 Elements 中的文本颜色','只看 Sources 文件名长度'],['卡顿与主线程工作量相关。','Performance 可显示脚本和布局耗时。','调用栈能关联到具体回调。'],'性能录制能显示脚本执行和布局开销，从而判断 scroll 回调是否引发布局抖动。']
  ];
  const counters=new Map();
  for (const [lessonId,title,prompt,example,options,hints,explanation] of scenarios) {
    const index=(counters.get(lessonId)||0)+1;
    counters.set(lessonId,index);
    choice(`${lessonId}-depth-${String(index).padStart(2,'0')}`,lessonId,title,prompt,example,options,0,hints,explanation);
  }
}
