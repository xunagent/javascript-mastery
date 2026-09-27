export function addGeneratorDepthCodeExercises({ code }) {
  code('generators-depth-03','generators','惰性分批产出数组片段','实现生成器 chunks(items,size)：从左到右按 size 个元素产出新数组，最后一批可以更短。size 为正整数，否则在迭代时抛 RangeError；创建生成器时不得提前复制或遍历全部 items。',
    'function* chunks(items,size){\n  // 在这里实现\n}',
    [['分批与末尾','assert.deepEqual([...chunks([1,2,3,4,5],2)],[[1,2],[3,4],[5]])'],['惰性读取','const items=[1,2,3];const iterator=chunks(items,2);items[0]=9;assert.deepEqual(iterator.next().value,[9,2]);assert.deepEqual(iterator.next().value,[3])'],['边界与验证','assert.deepEqual([...chunks([],3)],[]);assert.throws(()=>[...chunks([1],0)]);assert.throws(()=>[...chunks([1],1.5)])']],
    ['generator 函数体会等到 next 才执行。','先验证 size。','用 for 循环按 size 增加起点，并 yield items.slice(start,start+size)。'],
    'function* chunks(items,size){if(!Number.isInteger(size)||size<1)throw new RangeError("批量大小无效");for(let start=0;start<items.length;start+=size)yield items.slice(start,start+size)}',
    '生成器只在迭代时创建当前批次；slice 返回独立数组，末尾不足 size 时自动缩短。');

  code('async-iterators-generators-depth-03','async-iterators-generators','惰性转换异步数据流','实现 async generator mapAsync(source,transform)：逐项 for await 消费 source，依次等待 transform(value,index) 完成，再 yield 结果；index 从 0 开始。调用 mapAsync 时不应立即读取 source，转换失败应向消费者传播。',
    'async function* mapAsync(source,transform){\n  // 在这里实现\n}',
    [['结果与索引','return (async()=>{async function* source(){yield 2;yield 3}const result=[];for await(const x of mapAsync(source(),async(v,i)=>v+i))result.push(x);assert.deepEqual(result,[2,4])})()'],['开始时惰性','return (async()=>{let starts=0;async function* source(){starts++;yield 1}const iter=mapAsync(source(),x=>x*2);assert.equal(starts,0);assert.deepEqual(await iter.next(),{value:2,done:false});assert.equal(starts,1)})()'],['失败传播','return (async()=>{const error=Error("bad");const iter=mapAsync([1],()=>{throw error});let caught;try{await iter.next()}catch(e){caught=e}assert.equal(caught,error)})()']],
    ['用 async function* 声明生成器。','for await...of 逐项取得 source 值。','每项 await transform(value,index++) 后 yield。'],
    'async function* mapAsync(source,transform){let index=0;for await(const value of source)yield await transform(value,index++)}',
    'async generator 保持惰性；for await 顺序消费输入，await 转换后再产出结果，失败会传播给 next/for await 消费者。');
}
