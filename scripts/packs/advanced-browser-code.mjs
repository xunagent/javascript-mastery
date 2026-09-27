export function addAdvancedBrowserCodeExercises({ code }) {
  code('arraybuffer-binary-arrays-03', 'arraybuffer-binary-arrays', '把记录编码为小端二进制帧',
    '实现 encodeFrame(id, active)：返回长度为 3 的 ArrayBuffer。前 2 字节以无符号 16 位小端序写入 id，第 3 字节最低位表示 active。id 只允许 0～65535 的整数，否则抛出 RangeError。',
    'function encodeFrame(id, active) {\n  // 在这里实现\n}',
    [['字节序与标志位', 'const b=encodeFrame(0x1234,true);assert.ok(b instanceof ArrayBuffer);assert.deepEqual(Array.from(new Uint8Array(b)),[0x34,0x12,1])'], ['最小与最大值', 'assert.deepEqual(Array.from(new Uint8Array(encodeFrame(0,false))),[0,0,0]);assert.deepEqual(Array.from(new Uint8Array(encodeFrame(65535,true))),[255,255,1])'], ['非法 id', 'assert.throws(()=>encodeFrame(-1,true));assert.throws(()=>encodeFrame(65536,false));assert.throws(()=>encodeFrame(1.5,true))']],
    ['先验证 id 是范围内整数。', 'DataView.setUint16 可指定小端序。', '第三字节设置为 active ? 1 : 0。'],
    'function encodeFrame(id, active) {\n  if (!Number.isInteger(id) || id < 0 || id > 65535) throw new RangeError("id 超出范围");\n  const buffer=new ArrayBuffer(3);\n  const view=new DataView(buffer);\n  view.setUint16(0,id,true);\n  view.setUint8(2,active ? 1 : 0);\n  return buffer;\n}',
    'DataView 明确控制小端序与字节位置。先验证数值范围，避免写入时按位截断造成静默数据损坏。', '稍有难度');

  code('text-decoder-03', 'text-decoder', '正确解码跨块 UTF-8 数据',
    '实现 decodeChunks(chunks)：chunks 是 Uint8Array 数组，字节可能在一个多字节字符中间分块。返回完整 UTF-8 字符串；空数组返回空字符串。',
    'function decodeChunks(chunks) {\n  // 在这里实现\n}',
    [['跨字节分块', 'const bytes=new TextEncoder().encode("你好🙂");assert.equal(decodeChunks([bytes.slice(0,1),bytes.slice(1,4),bytes.slice(4)]),"你好🙂")'], ['空输入', 'assert.equal(decodeChunks([]),"")'], ['ASCII 与多块', 'assert.equal(decodeChunks([new Uint8Array([65]),new Uint8Array([66,67])]),"ABC")']],
    ['同一个 TextDecoder 要保持跨块状态。', '对每块调用 decode(chunk,{stream:true})。', '处理完最后一块后调用 decode() 冲刷。'],
    'function decodeChunks(chunks) {\n  const decoder=new TextDecoder();\n  let text="";\n  for (const chunk of chunks) text += decoder.decode(chunk,{stream:true});\n  return text + decoder.decode();\n}',
    '流式解码会暂存跨块的不完整字节序列；每块新建解码器会把合法多字节字符拆坏。');

  code('file-03', 'file', '只读取文件头识别 PNG',
    '实现 async isPng(file)：file 是 Blob 或 File，只读取前 8 字节，按 PNG 固定签名 89 50 4E 47 0D 0A 1A 0A 判断，返回布尔值。不能只看文件名或 MIME 类型。',
    'async function isPng(file) {\n  // 在这里实现\n}',
    [['正确签名', 'return isPng(new Blob([new Uint8Array([137,80,78,71,13,10,26,10,1,2])],{type:"text/plain"})).then(x=>assert.equal(x,true))'], ['错误签名', 'return isPng(new Blob([new Uint8Array([137,80,78,71,13,10,26,11])],{type:"image/png"})).then(x=>assert.equal(x,false))'], ['太短的文件', 'return isPng(new Blob([new Uint8Array([137,80,78])])).then(x=>assert.equal(x,false))']],
    ['Blob.slice 可以只取得前 8 字节。', '再调用 arrayBuffer() 读取。', '逐字节与固定签名比较，长度不足直接拒绝。'],
    'async function isPng(file) {\n  const bytes=new Uint8Array(await file.slice(0,8).arrayBuffer());\n  const signature=[137,80,78,71,13,10,26,10];\n  return bytes.length===8 && signature.every((value,index)=>bytes[index]===value);\n}',
    'MIME 类型和文件扩展名都可与实际内容不符。只读取文件头并比较魔数，既减少读取量，也比名称判断可靠。');

  code('fetch-progress-03', 'fetch-progress', '读取数据流并报告字节进度',
    '实现 async collectBytes(reader, onProgress)：循环读取 reader.read()，将所有 Uint8Array 块拼接成一个 Uint8Array；每读到一个非空块，就用累计字节数调用 onProgress。空块不触发回调。返回拼接结果。',
    'async function collectBytes(reader, onProgress) {\n  // 在这里实现\n}',
    [['拼接与累计', 'const chunks=[new Uint8Array([1,2]),new Uint8Array([3])];const seen=[];const reader={read:async()=>chunks.length?{done:false,value:chunks.shift()}:{done:true}};return collectBytes(reader,n=>seen.push(n)).then(bytes=>{assert.deepEqual(Array.from(bytes),[1,2,3]);assert.deepEqual(seen,[2,3])})'], ['空块和空流', 'const chunks=[new Uint8Array(0),new Uint8Array([9])];const seen=[];const reader={read:async()=>chunks.length?{done:false,value:chunks.shift()}:{done:true}};return collectBytes(reader,n=>seen.push(n)).then(bytes=>{assert.deepEqual(Array.from(bytes),[9]);assert.deepEqual(seen,[1])})'], ['没有数据', 'const reader={read:async()=>({done:true})};return collectBytes(reader,()=>{throw Error("不应通知")}).then(bytes=>assert.equal(bytes.length,0))']],
    ['先收集每个非空块，并累计 byteLength。', '结束后按总长度创建 Uint8Array。', '用 result.set(chunk,offset) 依次复制。'],
    'async function collectBytes(reader, onProgress) {\n  const chunks=[];\n  let total=0;\n  while (true) {\n    const {done,value}=await reader.read();\n    if (done) break;\n    if (!value?.byteLength) continue;\n    chunks.push(value);\n    total+=value.byteLength;\n    onProgress(total);\n  }\n  const result=new Uint8Array(total);\n  let offset=0;\n  for (const chunk of chunks) { result.set(chunk,offset); offset+=chunk.byteLength; }\n  return result;\n}',
    '下载流按不固定大小分块。真实进度应累计字节数，结束后按准确长度拼接；把“块数”当进度会失真。', '稍有难度');

  code('resume-upload-03', 'resume-upload', '按服务端确认偏移继续上传',
    '实现 async resumeUpload(bytes, chunkSize, getOffset, sendChunk)：bytes 为 Uint8Array；先 await getOffset() 得到服务端确认的字节偏移，再从该位置起按 chunkSize 顺序调用 await sendChunk(offset, part)。part 只能包含当前分片，最后返回 bytes.length。偏移不在 0～bytes.length 内或 chunkSize 非正整数时抛出 RangeError。',
    'async function resumeUpload(bytes, chunkSize, getOffset, sendChunk) {\n  // 在这里实现\n}',
    [['从偏移处开始且末片较短', 'const seen=[];return resumeUpload(new Uint8Array([1,2,3,4,5,6,7]),3,async()=>2,async(o,p)=>seen.push([o,Array.from(p)])).then(n=>{assert.equal(n,7);assert.deepEqual(seen,[[2,[3,4,5]],[5,[6,7]]])})'], ['已完成不重复上传', 'return resumeUpload(new Uint8Array([1,2]),2,async()=>2,async()=>{throw Error("不应上传")}).then(n=>assert.equal(n,2))'], ['非法偏移与分片大小', 'return Promise.all([resumeUpload(new Uint8Array(2),0,async()=>0,async()=>{}).then(()=>{throw Error("应拒绝")},e=>assert.ok(e instanceof RangeError)),resumeUpload(new Uint8Array(2),1,async()=>3,async()=>{}).then(()=>{throw Error("应拒绝")},e=>assert.ok(e instanceof RangeError))])']],
    ['先验证 chunkSize，再读取并验证服务器偏移。', '每片用 bytes.subarray(offset, Math.min(offset+chunkSize,bytes.length))。', '每次 await sendChunk，成功后才推进 offset。'],
    'async function resumeUpload(bytes, chunkSize, getOffset, sendChunk) {\n  if (!Number.isInteger(chunkSize) || chunkSize <= 0) throw new RangeError("分片大小无效");\n  let offset=await getOffset();\n  if (!Number.isInteger(offset) || offset<0 || offset>bytes.length) throw new RangeError("偏移无效");\n  while (offset<bytes.length) {\n    const part=bytes.subarray(offset,Math.min(offset+chunkSize,bytes.length));\n    await sendChunk(offset,part);\n    offset+=part.length;\n  }\n  return bytes.length;\n}',
    '进度以服务端已确认偏移为准，避免重传或跳过数据。分片串行等待确认后推进偏移，最后一片可以更短。', '稍有难度');

  code('localstorage-03', 'localstorage', '从可能损坏的本地存档恢复设置',
    '实现 readPreferences(storage)：storage 提供 getItem(key)。读取 key 为 "preferences" 的 JSON，返回 {theme, compact}。theme 只允许 "light" 或 "dark"，否则用 "light"；compact 只接受布尔值，否则用 false。读取抛错、无值、JSON 无效、结果不是普通对象时返回默认值。',
    'function readPreferences(storage) {\n  // 在这里实现\n}',
    [['有效字段', 'assert.deepEqual(readPreferences({getItem:()=>"{\\"theme\\":\\"dark\\",\\"compact\\":true}"}),{theme:"dark",compact:true})'], ['字段分别降级', 'assert.deepEqual(readPreferences({getItem:()=>"{\\"theme\\":\\"blue\\",\\"compact\\":0}"}),{theme:"light",compact:false})'], ['损坏或无权访问', 'assert.deepEqual(readPreferences({getItem:()=>"oops"}),{theme:"light",compact:false});assert.deepEqual(readPreferences({getItem:()=>{throw Error("blocked")}}),{theme:"light",compact:false})'], ['非对象结构', 'assert.deepEqual(readPreferences({getItem:()=>"[]"}),{theme:"light",compact:false})']],
    ['存储可能抛错，JSON.parse 也可能抛错。', '解析后确认是非数组对象。', '逐字段验证类型与允许值，不能只做布尔转换。'],
    'function readPreferences(storage) {\n  const defaults={theme:"light",compact:false};\n  try {\n    const value=JSON.parse(storage.getItem("preferences"));\n    if (!value || typeof value!=="object" || Array.isArray(value)) return defaults;\n    return { theme: value.theme==="dark" ? "dark" : "light", compact: typeof value.compact==="boolean" ? value.compact : false };\n  } catch { return defaults; }\n}',
    'localStorage 数据是字符串且可能损坏或不可用。解析成功后仍需验证结构和字段，不能把任意 JSON 当成可信配置。', '稍有难度');

  code('js-animation-03', 'js-animation', '按时间计算动画的边界进度',
    '实现 progressAt(now, start, duration)：返回线性动画的 0～1 进度。duration 为非负有限数；为 0 时，now<start 返回 0，否则返回 1。其他 duration 若无效则抛出 RangeError。',
    'function progressAt(now, start, duration) {\n  // 在这里实现\n}',
    [['开始、中途与结束', 'assert.equal(progressAt(90,100,200),0);assert.equal(progressAt(200,100,200),0.5);assert.equal(progressAt(500,100,200),1)'], ['零时长', 'assert.equal(progressAt(9,10,0),0);assert.equal(progressAt(10,10,0),1)'], ['非法时长', 'assert.throws(()=>progressAt(1,0,-1));assert.throws(()=>progressAt(1,0,Infinity));assert.throws(()=>progressAt(1,0,NaN))']],
    ['先验证 duration。', '零时长单独处理，避免除以零。', '正常情况将 (now-start)/duration 限制在 0～1。'],
    'function progressAt(now, start, duration) {\n  if (!Number.isFinite(duration) || duration<0) throw new RangeError("时长无效");\n  if (duration===0) return now<start ? 0 : 1;\n  return Math.min(1,Math.max(0,(now-start)/duration));\n}',
    '按时间差计算进度能适应不同刷新率。开始前与结束后的值要钳制，零时长需要明确语义。');
}
