const bank = [];
const counts = new Map();
const firstHints = [
  '先判断字段由请求方还是响应方发送，再看它解决什么问题。',
  '区分服务器设置 Cookie 与浏览器后续发送 Cookie。',
  '顺着每次状态码和 Location 画出跳转链。',
  '缓存键至少要考虑请求方法和目标 URI。',
  '比较资源已存时间与允许的新鲜时间。',
  '条件请求是在问“我手里的表示是否还能用”。',
  '先判断缓存只服务一个用户还是多个用户。',
  '找出真正变旧的资源及它由哪一层缓存提供。',
];
function choice(lesson,title,context,prompt,options,answer,explanation,clue,difficulty='中等') {
  const lessonId=`g05-l${String(lesson).padStart(2,'0')}`;
  const n=(counts.get(lessonId)||0)+1;counts.set(lessonId,n);
  bank.push({id:`${lessonId}-q${String(n).padStart(2,'0')}`,lessonId,title,context,prompt,kind:'choice',options,answer,explanation,
    hints:[firstHints[lesson-1],clue,'排除只解决另一类问题的字段或操作。'],difficulty});
}

// 5.1 common headers and their direction.
for (const [need,field,why] of [
  ['指定 HTTP/1.1 请求目标主机','Host','Host 在请求中标识目标主机。'],
  ['携带请求的认证凭据','Authorization','Authorization 携带用于认证的请求凭据。'],
  ['表达客户端可接受的媒体类型','Accept','Accept 表达客户端的表示类型偏好。'],
  ['说明请求体是 JSON','Content-Type','Content-Type 描述所发送表示的媒体类型。'],
  ['告知新建资源的位置','Location','Location 可在响应中给出目标位置。'],
  ['让浏览器保存会话标识','Set-Cookie','服务器通过 Set-Cookie 设置 Cookie。'],
  ['在后续请求里带回会话标识','Cookie','浏览器通过 Cookie 请求字段发送适用的 Cookie。'],
  ['给响应表示一个验证标识','ETag','ETag 是用于验证表示的标识。'],
  ['请求时带上已有 ETag 进行验证','If-None-Match','条件请求可通过 If-None-Match 携带实体标签。'],
  ['让缓存注意 Accept-Language 会影响响应','Vary','Vary 标出参与响应选择的请求字段。'],
  ['说明响应可以新鲜使用 60 秒','Cache-Control','Cache-Control 可包含 max-age 等缓存指令。'],
  ['说明响应使用 gzip 内容编码','Content-Encoding','Content-Encoding 描述表示数据的内容编码。']
]) choice(1,`选择字段 ${field}`,`需要${need}。`,'最直接相关的 HTTP 字段是什么？',
  [field,'X-Always-Correct','TCP-Ack','DNS-TTL'],0,why,'先辨认是身份、表示、缓存还是路由信息。');

// 5.2 Cookie and session state.
for (const [scene,answer,why] of [
  ['登录响应包含 Set-Cookie: sid=abc','浏览器可保存适用的 sid Cookie','Set-Cookie 是服务端给浏览器设置 Cookie 的响应字段。'],
  ['浏览器后续向同站发出 Cookie: sid=abc','服务器可用 sid 查找对应会话','Cookie 是浏览器向服务端发送适用 Cookie 的字段。'],
  ['服务端只收到同一 IP，却没有任何会话凭据','不能仅凭 IP 确认同一用户','多个用户可能共享地址，地址也可能变化。'],
  ['服务器给两次请求同一个 sid，且会话仍有效','服务器可以把两次请求关联到同一会话','HTTP 请求本身无状态，会话标识提供关联线索。'],
  ['浏览器清理 Cookie 后再次访问需登录站点','可能丢失用于查找会话的标识','没有原 Cookie，服务端可能无法关联原会话。'],
  ['某 Cookie 只适用于 /account 路径','请求 /public 时不一定发送该 Cookie','Path 限制 Cookie 适用的请求路径。'],
  ['Cookie 标记 Secure，页面通过普通 HTTP 访问','这条 Cookie 不应通过不安全 HTTP 发送','Secure 限制 Cookie 只在安全传输中发送。'],
  ['Cookie 标记 HttpOnly，页面脚本尝试读取 document.cookie','脚本不能读取这条 Cookie','HttpOnly 限制脚本读取该 Cookie。'],
  ['浏览器收到 Set-Cookie，但下次请求不是适用域名','该 Cookie 不一定被发送','域名作用域是 Cookie 是否发送的条件之一。'],
  ['服务端删除会话记录，但浏览器仍带旧 sid','旧 sid 不应被视为有效登录','服务端应检查会话是否仍有效，而非只看 Cookie 存在。'],
  ['响应里出现两个 Set-Cookie 字段','可以为浏览器设置不止一个 Cookie','Set-Cookie 可以在响应中出现多次。'],
  ['同站两个用户共用公网 IP','不能用公网 IP 直接替代各自会话','公网 IP 不等于唯一用户身份。']
]) choice(2,'追踪会话状态',scene,'哪项判断最符合这个情境？',
  [answer,'HTTP 会自动记住用户，无须任何标识','DNS 记录就是登录凭据','TCP 端口可以永久代表账号'],0,why,'查明会话标识由谁设置、何时发送、服务端如何验证。');

// 5.3 redirect chain, status and Location.
for (const [code,from,to] of [[301,'/old','/new'],[302,'/login','/auth'],[307,'/api-old','/api-new'],[308,'/v1','/v2'],[301,'/docs','/guide'],[302,'/start','/home']]) choice(3,'读懂重定向目标',`请求 ${from}，响应 ${code}，Location: ${to}。`,'客户端下一步最可能请求哪个目标？',
  [to,from,'/favicon.ico','DNS 服务器的根目录'],0,
  `Location 指出后续目标 ${to}。${code} 的具体语义还影响是否永久以及方法处理。`,'状态码提示要继续，Location 给出方向。');
for (const [scene,answer,why] of [
  ['/a →301 /b，/b →200','总共经过两次 HTTP 请求','第一次请求取得跳转指示，第二次取得内容。'],
  ['/a →302 /b，/b →302 /a','可能出现重定向循环','两个目标来回跳转，浏览器不会无限继续。'],
  ['/old →301 /new，用户书签仍是 /old','下次可能仍先请求 /old，再按客户端缓存策略跳转','书签不自动保证已更新目标；客户端对 301 的缓存也影响实际请求。'],
  ['POST /submit →307 /other','后续请求应保留原方法语义','307 明确要求自动重定向时不要改变请求方法。'],
  ['POST /submit →303 /result','后续通常用 GET 取结果','303 引导客户端使用获取请求访问另一资源。'],
  ['GET /api →302，但没有可用 Location','不能仅凭状态码知道具体后续地址','重定向目标需要有效 Location。']
]) choice(3,'判断跳转链',scene,'哪项结论最稳妥？',
  [answer,'DNS 把 /a 变成 /b','每次重定向都强制重建 TCP','所有状态码都保证保留 POST 方法'],0,why,'数一数浏览器实际发了几次请求，再看每次 Location。');

// 5.4 cache key, method and request variance.
for (const [first,second,same] of [
  ['GET /logo.png','GET /logo.png',true],['GET /logo.png','GET /banner.png',false],
  ['GET /api/items?page=1','GET /api/items?page=2',false],['GET /style.css?v=1','GET /style.css?v=1',true],
  ['GET /style.css?v=1','GET /style.css?v=2',false],['HEAD /logo.png','GET /logo.png',false]
]) choice(4,'比较两个缓存请求',`缓存中保存了“${first}”的响应，随后发生“${second}”。暂不考虑 Vary 等额外条件。`,'仅从方法和目标 URI 看，是否可直接当成同一缓存键？',
  ['可以，方法与目标相同','不可以，方法或目标不同','任何请求都能共用缓存','只看文件扩展名就够'],same?0:1,
  `缓存键至少考虑方法与目标 URI。本例${same?'相同':'不同'}；相同也还需检查新鲜度等复用条件。`,'先逐字比较方法、路径与查询。');
for (const [variation,field] of [
  ['中文与英文表示','Accept-Language'],['JSON 与 HTML 表示','Accept'],['支持 gzip 与不支持 gzip','Accept-Encoding'],
  ['图片 WebP 与其他格式','Accept'],['同一路径按语言提供文本','Accept-Language'],['同一路径按编码提供内容','Accept-Encoding']
]) choice(4,'Vary 参与缓存选取',`同一 URL 可能根据请求头返回${variation}。`,'响应中的 Vary 最可能需要列出哪项请求字段？',
  [field,'Date','Server','Content-Length'],0,
  `Vary 告诉缓存请求字段 ${field} 会参与响应选择，避免把不适合的表示复用给另一个请求。`,'找出决定两种表示的请求偏好字段。');

// 5.5 freshness arithmetic and directives.
for (const [maxAge,elapsed,fresh] of [[60,10,true],[60,80,false],[300,299,true],[300,450,false],[120,40,true],[120,200,false]]) choice(5,'计算缓存新鲜度',`响应含 Cache-Control: max-age=${maxAge}，保存后过了 ${elapsed} 秒。假设没有其他修正或刷新操作。`,'这份缓存响应现在仍处于给定的新鲜期吗？',
  ['是','否','必须先看 URL 片段','只由 TCP 窗口决定'],fresh?0:1,
  `${elapsed} ${fresh?'小于':'大于'} ${maxAge} 秒，所以按题设${fresh?'仍新鲜':'已过期'}。过期后仍可能通过验证继续复用。`,'将经过时间与 max-age 比较。');
for (const [directive,answer,why] of [
  ['no-store','不应存储这次请求或响应','no-store 指令禁止缓存存储相关消息。'],
  ['no-cache','可以存储，但复用前需要成功验证','no-cache 不等于禁止存储，而是要求验证后复用。'],
  ['max-age=0','从一开始就缺少新鲜期，复用通常要验证','max-age=0 让响应立即过期。'],
  ['private','允许私有缓存使用，但共享缓存不应存储','private 限制共享缓存存储响应。'],
  ['public','明确允许共享缓存考虑存储','public 可以放宽共享缓存的存储条件。'],
  ['must-revalidate','过期后不能擅自复用，需成功验证','must-revalidate 限制过期后的复用。']
]) choice(5,`理解 ${directive}`,`响应含 Cache-Control: ${directive}。`,'哪种理解更准确？',
  [answer,'一律只缓存 DNS','自动让 TLS 证书失效','保证网页永远不会更新'],0,why,'区分“不许存”“需要验证”“允许共享”。');

// 5.6 ETag, validators and 304.
for (const [tag,unchanged] of [['"v1"',true],['"v2"',false],['"hash-a"',true],['"hash-b"',false],['"img-7"',true],['"img-8"',false]]) choice(6,'用 ETag 验证',`本地已有表示的 ETag 是 ${tag}，客户端发送 If-None-Match: ${tag}。服务器检查后确认内容${unchanged?'未变化':'已变化'}。`,'服务器接下来更可能怎样回应？',
  [unchanged?'304，客户端复用本地表示':'返回更新后的表示与对应成功状态',unchanged?'必须重新发送完整表示':'必须返回 304，忽略变动','DNS 返回 304','TCP 直接读取 ETag'],0,
  unchanged?'验证确认表示未变时，可以用 304 让客户端复用本地内容。':'服务器发现表示已变，应发送当前表示，不能错误地用 304 让客户端继续使用旧内容。','先看服务器检查出的“变了还是没变”。');
for (const [scene,answer,why] of [
  ['本地缓存已过期但有 ETag','发送条件 GET 询问是否改变','客户端可携带已有实体标签进行验证。'],
  ['收到 304 且本地有对应内容','沿用本地表示并更新相关元数据','304 本身不传输完整表示内容。'],
  ['收到 304 但客户端没有对应缓存内容','无法凭 304 生成完整页面','304 依赖客户端已有可用表示。'],
  ['资源内容改了，但服务端错误地返回 304','客户端可能继续使用旧内容','错误的验证结果会导致旧表示被复用。'],
  ['服务端给出 Last-Modified，客户端再次验证','可以使用 If-Modified-Since','修改时间可用于条件请求。'],
  ['一个 ETag 与另一表示的 ETag 不同','不能仅凭旧标签断言新表示未变','验证标识不一致，需要按当前表示处理。']
]) choice(6,'协商缓存的证据',scene,'哪项判断最符合缓存验证流程？',
  [answer,'浏览器必须永远不发请求','304 必须带完整 HTML','Cookie 会代替所有验证字段'],0,why,'304 的意义依赖已保存的表示。');

// 5.7 private vs shared cache with authentication.
for (const [scene,answer,why] of [
  ['个人账单响应含 Cache-Control: private','浏览器私有缓存可以考虑存储，共享缓存不应存储','private 限制共享缓存存储。'],
  ['公开图片可供大量访客重复读取','共享缓存可能减少回源请求','公开静态资源是共享缓存的典型候选。'],
  ['代理缓存把甲用户的账单返回给乙','泄露了个性化响应，缓存边界错误','共享缓存不能把一个用户的私有数据复用给他人。'],
  ['响应随 Authorization 请求而变化','共享缓存必须遵守认证响应的额外复用规则','不能默认把带认证的响应共享给所有用户。'],
  ['浏览器本地缓存只服务当前浏览器配置','属于私有缓存情境','私有缓存不为任意其他用户复用。'],
  ['CDN 边缘节点服务许多访客','属于共享缓存情境','CDN 可能为多用户复用已存响应。'],
  ['公开版本化脚本带长期新鲜期','共享缓存可在允许条件下复用','内容地址稳定且可公开时，长期缓存是常见策略。'],
  ['登录后的 API 含用户姓名','应谨慎限制共享缓存复用','响应包含用户特定内容。'],
  ['同一 URL 按语言返回不同正文','共享缓存需要考虑 Vary 等选择条件','不同语言表示不可随意互相替代。'],
  ['响应有 Set-Cookie','不能仅凭这一个字段断言所有缓存行为','缓存行为仍由相关缓存规则和指令决定。'],
  ['浏览器私有缓存已保存用户页面','其他用户的浏览器不会自动共享这份本地副本','私有缓存局限于其使用者。'],
  ['共享缓存尚未获准存储认证响应','不应擅自把它复用给其他用户','认证请求响应的共享缓存需要满足明确条件。']
]) choice(7,'判断缓存边界',scene,'哪种处理更符合用户隔离和缓存语义？',
  [answer,'所有缓存都只能服务同一用户','所有 200 响应都必须公开共享','HTTP 状态码和缓存完全无关'],0,why,'问缓存服务几个用户，以及响应是否因身份变化。');

// 5.8 stale asset investigation.
for (const [scene,action,why] of [
  ['HTML 已更新，但引用的 app.js URL 不变且旧文件被长期缓存','检查脚本缓存策略并考虑版本化文件名','同一 URL 的旧脚本可能仍被直接复用。'],
  ['CDN 边缘节点仍返回旧 HTML，而源站已经是新版','检查 CDN 缓存与失效流程','旧内容来自中间层，不在浏览器或源站生成。'],
  ['浏览器普通访问旧页面，强制刷新后正常','先比较普通访问与刷新时的缓存路径','刷新改变了缓存行为，是定位缓存问题的证据。'],
  ['只有一个地区的用户看见旧资源','检查该地区对应的边缘节点与缓存','区域差异可能来自不同 CDN 边缘缓存。'],
  ['所有用户收到新 HTML，但部分人仍运行旧脚本','检查脚本 URL、Cache-Control 与更新策略','HTML 与脚本各有自己的缓存规则。'],
  ['请求显示 304，但开发者确信资源已改变','检查服务端验证标识是否正确更新','错误的 ETag 或修改时间可能让旧资源被误判可用。'],
  ['用户说“清缓存就好了”，但重新部署后问题又出现','修复服务端与静态资源的长期缓存策略','清缓存是临时手段，不能修复错误的响应策略。'],
  ['版本化脚本 URL 从 app.a1.js 改为 app.b2.js','新 URL 会形成新的缓存键','内容地址变化有助于旧资源与新资源分离。'],
  ['图片 URL 加了新查询版本参数','新目标 URI 通常不会直接命中旧 URL 的缓存项','缓存键包含目标 URI，查询变化会影响选取。'],
  ['某用户个人资料旧，公开首页却是新','先分别检查个人响应与公共页面的缓存边界','不同资源和身份上下文不能混成一个缓存问题。'],
  ['浏览器已收到新版脚本，但页面仍显示旧数据','继续检查 API 响应和应用状态','脚本更新不能证明所有数据请求都已更新。'],
  ['一张图片返回 200，Size 显示 from disk cache','不能只看 200 就断定本次从网络下载了新图','浏览器面板的来源信息与状态码需一起看。']
]) choice(8,'定位旧页面根因',scene,'哪一项是下一步最有针对性的判断或措施？',
  [action,'把所有错误统一归为 DNS 故障','强制把所有 HTTP 方法改为 POST','删除所有 TLS 证书'],0,why,'先锁定旧的是哪一个资源、由哪一层提供。');

export const chapter5Questions=bank;
