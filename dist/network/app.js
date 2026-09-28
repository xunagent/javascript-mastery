import { independentPass as hasIndependentPass, reviewDue as isReviewDue, lessonStatus as statusForLesson, lessonEvidence, prepareAttempt, answerQuestion, normalizeProgress, mergeProgress, REVIEW_DELAY } from './quiz.mjs';

const STORAGE_KEY = 'network-mastery-progress-v1';
const app = document.querySelector('#app');
const state = { chapters: [], questions: [], progress: {}, currentId: null, currentQuestion: null, hintCount: 0, selected: [], order: [], input: '', feedback: null, view: 'map', filter: '', message: '' };

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const chapterFor = (id) => state.chapters.find((chapter) => chapter.lessons.some((lesson) => lesson.id === id));
const lessonFor = (id) => state.chapters.flatMap((chapter) => chapter.lessons).find((lesson) => lesson.id === id);
const questionsFor = (id) => state.questions.filter((question) => question.lessonId === id);
const recordFor = (id) => state.progress[id] || { attempts: [], hints: 0, skipped: false };
const questionFor = (id) => state.questions.find((question) => question.id === id);
const independentPass = (id) => hasIndependentPass(recordFor(id));
const attempted = (id) => (recordFor(id).attempts?.length || 0) > 0;
const dateText = (at) => new Date(at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
function solutionFor(q) {
  if (q.kind === 'choice') return q.options[q.answer];
  if (q.kind === 'multi') return q.answer.map((index) => q.options[index]).join('；');
  if (q.kind === 'order') return q.answer.map((index) => q.items[index]).join(' → ');
  return q.answers.join(' / ');
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); }
  catch { state.message = '无法保存到浏览器，请在学习记录中导出存档。'; }
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    state.progress = normalizeProgress(data, new Set(state.questions.map((question) => question.id)));
  } catch { state.progress = {}; }
}

function updateRecord(id, patch) {
  state.progress[id] = { ...recordFor(id), ...patch };
  save();
}

function reviewDue(lessonId) {
  return isReviewDue(questionsFor(lessonId), state.progress);
}

function lessonStatus(id) {
  return statusForLesson(questionsFor(id), state.progress);
}

function questionStatus(id) {
  if (independentPass(id)) return '独立通过';
  const record = recordFor(id);
  if (record.attempts?.some((attempt) => attempt.correct)) return '练习通过';
  if (record.skipped) return '暂时不会';
  if (record.attempts?.length) return '继续尝试';
  return '未作答';
}

function nextQuestion(lessonId) {
  const items = questionsFor(lessonId);
  const evidence = lessonEvidence(items, state.progress);
  if (evidence.due) {
    const candidate = items.find((question) => !evidence.initialIds.includes(question.id) && !evidence.reviewIds.includes(question.id) && ((!attempted(question.id) && !recordFor(question.id).hints) || Date.now() - Math.max(recordFor(question.id).lastActivity || 0, ...recordFor(question.id).attempts.map((a) => a.at)) >= REVIEW_DELAY));
    if (candidate) return candidate;
  }
  return items.find((question) => !attempted(question.id) && !recordFor(question.id).skipped)
    || items.find((question) => !independentPass(question.id)) || items[0];
}

function route() {
  let bits;
  try { bits = decodeURIComponent(location.hash.slice(2) || 'map').split('/'); }
  catch { bits = ['map']; }
  state.view = ['map', 'lesson', 'question', 'review', 'profile'].includes(bits[0]) ? bits[0] : 'map';
  state.currentId = bits[1] || null;
  if (state.view === 'question') state.currentQuestion = questionFor(bits[1]) || null;
  else state.currentQuestion = null;
  if (state.currentQuestion) {
    const record = recordFor(state.currentQuestion.id);
    const prepared = prepareAttempt(record);
    if (prepared !== record) updateRecord(state.currentQuestion.id, prepared);
  }
  state.hintCount = state.currentQuestion ? recordFor(state.currentQuestion.id).hints || 0 : 0;
  state.selected = [];
  state.input = '';
  state.order = state.currentQuestion?.kind === 'order' ? state.currentQuestion.items.map((_, i) => i) : [];
  state.feedback = null;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function shell(content) {
  const total = state.chapters.flatMap((chapter) => chapter.lessons).length;
  const started = state.chapters.flatMap((chapter) => chapter.lessons).filter((lesson) => questionsFor(lesson.id).some((question) => attempted(question.id))).length;
  return `<header class="topbar"><a class="brand" href="#/map"><span class="brand-icon">◉</span><span>网络闯关</span></a><nav aria-label="主导航"><a href="#/map" class="${['map','lesson','question'].includes(state.view) ? 'active' : ''}">知识地图</a><a href="#/review" class="${state.view === 'review' ? 'active' : ''}">待巩固</a><a href="#/profile" class="${state.view === 'profile' ? 'active' : ''}">学习记录</a></nav><span class="header-stat">已开始 ${started} / ${total} 小关</span></header>${content}<footer class="footer"><span>题目与解析原创编写 · 来源链接用于延伸阅读</span><nav><a href="../">JavaScript 闯关 ↗</a> · <a href="../typescript/">TypeScript 闯关 ↗</a></nav></footer>`;
}

function mapView() {
  const total = state.chapters.flatMap((chapter) => chapter.lessons).length;
  return shell(`<main class="wrap"><div class="page-heading"><div><p class="eyebrow">网络知识地图</p><h1>从一次网页请求，走到独立排障。</h1><p>10 大关 · ${total} 小关。先做题，再按提示补知识；每一步都能回到对应资料。</p></div><div class="route-decoration" aria-hidden="true"><span>浏览器</span><i></i><span>网络</span><i></i><span>服务器</span></div></div><label class="search-label" for="lesson-search">找一个知识点</label><input id="lesson-search" class="search" type="search" placeholder="例如：缓存、TCP、证书" value="${escapeHtml(state.filter)}"><div class="map-list">${mapResults()}</div></main>`);
}

function mapResults() {
  const matched = state.chapters.map((chapter) => ({ ...chapter, lessons: chapter.lessons.filter((lesson) => `${lesson.title} ${lesson.goal} ${chapter.title}`.toLowerCase().includes(state.filter.toLowerCase())) })).filter((chapter) => chapter.lessons.length);
  return matched.map((chapter, index) => {
    const completed = chapter.lessons.filter((lesson) => lessonStatus(lesson.id) === '巩固通过').length;
    return `<section class="chapter" id="${chapter.id}"><div class="chapter-title"><span class="chapter-number">${chapter.id.slice(1)}</span><div><h2>${escapeHtml(chapter.title)}</h2><p>${escapeHtml(chapter.summary)}</p></div><strong>${completed}/${chapter.lessons.length} 巩固</strong></div><div class="lesson-grid">${chapter.lessons.map((lesson) => `<a class="lesson-card" href="#/lesson/${lesson.id}"><span class="lesson-index">${escapeHtml(lesson.id.slice(1).replace('-l', '.'))}</span><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.goal)}</p><span class="lesson-state">${escapeHtml(lessonStatus(lesson.id))} <b aria-hidden="true">↗</b></span></a>`).join('')}</div></section>`;
  }).join('') || '<p class="empty">没有找到匹配的小关。</p>';
}

function lessonView() {
  const lesson = lessonFor(state.currentId);
  if (!lesson) return shell('<main class="wrap empty">没有找到这个小关。<a href="#/map">返回知识地图</a></main>');
  const chapter = chapterFor(lesson.id);
  const questions = questionsFor(lesson.id);
  const next = nextQuestion(lesson.id);
  const evidence = lessonEvidence(questions, state.progress);
  const reviewNotice = evidence.dueAt && !evidence.reviewed ? `<p>${evidence.due ? `复测已独立完成 ${evidence.reviewIds.length}/2 道` : `下次复测：${dateText(evidence.dueAt)}`}</p>` : '';
  return shell(`<main class="wrap lesson-layout"><div class="lesson-main"><a class="back-link" href="#/map">← 知识地图</a><p class="eyebrow">${escapeHtml(chapter.title)} · ${escapeHtml(lesson.id.slice(1).replace('-l', '.'))}</p><h1>${escapeHtml(lesson.title)}</h1><p class="lesson-goal">本关要做到：${escapeHtml(lesson.goal)}</p><section class="explain-card"><div class="section-top"><span class="section-icon">◎</span><h2>先理解</h2></div><p>${escapeHtml(lesson.explain)}</p><p class="micro-note">可以先做题。卡住时再回来读这段，或打开下面的延伸阅读。</p></section><section class="resources"><h2>继续阅读</h2><a href="${escapeHtml(lesson.source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(lesson.sourceLabel)} ↗</a>${lesson.book !== '—' ? `<span>《图解 HTTP》相关背景：第 ${escapeHtml(lesson.book)} 节</span>` : ''}</section></div><aside class="lesson-aside"><div class="aside-box"><p class="eyebrow">闯关进度</p><h2>${escapeHtml(lessonStatus(lesson.id))}</h2><p>当前题库 ${questions.length} 道 · 已尝试 ${questions.filter((q) => attempted(q.id)).length} 道</p><p>独立通过 7 道 → 三天后用另外 2 道复测。答错或用过提示的题，间隔三天可独立复答。</p>${reviewNotice}${next ? `<a class="button primary" href="#/question/${next.id}">${questions.some((q) => attempted(q.id)) ? '继续练习' : '开始练习'} →</a>` : '<p class="empty">题目正在编写。</p>'}</div><div class="aside-box"><h3>本关练习</h3><div class="question-list">${questions.map((q, index) => `<a href="#/question/${q.id}"><span>${index + 1}. ${escapeHtml(q.title)}</span><small>${escapeHtml(questionStatus(q.id))}</small></a>`).join('')}</div></div></aside></main>`);
}

function questionBody(q) {
  if (q.kind === 'choice' || q.kind === 'multi') return `<fieldset class="options"><legend>${q.kind === 'multi' ? '请选择所有正确选项' : '请选择最合适的答案'}</legend>${q.options.map((option, index) => `<label><input type="${q.kind === 'multi' ? 'checkbox' : 'radio'}" name="answer" value="${index}" ${state.selected.includes(index) ? 'checked' : ''}><span>${escapeHtml(option)}</span></label>`).join('')}</fieldset>`;
  if (q.kind === 'order') return `<div class="order-task"><p>用上下按钮调整顺序：</p>${state.order.map((itemIndex, position) => `<div class="order-row"><span>${position + 1}. ${escapeHtml(q.items[itemIndex])}</span><span><button data-move="${position}:up" ${position === 0 ? 'disabled' : ''} aria-label="上移 ${escapeHtml(q.items[itemIndex])}">↑</button><button data-move="${position}:down" ${position === state.order.length - 1 ? 'disabled' : ''} aria-label="下移 ${escapeHtml(q.items[itemIndex])}">↓</button></span></div>`).join('')}</div>`;
  if (q.kind === 'input') return `<label class="input-task">你的答案<input id="answer-input" autocomplete="off" spellcheck="false" value="${escapeHtml(state.input)}" placeholder="${escapeHtml(q.placeholder || '输入答案')}"></label>`;
  return '<p class="empty">暂不支持这种题型。</p>';
}

function questionView() {
  const q = state.currentQuestion;
  if (!q) return shell('<main class="wrap empty">没有找到这道题。<a href="#/map">返回知识地图</a></main>');
  const lesson = lessonFor(q.lessonId);
  const chapter = chapterFor(q.lessonId);
  const siblings = questionsFor(q.lessonId);
  const index = siblings.findIndex((item) => item.id === q.id);
  const next = siblings[index + 1];
  return shell(`<main class="wrap question-layout"><div class="question-main"><a class="back-link" href="#/lesson/${lesson.id}">← ${escapeHtml(lesson.title)}</a><p class="eyebrow">${escapeHtml(chapter.title)} · 第 ${index + 1}/${siblings.length} 题 · ${escapeHtml(q.difficulty)}</p><h1>${escapeHtml(q.title)}</h1><div class="scenario">${q.context ? `<p>${escapeHtml(q.context)}</p>` : ''}${q.trace ? `<div class="trace" aria-label="过程图">${q.trace.map((step) => `<span>${escapeHtml(step)}</span>`).join('<b aria-hidden="true">→</b>')}</div>` : ''}</div><p class="prompt">${escapeHtml(q.prompt)}</p>${questionBody(q)}<div class="answer-actions"><button class="button primary" id="submit-answer">检查答案</button><button class="button secondary" id="jump-hints">看提示</button><button class="button secondary" id="skip-question">暂时不会</button></div>${state.feedback ? `<section class="feedback ${state.feedback.correct ? 'correct' : 'incorrect'}" role="status"><h2>${state.feedback.correct ? '判断正确' : '再想一步'}</h2><p>${escapeHtml(state.feedback.message)}</p>${state.feedback.correct || state.hintCount > q.hints.length ? `<p><b>参考答案：</b>${escapeHtml(solutionFor(q))}</p><p>${escapeHtml(q.explanation)}</p>` : ''}${next ? `<a class="button secondary" href="#/question/${next.id}">下一题 →</a>` : `<a class="button secondary" href="#/lesson/${lesson.id}">返回本关 →</a>`}</section>` : ''}</div><aside class="question-aside"><div class="aside-box"><h2>不会做？一步步来</h2><p>提示分三步展开。看过提示或本轮答错后，再答对记为练习通过；可换题独立验证，也可三天后重新独立作答。</p>${q.hints.map((hint, index) => `<div class="hint">${state.hintCount > index ? `<p><b>提示 ${index + 1}</b><br>${escapeHtml(hint)}</p>` : `<button data-hint="${index + 1}" ${index > state.hintCount ? 'disabled' : ''}>查看提示 ${index + 1}</button>`}</div>`).join('')}<button class="text-button" id="show-explanation">查看完整解析</button>${state.hintCount > q.hints.length ? `<p class="hint-answer"><b>参考答案：</b>${escapeHtml(solutionFor(q))}</p><p class="hint-answer">${escapeHtml(q.explanation)}</p>` : ''}</div><div class="aside-box"><h2>先学这个知识点</h2><p>${escapeHtml(lesson.explain)}</p><a href="${escapeHtml(lesson.source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(lesson.sourceLabel)} ↗</a><a href="#/lesson/${lesson.id}">返回本关短讲 →</a></div><div class="aside-box"><h2>本关题目</h2><div class="question-list">${siblings.map((item, idx) => `<a class="${item.id === q.id ? 'current' : ''}" href="#/question/${item.id}"><span>${idx + 1}. ${escapeHtml(item.title)}</span><small>${escapeHtml(questionStatus(item.id))}</small></a>`).join('')}</div></div></aside></main>`);
}

function reviewView() {
  const lessons = state.chapters.flatMap((chapter) => chapter.lessons);
  const due = lessons.filter((lesson) => reviewDue(lesson.id));
  const skipped = state.questions.filter((q) => (recordFor(q.id).skipped || attempted(q.id)) && !independentPass(q.id));
  return shell(`<main class="wrap simple"><p class="eyebrow">学习复盘</p><h1>待巩固</h1><p>先独立通过 7 道不同题；三天后再独立通过另外 2 道，完成巩固。借助提示或答错的题，间隔三天后可开启独立复答。</p><div class="review-grid"><section class="panel"><h2>到期复测 <span>${due.length}</span></h2>${due.length ? due.map((lesson) => `<a class="review-row" href="#/lesson/${lesson.id}">${escapeHtml(lesson.title)} <b>去复测 →</b></a>`).join('') : '<p class="empty">目前没有到期的小关。</p>'}</section><section class="panel"><h2>错题与待补强 <span>${skipped.length}</span></h2>${skipped.length ? skipped.map((q) => `<a class="review-row" href="#/question/${q.id}">${escapeHtml(q.title)} <b>再试一次 →</b></a>`).join('') : '<p class="empty">目前没有错题、提示练习或跳过的题。</p>'}</section></div></main>`);
}

function profileView() {
  const items = state.questions;
  const attemptedCount = items.filter((q) => attempted(q.id)).length;
  const independent = items.filter((q) => independentPass(q.id)).length;
  const mastered = state.chapters.flatMap((chapter) => chapter.lessons).filter((lesson) => lessonStatus(lesson.id) === '巩固通过').length;
  return shell(`<main class="wrap simple"><p class="eyebrow">你的学习证据</p><h1>学习记录</h1><div class="stats"><div><strong>${attemptedCount}</strong><span>已练习题目</span></div><div><strong>${independent}</strong><span>独立通过</span></div><div><strong>${mastered}</strong><span>巩固通过小关</span></div></div><section class="panel"><h2>保存与迁移</h2><p>记录保存在当前浏览器，不会自动跨设备同步。换设备时可导出 JSON 存档，再在另一台设备导入；导入会合并已有记录。</p><div class="profile-actions"><button class="button primary" id="export-progress">导出学习存档</button><label class="button secondary file-label">导入学习存档<input id="import-progress" type="file" accept=".json,application/json"></label></div><p role="status">${escapeHtml(state.message)}</p></section></main>`);
}

function render() {
  app.innerHTML = state.view === 'map' ? mapView() : state.view === 'lesson' ? lessonView() : state.view === 'question' ? questionView() : state.view === 'review' ? reviewView() : profileView();
  bind();
}

function bind() {
  app.querySelector('#answer-input')?.addEventListener('input', (event) => { state.input = event.target.value; });
  const search = app.querySelector('#lesson-search');
  let composing = false;
  const updateSearch = () => {
    state.filter = search.value;
    // Keep the input node, focus and selection intact; only replace results.
    app.querySelector('.map-list').innerHTML = mapResults();
  };
  search?.addEventListener('compositionstart', () => { composing = true; });
  search?.addEventListener('compositionend', () => {
    composing = false;
    updateSearch();
  });
  search?.addEventListener('input', (event) => {
    if (!composing && !event.isComposing) updateSearch();
  });
  app.querySelectorAll('input[name="answer"]').forEach((input) => input.addEventListener('change', () => {
    state.selected = [...app.querySelectorAll('input[name="answer"]:checked')].map((item) => Number(item.value));
  }));
  app.querySelectorAll('[data-move]').forEach((button) => button.addEventListener('click', () => {
    const [position, direction] = button.dataset.move.split(':');
    const from = Number(position);
    const to = from + (direction === 'up' ? -1 : 1);
    [state.order[from], state.order[to]] = [state.order[to], state.order[from]];
    render();
  }));
  app.querySelectorAll('[data-hint]').forEach((button) => button.addEventListener('click', () => {
    state.hintCount = Math.max(state.hintCount, Number(button.dataset.hint));
    updateRecord(state.currentQuestion.id, { hints: state.hintCount, lastActivity: Date.now() });
    render();
  }));
  app.querySelector('#show-explanation')?.addEventListener('click', () => {
    state.hintCount = state.currentQuestion.hints.length + 1;
    updateRecord(state.currentQuestion.id, { hints: state.hintCount, lastActivity: Date.now() });
    render();
  });
  app.querySelector('#submit-answer')?.addEventListener('click', () => {
    const q = state.currentQuestion;
    let raw = q.kind === 'input' ? app.querySelector('#answer-input')?.value : q.kind === 'order' ? state.order.slice() : state.selected.slice();
    if ((q.kind === 'choice' || q.kind === 'multi') && !raw.length || q.kind === 'input' && !String(raw || '').trim()) {
      state.feedback = { correct: false, message: '先给出你的判断；也可以查看提示。' };
      render();
      return;
    }
    if (q.kind === 'choice') raw = raw[0];
    const updated = answerQuestion(q, recordFor(q.id), raw);
    const { correct, helped } = updated.attempts.at(-1);
    updateRecord(q.id, updated);
    state.feedback = { correct, message: correct ? helped ? '练习通过。本轮用过提示或已有作答，请换题独立验证，或三天后再来独立复答。' : '独立判断正确。' : '答案暂不符合题目条件。先看反馈，再尝试说明每个选项为什么成立或不成立。' };
    render();
  });
  app.querySelector('#jump-hints')?.addEventListener('click', () => {
    const panel = app.querySelector('.question-aside');
    panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    panel?.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
  });
  app.querySelector('#skip-question')?.addEventListener('click', () => {
    updateRecord(state.currentQuestion.id, { skipped: true });
    location.hash = `#/lesson/${state.currentQuestion.lessonId}`;
  });
  app.querySelector('#export-progress')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ format: 'network-mastery-v1', exportedAt: new Date().toISOString(), progress: state.progress }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'network-mastery-progress.json'; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  app.querySelector('#import-progress')?.addEventListener('change', async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) throw new Error('存档过大');
      const data = JSON.parse(await file.text());
      if (data.format !== 'network-mastery-v1' || !data.progress || typeof data.progress !== 'object' || Array.isArray(data.progress)) throw new Error('格式不正确');
      const imported = normalizeProgress(data.progress, new Set(state.questions.map((question) => question.id)));
      state.progress = mergeProgress(state.progress, imported);
      save();
      state.message = '存档已合并，原有学习记录已保留。';
    } catch { state.message = '导入失败：请选择本站导出的 JSON 存档。'; }
    render();
  });
}

async function init() {
  try {
    const [chapters, questions] = await Promise.all([
      fetch('./data/chapters.json').then((response) => { if (!response.ok) throw Error('课程目录加载失败'); return response.json(); }),
      fetch('./data/questions.json').then((response) => { if (!response.ok) throw Error('题库加载失败'); return response.json(); }),
    ]);
    state.chapters = chapters;
    state.questions = questions;
    load();
    route();
    window.addEventListener('hashchange', route);
  } catch (error) { app.innerHTML = `<main class="boot">加载失败：${escapeHtml(error.message)}。请刷新页面重试。</main>`; }
}

init();
