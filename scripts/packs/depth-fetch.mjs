export function addFetchDepthExercises({ choice }) {
  const cases = [
    ['fetch','204 成功响应未必能解析 JSON','服务器返回 HTTP 204 No Content。response.ok 为 true 后直接 await response.json()，通常会怎样？','',['因响应体为空而解析失败，应按状态处理无内容响应','返回空对象 {}','返回 null，且永不抛错','自动再次发起请求'],['ok 只表示状态码在成功范围。','204 表示没有响应体。','JSON 解析需要有效 JSON 文本。'],'HTTP 204 属于成功状态，但没有 JSON 响应体，直接调用 json() 通常会解析失败。'],
    ['fetch','Response.url 反映最终响应地址','fetch 默认跟随重定向，从 /old 跳到 /new 后成功。想知道最终响应 URL，应读取什么？','',['response.url','请求时的原始 url 变量','response.body.url','document.referrer'],['原始请求地址不会自动改写变量。','Response 包含最终响应元数据。','默认重定向后 url 指向最终资源。'],'response.url 通常给出重定向后最终响应的地址。'],
    ['formdata','set 会替换已有同名字段','FormData 中已有 tag=js、tag=dom。执行 data.set("tag","css") 后，getAll("tag") 通常是什么？','',['["css"]','["js","dom","css"]','["js","css"]','[]'],['append 会追加。','set 会替换同名字段集合。','getAll 应只看到新值。'],'FormData.set 替换已有同名字段；追加重复项应使用 append。'],
    ['formdata','delete 移除全部同名条目','FormData 中有两个名为 tag 的字段与一个 title。调用 data.delete("tag") 后哪项正确？','',['两个 tag 都被移除，title 保留','只删除第一个 tag','删除 title，保留 tag','FormData 不支持 delete'],['delete 按字段名操作。','同名字段可以有多个。','它们会一起被移除。'],'FormData.delete("tag") 删除所有名为 tag 的条目，不影响其他字段。'],
    ['fetch-progress','网络流的分块大小不代表固定进度单位','reader.read() 依次返回 5、11、2 字节块。要统计已下载字节数，应怎样累加？','',['按每块 value.byteLength 累加为 18','按块数累加为 3','每块一律当作 16 字节','只读取最后一块的长度'],['流的块长度可变化。','进度单位是字节。','5+11+2=18。'],'每个 Uint8Array 块的 byteLength 才是本次收到的字节数。'],
    ['fetch-progress','释放锁不恢复已消费的响应体','通过 response.body.getReader() 消费一部分字节后调用 reader.releaseLock()。此时还能像全新响应一样调用 response.json() 读取完整原始体吗？','',['不能；释放锁不把已消费字节放回流中','能；releaseLock 自动回滚所有读取','能；json() 会自动重新发起 fetch','不能；releaseLock 会删除 Response 对象'],['releaseLock 只解除读取器独占。','已经读取的字节不会自动返回。','完整响应若需多路消费，应提前克隆或分流。'],'释放锁不重置已消费的响应体，无法据此重新取得完整原始数据。'],
    ['fetch-abort','已中止的 AbortController 不能重置','controller.abort() 之后，想发起新的可独立取消的请求。直接继续使用旧 controller.signal 会怎样？','',['信号仍处于 aborted，应该创建新的 AbortController','旧信号会在下一次 fetch 自动重置','只要调用 abort(false) 就会恢复','旧信号只对第一个请求有效'],['AbortSignal 的 aborted 状态不可逆。','旧信号不会自动复位。','新请求应配新控制器。'],'AbortController 一旦中止不会重置；新的请求生命周期需要新的控制器。'],
    ['fetch-abort','响应头到达后仍可中止响应体读取','fetch 已返回 Response，但还在 await response.json()。此时调用关联 controller.abort()，通常可能怎样？','',['尚未完成的响应体读取会因中止而拒绝','中止只在响应头到达前有效','json() 一定完整返回，无法取消','Response.ok 会自动变成 false'],['fetch Promise 在收到响应头时即可完成。','响应体可能仍在下载。','同一 signal 仍控制后续读取。'],'即使已有 Response，未完成的响应体读取仍可能被 AbortController 中止。'],
    ['fetch-crossorigin','读取自定义响应头需要额外暴露','跨源响应已通过 CORS，服务器还返回 X-Request-Id。脚本调用 response.headers.get("X-Request-Id") 却读不到，通常还缺什么？','',['响应头 Access-Control-Expose-Headers: X-Request-Id','请求头 Access-Control-Allow-Origin','把 fetch 改成 mode:no-cors','在前端直接设置 Host'],['CORS 成功不代表所有响应头都可被脚本读取。','非默认可见头需由服务器显式暴露。','Expose-Headers 列出允许读取的头。'],'服务器需通过 Access-Control-Expose-Headers 暴露自定义响应头。'],
    ['fetch-crossorigin','JSON POST 也可能触发预检','跨源 POST 的 Content-Type 明确设为 application/json。即使方法是 POST，浏览器为何仍可能先发 OPTIONS？','',['application/json 不属于简单请求允许的 Content-Type，可能触发预检','所有 POST 必须预检','JSON 请求从不预检','OPTIONS 只在 WebSocket 使用'],['是否预检不只看方法。','简单请求允许的 Content-Type 范围有限。','application/json 可导致预检。'],'跨源 application/json POST 通常需要预检，因为其 Content-Type 不是简单请求的安全列表值。'],
    ['fetch-crossorigin','CORS 错误由响应端解决','浏览器控制台提示缺少 Access-Control-Allow-Origin。仅在前端 fetch 请求里手动添加同名请求头，能让脚本读取跨源响应吗？','',['不能；需要目标服务器在响应中正确提供 CORS 许可','能；请求头与响应头可互换','能；只要把 mode 设为 no-cors 就能读 JSON','不能；任何跨源请求都不可能被允许'],['Access-Control-Allow-Origin 是响应侧许可。','客户端请求头不能替服务器授权。','no-cors 也不会得到可读的普通响应体。'],'CORS 是否允许读取由服务器响应头决定，前端伪造同名请求头无效。'],
    ['fetch-api','禁止自动跟随重定向','调用 fetch 时希望任何重定向都作为错误处理，而不自动跟随。应使用哪个选项？','',['redirect:"error"','mode:"no-cors"','credentials:"omit"','cache:"force-cache"'],['redirect 控制重定向策略。','error 表示遇到重定向时拒绝。','mode 和 credentials 处理其他问题。'],'redirect:"error" 会让重定向成为请求错误，而非自动跟随。'],
    ['fetch-api','在消费前复制 Request','同一个带请求体的 Request 要用于两个独立 fetch。哪种做法更可靠？','',['在请求体被消费前创建 request.clone()，分别发送原件与副本','第一次 fetch 完成后直接重复发送同一个已消费 Request','把 request.bodyUsed 手动改回 false','调用 request.json() 再自动复位'],['请求体是一次性可消费的流。','clone 在消费前复制可读取的请求。','bodyUsed 不是可手动重置的状态。'],'在消费前克隆 Request，两个请求才各有可用的请求体。'],
    ['fetch-api','Headers 名称查询不区分大小写','const headers=new Headers({"Content-Type":"application/json"})；headers.get("content-type") 通常返回什么？','',['"application/json"','null，因为大小写不同','一个 Promise','抛 TypeError'],['HTTP 头字段名不区分大小写。','Headers 实现相应规范化查询。','查询大小写不同仍能找到值。'],'Headers.get 对字段名大小写不敏感。']
  ];
  const indexes = new Map();
  for (const [lessonId, title, prompt, example, options, hints, explanation] of cases) {
    const index = (indexes.get(lessonId) || 0) + 1;
    indexes.set(lessonId, index);
    choice(`${lessonId}-depth-${String(index).padStart(2, '0')}`, lessonId, title, prompt, example, options, 0, hints, explanation);
  }
}
