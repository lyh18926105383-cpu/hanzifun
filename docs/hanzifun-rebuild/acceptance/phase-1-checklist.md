# HF-09 · 人工审核与批次放行 Checklist

日期：2026-10-26。**所有未签字项目保持待审。** 自动测试、来源见证和 Codex 快审不能替代人工。当前126核心字/213补充字的人工内容验收均为0；本表不将预览发布为正式教学成果。

## 先打开本地预览

在主目录运行；端口变化时改审核链接的端口，不修改线上站：

```sh
HF_BUILD_OUTPUT_DIR=.cache/hf09/staging npm run build:staging
python3 -m http.server 4173 --directory .cache/hf09/staging
```

访问 `http://127.0.0.1:4173/`。字页按 `/dictionary/汉字/`，故事按 `/story.html?lesson=lessonId`。此简易服务器用于内容审核；Workers跳转/404证据见本包收据。

[review-inventory.json](../evidence/hf09/review-inventory.json) 逐字列出稳定ID、URL路径、内容hash、完整性缺口、人工/听审状态；[manual-scopes.json](../evidence/hf09/manual-scopes.json) 列出19项专项审核及各自hash。二者是生成报告，**不要直接修改它们**；真实决定写入下列输入。

## A · 字页审核，按21字一批

核心 `core-01`～`core-06` 每批21字；补充 `hsk-01`～`hsk-11`，末批3字。分组沿用稳定数据顺序，ID/URL不变。

每个字均核验：

- [ ] 字形、主读音及其他读音与适用语境一致，英义准确；区分词典候选与本页教学义。
- [ ] 简繁随读音/义项解释；“发”等不简单一对一替换；Kanji只展示来源确证的同字，不暗示日语读音或可互换。
- [ ] 部首、笔画数与实际静图/动画一致；部件缺项保留说明，助记不冒称字源。
- [ ] 至少一条例词、拼音、英义及独立例句/拼音/英译；英文助记是有意义的原创联想。
- [ ] Information、来源/许可、练习/收藏入口可用；多音切换不把原例句冒充另一读音示例。
- [ ] 待审/缺失音频保持不可播放。内容批准不等于听审批准，也不自动启用音频。
- [ ] 人工记录审核人、实际日期、可核对证据与当前内容hash；有问题的字暂不纳入本批。

213字当前是导入草稿，先在 `data/editorial/hsk-characters.json` 的 `entries` 中补齐：`characterId, readingId, meaning, word, wordPinyin, wordMeaning, sentence, pinyin, translation, mnemonic, reviewStatus`。字段格式参考 `data/editorial/characters.json`；`readingId` 必须属于该字，例词/句含本字，快审状态为 `ai-quick-reviewed` 或 `human-reviewed`。不得只给 approved 标志却留空教学内容。

## B · 按批放行操作

```sh
# 只生成待审JSON，不授予审批；先选一批。
node scripts/review-release-batch.mjs --prepare=core-01 > .cache/hf09/core-01-review.json
# 补充字示例：先补教学字段、重建并审核，再生成。
node scripts/review-release-batch.mjs --prepare=hsk-01 > .cache/hf09/hsk-01-review.json
```

审核人在生成文件中仅对真实通过的行填写 `humanContent: "approved"`、`reviewer`、`date`（YYYY-MM-DD）、`evidence`；保留原 `characterId/contentSha256`。未通过行从本批移除，留到后续批次；未审条目不填假批准。生成模板前先审核当前内容，若hash变化必须复核后重新生成，不能盲目替换hash。

```sh
# 默认dry-run：显示精确URL及preview→published差异，文件不变。
node scripts/review-release-batch.mjs --batch=.cache/hf09/core-01-review.json
# 核对差异后在main落实已签字批次；不部署。
node scripts/review-release-batch.mjs --batch=.cache/hf09/core-01-review.json --apply
node scripts/validate-mvp-gate.mjs --browser
```

工具拒绝未知/重复ID、缺Tier2字段、无审核人/日期/证据、过期hash及误带 `audioListening` 等字段。`--apply` 仅将本批真实决定写入 `data/editorial/review-decisions.json`，并为 `site/release.json` 的明确字页设置 published；不改全局默认或模式，也不启用音频。查阅 Git diff 后提交真实审批记录，临时批次文件无需提交。

production构建才允许已审published页面进入sitemap；staging/local仍全包noindex。放行后复核sitemap增加的精确URL、同字canonical和仍待审页面的排除状态。源码/读音/例句等内容变化会使旧hash失效，必须重审。

## C · 拼音与音频专项

- [ ] **拼音教学**：完整核验410音节与1323候选声调；轻声必须有词境；罕见/方言标记、ü别名、零声母和排除范围合理。入口 `/pinyin-chart/`，输入 `data/pinyin/`，原问题报告 `data/reports/`。
- [ ] **旧语境音频**：107个唯一录音逐条听审；“睛”两个教学位置共享录音但卡片ID独立。记录实际readingId、词境、声调和可用用途，不能标成纯音节。
- [ ] **缺音清单**：19个新增核心字无原语境录音；153字读音与拼音候选按 `data/reports/audio-requests.json` 逐项登记。没有录音就登记missing，不能填听审通过。
- [ ] **两场景共6句**：核验句意、词界、礼貌语境、变调/轻声；录音归档及真实逐句听审后再配置可用音频。本包未调用付费TTS。

字页内容发布与音频上线分开。拼音/场景发布前，除专项真实签字外还须满足现有 `review-decisions.json` 的pinyin教学门槛及 `data/scenarios/scenarios.json` 的语言/音频门槛，再只改对应明确路由。当前播放实现仍明确缺音；仅改审核文字不会凭空得到录音或完整播放器。

## D · 八课人工确认

本轮自动播放/跟读/测验已通过，但需人工完成下面每课的适用确认。候选审批先查故事板历史，不要求已批准媒体重新生成；找不到证据时保留缺项。第一课无独立故事板文件及逐字keywordCues，按旧基线能力核对，不把它称为新增高亮已完成。

| lessonId | 故事板/候选确认依据 | 字幕/逐字高亮观感 | TTS逐项听审 | 本地完整体验最终确认 |
|---|---|---|---|---|
| cat-and-fish-01 | 查原始基线记录 | [ ] 原分段场景 | [ ] | [ ] |
| ant-moving-bean-02 | storyboards/ant-moving-bean.md | [ ] | [ ] | [ ] |
| cat-mirror-03 | storyboards/cat-mirror.md | [ ] | [ ] | [ ] |
| little-turtle-04 | storyboards/little-turtle.md | [ ] | [ ] | [ ] |
| little-frog-05 | storyboards/little-frog.md | [ ] | [ ] | [ ] |
| painting-rooster-06 | storyboards/painting-rooster.md，已有2026-07-29字幕确认 | [ ] 本候选复核/沿用证据 | [ ] | [ ] |
| wind-doll-07 | storyboards/wind-doll.md | [ ] | [ ] | [ ] |
| cucumber-flower-08 | storyboards/cucumber-flower.md | [ ] | [ ] | [ ] |

逐课：展开中文合集→正确课程→开始故事→听TTS并看字幕→每个cue附近检查→尾帧→全部跟读→答错重试→全部答对→完成页。核对正式视频无音轨、声音只来自固定腾讯云TTS；历史故事板的保留音轨叙述不能代替现有资源检查。不得未经授权替换已批准媒体。

## E · 来源抽查及设备验收

- [ ] 两版HSK各人工抽查至少30项，覆盖首尾/多音/异常拼音；100个书写字保持一至二级联合范围；来源定位见 `data/hsk/source-headwords.json` 和原HF07 source-review收据。
- [ ] 桌面Safari：记录当前及前一主版本、macOS；字典/笔顺/拼音/学习/场景/中文故事/备份导入全程。
- [ ] 桌面Firefox：同上，特别核对存储拒绝、双标签与键盘焦点。
- [ ] iPhone/iPad真机Safari：设备/系统/浏览器版本，触摸、音视频、刷新续练、隐私模式实际结果。
- [ ] Android真机Chrome：同上；录制实际表现，不能拿桌面模拟代替。
- [ ] 真实VoiceOver或NVDA：朗读导航、Information、翻卡正背面、live保存状态、错误反馈及焦点；axe/CDP AX不能签此项。
- [ ] 原生浏览器200%缩放：五模板可操作、无内容遮挡/横向溢出；CSS zoom证据不能替代。

每项在 `data/editorial/mvp-acceptance.json` 的 `decisions` 中按 `manual-scopes.json` 的ID填写 `{status:"approved", reviewer, date, evidence, scopeSha256}`。证据需包含设备/OS/浏览器版本、具体步骤和结果；hash必须是本次实际核验的scope。19项专项分开签字，不能一次全选通过。字体/布局/交互或媒体变化后复核受影响scope。

## F · 总放行签收

- [ ] 核心126字全部达到经人工验收的Tier2；Tier1增强单列，不作为必须凑满的数量。
- [ ] HSK补充字按真实教学成熟度逐批处理；不得把源清单完整等同全字教学完成。
- [ ] 音频缺失与专项人工缺口有真实结果，未启用未审音频。
- [ ] 所有必选旅程、来源许可、旧记录/书签/资源、HTTP/索引与质量门控通过。
- [ ] `node scripts/validate-mvp-gate.mjs --browser --require-human` 返回0；若返回2，查看具体人工阻断，不改为忽略。
- [ ] 报告区分“工程通过”“候选完整验收通过”“生产发布”。本会话只有前者；生产部署未执行。

大快照的冷加载/恢复时间与localStorage容量限制仍见总报告，不能将内存CPU测试写成可落盘容量或所有操作≤300ms。后续实际发布仍需独立发布关口与生产检查；本清单和工具均不触发部署。
