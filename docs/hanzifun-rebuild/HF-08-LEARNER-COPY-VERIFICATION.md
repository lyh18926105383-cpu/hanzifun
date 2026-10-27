# HF-08 学习者正文与审核管线解耦验证

日期：2026-10-26（Asia/Singapore）。工作目录为指定 Desktop 主仓库 main。

## 审计与处理

按 AGENTS.md 先读取 PROGRESS、TASKS、本次 HF-08 任务及 VERIFICATION；按需搜索前端模板、布局、公共组件、客户端及数据适配层，未扫描用户未跟踪文件。场景数据实际由 `site/hsk-data.mjs` 的 `scenarioData` 提供，仓库没有 `site/scenario-data.mjs`。

| 范围 | 发现与处理 |
|---|---|
| `site/pages/dictionary.mjs` | 删除核心字的 Tier/人工审核横幅、stable ID、逐读音缺音提示、释义待审后缀、助记/例句审核文案及逐字来源定位；保留简繁语境、Kanji、Unicode、来源许可及助记/词源区别。未知部件改为引导观察笔顺。 |
| `site/pages/hsk.mjs` | 删除列表审核计数、条目缺音/待审句和补充字草稿提示；来源行号移至 `data-source-locator`，补充字不显示未知结构状态和来源定位。保留逐项数据、词义、简繁、练习、多音、联合书写范围及许可。 |
| `site/pages/scenarios.mjs` | 删除 Codex 批次、语言签发/待审状态、缺音按钮及其解释；保留六句原教学内容、连读说明、词界释义及学习入口。 |
| `site/pages/pinyin-chart.mjs` | 删除验收横幅和每格待审提示，保留410音节及1323声调形式；缺音用禁用图标，具有 disabled、aria-disabled、data-audio-state、aria-label。 |
| 首页、学习页、共享页脚及备用模板 | 删除教学待审说明、全站 Local design preview 页脚及备用字页审核标签。 |
| `src/client/dictionary.mjs`、`learning-entry.mjs`、`audio-player.mjs` | 动态筛选提示、适配器失败和音频失败提示改为可操作的学习者语言；未变动音频批准/读音匹配或本机保存语义。 |
| 数据适配层、布局、笔顺组件 | 审核异常、schema和数据标识不属于正文；保持发布门控、机器属性、来源许可。用户操作失败后的保存/备份恢复诊断仍保留，避免掩盖真实数据恢复问题。 |

单字与场景没有已批准可播的新音频，因此省略播放入口；107条旧音频的听审状态保持原值，按既有 approvedAudio 检查可播数为0，没有放开音频或使用浏览器TTS替代。

## 自动验证

- `npm test`：139/139 PASS（包含 production/staging 隔离构建）。
- `HF_SITE_ENV=production HF_BUILD_OUTPUT_DIR=/tmp/hanzifun-ui-production npm run build:site`：1546文件，401英文页面中141 index / 260 noindex；不覆盖既有 dist。
- SEO构建门控：354核心页的唯一H1、紧随H1的直答首段及标题/元数据一致性通过；402个JSON-LD块通过；sitemap精确141 URL，staging为0。
- 新增正文门控随 `validatePage` 进入所有英文页构建：检查文本节点（包括折叠详情、备用读音），不将属性/脚本/样式当作可见正文；内部审核词、调试字键、批次/行页标记出现则失败；禁用音频必须有禁用与辅助名称属性。
- 新增反例测试：审核横幅、缺音文本、Codex、stable ID、char键、sense_id、批次、来源行号和中文待审词会失败；`data-*`中的来源/ID允许保留；错误音频禁用状态也会失败。
- 原门控测试继续验证缺人工批准、缺指纹或未批准场景/拼音不能放行；旧的“必须出现待审横幅/缺音长句”断言改为教学正文与安全降级断言。
- `git diff --exit-code -- data site/release.json site/publication-review.mjs site/dictionary-data.mjs site/hsk-data.mjs site/seo.mjs`：通过，底层数据、审核输入与索引策略未修改。
- `git diff --check`：通过。

## 本轮未完成的浏览器验证

尝试执行既有 `verify-quality-browser.mjs`，本地服务启动即报 `listen EPERM: operation not permitted 127.0.0.1`，未进入浏览器；备用浏览器工具返回 `Browser is not available: chrome`。因此本轮没有浏览器截图、交互、axe、布局或性能复验结果，不能沿用历史证据冒充本轮实测。

未改故事课内容/音视频，未执行故事课制作或验收，未部署或改动Phase 3。后续在可监听本地端口且能连接Chrome的环境，执行 `HF_BUILD_OUTPUT_DIR=/tmp/hanzifun-ui-production HF08_EVIDENCE_DIR=/tmp/hanzifun-ui-browser node scripts/verify-quality-browser.mjs`，重点确认多音切换、拼音筛选后禁用图标及场景练习。之后依HF-17/18进行部署核验。

## 提交状态

已按用户要求在main主目录修改。执行显式文件白名单 `git add` 时失败：`Unable to create .git/index.lock: Operation not permitted`；当前环境将.git设为只读，尚未暂存或生成提交。需在有.git写权限的环境暂存本报告所列文件并提交；用户原有未跟踪个人文件不加入提交。
