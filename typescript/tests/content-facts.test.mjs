import test from 'node:test';
import assert from 'node:assert/strict';
import { checker } from './helpers.mjs';

// These are executable checks of subtle claims made in the lesson explanations.
test('数组与字典的默认索引推断不能证明键存在',()=>{
  const files={'main.ts':'export {};const values:number[]=[];const a:number=values[0];const dict:{[key:string]:number}={};const b:number=dict["absent"];'};
  assert.deepEqual(checker.compile(files).diagnostics,[]);
  const strict=checker.compile(files,{noUncheckedIndexedAccess:true}).diagnostics;
  assert.equal(strict.filter(d=>d.code===2322).length,2);
});

test('元组允许 push 但不会因此扩展固定索引契约',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export {};const pair:[number,number]=[1,2];pair.push(3);const length:2=pair.length;'}).diagnostics,[]);
  const result=checker.compile({'main.ts':'export {};const pair:[number,number]=[1,2];pair.push(3);const third=pair[2];'});
  assert.ok(result.diagnostics.some(d=>d.code===2493));
});

test('只读容器不递归限制元素对象',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export {};const users:readonly {name:string}[]=[{name:"A"}];users[0].name="B";const state:{readonly settings:{theme:string}}={settings:{theme:"light"}};state.settings.theme="dark";'}).diagnostics,[]);
  const result=checker.compile({'main.ts':'export {};const users:readonly {name:string}[]=[];users.push({name:"A"});'});
  assert.ok(result.diagnostics.some(d=>d.code===2339));
});

test('元组标签不生成属性，可选位置保留有限长度',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export {};type Request=[path:string,timeout?:number];declare const r:Request;const length:1|2=r.length;'}).diagnostics,[]);
  const result=checker.compile({'main.ts':'export {};const p:[x:number,y:number]=[1,2];const x=p.x;'});
  assert.ok(result.diagnostics.some(d=>d.code===2339));
});

test('额外属性检查区分字面量、变量与展开字段',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export {};type A={id:string};const source={id:"x",debug:true};const a:A=source;const extra={debug:true};const b:A={id:"x",...extra};'}).diagnostics,[]);
  for(const code of ['const a:A={id:"x",debug:true};','const a={id:"x",debug:true} satisfies A;']){
    const result=checker.compile({'main.ts':'export {};type A={id:string};'+code});
    assert.ok(result.diagnostics.some(d=>d.code===2353));
  }
});

test('可选 never 的 undefined 边界随精确可选配置变化',()=>{
  const files={'main.ts':'export {};type Input={text:string;url?:never}|{url:string;text?:never};const value:Input={text:"x",url:undefined};'};
  assert.deepEqual(checker.compile(files).diagnostics,[]);
  assert.ok(checker.compile(files,{exactOptionalPropertyTypes:true}).diagnostics.some(d=>d.code===2375));
});

test('普通结构兼容与私有成员来源约束不同',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export {};interface HasId{id:string}class User{id="u1"}const user:HasId=new User();'}).diagnostics,[]);
  const result=checker.compile({'main.ts':'export {};class A{private token="a"}class B{private token="b"}const a:A=new B();'});
  assert.ok(result.diagnostics.some(d=>d.code===2322));
});

test('上下文 void 忽略返回值，但显式 void 实现不能返回数字',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export {};const f:()=>void=()=>123;const result:void=f();const asyncCallback:()=>void=async()=>{await Promise.resolve();};'}).diagnostics,[]);
  const result=checker.compile({'main.ts':'export {};function f():void{return 123;}'});
  assert.ok(result.diagnostics.some(d=>d.code===2322));
});

test('必需 undefined 联合参数与可选参数的调用数量不同',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export {};function a(x?:number){}function b(x:number|undefined){}a();b(undefined);function join(prefix="app",name:string){}join(undefined,"main");'}).diagnostics,[]);
  const result=checker.compile({'main.ts':'export {};function b(x:number|undefined){}b();'});
  assert.ok(result.diagnostics.some(d=>d.code===2554));
});

test('回调允许少用参数，但不能索取更窄输入或额外必需参数',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export {};declare function visit(cb:(value:string,index:number)=>void):void;visit(value=>{});'}).diagnostics,[]);
  for(const code of [
    'declare function visit(cb:(value:string,index:number)=>void):void;visit((value:string,index:number,extra:boolean)=>{});',
    'declare function visit(cb:(value:string|number)=>void):void;visit((value:string)=>{});',
  ])assert.ok(checker.compile({'main.ts':'export {};'+code}).diagnostics.some(d=>d.code===2345));
});

test('重载实现签名不自动开放给调用方',()=>{
  const declaration='export {};function convert(x:string):number;function convert(x:number):string;function convert(x:string|number):number|string{return typeof x==="string"?x.length:String(x);}';
  assert.deepEqual(checker.compile({'main.ts':declaration+'const n:number=convert("a");const s:string=convert(1);'}).diagnostics,[]);
  const result=checker.compile({'main.ts':declaration+'declare const value:string|number;convert(value);'});
  assert.ok(result.diagnostics.some(d=>d.code===2769));
});

test('宽实现类型不能单独证明重载分支的运行对应关系',()=>{
  const code='export {};function convert(x:number):string;function convert(x:string):number;function convert(x:number|string):number|string{return x;}';
  assert.deepEqual(checker.compile({'main.ts':code}).diagnostics,[]);
});

test('显式 this 拒绝裸调用，绑定后可独立执行',()=>{
  const declaration='export {};function scale(this:{factor:number},value:number):number{return this.factor*value;}';
  assert.deepEqual(checker.compile({'main.ts':declaration+'const bound=scale.bind({factor:2});const n:number=bound(3);'}).diagnostics,[]);
  const result=checker.compile({'main.ts':declaration+'scale(3);'});
  assert.ok(result.diagnostics.some(d=>d.code===2684));
});

test('满足泛型约束的基础对象不一定满足具体 T',()=>{
  const result=checker.compile({'main.ts':'export {};function make<T extends {id:string}>():T{return {id:"new"};}'});
  assert.ok(result.diagnostics.some(d=>d.code===2322));
  assert.deepEqual(checker.compile({'main.ts':'export {};function keep<T extends {id:string}>(value:T):T{return value;}const name:string=keep({id:"a",name:"Lin"}).name;'}).diagnostics,[]);
});

test('调用级泛型与接口级泛型有不同承诺',()=>{
  const fixed='export {};interface Handler<T>{(value:T):T}const increment:Handler<number>=(value:number)=>value+1;';
  assert.deepEqual(checker.compile({'main.ts':fixed}).diagnostics,[]);
  const generic='export {};interface Identity{<T>(value:T):T}const increment:Identity=(value:number)=>value+1;';
  assert.ok(checker.compile({'main.ts':generic}).diagnostics.some(d=>d.code===2322));
});

test('泛型默认不覆盖正常推断，但部分显式参数使用后续默认',()=>{
  const inferred='export {};function wrap<T=string>(value:T):T{return value;}const n:number=wrap(3);function pair<A,B=string>(a:A,b:B):[A,B]{return [a,b];}const both:[number,boolean]=pair(1,true);';
  assert.deepEqual(checker.compile({'main.ts':inferred}).diagnostics,[]);
  const explicit='export {};function pair<A,B=string>(a:A,b:B):[A,B]{return [a,b];}pair<number>(1,true);';
  assert.ok(checker.compile({'main.ts':explicit}).diagnostics.some(d=>d.code===2345));
});

test('联合索引的值联合不能保证当前键值一一对应',()=>{
  const code='export {};function set<T,K extends keyof T>(object:T,key:K,value:T[K]):void{object[key]=value;}const user={name:"Lin",age:2};declare const key:"name"|"age";set(user,key,"text");';
  assert.deepEqual(checker.compile({'main.ts':code}).diagnostics,[]);
  const specific='export {};function set<T,K extends keyof T>(object:T,key:K,value:T[K]):void{object[key]=value;}set({name:"Lin",age:2},"age","text");';
  assert.ok(checker.compile({'main.ts':specific}).diagnostics.some(d=>d.code===2345));
});

test('交叉字段冲突不是右侧覆盖，判别冲突可使整体为 never',()=>{
  const code='export {};type Broken={id:string}&{id:number};declare const id:Broken["id"];const impossible:never=id;type Event={kind:"a";value:string}&{kind:"b";count:number};declare const event:Event;const whole:never=event;';
  assert.deepEqual(checker.compile({'main.ts':code}).diagnostics,[]);
});

test('keyof 联合取共有键，交叉提供两侧键，字符串索引包含数字',()=>{
  const code='export {};type A={id:string;name:string};type B={id:string;price:number};const common:keyof(A|B)="id";const all:keyof(A&B)="price";const numeric:keyof {[key:string]:boolean}=1;';
  assert.deepEqual(checker.compile({'main.ts':code}).diagnostics,[]);
  assert.ok(checker.compile({'main.ts':'export {};type A={id:string;name:string};type B={id:string;price:number};const key:keyof(A|B)="name";'}).diagnostics.some(d=>d.code===2322));
});

test('类型 typeof 获取已有推断，不自动保留可变属性字面量',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export {};const config={mode:"light",retries:3};type Config=typeof config;const other:Config={mode:"dark",retries:0};'}).diagnostics,[]);
  assert.ok(checker.compile({'main.ts':'export {};const config={mode:"light"};const mode:"light"=config.mode;'}).diagnostics.some(d=>d.code===2322));
});

test('const 断言保留字面量但不把外部数组引用递归只读',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export {};const values=[1,2];const box={values} as const;box.values.push(3);const point=[1,2] as const;const first:1=point[0];'}).diagnostics,[]);
  assert.ok(checker.compile({'main.ts':'export {};const point=[1,2] as const;point[0]=1;'}).diagnostics.some(d=>d.code===2540));
  assert.ok(checker.compile({'main.ts':'export {};const source={mode:"dark"};const value=source as const;'}).diagnostics.some(d=>d.code===1355));
});

test('satisfies 保留具体字段并可提供元组上下文',()=>{
  const code='export {};const palette={red:[255,0,0],green:"#00ff00"} satisfies Record<"red"|"green",string|[number,number,number]>;const text:string=palette.green;const tuple:[number,number,number]=palette.red;';
  assert.deepEqual(checker.compile({'main.ts':code}).diagnostics,[]);
  const wide='export {};const palette:Record<"red"|"green",string|[number,number,number]>={red:[255,0,0],green:"#00ff00"};palette.green.toUpperCase();';
  assert.ok(checker.compile({'main.ts':wide}).diagnostics.some(d=>d.code===2339));
});

test('satisfies 不自动只读也不补齐可选属性',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export {};const config={retries:3} satisfies {retries:number};config.retries=4;'}).diagnostics,[]);
  const result=checker.compile({'main.ts':'export {};const config={host:"localhost"} satisfies {host:string;port?:number};config.port;'});
  assert.ok(result.diagnostics.some(d=>d.code===2339));
});

test('Partial 只可选化第一层，有限键 Record 保留必需键',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export {};type Config={network:{host:string;port:number}};const patch:Partial<Config>={};'}).diagnostics,[]);
  assert.ok(checker.compile({'main.ts':'export {};type Config={network:{host:string;port:number}};const patch:Partial<Config>={network:{host:"a"}};'}).diagnostics.some(d=>d.code===2741));
  assert.ok(checker.compile({'main.ts':'export {};const prices:Record<"small"|"large",number>={small:1};'}).diagnostics.some(d=>d.code===2741));
});

test('infer 的返回提取使用重载末签名，非空元组模式不匹配普通数组',()=>{
  const code='export {};type ReturnOf<T>=T extends (...args:never[])=>infer R?R:never;declare function fn(x:string):number;declare function fn(x:number):string;const result:ReturnOf<typeof fn>="x";type Head<T>=T extends readonly [infer H,...unknown[]]?H:never;declare const item:Head<string[]>;const none:never=item;';
  assert.deepEqual(checker.compile({'main.ts':code}).diagnostics,[]);
  const wrong='export {};type ReturnOf<T>=T extends (...args:never[])=>infer R?R:never;declare function fn(x:string):number;declare function fn(x:number):string;const result:ReturnOf<typeof fn>=1;';
  assert.ok(checker.compile({'main.ts':wrong}).diagnostics.some(d=>d.code===2322));
});

test('裸参数条件对 never 分布为空，元组包裹可检测整体',()=>{
  const code='export {};type Label<T>=T extends string?"text":"other";declare const label:Label<never>;const n:never=label;type IsNever<T>=[T] extends [never]?true:false;const yes:IsNever<never>=true;const no:IsNever<string>=false;type Whole=(string|number) extends string?1:2;const whole:Whole=2;';
  assert.deepEqual(checker.compile({'main.ts':code}).diagnostics,[]);
  assert.ok(checker.compile({'main.ts':'export {};type Label<T>=T extends string?"text":"other";const value:Label<never>="text";'}).diagnostics.some(d=>d.code===2322));
});

test('映射修饰符保留数组结构，必需校验器仍可接收可选字段的 undefined',()=>{
  const code='export {};type View<T>={readonly [K in keyof T]:T[K]};const values:View<number[]>=[1,2];const total:number=values.reduce((a,b)=>a+b,0);type Validators<T>={-readonly [K in keyof T]-?:(value:T[K])=>boolean};const validators:Validators<{readonly note?:string}>={note:value=>value===undefined||value.length>0};validators.note(undefined);';
  assert.deepEqual(checker.compile({'main.ts':code}).diagnostics,[]);
  assert.ok(checker.compile({'main.ts':'export {};type View<T>={readonly [K in keyof T]:T[K]};const values:View<number[]>=[1,2];values.push(3);'}).diagnostics.some(d=>d.code===2339));
});

test('同名重映射键汇集来源值，never 键会删除属性',()=>{
  const code='export {};type Map<E extends {kind:string;payload:unknown}>={[Event in E as Event["kind"]]:Event["payload"]};type E={kind:"value";payload:string}|{kind:"value";payload:number};const a:Map<E>={value:"x"};const b:Map<E>={value:1};type WithoutId<T>={[K in keyof T as K extends "id"?never:K]:T[K]};const c:WithoutId<{id:string;name:string}>={name:"Lin"};';
  assert.deepEqual(checker.compile({'main.ts':code}).diagnostics,[]);
  assert.ok(checker.compile({'main.ts':'export {};type WithoutId<T>={[K in keyof T as K extends "id"?never:K]:T[K]};declare const value:WithoutId<{id:string;name:string}>;value.id;'}).diagnostics.some(d=>d.code===2339));
});

test('声明联合允许再次赋值，当前位置按最近赋值和可达路径收窄',()=>{
  const code='export {};let value:string|number="ready";value=42;const n:number=value;value="again";const s:string=value;function length(value:string|null){if(value===null)return 0;return value.length;}const box:{value:string|number}={value:"a"};box.value=2;const current:number=box.value;';
  assert.deepEqual(checker.compile({'main.ts':code}).diagnostics,[]);
  const wrong='export {};function f(value:string|number){if(typeof value==="string"){value=12;return value.toUpperCase();}}';
  assert.ok(checker.compile({'main.ts':wrong}).diagnostics.some(d=>d.code===2339));
});

test('已有变量的 satisfies 检查不删除额外字段，浅层精确工具只能读取可见类型',()=>{
  const code='export {};const source={id:"a",secret:"s"};const checked=source satisfies {id:string};const secret:string=checked.secret;type Exact<S,A>=A extends S?Exclude<keyof A,keyof S> extends never?A:never:never;const view:{id:string}=source;const accepted:Exact<{id:string},typeof view>=view;';
  assert.deepEqual(checker.compile({'main.ts':code}).diagnostics,[]);
  const wrong='export {};type Exact<S,A>=A extends S?Exclude<keyof A,keyof S> extends never?A:never:never;const source={id:"a",secret:"s"};const rejected:Exact<{id:string},typeof source>=source;';
  assert.ok(checker.compile({'main.ts':wrong}).diagnostics.some(d=>d.code===2322));
});

test('strictFunctionTypes 区分方法双向兼容例外和函数属性的严格参数方向',()=>{
  const method='export {};interface Consumer<T>{accept(value:T):void}declare const text:Consumer<string>;const all:Consumer<string|number>=text;';
  assert.deepEqual(checker.compile({'main.ts':method}).diagnostics,[]);
  const property='export {};interface Consumer<T>{accept:(value:T)=>void}declare const text:Consumer<string>;const all:Consumer<string|number>=text;';
  assert.ok(checker.compile({'main.ts':property}).diagnostics.some(d=>d.code===2322));
  const wider='export {};interface Consumer<T>{accept:(value:T)=>void}declare const broad:Consumer<unknown>;const text:Consumer<string>=broad;';
  assert.deepEqual(checker.compile({'main.ts':wider}).diagnostics,[]);
});

test('精确可选属性区分写入 undefined，但未检查的读取仍可能缺失',()=>{
  const config={exactOptionalPropertyTypes:true};
  const allowed='export {};const a:{name?:string}={};const b:{name?:string|undefined}={name:undefined};const c:{name:string|undefined}={name:undefined};declare const optional:{name?:string};const read:string|undefined=optional.name;';
  assert.deepEqual(checker.compile({'main.ts':allowed},config).diagnostics,[]);
  const rejected='export {};const a:{name?:string}={name:undefined};const b:{name:string|undefined}={};declare const optional:{name?:string};const read:string=optional.name;';
  const diagnostics=checker.compile({'main.ts':rejected},config).diagnostics;
  assert.ok(diagnostics.some(d=>d.code===2375));
  assert.ok(diagnostics.some(d=>d.code===2741));
  assert.ok(diagnostics.some(d=>d.code===2322));
});

test('类的实例侧与构造函数静态侧分开检查',()=>{
  const code='export {};class Counter{static total=0;value=0;}const ctor:typeof Counter=Counter;const instance:Counter=new ctor();const a:number=ctor.total;const b:number=instance.value;';
  assert.deepEqual(checker.compile({'main.ts':code}).diagnostics,[]);
  const wrong='export {};class Counter{static total=0;value=0;}Counter.value;new Counter().total;';
  const errors=checker.compile({'main.ts':wrong}).diagnostics;
  assert.equal(errors.filter(d=>d.code===2339||d.code===2576).length,2);
});

test('implements 不自动标注参数，也不向类添加接口的可选成员',()=>{
  const source='export {};interface Reader{read(key:string):string}class Store implements Reader{read(key){return key}}';
  assert.ok(checker.compile({'main.ts':source}).diagnostics.some(d=>d.code===7006));
  const valid='export {};interface Option{debug?:boolean}class Plain implements Option{}const value:Option=new Plain();';
  assert.deepEqual(checker.compile({'main.ts':valid}).diagnostics,[]);
  const absent='export {};interface Option{debug?:boolean}class Plain implements Option{}new Plain().debug;';
  assert.ok(checker.compile({'main.ts':absent}).diagnostics.some(d=>d.code===2339));
});

test('字符串枚举区分成员类型、成员名称和普通字面量',()=>{
  const valid='export {};enum Mode{Read="read",Write="write"}const a:Mode=Mode.Read;const key:keyof typeof Mode="Read";const literal:"read"=Mode.Read;';
  assert.deepEqual(checker.compile({'main.ts':valid}).diagnostics,[]);
  const invalid='export {};enum Mode{Read="read",Write="write"}const a:Mode="read";const key:keyof typeof Mode="read";';
  const diagnostics=checker.compile({'main.ts':invalid}).diagnostics;
  assert.equal(diagnostics.filter(d=>d.code===2322||d.code===2820).length,2);
});

test('接口合并累积字段但拒绝冲突属性，类型别名不能重开',()=>{
  const valid='export {};interface Config{host:string}interface Config{port:number}const value:Config={host:"localhost",port:80};';
  assert.deepEqual(checker.compile({'main.ts':valid}).diagnostics,[]);
  const conflict='export {};interface Config{value:string}interface Config{value:number}';
  assert.ok(checker.compile({'main.ts':conflict}).diagnostics.some(d=>d.code===2717));
  const aliases='export {};type Config={host:string};type Config={port:number};';
  assert.ok(checker.compile({'main.ts':aliases}).diagnostics.some(d=>d.code===2300));
});

test('标准装饰器与旧版参数装饰器使用不同模式',()=>{
  const modern='export {};function wrap<This>(value:(this:This)=>string,context:ClassMethodDecoratorContext<This,(this:This)=>string>){return function(this:This){return value.call(this);};}class C{@wrap run(){return "ok";}}';
  assert.deepEqual(checker.compile({'main.ts':modern},{experimentalDecorators:false}).diagnostics,[]);
  const legacy='export {};function parameter(target:object,key:string|symbol|undefined,index:number):void{}class C{run(@parameter value:string){return value;}}';
  assert.deepEqual(checker.compile({'main.ts':legacy},{experimentalDecorators:true}).diagnostics,[]);
  assert.ok(checker.compile({'main.ts':legacy},{experimentalDecorators:false}).diagnostics.some(d=>d.code===1206));
});

test('命名空间重开共享导出成员，但独立模块不自动合并同名空间',()=>{
  const shared='export namespace Tools{export const value=1;}export namespace Tools{export const next=value+1;}';
  assert.deepEqual(checker.compile({'main.ts':shared}).diagnostics,[]);
  const hidden='export namespace Tools{const value=1;}export namespace Tools{export const next=value+1;}';
  assert.ok(checker.compile({'main.ts':hidden}).diagnostics.some(d=>d.code===2304));
  const separate={'a.ts':'export namespace Tools{export const a=1;}','b.ts':'export namespace Tools{export const b=2;}','main.ts':'import {Tools} from "./a";import "./b";Tools.b;'};
  assert.ok(checker.compile(separate).diagnostics.some(d=>d.code===2339));
});

test('星号重导出不转发 default，直接重导出不创建本地调用绑定',()=>{
  const source='export default function format(){return "ok";}export const named=1;';
  const star={'source.ts':source,'barrel.ts':'export * from "./source";','main.ts':'import format from "./barrel";format();'};
  assert.ok(checker.compile(star).diagnostics.some(d=>d.code===1192));
  const reexport={'source.ts':'export function format(){return "ok";}','main.ts':'export {format} from "./source";format();'};
  assert.ok(checker.compile(reexport).diagnostics.some(d=>d.code===2552));
  const explicit={'source.ts':source,'main.ts':'import format from "./source";export {format};const result:string=format();'};
  assert.deepEqual(checker.compile(explicit).diagnostics,[]);
});

test('类型导入可用于 typeof 类型查询，但不能执行函数或构造类',()=>{
  const lib='export function createUser(){return {name:"a"};}export class User{constructor(public name:string){}}';
  const valid={'lib.ts':lib,'main.ts':'import type {createUser,User} from "./lib";type Factory=typeof createUser;declare const factory:Factory;const name:string=factory().name;declare const instance:User;const text:string=instance.name;'};
  assert.deepEqual(checker.compile(valid).diagnostics,[]);
  const invalid={'lib.ts':lib,'main.ts':'import type {createUser,User} from "./lib";createUser();new User("a");'};
  assert.equal(checker.compile(invalid).diagnostics.filter(d=>d.code===1361).length,2);
});

test('lib 控制环境名字可见性，模块导出与全局增强不同',()=>{
  assert.deepEqual(checker.compile({'main.ts':'export const title:string=document.title;'}).diagnostics,[]);
  assert.ok(checker.compile({'main.ts':'export const title:string=document.title;'},{lib:['ES2022']}).diagnostics.some(d=>d.code===2584));
  const exported={'env.d.ts':'export const COURSE_META:{version:string};','main.ts':'export const version=globalThis.COURSE_META.version;'};
  assert.ok(checker.compile(exported).diagnostics.some(d=>d.code===7017));
  const global={...exported,'env.d.ts':'export {};declare global{var COURSE_META:{version:string};}'};
  assert.deepEqual(checker.compile(global).diagnostics,[]);
});
