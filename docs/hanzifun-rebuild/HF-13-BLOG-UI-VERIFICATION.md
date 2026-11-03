# HF-13 Blog UI 改版 · 2026-11-01

> 最新状态：本内容已随`blog-tools-release-2026-11-01`于2026-11-01 01:01:37 +08:00合并上线；源提交720374a，正式域名44项PASS。下方本地待部署/待确认状态为历史，见[实际回执](releases/blog-tools-release-2026-11-01/deployment.json)。

> Owner于2026-11-01审阅内置浏览器后回复“没问题了”，已批准视觉结果并明确授权生产部署、提交推送和文档更新。本节取代下方当时的“待确认”状态。实际发布记录见 [发布目录](releases/blog-ui-release-2026-11-01/manifest.json)。

## 范围与状态

Owner先确认本聊天生成的设计图，再授权改造，并要求用内置浏览器或Chrome打开供人工审核。施工目录为当前 `8be3` worktree；本地实现完成，Owner视觉验收待确认，未提交、推送或部署。

- `/blog/`采用暖米白 `#FAF6F0`、朱砂红 `#C83727`、竹青/草木黄标签、炭黑文字、浅沙细边框、祥云暗纹、错落摄影带、特色文章与学习列表、三列文章网格。
- 页面专用样式、页眉和页脚；其他路由沿用原外壳。共享模板增加可选body class、head、header、footer插槽。
- 使用现有已签收三篇文章、原两篇指南及真实HSK二级资源。效果图中的“乐”字示例没有对应已审核文章，因此特色位置使用现有中秋文章。没有新增虚构正文或变更原文章hash/审核。
- 分类与搜索组合筛选最新卡片，含空结果提示、结果播报及重置。HSK卡片明确标记为词汇资源。
- Subscribe跳转至RSS说明；`/blog/feed.xml`包含五篇真实文章/指南，使用规范URL及固定内容日期，不含HSK资源、草稿或个人记录。支持复制当前站点的feed地址。

## 配图与来源

所有图均落盘 `public/site-assets/blog/`，本地分发，无远程图片请求。页面页脚显示摄影署名与AI图片说明。

| 文件 | 来源 | 许可/用途 |
|---|---|---|
| `festival.v1.jpg` | 本聊天内置image_gen生成 | 中秋月饼摄影质感配图，非纪录实拍 |
| `study.v1.jpg` | 本聊天内置image_gen生成 | 学习桌面摄影质感配图，非纪录实拍 |
| `calligraphy.v1.jpg` | [Feng Zou / Pexels 8627038](https://www.pexels.com/photo/brush-and-paint-for-hieroglyphs-writing-8627038/) | [Pexels License](https://www.pexels.com/license/)，读取到免费使用及不强制署名条款 |
| `archive.v1.jpg` | [Feng Zou / Pexels 6893112](https://www.pexels.com/photo/antique-pages-with-chinese-characters-and-calligraphy-brush-wooden-box-6893112/) | 同Pexels License；书写纸与文具静物 |
| `tea.v1.jpg` | [Y H / Unsplash](https://unsplash.com/photos/brown-teapot-on-stick-link-table-runner-1-L1ET2-kZ4) | 官方图片页检索结果标明Free to use under Unsplash License；独立license页面被站点访问检查拦截，未声称成功读取其全文 |

图片生成模式为内置image_gen；后续茶具/书法生成请求遇到401 token_revoked，未切换付费CLI。使用agent-reach的Exa检索与Jina网页读取补齐公开摄影来源。两张生成图仅转为JPEG以供网页分发，未改写画面内容。

### 生成prompt

`festival.v1.jpg`:

> Real editorial still-life photography for a Chinese culture article about Mid-Autumn Festival. A carved wooden table, two realistically embossed mooncakes on a small cream porcelain plate, one cut to reveal dense lotus seed filling, a simple celadon tea cup, a softly glowing paper lantern just at the far background edge, bamboo leaves casting light shadows, an unfocused traditional wooden window. Natural warm late-afternoon light, visually quiet and tasteful. Center-right mooncakes, ample table visible. No text, no writing, no logos, no cartoon, no illustration. Landscape wide 3:2 composition. Palette warm ivory, muted bamboo green, honey brown, restrained rust red. Photorealistic tactile imperfect surfaces, fine grain, premium magazine photography.

`study.v1.jpg`:

> Real editorial overhead/slightly angled photography for a Chinese character study routine article. Sunlit wooden desk with an open cream blank-paper notebook, slim black ink pen, a traditional inkstone with a brush resting on it, several blank cream flashcards scattered neatly, a ceramic cup of tea, a small stem of bamboo. One hand naturally holding a pen over paper at lower edge, no face. Authentic calm studying atmosphere, subtly imperfect materials. No legible writing, no fake Chinese glyphs, no text, no logos, no cartoon, no illustration. Wide landscape 3:2 composition, warm ivory, light wood, charcoal, muted bamboo green. Soft natural side light, premium cultural magazine photorealism.

## 验证与精确边界

- 隔离生产构建：`HF_BUILD_OUTPUT_DIR=/private/tmp/hanzifun-blog-preview npm run build:production`，2841公开文件、413英文页、9 noindex页、77旧原型映射。
- SEO门控：相同输出目录运行 `node scripts/validate-seo-quality.mjs`，404条Sitemap，errors=[]；首页资源预算不变。
- `npm test`：190/190 PASS，无fail/skip/cancel。首次运行因worktree缺忽略源缓存及配图尚未完成失败；从Desktop已有目录只读复制锁定的HSK XLSX及cedict.gz到当前忽略缓存后重跑通过，没有修改源数据或跳过测试。
- XML标准解析：5个RSS item，均为正式文章/指南的canonical链接。
- 旧`verify-editorial-browser.mjs`的发现检查改为要求文章链接至少出现一次，允许Featured/侧栏与网格重复推荐同一篇；本轮未重跑其无关的完整打印/学习旅程。
- 内置浏览器：分类、搜索、空结果、重置、菜单/Escape、Subscribe锚点与feed复制、特色文章跳转、禁用JS仍可读六卡；320/360/390/540/768/850/1100/1440八宽度无横向溢出。手机单列、平板两列、桌面三列。
- axe-core 4.10.3，WCAG 2 A/AA：桌面与手机均零违规。检查中注入的axe/禁用JS均通过重新加载恢复，不持久改变产品。
- 最终截图及浏览器收据见 [evidence/blog-ui-2026-11-01/](evidence/blog-ui-2026-11-01/)。人工视觉确认仍等待Owner；没有把自动检查当作人工批准。

不宣称已做Safari/Firefox/真机/真实p75性能或生产验收；没有实现邮件发送/收集邮箱、账号、云同步或付费订阅，没有修改故事课程。

## 继续审核

预览服务：`python3 -m http.server 4178 --bind 127.0.0.1 --directory /private/tmp/hanzifun-blog-preview`。

打开 `http://127.0.0.1:4178/blog/`。若临时输出被清理，先运行上述隔离构建。等待Owner审阅配色、顶部照片比例、文章密度与手机效果；按反馈调整页面专用文件。上线需独立执行当前候选的HF-17/18发布流程。
