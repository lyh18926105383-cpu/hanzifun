# HF-13 / HF-14入门索引验证 · 2026-10-31

主目录main，基线226e88c；本轮候选`phase-2-editorial-starter-2026-10-31`，**未commit/push/部署**。HF-13当前范围本地Completed/PASS；HF-14仅入门索引子项完成。Owner已对[三篇审读全文](acceptance/hf13-editorial-review.md)回复“没问题”，决定逐篇绑定正文SHA-256。审核与部署授权分别记录。

## 交付与证据

- 三篇正式文章：文化/商务/家庭各一篇，每篇关联3–6个已批准字与真实卡组；真实AI作者署名、Owner审核者、固定日期、来源和canonical。保留已有两篇指南，首页/Blog/搜索可发现新文章；静态正文与链接无JS可读。
- 文件式draft/reviewed/published/archived schema；草稿只在local/staging显示完整审读正文；未批准/过期hash不能发布。引用/日期/slug/字卡/卡组/image alt和Article JSON-LD均校验。测试中的假人审只留fixture，正式批准来自本会话真实答复。
- 家庭`休山水火木月`与课堂`中秋月饼团圆`，各6张卡，复用已签发的读音、英义、助记。主入口/子页、纸型说明、在线练习与完整归属已接通。
- HF-14 `/dictionary/top-100/`正好100个已批准核心字，5主题分组，明确非词频榜/非HSK清单，稳定字ID和历史卡组不变。

## 命令与结果

| 检查 | 实际结果 |
|---|---|
| `HF_SITE_ENV=production npm run build:site` | PASS，2828文件 / 413英文页，399 index / 14 noindex |
| `node scripts/validate-seo-quality.mjs` | PASS，Sitemap399，414个JSON-LD，errors=[] |
| `npm test` | 174/174 PASS，fail/skip/cancel=0；旧163项+本轮11项 |
| 重复生产构建 | 2828文件逐字节一致 |
| `node scripts/verify-editorial-browser.mjs` | Chrome 156.0.8078.79：8组实际行为、7类axe零违规、35档布局、页面错误0 |
| 本地Workers Assets | Wrangler4.153.0，7页200/index/canonical，旧练习纸301保留query，404，旧MP3请求，共10项通过；不冒充206（实际200） |
| 本地静态回滚/恢复 | 从git基线重建旧393包，隔离目录退回再恢复399包，全部hash匹配，2.793秒；未切生产/未操作用户存储 |
| `git diff --check` | PASS（最终源码指纹526文件无漂移） |

浏览器每篇使用独立访客上下文，真实走文章→字典→收藏→刷新保留→实际卡组全轮完成→等待原子落盘→刷新仍完成；不把乐观渲染当保存成功，也不因多个旅程共享日额度放宽调度器。最后重跑PASS覆盖已批准生产文章，早期脚本时点/隔离问题已修正，未改调度和Repository。

## 打印QA

[家庭A4](evidence/hf13/family-a4.pdf) · [家庭Letter](evidence/hf13/family-letter.pdf) · [课堂A4](evidence/hf13/classroom-a4.pdf) · [课堂Letter](evidence/hf13/classroom-letter.pdf)。四份均1页、尺寸匹配浏览器对应纸型（Chromium A4会有亚毫米取整）、6字和CC BY-SA归属完整。使用pypdf做NFKC规范化后核对汉字（系统楷体提取可能使用康熙部首码位），Poppler四份渲染逐份目视检查，无截断/缺字/重叠；屏幕桌面/手机截图随证据保存。

## 具体文件

- 输入：`content/editorial/{articles.json,article.schema.json,worksheets.json,owner-decisions-2026-10-31.json,README.md}`；`data/editorial/starter-100.json`。
- 实现：`site/editorial-workflow.mjs`、`site/pages/starter-100.mjs`；接入`site/editorial-content.mjs`、`site/seo.mjs`、`site/release.json`、`site/public/site-styles.css`、`scripts/build-site.js`、`scripts/validate-seo-quality.mjs`。
- 工具/测试：`scripts/review-editorial.mjs`、`scripts/verify-editorial-browser.mjs`、`tests/editorial-workflow.test.mjs`、`tests/starter-100.test.mjs`、`tests/seo-quality.test.mjs`。
- [摘要](evidence/hf13/summary.json)、[浏览器](evidence/hf13/verification.json)、[Workers](evidence/hf13/workers-http.json)、[构建/演练](evidence/hf13/preflight.json)、[本次发布包](releases/phase-2-editorial-starter-2026-10-31/manifest.json)、[剩余任务](REMAINING-TASKS-2026-10-31.md)。

## 边界与下一步

未修改故事课程/媒体/源字库音频/旧学习键或调度，未调用付费API，64词不动。已批准三篇不得未经复审改正文/引用。下一步从本release manifest、ACCEPTANCE和ROLLBACK进入HF-18核对实际生产与授权；本轮未重跑历史完整MVP/所有浏览器/真机/读屏/真实p75，不伪造24h/7d观察。HF-14全量、原HF-12四工具和Phase3仍未完成。
