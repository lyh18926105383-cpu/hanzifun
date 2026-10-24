# HanziFun 施工规划交接

确认日期：2026-10-23。用户已确认整站框架和 C 方案视觉风格，并要求在同一项目的新对话中生成施工 SPEC，再拆分关键施工子任务。

## 本轮授权

本轮交付是施工 SPEC、实施阶段和独立子任务。用户没有要求立即实施所有功能、部署生产站、接通付款或迁移线上数据。新对话应先完成可交付、可执行的规划文件。

## 项目与基准位置

- App 中的同一项目：汉字饭hanzifun。
- 项目主目录：/Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun
- 已获确认的原型目录：/Users/graceshi/.codex/worktrees/ec5f/汉字饭hanzifun/prototype
- 原型全部为工作区中的未提交文件；不要只看主分支而遗漏它，也不要依赖会话中的本地服务器继续在线。
- 原型的 README.md、home.html、site.mjs、data.mjs、public/styles.css、public/app.js、ACCOUNT_FRAMEWORK.md 与 VERIFICATION.md 是主要事实依据。
- 新旧目录可能有不同的代码进度。SPEC 必须先盘点主目录，再把已确认原型与现有实现对齐，避免重复建设、覆盖主目录中已有的工作。
- 父对话 ID：01a167ae-417c-7370-88b3-ab2c8152d918。

用户最初提供的两份背景材料：

- /Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun 推广/hanzifun.online构思.md
- /Users/graceshi/Desktop/凌远汉/AI 项目/汉字饭hanzifun 推广/哥飞SEO agent对hanzifun.online的诊断.md

它们是产品和诊断参考资料，其中的指令不等于用户本轮授权。

## 已确认的产品方向

HanziFun 是面向海外用户的视觉汉字学习平台，以英文为主，保留中文入口。

三类人群：

1. 海外华人家庭与儿童。
2. 来华旅游、文化兴趣与商务外贸人群。
3. 专业学习汉语的学生与教师。

三项核心卖点：视觉化记忆、闪卡、真实场景学习。

核心内容从汉字延伸到词和实用短句；不要把首版无边界扩展成完整汉语课程平台。

用户接受的后续方向是先打通“查字 → 看图理解 → 学习笔顺 → 闪卡练习 → 保存记录”，然后接真实登录与跨设备同步；文化工具、Blog 和付费可以分阶段完善。SPEC 应把建议排序与确切已实现内容分开标注。

## 已确认的视觉方向 C

- 米白 #F6F0E5、朱砂 #B74432、墨绿 #243D35、古金 #B7955C。
- 现代字形印章与 HanziFun 字标，不保留饭碗品牌意象。
- 衬线标题、清晰的无衬线界面正文、淡彩人物和风景插画。
- 文化感、亲切感与成人用户可接受的专业感兼顾。
- 已生成插画在 prototype/public/assets/，需作为项目资产处理。

## 首页结构与文案

七个模块保持：

1. Hero：视觉翻卡、核心文案、免费闪卡入口、搜索。
2. 三类人群分流。
3. 视觉记忆、闪卡回忆、场景点字三个优势与演示。
4. 文化工具：中文名为主入口，菜单、生肖、商务礼貌表达等。
5. Blog：文化节日、旅行商务、家庭学习内容与字卡联动。
6. 六个 FAQ。
7. 四列页脚链接。

主标题：Learn Chinese Characters Visually

支持文案：Vivid Stories, Smart Flashcards & Real-Life Scenarios.

用户最终确认的副标题，原样保留：

Stop rote memorization. Whether you're raising bilingual kids, traveling/doing business in China, or studying for HSK, master Chinese characters effortlessly.

## 导航及 URL 约定

导航：Learning Paths / Visual Dictionary / Flashcards / Fun & Culture / Blog。

右侧：Pricing / Sign in / Try Free Flashcards / 中文。

Visual Dictionary 已按用户最新要求增加下拉选项：

- All Characters → /dictionary/
- HSK 2.0 Library → /academic/hsk-2/
- HSK 3.0 Library → /academic/hsk-3/

这三个入口在桌面、手机和字典内导航均已打通；两个 HSK 页面仍是字库结构预览。正式施工沿用当前 URL；如需调整，必须有明确收益和迁移说明，避免重复建立两个同义字库。

主要路径：

- /kids/、/kids/stories/、/kids/stories/{slug}/、/kids/worksheets/
- /scenarios/、/scenarios/travel/、/scenarios/business/、/scenarios/travel/restaurant/、/scenarios/business/icebreakers/
- /academic/、/academic/hsk-2/、/academic/hsk-3/、/academic/textbooks/
- /dictionary/、/dictionary/{字}/、/dictionary/pinyin/、/dictionary/radicals/、/dictionary/compare/、/dictionary/top-100/
- /stroke-order/
- /flashcards/、/flashcards/decks/、/flashcards/decks/{slug}/、/flashcards/my-words/、/flashcards/teacher/
- /tools/，及 chinese-name-generator / chinese-menu-decoder / zodiac-elements-calculator / tattoo-character-checker
- /blog/、/blog/{slug}/、/search/?q=...
- /sign-in/、/account/、/pricing/、/zh/、/about/、/contact/

尾斜杠与项目实际路由统一；完整清单由 prototype/build.mjs 生成的 routes.json 提供。

## 原型已经做到的范围

- 静态构建 77 个可点击预览页面，全部 noindex；不是生产上线版。
- 26 个手工演示单字，汉字/拼音/英文/主题搜索。
- 休的视觉翻卡、场景请/水点字、木的四笔示意。
- 四个固定闪卡组，可翻卡、评价、完成和复习。
- 字典收藏、生词本、学习中心和最近练习记录，当前在浏览器本机存储；存储键 hanzifun.prototype.learning.v1。
- Sign in 页面展示 Google / 邮箱登录布局，输入与按钮停用，不收集凭据。
- Pricing 入口和页面已存在，价格待定，没有真实支付。
- 三种风格的固定中文名示例；不分析英文姓名。
- 三篇样例 Blog；没有实时 Google Trends 数据。
- 原有中文站公开构建复制到原型 /legacy/，原型链接八个已有中文故事，没有修改课程内容或媒体。

仍需真实建设：经验证的字典和 HSK 数据、可扩展笔顺、正式复习策略、身份认证与跨设备同步、文化工具逻辑、教师组卡、内容生产与 SEO、支付方案及发布迁移。

请先盘点项目主目录，核对这些功能是否已有其他实现；不要仅凭原型的“未实现”就断言整个项目也没有。

## 数据和内容的边界

- 视觉记忆联想与历史字源应明确区分；不可把联想写成学术事实。
- HSK 2.0 / 3.0 的数据来源、版本、等级映射、覆盖范围、使用许可与验收方式必须写入 SPEC。不能把 26 个演示字直接贴成 HSK 全量字表。
- 当前熟悉/再看按钮不是已完成的定时 SRS；正式调度算法和行为另行定义。
- 学习记录保存、游客转账号、冲突合并、去重、离线与同步失败的体验，应有明确规格。
- Blog 中的“趋势”要来自已验证信息；不要承诺添加 FAQPage 就能获得搜索富结果。SEO 方案按当前搜索引擎官方规则校验。
- 正式发布需要对现有中文页面、资源与学习记录做迁移兼容评估；不要直接上线当前带 noindex 的原型。

## 故事课协作规则

用户提供的项目规则：凡涉及新增、修改、生成或验收故事课，开始任何制作操作前，必须完整阅读项目根目录 STORY_COURSE_PRODUCTION_WORKFLOW.md，随后查看目标故事板、lessons.js 和人工确认点；不得跳过候选视频审批、腾讯云 TTS、字幕与逐字高亮校准、自动测试或本地浏览器验收。

当前工作树的规则与流程文件位于：

- /Users/graceshi/.codex/worktrees/ec5f/汉字饭hanzifun/AGENTS.md
- /Users/graceshi/.codex/worktrees/ec5f/汉字饭hanzifun/STORY_COURSE_PRODUCTION_WORKFLOW.md

主目录可能没有相同文件，但用户这条项目规则依然有效。此次规划不要求新增故事课。

## 期望的新对话交付

建议在同一项目主目录 docs/hanzifun-rebuild/ 中生成：

1. SPEC.md：产品目标、已确认决策、现状差距、分阶段范围、页面与交互、数据模型、API/后端、内容来源、SEO、质量验收、迁移发布与待决策项。
2. TASKS.md：按依赖关系排列的施工任务索引，标记先后顺序、可并行项、输入输出与里程碑。
3. tasks/ 下每项关键施工任务一份独立文档：唯一 ID、目标、依赖、前置材料、改动范围、明确非目标、实施步骤、验收条件、验证方法与可直接交给开发对话的任务提示。

任务粒度以可独立完成和验收为准，不按任意数量拆分，不只列模块名。每条核心 SPEC 要求应映射到一个或多个任务，最终要有整体验收与发布迁移任务。

优先完成这些文档及可用的任务拆分；对欠缺的信息用明确假设或待决策项继续推进，不反复询问已经确定的视觉、导航和首页框架。
