# Hanzifun Rebuild - 跨 Agent 实时交接日志 (PROGRESS)

## 当前所处阶段
- **大阶段**：Phase 2。2026-10-28生产基线保留；2026-10-31本地新增候选准备完成，未部署。
- **当前执行任务**：HF-13三方向文章与家庭/课堂打印本地Completed/PASS，Owner已回复“没问题”批准三篇正文；HF-14仅100字入门索引子项完成，整包Partial；HF-17本候选预检PASS，HF-18待本次范围/窗口授权及生产现状核验。
- **状态**：主目录main已无冲突快进至226e88c；全量174/174测试PASS，生产构建2828文件/413英文页，399 index/14 noindex，Sitemap399、SEO零错误。候选`phase-2-editorial-starter-2026-10-31`；本地Chrome/Workers/打印和回滚演练证据已保存。保留音频静态MP3+设备中文TTS与64词Deferred。未commit/push/部署，原HF-10-auth/11-sync、HF-12文化工具、HF-14全量、HF-15/16仍未完成。最新总盘点见[剩余任务](REMAINING-TASKS-2026-10-31.md)。

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

### [记录 10] - HF-09 工程总门控与中文迁移演练交付，人工候选放行待完成 (By Codex, 2026-10-26)
- **目录/分支**：Desktop指定主目录main；实施前HEAD `bf3c62c4d80093fd140b10b9fcfe536205280003`。保留原dist和所有既有未跟踪用户文件；未在旧worktree施工。
- **交付**：总门控、133项原/新增测试、三环境四构建确定性、旧中文资源hash保全、本机Workers HTTP、复用HF06/07/08浏览器与新增搜索/跨origin迁移/八课全程；逐项source+teaching hash审批、339条审核输入、6个核心与11个HSK待审批次导出及dry-run/显式apply。213补充字解除统一硬编码禁发，但必须先补Tier2实质教学内容并真实逐项审核，未审继续失败关闭。
- **新增文件**：`site/publication-review.mjs`；`data/editorial/{hsk-characters,mvp-acceptance}.json`；`scripts/{validate-mvp-gate,review-release-batch,mvp-manual-scopes,verify-mvp-browser,verify-mvp-http}.mjs`；`tests/mvp-gate.test.mjs`；本目录`acceptance/{phase-1,phase-1-checklist}.md`及`evidence/hf09/`轻量JSON。
- **修改文件**：`data/editorial/review-decisions.json`、`package.json`、`site/{dictionary-data,hsk-data,seo}.mjs`、`site/pages/{dictionary,hsk}.mjs`、`site/release.json`；`scripts/verify-hsk-browser.mjs`；`tests/{dictionary,hsk-scenarios,seo-quality,site-shell}.test.mjs`；TASKS、PROGRESS、HF09任务状态。
- **验证**：`node scripts/validate-mvp-gate.mjs --browser`工程PASS；npm test133/133；production重复构建字节一致，1546文件；三环境401英文页/354核心页/402JSON-LD，sitemap3/0/0；18项Workers本机404/301/307/query/noindex通过；HF06持久化故障/双标签/导入、HF07两版/两场景、HF08axe/布局/实验室预算通过；新增四种水搜索/拼音回字页、不同端口origin真实备份文件往返及八课播放/跟读/错题重试/完成页通过。具体hash、性能数值、DOM字幕/高亮观察见acceptance/phase-1.md及收据。
- **明确遗留**：完整候选仍BLOCKED，核心126和补充213人工已验收均0；补充字尚缺独立例词/句/助记。410音节/1323候选、107语境录音/19核心缺音、两场景6句录音、八课适用人工确认及Safari/Firefox/真机/真实读屏/原生缩放待补。原第一课保留旧分段能力，没有凭空新增逐字cue。10000事件快照约11.39MB，摘要约40ms，冷加载约0.9s/恢复预检约1s（精确值见本次收据）；不宣称可全部localStorage落盘或所有恢复≤300ms。未生成或修改故事/音频，未调用付费TTS，未部署或引入Phase3功能。
- **产物纪律**：所有大构建、日志、截图、下载备份及Workers状态位于已忽略`.cache/hf09/`；仅轻量JSON和文档入库，截图hash清单记录本机位置。
- **下一Agent精确切入点**：先读本记录、TASKS、用户指定单任务；人工收口读`acceptance/phase-1-checklist.md`。字页从`evidence/hf09/review-inventory.json`定位缺项，实际修改`data/editorial/`输入；`review-release-batch --prepare=core-01`导出pending模板，人工逐项填真实签字后dry-run再--apply；不要修改生成收据。专项审批填`data/editorial/mvp-acceptance.json`并绑定manual-scopes当前hash；未录音不可听审通过。重跑`node scripts/validate-mvp-gate.mjs --browser --require-human`，人工未齐返回2；只在完整条件通过后关闭HF09，不能因为工程PASS开启后续阶段或标已上线。


### [记录 11] - 四项 UI/UX 体验修订完成（By Codex，2026-10-26）
- **工作目录/范围**：用户指定 Desktop 主目录 main；保留原有全部未跟踪文件。本次只改闪卡交互、尺寸、学习记录入口和中文页面英文返回入口。
- **已完成**：
  - 用户明确替代 HF-05 原“先翻后评”约束：会话引擎、controller、按钮与 1/2 快捷键允许正面 Familiar/Again；一个评价事务完成保存/游标推进，保存中和失败未重试前仍禁止重复提交。
  - 桌面 24rem、手机 21rem 统一卡片边框盒；沿用中文闪卡 STKaiti/KaiTi 楷体栈，大字居中；背面按内容密度调整字号，超长内容内部滚动且可键盘聚焦。
  - 学习页副标题工具栏新增带 SVG 的 Learning History / Progress & review stats 胶囊；全站桌面/移动导航 My Progress 指向 `/account/`。
  - `index.html`、`story.html` 头部新增 English / 返回英文版，目标 `/`，更新中文 CSS 缓存版本。完整阅读故事生产流程；本次没有制作或变更故事、视频、TTS、字幕或逐字高亮，不产生新的课程审批。
- **修改文件列表**：
  - `src/learning/session.mjs`、`src/client/flashcards.{mjs,css}`。
  - `site/pages/learning.mjs`、`site/site.mjs`、`site/public/site-styles.css`。
  - `index.html`、`styles.css`、`story.html`、`story.css`。
  - `tests/{flashcards,review-session,site-shell}.test.mjs`、`tests/lessons.test.js`、`scripts/verify-review-browser.mjs`。
  - `docs/hanzifun-rebuild/{TASKS,PROGRESS,HF-05-INTEGRATION}.md`、`tasks/HF-05-review-engine.md`、`evidence/ux-2026-10-26/receipt.json`。
- **验证**：`npm test` **138/138**；`npm run build:site` 已重建主目录 `dist/`，1546 个公开文件、401 个 noindex 预览页（dist 按现有规则忽略，不手改/提交构建产物）。Chrome155 闪卡脚本通过正面点击 Familiar、键盘、保存失败/相同事务重试、暂停刷新续练、完成去重、前后卡片尺寸及五档无溢出。实际 dist 在360/390/768/1181/1200/1440宽检查正面评价落盘推进、稳定卡宽高与桌面/手机 Progress 导航；超长释义内部滚动、中文两页360/390/768/1440返回链接通过。HF-08浏览器质量脚本16类页面axe零违规、65档布局及实验室性能检查通过。浏览器收据入上述 evidence；截图及详细质量结果仅留本机 `/private/tmp/hanzifun-ux-browser/`、`/private/tmp/hanzifun-ux-quality/`。
- **遗留问题/边界**：本轮需求无已知未完成项；不替代既有人工内容/音频/完整课程体验、Safari/Firefox/真机与真实读屏验收；未部署、未推送远程，未引入Phase3代码。
- **下一个 Agent 精确切入点**：在本地主目录4173刷新验收 `/flashcards/` 并选择卡组、`/account/`、`/zh/` 和 `/story.html?lesson=ant-moving-bean-02`；后续发布工作继续 `acceptance/phase-1-checklist.md`，不要将本次UI通过当作HF-09完整人工放行。正面评价新行为以用户本轮指令和本记录为准，覆盖旧日志中的先翻后评描述。


### [记录 12] - Phase 1 正式签发与索引放行完成（By Codex，2026-10-26）
- **工作目录/范围**：用户指定Desktop主目录main；以负责人本轮“Phase 1人工验收已完成”声明登记签字并提交；保留既有未跟踪文件，未推送/部署或引入Phase3逻辑。
- **已完成**：126核心字经6批release工具写入逐项哈希签字；107实际语境录音听审登记，19专项scope哈希签收；15支持页面签字，精确发布141个页面。场景文本发布门槛与物理音频拆开，已签字页面移除过期“文字待审”提示，禁播缺音保留。
- **修改文件列表**：`data/editorial/{review-decisions,mvp-acceptance}.json`、`data/scenarios/scenarios.json`；`site/release.json`、`site/hsk-data.mjs`、`site/pages/{dictionary,pinyin-chart,scenarios}.mjs`；`scripts/validate-hsk-data.mjs`；`tests/{dictionary,hsk-scenarios,seo-quality}.test.mjs`；`docs/hanzifun-rebuild/{TASKS,PROGRESS}.md`、`tasks/HF-{02,04,07,08,09}-*.md`；`acceptance/{phase-1,phase-1-checklist,phase-1-signoff}.md`及`evidence/hf09/`生成的gate/review-inventory/manual-scopes、browser/HF06/HF08、HTTP/benchmark与新增phase-1-release.json收据（具体清单以本次git提交为准）。
- **验证**：production构建1546文件；npm test **138/138**；SEO PASS；严格`validate-mvp-gate --browser --require-human`退出0，工程/完整候选均PASS、人工阻断0；四构建确定性、数据/HSK、18项Workers及完整Chrome/八课回归全部通过。production **141可索引页面／141 Sitemap URL**，staging/local为空；私有功能页仍noindex。输入SHA-256 `2c4db69d5f2ca25ffd3d4a7f953850267f46d4424c658f1eb2eb521a2dd770cb`。
- **遗留/诚实边界**：213补充字教学编辑实际仍为空，继续预览并移交HF-14；物理缺音保留missing/按钮禁用。负责人签字依据及未提供详细设备版本的证据限制明确记录，不伪造Codex独立人工观测。现存localStorage容量/冷加载与线上性能边界不变。HF-02/04/07/08/09挂起人工验收正式关闭，Completed/PASS仅适用于本次签发范围；不代表远端已上线。
- **下一个Agent精确切入点**：先读本记录、TASKS、`acceptance/phase-1.md`及`phase-1-signoff.md`，再执行HF-17发布/回滚准备，后续HF-18实际部署/生产冒烟；保持本release索引范围，补充字必须先完成Tier2再哈希签发，不能为放行盲改审批hash。

### [记录 13] - HF-08 学习者HTML与审核管线解耦（By Codex，2026-10-26）

- **范围**：指定主目录main。清理核心/补充字、HSK、场景、拼音表、首页FAQ、学习入口与共享页脚的审核/分级/缺音正文；保留来源许可、简繁语境及联合书写范围。缺音字页/场景省略按钮，拼音表1323个控件使用禁用图标。
- **修改文件**：`site/pages/{dictionary,hsk,scenarios,pinyin-chart,learning,route-stubs}.mjs`、`site/pages/home.html`、`site/site.mjs`；`src/client/{dictionary,learning-entry,audio-player}.mjs`；`scripts/{validate-seo-quality,verify-mvp-browser}.mjs`；`tests/{dictionary,hsk-scenarios,mvp-gate,seo-quality}.test.mjs`；新增 `docs/hanzifun-rebuild/HF-08-LEARNER-COPY-VERIFICATION.md`，更新TASKS和本日志。
- **验证**：139/139测试通过；生产隔离构建1546文件、401英文页（141 index / 260 noindex）、141 Sitemap URL、354核心页“三个国王”及402 JSON-LD通过。新增构建正文门控覆盖折叠内容且允许机器属性，反例覆盖审核词、char键/稳定ID、行号和缺音控件语义。数据、审核输入、release.json、原发布门控及SEO数据契约未修改；107旧录音仍无批准可播绑定。未改未跟踪个人文件、既有dist、课程/媒体、部署或Phase3。
- **遗留问题**：既有浏览器回归因 `listen EPERM 127.0.0.1` 启动失败，备用Chrome工具不可用；本轮不宣称浏览器交互/axe/布局/性能通过。详见正文清理验证。
- **下一个Agent精确切入点**：在可连接Chrome且允许本地监听的环境，以本轮代码重新构建production，运行 `verify-quality-browser.mjs`（输出隔离到临时目录）；抽查发/长多音、拼音筛选及禁用图标、两场景练习，再按HF-17/18流程部署。不要修改release或伪造音频批准来消除正文提示。

- **提交阻断**：按显式文件白名单执行git add失败：`.git/index.lock: Operation not permitted`（当前.git只读）。本轮改动未暂存、未生成提交；后续具备写权限时仅提交上述20个文件，不加入原有个人未跟踪文件。


### [记录 14] - Phase 2 HF-10 补充字盘点与管道规划（By Codex，2026-10-27）

- **目录/范围**：指定主目录main，无worktree。用户明确启动Phase 2，并将本项命名HF-10；记录与原HF-10-auth的区别，本项承接HF-14现存补充字补齐。未引入账号/同步/Billing、未制作故事/媒体或213字正文，未修改源锁/核心字/审批/release。
- **Git同步**：开始时tracked工作区干净，main与现存origin/main均`ada1a1a63caa032aacfc038d27e6702d370102c1`，领先0；两次`git push origin main`均退出128，`Could not resolve host: github.com`。真实远端状态未核验；本轮没有commit或部署。初次收尾因exec-server断连中断，环境恢复后续写本记录和TASKS，不重复生成教学。
- **盘点**：213唯一字全部preview/noindex，hsk-characters.entries为空；基础读音/词典义项、部首/笔画、213笔顺资源及简繁关系已有。九项教学字段各缺213条；29字部件不完整、38字结构未核实、54字有多读音候选，逐字标记保留。来源共同145/仅旧版1（京）/仅新版65/场景2（呼、称），即211字与HSK membership关联，不能把213都称官方HSK字。
- **批次与门控**：两版共同→旧版独有→新版独有→场景，再按联合书写/一级认读/源词头覆盖/源ordinal/Unicode排序；A54/B53/C53/D53，不声称词频。Schema兼容现有扁平字段mnemonic、word/例句及审核元数据；基础/简繁字段由现有ID关联，非重复手填。已有hash人工签字与review-release-batch发布器保留；4制作批次用自定义decisions文件，不能混用旧21字hsk-01..11切片。
- **本包文件列表**：新增 `scripts/audit-phase2-hsk.mjs`、`data/schemas/hsk-teaching-entry.schema.json`、`docs/hanzifun-rebuild/{phase-2-plan.md,hf10-inventory.json,hf10-batches.json}`；修改 `docs/hanzifun-rebuild/{TASKS,PROGRESS}.md`。
- **已完成验证**：npm test **140/140 PASS**；HSK结构验证`validate-hsk-data --no-rebuild` PASS（126+213=339，源映射完整）；Schema接受全部126现有editorial条目，并拒绝九项缺失/纯空白/未快审/未知memoryAid字段。四批ID无遗漏/重复并集213，每字仍未批准preview；`audit-phase2-hsk --check`重现一致。隔离`HF_BUILD_OUTPUT_DIR=/tmp/hf10-production npm run build:production`成功1546文件、260 noindex，未改原dist。独立SEO及个人未跟踪文件hash检查结果见下方收尾补记。本轮没有UI改动，不宣称重跑浏览器/真机/生产冒烟。
- **遗留**：推送DNS阻断；实际远端/生产部署未核验。四批正文0、签发0、转正0；教学注入器只有方案，尚待实现。结构/简繁/多音风险必须在实际教学中逐字处理；缺音不阻断文本，但仍不可播。审计脚本固定本轮213预览快照，首次实际转正后需显式更新基线契约，不得静默重排或覆盖历史批次；teaching=null的当前hash不能用作未来正文签字。
- **下一Agent精确切入点**：读本记录、TASKS及phase-2-plan.md，不进入HF-10-auth。先实现`import-hsk-teaching-batch.mjs`的dry-run/显式apply、批次范围/Schema/读音/含字/覆盖防护/原子写入和实质边界测试；按hf10-batches.json的Batch A54个ID制作经源义核对的原创教学草稿，再注入hsk-characters.entries。正文冻结后重新导出hash审阅包，真实逐字人工批准后release工具dry-run及显式apply，每批验证索引与本机学习闭环后交HF-17/18。网络恢复后重试已授权的Phase1同步；不把本轮盘点完成标为整个HF-10/HF-14完成。

- **收尾补记**：环境恢复后独立SEO校验通过（errors=[]，401英文页、354核心页、402 JSON-LD、141 sitemap URL）；213字审计`--check`再次通过。开始前11个既有未跟踪文件逐项SHA-256一致，计划Markdown本地链接检查及`git diff --check`通过。TASKS与本日志已实际更新。推送再次尝试仍DNS失败，未提交/部署本次产物。


### [记录 15] - HF-10 Phase 2 注入器与Batch A54字正式内容签发（By Codex，2026-10-27）

- **工作目录/授权**：指定Desktop主目录main。用户明确提供54行原始教学数据，并声明已于2026-10-26亲自审核八项正文、授权humanAcceptance=approved及hash签发；本轮未push、未commit、未生产部署、未修改故事/音频/账号/同步/Billing。前轮个人文件与未提交产物保留。
- **已完成**：`inject-phase2-batch.mjs`解析9列PSV、严格对照冻结54字范围与inventory的稳定ID、按metadata匹配底层常用语境readingId并核验Schema/含字/来源与结构风险。默认dry-run；显式apply才备份+临时文件rename写正式hsk-characters。拒绝重复/漏字/跨批字/无效读音/占位文本/无核实说明；相同输入幂等，已发布内容改变则拒绝覆盖。注入器仅导出独立签发文件，现有review-release-batch仍负责真正发布。
- **数据与签字**：54条八项正文与用户PSV原样相同；reviewStatus=human-reviewed、humanAcceptance=approved、reviewDate=2026-10-26。好hao3/少shao3/分fen1/会hui4/了le5/的de5/吗ma5/么me5；子选孩子中的zi5；一yi1/不bu4保留词典本调，原句变调不改。54条编辑层structureReview绑定原components与笔顺sha（实际核对日期2026-10-27、审读者Codex），补齐不完整/未核实形体的可见结构说明；保留原始缺项，不捏造IDS/历史字源。Schema兼容approved与该结构字段，发布门控检查缺失/过期结构hash。负责人声明与边界保存在acceptance/phase-2-batch-a-signoff.md。
- **发布路径**：注入dry-run→apply→发布dry-run→apply均已执行；正式逐字contentSha256绑定完整源字/所有读音/本条教学含形体核实/笔顺/sources.lock。review-decisions新增54项精确签字，release精确54路由published、releaseId改为phase-2-batch-a-2026-10-27；未改全局字典pattern。当前补充字54accepted/published、159preview；核心126与剩余159审批原样，所有audioListening状态不变，原mvp-acceptance输入不变。
- **显示/学习接入**：字页Information消费结构编辑层；助记显式为学习联想，非历史字源。新建单字/HSK组卡主音与正文读取教学条目，保留所有稳定cardId及旧冻结会话。搜索使用同一教学主音/英义，补例词别名并移除搜索中的import draft/preview标签，不泄露状态管线词。
- **修改/新增文件列表**：
  - 新增 `scripts/inject-phase2-batch.mjs`、`scripts/verify-phase2-batch-browser.mjs`、`tests/phase2-injection.test.mjs`。
  - 新增 `data/editorial/phase2/{batch-a.psv,batch-a-review.json}`；更新 `data/schemas/hsk-teaching-entry.schema.json`、`data/editorial/{hsk-characters,review-decisions}.json`。
  - 更新 `site/{publication-review,hsk-data,learning-data}.mjs`、`site/pages/hsk.mjs`、`site/release.json`、`scripts/build-site.js`；调整原 `tests/{mvp-gate,seo-quality}.test.mjs` 的合成夹具隔离及195页发布断言。
  - 新增 `acceptance/phase-2-batch-a-signoff.md`、`evidence/hf10/{batch-a-release,batch-a-verification}.json`；更新TASKS、PROGRESS、phase-2-plan。执行原MVP门控会更新evidence/hf09的gate/review-inventory/manual-scopes/learning-benchmark当前回执，原Phase1签发文档不改，原始回执可由Git ada1a1a追溯。
- **验证结果**：最终数值与命令见下方收尾补记及evidence/hf10/batch-a-verification.json；Schema54/54、全54页八项原文/主音/结构说明静态DOM回归、源HSK/data验证、生产/staging/local四构建与确定性校验均执行。主dist按用户请求以`HF_SITE_ENV=production npm run build:site`构建；仅local production包不等于线上部署。
- **完整门控限制**：`validate-mvp-gate.mjs`实际退出1，唯一工程失败项workers-http，因为127.0.0.1 listen EPERM。普通本地浏览器脚本同样受端口限制；改为不监听端口的Playwright本地文件请求响应方案后，Chrome仍启动即退出（Target closed），真实页面/交互验证0，不伪报通过。MVP同时记录Browser E2E未运行、pinyin-teaching及audio-listening专项scope签字不匹配（audio scope包含整个review-decisions文件，文本签发也会改变其hash）；没有据此伪造音频/拼音复审或改写原专项批准。54字文本哈希签发和195页静态索引已通过，不代表完整运行验收PASS；生产部署待HF-17/18。
- **下一Agent精确切入点**：先读本记录、TASKS和phase-2-plan当前实施记录。待用户提供B/C/D的PSV及本批审核声明后创建独立metadata（新batchId、实际读音/结构核对、证据），用inject-phase2-batch默认dry-run→显式apply导出decisions，再用review-release-batch签发；不可复制A批准当作后批授权，不重排冻结字表。制作前inventory/batches是初始快照，不能覆盖为实时报告；原audit脚本全213字preview断言不再适用。可用运行环境中执行HF10浏览器复验与完整MVP Workers检查；专项scope的旧hash边界需按真实证据收口，不为追求绿灯批量刷新。保留原缺音/未听审状态，下一批目标仅53个对应ID。

- **收尾补记**：最终`npm test`（由MVP脚本实际调用）**149/149 PASS**；`HF_SITE_ENV=production npm run build:site`成功1546公开文件、401英文页（**195 index / 206 noindex**），`node scripts/validate-seo-quality.mjs` PASS（195 sitemap URL、354核心页、402 JSON-LD，errors=[]）。Schema54/54、八项字段PSV逐值往返原样、54条签字/结构hash校验、搜索显示无管线标签、重复注入changed=false均通过。MVP内tests/benchmark/data/HSK/四环境构建与生产重复hash一致均PASS，staging/local sitemap=0；总门控**FAIL / exit1**仅workers-http因listen EPERM，浏览器启动失败不可验收，未忽略错误。11个原个人未跟踪文件SHA-256一致，所有126核心及剩余159字决策、所有audioListening和原专项签字输入保留；git diff --check通过。本轮未push/commit/部署。

### [记录 16] - HF-10 Batch B/C/D 预检与结构映射管道完善（By Codex，2026-10-27）

- **工作范围**：在指定主目录main继续HF-10 Phase 2；未push、未commit、未部署，未覆盖根目录用户提供的`batch-b.psv`/`review-b.json`及其他未跟踪个人文件。
- **注入器改进**：`scripts/inject-phase2-batch.mjs`新增独立`--reading-selections`和`--structure-notes`输入，检查映射不越过冻结批次、结构核对者/日期有效；schema允许精确描述`习`的`upper-right-enclosure`可见布局。增加独立映射/越批拒绝测试。
- **Batch B预检**：现有53行PSV通过完整dry-run，稳定characterId共53、Schema/字词包含/读音归属/结构说明均通过。12个歧义字主音映射见`data/editorial/phase2/batch-b-reading-selections.json`；16个结构需核实字说明见`batch-b-structure-notes.json`。发现`五|星期五|星期五|...|Friday|...`：meaning列误填成例词，正确核心义应表达“five”。因此未apply、未导出签发包、未改变B路由或任何内容hash审批；原审批hash不能覆盖修订内容。
- **批次材料缺口**：未找到Batch C/D的53行教学PSV和各自真实审核声明。没有编造正文或仿用A/B签字；B/C/D的159条路由维持preview。
- **文件**：修改`inject-phase2-batch.mjs`、`hsk-teaching-entry.schema.json`、`tests/phase2-injection.test.mjs`；新增B批读音/结构映射；更新`TASKS.md`、`PROGRESS.md`、`phase-2-plan.md`。运行MVP门控更新`evidence/hf09/{gate,review-inventory,manual-scopes,learning-benchmark}.json`当前回执。
- **验证**：`npm test` **151/151 PASS**；`HF_SITE_ENV=production npm run build:site` PASS，1546 public files、401英文页，其中195 index/206 noindex；`node scripts/validate-seo-quality.mjs` PASS，195 sitemap URL、402 JSON-LD、errors=[]。`node scripts/validate-mvp-gate.mjs` **FAIL / exit 1**，tests/benchmark/data/HSK及production/repeat/staging/local构建通过，唯一工程失败为workers-http监听`127.0.0.1`返回`EPERM`；完整候选因此FAIL。当前SEO与sitemap数字只覆盖已签发Batch A。本轮未做浏览器成功验收。
- **精确切入点**：先修订Batch B“五”的meaning并获得变更后内容的真实签字；用上述两份映射文件再次dry-run，确认后才apply/release。提供Batch C/D九列PSV和本批独立审核元数据后按冻结ID批次依次处理。保持当前无越权写入，最终再跑四项命令与可用环境的Workers/浏览器验收。

### [记录 17] - HF-10 后续批次文件复查与门控复跑（By Codex，2026-10-27）

- **文件复查**：用户表示B/C/D修订正文和独立审核配置已准备。本轮按指定主目录检查普通/隐藏匹配文件、仓库根目录和`data/editorial/phase2/`最近文件；仍只有`batch-b.psv`与`review-b.json`，没有Batch C/D输入。B文件中“五”的meaning仍是“星期五”。没有覆盖或改写这些源文件，没有执行apply/release。
- **验证复跑**：`HF_SITE_ENV=production npm run build:site` PASS（1546文件、401英文页、206 noindex）；`npm test` **151/151 PASS**；`node scripts/validate-seo-quality.mjs` PASS（195 sitemap URL、402 JSON-LD、errors=[]）。`node scripts/validate-mvp-gate.mjs` **FAIL / exit 1**，唯一失败workers-http，因为`127.0.0.1`监听返回`EPERM`；其余tests/benchmark/data/HSK及production/repeat/staging/local构建通过。当前本地release仍是`phase-2-batch-a-2026-10-27`，B/C/D各53字均preview。
- **下一个动作**：将用户的修正版PSV及B/C/D各自配置文件放入指定工作目录（包含读音选择、完整结构说明、独立审核者/日期/依据）；重新核验内容后逐批注入、单独hash签发与release。本地文件到位前不生成缺失正文或签字。

### [记录 18] - HF-10 Batch B/C/D 注入与独立签发（By Codex，2026-10-27）

- **工作范围**：使用用户本轮粘贴的修订后Batch B、Batch C、Batch D正文及各自审核配置；不尝试git push，不commit或部署。
- **独立注入与签发**：B/C/D各53字分别使用独立PSV、审核JSON、读音映射、structureNotes与release决策文件完成校验、注入、内容哈希签名及发布。Batch B「五」meaning为`five`。decision批次ID分别为`hf10-phase2-b/c/d`，签发数各53；Batch A 54字原签名保留。四批审核总数213，逐字内容完整且当前哈希匹配。
- **发布状态**：`site/release.json` 更新为`phase-2-hf10-a-d-2026-10-27`；213个补充字published。生产构建生成1546公开文件、401个英文页（354 index/47 noindex），Sitemap 354条。线上实际部署尚未验证。
- **验证**：`npm test` **151/151 PASS**；`HF_SITE_ENV=production npm run build:site` PASS；`node scripts/validate-seo-quality.mjs` PASS，354条Sitemap URL、402 JSON-LD、`errors=[]`。`node scripts/validate-mvp-gate.mjs` **FAIL / exit 1**：tests、benchmark、data、HSK、production重复构建、staging和local均PASS；唯一失败Workers HTTP，Node在`127.0.0.1`监听返回`EPERM`。Chrome浏览器验收仍未完成，因此不记为全部门控全绿。
- **文件**：输入和独立配置位于`data/editorial/phase2/batch-{b,c,d}*`；hash签发记录位于`docs/hanzifun-rebuild/evidence/hf10/batch-{b,c,d}-release.json`；更新`data/editorial/hsk-characters.json`、`data/editorial/review-decisions.json`、`site/release.json`、`tests/seo-quality.test.mjs`及本日志、`TASKS.md`、`phase-2-plan.md`。注入器支持独立读音/结构映射输入。
- **精确切入点**：在允许本机回环监听并具备浏览器的环境中重跑Workers HTTP和浏览器复验；继续核验本地release与线上部署状态。B/C/D已无需再次注入或复签，原三份批次决策保留各自内容哈希。


### [记录 19] - Phase 2 HF-11 音频与 HF-12 场景/二级核心工程（By Codex，2026-10-27）

- **范围/命名**：指定 Desktop 主目录main，保留开工时HF-10及其他所有未提交/个人文件。用户本轮HF-11/12定义与历史同步/文化工具不同，新建任务说明单独承接；未进入账号/云同步/Billing、故事生产或生产部署，未commit/push。
- **HF-11资产**：盘点410音节/1323原禁用声调控件；源固定到davinfifield/mp3-chinese-pinyin-sound commit `aa25ecce7b7fb02757b2c2b8e3c01aa975812edc` / Unlicense。1325读音映射、1268原样MP3（25,028,239 bytes）逐条核验源Blob与本地SHA-256；ü→上游uu/内部v显式映射，lu/lü不混音。表内55候选和另2额外读音采用CEDICT词境的中文设备语音示例；738词句映射也用设备声线。旧音频audioListening和旧批准均未改，不把源映射称人工听审。
- **HF-11交互**：共享发音模块接拼音、339字详情各读音、例词/句、HSK词表、5场景及动态闪卡。单一播放、停止、换读音/卡片/离页停止、静态错误回退、voiceschanged等待、加载超时、过期事件隔离、缺中文声线可重试；不使用英语或粤语读拼音。构建只复制精确manifest白名单并核验文件hash，不读凭据/调用TTS。
- **HF-12内容/内链**：独立新增机场/酒店/超市各5句（共15句），逐句token拼音/英译与真实收藏/组卡/练习；全部组成字已有详情。新增86个HSK2.0（2015）二级增量词，来自已锁XLSX的150条源事实并限定现有字页覆盖，64条延期；不是全量二级/不是HSK3.0二级。字页↔场景↔词表锚点↔原稳定cardId互链，修复原token练习返回只到页顶，现精确回到并展开`#token-id`。
- **放行/审核边界**：新增`/academic/hsk-2/level-2/`独立来源词表页published，354→355条Sitemap。新场景单独AI快审、人审pending，三条精确路由保持preview/noindex，未继承Phase1餐厅/商务批准。已生成含15句和正文hash的人工签收包；其他状态不变时，真实签收后可增到358。原339字/HF-10各批签名未改。
- **文件清单**：
  - 新增 `data/audio/pronunciation.json`、`audio/pronunciation-v1/*.mp3`（1268）、`data/licenses/Pinyin-Audio-Unlicense.txt`、`data/editorial/phase2/scenarios.json`、`data/hsk/level-2-core.json`。
  - 新增 `site/{pronunciation,phase2-content}.mjs`、`src/client/pronunciation.mjs`、`scripts/{prepare-pronunciation-assets,produce-pronunciation-assets,build-level-two-core,verify-phase2-audio-browser}.mjs`、`tests/phase2-audio-scenarios.test.mjs`。
  - 修改 `site/{hsk-data,learning-data,seo}.mjs`、`site/pages/{dictionary,hsk,learning,pinyin-chart,scenarios}.mjs`、`site/public/site-styles.css`、`site/release.json`、`src/client/{dictionary,guest-learning,hf07}.mjs`、`scripts/build-site.js`、`tests/{dictionary,seo-quality}.test.mjs`；只在原HF-10未提交文件上追加本轮范围，不撤回其已有改动。
  - 新增 `tasks/HF-11-audio-phase2.md`、`tasks/HF-12-scenarios-level2-phase2.md`、`HF-11-HF-12-VERIFICATION.md`、`acceptance/phase-2-hf12-language-review.md`、`evidence/hf11/`与`evidence/hf12/`；更新TASKS/PROGRESS。
- **验收**：`HF_SITE_ENV=production npm run build:site` PASS（2824公开文件、409英文页、355 index/54 noindex）；`npm test` **159/159 PASS**（新增8项含资产hash、声线选择/失败/竞态、源重建、场景和独立审核边界）；SEO PASS（355 Sitemap URL、358核心SEO页、410 JSON-LD、errors=[]）；二级离线重建check及diff空白检查通过。Chrome155实际全部1268 MP3解码且非静音（0.5746875–2.481625秒）；7类页面axe零违规、21档布局无溢出，录音/保存飞机2字/场景练习与评价/闪卡播放/返回原token/字典返回真实通过，回执与两张截图持久化在evidence/hf11。
- **遗留/不可冒充**：腾讯云实际API探测及备用区域/浏览器请求TLS均报wrong version number，未成功生成音频；headless Chrome中文声线列表为空，真实设备TTS和人工逐条听审未过，不能称所有物理录音完整。未补造humanAcceptance或刷新历史MVP总门控签字。本轮只声明上述三项命令与本轮浏览器检查通过，不把旧MVP回执失败抹掉；无Safari/Firefox/真机/真人听审或线上冒烟结论。
- **下一个Agent精确切入点**：先读本记录、TASKS和新HF-11/12任务文件。接口网络恢复后用`node scripts/produce-pronunciation-assets.mjs --apply --synthesize`显式补录（构建/播放器已支持合成词句资产）；验收语音与人审，不用英文拼音或静音文件凑数。按`acceptance/phase-2-hf12-language-review.md`取得真实15句人工签收，绑定本批正文hash，再只发布airport/hotel/supermarket三条路由并复跑构建/测试/SEO和脚本浏览器；HSK3.0二级与剩余64词另行扩充，不改原HF-10签发。实际部署仍走HF-17/18。


### [记录 20] - HF-02 双「睛」身份与音频校验加固（By Codex，2026-10-27）

- **范围**：指定主目录main，承接用户唯一失败排查。保留已有HF-10/11/12未提交成果与个人文件；未扩充内容、改录音/源锁/审核数据、启用新场景索引、提交、推送或部署。
- **排查结果**：用户报告测试`108 positions reconstruct legacy source and both 睛 cards share one identity and audio`出现`char:773c5b`；修改前该文件11/11已通过，本机未复现，不能断言原始失败来自哪份文件/环境。检查characters.js、生成器、legacy-occurrences、normalized/audio与audio-manifest：第19/87位均绑定`char:775b` / `reading:char:775b:jing1` / `audio:tts-v1:775b`，共享`audio/tts-v1/019-775b.mp3`；`char:773c`为「眼」，两字应保持不同身份。
- **修改**：`scripts/validate-data-foundation.mjs`从原始字形推导expectedId，分别校验characterId/itemId/reading/audio归属，错误包含明确字段与教学位置；额外检查双睛共享音频存在、归属正确、URL与旧manifest一致。正式映射本来正确，未做错误ID别名或把眼/睛合并。
- **回归**：`tests/data-foundation.test.mjs`在原用例内核验眼/睛Unicode身份、两卡item/reading/audio和实际共享URL；通过深拷贝负例拒绝`char:773c`、`char:773c5b`、错itemId、错读音及错音频。异常值仅用于测试夹具，绝不写入正式字库，测试总数仍159。
- **验证**：`node --test tests/data-foundation.test.mjs` **11/11 PASS**，包括两次离线重建逐字节一致；`HF_SITE_ENV=production npm run build:site && npm test`完整顺序执行，退出0，构建2824公开文件/54 noindex页，全量 **159/159 PASS**（0 fail、skip、cancelled）。`git diff --check`在收尾检查。本轮无前端改动，不重复声称浏览器/真人听审或旧完整MVP通过。
- **本轮文件**：`scripts/validate-data-foundation.mjs`、`tests/data-foundation.test.mjs`、`docs/hanzifun-rebuild/TASKS.md`、`docs/hanzifun-rebuild/PROGRESS.md`。
- **遗留与下一Agent精确切入点**：本轮主目录已全绿；若其他会话仍出现旧失败，先核对实际cwd/分支/Node版本与完整断言堆栈，区分负例预期异常与测试最终失败，不能把`char:773c5b`设成合法别名或改正式775b身份。HF-11的腾讯云补音/真实设备TTS和HF-12三场景独立人工签收继续按记录19处理，本轮没有关闭这些边界。


### [记录 21] - Phase 2 Owner 收口签收与学习记录/五行卡片修复（By Codex，2026-10-27）

- **目录与范围**：按用户要求在 `/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun` 的 `main` 修改，开工 tracked 干净；既有未跟踪个人文件保留。本轮以 Owner 新决定取代记录19/20中的新场景待签收、真机听审待补和腾讯云补音阻塞，不改写历史原始事实；没有账号、云同步、Billing、故事课或源字库扩充。
- **HF-12 正式签发**：Owner 已独立完成三场景15句人工语言审核与真机验收。`data/editorial/phase2/scenarios.json.review` 和 release 的三个精确 `pageReviews` 绑定正文 SHA-256 `1472b2c4a10d0875bb966b1ccad11dfe62f07c08a41d1ef19dd2563cf7d6788e`（原文未变），人、日期、证据落盘。机场/酒店/超市路由 published / index,follow；通用构建与 SEO 门控共享独立签名校验，待审/缺字段/正文变化均拒绝发布，不沿用旧餐厅/商务签字。releaseId=`phase-2-closeout-2026-10-27`。
- **HF-11 策略锁定**：Owner 真机实际试听已通过；1268静态MP3 + 中文设备语音平滑回退是当前阶段正式交付。剩余57读音与738组词句不补腾讯云，历史TLS不再阻塞。独立 [正式音频签收](acceptance/phase-2-hf11-audio-signoff.md) 及 JSON 绑定现有manifest原始字节SHA-256 `58bdd2386b941176c56dbceaf1601a73a0c29acb9d9993b4373a802cbe882aa6`；不把整体实际体验签收扩大成每个候选逐条音准批准，不伪造57份静态音频，旧逐项听审审计字段保留历史含义。
- **范围解耦**：86个现有HSK2.0二级词数据原样保留，剩余64词明确 Deferred / Backlog、后续阶段再补，与当前HF-12交付解耦；HSK3.0二级不在范围。
- **学习 UI**：清理来源key/raw JSON/冗长管线文案，按统计、复习、续练、历史和导入分组，旧数据折叠查看；按钮统一边框/背景/hover/active/focus态。增加历史轮次新建自由练习，旧完成记录保留；分页8条且首尾正确禁用。卡组预览截为前8字。导入导出/清空确认/恢复入口保留，Repository、LocalStorage键、事件、调度和队列恢复代码未改。
- **五行 UI**：在 `/tools/zodiac-elements-calculator/` 原模板补齐金木水火土五张卡，桌面等宽五列、中屏3+2居中、手机2+2+1居中；含拼音、Metal/Wood/Water/Fire/Earth、部件变体及钱/林/清/秋/地例字。金、土未有独立字典页，卡内按钮分别链接已签发的钱、地；十条单字链接均HTTP200且index,follow，未制造不存在的详情页，也未将计划中的计算器解锁索引。
- **本轮文件清单**：
  - 发布/数据：`data/editorial/phase2/scenarios.json`、`site/{release.json,hsk-data.mjs,seo.mjs}`。
  - 展示：`site/pages/learning.mjs`、`src/client/guest-learning.mjs`、`site/site.mjs`、`site/public/site-styles.css`。
  - 回归：`tests/{phase2-audio-scenarios,seo-quality}.test.mjs`、新增 `scripts/verify-phase2-closeout-browser.mjs`。
  - 签收与交接：`acceptance/phase-2-hf12-language-review.md`、新增 `acceptance/phase-2-hf11-audio-signoff.{md,json}`、`tasks/HF-11-audio-phase2.md`、`tasks/HF-12-scenarios-level2-phase2.md`、`HF-11-HF-12-VERIFICATION.md`、`TASKS.md`、本日志。
  - 证据：新增 `evidence/phase2-closeout/{verification,guest-browser,ui-browser}.json` 与学习记录/五行桌面及手机四张PNG。上述文档相对目录均为 `docs/hanzifun-rebuild/`。
- **依次执行门控**：`HF_SITE_ENV=production npm run build:site` PASS，2824公开文件/409英文页，358 index/51 noindex；`node scripts/validate-seo-quality.mjs` PASS，358 Sitemap URL（精确含三个新场景）/358核心SEO页/410 JSON-LD，`errors=[]`；`npm test` **161/161 PASS**，0 fail/skip/cancel。新增五行卡片完整性及全部链接已批准断言、场景独立签名过期拒绝和音频方案签收manifest匹配检查；原MVP/HF06测试保持通过。`git diff --check`通过。
- **本地浏览器**：实际Chrome155，隔离访客上下文，不操作Owner存储。原`verify-guest-browser.mjs`18项全PASS（双标签/锁降级/迁移原key保留/备份与取消清空/恢复/真实配额失败/刷新和关页续练等）；本轮脚本5组交互PASS（9轮历史8/1分页、续练保留cursor/queue、自由重练不覆盖旧会话、设置/导出、全部五行链接及键盘激活）。3页×360/390/768/1100/1440共15档无溢出，3页axe WCAG A/AA零违规，页面错误0；桌面/手机截图已实际查看。原浏览器脚本硬编码旧日期，本轮摘要显式记录实际执行日，未冒充旧回执。
- **遗留与精确下一步**：本轮五项请求已完成，没有腾讯云或64词阻塞。真实线上部署尚未执行，本地发布配置与生产dist已准备；后续若执行发布，从HF-17/18核对本releaseId、既有部署配置及生产冒烟开始，不再重复场景人工签收或主动生成腾讯云音频。64词/HSK3.0二级仅按后续明确范围处理。旧Workers/MVP总门控失败回执保持历史，不据本轮三项全绿声称重跑了完整MVP/所有浏览器或线上验收。本轮未commit/push/部署。


### [记录 22] - Phase 2 收口实际部署、线上索引核验与GitHub同步（By Codex，2026-10-28收尾）

- **范围/授权**：继续指定Desktop主目录main。Owner明确授权生产构建/校验、Cloudflare部署、线上Sitemap与新场景索引检查、GitHub远端同步。未使用worktree执行部署，个人未跟踪文件全部保留；没有账号/同步/Billing、故事内容修改、腾讯云补音或64词扩充。
- **发布前**：实际GitHub main=c3e7ac3，与本地基线一致；实际生产Sitemap355条。现有Worker hanzifun上一100%版本为`6b11b7a8-303d-40c3-9c69-91d7b38eb15d`，已保存用于回滚。Wrangler4.153.0读取既有认证，未输出或上传凭据。
- **门控与冻结**：再次依次执行`HF_SITE_ENV=production npm run build:site`、SEO质量检查、`npm test`，全部退出0：2824公开文件/409英文页（358 index、51 noindex），SEO errors=[]，161/161 PASS。建立`releases/phase-2-closeout-2026-10-27/{manifest.json,ACCEPTANCE.md,ROLLBACK.md}`；全部构建文件的有序指纹汇总SHA-256为`1797c8ab85c0aedfb674e30d3d808dc08803ea34cbc6fafffcb2ae7348c23793`，Wrangler重新构建后仍一致。逐文件指纹仅保留忽略的`.cache/releases/phase-2-closeout-2026-10-27/`。
- **代码提交/实际部署**：`c047d1c`（release: publish Phase 2 scenarios and refine learning UI）包含此前29文件的内容/样式/签收/证据及回滚包。`wrangler deploy --name hanzifun --strict --keep-vars --message 'Phase 2 closeout: 358 indexed URLs; c047d1c'`成功；上传27变更资源，2795复用。版本`cd058ccd-a054-440f-b180-6fb6db6f9cd6` 100%流量；实际部署时间2026-10-27 **23:58:57 +08:00**，不把跨午夜收尾日期误作部署日。
- **线上秒级核验**：2026-10-28 **00:00:00 +08:00**保存回执；并发HTTP全检查2087ms。`https://hanzifun.online/sitemap.xml` 200、358唯一URL且原始字节与本地完全一致；机场/酒店/超市均200、HTML robots=`index,follow`、self canonical、在Sitemap中、正文hash与本地一致，响应未带noindex。线上CSS与guest-learning模块hash匹配；学习记录页200且保持noindex，五行五卡已上线，首页/zh为200，index.html→zh为301，robots Allow /。音频Range请求实际返回200完整24349字节MP3，SHA-256匹配本地，不冒充206；没有因此重生成资源。这里核验的是可索引配置，不是Google已收录。
- **GitHub**：`git push origin main`成功，c3e7ac3→c047d1c，无强推；最终再提交本轮部署回执/交接文档并同步远端，以最终main HEAD为准。
- **本轮新增/修改文件**：新增`docs/hanzifun-rebuild/releases/phase-2-closeout-2026-10-27/{manifest.json,ACCEPTANCE.md,ROLLBACK.md,deployment.json,online-verification.json}`；更新`docs/hanzifun-rebuild/{TASKS,PROGRESS}.md`。前29文件清单见记录21及c047d1c；线上核验临时脚本/日志存/private/tmp，未将凭据或个人文件提交。
- **未做/下一Agent精确切入点**：本次3项请求已实际执行；24小时/7天及搜索引擎收录观察未完成，Owner可按需跟踪，无自动化任务。上一版本回滚参数已核实，未主动将生产切回旧版做演练。后续先读本记录和release目录deployment/online-verification，以部署版本和生产实际为基线；不要重新部署旧355包，不重做已签收场景或主动生成腾讯云补音。64词仍Deferred。


### [记录 23] - AdSense 内容与信任整改本地候选（By Codex，2026-10-28）

- **目录/授权**：本聊天指定worktree `/Users/graceshi/.codex/worktrees/6039/汉字饭hanzifun`；开工git干净。Owner要求按Blocker→High→Medium整改方案、800–1500词原创深化、18项Unknown确认及复检清单，并直接产出可做的成品。未部署、提交、推送或操作AdSense后台，无账号/同步/Billing/故事修改。
- **官方核实**：读Google申请资格/页面准备/隐私必备内容/ads.txt/EEA-UK-Switzerland CMP及当前TFAT说明；工具ADS编号与“必拒”/页数字数阈值不是官方个案结论。Agent Reach Jina读取因DNS失败，改内置web官方来源核对；本站在线读取失败，因此线上问题以Owner报告为证，不伪称重新爬全站。
- **工程/内容**：共享头改一棵响应式nav，移动折叠/桌面恢复、Tab/Escape及无JS可读；去顶部预览Sign in/Pricing与重复推广，首页中段改学习指南。页脚增加Privacy/Terms/About/Contact/Sources。339字页加面包屑。场景入口完整三轮对话+音频+用法/修复交流/学习路线；快/六/星各独有解释、3句语境音频、辨析、书写和自测，插在笔顺工具前；两篇新指南（12分钟学习和易混字方法）及成型Blog入口。新讲解不编造字源，不把助记当历史，不继承旧人工签字范围；原教学/音频/场景签名原样。
- **信任/广告**：四信任页实质正文位于trust.mjs，政策明确当前无广告、本地记录/删除/技术交付/设备声线可能在线/未来Google第三方Cookie和退出/地区同意/儿童。`site/publisher.json`主体/邮箱/pub-ID仍空，已向Owner询问，不造公司/邮箱。Contact如实说明渠道待核实；四页原preview/planned/noindex不自动转正。真实pub-ID可生成根ads.txt，空值不生成、占位/错误拒绝，不加载广告。没有自制假CMP或装成已经获得同意；儿童/中文故事保持无广告。
- **文件清单**：
  - 修改 `scripts/build-site.js`、`site/{site.mjs,release.json}`、`site/pages/{home.html,scenarios.mjs}`、`site/public/site-styles.css`、`src/client/navigation.mjs`、`tests/{site-shell,seo-quality}.test.mjs`。
  - 新增 `site/{editorial-content,adsense}.mjs`、`site/publisher.json`、`site/pages/trust.mjs`、`site/content/adsense/{kuai,liu,xing,scenarios,study-routine,confusions}.html`；`scripts/{audit-adsense,verify-adsense-browser}.mjs`、`tests/adsense.test.mjs`。
  - 新增 `docs/hanzifun-rebuild/ADSENSE-REMEDIATION-2026-10-28.md`及`evidence/adsense-2026-10-28/{content-audit,verification,summary}.json`、两张实际手机PNG；更新TASKS/PROGRESS。
- **验证**：离线npm ci成功（8依赖、0漏洞）。第一次全量测试160/161中HF12源复现因worktree缺忽略缓存失败；从已知Desktop主目录复制HSK-2015.xlsx和cedict.gz之前按sources.lock SHA-256核验一致，不改源或放宽测试。最终**163/163 PASS**，0fail/skip。最终隔离生产构建 `/private/tmp/hanzifun-adsense-build` 成功2826文件、411英文页（361 index/50 noindex）；SEO core358/JSON-LD412/Sitemap361/errors=[]，资源预算通过。内容审计六页main词数依次scenarios1451/快1248/六1209/星1192/学习1127/辨析1059，排除nav、hidden、脚本与按钮；新原创片段均800–1500，字数不是Google门槛。
- **浏览器**：沙箱初次127.0.0.1监听EPERM，使用受审查允许的隔离Chrome156本地服务完成，不用Owner浏览器数据。十二类页×360/390/768/1100/1440共60档零溢出，axe WCAG A/AA零违规、pageErrors=[]；移动菜单键盘/关闭焦点返回/切回桌面、三例音频绑定与答案展开、无JS正文/导航通过。第一次桌面恢复断言早于异步媒体查询事件，补等待事件后通过，未改产品来掩盖。最终讲解移位后的同范围复验通过；两张手机截图实际查看。没有宣称真人听审新例句、Safari/Firefox/真机、CMP同意时序或线上验收。
- **遗留与精确下一步**：先读本记录、TASKS与ADSENSE整改文档。Owner提供真实operatorName/contactEmail后填publisher.json，核对政策与实际服务，再明确四信任页发布状态；pub-ID从本人后台取得后填真实值并验证线上ads.txt。336/339字页尚未达到本次800词编辑目标，不能称全部已整改，也不能按词数直接判违规；按审计清单优先日常/HSK核心，再做五个场景叶页及两个子入口，新增对话另行语言复核。后台资格、唯一账号、域名/验证、CMP/儿童广告与18项自查按文档执行。部署需走HF17/18重新核对当前候选，不复用旧生产releaseId；本轮没有上线、commit/push、新增录音或替用户完成后台确认。

### [记录 24] - Owner运营署名与邮箱接入四信任页（By Codex，2026-10-28）

- **授权/目录**：继续本聊天worktree；Owner明确提供公开署名John Ling、邮箱hanzifun.online@gmail.com，完成记录23缺失信息。未代发邮件、未声称独立验证邮箱所有权或收信能力，未部署、提交或推送。
- **修改文件**：`site/publisher.json`写入上述精确值；`site/release.json`的/about/、/contact/、/privacy/、/terms/四精确路由改published。统一trust模板自动生成署名与mailto链接，Contact不再出现缺少公开地址提示。`tests/seo-quality.test.mjs`同步四页索引数量；更新ADSENSE整改文档、TASKS、PROGRESS及evidence/adsense-2026-10-28/{content-audit,summary,verification}.json与手机截图，新增identity-verification.json。
- **验证**：隔离生产构建成功2826文件、411英文页（365 index、46 noindex），Sitemap365；163/163测试PASS，0fail/skip。逐页检查四页John Ling、mailto、index,follow和Sitemap成员一致，SEO errors=[]。Chrome156十二类页axe零违规、60档无溢出、菜单/焦点/无JS复验通过，pageErrors=[]；隐私页手机截图更新。
- **遗留/下一切入点**：署名/邮箱资料缺口已关闭，不应再次索要。Owner自行确认可收信并审读政策；pub-ID、AdSense后台、CMP/适用广告配置、其余内容深化及生产部署仍按整改方案接续。四页当前是本地published，不代表线上已更新。原记录23的空值/361 URL是当时历史，现由本记录365 URL取代。


### [记录 25] - AdSense整改实际生产发布与GitHub同步（By Codex，2026-10-28）

- **授权/目录**：Owner明确要求生产构建、校验、部署Cloudflare、推送GitHub并更新TASKS/PROGRESS。在当前6039 worktree实施，没有修改Desktop主工作树或清理其他个人文件，无账号/同步/Billing/故事内容改动。
- **发布前实际状态**：GitHub main=`08c36ef`与本地基线一致（领先/落后0）。当前Cloudflare版本是`3167ce5a-c87c-4405-88f1-a3eac7722b9f`，不是记录22中的cd058ccd；已读实际版本资源配置（静态资源、无bindings、原404/redirects保持）及线上Sitemap358、隐私页原noindex，并以实际3167版本作为回滚目标。
- **门控/冻结**：本次再次执行生产构建、npm test、SEO和AdSense内容审计，全部退出0：2826文件/411英文页（365 index/46 noindex），163/163测试，SEO和内容审计errors=[]。冻结全部文件指纹SHA-256=`0e56f0cb120777dc1a34f675f8d50ac64cede245e9701425b38120b82dd0ffa7`；Wrangler部署重建后指纹仍一致。浏览器复用前轮最终候选Chrome156的12类/60档验收，没有声称本轮重新做全设备或课程视听验收。
- **提交/部署**：从detached HEAD创建`codex/adsense-release-2026-10-28`，源码与整改/证据/发布准备共34文件提交`ff748a21cabd3bdd634fe12f4fa653220fe3d7fa`。Wrangler4.153.0使用既有认证，`deploy --name hanzifun --strict --keep-vars`成功，上传415资源/2409复用。版本`e7ad777b-73c2-421d-9d7c-fa0758ec6374`，deploymentId=`91f282e9-ad9d-4705-b78b-057b7f65536b`，100%流量，实际时间**2026-10-28 13:09:39 +08:00**。
- **生产复检**：2026-10-28 13:10:18 +08:00完成23项HTTP检查，耗时2172ms、errors=[]。首页、四信任页、三字页、场景入口、Blog两新指南/入口、原三新场景、账号/中文入口、robots/Sitemap的响应正文hash与候选一致；新四页署名John Ling、mailto邮箱、index,follow、自指canonical及Sitemap成员正确。线上Sitemap365；账号保持noindex；旧index/故事入口301及query保留，未知页404。音频Range实际响应及字节hash匹配，未冒称新听审。这里验证可索引配置，不是Google已实际收录。
- **GitHub**：再次fetch main并验证origin/main是当前HEAD祖先后，非强推`git push origin HEAD:main`成功，08c36ef→ff748a2。最终发布回执/交接文档再单独提交推送，以最终远端main HEAD为准。本worktree用codex分支；Desktop主目录local main仍旧08c36ef，没有擅自改它，后续需要在干净状态快进origin/main。
- **本轮文件**：新增发布目录`releases/adsense-remediation-2026-10-28/{manifest.json,ACCEPTANCE.md,ROLLBACK.md,deployment.json,online-verification.json}`，更新TASKS/PROGRESS、ADSENSE整改文档及evidence摘要部署状态；内容/代码文件清单见ff748a2和记录23/24。完整指纹与临时日志位于忽略.cache及/private/tmp，没有提交凭据。
- **遗留/精确下一步**：本次三项要求已执行。336字页/场景深化、真实pub-ID、AdSense审核和适用地区CMP按ADSENSE整改方案继续；当前仍无广告，不把此次上线当作AdSense通过。24小时/7天和Google收录由Owner按需观察，无自动化。回滚目标与支持参数已核实，未主动把生产切回旧版演练。后续以本发布目录实际版本/线上回执为基线，不再部署旧358包或重复索要署名邮箱。


### [记录 26] - 公开学习索引、根练习纸与Chinese Culture导航实际发布（By Codex，2026-10-28）

- **Owner新决定**：明确开放Kids、故事介绍、练习纸、Flashcards入口索引；练习纸移到根分支；Learning guides导航改Chinese Culture下拉进/tools/和/blog/。沿用同一聊天此前明确的生产构建/校验/Cloudflare部署/GitHub同步授权，开工工作区干净、当前分支codex/adsense-release-2026-10-28。没有重新索要已授权发布。
- **索引范围**：共28个从旧preview开放的公开页：Kids1、故事目录1+介绍8、根练习纸1、Flashcards总入口1+目录1+固定卡组15。15固定卡组增加静态说明和完整字符字典链接，不再只有Loading practice。个人词库、账号、教师预览保持noindex；含session查询由head脚本在解析时改noindex，canonical去参数。初始静态HTML仍是公共入口，并非服务器按query响应不同robots或身份鉴权；不把会话组合加入Sitemap。Tools仍planned/noindex，仅增加导航目的地，不冒称工具功能完成。
- **路径/导航**：/worksheets/为根地址，首页/Kids/页脚/教师说明/126字页打印入口都指向新址。旧/kids/worksheets/在契约声明redirectTo，输出真实Cloudflare301且保留query，不生成重复正文、不入Sitemap。保留原77地址映射并将重定向标为无输出；新路由由契约加入，当前仍411英文正文。单棵响应式菜单Chinese Culture内有Culture tools→/tools/、Culture articles→/blog/，桌面/手机/键盘使用同一DOM。
- **课程边界**：开始前完整读STORY_COURSE_PRODUCTION_WORKFLOW.md。本轮仅开放既有英文故事介绍页索引，没有制作或改动lessons.js、故事媒体/TTS/字幕/逐字cue/测验，原课程审批保持，不声称重新人工验收课程。没有账号/同步/Billing代码或付费生成。
- **文件**：修改site/{release.json,routes.mjs,seo.mjs,site.mjs,layouts/base.html,pages/home.html,pages/dictionary.mjs,pages/learning.mjs}、scripts/build-site.js、tests/{dictionary,seo-quality,site-shell}.test.mjs；新增scripts/verify-public-navigation-browser.mjs。同步docs/hanzifun-rebuild/{SPEC,FILE_ARCHITECTURE,TASKS,PROGRESS}.md和contracts/routes.json；新增evidence/public-navigation-2026-10-28/{verification.json,culture-desktop.png,culture-mobile.png}及releases/public-learning-navigation-2026-10-28/{manifest.json,ACCEPTANCE.md,ROLLBACK.md,deployment.json,online-verification.json}。
- **验证**：最初唯一失败是旧测试要求所有Flashcards都不入Sitemap，按Owner新范围改为正向断言公开Flashcards/新练习纸入图、个人/教师/session/旧打印路径排除，并检查301规则。最终163/163测试PASS、生产构建2826文件/411英文页（393 index、18 noindex）、Sitemap393、SEO errors=[]。public/private正反例守卫通过，staging仍全noindex。冻结SHA-256=`8eee6e84066a4ff1302f7a6b0538a01ae6bc20518c1a91e5eb69e03bdcf4d1c8`，Wrangler部署重建后完全一致。
- **本地与线上浏览器**：本地Cloudflare dev4174，28路由HTTP200/index,follow/self-canonical/Sitemap、旧路径301及?print=1保留、个人页排除均通过。Chrome156八类页面×五宽度共40档无溢出、axe WCAG A/AA零违规、pageErrors=[]；文化菜单Enter/Escape焦点、手机进入blog、桌面进入tools、打印按钮、无JS六字静态链接、session/query的DOM robots回退通过。正式域名完整重跑同一范围也PASS；只检查故事介绍链接，不冒充八课重新视听签收。手机/桌面截图实际查看并入库本地证据。
- **实际发布**：发布前GitHub main与本地abd0a96一致。Cloudflare实际上一版本是11ad9c9d-d901-4470-999b-561f2848bb04，作为本批回滚目标（不照抄上轮日志的版本）。源码提交0495ddf971ccd54b20a4c7032985078f3f72a0a4，Wrangler deploy --name hanzifun --strict --keep-vars成功：413资产更新、2411复用。版本f1e7d8af-4651-48ed-ae76-b633607daa53，deploymentId=769b9ea8-ba6b-4916-b975-2a00876909d3，100%流量，2026-10-28 **18:03:30 +08:00**。18:03:52开始正式域名验证，全部通过；配置可索引不等于Google已收录。
- **GitHub/收尾**：非强推git push origin HEAD:main成功，abd0a96→0495ddf；本条记录和实际发布回执再单独提交同步，以最终远端HEAD为准。未改其他worktree的本地main或个人文件；本地4173静态预览仍可看新内容，4174的Cloudflare预览支持真实301。
- **遗留/下一切入点**：三项请求已完成上线。六字打印样本不冒充HF13正式两组打印包；336字页及场景深化、AdSense账号/真实pub-ID/适用CMP仍是原待办，未启广告。后续先以本批393 Sitemap及新根打印路径为基线；不要因旧文档preview重新关闭这些公开入口，也不要把原旧打印地址作为canonical。后续若需无JS也按query输出noindex，可另做服务器层支持；当前已明确head脚本范围。回滚命令已保存，未主动切回生产演练。

### [记录 25] - HF-13正式文章/打印收口、HF-14入门索引与全任务盘点（By Codex，2026-10-31）

- **目录/基线**：按Owner要求在Desktop主目录main开发，开工tracked干净；本地main落后本地origin/main四提交，已无冲突快进08c36ef→226e88c，承接已上线AdSense与公开学习导航成果。未覆盖个人未跟踪文件，未使用旧worktree施工，未commit/push/部署。
- **完整盘点**：逐个读取HF-13—18及原HF-10/11/12/15规范，识别同号Phase2与Phase3任务区别。新建`REMAINING-TASKS-2026-10-31.md`记录所有未结包、目标、依赖、Owner环节、旧环境总门控/AdSense/观察与非阻塞增强。纠正HF-17/18从未执行的旧状态；本批尚未部署不抹掉历史已上线事实。
- **HF-13完成**：文化/商务/家庭三篇实质正文，原创活动/例句与来源范围分开，真实Codex AI作者署名、Owner审核者、固定2026-10-31日期。4状态schema、发布前schema/日期/slug/图片alt/引用/字卡/卡组/哈希审核验证，草稿生产包不泄漏完整正文。原两篇指南保留，首页/Blog/搜索挂载新文章；Article JSON-LD与可见标题/作者/canonical/日期校验。每篇至少3字+真实卡组，收藏/刷新/练习/完成刷新可用。
- **本轮人工决定**：向Owner提供完整三篇审读包并明确要求审读后告知是否通过，Owner回复原文“没问题”。三篇分别记录Owner/date/evidence/contentSha256，`owner-decisions-2026-10-31.json`及审读包记录原始会话依据，不复用其他文章/字库批准，不把该内容确认扩成部署授权。正文变化会拒绝原签字。
- **打印资源**：家庭休山水火木月、课堂中秋月饼团圆，两个可打印子页及入口；每卡汉字/拼音/英义/短助记均取既有已签发核心字，完整许可归属。A4/Letter四PDF全部单页，pypdf规范化文本/纸型检查与Poppler逐份渲染目视通过；无截断/缺字/重叠。楷体提取可能产生康熙部首码位，文本检查做NFKC；不据此改源汉字身份。
- **HF-14独立子项**：从已批准126核心字中选100个、5主题组与选择依据，明确非词频榜/非HSK全量，所有字页与稳定练习身份可达；不变更旧ID/会话/调度，64词与HSK3.0二级不动，整个HF-14仍Partial。
- **最终门控**：`HF_SITE_ENV=production npm run build:site` PASS（2828文件/413英文页、399 index/14 noindex）；`node scripts/validate-seo-quality.mjs` PASS（Sitemap399、414 JSON-LD、errors=[]）；`npm test`174/174 PASS，fail/skip/cancel0（原163+新增11）。生产重复构建2828文件逐字节一致。`git diff --check`最终PASS，526个冻结源码文件无漂移。
- **本地浏览器/HTTP**：Chrome156，3篇各独立访客上下文完成字典/收藏与刷新/整组练习完成并等待原子落盘后刷新保留；8行为组PASS、7类axe零违规、35档布局、页面错误0。早期测试曾在乐观UI完成后立即刷新、或跨旅程共用日额度；测试已校正并最终重跑PASS，未改Repository或调度器。Wrangler4.153本地Workers10项：7页200/index/canonical、旧打印301保留query、真实404、旧MP3请求200完整10080字节。仅本次增量，未声称历史完整MVP/所有浏览器/真机/读屏/真实p75全部重跑。
- **HF-17候选/回滚**：候选`phase-2-editorial-starter-2026-10-31`，源码与构建hash冻结；从git226e88c重建旧393包，新399包隔离回滚再恢复2.793秒，hash全匹配，不操作Owner存储/不切生产。大包、源归档与逐文件指纹放`.cache/releases/<releaseId>/`，Git只存轻量manifest/ACCEPTANCE/ROLLBACK与证据。生产当前版本未在本轮重新核验，旧f1e7d8af只作为2026-10-28留存证据。
- **本轮文件**：新增`content/editorial/{articles.json,article.schema.json,worksheets.json,owner-decisions-2026-10-31.json,README.md}`、`data/editorial/starter-100.json`、`site/editorial-workflow.mjs`、`site/pages/starter-100.mjs`、`scripts/{review-editorial,verify-editorial-browser}.mjs`、`tests/{editorial-workflow,starter-100}.test.mjs`；修改`site/{editorial-content.mjs,seo.mjs,release.json,public/site-styles.css}`、`scripts/{build-site.js,validate-seo-quality.mjs}`、`tests/seo-quality.test.mjs`。文档新增HF-13-VERIFICATION、REMAINING-TASKS、acceptance/hf13-editorial-review、evidence/hf13、releases/<releaseId>；更新TASKS/PROGRESS、FILE_ARCHITECTURE与HF-13/14/17/18规范状态。
- **遗留/下一个Agent精确切入点**：先读本记录、TASKS和`tasks/HF-18-migration-release.md`，再看本候选manifest/ACCEPTANCE/ROLLBACK和HF-13-VERIFICATION。若发布，核对主目录源码/构建指纹、实际生产版本及本次范围/窗口授权，部署相同包并线上验证六新增index路由、Sitemap399/旧入口/实际学习；内容审读已批准，无需重复询问或补造签字。后续可选原HF-12单工具或明确HF-14等级批次；原HF-10/11/15/16仍受Phase3阶段依据限制。音频与64词决策不变；本轮没有新账号/云同步/Billing/故事/付费API/自动监控。
