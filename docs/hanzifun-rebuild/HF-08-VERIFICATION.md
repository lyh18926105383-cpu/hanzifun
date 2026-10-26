# HF-08 验收记录

日期：2026-10-26（Asia/Singapore）。目录：`/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun`；分支：`main`；施工前 HEAD：`c3665e36bb0f5fa451e0093046d0258769565ccd`。候选 releaseId：`hf08-seo-quality-candidate`。

**工程与本地门控已交付；跨浏览器、真机和真实屏幕阅读器验收仍待补，不把这些未测项标完成。没有部署生产，也没有关闭 HF-02/04/07 人工教学或音频审核。** 保留用户原有未跟踪文件与根 `dist/`，所有源码和提交均直接位于指定主目录。

## 交付内容

- `site/seo.mjs` 为核心模板提供数据驱动 Title/H1/Lead 契约。354 个核心落地页 = 339 个单字（126 核心 + 213 补充）+ 首页、字典四索引、笔顺、拼音表、3 个 HSK 范围页、5 个场景/分组入口。每页 Title 唯一、主题词前置；main 恰好一个 H1，直接相邻的首个正文 p 给出答案。眉题改为 span，审核提示保留于首段之后。单字默认读音沿用既有教学选择，多音切换不改变规范页主题。场景直答只描述现有六句，未新增教材内容。
- 所有英文模板补全绝对 self-canonical、独立描述、可见正文一致的 WebPage/BreadcrumbList；首页另有 WebSite。没有把英文营销页与中文应用虚构成等价翻译，也没有添加 FAQPage、评分或未发布 Article。
- `safeJsonLd` 对 `< > & U+2028 U+2029` 转义。构建扫描器对**全部输出 HTML** 中的**全部 JSON-LD 块**执行 JSON.parse、context/type/URL/name/language/description/graph/breadcrumb 字段检查；既有中文 WebApplication 与 Offer 也有对应字段检查。引号、拼音声调、汉字、日文与恶意闭合 script 的回归夹具通过。
- `validate-seo-quality.mjs` 解析真实 HTML DOM，检查三个国王、全站标题唯一、meta、canonical、发布资格、精确 sitemap 集合、JSON-LD、六个静态 FAQ、预算。已成为 `build-site.js` 必经步骤。反例覆盖多 H1、横幅抢首段、隐藏首段、错误笔画、重复标题、损坏 JSON、缺字段、robots/canonical 冲突、非法 sitemap 参数及未来成熟汉字页的 Unicode 编码。
- 修复首页小字、金色编号、字典预览提示对比度；保留焦点轮廓，为 skip link 提供可聚焦 main；增加跟随可用 CSS 宽度的容器断点，修复 200% CSS 放大时桌面导航溢出。首页下方人群/期刊图片使用原有图的 lazy img，未重制插画；原已冻结副标题与七段结构保留。更新两条过时 FAQ（HSK 首级清单、已实现的本机间隔复习）。
- 闪卡页与故事说明页的重名用 Character Flashcards 区分，仅改页面元数据，不改课程或学习引擎。

## 索引矩阵与命令

`HF_SITE_ENV` 只接受 `production`、`staging`、`local`，未知值失败。**缺省为 local**；根 Wrangler 构建命令显式选择 production。Production 是候选包环境名，不表示已实际上线。

| 环境/状态 | robots | canonical | sitemap |
|---|---|---|---|
| production / published 且内容门槛通过 | index,follow | 自身生产规范地址 | 收录 |
| production / preview、planned、私人/搜索/练习/404 | noindex,follow | 自身生产规范地址 | 排除 |
| staging / local | 所有英文页 noindex,follow；全包 X-Robots-Tag noindex, follow | 生产规范地址 | 空 |
| 中文应用与旧播放器 | production 保留 legacy；中文应用补 self-canonical，原 WebApplication URL 随迁移改为 /zh/ | 中文入口 /zh/；播放器保持既有内容 | 本包不擅自加入新英文 sitemap |

生产候选：仅 `/academic/`、`/academic/hsk-2/`、`/academic/hsk-3/`，共 3 页。首页、字典、独立工具与两场景仍 preview。Tier2/Tier1 内容审核通过后可逐页放行；插画、长故事、新书面授权不另设阻碍。字典、拼音和场景既有审核条件继续生效，另补场景人工语言审核门槛。未写入任何假签字。

笔顺 char、字页 returnTo、拼音过滤、HSK fragment、学习状态参数不进入 sitemap；Canonical 去 query/fragment，字页仍指向自身。Unicode URL 在 Canonical 与 sitemap 均使用相同百分号编码。robots.txt 允许抓取，保证 noindex 可读；production 写出 sitemap 声明，其他环境不声明。

```sh
npm test
HF_BUILD_OUTPUT_DIR=/private/tmp/hf08-production npm run build:production
HF_BUILD_OUTPUT_DIR=/private/tmp/hf08-production node scripts/validate-seo-quality.mjs
HF_BUILD_OUTPUT_DIR=/private/tmp/hf08-staging npm run build:staging
HF_BUILD_OUTPUT_DIR=/private/tmp/hf08-local npm run build:site
HF_BUILD_OUTPUT_DIR=/private/tmp/hf08-production node scripts/verify-quality-browser.mjs
# 本机 Workers 启动后复用同一套浏览器用例：
HF08_ORIGIN=http://localhost:8788 HF08_SKIP_PERFORMANCE=1 HF08_EVIDENCE_DIR=/private/tmp/hf08-workers node scripts/verify-quality-browser.mjs
```

浏览器脚本默认使用本机已配置的 bundled Playwright，可用 `HF08_PLAYWRIGHT_MODULE` 指定另一安装路径；Chrome 必须可用。parse5 7.3.0、axe-core 4.10.3 为固定 devDependencies，安装审计 0 漏洞。Wrangler 4.152.0 仅通过 npx 在临时目录启动，无部署。

## 本次实际结果

| 检查 | 结果 |
|---|---|
| npm test | **127/127**（原 119 + HF-08 8 项），零失败 |
| 三环境 SEO 门控 | 每环境 401 英文页、354 核心页；包括旧中文应用的 **402 JSON-LD 块**；errors=[] |
| production / staging / local | sitemap 数量 3 / 0 / 0；英文 noindex 数量 398 / 401 / 401 |
| 两次 production 构建 | 1546 文件，SHA-256 逐文件差异 0；保留原 77 原型路径；白名单及资源引用检查通过 |
| Chrome | **155.0.8059.85**；axe **4.10.3**；WCAG2 A/AA、2.1 A/AA、2.2 AA 标签 |
| 自动无障碍 | 16 类页面（含展开的拼音音节和 HSK 词项）、0 violations；Node 与本机 Workers 两次均通过 |
| 响应式 | 13 核心路由 × 360/390/768/1100/1440 = 65 次，无整页横向溢出 |
| 200% | 5 模板 CSS zoom=2 通过，配合 360–1440 断点重排检查；不是操作系统原生浏览器缩放 UI 验收 |
| 键盘 | Tab skip→main；手机菜单 Enter/Tab/Escape 返回焦点；首页翻面 hidden 语义；六 FAQ Enter；笔顺 Next；拼音 lv→lü 筛选与 summary 展开 |
| 辅助技术树 | CDP AX 树确认拼音表 heading/textbox；这不是已用 VoiceOver/NVDA 听读 |
| 无 JS | 核心首段可读；水完整静图；410 音节/1323 禁用音频按钮；HSK3 646 行静态列表 |
| 稳定性 | 核心页面未处理 pageerror 为 0；真实字页 returnTo 与笔顺 char 的 canonical 归一正确 |

自动扫描还有需人工判断的 incomplete 项（如背景图对比、link-in-text-block），完整结果保存在 browser.json；未将 incomplete 当作“人工通过”。原型预览的长说明、读屏完整旅程仍需 HF-09/17 手工签收。

## 性能口径

初始直接脚本及其静态 import 闭包按文件 gzip 求和；CSS 为首页两份样式之和；图片为首页 eager img 去重字节总和（不是全站媒体或所有 lazy 图总量）。

| 资源 | 实测 | 预算 |
|---|---|---|
| 首页 JS gzip | 7470 B（7.30 KiB） | ≤100 KiB |
| 首页 CSS gzip | 10966 B（10.71 KiB） | ≤50 KiB |
| 关键 eager 图片 | 355447 B（347.12 KiB） | ≤400 KiB |

冷上下文、禁缓存、390×844、DPR1、4× CPU、RTT150ms、下行1.6Mbps/上行750Kbps；Node 静态服务器对文本 gzip，原始逐轮资源/指标在 browser.json。CPU 为宿主 emulation，不声称真实中端真机。

| 模板 | 3 轮 LCP（ms） | 中位数 | CLS 中位数 |
|---|---|---|---|
| 首页 | 780 / 764 / 712 | 764 | 0 |
| 水字页 | 612 / 612 / 616 | 612 | 0 |
| 拼音表 | 772 / 772 / 772 | 772 | 0 |
| HSK3 | 716 / 744 / 760 | 744 | 0 |

脚本对三轮中位数 LCP≤2500ms、CLS≤0.1 断言通过。**没有测真实访问 p75、INP 或移动 Safari/Android 真机**；没有将本地观察器数据称为 Lighthouse 分数。

## 本机 Cloudflare Assets HTTP

Wrangler **4.152.0**，compatibility_date **2026-07-15**。明确区分本地 gzip 性能服务器与 Workers Assets；后者真实跑同一浏览器检查及状态矩阵。没有触碰线上配置。

- `/` 和 `/zh/`：200。两个不存在路径：真实 404，且有 noindex HTML。
- `/index.html` 与 `/legacy/index.html`：各一次 301→`/zh/`，最终 200。
- `/legacy/story.html?lesson=cat-and-fish-01`：一次 301→`/story?lesson=cat-and-fish-01`，最终 200。
- 原 `/story.html?lesson=...`：Workers 默认 HTML 扩展名规范化 **307**→`/story?lesson=...`，保留课程 query，最终 200；没有把它伪称为项目永久迁移规则。
- 原 MP3 URL 200。未重验故事视听/字幕，也未改课件。
- staging 根、HSK、中文应用、播放器响应及 404 均带 X-Robots-Tag noindex；200 英文内容还有对应 noindex meta。没有用 Disallow 阻断 noindex。

## 文件与后续切入点

源码：`site/seo.mjs`、`site/layouts/base.html`、`site/pages/{dictionary,hsk,scenarios,learning}.mjs`、`site/pages/home.html`、`site/site.mjs`、`site/public/site-styles.css`、`site/release.json`；`scripts/{build-site.js,validate-seo-quality.mjs,verify-quality-browser.mjs}`；`tests/{seo-quality,dictionary}.test.mjs`；`package.json`、`package-lock.json`、`wrangler.toml`。同时更新 TASKS/PROGRESS/HF-08 任务状态并保存本证据目录。

1. HF-09/17 从本报告与 `evidence/hf08/` 继续。未测的 Safari/Firefox 当前/前一版本、真机移动 Safari/Android Chrome、VoiceOver/NVDA 完整路径及原生 200% 缩放须补真实收据；当前不宣称整包跨设备人工验收完成。
2. HF-02/04/07 人工释义/读音/拼音教学与录音听审仍 pending；审核持久化于原输入，不能只改 release 或生成报告。未审 339 字不因本包自动得到 Tier2 身份。
3. HF-17/18 核验真实生产域名/www/http、当前线上书签和所选 release，再部署候选重定向及索引策略。本机证据不是生产部署或恢复演练。
4. staging 优先由宿主提供访问控制；本包交付 noindex/meta/header 联动，不虚构已接通的访问认证。保留 Phase 1，无账号、同步、Billing、跟踪器或新故事制作。
