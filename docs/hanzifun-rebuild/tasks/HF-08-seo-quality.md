# HF-08｜公开页 SEO、性能与无障碍收口

状态：待执行（本轮只生成任务文档）。返回 [任务总表](../TASKS.md) / [SPEC](../SPEC.md)。

| 项目 | 内容 |
|---|---|
| 唯一 ID | HF-08 |
| 优先级 | P0 |
| 阶段 | Phase 1 |
| 硬依赖 | [HF-03](HF-03-site-shell.md)、[HF-04](HF-04-dictionary.md)、[HF-06](HF-06-guest-learning.md) |
| 可并行关系 | 可与 HF-07 并行；共享 layout/meta 的改动由本包统一整合，HF-07 只提供页面元数据。 |
| SPEC 映射 | [REQ-19](../SPEC.md#req-19)、[REQ-20](../SPEC.md#req-20)、[REQ-21](../SPEC.md#req-21)、[REQ-23](../SPEC.md#req-23) |

## 目标

建立按发布状态放行的 SEO 与可用性检查，确保 MVP 不带原型索引/假 404 问题上线。

## 前置材料

- 路由/内容 manifest、SPEC 索引矩阵和质量预算、SOURCES.md 的 Google/Cloudflare 资料。
- 已完成公开页与游客闭环；中文 URL/资源映射候选。

所有相对源码路径以项目根目录为基准；先读 [基线证据](../BASELINE.md)。如果前置交付缺失，先记录精确缺项，不能把未完成依赖视为已通过。后续实施可采用等价目录，但须在交付记录里更新映射。

## 涉及范围

- SEO 元数据/站点地图/robots/索引策略、语义/键盘/响应式、资源预算、公开输出检查。

## 非目标

- 不保证排名、FAQ 富结果；不买外链、不自动操作 GSC；不把未发布文章改成发布。

## 明确交付物

- 各页 title/description/canonical、条件 hreflang、结构化数据与 sitemap 生成器。
- staging/production 索引矩阵、真实 404/跳转测试、质量预算报告与可执行检查命令。
- /stroke-order/、/pinyin-chart/、/dictionary/pinyin/ 与单字页的独立元数据、正文用途和参数规范化记录。
- 关键模板的无障碍修正、插画优化与按页加载。

## 实施步骤

1. 按 indexable/status 分流，排除 account/search/auth/private/session 和占位页；避免参数页无限索引。
2. 公开正文/内链/唯一 H1/来源归属校验；只给等价翻译加互相 hreflang。
3. 移除全站原型 noindex 的硬编码，改由环境与页面状态控制；测试环境不能误开放。
4. 保留六个可见 FAQ：真实问题、直接答案、关联功能内链、正文无需 JS 也可读，能力说明随阶段更新。用于回答长尾问题与便于搜索/AI 理解，不堆词、不保证 AI 引用；FAQPage/特殊 AI schema/llms.txt 不作为发布前置，仍不承诺 FAQ rich results。
5. 修键盘焦点、翻卡语义、对比、200% 放大、减少动效；测传输和实验室性能，按证据优化。
6. 核验 Cloudflare 等价环境中的路径响应；默认 307 与永久迁移规则分别处理。
7. /stroke-order/ 和 /pinyin-chart/ 内容成熟后各自索引，canonical 指向自身，不并到字典首页。笔顺 char 参数保留选择状态、canonical 回工具主地址；拼音选择/筛选不生成批量索引 URL。按拼音查字的索引与拼音教学表保留各自正文及内链。

## 验收条件

- [ ] 可索引清单只有实际成熟公开页；私人/占位/搜索页 noindex；sitemap 零非规范 URL。
- [ ] Tier 2 与 Tier 1 都可开放索引；缺插画/长故事、HSK 未取得单独书面授权不是自动 noindex 条件，具体质量问题只影响对应条目。六 FAQ 在静态 HTML 中有问有答、有实际相关链接。
- [ ] 未知 URL 404、无跳转循环、已知中文路径保留；noindex 与 robots 不互相抵消。
- [ ] 所有 SPEC 断点无横向溢出、键盘闭环可完成；自动发现的严重可访问性问题归零。
- [ ] 首页 JS/CSS/首屏图片预算达到 SPEC；测量口径明确，不把 Lighthouse 值称为真实 p75。
- [ ] 独立笔顺页与拼音表拥有不同且与正文相符的 title/H1/description；可索引时各有 sitemap 主地址，参数页不入 sitemap，字页仍使用自身 canonical。
- [ ] 拼音表在手机、键盘、读屏及无音频/无 JS 情况下仍可理解和使用可用功能；宽表不造成整页横向溢出。

## 验证方法

- 构建后扫描每个路由的 head/状态/站点地图/资源和内链，核验结构化内容与正文一致。
- 关键模板固定设备/4G 配置测 3 次中位数，记录原始报告与资源大小。
- 手工键盘、屏幕阅读器基本路径、200% 缩放和移动布局检查；不以扫描器替代全部验收。

记录命令/结果、测试环境与日期、代码/数据版本、适用截图和尚未验证项。测试必须对准行为风险；旧测试和新验收分别记录，不扩大成无关施工。

## 决策与条件依赖

无。

## 后续开发执行提示

可将下面整段直接作为后续开发对话的请求：

> 请执行 HanziFun 的 HF-08「公开页 SEO、性能与无障碍收口」。工作目录是 /Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun。先完整阅读 docs/hanzifun-rebuild/tasks/HF-08-seo-quality.md、docs/hanzifun-rebuild/SPEC.md 的映射要求、docs/hanzifun-rebuild/TASKS.md、docs/hanzifun-rebuild/BASELINE.md，并核验当前 git status 与前置任务交付，不把本轮规划当作功能已经完成。目标是：建立按发布状态放行的 SEO 与可用性检查，确保 MVP 不带原型索引/假 404 问题上线。 只完成该工作包的范围、交付物和验收，不顺带启动其他包或生产部署，不覆盖用户未提交文件。原型和父树既有工作最初位于 /Users/graceshi/.codex/worktrees/ec5f/汉字饭hanzifun，若 HF-01 已保全则采用其记录的新基线；不能因为主目录原先没有规则就忽略故事流程。凡涉及故事新增/修改/生成/验收，先完整阅读 STORY_COURSE_PRODUCTION_WORKFLOW.md，再查目标故事板、lessons.js 与人工确认点。按任务文件验证并报告真实结果、文件链接、未完成项和后续依赖；缺少外部配置时完成不依赖它的本地工作，但不要伪造接通或验收证据。
