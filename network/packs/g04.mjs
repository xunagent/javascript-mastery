const bank = [];
const counts = new Map();
const firstHints = [
  '把“客户端发送”和“服务器响应”分成两列。',
  '先从 URL 中分离主机、路径、查询和片段。',
  '方法语义要区分安全性与重复执行后的效果。',
  '先看状态码的百位类别，再看具体含义。',
  'HTTP/1.1 请求行、首部、空行和消息体各有位置。',
  '响应的状态、首部和消息体不承担同一个角色。',
  '分清内容是什么、怎样编码以及占多少字节。',
  '先判断需要的是整个表示、一个范围，还是另一种表示。',
  '画出浏览器、中间节点和源站的请求路径。',
];
function choice(lesson, title, context, prompt, options, answer, explanation, clue, difficulty = '中等') {
  const lessonId = `g04-l${String(lesson).padStart(2, '0')}`;
  const n = (counts.get(lessonId) || 0) + 1;
  counts.set(lessonId, n);
  bank.push({ id: `${lessonId}-q${String(n).padStart(2, '0')}`, lessonId, title, context, prompt,
    kind: 'choice', options, answer, explanation,
    hints: [firstHints[lesson - 1], clue, '检查选项是否回答了题目当前所在的 HTTP 阶段。'], difficulty });
}

// 4.1 request/response with independent resource exchanges.
for (const [scene,answer,why] of [
  ['浏览器发送 GET /news，服务端返回 200 和 HTML','服务器已对该请求给出成功响应','请求和响应构成一轮 HTTP 交换。'],
  ['浏览器发出 GET /news，但 DNS 查询失败','没有得到目标网站的 HTTP 响应','失败发生在取得目标地址时。'],
  ['浏览器向 /api/data 发请求，服务器返回 500','浏览器已收到一个服务器错误响应','500 仍是 HTTP 响应状态。'],
  ['HTML 已返回，浏览器随后请求 /logo.png','图片是另一轮资源请求','页面的资源可由多次 HTTP 请求取得。'],
  ['客户端发出 POST，服务器返回 202 Accepted','请求被接受，但处理可能尚未完成','202 不承诺异步工作已经完成。'],
  ['浏览器读取本地新鲜缓存，没有向网络发送该资源请求','本次可直接复用已有响应','缓存使一次资源使用不必每次都经过源站。']
]) choice(1,'识别 HTTP 交换',scene,'哪个判断最准确？',
  [answer,'DNS 一定返回了 HTTP 404','客户端发出请求就等于服务端已处理','所有资源必定来自同一台服务器'],0,why,'找出是否真的出现了目标站的 HTTP 响应。');
for (const [method,resource] of [['GET','/article'],['HEAD','/image.png'],['POST','/orders'],['PUT','/profile'],['DELETE','/items/7'],['GET','/style.css']]) choice(1,'请求的发起者与目标',`浏览器或 API 客户端向服务器发送 ${method} ${resource}。`,'通常由谁发起这一轮 HTTP 交换？',
  ['客户端发请求，服务器产生响应','服务器先发响应，客户端再决定请求','DNS 服务器产生资源正文','链路层交换机产生 HTTP 方法'],0,
  'HTTP 请求/响应模型中，客户端发出请求，服务端根据请求返回响应；服务器内部仍可能继续访问其他服务。','分清请求者、响应者和中间设备。');

// 4.2 request target and URL boundaries.
for (const [url,path,query] of [
  ['https://a.example/users/7?lang=zh#card','/users/7','lang=zh'],
  ['https://b.example/search?q=tcp#result','/search','q=tcp'],
  ['https://c.example/files/a.pdf?download=1#p2','/files/a.pdf','download=1'],
  ['http://d.example:8080/api/items?page=2#top','/api/items','page=2'],
  ['https://e.example/docs/index.html?v=3#intro','/docs/index.html','v=3'],
  ['https://f.example/cart?coupon=ok#summary','/cart','coupon=ok']
]) choice(2,'构造请求目标',`用户打开 ${url}。`,'在常见的 HTTP/1.1 直接请求中，哪个 origin-form 请求目标符合该 URL？',
  [`${path}?${query}`,`${path}?${query}${url.slice(url.indexOf('#'))}`,url.split('://')[1],`${path}${url.slice(url.indexOf('#'))}`],0,
  `请求目标包含路径 ${path} 与查询 ${query}；片段留给浏览器，不进入请求目标。`,'去掉 scheme、主机与 # 后的片段。');
for (const [path,query] of [['/users/7','lang=zh'],['/search','q=tcp'],['/files/a.pdf','download=1'],['/api/items','page=2'],['/docs/index.html','v=3'],['/cart','coupon=ok']]) choice(2,'路径与查询的边界',`请求目标是 ${path}?${query}。`,'问号前后分别是什么？',
  [`路径 ${path}；查询 ${query}`,`查询 ${path}；路径 ${query}`,'两个部分都是主机名','问号后是 URL 片段'],0,
  `路径是 ${path}，问号后的 ${query} 是查询部分。`,'以问号为分界。');

// 4.3 method semantics; examples assume conforming implementations.
for (const [need,answer,why] of [
  ['只读取资源表示而不要求改变服务端状态','GET','GET 的语义是获取目标资源的表示。'],
  ['只想获取资源元数据而不传输表示体','HEAD','HEAD 请求与 GET 对应的响应元数据，不返回表示内容。'],
  ['按给定表示创建或整体替换目标资源','PUT','PUT 的语义是用请求表示创建或替换目标资源的状态。'],
  ['请求服务器处理一次新订单创建动作','POST','POST 将请求表示交给目标资源按其自身语义处理。'],
  ['要求移除指定目标资源','DELETE','DELETE 表达删除目标资源的意图。'],
  ['查询目标资源可用的通信选项','OPTIONS','OPTIONS 用于询问目标资源的通信选项。']
]) choice(3,`为操作选择 ${answer}`,`接口需要${need}。假设服务端按标准语义实现。`,'哪个方法最贴合题目描述？',
  ['GET','HEAD','POST','PUT','DELETE','OPTIONS'],['GET','HEAD','POST','PUT','DELETE','OPTIONS'].indexOf(answer),why,'先确认操作是否只读取、整体替换、提交处理或删除。');
for (const [method,safe,idempotent] of [['GET',true,true],['HEAD',true,true],['PUT',false,true],['DELETE',false,true],['POST',false,false],['OPTIONS',true,true]]) choice(3,`${method} 的方法语义`,`按 HTTP 标准讨论 ${method} 方法本身的语义，不考虑错误实现。`,'安全性与幂等性的组合是哪项？',
  ['安全且幂等','不安全但幂等','不安全且通常不幂等','安全但不幂等'],safe?0:idempotent?1:2,
  `${method} 在标准语义下${safe?'是安全方法':idempotent?'不安全但幂等':'不是安全方法，且通常不幂等'}。幂等关注重复请求的预期效果，不等于响应必须完全相同。`,'安全指不请求改变服务端状态；幂等指重复执行的预期效果。');

// 4.4 status codes by concrete server result.
for (const [scene,code,reason] of [
  ['请求成功，并返回目标资源内容','200','200 表示请求成功。'],
  ['创建了新资源，并给出其地址','201','201 表示请求已促成资源创建。'],
  ['接受了异步任务，但尚未完成','202','202 表示请求已接受处理，不代表最终结果已完成。'],
  ['成功处理，但不返回响应内容','204','204 表示成功且没有响应内容。'],
  ['按请求返回文件的一段字节','206','206 用于成功返回请求的部分内容。'],
  ['条件请求验证后，已有资源未修改','304','304 让客户端继续使用已有表示。'],
  ['客户端请求语法不符合接口要求','400','400 表示请求有问题，服务器无法或不愿处理。'],
  ['没有可用的身份凭据，需要认证','401','401 表达需要有效认证凭据。'],
  ['服务器理解请求，但拒绝授权访问','403','403 表达服务器拒绝完成请求。'],
  ['目标资源未找到','404','404 表达目标资源未找到。'],
  ['网关访问上游时收到无效响应','502','502 是网关或代理与上游交互失败的一类结果。'],
  ['服务器临时无法处理请求','503','503 表示服务暂时不可用。']
]) choice(4,`选择状态码 ${code}`,scene,'哪个状态码最贴合这个情境？',
  [code,...(code.startsWith('2')?['301','404','500']:code.startsWith('3')?['200','404','502']:code.startsWith('4')?['200','302','503']:['200','404','301'])],0,reason,'先确定成功、跳转、客户端问题还是服务端问题，再选具体码。');

// 4.5 request line, headers, blank line and content.
for (const [method,path,host] of [
  ['GET','/news','a.example'],['POST','/orders','b.example'],['HEAD','/logo.png','c.example'],
  ['PUT','/profile/7','d.example'],['DELETE','/items/9','e.example'],['GET','/search?q=x','f.example']
]) choice(5,'填写 HTTP/1.1 请求行',`目标主机 ${host}，方法 ${method}，请求目标 ${path}。`,'哪一行可以作为 origin-form 的请求行？',
  [`${method} ${path} HTTP/1.1`,`${host} ${method} ${path}`,`HTTP/1.1 ${host} ${path}`,`${path} ${method} HTTP/1.1`],0,
  `请求行按方法、请求目标、协议版本排列；主机名通常另由 Host 首部表达。`,'把方法、请求目标、版本排成三段。');
for (const [host,path] of [['a.example','/'],['b.example','/api'],['c.example:8080','/test'],['d.example','/doc'],['e.example','/img'],['f.example','/search']]) choice(5,'Host 放在哪里',`请求行为 GET ${path} HTTP/1.1，目标主机为 ${host}。`,'哪项最合适地声明主机？',
  [`Host: ${host}`,'Status: 200 OK',`GET-Host: ${path}`,'Cookie: GET'],0,
  `HTTP/1.1 请求通过 Host 字段携带目标主机信息。`,'主机信息与请求目标路径分别写。');

// 4.6 response structure and no-body conditions.
for (const [code,phrase,hasContent] of [
  [200,'OK',true],[201,'Created',true],[204,'No Content',false],[304,'Not Modified',false],
  [206,'Partial Content',true],[404,'Not Found',true]
]) choice(6,`读懂 ${code} 响应`,`响应状态行为 HTTP/1.1 ${code} ${phrase}。`,'在这个状态下，关于响应内容哪项更稳妥？',
  [hasContent?'可以携带内容；具体语义看状态与方法':'此状态不携带响应内容',hasContent?'此状态一律禁止任何响应内容':'此状态必须携带完整 HTML','状态码只会出现在请求行','DNS 会产生 HTTP 状态行'],0,
  hasContent?`${code} 响应可包含内容，但是否有内容还要看方法和具体响应。`:`${code} 的语义不包含响应内容。`,'区分响应首部与响应内容。');
for (const [header,value] of [['Content-Type','application/json'],['ETag','"v7"'],['Location','/new'],['Cache-Control','max-age=60'],['Set-Cookie','sid=abc'],['Content-Length','120']]) choice(6,'找出响应首部',`服务器响应包含字段 ${header}: ${value}。`,'这个字段在 HTTP/1.1 响应报文中位于哪里？',
  ['状态行之后、空行之前的首部区','请求方法之前的 DNS 区','应用内容之后且只能出现一次的路径区','TCP 序列号字段里'],0,
  '响应首部位于状态行之后、空行之前，描述内容或控制客户端后续行为。','先找到 HTTP/1.1 响应报文的空行分界。');

// 4.7 media type vs content coding vs length.
for (const [need,header,reason] of [
  ['告诉客户端响应是 JSON','Content-Type','Content-Type 描述表示的媒体类型。'],
  ['告诉客户端内容已用 gzip 编码','Content-Encoding','Content-Encoding 描述表示数据采用的内容编码。'],
  ['给出当前消息内容的字节长度','Content-Length','Content-Length 表示内容字节长度。'],
  ['声明响应是 HTML','Content-Type','HTML 是媒体类型。'],
  ['声明内容使用 br 编码','Content-Encoding','br 是内容编码。'],
  ['声明内容长度为 1024 字节','Content-Length','长度以字节表达。']
]) choice(7,`选择首部：${header}`,need,'应优先检查或设置哪个响应首部？',
  ['Content-Type','Content-Encoding','Content-Length','ETag'],['Content-Type','Content-Encoding','Content-Length','ETag'].indexOf(header),reason,'区分“是什么”“怎样编码”“有多长”。');
for (const [type,encoding] of [['application/json','gzip'],['text/html','br'],['text/plain','gzip'],['application/javascript','br'],['image/svg+xml','gzip'],['application/xml','br']]) choice(7,'同时表达类型与编码',`服务器返回 ${type}，并对内容应用 ${encoding} 编码。`,'哪组首部最贴切？',
  [`Content-Type: ${type}; Content-Encoding: ${encoding}`,`Content-Type: ${encoding}; Content-Encoding: ${type}`,'Content-Length: application/json; Host: gzip','ETag: br; Location: json'],0,
  `Content-Type 描述原始表示类型 ${type}；Content-Encoding 描述内容编码 ${encoding}。`,'两个信息需要两种不同的字段。');

// 4.8 ranges, partial representations and negotiation.
for (const [start,end,length] of [[0,99,100],[100,199,100],[200,349,150],[500,599,100],[1000,1099,100],[50,149,100]]) choice(8,'字节范围长度',`客户端请求 Range: bytes=${start}-${end}，服务器接受并返回该范围。`,'这段范围包含多少字节？',
  [String(end-start),String(length),String(length+1),'无法计算'],1,
  `字节范围两端都计入，所以长度为 ${end}-${start}+1=${length}。`,'范围上下限都包含。');
for (const [scene,answer,why] of [
  ['服务器按 Range 请求成功返回部分文件','206','206 Partial Content 表示部分内容。'],
  ['请求的字节范围超出了资源可满足范围','416','416 Range Not Satisfiable 用于无法满足的范围。'],
  ['客户端用 Accept-Language 希望优先得到中文表示','Accept-Language','请求首部表达客户端的语言偏好。'],
  ['客户端用 Accept 希望得到 JSON 而非 HTML','Accept','Accept 表达可接受的媒体类型。'],
  ['资源会根据 Accept-Language 返回不同表示，缓存需知道这一点','Vary','Vary 指出参与表示选择的请求字段。'],
  ['客户端请求文件前 100 字节，服务器正确给出内容范围','Content-Range','响应字段可说明返回内容对应的字节范围。']
]) choice(8,'范围与内容协商',scene,'哪个状态码或字段最贴切？',
  [answer,'404','Cookie','Location'],0,why,'分清“请求部分字节”和“选择哪种表示”。');

// 4.9 intermediaries and virtual hosting.
for (const [scene,answer,why] of [
  ['同一 IP 上承载 a.example 与 b.example 两个网站','Host','Host 帮助服务器区分目标主机。'],
  ['企业浏览器先连代理，再由代理访问外部网站','正向代理','正向代理代表客户端访问外部资源。'],
  ['外部浏览器连公共入口，由入口分发给内部服务','反向代理','反向代理作为服务的公共入口转发请求。'],
  ['边缘节点已有可用图片副本，直接响应浏览器','缓存节点','中间缓存节点可以复用响应。'],
  ['网关无法从上游取得有效响应，向浏览器报告错误','502','网关相关错误可由中间节点产生。'],
  ['浏览器请求某域名，代理根据主机信息选内部应用','虚拟主机/路由','同一入口可按目标主机或路径选择服务。'],
  ['客户端通过代理建立到目标服务器的隧道','隧道','隧道允许代理转发后续字节流。'],
  ['浏览器 Network 看见 503，但源站日志没有这次请求','中间层可能直接返回 503','先检查代理或 CDN 是否在源站前处理了请求。'],
  ['同一公网入口承接多个域名的 HTTPS 流量','需要正确选择目标站点证书和后端','共享入口不代表所有域名能共用错误的证书。'],
  ['边缘缓存未命中，节点去源站取得资源','回源','缓存未命中时中间节点可向源站请求。'],
  ['服务器返回的响应含 Via 字段','中间节点参与的线索','Via 可以提供经过中间节点的线索。'],
  ['代理把内部上游错误包装为对外的状态码','浏览器只能先看到代理响应','浏览器证据不自动展示内部上游的所有处理。']
]) choice(9,'识别中间节点的作用',scene,'哪一项最贴近描述？',
  [answer,'DNS 直接生成网页正文','只有客户端可以返回状态码','所有请求必须直连源站'],0,why,'根据中间节点代表谁、是否缓存、是否转发来判断。');

export const chapter4Questions = bank;
