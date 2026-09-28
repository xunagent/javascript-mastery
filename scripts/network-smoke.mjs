import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '../dist');
const shots = process.env.NETWORK_SCREENSHOTS;
if (shots) await mkdir(shots, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, `.${path}${path.endsWith('/') ? 'index.html' : ''}`);
    if (!file.startsWith(`${root}/`)) throw Error('Invalid path');
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}/network/`;
const questions = JSON.parse(await readFile(resolve(root, 'network/data/questions.json'), 'utf8'));
const chapters = JSON.parse(await readFile(resolve(root, 'network/data/chapters.json'), 'utf8'));
const storageKey = 'network-mastery-progress-v1';
let browser;
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const visit = async (hash) => { await page.goto(`${base}#/${hash}`); await page.locator('.topbar').waitFor(); };
    const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const submit = async (q) => {
      if (q.kind === 'choice') await page.locator(`input[name=answer][value="${q.answer}"]`).check();
      if (q.kind === 'multi') for (const index of q.answer) await page.locator(`input[name=answer][value="${index}"]`).check();
      if (q.kind === 'input') await page.locator('#answer-input').fill(String(q.answers[0]));
      if (q.kind === 'order') {
        const current = q.items.map((_, i) => i);
        for (let position = 0; position < q.answer.length; position++) {
          let from = current.indexOf(q.answer[position]);
          while (from > position) {
            await page.locator(`[data-move="${from}:up"]`).click();
            [current[from - 1], current[from]] = [current[from], current[from - 1]];
            from--;
          }
        }
      }
      await page.locator('#submit-answer').click();
      await page.locator('.feedback.correct').waitFor();
    };
    await visit('map');
    assert.equal(await page.locator('.lesson-card').count(), 72);
    await noOverflow();
    if (shots) await page.screenshot({ path: resolve(shots, `map-${viewport.width}.png`), fullPage: false });
    const searchInput = await page.locator('#lesson-search').elementHandle();
    await searchInput.focus();
    const ime = await context.newCDPSession(page);
    for (const text of ['h', 'huan', '缓存']) {
      await ime.send('Input.imeSetComposition', { text, selectionStart: text.length, selectionEnd: text.length });
      assert.equal(await searchInput.evaluate((input) => input.isConnected && document.activeElement === input), true, 'IME must retain its original focused input');
      assert.equal(await page.locator('.lesson-card').count(), 72, 'do not filter unfinished composition');
    }
    await ime.send('Input.insertText', { text: '缓存' });
    assert.equal(await searchInput.inputValue(), '缓存');
    const cacheMatches = chapters.flatMap((chapter) => chapter.lessons.filter((lesson) => `${lesson.title} ${lesson.goal} ${chapter.title}`.includes('缓存'))).length;
    assert.equal(await page.locator('.lesson-card').count(), cacheMatches, 'filter committed Chinese text');
    await searchInput.fill('');
    await ime.send('Input.imeSetComposition', { text: 'zheng', selectionStart: 5, selectionEnd: 5 });
    await ime.send('Input.imeSetComposition', { text: '', selectionStart: 0, selectionEnd: 0 });
    assert.equal(await searchInput.inputValue(), '');
    assert.equal(await page.locator('.lesson-card').count(), 72, 'cancelled composition restores the full map');
    await ime.detach();
    await page.locator('#lesson-search').fill('CORS');
    assert.equal(await searchInput.evaluate((input) => input.isConnected && document.activeElement === input), true, 'ordinary typing also retains the input node');
    assert.ok(await page.locator('.lesson-card').count() > 0);
    assert.ok(await page.locator('.lesson-card').count() < 72);

    for (const chapter of chapters) {
      for (const lesson of chapter.lessons) {
        await visit(`lesson/${lesson.id}`);
        assert.equal(await page.locator('.question-list a').count(), 14);
        assert.equal(await page.locator('.resources a').getAttribute('href'), lesson.source);
        await noOverflow();
      }
    }

    for (const kind of ['choice', 'multi', 'order', 'input']) {
      const q = questions.find((item) => item.kind === kind);
      await visit(`question/${q.id}`);
      await noOverflow();
      await submit(q);
      const record = await page.evaluate(({ key, id }) => JSON.parse(localStorage.getItem(key))[id], { key: storageKey, id: q.id });
      assert.equal(record.attempts.at(-1).independent, true, `${kind} independent grade`);
      await page.reload();
      await page.locator('.topbar').waitFor();
      assert.match(await page.locator('.question-list a.current').innerText(), /独立通过/);
    }

    const q = questions.find((item) => item.lessonId === 'g08-l04' && item.kind === 'choice');
    await visit(`question/${q.id}`);
    await page.locator(`input[name=answer][value="${(q.answer + 1) % q.options.length}"]`).check();
    await page.locator('#submit-answer').click();
    await page.locator('.feedback.incorrect').waitFor();
    assert.equal(await page.locator('.feedback').innerText().then((text) => text.includes(q.explanation)), false);
    for (let hint = 1; hint <= 3; hint++) await page.locator(`[data-hint="${hint}"]`).click();
    assert.equal(await page.locator('.hint p').count(), 3);
    await submit(q);
    assert.match(await page.locator('.feedback').innerText(), /练习通过/);
    if (shots) await page.screenshot({ path: resolve(shots, `question-${viewport.width}.png`), fullPage: false });
    await visit('review');
    assert.ok((await page.locator('.review-row').allTextContents()).some((text) => text.includes(q.title)));

    const numeric = questions.find((item) => item.kind === 'input' && item.id !== questions.find((item) => item.kind === 'input').id);
    await visit(`question/${numeric.id}`);
    await page.locator('#answer-input').fill('123');
    await page.locator('[data-hint="1"]').click();
    assert.equal(await page.locator('#answer-input').inputValue(), '123');

    const lesson = 'g10-l06';
    const candidates = questions.filter((item) => item.lessonId === lesson);
    const old = Date.now() - 3 * 86400000 - 10000;
    await page.evaluate(({ key, ids, at }) => {
      const progress = JSON.parse(localStorage.getItem(key));
      for (const id of ids) progress[id] = { hints: 0, attempts: [{ at, correct: true, independent: true, helped: false }] };
      localStorage.setItem(key, JSON.stringify(progress));
    }, { key: storageKey, ids: candidates.slice(0, 7).map((item) => item.id), at: old });
    await page.reload();
    await visit('review');
    assert.ok((await page.locator('.review-row').allTextContents()).some((text) => text.includes('独立排障结业题')));
    await visit(`lesson/${lesson}`);
    assert.match(await page.locator('.aside-box').first().innerText(), /到期复测/);
    const reviewLink = await page.locator('.aside-box .button.primary').getAttribute('href');
    assert.ok(candidates.slice(7).some((item) => reviewLink.endsWith(item.id)));
    for (const reviewQuestion of candidates.slice(7, 9)) { await visit(`question/${reviewQuestion.id}`); await submit(reviewQuestion); }
    await visit(`lesson/${lesson}`);
    assert.match(await page.locator('.aside-box').first().innerText(), /巩固通过/);

    await visit('profile');
    const before = await page.evaluate((key) => localStorage.getItem(key), storageKey);
    await page.locator('#import-progress').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'network-mastery-v1', progress: { [q.id]: { attempts: 'bad' } } })) });
    await page.getByText('导入失败：请选择本站导出的 JSON 存档。').waitFor();
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), storageKey), before);
    const importedId = questions.find((item) => !JSON.parse(before)[item.id]).id;
    await page.locator('#import-progress').setInputFiles({ name: 'valid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'network-mastery-v1', progress: { [importedId]: { hints: 0, attempts: [], skipped: true } } })) });
    await page.getByText('存档已合并，原有学习记录已保留。').waitFor();
    const merged = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
    assert.ok(merged[importedId].skipped);
    assert.ok(merged[q.id].attempts.length);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#export-progress').click();
    const download = await downloadPromise;
    const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
    assert.equal(exported.format, 'network-mastery-v1');
    assert.deepEqual(exported.progress, merged);
    await visit('question/missing');
    assert.match(await page.locator('main').innerText(), /没有找到/);
    await page.goto(`${base}#/%E0%A4%A`);
    await page.locator('.lesson-card').first().waitFor();
    assert.deepEqual(errors, []);
    console.log(`Network browser checks passed at ${viewport.width}px: 72 lessons, all answer types, hints, review, persistence, import/export, deep links.`);
    await context.close();
  }
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}
