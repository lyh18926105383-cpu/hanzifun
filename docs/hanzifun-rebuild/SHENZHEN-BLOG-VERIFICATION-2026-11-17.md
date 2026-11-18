# 深圳英文 Blog 内页｜本地验收（2026-11-17）

> Publication update: Owner subsequently authorized this release. These pages are now deployed (2026-11-18), Git pushed, with documentation updated. This report preserves its original local evidence; see [production receipt](releases/pinyin-shenzhen-release-2026-11-17/deployment.json) and PROGRESS record 71.

状态：**Local Completed / PASS，未 commit、未 push、未部署。**

Owner本次要求按附件 `/Users/graceshi/Downloads/hanzifun-shenzhen-blog-codex.md` 第4节实际生成一篇内页。按其指向采用附件英文正文和图文要求；没有把中文实施说明放进读者正文，没有创建新站或修改故事课。

## 页面与入口

- 页面：`/blog/shenzhen-city-name-chinese/`；本地预览 `http://127.0.0.1:4180/blog/shenzhen-city-name-chinese/`；未来正式URL `https://hanzifun.online/blog/shenzhen-city-name-chinese/`，**当前尚未上线**。
- 唯一 H1：`Meet Shenzhen: A Global City in Two Chinese Characters`。Title：`Shenzhen: The APEC 2026 Host City & Its Chinese Name | HanziFun`。Description按附件原文。self-canonical、OG/Twitter、BlogPosting与BreadcrumbList已接入，不额外添加FAQPage、评分或虚构人物。
- 使用实际站点身份 HanziFun（Organization）。当前是草稿：显示 Prepared 17 November 2026，`published:null`，BlogPosting没有datePublished。正文约1071个英文词，按每分钟200词向上取整显示6 min read；未用构建时间冒充发布日期。
- 沿用博客红色/米色、字体、按钮、导航与页脚，抽取共享blog-shell，没有重做首页。首屏为深圳/Shēnzhèn、学习锚点和真实城市照片；目录5项，学习段ID固定learn-shenzhen。
- 三张城市文字卡、两张112px真实文字汉字卡、名字拆分条、两个有文字标签的声调示意、三个中英例句、原生details测验和5个FAQ完成。记忆线索明确为学习辅助，未冒充字源。
- 现有博客列表/Chinese Culture分类与搜索、站内搜索、本地RSS均有新文章入口。首页仍为2个旧guide+3个文章推荐共5项，新增文章占一个推荐位，旧文章仍可从博客列表访问。

## 草稿与正式索引边界

沿用 `content/editorial/README.md` 的现有工作流：draft仅在local/staging展示正文；生产模式候选是准备页/noindex，新文章不会提前进入正式RSS/Sitemap。仓库原有人工文章review记录和发布日期保持，新文章review为pending，没有伪造人工签字。

这是本次“生成内页、不擅自发布”的本地结果；正式索引入口已通过相同登记与路由机制接入。未来实际上线时，需Owner审阅当前页面，按真实日期复核APEC时态、处理既有文章review、固定真实published日期并明确放行该release route；届时RSS/Sitemap按现有构建机制纳入。当前生产候选Sitemap仍408条。没有修改全站索引策略、旧文章URL、历史发布日期或site/release.json。

本页依附件允许使用两个静态字符，不强行符合旧HF13文章“至少3个已发布字页+卡组”的绑定条件。schema只对该slug的city-name布局允许空字典绑定/无卡组，旧文章的3字/卡组/签名门控保留。新文章签名绑定正文HTML、渲染器源码及图片来源/字节hash，后续改正文或布局不会沿用旧review。

## 事实、照片与资源检查

- 2026-11-17使用agent-reach的Jina Reader读取APEC官网Events，并用官方来源核对：Economic Leaders’ Meeting计划于11月18–19日在深圳举行。因此正文与FAQ保留scheduled，不将CEO Summit或计划当成已举行事实。会议结束后的措辞必须重新核实，不做自动日期替换。
- 深圳政府地名与华强北页面直接读取超时后，由Jina成功读取；国务院1980特区资料及汉典深/圳条目已核对。深shēn/第一声/11画，圳在深圳中zhèn/第四声/6画，末尾均为-n。事实与链接见 [facts.json](evidence/shenzhen-blog-2026-11-17/facts.json)。
- 首图：Shihu7，Lianhuashan Park，2019，CC BY-SA 4.0；正文图：Wishds，Shenzhen Bay Park，2015，CC BY-SA 3.0。原始作品页、原图URL、原尺寸/原始SHA256、作者/年份/许可与转换操作记录于 `public/site-assets/blog/shenzhen/sources.json`。
- 两张原图实际下载并用Pillow完整解码；首次首图下载截断后续传成功，未将部分文件或HTML当成有效图片。输出480/800/1200/1600px WebP，保留完整画面、不裁切；8个派生图逐个解码及尺寸/hash检查。最大首图282552B，正文图96570B；手机实际使用480px约16KB/13KB版本。
- 两处图注保留年份、作者、作品页与许可，标明Resized and converted to WebP for this page；派生图继续各自原许可。博客列表缩略图额外注明署名许可和预览裁切。首图明确宽高和fetchpriority=high，第二图lazy，均为本站图片而非生产热链。
- 仓库没有深、圳已发布字页或对应笔顺资产，也没有深/圳/深圳的完整已审词境读音资源。已有通用shen1/zhen4音节记录不等于完整深圳词音；按附件第4节第4项保留静态卡与标调说明，不显示部分发音、默认浏览器语音或笔顺按钮，不生成付费TTS或手画笔顺。
- 当前仓库无启用的分析系统，未新接第三方追踪；CTA与测验有语义标记且不依赖跟踪完成跳转或展开。

## 实际验收

- 最终 `npm test` **213/213 PASS**，其中新增5项覆盖静态布局/元数据、照片字节与许可、BlogPosting、草稿隔离和既有发布门控；旧编辑/字典/拼音/故事相关套件均保留。
- local及production模式构建各3655公开文件、421英文页、核心365页；两模式SEO `errors=[]`。生产模式13个noindex页、Sitemap408。本次未执行生产HTTP验收或外部抓取/排名检测。
- 375×667、768×1024、1440×900无水平溢出；每档深圳字形与学习锚点在首屏。375px入口底部517px，小于667px；手机字符卡上下排，桌面并排。另保存375×812手机首屏截图。
- Chrome本地真实验收：两图正常解码/响应式选择，学习锚点到达，112px字形及声调字体正常；Enter展开测验和FAQ；关闭脚本执行后，焦点在原生summary时Return仍能展开答案。无JS专用测验脚本。
- 主页面手机/桌面各一次全页axe（WCAG 2 A/AA、2.1 AA）零违规；正常流程console error/warn为空。文末CTA实际返回主页；首页推荐5项中有新文；Chinese Culture+Shenzhen搜索返回1篇；全站搜索也返回该文。
- 实际DOM核对title/H1/description/canonical/OG、WebPage+BlogPosting+BreadcrumbList，无datePublished伪日期、重复ID或无效片段链接。完整构建检查所有本地href/src；新增正文7个片段目标有效。
- 对比本次开始时3644文件本地基线：原文件缺失0，3636文件逐字节不变，仅8个既有产物变化，新增11个产物。**四个拼音页HTML均逐字节不变**，原339字页、教学/音频审核与三篇旧文章数据保持。见 [artifact-diff.json](evidence/shenzhen-blog-2026-11-17/artifact-diff.json)。
- characterPagePresentation只维护被Blog接入触及的`site/editorial-content.mjs`和`build-site.js`依赖hash/payload，保留原人工reviewer/date/authorization及此前Pinyin维护备注；新增维护说明不构成新人工批准。`git diff --check`通过。

## 改动文件

内容：`content/editorial/articles.json`、`article.schema.json`，新增`shenzhen-city-name-chinese.html`。页面/呈现：新增`site/city-article.mjs`、`site/components/blog-shell.mjs`、`public/site-assets/shenzhen-article.v1.css`，修改`site/editorial-workflow.mjs`、`site/editorial-content.mjs`、`site/pages/blog.mjs`、`public/site-assets/blog.v1.css`。资产：新增`public/site-assets/blog/shenzhen/`的8图及sources.json。

构建/验证：`scripts/build-site.js`、`scripts/validate-seo-quality.mjs`、`site/seo.mjs`、`data/editorial/review-decisions.json`；新增`tests/shenzhen-article.test.mjs`，维护`tests/editorial-workflow.test.mjs`和`tests/seo-quality.test.mjs`的文章与页面数量断言。文档：本报告、TASKS/PROGRESS/HF13、`content/editorial/README.md`及本批evidence目录。此前Pinyin未提交文件保持，没有新框架或新增依赖。

## 证据与下一次入口

[证据目录](evidence/shenzhen-blog-2026-11-17/)包含verification.json、facts.json、browser.json、两模式SEO、最终tests.log、差异报告，以及电脑/手机首屏与学习卡截图。初始产物hash、审核备份和临时日志在忽略的`.cache/shenzhen-local/`与/private/tmp。

接手先读PROGRESS记录69、TASKS、本报告，再从`content/editorial/shenzhen-city-name-chinese.html`修改正文，从`site/city-article.mjs`与`public/site-assets/shenzhen-article.v1.css`修改布局；登记在articles.json。预览进程本聊天保留，目录 `/private/tmp/hanzifun-shenzhen-2026-11-17`、端口4180；若已退出：

```sh
HF_BUILD_OUTPUT_DIR=/private/tmp/hanzifun-shenzhen-2026-11-17 npm run build:site
python3 -m http.server 4180 --bind 127.0.0.1 --directory /private/tmp/hanzifun-shenzhen-2026-11-17
```

Owner可在本地审阅。未执行外部索引通知、Git提交/推送、生产部署或自动跟踪；发布继续按新的明确授权与HF17/18执行，不能复用旧首页/Pinyin发布回执。发布当天优先复核APEC日期/时态与真实发布日期。
