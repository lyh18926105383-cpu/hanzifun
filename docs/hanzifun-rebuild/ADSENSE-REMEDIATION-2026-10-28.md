# HanziFun AdSense 整改方案与复检清单

日期：2026-10-28（Asia/Singapore）。本次在 `/Users/graceshi/.codex/worktrees/6039/汉字饭hanzifun` 修改；属于本地候选，未部署、未操作 AdSense 后台、未宣称 Google 批准。以用户提供的预检报告为线上问题证据；本轮在线页面读取未成功，未声称重新抓取线上全站。

## 先校正报告的判定口径

- `ADS-*` 是该预检工具的要求编号，不是 Google 官方逐条编号。“Blocker 必被拒”“几乎必拒”是工具推断，不能当成 Google 的个案审核结论。
- Google 的[申请资格](https://support.google.com/adsense/answer/9724?hl=en)及[页面准备指南](https://support.google.com/adsense/answer/7299563)强调原创价值、相关性、易用导航；这些页面没有给出每页 800 词、60–80 页、200 或 300 字页的通过线。800–1500 词是本次用户指定的编辑目标，应按独有正文计数，避免用导航或通用字典数据凑数。
- 同一预检表既称内容量充足，又以模板化低价值判 Fail，说明需要人工内容判断。标题模板、公共数据或 AI 辅助本身不能证明违规；缺少新增解释价值才是需要解决的问题。
- [ads.txt 官方指南](https://support.google.com/adsense/answer/12171612?hl=en)说明它不是强制要求，但强烈建议。没有真实 pub-ID 时不要发布假授权行。
- [认证 CMP 要求](https://support.google.com/adsense/answer/13554116?hl=en)涉及 EEA、英国和瑞士的个性化广告；[同意政策实施说明](https://support.google.com/adsense/answer/7670013?hl=en)还涉及依法对 Cookie/本地存储取得同意。不能把“目前无广告也无 CMP”直接等同于全球统一拒审。非个性化广告也不自动免除存储同意义务。
- Terms 是建议补齐的信任页，不能据此声称 Google 对所有站点一律要求独立条款页。Google 对隐私政策中的[广告 Cookie 披露](https://support.google.com/adsense/answer/1348695?hl=en)则有明确要求。

## Blocker：原创内容价值、隐私披露与整体资格

### ADS-CONTENT-01 / ADS-ELIG-03

已实现：

| 页面 | 成品源文件 | 内容变化 |
|---|---|---|
| `/scenarios/` | `site/content/adsense/scenarios.html` | 成型学习指南：目标选择、完整三轮对话、拼音/英译/音频、修复交流的句子、五场景路径、词与字区别、复习安排、5 个自测 |
| `/dictionary/快/` | `site/content/adsense/kuai.html` | 速度与“快要”的区别、快/块对比、现代部件、3 个例句音频、写法与声调、检索练习 |
| `/dictionary/六/` | `site/content/adsense/liu.html` | 数量/时间/日期/编号、六/十六/六十、liù 与地名 lù、六/穴对比、3 个例句音频、自测 |
| `/dictionary/星/` | `site/content/adsense/xing.html` | 星星/星期、星期日/星期天、星/醒与声调、现代结构、3 个例句音频、自测 |
| `/blog/chinese-character-study-routine/` | `site/content/adsense/study-routine.html` | 完整短时学习方案：目标、形音、写法、语境、检索、复习、保存及 5 个自测 |
| `/blog/chinese-character-confusions/` | `site/content/adsense/confusions.html` | 完整辨析方法：视觉/声音/语境三类错误，3 对实例、比较卡、练字、自测 |

`site/editorial-content.mjs` 负责读取上述静态成品、绑定现有音频按钮并输出指南页面；`scripts/build-site.js` 接入路由、静态正文、面包屑。正文在无 JS 时可读，折叠答案使用原生 details；例句使用现有录音/中文设备语音回退，没有宣称新录音或新增逐条人工听审。现代构形与原创助记明确分开，不编造甲骨文演变。本次是补充讲解；原教学数据、课程、音频资产与历史签字未改，新正文不冒用旧人工审核范围。

全站 339 个单字页中，336 页仍未达到本次 800 词编辑目标，详见 `evidence/adsense-2026-10-28/content-audit.json`。这不是自动判定 336 页违规。后续逐页审读，再决定扩写、合并或暂不索引；不按词数直接把已批准词条全部下线。

具体后续制作顺序：

1. 先做日常任务涉及的高频字：人/口/日/月/水/火/木/山/大/小/上/下/中/天/好/学/生/你/我/他；以现有稳定 characterId 和 URL 写入补充讲解，不重造底层条目。按已锁定 HSK 清单核对成员资格，不把任意字表叫“官方 300 字”。
2. 逐页写 800–1500 词独有讲解：约 100 词说明学习目标；150–200 词讲现代结构与读音；150–250 词讲 2–3 个常用词和语法；200–300 词解释 3 个有语境的例句；150–200 词辨析和错误修正；100–150 词练习与答案。结构可以统一，论述、例句、对比和问题必须按字原创。无可靠历史资料就不写历史字源。
3. 场景叶页优先顺序：`/scenarios/travel/restaurant/`、`/scenarios/travel/airport/`、`/scenarios/travel/hotel/`、`/scenarios/travel/supermarket/`、`/scenarios/business/icebreakers/`。每页独立 800–1500 词，围绕一项任务写 6–10 轮完整对话，逐句解释、替换练习、听不懂时的修复句、实际文化差异和 5 个题；现有机场/酒店/超市签字只覆盖原 15 句，新增对话须另行复核，不能复用旧 hash 冒充人工批准。
4. `/scenarios/travel/` 和 `/scenarios/business/` 按路线规划和沟通准备写成各自 800–1200 词的入口教程，避免把同一个卡片网格复制三遍充当正文。
5. HSK 保留目前的版次/分母说明与二级 86/150 子集事实。新增《HSK 2.0 与 3.0 如何选版》《量词：个、本、杯》《一/不变调与词典本调》各 1000–1500 词、5 题，与对应字页及场景互链。不要把剩余 64 词或高级别目录写成已完整覆盖。
6. 文化工具仍处于预览时，不把结果页、样板文章或空工具当作可投广告资产。每个工具先补 1200–1500 词独立说明，含使用边界、资料来源、案例和常见误解，功能实测后再申请开放索引。

质量不够的页面可以在 `site/release.json` 将**精确路由**改为 `preview`，构建会输出 `noindex,follow` 并从 Sitemap 排除。保留 robots 可抓取；不要用 Disallow 挡住 noindex。noindex 不会把公开低价值内容变得合规，审核员仍可访问；确无实际价值的占位入口应从导航移除或先完成正文。不得用 noindex、迁到子域名等方式掩盖违规内容。本次没有按字数批量改动现有字页索引。

### ADS-PRIV-01

已完成英文隐私政策、条款、About、Contact 的可构建正文，统一在 `site/pages/trust.mjs` 维护；页脚在 `site/site.mjs`。政策包含：浏览器本地学习记录、删除/导出、Cloudflare 页面交付、音频可能使用在线设备声线、广告尚未启用、未来 Google/合作方 Cookie、广告偏好退出、地区同意、儿童、权利请求及更新日期。

**Owner 已提供身份信息（2026-10-28）**：`site/publisher.json` 已写入运营署名 **John Ling**、联系邮箱 **hanzifun.online@gmail.com**。四个信任页统一呈现该署名和可点击的 mailto 联系入口；Contact 不再显示缺少公开地址的提示。四个精确路由已改为 published，本地生产候选输出 index,follow 并进入 Sitemap。信息来源是 Owner 本次明确提供；没有代发测试邮件或宣称独立验证邮箱所有权/收信能力，也未部署到线上。

隐私政策中的广告披露成品位于 “Cookies, third-party vendors and Google advertising” 小节。明确当前没有 Google 广告，再说明启用后的 Cookie 使用、既往访问与个性化广告，并链接 My Ad Center 和第三方退出工具。不能把将来可能使用的分析工具写成已经在收集，也不能在接入广告后继续声称当前无广告。

## High：第三方 Cookie、导航和儿童处理

### ADS-PRIV-02

`site/pages/trust.mjs` 已补 Google 及其合作方的广告 Cookie/标识符披露和退出链接。正式开启广告时还要在政策和 CMP 中列明实际选择的第三方供应商、用途及相应链接，完成后测试同意、拒绝、撤回三个状态。政策文本不是同意记录。

### 导航和推广密度

`site/site.mjs`、`src/client/navigation.mjs`、`site/public/site-styles.css`：桌面与手机共用同一个 nav；移动端显示/隐藏同一棵树，不再把两份菜单都写进 HTML。保留键盘、Escape 返回焦点、窗口变化与无 JS 浏览。主导航移除尚未开通的 Sign in / Pricing 及重复推广按钮。首页仅保留一处 “Try Free Flashcards” 主转化文案，中段入口改为学习方法指南。字页和场景有面包屑。页脚包含 Privacy Policy / Terms / About / Contact / Sources。

### ADS-PRIV-04 / ADS-PRIV-06

- 当前全站没有广告请求。不要为通过扫描放一个无实效的自制 Cookie 横幅。
- 开广告前，在 AdSense 的 Privacy & messaging 或当前可用的认证 CMP 中创建适用地区消息，绑定本站、政策 URL、供应商与拒绝/管理选择，发布后在 EEA/UK/Switzerland 实际验证。用户未同意前不要发需要同意的个性化广告请求。非个性化请求也需按实际 Cookie/存储行为核对同意义务。
- 儿童内容不仅是 `/kids/`：还要检查 `/zh/`、`/story`/`/story.html`、故事播放器和可打印儿童素材。当前策略是这些区域不加载广告。若未来开放，按官方当前[网站/请求年龄处理](https://support.google.com/adsense/answer/17042704?hl=en-GB)及[儿童网站指定工具](https://support.google.com/policies/answer/9664901?hl=en)核对 TFAT/网站标记，关闭个性化和再营销，测试实际请求。不要照搬 Ad Manager 的示例当作 AdSense 代码。
- 年龄提示、声称“给家长看”、改子域名均不会自动改变内容的儿童导向性质。是否需要网站级/区域级标记取决于实际内容和受众，不能用简单年龄门逃避处理。

## Medium：ads.txt 和信任页

### ADS-TXT-02 / ADS-PUB-09

`site/adsense.mjs` 和构建已支持真实 ID：把 `site/publisher.json` 的 `adsensePublisherId` 填为后台实际 `pub-` 加 16 位数字，再构建，根目录会生成：

```text
google.com, pub-你的真实16位数字, DIRECT, f08c47fec0942fa0
```

上面是说明模板，**不能原样上传**。空 ID 不生成文件；明显占位/格式错误直接拒绝构建；不会为此加载广告。后台复制的完整授权行如与示例不同，以自己账号提供的行核对实际关系。发布后检查 `/ads.txt` 为 200、纯文本、无登录/HTML/跳转链，ID 与账号相同，再在后台请求检查。不要填 ca-pub 前缀，也不要复制别人的 ID。

### ADS-UX-05

信任页正文及页脚已实现，Owner 提供的 John Ling / hanzifun.online@gmail.com 已接入四页并在本地候选中开放索引。部署后须从任意抽样页面点进这四页，并由 Owner 确认邮箱可实际收信。Terms 不替代 Privacy；About 不应虚构老师、公司地址、资质或人工审稿经历。

## 18 项 Unknown：逐项确认方法

在私人核对表中保存证据，不要把身份证、支付资料、完整账号页面截图或密钥提交到 Git。

| ID | 怎么确认 | 可接受的确认记录 |
|---|---|---|
| ADS-ELIG-01 | 看真实申请人出生日期是否满18；未成年由父母/监护人用其自己的账号及收款身份申请 | 记录“成年/监护人管理”，不保存证件副本到站点 |
| ADS-ELIG-02 | 检查自己常用 Google 账号、历史 AdSense/YouTube 变现邮件；已有账号就在其中加站 | 记录唯一发布商账号及是否曾申请；查不到不等于确认无历史账号 |
| ADS-OWN-01 | 本地已可改 `site/layouts/base.html` 的 head；还要确认有当前生产构建/部署权限 | 部署一次真实验证代码后，在线上原始 HTML 搜索该代码；仓库权限不等于部署权限 |
| ADS-OWN-02 | 登录域名注册商及 Cloudflare，确认自己有域名控制和 DNS 修改权限 | 私人记录注册商、到期日和有权限的账号；不要只凭源码远端断言所有权 |
| ADS-SITE-01 | 在 AdSense Sites 查 hanzifun.online；添加、验证、请求审核、等待 Ready | 保存实际状态与日期；“已提交/Getting ready”不是“通过” |
| ADS-SITE-02 | 按自己后台显示的代码/meta/ads.txt 选一个；构建并部署到指定位置 | 线上 GET 可见实际验证值，后台显示已验证；不要假定每个账号都有完全相同的三种选项 |
| ADS-PROG-01 | 自己、家人、协作者不点击本站广告；不用自动化刷展示，不让测试脚本滚动真实广告页刷量 | 向参与者明确规则；验证广告使用官方允许的检查方式 |
| ADS-PROG-04 | 查 Cloudflare/现有统计、Search Console 及推广订单，审视来源、国家、异常访问峰值 | 能说明主要来源且没有 PTC/互点/垃圾引流；付费引流本身不等同作弊 |
| ADS-PROG-06 | 建立广告路由白名单并检查 Auto ads 排除项 | 首批只投已审内容页；不投登录/账号/搜索结果/空工具/预览/儿童区域；脚本未加载与无广告请求都要查 |
| ADS-PUB-09 | 核对后台发布商资料、域名、真实 pub-ID、ads.txt DIRECT关系一致 | 实际账号与根文件匹配；当前缺ID，不能标通过 |
| ADS-PRIV-03 | 开广告后检查 URL/query、dataLayer、自定义字段、网络请求及 Referer 是否含邮箱/电话/姓名等可识别信息 | 不发送 PII；不能只隐藏页面上的输入框，也不能认为散列邮箱当然可发送 |
| ADS-PRIV-04 | 在 EEA/UK/Switzerland 的适用环境验证认证 CMP 的同意、拒绝、撤回及持久入口 | 消息已发布、信号/请求符合选择；没有横幅截图不能证明时序正确；当前未接广告/CMP |
| ADS-PRIV-05 | 搜 `geolocation`、定位SDK、权限请求；浏览学习流程是否请求精确定位 | 不收集则记录N/A；IP估算国家与浏览器精确定位区分；若新增需明确用途和事前同意 |
| ADS-PRIV-06 | 逐路由确定儿童导向，包含故事和中文入口；检查年龄处理及广告排除 | 当前无广告；未来按最新AdSense适用工具标记，禁用个性化/再营销；年龄提示不替代处理 |
| ADS-PRIV-07 | 检查自写广告代理、反代、Cookie改写和浏览器请求的Set-Cookie来源 | 没有此类自定义改写则记录N/A或已核对；不是“浏览器根本不能这样做所以不用查” |
| ADS-PRIV-08 | 看 Ads/Analytics 的受众来源、再营销列表、自定义事件，不用健康/宗教/性取向等敏感属性建定向受众 | 无受众营销则记录当前N/A；将来开启重新核对，不把学习数据导入广告受众 |
| ADS-PRIV-09 | 确认自己是否作为广告主在美国/加拿大投住房、就业、信贷广告并做属性定向 | 普通发布商本站未开展该业务则N/A；开展时按相应广告主规则核对，不能与单纯展示第三方广告混为一谈 |
| ADS-PRIV-10 | 开个性化广告前核对数据来源、使用权限、政策披露、CMP供应商与用户选择 | 披露和实际请求一致；目前未启用不能冒称已取得所有未来同意 |

其中账号后台“已通过审核”不是递交前可以完成的条件；按“可提交”“审核中”“通过后投放”分别记录，避免循环要求先通过才准申请。

## 整改后复检清单

### 本地内容和技术

- [x] Owner 提供的运营主体和邮箱已填 `site/publisher.json`，四信任页显示 John Ling / hanzifun.online@gmail.com，Contact 不再提示缺少渠道（本地候选）。
- [ ] Owner 确认邮箱可实际收信；本轮未代发测试邮件。
- [ ] Privacy 明确当前/未来状态，含 Cookie、Google/第三方、退出、儿童、存储、删除、联系方式；实际引入服务后同步更新。
- [ ] About 不夸大身份/背书/审核；Terms 与开通功能一致；四信任页内容和页脚均可访问。
- [ ] `/scenarios/`、“快/六/星”、两篇指南逐段人工读过：解释自然、例句准确、拼音与英译一致、助记非字源。
- [ ] 其余336字页按清单继续做深；五个场景叶页和两个场景子入口完成各自原创讲解；不拿本轮六页当作全站已经整改。
- [ ] 需要下调索引的精确页已设置 preview，Sitemap 排除且 robots 允许读取 noindex；公共占位入口移除或补完，无伪404。
- [ ] 桌面/手机只有一套主导航；菜单按钮、Tab、Escape、窗口切换和无JS正常；内容无横向溢出。
- [ ] 首页主CTA不重复轰炸；信任页链接在页脚；正文实质内容尽早出现。
- [ ] 字页/场景/指南双向链接有效，无链接指向不存在的“穴/醒”词条。
- [ ] `npm test`、生产构建、SEO门控、本轮内容审计通过；查看测试失败原因，不放宽断言凑绿。

### 部署后、提交申请前

- [ ] 实际部署本候选；线上首页、六内容页、四信任页HTTP200，unknown URL真404；源HTML正文/robots/canonical与候选相符。
- [ ] 隐私页在首页及任意抽样内页可一键进入，页面没有临时预览声明或虚构联系方式。
- [ ] Sitemap 只有真实批准成熟页面；Search Console 提交/检查；可抓取不等于Google已收录。
- [ ] 实测播放新例句并抽查手机，确认中文设备语音的实际可用性，不把自动绑定当作真人听审。
- [ ] 18项Unknown逐条改为“已确认/当前N/A/具体待办”，保存私人证据；申请人、唯一账号、域名控制和部署权限明确。
- [ ] 在自己AdSense账号加入域名、部署真实验证值；记录审核状态，不伪称通过。

### 开始投放前及投放后

- [ ] 真实pub-ID已填，`/ads.txt`200纯文本、无占位值，后台检查授权成功。
- [ ] 必要地区认证CMP已发布并测试同意/拒绝/撤回，政策和供应商名单匹配；拒绝后不会错误发送需同意的请求。
- [ ] Auto ads与手动位均有路由限制，儿童/故事/账号/搜索/预览/空功能页不出广告。
- [ ] 广告不遮挡导航/正文、无误导点击、无PII传入，无自身点击/测试刷量。
- [ ] 定期检查Policy center、广告请求、异常流量及实际用户反馈。工具复检通过仍不是Google审核保证。

## 复跑命令

```sh
HF_BUILD_OUTPUT_DIR=/private/tmp/hanzifun-adsense-build npm run build:production
npm test
HF_BUILD_OUTPUT_DIR=/private/tmp/hanzifun-adsense-build node scripts/validate-seo-quality.mjs
HF_BUILD_OUTPUT_DIR=/private/tmp/hanzifun-adsense-build node scripts/audit-adsense.mjs
HF_BUILD_OUTPUT_DIR=/private/tmp/hanzifun-adsense-build node scripts/verify-adsense-browser.mjs
```

当前工作树的 HF12 源复现测试依赖 `.cache/hf07/HSK-2015.xlsx` 和 `.cache/hf02/cedict.gz`（均不入Git）。本轮从已有主目录复制缓存，先按 `data/sources.lock.json` 核对 SHA-256，没有重新下载或改写上游内容。新机器应按现有源获取流程恢复同版缓存，不能跳过源复现测试。

实际执行结果以同目录证据及 PROGRESS 最新记录为准，不把文档中的复检框当作已通过。
