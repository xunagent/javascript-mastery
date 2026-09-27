export function addEventDepthCodeExercises({ dom }) {
  dom('introduction-browser-events-depth-code-01', 'introduction-browser-events', '反复启停同一个监听器',
    '定义 window.setTracking(enabled)：enabled 为真时让 #track 的 click 每次使 window.trackCount 加一；为假时停止计数。重复启用不能产生重复处理，关闭后再启用仍应工作。初始 trackCount 为 0。',
    '<button id="track">追踪</button>',
    'window.trackCount=0;\nwindow.setTracking=function(enabled){\n  // 在这里实现\n};',
    [['启用与重复启用', 'const button=document.querySelector("#track");window.setTracking(true);window.setTracking(true);button.click();assert.equal(window.trackCount,1)'], ['关闭后不计数', 'window.setTracking(false);document.querySelector("#track").click();assert.equal(window.trackCount,1)'], ['再次启用', 'window.setTracking(true);document.querySelector("#track").click();assert.equal(window.trackCount,2)']],
    ['removeEventListener 需要注册时同一个函数对象。', '在 setTracking 外保存稳定的 handler。', '重复 addEventListener 同一函数不会产生重复注册。'],
    'window.trackCount=0;\nconst trackingHandler=()=>{window.trackCount++};\nwindow.setTracking=function(enabled){\n  const button=document.querySelector("#track");\n  if(enabled) button.addEventListener("click",trackingHandler);\n  else button.removeEventListener("click",trackingHandler);\n};',
    '启停监听器必须保留同一个函数引用；每次调用时临时创建箭头函数会使移除操作找不到原监听器。');

  dom('bubbling-and-capturing-depth-code-01', 'bubbling-and-capturing', '只拦截指定按钮的冒泡',
    '给 #panel 添加 click 监听器，使每次到达容器的点击令 window.panelClicks 加一。#quiet 按钮点击时应阻止冒泡；#loud 按钮及其内部 span 点击仍应到达容器。不要阻止按钮自己的其他监听器。',
    '<div id="panel"><button id="quiet">静默</button><button id="loud"><span id="nested">普通</span></button></div>',
    'window.panelClicks=0;\n// 在这里注册监听器',
    [['指定按钮不冒泡', 'document.querySelector("#quiet").click();assert.equal(window.panelClicks,0)'], ['其他目标继续冒泡', 'document.querySelector("#loud").click();document.querySelector("#nested").click();assert.equal(window.panelClicks,2)'], ['同元素其他监听器仍执行', 'let seen=false;document.querySelector("#quiet").addEventListener("click",()=>{seen=true});document.querySelector("#quiet").click();assert.equal(seen,true);assert.equal(window.panelClicks,2)']],
    ['容器上的监听器负责计数。', '在 #quiet 上的监听器调用 event.stopPropagation()。', '不要用 stopImmediatePropagation，它会阻止同元素后续监听器。'],
    'window.panelClicks=0;\ndocument.querySelector("#panel").addEventListener("click",()=>{window.panelClicks++});\ndocument.querySelector("#quiet").addEventListener("click",event=>event.stopPropagation());',
    'stopPropagation 阻止事件继续到父容器，但不会阻止当前按钮上的其他监听器；其他按钮仍可正常冒泡。');

  dom('event-delegation-depth-code-01', 'event-delegation', '委托处理动态命令按钮',
    '给 #toolbar 注册一次 click 委托。点击内部 button[data-command] 或其后代时，将命令名追加到 window.commands；点击容器空白或外部同名按钮不记录。后来插入的命令按钮也应生效。',
    '<div id="toolbar"><button data-command="save"><span id="save-icon">保存</span></button></div><button data-command="outside" id="external">外部</button>',
    'window.commands=[];\n// 在这里注册委托监听器',
    [['嵌套目标与空白', 'document.querySelector("#save-icon").click();document.querySelector("#toolbar").click();assert.deepEqual(window.commands,["save"])'], ['动态按钮', 'const button=document.createElement("button");button.dataset.command="share";document.querySelector("#toolbar").append(button);button.click();assert.deepEqual(window.commands,["save","share"])'], ['外部不受影响', 'document.querySelector("#external").click();assert.deepEqual(window.commands,["save","share"])']],
    ['委托监听器应挂在稳定的 #toolbar 上。', 'event.target.closest("button[data-command]") 可以处理按钮内图标。', '确认按钮被 toolbar 包含后再记录命令。'],
    'window.commands=[];\nconst toolbar=document.querySelector("#toolbar");\ntoolbar.addEventListener("click",event=>{\n  const button=event.target.closest("button[data-command]");\n  if(button && toolbar.contains(button)) window.commands.push(button.dataset.command);\n});',
    '委托让一个容器监听器覆盖动态后代；closest 处理嵌套目标，范围检查避免误收外部同名按钮。');
}
