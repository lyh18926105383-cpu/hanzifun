# Pinyin 六条浏览器批注修订｜2026-11-17

本轮产品修订 **Completed / PASS**。Owner随后明确要求把五个拼音相关页面与深圳Blog一起直接上线、Git push、更新文档；本轮本地结论不是生产发布回执，后续以PROGRESS和本批release目录的实际部署记录为准。

## 六条批注的实际交付

1. 三张工具卡改为截图+标题+案例+说明+入口。使用自己的工具真实运行画面：汉字转换输入“你好，中国！”并显示拼音对照；四声页展示mā/má/mǎ/mà的曲线、汉字与播放控件；声调输入页把`ni3 hao3! wo3 ai4 zhong1 guo2.`变为`nǐ hǎo! wǒ ài zhōng guó.`。截图只截核心操作区，未使用AI模拟界面。生成480/960px两档、内容hash文件名、lazy图及实际尺寸/alt；共6张WebP，最大约17KB。
2. Print free A4 chart使用品牌红`#b74432`、白字与深红悬停/焦点强调，仅作用于该按钮，复制/转换按钮不改变。浏览器计算背景为rgb(183,68,50)，仍调用一次window.print。
3. 第一段精简为：`Pinyin, or Hanyu Pinyin, writes Mandarin Chinese sounds with Latin letters.`
4. 第二段精简为：`水 (water) is written shuǐ in pinyin. The mark on ǐ shows the third tone.` 水仍只链接有效字页。
5. 原三步长文字替换为水/绿/马三张直观示例卡，展示字形、含义、拼音及输入别名。点击示例实际填入shui3/lv4/ma3、定位对应格子并高亮第三/四/第三声；href保留无JS时的音节锚点，不为绿/马猜字典路由。原Jump to syllable filters键盘跳转保留。
6. 在表格后的原两条链接上方新增How Does Pinyin Work?。用可选择HTML文字和声调SVG展示`sh + ui + third tone → shuǐ`，再用小表格解释实际表格的sh行与uei列。明确uei在shui中缩写为ui，避免用户寻找不存在的ui列；补充∅和轻声标记解释。手机两列、桌面横向公式，可点击真实查表示例，不含视频。

H1、短导语、原title/description/canonical和410音节/1323形式、24组打印清单保持。三个子页的相关推荐共用图文卡片，工具核心功能不变。观察到浏览器仍使用旧静态资源后，为CSS/主交互增加固定版本查询串；截图使用内容hash文件名，避免刷新后仍显示旧图/样式。

## 实际验证与保全

- 最终214/214测试，含新增的示例音节/声调/锚点与截图来源/字节hash检查；原导航/打印/转换/听辨/文章门控全部通过。
- 两模式各3661文件、421英文页，SEO errors=[]；本地全noindex、生产候选Sitemap408（这是Owner最新发布指令激活前的基线，不是最终发布索引数）。
- 320×568、375×812、768×1024、1024×1170、1440×900无文档溢出，第一行可操作音节仍在首屏。手机/桌面全页axe各一次零违规。
- 水示例定位sh/uei并高亮shuǐ；lv4定位lü并高亮lǜ；ma3定位ma并高亮mǎ。手机弹层不越界，Escape关闭/返回焦点通过；三张图片实际加载、媒体区域等高对齐；三个子页375px均有2张新相关推荐图片、无溢出。
- 打印按钮仍调用print；print媒体下24组/410音节可见，新增图解隐藏，既有完整打印数据没有改动。
- 对比上一轮已完成深圳+拼音本地候选3655文件：3649文件逐字节不变、没有删除；仅4个拼音HTML及CSS/JS共6个旧产物改变、新增6图。深圳文章、首页/Blog列表/搜索/RSS及全部旧媒体与审核数据不变。见本批artifact-diff.json。
- 临时CDP视口/print替身和axe注入已恢复或经重新导航清除；背景QA页的Browser viewport控制未作用时采用了受支持的单页CDP模拟。未将被缓存的旧子页当成通过：重新reload后核对了新CSS版本及两个相关推荐图。

## 文件与证据

修改`site/pages/pinyin-chart.mjs`、`site/pinyin-model.mjs`、`public/site-assets/pinyin-chart.v1.css` / `.mjs`、`tests/pinyin-tools.test.mjs`；新增`site/components/pinyin-explainer.mjs`、`content/pinyin-tools/previews.json`及`public/site-assets/pinyin-previews/`6图。原始三张截图在忽略的`.cache/pinyin-visual-revision/`；内容登记文件记录真实页面、案例、尺寸、日期和hash。

证据在[evidence/pinyin-visual-revision-2026-11-17/](evidence/pinyin-visual-revision-2026-11-17/)：browser.json、两模式SEO、本地tests-local.log、产物差异，以及电脑图文卡、图解/打印、精简案例和手机图解截图。下一次从本记录、PROGRESS记录70及最新release回执接手；主表入口pinyin-chart.mjs，图解/例卡在pinyin-explainer.mjs。
