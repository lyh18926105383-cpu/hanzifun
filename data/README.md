# HF-02 数据底座

日期：2026-10-25（Asia/Singapore）。工作目录为主仓库；未使用旧 worktree。

## 使用

```sh
npm ci
npm run data:build
npm run data:validate
npm test
npm run data:preview  # 仅本地 127.0.0.1:4172，Ctrl-C 结束
```

日常构建完全读取入库的小型来源切片，不需要网络或原始缓存。`data:validate` 全量验证 schema、来源/许可、ID、引用、实际资源 SHA-256、笔画结构及两次重建的字节一致性，并核对入库产物没有过期。`npm ci` 安装的 Ajv 只用于开发期校验，不进入浏览器。

重新提取源数据：`npm run data:fetch`。原始包只在忽略的 `.cache/hf02/` 中保存；缓存存在时校验已锁定哈希，无缓存时只接受与锁定哈希相符的下载。如果上游滚动下载地址已经变化，命令失败，不会默默采用新版本。`node scripts/fetch-content-sources.mjs --refresh` 是显式升级操作，会重取原始文件并写 `data/reports/source-upgrade.json`，随后必须构建、审阅 Git diff、核对许可及重新验收。固定包/commit 的升级需先修改脚本中的固定来源配置。

请勿手改生成的 normalized、manifest、coverage 和 reports。数据更正应进入来源解析或 `editorial-decisions.json`，再显式重提取并构建；后续人工审核应增加可持久化的审核输入与生成器消费逻辑，不能在生成报告中填签字后依赖它永久保存。

## 文件接口

| 文件 | 用途 |
|---|---|
| `core-manifest.json` | 126 个唯一字、稳定 characterId、包含输入和生成器指纹的内容版本 |
| `legacy-occurrences.json` | 108 个原教学位置、组号、卡片快照、独立 cardId、characterId、语音引用；按序可无损还原 characters.js |
| `normalized/characters.json` | 基础英义、多个读音、部首、结构、简繁语境、地区笔画、独立的 Tier/审核/发布状态 |
| `normalized/readings.json` | 153 个字读音及词读音；义项/简繁/原文行号；数字调、带调、无调、ü/v/u: 检索别名 |
| `normalized/words.json` | 85 个旧多字词/短语，75 个有锁定字典词头；非核心组成字只作引用，不扩大核心字数 |
| `normalized/kanji.json` | 每个核心字均有核验状态；80 个由 Unihan 17 `kJoyoKanji=2010` 直接支持的同字关系；46 个只表示所查字段未提供直接证明，不能推断“日语不存在” |
| `normalized/audio.json` | 107 条既有腾讯云语境录音、原文本/声线/哈希；候选目标 readingId 与确认 readingId 分开 |
| `strokes/{codepoint}.json` | 126 个未修改的 Hanzi Writer 原始按字路径/中线文件；manifest 含每字哈希、地区、实际笔画数 |
| `pinyin/scope.json` | 固定 410 音节的显式编辑范围；不做声母×韵母积，说明罕见音节及排除范围 |
| `pinyin/syllables.json` / `readings.json` | 字典中实际见到的 1,323 组音节/声调及例字候选；均待教学审核，不能把“词典见到”当作已审合法教学声调 |
| `source-extracts/` | 可重建的必要源切片：核心字与旧词、每个拼音候选的一条例证、核心及直接关联字形的 Unihan 字段、126 个部件源记录；没有整库 |
| `schemas/` | normalized bundle、SourceRelease/来源锁、HSK membership 的 JSON Schema |
| `reports/` | 音频补录/听审需求、17 个不完整部件源记录、10 个旧短语词头缺项、126 字逐项待审清单、来源升级模板 |

冻结的上层 Character/Card 契约仍位于 `docs/hanzifun-rebuild/contracts/content.schema.json`。本包扩展实体的可执行 schema 位于 `data/schemas/`；没有改变既定 ID 和 URL 规则。HF-04 应从上述数据读取并添加独立教学编辑层，不把原型助记、例句或词典导入自动视为已审核教学页。

## “睛”的计数

第 19 个位置 `card:legacy:4-4:1` 与第 87 个位置 `card:legacy:4-15:3` 都指向 `char:775b`，共用 `audio/tts-v1/019-775b.mp3`。旧源 108 个位置、107 唯一字；与原型 26 字重合 7 字，核心并集为 126 字。

`audio-manifest.json` 的 `available/total` 现在按字统计为 107/107；`availableOccurrences/totalOccurrences` 按教学位置统计为 108/108。生成器重跑仍保持此语义，保留既有声线，不新生成音频。

## 来源、许可与归属

实际版本、URL、抓取时间、原包哈希、切片哈希和使用范围见 `sources.lock.json`。

- CC-CEDICT contributors / MDBG，发行头日期 `2026-10-23T23:15:44Z`：[官方下载](https://www.mdbg.net/chinese/dictionary?page=cc-cedict)。读音、英义与词典简繁关系的切片及派生字段按 CC BY-SA 4.0 发布；完整许可在 `licenses/CC-BY-SA-4.0.txt`。原始 v1 下载格式、义项顺序、行号与字头保留，解析器另有 v2 夹具。
- Unicode, Inc.，Unihan 17.0.0：[固定发行](https://www.unicode.org/Public/17.0.0/ucd/Unihan.zip)、[对应字段说明修订 39](https://www.unicode.org/reports/tr38/tr38-39.html)。字段切片与派生 Unicode 信息保留 Unicode License v3（`licenses/Unicode-3.0.txt`）。`kTotalStrokes` 为该发行的 IRG 计数，地区差异从 `kAlternateTotalStrokes` 的显式来源字母读取，不能套用旧版双数值规则。关联字形“蠶”的 24 / 日本字形 26 笔作为真实回归样本。
- Hanzi Writer data 2.0.1 / Make Me a Hanzi / Arphic Technology：[维护者仓库](https://github.com/chanind/hanzi-writer-data)。笔画 JSON 保持原文件字节，按 Arphic Public License 分发（`licenses/Arphic-Public-License.txt`）；渲染器代码许可与数据许可分开，本包没有引入渲染器运行依赖。
- Make Me a Hanzi dictionary，commit `bddc96d41bef78427ed0e034e9f7e31d71fd1b92`：[源文件](https://github.com/skishore/makemeahanzi/blob/bddc96d41bef78427ed0e034e9f7e31d71fd1b92/dictionary.txt)。源字典来自 Unihan/CJKlib，适用 LGPL-3.0-or-later；仅提取 126 字的部首和图形分解字段，切片及这些派生字段沿用该许可。`licenses/Make-Me-a-Hanzi-COPYING.txt`、LGPL 与 GPL 全文一并保留；切片、解析/构建源码和固定上游定位提供可修改、可重建的形式。未采用其 etymology 字段。
- 《汉语拼音方案》由 [华东师范大学语言文字网刊载](https://yywz.ecnu.edu.cn/1f/56/c30556a335702/page.htm)：只核对拼写规则，网页和图片不再分发；直连 TLS 失败后通过 Jina 读取，实际传输地址与快照哈希已记录。
- 旧卡片、原型和现有静态 TTS 的本项目复用范围见 `licenses/PROJECT-PROVENANCE.md`。这是项目来源记录，不是全站或第三方素材的统一许可证。

JSON 文件是按字段来源组合的数据集合，不能把其中 CC BY-SA、Unicode、LGPL、Arphic 字段都改写成 MIT，也不把数据许可扩展成整站代码的统一许可。HanziFun 的新增范围说明与编辑决策保留自身来源；所有后续派生分发应随数据提供相应署名和许可。

## 验收与范围边界

结构校验通过不表示人工内容/音频验收通过。当前 `contentTier=Tier2` 表示目标标准；所有核心字的 `reviewStatus` 与 `publicationStatus` 仍为 draft，完整 Tier 2 教学页计数为 0，HF-04 再接例句、短助记和学习入口。缺插画本身不构成发布障碍。

Codex 已逐项检查 126 字/153 个字读音摘要并登记四个语境主读音修正（壳 ké、肚 dù、说 shuō、听 tīng），这不冒充人工对全部英义和简繁语境的验收。22 字本地浏览器抽查记录见 `docs/hanzifun-rebuild/HF-02-VERIFICATION.md`。

现有录音的 kind 为 character-with-context，不能冒充纯音节示范；confirmedReadingId 仍为空。拼音表所有播放绑定为空且 playable=false。未审核音节/声调及轻声词境仍是候选，首发启用前须逐项核对并听审。补录报告不发起付费 TTS。

HSK 仅交付导入 schema 和既定范围决策，尚未导入官方清单，分母为 null；实际文件、来源版本/哈希、按表范围与页面交付留给 HF-07。`approved-with-scope / user-confirmed-scope` 不等于第三方许可，也不以缺书面授权为默认阻塞。没有账号、同步、Billing、故事制作或部署变更。

当前静态站白名单构建不发布此数据目录；后续页面接入时只选取实际需要的规范化文件、按字笔画与署名/许可，绝不能把 `.cache/`、来源整包、开发依赖或原型整体放进公开构建。
