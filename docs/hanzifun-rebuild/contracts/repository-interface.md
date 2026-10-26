# Repository 接口契约与短 ADR

冻结日期：2026-10-25 · 契约版本 1.1（HF-06：2026-10-26） · 对应 SPEC REQ-04 / REQ-09 / REQ-11。

## 1. 短 ADR：目录与构建方案

**决策**：Phase 1 继续 **Node 静态生成 + 原生浏览器 ES modules + Cloudflare 静态资源**，不迁移 React/Next.js。

- 公开学习内容预渲染，交互模块按页加载；现有中文 UMD 代码保持独立运行。
- 英文资源与中文资源使用**不同前缀**，避免 `/app.js`、`/styles.css` 同名冲突；`public/` 新英文资源文件名带版本或内容哈希。
- 构建需可重复、清理过期输出、生成 route/content/data manifest；第三方包精确锁版本并提交锁文件；不从运行时 `@latest` CDN 获取关键数据。
- 正式构建更换当前 `single-page-application` 未命中策略为**真实 404**（显式规则 + 实际响应测试，不依赖 Cloudflare 默认 HTML 规范化）。

**建议目录（名称可等价调整并同步文档）**：

```text
site/                 英文布局、模板、routes manifest
src/learning/         纯函数调度、事件、仓储契约
src/client/           搜索、笔顺、闪卡、学习中心交互
src/server/           Phase 3 起的同源 API / auth BFF
data/                 已许可的标准化数据、版本及覆盖清单
content/              审核过的场景、文章、教学联想
public/               新英文站公开资源，文件名带版本或内容哈希
legacy/               经 HF-01 整合后的中文源文件（是否移动由迁移实现确定）
scripts/              数据导入、构建、路由/许可/覆盖检查
tests/                保留旧测试，增加新模块与端到端测试
docs/hanzifun-rebuild/ 规范、任务、证据与决策记录
dist/                 构建产物，禁止手工维护
```

## 2. Repository 接口

Repository 抽象本机/账号实现，使闪卡与学习中心**无需知道**后端是否存在。Phase 1 只有本机实现（浏览器 localStorage）；Phase 3 增加账号实现。

```text
interface LearningRepository {
  // 只读快照：返回规范化后的当前数据（Progress 为事件派生状态）
  getData(): LearningData;

  // 学习中心聚合：练过唯一字数、到期卡数、收藏数、会话数、最近会话、薄弱字
  getDashboard(): Dashboard;

  // 记录一次会话结果（learning/review），原子写入并返回是否成功落盘
  record(payload: { cards, statuses, kind, completedAt }): { data, saved };

  // 清空本设备数据（需明确范围与可取消确认）
  clear(): boolean;
}
```

**无后端 Phase 1 边界**：
- 仅本机 `localStorage`，**无账号登录、无云同步、无付费订阅、无服务端 API/数据库**。
- 静态首页、字典正文、场景与文章不依赖登录 API；后端故障不得阻止读字与游客练习。
- Phase 3 候选后端：Cloudflare Worker 同源 BFF + Supabase Auth/Postgres（候选方案，地区/运维/预算未确认；不得仅因候选服务存在就开通付费资源）。

## 3. 存储键契约（旧记录来源，只读）

| 键 | 版本 | 上限 | 语义 | 导入策略 |
|---|---|---|---|---|
| `hanzifun.learning.v1` | DATA_VERSION=1 | 50 轮 | 字卡学习/复习会话 + 逐字统计 | 保留历史轮次/字序/次数/薄弱标记，记为 LegacySnapshot；缺失的逐次事件不得捏造 |
| `hanzifun.story.v1` | — | 50 条 | 故事课完成结果（lessonId/quiz 等） | 进入独立故事历史，不换算为闪卡评价 |
| `hanzifun.prototype.learning.v1` | — | 30 轮 | 原型练习 | 用户选择后导入收藏/摘要，不冒充生产用户数据 |
| `hanzifun.learning.v2`（规划） | IndexedDB 事务 | 不截断 | 新版事件 + 进度投影 + 会话游标 | Phase 3；localStorage 只放小型偏好与旧键 |

**兼容规则**：
- 导入批次标识 = `sourceKey + sourceOrigin + payloadHash + schemaVersion`；重复导入无新增。
- 旧摘要与保留轮次可能重叠，不相加；旧“熟悉”不证明 SRS 阶段，导入卡进入待首次排程状态。
- 浏览器存储按 **origin** 隔离；旧域记录通过旧域导出入口 + 新站导入搬运。
- 旧键保持只读，不反向写回 v1，保留回滚能力；用户明确选择后才清理。

## 4. 数据来源字段（数据来源契约）

`data/sources.lock.json` 与 `data/coverage.json` 由 HF-02 交付，未锁定字段不得用 `latest` 冒充。SourceRelease 必填字段：

`id、publisher、URL、retrievedAt、version、sha256、licenseId/licenseTextPath（适用时）、rightsStatus、usageScope、decisionBasis、changeNotes`。

主要来源（详见 SOURCES.md）：CC-CEDICT（字/词英义）、Unicode Unihan（码点/部首/笔画）、Hanzi Writer + Make Me a Hanzi（笔顺，Arphic Public License）、《汉语拼音方案》（拼音表）、复用 `tts-v1` 与腾讯云故事静态音频。

## 5. HF-06 已落地扩展（2026-10-26）

实现：`src/learning/repository.mjs`，新键 `hanzifun.guest.snapshot.v1`。`getData/getDashboard/getStatus/exportJSON` 同步读取；所有写入 `start/commit/setFavorite/setSettings/record/importLegacy/restoreBackup/restoreRecovery/clear` 返回 Promise，调用者必须 await 并检查 saved:true。`record` 兼容会话摘要输入并返回 `{data,saved}`，不会凭摘要制造逐次 SRS 评价；正式练习必须逐次使用 commit。clear 保留全部旧键/偏好，UI明确范围且可取消。

commit 输入维持HF-05的events/projection/snapshot/expectedLog/expectedSessionRevision。事件+投影+会话游标同次写入，重复事务优先ack。快照版本、原文、内容ID、日志head/length、会话revision与恢复游标均校验；数据损坏/未知版本只读保全导出，只有明确清理确认才重置。getDashboard把新SRS统计与LegacySnapshot/故事统计分开，最近8条之外仍可分页，不截断事件。

Web Locks 可用则使用，但缺少/受限时不阻断单标签。所有能力路径共用本地bakery写者标记（`hanzifun.guest.lock.*`），配合候选原文比对与写后核验。CAS本身非原子，不能无锁整库互盖；暂停/崩溃标记不自动抢占，UI要求关闭其他学习标签后显式清理标记。精确验证和边界见[HF-06验收](../HF-06-VERIFICATION.md)。

三源导入经预览后确认；sourceKey/sourceOrigin/SHA-256原文hash/schemaVersion去重，旧原文与全部批次保留。同来源/origin新版快照替代显示摘要，不重复加总。32MiB输入上限。guest整库备份恢复要求空新仓储；旧记录批次可与现有数据合并；失败pending需原历史匹配；临时练习导出携带实际生成的free事件，可恢复且不推迟dueAt。新旧域只能文件搬运。localStorage满额明确未保存，保留pending并导出，不默默丢弃历史。
