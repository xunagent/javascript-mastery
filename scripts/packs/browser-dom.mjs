export function addBrowserDomExercises({ dom }) {
  dom('document-modification-01','modifying-document','安全地向列表添加用户文字',
    '页面里有 #items 列表。定义 window.addItem(text)：创建一个 li，内容必须作为纯文本加入列表，并返回该 li。不得用 innerHTML 解释用户文字。',
    '<ul id="items"><li>已有项目</li></ul>',
    'window.addItem = function(text) {\n  // 在这里实现\n};',
    [['添加新节点','const li=window.addItem("新项目");assert.equal(li.tagName,"LI");assert.equal(document.querySelectorAll("#items li").length,2);assert.equal(li.textContent,"新项目")'],['危险内容作为文本','const li=window.addItem("<img src=x onerror=alert(1)>");assert.equal(li.querySelector("img"),null);assert.equal(li.textContent,"<img src=x onerror=alert(1)>")'],['原有节点保留','assert.equal(document.querySelector("#items li").textContent,"已有项目")']],
    ['创建真实的 li 元素。','用 textContent 放入用户字符串。','调用 #items.append(li)，最后返回 li。'],
    'window.addItem = function(text) {\n  const li=document.createElement("li");\n  li.textContent=text;\n  document.querySelector("#items").append(li);\n  return li;\n};',
    'textContent 把用户输入当作文本，不会解析其中的 HTML；append 加入新节点时也不会重建原有列表内容。');

  dom('event-delegation-02','event-delegation','为动态列表处理删除按钮',
    '给 #tasks 添加一个点击监听器：点击列表中任意带 data-remove 属性的按钮时，删除它所在的 li。以后动态添加的 li 也必须生效。点击列表里的普通文字不能删除项目。',
    '<ul id="tasks"><li>第一项 <button data-remove type="button">删除</button></li><li>第二项 <button data-remove type="button">删除</button></li></ul>',
    'const list = document.querySelector("#tasks");\n// 在这里添加监听器',
    [['初始按钮可删除','const list=document.querySelector("#tasks");list.querySelector("button").click();assert.equal(list.querySelectorAll("li").length,1);assert.ok(list.textContent.includes("第二项"))'],['动态按钮仍可删除','const list=document.querySelector("#tasks");const li=document.createElement("li");li.innerHTML="动态项 <button data-remove type=button>删除</button>";list.append(li);li.querySelector("button").click();assert.ok(!list.contains(li))'],['普通文字不会删除','const list=document.querySelector("#tasks");const before=list.querySelectorAll("li").length;list.querySelector("li").dispatchEvent(new MouseEvent("click",{bubbles:true}));assert.equal(list.querySelectorAll("li").length,before)']],
    ['监听器应放在始终存在的 #tasks 上。','event.target.closest("button[data-remove]") 可以向上寻找删除按钮。','找到按钮后再删除其最近的 li，并确认按钮属于 #tasks。'],
    'const list = document.querySelector("#tasks");\nlist.addEventListener("click", event => {\n  const button=event.target.closest("button[data-remove]");\n  if(!button || !list.contains(button)) return;\n  button.closest("li")?.remove();\n});',
    '事件委托让列表统一处理当前和未来的按钮。closest 兼容点击按钮内部元素；范围检查避免处理列表之外的节点。');
}
