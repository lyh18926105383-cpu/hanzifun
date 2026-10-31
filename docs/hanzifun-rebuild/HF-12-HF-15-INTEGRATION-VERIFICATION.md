# 四文化工具与教师本地组卡合龙验收（2026-10-31）

在指定 Desktop 主目录 `main` 接入 Cursor 模块。Owner 已明确解除文件锁并正式签收四工具与教师本地模块。本轮确认范围 **Completed / PASS（本地，未部署）**；候选 `phase-2-culture-teacher-local-2026-10-31`。

## 路由与索引

以下均沿用已冻结的既定路径，本轮新增的是正式功能挂载与签发，未制造重复地址。

| 路由 | 状态 | 索引 |
|---|---|---|
| `/tools/` | published；四工具卡片及教师入口 | index,follow |
| `/tools/chinese-name-generator/` | published；30教学组合 | index,follow |
| `/tools/chinese-menu-decoder/` | published；50教学序列 | index,follow |
| `/tools/zodiac-elements-calculator/` | published；35个春节年界点 | index,follow |
| `/tools/tattoo-character-checker/` | published；1–8字语境核查 | index,follow |
| `/flashcards/teacher/` | published-private；可用私人工作台 | noindex,follow；不入Sitemap |

教师工作台依项目 `privateRoute` 规则保留 noindex；不能把 Owner 功能批准理解成允许个人卡组/会话入索引。无账号、云同步、服务端权限、付费或教材映射实现。原 HF-15 的 Phase3 账号版本另为未来范围，本轮 Owner 显式接受的是无需账号的本机版本。

## 接口接合与签收

- `scripts/build-site.js` 挂载六页面，保留77原型路径；四工具及教师页都有真实客户端入口。公开字典目录仅含339已审核字，分发到 `/site-assets/tools/published-catalog.json`；私人成组数据只在浏览器存储，构建从不读取它。
- 将文化工具纯逻辑移至 `src/client/cultural-tools.mjs`，服务端 `site/pages/cultural-tools.mjs` 保留已审核目录组装及原导出接口；避免将 publication-review/fs 等服务端依赖送进浏览器。`tools-entry.mjs` 初始化四工具和教师模块，`teacher-decks.mjs` 复制到同一静态目录。
- 文化工具真实保存接 HF-06 收藏接口；姓名、生日、纹身输入只在页面内，表单在脚本加载前禁用，捕获submit；无JS仍能读例子且不能将输入提交到网络。字典/练习链接只绑定339字；金/土/龙等未收录字不造链接。
- 教师页接通创建、修改/重排、revision、删除、练习快照/旧快照重开、JSON导入导出、IndexedDB及LocalStorage回退。IndexedDB写入使用同一readwrite事务compare-and-set，浏览器Web Locks协调同名写者；双标签实测同revision一成功一冲突。LocalStorage回退在有Web Locks时串行；无锁且无IndexedDB的旧浏览器仅有原revision/写后核验，未宣称该组合具有原子跨标签事务。
- 打印输出隔离成仅含当前卡组的body直接子节点，避免导航/339选字器/个人notes进入打印。2卡、100卡的A4/Letter四PDF均实测单页；密集版改为均衡网格并修复字形边距，完整保留释义，不截断/line-clamp。小字密集排版为100卡单页的固有限制，较少字卡更便于书写。
- `site/seo.mjs` 六路由独立title/H1/lead、自指canonical与WebPage/Breadcrumb；四工具及教师页有WebApplication JSON-LD。五个公共路由使Sitemap **399 → 404**；页面数413不变，原占位内容被正式模块覆盖。
- Owner签收以 `culture-teacher-local-2026-10-31` 写入 `review-decisions.json.toolBatches`、`release.cultureTeacher`、逐路由pageReviews及独立receipt。绑定组件原始字节、339字已审核目录与审核hash、六页面内容与SEO元信息；缺签、内容变化、单页签名或release失配均拒绝构建/SEO门控。原339字、HSK双数据签收及录音审批不变。
- 历法使用Cursor交付的HKO数据（支持2000-02-05含至2034-02-19不含、35个边界点）和Owner正式内容确认；本轮不冒称新抓取/重抄全部官方历表或获得新第三方授权。

## 实际验证

| 检查 | 最终结果 |
|---|---|
| `HF_SITE_ENV=production npm run build:site` | PASS；2832文件，413英文页，404 index / 9 noindex |
| `node scripts/validate-seo-quality.mjs` | PASS；errors=[]，Sitemap404，364核心SEO页，418 JSON-LD |
| `npm test` | **190/190 PASS**：原181 + Cursor7 + 合龙门控2；fail/skip/cancel=0 |
| Chrome156 | 10行为组PASS；6路由×5宽度=30布局无溢出；6类axe WCAG A/AA零违规；pageErrors=[] |
| PDF QA | 2/100卡×A4/Letter四份单页；pypdf纸型/文本检查、Poppler逐份渲染并目视，最终无越框/重叠 |

浏览器实测了输入变化、米饭/未知菜、2024春节前后、多音发字、真实收藏、教师保存/编辑重排/刷新/旧快照、JSON下载与导入、删除保留快照、双标签冲突、LocalStorage回退及无JS隐私保护。教师全旅程未改写原guest学习快照。早期浏览器脚本未等待异步编辑读完及误对fieldset本身判断disabled，已修测试并重跑；PDF目视发现密集描红格越框后修产品布局再复验。这里只保存最终PASS回执，不把早期失败算通过。

详见[批次签收](acceptance/culture-teacher-local-2026-10-31.json)、[门控与源码hash](evidence/culture-teacher-local/verification.json)、[浏览器回执](evidence/culture-teacher-local/browser.json)。临时PDF/PNG只在 `/private/tmp/hf-global-integration/`，不纳入公开构建或Git候选内容。

## 接力边界

本轮未commit/push/部署，无线上冒烟、所有浏览器/真机或新真人听审结论。HF-14全量等级仍Partial，87缺字按Owner决定后续批次；原HF-10-auth/11-sync/16仍未启动。若要发布，从本批releaseId、签收hash和verification输入指纹进入新的HF-17/18冻结、回滚与生产窗口核验，不挪用此前editorial候选冻结包。
