# HF-05 验收记录

日期：2026-10-25（Asia/Singapore）。工作目录：Desktop 主仓库 `汉字饭hanzifun`，实现前 HEAD `f586268`。Node v24.14.0，npm 11.9.0；本包保持 Phase 1。

## 结论与交付

HF-05 独立引擎/组件验收通过。`interval-v1`、事件重放、会话快照、翻卡组件、故障重试与接入说明已交付。真实 localStorage Repository、学习中心、四组真实练习与字典入口的闭环仍由 HF-06 实现，未宣称接通。

| 检查 | 本轮结果 |
|---|---|
| `npm test` | **98/98 通过**，无失败/跳过；原有 77 项 + HF-05 新增 21 项 |
| 隔离 `npm run build:site` | 880 公开文件、77 原型路径、181 noindex 预览页；原 dist 不改 |
| 浏览器脚本 | PASS，已安装 Google Chrome 155.0.8059.85，Playwright 宿主包，headless |
| 组件布局 | 360/390/768/1100/1440 CSS px 无横向溢出；截图已实际查看 |
| 测试夹具隔离 | 公开构建不含 hf05-preview.html、测试模块或 HF-05 测试资源；HF-06 后续再挂载真实页面 |

## 自动化覆盖

`tests/review-engine.test.mjs`（11 项）：

- stage 0—6 的 1/3/7/14/30/60 天，6 阶封顶；每阶段 again 均为 10 分钟、lapses+1。
- dueAt 前一毫秒/等于/后一毫秒；提前练习、free、陈旧 scheduleRevision 不改正式排程。
- 到期优先、相同 dueAt 的稳定 cardId、额度与到期分页独立、5/10/20、空队列。
- UTC/IANA 跨日、纽约夏令时春跳/秋回重复小时、跨时区不重发、时钟大幅倒退提示并保留日志；间隔始终 24h。
- 同 UUID/同评价槽位去重、确定性重放、未知算法/非法字 ID 拒绝、冻结 schema 校验。
- “睛”两个 cardId 独立排程、characterId 去重；未排程的 free 卡不消耗新卡额度，仍可首次排程；竞争额度二次校验。
- 120 次确定性多轮操作检查输入不变、重复应用幂等、阶段边界和 free 不改 dueAt。

`tests/review-session.test.mjs`（4 项）：

- 原始内容变化不影响冻结内容/卡序；JSON 快照恢复游标/面、暂停续练与损坏/未来版本拒绝。
- 翻面前禁止评价，最后评价+完成同一事务，重复日志/不同 UUID 的重复完成不多计。
- 显式追加立即再看只记录 free 练习，即使期间到期也不再推进；摘要分开显示本轮练习、again、最早到期。
- 提前自由练习不改排程，空组不伪造完成。

`tests/flashcards.test.mjs`（6 项）：

- 提交中连点防护，仅 saved:true 确认成功。
- 异常/拒绝保存保留内存事务；失去成功回执后的重试复用同一 UUID/时间/序号/快照，完成恢复后不再次评价。
- 暂停快照恢复，语义按钮、文本安全、先翻后评、焦点与快捷键。
- 忽略重复按键/文本输入/提前快捷键；失败提示、重试入口与焦点。
- 事务携带日志 head/length 和会话 revision，模拟宿主拒绝旧标签页覆盖。

组件单测使用小型 DOM 测试替身，只验证事件/焦点调用契约；下列真实浏览器检查补充原生行为与布局，不把测试替身当成浏览器。

## 真实浏览器检查

运行：

```sh
HF05_BROWSER_CHANNEL=chrome \
HF05_PLAYWRIGHT_MODULE=/Users/graceshi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs \
HF05_EVIDENCE_DIR=/private/tmp/hf05-browser-evidence \
node scripts/verify-review-browser.mjs

HF_BUILD_OUTPUT_DIR=/private/tmp/hf05-build-hanzifun npm run build:site
```

环境首次直接调用 bundled Chromium 因本机缺该版本失败；改用已经安装的 Chrome 后通过，没有安装新浏览器或新增 npm 依赖。本机监听需 sandbox escalation，获准后完成。脚本只在 127.0.0.1 暴露六个白名单测试/模块文件。

夹具用合成“睛”双卡和专用 sessionStorage 键 `hf05.test.fixture`，不读取或修改用户学习键。这是验证适配器，不是 HF-06 持久化实现。

原生 Enter 翻面→快捷键评价→暂停→刷新→同一游标续练→模拟存储失败→明确 Not saved/评价禁用/重试聚焦→同一事务重试→完成→刷新，完成仍为 1 次。两张卡、一个唯一字、共 3 事件（两评价一完成）；页面无 JS 异常。减少动态环境下没有自动播放或动画。

证据：[浏览器收据](evidence/hf05/receipt.json)、[检查及源码指纹](evidence/hf05/checks.json)、[手机未保存状态](evidence/hf05/mobile-unsaved.png)、[桌面完成状态](evidence/hf05/desktop-complete.png)。

## 明确边界与下一个切入点

- 未执行 Safari/Firefox/真机/真实屏幕阅读器/真实隐私窗口，不声称覆盖这些环境。存储失败为注入异常，跨标签页 revision 为模拟宿主检查；真实多标签页写锁与 localStorage 故障需 HF-06 验收。
- 本轮不实现旧记录迁移，不从旧熟悉摘要推算 stage，不改故事、媒体或原中文存储；原有故事测试随 npm test 运行，不代表重做故事人工视听验收。
- HF-02/04 人工内容/拼音/音频签字仍 pending；release 仍 noindex，没有部署、账号、同步或 Billing。
- 额度账本固定首次排程的 IANA 时区，改展示时区不重发额度；暂未提供额度时区迁移 UI。完成后的重练由宿主新建 free 会话，立即再看在未完成会话中显式追加。
- HF-06 按 [接入说明](HF-05-INTEGRATION.md) 优先实现 localStorage 单键确定性快照、真实落盘 ack、只读旧记录迁移、隐私模式降级和写锁/revision；再接 HF-04 的 HanziFunLearningAdapter 与真实卡组。HF-05 本包验收不替代整条学习闭环。
