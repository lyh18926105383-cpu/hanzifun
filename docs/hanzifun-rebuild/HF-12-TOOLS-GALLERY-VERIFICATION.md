# `/tools/` 左轨与中国风互动长画廊验收（2026-10-31）

> 最新状态：本内容已随`blog-tools-release-2026-11-01`于2026-11-01 01:01:37 +08:00合并上线；源提交720374a，正式域名44项PASS。下方本地待部署/待确认状态为历史，见[实际回执](releases/blog-tools-release-2026-11-01/deployment.json)。

Desktop指定主目录 `main`，基线 `98f79fa`。本轮按Owner明确视觉/交互要求与哈希签收授权交付，**本地Completed / PASS，未部署**；候选 `phase-2-tools-gallery-2026-10-31`。

## 交付

- 删除已有 `tmp_tools_design_ref.html`，未读取/参考；加入.gitignore防止误提交。
- `site/pages/cultural-tools.mjs`新增完整主站画廊模板，左侧吸顶路径轨、印章/01–05双语章节、贯穿竖线与滑动指示条；右侧为名字、食味、岁次、墨鉴、教案五个独立场景。四文化子页及教师既定路由保留，路由/索引策略与HEAD逐项完全一致。
- 五套原创本地SVG画卷：远山/月色/竹影，青花/蒸笼/灯笼，干支罗盘/星盘刻度，碑拓/浓墨/朱印，竹简/文房/田字格书案。位于`site/public/tools-art/`，生产精确复制至`/site-assets/tools-art/`；无远程图片、跟踪、付费生成或新字体下载。
- 背景1.1–1.4px柔化、暖米渐变遮罩、9px磨砂预览纸面与深色文字；前景操作区+汉字大字/拼音/语义/印章舞台，原字典规则及发音文本不改。生肖的mù明确标为年干元素读音，不冒充甲辰的读音。
- `src/client/tools-gallery.mjs`复用现有四工具查询函数和教师Repository；输入/change自动更新、候选切换/菜单快捷词、原339字内链和真实HF06收藏。教师展台创建/更新同一浏览器私人卡组并提高revision，可转入完整教师页继续练习/打印。没有新账号/同步/云API或重复卡组系统。
- 导航点击平滑定位、IntersectionObserver滚动高亮、指示条缓动、轻度场景视差/渐入；小于900px折为顶部抽屉，Escape可关闭；prefers-reduced-motion取消动态与平滑滚动。无JS仍有章节锚点/静态示例/独立入口，输入保持禁用而不提交个人内容。
- 新批次 `culture-teacher-gallery-2026-10-31`绑定五SVG、客户端、CSS、服务端装配、339字审核目录和六个既定页面/SEO；写review-decisions.toolBatches、release.cultureTeacher及逐页pageReviews。原批签收历史保留；明确是Owner已授权的视觉实现，不伪称新增完成后人类审图/真人听审。

## 实际验证

| 命令/检查 | 最终结果 |
|---|---|
| `HF_SITE_ENV=production npm run build:site` | PASS；2838公开文件，413英文页，404 index /9 noindex |
| `node scripts/validate-seo-quality.mjs` | PASS；errors=[]，Sitemap **404**，364核心SEO页，418 JSON-LD |
| `npm test` | **192/192 PASS**（原190+2画廊回归），fail/skip/cancel=0 |
| Chrome156主画廊 | 8行为组PASS；360/390/768/1100/1440/1600共6档无横向溢出 |
| axe WCAG A/AA | 手机390与桌面1600两档零违规；pageErrors=[] |
| 边界核验 | 路由/statusPolicies与HEAD完全一致；原339字签字、HSK签收及数据、音频manifest逐项不变 |

浏览器覆盖：五工具页内输入变化、菜单未收录字拒绝链接、春节年界前后、发字多音、真实收藏、教师revision1→2及完整工作台可读、点击第三/第四章、手动滚动spy、移动抽屉、减少动态、无JS输入保护。所有动态字典链接均在339已发布目录中，输入不进入请求URL或POST。

首轮构建因装饰文案用p抢在答案段前触发SEO门控，已改为div并通过重建；首次长截图被视口裁到首屏，已改为实际扩展桌面视口捕获完整前两展台。最终截图与最终签收源码/生产构建一致，不把早期失败当通过。

## 截图与证据

- [桌面首屏](evidence/tools-gallery/desktop-first-screen.png)（3200×2200）。
- [左轨与前两个完整展台](evidence/tools-gallery/desktop-first-two-studios.png)（3200×3750）。
- [点击第三章：岁次](evidence/tools-gallery/desktop-lunar-zodiac.png)（3200×2200）。
- [点击第四章：墨鉴](evidence/tools-gallery/desktop-tattoo-checker.png)（3200×2200）。
- [手机岁次](evidence/tools-gallery/mobile-lunar-zodiac.png)（780×1688）。

所有截图来自实际本地Chrome，已经逐份查看。[浏览器回执](evidence/tools-gallery/browser.json)、[命令/源码/图像SHA-256](evidence/tools-gallery/verification.json)、[独立签收](acceptance/culture-teacher-gallery-2026-10-31.json)。

## 接力

本轮未commit/push/生产部署；不声称Safari/Firefox/真机、实际p75或线上验收。87缺字仍为Owner明确后续批次，未扩字；教师独立工作台继续published-private/noindex，Sitemap不纳入私人数据。后续若发布，以本候选新指纹进入HF-17/18；若修改画廊/资产/共享样式，刷新本批授权范围内的哈希并复验，不能沿用过期签字。无需读取已删除的临时设计文件。

## 英文导航引导补充（2026-11-01收尾）

Owner已对五句引导原文确认，已加在各英文标题下方并适配手机抽屉。最新生产构建、SEO、全量192/192与画廊Chrome复验通过，Sitemap404；当前截图/源码指纹和签收已刷新，未部署。
