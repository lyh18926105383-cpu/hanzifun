# HF-06 验收记录

日期：2026-10-26（Asia/Singapore）。源码、文档与提交均在 `/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun` 的 `main`，实施前 HEAD `f9815c20a8751beacb35b0933b010f1210c25bbf`。临时目录只有构建产物、浏览器下载与证据，没有搬移源码/worktree。

## 结论

HF-06 本机学习闭环完成。字典收藏/指定 readingId 练习、四组真实卡组、到期/收藏/薄弱字/导入字入口、刷新/关页续练、学习概览、旧记录预览导入及导出恢复已接通。HF-04 的学习联调缺口在本包关闭；HF-02/04 人工内容、拼音教学与音频听审缺口继续保留，release 仍 noindex。没有增加登录、同步、Billing、部署或故事制作。

| 验证 | 结果 |
|---|---|
| `npm test` | 112/112，无失败或跳过；原98项 + HF-06新增14项 |
| 隔离公开构建 | 891 文件、77 原型路径、181 noindex 页；本地资源引用检查通过 |
| 真实 Chrome | 155.0.8059.85，Playwright headless，公开构建，独立访客 contexts |
| Web Locks / 禁用 Web Locks | 两路径均完成字典→again→刷新→到期；双标签24次竞争收藏保留，陈旧会话拒绝覆盖 |
| 混合能力 / 严格上下文 | 有锁/无锁标签共用协调；拒绝 Web Locks 请求继续保存；禁用 randomUUID 后 UUID 兼容路径通过 |
| 四组真实卡组 | 各自评价→暂停→刷新→续练；冻结原卡序、游标、翻面状态保持 |
| 迁移/恢复 | 三来源预览确认、重复导入无新增、旧键原文不变、取消清理、导出下载→清理→恢复通过 |
| 故障/离线 | SecurityError/QuotaExceededError 注入；真实填满 localStorage 后失败、释放空间重试成功；已载入当前会话断网仍可评价保存 |
| 临时练习 | 不报告 saved；可连续练习、导出并恢复真实 free 事件，不推进正式排程 |
| 布局 | 360/390/768/1100/1440 CSS px 无横向溢出；截图实际查看 |

## 仓储与并发语义

新键为 `hanzifun.guest.snapshot.v1`。schemaVersion/schedulerVersion、追加事件、派生投影、冻结会话/游标、收藏、设置、导入批次与原文一起确定性序列化，单次 setItem 替换。提交核验日志 head/length、会话 revision、事件身份/槽位/完成唯一性、设备序号与投影；相同事务丢失回执后优先确认已提交，不重复增加历史。每个浏览器文档使用独立 UUID 设备标识和递增序号，重载创建新标识，不复用旧序号。

localStorage 的读比对写不是原子 CAS。实现使用 Web Locks（若可用）和共享的 Lamport bakery 写者标记；没有 Web Locks、request 被拒绝、混合能力标签页均走相同标记协调。浏览器 storage 通知要经过任务轮次，发布/交接时主动让出任务；临界区内部读→校验→重放→写无 await。CAS 基于产生候选数据的**同一份原文**，写后再次核验；单元测试覆盖两次读取之间被外部改写的情况。首次浏览器竞争测试暴露缓存交接时序后已修复，最终结果见收据。

不会按超时抢占暂停/崩溃写者，避免旧写者恢复后覆盖。冲突/超时明确未保存并保留 pending；残留标记在 My learning 有显式恢复入口，要求关闭其他学习标签后确认，仅清理协调标记。此方案面向同源、使用本 Repository 的合作标签，不宣称 localStorage 具有数据库 CAS 指令或跨进程崩溃的形式化事务保证。

## 旧记录与导入边界

- `hanzifun.learning.v1`、`hanzifun.story.v1`、`hanzifun.prototype.learning.v1` 均只读。当前英文站已移除旧原型写入处理；中文 app 与故事播放器保留原行为。
- SHA-256 原文字节 hash + sourceKey + sourceOrigin + schemaVersion 标记批次；预览后确认。旧轮次/字序/次数/薄弱标记/未匹配字与课程均保留；原摘要和保留轮次不相加，不补造评价、不推导 SRS stage。
- 新旧统计分开；同来源/origin 的新版旧快照替代展示，所有批次原文仍在导出中。故事为独立历史；prototype 收藏/摘要须用户确认。
- “睛”第19/87位保留两个真实 cardId；cardId 排程、characterId 唯一字统计分别计算。缺少旧位置证据时不把字符串重复次数猜成教学位置。
- 本机同 origin 检测；跨域/端口通过旧域导出与新域文件预览搬运。32 MiB 文件上限、版本/类型/危险字段/深度/映射/投影/游标验证；SHA-256 预览需 HTTPS 或 localhost。
- 整库 guest backup 只恢复到空的新仓储，界面预览明确提示；先导出再确认清理后可恢复。旧来源批次可与当前收藏/历史合并。正常失败 pending 的恢复需要匹配原始 guest 历史；不会强行覆盖新标签数据。临时练习导出包含实际生成的 free 事件，可独立恢复，不捏造事件。

## 自动测试覆盖

`tests/guest-learning.test.mjs` 的14项覆盖：真实卡组/稳定ID；无锁单标签逐次落盘；丢失回执重试；双仓储收藏与陈旧会话冲突；Web Locks/读写异常；损坏/未来快照保全与显式清理；三源去重与备份语义往返；旧摘要重叠；损坏/危险/过大导入；超过8轮分页及取消收藏不删历史；临时事件恢复；批量重放与游标完整性；CAS原文一致性；受限 Web Locks 及残留标记恢复。原 HF-05 reducer 的不可变/调度/确定性/时区/额度测试全部继续通过。

HF-05 `events.mjs` 的 bulk replay 改为一次克隆及 Set 索引，保留同日志顺序和公开不可变 applyEvent 语义，避免历史增长带来的反复全量深拷贝。

## 性能与容量的真实限制

合成1000卡/10000事件/1000完成会话：重放约634ms、冷加载验证约868ms、概览约39ms、导出预检往返约959ms；具体环境与原始数值见 [性能收据](evidence/hf06/performance.json)。使用内存 Storage 测 CPU 与恢复语义，**不是**宣称这些数据在 localStorage 成功持久化。该完整快照约11.39MB，超过常见浏览器容量；真实浏览器已另测实际填满配额、明确未保存、清理测试填充后重试。日志不为了容量而静默截断；接近容量时应导出备份，失败期间保留内存 pending/临时导出。任何扩大容量或换存储的工作需后续明确决策。

## 可复现命令与证据

```sh
npm test
HF_BUILD_OUTPUT_DIR=/private/tmp/hf06-build-hanzifun npm run build:site
node scripts/verify-guest-browser.mjs
node scripts/benchmark-guest-learning.mjs
```

浏览器脚本使用已安装 Chrome 与宿主 Playwright，不新增依赖；只在127.0.0.1提供隔离构建。路径可用 HF_BUILD_OUTPUT_DIR / HF06_PLAYWRIGHT_MODULE / HF06_EVIDENCE_DIR 覆盖。性能脚本支持 HF06_BENCHMARK_OUTPUT。

证据：[浏览器收据](evidence/hf06/receipt.json)、[性能收据](evidence/hf06/performance.json)、[源码/构建指纹](evidence/hf06/checks.json)、[手机学习中心](evidence/hf06/learning-mobile.png)、[桌面学习中心](evidence/hf06/learning-desktop.png)。截图/记录使用合成旧记录与独立访客，未读写用户平时浏览器资料。

尚未覆盖 Safari/Firefox、真实旧 WebView、真机、真实屏幕阅读器、系统级隐私策略或任意浏览器崩溃调度；Chrome incognito context 的保存/刷新与拒绝存储注入分开记录，不冒充所有隐私窗口均可持久化。未做故事人工视听验收，未关闭人工语言/音频签字，不声称已部署或可索引。下一步执行 HF-07/HF-08，并继续关闭 HF-02/04 人工验收。
