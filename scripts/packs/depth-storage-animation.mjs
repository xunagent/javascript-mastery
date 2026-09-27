export function addStorageAnimationDepthExercises({ choice }) {
  const cases = [
    ['cookie','给一个 Cookie 赋值不清空其他 Cookie','document.cookie="theme=dark" 后，页面原有的 lang=zh Cookie 通常怎样？','',['仍然存在；这次赋值只更新 theme','被整个 cookie 字符串覆盖','自动变成 theme 的子字段','只在刷新后恢复'],['document.cookie 是特殊访问器。','赋值不是给普通字符串变量重新赋值。','一个赋值设置一个 Cookie。'],'写入 document.cookie 只设置指定 Cookie，不会覆盖同域的其他 Cookie。'],
    ['cookie','删除 Cookie 需匹配路径范围','页面曾设置 theme=dark; path=/app，后来写 theme=; max-age=0; path=/，发现 /app 下旧值还在。原因可能是什么？','',['删除时 path 与原 Cookie 不匹配，可能创建或删除了不同范围的 Cookie','max-age=0 表示永久保存','Cookie 永远不能删除','theme 名称必须大写'],['同名 Cookie 可以因路径不同而共存。','删除要针对正确的 Path/Domain。','max-age=0 本身表示立即过期。'],'删除 Cookie 时需匹配原先的路径等作用域属性，否则可能没有删除目标项。'],
    ['cookie','Secure 与 HttpOnly 解决不同问题','某会话 Cookie 同时需要只在 HTTPS 传输、且不被 document.cookie 读取。服务端应分别设置什么？','',['Secure 与 HttpOnly','SameSite 与 Path','Max-Age 与 Domain','Expires 与 SameSite'],['Secure 约束传输协议。','HttpOnly 阻止页面脚本读取。','二者职责不同，可同时设置。'],'Secure 限制非 HTTPS 传输，HttpOnly 限制脚本访问。'],
    ['localstorage','Storage 保存字符串','调用 localStorage.setItem("count",7)，再 getItem("count") 通常得到什么类型和值？','',['字符串 "7"','数字 7','布尔值 true','Promise<7>'],['Web Storage 的键和值都是字符串。','数字会被转换为字符串。','读取后若需数字应自行解析。'],'localStorage 把 7 存成字符串，getItem 返回 "7"。'],
    ['localstorage','storage 事件不在写入标签页触发','标签页 A 调用 localStorage.setItem 修改共享键，标签页 B 监听 storage。通常哪边会收到这次 storage 事件？','',['同源的其他页面 B；写入页面 A 通常不会收到自己的事件','只有 A','A 与 B 都必然收到','两个标签页都不会收到'],['storage 事件用于通知其他同源上下文。','发起写入的当前文档不靠它通知自己。','B 可用于同步偏好设置。'],'storage 事件通常在其他同源页面触发，写入页面应自行更新本地界面。'],
    ['indexeddb','put 与 add 对已有键的差别','对象仓库已有键 id=1。再次写入同键记录时，add 与 put 的典型区别是什么？','',['add 会因键冲突失败；put 可更新或覆盖','add 更新，put 必定失败','二者都只读取不写入','二者都绕过事务'],['add 用于新增，通常不允许相同键。','put 可作为插入或更新。','唯一键冲突会影响 add。'],'add 在已有键上触发约束错误，put 通常可更新对应记录。'],
    ['indexeddb','数据库升级被其他标签页阻塞','新标签页用更高版本号打开 IndexedDB，旧标签页仍持有连接。新页面收到 blocked 事件。旧标签页最应配合做什么？','',['监听 versionchange 并关闭旧连接，让升级事务继续','无条件删除整个数据库','把新页面的 version 改成 0','只清空 localStorage'],['升级需要旧连接释放数据库。','旧连接可收到 versionchange。','关闭旧连接后新版本升级能继续。'],'旧标签页应响应 versionchange 关闭连接，解除新页面的升级阻塞。'],
    ['indexeddb','索引的 unique 限制','给 users.email 建立 unique 索引后，两条不同主键的用户记录使用同一 email。第二次写入通常怎样？','',['触发约束错误，事务可能失败','成功；unique 只限制主键','自动修改 email 加数字后缀','索引会静默忽略第二条记录'],['unique 约束作用于索引键。','主键不同不代表 email 可重复。','违反约束会产生写入错误。'],'唯一索引禁止不同记录使用相同 email 值，重复写入会触发约束错误。'],
    ['bezier-curve','先加速后减速的对称缓动','按钮展开动画需要开始和结束都慢，中间较快。四个选项中哪条曲线最符合？','',['cubic-bezier(0.42,0,0.58,1)','cubic-bezier(0,0,1,1)','cubic-bezier(0,0,0,1)','cubic-bezier(1,0,1,1)'],['需要前半段加速、后半段减速。','线性曲线没有这种速度变化。','对称的 ease-in-out 控制点符合需求。'],'cubic-bezier(0.42,0,0.58,1) 是典型先加速后减速的对称缓动。'],
    ['bezier-curve','线性缓动与对角线','哪组 cubic-bezier 控制点沿对角线，产生线性进度？','',['cubic-bezier(0,0,1,1)','cubic-bezier(0,1,1,0)','cubic-bezier(1,1,0,0)','cubic-bezier(0,2,1,2)'],['线性映射应满足输出进度与输入时间一致。','对角线上的控制点保持 y=x。','(0,0) 与 (1,1) 符合。'],'cubic-bezier(0,0,1,1) 沿对角线，等价于线性缓动。'],
    ['bezier-curve','为什么时间控制点 x 通常限定在 0 到 1','自定义 CSS cubic-bezier 时，x1/x2 必须在 0～1 范围内，主要为了什么？','',['保持随时间推进可求解的有效缓动曲线','保证动画元素永不离开屏幕','禁止 y 方向过冲','让时长固定为一秒'],['横轴代表归一化时间。','浏览器需要按给定时间求出对应曲线位置。','y 可以超出范围形成过冲。'],'x 控制点受 0～1 约束，以便时间映射保持可用；y 控制点可在某些情况下越界。'],
    ['css-animations','暂停 CSS 动画而非移除动画','一个 CSS 动画播放到一半，想暂时停在当前帧，之后继续。应设置哪个属性？','',['animation-play-state: paused','animation-fill-mode: forwards','animation-iteration-count: 0','display: none'],['play-state 控制播放或暂停。','fill-mode 处理动画前后样式。','移除元素不能可靠保留当前进度。'],'animation-play-state:paused 暂停当前进度，改回 running 可继续。'],
    ['css-animations','forwards 保留动画末帧的视觉结果','动画结束后元素仍需显示最后一个关键帧的样式，但不直接改写原 CSS 属性值。哪项设置合适？','',['animation-fill-mode: forwards','animation-delay: 0','animation-direction: reverse','animation-play-state: paused'],['fill-mode 控制动画结束后的呈现。','forwards 使用最后一个关键帧的计算样式。','不等于永久修改基础样式规则。'],'forwards 让动画结束后继续呈现末帧样式。'],
    ['css-animations','无限循环通常不触发 animationend','动画设置 animation-iteration-count: infinite，应用只在 animationend 中清理临时状态。为什么可能一直等不到清理？','',['无限动画没有正常结束点，通常不会触发 animationend','每轮都会触发 animationend','animationend 只属于 transition','iteration-count 会自动改成 1'],['animationend 对应动画结束。','无限迭代不自然结束。','每轮结束可关注 animationiteration，主动停止另做清理。'],'无限循环动画不会正常结束，不能依赖 animationend 作为唯一清理时机。'],
    ['js-animation','requestAnimationFrame 的时间戳用途','浏览器某一帧比预期晚了 30ms。若动画每帧都只把位置加固定 2px，最可能出现什么？','',['速度依赖实际帧率；应按时间戳计算位置','时间戳会自动把固定步长变成真实速度','位置仍严格按每秒固定距离移动','requestAnimationFrame 会自动补发所有丢失帧'],['帧间隔可能变化。','固定每帧位移对应不固定的每秒速度。','用 elapsed/duration 计算进度。'],'按帧固定加量会随帧率变化而变慢或变快，按时间戳计算才更稳定。'],
    ['js-animation','取消已安排的下一帧','通过 requestAnimationFrame(callback) 安排了下一帧，组件在绘制前卸载。应怎样取消这个尚未执行的回调？','',['保存返回的请求 ID，调用 cancelAnimationFrame(id)','调用 clearInterval(callback)','把 callback 变量设为 null','只把元素隐藏，回调会自动取消'],['requestAnimationFrame 返回请求标识。','取消需要该标识。','隐藏元素不会自动取消 JS 回调。'],'保存 requestAnimationFrame 返回值并传给 cancelAnimationFrame，避免卸载后继续更新。']
  ];
  const indexes = new Map();
  for (const [lessonId, title, prompt, example, options, hints, explanation] of cases) {
    const index = (indexes.get(lessonId) || 0) + 1;
    indexes.set(lessonId, index);
    choice(`${lessonId}-depth-${String(index).padStart(2, '0')}`, lessonId, title, prompt, example, options, 0, hints, explanation);
  }
}
