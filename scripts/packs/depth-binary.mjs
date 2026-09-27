export function addBinaryDepthExercises({ choice }) {
  const cases = [
    ['arraybuffer-binary-arrays','无符号字节与钳制字节的越界结果','分别把 300 写入 Uint8Array 和 Uint8ClampedArray 的第一个元素。读回通常分别是什么？','',['44 与 255','255 与 44','300 与 300','都抛 RangeError'],['Uint8Array 只保留低 8 位。','300 对 256 取模为 44。','Uint8ClampedArray 把大于 255 的值钳到 255。'],'普通 Uint8Array 写 300 得 44；钳制数组得 255。'],
    ['arraybuffer-binary-arrays','协议指定大端序时不能依赖机器默认','服务器协议要求 16 位整数使用大端序，字节 0x12 0x34 代表 0x1234。哪种读取写法明确表达协议字节序？','',['new DataView(buffer).getUint16(0,false)','new Uint16Array(buffer)[0]','new DataView(buffer).getUint16(0,true)','new Uint8Array(buffer)[0]'],['DataView 的第二参数控制小端序。','false 表示大端序。','TypedArray 读取不能明确指定协议字节序。'],'DataView.getUint16(0,false) 明确按大端序读取，避免依赖平台对类型化数组的解释。'],
    ['text-decoder','TextEncoder 默认返回什么','const encoded=new TextEncoder().encode("A中")；encoded 的类型和长度通常是什么？','',['Uint8Array，4 字节','ArrayBuffer，2 字节','字符串，2 字符','Uint16Array，3 个元素'],['TextEncoder 使用 UTF-8。','A 占 1 字节，“中”占 3 字节。','encode 返回 Uint8Array。'],'encode("A中") 返回长度 4 的 Uint8Array。'],
    ['text-decoder','encodeInto 的 read 与 written 不同','TextEncoder.encodeInto(text,destination) 返回 {read,written}。包含非 ASCII 字符时，两者为何可能不同？','',['read 计已消费的 UTF-16 代码单元，written 计写入的 UTF-8 字节','两者永远相等','read 是文件数，written 是事件数','written 只计 ASCII 字符'],['输入字符串和输出字节使用不同计量单位。','一个字符可编码为多个 UTF-8 字节。','目标缓冲区也可能限制写入。'],'read 表示消耗的 UTF-16 代码单元数，written 表示输出字节数，不能混作同一长度。'],
    ['blob','Blob 组合字符串和字节数组时的 size','new Blob(["A",new Uint8Array([66,67])]) 的 size 通常是多少？','',['3 字节','2 字节','5 字节','由 MIME type 决定'],['A 的 UTF-8 编码占一个字节。','Uint8Array 再提供两个原始字节。','Blob.size 按字节计算。'],'Blob 由 1 字节字符串和 2 字节数组组成，总大小 3 字节。'],
    ['blob','Blob.slice 的范围单位','一个 100 字节 Blob，调用 blob.slice(10,20) 的结果通常有多大？','',['10 字节；结束位置不包含在片段中','20 字节','90 字节','100 字节，因为 slice 不复制'],['slice 的参数是字节偏移。','区间形式是起点包含、终点不包含。','20-10=10。'],'blob.slice(10,20) 表示第 10 到第 19 字节，共 10 字节。'],
    ['file','FileReader 的结果格式由读取方法决定','为了把用户选择的图片显示为 img.src，FileReader 哪个方法直接给出可赋给 src 的 data URL？','',['readAsDataURL(file)','readAsArrayBuffer(file)','readAsText(file)','readAsBinaryString(file)'],['img.src 可使用 data URL。','ArrayBuffer 是原始二进制，不是 URL 字符串。','readAsDataURL 会把文件编码成 data: 地址。'],'readAsDataURL 读取结束后可通过 reader.result 得到可用于 img.src 的 data URL。']
  ];
  const indexes = new Map();
  for (const [lessonId, title, prompt, example, options, hints, explanation] of cases) {
    const index = (indexes.get(lessonId) || 0) + 1;
    indexes.set(lessonId, index);
    choice(`${lessonId}-depth-${String(index).padStart(2, '0')}`, lessonId, title, prompt, example, options, 0, hints, explanation);
  }
}
