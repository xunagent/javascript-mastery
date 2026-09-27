export function addBrowserUiExercises({ code, choice, dom }) {
  choice('browser-environment-01','browser-environment','语言对象与页面对象',
    '要找出当前网页中 id 为 app 的元素，最直接使用哪个对象？',
    '',
    ['JSON','document','Math','Promise'],1,
    ['DOM 描述网页文档。','document 是页面 DOM 的入口。','使用 document.getElementById("app")。'],
    'document 是浏览器提供的文档对象，负责查询和操作当前页面的 DOM。');

  choice('dom-nodes-01','dom-nodes','区分元素节点与文本节点',
    '判断 div.firstChild 与 div.firstElementChild 的差别。',
    '<div id="box">文字<strong>强调</strong></div>',
    ['两者都是 strong','firstChild 是文本节点，firstElementChild 是 strong 元素','两者都是文本节点','firstElementChild 为 null'],1,
    ['firstChild 包含所有类型节点。','div 的第一个子节点是文字。','firstElementChild 只考虑元素。'],
    'DOM 树包含文本节点。firstChild 是“文字”对应的文本节点；firstElementChild 跳过文本节点，得到 strong。');

  dom('dom-navigation-01','dom-navigation','只遍历直接子元素',
    '页面有 #menu。定义 window.menuLabels()：只返回它的直接 li 子元素的纯文本内容数组；li 内部可能还有子元素，忽略空白首尾。不要把嵌套 li 当作直接项目。',
    '<ul id="menu"><li>首页</li><li><span>教程</span><ul><li>隐藏子项</li></ul></li></ul>',
    'window.menuLabels = function() {\n  // 在这里实现\n};',
    [['两个直接项目','const labels=window.menuLabels();assert.equal(labels.length,2);assert.equal(labels[0],"首页")'],['不把嵌套项目作为新项','const labels=window.menuLabels();assert.ok(labels[1].includes("教程"));assert.ok(!labels.includes("隐藏子项"))']],
    ['使用 children 而不是 querySelectorAll("li")。','children 只包含直接元素子节点。','对每个直接 li 读取 textContent 并 trim。'],
    'window.menuLabels = function() {\n  return Array.from(document.querySelector("#menu").children,li=>li.textContent.trim());\n};',
    'children 只遍历直接元素子节点；querySelectorAll("li") 会把嵌套项也算成独立结果。');

  dom('searching-elements-dom-01','searching-elements-dom','限定范围查找高亮项目',
    '定义 window.activeLabels()：只返回 #panel 内带 data-active 属性的 .item 元素的文本数组。页面其他区域即使符合选择器，也不能进入结果。',
    '<section id="panel"><p class="item" data-active>甲</p><p class="item">乙</p><p class="item" data-active>丙</p></section><p class="item" data-active>外部</p>',
    'window.activeLabels = function() {\n  // 在这里实现\n};',
    [['范围和属性筛选','assert.deepEqual(window.activeLabels(),["甲","丙"])'],['动态新增仍可找到','const p=document.createElement("p");p.className="item";p.setAttribute("data-active","");p.textContent="丁";document.querySelector("#panel").append(p);assert.deepEqual(window.activeLabels(),["甲","丙","丁"])']],
    ['先找到 #panel，再在其中查询。','属性存在选择器写作 [data-active]。','Array.from(panel.querySelectorAll(".item[data-active]"),el=>el.textContent)。'],
    'window.activeLabels = function() {\n  const panel=document.querySelector("#panel");\n  return Array.from(panel.querySelectorAll(".item[data-active]"),el=>el.textContent);\n};',
    '把查询限定在容器内部，避免把页面其他同类元素混入结果。');

  dom('basic-dom-node-properties-01','basic-dom-node-properties','更新纯文本但保留容器',
    '定义 window.showMessage(text)：把 #message 的内容改为用户提供的纯文本。即使 text 包含 HTML 标签也不能解析成元素；返回 #message 元素。',
    '<div id="message"><em>旧消息</em></div>',
    'window.showMessage = function(text) {\n  // 在这里实现\n};',
    [['纯文本内容','const el=window.showMessage("你好");assert.equal(el.textContent,"你好")'],['不解析标签','const el=window.showMessage("<b>安全</b>");assert.equal(el.querySelector("b"),null);assert.equal(el.textContent,"<b>安全</b>")']],
    ['textContent 写入的是文本。','innerHTML 会解析标签，不符合要求。','找到元素，设置 textContent，再返回。'],
    'window.showMessage = function(text) {\n  const el=document.querySelector("#message");\n  el.textContent=text;\n  return el;\n};',
    'textContent 用于纯文本展示，输入中的尖括号不会被解析为 HTML。');

  dom('dom-attributes-and-properties-01','dom-attributes-and-properties','读写 data 属性',
    '定义 window.markSelected(id)：找到 data-id 等于 id 的 #list 直接子元素，在其上设置 data-selected="true"，并返回它；未找到返回 null。',
    '<div id="list"><div data-id="a">甲</div><div data-id="b">乙</div></div>',
    'window.markSelected = function(id) {\n  // 在这里实现\n};',
    [['选中正确元素','const el=window.markSelected("b");assert.equal(el.dataset.selected,"true");assert.equal(el.dataset.id,"b")'],['其他元素不变','assert.equal(document.querySelector("[data-id=a]").hasAttribute("data-selected"),false)'],['不存在的 id','assert.equal(window.markSelected("x"),null)']],
    ['不要把用户 id 直接拼进 CSS 选择器。','可以遍历 #list.children 并比较 dataset.id。','找到后设置 dataset.selected="true"。'],
    'window.markSelected = function(id) {\n  const list=document.querySelector("#list");\n  const el=Array.from(list.children).find(item=>item.dataset.id===id);\n  if(!el) return null;\n  el.dataset.selected="true";\n  return el;\n};',
    'dataset 把 data-* 属性映射到 DOM 属性。遍历并比较值可避免动态拼接 CSS 选择器的转义问题。');

  dom('styles-and-classes-01','styles-and-classes','切换多个元素的选中状态',
    '定义 window.selectTab(id)：在 #tabs 中，只给 data-id 等于 id 的按钮添加 active 类，其他按钮移除 active。返回选中的按钮；找不到返回 null 且清除所有 active。',
    '<div id="tabs"><button data-id="a" class="active">甲</button><button data-id="b">乙</button></div>',
    'window.selectTab = function(id) {\n  // 在这里实现\n};',
    [['选中并取消旧项','const x=window.selectTab("b");assert.equal(x.dataset.id,"b");assert.ok(x.classList.contains("active"));assert.ok(!document.querySelector("[data-id=a]").classList.contains("active"))'],['不存在时清空','assert.equal(window.selectTab("x"),null);assert.equal(document.querySelectorAll("#tabs .active").length,0)']],
    ['遍历所有按钮，不只处理新选中项。','classList.toggle(name, force) 支持明确指定状态。','比较 button.dataset.id===id，记录匹配项。'],
    'window.selectTab = function(id) {\n  let selected=null;\n  for(const button of document.querySelectorAll("#tabs button")) {\n    const match=button.dataset.id===id;\n    button.classList.toggle("active",match);\n    if(match) selected=button;\n  }\n  return selected;\n};',
    'classList.toggle 的第二参数明确设置类是否存在，遍历所有按钮才能保证同一时间最多一个 active。');

  choice('size-and-scroll-01','size-and-scroll','区分内容尺寸和可视区域尺寸',
    '一个固定高度容器有很多溢出的内容。想判断内容总高度是否超出可见区域，应比较什么？',
    '',
    ['scrollHeight 与 clientHeight','offsetLeft 与 offsetTop','window.innerWidth 与 innerHeight','className 与 style'],0,
    ['scrollHeight 表示可滚动内容高度。','clientHeight 表示内侧可见区域高度。','当 scrollHeight > clientHeight 时存在纵向溢出。'],
    'scrollHeight 包含可滚动内容的高度；clientHeight 表示元素内部可见高度，比较它们可判断纵向溢出。');

  choice('size-and-scroll-window-01','size-and-scroll-window','滚动到文档顶部',
    '希望把整个浏览器窗口平滑滚动到页面顶部，哪种调用最直接？',
    '',
    ['window.scrollTo({top:0,behavior:"smooth"})','document.body.style.top=0','window.innerHeight=0','document.title="top"'],0,
    ['这是窗口滚动，不是修改页面高度。','scrollTo 支持目标位置和滚动行为。','top:0 指向文档顶部。'],
    'window.scrollTo 可以设置窗口滚动位置，并通过 behavior 选择平滑滚动。');

  choice('coordinates-01','coordinates','视口坐标与文档坐标',
    '元素 getBoundingClientRect().top 为 50，window.scrollY 为 300。元素顶部的文档坐标是多少？',
    '',
    ['50','250','350','300'],2,
    ['getBoundingClientRect 返回相对视口的坐标。','文档坐标还要加上已滚动距离。','50 + 300 = 350。'],
    '元素的文档顶部坐标等于视口 top 加窗口纵向滚动距离，即 350。');

  choice('introduction-browser-events-01','introduction-browser-events','移除监听器需要什么',
    '要成功移除 addEventListener 添加的监听器，哪种做法正确？',
    'button.addEventListener("click", handler);',
    ['button.removeEventListener("click", () => handler())','button.removeEventListener("click", handler)','button.onclick = null','button.remove()'],1,
    ['移除监听器需要同一个函数对象。','新创建的箭头函数不是原 handler。','同类型事件、同一处理函数才能匹配。'],
    'removeEventListener 需要传入注册时的同一个处理函数引用；新建包装函数无法匹配。');

  choice('default-browser-action-01','default-browser-action','阻止链接的默认导航',
    '点击链接时想运行自定义逻辑，并阻止浏览器跳转，应在事件处理器中做什么？',
    'link.addEventListener("click", event => { /* ? */ });',
    ['event.stopPropagation()','event.preventDefault()','event.target.remove()','return true'],1,
    ['冒泡与默认行为是两个不同概念。','preventDefault 专门取消可取消事件的默认动作。','stopPropagation 不会阻止链接跳转。'],
    'preventDefault 取消链接的默认导航；stopPropagation 只影响事件传播。');

  dom('dispatch-events-01','dispatch-events','发送携带数据的自定义事件',
    '定义 window.publishStatus(value)：在 #status 上触发名为 statuschange 的 CustomEvent，detail 为 {value}，且允许事件冒泡到父容器。返回 dispatchEvent 的结果。',
    '<div id="container"><div id="status"></div></div>',
    'window.publishStatus = function(value) {\n  // 在这里实现\n};',
    [['事件名和数据','let seen;const el=document.querySelector("#status");el.addEventListener("statuschange",e=>seen=e.detail.value);window.publishStatus(7);assert.equal(seen,7)'],['允许冒泡','let seen=false;document.querySelector("#container").addEventListener("statuschange",()=>seen=true);window.publishStatus("ok");assert.ok(seen)']],
    ['CustomEvent 的第二参数可设置 detail 和 bubbles。','通过目标元素 dispatchEvent(event)。','记得返回 dispatchEvent 的布尔值。'],
    'window.publishStatus = function(value) {\n  const event=new CustomEvent("statuschange",{detail:{value},bubbles:true});\n  return document.querySelector("#status").dispatchEvent(event);\n};',
    'CustomEvent.detail 携带自定义数据，bubbles:true 允许父容器通过冒泡接收事件。');

  choice('mouse-events-basics-01','mouse-events-basics','区分鼠标按钮',
    '在 mousedown 事件处理器中，只希望响应鼠标主按钮，应检查什么？',
    '',
    ['event.button === 0','event.buttons === 0','event.key === "Enter"','event.clientX === 0'],0,
    ['button 表示触发当前事件的按钮编号。','主按钮通常为 0。','buttons 是当前按下按钮的位掩码。'],
    'MouseEvent.button 为 0 表示主按钮。buttons 表示按键状态位掩码，两者用途不同。');

  choice('mousemove-mouseover-mouseout-mouseenter-mouseleave-01','mousemove-mouseover-mouseout-mouseenter-mouseleave','鼠标在父子元素之间移动',
    '指针从父元素内部移动到其子元素上，父元素注册了 mouseover 和 mouseenter。哪种说法最准确？',
    '',
    ['两种事件完全等价','mouseover 可能因进入子元素再次触发相关处理，mouseenter 不因内部子元素冒泡而反复触发','mouseenter 会冒泡，mouseover 不会','两种事件都只在按下按钮时触发'],1,
    ['mouseover 会冒泡。','mouseenter 的传播与进入边界语义不同。','子元素移动可能触发父元素的 mouseover 处理。'],
    'mouseover 可因子元素事件冒泡而触发父级处理；mouseenter 用于进入该元素边界，不会像 mouseover 那样冒泡。');

  choice('mouse-drag-and-drop-01','mouse-drag-and-drop','拖动元素时为何记录初始偏移',
    '实现自定义拖动时，鼠标按下点位于元素中心。若每次移动都把元素左上角直接设为指针坐标，会发生什么？',
    '',
    ['元素保持原抓取点','元素会突然跳动，让左上角贴到指针','拖动事件自动取消','元素宽度变为 0'],1,
    ['用户抓住的是元素内部一点。','指针坐标不是元素左上角坐标。','需要减去按下时的内部偏移。'],
    '直接使用指针坐标会让元素左上角跳到鼠标位置。记录初始抓取点相对元素左上角的偏移，移动时扣除它。');

  choice('pointer-events-01','pointer-events','跟踪多点触控',
    '一个手势处理中同时可能有两个触点。要区分每个指针的移动和抬起事件，应主要使用哪个属性？',
    '',
    ['event.pointerId','event.type','event.clientX','event.isTrusted'],0,
    ['不同触点需要稳定身份。','pointerId 标识一个活动指针。','坐标会变化，不能作为身份。'],
    'pointerId 在指针活动期间标识特定指针，适合把后续移动与抬起事件关联到同一触点。');

  choice('keyboard-events-01','keyboard-events','字符键与物理按键',
    '快捷键应跟随键盘上的物理 Q 键位置，而不受键盘布局改变影响，通常检查什么？',
    '',
    ['event.key === "q"','event.code === "KeyQ"','event.charCode === 81','event.target.value === "q"'],1,
    ['key 描述当前输入含义，可能受布局影响。','code 描述物理按键位置。','物理 Q 键对应 KeyQ。'],
    'KeyboardEvent.code 标识物理按键位置；key 表示该键在当前布局下的字符或语义。');

  choice('onscroll-01','onscroll','高频滚动处理的代价',
    'scroll 事件可能很频繁。每次回调都进行昂贵布局读取和同步写入，最可能造成什么问题？',
    '',
    ['浏览器自动提高帧率','页面卡顿，可能出现反复布局计算','所有监听器自动变为异步','DOM 节点被垃圾回收'],1,
    ['高频事件在很短时间内重复运行。','交替读取和写入布局信息可能强制重排。','应减少工作量并按需节流。'],
    '滚动处理器里的昂贵计算与布局读写会反复占用主线程，造成掉帧；可减少工作、按需节流。');

  choice('form-elements-01','form-elements','按表单字段名访问控件',
    '表单里有 name="email" 的输入框。哪种方式可从表单对象取得它？',
    '<form id="profile"><input name="email"></form>',
    ['form.elements.namedItem("email")','form.value.email','document.cookie.email','window.email()'],0,
    ['form.elements 是控件集合。','namedItem 可按 name 查找。','form 本身没有 value.email。'],
    'form.elements.namedItem("email") 可按控件名称访问输入框。');

  choice('focus-blur-01','focus-blur','事件委托监听焦点变化',
    '想在表单容器上统一感知子输入框获得焦点，哪一种事件更适合直接用于冒泡委托？',
    '',
    ['focus','focusin','blur','load'],1,
    ['focus 本身不按普通冒泡方式传播。','focusin 会冒泡。','容器上监听 focusin 可处理子控件焦点。'],
    'focusin 会冒泡，适合父容器委托处理子输入框获得焦点的情况。');

  choice('events-change-input-01','events-change-input','实时输入与完成更改',
    '希望用户每输入一个字符就更新剩余字数，最适合监听哪种事件？',
    '',
    ['change','input','submit','blur'],1,
    ['文本输入框的 change 通常在更改完成后才触发。','input 在值变化时更及时。','字数统计需要实时反馈。'],
    'input 事件适合实时响应输入内容变化；change 通常用于完成更改后的处理。');

  choice('forms-submit-01','forms-submit','提交前校验',
    '要在表单发送前检查字段，并在无效时阻止本次提交，应在哪个事件处理器里调用 preventDefault？',
    '',
    ['submit','load','keydown','mouseenter'],0,
    ['表单提交有专门的事件。','事件处理器可读取字段并决定是否取消。','无效时在 submit 事件调用 preventDefault。'],
    'submit 事件在表单提交时触发，处理器可校验字段并调用 preventDefault 阻止浏览器默认提交。');

  choice('onload-ondomcontentloaded-01','onload-ondomcontentloaded','DOM 构建完毕但图片仍在下载',
    '希望尽早操作已经解析完成的 DOM，而不必等待图片下载完，通常监听什么？',
    '',
    ['DOMContentLoaded','window.load','beforeunload','error'],0,
    ['DOMContentLoaded 与 load 等待的资源范围不同。','DOM 解析结束即可执行的是前者。','图片可能在之后继续加载。'],
    'DOMContentLoaded 表示 HTML 已解析并建立 DOM；window.load 通常还等待图片等外部资源。');

  choice('script-async-defer-01','script-async-defer','保持外部脚本的执行顺序',
    '两个外部脚本互相依赖，希望下载与 HTML 解析并行，但执行仍保持文档顺序并在 DOM 解析后进行，应选择什么？',
    '',
    ['给两个脚本都加 async','给两个脚本都加 defer','把它们都改为内联脚本','给两个脚本都加 data-order'],1,
    ['async 谁先下载完谁先执行，不保证顺序。','defer 脚本按文档顺序执行。','defer 还会等 HTML 解析完成。'],
    'defer 允许外部脚本并行下载，解析完成后按文档顺序执行；async 不保证相互顺序。');

  choice('onload-onerror-01','onload-onerror','动态脚本加载失败',
    '用 JavaScript 动态插入 script 元素后，想分别处理脚本加载成功和失败，应监听哪两个事件？',
    '',
    ['oninput 与 onchange','onload 与 onerror','onfocus 与 onblur','onopen 与 onclose'],1,
    ['资源加载有成功和失败事件。','script 元素提供 load/error。','分别为 onload 和 onerror。'],
    '动态脚本元素可用 load 与 error 事件分别观察资源加载成功或失败。');

  choice('mutation-observer-01','mutation-observer','观察动态新增的子节点',
    '想监听 #list 后续添加或删除的直接子节点，而不是属性变化，MutationObserver 的 observe 选项至少需要什么？',
    '',
    ['{ attributes: true }','{ childList: true }','{ characterData: true }','{ subtree: false }'],1,
    ['childList 关注子节点列表变化。','attributes 关注属性。','直接子节点变化需要 childList:true。'],
    'childList:true 监听目标节点的直接子节点增删；若还要观察后代，应另加 subtree:true。');

  choice('selection-range-01','selection-range','选择页面中的一段文本',
    '要用代码表示文档中某段内容的起点和终点，通常使用什么对象？',
    '',
    ['Range','Map','WeakSet','URLSearchParams'],0,
    ['Range 表示文档中的边界点与内容范围。','Selection 可包含 Range。','本题关注起点和终点。'],
    'Range 用边界点表示文档中的一段内容，Selection 可以持有一个或多个 Range。');

  choice('event-loop-01','event-loop','长任务与用户界面响应',
    '一个同步循环占用主线程两秒，其间用户点击按钮。最可能发生什么？',
    '',
    ['点击处理器立刻打断同步循环','点击会等待当前同步任务结束后才有机会被处理','浏览器自动把循环迁入 Worker','按钮点击永远丢失'],1,
    ['JavaScript 主线程一次执行一个任务。','同步循环不主动让出执行权。','点击处理通常要等长任务结束。'],
    '长同步任务会阻塞主线程。浏览器要等它结束后才能处理后续事件并更新界面。');
}
