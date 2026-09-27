export function addLoadingDepthExercises({ choice }) {
  const cases = [
    ['onload-ondomcontentloaded','页面已就绪后才加载的脚本','一个按需加载的脚本在 DOMContentLoaded 之后执行。它再注册 DOMContentLoaded 监听器，初始化函数会自动运行吗？','',['不会；应先检查 document.readyState，已就绪则立即执行','会；浏览器每次注册都会重放该事件','会；只要脚本有 defer','不会；只能等下次页面刷新'],['DOMContentLoaded 是一次性生命周期事件。','晚注册不会重放历史事件。','readyState 可判断是否已经就绪。'],'晚到的脚本应检查 readyState，若非 loading 就立即初始化，否则等待 DOMContentLoaded。'],
    ['onload-ondomcontentloaded','样式表间接推迟 DOMContentLoaded','HTML 先加载外部样式表，后面紧跟同步脚本，该脚本读取计算样式。即使 DOMContentLoaded 本身不直接等待样式，它仍可能被推迟，为什么？','',['同步脚本要等前面的样式表，DOMContentLoaded 又要等同步脚本','DOMContentLoaded 总直接等待所有图片和样式','样式表会自动变成 defer 脚本','计算样式只能在 unload 时读取'],['同步脚本可能依赖前面的 CSS。','浏览器会在执行该脚本前等待样式。','DOMContentLoaded 需等这个脚本执行完。'],'样式表可通过阻塞后续同步脚本间接推迟 DOMContentLoaded。'],
    ['onload-ondomcontentloaded','离开页面不能指定确认框文案','未保存数据时在 beforeunload 中设置自定义提示字符串。现代浏览器通常如何显示确认？','',['可能显示浏览器自己的通用文案，而非页面自定义字符串','必定完整显示页面自定义字符串','自动静默取消导航','只在 DOMContentLoaded 后显示文案'],['浏览器限制网站操控离开页面的提示内容。','beforeunload 可请求确认。','自定义文案通常不会原样显示。'],'现代浏览器通常使用自己的通用离开提示，不允许页面随意指定确认框文案。'],
    ['script-async-defer','动态添加脚本的默认顺序','代码依次 createElement("script") 并 append A.js、B.js，但 B.js 先下载完成。默认情况下，哪个脚本可能先执行？','',['B.js；动态脚本默认异步','A.js；append 顺序绝对保证执行顺序','两者必须等 DOMContentLoaded 后一起执行','两个脚本都不会执行'],['动态脚本默认 async 行为。','加载先完成者可先执行。','依赖顺序时要显式处理。'],'动态添加的脚本默认按加载完成顺序执行，B.js 可能先于 A.js。'],
    ['script-async-defer','让动态脚本按插入顺序执行','依次插入多个有依赖关系的动态 script，想保留插入顺序。应在 append 前设置什么？','',['script.async=false','script.defer=true','script.type="async"','script.onload=null'],['动态脚本默认异步。','defer 特性不是这种场景的顺序开关。','显式 async=false 可改变动态脚本执行排序。'],'在动态脚本插入前设置 async=false，可按文档中插入的相对顺序执行。'],
    ['script-async-defer','defer 脚本与 DOMContentLoaded 的先后','两个外部 defer 脚本 A、B 按文档顺序出现。DOMContentLoaded 相对于它们通常何时触发？','',['在 A、B 都执行后','在 A 执行前','在 A、B 中间随机触发','只要图片未加载就永不触发'],['defer 保持文档顺序。','defer 脚本在 DOM 解析后执行。','DOMContentLoaded 会等待这些脚本。'],'DOMContentLoaded 通常在按顺序执行完外部 defer 脚本后触发。'],
    ['onload-onerror','iframe 的 load 不证明页面成功','iframe 指向的地址返回错误页面，父页面仍收到 iframe 的 load。这个事件能证明目标页面业务成功吗？','',['不能；iframe 的 load 可能在导航失败或错误页面时仍触发','能；load 必须代表 HTTP 200','能；load 会自动检验 iframe 中的业务变量','不能；iframe 从不会触发 load'],['iframe 的 load 有特殊历史行为。','它并非业务成功信号。','跨源时父页面也未必能检查其内部内容。'],'iframe 的 load 不保证目标页成功，可通过受信任的跨窗口消息等机制确认业务状态。'],
    ['onload-onerror','资源错误回调拿不到精确 HTTP 状态','外部 script 的 onerror 触发，业务想直接从事件得知响应是 404 还是 500。哪项判断更准确？','',['通常只能知道加载失败，无法仅靠 script.onerror 得到精确 HTTP 状态','onerror 一定提供 response.status','404 会触发 load，500 才触发 error','错误状态自动存于 script.dataset.status'],['资源元素的 error 事件不是 fetch Response。','浏览器通常不暴露具体 HTTP 错误详情。','需要可检查响应时应采用合适的请求方式。'],'script.onerror 通常只能报告加载失败，不提供精确 HTTP 状态码。'],
    ['onload-onerror','跨源脚本错误详情为何被隐藏','跨源脚本运行时抛错，window.onerror 只得到模糊的 "Script error."。若希望获取详细栈信息，还需要什么条件？','',['脚本使用合适的 crossorigin 设置，服务器也允许跨源访问','仅把 script.onload 改成 onerror','在脚本后面加 defer 即可','把目标 URL 改成相对路径但仍指向其他源'],['跨源错误详情受同源策略保护。','单改页面标签还不够。','资源服务器也需返回相应 CORS 许可。'],'详细跨源错误报告通常要求脚本的 crossorigin 配置与服务器 CORS 响应配合。']
  ];
  const indexes = new Map();
  for (const [lessonId, title, prompt, example, options, hints, explanation] of cases) {
    const index = (indexes.get(lessonId) || 0) + 1;
    indexes.set(lessonId, index);
    choice(`${lessonId}-depth-${String(index).padStart(2, '0')}`, lessonId, title, prompt, example, options, 0, hints, explanation);
  }
}
