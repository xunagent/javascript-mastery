// This code is evaluated only inside an isolated worker (or a Node VM in audits).
export const RUNTIME_SOURCE = `
const courseEqual = (a, b) => {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const ak = Object.keys(a), bk = Object.keys(b);
  return Array.isArray(a) === Array.isArray(b) && ak.length === bk.length && ak.every(k => Object.hasOwn(b, k) && courseEqual(a[k], b[k]));
};
async function runCourseTests(payload) {
  if(payload.environment==='dom')CourseDOM.installDOM();
  const cache = {};
  function load(file) {
    if (cache[file]) return cache[file].exports;
    if (!(file in payload.output)) throw Error('运行环境中不存在模块：' + file);
    const module = { exports: {} }; cache[file] = module;
    const require = path => {
      if (!path.startsWith('.')) throw Error('练习只提供本地模块：' + path);
      const parts = file.split('/').slice(0, -1);
      for (const part of path.split('/')) { if (part === '..') parts.pop(); else if (part !== '.') parts.push(part); }
      let target = parts.join('/').replace(/\\.ts$/, '.js');
      if (!target.endsWith('.js')) target += '.js';
      return load(target);
    };
    new Function('exports', 'require', 'module', payload.output[file])(module.exports, require, module);
    return module.exports;
  }
  const checks = [];
  for (const test of payload.tests) {
    try {
      const equal = (actual, expected, message = '实际结果与要求不同') => { if (!courseEqual(actual, expected)) throw Error(message); };
      const check = (value, message = '条件未满足') => { if (!value) throw Error(message); };
      await new Function('load', 'equal', 'check', 'return (async () => {' + test.code + '\\n})();')(load, equal, check);
      checks.push({ name: test.name, passed: true });
    } catch (error) { checks.push({ name: test.name, passed: false, message: String(error.message).slice(0, 300) }); }
  }
  return checks;
}
`;
