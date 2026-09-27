const format = (value) => {
  try { return JSON.stringify(value); } catch { return String(value); }
};

const assert = {
  equal(actual, expected, label = '结果') {
    if (!Object.is(actual, expected)) throw new Error(`${label}：预期 ${format(expected)}，实际 ${format(actual)}`);
  },
  deepEqual(actual, expected, label = '结果') {
    const normalize = (value) => JSON.stringify(value, (_, entry) => {
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        return Object.fromEntries(Object.keys(entry).sort().map((key) => [key, entry[key]]));
      }
      return entry;
    });
    if (normalize(actual) !== normalize(expected)) {
      throw new Error(`${label}：预期 ${format(expected)}，实际 ${format(actual)}`);
    }
  },
  ok(value, label = '条件') {
    if (!value) throw new Error(`${label} 未满足`);
  },
  throws(callback, label = '应抛出错误') {
    let thrown = false;
    try { callback(); } catch { thrown = true; }
    if (!thrown) throw new Error(label);
  },
};

self.onmessage = async ({ data }) => {
  const { source, checks } = data;
  const results = [];
  for (const check of checks) {
    try {
      const run = new Function('assert', `"use strict";\n${source}\n${check.code}`);
      await run(assert);
      results.push({ name: check.name, passed: true });
    } catch (error) {
      results.push({ name: check.name, passed: false, message: String(error?.message || error) });
    }
  }
  self.postMessage({ results });
};
