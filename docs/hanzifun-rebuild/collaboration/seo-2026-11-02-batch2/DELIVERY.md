# SEO第二批：拼音导航交付 · 2026-11-02

状态：**本地Completed / PASS，等待统一部署**。Owner要求“继续下一步任务，我们再统一部署吧”。本批承接首批三页引导与闪卡SEO元数据，未单独发布。

## 实际分工与结果

- Gemini 4 Argon：在原SEO分析聊天评审字母导航和筛选区跳转。采纳仅显示有内容的首字母、说明当前索引范围、使用原生锚点及检查键盘/无JS的建议。没有将拼写首字母等同声母，没有引入新的搜索量或排名判断。
- Cursor Composer2.5 Fast：修改 `site/pages/dictionary.mjs`、`site/pages/pinyin-chart.mjs`，新增 `tests/pinyin-navigation.test.mjs`。在原126核心字拼音索引上生成21个静态首字母链接，指向各字母的首个现有音节；给原筛选form增加唯一id与tabindex=-1，提供原生跳转。具体见[Cursor交付](cursor-delivery.md)。
- Codex：复核实现、反馈说明文案和焦点要求；浏览器检查发现原 `site-preview.js` 将同路径的所有页内链接标为当前页，修正为有hash的链接不标记 `aria-current=page`，保留真正页面导航高亮。

## 验收

- 全量 **194/194测试PASS**，fail/skip/cancel=0（原192项加2项导航行为回归）；修正高亮后最终重跑通过。
- 隔离生产构建2847文件、413英文页面、9 noindex；SEO errors=[]、Sitemap404，专用元数据检查365页。
- 与首批构建直接比较：109个原拼音锚点集合完全一致、无重复；源数据、审核输入与release文件hash保持一致。
- 无JS桌面：键盘Enter激活Z链接，跳转到 `#pinyin-zao`，目标存在。
- 无JS手机390px：21字母导航无横向溢出，B键盘跳转到 `#pinyin-ban`；拼音表筛选区链接跳转成功，实际焦点为 `pinyin-syllable-filters`。
- 正常JS最终复核：字母链接标为当前页数量0，Dictionary views中的By pinyin仍为当前页。测试后已恢复脚本与视口设置。
- 预览截图已实际查看，未发现裁切或导航布局问题。本轮未声称真机或完整读屏验收。

证据、hash与计数见[验证记录](verification.json)。最新预览为 `http://127.0.0.1:4191/dictionary/pinyin/`，隔离目录 `/private/tmp/hanzifun-seo-batch2-preview`。本地预览服务临时存在，重启时按该目录启动HTTP服务即可。

## 后续统一发布

当前分支 `codex/seo-2026-11-02`，保留首批改动、原盘点/GSC文档及本批成果。没有commit/push/deploy，没有修改Desktop旧工作区，没有启动87字或Phase3。

正式统一部署时，以最新批次为最终源码状态，重新准备HF17/18的releaseId、冻结/回滚和线上复检。首批verification中的源码hash是当时快照，不能替代第二批最终指纹。后续7/28天效果观察从实际发布时刻开始，不提前宣称增长或自动建立监控。
