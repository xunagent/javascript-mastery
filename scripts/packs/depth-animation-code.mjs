export function addAnimationDepthCodeExercises({ code }) {
  code('js-animation-depth-code-01', 'js-animation', '暂停恢复时不把暂停时间算进进度',
    '实现 createTimeline(duration)：返回 start(now)、pause(now)、resume(now)、progress(now) 方法。start 后进度从 0 到 1，按真实时间线性增长；暂停期间进度保持不变；恢复后继续；超过终点限制为 1。duration 必须为有限正数，否则抛 RangeError。时间戳单位都是毫秒。',
    'function createTimeline(duration) {\n  // 在这里实现\n}',
    [['正常进度与边界', 'const t=createTimeline(100);t.start(10);assert.equal(t.progress(10),0);assert.equal(t.progress(60),0.5);assert.equal(t.progress(200),1)'], ['暂停与恢复', 'const t=createTimeline(100);t.start(0);t.pause(30);assert.equal(t.progress(80),0.3);t.resume(80);assert.equal(t.progress(100),0.5);assert.equal(t.progress(160),1)'], ['重新开始与无效时长', 'const t=createTimeline(200);t.start(0);t.pause(50);t.start(100);assert.equal(t.progress(150),0.25);assert.throws(()=>createTimeline(0));assert.throws(()=>createTimeline(-2));assert.throws(()=>createTimeline(Infinity))']],
    ['记录 start 时间、已暂停总时长与暂停开始时间。', '暂停时 progress 固定使用暂停开始时间。', '恢复时把这段暂停时长加入累计值；start 要重置状态。'],
    'function createTimeline(duration) {\n  if(!Number.isFinite(duration)||duration<=0) throw new RangeError("duration");\n  let startTime=0,pausedAt=null,pausedTotal=0;\n  return {\n    start(now){startTime=now;pausedAt=null;pausedTotal=0},\n    pause(now){if(pausedAt===null) pausedAt=now},\n    resume(now){if(pausedAt!==null){pausedTotal+=now-pausedAt;pausedAt=null}},\n    progress(now){const current=pausedAt===null?now:pausedAt;return Math.max(0,Math.min(1,(current-startTime-pausedTotal)/duration))}\n  };\n}',
    '基于时间戳计算进度时必须扣除暂停时长；单纯停止 requestAnimationFrame 再恢复会让动画发生跳跃。');
}
