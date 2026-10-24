# Hanzifun Rebuild - 跨 Agent 实时交接日志 (PROGRESS)

## 当前所处阶段
- **大阶段**：Phase 1：主站上线（基线整合、126 字字典及 Information、独立笔顺页与拼音表、本机闪卡、两场景、两版 HSK 1 级）
- **当前执行任务**：`HF-01-baseline` 已完成；下一项 `HF-02`（字典/笔顺数据）、`HF-03`（C 方案框架与七段首页）、`HF-05`（复习调度）可按文件边界并行。
- **状态**：HF-01 基线整合完成（合并提交 `058ad9d`），统一基线 + 原型保全 + 四项契约已冻结。

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
