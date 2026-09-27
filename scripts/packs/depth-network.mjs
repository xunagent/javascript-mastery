export function addNetworkDepthExercises({ choice }) {
  const cases = [
    ['url','修改 searchParams 会更新整个 URL','const url=new URL("https://x.test/p?tag=a#part");url.searchParams.set("tag","b"); 之后 url.href 通常怎样？','',['查询参数变为 tag=b，路径和 #part 保留','原 url.href 不变，set 只改副本','#part 自动删除','路径变成 /b'],['url.searchParams 与 URL 对象关联。','set 会改写该对象的查询部分。','未涉及的路径和片段保留。'],'修改 searchParams 会同步反映在 URL.href 中，其他组件不因这次赋值消失。'],
    ['url','相对路径的斜杠改变解析位置','以 https://site.test/a/b/page 为 base，new URL("../img.png",base) 与 new URL("/img.png",base) 的路径各是什么？','',['/a/img.png 与 /img.png','/a/b/img.png 与 /a/img.png','都为 /img.png','都为 /a/b/img.png'],['../ 从当前目录向上一层。','/ 从站点根目录开始。','base 文件所在目录是 /a/b/。'],'../img.png 解析到 /a/img.png；/img.png 从根目录解析到 /img.png。'],
    ['xmlhttprequest','readystatechange 完成不代表 HTTP 成功','XHR 的 readyState 变成 4。要判断服务器返回成功状态，还需检查什么？','',['xhr.status 的 HTTP 状态码','xhr.readyState 是否等于 5','xhr.responseText 是否非空即可','是否触发了 progress'],['readyState 4 表示请求流程完成。','404、500 也可进入完成状态。','要检查 HTTP status。'],'readyState 4 只表示完成；HTTP 成功与否仍由 status 判断。'],
    ['xmlhttprequest','为 XHR 设置请求超时','一个 XHR 超过 5 秒仍无响应就要提示超时。哪组设置最直接？','',['xhr.timeout=5000 并监听 timeout 事件','xhr.readyState=5000 并监听 load','xhr.responseType="timeout"','每 5 秒自动调用 xhr.send()'],['timeout 属性以毫秒为单位。','超时有独立的 timeout 事件。','readyState 不是时长设置。'],'设置 xhr.timeout=5000 并处理 timeout 事件，可把请求超时与普通 HTTP 响应区分。'],
    ['xmlhttprequest','abort 会终止当前 XHR','XHR 正在传输，用户关闭上传对话框。调用 xhr.abort() 后，业务应如何理解这次请求？','',['它被主动终止，应处理 abort 分支而非当成正常 HTTP 成功','它会暂停并可在同一 XHR 上继续','它会自动重试三次','它只隐藏进度条，不影响请求'],['abort 主动终止 XHR。','与服务器返回成功是不同路径。','需要清理界面并按需要重新发起请求。'],'xhr.abort() 中止当前请求，应用应区分取消与正常完成。'],
    ['resume-upload','服务端确认偏移与待发送字节','文件共 1000 字节，服务端确认已持久化前 640 字节。恢复时下一块应从哪个偏移开始？','',['640','639','0','1000'],['偏移通常表示已确认的字节数量。','下一块从尚未确认的第一个字节开始。','前 640 字节索引为 0～639。'],'已确认前 640 字节时，下一个待发送字节偏移是 640。'],
    ['resume-upload','客户端发完不等于服务器已保存','浏览器本地显示最后一块已上传 100%，但连接在服务器确认前断开。恢复时为什么还要查询服务器偏移？','',['网络发送进度不等于持久化确认，须以服务端已保存位置为准','浏览器进度条永远等于服务端数据库状态','只要本地是 100% 就可以删文件','必须无条件从零重新上传'],['发送完数据不等于收到服务器确认。','服务端可能已存，也可能未存。','恢复依据需要来自服务端。'],'以服务端确认的偏移决定续传位置，避免遗漏或重复写入未确认字节。'],
    ['long-polling','长轮询为什么不是每秒定时请求','长轮询请求在无新消息时由服务端暂时保持，直到有消息或超时才返回。与固定一秒轮询相比，主要差异是什么？','',['减少空响应，同时新消息可较快返回','浏览器永远只有一次 HTTP 请求','服务器不再需要任何连接资源','客户端可以不用处理超时'],['长轮询请求可能保持打开。','有消息时服务端可立即响应。','返回后客户端再开下一次请求。'],'服务端等待变化而非立刻返回空结果，可降低无效轮询并维持较低通知延迟。'],
    ['long-polling','离开页面时取消未完成请求','用户切换到不再显示实时列表的页面，原长轮询请求仍挂起。哪种处理最合适？','',['中止当前请求并停止后续重试循环','等待服务端永远返回后才允许导航','继续无限重试，只是不更新 DOM','把请求改成同步 XHR'],['界面已不再需要该数据。','挂起请求和重试循环都有资源成本。','中止并设置停止状态。'],'组件离开时应中止挂起请求并终止循环，避免后台继续占用连接和更新已卸载界面。'],
    ['websocket','二进制消息的接收类型','WebSocket 接收二进制消息时，想让 message 事件中的 event.data 是 ArrayBuffer 而非 Blob，应设置什么？','',['socket.binaryType="arraybuffer"','socket.readyState="arraybuffer"','socket.protocol="arraybuffer"','socket.bufferedAmount=0'],['binaryType 控制接收的二进制数据类型。','readyState 描述连接状态。','bufferedAmount 描述待发送字节数。'],'设置 binaryType="arraybuffer" 后，二进制消息以 ArrayBuffer 形式交给处理器。'],
    ['websocket','HTTPS 页面连接实时通道的协议','页面从 https://app.test 加载，WebSocket 服务器支持安全连接。通常应使用什么 URL 方案避免不安全混合内容？','',['wss://','ws://','http://','file://'],['HTTPS 页面需要安全的实时通道。','wss 是 WebSocket 的 TLS 方案。','ws 为未加密连接。'],'HTTPS 页面通常使用 wss:// 建立安全 WebSocket 连接。'],
    ['server-sent-events','SSE 响应的媒体类型','服务器要给 EventSource 持续发送事件流，响应 Content-Type 应是什么？','',['text/event-stream','application/json','multipart/form-data','text/html'],['SSE 使用特定的文本事件流格式。','普通 JSON 响应不会被 EventSource 按事件流处理。','媒体类型是 text/event-stream。'],'EventSource 期望服务器提供 text/event-stream 响应并按 SSE 格式持续写入。'],
    ['server-sent-events','EventSource 的请求方向','页面要接收服务端持续推送，同时偶尔向服务端提交编辑。哪种职责划分更合适？','',['EventSource 接收推送，编辑另用 fetch 等请求发送','EventSource.send 发送编辑并接收推送','SSE 自动把输入框修改上传','只能改用页面刷新，不能组合两种 API'],['SSE 是服务器到浏览器的单向流。','EventSource 没有 send 方法。','客户端上行可使用 fetch。'],'EventSource 用于下行事件流，上行编辑可独立通过 fetch 提交。'],
    ['server-sent-events','主动 close 后不会自动重连','应用调用 source.close() 后，网络稍后恢复。这个 EventSource 会自动恢复接收吗？','',['不会；close 是主动关闭，需要新建 EventSource','会；close 只暂停一次重连','会；浏览器每秒自动重新打开','只有收到 ping 时会重连'],['自动重连针对意外断开。','close 明确结束连接。','需要恢复时应新建实例。'],'source.close() 主动终止连接与自动重连，恢复订阅需创建新的 EventSource。']
  ];
  const indexes = new Map();
  for (const [lessonId, title, prompt, example, options, hints, explanation] of cases) {
    const index = (indexes.get(lessonId) || 0) + 1;
    indexes.set(lessonId, index);
    choice(`${lessonId}-depth-${String(index).padStart(2, '0')}`, lessonId, title, prompt, example, options, 0, hints, explanation);
  }
}
