export function addBrowserMiscDepthExercises({ choice }) {
  const cases = [
    ['mutation-observer','只观察指定属性的变化','只想观察 #card 的 data-state 属性变化，不需要子节点记录。哪组 MutationObserver 选项最合适？','',['{attributes:true,attributeFilter:["data-state"]}','{childList:true,attributeFilter:["data-state"]}','{characterData:true}','{attributes:false,subtree:true}'],['attributeFilter 用于筛选特性名。','观察特性变化需要 attributes:true。','childList 关注子节点增删。'],'attributes:true 配合 attributeFilter 可只收到 data-state 的属性变化记录。'],
    ['mutation-observer','停止观察后处理排队记录','组件销毁时不再希望收到回调，但已排队的变更记录也要先处理。哪个顺序更贴近需求？','',['先 observer.takeRecords() 取出待处理记录，再 observer.disconnect()','直接 disconnect() 后所有记录必定自动调用回调','先删除回调函数，再调用 observe()','只把 observer 变量设为 null 即停止观察'],['takeRecords 取得尚未交付的记录。','disconnect 停止后续观察。','只丢弃变量不等于断开观察器。'],'可先取出排队记录处理，再 disconnect 停止观察。'],
    ['mutation-observer','观察属性旧值','想在 MutationRecord.oldValue 中拿到属性改变前的值，应如何配置观察器？','',['设置 attributes:true 与 attributeOldValue:true','只设置 childList:true','只设置 characterDataOldValue:true','无需选项，oldValue 永远自动提供'],['属性旧值不是默认必有。','attributeOldValue 针对属性变更。','还要观察 attributes。'],'观察属性并启用 attributeOldValue，记录中才可提供先前的属性值。'],
    ['selection-range','Range 的元素偏移与文本偏移','对文本节点调用 range.setStart(text,2)，对父元素调用 range.setStart(parent,2)，两个 2 分别代表什么？','',['文本中的字符偏移与元素的子节点边界偏移','都代表 CSS 像素','都代表第二个单词','文本节点和元素都只能用 0'],['Range 边界点由节点和 offset 共同定义。','文本节点按字符位置。','元素节点按子节点之间的位置。'],'同一个数字在文本节点是字符偏移，在元素节点是子节点边界偏移。'],
    ['selection-range','包裹部分元素会失败','Range 从 <i>abc</i> 中的字母 b 开始，却延伸到 i 元素外，调用 range.surroundContents(document.createElement("mark")) 可能怎样？','',['抛出异常；范围部分选中了非文本节点，不能直接包裹','总能成功并自动补齐 i 标签','只会把 b 删除','自动把整个文档包进 mark'],['surroundContents 对部分包含的非文本节点有限制。','范围只覆盖 i 的一部分并跨出该元素。','需要调整边界或采用拆分节点等方法。'],'范围部分包含 i 元素时，surroundContents 不能直接把它完整包入新元素，通常会抛错。'],
    ['selection-range','折叠 Range 后的状态','调用 range.collapse(true) 后，Range 通常变成什么？','',['起点和终点重合在原起点，collapsed 为 true','从文档删除所有选中节点','自动复制所选内容到剪贴板','范围被移到 document.body 末尾'],['collapse(true) 表示收缩到起点。','收缩后范围长度为零。','它不会删除或复制内容。'],'collapse(true) 使终点与起点重合，形成一个折叠的零长度范围。'],
    ['event-loop','await 已完成 Promise 仍不会中断长同步循环','async 函数里先执行一段耗时 3 秒的纯同步循环，之后才 await Promise.resolve()。循环期间页面为何仍可能卡住？','',['await 出现在循环之后，循环本身不会让出主线程','Promise.resolve 会自动把循环拆成小任务','async 函数从第一行起总在独立线程运行','浏览器一定在每次循环迭代后绘制'],['async 不会自动把同步代码搬到后台线程。','事件循环要等当前任务让出。','循环在第一个 await 之前完整执行。'],'长同步循环仍占据主线程；之后的 await 不能倒过来让前面的计算分段执行。'],
    ['event-loop','微任务连续追加会推迟绘制','一个 Promise 微任务每次执行又排入下一个微任务，持续很久。为什么 setTimeout 回调和页面绘制可能迟迟不发生？','',['事件循环会先清空微任务队列，持续追加可让它长期不空','setTimeout 总在每个微任务之前运行','Promise 回调默认运行在独立 CPU 核心','页面绘制只由网络请求触发'],['任务结束后通常先处理微任务。','微任务还能继续排微任务。','队列长期不空会推迟下一任务和渲染机会。'],'无休止的微任务链可造成任务与渲染饥饿，需要把工作适当分段。'],
    ['event-loop','分段处理大列表让界面有机会响应','一个任务要处理十万条记录，每条都同步计算。想让点击和绘制有机会穿插，哪种方案更可行？','',['分批处理并在批次间通过计时器或调度器交还控制权','只把外层函数声明为 async，不加入等待','把全部计算放在一个 Promise.then 回调里','把每条记录放进连续追加的微任务链'],['关键是让当前任务结束。','单个 Promise 回调仍可很长。','下一批安排为后续任务才能留下事件循环机会。'],'分批并在批次间让出主线程，可让浏览器处理输入和绘制。']
  ];
  const indexes = new Map();
  for (const [lessonId, title, prompt, example, options, hints, explanation] of cases) {
    const index = (indexes.get(lessonId) || 0) + 1;
    indexes.set(lessonId, index);
    choice(`${lessonId}-depth-${String(index).padStart(2, '0')}`, lessonId, title, prompt, example, options, 0, hints, explanation);
  }
}
