# HF-11 / HF-12 Phase 2 本地验证

2026-10-27（Asia/Singapore），指定主目录 `main`。本次用户重定义 HF-11 为音频、HF-12 为场景与二级核心词。原 HF-11-sync / HF-12-culture-tools 历史任务均未执行。保留开工时 HF-10 的未提交数据、审批、构建与用户文件。

| 检查 | 实际结果 |
|---|---|
| `HF_SITE_ENV=production npm run build:site` | PASS，2824 公开文件 / 409 英文页：355 index、54 noindex |
| `npm test` | **159/159 PASS**，0 fail / skip / cancelled |
| `node scripts/validate-seo-quality.mjs` | PASS，355 Sitemap URL、358 核心 SEO 页、410 JSON-LD，errors=[] |
| `node scripts/build-level-two-core.mjs --check` | PASS，锁定 2015 XLSX 与 CEDICT 离线生成 86 条完全一致；64 条未扩充 |
| 静态音频完整性 | 1268/1268 文件大小、SHA-256 和源 Git Blob SHA-1 匹配 |
| 实际浏览器解码/采样 | 1268/1268 解码且非静音；时长 0.5746875–2.481625 秒 |
| Chrome 155 + axe | 7 类页面零 WCAG A/AA 违规；360/768/1440 共 21 档无横向溢出 |
| 实际交互 | 1323 个表内播放入口无禁用，录音可播放/停止；机场 飞机 保存 2 字、练习播放/评价、返回原 token、进入字典再返回通过 |

浏览器回执与截图：[browser.json](evidence/hf11/browser.json)、[拼音手机图](evidence/hf11/pinyin-390.png)、[酒店手机图](evidence/hf11/hotel-390.png)。逐项数值见 [inventory.json](evidence/hf11/inventory.json)。浏览器复验入口：导入 `scripts/verify-phase2-audio-browser.mjs` 后调用 `verifyPhaseTwoBrowser()`（可传 playwrightModule）；隔离浏览器临时存储，不使用原中文学习记录。

## 初次交付边界（历史，已由下方 Owner 收口签收更新）

- 354 个原可索引页保留，新增 `/academic/hsk-2/level-2/` 一个成熟来源词表页，故 Sitemap 为 **355**。HSK 2.0 二级为 86/150 新增词子集；全量两级累计 300 词不等于本轮覆盖。HSK 3.0 不宣称已扩二级。
- 新增机场交通、酒店入住、超市购物各 5 句。三组原创建模、拼音/英译/token、中文语音入口、收藏/练习及双向字链已交付，全部组成字都已有完整详情。独立人工语言签收仍 pending，精确三路由保持 noindex；未挪用 Phase 1 的餐厅/商务批准。待按 [15 句签收包](acceptance/phase-2-hf12-language-review.md) 真实批准后才可再放行，其他状态不变时为 358 URL。
- 本轮音频新增独立资产 manifest，不改旧录音的 `audioListening` 或冒充审批。1325 读音映射中有 1268 静态录音；其余 57（表内 55，额外字读音 2）采用源词境的中文设备声线示例。738 个词/句也使用中文设备声线。没有中文声线时给出安装中文语音后重试的可操作提示，不用英语逐字母朗读拼音；不把空白/静音文件算成补齐。
- 腾讯云配置存在，但实际接口探测 TLS 报 `wrong version number`，备用区域端点与浏览器请求同样失败；没有成功生成腾讯云音频。`produce-pronunciation-assets.mjs --apply --synthesize` 为后续显式补录入口，需接口恢复后运行；构建不访问凭据、不自动调用付费服务。
- Headless Chrome 中文声线列表为空，因此真实设备 TTS 音色/音准和人工逐条听审没有验收。异步声线加载、拒绝英语/粤语代替、静态失败回退、停止/换读音/换卡、过期回调隔离及可重试错误用注入声线测试覆盖；这不等于实际听审。
- 浏览器发现并修复原 token 练习只返回场景顶部的问题：现在保持原 `#token-id` 并在返回时展开正确释义。

未运行生产部署、未 commit/push、未引入账号/同步/Billing，未制作或重新签收故事。历史 MVP 总门控回执保持原样，本轮不将其旧失败改写为全绿；上述三条用户指定命令和本轮浏览器检查均已实际运行。

## 2026-10-27 Owner 收口签收（当前生效）

- Owner 本轮独立批准机场、酒店、超市共 15 句及真机验收。正文 SHA-256 仍为 `1472b2c4a10d0875bb966b1ccad11dfe62f07c08a41d1ef19dd2563cf7d6788e`，签收元数据绑定该 hash；三个精确路由 published / index,follow。完整生产 Sitemap 为 358 URL。
- [音频正式签收](acceptance/phase-2-hf11-audio-signoff.md)：Owner 已真机试听通过，采用 1268 静态录音 + 设备中文 TTS 平滑回退；57 读音、738 组词句当前不补腾讯云音频。历史 TLS 和补录不再阻塞本期交付，未声称全部音频均为静态 MP3。
- HSK 2.0 已纳入的 86 二级词原样保留；余 64 词为 Deferred / Backlog，后续阶段再处理，与当前验收解耦。
- 本轮最新构建、SEO、全量测试和 UI 浏览器结果见 PROGRESS 最后一条收口记录；上方 159 测试和 355 URL 数值保留为原始工程验收历史。
