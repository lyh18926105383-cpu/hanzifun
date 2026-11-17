# Pinyin 主工具与三个子页面｜本地验收（2026-11-17）

状态：**Local Completed / PASS，未 commit、未 push、未部署。** Owner明确选择“只完成本地改造与验收，暂不上线”；此前其他批次的发布授权不适用于本批。

## 已完成范围

- `/pinyin-chart/`：保留原 title、description、canonical 和已有音节锚点；按最新明确要求将 H1 改为 `Look up Pinyin`，一句话导语。声母在左、韵母在上，410 个合法音节、无效组合留空；搜索支持带调、数字调及 ü/v/u:，lu 与 lü 不混淆。选择音节打开声调面板；支持 Escape 关闭并恢复焦点。无视频。
- 主工具在 320×568、390×667、768×1024、1440×900 的首屏均能看到可操作音节，文档没有水平溢出；表格自身可滚动，表头和声母列固定。
- 主表下方有独立免费打印模块，完整说明书桌、笔记本、课堂和离屏学习价值；免费、无需账号或支付。A4 打印为 5 页，按书写开头分 24 组，包含全部 410 音节与 1323 个已收录声调形式。打印隐藏导航和交互控件。
- `/pinyin-chart/chinese-to-pinyin/`：简繁汉字转拼音，带调/数字/无调三种格式，拼音与汉字对照、多音字人工校正、复制/清空及错误重试。pinyin-pro 3.29.5 精确锁定，转换词典只在首次转换时从本站按需加载；文本在设备中处理，不上传或保存。
- `/pinyin-chart/tones/`：四声曲线与已有 ma 音节录音、轻声词境说明和设备中文语音示例、仅用已有四声录音的听辨练习。可重听、作答、查看反馈与计分、下一题及重置；不使用麦克风或语音评分。
- `/pinyin-chart/tone-marks/`：数字与带调拼音转换、移除声调、插入带调字母及复制；支持相邻数字音节、大小写、ü/v/u:、0/5 轻声，不能确定的字符串保留并提示。
- 四页互链，三个子页有独立 title/description/canonical 和共享面包屑。沿用发布门控：**新增三个子页在生产模式候选中仍为 preview/noindex**，未放入 Sitemap；本地预览全部 noindex。未来上线需单独确认发布和索引状态，不能把本次本地验收当作已发布。

主页面保留元数据：

```text
Title: What Is Pinyin? Full Mandarin Chart With Audio
Description: What is pinyin? It is the official Romanization of Mandarin. See all 410 syllables on one chart with pronunciation and printable options.
Canonical: https://hanzifun.online/pinyin-chart/
H1（Owner最新覆盖）: Look up Pinyin
Lead: Find any Mandarin syllable and listen to its tones.
```

## 实际验证

- `npm test`：**208/208 PASS**。新增测试覆盖全部 1323 个声调形式往返、lü/lu、非法数字/英文混排保全、真实简繁/多音字语境和校正输出、录音失败不伪造设备语音听辨、路由/SEO/打印契约。旧 HSK 测试所需 `.cache/hf07/HSK-2015.xlsx` 与 `.cache/hf02/cedict.gz` 从原主目录已有文件恢复到忽略缓存，不改 HSK 数据。
- 本地及生产模式各构建 **3644 个文件、420 英文页**；全站 SEO 两模式 `errors=[]`。生产模式为 12 个 noindex 页、408 个 Sitemap URL；核心 365 页保持。
- 实际浏览器：主表四档、三个子页各 390/1440 两档，全部无文档水平溢出；主表最小档首行底部 442px，小于 568px 视高。手机弹层可在内部滚动，未越出左右视口。
- 四次全页 axe（WCAG 2 A/AA、2.1 AA）零违规，其中主表以音调弹层打开状态检查。打印模块文字对比度和手机工具标题覆盖问题已修正后复检。
- 完成主表查找、ü 别名/lu 区别、旧 lü 锚点、无结果、重置、Escape/焦点；汉字三种输出、繁体、多音字更正、标点换行、复制、清空、输入变更禁用旧复制；声调位置、反向转换、字母插入；已有录音和听辨作答/计分/下一题/重置。
- 用浏览器 Network 阻断模拟转换词典与 MP3 请求失败，确认真实错误提示、听辨失败禁用答案、解除阻断后重试恢复。首次 Convert 前没有请求 vendor 词典。
- 禁用脚本后，DOM 仍有完整 410 格、文字版 410 项和全部打印内容。未将 CUA 在禁脚本状态下无法执行的脚本型点击算作原生 details 点击测试通过。
- 打印按钮调用一次 `window.print()`；CDP 按 CSS 页面尺寸生成 PDF，pdfinfo/pypdf 确认 5 页，每页 594.96×841.92pt（A4）。逐页渲染检查无截断；提取文本包含全部 410 音节和 1323 个形式，无缺失。
- 正常流程浏览器无 console error；失败注入产生的预期资源错误单独处理。所有临时阻断、缓存/脚本/媒体模拟、print 替身和视口覆盖已恢复。
- `git diff --check` PASS。仅维护 characterPagePresentation 中构建器依赖 payload/hash，其他教学/音频审核完全保持；新增维护备注不构成人工批准。

## 音频与内容边界

复用现有录音，不新增付费 TTS、视频或媒体。主表的 38 个轻声形式保留文字，改链到真实词境示范，避免把已有孤立音节录音当成通用轻声。听辨题仅用四声录音，失败不自动用设备语音冒充题目。设备语音的可用性取决于系统；中文转拼音对姓名、罕见用法仍需检查。本次没有新增人工逐条教学/听音批准，没有外部 SEO 检测、GSC 流量或收录结果。

## Cursor 协作

按 Owner授权使用其已打开的 Cursor，会话 `JSON creation task`，现有模型 Grok 4.7 High Fast；限定它只输出 `content/pinyin-tools/prose.json`。任务卡见 [CURSOR-COPY-TASK.md](collaboration/pinyin-tools-2026-11-17/CURSOR-COPY-TASK.md)。两次普通 Run 分别完成 JSON 写入和语法验证，没有启用 Always Run、购买或扩大系统权限。主 Agent完成接入并校正文案中的轻声、变调、听辨评分与标调规则。未让 Cursor改主目录、部署或推送。

## 文件与证据

产品：`site/pages/pinyin-chart.mjs`、`site/pages/pinyin-tools.mjs`、`site/pinyin-model.mjs`、`site/seo.mjs`、`public/site-assets/pinyin-chart.v1.css` / `.mjs`、`src/client/pinyin-core.mjs`、`pinyin-tools.mjs`、`pronunciation.mjs`、`content/pinyin-tools/prose.json`、`scripts/build-site.js`、`package.json` / lock。测试：`tests/pinyin-tools.test.mjs`、`pinyin-navigation.test.mjs`、`dictionary.test.mjs`、`seo-quality.test.mjs`。维护：`data/editorial/review-decisions.json` 及本批文档。

证据目录 [evidence/pinyin-tools-2026-11-17/](evidence/pinyin-tools-2026-11-17/)：`verification.json`、`browser.json`、两模式 SEO 报告、完整 tests.log、电脑/手机首屏、免费打印模块和三子页截图、A4 PDF。PDF是打印验收样本，产品通过浏览器打印保存 PDF。

## 下一次精确切入点

本地预览 `http://127.0.0.1:4178/pinyin-chart/`，产物 `/private/tmp/hanzifun-pinyin-2026-11-17`；生产模式候选 `/private/tmp/hanzifun-pinyin-production`。预览进程为本聊天保留的 Python 静态服务。若服务已退出，可执行：

```sh
HF_BUILD_OUTPUT_DIR=/private/tmp/hanzifun-pinyin-2026-11-17 npm run build:site
python3 -m http.server 4178 --bind 127.0.0.1 --directory /private/tmp/hanzifun-pinyin-2026-11-17
```

接手先读本报告、PROGRESS 记录68、TASKS，主表入口 `site/pages/pinyin-chart.mjs`，三个子页 `site/pages/pinyin-tools.mjs`。当前工作树改动尚未提交；不要覆盖。Owner审阅后的调整继续本地完成；只有收到新的明确发布指令，才按 HF17/18 冻结当前源码、处理三个子页的发布/索引门控并执行 Git 与生产验收。旧 releaseId 为已上线首页历史配置，不是本批发布回执。
