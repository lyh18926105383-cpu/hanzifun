# HF-12（Phase 2）｜实用场景与 HSK 2 级核心扩展

2026-10-27 用户指定的新范围；与原 [HF-12-culture-tools](HF-12-culture-tools.md) 分开，原四文化工具未执行。

状态：**Completed / PASS（当前 3 场景 + 86 个二级词范围；Owner 独立签收 2026-10-27）**。

- [x] 机场交通、酒店入住、超市购物，各 5 句；保留原餐厅/商务，token/拼音/英译/播放/保存/练习可用。
- [x] 86 个 HSK 2.0（2015）二级新增词，来自锁定 XLSX 的 150 个二级增量；完整累计两级为 300 词，本轮不宣称全量二级或 HSK 3.0 二级。
- [x] 全部词的组成字已有完整详情，场景 ↔ 字典 ↔ 二级词表 ↔ 原稳定 cardId 深层内链；练习返回精确 token，保持本机存储。
- [x] 二级页已开放索引；新增 3 场景按 Owner 本轮独立签收和正文 hash 发布，Sitemap 355 → 358，不复用旧批准。
- [x] 源数据离线重建一致；全量 159/159 测试、生产构建、SEO 与本地浏览器通过。
- [x] Owner 已完成 [15 句签收](../acceptance/phase-2-hf12-language-review.md) 及真机验收，三个精确路由 published / index,follow；签名失效则拒绝构建。
- Deferred / Backlog：剩余 64 个 HSK 2.0 二级词留待后续阶段，不阻塞当前交付；本轮已纳入 86 词保持不变。

本轮没有扩字或修改源锁、HF-10 批次签字，不启动账号/同步/Billing 或故事课。

结果见 [验收记录](../HF-11-HF-12-VERIFICATION.md)、[二级来源回执](../evidence/hf12/level-2-verification.json)。
