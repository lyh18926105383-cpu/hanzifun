# HF-05 → HF-06 接入说明

2026-10-25 · interval-v1 · Phase 1 · 对应 [冻结 Repository 契约](contracts/repository-interface.md)、[事件 schema](contracts/learning-event.schema.json)。HF-05 只交付源模块与独立组件；实际公开路由、存储、旧记录导入和学习中心由 HF-06 完成。

## 模块与身份

| 文件 | 职责 |
|---|---|
| `src/learning/scheduler.mjs` | 固定间隔、资格、稳定队列、UTC 时间、IANA 日额度 |
| `src/learning/events.mjs` | guest 事件创建/校验、幂等投影、按提交日志顺序重放、基础统计 |
| `src/learning/session.mjs` | 冻结卡序/内容、翻面、暂停、续练、评价与完成事务、摘要 |
| `src/client/flashcards.mjs`、`flashcards.css` | 注入保存接口的控制器及原生 DOM 组件 |

卡片输入 `{cardId, characterId, front, back, ...}`；front/back 为纯文本，可额外保存 readingId、内容版本、来源等供宿主使用。新内容必须由 HF-06 解析真实清单，不能用夹具填补生产数据。`baseRevision` 是内容/卡组版本；`scheduleRevision` 是卡片上一次正式排程的 eventId，初始为 `"0"`；`snapshot.revision` 是会话写入版本，三者不能混用。

第 19/87 位“睛”保留各自真实 cardId，均映射到 `char:775b`。阶段、dueAt、复习卡数按 cardId；练过唯一字数按 characterId 去重。不要按字形字符串合并卡片或推断某个教学位置。

## 调度与会话语义

- 新卡（尚未正式排程）为 revision=0、dueAt=null；免费提前练习留下 seenCount，但仍等待首次正式排程。正式熟悉依次进入 stage 1—6，间隔 1/3/7/14/30/60×24h；stage 6 保持 60 天。正式 again 回到 stage 0，10 分钟后到期、lapses+1；这时不是新卡。
- 已到期卡按 dueAt、二进制 cardId 字符串升序，然后新卡；默认新卡 10/日、20/次，均支持 5/10/20。新卡额度不限制到期旧卡；下一页重新计算队列。建会话和提交事件时均检查新额度，竞争耗尽时保留练习历史，不额外推进新卡。
- 新卡首次或 dueAt<=effectiveNow 且 scheduleRevision 匹配才能推进；提前练习、立即再看、过期 revision 仅留历史，不推迟 dueAt。不提供“已掌握”承诺。
- `createSession` 深拷贝初始卡序与文本，续练调用 `restoreSession`，不能按新内容重新拼队列。`revisit(session, answeredPosition)` 只在未结束会话中追加旧卡的 free 副本，不重排初始队列；最后结束后若要重练，宿主创建新的 free 会话。
- `flip/pause/resume/revisit` 增加会话 revision；正反面均可直接评价（2026-10-26 用户体验修订）；Familiar/Again 与数字 1/2 快捷键共用同一评价事务。最后一次评价和唯一完成事件在同一个事务中返回；空队列不产生完成事件。每次评价槽位以 sessionId+position 去重；完成以 sessionId 去重。
- `summary` 返回本轮练习次数（含显式 free 再看）、again 次数、整个传入投影下一次最早 dueAt；唯一字数通过 dashboard 单独展示。dashboard 的 dueCards 使用 projection.lastNow，宿主需要“当前到期”时传入经 effectiveClock 校正的 now 副本，不能用旧投影时间当实时计数。

UTC 毫秒用于所有排程；同一已提交日志顺序+算法版本得到相同投影，不按客户端时间重新排序。effectiveNow 不低于已保存 lastNow；倒退超过 10 分钟显示异常提示，保留历史。首次正式排程的 IANA 时区固定为额度账本时区；改展示时区不会重发额度，夏令时重复小时仍是同一日。当前不提供重置额度时区的入口；将来如迁移额度时区，需保留当前窗口/已用额度，不能清空 quota。此限制应在 HF-06 设置说明中保留。

## 建立与恢复

```js
import {createSession} from './learning/session.mjs';
import {createFlashcardController, mountFlashcards} from './client/flashcards.mjs';

const session = createSession({cards, projection, now: clock(),
  sessionId: uuid(), baseRevision: contentVersion, timeZone: quotaTimeZone,
  dailyNew: 10, limit: 20, mode: 'learning'});
// 先成功保存初始 projection + session，才能返回 started:true 或进入练习路由。
const controller = createFlashcardController({session, projection,
  commit: commitLearningTransaction, clock, uuid, deviceId,
  nextSeq: reserveDeviceSequence}); // nextSeq(count) 返回预留区间的起始序号
const view = mountFlashcards(container, controller);
// 离开挂载点时 view.destroy()；controller.pause() 是显式的可恢复暂停。
```

以上 import 路径为示意；HF-06 将三个 learning 模块与客户端组件作为独立英文资源输出，并保留相对目录或构建时重写 import。HF-05 未改公开 build manifest，也未把夹具挂到 `/flashcards/`。旧中文 app.js/storage.js 保持独立。

控制器为每个提交保留一个 pending 事务；按钮提交中和未保存时均禁止另一次评价。存储失败保留内存快照，显示 Not saved、重试与恢复 JSON 导出；重试复用同一组事件 UUID、序号、时间与快照。刷新失败前只能恢复最后成功落盘的快照；宿主不得声称未保存结果已经恢复。恢复导出带 snapshotVersion、schedulerVersion、baseRevision 和 pending；HF-06 可再加整体导出 schemaVersion/生成时间。

## commit 注入契约与 localStorage 建议

```text
commit({events, projection, snapshot,
        expectedLog: {length, head}, expectedSessionRevision})
  -> {saved: true} | {saved: false, reason}
```

可同步返回，也可返回 Promise。Promise 仅用于统一错误/提交中 UI，以及可选写锁，不要求异步数据库。只有真实成功写入才返回 saved:true；抛异常、undefined、saved:false 均为未保存。没有“已同步”状态。

遵循用户本轮决定，HF-06 **优先采用 repository-interface.md 的 localStorage + 确定性快照**。无需在本轮引入 IndexedDB。建议单一新 guest 快照键（命名/容量由 HF-06 冻结），内含 schemaVersion、完整追加事件、事件派生投影、会话快照及导入批次；一次 setItem 保存整份经过验证的确定性快照。保留旧 v1 原文和回滚能力，不使用规划的 Phase 3 IndexedDB 键覆盖旧数据。

宿主写入流程：

1. 在写锁中读最新快照，验证 schema、内容映射、expectedLog 与 expectedSessionRevision；未知版本或损坏数据保留原文供导出，不自动删除。
2. 先检查同 eventId/同评价槽位/同 sessionId 完成是否已经提交。若是失去成功回执后的同一事务，原样回 ack；不能先因 revision 不同拒绝已成功的重试。无事件的翻面/暂停以 sessionId+snapshot.revision 及相同内容识别已提交重试。
3. 对新的事件用 applyEvent/replay 在最新投影上重算并校验；比较 expectedLog/会话 revision，过期请求返回明确 conflict、保留 pending 给用户导出/恢复，不覆盖其他标签页的新记录。组件默认不自动覆盖或丢弃冲突。
4. 一次写入 event+projection+cursor+完成摘要，写入失败不更新持久成功状态。仅显示最近 8 次不截断完整历史。

localStorage 的单键替换不等于跨标签页 compare-and-swap。HF-06 需使用同 origin Web Locks 或明确的单写者方案包住读校验写；无锁能力时对竞争写入降级、阻止不安全覆盖，并提示刷新/导出。不要用两份整库快照无锁互盖。设备序号也应在同一写者范围内预留。

隐私模式/QuotaExceeded/SecurityError：捕获读取与写入异常，允许保留当前内存练习，显式未保存；提供重试/导出，不能无声切换后仍报告 saved:true。HF-05 为避免同一未提交评价重复计数，pending 失败期间阻止后续评价；HF-06 可在宿主层提供导出后开启独立临时练习，但不能把它冒充落盘会话。

Repository 的 getData/getDashboard/record/clear 保持宿主接口。现有 record 的 cards/statuses/kind/completedAt 只是会话级摘要，**不足以独自保存逐次事件和游标**；HF-06 应在 Repository 内提供上述事务方法（或兼容扩展 record 的事务参数），并让旧 record 包装同一实现。不能等会话结束才保存全部评价。clear 的范围与可取消确认由 HF-06 UI 完成。

旧 `hanzifun.learning.v1` 只读导入 LegacySnapshot；sourceKey+sourceOrigin+payloadHash+schemaVersion 标记批次，重复导入不新增，摘要与保留轮次不相加。缺失的逐次事件不补造；旧“熟悉”不推导 stage。故事进入独立历史，不传给 SRS reducer；prototype 只在用户选择后导入摘要/收藏。

## HF-04 字典入口

HF-06 安装 `window.HanziFunLearningAdapter`：

- `saveCharacter({characterId})` 包装真实收藏写入，明确返回 `{saved:true}`。
- `startCharacterPractice({characterId,readingId,source})` 从真实数据解析卡片、创建/恢复单字会话，保存初始快照后返回 `{started:true}`。

字典 characterId 不应生成新的旧教学位置，也不应自动加入原型默认卡组。优先匹配已有收藏/排程卡；若需字典独立卡，用明确、稳定的新 cardId，并记录来源及 readingId。由于唯一字可以有多卡，新增卡不等于增加唯一字数。`src/client/learning-entry.mjs` 已对失败关闭，不需在 HF-05 改动它。

HF-06 最后需用四组真实卡组及字典入口验证：初始落盘、逐次评价保存、刷新续练、完成去重、额度、无损旧记录导入、隐私模式和跨标签页竞争。HF-05 的夹具通过不代表这些生产联调已完成。
