# HF-03 站点外壳与路由验收

日期：2026-10-25（Asia/Singapore）

## 交付范围

- 英文主站壳、七段首页、响应式样式和桌面/移动导航。
- 77 个已归档原型路径逐项映射、受控字典路由、占位页面、发布状态与 robots 索引策略。
- 与 `/zh/` 中文首页、`/story.html?lesson=...` 故事播放器和既有课程资源的静态隔离共存。
- `/stroke-order/`、`/pinyin-chart/`、静态 404、公开构建入口。

## 执行结果

| 检查 | 命令/操作 | 结果 |
|---|---|---|
| 完整测试集 | `npm test` | 64/64 通过；包含 HF-02 原有 58 项与 HF-03 新增 6 项 |
| 公开站构建 | `HF_BUILD_OUTPUT_DIR=/private/tmp/hf03-build-hanzifun npm run build:site` | 成功；601 个公开文件，映射原型 77 路径，生成 181 个 `noindex` 预览页 |
| 源码语法 | `node --check scripts/build-site.js`、`node --check site/routes.mjs`、`node --check site/site.mjs`、`node --check src/client/navigation.mjs`、`node --check tests/site-shell.test.mjs` | 全部通过 |
| 输出 HTML 检查 | 构建器及 `tests/site-shell.test.mjs` | 页面单 H1、站内链接、样式资源、状态页、robots 策略通过；未知路径输出静态 404，不使用 SPA 首页回退 |
| 路由策略 | 检查 `site/release.json`、输出 `route-manifest.json` 与样例 HTML | 原型路径基线 77；默认 preview；预览/计划页面为 `noindex,follow`，发布状态为 `index,follow`。`/blog/`、`/account/` 等样例输出 `noindex,follow` |
| 中文兼容 | 构建输出及 legacy 本地资源引用检查 | `/zh/` 与 `/story.html` 继续输出原中文页面；故事查询参数仍用于选择课程；旧课程资源维持旧 URL，英文新资源使用版本化 `/site-assets/` 前缀 |
| 响应式与交互 | 本地 Chromium 页面；视口 360、390、768、1100、1440，以及 720 CSS px 等效 200% 布局宽度 | 所有视口 `scrollWidth <= innerWidth`；减少动态效果为 `reduce` 时没有非零 transition；手机菜单/字典子导航、桌面字典下拉、Escape 关闭与焦点返回、键盘翻卡、FAQ 键盘展开通过 |

构建使用临时目录，未覆盖已有根目录 `dist/`。站点首页与移动导航展开状态通过 CUA 截图捕获并在本次验收会话中检查；截图工具只返回会话图像，本次没有把 PNG 另存到项目目录。

## 索引与发布边界

`site/release.json` 是页面 release 状态和索引策略的来源。未发布路由保持 `preview`/`planned` 并输出 `noindex,follow`；后续只有在页面达到发布条件后，才能显式切换到 `published` 并输出 `index,follow`。Phase 2/3 工具、Blog、账户说明等当前空壳未开放索引。robots.txt 不代替页面级 noindex 策略。

本次没有部署生产、开放索引、制作故事课程或接入账号/云同步/付款。HF-02 的人工英文释义/读音、拼音教学声调和音频听审仍是独立待验收项。
