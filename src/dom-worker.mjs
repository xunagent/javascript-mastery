import { parseHTML } from 'linkedom/worker';

const format = (value) => {
  try { return JSON.stringify(value); } catch { return String(value); }
};

const assert = {
  equal(actual, expected, label = '结果') {
    if (!Object.is(actual, expected)) throw new Error(`${label}：预期 ${format(expected)}，实际 ${format(actual)}`);
  },
  deepEqual(actual, expected, label = '结果') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label}：预期 ${format(expected)}，实际 ${format(actual)}`);
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
  const { source, fixture, checks } = data;
  const { document, window } = parseHTML(`<!doctype html><html><head><meta charset="UTF-8"></head><body>${fixture}</body></html>`);
  const Event = window.Event;
  const MouseEvent = window.MouseEvent || window.Event;
  const CustomEvent = window.CustomEvent;
  const results = [];
  try {
    new Function('document', 'window', 'Event', 'MouseEvent', 'CustomEvent', '"use strict";\n' + source)(document, window, Event, MouseEvent, CustomEvent);
    for (const check of checks) {
      try {
        await new Function('document', 'window', 'Event', 'MouseEvent', 'CustomEvent', 'assert', '"use strict";\n' + check.code)(document, window, Event, MouseEvent, CustomEvent, assert);
        results.push({ name: check.name, passed: true });
      } catch (error) {
        results.push({ name: check.name, passed: false, message: String(error?.message || error) });
      }
    }
  } catch (error) {
    results.push({ name: '代码执行', passed: false, message: String(error?.message || error) });
  }
  self.postMessage({ results, preview: '<!doctype html>' + document.documentElement.outerHTML });
};
