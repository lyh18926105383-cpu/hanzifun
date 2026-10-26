# Hanzifun Rebuild - 跨 Agent 实时交接日志 (PROGRESS)

## 当前所处阶段
- **大阶段**：Phase 1：主站上线（基线整合、126 字字典及 Information、独立笔顺页与拼音表、本机闪卡、两场景、两版 HSK 1 级）
- **当前执行任务**：HF-08 工程/自动门控、Chrome 与本机 Workers 验证已交付；跨浏览器、真机与真实屏幕阅读器待补。HF-09 可接续本地候选，HF-02/04/07 人工教学/拼音/音频缺口保留。
- **状态**：HF-01、HF-03、HF-05（独立范围）、HF-06 已完成；HF-02 与 HF-04 均保留人工验收缺口。用户 2026-10-25 明确授权 HF-04 按缺项安全降级/noindex 预览实施，工程交付不等于前置人工验收通过；精确接续见记录 05。

---

## 交接记录 (Handover Log)

### [记录 01] - 规划基线冻结 (By Codex)
- **已完成**：
  - 完成 `SPEC.md` (v1.2)、`BASELINE.md`、`FILE_ARCHITECTURE.md`、`SOURCES.md`、`VERIFICATION.md`、`DICTIONARY_REFERENCE_REVIEW.md` 的创建与对齐。
  - 完成 `TASKS.md` 及 `tasks/HF-01-baseline.md` 至 `HF-18` 的任务拆解。
- **下一步行动**：
  - 接手的 Agent 请先阅读 `TASKS.md`、`BASELINE.md` 和 `tasks/HF-01-baseline.md`，开始执行第一个基线整合任务。

### [记录 02] - HF-01 基线整合完成 (By WorkBuddy, 2026-10-25)
- **已完成**：
  - `git merge origin/main`（`d5a4c57`）并入父树七课故事课 + 生产流程；解决根 `AGENTS.md` add/add 冲突（保留多 Agent 规范 + 追加故事课规则）。
  - 原型源归档至 `docs/hanzifun-rebuild/archive/prototype/`（15 个关键文件 SHA-256 与 BASELINE 指纹一致；排除 `dist/` 构建产物）。
  - 生成 `baseline/INTEGRATION.md` 与 `contracts/` 四项契约（`routes.json`、`learning-event.schema.json`、`content.schema.json`、`repository-interface.md`）。
  - `npm test` 47/47 全绿；白名单构建 411 文件，无敏感/候选文件泄露，149 处课程资源引用校验 0 缺失。
- **本包修改/新增文件**：
  - 新增：`docs/hanzifun-rebuild/archive/prototype/`（19 个源文件）、`baseline/INTEGRATION.md`、`contracts/`（4 个文件）。
  - 修改：`AGENTS.md`（追加故事课规则）；merge 带入父树 `assets/lessons/*`、`storyboards/*`、`lessons.js`、`story.js`、`styles.css`、`story.css/html`、`index.html`、`package.json`、`scripts/*`、`tests/lessons.test.js`、`STORY_COURSE_PRODUCTION_WORKFLOW.md`、`README.md`、`.gitignore`。
- **遗留问题**：
  - `audio-manifest.json` 声明 `available/total=108`，按字键实际 107 条（“睛”去重），HF-02 收敛。
  - 故事课视听回归需按 `STORY_COURSE_PRODUCTION_WORKFLOW.md` 完整流程人工确认，自动测试不替代。
  - 生产 URL/主机/部署状态待 HF-17/18 上线前核实。
- **下一个 Agent 精确切入点**：
  - 读 `tasks/HF-02-data-foundation.md`（字典/笔顺数据与来源管线）、`tasks/HF-03-site-shell.md`（C 方案框架与七段首页）、`tasks/HF-05-review-engine.md`（复习调度），三者可按文件边界并行；均以本包冻结的契约为准。


### [记录 03] - HF-02 数据基座实现交付，人工验收待关闭 (By Codex, 2026-10-25)
- **工作目录/范围**：主仓库 `/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun`，main；没有使用旧 worktree，没有覆盖既有未跟踪文件，没有制作故事/引入账号同步 Billing/部署。
- **已完成**：
  - Node.js 可复用下载/提取、规范化构建、schema/资源/覆盖/离线确定性验证、本地预览脚本；原始压缩包及大数据仅存忽略的 `.cache/hf02/`。
  - 核心 107+26−7=126 唯一字、153 字读音、126 份未修改笔画 JSON、Information、85 旧多字词/短语（75 字典词头、10 缺项）；所有生成数据带来源定位，许可分别保存。
  - 410 个显式范围音节、1,323 组词典见证的音节/声调候选；审核与实际音频分开，playable=false。HSK 只交付版本/清单类型/范围决策契约，不宣称已导入清单。
  - “睛”第19/87位独立 cardId → char:775b → 同一个019音频；manifest 按字107、按位置108，生成器/契约1.1同步；不改变原108卡与录音。
  - CC-CEDICT 2026-10-23、Unihan17、hanzi-writer-data2.0.1、MMH固定commit及实际SHA-256/许可落锁；MMH部件字典LGPL与笔画Arphic分开，字段指南按17版解释地区计数。
  - 80个Kanji同字由kJoyoKanji=2010直接支持，46个所查字段未证明，不写否定；四个语境主读音修正：壳ké、肚dù、说shuō、听tīng。
- **文件列表**：
  - 新增 `.gitattributes`（上游许可原文保留原空白，不改写法律文本）；新增 `scripts/{data-foundation-lib,fetch-content-sources,build-data-foundation,validate-data-foundation,preview-data-foundation}.mjs`、`tests/data-foundation.test.mjs`、`package-lock.json`。
  - 新增 `data/README.md`、`sources.lock.json`、`coverage.json`、`core-manifest.json`、`legacy-occurrences.json`、`editorial-decisions.json`、`normalized/`、`pinyin/`、`strokes/`、`schemas/`、`source-extracts/`、`licenses/`、`reports/`（含来源升级模板）。
  - 修改 `.gitignore`、`package.json`、`audio-manifest.json`、`scripts/build-tts-manifest.js`、`docs/hanzifun-rebuild/contracts/content.schema.json`（只改音频统计语义/版本）。
  - 新增 `docs/hanzifun-rebuild/HF-02-VERIFICATION.md` 与 `evidence/hf02/` 三张本地浏览器截图；更新 TASKS、PROGRESS、HF-02任务状态。
- **验证结果**：`npm test` 58/58；`node scripts/validate-data-foundation.mjs` PASS（两次离线重建与入库产物逐字节一致）；`npm run build:site` 411白名单文件，无缓存/原始源/依赖泄漏；Ajv8.20.0安装审计0漏洞。Codex本地浏览器抽查22字完整字形与逐笔切换。
- **遗留事项/验收边界**：
  - 126字的全部英义/读音/简繁语境人工快审尚未签字；Codex只完成逐项摘要源对照，不能当完整人工验收。拼音410范围及1323候选声调需教学复核，尤其罕见/方言/轻声词境。
  - 107旧语境录音尚未重新逐条听审，不能冒充纯音节。19新增核心字无原语境音频；153字读音及拼音音频补录/听审需求均已列出，没有消耗付费TTS。
  - 17个原始部件分解含“？”已列问题报告；10个旧短语无字典独立词头，保留原教学位置，不造词典释义。
  - 完整Tier2教学页仍为0，短助记/例句/练习入口由HF-04接入；缺插画不构成发布阻碍。当前data目录未被旧站白名单构建公开。
- **下一个 Agent 精确切入点**：
  1. 先读本记录、TASKS与当前指定任务；数据接口读 `data/README.md`，验证证据读 `HF-02-VERIFICATION.md`。
  2. 继续HF-02验收时，从 `data/reports/editorial-review.json`、`information-issues.json`、`word-gaps.json`、`audio-requests.json` 逐项处理；审核结论应持久化到输入并接入构建，不能手改会被覆盖的生成报告，未听审音频不开放。
  3. HF-04消费 normalized/、strokes/manifest 与 pinyin/；按字加载笔画，发布时带许可/署名；不要整库复制source-extracts或.cache。主站/HSK页面未在本包实现。

### [记录 04] - HF-03 站点外壳与路由完成 (By Codex, 2026-10-25)
- **工作目录/范围**：`/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun`，仅执行 HF-03；未触碰已存在的未跟踪用户文件，也未改写根 `dist/`。
- **已完成**：
  - 将已归档原型改造成 `site/` 维护结构：数据/渲染、基础布局、七段首页、路由表、静态占位模板、共享英文样式和预览配置；首页保留逐字确认副标题、三类人群、三项卖点与六个 HTML FAQ。
  - 覆盖 77 个原型路径的逐项映射，并补充 HF-02 的 126 个受控字典路由及拼音表、政策、数据来源、条款和 404 骨架。`site/release.json` 将默认状态绑定到 `noindex,follow`；预览/计划页面输出对应 robots meta，发布状态策略切换到 `index,follow`。本次没有把未完成英文页开放索引。
  - 桌面/手机导航包含 All Characters、Stroke Order、Pinyin Chart、HSK 2.0/3.0；两套 HSK 入口、Pricing、Sign in、中文与免费闪卡链接均落到契约路径。通过 Escape、焦点返回、字典子导航、键盘翻卡和 FAQ 展开检查。
  - 英文静态输出使用 `/site-assets/` 版本化新资源；原中文 `/zh/`、故事播放器 `/story.html?lesson=...` 和原课程资源继续按旧路径输出。Wrangler 404 配置改为真实 `/404.html`；未知路径不会伪装成首页 200。
- **文件列表**：
  - 新增：`site/data.mjs`、`site/site.mjs`、`site/pages/home.html`、`site/pages/route-stubs.mjs`、`site/layouts/base.html`、`site/routes.mjs`、`site/release.json`、`site/public/site-styles.css`。
  - 新增：`public/site-assets/{hero,audiences,festival}.hf03-v1.jpg`、`public/site-assets/seal.hf03-v1.svg`、`src/client/navigation.mjs`、`src/client/site-preview.js`、`tests/site-shell.test.mjs`、`docs/hanzifun-rebuild/HF-03-VERIFICATION.md`。
  - 修改：`scripts/build-site.js`、`wrangler.toml`、`docs/hanzifun-rebuild/tasks/HF-03-site-shell.md`、`docs/hanzifun-rebuild/TASKS.md`、`docs/hanzifun-rebuild/PROGRESS.md`。
- **验证结果**：最终 `npm test` 64/64（含原有 58 项与 HF-03 新增 6 项）；`HF_BUILD_OUTPUT_DIR=/private/tmp/hf03-build-hanzifun npm run build:site` 成功，输出 601 个公开文件、映射 77 个原型路径并生成 181 个 `noindex` 预览页。隔离输出路径保留原 `dist/`。本地浏览器 360/390/768/1100/1440 宽度均无横向溢出，720 CSS px 等效放大视口无溢出；减少动态效果下无非零 transition；手机/桌面导航、键盘 Escape、焦点、翻卡和 FAQ 均完成交互检查。首页与移动导航截图已在浏览器验收会话捕获并供本次检查；截图接口返回会话图像，没有另存为仓库 PNG。
- **遗留问题**：HF-02 人工英文释义/读音语境、拼音教学声调和音频逐项听审仍未关闭；Phase 2/3 占位页依照当前 release 策略均不可索引。截图目前仅随本会话验收快照保留，未写入项目证据目录。
- **下一个 Agent 精确切入点**：先依 HF-02 验收记录继续完成人工内容/拼音/音频复核；HF-04 在 HF-02 相关验收关闭后读取其数据接口，将 `data/normalized/`、`data/strokes/`、`data/pinyin/` 接入 [HF-03 路由与页面挂载点](tasks/HF-03-site-shell.md)；公开内容索引策略留给 HF-08 按质量门槛放行。

### [记录 05] - HF-04 工程交付，人工内容/音频与学习联调待关闭 (By Codex, 2026-10-25)
- **工作目录/范围**：指定 Desktop 主仓库 main；仅 HF-04，保持 Phase 1。用户明确授权先按审核/缺音安全策略实施并在验证后 commit。未覆盖原 dist 或用户既有未跟踪工作。
- **已交付**：
  - 126 静态详情与全部字索引、按 readingId 更新的 Information、源证支持的 80 个 Kanji；拼音/部首索引、八对比较、按需搜索三分包和来源许可面板。
  - 原创 126 条例词、句子/拼音/英译及独立短助记，持久化 Codex 快审、批次和人工 pending。发的发现教学读音 fā 在独立编辑层选择，保留 HF-02 原始归一化文件及 fà/髮 对应。
  - 独立 `/stroke-order/` 的 char 选字、播放/暂停/上下笔/速度/重置；与详情共用原始按字 JSON 与 126 份完整静态逐笔 SVG。公共 JS 无全库路径，用户操作前不请求任何笔画 JSON；单字缓存键带源文件 SHA-256。
  - `/pinyin-chart/` 完整 410 音节范围与 1323 候选声调、初韵母筛选、ü 别名、零声母/轻声说明和已存在例字互链。所有待审音频明确禁用；未冒充已审教学音频。
  - 收藏/练习适配器仅在明确成功返回时报告成功；未接通显示待办，不把新增字静默送入旧原型默认卡组。审核输入和构建放行门槛接入；release 仍 noindex。
- **新增文件**：
  - `data/editorial/{characters,comparisons,review-decisions}.json`。
  - `site/dictionary-data.mjs`、`site/components/stroke-order.mjs`、`site/pages/{dictionary,stroke-order,pinyin-chart}.mjs`。
  - `src/client/{dictionary,search-core,stroke-order,learning-entry,audio-player}.mjs`、`tests/dictionary.test.mjs`。
  - `docs/hanzifun-rebuild/HF-04-VERIFICATION.md`、`evidence/hf04/`（四张真实页面截图、布局/网络/构建收据）。
- **修改文件**：`scripts/build-site.js`、`site/public/site-styles.css`、`site/release.json`、本日志、TASKS、当前 HF-04 任务说明。
- **验证**：`npm test` **77/77**（原64+新增13）；隔离构建880文件、77原型路径、181 noindex预览页，全量资源检查通过；两次构建全部文件SHA-256差异0。4类页面×5档宽度无横向溢出；实际完成数字调搜索→水详情→独立同字笔顺、龟键盘逐笔、单字失败重试、发多音/简繁、lu/lü筛选、无JS正文/静图/410表、减少动态无自动播放及未连接学习入口检查。证据和明确未测范围见 HF-04-VERIFICATION。
- **遗留/不可冒充**：人工英义/简繁/拼音/例句验收与音频听审未关闭；107旧语境录音不冒充纯音节、19字原语境缺音仍存在；17不完整部件不瞎拆，10短语不造释义。人工验收Tier2与Tier1均0。HF-05/06未接，真实学习闭环未验收。未生产部署、未添加账号同步Billing、未生成或修改故事。浏览器抽查不是Safari/Firefox/真机或真实p75验证。
- **下一个 Agent 精确切入点**：
  1. 读本记录、TASKS、当前指定任务与 `HF-04-VERIFICATION.md`；继续人工审核时从 HF-02 四份问题报告及 `data/editorial/` 输入开始，不能在生成报告里填假签字。
  2. HF-06 对接 `window.HanziFunLearningAdapter.saveCharacter({characterId})` / `startCharacterPractice({characterId,readingId,source})`，分别明确返回 saved/started，包装真实 Repository/session，不改原v1记录；补做真实落盘/续练联调。
  3. 音节教学审核和真实录音绑定后接入播放；本包仅有失败关闭的帮助模块和夹具，不宣称真实发音完成。HF-08 按审核与标准页质量逐页放行，不能因缺插画阻塞成熟Tier2。

### [记录 06] - HF-05 复习引擎与独立组件完成 (By Codex, 2026-10-25)
- **工作目录/范围**：指定 Desktop 主仓库，实现前 HEAD `f586268`；仅 HF-05，用户明确授权实现、验证和 git commit。保留既有未跟踪文件；没有修改故事/原中文记录/生产部署/账号同步Billing。
- **交付**：interval-v1 stage0—6与1/3/7/14/30/60天、again10分钟；到期优先/稳定cardId/独立新额度；固定IANA额度时区与UTC有效时钟；UUID、内容/卡片/会话revision、日志重放与去重。冻结卡序/内容、先翻后评、暂停恢复、free追加再看、唯一完成、未保存重试及恢复导出。睛19/87卡独立排程，char:775b唯一字统计去重。
- **新增文件**：`src/learning/{scheduler,events,session}.mjs`；`src/client/flashcards.mjs`、`flashcards.css`；`tests/{review-engine,review-session,flashcards}.test.mjs`；`tests/fixtures/hf05-preview.html`；`scripts/verify-review-browser.mjs`；`HF-05-INTEGRATION.md`、`HF-05-VERIFICATION.md` 与 `evidence/hf05/{receipt,checks}.json`、两张真实浏览器截图（文档/证据均位于本目录）。
- **修改文件**：本 PROGRESS、TASKS、`tasks/HF-05-review-engine.md`。没有改 frozen schema 或 Repository 契约、公开构建/路由、原 dist。
- **验证**：`npm test` **98/98**，原77+新增21；覆盖到期前后一毫秒/阶段/额度/时区DST/回拨/UUID与评价槽位幂等/120次性质检查/组件提交与焦点/模拟旧标签页revision冲突。隔离构建880文件、77原型路径、181 noindex页且测试夹具未发布。真实Chrome155隔离夹具完成键盘、暂停刷新恢复、失败重试、完成刷新去重及360/390/768/1100/1440无横向溢出。源码指纹、命令及精确范围见HF-05-VERIFICATION。
- **遗留与边界**：HF-06真实localStorage、旧记录迁移、隐私窗口与跨标签页写锁尚未实现/验收；浏览器夹具用专用sessionStorage及合成内容，不能冒充真实学习闭环。IANA额度账本固定首次排程时区，暂不提供额度时区迁移；立即再看只追加未结束会话，结束重练由宿主新建free会话。HF-02/04人工/音频缺口不变；未测Safari/Firefox/真机/真实屏幕阅读器。
- **下一个 Agent 精确切入点**：先读本记录、TASKS及当前指定任务，再读 `HF-05-INTEGRATION.md`。按用户决定优先遵循repository-interface.md用localStorage单键确定性快照；保留旧hanzifun.learning.v1只读原文与导入批次，隐私模式失败明确未保存。封装commit事务（event+projection+cursor），检查日志head/length与session revision、相同事务重试优先ack，写锁防跨标签页覆盖。接HF-04 `window.HanziFunLearningAdapter` 的saveCharacter/startCharacterPractice，成功保存初始快照才返回started；真实四组卡和字典入口完成落盘/续练验收后再关闭HF-04学习联调缺口。

### [记录 07] - HF-06 本机学习持久化与字典闭环完成 (By Codex, 2026-10-26)
- **工作目录/分支**：Desktop 指定主目录 main，实施前 HEAD `f9815c20`；所有源码直接落盘主目录，临时目录仅构建产物/下载/验证证据。保留原有未跟踪用户文件与原 dist。
- **交付**：新 guest 单键确定性快照、逐次事件/投影/游标保存、丢失回执幂等 ack、UUID/revision/设备序号保护；Web Locks 特性检测，共享 bakery 标记让无锁/受限/混合能力标签继续安全协作，CAS以候选原文为基准，写后核验，残留标记显式恢复。旧v1/prototype只读，三源预览/原文hash批次/重复无新增、独立故事历史、不补造事件/阶段；备份/失败pending/临时free事件恢复。真实四组、字典选readingId、收藏/取消、到期/薄弱字/导入字、概览最近8轮分页、冻结会话续练与免费重练接通。
- **新增文件**：`src/learning/{repository,legacy-import,write-lock,identity}.mjs`、`src/client/guest-learning.mjs`、`site/learning-data.mjs`、`site/pages/learning.mjs`、`tests/guest-learning.test.mjs`、`scripts/{verify-guest-browser,benchmark-guest-learning}.mjs`、`HF-06-VERIFICATION.md` 与 `evidence/hf06/`（文档/证据位于本目录）。
- **修改文件**：`src/learning/events.mjs`（保持语义的批量重放性能改进）、`src/client/{flashcards.mjs,dictionary.mjs,site-preview.js}`（移除活动英文站的原型存储处理）、`site/layouts/base.html`、`site/pages/dictionary.mjs`、`site/public/site-styles.css`、`scripts/build-site.js`；本日志、TASKS、HF-06任务、SPEC/Repository契约中的本包存储决定。
- **验证**：`npm test` **112/112**（原98+新增14）；公开隔离构建891文件、77原型路径、181 noindex页，全部资源引用检查通过。真实 Chrome155在有锁、无锁及混合能力下验证双标签竞争、陈旧写入拒绝、刷新/关页续练、四组真实卡、字典again十分钟到期、原键不变的三源重复导入和备份往返、存储拒绝/实际配额满/释放重试、临时free导出恢复与已载会话断网；5档宽度无横向溢出，截图实际查看。最终收据/指纹见HF-06-VERIFICATION。
- **明确边界**：合成1000卡/10000事件快照11.39MB，内存Storage测CPU/往返，不冒充localStorage足够容量；真实满额时明确未保存、保留pending/导出，不静默截断日志。合作式协调不是数据库原子CAS；暂停/崩溃残留标记不自动抢占，关闭其他标签后显式恢复。备份恢复需空guest仓储；跨origin需文件搬运。未测Safari/Firefox/真实旧WebView/真机/系统级隐私策略；HF-02/04人工与音频缺口不变，未改故事内容或验收故事视听、未部署或引入Phase3功能。
- **下一个 Agent 精确切入点**：读取本记录、TASKS与用户指定的HF-07或HF-08单个任务。持久化 API/键/容量/故障语义读contracts/repository-interface.md与HF-06-VERIFICATION；真实卡数据入口site/learning-data.mjs，宿主src/client/guest-learning.mjs。HF-04学习联调已关闭，但人工签字需从data/editorial与原问题报告继续，不能因工程闭环完成而关闭人工缺口。

### [记录 08] - HF-07 两版首级与两场景工程交付，人工/音频缺口保留 (By Codex, 2026-10-26)
- **目录/分支**：Desktop指定主目录main，实施前HEAD `8bb1e13`；源码与提交均直接在此目录。保留原有未跟踪用户文件和原dist，无其他worktree施工。
- **交付**：官方2015源XLSX（通过存档传输，当前官方Jina150词逐条对齐）和当前2025大纲PDF锁hash；只取字词头/版本/等级/成员事实。旧150词/174派生字，新300词/246认读字/100个一级～二级联合书写字；schema真实保留1-2。自动从既有锁定CC-CEDICT/Unihan/MMH/笔画提取213新字，原126不动，总339；HSK范围并集255与教学覆盖分开。5个HSK组+2个场景组与原4组共用Repository；词项语义保留整词，评分与收藏明确为组成字。两场景各3句，逐token解释、当前组、字典/笔顺、受控子集、精确返回/刷新与学习中心接通。3个HSK主范围页index，其余教学/场景草稿仍noindex；音频缺失明确禁用。
- **新增文件**：`scripts/extract-hsk-sources.py`、`scripts/{fetch-hsk-sources,build-hsk-data,validate-hsk-data,verify-hsk-browser}.mjs`；`data/hsk/README.md`、`data/hsk/{source-headwords,membership,lexicon,coverage}.json`与213个`strokes/*.json`、`data/scenarios/scenarios.json`、`data/licenses/HSK-SCOPE.md`；`site/hsk-data.mjs`、`site/pages/{hsk,scenarios}.mjs`、`src/client/hf07.mjs`、`tests/hsk-scenarios.test.mjs`、`HF-07-VERIFICATION.md`及`evidence/hf07/`轻量JSON。
- **修改文件**：`data/{sources.lock.json,schemas/hsk-membership.schema.json,schemas/sources.schema.json}`；`scripts/{build-site.js,fetch-content-sources.mjs,validate-data-foundation.mjs}`；`site/{learning-data.mjs,routes.mjs,release.json,pages/dictionary.mjs,pages/learning.mjs,public/site-styles.css}`；`src/client/{dictionary,guest-learning,navigation}.mjs`；`tests/{dictionary,guest-learning}.test.mjs`；Repository接口契约、本PROGRESS、TASKS及当前HF07任务。原核心数据和共享调度内核未改。
- **验证**：npm test 119/119（112原+7新）；validate-hsk-data PASS含213笔画hash与隔离重建字节一致；普通HF02 fetch保留下游源锁，HF02完整数据重建仍过。两次公开隔离构建1544文件差异0，77原型路由保留，398 noindex+3 HSK index，资源引用检查通过；路由区分126核心/213新增。真实Chrome155 HF07 7组闭环（两HSK/两场景/存储拒绝/无JS/桌面手机导航及5档宽度）通过，实际查看手机与PDF边界截图；HF06回归18项errors=[]。截图、原文件、整包和日志均未入库。
- **遗留/不可冒充**：新增213字及原核心仍有人类教学审核缺口；不把自动词典导入称为已验收Tier2。场景6句录音缺失/听审pending；30条/套来源抽查由Codex完成，不能伪造人类签字。没有新增音频/调用付费TTS/部署/账号同步Billing/故事制作；未测Safari/Firefox/真机/真实p75/生产。
- **下一Agent精确切入点**：先读本记录、TASKS与用户指定单任务。HF07收口见HF-07-VERIFICATION遗留1–3：从`data/scenarios/scenarios.json`录音/审句、`evidence/hf07/source-review.json`源定位、`data/hsk/README.md`与lexicon草稿逐批完善；保持characterId/URL并将审批持久化，达Tier2再逐页放行，不以缺插画/新书面授权阻断。HF08可继续全站质量，但不得清空HF02/04/07人工缺口。

### [记录 09] - HF-08 SEO、质量与无障碍门控工程交付 (By Codex, 2026-10-26)
- **目录/分支**：Desktop 指定主目录 main，施工前 HEAD `c3665e36bb0f5fa451e0093046d0258769565ccd`；所有源码/新增证据/提交均在主目录。保留既有未跟踪用户文件、原 dist。
- **交付**：354 核心落地页的 Title/唯一 main H1/紧邻首个直答 p；共享 metadata/self-canonical、WebPage/WebSite/BreadcrumbList 与安全 JSON-LD；构建后 parse5 DOM/JSON.parse/必填字段/robots/sitemap/FAQ/预算必经校验。Production 显式启用；缺省 local 和 staging 全包 noindex、sitemap为空。保留3个既有 HSK 范围页放行，不替待审内容签字。补场景人工语言门槛；未来成熟字页的 Unicode canonical/sitemap 编码有回归测试。修对比、skip焦点、200%容器断点、下方插画lazy，更新过时FAQ和闪卡重名。旧中文index/legacy301、Workers故事默认307 query分开验证。
- **新增文件**：`site/seo.mjs`；`scripts/{validate-seo-quality,verify-quality-browser}.mjs`；`tests/seo-quality.test.mjs`；`HF-08-VERIFICATION.md`、`evidence/hf08/`（后两者在本交接目录）。
- **修改文件**：`scripts/build-site.js`；`site/{layouts/base.html,pages/dictionary.mjs,pages/hsk.mjs,pages/scenarios.mjs,pages/learning.mjs,pages/home.html,site.mjs,public/site-styles.css,release.json}`；`tests/dictionary.test.mjs`；`package.json`、`package-lock.json`、`wrangler.toml`；TASKS、PROGRESS、当前HF08任务。
- **验证**：npm test **127/127**；三环境每个401英文页、354核心页、全量402JSON-LD errors=[]；production3 sitemap/398 noindex，staging/local0 sitemap/401 noindex。1546文件两次production SHA-256差异0，77原型路由保留、资源引用与白名单通过。Chrome155.0.8059.85/axe4.10.3：16类页面零WCAG违规、13路由×5断点65次、5模板CSS200%放大、键盘/无JS/AX树通过。4模板各3轮固定移动4G/4×CPU，LCP中位数764/612/772/744ms、CLS均0；首页JS7.30KiB/CSS10.71KiB gzip、关键图347.12KiB。Workers4.152.0本机环境404、301单跳、默认307保留课程参数与staging noindex头通过。
- **边界/遗留**：仅工程与本地范围交付，不把HF08跨浏览器/真机/系统读屏标完整验收；CSS zoom与CDP AX不冒充真实VoiceOver/NVDA或原生缩放。axe incomplete留收据，不等同人工通过。HF-02/04/07人类教学、场景与音频缺口均保留。未测真实p75/INP、生产主机/实际迁移/恢复；无部署、账号、同步、Billing、追踪器或故事制作。
- **下一Agent精确切入点**：读本记录、TASKS与用户指定单个任务，再读HF-08-VERIFICATION及evidence/hf08。HF09/17补Safari/Firefox/真机/真实读屏/原生缩放证据与源内容审核；HF17/18先核对生产域名与旧入口，再发布显式production候选。运行build:site缺省local，生产用build:production，预览用build:staging；不得因门控通过清空人工pending。
