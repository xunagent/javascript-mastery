export function addBinaryDepthCodeExercises({ code }) {
  code('blob-depth-code-01', 'blob', '分块读取 Blob 并计算校验和',
    '实现 async chunkChecksums(blob, chunkSize)：从头到尾按 chunkSize 字节切片，每块读取实际字节并求和后对 256 取模，返回各块校验和数组。空 Blob 返回空数组；chunkSize 必须是正整数，否则抛 RangeError。不能把整个文件一次性读入内存。',
    'async function chunkChecksums(blob, chunkSize) {\n  // 在这里实现\n}',
    [['完整块与尾块', 'return (async()=>{const blob=new Blob([Uint8Array.from([1,2,3,250,10])]);assert.deepEqual(await chunkChecksums(blob,2),[3,253,10])})()'], ['空文件与字节边界', 'return (async()=>{assert.deepEqual(await chunkChecksums(new Blob([]),4),[]);assert.deepEqual(await chunkChecksums(new Blob([Uint8Array.from([255,2])]),5),[1])})()'], ['无效块大小', 'return (async()=>{for(const n of [0,-1,1.5]){let ok=false;try{await chunkChecksums(new Blob([1]),n)}catch(e){ok=e instanceof RangeError}assert.ok(ok)}})()']],
    ['先验证 chunkSize 是正整数。', '每次 blob.slice(offset,offset+chunkSize) 只读取当前块。', '把 Uint8Array 中的字节累加，再对 256 取模。'],
    'async function chunkChecksums(blob, chunkSize) {\n  if(!Number.isInteger(chunkSize)||chunkSize<=0) throw new RangeError("chunkSize");\n  const result=[];\n  for(let offset=0;offset<blob.size;offset+=chunkSize){\n    const bytes=new Uint8Array(await blob.slice(offset,offset+chunkSize).arrayBuffer());\n    result.push(bytes.reduce((sum,byte)=>sum+byte,0)%256);\n  }\n  return result;\n}',
    'Blob.slice 可以按字节范围读取大文件；逐块处理限制了单次内存使用，并正确处理最后一个不足整块的片段。');

  code('file-depth-code-01', 'file', '只读文件前缀生成十六进制预览',
    '实现 async filePreview(file, maxBytes)：返回 {name,size,hex}，其中 hex 是前 maxBytes 个文件字节的大写两位十六进制串，字节间用空格分隔。maxBytes 必须是非负整数，否则抛 RangeError；只允许通过 file.slice(0,maxBytes) 读取前缀。',
    'async function filePreview(file, maxBytes) {\n  // 在这里实现\n}',
    [['只读指定前缀', 'return (async()=>{let range;const file={name:"photo.bin",size:4,slice(a,b){range=[a,b];return new Blob([Uint8Array.from([0,15,255,7].slice(a,b))])}};assert.deepEqual(await filePreview(file,3),{name:"photo.bin",size:4,hex:"00 0F FF"});assert.deepEqual(range,[0,3])})()'], ['空前缀与超出长度', 'return (async()=>{const file={name:"x",size:1,slice(a,b){return new Blob([Uint8Array.from([171].slice(a,b))])}};assert.deepEqual(await filePreview(file,0),{name:"x",size:1,hex:""});assert.equal((await filePreview(file,8)).hex,"AB")})()'], ['无效上限', 'return (async()=>{const file={name:"x",size:0,slice(){return new Blob([])}};for(const n of [-1,1.2]){let ok=false;try{await filePreview(file,n)}catch(e){ok=e instanceof RangeError}assert.ok(ok)}})()']],
    ['先验证 maxBytes。', 'File 继承 Blob，可用 slice 只读取前缀。', '每字节用 toString(16).padStart(2,"0").toUpperCase()。'],
    'async function filePreview(file, maxBytes) {\n  if(!Number.isInteger(maxBytes)||maxBytes<0) throw new RangeError("maxBytes");\n  const bytes=new Uint8Array(await file.slice(0,maxBytes).arrayBuffer());\n  const hex=Array.from(bytes,byte=>byte.toString(16).padStart(2,"0").toUpperCase()).join(" ");\n  return {name:file.name,size:file.size,hex};\n}',
    '文件名和大小来自 File 元数据，内容要按字节读取；slice 限定读取范围，避免为预览加载整份大文件。');
}
