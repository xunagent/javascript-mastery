export function addAsyncDepthCodeExercises({ code }) {
  code('callbacks-depth-03','callbacks','串行运行错误优先回调任务','实现 runSeries(tasks,done)：tasks 每项是接收 callback(error) 的函数，按顺序一次启动一项；全部成功时调用 done(null) 一次，任一步失败或同步抛错时调用 done(error) 一次并停止。单个任务误调用 callback 多次时不能重复推进。',
    'function runSeries(tasks,done){\n  // 在这里实现\n}',
    [['等待前项完成','const seen=[];let release,final;runSeries([cb=>{seen.push(1);release=cb},cb=>{seen.push(2);cb(null)}],e=>final=e);assert.deepEqual(seen,[1]);release(null);assert.deepEqual(seen,[1,2]);assert.equal(final,null)'],['重复回调不重复推进','let steps=0,done=0;runSeries([cb=>{cb(null);cb(null)},cb=>{steps++;cb(null)}],()=>done++);assert.equal(steps,1);assert.equal(done,1)'],['错误与同步异常','const error=Error("bad");let seen=0,caught;runSeries([cb=>cb(error),cb=>{seen++;cb(null)}],e=>caught=e);assert.equal(caught,error);assert.equal(seen,0);let thrown;runSeries([()=>{throw error}],e=>thrown=e);assert.equal(thrown,error)']],
    ['保存当前任务索引和全局完成状态。','每个任务的 callback 需要自己的 called 标记。','同步抛错进入同一失败出口，完成时只调用 done 一次。'],
    'function runSeries(tasks,done){let index=0,finished=false;const finish=error=>{if(finished)return;finished=true;done(error)};function advance(){if(finished)return;if(index===tasks.length){finish(null);return}const task=tasks[index++];let called=false;try{task(error=>{if(called)return;called=true;if(error!=null)finish(error);else advance()})}catch(error){if(!called){called=true;finish(error)}}}advance()}',
    '每个回调的门控阻止重复推进；总完成状态防止多次调用 done，错误会终止后续任务。','稍有难度');

  code('promise-basics-depth-03','promise-basics','创建可由外部结算的 Promise','实现 makeDeferred()：返回 {promise,resolve,reject}，其中 promise 是新 Promise，resolve/reject 可由调用方稍后调用来结算它。不得在创建时自行结算；传入的完成值或错误应原样传播。',
    'function makeDeferred(){\n  // 在这里实现\n}',
    [['稍后完成','const d=makeDeferred();assert.ok(d.promise instanceof Promise);d.resolve(7);return d.promise.then(x=>assert.equal(x,7))'],['错误传播','const d=makeDeferred(),error=Error("bad");d.reject(error);return d.promise.then(()=>{throw Error("应拒绝")},e=>assert.equal(e,error))'],['结算只发生一次','const d=makeDeferred();d.resolve(1);d.reject(Error("late"));return d.promise.then(x=>assert.equal(x,1))']],
    ['先声明外部可访问的 resolve、reject 变量。','在 new Promise 的 executor 内接收两个结算函数。','返回 Promise 与两个结算函数。'],
    'function makeDeferred(){let resolve,reject;const promise=new Promise((res,rej)=>{resolve=res;reject=rej});return {promise,resolve,reject}}',
    'Promise 构造器把结算函数交给 executor；把它们保存下来可在未来明确完成或拒绝同一个 Promise。');

  code('promise-chaining-depth-03','promise-chaining','把异步保存接入完整链','实现 loadThenSave(load,save)：先调用 load()，等其完成后以加载结果调用 save(data)，返回最终保存结果的 Promise。load 或 save 拒绝时原样拒绝；save 不得在 load 完成前启动。',
    'function loadThenSave(load,save){\n  // 在这里实现\n}',
    [['顺序与结果','let resolveLoad,called=false;const gate=new Promise(r=>resolveLoad=r);const result=loadThenSave(()=>gate,x=>{called=true;return Promise.resolve(x+1)});assert.equal(called,false);resolveLoad(4);return result.then(x=>{assert.equal(x,5);assert.equal(called,true)})'],['保存失败传播','const error=Error("save");return loadThenSave(()=>Promise.resolve(1),()=>Promise.reject(error)).then(()=>{throw Error("应拒绝")},e=>assert.equal(e,error))'],['加载失败不启动保存','const error=Error("load");let called=false;return loadThenSave(()=>Promise.reject(error),()=>{called=true}).then(()=>{throw Error("应拒绝")},e=>{assert.equal(e,error);assert.equal(called,false)})']],
    ['先调用 load() 取得 Promise。','在 then 中返回 save(data)，不要只调用而不返回。','返回整条 Promise 链。'],
    'function loadThenSave(load,save){return load().then(data=>save(data))}',
    'then 会等待并采用处理器返回的 Promise；把 save 返回值接入链，后续才能正确等待保存和传播错误。');

  code('promise-error-handling-depth-03','promise-error-handling','只恢复资源不存在错误','实现 recoverNotFound(task,fallback)：调用 task()，它可能返回 Promise、普通值或同步抛错。若最终失败原因的 code 为 "NOT_FOUND"，用 fallback 完成；其他错误必须保持原原因拒绝。返回 Promise，合法的 0、false 结果不可替换。',
    'function recoverNotFound(task,fallback){\n  // 在这里实现\n}',
    [['合法假值','return Promise.all([recoverNotFound(()=>0,99),recoverNotFound(()=>Promise.resolve(false),99)]).then(x=>assert.deepEqual(x,[0,false]))'],['恢复指定错误','const error=Object.assign(Error("missing"),{code:"NOT_FOUND"});return recoverNotFound(()=>Promise.reject(error),"cached").then(x=>assert.equal(x,"cached"))'],['其他错误原样传播','const error=Error("network");return recoverNotFound(()=>{throw error},null).then(()=>{throw Error("应拒绝")},e=>assert.equal(e,error))']],
    ['Promise.resolve().then(task) 可把同步返回和同步抛错统一成 Promise。','catch 中只识别 code==="NOT_FOUND"。','其余错误重新 throw。'],
    'function recoverNotFound(task,fallback){return Promise.resolve().then(task).catch(error=>{if(error?.code==="NOT_FOUND")return fallback;throw error})}',
    '把同步和异步任务统一纳入 Promise 链；只恢复明确可预期的缺失错误，其他失败仍可被上层诊断。');

  code('promise-api-depth-03','promise-api','汇总所有完成与拒绝的结果','实现 summarizeSettled(items)：items 是 Promise 或普通值数组。使用 Promise.allSettled 等待全部项，返回 Promise，完成值为 {fulfilled,rejected}；两个数组分别按原输入顺序包含 {index,value} 与 {index,reason}，保留拒绝原因原引用。',
    'function summarizeSettled(items){\n  // 在这里实现\n}',
    [['混合结果','const error=Error("bad");return summarizeSettled([Promise.resolve("A"),Promise.reject(error),3]).then(r=>{assert.deepEqual(r.fulfilled,[{index:0,value:"A"},{index:2,value:3}]);assert.equal(r.rejected[0].index,1);assert.equal(r.rejected[0].reason,error)})'],['空输入','return summarizeSettled([]).then(r=>assert.deepEqual(r,{fulfilled:[],rejected:[]}))'],['拒绝后仍等待其他项','let release;const pending=new Promise(r=>release=r);let done=false;const result=summarizeSettled([Promise.reject(Error("x")),pending]).then(()=>{done=true});return Promise.resolve().then(()=>{assert.equal(done,false);release(2);return result})']],
    ['Promise.allSettled 返回与输入顺序对应的状态数组。','遍历时保留 index。','根据 status 将 value 或 reason 放入对应结果数组。'],
    'function summarizeSettled(items){return Promise.allSettled(items).then(results=>{const fulfilled=[],rejected=[];results.forEach((item,index)=>{if(item.status==="fulfilled")fulfilled.push({index,value:item.value});else rejected.push({index,reason:item.reason})});return {fulfilled,rejected}})}',
    'allSettled 等待所有项，不会因为单个拒绝提前结束；状态数组的位置与输入一致，便于按索引汇总。');

  code('async-await-depth-03','async-await','限制并发并保持结果顺序','实现 async mapWithLimit(items,limit,transform)：最多同时运行 limit 个 transform(item,index)，返回按输入顺序排列的结果数组；limit 必须是正整数，否则抛 RangeError。任一转换失败时返回的 Promise 应拒绝。',
    'async function mapWithLimit(items,limit,transform){\n  // 在这里实现\n}',
    [['结果顺序','return mapWithLimit([3,1,2],2,async x=>x*2).then(r=>assert.deepEqual(r,[6,2,4]))'],['不会超过并发上限','let active=0,max=0;return mapWithLimit([1,2,3,4],2,async x=>{active++;max=Math.max(max,active);await Promise.resolve();active--;return x}).then(r=>{assert.deepEqual(r,[1,2,3,4]);assert.equal(max,2)})'],['等待与无效上限','return (async()=>{let release;const gate=new Promise(r=>release=r);const started=[];const task=mapWithLimit([0,1,2],2,async(x,i)=>{started.push(i);if(i<2)await gate;return x});assert.deepEqual(started,[0,1]);release();await task;assert.deepEqual(started,[0,1,2]);let error;try{await mapWithLimit([],0,async x=>x)}catch(e){error=e}assert.ok(error instanceof RangeError)})()']],
    ['验证 limit 后创建结果数组和共享的下一个索引。','启动不超过 min(limit,items.length) 个异步 worker。','每个 worker 领取一个索引、await 转换并写回该索引，再领取下一项。'],
    'async function mapWithLimit(items,limit,transform){if(!Number.isInteger(limit)||limit<1)throw new RangeError("并发上限无效");const result=new Array(items.length);let next=0;async function worker(){while(next<items.length){const index=next++;result[index]=await transform(items[index],index)}}await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));return result}',
    '多个 worker 共享领取索引，每个 worker 同一时刻只处理一项。结果写回原索引，完成顺序不同也不会打乱返回数组。','稍有难度');
}
