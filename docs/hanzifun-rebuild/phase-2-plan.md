# Phase 2 · HF-10 补充字教学管道与分批计划

日期：2026-10-27。当前：Batch A-D共213字已完成教学注入并按每批独立审核决定逐字hash签发为本地published；`releaseId=phase-2-hf10-a-d-2026-10-27`，生产构建354条Sitemap URL。未独立核验线上部署。下方盘点表、inventory与batches文件保留制作前冻结快照，不能当实时状态。

## Batch B-D 完成记录（2026-10-27）

- Batch B/C/D分别使用`data/editorial/phase2/batch-b.psv`、`batch-c.psv`、`batch-d.psv`正文，以及各自的`batch-{b,c,d}-review.json`审核配置注入；Batch B「五」的核心释义为用户修订后的`five`。
- 三批独立映射文件分别选择主教学读音和逐字`structureNotes`；结构说明均含用户提供的结构审核者与日期。注入器逐批校验冻结字符集、完整Schema、读音ID归属和结构说明后apply。
- B/C/D分别生成`evidence/hf10/batch-b-release.json`、`batch-c-release.json`和`batch-d-release.json`，再各自调用`review-release-batch.mjs --apply`。每份决策仅含本批53字，绑定本批最终内容哈希；没有混用审核决定。连同Batch A的54字，共213/213补充字published。
- 生产构建：1546公开文件、401个英文页，354 index / 47 noindex；Sitemap 354 URL。`npm test` 151/151 PASS；SEO质量检查PASS，402 JSON-LD、`errors=[]`。
- `validate-mvp-gate.mjs`仍FAIL / exit 1：tests、benchmark、data、HSK及production重复构建、staging、local PASS；Workers HTTP监听`127.0.0.1`受环境限制返回`EPERM`。浏览器复验未完成，因此完整MVP门控不记作全绿；线上部署也未核验。本轮未push、commit或部署。

## Batch A 实施记录（2026-10-27）

- 已实现 `scripts/inject-phase2-batch.mjs`；默认dry-run，`--apply`才原子写入教学源，使用现有发布器单独放行。
- 原始54行数据：`data/editorial/phase2/batch-a.psv`；读音/形体选择和负责人审核声明元数据：`data/editorial/phase2/batch-a-review.json`。
- 54条均符合扩展后Schema（允许humanAcceptance=approved并支持structureReview）；负责人审核日期沿用明确声明的2026-10-26，结构编辑核对日期为2026-10-27。完整证据见 [签发依据](acceptance/phase-2-batch-a-signoff.md) 和 [逐字hash决策](evidence/hf10/batch-a-release.json)。
- 已按dry-run→apply注入与发布，54字published、其余159字preview；releaseId=`phase-2-batch-a-2026-10-27`。核心126与剩余159条审批、所有audioListening字段均保留。来源lexicon/笔顺不改，结构说明为绑定源hash的编辑层数据。
- 普通字页、HSK卡组及新建单字练习均使用已选教学读音；稳定reading/card ID保留，已有冻结会话不回写。
- 单元/静态DOM、Schema、SEO与四构建检查结果见PROGRESS及本轮receipt；MVP的Workers HTTP因listen EPERM失败，Chrome也无法启动。保留失败，不跳过门控，不宣称浏览器/完整候选PASS或已上线。
- 冻结hf10-batches.json不改表、不重排；原hf10-inventory.json仍是制作前缺项快照，原审计脚本的全213字preview断言在Batch A转正后不再适用，不能再次默认输出覆盖历史。实时状态以hsk-characters/review-decisions/release和本轮receipt为准。

## 历史预检记录：后续批次准备（2026-10-27；已由上述签发取代）

- 注入器新增独立映射参数：`--reading-selections=<glyph-to-numeric-reading.json>` 与 `--structure-notes=<reviewed-layouts.json>`。结构文件必须有真实核对人、合法日期及逐字notes；未知批次字会拒绝。Schema新增 `upper-right-enclosure` 以表达 习 的可见布局。
- 工作目录已有根目录 `batch-b.psv`、`review-b.json`（只读使用，均未覆盖）；B批53行机械dry-run成功。明确读音选择保存在 `data/editorial/phase2/batch-b-reading-selections.json`，16个需核实字的说明保存在 `batch-b-structure-notes.json`。
- 暂不执行B批apply/release：输入行「五」的meaning为“星期五”，而该行wordMeaning才是“Friday”；正文存在明显错位。此项修正后，原精确正文hash已变化，需对修订内容重新签字。dry-run只证明结构/schema/稳定ID/读音关联可通过，不是语言质量验收。
- 未找到Batch C/D教学PSV或各自审核声明；不生成签字、不复制B/A审批、不把预览路由转正。接下来需提供C/D完整9列正文和本批审核元数据，并确认修正后的B内容。
- 本次预检复验：`npm test` 151/151；`HF_SITE_ENV=production npm run build:site`成功（401页，195 index/206 noindex）；SEO PASS，195 sitemap URL、402 JSON-LD、errors=[]；MVP总门控FAIL，唯一工程失败workers-http因127.0.0.1 `listen EPERM`。这些数字反映当前Batch A签发范围。

重复注入相同数据可验证幂等；已发布内容若变动则拒绝覆盖，需另走明确重审流程：

```sh
node scripts/inject-phase2-batch.mjs --input=data/editorial/phase2/batch-a.psv --metadata=data/editorial/phase2/batch-a-review.json
node scripts/inject-phase2-batch.mjs --input=data/editorial/phase2/batch-a.psv --metadata=data/editorial/phase2/batch-a-review.json --apply
```

后续B/C/D须提供本批PSV、独立metadata（批次/审核者/日期/依据、歧义字readingSelections、源数据不完整字的structureNotes、实际结构核对人/日期）；没有本批负责人明确批准时保持pending，不复制A批声明当作后续批次批准。`--decisions=<文件>`只可随--apply导出签发包，导出本身不改变release。

## 编号与阶段

用户本轮明确启动 Phase 2，并将本项命名为 HF-10。本文件中的 **HF-10（Phase 2）** 专指现存 213 补充字教学补齐；原 `tasks/HF-10-auth.md` 仍是 Phase 3 登录任务，未启动、不改号。原 HF-14 的持续 HSK 扩充职责保留，本项作为其现存字库补齐前置批次，并不宣称已扩至两版 2 级。后续请求须带“Phase 2 补充字”限定，避免启动旧 HF-10。根 AGENTS.md 中 Phase 1 阶段描述由本次用户明确阶段指令覆盖；账号、同步、Billing 仍禁止提前引入。

## Git 同步

主目录 main 工作；开始时 tracked 工作区干净，`git log origin/main..main` 为空，当前本地远端跟踪引用与 main 相同。执行 `git push origin main` 退出 128：`Could not resolve host: github.com`。因此推送未成功；没有联网确认实际远端 HEAD，也不把已有 origin/main 引用当作实时状态。未修改 Git 凭据、未提交或部署本次产物；原个人未跟踪文件保留。

## 精确盘点

权威输入为 `data/hsk/lexicon.json` 的 characters，不是核心字模块 `site/dictionary-data.mjs` 的 126 字。补充字由 `site/hsk-data.mjs` 汇合到站点，`site/pages/hsk.mjs:additionalCharacterPages` 渲染；发布门控为 `site/publication-review.mjs:characterReviewState`，路由以 `site/release.json` 和 `site/routes.mjs` 为准。

| 项目 | 数量 / 当前状态 |
|---|---|
| 唯一补充字 / preview 路由 | 213 / 213，全部 noindex,follow |
| 两版 HSK 共同关联 | 145 |
| 仅 HSK 2.0 关联 | 1（京） |
| 仅 HSK 3.0 关联 | 65 |
| 不在 HSK membership、由场景补入 | 2（呼、称），保留在 Batch D，不能称作官方 HSK 字 |
| 带声调/数字调/检索别名的源读音与词典义项 | 213，属于候选源证，尚非已选教学读音 |
| 部首、笔画数、按字笔顺文件及 hash | 213，已有静图/动画构建支持；部首有值不代表本轮重新人工核准 |
| 按 readingId/义项的简繁关系 | 213，含同形，不能假设一对一 |
| 自研教学 entries | 0，九项必填教学字段各缺 213 条 |
| 部件不完整 / 结构未核实 | 29 / 38，两者有重叠，不能相加当缺失字数 |
| 多读音候选 | 54，逐字确认教学读音、例词及简繁语境 |

逐字字段、读音、来源定位、缺项、风险标记、当前门控问题与内容 hash 见 [hf10-inventory.json](hf10-inventory.json)。全字表和稳定 ID 见 [hf10-batches.json](hf10-batches.json)。无新增来源下载、无官方内容更新声明；全部基于现有锁源快照。

源记录 `publicationStatus: draft`、`contentTier: null` 是可重建的导入事实；页面 preview/published 由 release 决定。不要手改 lexicon 的 draft、contentTier 或 coverage 计数来假装已发布。

## 教学 JSON Schema 与字段模板

可机读 Schema：[hsk-teaching-entry.schema.json](../../data/schemas/hsk-teaching-entry.schema.json)。这是**单个 editorial entry** 的模式，外围继续使用现有 `{version, policy, entries: [...]}`。使用现有字段名，`memoryAid → mnemonic`，`examples[0] → word/wordPinyin/wordMeaning + sentence/pinyin/translation`；不要另建渲染器不读取的字段。

以下是字段填写模板，尖括号为待填写内容，不得当有效正文导入：

```json
{
  "characterId": "char:<现有Unicode小写十六进制>",
  "readingId": "<该字已存在且核准的readingId>",
  "meaning": "<本教学读音的简明核心英文释义>",
  "word": "<包含本字、匹配教学读音的例词>",
  "wordPinyin": "<例词带调拼音>",
  "wordMeaning": "<例词英文释义>",
  "sentence": "<包含本字的原创简短自然中文句>",
  "pinyin": "<整句带调拼音>",
  "translation": "<整句自然英文翻译>",
  "mnemonic": "<原创英文记忆联想，不宣称历史字源>",
  "reviewer": "<实际快速审读者>",
  "reviewDate": "<实际审读日期 YYYY-MM-DD>",
  "generationBatch": "hf10-phase2-a",
  "kind": "mnemonic",
  "targetTier": "Tier2",
  "reviewStatus": "ai-quick-reviewed",
  "humanAcceptance": "pending"
}
```

模式中的非空约束无法判断拼音和正文是否正确，动态门控及人工审核仍必需。`reviewStatus` 也支持 `human-reviewed`；不能在实际审读前设置完成状态。`humanAcceptance` 沿用编辑层 pending；正式人类批准的唯一权威在 `review-decisions.json`，不能靠修改这个展示性字段放行。

基础数据不重复手填到 editorial：`characterId/glyph/readingId/primaryReadingId/definition/radical/strokeCount/structure/components/scriptRelations/unihan/sourceReferences` 从 lexicon 连接，`pinyin/senses/traditionalForms/evidence` 从 readings 连接，笔顺从 strokes 连接。简繁关系已有，需逐义审核；现有门控没有另一个必填 `traditionalNote`。29 个不完整部件和38个未核实结构须在逐字审核证据中说明，保留诚实的笔顺回退；如需新说明字段，应先设计持久化编辑层及渲染/语义门控，不把助记当部件事实，不为凑结构捏造拆字。

## 转正的完整门控（不得用 JSON Schema 代替）

1. 九个教学字符串全部非空：readingId、meaning、word、wordPinyin、wordMeaning、sentence、pinyin、translation、mnemonic；readingId 必须属于该字，word/sentence 均含该字。所有关联源读音具备带调拼音和非空 senses；reviewStatus 已完成快速审读。当前代码检查非空而非语言质量，需人工核对拼音、变调、多音、英义及简繁语境。
2. 按 Tier 2 复核真实笔顺/全套静图、Information、可信部件或明确结构回退、例词/句/助记、来源许可及真实练习/收藏入口。缺专属插画、长故事或物理音频不阻断文本发布；没有真实音频批准仍保持不可播。基础/结构问题不能因现有机器门控未检查而忽略。
3. 教学内容冻结后，重新导出每字当前 contentSha256（绑定源字、全部读音、编辑条目、笔顺和 sources.lock）；真实人工填 humanContent=approved、reviewer、合法 date、evidence 与精确 hash。审批字段不是正文模板的一部分，不提前签字。
4. `review-release-batch` 默认 dry-run，先校验内容和签字，再显式 --apply，同时写 `review-decisions.json` 与精确 `release.routes[path]=published`。不得改全局 dictionary pattern。production 才输出 index,follow 并进入 sitemap；staging/local 仍 noindex。
5. 每批独立测试/构建/SEO/浏览器验收，经 HF-17/18 发布；旧126字签字和URL/学习ID不变。sources.lock 是全局签字输入，修改后须检查已有批准是否失效。已签字内容再次编辑必须重新审批。

正式审批文件示意（字段内容由真实审核填写）：

```json
{
  "batchId": "hf10-phase2-a",
  "decisions": [{
    "characterId": "char:<现有ID>",
    "contentSha256": "<正文冻结后的当前SHA-256>",
    "humanContent": "approved",
    "reviewer": "<真实人类审核者>",
    "date": "<真实日期>",
    "evidence": "<逐字审核证据路径和范围>"
  }]
}
```

## 四批划分（54 + 53 + 53 + 53 = 213）

确定性排序：两版共同 → 旧版独有 → 新版独有 → 场景补入；同组先联合1–2级书写字、再新版一级认读字，再按各版一级词表中包含该字的去重词头数降序、最小源词条 ordinal 升序、Unicode 升序。所有排序键和源行保存在 inventory；词头覆盖是教学复用度代理，不是语料词频，不声称排名或难度排序。不同源版本 ordinal 只作固定平局规则。批次边界允许跨来源组，避免为了纯来源分组导致大小失衡。

### Batch A · 54 字 · `hf10-phase2-a`

学 儿 子 天 上 下 不 好 有 那 午 们 小 一 这 么 大 个 字 年 在 多 少 家 书 你 时 我 的 对 分 汉 今 国 去 人 他 她 爱 八 爸 打 二 作 工 后 会 叫 九 来 了 六 妈 吗

来源分布：共同54；旧版独有0；新版独有0；场景0。当前：正文54、负责人签发54、本地published54；用户报告已部署生产，本轮未独立核验，Workers/浏览器验证受环境限制。

### Batch B · 53 字 · `hf10-phase2-b`

名 七 三 什 十 是 四 岁 五 现 写 习 电 哪 些 看 见 车 里 友 朋 气 话 面 星 期 怎 吃 影 读 起 机 院 开 觉 雨 再 杯 本 客 菜 出 租 脑 视 东 都 飞 钟 兴 高 狗 号

来源分布：共同 53；旧版独有 0；新版独有 0；场景 0。状态：53行输入dry-run通过，未注入/未签发/未转正；“五”的核心释义错位，需修正并重新签字。

### Batch C · 53 字 · `hf10-phase2-c`

喝 回 块 师 老 冷 买 猫 关 系 米 呢 能 亮 漂 苹 前 热 认 识 商 谁 太 喂 喜 先 想 谢 校 服 衣 椅 样 住 桌 昨 坐 店 京 要 间 日 百 哥 还 以 可 口 两 也 文 为 地

来源分布：共同 38；旧版独有 1；新版独有 14；场景 0。状态：尚未收到教学正文或审核声明；正文0、签发0、转正0。

### Batch D · 53 字 · `hf10-phase2-d`

比 过 长 病 课 晚 包 玩 班 它 外 吧 白 唱 市 超 穿 到 第 弟 房 常 非 歌 司 贵 蛋 鸡 件 得 零 卖 忙 妹 您 奶 牛 士 便 宜 床 千 手 题 新 息 元 真 知 道 饺 呼 称

来源分布：共同 0；旧版独有 0；新版独有 51；场景 2。状态：尚未收到教学正文或审核声明；正文0、签发0、转正0。

## 初始注入脚本方案（历史；现行命令见上方实施记录）

本轮已经实现 `scripts/audit-phase2-hsk.mjs`：只读产品输入并输出上述两份审计文件；`--check` 验证与实时输入逐字节一致。它固定验证213唯一字及全部preview，作为本轮快照工具；首批实际转正后须显式更新盘点契约/重新冻结基线，不可直接覆盖历史批次、静默重排。

**下一步待实现** `scripts/import-hsk-teaching-batch.mjs`，本轮未实现正文注入器：

1. 输入 `--batch=hf10-phase2-a --input=<已审读草稿.json>`，默认 dry-run，使用 Ajv 校验本 schema；对照冻结批次限制ID范围、拒绝重复/漏字/未知字段、校验readingId归属和例词/句含字，拒绝占位文本。
2. 加载完整数据到内存，仅 upsert 目标 `data/editorial/hsk-characters.json.entries`，不得改核心126、词典锁源、笔顺、审批或release。默认拒绝覆盖已发布条目；修订另走重审模式。使用 `characterReviewState(id, candidateInputs)` 校验全部目标 contentComplete。多音/简繁和结构风险随人工审阅包导出。
3. `--apply` 前核对输入文件摘要，备份并临时文件+rename 原子写入单个 editorial 文件；失败不部分提交；输出精确diff/批次回执。重复应用相同数据无变化，内容变更不会继承旧签字。
4. 注入成功后再次按目标ID生成真实 hash 审批模板，不能复用本轮 inventory hash（当前 teaching=null）；4个制作批次使用自定义 decisions JSON。现有 `--prepare=hsk-01..11` 是旧21字切片，与A–D不同，禁止混用；`--batch=<文件>` 已支持自定义batchId，无需重写发布器。

```sh
node scripts/audit-phase2-hsk.mjs --check
# 完成注入器和真实草稿后，先dry-run再apply（本轮没有执行）
node scripts/import-hsk-teaching-batch.mjs --batch=hf10-phase2-a --input=<draft.json>
node scripts/import-hsk-teaching-batch.mjs --batch=hf10-phase2-a --input=<draft.json> --apply
# 正文冻结并逐字人工批准后
node scripts/review-release-batch.mjs --batch=<真实审批文件.json>
node scripts/review-release-batch.mjs --batch=<真实审批文件.json> --apply
npm test
node scripts/validate-hsk-data.mjs --no-rebuild
HF_BUILD_OUTPUT_DIR=/tmp/hf10-production npm run build:production
node scripts/validate-seo-quality.mjs /tmp/hf10-production
```

实施注入器时应测试跨批ID、重复/漏字、未知读音、缺字段、例词不含字、已发布覆盖、过期hash、写入失败恢复、幂等；用候选内存数据验证“未审无法发布”，不要向生产写测试批准。每批浏览器抽查首尾、多音及简繁复杂字、手机/桌面/无JS、笔顺→闪卡→本机保存→刷新；未审字继续noindex，新增 sitemap 数与本批实际签发数相等。HF-17/18处理生产发布，不能把本地构建当已上线。

## 本轮验证

具体运行结果见 PROGRESS 本轮记录。本次没有UI/运行时改动，因此不声称重新执行浏览器交互、真机或生产冒烟。既有未跟踪个人文件不改动。本次仅盘点/管道准备子任务完成，四批正文及整个HF-10 Phase 2保持未完成。

收尾已完成：TASKS/PROGRESS均更新；140/140测试、HSK结构、Schema正反例、审计重现及隔离production构建/独立SEO通过（141 sitemap URL，errors=[]）。11个既有未跟踪文件SHA-256一致。Git推送重试仍因DNS失败；未创建本轮提交或部署。

最终验证补记：149/149测试通过；54/54条Schema与八项原始正文逐值比对通过；195个index页/195条sitemap、SEO errors=[]，生产重复构建字节一致，staging/local仍0条sitemap。完整MVP退出1，Workers HTTP listen EPERM；Chrome启动即退出，浏览器检查未完成。不可将此记为全门控PASS或生产上线。实时回执见 [Batch A验证](evidence/hf10/batch-a-verification.json)。
