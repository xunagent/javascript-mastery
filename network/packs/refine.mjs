// Replace unrelated distractors with misconceptions from the same topic.
// True/false checks have two meaningful options rather than filler answers.
const tls = [
  ['加密可以代替服务端的对象授权','有效证书能保证网站所有业务逻辑都安全','只要内容经过编码就已提供传输保密性','对端身份不重要，只要字节不可读即可','TLS 会自动清除应用日志中的敏感信息'],
  ['普通哈希摘要本身足以证明发送者身份','数字签名的目的就是隐藏签名消息的正文','公钥能公开意味着对应私钥也可公开','应用正文必须始终由证书公钥直接逐字节加密','使用摘要后就不再需要密钥或身份验证'],
  ['仅检查证书未到期就足以接受任何名称','任意自签证书都被浏览器默认信任','证书含公钥就证明它属于目标域名','证书验证通过后无需做应用授权','只要 TCP 连接成功就代表证书链可信'],
  ['TLS 成功就意味着用户已通过应用登录','每个 HTTP 请求都必须新建完整 TLS 握手','服务端必须把证书私钥发送给浏览器','TLS 只协商算法，不处理任何身份认证','握手完成会自动下载页面全部资源'],
  ['前向保密保证被控制的端点也不会泄露当前数据','长期私钥泄露后无需更换身份凭据','每个会话复用同一长期秘密即可提供前向保密','前向保密可以替代服务端名称验证','记录的历史密文在任何密钥泄露下都必然可恢复'],
  ['只要 TCP 可达，所有证书警告都可以忽略','无条件信任错误证书就是修复信任链','证书名称只要含目标域名的任意子串就算匹配','旧证书过期后刷新页面会自动延长有效期','任一设备成功就证明所有客户端信任条件相同'],
  ['恢复会话意味着可永久跳过业务认证授权','早期数据天然保证所有付款只执行一次','首次访问陌生站点必定已有可恢复会话','服务端必须接受所有过期恢复信息','复用已有连接与新连接恢复会话完全同义'],
  ['HTTPS 站点的任何错误都只能来自证书','收到 500 就证明此次 TLS 握手没有成功','允许跨源读取就能自动修复混合内容','修改 HTTP 状态码能修复 TCP 连接拒绝','安全传输成功能证明后端权限完全正确'],
];
const modern = [
  ['HTTP 持久连接与 TCP Keepalive 是完全相同的机制','复用连接保证请求永远不会排队','对端关闭连接后仍可继续在原连接发送请求','每次响应结束都必须强制新建 TCP 连接','复用连接可保证后端处理时间变成零'],
  ['HTTP/2 多路复用消除了底层 TCP 的所有有序等待','HTTP/3 一条流的字节缺口必定阻塞所有其他流交付','应用资源依赖会随协议升级自动消失','队头阻塞只有一个层次，不必区分来源','开启 HTTP/2 后服务器计算时间必定归零'],
  ['每条 HTTP/2 流必须对应独立的 TCP 连接','HTTP/2 帧交错意味着不同响应体无法再区分','HTTP/2 取消了请求方法和状态码语义','一个 DATA 帧到达就说明整个连接关闭','流级错误必定使所有其他流同时失效'],
  ['HPACK 会把响应正文和首部全部按同一种机制压缩','只压缩首部就能保证大图片下载耗时归零','首部压缩可以代替内容编码和图片优化','重复首部没有任何可利用的压缩信息','首部压缩直接消除了 DNS 和 TLS 的全部成本'],
  ['QUIC 使用 UDP 就不可能提供可靠有序流','每条 QUIC 流都必须重新建立独立公网地址','QUIC 不维护连接或丢失恢复状态','不同 QUIC 流必须共享同一有序字节流缺口','QUIC 只能在地址永不变化时定义连接'],
  ['HTTP/3 的 GET 与状态码完全不再有 HTTP 含义','HTTP/3 必须由 TCP 提供底层有序字节流','HTTP/3 升级可自动修复服务端业务授权','HTTP/3 禁止在同一连接上并发请求','所有 HTTP/3 丢包都必须阻塞全部独立流交付'],
  ['WebSocket 自动保证离线期间所有业务消息永不遗漏','建立连接时认证一次就有权访问所有房间','WebSocket 只允许服务器发送消息','持久连接不需要处理断线和状态恢复','每个静态图片请求都必须改用 WebSocket'],
  ['一次保存表单必须建立永久双向连接','只要叫实时功能就必须选择 WebSocket','SSE 与双向聊天的通信方向完全相同','协议名称足以决定方案，不必考虑恢复与负载','采用 RPC 就不再需要认证与权限设计'],
];

export function refineQuestions(bank, chapter) {
  for (const question of bank) {
    if (question.options[0] === '准确' && question.options[1] === '不准确') {
      question.options = question.options.slice(0, 2);
      question.difficulty = '概念辨析';
      continue;
    }
    if (![6, 7].includes(chapter)) continue;
    const lesson = Number(question.lessonId.slice(-2));
    let answer = question.options[question.answer];
    let alternatives;
    if (chapter === 6 && lesson === 1) {
      if (answer.includes('身份')) answer = '身份认证';
      alternatives = ['保密性', '完整性', '身份认证', '可用性'];
      question.title = '识别链路中的安全目标';
    } else if (chapter === 6 && lesson === 2) {
      if (answer.includes('签名')) answer = '数字签名';
      alternatives = ['对称加密', '数字签名', '哈希函数', '密钥交换'];
    } else if (chapter === 6 && lesson === 3) {
      alternatives = ['名称不匹配', '有效期错误', '信任链问题', '题设没有证书校验错误'];
    } else {
      alternatives = (chapter === 6 ? tls : modern)[lesson - 1];
    }
    const candidates = alternatives.filter((option) => option !== answer);
    const offset = Number(question.id.slice(-2)) % candidates.length;
    question.options = [answer, ...[...candidates.slice(offset), ...candidates.slice(0, offset)].slice(0, 3)];
    question.answer = 0;
  }
  return bank;
}
