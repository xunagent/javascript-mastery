export function addFormDepthExercises({ choice }) {
  const cases = [
    ['form-elements','复选框的 value 与 checked','<input type="checkbox" value="news"> 未勾选时，读取 input.value 与 input.checked 分别得到什么？','',['"news" 与 false','"" 与 false','"news" 与 true','undefined 与 false'],['value 是提交时可能使用的值。','checked 描述当前勾选状态。','未勾选不会把 value 清空。'],'未勾选时 value 仍为 "news"，checked 为 false。'],
    ['form-elements','textarea 的当前值','页面初始 <textarea>旧</textarea>，用户输入“新”。要读取当前内容，应该用什么？','',['textarea.value','textarea.innerHTML','textarea.getAttribute("value")','textarea.defaultValue'],['HTML 文本描述初始内容。','用户编辑后的当前内容在 value property。','不要用 innerHTML 读取当前输入。'],'textarea.value 反映用户当前输入；innerHTML 主要对应初始标记。'],
    ['focus-blur','给非交互元素设置程序聚焦','一个 div 用作键盘可操作面板，希望脚本调用 panel.focus() 有效，但不把它加入普通 Tab 顺序。通常设置什么？','',['tabindex="-1"','disabled','contenteditable="false"','aria-hidden="true"'],['普通 div 默认通常不可聚焦。','负 tabindex 允许程序聚焦。','-1 不进入常规顺序的 Tab 导航。'],'tabindex="-1" 允许脚本聚焦该元素，同时不让它加入常规 Tab 顺序。'],
    ['focus-blur','同一区域内部焦点移动','容器收到 focusout，event.relatedTarget 是容器内另一个输入框。若“离开整个容器”才关闭面板，应怎么判断？','',['容器 contains(relatedTarget) 为真时保持打开','每次 focusout 都立即关闭','只检查 event.target.tagName','调用 event.stopPropagation() 就能留住焦点'],['focusout 也会在内部控件之间转移时发生。','relatedTarget 表示将获得焦点的目标。','仍在容器内就不是离开整个区域。'],'用 relatedTarget 判断新焦点是否仍在容器里，可避免内部焦点切换时错误关闭面板。'],
    ['focus-blur','判断焦点是否仍在整块表单里','document.activeElement 是 #settings 内深层的 input。要判断焦点仍属于 #settings 区域，哪个表达式最合适？','',['settings.contains(document.activeElement)','settings === document.activeElement','document.activeElement === document.body','settings.matches(":focus")'],['activeElement 是实际获得焦点的最深层元素。','容器自身不一定是焦点元素。','contains 可检查焦点是否位于容器后代中。'],'使用 contains 判断当前焦点是否仍在容器子树内，而不是要求容器自身获得焦点。'],
    ['events-change-input','复选框状态改变后的事件','用户点击复选框切换 checked 后，想在变化时更新汇总，并读取当前状态。哪种做法最贴近需求？','',['监听 change，读取 checkbox.checked','监听 keyup，读取 checkbox.value','监听 cut，读取 checkbox.innerHTML','只在页面 load 时读取 checked'],['复选框可能由鼠标、键盘或辅助技术操作。','change 对状态变化有明确语义。','checked 给出当前布尔状态。'],'对复选框监听 change 并读取 checked，可在状态改变时更新汇总。'],
    ['events-change-input','粘贴事件与最终输入值的时序','在 paste 事件处理器里立即读取 input.value，为什么可能读不到刚粘贴的新文本？','',['paste 发生在默认插入完成前；input 事件更适合读取更新后的值','paste 只在粘贴图片时触发','input.value 永远不能读取粘贴内容','change 一定在 paste 之前触发'],['paste 是粘贴动作发生时的事件。','浏览器默认插入尚可能未完成。','input 在值发生变化后触发。'],'paste 处理期间输入值可能尚未更新；监听 input 更适合读取最终编辑后的值。'],
    ['forms-submit','回车键也能触发表单提交','表单只有文本输入和提交按钮。若只给按钮注册 click 校验，而不监听 form 的 submit，可能漏掉什么操作？','',['用户在输入框按 Enter 触发提交','用户点击按钮','用户移动鼠标','用户切换浏览器标签页'],['表单提交不只来自按钮的 click。','键盘 Enter 也可能触发提交。','校验应放在 form 的 submit 事件中。'],'监听表单 submit 能覆盖点击按钮和键盘提交等路径。'],
    ['forms-submit','表单控件名遮蔽同名方法','表单内有 name="submit" 的输入控件，代码直接调用 form.submit() 可能遇到什么问题？','',['form.submit 可能指向该控件而不是方法，调用会失败','浏览器一定会忽略该控件','submit 方法会自动重命名为 send','输入控件会在调用前自动删除'],['命名控件可能映射为表单对象属性。','该名称与表单方法冲突。','可避免冲突命名或从原型方法调用。'],'命名为 submit 的控件可能遮蔽 form.submit 方法，导致 form.submit() 不是函数。']
  ];
  const indexes = new Map();
  for (const [lessonId, title, prompt, example, options, hints, explanation] of cases) {
    const index = (indexes.get(lessonId) || 0) + 1;
    indexes.set(lessonId, index);
    choice(`${lessonId}-depth-${String(index).padStart(2, '0')}`, lessonId, title, prompt, example, options, 0, hints, explanation);
  }
}
