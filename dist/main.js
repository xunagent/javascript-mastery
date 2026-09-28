import { reviewCandidates, questionStatus, lessonStatus, reviewOrigin, selectDiagnosticQuestions, isFirstAttemptIndependent } from './learning.mjs';

const app = document.querySelector('#app');
const state = { outline: [], questions: [], progress: {}, currentId: null, currentChapterId: null, diagnostic: null, draft: '', results: null, previewDoc: null, hintLevel: 0, reveal: false, busy: false, view: 'learn', filter: '', message: '' };
const STORAGE_KEY = 'js-mastery-progress-v1';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const allChapters = () => state.outline.flatMap((part) => part.chapters);
const allLessons = () => allChapters().flatMap((chapter) => chapter.lessons);
const questionForId = (id) => state.questions.find((question) => question.id === id);
const chapterForLesson = (lessonId) => allChapters().find((chapter) => chapter.lessons.some((lesson) => lesson.id === lessonId));
const lessonForId = (id) => allLessons().find((lesson) => lesson.id === id);
const questionsForChapter = (chapter) => state.questions.filter((question) => chapter.lessons.some((lesson) => lesson.id === question.lessonId));
const recordFor = (id) => state.progress[id] || {};

function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); }
  catch { state.message = '浏览器存储不可用，请导出学习记录保存。'; }
}

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) state.progress = parsed;
  } catch { state.progress = {}; }
}

function getStatus(question) {
  return questionStatus(question, state.progress, state.dueIds || new Set());
}

function getLessonStatus(lessonId) {
  return lessonStatus(lessonId, state.questions, state.progress, state.dueIds || new Set());
}

function recommend() {
  const due = reviewCandidates(state.questions, state.progress)[0];
  if (due) return due.variant;
  return state.questions.find((question) => !recordFor(question.id).attempts)
    || state.questions.find((question) => !recordFor(question.id).passed)
    || state.questions[0];
}

function navigate(view, targetId = null) {
  state.view = view;
  state.diagnostic = null;
  state.message = '';
  state.results = null;
  state.previewDoc = null;
  state.hintLevel = 0;
  state.reveal = false;
  if (view === 'question' && targetId) {
    state.currentId = targetId;
    state.draft = recordFor(targetId).draft ?? questionForId(targetId)?.starter ?? '';
    location.hash = `#/question/${encodeURIComponent(targetId)}`;
  } else if (view === 'chapter' && targetId) {
    state.currentChapterId = targetId;
    location.hash = `#/chapter/${encodeURIComponent(targetId)}`;
  } else {
    location.hash = `#/${view}`;
  }
  render();
}

function openDiagnostic(chapterId, index = 0) {
  location.hash = `#/diagnostic/${encodeURIComponent(chapterId)}/${index}`;
}

function syncRoute() {
  const diagnosticMatch = location.hash.match(/^#\/diagnostic\/([^/]+)\/(\d+)$/);
  if (diagnosticMatch) {
    const chapterId = decodeURIComponent(diagnosticMatch[1]);
    const chapter = allChapters().find((item) => item.id === chapterId);
    const questions = chapter ? selectDiagnosticQuestions(chapter, state.questions) : [];
    const index = Number(diagnosticMatch[2]);
    if (questions[index]) {
      state.view = 'diagnostic';
      state.diagnostic = { chapterId, index, ids: questions.map((question) => question.id) };
      state.currentId = questions[index].id;
      state.draft = recordFor(state.currentId).draft ?? questions[index].starter ?? '';
      state.results = null;
      state.previewDoc = null;
      state.hintLevel = 0;
      state.reveal = false;
      render();
      return;
    }
  }
  const match = location.hash.match(/^#\/question\/([^/]+)/);
  if (match) {
    const id = decodeURIComponent(match[1]);
    if (questionForId(id)) {
      state.view = 'question';
      state.diagnostic = null;
      if (state.currentId !== id) {
        state.currentId = id;
        state.draft = recordFor(id).draft ?? questionForId(id).starter ?? '';
        state.results = null;
        state.previewDoc = null;
        state.hintLevel = 0;
        state.reveal = false;
      }
      render();
      return;
    }
  }
  const chapterMatch = location.hash.match(/^#\/chapter\/([^/]+)/);
  if (chapterMatch) {
    const id = decodeURIComponent(chapterMatch[1]);
    if (allChapters().some((chapter) => chapter.id === id)) {
      state.currentChapterId = id;
      state.view = 'chapter';
      state.diagnostic = null;
      render();
      return;
    }
  }
  state.view = location.hash === '#/review' ? 'review' : location.hash === '#/profile' ? 'profile' : 'learn';
  state.diagnostic = null;
  render();
}

function renderHeader() {
  const answered = state.questions.filter((q) => recordFor(q.id).attempts).length;
  return `<header class="topbar"><a class="brand" href="#/learn" aria-label="JS 闯关首页"><span class="brand-mark">JS</span><span>JS 闯关</span></a><nav aria-label="主导航"><a href="#/learn" class="${['learn','chapter','question','diagnostic'].includes(state.view) ? 'active' : ''}">知识地图</a><a href="#/review" class="${state.view === 'review' ? 'active' : ''}">复习中心</a><a href="#/profile" class="${state.view === 'profile' ? 'active' : ''}">学习记录</a><a href="./typescript/">TypeScript ↗</a><a href="./network/">网络与 HTTP ↗</a></nav><div class="header-progress">已练习 <strong>${answered}</strong> / ${state.questions.length} 题</div></header>`;
}

function renderMap() {
  const next = recommend();
  const open = state.questions.filter((q) => recordFor(q.id).independent).length;
  const due = reviewCandidates(state.questions, state.progress).length;
  return `<main class="main map-page"><div class="page-heading"><div><p class="eyebrow">JavaScript 系统训练</p><h1>知识地图</h1><p>按章节诊断、动手验证，再用新题复测。已开放的题目可以直接练习。</p></div><div class="headline-stats"><div><strong>${open}</strong><span>初步通过</span></div><div><strong>${due}</strong><span>待复测</span></div></div></div>${next ? `<section class="continue-card"><div><p class="eyebrow">接下来</p><h2>${escapeHtml(next.title)}</h2><p>${escapeHtml(lessonForId(next.lessonId)?.title || '')} · ${escapeHtml(next.difficulty)}</p></div><button class="primary" data-open="${escapeHtml(next.id)}">继续练习 <span aria-hidden="true">→</span></button></section>` : ''}<div class="map-tools"><label for="map-search">查找章节或知识点</label><input id="map-search" type="search" placeholder="例如：闭包、数组、Promise" value="${escapeHtml(state.filter)}" /></div><div class="part-list">${state.outline.map((part, index) => renderPart(part, index)).join('')}</div></main>`;
}

function renderPart(part, index) {
  const chapters = part.chapters.filter((chapter) => !state.filter || `${chapter.title} ${chapter.lessons.map((l) => l.title).join(' ')}`.toLowerCase().includes(state.filter.toLowerCase()));
  if (!chapters.length) return '';
  return `<section class="part"><div class="part-heading"><span class="part-index">0${index + 1}</span><div><h2>${escapeHtml(part.name)}</h2><p>${part.chapters.length} 章 · ${part.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)} 节</p></div></div><div class="chapter-grid">${chapters.map(renderChapter).join('')}</div></section>`;
}

function renderChapter(chapter) {
  const questions = questionsForChapter(chapter);
  const lessonCount = chapter.lessons.length;
  const mastered = chapter.lessons.filter((lesson) => getLessonStatus(lesson.id) === '巩固通过').length;
  const lessonPreviews = chapter.lessons.slice(0, 4).map((l) => escapeHtml(l.title)).join(' · ');
  return `<article class="chapter-card"><div class="chapter-card-top"><span>${lessonCount} 小节</span><span>${questions.length ? `${mastered}/${lessonCount} 节巩固通过` : '内容建设中'}</span></div><h3>${escapeHtml(chapter.title)}</h3><p class="chapter-preview">${lessonPreviews}${lessonCount > 4 ? '…' : ''}</p><div class="chapter-actions"><button class="text-button" data-chapter="${escapeHtml(chapter.id)}">查看本章 <span aria-hidden="true">→</span></button><a href="${escapeHtml(chapter.url)}" target="_blank" rel="noopener noreferrer">查看教程</a></div></article>`;
}

function renderChapterDetail() {
  const chapter = allChapters().find((item) => item.id === state.currentChapterId);
  if (!chapter) return renderMap();
  const mastered = chapter.lessons.filter((lesson) => getLessonStatus(lesson.id) === '巩固通过').length;
  return `<main class="main chapter-page"><div class="exercise-breadcrumb"><a href="#/learn">知识地图</a><span>/</span><span>${escapeHtml(chapter.title)}</span></div><div class="chapter-detail-heading"><div><p class="eyebrow">${chapter.lessons.length} 个知识小节</p><h1>${escapeHtml(chapter.title)}</h1><p>逐节验证理解，遇到薄弱点可返回教程查阅。</p></div><div class="chapter-detail-stat"><strong>${mastered}/${chapter.lessons.length}</strong><span>小节巩固通过</span></div></div><div class="lesson-list">${chapter.lessons.map((lesson, index) => {
    const items = state.questions.filter((question) => question.lessonId === lesson.id);
    const passed = items.filter((question) => recordFor(question.id).independent).length;
    const next = items.find((question) => !recordFor(question.id).attempts)
      || items.find((question) => !recordFor(question.id).passed)
      || items[0];
    return `<article class="lesson-row"><div class="lesson-number">${String(index + 1).padStart(2, '0')}</div><div class="lesson-details"><h2>${escapeHtml(lesson.title)} <span class="lesson-status">${getLessonStatus(lesson.id)}</span></h2><p>${items.length ? `${items.length} 道题 · ${passed} 道初步通过` : '题目建设中'}</p></div><div class="lesson-actions">${next ? `<button class="text-button" data-open="${escapeHtml(next.id)}">${next === items[0] && !recordFor(next.id).attempts ? '开始练习' : '继续练习'} →</button>` : ''}<a href="${escapeHtml(lesson.url)}" target="_blank" rel="noopener noreferrer">阅读原文 ↗</a></div></article>`;
  }).join('')}</div></main>`;
}

function renderQuestion() {
  const question = questionForId(state.currentId);
  if (!question) return renderMap();
  const chapter = chapterForLesson(question.lessonId);
  const lesson = lessonForId(question.lessonId);
  const related = state.questions.filter((q) => q.lessonId === question.lessonId);
  const index = related.findIndex((q) => q.id === question.id);
  const status = getStatus(question);
  const stored = recordFor(question.id);
  const nextQuestion = state.questions[state.questions.findIndex((item) => item.id === question.id) + 1];
  const summary = state.results ? `<div class="result-summary ${state.results.every((r) => r.passed) ? 'passed' : 'failed'}">${state.results.every((r) => r.passed) ? '全部测试通过' : `${state.results.filter((r) => r.passed).length}/${state.results.length} 项通过`}</div><ul class="test-results">${state.results.map((r) => `<li class="${r.passed ? 'passed' : 'failed'}"><span>${r.passed ? '✓' : '×'} ${escapeHtml(r.name)}</span>${r.message ? `<p>${escapeHtml(r.message)}</p>` : ''}</li>`).join('')}</ul>${state.results.every((r) => r.passed) && nextQuestion ? `<button class="primary next-question" data-open="${escapeHtml(nextQuestion.id)}">下一题 →</button>` : ''}` : '<p class="quiet">运行后会在这里显示每项检查的结果。</p>';
  return `<main class="main exercise-page"><div class="exercise-breadcrumb"><a href="#/learn">知识地图</a><span>/</span><a href="#/chapter/${encodeURIComponent(chapter?.id || '')}">${escapeHtml(chapter?.title || '')}</a><span>/</span><span>${escapeHtml(lesson?.title || '')}</span></div><div class="exercise-layout"><section class="exercise-main"><div class="question-heading"><div class="question-tags"><span>${escapeHtml(question.difficulty)}</span><span>${question.exerciseType === 'repair' ? '调试题' : question.kind === 'code' ? '编码题' : '判断题'}</span><span>${escapeHtml(status)}</span></div><h1>${escapeHtml(question.title)}</h1><p class="question-count">本小节第 ${index + 1} / ${related.length} 题</p></div><div class="problem-text">${question.prompt.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>${question.example ? `<pre class="example"><code>${escapeHtml(question.example)}</code></pre>` : ''}${question.kind === 'code' ? `<div class="editor-heading"><label for="answer-code">你的代码</label><span>JavaScript</span></div><textarea id="answer-code" class="code-editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off">${escapeHtml(state.draft)}</textarea><div class="editor-actions"><button class="primary" id="run-code" ${state.busy ? 'disabled' : ''}>${state.busy ? '运行中…' : '运行测试'}</button><button class="secondary" id="reset-code">重置代码</button></div>` : `<fieldset class="choices"><legend>选择你的答案</legend>${question.options.map((option, optionIndex) => `<label><input type="radio" name="choice" value="${optionIndex}" ${String(stored.draft) === String(optionIndex) ? 'checked' : ''}/><span>${escapeHtml(option)}</span></label>`).join('')}</fieldset><button class="primary choice-submit" id="submit-choice">提交答案</button>`}<div class="feedback" aria-live="polite"><h2>测试反馈</h2>${summary}</div></section><aside class="exercise-aside"><div class="aside-card"><h2>学习支持</h2><p>先独立尝试，卡住时逐层查看提示。</p>${question.hints.map((hint, hintIndex) => `<div class="hint-row">${state.hintLevel > hintIndex ? `<p><strong>提示 ${hintIndex + 1}</strong><br/>${escapeHtml(hint)}</p>` : `<button data-hint="${hintIndex + 1}" ${state.hintLevel < hintIndex ? 'disabled' : ''}>查看提示 ${hintIndex + 1}</button>`}</div>`).join('')}<button class="reveal-button" id="reveal-answer">${state.reveal ? '收起解析' : '查看解析与参考答案'}</button>${state.reveal ? `<div class="explanation"><p>${escapeHtml(question.explanation)}</p>${question.solution ? `<pre><code>${escapeHtml(question.solution)}</code></pre>` : ''}</div>` : ''}</div><div class="aside-card"><h2>继续学习</h2><a href="${escapeHtml(lesson?.url || chapter?.url || '#')}" target="_blank" rel="noopener noreferrer">阅读教程：${escapeHtml(lesson?.title || '')} ↗</a><div class="question-list">${related.map((q) => `<button class="${q.id === question.id ? 'selected' : ''}" data-open="${escapeHtml(q.id)}"><span>${escapeHtml(q.title)}</span><small>${getStatus(q)}</small></button>`).join('')}</div></div></aside></div></main>`;
}

function renderReview() {
  const due = reviewCandidates(state.questions, state.progress).map(({ variant }) => variant);
  const weak = state.questions.filter((question) => ['需补齐', '练习中'].includes(getStatus(question)));
  return `<main class="main simple-page"><p class="eyebrow">巩固理解</p><h1>复习中心</h1><p>完成题目后会按学习记录安排复测。查看过解析的题目，需要用新题独立验证。</p><div class="review-grid"><section class="review-panel"><h2>到期复测 <span>${due.length}</span></h2>${due.length ? due.map(renderReviewItem).join('') : '<p class="quiet">目前没有到期题目。</p>'}</section><section class="review-panel"><h2>需要补齐 <span>${weak.length}</span></h2>${weak.length ? weak.map(renderReviewItem).join('') : '<p class="quiet">目前没有待补齐的题目。</p>'}</section></div></main>`;
}

function renderReviewItem(question) {
  return `<button class="review-item" data-open="${escapeHtml(question.id)}"><span>${escapeHtml(question.title)}<small>${escapeHtml(lessonForId(question.lessonId)?.title || '')}</small></span><span aria-hidden="true">→</span></button>`;
}

function renderProfile() {
  const attempted = state.questions.filter((q) => recordFor(q.id).attempts).length;
  const independent = state.questions.filter((q) => recordFor(q.id).independent).length;
  const reviewed = state.questions.filter((q) => recordFor(q.id).reviewedWith).length;
  return `<main class="main simple-page"><p class="eyebrow">你的学习证据</p><h1>学习记录</h1><div class="profile-stats"><div><strong>${attempted}</strong><span>已练习</span></div><div><strong>${independent}</strong><span>初步通过</span></div><div><strong>${reviewed}</strong><span>巩固通过</span></div></div><section class="profile-panel"><h2>保存与迁移</h2><p>进度保存在当前浏览器。导出存档可以在其他设备上继续学习。</p><div class="profile-actions"><button class="primary" id="export-progress">导出学习存档</button><label class="secondary file-label">导入学习存档<input id="import-progress" type="file" accept="application/json,.json" /></label></div><p class="form-message" role="status">${escapeHtml(state.message)}</p></section></main>`;
}

function render() {
  state.dueIds = new Set(reviewCandidates(state.questions, state.progress).map(({ variant }) => variant.id));
  app.innerHTML = renderHeader() + (['question','diagnostic'].includes(state.view) ? renderQuestion() : state.view === 'chapter' ? renderChapterDetail() : state.view === 'review' ? renderReview() : state.view === 'profile' ? renderProfile() : renderMap());
  if (state.view === 'chapter') decorateChapterDiagnostic();
  if (['question','diagnostic'].includes(state.view)) decorateDomQuestion();
  if (state.view === 'diagnostic') decorateDiagnosticQuestion();
  bindEvents();
}

function decorateDomQuestion() {
  const question = questionForId(state.currentId);
  if (question?.runtime !== 'dom') return;
  const panel = document.createElement('section');
  panel.className = 'dom-preview-panel';
  panel.innerHTML = '<h2>DOM 模拟预览</h2><iframe id="dom-preview" title="DOM 模拟结果预览" sandbox=""></iframe>';
  app.querySelector('.editor-actions').after(panel);
  panel.querySelector('iframe').srcdoc = state.previewDoc || question.fixture;
  const typeTag = app.querySelector('.question-tags span:nth-child(2)');
  if (typeTag) typeTag.textContent = '页面交互';
}

function decorateChapterDiagnostic() {
  const chapter = allChapters().find((item) => item.id === state.currentChapterId);
  const questions = selectDiagnosticQuestions(chapter, state.questions);
  if (!questions.length) return;
  const attempted = questions.filter((question) => recordFor(question.id).attempts).length;
  const independent = questions.filter((question) => recordFor(question.id).independent).length;
  const firstUnanswered = questions.findIndex((question) => !recordFor(question.id).attempts);
  const panel = document.createElement('section');
  panel.className = 'diagnostic-panel';
  panel.innerHTML = `<div><p class="eyebrow">章前诊断</p><h2>${attempted}/${questions.length} 道代表题已完成</h2><p>${independent} 道独立通过。诊断只抽查部分知识；未抽查的小节仍需逐节验证。</p></div>${firstUnanswered >= 0 ? `<button class="primary" data-diagnostic="${escapeHtml(chapter.id)}" data-diagnostic-index="${firstUnanswered}">${attempted ? '继续诊断' : '开始诊断'} →</button>` : `<span class="diagnostic-complete">诊断已完成 · 继续逐节练习</span>`}`;
  app.querySelector('.lesson-list').before(panel);
}

function decorateDiagnosticQuestion() {
  const diagnostic = state.diagnostic;
  app.querySelector('.next-question')?.remove();
  const banner = document.createElement('div');
  banner.className = 'diagnostic-banner';
  banner.textContent = `章前诊断 · 第 ${diagnostic.index + 1} / ${diagnostic.ids.length} 题`;
  app.querySelector('.question-heading').before(banner);
  if (!state.results) return;
  const button = document.createElement('button');
  button.className = 'primary next-question';
  button.id = diagnostic.index + 1 < diagnostic.ids.length ? 'diagnostic-next' : 'diagnostic-finish';
  button.textContent = diagnostic.index + 1 < diagnostic.ids.length ? '下一道诊断题 →' : '查看本章结果 →';
  app.querySelector('.feedback').append(button);
}

function updateRecord(id, patch) {
  state.progress[id] = { ...recordFor(id), ...patch };
  saveProgress();
}

function processSuccess(question) {
  const previous = recordFor(question.id);
  const independent = isFirstAttemptIndependent(previous, state.hintLevel, state.reveal);
  const origin = independent ? reviewOrigin(question, state.questions, state.progress) : null;
  updateRecord(question.id, { attempts: (previous.attempts || 0) + 1, passed: true, independent: previous.independent || independent, independentAt: independent && !previous.independent ? Date.now() : previous.independentAt, reviewedWith: origin?.id || previous.reviewedWith, draft: state.draft, lastAt: Date.now() });
  if (origin) updateRecord(origin.id, { reviewedWith: question.id });
}

function processFailure(question) {
  const previous = recordFor(question.id);
  updateRecord(question.id, { attempts: (previous.attempts || 0) + 1, passed: false, independent: false, independentAt: null, reviewedWith: null, draft: state.draft, lastAt: Date.now() });
  if (previous.reviewedWith) updateRecord(previous.reviewedWith, { reviewedWith: null });
}

function runCode(source, checks, timeout = 1800) {
  return new Promise((resolve) => {
    const worker = new Worker('./runner-worker.js');
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(value);
    };
    const timer = setTimeout(() => finish([{ name: '执行时间', passed: false, message: '代码运行超时。请检查是否存在无限循环。' }]), timeout);
    worker.onmessage = (event) => finish(event.data.results);
    worker.onerror = (event) => finish([{ name: '运行环境', passed: false, message: event.message || '运行失败' }]);
    worker.postMessage({ source, checks });
  });
}

function runDomCode(source, question, timeout = 2500) {
  return new Promise((resolve) => {
    const worker = new Worker('./dom-worker.js');
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(value);
    };
    const timer = setTimeout(() => finish({ results: [{ name: '执行时间', passed: false, message: '页面代码运行超时。请检查循环或异步操作。' }], preview: question.fixture }), timeout);
    worker.onmessage = (event) => finish(event.data);
    worker.onerror = (event) => finish({ results: [{ name: '运行环境', passed: false, message: event.message || '运行失败' }], preview: question.fixture });
    worker.postMessage({ source, fixture: question.fixture, checks: question.checks });
  });
}

function bindEvents() {
  app.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => navigate('question', button.dataset.open)));
  app.querySelectorAll('[data-chapter]').forEach((button) => button.addEventListener('click', () => navigate('chapter', button.dataset.chapter)));
  app.querySelectorAll('[data-diagnostic]').forEach((button) => button.addEventListener('click', () => openDiagnostic(button.dataset.diagnostic, Number(button.dataset.diagnosticIndex || 0))));
  app.querySelector('#diagnostic-next')?.addEventListener('click', () => openDiagnostic(state.diagnostic.chapterId, state.diagnostic.index + 1));
  app.querySelector('#diagnostic-finish')?.addEventListener('click', () => navigate('chapter', state.diagnostic.chapterId));
  const search = app.querySelector('#map-search');
  if (search) search.addEventListener('input', (event) => {
    state.filter = event.target.value;
    const start = event.target.selectionStart;
    render();
    const input = app.querySelector('#map-search');
    input.focus();
    input.setSelectionRange(start, start);
  });
  const editor = app.querySelector('#answer-code');
  if (editor) editor.addEventListener('input', (event) => {
    state.draft = event.target.value;
    updateRecord(state.currentId, { ...recordFor(state.currentId), draft: state.draft });
  });
  app.querySelector('#reset-code')?.addEventListener('click', () => {
    const question = questionForId(state.currentId);
    state.draft = question.starter;
    state.results = null;
    updateRecord(question.id, { draft: state.draft });
    render();
  });
  app.querySelector('#run-code')?.addEventListener('click', async () => {
    const question = questionForId(state.currentId);
    const submittedSource = state.draft;
    state.busy = true;
    render();
    const outcome = question.runtime === 'dom' ? await runDomCode(submittedSource, question) : { results: await runCode(submittedSource, question.checks) };
    const results = outcome.results;
    state.busy = false;
    if (state.currentId !== question.id || !['question','diagnostic'].includes(state.view)) { render(); return; }
    state.results = results;
    state.previewDoc = outcome.preview || null;
    if (results.every((result) => result.passed)) processSuccess(question); else processFailure(question);
    render();
  });
  app.querySelector('#submit-choice')?.addEventListener('click', () => {
    const chosen = app.querySelector('input[name="choice"]:checked');
    if (!chosen) return;
    const question = questionForId(state.currentId);
    state.draft = chosen.value;
    updateRecord(question.id, { draft: chosen.value });
    const passed = Number(chosen.value) === question.correct;
    state.results = [{ name: '答案', passed, message: passed ? '' : '答案不符。检查代码执行过程后再试。' }];
    if (passed) processSuccess(question); else processFailure(question);
    render();
  });
  app.querySelectorAll('[data-hint]').forEach((button) => button.addEventListener('click', () => {
    state.hintLevel = Math.max(state.hintLevel, Number(button.dataset.hint));
    updateRecord(state.currentId, { assisted: true });
    render();
  }));
  app.querySelector('#reveal-answer')?.addEventListener('click', () => { state.reveal = !state.reveal; if (state.reveal) updateRecord(state.currentId, { assisted: true }); render(); });
  app.querySelector('#export-progress')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ format: 'js-mastery-v1', exportedAt: new Date().toISOString(), progress: state.progress }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'js-mastery-progress.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  app.querySelector('#import-progress')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed.format !== 'js-mastery-v1' || !parsed.progress || typeof parsed.progress !== 'object' || Array.isArray(parsed.progress)) throw new Error('文件格式不正确');
      state.progress = Object.fromEntries(Object.entries(parsed.progress).filter(([id, entry]) => questionForId(id) && entry && typeof entry === 'object' && !Array.isArray(entry)));
      saveProgress();
      state.message = '存档已导入。';
    } catch { state.message = '导入失败：请选择本站导出的 JSON 存档。'; }
    render();
  });
}

async function init() {
  try {
    const [outline, questions] = await Promise.all([fetch('./data/outline.json').then((r) => r.json()), fetch('./data/questions.json').then((r) => r.json())]);
    state.outline = outline;
    const lessonOrder = new Map(allLessons().map((lesson, index) => [lesson.id, index]));
    state.questions = questions.sort((a, b) => lessonOrder.get(a.lessonId) - lessonOrder.get(b.lessonId));
    loadProgress();
    syncRoute();
    window.addEventListener('hashchange', syncRoute);
  } catch {
    app.innerHTML = '<main class="load-error"><h1>内容加载失败</h1><p>请刷新页面重试。</p></main>';
  }
}

init();
