# Phase 2 · Batch A 负责人教学内容签发

记录日期：2026-10-27。负责人声明的实际审核日期：**2026-10-26**。

## 授权依据与范围

本轮用户明确声明：“我已经亲自审阅并确认了下方 Batch A（54 个汉字）的全部自研教学内容（包含 meaning、word、wordPinyin、wordMeaning、sentence、pinyin、translation、mnemonic）。”并要求“humanAcceptance: approved，日期2026-10-26”，计算绑定hash后经review-release-batch转正。这里登记该明确声明，审核人为 Project owner (user)，不是冒充Codex替负责人进行人类审核。

原文数据完整保存在 `data/editorial/phase2/batch-a.psv`，54行、每行9列，以 | 分隔；八项教学文字原样保留，不静默改词、拼音、句子或助记。文本SHA-256：`2b769d2de19979db549cef32329693d5340960291394ab10d7fa6d37544694eb`。

字表：学 儿 子 天 上 下 不 好 有 那 午 们 小 一 这 么 大 个 字 年 在 多 少 家 书 你 时 我 的 对 分 汉 今 国 去 人 他 她 爱 八 爸 打 二 作 工 后 会 叫 九 来 了 六 妈 吗。

## 读音和形体落实

常用教学读音映射及逐字结构说明保存于 `data/editorial/phase2/batch-a-review.json`。好hǎo、少shǎo、分fēn、会huì、了le、的de、吗ma、么me；子采用孩子中的轻声zi（zi5），儿采用ér而不是儿化r；一/不保留词典本调yī/bù，原句yí/yì/bú保留连读变调。全部readingId从锁定源字读音中选择，不造新ID，不删其他读音。

形体核实是Codex对锁定MMH可见布局与按字笔顺记录的编辑层核对，记录实际日期2026-10-27、审读者及部件/笔顺hash；不是负责人2026-10-26人工视听的新增声明。未知部件保留原始incomplete数据，编辑层只描述可见笔画/结构，不补造IDS或字源。助记与形体事实分开显示，提示记忆联想不是历史字源。源字/笔顺/核心126不改写。

## 哈希与发布

`docs/hanzifun-rebuild/evidence/hf10/batch-a-release.json`保存逐字正式决策；每个hash绑定完整源字、全部关联读音、本条教学（含结构核实）、笔顺及sources.lock。审批文件由注入后内存候选精确计算，再经现有review-release-batch默认dry-run和显式apply校验。事后正文或结构改动使签字失效，不能复用本次签字。

本声明批准54字文本内容与该批发布放行；没有新增音频/听审、故事课制作、生产部署或git push授权。缺音继续不可播；生产构建的index,follow不等于已部署线上。未完成的B/C/D各53字继续preview。
