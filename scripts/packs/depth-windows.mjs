export function addWindowDepthExercises({ choice }) {
  const cases = [
    ['popup-windows','命名目标可能复用旧弹窗','用户先通过 window.open(url,"report") 打开报表，随后再以相同目标名 "report" 打开另一 URL。通常会怎样？','',['浏览器可能复用已有的命名窗口并导航到新 URL','一定创建第二个独立窗口','第二次调用必定抛 SyntaxError','第二次只会刷新父页面'],['window.open 的第二参数是目标名。','非 _blank 的命名目标可被再次查找。','相同名字可能指向已有窗口。'],'使用同一窗口名可复用已有弹窗并导航它，而不是每次都新开窗口。'],
    ['popup-windows','跨源弹窗不能直接读取 DOM','父页面打开跨源弹窗并保留 WindowProxy 引用。想读取弹窗 document.body.textContent，哪种判断正确？','',['通常受同源策略阻止；可用 postMessage 协作传递允许的数据','只要父页面持有引用就能读取全部 DOM','设置弹窗尺寸后即可读取','等 load 后同源限制自动取消'],['窗口引用不等于跨源 DOM 权限。','同源策略限制直接读写。','受控双方可通过消息协议通信。'],'父页面持有引用仍不能任意读取跨源弹窗 DOM，可用 postMessage 在双方同意的范围内交换数据。'],
    ['popup-windows','用户操作与弹窗拦截','点击处理器先等待一个较长异步请求，完成后才 window.open。相比点击时立即打开空窗口再导航，前者更容易遇到什么？','',['浏览器把它视为脱离直接用户手势而阻止弹窗','必定获得更高优先级','自动获得同源权限','window.open 会变成同步阻塞调用'],['浏览器通常限制未由用户直接触发的弹窗。','长异步等待可能失去瞬时用户激活。','可在用户手势期间先打开再更新地址。'],'延迟到异步完成后打开窗口可能失去用户激活而被拦截。'],
    ['cross-window-communication','postMessage 的数据会被复制','发送方把普通对象 payload 通过 postMessage 发送后立即修改 payload.name。接收方通常得到怎样的数据对象？','',['结构化克隆后的消息值，通常不是共享的同一对象引用','与发送方始终共享同一个普通对象引用','只能得到字符串 "[object Object]"','消息会因普通对象而自动丢弃'],['postMessage 使用结构化克隆处理普通数据。','两个窗口不直接共享同一个 JS 对象。','发送后修改发送方对象不应作为更新协议。'],'普通对象消息通过结构化克隆传递，接收方得到独立的数据副本。'],
    ['cross-window-communication','校验 origin 后仍需校验消息形状','父页面只判断 event.origin 正确，就把 event.data.action 当作命令执行。为什么还应检查 data 的类型、字段和值？','',['同一可信来源也可能发出其他消息，结构校验防止误处理或异常','origin 正确会自动保证 data 形状固定','postMessage 永远只能传字符串','event.data.action 会由浏览器自动过滤'],['origin 只说明来源站点。','一个源可能发送多类消息。','接收方仍需验证协议字段。'],'跨窗口消息要同时校验来源和数据协议，避免把非预期消息当命令执行。'],
    ['cross-window-communication','沙箱 iframe 的不透明源','没有 allow-same-origin 的 sandbox iframe 发消息，父页面看到 event.origin 可能是什么特殊值？这时怎样补充校验？','',['"null"；结合 event.source、随机 nonce 和严格消息结构校验','父页面自身 origin；无需其他校验','iframe 的文件名；只看文件名即可','"*"；表示任何来源都被信任'],['沙箱可给 iframe 不透明源。','不透明源序列化可能为字符串 null。','不能只凭这个值建立信任。'],'不透明源消息可能表现为 origin="null"，接收方还需验证窗口引用及应用层握手数据。'],
    ['clickjacking','frame-ancestors 需要响应头','站点把 CSP frame-ancestors 写进 HTML 的 meta 标签，希望禁止第三方嵌入。最可能的问题是什么？','',['frame-ancestors 必须通过 HTTP 响应头生效，meta 方式无效','meta 方式比响应头更强','它只影响图片，不影响 iframe','只要加上 defer 就能生效'],['嵌入限制需在文档被嵌入前由浏览器判定。','meta 要等文档内容解析后才出现。','frame-ancestors 使用响应头。'],'CSP frame-ancestors 不通过 meta 标签生效，应由被嵌入页面的 HTTP 响应头提供。'],
    ['clickjacking','只靠 JavaScript 跳出 iframe 不稳妥','页面通过 if(top!==self) top.location=self.location 防止被嵌入。为什么仍应使用 CSP frame-ancestors？','',['攻击页面可利用沙箱等机制限制顶层导航；浏览器级嵌入策略更可靠','该脚本会自动设置 CSP 响应头','top 和 self 在所有浏览器里永远相等','CSP 只影响开发者工具，不影响嵌入'],['脚本方案依赖代码执行和导航权限。','攻击方控制 iframe 的部分属性。','响应头策略由浏览器在嵌入时执行。'],'脚本式 frame busting 可被环境限制，服务端 CSP frame-ancestors 才是稳健的嵌入控制。'],
    ['clickjacking','白名单应覆盖真正的嵌入祖先','管理页允许 https://portal.example 嵌入，但门户又被 https://outer.example 嵌入。若管理页只允许 portal.example 作为 frame-ancestors，内层管理页能正常显示吗？','',['通常不能；浏览器会检查整个祖先链，outer.example 也需被允许','能；只检查直接父 iframe','能；只要 portal.example 用 HTTPS','不能；任何多层 iframe 都被标准禁止'],['frame-ancestors 不是只看最近父窗口。','每一层祖先都要满足源列表。','outer.example 不在允许名单内。'],'嵌入祖先链中的每个页面都要满足 frame-ancestors；未允许的外层站点会阻止显示。']
  ];
  const indexes = new Map();
  for (const [lessonId, title, prompt, example, options, hints, explanation] of cases) {
    const index = (indexes.get(lessonId) || 0) + 1;
    indexes.set(lessonId, index);
    choice(`${lessonId}-depth-${String(index).padStart(2, '0')}`, lessonId, title, prompt, example, options, 0, hints, explanation);
  }
}
