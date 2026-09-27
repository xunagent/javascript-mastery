import { refineQuestions } from './refine.mjs';
const bank = [];
const counts = new Map();
const firstHints = [
  '先判断应用需要有序字节流，还是希望自行控制消息和可靠性。',
  '跟踪双方各自的 SYN 与确认号，SYN 会占用一个序列号。',
  'TCP 的两个发送方向可以分别结束。',
  '确认号表示下一个期望收到的字节序号。',
  '接收窗口是接收方告诉发送方还可以接纳多少。',
  '区分接收方容量与网络路径的拥堵。',
  '先定位最后一个成功阶段，再判断对端是否明确回复。',
];
function choice(lesson, title, context, prompt, options, answer, explanation, clue, difficulty = '中等') {
  const lessonId = `g03-l${String(lesson).padStart(2, '0')}`;
  const n = (counts.get(lessonId) || 0) + 1;
  counts.set(lessonId, n);
  bank.push({ id: `${lessonId}-q${String(n).padStart(2, '0')}`, lessonId, title, context, prompt,
    kind: 'choice', options, answer, explanation,
    hints: [firstHints[lesson - 1], clue, '把每个选项对应的通信阶段写出来，再逐一排除。'], difficulty });
}

// 3.1 TCP vs UDP: constraints, not slogan matching.
for (const [scene,answer,reason] of [
  ['远程终端要求命令字节按顺序完整到达','TCP','有序且可靠的字节流适合这个要求。'],
  ['应用自己实现实时音视频传输和丢包取舍','UDP','应用希望自行控制报文与重传策略，UDP 提供较小的传输抽象。'],
  ['浏览器上传必须完整的文档，服务器要按序读取字节','TCP','完整有序的字节流契合上传需求。'],
  ['应用自定义可靠传输，且要保留每个数据报边界','UDP','保留报文边界并在应用层实现可靠性时，UDP 更符合设定。'],
  ['普通数据库连接要求操作字节按序到达','TCP','面向连接的有序字节流适合数据库协议。'],
  ['协议设计者希望自己控制消息边界、重传与拥塞逻辑','UDP','UDP 不替应用做这些高层决策，可供应用构建自己的传输机制。']
]) choice(1,`为场景选传输方式`,scene,'在题目给定的需求下，更直接的起点是哪一个？',
  ['TCP','UDP','DNS','ARP'],answer === 'TCP' ? 0 : 1,reason,'看需求是否明确要求有序字节流或应用自己控制报文。');
for (const [claim,correct,reason] of [
  ['TCP 把应用写入的字节当作连续的字节流处理',true,'TCP 不保留应用每次写入调用的消息边界。'],
  ['UDP 会自动保证每个数据报都到达且按序',false,'UDP 本身不提供可靠有序交付保证。'],
  ['应用可在 UDP 之上自行实现可靠传输',true,'应用可以添加确认、重传等机制。'],
  ['使用 TCP 后，应用就不需要处理任何超时或业务重试',false,'网络层可靠性不替代业务层确认和错误处理。'],
  ['UDP 保留一次发送的数据报边界',true,'UDP 面向数据报，接收时仍有单个数据报的概念。'],
  ['TCP 和 UDP 都通过端口帮助定位应用服务',true,'两者都有源端口和目标端口字段。']
]) choice(1,'协议能力的边界',`有人说：“${claim}”。`,'这句话在通常协议语义下是否准确？',
  ['准确','不准确','只有 HTTP/3 才能判断','只有 DNS 才能判断'],correct?0:1,reason,'不要把应用层保证归给传输协议。');

// 3.2 three-way handshake: ACK arithmetic and stage reasoning.
for (const [client,server] of [[100,500],[300,900],[1200,4300],[8000,14000],[75,225],[6540,9070]]) choice(2,'握手确认号',`客户端 SYN 序列号 ${client}；服务器 SYN 序列号 ${server}。忽略其他选项和数据。`,'服务器 SYN+ACK 中的确认号应是多少？',
  [String(client),String(client+1),String(server),String(server+1)],1,
  `客户端的 SYN 消耗一个序列号，所以服务器确认下一个期望值 ${client+1}。服务器自身的序列号是另一方向。`,'确认号针对对方的 SYN。');
for (const [client,server] of [[10,40],[200,700],[1300,2500]]) choice(2,'客户端最后一次确认',`客户端 SYN seq=${client}，服务器 SYN+ACK seq=${server}, ack=${client+1}。`,'客户端最后的 ACK 通常确认到哪里？',
  [String(client),String(client+1),String(server),String(server+1)],3,
  `客户端要确认服务器 SYN，因此 ack=${server+1}。`,'第三个报文确认的是服务器的 SYN。');
for (const [state,answer] of [
  ['客户端只发出 SYN，尚未收到服务器回复','还不能认定双方已建立连接'],
  ['客户端已收到 SYN+ACK，随后发出最终 ACK','客户端已完成自己的握手步骤'],
  ['服务端监听端口，但没有收到任何 SYN','仅监听不代表这条连接已建立']
]) choice(2,'握手进度判断',state,'哪项结论最符合当前证据？',
  [answer,'HTTP 响应体已经完整下载','DNS 返回了 404','TCP 握手与请求方法是同一个动作'],0,
  `${answer}。握手状态不能仅凭应用层页面是否显示推断。`,'只依据题目明确出现的握手报文。');

// 3.3 FIN and independent directions.
for (const [seq,ack] of [[100,101],[400,401],[900,901],[1500,1501],[3000,3001],[7400,7401]]) choice(3,'FIN 的确认号',`一端发送 FIN，序列号为 ${seq}；假定此前字节已按序到达。`,'对端确认该 FIN 时，确认号通常是什么？',
  [String(seq-1),String(seq),String(ack),String(seq+2)],2,
  `FIN 会消耗一个序列号，因此下一个期望值是 ${ack}。`,'把 FIN 当作占一个序列号的控制位。');
for (const [scene,correct,reason] of [
  ['客户端发送 FIN 后，服务器仍有一些已准备的数据要发给客户端',true,'半关闭允许一个方向结束发送，另一个方向继续发送。'],
  ['双方都发送并确认 FIN 后，这条连接的两个发送方向都结束',true,'两端分别结束自身发送方向后，连接完成关闭。'],
  ['一端发送 FIN 会立即抹去对端尚未发送的数据',false,'FIN 不等于强制清空对端发送队列。']
]) choice(3,'半关闭的含义',scene,'这种说法在正常 TCP 关闭语义下准确吗？',
  ['准确','不准确','只有 UDP 才适用','与连接无关'],correct?0:1,reason,'把“我不再发送”和“我不再接收”分开。');
for (const [claim,correct,reason] of [
  ['TIME_WAIT 帮助处理关闭阶段可能延迟到达的报文',true,'等待状态有助于可靠结束和隔离旧报文。'],
  ['出现 TIME_WAIT 就证明 HTTP 请求一定失败',false,'连接正常关闭后也可能出现 TIME_WAIT。'],
  ['TIME_WAIT 的存在意味着所有应用数据都必须重发',false,'TIME_WAIT 与重发所有应用内容没有这种等价关系。']
]) choice(3,'TIME_WAIT 判断',`某连接关闭后出现 TIME_WAIT。有人说：“${claim}”。`,'这句话是否正确？',
  ['正确','错误','只能看网页标题','必须先改 DNS'],correct?0:1,reason,'从连接关闭的目的理解等待状态。');

// 3.4 byte sequence, cumulative ACK and retransmission.
for (const [seq,length] of [[1000,100],[2500,200],[700,50],[8100,300],[40,20],[12000,400]]) choice(4,'按字节确认',`发送端从 seq=${seq} 开始发送 ${length} 字节的数据，对端全部按序收到。`,'对端下一个期望字节序号是多少？',
  [String(seq),String(seq+1),String(seq+length),String(seq+length+1)],2,
  `数据覆盖 ${seq} 到 ${seq+length-1}，因此下一个期望值是 ${seq+length}。普通数据长度与 SYN/FIN 的占位不要混淆。`,'确认号指向下一字节。');
for (const [first,missing,next] of [[1000,1100,1200],[5000,5100,5200],[800,900,1000]]) choice(4,'中间段丢失',`接收方已收到至 ${first+99}；以 ${missing} 开始的 100 字节段丢失，但以 ${next} 开始的后一段到达。`,'在没有更多机制细节时，累计确认号应停在哪里？',
  [String(first),String(missing),String(next),String(next+100)],1,
  `接收方仍缺从 ${missing} 开始的字节，累计确认不能越过这个缺口。`,'累计确认必须保证之前的数据连续收到。');
for (const [seq,len] of [[300,50],[1200,100],[9000,200]]) choice(4,'已发出不等于已到达',`发送端发出 seq=${seq}、长度 ${len} 的段，但在规定时间内没有得到确认。`,'发送端最有根据的动作是什么？',
  ['按重传策略处理未确认数据','立即宣称对端应用已成功处理','把 DNS 改成新的域名','把源端口删除'],0,
  '发送动作本身不能证明对端已收到。TCP 使用确认与重传机制处理未确认数据。','缺少的是来自对端的确认。');

// 3.5 receiver flow control and advertised window.
for (const [window,need,can] of [[0,100,false],[50,30,true],[100,120,false],[400,350,true],[20,20,true],[64,128,false]]) choice(5,'接收窗口约束',`接收方通告当前窗口 ${window} 字节，发送方想立即发送 ${need} 字节新数据；忽略其他限制。`,'能否一次把这批新数据全放进通告窗口？',
  ['可以','不可以','仅由 HTTP 路径决定','仅由 DNS 缓存决定'],can?0:1,
  `当前接收窗口是 ${window} 字节，${need} 字节${can?'不超过':'超过'}它。实际发送还会受拥塞窗口等其他限制。`,'比较想发送的字节数与通告窗口。');
for (const [before,after] of [[1000,100],[500,0],[800,200]]) choice(5,'接收方变慢',`接收应用处理不过来，通告窗口从 ${before} 降到 ${after}。`,'发送端应怎样理解？',
  ['接收方可接纳的新数据变少，应调整发送量','网络一定完全断开','HTTP 状态码变成 404','目标 IP 必须更换'],0,
  '接收窗口是接收端容量反馈，下降说明当前可接纳数据变少。','别把接收端压力误判为 DNS 故障。');
for (const [rwnd,cwnd,limit] of [[1000,600,600],[400,900,400],[800,800,800]]) choice(5,'两个窗口一起约束',`接收窗口 rwnd=${rwnd} 字节，拥塞窗口 cwnd=${cwnd} 字节；忽略已在途数据。`,'此时可发送新数据的上限由哪个数限制？',
  [String(rwnd+cwnd),String(limit),String(rwnd === cwnd ? limit / 2 : Math.max(rwnd,cwnd)),'完全不受窗口约束'],1,
  `发送量不能超过接收方容量和拥塞控制允许量两者中较小的 ${limit} 字节。`,'一个窗口保护接收端，一个窗口保护网络。');

// 3.6 network congestion vs receiver pressure.
for (const [rwnd,cwnd] of [[2000,300],[4000,500],[1500,200],[5000,600],[1200,100],[3000,400]]) choice(6,'真正限制发送的是谁',`接收窗口 ${rwnd} 字节，拥塞窗口 ${cwnd} 字节；接收方还有较大空间。`,'当前更可能是什么限制了发送量？',
  ['网络拥塞控制窗口','接收方容量窗口','DNS TTL','HTTP Cookie'],0,
  `cwnd=${cwnd} 小于 rwnd=${rwnd}，此时拥塞控制更严格。`,'比较两个窗口中较小的那个。');
for (const [scene,correct] of [
  ['接收方窗口仍很大，但发送端观察到丢包并降低发送速率','路径拥堵是合理假设'],
  ['接收方通知零窗口，路径没有明显丢包','接收方处理速度是合理假设'],
  ['一个请求的服务器响应很慢，但没有连接和丢包证据','不能仅凭慢就断定网络拥堵']
]) choice(6,'用证据区分原因',scene,'哪个判断与现有证据更相符？',
  [correct,'一定是 DNS 解析失败','一定是 HTTP/3 协议错误','一定是客户端 MAC 地址失效'],0,
  `${correct}。接收窗口反映接收方容量，丢包和拥塞反馈反映路径状态；服务端处理慢又是另一类原因。`,'先看接收窗口与丢包证据。');
for (const [claim,correct] of [
  ['拥塞控制主要为了避免过量发送压垮网络路径',true],
  ['流量控制和拥塞控制描述的是完全同一个窗口',false],
  ['接收端空间充足时仍可能因网络拥塞而减速',true]
]) choice(6,'拥塞控制边界',`有人说：“${claim}”。`,'这句话准确吗？',
  ['准确','不准确','仅与 Cookie 有关','仅与网页 CSS 有关'],correct?0:1,
  correct?'发送端需要同时顾及接收方和网络路径。':'接收窗口与拥塞窗口来源不同，解决的问题也不同。','辨认限制来自接收方还是网络。');

// 3.7 failure evidence and keepalives.
for (const [scene,answer,reason] of [
  ['连接请求发出后长时间没有响应，最后报超时','超时，尚不能证明对端明确拒绝','没有收到明确回应时，先记录超时和最后成功阶段。'],
  ['目标端口收到连接请求并明确返回 RST','连接被明确重置或拒绝','RST 是一个明确的 TCP 反馈，和静默等待不同。'],
  ['已建立连接后对端进程退出并发出 RST','已有连接被对端明确终止','对端的明确重置能与链路静默中断区分。'],
  ['网线拔掉，后续数据长时间得不到确认','可能进入重试与超时','链路断开不保证立刻收到远端明确的关闭报文。'],
  ['服务端监听进程未启动，目标主机立即拒绝连接','先检查服务是否监听目标端口','地址可达不等于服务在该端口监听。'],
  ['域名查询就失败，未发起 TCP 连接','先排查名称解析','目标地址尚未取得，不能把问题归咎于已建立的连接。']
]) choice(7,'连接故障定位',scene,'哪一项是最符合证据的下一步结论？',
  [answer,'一定收到了 HTTP 500','一定已完成 TLS 握手','一定是浏览器缓存过期'],0,reason,'找出最后有证据证明成功的阶段。');
for (const [claim,correct,reason] of [
  ['TCP Keepalive 与 HTTP 连接复用是同一层的同一机制',false,'TCP Keepalive 是传输层探测机制，HTTP 连接复用属于应用如何使用连接。'],
  ['HTTP/1.1 可在一个可用的 TCP 连接上发送后续请求',true,'持久连接允许在合适条件下复用底层连接。'],
  ['启用 TCP Keepalive 就能保证业务请求恰好执行一次',false,'传输层探测不能替代业务幂等性与确认。'],
  ['没有立即收到断开通知，不代表对端仍正常工作',true,'静默断网或进程异常时，检测状态可能需要时间。'],
  ['RST 与等待超时提供的故障证据不同',true,'RST 是明确反馈，超时可能有多种原因。'],
  ['TCP 重传成功就能证明用户已看到页面',false,'传输层确认不等于应用或用户行为完成。']
]) choice(7,'传输保证的边界',`有人说：“${claim}”。`,'这句话准确吗？',
  ['准确','不准确','只有 UDP 才能判断','只需看 DNS TTL'],correct?0:1,reason,'分清传输层状态和应用层结果。');

export const chapter3Questions = refineQuestions(bank, 3);
