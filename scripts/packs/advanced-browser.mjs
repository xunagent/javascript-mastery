export function addAdvancedBrowserExercises({ code, choice }) {
  choice('popup-windows-01', 'popup-windows', '弹窗何时失去父窗口引用',
    '页面调用 window.open 打开子页面。子页面需要通过 opener 向父页面发消息。哪种情况最可能使 window.opener 为 null？',
    '<a href="/report" target="_blank" rel="noopener">报告</a>',
    ['子页面和父页面同源', '链接使用 rel="noopener"', '父页面调用了 focus()', '子页面调用了 document.title'], 1,
    ['关注链接的 rel 属性。', 'noopener 会切断打开者引用。', '切断 opener 可降低反向标签劫持风险。'],
    'noopener 明确要求新页面不保留 opener。需要双向通信时，应设计受控消息通道，而不能同时依赖这个引用。');

  choice('cross-window-communication-01', 'cross-window-communication', '只接受可信窗口的消息',
    '父页面接收子 iframe 的 postMessage。iframe 可能跳转，页面上也有其他 iframe。如何验证消息来源？',
    'window.addEventListener("message", event => { /* ... */ });',
    ['只检查 event.data.type', '同时检查 event.origin 和 event.source，并校验 event.data 结构', '只检查 event.isTrusted', '只检查 event.source'], 1,
    ['origin 表示发送方的源。', 'source 表示发送方窗口对象。', '消息数据仍需按协议校验。'],
    'origin 用来限制来源域，source 用来限定具体窗口，data 则需要结构校验。只检查其中一项不足以识别预期发送方和消息格式。');

  choice('clickjacking-01', 'clickjacking', '阻止页面被恶意嵌入',
    '攻击者把支付确认页透明地叠在诱饵按钮上。站点最合适的基础防护是什么？',
    '',
    ['给按钮增加 z-index', '服务器配置 Content-Security-Policy 的 frame-ancestors 限制可嵌入来源', '禁止页面使用 pointer-events', '把按钮文本改为随机内容'], 1,
    ['问题在于谁可以将页面放进 iframe。', '这一限制需要由被嵌入页面的响应提供。', 'frame-ancestors 控制哪些祖先页面可以嵌入它。'],
    'frame-ancestors 由目标站点响应设置，可限制允许嵌入页面的来源。单靠页面内按钮样式无法控制攻击者的框架布局。');

  code('arraybuffer-binary-arrays-01', 'arraybuffer-binary-arrays', '按协议读取二进制帧',
    '实现 decodeFrame(buffer)：前 2 字节是无符号 16 位小端序 id，第 3 字节是状态标志；最低位表示 active。返回 {id, active}。输入为 ArrayBuffer。',
    'function decodeFrame(buffer) {\n  // 在这里实现\n}',
    [['小端序与状态位', 'const b=new Uint8Array([0x34,0x12,0b101]);assert.deepEqual(decodeFrame(b.buffer),{id:0x1234,active:true})'], ['关闭状态', 'const b=new Uint8Array([1,0,0b110]);assert.deepEqual(decodeFrame(b.buffer),{id:1,active:false})'], ['最高字节值', 'const b=new Uint8Array([255,255,1]);assert.deepEqual(decodeFrame(b.buffer),{id:65535,active:true})']],
    ['多字节整数需要明确字节序。', 'DataView.getUint16 的第二参数决定是否小端序。', '检查标志位可用 (flags & 1) !== 0。'],
    'function decodeFrame(buffer) {\n  const view = new DataView(buffer);\n  return { id: view.getUint16(0, true), active: (view.getUint8(2) & 1) !== 0 };\n}',
    'DataView 能按协议指定字节序。状态位必须用位与运算读取，不能把整个字节转成布尔值。', '稍有难度');

  code('text-decoder-01', 'text-decoder', '按字节长度截断 UTF-8 文本',
    '实现 fitsUtf8(text, maxBytes)：判断 text 编码为 UTF-8 后是否不超过 maxBytes 字节。不能用字符串长度代替字节长度。',
    'function fitsUtf8(text, maxBytes) {\n  // 在这里实现\n}',
    [['ASCII', 'assert.equal(fitsUtf8("abc",3),true);assert.equal(fitsUtf8("abc",2),false)'], ['中文占多个字节', 'assert.equal(fitsUtf8("你好",6),true);assert.equal(fitsUtf8("你好",5),false)'], ['表情符号', 'assert.equal(fitsUtf8("🙂",4),true);assert.equal(fitsUtf8("🙂",3),false)']],
    ['String.length 统计 UTF-16 代码单元。', 'TextEncoder 默认生成 UTF-8 字节。', '比较 new TextEncoder().encode(text).byteLength。'],
    'function fitsUtf8(text, maxBytes) {\n  return new TextEncoder().encode(text).byteLength <= maxBytes;\n}',
    '同一字符在 UTF-8 中可能占多个字节，JavaScript 字符串长度不能表示传输字节数。');

  choice('blob-01', 'blob', '生成可下载文件并释放 URL',
    '应用把文本转成 Blob，调用 URL.createObjectURL 后把它设置为下载链接 href。下载完成且链接不再需要时，应做什么？',
    '',
    ['调用 URL.revokeObjectURL(url)', '调用 blob.close()', '调用 URL.delete(url)', '无需考虑，该 URL 是普通网络地址'], 0,
    ['object URL 会把 Blob 关联在内存中。', '释放时使用 URL 上的对应方法。', '不要在用户点击之前过早释放。'],
    '对象 URL 需要在不再使用时通过 revokeObjectURL 释放；释放过早会使下载链接失效。');

  choice('file-01', 'file', '读取用户选择文件的时机',
    '用户选择 200MB 文件，只需要前 16 字节判断格式。哪种做法更节省内存？',
    '',
    ['使用 file.slice(0, 16).arrayBuffer()', '先把整个文件读成 data URL', '先复制整个文件到一个字符串', '把 file.name 当作文件内容'], 0,
    ['File 继承 Blob 的分片能力。', '只需读取一小段，不必加载整体。', 'slice 返回选定范围的新 Blob。'],
    'File 可用 slice 取出开头 16 字节，再读取这一小段的 ArrayBuffer。文件名不能可靠表示文件真实格式。');

  code('fetch-01', 'fetch', '同时处理 HTTP 错误和 JSON',
    '实现 loadProfile(id, request)：request(url) 返回 Response 风格对象。只有 response.ok 为真时才返回解析后的 JSON；否则抛出包含 HTTP 状态码的 Error。保留网络错误向外传播。',
    'async function loadProfile(id, request) {\n  // 在这里实现\n}',
    [['成功解析', 'return loadProfile(7,async url=>({ok:true,status:200,json:async()=>({id:7,url})})).then(x=>assert.deepEqual(x,{id:7,url:"/api/profiles/7"}))'], ['HTTP 错误要拒绝', 'return loadProfile(2,async()=>({ok:false,status:404})).then(()=>{throw Error("应拒绝")},e=>assert.ok(e.message.includes("404")))'], ['网络错误向外传播', 'return loadProfile(2,async()=>{throw Error("offline")}).then(()=>{throw Error("应拒绝")},e=>assert.equal(e.message,"offline"))']],
    ['fetch 风格请求通常不会因 404 自动拒绝。', '先检查 response.ok，再调用 response.json()。', '失败时 throw new Error(`HTTP ${response.status}`)。'],
    'async function loadProfile(id, request) {\n  const response = await request(`/api/profiles/${id}`);\n  if (!response.ok) throw new Error(`HTTP ${response.status}`);\n  return response.json();\n}',
    '网络失败和 HTTP 非成功状态不同。前者由 request 拒绝，后者要显式检查 ok；两种错误都应留给调用方处理。');

  choice('formdata-01', 'formdata', '上传文件时的请求头',
    '用 fetch 发送 FormData，其中包含文件。哪种 Content-Type 处理方式正确？',
    'const body = new FormData(form);\nfetch("/upload", { method: "POST", body });',
    ['手动设置 multipart/form-data，不加 boundary', '通常不手动设置 Content-Type，让浏览器连同 boundary 一起生成', '设置 application/json', '设置 text/plain'], 1,
    ['multipart/form-data 需要边界参数。', '浏览器编码 FormData 时会知道实际边界。', '手写不带 boundary 的头会导致服务器难以解析。'],
    '发送 FormData 时让浏览器生成 Content-Type 和 boundary。手写 multipart/form-data 却漏掉 boundary 会破坏请求体解析。');

  choice('fetch-progress-01', 'fetch-progress', '流式统计下载进度',
    '需要显示 fetch 下载进度。response.body.getReader() 逐块读取后，哪种条件下可以可靠显示百分比？',
    '',
    ['每读一块就加 10%', '知道总字节数，例如可信的 Content-Length，并累计每块 value.byteLength', '只需要 response.status', '只需要 response.url'], 1,
    ['百分比需要分子和分母。', '已读字节数来自每块的 byteLength。', '没有总长度时只能显示已下载字节数或不确定进度。'],
    '读取流可以累计已收到的字节。只有掌握可信总长度时才能计算百分比；缺少总长度时应显示不确定进度。');

  code('fetch-abort-01', 'fetch-abort', '转交中止信号',
    '实现 loadWithSignal(url, signal, request)：把外部 AbortSignal 传给 request 的选项，并直接返回 request 的结果；不得自行创建新的控制器。',
    'function loadWithSignal(url, signal, request) {\n  // 在这里实现\n}',
    [['传入原信号', 'const c=new AbortController();const r=loadWithSignal("/x",c.signal,(url,options)=>({url,options}));assert.equal(r.url,"/x");assert.equal(r.options.signal,c.signal)'], ['中止状态可观察', 'const c=new AbortController();c.abort();const r=loadWithSignal("/x",c.signal,(_,o)=>o.signal.aborted);assert.equal(r,true)']],
    ['调用方已经提供了 signal。', '选项对象写作 { signal }。', 'return request(url, { signal })。'],
    'function loadWithSignal(url, signal, request) {\n  return request(url, { signal });\n}',
    'AbortSignal 是取消请求的共享通知。把同一个信号向下传递，调用方才能控制请求生命周期。');

  choice('fetch-crossorigin-01', 'fetch-crossorigin', '带凭据的跨源响应',
    '网页从 https://app.example 请求 https://api.example，fetch 设置 credentials:"include"。哪组响应头允许脚本读取响应？',
    '',
    ['Access-Control-Allow-Origin: * 和 Access-Control-Allow-Credentials: true', 'Access-Control-Allow-Origin: https://app.example 和 Access-Control-Allow-Credentials: true', '只有 Access-Control-Allow-Credentials: true', '只有 Access-Control-Allow-Origin: *'], 1,
    ['带凭据请求不能使用通配符来源。', '服务器需要明确允许请求方源。', '还要明确允许凭据。'],
    '带凭据的 CORS 响应需要精确的允许源与 Access-Control-Allow-Credentials: true；通配符 * 不符合要求。');

  choice('fetch-api-01', 'fetch-api', '区分请求模式与凭据模式',
    '开发者把跨源请求设置为 mode:"no-cors"，随后希望读取服务器返回的 JSON。最准确的结果是什么？',
    '',
    ['no-cors 自动跳过所有跨源限制并返回 JSON', '响应通常是不透明的，脚本不能读取 JSON；应由服务器正确配置 CORS', '只要再设置 credentials:"include" 就能读取', 'no-cors 会把跨源请求改为同源'], 1,
    ['no-cors 不等于关闭同源策略。', '不透明响应不能随意读取 body。', '要读取跨源数据，服务器必须允许该源。'],
    'no-cors 通常得到不透明响应，不能借它绕过 CORS 读取数据。应让目标服务器正确配置允许源及相关头。');

  code('url-01', 'url', '安全构造带重复键的查询地址',
    '实现 buildSearch(base, tags)：base 可能已有查询参数和 hash。保留已有参数与 hash，删除旧的 tag 参数，再按 tags 顺序追加重复的 tag。返回完整 URL 字符串。',
    'function buildSearch(base, tags) {\n  // 在这里实现\n}',
    [['保留其他参数与 hash', 'const x=new URL(buildSearch("https://x.test/find?page=2&tag=old#top",["js","dom"]));assert.equal(x.searchParams.get("page"),"2");assert.deepEqual(x.searchParams.getAll("tag"),["js","dom"]);assert.equal(x.hash,"#top")'], ['特殊字符由 API 编码', 'const x=new URL(buildSearch("https://x.test/",["a b","中&文"]));assert.deepEqual(x.searchParams.getAll("tag"),["a b","中&文"])'], ['空标签清除旧值', 'const x=new URL(buildSearch("https://x.test/?tag=old&x=1",[]));assert.deepEqual(x.searchParams.getAll("tag"),[]);assert.equal(x.searchParams.get("x"),"1")']],
    ['直接拼接字符串容易损坏已有查询与编码。', 'new URL(base) 提供 searchParams。', '先 delete("tag")，再逐个 append("tag", tag)。'],
    'function buildSearch(base, tags) {\n  const url = new URL(base);\n  url.searchParams.delete("tag");\n  for (const tag of tags) url.searchParams.append("tag", tag);\n  return url.toString();\n}',
    'URLSearchParams 负责转义和重复键。set 会覆盖前一个 tag，所以这里要使用 append。', '稍有难度');

  choice('xmlhttprequest-01', 'xmlhttprequest', '上传进度的监听位置',
    '旧项目仍使用 XMLHttpRequest。要观察上传文件的进度，监听器应挂在哪里？',
    '',
    ['xhr.upload 的 progress 事件', 'xhr.responseText 的 progress 事件', 'document 的 load 事件', 'XMLHttpRequest.prototype 的 click 事件'], 0,
    ['下载和上传进度的对象不同。', '上传相关事件在 xhr.upload 上。', 'progress 事件提供 loaded 等字段。'],
    'XMLHttpRequestUpload 即 xhr.upload 提供上传进度事件。下载进度则可在 xhr 本身监听。');

  choice('resume-upload-01', 'resume-upload', '恢复中断上传需要哪些信息',
    '大文件上传到 60% 后网络断开。客户端想从断点续传，下一次上传前必须和服务器就什么达成一致？',
    '',
    ['只看本地 progress 百分比即可', '稳定的文件或上传标识，以及服务器已确认接收的偏移量', '重新生成一个随机文件名即可', '只要设置 fetch 的 keepalive:true'], 1,
    ['本地进度不保证服务器已经写入。', '同一文件的上传需要被识别。', '偏移量以服务器确认的持久状态为准。'],
    '断点续传需要识别同一份上传，并查询服务器已确认的字节范围。仅凭客户端进度条无法得知服务端实际保存了多少。');

  choice('long-polling-01', 'long-polling', '长轮询返回后如何继续',
    '服务端在有新消息时结束一次长轮询响应。客户端正确的基本流程是什么？',
    '',
    ['只发一次请求，后续自动保持连接', '处理响应后立即发起下一次请求；失败时加重试间隔', '每 1 毫秒并发发送多个请求', '收到响应后改用同步 XHR'], 1,
    ['每次 HTTP 响应都会结束。', '下一次等待需要新的请求。', '网络错误时避免无间隔快速重试。'],
    '长轮询通过一轮接一轮的请求等待消息。成功响应后继续发起请求，失败时使用受控重试。');

  choice('websocket-01', 'websocket', '发送前确认连接状态',
    '应用创建 WebSocket 后立刻要发送订阅消息。哪种处理最可靠？',
    'const socket = new WebSocket("wss://example.test/stream");',
    ['构造器返回后立即 socket.send()', '等待 open 事件后发送，并处理连接关闭后的重连/状态', '把消息写到 socket.url', '等待 message 事件后才注册 open 事件'], 1,
    ['连接建立是异步过程。', 'send 需要处于 OPEN 状态。', 'open 事件表明握手完成。'],
    'WebSocket 构造器不会同步完成连接。通常在 open 事件后发送初始消息，并为关闭和重连设计状态处理。');

  choice('server-sent-events-01', 'server-sent-events', '选择单向实时推送',
    '行情面板只需服务器持续推送事件，客户端偶尔通过普通 POST 修改设置。哪种传输模型更贴合需求？',
    '',
    ['EventSource 接收服务器事件，POST 负责客户端操作', 'EventSource.send() 双向传输', '只能使用同步 XHR', '每一帧都新建 WebSocket'], 0,
    ['EventSource 的方向是服务器到客户端。', '客户端操作可以独立使用普通 HTTP。', 'EventSource 没有 send 方法。'],
    'Server-Sent Events 使用 EventSource 接收服务器推送；客户端发起修改仍可用 fetch。需要持续双向消息时再考虑 WebSocket。');

  choice('cookie-01', 'cookie', '脚本不可读取的会话 Cookie',
    '服务器设置会话 Cookie，希望浏览器随合适请求发送，但页面脚本不能通过 document.cookie 读取。应使用哪个属性？',
    '',
    ['HttpOnly', 'Max-Age=0', 'Path=/', 'SameSite=None'], 0,
    ['目标是阻止页面 JavaScript 读取。', '这个限制由服务器的 Set-Cookie 属性设置。', 'HttpOnly 不等于完全防御跨站请求伪造。'],
    'HttpOnly 使 Cookie 不暴露给 document.cookie。它不能替代 SameSite、CSRF 防护或服务端授权检查。');

  choice('localstorage-01', 'localstorage', '区分标签页临时状态与持久偏好',
    '表单草稿只需当前标签页会话保留；主题偏好关闭浏览器后仍应保留。最合适的搭配是什么？',
    '',
    ['草稿 sessionStorage，主题 localStorage', '草稿 localStorage，主题 sessionStorage', '两者都只存在普通变量', '两者都存在 URL hash'], 0,
    ['sessionStorage 通常按标签页会话隔离。', 'localStorage 跨会话持久保存同源键值。', '两者都只能存字符串，复杂数据需序列化。'],
    '当前标签页的临时草稿适合 sessionStorage；希望跨会话保留的主题设置适合 localStorage。敏感数据不应仅依赖这些存储保护。');

  choice('indexeddb-01', 'indexeddb', '离线大量记录的事务',
    '应用要离线保存大量结构化记录，并按索引查询。一次事务中写入多条记录，怎样判断整批写入已经持久成功？',
    '',
    ['第一条 request 的 success 事件', '事务 transaction 的 complete 事件', '调用 objectStore.add 后立刻成功', '浏览器触发 DOMContentLoaded'], 1,
    ['单个 request 成功，不等于整笔事务提交成功。', '事务可能在后续操作中 abort。', '用 transaction.complete 判断整体完成。'],
    'IndexedDB 的单条请求 success 只说明该请求成功；事务 complete 表示整笔事务完成，abort 表示失败。');

  choice('bezier-curve-01', 'bezier-curve', '选择先快后慢的缓动',
    '动画在开头迅速移动，接近终点时逐渐减速。应选择哪类速度曲线？',
    '',
    ['ease-out', 'ease-in', 'linear', 'steps(1, end)'], 0,
    ['关注开始与结束时的速度。', 'out 表示接近终点时放缓。', 'linear 全程速度近似恒定。'],
    'ease-out 开始较快，结束时减速，适合元素进入终点并稳定停下的过渡。');

  choice('css-animations-01', 'css-animations', '尊重减少动态效果设置',
    '页面有大幅持续滚动动画。希望用户开启系统“减少动态效果”后停止它，应使用什么？',
    '',
    ['@media (prefers-reduced-motion: reduce) 中覆盖动画', '只把动画时长加倍', '检测设备屏幕宽度', '在所有设备禁用 CSS'], 0,
    ['系统偏好可以通过媒体查询读取。', '减少动态效果不等于放慢。', '在该媒体查询中取消或替换大幅运动。'],
    'prefers-reduced-motion 能根据用户的系统偏好调整或关闭大幅动画，避免只凭屏幕尺寸猜测需求。');

  choice('js-animation-01', 'js-animation', '基于时间戳计算动画位置',
    'requestAnimationFrame 回调间隔并不固定。要让 600ms 的动画在不同刷新率下持续时间一致，应该如何计算进度？',
    '',
    ['每帧都把位置加固定的 2px', '用回调时间戳与起始时间之差除以 600ms，并把结果限制到 0～1', '用调用 requestAnimationFrame 的总次数除以 60', '只用 setInterval(16)'], 1,
    ['帧数会因设备和负载变化。', '时间差能表示实际经过的时长。', '进度需限制在 1，结束后停止请求下一帧。'],
    '基于实际时间差计算归一化进度，动画才不会因刷新率或掉帧改变总时长；固定每帧位移会产生不同速度。');

  choice('webcomponents-intro-01', 'webcomponents-intro', '组件边界与复用',
    '团队想封装可复用日期输入组件，既有自定义行为又要减少内部样式受页面影响。哪组浏览器能力更贴近这个目标？',
    '',
    ['Custom Elements 与 Shadow DOM', '只用全局变量与 document.write', '只用 Cookie 与 localStorage', '只用 CSS z-index'], 0,
    ['一个能力负责定义元素行为。', '另一个能力提供 DOM 和样式封装边界。', '它们可以配合 template 和 slot。'],
    'Custom Elements 可定义新元素及生命周期，Shadow DOM 提供内部结构与样式边界；二者常配合实现可复用组件。');

  choice('custom-elements-01', 'custom-elements', '自定义元素的属性更新',
    '自定义元素需要在 label 属性变化时更新内部文本。哪种定义能让 attributeChangedCallback 收到 label 的变化？',
    '',
    ['定义 static get observedAttributes() { return ["label"]; }', '只写 connectedCallback()', '把 label 设为私有字段', '只写 disconnectedCallback()'], 0,
    ['属性变化回调只观察列出的属性。', 'observedAttributes 是静态成员。', '还需要在回调中根据 newValue 更新视图。'],
    '只有列在 observedAttributes 中的属性变化会触发对应回调；回调里还需实际更新组件内容。');

  choice('shadow-dom-01', 'shadow-dom', '从外部查询封闭的内部结构',
    '组件使用 attachShadow({mode:"open"}) 创建影子树，里面有 #inner。外部执行 document.querySelector("#inner") 会怎样？',
    '',
    ['直接找到 #inner', '返回 null；需通过 host.shadowRoot 在影子树内查询', '抛出 SyntaxError', '自动把影子节点移动到普通 DOM'], 1,
    ['普通文档查询不穿透影子边界。', 'open 模式允许从 host 获取 shadowRoot。', '在 shadowRoot 上继续 querySelector。'],
    'document.querySelector 不会越过影子边界。open 模式下可通过 host.shadowRoot 查询内部节点；closed 模式则不提供该入口。');

  choice('template-element-01', 'template-element', '模板为何不立即显示',
    '页面含有 <template id="card"><p>内容</p></template>。初始页面不显示其中的 p。要生成两个独立卡片，应怎么做？',
    '',
    ['分别 cloneNode(true) 模板的 content 并插入两次', '把同一个 p 节点 append 两次，页面会保留两份', '把 template.hidden 设为 false 即可自动显示内容', '只复制 innerHTML 到 Cookie'], 0,
    ['template.content 是 DocumentFragment。', '同一 DOM 节点只能有一个父节点。', '每次实例化要克隆内容。'],
    'template 内容在初始解析时不渲染。每次克隆 content 后插入目标位置，才能得到独立的两份结构。');

  choice('slots-composition-01', 'slots-composition', '默认插槽与具名插槽',
    '组件影子树包含 <slot name="title"></slot><slot></slot>。外部有 <h2 slot="title">标题</h2><p>正文</p>。哪种分配正确？',
    '',
    ['h2 进入 title 插槽，p 进入默认插槽', '两个节点都进入默认插槽', '两个节点都进入 title 插槽', 'slot 属性会把 h2 移动到 document.head'], 0,
    ['带 slot 名称的节点匹配同名插槽。', '未指定 slot 的节点进入默认插槽。', '分配后节点仍属于光 DOM。'],
    'h2 的 slot="title" 匹配具名插槽；没有 slot 属性的 p 分配给默认插槽。');

  choice('shadow-dom-style-01', 'shadow-dom-style', '宿主与插槽内容的样式',
    '在组件影子树的样式中，想给宿主元素设置边框，并给被分配到插槽的顶层 h2 设置颜色。哪组选择器符合用途？',
    '',
    [':host 与 ::slotted(h2)', 'body 与 h2', ':root 与 ::before', 'html 与 #h2'], 0,
    ['宿主是影子树外层的组件元素。', 'slotted 匹配分配到插槽的顶层元素。', '::slotted 不能任意穿透 h2 的后代。'],
    ':host 选择组件宿主；::slotted(h2) 匹配插槽分配的顶层 h2。影子样式不能任意选择光 DOM 深层后代。');

  choice('shadow-dom-events-01', 'shadow-dom-events', '影子树事件的目标重定向',
    '影子树内部按钮触发一个可组合、会冒泡的 click。组件外监听器看到的 event.target 通常是什么？',
    '',
    ['影子树内部按钮', '组件宿主元素；需要 composedPath() 查看传播路径', 'document.documentElement', 'null'], 1,
    ['事件越过影子边界时会重定向。', '外部观察者通常看到宿主。', 'composedPath() 可提供完整传播路径（受模式与可见性限制）。'],
    '跨越影子边界后，外部监听器看到的 target 通常被重定向为宿主。需要分析路径时使用 composedPath()。');
}
