export function addUiDepthExercises({ choice }) {
  const cases = [
    ['mouse-events-basics','单击中的事件先后顺序','用户用主按钮完成一次普通单击。通常最符合浏览器事件顺序的是哪项？','',['mousedown → mouseup → click','click → mousedown → mouseup','mousedown → click → mouseup','mousemove → click → mousedown'],['click 在按下与释放后生成。','mouseup 发生在释放时。','先按下，再松开，最后 click。'],'普通单击的典型顺序是 mousedown、mouseup、click。'],
    ['mouse-events-basics','右键菜单不只来自鼠标右键','应用只在 mousedown 且 button===2 时关闭自定义菜单，为什么键盘菜单键仍可能弹出浏览器上下文菜单？','',['contextmenu 也可能由键盘触发，应处理 contextmenu 事件','键盘菜单键必定模拟 mousedown button===2','contextmenu 只能由鼠标触发','禁用 click 即可阻止一切菜单'],['上下文菜单有多种触发方式。','键盘菜单键不必生成鼠标 mousedown。','应在 contextmenu 中处理需要的行为。'],'contextmenu 事件可由鼠标或键盘产生，单看右键 mousedown 会漏掉键盘触发。'],
    ['mousemove-mouseover-mouseout-mouseenter-mouseleave','为何委托悬停常用 mouseover','列表容器只注册一个监听器，要识别动态加入项目的鼠标进入。mouseover 与 mouseenter 哪个更适合直接委托？','',['mouseover；它会冒泡到列表容器','mouseenter；它会自动冒泡','两者都不会冒泡','mousemove；它只在进入边界时触发一次'],['事件委托依赖后代事件到达祖先。','mouseover 会冒泡。','mouseenter 不以相同方式冒泡。'],'mouseover 适合通过冒泡进行悬停委托，配合 relatedTarget 可过滤项目内部移动。'],
    ['mousemove-mouseover-mouseout-mouseenter-mouseleave','离开浏览器窗口时的 relatedTarget','mouseout 事件发生时鼠标移出浏览器视口，没有新的页面元素。event.relatedTarget 可能是什么？','',['null','永远是 document.body','永远是 window','自动变成 event.target'],['relatedTarget 表示鼠标移向的另一个元素。','移出页面可能没有对应元素。','处理时要允许 null。'],'鼠标移出页面时 relatedTarget 可能为 null，不能无条件调用其 DOM 方法。'],
    ['mouse-drag-and-drop','拖动元素挡住落点检测','自定义拖动时用 document.elementFromPoint 寻找鼠标下的放置目标，但正被拖动的元素覆盖该点。哪种处理能找到其下元素？','',['检测时临时隐藏拖动元素或让它不接受指针命中','把 pageX 直接传给 elementFromPoint','把拖动元素 z-index 再提高','只调用 getBoundingClientRect 即可得到下层节点'],['elementFromPoint 返回该位置最上层可命中的元素。','被拖元素可能遮挡落点。','短暂排除被拖元素后再检测。'],'临时隐藏或禁用被拖元素的命中测试，才能用 elementFromPoint 找到其下的放置目标。'],
    ['mouse-drag-and-drop','拖放结束时清理全局监听器','自定义拖动在 document 上注册 mousemove 与 mouseup。mouseup 后为何应移除这两个监听器？','',['避免之后的移动继续触发拖动逻辑和积累重复监听器','因为 mouseup 会自动移除所有 document 监听器','否则元素的宽度会变成 0','因为浏览器禁止在 document 上长期注册事件'],['document 监听器不会因一次 mouseup 自动消失。','拖动有明确开始和结束生命周期。','结束时释放这次交互的监听器。'],'mouseup 后移除临时监听器，可防止后续鼠标移动误更新位置，也避免多次拖动累积处理器。'],
    ['pointer-events','touch-action 与自定义手势','移动端想在元素上实现横向拖动，但浏览器的默认触摸滚动经常接管手势。应重点考虑哪个 CSS 属性？','',['touch-action','user-select','pointer-events: none','cursor'],['浏览器会在手势开始时决定默认触摸行为。','touch-action 声明允许的原生手势。','pointer-events:none 会使元素不能成为指针目标。'],'touch-action 用于约束浏览器默认的触摸平移/缩放，使自定义 Pointer Events 手势可靠执行。'],
    ['pointer-events','isPrimary 与 pointerId 的职责','双指触控时，应用要分别追踪两个触点，同时标记哪一个是该类型的主指针。应分别读取什么？','',['pointerId 与 isPrimary','isPrimary 与 clientX','button 与 buttons','event.type 与 event.target'],['每个活动指针需要稳定身份。','主指针是额外的布尔语义。','两者不能互相替代。'],'pointerId 区分触点；isPrimary 标识该类型当前的主指针。'],
    ['keyboard-events','阻止按键默认输入的时机','输入框聚焦时，想拦截某快捷键，避免其字符进入输入框。在哪个事件中调用 preventDefault 通常更合适？','',['keydown','keyup','blur','change'],['keyup 发生在按键释放时，通常已经晚于默认输入。','keydown 在默认输入动作之前触发。','拦截前仍应确认快捷键及编辑上下文。'],'在 keydown 中取消可取消的默认行为，通常可在字符输入前拦截；keyup 往往太晚。'],
    ['keyboard-events','主键盘与数字小键盘的 Enter','表单想接受主键盘 Enter 和数字小键盘 Enter 的相同语义。通常优先检查哪个值？','',['event.key === "Enter"','event.code === "Enter"','event.code === "NumpadEnter"','event.key === "NumpadEnter"'],['key 表示按键语义。','code 区分物理位置。','两处 Enter 通常共享 key。'],'检查 event.key 的 Enter 语义，可同时覆盖主键盘和数字小键盘的确认操作。'],
    ['onscroll','把滚动更新合并到动画帧','scroll 回调高频触发，界面只需每帧更新一次吸顶状态。哪种做法较合适？','',['用标志位避免重复安排 requestAnimationFrame，在帧回调中计算并更新','每次 scroll 都同步读取与写入布局数十次','在每次 scroll 回调里递归调用 scrollTo','把全部更新放进无限微任务链'],['一帧内可收到多次 scroll。','requestAnimationFrame 与绘制节奏同步。','标志位避免安排多个重复帧任务。'],'把高频滚动事件合并到一次动画帧更新，可减少重复布局计算和绘制压力。'],
    ['onscroll','页面滚动和内部容器滚动不是一回事','一个 overflow:auto 的列表内部滚动，窗口本身位置未变。哪个值更直接表示列表自己的纵向滚动距离？','',['list.scrollTop','window.scrollY','window.innerHeight','document.title.length'],['滚动发生在列表元素内部。','window.scrollY 描述整个窗口。','元素自身有 scrollTop。'],'内部可滚动元素的位置应读取 list.scrollTop；窗口的 scrollY 可能保持不变。']
  ];
  const indexes = new Map();
  for (const [lessonId, title, prompt, example, options, hints, explanation] of cases) {
    const index = (indexes.get(lessonId) || 0) + 1;
    indexes.set(lessonId, index);
    choice(`${lessonId}-depth-${String(index).padStart(2, '0')}`, lessonId, title, prompt, example, options, 0, hints, explanation);
  }
}
