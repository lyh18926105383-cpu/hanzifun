# HF-01 基线整合报告 (INTEGRATION)

整合日期：2026-10-25 · 对应任务 [HF-01-baseline](../tasks/HF-01-baseline.md) · 返回 [BASELINE](../BASELINE.md) / [PROGRESS](../PROGRESS.md)

## 1. 合并策略

主目录 `main` 与父树 `d5a4c57` 共同祖先为 `c381809`（`merge-base --is-ancestor` 通过）。

- **采用 `git merge origin/main`**（origin/main 已指向 `d5a4c57`），把父树 3 次故事课提交（`0f97538` 七课+流程、`1a3a7bd` 去音轨、`d5a4c57` 静音流程文档）并入本地 `main`。
- 主目录 2 次文档提交（`6460ae5` SPEC/任务、`7cc6512` AGENTS+PROGRESS）**原样保留，未 rebase、未回滚**。
- **唯一冲突**：根 `AGENTS.md`（add/add）。解决方式：保留多 Agent 接力规范全文，在其后追加「故事课生产规则」章节（父树 9 行规则合并进第 3 节）。
- 合并提交：`058ad9d`。

## 2. 逐文件整合结果

| 类别 | 文件 | 结果 |
|---|---|---|
| 规则 | `AGENTS.md` | 冲突解决：多 Agent 规范 + 故事课规则追加 |
| 规则 | `.gitignore` | 干净合并，新增 `storyboards/candidates/` |
| 文档 | `README.md`、`STORY_COURSE_PRODUCTION_WORKFLOW.md` | 干净合并（流程 684 行） |
| 七课资源 | `assets/lessons/{ant-moving-bean,cat-mirror,cucumber-flower,little-frog,little-turtle,painting-rooster,wind-doll}/` | 干净合并（每课 audio manifest + 静音 mp4 + 场景 jpg + TTS mp3） |
| 故事板 | `storyboards/{6 课}.md + references/` | 干净合并（6 个新故事板 + 9 张参考图） |
| 代码 | `lessons.js`(+678)、`story.js`(+242)、`styles.css`(+277)、`story.css/html`、`index.html` | 干净合并 |
| 脚本 | `package.json`、`scripts/generate-story-tts.js`、`scripts/process-approved-video.m` | 干净合并 |
| 测试 | `tests/lessons.test.js`(+284) | 干净合并 |

> 第一课 `cat-and-fish-01` 已存在于主目录，其资源在 `assets/lessons/cat-and-fish/`，不随父树重复引入。

## 3. 八课标识与资源清单

| lessonId | 课名 | 中文入口 | 资源目录 |
|---|---|---|---|
| `cat-and-fish-01` | 小猫看鱼 | `story.html?lesson=cat-and-fish-01` | `assets/lessons/cat-and-fish/` |
| `ant-moving-bean-02` | 蚂蚁搬豆 | `story.html?lesson=ant-moving-bean-02` | `assets/lessons/ant-moving-bean/` |
| `cat-mirror-03` | 花猫照镜子 | `story.html?lesson=cat-mirror-03` | `assets/lessons/cat-mirror/` |
| `little-turtle-04` | 小乌龟 | `story.html?lesson=little-turtle-04` | `assets/lessons/little-turtle/` |
| `little-frog-05` | 小青蛙 | `story.html?lesson=little-frog-05` | `assets/lessons/little-frog/` |
| `painting-rooster-06` | 画鸡 | `story.html?lesson=painting-rooster-06` | `assets/lessons/painting-rooster/` |
| `wind-doll-07` | 没礼貌的风娃娃 | `story.html?lesson=wind-doll-07` | `assets/lessons/wind-doll/` |
| `cucumber-flower-08` | 一朵金花一个瓜 | `story.html?lesson=cucumber-flower-08` | `assets/lessons/cucumber-flower/` |

原型短中文译名（如 `ants-and-a-bean` 等）仅作入口设计，未写回 `lessons.js` 课名。

## 4. 旧 URL 与存储键

| 类型 | 值 |
|---|---|
| 旧故事 URL | `story.html?lesson={lessonId}`（继续使用，不强制改路径） |
| 旧字卡参数 | `?char=`、`?review=weak|saved`、`?words=`（仅解析允许项） |
| 学习记录 | `hanzifun.learning.v1`（50 轮，learning/review） |
| 故事记录 | `hanzifun.story.v1`（50 条） |
| 原型记录 | `hanzifun.prototype.learning.v1`（30 轮） |
| 音频 manifest | `audio-manifest.json` version `tts-v1`（voice `tencent-502007`） |

## 5. 原型资产归档

原型源已归档至 `docs/hanzifun-rebuild/archive/prototype/`（保留 15 个关键文件 + 4 张 QA 截图 + 3 张 PNG + seal.svg；排除 `dist/` 构建产物与 `.DS_Store`）。15 个关键文件 SHA-256 与 BASELINE.md 指纹**逐一复核一致**：

| 文件 | SHA-256 |
|---|---|
| `CONSTRUCTION_HANDOFF.md` | `d693f55a…26e584` |
| `README.md` | `b787a91d…1ca1d6` |
| `home.html` | `e70ebdcf…2f8a3eb` |
| `site.mjs` | `6be8954e…6bf1d03` |
| `data.mjs` | `11debf35…9df0e9` |
| `public/app.js` | `5ab7dabf…b0f31d` |
| `public/styles.css` | `8534726b…57374e8` |
| `ACCOUNT_FRAMEWORK.md` | `14683f6f…11c9d0` |
| `VERIFICATION.md` | `33c4984c…e82919f` |
| `build.mjs` | `6c60b9df…6eb5137` |
| `layout.html` | `71078551…35cf295` |
| `public/assets/seal.svg` | `c4aecced…5bd80676` |
| `public/assets/hero.png` | `5a9a1483…e97777` |
| `public/assets/audiences.png` | `682f817a…4c724c08d` |
| `public/assets/festival.png` | `aaa1b086…852bedff` |

（完整哈希见仓库中对应文件的实际 `shasum -a 256` 输出；上表为前缀摘要。）

## 6. 契约交付

- `contracts/routes.json`：路由/尾斜杠/slug/lessonId 契约
- `contracts/learning-event.schema.json`：学习事件 schema + 旧记录导入源
- `contracts/content.schema.json`：Character/Card 内容契约 + 旧“睛”两位置 + 唯一字 ID
- `contracts/repository-interface.md`：Repository 接口 + 短 ADR + 存储键 + 数据来源字段

## 7. 遗留风险与待核实

- `audio-manifest.json` 声明 `available/total=108`，按字键实际 107 条（“睛”去重）——契约已记录，HF-02 统一字库时收敛。
- 生产 URL/主机/部署状态仍需上线前核实（HF-17/18 关口，不在本包）。
- 故事课视听回归需按 `STORY_COURSE_PRODUCTION_WORKFLOW.md` 完整流程人工确认；自动测试不替代故事视听结果。
- 未跟踪用户文件（6 个 `tmp_*.png`、`代码架构讲解.html`、`汉字FUN海外化发展方向整理.md`、`.workbuddy/`）保持不动、未提交。
