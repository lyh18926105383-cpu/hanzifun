# Phase 1 最终验收 · PASS

日期：2026-10-26（Asia/Singapore）。工作目录：`/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun`，分支 `main`。Release ID：`phase-1-signed-2026-10-26`。

**Phase 1 当前候选最终验收 PASS；人工签发与成熟页面索引放行完成。** HF-02、HF-04、HF-07、HF-08、HF-09 的人工挂起正式关闭。生产模式构建已完成；实际远端部署与生产冒烟交 HF-17/18，本轮未部署。

## 人工签发依据

负责人在2026-10-26本会话中明确确认 Phase 1 人工验收完成，并要求写入持久化审核输入。审核人登记为 Project owner (user)，Codex仅负责录入和自动验证。完整原始声明、适用范围与证据限制见 [正式签发记录](phase-1-signoff.md) 和 [签收清单](phase-1-checklist.md)。不虚构负责人未提供的设备/系统/浏览器/读屏器版本；本轮Chrome自动化与人工声明分别保存。

- 核心126字：Tier2内容完整，6个core批次经正式批量工具签发，每字保留内容SHA-256、审核人、日期和证据。
- HSK补充213字：实际教学编辑 `entries=[]`，没有已补齐的Tier2补充字可发布。负责人内容复核不等于空字段具备教学完整性；本轮保留全部为preview/noindex，扩充交HF-14。
- 拼音410音节/1323声调候选、两版HSK范围和两场景文字审核签发完成；15个支持页面具有pageReviews签字。
- 19个专项按现有scope ID分别签收，当前scopeSha256全部匹配。
- 已有107个语境录音负责人听审通过，实际路径/文件SHA-256已核验；19新增核心字、其他缺音读音/音节和六句场景音频继续真实缺失，不冒充可播或独立音节录音。
- 八课沿用既有批准媒体和腾讯云TTS，负责人最终核验签发；第一课保留原分段能力，不宣称新增keywordCues。本次未生成或修改课程媒体。

## 最终开放索引范围

| 页面范围 | 页面数 | Production robots | Sitemap URL数 |
|---|---:|---|---:|
| 核心字详情 | 126 | index,follow | 126 |
| 首页 | 1 | index,follow | 1 |
| 字典总索引、拼音、部首、比较 | 4 | index,follow | 4 |
| 独立笔顺、拼音表 | 2 | index,follow | 2 |
| HSK总入口、两版首级 | 3 | index,follow | 3 |
| 场景总索引、两分类、两详情 | 5 | index,follow | 5 |
| **合计** | **141** | **index,follow** | **141** |

英文静态页共401个：production为141可索引／260 noindex；staging、local均401 noindex且Sitemap为空。搜索、`/account/`、动态闪卡、404与后续阶段占位继续noindex且不入Sitemap。Unicode canonical、参数剔除和Sitemap集合由全量校验确认。中文旧入口、108教学位置/107唯一字、八课资源继续保全。

[索引与缺音收据](../evidence/hf09/phase-1-release.json) 记录141条URL、私有页noindex、1323个禁用拼音音频按钮、6个禁用场景音频按钮和107个既有录音哈希。

## 全量验证

| 命令/检查 | 结果 |
|---|---|
| `HF_SITE_ENV=production npm run build:site` | PASS，1546个公开文件，主目录dist已重建 |
| `npm test` | **138/138 PASS**，0失败/跳过 |
| `node scripts/validate-seo-quality.mjs` | PASS，401页／354核心页，所有JSON-LD与预算合格，Sitemap精确141条 |
| `node scripts/validate-mvp-gate.mjs --browser --require-human` | **PASS，退出0**，工程及候选验收均PASS，人工阻断0 |
| 数据/HSK来源与离线重建 | PASS |
| production及重复、staging、local四构建 | PASS，production字节一致 |
| 本机Workers HTTP | PASS，18项状态、跳转/query与staging头 |
| 真实Chrome浏览器回归 | PASS，本机存储/学习、HSK两场景、SEO质量与八课完整流程 |
| `git diff --check` | PASS |

保留针对未签字、过期hash、未知字、缺Tier2字段、重复批次、私有页面误索引的拒绝测试。原先硬编码“必须pending”的场景断言改为接受真实签字，并在显式pending夹具中继续验证拒绝发布；没有删减原138项测试。

## 候选身份与证据

- 验证时HEAD：`914196cdd2c71d3d48e96f27d221e45ba0902f32`（本次提交前基点）。
- 产品/脚本/数据输入SHA-256：`2c4db69d5f2ca25ffd3d4a7f953850267f46d4424c658f1eb2eb521a2dd770cb`。
- Production构建：1546文件，完整路径/内容集合SHA-256：`11fc96bca923b3b4a1543528599bb1d15a148362fd9c7d7e09230d1baf95bd87`；重复构建相同。
- [总门控](../evidence/hf09/gate.json)、[逐字状态](../evidence/hf09/review-inventory.json)、[专项哈希](../evidence/hf09/manual-scopes.json)、[完整浏览器](../evidence/hf09/browser.json)、[HTTP](../evidence/hf09/workers-http.json)。截图/备份/详细日志保留在忽略的 `.cache/hf09/`；大媒体及缓存不提交。

## 保留边界与下一步

物理缺音继续不可播；213补充字必须先补完整教学内容再单字审核。Tier1增强不拦当前Tier2发布。已存在录音只批准其语境用途，未改变归一化来源或建立未经确认的独立音节播放映射。

本机localStorage大快照容量与冷加载成本仍受既有边界限制，不能把内存基准写成真实可落盘容量或全部操作≤300ms。Chrome实验室LCP/CLS不等于线上p75/INP；自动axe/模拟设备不代替负责人手检。具体运行/设备证据按原始签发记录注明未提供项。

下一Agent进入HF-17，以当前release与哈希准备发布/回滚包，再由HF-18完成实际部署和生产200、索引、旧书签/迁移及运行观察。本轮未推送远端、未部署，未引入账号、云同步或Billing。
