# 官方资料与证据边界

核对日：2026-10-23（Asia/Singapore）。这些资料支持 [SPEC](SPEC.md) 的建议和限制，不代表已经取得生产数据包、商业授权或开通服务。施工时保存实际版本/文件/hash；页面日后变化不应悄悄改变已发布数据。

2026-10-24 补核：Information 的 Kanji、拼音规则、canonical，以及本版 HSK 限定使用范围、FAQ 与 AI 搜索资料。其他历史核对日期不据此刷新；用户执行决策与外部已核实事实分别记录。

使用 agent-reach 的 Exa/Jina 路径时遇到网络不可达，随后使用内置网页工具读取下列官方/项目维护者来源。未将第三方评论或旧 SEO 诊断的结论当成权威依据。

<a id="src-dictionary"></a>
## 字典与字符

| 来源 | 本轮核实 | 施工时还须完成 |
|---|---|---|
| [MDBG：CC-CEDICT 官方下载](https://www.mdbg.net/chinese/dictionary?page=cc-cedict) | 官方页提供 UTF-8、简繁、拼音与英义数据下载，当前说明许可为 CC BY-SA 4.0；不是应用程序本身 | 锁定实际下载包和日期、格式版本、hash，检查包内许可一致性；归属与派生数据分享义务；不自动抓取网站查询页面 |
| [CC-CEDICT 格式说明](https://cc-cedict.org/wiki/format:syntax) | 格式说明入口由官方下载页链接；本轮未逐条核验该格式文档 | HF-02 实现前阅读，按实际数据格式建立解析夹具 |
| [Unicode Unihan 发行入口](https://www.unicode.org/Public/) / [Unicode License v3](https://www.unicode.org/license.txt) | 许可页要求保留版权和许可说明 | 选择固定发行版本及 Unihan.zip；本轮未下载 Unihan，不声称采用“最新版”；核对该发行包具体许可与字段定义 |

字典数据的来源、代码的许可证、原创插画的来源应分别登记，不能混成一句“都是开源”。教学联想需要人工审核，并不因字典有英文释义就获得历史字源证明。

<a id="src-character-info"></a>
## 单字 Information：简繁与 Japanese Kanji

2026-10-24 读取以下资料，用于约束字段与展示；尚未下载或逐字审核生产映射：

| 来源 | 核实与使用边界 |
|---|---|
| [Unicode UAX #38：Unihan](https://www.unicode.org/reports/tr38/) | 定义简繁、日语变体及 `kJoyoKanji` 等字段；本次核对了常用汉字字段说明。实施时须对照所锁定发行版的字段定义与实际数据，候选关系仍需教学审核 |
| [Unicode：Chinese and Japanese FAQ](https://www.unicode.org/faq/han_cjk.html) | 汉字编码不直接判定所属语言；缺少日语读音记录不能推断该字在日语中不存在；日语字形宜按日语字体与语言标记展示 |
| [日本文化厅：常用漢字表](https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/) | 官方页说明该表是一般社会生活中的汉字使用指引，提供 2010 年表的文件入口。本次读取说明与入口，未逐项审核 PDF；不能将该表当成日语所有汉字的全集 |

HF-02 对简繁关系保留一对多和词境；对 Kanji 保留对应字形、证据定位、来源版本、核验状态和必要用法说明。常用表中核实的同字可作为首批覆盖；不同字形的对应还需关系证据。不能把“转换成繁体”当作“转换成日语”，也不据同形自动复制中文读音与释义。没有证据时保持未核实状态，不发布否定性结论。

<a id="src-pinyin"></a>
## Pinyin Chart：规则、音节和音频

[华东师范大学语言文字网刊载的《汉语拼音方案》](https://yywz.ecnu.edu.cn/1f/56/c30556a335702/page.htm)（2026-10-24 读取）列出声母、韵母、声调及拼写规则，包含零声母、`ü` 与 `j/q/x/n/l`、`iou/uei/uen` 缩写、轻声与隔音符号等。此资料用于核对规则，不是已整理好的合法音节/声调音频数据包，也未证明网页图片或第三方录音可再分发。

HF-02 需另交付有版本的音节范围清单、规范拼写、实际可用声调、例字和音频审核记录；以清单计算覆盖，不能用声母 × 韵母机械生成全部组合，或由核心 126 字推定拼音表完整。音频采用自有或明确获许可素材，并与例词/声调对应；轻声使用词境，缺音频记录缺项，不把浏览器英语朗读当成普通话示范。

<a id="src-strokes"></a>
## 笔顺

- [Hanzi Writer 官方文档](https://hanziwriter.org/docs.html)：支持动画/测验和自定义 `charDataLoader`；可按字自托管，避免整包笔画阻塞页面。Phase 1 只使用展示/逐笔能力，不顺带承诺已实现手写评测。
- [hanzi-writer-data 维护者仓库与许可](https://github.com/chanind/hanzi-writer-data#license)：数据与渲染器代码分别授权；数据来自 Make Me a Hanzi/文鼎字形，按 Arphic Public License 处理。
- [Make Me a Hanzi 维护者仓库](https://github.com/skishore/makemeahanzi)：区分字典字段与笔画路径/中线数据，面向中国大陆笔顺；字形/地区差异要显示，不能将其当成所有地区唯一笔顺。

HF-02 需逐个保存软件包许可、图形数据许可和 commit/hash；本轮未选择具体 npm 包版本。若另用其 dictionary 字段，要再核验该部分自己的许可，不能从图形许可类推。

<a id="src-hsk"></a>
## HSK：三个不同版本概念

| 官方来源 | 核实结果 | 对产品的要求 |
|---|---|---|
| [HSK 官方资源中心](https://admin.chinesetest.cn/godownload.do) | 有《汉语水平考试（HSK）词汇表（2015版）》下载入口 | 作为 HSK 2.0 词表候选基准；HF-07 获取实际文件、冻结分级与累计规则；不把词表提取字称为官方独立字表 |
| [教育部发布 GF0025-2021](https://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/s5987/202103/t20210329_523304.html) | 三等九级，2021-07-01 开始实施，包含音节/汉字/词汇/语法四维基准 | 是能力标准，不直接替代后来的考试大纲 |
| [中文考试服务网大纲入口](https://www.chinesetest.cn/syllabus) → [官网链接的 HSK 考试大纲 PDF](https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf) | PDF 406 页；封面“2025-11 发布、2026-07 实施”；目录含词汇、认读字/书写字等部分，包含 7—9 联合级别 | HSK 3.0 按此实际文件及可能修订锁定；词、认读、书写不同类型分开；HF-07/14 需核对完整表，不把目录检查当数据解析完成 |
| [中文考试服务网首页公告](https://www.chinesetest.cn/) / [正式开考通知入口](https://www.chinesetest.cn/news/51336883) | 本轮官网首页可读公告称 2026-12-13 全球正式开考；通知详情动态正文未从文本工具提取 | 页面说明要区分大纲日期与正式开考；实施/发布时重新核对考点和日期，不凭第三方推算 |

**项目决策已更新：** 用户确认仅使用字/词头、版本、等级和必要清单归属来组织学习入口，释义/读音采用 CC-CEDICT，笔顺采用许可数据，例句/助记自研。HF-02/07/14 按 [SPEC 放行指令](SPEC.md#hsk-release-policy) 执行，登记 `rightsStatus=approved-with-scope`、`decisionBasis=user-confirmed-scope`；不默认等待书面授权、不因这一原因设 noindex，不把确认的项目范围冒称第三方许可或法律鉴定。

2026-10-24 补核的证据：

- [中文考试服务网法律声明](https://admin.chinesetest.cn/golawintro.do)：要求使用内容标注来源，另列不能转载的素材及信息用途等限制。此页面不是针对本站用途的单独授权；实施时保存实际使用文件及适用声明，只按本项目限定范围处理，不照搬原文件、题目、官方文字/版式或受限内容。
- [国家版权局发布的《中华人民共和国著作权法》](https://www.ncac.gov.cn/xxfb/flfg/flfg_532/202103/t20210309_50530.html)：第五条与第十五条分别涉及不适用范围及具有独创性选择/编排的汇编作品；仅由“数据是事实”不能推出任何整库复制均无权利问题。这是限定使用范围、保留来源的依据，不是把 HSK 教学页重新设为默认阻塞。

若具体文件/字段遇到明确适用限制，记录来源/条款与影响，优先替换来源或去除冲突内容，只处理该部分；不将没有单独书面授权扩大成整站停止。CC-CEDICT 的署名/同许可、笔画数据许可照常履行。实际文件/hash 仍在数据任务落地，不虚构已完成导入或全部法律结论。

<a id="src-cloudflare"></a>
## 当前部署约束

[Cloudflare Workers Static Assets HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/) 说明了尾斜杠、扩展名及不同处理策略，默认示例中的规范化可能是 307。项目当前 `wrangler.toml` 是静态 Assets + SPA 未命中 fallback；生产需要另外测试旧 `.html`、query、真实 404 与永久重定向，不照搬原型路由服务器的结果。

本轮没有访问用户的 Cloudflare 账户、读取生产绑定或部署；候选方案不等于实际线上配置。

<a id="src-auth"></a>
## 账号候选方案

- [Supabase 服务端认证文档](https://supabase.com/docs/guides/auth/server-side)：托管身份可通过 cookie 在服务端使用。自建 BFF 的 HttpOnly 会话是本 SPEC 的设计建议，需要按所选实现验证，并非假定 SDK 自动完成所有安全要求。
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)：按认证身份限制行访问、写入检查和 owner 不可随意变更。需测试 anon、A/B 账号和 INSERT/UPDATE/DELETE，不能只测试读接口。

Supabase Auth/Postgres + Worker 是待定架构推荐。地区、价格、备份能力、Google OAuth/邮件配置应在 HF-10 开工时对照当时官方文档核验；本轮没有比价、建立账户或申请资源。

<a id="src-seo"></a>
## SEO 与迁移

- [Google Search 官方更新记录](https://developers.google.com/search/updates#may-2026)：2026-05-07 起 FAQ 富结果不再展示，6 月移除了相关文档。六个 FAQ 保留为站点帮助内容，FAQPage 不作为获客或富结果验收承诺。
- [Google 多语言版本说明](https://developers.google.com/search/docs/specialty/international/localized-versions)：为等价语言版本维护对应关系。英文营销页与中文旧学习应用不是对应翻译页，SPEC 建议不要强配 hreflang。
- [Google URL 迁移指南](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)：进行 URL 映射、正确跳转、更新链接与站点地图并跟踪迁移。SPEC 的同域中文保留方案是对本项目的工程建议，不是 Google 对本站的诊断。
- [Google canonical 指南](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)（2026-10-24 补核）：canonical 与 sitemap 等向搜索引擎表达首选地址，并非保证被采用。SPEC 对独立工具主地址、选字参数和拼音状态的处理是本项目设计；不由此声称根目录路径天然获得更多流量。
- [Google AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)（2026-10-24 补核）：既有 SEO、可读文本和正常内链仍适用，没有额外必需的 AI schema；达到要求不保证抓取、索引或展示。六个 FAQ 保留为真实回答用户问题的正文，不能宣称 FAQ 格式本身保证任何 AI 搜索引用。

两级内容标准是本站的编辑与发布决策：有用、审核通过的 Tier 2 字页不因缺少插画或长故事而 noindex。允许 AI 辅助起草，不把批量生成本身当作质量或收录证明；正文准确性、学习功能与来源仍需检查。FAQ 富结果停用日期已再次在官方更新记录核对，保留可见问答不依赖该展示功能。

用户提供的 SEO 诊断只是参考：不沿用它把熟悉/不熟悉按钮直接等同 SRS 的表述；不将其历史搜索量写成当前验证数据；不据其建议自动操作 Search Console、营销、外链或生产部署。

<a id="src-quality"></a>
## 质量指标

[Web Vitals 官方说明](https://web.dev/articles/vitals) 的良好体验阈值为 LCP 2.5 秒、INP 200 毫秒、CLS 0.1，并强调真实访问分布。SPEC 取其作目标；预算、设备矩阵、可靠性及恢复时限是本项目建议，需要工程测量。浏览器实验室分数不能证明真实用户 p75 已达标。

WCAG 2.2 AA 是项目采用的可访问性目标；实施时应依据 [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) 核查适用条款，不能仅凭自动扫描宣布完全合规。该标准全文本轮未逐条审查。
