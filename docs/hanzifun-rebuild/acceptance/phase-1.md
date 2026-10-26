# HF-09 · Phase 1 MVP 本地总验收

日期：2026-10-26（Asia/Singapore）。工作目录：`/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun`，`main`。实施前 HEAD：`bf3c62c4d80093fd140b10b9fcfe536205280003`。候选：`hf09-mvp-candidate`。

**工程/本地自动门控 PASS；HF-09 完整候选验收 BLOCKED，等待人工内容、音频与设备验收；未生产部署。** 本报告不关闭 HF-02/04/07/08 的人工缺口，不代表 Phase 1 已上线。人工放行入口见 [Checklist](phase-1-checklist.md)。

## 候选身份与复现

- 产品、脚本、测试与数据输入 SHA-256：`0cc2525cd1af4a552e8d1ec71662371258efebe7ddcdbd027b7e54f629d4bc76`。范围见 [gate.json](../evidence/hf09/gate.json)；包含新增未跟踪源码，排除验收文档和既有无关用户文件。Git HEAD 是实施基点，输入 hash 标识包含本包改动的候选，不能把二者混为一谈。
- Production 候选 1546 文件，完整路径/内容集合 SHA-256：`e06078a98b890cb7d93a9fdff5beb73930f6a6ac56fdff125d8659766cf6a4b2`；重复构建一致。所有构建均在忽略的 `.cache/hf09/{production,production-repeat,staging,local}/`，保留原 `dist/`。
- 轻量收据位于 `docs/hanzifun-rebuild/evidence/hf09/`；截图、下载备份、日志、Workers 状态均留在 `.cache/hf09/`，不提交 Git。截图位置/hash 见 [visuals.json](../evidence/hf09/visuals.json)。

```sh
node scripts/validate-mvp-gate.mjs --browser
# 同样重跑，但人工未签字时返回 2，工程失败返回 1：
node scripts/validate-mvp-gate.mjs --browser --require-human
# 默认不带 --browser 时报告浏览器未运行，不能作为完整候选验收。
```

总门控使用本机已安装的 Playwright/Chrome 与 Wrangler，不自动下载，不执行 deploy。可用 `HF09_PLAYWRIGHT_MODULE` 和 `HF09_WRANGLER_CLI` 指定本机路径；复用用例也支持各自 HF06/07/08 的 Playwright 路径环境变量。完整日志留在 `.cache/hf09/`。运行日志中的 production 仅表示构建策略。

## HF-01～08 汇总

| 范围 | 本轮结果 | 结论边界 |
|---|---|---|
| HF-01 保全 | 403 项旧资源按发布契约比对通过（story.html只允许既有两处返回链接转换，其余字节一致）；旧资源/课程代码相对基点无改动；77 原型路径继续映射 | 108 教学位置、107 唯一字、8 个稳定 lessonId；不补造审批 |
| HF-02 数据 | 来源锁/许可、schema、离线确定性与笔画 hash 全部通过 | 126 核心字、153 读音、410 音节、1323 声调候选；17 部件缺项与10旧短语缺词头继续显式记录 |
| HF-03 外壳 | 七段首页、六 FAQ、导航、无 JS、布局、旧中文入口通过 | 预览正文不等于已审核教学内容 |
| HF-04 字典 | 四种“水”搜索→Information/助记→笔顺→独立同字工具；多音/简繁/条件 Kanji、拼音 shui→字页通过 | 126 条 Tier2 教学字段齐全，人工已验收 0/126；未用插画数量设门槛 |
| HF-05/06 学习 | 真实保存→again十分钟→刷新→到期；四组卡、暂停续练、去重、双标签、失败/满额/重试/恢复通过 | 三旧源原文未变；已载会话断网可保存，不宣称整站离线 |
| HF-07 HSK/场景 | 150词/174派生字；300词/246认读字/100个一至二级联合书写字；来源全量映射、两场景及受控组/收藏/返回通过 | 213 补充字已有逐项门槛，但尚无独立 Tier2 教学编辑；人工已验收 0/213；6句场景音频缺失 |
| HF-08 SEO/质量 | 三环境各401英文页、354核心页、402 JSON-LD；sitemap、预算、404/跳转、axe、无 JS 与布局通过 | Safari/Firefox、真机、真实读屏与原生缩放待人工补验 |

`npm test` **133/133**，原127项保留，新增6项。旧“所有字永远 noindex”的快照断言改为按发布策略校验，未审拒绝发布、篡改/过期审批拒绝、未知字/重复批次/误带听审字段拒绝的反例均保留。

## 跨包真实旅程与迁移

1. `水 / shuǐ / shui3 / water` 均找到真实字页；逐笔与独立 `/stroke-order/?char=水` 保持选中字。拼音 shui 可回到水；待审音频按钮禁用，未把缺音冒充听音成功。
2. HF-06 Chrome 在 Web Locks、有/无锁混合环境验证真实落盘、陈旧写入拒绝、双标签竞争、again 到期、刷新/关页续练、四组原卡、满额/拒绝写入/临时导出恢复。到期边界在 QA 中控制时钟，没有改用户设备时间。
3. HF-07 验两版首级、联合书写范围、精确选择集、餐厅/商务逐词解释、上下文组→字典→闪卡→返回与收藏。词条含义保持整词，复习评分只计组成字。
4. 三旧键 `hanzifun.learning.v1`、`hanzifun.story.v1`、`hanzifun.prototype.learning.v1` 演练预览、确认与重复导入；保留“龘”和未知故事的未映射项，不推造 SRS 事件。真实下载备份，再在另一个本机端口 origin 上传/预览/确认；imports/favorites 一致，原键原文未变。
5. Node 静态服务的应用旅程与 Workers 的 HTTP 语义分开测试。[Workers收据](../evidence/hf09/workers-http.json)：production/staging 共18项，未知路径真实404；旧中文301；story.html默认307保留lesson参数；跳转终点200；staging全包noindex头。

## 八课与原中文回归

已完整阅读根生产流程，查阅七份现存故事板、课程配置和基线整合记录。历史故事板中的“保留音轨”等描述不代表现有媒体事实：原单元测试确认全部正式视频无 `soun` 音轨，页面视频静音、声音来自现有固定 TTS。未替换视频、生成新音频或修改课程。第一课沿用旧场景分段能力，没有新增逐字高亮。

本轮逐课从中文首页展开合集、点击真实 lesson 链接，正常速度播放故事；逐项跟读；每题先答错观察反馈，再正确完成，结果页分数正确。字幕/高亮的实际 DOM 观测记录如下；这是自动播放证据，不是人类听审或观感签字。

| lessonId | 跟读项 | 题数 | 观察字幕数 | 观察高亮字 | 人工状态 |
|---|---:|---:|---:|---|---|
| cat-and-fish-01 | 5 | 3 | 3 | 原第一课无 keywordCues，保留原能力 | 待人工确认 |
| ant-moving-bean-02 | 6 | 3 | 3 | 用、力、豆、办、法、请 | 待人工确认 |
| cat-mirror-03 | 6 | 3 | 3 | 才、睡、左、右、旁、只 | 待人工确认 |
| little-turtle-04 | 6 | 3 | 3 | 龟、脖、壳、事、安、命 | 待人工确认 |
| little-frog-05 | 6 | 3 | 4 | 睛、嘴、肚、害、保、找 | 待人工确认 |
| painting-rooster-06 | 6 | 3 | 4 | 冠、裁、雪、生、语、门 | 待人工确认 |
| wind-doll-07 | 6 | 3 | 4 | 没、腿、南、北、拍、做 | 待人工确认 |
| cucumber-flower-08 | 6 | 3 | 4 | 瓜、挂、朵、当、叔、说 | 待人工确认 |

[完整浏览器摘要](../evidence/hf09/browser.json) 与 [原学习回归](../evidence/hf09/hf06-browser.json)、[HSK回归](../evidence/hf09/hf07-browser.json)、[质量回归](../evidence/hf09/hf08-browser.json) 分开保存。用户最终体验确认缺口不能由自动结果覆盖。

## 预算与性能

- 首页 JS gzip 7.29 KiB / 100 KiB，CSS 10.71 KiB / 50 KiB，关键图片 347.12 KiB / 400 KiB。
- 另用临时测量脚本补测真实六卡组，8次翻卡/评价从受信点击事件至卡片DOM变化最大约1.1ms，低于100ms；见 [feedback.json](../evidence/hf09/feedback.json)。这是桌面Chrome已载数据的反馈，不是持久化延迟或真实INP。
- 已加载搜索索引100次查询 p95：3.20ms / 200ms；范围为桌面 Chrome 的暖索引计算，不包括网络等待。
- 1000卡/10000事件/1000轮内存 Storage：摘要 42.4ms；冷加载校验 862.3ms；完整恢复预检 940.5ms。约11.39MB快照超出常见 localStorage 容量，不能称为真实持久化容量或“所有恢复≤300ms”。冷启动和大日志仍有限制；本轮未更换存储架构。
- 16类页面axe零违规、65档布局与5模板CSS200%重排、键盘/无JS通过。axe incomplete、CDP AX 与CSS zoom均不替代真实读屏/原生缩放。

固定移动视口390×844、4G/4×CPU、禁用缓存，每模板3次实验室中位数：

| 模板 | LCP | CLS |
|---|---:|---:|
| `/` | 692 ms | 0.000 |
| `/dictionary/水/` | 624 ms | 0.000 |
| `/pinyin-chart/` | 800 ms | 0.000 |
| `/academic/hsk-3/` | 696 ms | 0.000 |

实验室结果不能称为真实访问 p75 或 INP；线上指标及生产观察属于后续实际发布验证范围。

## 索引与安全

| 构建环境 | sitemap | 英文 noindex |
|---|---:|---:|
| production | 3个既有HSK范围页 | 398 |
| staging | 0 | 401 |
| local | 0 | 401 |

首页、339字页、工具和两场景仍按现有范围预览；内容审批没有被自动写为 approved。私人页、搜索、动态闪卡、占位页不开放索引。Unicode canonical、参数剔除及sitemap集合一致。

公开包不含 `.env`、缓存、依赖、测试、开发文档或候选故事素材。既有 `site-assets/dictionary/source-extracts/components.json` 是有许可署名的受控来源摘录，仅此精确路径允许，并与入库摘录逐字节比对；不允许借此前缀复制原始源库。没有账号、云同步、Billing或追踪器。

## 遗留与下一步

- P0人工放行：核心126字逐项英义/读音/简繁/例句/助记签字；音节教学与实际音频听审；两场景语言及音频；八课适用人工确认；跨浏览器/真机/读屏/原生缩放。每项入口、责任与证据格式见 Checklist。`--require-human` 在这些签字未齐时保持非零。
- P1内容补齐：213字从来源草稿补齐独立 Tier2 教学字段，再逐项审核、逐批发布。来源完整不等于教学完成；Tier1增强目标仍单列，本次未验收任何Tier1。
- 已知性能/容量边界：大快照冷启动与导入成本、localStorage容量如上；不能以工程门控PASS抹去这些限制。
- 后续只按明确批次补验、记录并重跑受影响门控。HF-09完整放行后才交下一发布关口；本会话未执行远端部署或生产发布，也未开启后续阶段。
