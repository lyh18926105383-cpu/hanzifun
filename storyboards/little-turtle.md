# 第四个故事课：《小乌龟》10 秒视频故事板

## 预定课程信息

- 课程序号：第四课
- 课程 ID：`little-turtle-04`
- 课程标题：`小乌龟`
- 课程主题：`动物本领`
- 首页图标：`🐢`

## 制作目标

- 使用 Gemini 一次生成一条完整视频
- 总时长：严格控制在 10 秒
- Gemini 生成画幅：竖版 9:16，所有关键动作位于中央 4:5 安全区
- 正式成片：用户批准候选后裁切为 720×900、4:5
- 形式：单场景、单个连续镜头，不切镜
- Gemini 不生成旁白、角色对白或其他人声；允许轻柔、自然且不抢叙事的环境音和动作音效
- 中文旁白继续使用项目现有的腾讯云 TTS 单独生成，并在网页播放时与视频同步

本课参考图是拍摄的四格印刷页面，主要用来确定小乌龟的绿色硬壳、浅黄色头颈和短脚，以及柔和的儿童绘本画风。视频不复刻书页、四格布局、标题、序号或“100”等印刷内容。

为适配 10 秒，本课把知识童谣改成一个容易看懂的连续小情节：小乌龟在草地上走，展示长脖子、短脚和硬壳；一颗松果滚近时，它缩进壳里保护自己；危险过去后，它平安探头，开心地继续走。长寿知识由旁白直接讲清，不在视频中生成容易变形或误写的年龄数字。

## 本课学习字

```text
龟、脖、壳、安、事、命
```

六个学习字都真实出现在最终旁白中，且不重复。

## 腾讯云 TTS 旁白稿

旁白不交给 Gemini 生成。候选视频经用户人工批准后，再使用项目现有的腾讯云 TTS 流程生成独立 MP3。

建议的正式口语化旁白：

> 小乌龟，脖子长，背上有硬壳。遇到事情就缩头，平平安安。它的寿命很长！

这版比原童谣更接近 3—6 岁儿童的日常口语，保留了“外形—硬壳保护—长寿”三个核心知识点，并包含全部学习字：

```text
龟、脖、壳、安、事、命
```

候选视频通过后，正式生成优先沿用：

- 腾讯云音色：`502007`
- 语速：`-1`（实测可在 10 秒内清楚读完）
- 编码：MP3
- 采样率：24000 Hz

腾讯云实测旁白时长为 9.696 秒，能在 10 秒内自然读完，并给结尾保留约 0.30 秒清楚画面。没有通过修改视频速度追逐旁白。

## 10 秒动作时间线

| 时间 | 画面动作 | 故事信息 |
|---|---|---|
| 0.0—3.0 秒 | 一只小乌龟在草地上慢慢走两步，抬头伸出长脖子；绿色硬壳和四只短脚清楚可见 | 展示长脖子、短脚和硬壳 |
| 3.0—5.2 秒 | 一颗小松果从旁边缓缓滚来，在小乌龟前方停住；小乌龟受到轻微惊吓 | 遇到一件小意外 |
| 5.2—7.5 秒 | 同一只小乌龟把头、脖子和四只脚完整缩进硬壳；壳留在原地，松果不再移动 | 硬壳保护身体 |
| 7.5—10.0 秒 | 小乌龟先探出头，再伸出四只脚，确认安全后微笑着继续向前走 | 平平安安，清楚收尾 |

## 固定的画面布局

- 使用一片温暖、开阔的春日草地，背景有少量小花、灌木和远处柔和山坡。
- 小乌龟始终位于画面中央附近，全部动作落在中央 4:5 安全区。
- 松果从画面侧面滚入，但只移动很短距离，并停在小乌龟前方。
- 使用稳定中远景，同时看清小乌龟的完整身体、硬壳和松果。
- 摄影机不追踪、不旋转、不缩放，不使用转场或蒙太奇。

## 角色与画风锚点

小乌龟是一只原创的圆润卡通乌龟：深绿色椭圆硬壳，壳面有几块浅绿色圆润甲片；浅黄色的小脑袋和长脖子，粉红脸颊，四只短而粗的小脚，不穿衣服。头、脖子和四只脚可以自然、完整地缩进壳里，随后仍以完全相同的形态重新伸出。

画面采用原创儿童绘本动画风格：手绘水彩与水粉质感、柔和纸张纹理、清新的绿色草地、温暖日光、圆润造型和清楚表情，适合 3—6 岁儿童。参考图只用于理解角色特征、比例、配色和画风，不复制原图的具体构图或印刷内容。

## Gemini 一次生成提示词

下面这一段作为完整提示词一次性提交，不拆分：

```text
Create a new, original children's animation using the attached photographed
illustration only as visual reference for the little turtle's dark-green oval
shell, lighter rounded shell plates, pale-yellow head and long neck, four short
legs, pink cheeks, rounded proportions, fresh meadow colors and soft watercolor
picture-book feeling. Do not copy or reproduce the printed page, exact artwork,
panel layout, borders, title, numbers, page marks or any text.

Create one continuous 10-second vertical 9:16 video. Keep every important action
inside the central 4:5 safe area for later cropping. Use one stable medium-wide
shot in the same warm spring meadow. No cuts, transitions, montage, time jumps,
zooms, camera tracking or camera rotation.

No narration, spoken dialogue, voices, vocal sounds or lyrics. Very soft natural
meadow ambience and one subtle child-friendly pine-cone rolling sound are
allowed, but they must not dominate.

0–3s: Exactly one cute little turtle slowly takes two small steps across the
meadow. It lifts its small head and naturally stretches its long pale-yellow
neck. Its same dark-green hard shell and exactly four short legs are clearly
visible.

3–5.2s: Exactly one small brown pine cone rolls slowly in from the side and stops
on the grass a safe short distance in front of the turtle. The turtle is mildly
startled. The pine cone never touches or hurts the turtle.

5.2–7.5s: The same turtle naturally retracts its head, entire neck and all four
legs fully inside the same shell. The empty shell stays still in the same place.
The pine cone has completely stopped moving.

7.5–10s: The turtle cautiously extends the same head first, then the same long
neck and exactly four short legs. It smiles after seeing that everything is safe
and takes one happy step forward. End clearly with the same complete turtle and
the stopped pine cone visible.

Maintain exact turtle, shell, meadow and pine-cone continuity. The shell never
changes shape, size, color or pattern. The turtle must retract into its own shell
without separating from it, then emerge as the same character. Exactly one
turtle and exactly one pine cone. No duplication, morphing, merging,
teleporting, detached body parts, extra limbs, other animals, humans, clothes,
tools, cake, candles, printed pages, panel borders, speech bubbles, subtitles,
logos, watermark, numbers or written characters.
```

## 参考图处理建议

- 原始文件：用户提供的 `IMG_0362.HEIC`
- 原图包含印刷标题、四格边框、序号和年龄数字，不宜直接作为唯一的视频构图参考。
- 生成候选前，优先从第一格裁出一张不含标题、序号和页边的干净角色参考图。
- Gemini 提示词仍需保留“不生成书页、边框、文字、数字和水印”的排除项。

## 候选视频目录

候选视频已保存到：

```text
storyboards/candidates/little-turtle-candidate-1.mp4
```

用户已人工审核并明确批准该 Flow 候选视频。

## 已批准的正式资源

- 候选来源：用户使用 Flow 手动生成
- 人工确认：用户已明确回复候选视频没有问题并批准采用
- 正式视频：`assets/lessons/little-turtle/video/story.mp4`
- 静态封面：`assets/lessons/little-turtle/scene-1.jpg`
- 正式裁切：原视频 720×1280，从纵向偏移 190 像素处截取中央 720×900
- 正式视频规格：720×900、10.00 秒、H.264、保留原始低音量音轨、低于 4 MiB
- 页面原视频音量：`videoVolume: 0.12`，腾讯云旁白保持主音量
- 完整旁白：`assets/lessons/little-turtle/audio/story-full.mp3`
- 腾讯云清单：`assets/lessons/little-turtle/audio/manifest.json`
- 腾讯云音色与语速：`tencent-502007`、`-1`
- 完整旁白实测时长：9.696 秒

## 首次生成重点验收

1. 动作是否严格按“走路展示特征—松果滚近—缩进壳里—安全探头继续走”的顺序发生。
2. 小乌龟的绿色硬壳、浅黄色长脖子和四只短脚是否从头到尾保持一致。
3. 缩壳时头、整条脖子和四只脚是否全部自然收回，是否没有身体分离或壳体变形。
4. 重新探头后是否仍是同一只小乌龟，肢体数量和壳纹是否正确。
5. 松果是否只有一颗，是否在小乌龟前方安全停住，不碰撞、不复制、不变形。
6. 关键动作是否全部位于中央 4:5 安全区。
7. 是否完全没有旁白、对白、唱词或其他人声。
8. 是否没有书页、四格边框、标题、序号、“100”、文字、字幕、水印或黑边。
9. 结尾是否清楚看到小乌龟平安微笑并继续走。

如果首次生成无法稳定完成“头、脖子和四只脚全部缩进再伸出”，下一版优先减少开头步数或省略结尾的迈步动作，不删减“缩壳保护自己”这个核心动作。
