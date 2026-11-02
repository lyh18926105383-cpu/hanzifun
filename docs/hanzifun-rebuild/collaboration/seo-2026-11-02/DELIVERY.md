# SEO首轮跨应用协作交付 · 2026-11-02

状态：**本地验收通过，未部署**。Owner已授权“安排并执行”，本轮完成GSC诊断、Gemini分析、Cursor局部实现与Codex验收。代码分支 `codex/seo-2026-11-02`，基线 `02eb645`；Desktop主目录保留原状态。

## 三方实际交付

- Gemini桌面端 **4 Argon**：已发送SEO-02材料并收到“HanziFun 站点 SEO 优化简报”及校正摘要。采纳三页职责区分、静态使用引导和相关内链建议。未采纳“Google沙盒测试期”的未经证明归因；没有把126核心索引统一改成339全站字集，也没有承诺原闪卡页具备完整笔顺动画或音频功能。外部对照链接为Gemini提供的研究线索，本轮最终改动以本地功能核验为依据，不宣称独立复核所有竞品。
- Cursor桌面端 **Composer 2.5 Fast**：仅改三份页面模板，增加闪卡How to practise、拼音表Look up a syllable和拼音查字用途说明/内链。任务限定c20f目录，已核实其返回的分支/目录；具体文件见[Cursor交付](cursor-delivery.md)。初版对Again的会话内重现承诺，经Codex反馈后由Cursor核对调度器并纠正。
- Codex：读取已登录GSC索引/站点地图与三页URL Inspection；对线上六地址做HTTP/meta核验；增加闪卡专用title/H1/lead；审阅合并内容、恢复依赖/锁定源缓存并执行最终验证。

## GSC诊断结论

1. 索引汇总上次更新仍为10月23日，显示2已索引/7未索引，不能当作现在全站状态。
2. sitemap.xml已于10月31日成功读取，发现404网址。另有把普通 `/flashcards/` HTML误提交为站点地图的错误条目，保留记录，未擅自删除。
3. `/pinyin-chart/`、`/flashcards/`、`/dictionary/pinyin/` 实际URL Inspection均显示已索引、抓取成功、允许索引，Google选择的canonical均为自身。没有发现三页被noindex或canonical错误阻挡的证据。
4. 拼音索引的发现字段有“临时处理错误”，但抓取/索引成功，不能把该字段扩大为整页不可抓取。参数网址检查在UI出现不同归一化表示，未将其未知结果用于原URL诊断。

## 实施与验证

改动源码：`site/pages/{learning,pinyin-chart,dictionary}.mjs`、`site/seo.mjs`。闪卡从通用“Flashcards”标题改为“Chinese Character Flashcards: Free Online Practice”，摘要说明真实的选卡组、揭示答案与本机进度。

相应更新 `tests/seo-quality.test.mjs` 的corePages预期364→365：闪卡现在加入专用元数据契约检查，公开页面与Sitemap数量不增加，原索引/结构化数据负例检查保留。

- 隔离生产构建：2847文件、413英文页、9 noindex。
- SEO验证：errors=[]、404 Sitemap网址、365个受专用契约核验的页面。
- 全量测试：**192/192通过**，fail/skip/cancel均0。首次执行出现缺锁定HSK源缓存和新增元数据页计数变化，分别恢复忽略缓存、更新合理预期后重跑通过，没有跳过测试。
- 本地浏览器：三页静态引导可见；进入first-six卡组可见真实翻卡控件；输入shui3筛选为1个音节；新增索引链接正常跳转。未冒称完整跨设备/读屏/真人听审复测。
- 生产已有首页、三入口、robots和sitemap六地址均200，三入口canonical/index策略正常；此为修改前线上现状，非本地改动已上线证明。

完整计数、来源hash与GSC界面事实见[验证记录](verification.json)。本地预览：`http://127.0.0.1:4190/flashcards/`；隔离构建目录 `/private/tmp/hanzifun-seo-preview`。

## 观察与发布边界

本轮未commit/push/deploy，也未请求批量收录、删除GSC条目或建立定时监控。当前releaseId仍表示既有线上版本；正式发布时按HF17/18建立新候选和回滚证据，不将本地通过写成已上线。

发布后记录实际日期与三个改动URL，以后续完整7天/28天GSC窗口观察曝光、点击、查询和页面覆盖；不承诺流量涨幅。87缺字仍是产品后续批次。
