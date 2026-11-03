# SEO-03 · Cursor 页面引导交付（局部）

**执行时间：** 2026-11-02  
**工作目录：** `/Users/graceshi/.codex/worktrees/c20f/汉字饭hanzifun`  
**分支：** `codex/seo-2026-11-02`  
**基线 HEAD：** `02eb6458d8dfb80d41b6eb2b09d6b14473262c60`  
**任务：** SEO-03 小范围现有页面优化（GSC 曝光入口：`/flashcards/`、`/pinyin-chart/`、`/dictionary/pinyin/`）

## 环境确认

| 项 | 结果 |
|---|---|
| `pwd` | `/Users/graceshi/.codex/worktrees/c20f/汉字饭hanzifun` |
| `git branch --show-current` | `codex/seo-2026-11-02` |
| `git rev-parse HEAD` | `02eb6458d8dfb80d41b6eb2b09d6b14473262c60` |
| Desktop 主目录 | 未修改 |

## 修改清单（仅以下 3 文件）

### 1. `site/pages/learning.mjs`

- **路由：** `/flashcards/`
- **变更：** 在练习区与固定卡组列表之前增加静态 `<section>`「How to practise」。
- **内容要点：**
  - 与现有 UI 一致的 **Reveal answer**、**Familiar**、**Again** 流程说明；**Again** 文案为 “if you need more practice”，不承诺同一会话内再次出现（对齐 `session.mjs` 冻结队列 + `scheduler.mjs` interval-v1 排程）。
  - 引导选择下方主题卡组、**all practice sets**（`/flashcards/decks/`）、**Saved characters**（`/flashcards/my-words/`）。
  - 本机保存：引导段明确 “saved on this device in this browser only—not synced elsewhere”；页眉保留原有 `learning-note`；未改 `data-guest-*`、脚本 URL、卡组数据或交互。

### 2. `site/pages/pinyin-chart.mjs`

- **路由：** `/pinyin-chart/`
- **变更：** 在原有 scope 说明之后、四声说明之前增加 **Look up a syllable** 三步有序列表。
- **内容要点：**
  - 与现有 `data-pinyin-filter` 表单一致：拼写输入（含 shuǐ / shui3 / lü）及 initial/final 筛选。
  - 打开 `<details>` 音节行查看声调与例字链接。
  - 内链：`/dictionary/pinyin/`、`/flashcards/`、`/flashcards/decks/`。
  - 未改 410 音节数据、Listen 按钮、筛选 JS、`syllable-*` 锚点或底部既有链接。

### 3. `site/pages/dictionary.mjs`

- **路由：** `/dictionary/pinyin/`
- **变更：** 将原单段 intro 扩展为 `content-prose` 内两段引导。
- **内容要点：**
  - 明确「已知拼音 → 查 126 核心字」的 lookup 用途。
  - 与 **Pinyin Chart**（410 音节教学/查表 scope）区分。
  - 内链至 `/pinyin-chart/`、`/flashcards/my-words/`、`/flashcards/decks/`。
  - 未改 `pinyinBody` 分组、逐音节锚点或任何单字页/教学内容。

## 实际检查

| 检查项 | 结果 |
|---|---|
| 源码字符串存在性（grep 三文件） | PASS：`How to practise`、`Look up a syllable`、`character lookup index` |
| `git diff` 范围 | 本 Agent 仅编辑上述 3 个 `site/pages/*.mjs`；worktree 内另有 Codex 侧未提交改动（如 `site/seo.mjs`、docs），非本包写入 |
| `npm test` | **未在本 worktree 完成**：缺少 `node_modules`（`ajv` 等），`npm install` 在沙箱内权限失败 |
| `npm run build:site` | **未在本 worktree 完成**：同上 `ERR_MODULE_NOT_FOUND`（ajv） |
| commit / push / deploy | **未执行**（按任务要求） |
| PROGRESS.md / TASKS.md | **未更新**（由 Codex 总控负责） |

**建议 Codex 验收时：** 在已安装依赖的 worktree 跑 `npm test` + 隔离构建，并对三 URL 做静态 HTML 抽检或既有 SEO 测试套件。

## 遵守的限制

- 未新增路由、CSS、跟踪、账号/付费文案或新教学事实/音频承诺。
- 未修改 `data/`、editorial、release、SEO 元数据总表（`site/seo.mjs` 等）、稳定 ID、审批哈希门控或客户端复习/字典逻辑。
- 未触碰 Desktop 主目录 `main`。
- 未遇到需 Owner 审批的内容哈希变更或超范围需求；若总控要求同步 meta title/description，属 SEO 共享层，不在本三文件权限内。

## 交接

- 本交付文件路径：`/private/tmp/hanzifun-cursor-seo-delivery.md`
- 下一棒：Codex 集成 `site/seo.mjs`（若已有）、全量测试/构建、更新 PROGRESS/TASKS 与发布决策。
