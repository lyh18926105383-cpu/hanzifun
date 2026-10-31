# HF-12 尾项数据与 HF-14 主题扩编验收（2026-10-31）

执行目录：Owner 指定 Desktop 主目录 `main`；候选 `phase-2-hsk-data-2026-10-31`。本包按 Owner 最终确认的 **现有339字范围 Completed / PASS**：完成全量词表与现有字内链，87缺字为后续批次；整个HF-14等级扩编包仍Partial。

- HSK 2.0 二级增量映射 **86 → 150/150**，新增 **64 词、64 条原创例句**，词表 `deferred=[]`。每条保持锁定 2015 XLSX 的行号、源标签与规范词 ID；一级仍为独立 150 词，两级累计 300 词。HSK 3.0 二级未扩充。
- 旧 64 词并非单纯漏绑：涉及 **87 个当前字库不存在的汉字**。`nextCharacterBatch` 按规范 Unicode ID、关联词 ID 和源行列出下一批；“……”仅作为关联句式槽位，绝不生成 `char:2026`。完整字页覆盖仍为 **86/150 词**；可用字才有内链与练习卡，缺字为普通文本，没有假详情、别名或假字卡。
- 四个无整词词头项（打篮球、踢足球、虽然……但是……、因为……所以……）按来源词片段组合拼音，保留每片词头/拼音/CC-CEDICT 行号，教学释义明确为组合释义。其余直接取锁定字典词头。
- 64 例句绑定教学读音、词头见证、逐字拼音与英译；校验例句含目标词（关联句式按顺序含两段）、汉字数量与音节一致、单字内链实际存在。采用词典词调与明确轻声，不冒充连读音变或音频逐条听审。
- 在原 100 字/5 组集合外建立 **16 个重叠主题、339 个已审核字、383 条主题归类**，涵盖原 100 字全部成员，扩展到额外 239 字。每项绑定既有人工批准教学读音及内容 hash、词典来源行、发音 manifest 与录音/设备语音映射；交叉索引连接主题↔字页↔二级词锚点。原 Top 100 页面和选字不变，主题不是词频排名或官方 HSK 分类。
- Owner 本轮明确授权符合 Schema/来源校验的内容自动签收；批次 `hf14-hsk-data-2026-10-31` 使用 **owner-authorized-schema-and-source-validation**，绑定两份数据 hash 到 `review-decisions.json.hskBatches` 与 `site/release.json.hf14`。不是新的人类逐字/逐音签字；339 字原签字和音频 manifest 完全保留。签字缺失、正文/读音/主题交叉索引变化或 release hash 失效会拒绝发布构建。

## 验证

| 命令/检查 | 结果 |
|---|---|
| `HF_SITE_ENV=production npm run build:site` | PASS，2828 文件、413 英文页、399 index / 14 noindex |
| `node scripts/validate-seo-quality.mjs` | PASS，Sitemap **399**，414 JSON-LD，errors=[] |
| `npm test` | **181/181 PASS**，fail/skip/cancel=0；原174 + 新增7个 HSK 行为测试 |
| `node scripts/verify-hsk-expansion-browser.mjs` | Chrome156 PASS，4组行为、5档宽度无溢出、3类页面 axe A/AA 零违规、pageErrors=[] |
| 离线重建 | 全150词逐字段一致，全部主题源/教学读音/发音/交叉索引可重建 |
| 文件锁/身份 | CSS、src/client、其余页面模板、source lock、原字库/笔画/音频与339字审核记录均逐字节或结构对照 HEAD 不变 |

浏览器核验覆盖：150词/64例句/16主题静态输出、缺字没有失效字典链接、字典→精确主题锚点→字典带 returnTo、原二级练习入口、无 JavaScript 阅读。首次浏览器检查误将例句“请帮助我”中的已有字链接数写为1，实际应为“请/我”两条；只修检查并重跑 PASS，未修改正文掩盖失败。未执行真人听审、真机、跨浏览器、生产部署或线上验收。

## Owner 最终范围决定（已落实）

1. Owner原文：“保持 339 字，仅完成全量词表与现有字内链，缺字列为后续批次”。87字留在nextCharacterBatch，当前不扩字；150词映射完整、所有已存在字的内链有效。完整字页覆盖仍86/150词，不将其写成150词所有单字已覆盖。
2. Owner原文：“允许仅修改该条 HSK 二级 SEO 配置”。`site/seo.mjs`仅该coreSeo分支的title/h1/lead改为150词，摘要明确339字库与86词完整字页覆盖；已在测试与Chrome检查H1/摘要。与HEAD逐行对照，未改其他SEO配置。
3. 本轮确认范围Completed / PASS；HF-14全包仍Partial，HSK3.0二级及高级范围未做。候选未commit/push/部署；上一轮editorial候选的冻结manifest/回滚包不能当本候选证明，若发布需重新执行HF-17/18。

## 文件与接力

数据：`data/editorial/{hsk-level-2-examples,hsk-topic-selection,review-decisions}.json`、`data/hsk/{level-2-core,topics}.json`、`data/schemas/hsk-level-two.schema.json`。

构建/校验：`scripts/{build-level-two-core,build-hsk-topics,validate-hsk-expansion,verify-hsk-expansion-browser}.mjs`；展示仅 `site/hsk-data.mjs`、`site/pages/{hsk,dictionary}.mjs`；获Owner单条例外授权的 `site/seo.mjs`；发布 `site/release.json`；HSK测试 `tests/{hsk-expansion,phase2-audio-scenarios}.test.mjs`。

签收见 [独立批次回执](acceptance/hf14-hsk-data-2026-10-31.json)，实际命令和源码hash见 [验证回执](evidence/hf14-hsk-data/verification.json)，浏览器见 [回执](evidence/hf14-hsk-data/browser.json)。下一 Agent 从本报告、TASKS/PROGRESS 及已持久化的Owner范围决定开始；仅在未来明确扩字任务中使用 `level-2-core.json.nextCharacterBatch` 的87项，保留339字身份与签字，不改旧 HF-07 分母，不把缺字映射为形近字。
