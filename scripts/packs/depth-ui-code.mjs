export function addUiDepthCodeExercises({ code }) {
  code('mouse-events-basics-depth-code-01', 'mouse-events-basics', '跨平台选择点击分类',
    '实现 classifySelectionClick(event)：只有主按钮点击才参与选择。主按钮且按 Ctrl 或 Meta 时返回 "toggle"；普通主按钮返回 "replace"；其余按钮返回 "ignore"。不要把 button 与 buttons 混用。',
    'function classifySelectionClick(event) {\n  // 在这里实现\n}',
    [['主按钮普通与组合', 'assert.equal(classifySelectionClick({button:0,ctrlKey:false,metaKey:false}),"replace");assert.equal(classifySelectionClick({button:0,ctrlKey:true,metaKey:false}),"toggle");assert.equal(classifySelectionClick({button:0,ctrlKey:false,metaKey:true}),"toggle")'], ['其他按钮忽略', 'assert.equal(classifySelectionClick({button:2,ctrlKey:true,metaKey:true}),"ignore");assert.equal(classifySelectionClick({button:1,ctrlKey:false,metaKey:false}),"ignore")']],
    ['event.button 表示触发点击的按钮编号。', '主按钮编号为 0。', 'Ctrl 和 Meta 对应不同平台常见的多选修饰键。'],
    'function classifySelectionClick(event) {\n  if(event.button!==0) return "ignore";\n  return event.ctrlKey || event.metaKey ? "toggle" : "replace";\n}',
    '先排除非主按钮，再用 Ctrl/Meta 判断多选切换，能同时兼顾常见桌面平台。');

  code('mousemove-mouseover-mouseout-mouseenter-mouseleave-depth-code-01', 'mousemove-mouseover-mouseout-mouseenter-mouseleave', '识别真正离开容器的 mouseout',
    '实现 leftRegion(region, relatedTarget)：鼠标移向 region 内部的后代时返回 false；移向外部或移出浏览器（relatedTarget 为 null）时返回 true。region 是有 contains 方法的 DOM 元素。',
    'function leftRegion(region, relatedTarget) {\n  // 在这里实现\n}',
    [['内部移动不算离开', 'const child={};const region={contains(node){return node===this||node===child}};assert.equal(leftRegion(region,child),false);assert.equal(leftRegion(region,region),false)'], ['外部和空目标', 'const region={contains(node){return node===this}};assert.equal(leftRegion(region,{}),true);assert.equal(leftRegion(region,null),true)']],
    ['mouseout 在进入内部子元素时也可能触发。', 'relatedTarget 是鼠标移向的元素，可能为 null。', '用 region.contains 判断新目标是否仍在区域内。'],
    'function leftRegion(region, relatedTarget) {\n  return !relatedTarget || !region.contains(relatedTarget);\n}',
    'mouseout 的 relatedTarget 仍在区域内时只是内部移动；离开区域或窗口时才算真正离开。');

  code('mouse-drag-and-drop-depth-code-01', 'mouse-drag-and-drop', '拖拽时保留抓取点并限制边界',
    '实现 dragPosition(pointer, grab, viewport, box)：pointer 是当前指针坐标 {x,y}，grab 是按下时指针到元素左上角的偏移，viewport/box 各有 width、height。返回盒子左上角 {left,top}，保留抓取点并限制在视口内；若盒子大于视口，该方向固定为 0。',
    'function dragPosition(pointer, grab, viewport, box) {\n  // 在这里实现\n}',
    [['保留抓取点', 'assert.deepEqual(dragPosition({x:130,y:90},{x:20,y:10},{width:500,height:400},{width:100,height:80}),{left:110,top:80})'], ['各方向边界', 'assert.deepEqual(dragPosition({x:999,y:-5},{x:20,y:10},{width:300,height:200},{width:100,height:80}),{left:200,top:0})'], ['盒子比视口大', 'assert.deepEqual(dragPosition({x:20,y:20},{x:5,y:5},{width:40,height:30},{width:60,height:80}),{left:0,top:0})']],
    ['原始左上角是 pointer 减去 grab。', '允许的最大坐标是 viewport 尺寸减 box 尺寸，最小为 0。', '把每个方向限制到 0 与最大坐标之间。'],
    'function dragPosition(pointer, grab, viewport, box) {\n  const limitX=Math.max(0,viewport.width-box.width);\n  const limitY=Math.max(0,viewport.height-box.height);\n  return {left:Math.min(limitX,Math.max(0,pointer.x-grab.x)),top:Math.min(limitY,Math.max(0,pointer.y-grab.y))};\n}',
    '拖拽位置要扣除最初抓取偏移，再分别限制横纵范围，避免元素跳到指针左上角或移出视口。');

  code('pointer-events-depth-code-01', 'pointer-events', '按 pointerId 追踪多个指针',
    '实现 createPointerTracker()：返回 handle(event) 函数。pointerdown 和 pointermove 记录 event.pointerId 对应的 {x:event.clientX,y:event.clientY}；pointerup 和 pointercancel 删除对应指针。每次返回当前活动指针的普通对象快照，键为 pointerId 字符串；旧快照不能被后续事件改动。',
    'function createPointerTracker() {\n  // 在这里实现\n}',
    [['多指针与移动', 'const h=createPointerTracker();const first=h({type:"pointerdown",pointerId:1,clientX:2,clientY:3});h({type:"pointerdown",pointerId:2,clientX:7,clientY:8});const now=h({type:"pointermove",pointerId:1,clientX:4,clientY:5});assert.deepEqual(first,{"1":{x:2,y:3}});assert.deepEqual(now,{"1":{x:4,y:5},"2":{x:7,y:8}})'], ['抬起与取消', 'const h=createPointerTracker();h({type:"pointerdown",pointerId:3,clientX:1,clientY:1});h({type:"pointerdown",pointerId:4,clientX:2,clientY:2});assert.deepEqual(h({type:"pointercancel",pointerId:3}),{"4":{x:2,y:2}});assert.deepEqual(h({type:"pointerup",pointerId:4}),{})']],
    ['不同触点由 pointerId 区分。', 'pointercancel 和 pointerup 都应清理活动状态。', '每次返回新对象快照，避免旧结果被后续更新污染。'],
    'function createPointerTracker() {\n  const active=new Map();\n  return function handle(event){\n    if(event.type==="pointerdown" || event.type==="pointermove") active.set(event.pointerId,{x:event.clientX,y:event.clientY});\n    if(event.type==="pointerup" || event.type==="pointercancel") active.delete(event.pointerId);\n    return Object.fromEntries(active);\n  };\n}',
    '多点交互需要用 pointerId 关联事件；结束和取消都清理状态，返回快照可避免调用方看到意外的后续变化。');

  code('keyboard-events-depth-code-01', 'keyboard-events', '过滤输入区和组合输入的保存快捷键',
    '实现 isSaveShortcut(event)：只识别 Ctrl+S 或 Meta+S 的首次 keydown；组合输入期间、长按重复、Alt 同按、来自 INPUT/TEXTAREA 或 contenteditable 的事件均返回 false。key 大小写不敏感。',
    'function isSaveShortcut(event) {\n  // 在这里实现\n}',
    [['跨平台与大小写', 'const base={type:"keydown",key:"S",ctrlKey:true,metaKey:false,altKey:false,repeat:false,isComposing:false,target:{tagName:"DIV",isContentEditable:false}};assert.equal(isSaveShortcut(base),true);assert.equal(isSaveShortcut({...base,ctrlKey:false,metaKey:true,key:"s"}),true)'], ['排除输入与重复', 'const b={type:"keydown",key:"s",ctrlKey:true,metaKey:false,altKey:false,repeat:false,isComposing:false,target:{tagName:"DIV",isContentEditable:false}};assert.equal(isSaveShortcut({...b,repeat:true}),false);assert.equal(isSaveShortcut({...b,isComposing:true}),false);assert.equal(isSaveShortcut({...b,target:{tagName:"INPUT",isContentEditable:false}}),false);assert.equal(isSaveShortcut({...b,target:{tagName:"SPAN",isContentEditable:true}}),false)'], ['排除其他组合', 'const b={type:"keydown",key:"s",ctrlKey:true,metaKey:false,altKey:false,repeat:false,isComposing:false,target:{tagName:"DIV",isContentEditable:false}};assert.equal(isSaveShortcut({...b,type:"keyup"}),false);assert.equal(isSaveShortcut({...b,altKey:true}),false);assert.equal(isSaveShortcut({...b,key:"a"}),false)']],
    ['先确认 keydown、s 和 Ctrl/Meta。', '组合输入、重复、Alt 应排除。', '输入框及 contenteditable 内不接管快捷键。'],
    'function isSaveShortcut(event) {\n  if(event.type!=="keydown" || event.key.toLowerCase()!=="s" || !(event.ctrlKey || event.metaKey)) return false;\n  if(event.altKey || event.repeat || event.isComposing) return false;\n  const tag=event.target.tagName.toUpperCase();\n  return tag!=="INPUT" && tag!=="TEXTAREA" && !event.target.isContentEditable;\n}',
    '快捷键不能只检查 key；还需考虑平台修饰键、输入法、长按重复与当前编辑目标，避免误抢用户输入。');

  code('onscroll-depth-code-01', 'onscroll', '计算剩余滚动距离与加载阈值',
    '实现 shouldLoadMore(metrics, threshold=80)：metrics 有 scrollHeight、clientHeight、scrollTop。剩余距离小于等于 threshold 时返回 true；负的 scrollTop 应按 0 处理，阈值不能为负。',
    'function shouldLoadMore(metrics, threshold=80) {\n  // 在这里实现\n}',
    [['接近底部', 'assert.equal(shouldLoadMore({scrollHeight:1000,clientHeight:400,scrollTop:520}),true);assert.equal(shouldLoadMore({scrollHeight:1000,clientHeight:400,scrollTop:519}),false)'], ['自定义阈值', 'assert.equal(shouldLoadMore({scrollHeight:600,clientHeight:400,scrollTop:150},50),true);assert.equal(shouldLoadMore({scrollHeight:600,clientHeight:400,scrollTop:149},50),false)'], ['负数处理', 'assert.equal(shouldLoadMore({scrollHeight:500,clientHeight:100,scrollTop:-20},-100),false);assert.equal(shouldLoadMore({scrollHeight:100,clientHeight:100,scrollTop:0},-10),true)']],
    ['剩余距离为 scrollHeight-clientHeight-scrollTop。', '先把 scrollTop 和阈值各限制到不小于 0。', '用 <= 包含恰好到达阈值的情况。'],
    'function shouldLoadMore(metrics, threshold=80) {\n  const top=Math.max(0,metrics.scrollTop);\n  const limit=Math.max(0,threshold);\n  return metrics.scrollHeight-metrics.clientHeight-top<=limit;\n}',
    '滚动加载阈值按剩余可滚动距离计算；对负值做边界处理可避免回弹等状态影响判断。');
}
