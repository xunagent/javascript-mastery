export function addDocumentDepthCodeExercises({ dom }) {
  dom('dom-nodes-depth-code-01', 'dom-nodes', '统计直接子节点的类型',
    '定义 window.countDirectNodes()：只统计 #content 的直接子节点，返回 {elements,text,comments}。空白文本也算文本节点；后代节点不算。每次调用都应反映当前 DOM。',
    '<div id="content">甲<!--提示--><strong>乙</strong> 丙 <span><em>深层</em></span></div>',
    'window.countDirectNodes = function() {\n  // 在这里实现\n};',
    [['初始节点分类', 'assert.deepEqual(window.countDirectNodes(),{elements:2,text:2,comments:1})'], ['动态节点与直接层级', 'const root=document.querySelector("#content");root.append(document.createComment("新增"));root.querySelector("strong").append(document.createElement("i"));assert.deepEqual(window.countDirectNodes(),{elements:2,text:2,comments:2})']],
    ['childNodes 包含直接文本、注释和元素。', 'nodeType 分别为 1、3、8。', '遍历 #content.childNodes，按 nodeType 累计。'],
    'window.countDirectNodes = function() {\n  const result={elements:0,text:0,comments:0};\n  for(const node of document.querySelector("#content").childNodes){\n    if(node.nodeType===1) result.elements++;\n    else if(node.nodeType===3) result.text++;\n    else if(node.nodeType===8) result.comments++;\n  }\n  return result;\n};',
    'DOM 树不只有元素；childNodes 包含当前层级全部节点，nodeType 才能区分元素、文本和注释。');

  dom('dom-navigation-depth-code-01', 'dom-navigation', '从项目找到相邻元素项目',
    '定义 window.neighbors(id)：在 #steps 的直接 li 中按 data-id 找项目，返回其前后相邻元素项目的 data-id，格式 {before,after}；边界或找不到时用 null。项目之间有空白文本节点，嵌套 li 不属于步骤。',
    '<ol id="steps">\n<li data-id="a">A</li>\n<li data-id="b">B<ul><li data-id="nested">子项</li></ul></li>\n<li data-id="c">C</li>\n</ol>',
    'window.neighbors = function(id) {\n  // 在这里实现\n};',
    [['中间与边界', 'assert.deepEqual(window.neighbors("b"),{before:"a",after:"c"});assert.deepEqual(window.neighbors("a"),{before:null,after:"b"})'], ['嵌套项和缺失项', 'assert.deepEqual(window.neighbors("nested"),{before:null,after:null});assert.deepEqual(window.neighbors("x"),{before:null,after:null})'], ['动态新增', 'const li=document.createElement("li");li.dataset.id="d";document.querySelector("#steps").append(li);assert.deepEqual(window.neighbors("c"),{before:"b",after:"d"})']],
    ['从 #steps.children 里查找直接项目。', 'previousElementSibling 和 nextElementSibling 跳过文本。', '找不到时返回两个 null。'],
    'window.neighbors = function(id) {\n  const step=Array.from(document.querySelector("#steps").children).find(item=>item.tagName==="LI" && item.dataset.id===id);\n  return {before:step?.previousElementSibling?.dataset.id ?? null,after:step?.nextElementSibling?.dataset.id ?? null};\n};',
    '先限定为列表直接子元素，再用元素兄弟属性跳过缩进文本，避免把嵌套 li 当作相邻步骤。');

  dom('searching-elements-dom-depth-code-01', 'searching-elements-dom', '从嵌套目标查找可操作项',
    '定义 window.actionOf(node)：从 node 向上找最近的 [data-action] 元素，但只有它位于 #toolbar 内才返回该元素；外部按钮和 #toolbar 自己都不能作为操作项。支持后来加入的项目。',
    '<div id="toolbar"><button data-action="save"><span id="inner">保存</span></button></div><button data-action="delete" id="outside"><span id="outer-inner">删除</span></button>',
    'window.actionOf = function(node) {\n  // 在这里实现\n};',
    [['嵌套目标', 'const button=document.querySelector("#toolbar button");assert.equal(window.actionOf(document.querySelector("#inner")),button)'], ['排除范围外和容器自身', 'assert.equal(window.actionOf(document.querySelector("#outer-inner")),null);assert.equal(window.actionOf(document.querySelector("#toolbar")),null)'], ['动态项目', 'const button=document.createElement("button");button.dataset.action="share";button.innerHTML="<span id=added>分享</span>";document.querySelector("#toolbar").append(button);assert.equal(window.actionOf(document.querySelector("#added")),button)']],
    ['closest 从 node 自身和祖先中寻找。', '找到候选后验证 #toolbar.contains(candidate)。', '必须排除容器本身。'],
    'window.actionOf = function(node) {\n  const toolbar=document.querySelector("#toolbar");\n  const action=node.closest("[data-action]");\n  return action && action!==toolbar && toolbar.contains(action) ? action : null;\n};',
    'closest 处理嵌套点击目标；范围验证阻止外部同名操作被误识别。');

  dom('basic-dom-node-properties-depth-code-01', 'basic-dom-node-properties', '辨认节点的名称和内容',
    '定义 window.describeNode(node)：返回 {type,name,content}。元素 type 为 "element"、name 使用小写标签名、content 为去除首尾空白的 textContent；文本节点 type 为 "text"、name 为 "#text"、content 为原始文本；注释节点 type 为 "comment"、name 为 "#comment"、content 为原始注释内容。',
    '<div id="sample">  A <b>B</b><!-- note --></div>',
    'window.describeNode = function(node) {\n  // 在这里实现\n};',
    [['元素描述', 'const b=document.querySelector("#sample b");assert.deepEqual(window.describeNode(b),{type:"element",name:"b",content:"B"})'], ['文本和注释', 'const root=document.querySelector("#sample");assert.deepEqual(window.describeNode(root.childNodes[0]),{type:"text",name:"#text",content:"  A "});assert.deepEqual(window.describeNode(root.lastChild),{type:"comment",name:"#comment",content:" note "})'], ['容器文字含后代', 'const root=document.querySelector("#sample");assert.equal(window.describeNode(root).content,"A B")']],
    ['nodeType 区分元素、文本与注释。', '元素的 tagName 可转为小写；其他节点有 nodeName。', '元素文字需要 trim，文本和注释保留原样。'],
    'window.describeNode = function(node) {\n  if(node.nodeType===1) return {type:"element",name:node.tagName.toLowerCase(),content:node.textContent.trim()};\n  if(node.nodeType===3) return {type:"text",name:"#text",content:node.textContent};\n  if(node.nodeType===8) return {type:"comment",name:"#comment",content:node.textContent};\n};',
    '元素、文本和注释是不同节点类型；元素的文本会汇总后代文字，而原始文本节点内容应保留空白。');

  dom('dom-attributes-and-properties-depth-code-01', 'dom-attributes-and-properties', '正确切换布尔特性',
    '定义 window.setFieldDisabled(id, disabled)：在 #fields 的直接 input 中按 data-id 找到目标。disabled 为真时添加 disabled 布尔特性，为假时移除它。返回目标是否存在；不影响其他输入框。',
    '<div id="fields"><input data-id="a" disabled="false"><input data-id="b"></div>',
    'window.setFieldDisabled = function(id, disabled) {\n  // 在这里实现\n};',
    [['移除 false 字符串形式的布尔特性', 'assert.equal(window.setFieldDisabled("a",false),true);assert.equal(document.querySelector("[data-id=a]").hasAttribute("disabled"),false)'], ['启用与其他输入框', 'assert.equal(window.setFieldDisabled("b",true),true);assert.equal(document.querySelector("[data-id=b]").hasAttribute("disabled"),true);assert.equal(document.querySelector("[data-id=a]").hasAttribute("disabled"),false)'], ['不存在的 id', 'assert.equal(window.setFieldDisabled("missing",true),false)']],
    ['disabled="false" 仍代表特性存在。', '先在 #fields.children 中按 dataset.id 查找。', '使用 setAttribute 或 removeAttribute 操作特性的存在。'],
    'window.setFieldDisabled = function(id, disabled) {\n  const field=Array.from(document.querySelector("#fields").children).find(input=>input.tagName==="INPUT" && input.dataset.id===id);\n  if(!field) return false;\n  if(disabled) field.setAttribute("disabled",""); else field.removeAttribute("disabled");\n  return true;\n};',
    'HTML 布尔特性由是否存在决定，写入字符串 false 并不能启用输入框。');

  dom('modifying-document-depth-code-01', 'modifying-document', '移动已有项目而非复制',
    '定义 window.moveCard(id, targetId)：把 data-id 为 id 的 .card 移动到 #left 或 #right 容器末尾，保留节点身份及其子节点；任一目标不存在时返回 false 且不改 DOM，成功返回 true。',
    '<div id="left"><article class="card" data-id="a"><span>A</span></article><article class="card" data-id="b">B</article></div><div id="right"><article class="card" data-id="c">C</article></div>',
    'window.moveCard = function(id, targetId) {\n  // 在这里实现\n};',
    [['跨容器移动保持身份', 'const a=document.querySelector("[data-id=a]");assert.equal(window.moveCard("a","right"),true);assert.equal(a.parentElement.id,"right");assert.equal(document.querySelector("[data-id=a]"),a);assert.equal(a.querySelector("span").textContent,"A")'], ['同容器移到末尾', 'const c=document.querySelector("[data-id=c]");assert.equal(window.moveCard("c","right"),true);assert.equal(document.querySelector("#right").lastElementChild,c)'], ['失败时不更改结构', 'const before=document.querySelector("#right").innerHTML;assert.equal(window.moveCard("missing","left"),false);assert.equal(window.moveCard("a","missing"),false);assert.equal(document.querySelector("#right").innerHTML,before)']],
    ['先找到卡片和目标容器，并确认目标为 left/right。', '节点只能有一个父节点。', 'append 现有节点会移动它，不会复制。'],
    'window.moveCard = function(id, targetId) {\n  if(targetId!=="left" && targetId!=="right") return false;\n  const card=Array.from(document.querySelectorAll(".card")).find(item=>item.dataset.id===id);\n  const target=document.getElementById(targetId);\n  if(!card || !target) return false;\n  target.append(card);\n  return true;\n};',
    'append 已存在的节点会移动它；先验证目标，再执行移动，可避免失败时改动 DOM。');

  dom('styles-and-classes-depth-code-01', 'styles-and-classes', '进度条的数值、样式与语义同步',
    '定义 window.updateProgress(value)：把 value 转为数字并限制到 0～100；非有限数字按 0 处理。将 #progress 的内联 width 设为对应百分比，把 aria-valuenow 设为同一数值的字符串，并返回最终数值。',
    '<div id="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" style="width:0%"></div>',
    'window.updateProgress = function(value) {\n  // 在这里实现\n};',
    [['正常值同步', 'assert.equal(window.updateProgress(37),37);const bar=document.querySelector("#progress");assert.equal(bar.style.width,"37%");assert.equal(bar.getAttribute("aria-valuenow"),"37")'], ['边界截断', 'assert.equal(window.updateProgress(130),100);assert.equal(document.querySelector("#progress").style.width,"100%");assert.equal(window.updateProgress(-4),0)'], ['无效输入', 'assert.equal(window.updateProgress("bad"),0);assert.equal(document.querySelector("#progress").getAttribute("aria-valuenow"),"0")']],
    ['先用 Number(value) 得到数字，并用 Number.isFinite 检查。', 'Math.max 和 Math.min 可把范围限制在 0～100。', '内联样式需要百分号，ARIA 属性需要字符串数值。'],
    'window.updateProgress = function(value) {\n  const number=Number(value);\n  const progress=Number.isFinite(number)?Math.min(100,Math.max(0,number)):0;\n  const bar=document.querySelector("#progress");\n  bar.style.width=`${progress}%`;\n  bar.setAttribute("aria-valuenow",String(progress));\n  return progress;\n};',
    '进度条可见宽度和无障碍数值必须来自同一个经过限制的结果，避免显示与语义不一致。');
}
