export function addFormDepthCodeExercises({ code, dom }) {
  code('form-elements-depth-code-01', 'form-elements', '汇总多选控件当前选择',
    '实现 selectedValues(select)：接收有 options 集合的多选 select，按选项顺序返回所有当前 selected 为真的 value 数组。不要使用初始 HTML 的 selected 特性，因为用户之后可能改变选择。',
    'function selectedValues(select) {\n  // 在这里实现\n}',
    [['顺序与未选项', 'const select={options:[{value:"js",selected:true},{value:"css",selected:false},{value:"dom",selected:true}]};assert.deepEqual(selectedValues(select),["js","dom"])'], ['反映当前状态', 'const select={options:[{value:"a",selected:true},{value:"b",selected:false}]};select.options[0].selected=false;select.options[1].selected=true;assert.deepEqual(selectedValues(select),["b"])'], ['空选择', 'assert.deepEqual(selectedValues({options:[{value:"x",selected:false}]}),[])']],
    ['select.options 是选项集合。', '读取每个 option 当前的 selected property。', '过滤后按原顺序映射 value。'],
    'function selectedValues(select) {\n  return Array.from(select.options).filter(option=>option.selected).map(option=>option.value);\n}',
    '多选控件的当前状态保存在 option.selected，不能只看最初写在 HTML 里的 selected 特性。');

  dom('events-change-input-depth-code-01', 'events-change-input', '实时预览价格并处理无效输入',
    '给 #qty 和 #price 注册 input 监听器。每次任一字段变化时，把数量和单价解析为非负有限数字，缺失或无效按 0；把乘积按两位小数写到 #total.textContent。初始化时也计算一次；用户输入字段中的标签文本不能被当成 HTML。',
    '<input id="qty" value="2"><input id="price" value="3.5"><output id="total"></output>',
    '// 在这里注册监听器并初始化',
    [['初始计算', 'assert.equal(document.querySelector("#total").textContent,"7.00")'], ['数量实时变化', 'const qty=document.querySelector("#qty");qty.value="4";qty.dispatchEvent(new Event("input",{bubbles:true}));assert.equal(document.querySelector("#total").textContent,"14.00")'], ['无效和负数按零', 'const price=document.querySelector("#price");price.value="bad";price.dispatchEvent(new Event("input",{bubbles:true}));assert.equal(document.querySelector("#total").textContent,"0.00");price.value="-3";price.dispatchEvent(new Event("input",{bubbles:true}));assert.equal(document.querySelector("#total").textContent,"0.00")']],
    ['监听 input 可在每次输入时更新。', 'Number(value) 后用 Number.isFinite 检查；负值按 0。', '乘积用 toFixed(2)，写入 textContent。'],
    'const quantity=document.querySelector("#qty");\nconst price=document.querySelector("#price");\nconst total=document.querySelector("#total");\nfunction renderTotal(){\n  const parse=element=>{const n=Number(element.value);return Number.isFinite(n)&&n>=0?n:0};\n  total.textContent=(parse(quantity)*parse(price)).toFixed(2);\n}\nquantity.addEventListener("input",renderTotal);\nprice.addEventListener("input",renderTotal);\nrenderTotal();',
    'input 事件驱动实时计算；先规范化两个字段再求乘积，使用 textContent 输出可避免解析用户输入。');

  dom('forms-submit-depth-code-01', 'forms-submit', '表单提交时生成预览而不导航',
    '给 #profile 注册 submit 监听器。每次都阻止默认导航；读取 name 与 email 当前值并 trim。两者都非空时，设置 window.submission={name,email}、#status.textContent="已保存草稿"；否则设 submission=null、状态为 "请填写完整"。',
    '<form id="profile"><input name="name" value=" Lin "><input name="email" value=" a@example.test "><button type="submit">保存</button></form><p id="status"></p>',
    'window.submission=null;\n// 在这里注册 submit 监听器',
    [['有效提交被拦截并记录', 'const form=document.querySelector("#profile");const e=new Event("submit",{bubbles:true,cancelable:true});form.dispatchEvent(e);assert.equal(e.defaultPrevented,true);assert.deepEqual(window.submission,{name:"Lin",email:"a@example.test"});assert.equal(document.querySelector("#status").textContent,"已保存草稿")'], ['无效时清除旧记录', 'document.querySelector("[name=email]").value="   ";const e=new Event("submit",{bubbles:true,cancelable:true});document.querySelector("#profile").dispatchEvent(e);assert.equal(e.defaultPrevented,true);assert.equal(window.submission,null);assert.equal(document.querySelector("#status").textContent,"请填写完整")'], ['再次有效提交使用当前值', 'document.querySelector("[name=name]").value=" Mei ";document.querySelector("[name=email]").value=" m@example.test ";document.querySelector("#profile").dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));assert.deepEqual(window.submission,{name:"Mei",email:"m@example.test"})']],
    ['监听 form 的 submit，不只监听按钮 click。', '立即 preventDefault 阻止浏览器导航。', '每次从控件当前 value 读取并 trim，再同步状态。'],
    'window.submission=null;\nconst form=document.querySelector("#profile");\nform.addEventListener("submit",event=>{\n  event.preventDefault();\n  const name=form.querySelector("[name=name]").value.trim();\n  const email=form.querySelector("[name=email]").value.trim();\n  window.submission=name&&email?{name,email}:null;\n  document.querySelector("#status").textContent=window.submission?"已保存草稿":"请填写完整";\n});',
    'submit 事件覆盖按钮点击及键盘提交；取消默认行为后，从控件当前值构造草稿并反馈校验结果。');
}
