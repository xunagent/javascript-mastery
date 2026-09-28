importScripts('./vendor/typescript.js');
let checker;
const ready = Promise.all([import('./compiler.mjs'), fetch('./vendor/libraries.json').then((r) => {
  if (!r.ok) throw Error('类型库加载失败，请刷新或稍后重试。');
  return r.json();
})]).then(([module, libraries]) => { checker = module.createChecker(ts, libraries); });
self.onmessage = async ({ data }) => {
  try {
    await ready;
    const result = data.action === 'emit' ? checker.emit(data.files,data.options,data.project) : data.action === 'inspect' ? { diagnostics: checker.compile(data.files, data.options, data.project).diagnostics } : checker.judge(data.question, data.files);
    self.postMessage({ id: data.id, result });
  } catch (error) { self.postMessage({ id: data.id, error: error.message }); }
};
