# JS 闯关

一个无需账号、无需 AI 的 JavaScript 学习网站。知识地图来自[现代 JavaScript 教程](https://zh.javascript.info/)；题目、提示与解析是本站原创内容。

## 本地预览

在仓库根目录运行：

```bash
npm ci
npm run build
python3 -m http.server 8000 --directory dist
```

然后打开 `http://localhost:8000`。不能直接用 `file://` 打开，因为网站会读取 JSON 内容文件和 Web Worker。

## 内容维护

- `dist/data/outline.json`：3 部分、27 章、174 节的目录与原文链接。
- `scripts/generate-questions.mjs`：题目、提示、解析、参考实现和判题条件的源文件。
- `dist/data/questions.json`：生成后的站点题库。
- `dist/runner-worker.js`：浏览器内独立运行用户代码的判题器。
- `src/dom-worker.mjs`：在独立 Worker 中运行 DOM 模拟题，避免无限循环卡住学习页面。

修改题库后运行 `npm run build`，再运行 `npm test`。题目 ID 一旦发布应保持稳定，以免已有学习记录失去对应关系。

`npm run audit` 会统计题量和每节是否有不同的复测题；`npm run audit:strict` 检查 1800 题、每节至少 6 题的完整内容目标。当前建设状态见 [PROJECT_STATUS.md](PROJECT_STATUS.md)。只有无提示、未看答案的首次作答通过才算“初步通过”；三天后再独立做对同节的另一题，才算“巩固通过”。

DOM 编码题在隔离的模拟 DOM 中判题，预览展示测试后的页面结构。布局尺寸、网络和部分浏览器原生行为需要单独设计题型验证，不能把模拟结果当成真实浏览器行为的全部证明。

## 部署

公开学习地址：<https://xunagent.github.io/javascript-mastery/>。源码位于 [xunagent/javascript-mastery](https://github.com/xunagent/javascript-mastery)。原 Sites 地址返回 Cloudflare 403，请使用 GitHub Pages 地址。

仓库的 Pages 来源已设为 **GitHub Actions**。之后向 `main` 推送时，工作流会通过内容检查并发布 `dist`。静态文件中的题目和测试可被访问者查看，因此本站用于自主学习，不作为保密考试系统。

学习记录保存在当前浏览器，也可在“学习记录”页面导出与导入 JSON 存档。

## 网络与 HTTP 闯关

网络课程入口：[网络闯关](https://xunagent.github.io/javascript-mastery/network/)。同一次构建会生成 `dist/network/`，不需要 AI、账号或后端服务。

- 10 大关、72 小关、1008 道原创题，每关 14 道；包含单选、多选、流程排序和填空推演。
- 每题三级提示、参考答案与解析；每小关有短讲、对应资料链接以及适用的《图解 HTTP》背景章节。书籍正文与图片未随站分发，现代协议以对应文档补充。
- 先独立通过 7 道不同题，三天后再用初始 7 道之外的 2 道独立复测。看提示或本轮答错后记为练习；该题三天无活动后可开启新的独立复答轮次。
- 错题、提示练习与跳过题进入待补强。进度保存在当前浏览器；导入另一设备存档会合并记录，不会自动云同步。网络课程与 JavaScript 课程的记录分开保存。

课程源码在 `network/content.mjs`，题库在 `network/questions.mjs` 与 `network/packs/`，界面与判题逻辑在 `network/site/`。运行 `npm run network:audit` 检查覆盖、题量、题型、答案、提示和选项唯一性。

浏览器回归检查：

```bash
npx playwright install --with-deps chromium
npm run build
npm run network:smoke
```

回归覆盖桌面与手机宽度、全部 72 个小关、四种答题交互、提示、错题、延迟复测、刷新持久化、无效存档拒绝及有效存档合并/导出。可用 `NETWORK_SCREENSHOTS=/tmp/network-shots npm run network:smoke` 输出检查截图。Pages 工作流发布前会执行相同检查。
