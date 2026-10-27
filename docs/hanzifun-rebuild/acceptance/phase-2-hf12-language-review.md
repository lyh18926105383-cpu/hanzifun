# HF-12 Phase 2 新场景语言签收包

2026-10-27。工程与 AI 逐句快审已完成；人工语言签收 **pending**。本包不继承 Phase 1 的餐厅/商务签字。以下三组均可本地预览、保存和练习，暂不进 Sitemap。

场景正文 SHA-256（JSON.stringify(scenarios) UTF-8）：`1472b2c4a10d0875bb966b1ccad11dfe62f07c08a41d1ef19dd2563cf7d6788e`。

## Airport transport in Chinese

本地路径：`/scenarios/travel/airport/`

| 中文 | 拼音 | 英译 | 人工确认 |
|---|---|---|---|
| 飞机几点到？ | Fēijī jǐ diǎn dào? | What time does the plane arrive? | ☐ |
| 请问，出租车在哪儿？ | Qǐngwèn, chūzūchē zài nǎr? | Excuse me, where are the taxis? | ☐ |
| 我想去市里。 | Wǒ xiǎng qù shì lǐ. | I would like to go into town. | ☐ |
| 到饭店多少钱？ | Dào fàndiàn duōshao qián? | How much is it to get to the hotel? | ☐ |
| 谢谢，再见。 | Xièxie, zàijiàn. | Thank you. Goodbye. | ☐ |

## Hotel check-in in Chinese

本地路径：`/scenarios/travel/hotel/`

| 中文 | 拼音 | 英译 | 人工确认 |
|---|---|---|---|
| 您好，我要一个房间。 | Nín hǎo, wǒ yào yí ge fángjiān. | Hello, I would like a room. | ☐ |
| 我想住两天。 | Wǒ xiǎng zhù liǎng tiān. | I would like to stay for two days. | ☐ |
| 房间多少钱？ | Fángjiān duōshao qián? | How much is the room? | ☐ |
| 有早饭吗？ | Yǒu zǎofàn ma? | Is breakfast available? | ☐ |
| 我明天回家。 | Wǒ míngtiān huí jiā. | I am going home tomorrow. | ☐ |

## Supermarket shopping in Chinese

本地路径：`/scenarios/travel/supermarket/`

| 中文 | 拼音 | 英译 | 人工确认 |
|---|---|---|---|
| 超市在哪儿？ | Chāoshì zài nǎr? | Where is the supermarket? | ☐ |
| 我想买牛奶。 | Wǒ xiǎng mǎi niúnǎi. | I would like to buy milk. | ☐ |
| 鸡蛋多少钱？ | Jīdàn duōshao qián? | How much are the eggs? | ☐ |
| 这个太贵了。 | Zhège tài guì le. | This is too expensive. | ☐ |
| 有便宜的吗？ | Yǒu piányi de ma? | Do you have a cheaper one? | ☐ |

签收时记录真实审核者、日期、证据与本包正文 hash；同时核对 token 释义和 饭店/两天/哪儿 的语境说明。确认早餐是否包含需另问价格；有早饭吗只问是否提供早餐。通过后只放行这三个精确路由，并重跑 build/test/SEO。不得复制旧负责人签字或把 AI 审读写成人工验收。
