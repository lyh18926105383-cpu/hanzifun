# HF-12 Phase 2 新场景语言签收包

2026-10-27。Owner 已在本轮指令中正式声明独立人工语言审核与真机验收全部合格，签收 **PASS / approved**。审核者：Project owner (user)；日期：2026-10-27（Asia/Singapore）；证据：本轮 Phase 2 收口正式决策，明确覆盖三个场景共 15 句及 token 释义、语境说明。本包独立于 Phase 1 的餐厅/商务签字，正文未修改。三个精确路由已转为 published / index,follow，纳入生产构建 Sitemap。

场景正文 SHA-256（JSON.stringify(scenarios) UTF-8）：`1472b2c4a10d0875bb966b1ccad11dfe62f07c08a41d1ef19dd2563cf7d6788e`。

## Airport transport in Chinese

本地路径：`/scenarios/travel/airport/`

| 中文 | 拼音 | 英译 | 人工确认 |
|---|---|---|---|
| 飞机几点到？ | Fēijī jǐ diǎn dào? | What time does the plane arrive? | ✓ Owner approved |
| 请问，出租车在哪儿？ | Qǐngwèn, chūzūchē zài nǎr? | Excuse me, where are the taxis? | ✓ Owner approved |
| 我想去市里。 | Wǒ xiǎng qù shì lǐ. | I would like to go into town. | ✓ Owner approved |
| 到饭店多少钱？ | Dào fàndiàn duōshao qián? | How much is it to get to the hotel? | ✓ Owner approved |
| 谢谢，再见。 | Xièxie, zàijiàn. | Thank you. Goodbye. | ✓ Owner approved |

## Hotel check-in in Chinese

本地路径：`/scenarios/travel/hotel/`

| 中文 | 拼音 | 英译 | 人工确认 |
|---|---|---|---|
| 您好，我要一个房间。 | Nín hǎo, wǒ yào yí ge fángjiān. | Hello, I would like a room. | ✓ Owner approved |
| 我想住两天。 | Wǒ xiǎng zhù liǎng tiān. | I would like to stay for two days. | ✓ Owner approved |
| 房间多少钱？ | Fángjiān duōshao qián? | How much is the room? | ✓ Owner approved |
| 有早饭吗？ | Yǒu zǎofàn ma? | Is breakfast available? | ✓ Owner approved |
| 我明天回家。 | Wǒ míngtiān huí jiā. | I am going home tomorrow. | ✓ Owner approved |

## Supermarket shopping in Chinese

本地路径：`/scenarios/travel/supermarket/`

| 中文 | 拼音 | 英译 | 人工确认 |
|---|---|---|---|
| 超市在哪儿？ | Chāoshì zài nǎr? | Where is the supermarket? | ✓ Owner approved |
| 我想买牛奶。 | Wǒ xiǎng mǎi niúnǎi. | I would like to buy milk. | ✓ Owner approved |
| 鸡蛋多少钱？ | Jīdàn duōshao qián? | How much are the eggs? | ✓ Owner approved |
| 这个太贵了。 | Zhège tài guì le. | This is too expensive. | ✓ Owner approved |
| 有便宜的吗？ | Yǒu piányi de ma? | Do you have a cheaper one? | ✓ Owner approved |

签收已绑定上述正文 hash（包含三组完整 context、句子、拼音、英译及 token）。Owner 本轮独立签收同时覆盖 token 释义和 饭店/两天/哪儿 的语境说明。确认早餐是否包含需另问价格；有早饭吗只问是否提供早餐。仅放行这三个精确路由；构建门控检查独立签名是否仍匹配当前正文，编辑正文后须重新签收。构建、SEO、全量测试结果见本轮交接记录。
