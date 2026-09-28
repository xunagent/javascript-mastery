import test from 'node:test';
import assert from 'node:assert/strict';
import {isolatedRuntime} from './runtime-isolation.mjs';
test('DOM 沙箱支持元素类别、当前值、纯文本更新与事件冒泡',async()=>{
 const result=await isolatedRuntime({},[{name:'结构与事件',code:'document.body.innerHTML="<section><input value=old><button>save</button></section>";const input=document.querySelector("input");check(input instanceof HTMLInputElement);input.value="new";equal(input.value,"new");equal(input.getAttribute("value"),"old");input.setAttribute("value","changed default");equal(input.value,"new");const button=document.querySelector("button");check(button instanceof HTMLButtonElement);button.textContent="<b>plain</b>";equal(button.querySelector("b"),null);let target;document.querySelector("section").addEventListener("input",event=>{target=event.target;});input.dispatchEvent(new Event("input",{bubbles:true}));check(target===input);equal(typeof process,"undefined");equal(typeof require,"undefined");'}],1500,'dom');
 assert.ok(result.every(check=>check.passed),JSON.stringify(result));
});
test('DOM 沙箱可终止死循环，后续运行有全新文档',async()=>{
 const failed=await isolatedRuntime({'main.js':'document.body.innerHTML="dirty";while(true){}'},[{name:'loop',code:'load("main.js");'}],150,'dom');
 assert.equal(failed.every(check=>check.passed),false);
 const next=await isolatedRuntime({},[{name:'fresh',code:'equal(document.body.textContent,"");'}],1500,'dom');
 assert.ok(next.every(check=>check.passed),JSON.stringify(next));
});
