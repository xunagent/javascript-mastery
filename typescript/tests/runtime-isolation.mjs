import { Worker } from 'node:worker_threads';
import { RUNTIME_SOURCE } from '../runtime.mjs';
import { domSource } from '../dom-bundle.mjs';

// A disposable worker contains unhandled promises and lets the parent stop loops.
// Student modules still run in a VM without Node's require/process globals.
export function isolatedRuntime(output, tests, timeout = 1500, environment) {
  return new Promise(resolve => {
    const worker = new Worker(`
      const {parentPort,workerData}=require('node:worker_threads');
      const vm=require('node:vm');
      // Keep the worker alive for a pending Promise until the parent deadline.
      parentPort.on('message',()=>{});
      let sent=false;
      function send(checks){if(!sent){sent=true;parentPort.postMessage(checks);}}
      function fail(error){send([{name:'运行隔离检查',passed:false,message:String(error?.message??error).slice(0,300)}]);}
      process.on('unhandledRejection',fail);
      process.on('uncaughtException',fail);
      try {
        const result=vm.runInNewContext(workerData.source+'\\nrunCourseTests(payload)',{payload:workerData.payload},{timeout:workerData.timeout});
        Promise.resolve(result).then(checks=>setImmediate(()=>send(checks)),fail);
      }catch(error){fail(error);}
    `, { eval: true, workerData: { source: (environment==='dom'?domSource()+'\n':'')+RUNTIME_SOURCE, payload: { output, tests, environment }, timeout } });
    let finished=false;
    const finish=checks=>{
      if(finished)return;
      finished=true;clearTimeout(timer);
      void worker.terminate();resolve(checks);
    };
    const failure=message=>finish([{name:'运行隔离检查',passed:false,message}]);
    const timer=setTimeout(()=>failure('运行超时，请检查循环和 Promise 是否能结束。'),timeout+300);
    worker.once('message',finish);
    worker.once('error',error=>failure(String(error.message).slice(0,300)));
    worker.once('exit',code=>{if(!finished)failure(`运行环境提前退出（${code}）`);});
  });
}
