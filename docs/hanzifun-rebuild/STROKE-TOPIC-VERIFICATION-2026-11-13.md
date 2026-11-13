# HF-04 笔顺主题簇五页 · 2026-11-13

状态：五页全部生成，最终本地 Completed / PASS。未 commit / push / 部署。

## Owner 范围与当前交付

依据本聊天附件及确认：本次同时生成五页；不新增 `/stroke-order/<字>/`，已有字典保留；B 使用关键步骤局部图；PDF 无邮箱、无登录直接下载。用户允许使用电脑 Cursor 协作，离开后继续自动完成。本次生成和本地验收不包含生产发布或第三方社媒发送。

| 页面 | 内容与功能 | 字数 / 证据 |
|---|---|---|
| `/stroke-order/` | 参考总纲、速答、八类图、七条概览、340字页内查字、计数/概念、四字锚点、路径、直接PDF、来源及6FAQ | 见 static-verification.json |
| `/stroke-order/basic-strokes/` | 八类逐项单笔SVG/方向、3–5个数据源例字、常见错误、派生表、PDF、5FAQ；无整字播放器 | 同上 |
| `/stroke-order/rules/` | 七规则、每条两个关键阶段图、地区参考与例外、5FAQ；无整字播放器 | 同上 |
| `/stroke-order/examples/` | 固定八字全部播放器/描红、静态序列、八字段数据表、每字三例词/原创例句、易错点/双向锚点、比较表、共性、5FAQ | 同上 |
| `/stroke-order/animation/` | 八字媒体资源；部首/教学组筛选、笔画数排序、重置；GIF/动态SVG/编号SVG、iframe/GIF/SVG嵌入生成及署名、直接PDF | 同上 |

## 来源与内容核查

- 本次英文文案由 Cursor（Grok 4.7 High Fast）交付，Codex 整合、逐项修订及验收；未伪造真人教学/听音签收。Cursor 最小文件写入与 Node 命令执行通过，无登录/批准/额度提示。任务卡和回执在 `collaboration/stroke-order-2026-11-13/`。
- `data/stroke-order/catalog.json` 仅提取现有339字及新增示例永，共340条。拼音/声调和例词取已锁定 CC-CEDICT；笔画/medians 取 Hanzi Writer 2.0.1 / Make Me a Hanzi；笔画类型、序列、结构取 cnchar-order / cnchar-radical 3.2.6；原339字部首沿用既有 Unihan/MMH 数据。版本/hash/许可保存在独立 sources.lock，未添加运行时付费API。
- 永从原已锁包提取，5笔，五码45534，未新增 `/dictionary/永/`。固定八字联合覆盖8教学家族、4个来源结构类别。`我` 在 cnchar 的结构是左右，按源显示，不照抄附件的独体标签；中/永仍提供独体例子。
- GF0023-2020 的五种主笔形与八类教学家族明确区分；竖钩仍归五码2，不能把所有带钩笔画都归五码5；永字八法不等于永有8笔。
- 24条原创中文例句与英文译文分别编写并逐条审读；词头和标调拼音带CC-CEDICT源定位，例句未批量套同一模板。句子不冒称官方例句，也未伪造逐条人工验收。
- SERP：连接Chrome直接观察 Google（hl=en/gl=us）两词各10条自然结果样本，6个相同URL，保留一个主页面，不新增 character-strokes 页。动画词为工具/GIF/嵌入/视频混合结果，按Owner明确五页要求保留独立媒体分发用途。规则教学意图可见，但未查收费搜索量，不虚报搜索量。个性化结果、分页补足口径见 SERP-REVIEW.json。

## 最终结果

- 201/201回归测试通过，0失败/跳过/取消；生产构建3606文件、417英文页、408可索引URL / 9 noindex，SEO errors=[]。
- 正文总词数：主1794、A1785、B1462、E2476、D1087；八字每段200–280词。标题52–56字符，描述154–159字符。
- 五页25档布局、10次全页axe均通过；额外五页720CSSpx布局通过，真实无JS锚点/查询/播放/描红/失败恢复/下载/嵌入验证通过。
- Wrangler本地27项HTTP检查通过；两次3606文件独立构建逐字节一致。原3182个文件不变，339字详情保持，419新增文件，无旧文件丢失。

## 验收证据

- `evidence/stroke-topic-2026-11-13/static-verification.json`：五路由、标题50–60、描述150–160、篇幅、唯一H1/H2/H3、图像属性、FAQ/Article/Breadcrumb、锚点、全部340源字节/数量/序列及24例句引用；成熟页与Sitemap一致，无新单字页。
- `browser-verification.json`：Chrome157，本地五页×360/390/768/1100/1440；十次全页axe；真实输入/旧char参数、播放/暂停/慢放/跨播放器互斥/键盘描红/故障重试、单笔播放、媒体筛选重置、三格式嵌入/复制、PDF真下载、嵌入noindex、五页无JS和减少动态。
- `http-verification.json`：Wrangler4.156.0，仅本地Cloudflare Assets；五页200、五条301保留query、未知页与不存在单字404、资源Content-Type及候选字节一致。没有生产请求冒充本地结果。
- `preservation.json`：对11月12日本地面包屑基线逐文件比较：原3182个文件字节不变，仅原笔顺主页面及4个构建/路由清单变化；419个新增文件，无文件丢失。339字详情、中文/故事媒体、Blog与Tools保持。教学/音频审核对象与开工副本深比较一致，仅维护构建依赖关联hash。
- A4 / Letter 各5页PDF已用Poppler渲染全部10页并目视联系表及单页，标题/拼音/汉字图/编号/田字格无裁切；原本过小的逐笔图已改为清晰的一行逐笔格。文件在 `public/stroke-topic/`，同时保留 `output/pdf/` 交付副本。

## 实现与复验入口

- 页面：`site/pages/stroke-topic.mjs`；旧 `stroke-order.mjs` 保留兼容导出。
- 数据/SEO：`site/stroke-topic-data.mjs`、`site/stroke-topic-meta.mjs`、`site/seo.mjs`、`site/release.json`。
- 组件/交互/样式：`site/components/stroke-topic.mjs`、`src/client/stroke-topic.mjs`、`site/public/stroke-topic.css`。
- 生成脚本：`scripts/build-stroke-topic-data.mjs`、`build-stroke-topic-examples.mjs`、`generate-stroke-topic-media.mjs`、`generate-stroke-topic-pdf.py`。
- 验证：`scripts/verify-stroke-topic.mjs`、`verify-stroke-topic-browser.mjs`、`verify-stroke-topic-http.mjs`。
- 构建使用 `HF_BUILD_OUTPUT_DIR=/private/tmp/hanzifun-stroke-topic-candidate HF_SITE_ENV=production node scripts/build-site.js`，保全原dist；本地预览 `http://127.0.0.1:8794/stroke-order/`，其余子页由正文互链访问。预览是本地进程，关闭进程或重启电脑后需重启预览服务。

## 限定边界

没有commit/push/部署；已有11月12日面包屑改动及个人未跟踪文件保留。生产仍以11月3日发布证据为准。Chrome为本地模拟，未冒充Safari/Firefox、真机、真人读屏或真实p75。Google Rich Results Test线上提交和4–6周GSC表现属于后续发布后的观察；本次已本地验证JSON-LD与可见内容一致，不承诺FAQ富结果、排名或AI引用。没有创建监控自动化，没有向YouTube等平台发帖。

后续如Owner要求上线，从本候选及本报告继续HF-17/18准备独立发布/回滚证据，不用11月3日旧冻结产物代替本轮候选。

<a id="hub-browser-revision"></a>

## 2026-11-13 浏览器批注修订（本地 Completed / PASS）

Owner后续七条批注与模块调整覆盖最初主页面不播整字的设计：主页面现在显示自动循环的“我”字笔顺；其余子页维持原有行为。

- 首屏替换为Owner指定英文文案和五条理由，最后整句加粗；桌面正文/田字格占2:1，手机上下排列。田字格只含横竖中线，七笔沿既有锁定Hanzi Writer轮廓与medians渐进绘制，下方为 `wǒ` / `I; me`，有暂停/继续。减少动态、无JS和打印保留完整静态字形；离开标签时暂停。
- 删除主页面署名；Article保留真实编辑组织元数据，SEO门控仅对本页不再强制可见署名。其他四页的可见署名检查保持。
- 查字模块移到基础笔画介绍前，页内导航顺序同步；介绍替换为Owner的建房比喻并链接basic-strokes与rules；删除旧第二段。
- 复合笔画入口改按钮；七规则标题后新增指定文案按钮；删除七行末尾的Explore this pattern链接。
- 本轮重新运行201/201测试、生产构建3606文件、417英文页/408 Sitemap与SEO检查；五页25档布局、额外720px五页、10次全页axe零违规；新增2:1/手机堆叠、七笔自动播放/真实暂停继续、两按钮目标、无JS/减少动态检查。Wrangler本地27项HTTP通过，内置浏览器主页面已刷新并保留。
- 对照修订前3606文件，仅主页面HTML及主题CSS/JS三个产物变化，另外3603文件逐字节相同，包括四个子页HTML、字典、PDF与数据/媒体。未重新声称本轮运行双构建一致性检查。

本轮证据位于 [evidence/stroke-topic-hub-revision-2026-11-13/](evidence/stroke-topic-hub-revision-2026-11-13/)，包含static/browser/http/preservation/test报告与桌面/手机截图。上文旧批次的报告和hash是修订前的历史记录。当前预览仍为 `http://127.0.0.1:8794/stroke-order/`，未commit/push/部署。


## 同日笔画计数修订

计数模块已按Owner新批注替换完整文案与中英标题，加入一/十/口横排文字框（1/2/3笔及指定拼音/含义），移到查字之后、基础笔画介绍之前，导航同步。最新顺序以PROGRESS记录57为准。

本轮生产构建与静态/SEO校验PASS；360/390/768/1100/1440五档三框横排无溢出，390/1440两次全页axe零违规；对照本轮前3606产物，仅主页面HTML和主题CSS改变，其余3604文件相同。未重跑全套201项测试。新证据位于 [笔画计数修订证据](evidence/stroke-counting-revision-2026-11-13/browser-verification.json)，含桌面/手机截图。内置浏览器已更新，未发布。


## 同日四字范例模块修订

按Owner最新批注将四字范例紧接查字工具，标题为Chinese Stroke Order Examples，标题旁find out more按钮指向 `/stroke-order/examples/`。当前前四模块为查字→四字范例→笔画计数→基础介绍，导航同步。

本轮构建/静态SEO、360/390/768/1100/1440五档无溢出、390/1440两次全页axe与真实按钮跳转均通过；仅主HTML和主题CSS改变，其他3604产物相同。未重跑全套201项测试。见[本轮浏览器证据](evidence/stroke-examples-revision-2026-11-13/browser-verification.json)及同目录静态报告/截图、PROGRESS记录58。内置浏览器已刷新，未发布。


## 同日七项内容精简与介绍框修订

Owner最新七条批注已全部完成：首屏Pause按钮替换指定圆角介绍；导航剩3入口；删除path；术语与练习全文替换；来源原文/引用默认折叠；FAQ改为指定5组，FAQPage同步。已说明移除按钮后的演示为4.8秒自动一次，结束保留全字，减少动态/无JS为静态。

Owner的新指定短文案覆盖原主页面1500词下限及6FAQ，当前为1391词/5FAQ；其他四页篇幅、内容和HTML不变。本轮201/201、生产构建/SEO、五页25档/10次axe、额外720px五页、27项本地HTTP和新来源键盘/无JS交互验证通过。仅主HTML与主题CSS/JS三产物变化，其他3603产物相同。见[新功能证据](evidence/stroke-copy-revision-2026-11-13/revision-verification.json)、同目录static/browser/http/test报告与390/1097/1440截图、PROGRESS记录59。内置浏览器已刷新，未发布。


## 同日五项排版与计数顺序修订

三个主页面导航按钮已对齐；理由字号/实际行高从16.4/30.34px略减为15.6/27.3px；查字提示删除数量句。计数模块改在七规则后，标题全宽、中文备注为60%字号，桌面单行，手机正常适配。当前正文为1387词，仍按Owner指定精简文案验收。

本轮构建/静态SEO、360/390/768/801/850/1097/1440七档无溢出及导航对齐、390/1440两次全页axe通过；768及以上标题实测一行。仅主HTML和主题CSS改变，其他3604产物相同；未重跑201项全套测试。新证据见[本轮浏览器报告](evidence/stroke-layout-revision-2026-11-13/browser-verification.json)与同目录静态报告/截图，最新模块顺序见PROGRESS记录60。内置浏览器已刷新，未发布。


## 同日七规则及“我”循环笔顺演示

Owner最新要求已完成：七规则分别以二/川/十/人/月/国/小的右侧米字格演示，桌面双列、小屏单列；首屏“我”保留田字格，改为相同循环。每笔600ms，写完保持2000ms后重启；支持悬停/焦点暂停与隐藏标签暂停，减少动态/无JS为完整静态。这覆盖上文首屏单次播放的历史决定。

八套SVG轮廓/medians逐字与锁定源比较一致，并实际采样最后一笔、两秒保持头尾和下一周期；201/201、五页25档/10次axe、额外八档图文右侧布局、无JS/减少动态及27项HTTP通过。只有主HTML与主题CSS/JS变化，另外3603文件相同，四个子页HTML和所有数据/PDF不变。详见[动画验证](evidence/stroke-rule-animation-2026-11-13/animation-verification.json)、同目录static/browser/http/test报告和截图，当前状态见PROGRESS记录61。内置浏览器已刷新，未发布。
