# Hanzifun 项目多 Agent 协同开发铁律 (AGENTS.md)

本项目采用多 Agent 接力开发模式，所有项目记忆与架构规范均沉淀在 `docs/hanzifun-rebuild/` 目录下。任何接手本项目的 AI Agent 必须严格遵守以下工作流：

## 1. 核心上下文目录（共享大脑）
切勿全库盲目扫描！请按需读取以下文件获取上下文：
- **交接与当前状态（必读）**：`docs/hanzifun-rebuild/PROGRESS.md` 和 `docs/hanzifun-rebuild/TASKS.md`
- **总体需求与架构基线**：`docs/hanzifun-rebuild/SPEC.md`、`docs/hanzifun-rebuild/BASELINE.md` 和 `docs/hanzifun-rebuild/FILE_ARCHITECTURE.md`
- **数据源与验收标准**：`docs/hanzifun-rebuild/SOURCES.md` 和 `docs/hanzifun-rebuild/VERIFICATION.md`
- **具体单点任务说明**：`docs/hanzifun-rebuild/tasks/HF-xx-*.md`

## 2. 省流与接力标准作业程序 (SOP)
1. **开机动作**：每次开启新会话时，仅读取 `PROGRESS.md`、`TASKS.md` 以及当前指定的单个 `tasks/HF-xx-*.md` 文件，不要一次性读取所有 `HF-*` 任务文件以节省 Token。
2. **开发阶段纪律**：当前处于 **Phase 1（主站上线）**，严禁提前引入 Phase 3 的账号登录、云端同步或付费订阅（Billing）代码逻辑，保持纯本地与轻量架构。
3. **验证动作**：写完代码后，对照 `docs/hanzifun-rebuild/VERIFICATION.md` 进行自检。
4. **下班打卡（强制要求）**：每完成一个 `HF-xx` 子任务，或收到用户“准备切换 Agent / 保存进度”指令时，**必须**更新：
   - `docs/hanzifun-rebuild/TASKS.md`（更新完成状态）
   - `docs/hanzifun-rebuild/PROGRESS.md`（追加本次修改的文件列表、遗留问题、以及下一个 Agent 的精确切入点）。
