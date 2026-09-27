export function addLanguageMiscDepthCodeExercises({ code }) {
  code('proxy-depth-03','proxy','创建浅层只读代理并保留 getter 接收者','实现 readOnly(target)：返回 Proxy。读取属性时保留正常 getter 的 receiver；对代理执行属性赋值或 delete 必须抛 TypeError，不修改 target。只要求保护代理这一层，不要求冻结嵌套对象。',
    'function readOnly(target){\n  // 在这里实现\n}',
    [['读取与 getter 接收者','const target={value:2,get self(){return this}};const proxy=readOnly(target);assert.equal(proxy.value,2);assert.equal(proxy.self,proxy)'],['禁止写入和删除','const target={x:1},proxy=readOnly(target);assert.throws(()=>{proxy.x=2});assert.throws(()=>{delete proxy.x});assert.equal(target.x,1)'],['未修改目标','const target={};const proxy=readOnly(target);assert.throws(()=>{proxy.newKey=3});assert.equal(Object.hasOwn(target,"newKey"),false)']],
    ['get 陷阱用 Reflect.get(target,key,receiver) 转发。','set 与 deleteProperty 陷阱直接抛 TypeError。','不要在禁止操作时写入 target。'],
    'function readOnly(target){return new Proxy(target,{get(t,key,receiver){return Reflect.get(t,key,receiver)},set(){throw new TypeError("只读")},deleteProperty(){throw new TypeError("只读")}})}',
    'Reflect.get 保留 getter 的接收者语义；写入和删除陷阱在修改目标之前拒绝操作。');

  code('currying-partials-depth-03','currying-partials','按任意分组收集参数再调用','实现 curryN(fn,arity)：arity 为正整数，否则抛 RangeError。返回函数，可分多次传入一组或多组参数；累计至少 arity 个时调用 fn，只传前 arity 个参数，this 使用第一组调用时的接收者。每条分支独立复用，调用组保证至少有一个参数。',
    'function curryN(fn,arity){\n  // 在这里实现\n}',
    [['不同分组','const f=curryN((a,b,c)=>a+b+c,3);assert.equal(f(1)(2)(3),6);assert.equal(f(1,2)(3),6);assert.equal(f(1)(2,3,99),6)'],['第一组接收者与独立分支','const o={base:10,run:curryN(function(a,b){return this.base+a+b},2)};const left=o.run(1),right=o.run(2);assert.equal(left.call({base:99},3),14);assert.equal(right(3),15)'],['无效 arity','assert.throws(()=>curryN(()=>1,0));assert.throws(()=>curryN(()=>1,1.5))']],
    ['先验证 arity。','每次返回新函数，闭包保留已收集参数与第一次调用的 this。','达到数量时用 fn.apply(receiver,args.slice(0,arity))。'],
    'function curryN(fn,arity){if(!Number.isInteger(arity)||arity<1)throw new RangeError("arity 无效");function build(collected,receiver){return function(...args){const all=collected.concat(args);const owner=collected.length===0?this:receiver;return all.length>=arity?fn.apply(owner,all.slice(0,arity)):build(all,owner)}}return build([],undefined)}',
    '柯里化每条未完成的调用链都保存自己的参数和接收者；后续分组不会覆盖其他分支。','稍有难度');

  code('reference-type-depth-03','reference-type','按名称调用对象方法而不丢失接收者','实现 invoke(target,key,...args)：target 为 null/undefined 或 target[key] 不是函数时返回 null；否则以 target 为 this 调用该方法并原样返回结果。key 可以是字符串或 Symbol，返回值 0、false 也必须保留。',
    'function invoke(target,key,...args){\n  // 在这里实现\n}',
    [['接收者与参数','const o={base:4,add(a,b){return this.base+a+b}};assert.equal(invoke(o,"add",2,3),9)'],['缺失方法与 Symbol','const s=Symbol("run"),o={[s](){return 0}};assert.equal(invoke(o,s),0);assert.equal(invoke({}, "x"),null);assert.equal(invoke(null,"x"),null)'],['假值结果','const o={read(){return false}};assert.equal(invoke(o,"read"),false)']],
    ['先安全取得 target?.[key]。','检查 typeof method 是否为 function。','用 method.apply(target,args) 保留接收者。'],
    'function invoke(target,key,...args){const method=target?.[key];if(typeof method!=="function")return null;return method.apply(target,args)}',
    '方法提取成函数值后，需要用 apply 明确传回原对象；直接返回调用结果可保留假值。');

  code('bigint-depth-03','bigint','用 BigInt 求最大公约数','实现 gcdBigInt(a,b)：两个参数必须都是 BigInt，否则抛 TypeError；返回两者绝对值的最大公约数，允许负数和 0n，gcdBigInt(0n,0n) 返回 0n。不能把大整数转换为 Number。',
    'function gcdBigInt(a,b){\n  // 在这里实现\n}',
    [['普通与负数','assert.equal(gcdBigInt(48n,18n),6n);assert.equal(gcdBigInt(-48n,18n),6n)'],['零与大整数','assert.equal(gcdBigInt(0n,0n),0n);assert.equal(gcdBigInt(0n,9n),9n);assert.equal(gcdBigInt(90071992547409930n,10n),10n)'],['类型限制','assert.throws(()=>gcdBigInt(2,2n));assert.throws(()=>gcdBigInt("2",2n))']],
    ['先用 typeof 验证两个 bigint。','把负数取相反数，避免负余数影响。','用欧几里得算法反复交换 a,b 和 a%b，直到 b===0n。'],
    'function gcdBigInt(a,b){if(typeof a!=="bigint"||typeof b!=="bigint")throw new TypeError("需要 BigInt");a=a<0n?-a:a;b=b<0n?-b:b;while(b!==0n){const rest=a%b;a=b;b=rest}return a}',
    '全程使用 BigInt 运算，既能处理超过 Number 安全范围的整数，也能正确处理负数与零。');

  code('unicode-depth-03','unicode','逐码点输出十六进制编号','实现 codePointHex(text)：按 Unicode 码点遍历字符串，返回每个码点的十六进制小写编号数组，不加 0x 前缀。非 BMP 字符应作为一个编号；组合符号仍按独立码点计算。',
    'function codePointHex(text){\n  // 在这里实现\n}',
    [['普通与表情','assert.deepEqual(codePointHex("A🙂"),["41","1f642"])'],['组合字符','assert.deepEqual(codePointHex("e\u0301"),["65","301"])'],['空输入','assert.deepEqual(codePointHex(""),[])']],
    ['字符串迭代器按码点产出字符。','对每个产出值调用 codePointAt(0)。','用 toString(16) 得到十六进制字符串。'],
    'function codePointHex(text){return Array.from(text,char=>char.codePointAt(0).toString(16))}',
    'Array.from 按码点遍历字符串，避免把表情的 UTF-16 代理对当成两个编号；组合字符仍是独立码点。');
}
