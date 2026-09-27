export function addThirdAdvancedBrowserExercises({ choice, code }) {
  const scenarios = [
    ['popup-windows','弹窗被阻止后的处理','window.open(...) 返回 null。页面接下来应怎样处理？','',['把弹窗视为未成功打开，提供可点击链接或页面内替代入口','立即调用返回值的 focus()','无限循环重试 window.open','假设弹窗已经存在并发送 postMessage'],['浏览器可能拦截非用户手势弹窗。','返回 null 表示没有可用窗口引用。','应提供可访问的替代路径。'],'弹窗可能被阻止，代码必须处理 null，不能继续调用其方法或假定跨窗口通信可用。'],
    ['clickjacking','嵌入限制的防护目标','管理页面的 CSP frame-ancestors 设置为 none 后，攻击者还能通过 iframe 把该页面嵌入自己的站点吗？','',['符合策略的浏览器会拒绝这种嵌入','可以，只要 iframe 设置 opacity:0','可以，只要攻击者设置更高 z-index','frame-ancestors 只控制字体加载'],['frame-ancestors 管理父框架来源。','none 表示不允许任何祖先嵌入。','视觉 CSS 无法覆盖响应策略。'],'frame-ancestors none 要求浏览器拒绝把页面作为任何页面的子框架加载，是针对点击劫持的基础限制。'],
    ['arraybuffer-binary-arrays','切片复制与共享视图','想从 Uint8Array 的前 4 字节创建独立副本，后续修改不影响原数组。哪个方法符合要求？','',['bytes.slice(0,4)','bytes.subarray(0,4)','new DataView(bytes.buffer,0,4)','直接保存 bytes.buffer'],['subarray 共享同一底层缓冲区。','slice 创建新类型化数组并复制元素。','DataView 也可能共享原缓冲区。'],'Uint8Array.slice 复制选定字节；subarray 和 DataView 通常只是共享底层内存的视图。'],
    ['text-decoder','UTF-8 解码失败如何显式报错','收到不合法 UTF-8 字节时，默认 TextDecoder 可能替换为 U+FFFD。若协议要求拒绝损坏数据，应怎样创建解码器？','',['new TextDecoder("utf-8", {fatal:true})','new TextDecoder("utf-8", {ignoreBOM:true})','new TextEncoder()','String.fromCharCode(...bytes)'],['fatal 控制错误序列的处理。','默认模式可能插入替换字符。','ignoreBOM 只影响 BOM 处理。'],'fatal:true 让不合法输入在解码时抛出异常，适合要求严格校验字节流的协议。'],
    ['blob','Blob.slice 对大文件的意义','只需要上传 Blob 的第 1MB 分片。调用 blob.slice(0,1024*1024) 的主要好处是什么？','',['得到指定字节范围的 Blob，无需先把整个文件读入 JavaScript 内存','把原 Blob 内容永久删除','自动压缩分片','自动完成网络上传'],['slice 返回一个 Blob 片段。','文件数据可按范围处理。','读取与网络上传仍需后续操作。'],'Blob.slice 用于按字节范围取片，适合分块上传和局部读取；它本身不会执行上传。'],
    ['file','文件选择器的 accept 限制','<input type="file" accept="image/png"> 是否足以让服务器相信上传内容一定是 PNG？','',['不能；accept 主要辅助用户选择，服务端仍需验证文件内容','能；浏览器会加密证明格式','能；File.type 永远准确','只有移动端能'],['客户端的文件元数据和选择限制可被绕过。','服务端不能只信任扩展名与 MIME 声明。','内容格式需在服务端验证。'],'accept 改善选择体验，但不是可信的文件格式校验或服务器安全边界。'],
    ['formdata','FormData 的字符串化规则','对 FormData 调用 append("count", 0)，读取 get("count") 的值通常是什么？','',['字符串 "0"','数字 0','布尔值 false','null'],['FormData 字段主要是字符串或 Blob。','普通数字会转成字符串。','服务器收到的是表单字段文本。'],'非 Blob 的普通值会转换成字符串，因而读取到 "0"。'],
    ['fetch-progress','流只读一次的限制','代码用 response.body.getReader() 消费全部流后，又调用 response.json()。最可能发生什么？','',['响应体已被消费，json() 无法再重新读取；需预先 clone 或边读边解析','json() 自动重新发起请求','getReader() 不会消耗数据','只有 HTTP 204 会失败'],['body 是一次性数据流。','读取器消费后 bodyUsed 为真。','要两种用途需在消费前规划。'],'响应体不能随意重复消费。可以在读取前克隆响应，或把流收集后自行解码和解析。'],
    ['fetch-abort','AbortError 与其他网络错误','用户主动取消 fetch 时，catch 中怎样区分它与普通网络故障？','',['检查错误类型/名称是否为 AbortError，再分别处理','所有错误都当作用户取消','只检查 response.status===0','AbortController 会返回 false 而不抛错'],['中止通常使请求 Promise 拒绝。','AbortError 是取消的常见标识。','网络故障仍需单独反馈。'],'通过 AbortError 等明确的取消信号区分主动中止与网络故障，避免把用户取消显示成服务器错误。'],
    ['fetch-crossorigin','预检成功不等于实际请求成功','跨源 PUT 的 OPTIONS 预检已通过，实际请求返回 403。最准确的判断是什么？','',['CORS 许可和业务授权是不同检查；预检通过不保证实际请求成功','预检通过后实际状态码必定 200','浏览器会把 403 自动改成 200','只有 GET 才能返回 403'],['预检确认方法和请求头是否可发。','实际请求仍由服务器执行业务与权限验证。','403 是实际请求的拒绝状态。'],'CORS 预检通过只允许浏览器继续发请求，服务器仍可按认证和业务规则返回 403。'],
    ['fetch-api','请求体的流式消费','Request 或 Response 的 bodyUsed 从 false 变为 true，通常意味着什么？','',['主体已开始被消费，不能把同一流当作全新 body 再读一次','HTTP 连接永久关闭','URL 已改变','浏览器自动把 POST 改为 GET'],['body 是可消费的流。','读过后不能无成本重放。','clone 应在消费前考虑。'],'bodyUsed 表示请求/响应主体被消费，重复读取需要在之前克隆或重新构造数据。'],
    ['xmlhttprequest','XHR 发送前的配置顺序','使用 XHR 发 POST JSON，需要设置 Content-Type。哪种顺序正确？','',['xhr.open(...)，xhr.setRequestHeader(...)，xhr.send(body)','xhr.send(body)，xhr.open(...)，xhr.setRequestHeader(...)','xhr.setRequestHeader(...)，xhr.open(...)，xhr.send(body)','只调用 xhr.send(body)'],['请求头需在 open 后、send 前设置。','send 启动请求。','顺序错误会抛异常或不生效。'],'XHR 先 open 初始化请求，再设置头，最后 send 发送请求体。'],
    ['resume-upload','从服务端确认值恢复而非本地进度','本地记录“已上传 80%”，服务器只确认 60%。恢复时从哪个偏移继续最可靠？','',['以服务器确认的 60% 对应偏移为准，并校验上传标识','以本地 80% 为准，跳过中间数据','从文件末尾开始','无需确认，随机发送分片'],['客户端进度可能包含尚未确认的数据。','响应丢失或连接断开会造成差异。','服务器持久状态更可信。'],'断点续传应以服务端已确认偏移为准，避免跳过未保存的数据。'],
    ['long-polling','避免失败后的高速重试','长轮询请求因服务不可用连续失败。客户端若立即无间隔重试，可能造成什么？','',['请求风暴加重服务端压力；应使用退避和上限','会自动切换成 WebSocket','浏览器会阻止全部请求','服务端会自动修复'],['失败可能同时影响许多客户端。','同步重试会放大负载。','退避可减轻压力。'],'错误后应采用受控退避，必要时加抖动，避免大量客户端一起形成重试风暴。'],
    ['websocket','消息发送的背压信号','WebSocket 连续发送大量数据时，哪个属性可帮助观察尚未真正发出的排队字节？','',['socket.bufferedAmount','socket.readyState 的字符串长度','socket.url.length','socket.protocol.length'],['send 可能先把数据排入本地缓冲。','bufferedAmount 表示待发送字节量。','readyState 只表示连接状态。'],'bufferedAmount 可用于观察发送缓冲积压，必要时暂停生产消息以避免内存不断增长。'],
    ['server-sent-events','SSE 事件类型与监听','服务器发送 event: price 的 SSE 消息。客户端如何接收这种命名事件？','',['eventSource.addEventListener("price", handler)','只设置 eventSource.onmessage，命名事件会自动作为普通 message','eventSource.send("price")','window.addEventListener("fetch", handler)'],['SSE 可携带 event 字段。','命名事件按对应类型派发。','EventSource 是单向接收接口。'],'命名 SSE 事件可用 EventSource.addEventListener 按事件名订阅。'],
    ['localstorage','localStorage 写入可能失败','浏览器禁用存储或配额耗尽时，localStorage.setItem 可能怎样？','',['抛出异常；关键数据应处理失败并提供导出等备份途径','总是静默成功','自动写入服务器','把值改成 undefined'],['存储 API 不保证始终可写。','配额、隐私设置可能影响。','关键学习记录应有备份策略。'],'setItem 可能抛异常。应用应捕获失败并避免把本地存储当成唯一可靠存档。'],
    ['indexeddb','事务生命周期与 await','IndexedDB 事务中间等待与事务无关的长异步任务，再继续使用原事务，可能出现什么？','',['事务可能已经自动提交或失效，后续请求报 TransactionInactiveError','事务会无限期保持活动','浏览器自动创建同名事务','只有 readonly 事务受影响'],['事务活动状态受事件循环调度影响。','不能任意跨过无关异步等待。','需要时重新开启事务。'],'IndexedDB 事务可能在请求队列清空后自动结束。把无关的长 await 插入事务中会使后续操作失效。'],
    ['bezier-curve','过冲缓动的控制点','CSS cubic-bezier 的纵向控制点 y 值超出 0～1，可能产生什么视觉效果？','',['进度暂时超出起止值，形成过冲','动画自动停止','时间轴倒流','所有浏览器强制改成 linear'],['x 轴对应时间进度。','y 轴对应输出进度。','y 超出范围可产生超出终值的效果。'],'纵向控制点可超出 0～1，使插值出现过冲或回弹式运动。'],
    ['css-animations','动画结束时机的处理','CSS 动画设置 infinite。只依赖 animationend 来执行收尾逻辑，有什么问题？','',['无限循环动画不会自然结束并触发 animationend；需明确停止条件或其他收尾机制','每次迭代都会触发 animationend','animationend 只在第一次帧触发','无限动画会自动运行 60 次后结束'],['infinite 表示无限循环。','iteration 事件和 end 事件不同。','收尾要有停止路径。'],'无限动画没有自然终点，不能把 animationend 当作唯一的清理触发器。'],
    ['webcomponents-intro','组件样式封装的边界','团队用 Shadow DOM 封装组件。外部页面的普通选择器 #inner 能否直接选到影子树里的同名元素？','',['不能直接穿透影子边界；应设计公开样式接口或使用 open shadowRoot 显式查询','一定可以','只有加 !important 才可以','只要宿主 id 相同就可以'],['普通 document 查询不穿透影子树。','样式也有封装边界。','可通过自定义属性、parts 等设计接口。'],'Shadow DOM 建立树边界，外部普通选择器不能直接命中内部节点；组件应提供明确的可定制接口。'],
    ['custom-elements','自定义元素重复连接的生命周期','同一 custom element 先加入文档、移除、再加入。connectedCallback 可能调用几次？','',['至少两次；每次重新连接都可能调用','只在构造器第一次运行时调用一次','永远不会调用','必须手动调用才执行'],['connectedCallback 对连接生命周期作出响应。','移除再插入是新的一次连接。','监听器和资源需避免重复注册泄漏。'],'同一实例可多次连接和断开，connectedCallback 不能假定只运行一次。'],
    ['shadow-dom','影子树节点的根节点','在已连接文档的 open 影子树内部，inner.getRootNode() 与 inner.getRootNode({composed:true}) 通常分别返回什么？','',['ShadowRoot 与 Document','都返回 Document','都返回宿主元素','ShadowRoot 与 window'],['普通根节点停在影子边界。','composed:true 沿含影子宿主的树继续向上。','该节点已连接到文档。'],'getRootNode() 返回所属影子树的 ShadowRoot；composed:true 返回包含宿主的文档根。'],
    ['template-element','模板内容的实例化','模板 content 里有一个带 id 的按钮。克隆模板两次插入同一文档后，需要注意什么？','',['可能产生重复 id，应按实例生成唯一标识或避免依赖全局 id','浏览器会自动为第二个按钮改 id','第二次克隆会删除第一份','模板不能包含按钮'],['cloneNode 会复制属性。','id 在同一文档应唯一。','模板复用时需处理实例化后的标识。'],'克隆模板也会复制 id，插入多份后可能造成重复标识和错误查询。'],
    ['slots-composition','slotchange 的触发时机','组件需要知道插槽分配的顶层节点何时改变，应监听哪个事件？','',['slot 元素的 slotchange','document 的 resize','window 的 beforeunload','host 的 keypress'],['插槽有专门的分配变化事件。','监听目标是对应 slot。','事件表示分配节点集合变化。'],'slotchange 可通知组件插槽分配内容变化，便于重新计算组合视图。'],
    ['shadow-dom-style','::part 提供样式接口','组件内部按钮标记 part="action"。外部页面希望只定制这个公开部件，使用什么选择器？','',['my-widget::part(action)','my-widget #action','document::slotted(action)','my-widget::before(action)'],['part 属性暴露命名部件。','外部用 ::part(name) 访问。','普通选择器不会穿透影子树。'],'::part(action) 是组件显式开放内部部件给外部样式的接口。'],
    ['shadow-dom-events','插槽内容的事件目标保持 light DOM 身份','<user-card> 的 light DOM 中有 <span slot="name">Lin</span>。点击该 span 后，组件外的 click 监听器通常看到哪个 event.target？','',['这个 light DOM span，而非组件宿主','总是组件宿主，因为任何插槽内容都会重定向','shadowRoot','slot 元素本身'],['插槽分配不把原节点移进影子树。','事件源是 light DOM 节点。','这种情况下目标通常不被重定向为宿主。'],'分配到插槽的 light DOM span 仍是原事件目标；与真正从影子树内部发出的事件不同。']
  ];
  for (const [lessonId,title,prompt,example,options,hints,explanation] of scenarios) {
    choice(`${lessonId}-third-01`,lessonId,title,prompt,example,options,0,hints,explanation);
  }

  code('cross-window-communication-third-01','cross-window-communication','校验来自 iframe 的握手消息',
    '实现 isExpectedMessage(event, origin, source)：仅当 event.origin 严格等于 origin、event.source 严格等于 source、event.data 是非数组对象且形如 {type:"ready",nonce:非空字符串} 时返回 true；其他情况返回 false。',
    'function isExpectedMessage(event, origin, source) {\n  // 在这里实现\n}',
    [['正确消息','const frame={};assert.equal(isExpectedMessage({origin:"https://a.test",source:frame,data:{type:"ready",nonce:"abc"}},"https://a.test",frame),true)'], ['来源和窗口都要核对','const frame={},other={};const e={origin:"https://a.test",source:other,data:{type:"ready",nonce:"x"}};assert.equal(isExpectedMessage(e,"https://a.test",frame),false);assert.equal(isExpectedMessage({...e,source:frame},"https://b.test",frame),false)'], ['拒绝损坏数据','const frame={};for(const data of [null,[],{type:"ready",nonce:""},{type:"other",nonce:"x"}])assert.equal(isExpectedMessage({origin:"x",source:frame,data},"x",frame),false)']],
    ['先分别检查 origin 和 source。','再检查 data 是非空、非数组对象。','最后验证 type 与 nonce 的类型和非空长度。'],
    'function isExpectedMessage(event, origin, source) {\n  const data=event.data;\n  return event.origin===origin && event.source===source && data!==null && typeof data==="object" && !Array.isArray(data) && data.type==="ready" && typeof data.nonce==="string" && data.nonce.length>0;\n}',
    '跨窗口消息不能只信任 data。来源域、具体窗口与协议结构都需要检查，才能防止其他窗口伪造相同类型的消息。', '稍有难度');

  code('fetch-third-01','fetch','发送 JSON 并处理 HTTP 失败',
    '实现 async saveDraft(draft, request)：调用 request("/api/drafts", options) 发送 POST JSON，Content-Type 为 application/json。response.ok 为假时抛出包含状态码的 Error；成功时返回 response.json() 解析结果。',
    'async function saveDraft(draft, request) {\n  // 在这里实现\n}',
    [['请求方法与内容','let seen;return saveDraft({title:"A"},async(url,options)=>{seen={url,options};return {ok:true,json:async()=>({id:1})}}).then(value=>{assert.deepEqual(value,{id:1});assert.equal(seen.url,"/api/drafts");assert.equal(seen.options.method,"POST");assert.equal(seen.options.headers["Content-Type"],"application/json");assert.deepEqual(JSON.parse(seen.options.body),{title:"A"})})'], ['错误状态拒绝','return saveDraft({},async()=>({ok:false,status:409})).then(()=>{throw Error("应拒绝")},e=>assert.ok(e.message.includes("409")))'], ['请求错误传播','return saveDraft({},async()=>{throw Error("offline")}).then(()=>{throw Error("应拒绝")},e=>assert.equal(e.message,"offline"))']],
    ['用 JSON.stringify(draft) 创建 body。','method 是 POST，headers 标注 JSON 类型。','await 响应并检查 ok，再解析 json。'],
    'async function saveDraft(draft, request) {\n  const response=await request("/api/drafts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(draft)});\n  if(!response.ok) throw new Error(`HTTP ${response.status}`);\n  return response.json();\n}',
    'fetch 风格接口对 HTTP 错误状态通常不会自动拒绝；发送 JSON 需明确序列化请求体，并在解析响应前检查状态。');

  code('url-third-01','url','生成同源相对链接',
    '实现 sameOriginPath(base, target)：用 base 解析 target；若解析后的 origin 与 base 不同，返回 null；同源时返回 pathname+search+hash。base 是绝对 URL，target 可为相对路径或绝对 URL。',
    'function sameOriginPath(base, target) {\n  // 在这里实现\n}',
    [['相对路径与查询','assert.equal(sameOriginPath("https://a.test/docs/page","../img.png?q=1#top"),"/img.png?q=1#top")'], ['拒绝跨源','assert.equal(sameOriginPath("https://a.test/x","https://evil.test/x"),null)'], ['同源绝对地址','assert.equal(sameOriginPath("https://a.test/a","https://a.test/b?x=2"),"/b?x=2")']],
    ['分别构造 baseURL 与 new URL(target,baseURL)。','比较两者 origin。','同源时组合 pathname、search、hash。'],
    'function sameOriginPath(base, target) {\n  const baseURL=new URL(base);\n  const url=new URL(target,baseURL);\n  return url.origin===baseURL.origin ? url.pathname+url.search+url.hash : null;\n}',
    'URL 解析器处理相对路径、查询与 hash，并将协议、主机和端口共同纳入 origin 比较。', '稍有难度');

  code('cookie-third-01','cookie','从 Cookie 字符串读取指定键',
    '实现 readCookie(cookieText, name)：cookieText 是 document.cookie 风格的 "a=1; b=hello%20world" 字符串。按分号分割，忽略键两侧空格，找到与 name 严格相等的第一个键后，对值调用 decodeURIComponent 并返回；找不到返回 null。',
    'function readCookie(cookieText, name) {\n  // 在这里实现\n}',
    [['按键读取与解码','assert.equal(readCookie("a=1; b=hello%20world","b"),"hello world")'], ['不能前缀误匹配','assert.equal(readCookie("token2=x; token=y","token"),"y")'], ['空值与不存在','assert.equal(readCookie("a=; b=2","a"),"");assert.equal(readCookie("a=1","x"),null)']],
    ['先用 ; 分隔每一项。','每项只在第一个 = 处分割键和值。','键 trim 后严格比较，值交给 decodeURIComponent。'],
    'function readCookie(cookieText, name) {\n  for(const part of cookieText.split(";")){\n    const index=part.indexOf("=");\n    if(index<0) continue;\n    const key=part.slice(0,index).trim();\n    if(key===name) return decodeURIComponent(part.slice(index+1));\n  }\n  return null;\n}',
    'Cookie 键应完整比较，避免 token 与 token2 混淆。只按第一个等号分割，可保留值中可能出现的等号。');
}
