# hanzifun.online 汉字笔顺主题站 · 完整内容与 On-Page SEO Spec

## 一、项目范围

本站以 <https://hanzifun.online/stroke-order/> 为一级主题枢纽，围绕"英文用户如何认识与书写汉字"这一个需求内核，建设 5 个静态内容页。不生成程序化单字页，不建独立的字表索引页。

| # | URL | 角色 | 优先级 |
|---|---|---|---|
| P0 | `/stroke-order/` | 主页面：体系总纲 + 查询工具 | P0 |
| A | `/stroke-order/basic-strokes/` | 构件层：8 种基本笔画 | P0 |
| B | `/stroke-order/rules/` | 规则层：笔顺规则与地区差异 | P1 |
| E | `/stroke-order/examples/` | 实例层：8 个高频字逐笔示范 | P1 |
| D | `/stroke-order/animation/` | 呈现层：动画素材与嵌入 | P2 |

明确不做的事：不做 `/stroke-order/<汉字>/` 单字页，不做拼音、部首、笔画数的独立字表页，不按 Unicode 码位批量生成任何页面。主页面工具区的查询结果一律在该页内以弹层或结果区呈现，**不产生新的可索引 URL**——这是防止 thin content 扩散的第一道闸门。

## 二、开工前的两个验证

这两项结论直接决定页面数量，先做再动手。

**验证一：`chinese stroke order` 与 `chinese character strokes` 的 SERP 重合度。** 手工对照两词前 10 名。

- 重合过半 → 只保留 `/stroke-order/` 一页，`chinese character strokes` 作为变体词写进 H1 变体与正文。
- 结果分化 → 才为后者另开 `/stroke-order/character-strokes/`。

默认按单页方案执行。

**验证二：`chinese characters animation` 的 SERP 类型。** 若前列结果为 GIF、视频、图片 → D 页做素材库与嵌入分发；若为工具站 → D 页无独立价值，只保留"批量演示"视图，不与实例页重复。

## 三、URL 与技术规范

| 项 | 规定 |
|---|---|
| 尾斜杠 | 全部带尾斜杠；不带斜杠的访问服务端 301 到带斜杠版本，禁止两态并存 |
| 大小写 | 全小写，连字符分隔，无下划线、无 `.html`、无日期、无参数 |
| 目录结构 | 全部子页收在 `/stroke-order/` 下，形成单一主题簇，便于未来扩展 `/pinyin/`、`/radicals/` 等平行簇 |
| canonical | 每页自引用，绝对 URL，含尾斜杠 |
| 面包屑 | Home > Stroke Order > 当前页；输出 `BreadcrumbList` JSON-LD |
| H1 | 每页恰好一个，位于正文顶部；与 `<title>` 不同字符串但共享主词 |
| 标题层级 | 不跳级，正文只用 H2 与 H3 |
| 语言 | 英文单语；不做 hreflang，仅在 head 预留 alternate 空位 |
| 主页面改动 | 若 `/stroke-order/` 已有排名，不动 URL，只更新 title、H1、正文主词，无需 301 |
| 根页分工 | 站点根 `/` 定位品牌与产品体验（描红、闯关等），目标词不得与 `/stroke-order/` 重合 |

## 四、全站 On-Page 约定

**标题与描述**

- `<title>` 50–60 字符，主词前置，含一个数字或明确收益点。
- meta description 150–160 字符，完整句，含一个具体数字或差异化承诺。
- 每页句式必须不同，禁止同一模板套全站；实例页内每个字的数据表必须注入真实笔画数与部首。

**结构化数据**，只允许以下类型，出现其它类型视为错误：

| 页面 | schema |
|---|---|
| 主页面 | Article + FAQPage + BreadcrumbList |
| A | Article + FAQPage + BreadcrumbList |
| B | Article + FAQPage + BreadcrumbList |
| E | Article + FAQPage + BreadcrumbList（不给单个字挂额外 schema） |
| D | Article + BreadcrumbList |

不加 HowTo（已弱化）、不加 Product、不加 SoftwareApplication。Article 必须填 `author` 与 `datePublished`。

**图片与动效**

- 静态图 WebP，矢量图 SVG；`<img>` 必带 `width`、`height`、`alt`、`loading`。
- `alt` 写具体描述（`the eight basic Chinese strokes arranged in two rows`），禁止关键词堆叠（`chinese strokes, basic strokes, stroke order`）。
- 首屏图 `loading="eager"`，其余 `lazy`。
- 所有动画区必须有**无 JS 回退**：`<noscript>` 输出静态逐笔 SVG + 文本化笔顺编号。纯 canvas 动画的页面在慢网与爬虫视角下等于空页。

**数据来源，本 spec 的红线**

笔画数、笔顺序列、部首、拼音、声调、结构、笔画类型序列、笔顺编号，全部从确定数据源读取：Hanzi Writer 字库、Make Me a Hanzi、cnchar、Unihan 数据库。模板只负责渲染，**任何情况下不得由生成模型推断或补齐语言数据**；缺数据时渲染占位并在构建日志报错。例句人工或半自动撰写，不批量套模板生成。

**共享组件清单**

`Breadcrumbs`、`StrokePlayer`（逐笔高亮 / 暂停 / 慢放 / 重播 / 描红）、`StrokeStaticFallback`、`StrokeDataTable`、`FAQBlock`、`PracticeSheetCTA`、`InlineLookup`（主页面查询工具）、`AnchorNav`（页内胶囊导航）。

## 五、页面 Spec

### P0 · 主页面 `/stroke-order/`

| 项 | 内容 |
|---|---|
| title | `Chinese Stroke Order: Rules, Charts & Character Lookup` |
| H1 | `Chinese Stroke Order` |
| 主词 | chinese stroke order |
| 辅词 | chinese character strokes、chinese character stroke order、stroke order chart、how to write chinese characters |
| 字数 | 1500–2500 |
| 出链 | A、B、E、D，以及 E 页 ≥4 个字的锚点 |

区块顺序：

1. 速答段（120–180 词）。直接回答"汉字按什么顺序写、有几条基本规则、为什么重要"。这段必须脱离上下文可读，用于抢 snippet 与 AI Overview。
2. 笔顺体系总览信息图。8 种基本笔画与派生笔画的树状结构，分支标注指向 A 页。
3. 七条规则速览。编号列表一句一条，链到 B 页展开，本页不细讲。
4. 内嵌查询工具。输入汉字返回笔画数、逐笔序列、部首、结构、笔顺编号；结果在页内呈现，不生成新 URL。这是本页的转化枢纽。
5. 笔画怎么数。计数规则与常见争议，链到 B 页。
6. 概念区分。笔画、部首、部件、笔顺四者差别，各一句。
7. 四个高频字速览。取 E 页中的我、永、国、好，各一行摘要 + 锚点链接，把内链落到具体区块。
8. 学习路径。认笔画 → 记规则 → 写整字，三层各给入口，链接嵌在段落内。
9. 练习资源。田字格 PDF，邮箱换取。
10. 数据来源声明。注明笔画分类依据的标准，提升专业可信度。
11. FAQ 6 条。

定位提醒：首页 SERP 多为维基百科类参考结果，本页主体形态必须是"参考资料"——定义清楚、结构完整、带目录与 FAQ。工具是页面中段的一个区块，不是页面本身。

### A · 构件层 `/stroke-order/basic-strokes/`

| 项 | 内容 |
|---|---|
| title | `Chinese Basic Strokes: All 8 Strokes With Examples` |
| H1 | `Chinese Basic Strokes` |
| 主词 | chinese basic strokes |
| 辅词 | basic strokes in chinese、8 basic strokes、chinese stroke types |
| 字数 | 1200–1800 |
| 出链 | 主页面、B、E（锚点 ≥6） |

区块顺序：

1. 速答：8 个笔画的中英文名 + 拼音，一次列全，有序列表。
2. 四列表格：笔画名 / 拼音 / 方向描述 / 例字。移动端可横向滚动。
3. 每个笔画一个 H2，区块内固定四件套：1–2 秒单笔循环 SVG（只演示起笔到收笔）、书写要点两三句、3–5 个例字（优先取 E 页 8 个字，链到对应锚点）、一个常见错误。
4. 派生笔画独立成节：横折、竖钩、横折钩等，表格化，不与基本笔画混讲。
5. 与日本汉字笔画的差异，可选段落，承接部分日本市场流量。
6. 练习纸 CTA。
7. FAQ 5 条。

红线：本页只讲单笔。任何整字动画一律不出现在本页，整字组合只属于 E 页。

### B · 规则层 `/stroke-order/rules/`

| 项 | 内容 |
|---|---|
| title | `Chinese Stroke Order Rules: 7 Rules With Examples` |
| H1 | `Chinese Stroke Order Rules` |
| 主词 | chinese stroke order rules |
| 辅词 | stroke order rules chinese、chinese writing order rules |
| 字数 | 1000–1500 |
| 出链 | 主页面、A、E（锚点 ≥6） |

区块顺序：

1. 速答：7 条规则编号列表，一句一条，最易被 snippet 整段取走。
2. 每条规则一个 H2：规则原句 + 2–3 个例字带动图 + 一条易错提示。
3. 例外与地区差异：中国大陆、台湾、日本对若干字的笔顺标准分歧，列典型分歧字。全站最能拉开差异化的段落，工具站基本不写，值得多花篇幅。
4. FAQ 5 条。

存在前提：`chinese stroke order rules` 有独立搜索量；若无，本节内容并入主页面第 3、5 区块，不硬撑独立页。

### E · 实例层 `/stroke-order/examples/`

| 项 | 内容 |
|---|---|
| URL | <https://hanzifun.online/stroke-order/examples/> |
| title | `Chinese Stroke Order Examples: 8 Common Characters Step by Step` |
| H1 | `Chinese Stroke Order Examples` |
| 主词 | chinese stroke order examples |
| 辅词 | common chinese characters stroke order、eight principles of yong、how to write chinese characters |
| 字数 | 1800–2500（每字 200–280） |
| 出链 | 主页面工具区、A、B、D |

主词必须是"示例型"词，**不得**取 `chinese stroke order`，那是主页面的词。本页 SEO 价值主要在三处：承接示例类长尾、为 A 与 B 提供锚点落点、作为真实可用的教学样本。

选字，8 个，覆盖四种结构与 8 种基本笔画：

| 字 | 锚点 id | 结构 | 入选理由 |
|---|---|---|---|
| 我 | `#wo` | 独体 | 最高频代词，笔顺争议多 |
| 你 | `#ni` | 左右 | 与"我"成对，入门必学 |
| 好 | `#hao` | 左右 | 高频，女+子组合逻辑清晰 |
| 是 | `#shi` | 上下 | 高频虚词，笔画多易错 |
| 中 | `#zhong` | 独体 | 竖穿口，演示特殊竖笔规则 |
| 国 | `#guo` | 全包围 | 唯一能演示"先外后内再封口"的字 |
| 学 | `#xue` | 上下 | 含"子"部件，可回链 A 的派生笔画 |
| 永 | `#yong` | 独体 | 永字八法，八种笔画齐备；`eight principles of yong` 有独立英文需求，跨市场价值最高 |

区块顺序：

1. H1 + 导语（80–120 词），说明本页用高频字做完整示范，每字按"播放—分解—数据—用例—易错"讲解。
2. 目录锚点条，列全 8 字，移动端可横向滑动。
3. 选字说明（约 100 词），交代筛选依据：高频常用 + 笔画覆盖 + 结构类型覆盖。这是差异化内容，也解释为何选这几个字。
4. 每字一个 H2，区块内固定六件套：
   - `StrokePlayer` 交互播放器。
   - 静态逐笔分解图（第 1 笔、第 2 笔……），爬虫与低带宽可见。
   - `StrokeDataTable`：拼音、声调、部首、笔画数、结构、笔画类型序列、笔顺编号。
   - 常用词与例句 ≥3 条，人工撰写。
   - 1–2 条该字易错笔顺提示。
   - 页内关联锚点：链到同结构或形近的另两个字（页内，不外链）。
5. 横向对比表：8 字按笔画数、部首、结构、难点排成一张表。多字共处一页才做得出的增值内容，独立页无法复制，务必保留。
6. 笔顺共性总结：从这 8 字归纳 3–5 条规律，链 B 页展开。
7. 查其他字：指向主页面 `InlineLookup` 的 CTA。
8. FAQ 5 条。

锚点规范：id 用纯拼音（`wo`、`ni`），不加 `-stroke-order` 后缀，父路径已表达主题。锚点一经发布不再改名。

### D · 呈现层 `/stroke-order/animation/`

| 项 | 内容 |
|---|---|
| title | `Chinese Characters Animation: GIFs & Embed Code` |
| H1 | `Chinese Characters Animation` |
| 主词 | chinese characters animation |
| schema | Article + BreadcrumbList |

形态由第二节验证二决定：

- 媒体类 SERP → 素材库：按部首与常用度筛选的动画画廊，每字 2–3 秒循环，标注授权，附嵌入代码生成器（iframe / GIF 直链 / SVG 三种）。嵌入是核心目的——别人把播放器嵌进自己站点等于自然外链加品牌曝光。同批素材再分发到 YouTube 与短视频平台，拿视频搜索位。
- 工具类 SERP → 与 E 页播放器合并，本页只保留"批量演示"视图。

## 六、内链矩阵与锚文本

| From → To | 锚文本 |
|---|---|
| 主页面 → A | `the 8 basic strokes`、`basic stroke types` |
| 主页面 → B | `stroke order rules`、`how stroke order works` |
| 主页面 → E | `worked examples`、`see how common characters are written` |
| 主页面 → E 单字 | `the character 永`、`how to write 国` |
| 主页面 → D | `stroke animations` |
| A 例字 → E | 例字本身 → `/stroke-order/examples/#yong` |
| A → B | `the rules behind stroke order` |
| B → E | `see these rules applied` → 对应规则的字锚点 |
| E → A | `the 8 basic strokes` |
| E → B | `stroke order rules` |
| E → 主页面 | `Chinese stroke order guide` |
| E → D | `stroke animations`（播放器说明处一句） |
| 任意子页 → 主页面 | 面包屑 + 正文首段一句 context 回链 |
| 任意子页 → E | 例字/规则关联一律带锚点，不指页首 |

三条硬规则：

- 同一目标页收到的 exact match 锚文本不超过该页入链的三成，其余用变体与描述性锚文本。
- 禁止页尾"Related Articles"批量输出链接；所有链接落在正文对应段落。
- 指向 E 页的链接必须带锚点，落到具体字。大量指向页首会把 E 页降格成目录页，锚文本相关性也浪费。

## 七、防自我竞争红线

本站只有 5 页且主题高度重叠，成败全在分工是否干净。

| 页面 | 只负责 | 明确不做 |
|---|---|---|
| 主页面 | 体系、分类、计数规则概述、查询工具、学习路径 | 不逐字演示、不展开规则细节 |
| A | 单笔怎么起笔行笔收笔 | 不出现整字动画 |
| B | 规则条文与地区差异 | 不做逐字全流程讲解 |
| E | 整字组合、某笔在该字中的位置与先后 | 不做对话，不承担 `chinese stroke order` 主词 |
| D | 动画素材与嵌入分发 | 不与 E 页播放器功能重复 |

同义词不分页：`chinese stroke order`、`mandarin stroke order`、`chinese hanzi stroke order`、`chinese character stroke order` 由主页面一页承载，靠 H1 变体、小标题、alt、锚文本做语义覆盖。一个查询只对应一个目标页。

素材分层使用：单笔动画只在 A，整字播放只在 E，批量演示只在 D，同一素材不跨页重复。

主页面与 E 页都涉及"笔顺简介"时，主页面三句带过并链出，E 页才是展开处，不复制段落。

## 八、发布顺序

按"能独立获得排名"的能力排序，不按层级排序：

1. A 与 B 先上。竞争度低、外链潜力大，最快拿到排名与信任。
2. E 紧接着做。工作量小，依赖 A 页例字，可与 A 同期完成，不必等主页面；提前上线的价值是给 A 提供可落地的锚点目标。
3. 再做主页面。等子页有排名，主页面的内链支撑才成立，收录与排名更快。
4. 最后做 D，依赖素材积累与分发渠道。

## 九、验收清单

上线后四到六周，用 Search Console 抽查：

- 抽 3 个字核对笔画数、笔顺编号与数据源是否一致，确认渲染层没有兜底编造数据。
- 检查 8 个字是否覆盖全部 8 种基本笔画、四种结构类型是否齐全；有缺则换字。
- 关掉 JS 打开 E 页与 A 页，确认静态分解图、笔顺编号可见，锚点跳转正常。
- 确认所有页面 canonical 与面包屑指向 <https://hanzifun.online/stroke-order/> 真实路径，无残留旧 slug。
- 确认主页面查询工具的结果不出现在任何独立 URL 下，也没有被 sitemap 收录。
- 用 `site:hanzifun.online stroke order` 查展现分布：`chinese stroke order` 系列应集中在 `/stroke-order/`，`stroke order examples` 系列应落在 `/stroke-order/examples/`，两者不交叉。若 E 页开始抢主页面词，把 E 页 title 与 H1 的 examples 前置得更明确。
- 跑 Rich Results Test，确认只出现 spec 允许的 schema 类型，Article 的 `author`、`datePublished` 均已填写。
- 抽查 `alt` 文本，确认是具体描述而非关键词堆叠。

## 十、后续扩展位

不是现在要做的，记录在此以免架构返工。

若半年后某汉字的 `[char] stroke order` 出现可观且稳定的搜索量、用锚点承接吃力，再单独开页，并把 E 页对应区块的链接改指向新页（必要时 301）。若 `chinese character strokes` 验证为独立 SERP，再开 `/stroke-order/character-strokes/`。若新增 `/pinyin/`、`/radicals/` 等平行主题，本站结构无需重构，`/stroke-order/` 自然成为其中一簇。

## Owner确认（2026-11-13）
- 本次仅笔顺主题簇不生成单字页，已有站点和字典保留。
- B只用局部笔画演示/关键步骤高亮，整字播放器归E；主页面查询保留原有选字兼容。
- 今晚同时完成5页（主/A/B/E/D）；SERP用于形态和区分，不删减五页目标，不追加第6页。
- PDF直接下载，无需登录/邮箱。
- Codex可使用现有Cursor协作，全自动生成并本地验收；未获本次部署要求。
- 用户告知Codex额度约57分钟后重置，实际账户余额未验证。
