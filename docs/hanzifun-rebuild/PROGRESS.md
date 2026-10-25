# Hanzifun Rebuild - 跨 Agent 实时交接日志 (PROGRESS)

## 当前所处阶段
- **大阶段**：Phase 1：主站上线（基线整合、126 字字典及 Information、独立笔顺页与拼音表、本机闪卡、两场景、两版 HSK 1 级）
- **当前执行任务**：`HF-02` 数据实现已交付，自动检查通过，人工内容/拼音/音频验收待关闭；本会话未启动其他工作包。
- **状态**：HF-01 已完成；HF-02 在主仓库 main 交付数据管线与产物，详见记录 03。

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
