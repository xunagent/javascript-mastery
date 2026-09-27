export function addThirdBrowserExercises({ choice, dom }) {
  dom('dom-nodes-third-01','dom-nodes','只统计直接文本节点',
    '定义 window.directTextCount()：统计 #box 的直接子节点中，trim 后非空的文本节点数量。嵌套元素内部文字不计入。每次调用都反映当前 DOM。',
    '<div id="box">甲<strong>嵌套</strong>乙<span>深层</span>   </div>',
    'window.directTextCount = function() {\n  // 在这里实现\n};',
    [['初始直接文本','assert.equal(window.directTextCount(),2)'], ['动态文本','document.querySelector("#box").append(document.createTextNode("丙"));assert.equal(window.directTextCount(),3)'], ['嵌套文本不算','document.querySelector("#box strong").append(document.createTextNode("新增"));assert.equal(window.directTextCount(),3)']],
    ['childNodes 包含文本和元素节点。','文本节点的 nodeType 是 3。','只遍历 #box.childNodes，并检查 textContent.trim()。'],
    'window.directTextCount = function() {\n  const box=document.querySelector("#box");\n  return Array.from(box.childNodes).filter(node=>node.nodeType===3 && node.textContent.trim()).length;\n};',
    'childNodes 包括直接文本节点，querySelectorAll 只找元素且会深入后代。按 nodeType 和非空内容筛选，才能得到直接文本数。');

  dom('dom-navigation-third-01','dom-navigation','限定容器内寻找最近卡片',
    '定义 window.cardOf(element)：返回 element 最近的 .card 祖先（包括自己），但只允许 #board 内的卡片；外部同名卡片返回 null。',
    '<div id="board"><article class="card" data-id="a"><button><span id="inside">点我</span></button></article></div><article class="card" id="outside"><span id="out-child"></span></article>',
    'window.cardOf = function(element) {\n  // 在这里实现\n};',
    [['内部嵌套元素','assert.equal(window.cardOf(document.querySelector("#inside")).dataset.id,"a")'], ['卡片自身','const card=document.querySelector("#board .card");assert.equal(window.cardOf(card),card)'], ['外部不接受','assert.equal(window.cardOf(document.querySelector("#out-child")),null)']],
    ['closest 可从自身向上查找。','找到后再验证它属于 #board。','使用 board.contains(card)；未找到时返回 null。'],
    'window.cardOf = function(element) {\n  const card=element.closest(".card");\n  return card && document.querySelector("#board").contains(card) ? card : null;\n};',
    'closest 不依赖固定嵌套层数，但必须加范围检查，避免页面外部的同名元素被误认成目标卡片。');

  dom('searching-elements-dom-third-01','searching-elements-dom','按任意 data-id 安全查找项目',
    '定义 window.findItem(id)：只在 #items 的直接子元素中查找 data-id 严格等于 id 的元素。id 可能包含引号或方括号，不能直接拼进 CSS 选择器。未找到返回 null。',
    '<div id="items"><p data-id="a">A</p><p data-id="b">B</p></div><p data-id="a">外部</p>',
    'window.findItem = function(id) {\n  // 在这里实现\n};',
    [['范围正确','assert.equal(window.findItem("a").textContent,"A");assert.equal(window.findItem("b").textContent,"B")'], ['动态特殊 id','const p=document.createElement("p");p.dataset.id=String.fromCharCode(120,34,91,121,93);document.querySelector("#items").append(p);assert.equal(window.findItem(p.dataset.id),p)'], ['未找到','assert.equal(window.findItem("missing"),null)']],
    ['先取得 #items，再遍历 children。','直接比较 child.dataset.id 与 id。','Array.from(...).find(...) 找不到时返回 undefined，需转成 null。'],
    'window.findItem = function(id) {\n  return Array.from(document.querySelector("#items").children).find(child=>child.dataset.id===id) ?? null;\n};',
    '遍历并比较属性值可避免把不可信 id 拼入 CSS 选择器造成转义错误，同时限定直接子元素和查询范围。');

  dom('basic-dom-node-properties-third-01','basic-dom-node-properties','提取容器自身的文字',
    '定义 window.ownText()：只提取 #note 的直接文本子节点，分别 trim 后过滤空串，再用一个空格连接。strong、em 等后代元素里的文字不要包含。',
    '<p id="note">前缀 <strong>忽略</strong> 中间 <em>也忽略</em> 后缀</p>',
    'window.ownText = function() {\n  // 在这里实现\n};',
    [['只取直接文字','assert.equal(window.ownText(),"前缀 中间 后缀")'], ['动态追加文字','document.querySelector("#note").append(document.createTextNode(" 新增 "));assert.equal(window.ownText(),"前缀 中间 后缀 新增")']],
    ['textContent 会包含所有后代文字。','只遍历 #note.childNodes 中 nodeType===3 的节点。','逐段 trim、过滤空串、join(" ")。'],
    'window.ownText = function() {\n  return Array.from(document.querySelector("#note").childNodes).filter(node=>node.nodeType===3).map(node=>node.textContent.trim()).filter(Boolean).join(" ");\n};',
    'textContent 聚合整棵子树的文字；要只取容器自身的文字，应遍历直接文本节点。');

  dom('dom-attributes-and-properties-third-01','dom-attributes-and-properties','同步状态与无障碍属性',
    '定义 window.setExpanded(id, expanded)：找到 #panels 内 data-id 等于 id 的按钮，设置 data-state 为 open/closed，并把 aria-expanded 设为对应的 "true"/"false" 字符串。返回按钮；未找到返回 null。不要影响其他按钮。',
    '<div id="panels"><button data-id="a" aria-expanded="false">A</button><button data-id="b" aria-expanded="false">B</button></div>',
    'window.setExpanded = function(id, expanded) {\n  // 在这里实现\n};',
    [['展开目标','const b=window.setExpanded("b",true);assert.equal(b.dataset.state,"open");assert.equal(b.getAttribute("aria-expanded"),"true")'], ['关闭目标并保持其他项','window.setExpanded("b",false);assert.equal(document.querySelector("[data-id=b]").getAttribute("aria-expanded"),"false");assert.equal(document.querySelector("[data-id=a]").getAttribute("aria-expanded"),"false")'], ['未找到','assert.equal(window.setExpanded("x",true),null)']],
    ['先在 #panels 的 children 中按 dataset.id 查找。','HTML 特性值是字符串。','expanded ? "true" : "false"，data-state 同理。'],
    'window.setExpanded = function(id, expanded) {\n  const button=Array.from(document.querySelector("#panels").children).find(item=>item.dataset.id===id);\n  if(!button) return null;\n  button.dataset.state=expanded ? "open" : "closed";\n  button.setAttribute("aria-expanded",expanded ? "true" : "false");\n  return button;\n};',
    '数据状态与 aria-expanded 需要同步维护；ARIA 属性是字符串，不能把 false 误当作“删除属性”。');

  dom('modifying-document-third-01','modifying-document','幂等渲染安全列表',
    '定义 window.renderLabels(labels)：把 #labels 的子节点完整替换为与 labels 对应的 li。每项必须作为纯文本显示；重复调用不应累积旧节点。返回新建的 li 数量。',
    '<ul id="labels"><li>旧项</li></ul>',
    'window.renderLabels = function(labels) {\n  // 在这里实现\n};',
    [['完整替换','assert.equal(window.renderLabels(["A","B"]),2);assert.deepEqual(Array.from(document.querySelectorAll("#labels li"),li=>li.textContent),["A","B"])'], ['重复调用不累积','window.renderLabels(["C"]);assert.deepEqual(Array.from(document.querySelectorAll("#labels li"),li=>li.textContent),["C"])'], ['特殊内容不解析','window.renderLabels(["<img src=x>"]);assert.equal(document.querySelector("#labels img"),null);assert.equal(document.querySelector("#labels li").textContent,"<img src=x>")']],
    ['为每项 createElement("li")。','用 textContent 设置标签。','调用 list.replaceChildren(...items) 完整替换。'],
    'window.renderLabels = function(labels) {\n  const items=labels.map(label=>{const li=document.createElement("li");li.textContent=label;return li});\n  document.querySelector("#labels").replaceChildren(...items);\n  return items.length;\n};',
    '先构造新节点再 replaceChildren，让重复渲染保持幂等；textContent 不会解析用户提供的标记。');

  dom('styles-and-classes-third-01','styles-and-classes','错误状态同时更新样式与语义',
    '定义 window.markInvalid(id, invalid)：在 #fields 内按 data-id 找输入框。invalid 为真时添加 is-invalid 类并设置 aria-invalid="true"；否则移除类并设置 aria-invalid="false"。返回目标，找不到返回 null。',
    '<div id="fields"><input data-id="email"><input data-id="phone"></div>',
    'window.markInvalid = function(id, invalid) {\n  // 在这里实现\n};',
    [['添加错误状态','const x=window.markInvalid("email",true);assert.ok(x.classList.contains("is-invalid"));assert.equal(x.getAttribute("aria-invalid"),"true")'], ['清除状态与其他字段','window.markInvalid("email",false);assert.ok(!document.querySelector("[data-id=email]").classList.contains("is-invalid"));assert.equal(document.querySelector("[data-id=phone]").hasAttribute("aria-invalid"),false)'], ['缺失 id','assert.equal(window.markInvalid("other",true),null)']],
    ['限定到 #fields 的输入框。','classList.toggle(name, force) 可明确设状态。','aria-invalid 要写入字符串 true/false。'],
    'window.markInvalid = function(id, invalid) {\n  const input=Array.from(document.querySelectorAll("#fields input")).find(item=>item.dataset.id===id);\n  if(!input) return null;\n  input.classList.toggle("is-invalid",!!invalid);\n  input.setAttribute("aria-invalid",invalid ? "true" : "false");\n  return input;\n};',
    '视觉错误类与无障碍语义应同步；只更新类名会让辅助技术无法获知当前字段状态。');

  dom('introduction-browser-events-third-01','introduction-browser-events','只处理第一次点击',
    '给 #start 注册监听器：第一次 click 时令 window.startCount 增加 1，以后点击不再增加。代码执行后 startCount 应为 0。',
    '<button id="start">开始</button>',
    'window.startCount = 0;\n// 在这里注册监听器',
    [['第一次生效','document.querySelector("#start").click();assert.equal(window.startCount,1)'], ['重复点击不生效','document.querySelector("#start").click();document.querySelector("#start").click();assert.equal(window.startCount,1)']],
    ['addEventListener 的第三参数可用对象。','{once:true} 会在首次触发后自动移除监听器。','先把计数设为 0，再注册。'],
    'window.startCount = 0;\ndocument.querySelector("#start").addEventListener("click",()=>{window.startCount++},{once:true});',
    'once 选项把“只执行一次”的生命周期交给事件系统，避免手动维护重复点击标志。');

  dom('event-delegation-third-01','event-delegation','委托动态标签切换选中项',
    '给 #tabs 注册 click 委托：点击任意 button[data-tab] 时，只让被点击按钮有 active 类，其余按钮移除。后续动态添加按钮也要生效；点击容器空白处不能改状态。',
    '<div id="tabs"><button data-tab="a" class="active">甲</button><button data-tab="b">乙</button></div>',
    'const tabs = document.querySelector("#tabs");\n// 在这里注册事件委托',
    [['初始按钮切换','document.querySelector("[data-tab=b]").click();assert.ok(document.querySelector("[data-tab=b]").classList.contains("active"));assert.ok(!document.querySelector("[data-tab=a]").classList.contains("active"))'], ['动态按钮生效','const button=document.createElement("button");button.dataset.tab="c";document.querySelector("#tabs").append(button);button.click();assert.ok(button.classList.contains("active"));assert.equal(document.querySelectorAll("#tabs .active").length,1)'], ['空白区域无动作','document.querySelector("#tabs").click();assert.equal(document.querySelectorAll("#tabs .active").length,1)']],
    ['监听器放在稳定的 #tabs 上。','从 event.target.closest("button[data-tab]") 找目标。','确认目标属于 tabs，然后遍历全部按钮同步 active 状态。'],
    'const tabs = document.querySelector("#tabs");\ntabs.addEventListener("click",event=>{\n  const chosen=event.target.closest("button[data-tab]");\n  if(!chosen || !tabs.contains(chosen)) return;\n  for(const button of tabs.querySelectorAll("button[data-tab]")) button.classList.toggle("active",button===chosen);\n});',
    '事件委托适用于动态新增按钮。通过范围验证和遍历同步，确保不会误响应空白点击，也不会同时选中多个标签。');

  dom('default-browser-action-third-01','default-browser-action','只阻止外部链接跳转',
    '给 #nav 注册 click 监听器：点击 href 以 http:// 或 https:// 开头的链接时调用 preventDefault()；相对路径链接保留默认行为。点击链接内部子元素也要正确处理。',
    '<nav id="nav"><a href="/local"><span id="local">站内</span></a><a href="https://example.test/"><span id="external">站外</span></a></nav>',
    'const nav=document.querySelector("#nav");\n// 在这里注册监听器',
    [['外链被取消','const link=document.querySelector("#external");const e=new MouseEvent("click",{bubbles:true,cancelable:true});link.dispatchEvent(e);assert.equal(e.defaultPrevented,true)'], ['站内链接允许','const link=document.querySelector("#local");const e=new MouseEvent("click",{bubbles:true,cancelable:true});link.dispatchEvent(e);assert.equal(e.defaultPrevented,false)']],
    ['event.target 可能是 span。','用 closest("a[href]") 找链接，并确认在 nav 内。','读取 getAttribute("href") 的原始值，检查是否以 http 开头。'],
    'const nav=document.querySelector("#nav");\nnav.addEventListener("click",event=>{\n  const link=event.target.closest("a[href]");\n  if(!link || !nav.contains(link)) return;\n  if(/^https?:\\/\\//.test(link.getAttribute("href"))) event.preventDefault();\n});',
    'preventDefault 只取消默认导航，不影响事件委托本身。检查原始 href 可区分绝对外链与相对站内路径。');

  dom('dispatch-events-third-01','dispatch-events','可取消的自定义保存事件',
    '定义 window.requestSave(value)：在 #editor 上派发 bubbles:true、cancelable:true 的 CustomEvent("beforesave")，detail 为 {value}。返回 dispatchEvent 的布尔结果，使父容器可阻止保存。',
    '<section id="container"><div id="editor"></div></section>',
    'window.requestSave = function(value) {\n  // 在这里实现\n};',
    [['数据与冒泡','let seen;document.querySelector("#container").addEventListener("beforesave",e=>seen=e.detail.value);assert.equal(window.requestSave(7),true);assert.equal(seen,7)'], ['允许取消','document.querySelector("#container").addEventListener("beforesave",e=>e.preventDefault());assert.equal(window.requestSave("x"),false)']],
    ['CustomEvent 的选项包含 detail、bubbles、cancelable。','在 #editor 上 dispatchEvent。','dispatchEvent 在可取消事件被取消后返回 false。'],
    'window.requestSave = function(value) {\n  const event=new CustomEvent("beforesave",{detail:{value},bubbles:true,cancelable:true});\n  return document.querySelector("#editor").dispatchEvent(event);\n};',
    '可取消的自定义事件允许父容器在保存前进行拦截。事件的返回值把取消结果传回发起方。');

  dom('form-elements-third-01','form-elements','收集同名表单字段',
    '定义 window.collectValues()：只读取 #profile 中非 disabled 且有 name 的 input，把同名字段的值按 DOM 顺序放入数组，返回普通对象。例如两个 tag 输入得到 {tag:["a","b"]}。每次调用反映当前表单。',
    '<form id="profile"><input name="tag" value="js"><input name="tag" value="dom"><input name="skip" value="x" disabled><input value="no-name"></form>',
    'window.collectValues = function() {\n  // 在这里实现\n};',
    [['同名字段与禁用字段','assert.deepEqual(window.collectValues(),{tag:["js","dom"]})'], ['动态新增','const input=document.createElement("input");input.setAttribute("name","tag");input.value="css";document.querySelector("#profile").append(input);assert.deepEqual(window.collectValues(),{tag:["js","dom","css"]})'], ['特殊字段名不应冲突','const input=document.createElement("input");input.setAttribute("name","__proto__");input.value="safe";document.querySelector("#profile").append(input);const result=window.collectValues();assert.ok(Object.hasOwn(result,"__proto__"));assert.deepEqual(result["__proto__"],["safe"])']],
    ['限定查询 #profile input[name]。','跳过 hasAttribute("disabled") 的控件。','用 Map 按字段名累计数组，再通过 Object.fromEntries 生成普通对象，避免特殊键冲突。'],
    'window.collectValues = function() {\n  const fields=new Map();\n  for(const input of document.querySelectorAll("#profile input[name]")){\n    if(input.hasAttribute("disabled")) continue;\n    const name=input.getAttribute("name");\n    if(!fields.has(name)) fields.set(name,[]);\n    fields.get(name).push(input.value);\n  }\n  return Object.fromEntries(fields);\n};',
    '同名字段可能有多个值，不能只保存最后一个。每次从当前表单读取，动态新增控件也会被包含。');

  dom('events-change-input-third-01','events-change-input','实时更新输入字数',
    '给 #message 注册 input 监听器：每次用户输入时，把当前值的 Unicode 码点数量写入 #count 的 textContent。注册后立即同步一次初始值。',
    '<input id="message" value="Hi"><output id="count"></output>',
    'const message=document.querySelector("#message");\nconst count=document.querySelector("#count");\n// 在这里实现',
    [['初始状态','assert.equal(document.querySelector("#count").textContent,"2")'], ['实时输入与表情','const input=document.querySelector("#message");input.value="A🙂";input.dispatchEvent(new Event("input",{bubbles:true}));assert.equal(document.querySelector("#count").textContent,"2")']],
    ['input 事件代表当前输入变化。','Array.from(message.value).length 按码点计数。','定义 update 函数，注册监听后立即调用。'],
    'const message=document.querySelector("#message");\nconst count=document.querySelector("#count");\nconst update=()=>{count.textContent=String(Array.from(message.value).length)};\nmessage.addEventListener("input",update);\nupdate();',
    '程序初始化也要同步计数。字符串 length 按 UTF-16 代码单元计数，表情符号等字符可能被算作两个；这里按码点计数。');

  dom('forms-submit-third-01','forms-submit','提交前验证年龄输入',
    '给 #form 注册 submit 监听器：#age 的值只有整串 1～120 的十进制数字才允许提交；否则调用 preventDefault()。不修改输入值。',
    '<form id="form"><input id="age" value="18"><button type="submit">提交</button></form>',
    'const form=document.querySelector("#form");\n// 在这里注册提交监听器',
    [['合法年龄允许','const e=new Event("submit",{bubbles:true,cancelable:true});document.querySelector("#form").dispatchEvent(e);assert.equal(e.defaultPrevented,false)'], ['零与非数字被阻止','const input=document.querySelector("#age");for(const value of ["0","12x","121",""]){input.value=value;const e=new Event("submit",{bubbles:true,cancelable:true});document.querySelector("#form").dispatchEvent(e);assert.equal(e.defaultPrevented,true)}'], ['边界合法','document.querySelector("#age").value="120";const e=new Event("submit",{bubbles:true,cancelable:true});document.querySelector("#form").dispatchEvent(e);assert.equal(e.defaultPrevented,false)']],
    ['先用正则检查整串数字。','再转数字并比较 1～120。','无效时只调用 event.preventDefault()。'],
    'const form=document.querySelector("#form");\nform.addEventListener("submit",event=>{\n  const value=document.querySelector("#age").value;\n  const age=Number(value);\n  if(!/^\\d+$/.test(value) || age<1 || age>120) event.preventDefault();\n});',
    '在 submit 事件里取消无效提交，既能处理按钮点击，也能处理回车提交。只用 Number 会把空串转成 0，因此先检查完整格式。');

  const scenarios = [
    ['browser-environment','选择正确的浏览器对象入口','应用需要读取当前网页标题、当前 URL 和浏览器语言。哪组三个入口最合适？','',['document.title、location.href、navigator.language','window.title、document.url、Math.language','JSON.title、Date.url、document.language','Promise.title、Array.url、console.language'],['标题属于文档。','URL 属于 Location。','语言偏好可从 Navigator 读取。'],'document、location、navigator 分别提供文档、当前地址和浏览器环境信息。'],
    ['size-and-scroll','判断接近容器底部','一个元素可滚动。由于尺寸可能带小数，哪种条件更稳地判断已接近底部（容差 1px）？','',['scrollHeight - clientHeight - scrollTop <= 1','scrollTop === scrollHeight','clientHeight === 0','offsetTop >= scrollWidth'],['底部时滚动距离加可视高度约等于内容总高度。','精确相等可能受舍入影响。','容差应按需求设置。'],'scrollHeight - clientHeight - scrollTop 表示距底部的剩余量；容差能处理舍入与小数像素。'],
    ['size-and-scroll-window','读取当前窗口滚动距离','页面向下滚动 500px。要得到窗口相对文档顶部的纵向滚动距离，应读取什么？','',['window.scrollY','window.innerHeight','screen.height','document.title.length'],['滚动距离不是视口高度。','scrollY 表示窗口纵向偏移。','innerHeight 表示可视高度。'],'window.scrollY 表示当前窗口相对文档的纵向滚动位置。'],
    ['coordinates','elementFromPoint 使用哪种坐标','鼠标事件同时有 clientX/clientY 和 pageX/pageY。要调用 document.elementFromPoint 寻找指针下元素，应传哪一组？','',['clientX/clientY，因它们是视口坐标','pageX/pageY，因它们是文档坐标','screenX/screenY，因它们是屏幕坐标','offsetX/offsetY，因它们总是文档坐标'],['elementFromPoint 接收窗口/视口坐标。','clientX/clientY 与视口一致。','页面滚动后 page 坐标不等于视口坐标。'],'elementFromPoint 接收视口坐标；直接使用鼠标事件的 clientX、clientY。'],
    ['bubbling-and-capturing','区分 target 与 currentTarget','监听器注册在 #list，实际点击了其子按钮。事件处理器中的 target 和 currentTarget 通常分别是什么？','',['按钮与 #list','#list 与按钮','两者都是按钮','两者都是 document'],['target 指原始触发目标。','currentTarget 指当前正在执行监听器的元素。','冒泡不会改写原始 target。'],'委托监听中 event.target 是被点击的按钮，event.currentTarget 是监听器所在的 #list。'],
    ['mouse-events-basics','移动时识别按住的鼠标键','mousemove 事件发生时要判断主按钮是否仍按下。哪个属性更适合？','',['检查 event.buttons 的主按钮位掩码，例如 (event.buttons & 1) !== 0','检查 event.button === 0 就一定能判断','检查 event.detail === 2','检查 event.key === "MouseLeft"'],['button 主要指触发当前按键事件的按钮。','buttons 是当前按下按钮集合的位掩码。','主按钮对应最低位。'],'移动过程中应看 buttons 位掩码，不能只依赖 button 来判断当前持续按下状态。'],
    ['mousemove-mouseover-mouseout-mouseenter-mouseleave','利用 relatedTarget 排除内部移动','父容器 mouseout 处理器发现 event.relatedTarget 仍在父容器内部，应如何理解？','',['指针只是移向其内部后代，不应当作真正离开父容器','指针已离开浏览器窗口','relatedTarget 总是 null','应立即销毁父容器'],['relatedTarget 指针移向的目标。','仍被父容器包含，说明未离开整体区域。','父子边界也可触发 mouseout。'],'检查 relatedTarget 是否仍在容器内，可避免把父子元素之间移动误当成离开组件。'],
    ['mouse-drag-and-drop','自定义拖动与原生图片拖动冲突','开发者给图片做自定义鼠标拖动，但浏览器原生图片拖拽同时启动。可在什么事件里取消原生拖动？','',['图片的 dragstart 事件中调用 preventDefault()','只在 keyup 中调用 preventDefault()','只改图片的 alt 文本','在 window.onload 中调用 stopPropagation()'],['浏览器的原生图片拖动有默认动作。','dragstart 是开始拖动的事件。','preventDefault 可取消该默认拖动。'],'在图片 dragstart 处理器中取消默认动作，可避免原生拖拽与自定义拖动逻辑冲突。'],
    ['pointer-events','pointercancel 也要清理状态','拖动组件只在 pointerup 清理 active 状态。触摸设备上手势被系统取消后可能留下什么问题？','',['active 状态卡住；也应处理 pointercancel','pointercancel 会自动调用应用的 pointerup','所有拖动都会被浏览器重放','只有鼠标才可能触发 pointercancel'],['触摸手势可能被系统接管或中断。','取消不等于正常抬起。','两条结束路径都要清理。'],'pointercancel 表示指针流被取消，应用应清理拖动状态与资源，不能只依赖 pointerup。'],
    ['keyboard-events','长按按键的重复事件','用户长按某键，keydown 可能多次触发。只想处理首次按下，应检查什么？','',['忽略 event.repeat 为 true 的重复事件','忽略所有 keyup','只检查 event.code 是否为空','把监听器设置 passive:true'],['键盘自动重复会产生后续 keydown。','KeyboardEvent.repeat 标识重复触发。','首次按下通常 repeat 为 false。'],'处理一次性快捷键时可跳过 event.repeat 为 true 的重复 keydown。'],
    ['onscroll','只在元素进入视口时加载图片','页面有上百张图片，目标是进入视口附近时才加载。相比在每次 scroll 中手动测量全部元素，更合适的 API 是什么？','',['IntersectionObserver','MutationObserver','FileReader','history.pushState'],['需求关注元素与视口的交叉。','浏览器提供专门的观察器。','MutationObserver 关注 DOM 变化，不关注可见性。'],'IntersectionObserver 可在元素接近或进入视口时通知应用，通常比高频全量滚动测量更合适。'],
    ['focus-blur','程序聚焦时避免页面滚动','页面下方的输入框需要接收焦点，但不希望 focus() 自动把页面滚到它的位置。哪种调用直接表达这一需求？','',['input.focus({preventScroll:true})','input.blur({preventScroll:true})','input.focus(false)','window.scrollTo({top:0}) 后再调用 focus()'],['focus 支持选项对象。','preventScroll 可避免聚焦导致自动滚动。','先滚到顶部再 focus 仍可能被聚焦滚动覆盖。'],'input.focus({preventScroll:true}) 在请求聚焦时明确禁止由聚焦引起的自动滚动。'],
    ['onload-ondomcontentloaded','脚本可能晚于 DOMContentLoaded 加载','第三方脚本异步加载，注册 DOMContentLoaded 监听时文档可能早已完成解析。如何确保初始化不会漏掉？','',['先检查 document.readyState；若已非 loading 就直接初始化，否则注册 DOMContentLoaded','只注册 DOMContentLoaded，不检查当前状态','永远等待 window.onload','每秒轮询 document.title'],['事件可能已经发生，不会为后来监听者重放。','readyState 可判断文档解析状态。','loading 时再等事件。'],'晚加载脚本应检查当前 readyState，避免错过已经触发的 DOMContentLoaded。'],
    ['script-async-defer','defer 脚本的顺序保证','两个相互依赖的外部经典脚本都设置 defer，且按 A、B 顺序写在文档中。通常执行顺序是什么？','',['A 然后 B，按文档顺序执行','谁先下载完谁先执行','只执行 B','两者必定在 DOMContentLoaded 后执行'],['defer 下载可并行。','执行仍保持文档顺序。','async 则不保证这个顺序。'],'defer 经典脚本保持文档顺序执行，并通常在 DOMContentLoaded 前完成。'],
    ['onload-onerror','资源加载成功与业务执行成功','动态加载脚本的 load 事件触发后，是否能断定脚本初始化里的异步请求也成功？','',['不能；load 仅确认脚本资源完成加载，业务异步结果需另行等待','能；load 会等待脚本里所有 Promise','能；任何脚本错误都会改成 load 失败','只有脚本位于 head 时能'],['资源生命周期与业务任务生命周期不同。','异步请求可能在 load 后才结束。','业务成功需单独的 Promise 或事件协议。'],'script load 不代表内部异步初始化已完成；应定义明确的业务完成信号。'],
    ['mutation-observer','同时观察深层子节点','只设置 {childList:true} 观察 #root 时，深层孙节点变化不通知。要包含所有后代的子节点变化，还需什么？','',['subtree:true','attributes:false','once:true','passive:true'],['childList 观察子节点变化类型。','subtree 扩展到全部后代。','两者组合使用。'],'MutationObserver 用 childList:true 观察子节点增删，subtree:true 将范围扩展到所有后代。'],
    ['selection-range','复制还是移走所选内容','想得到 Range 选中内容的 DocumentFragment，但原页面内容必须保留。应调用什么？','',['range.cloneContents()','range.extractContents()','range.deleteContents()','range.insertNode(null)'],['clone 表示复制。','extract 会从原文档移走内容。','delete 会删除内容。'],'cloneContents 返回所选内容的副本，不会从原文档移除；extractContents 会移走。'],
    ['event-loop','微任务不断追加导致渲染饥饿','一个微任务每次执行都再排入同样的微任务，长期不停止。页面可能出现什么？','',['微任务队列持续占用执行机会，渲染和用户交互可能被延迟','浏览器会自动把所有微任务转换成 Web Worker','每个微任务都强制刷新一帧','微任务只能运行一次'],['当前任务结束后要清空微任务队列。','微任务还能继续加入新的微任务。','持续链可能阻止进入渲染阶段。'],'无限追加微任务会让事件循环难以转到渲染或其他任务，导致界面响应变差。']
  ];
  for (const [lessonId,title,prompt,example,options,hints,explanation] of scenarios) {
    choice(`${lessonId}-third-01`,lessonId,title,prompt,example,options,0,hints,explanation);
  }
}
