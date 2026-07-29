# 第二个故事课：《蚂蚁搬豆》10 秒视频故事板

## 制作目标

- 使用 Gemini 一次生成一条完整视频
- 总时长：严格控制在 10 秒
- Gemini 生成画幅：竖版 9:16，所有关键动作位于中央 4:5 安全区
- 正式成片：裁切为 720×900、4:5
- 形式：单场景、单个连续镜头，不切镜
- Gemini 只生成无声画面，不生成对白、旁白、音乐或环境声
- 中文旁白继续使用项目现有的腾讯云 TTS 单独生成，并在网页播放时与视频同步

这个版本优先验证“一次生成完整故事”的效果。为降低角色变形和叙事断裂，蚂蚁洞、豆子和全部动作始终处于同一个场景中，摄影机只做非常轻微的跟随。

## 10 秒动作时间线

| 时间 | 画面动作 | 故事信息 |
|---|---|---|
| 0.0—3.0 秒 | 小蚂蚁用力推豆子，豆子纹丝不动 | 用力搬也搬不动 |
| 3.0—5.0 秒 | 小蚂蚁摇头，随后想到办法 | 着急并想出办法 |
| 5.0—7.0 秒 | 小蚂蚁招呼朋友，朋友从洞里出来 | 请好朋友帮忙 |
| 7.0—10.0 秒 | 四只蚂蚁一起抬起豆子，开心地往家走 | 合作搬豆 |

## 固定的画面布局

- 正式视频中蚂蚁洞位于画面左侧，是浅棕色石头底部的圆形洞口。
- 浅绿色豆子位于画面中间偏右。
- 主角最初站在洞口附近，因此所有行动都能在 10 秒内完成。
- 使用中远景，画面同时容纳洞口、豆子和蚂蚁。
- 豆子长度约为一只蚂蚁身体的 2.5 倍。

## 角色与风格锚点

主角是一只可爱的深棕色卡通小蚂蚁：圆头、圆胸、椭圆腹部，六条细腿，两根弯曲触角，大而明亮的黑色眼睛，淡粉色脸颊，不穿衣服。三只朋友与主角采用相同的圆润绘本造型，但体型略小。

画面采用原创儿童绘本动画风格：手绘水彩与水粉质感，柔和纸张纹理，温暖的春日阳光，浅蓝天空、绿色草地、少量小野花和远处柔和山坡。造型圆润，表情清楚，动作简洁，适合 3—6 岁儿童。

## Gemini 一次生成提示词

下面这一段作为完整提示词一次性提交，不要拆分：

```text
Use the attached illustration as the exact visual reference for the ant, green bean, anthill, proportions, colors, linework and soft watercolor children's picture-book style. Animate this scene; do not show a printed page, borders or text.

Create one continuous 10-second vertical 9:16 video. Keep all action in the central 4:5 safe area. One stable medium-wide shot, no cuts or transitions. Completely silent: no speech, music, sound effects or ambience.

0–3s: The same dark-brown ant pushes the large green bean very hard, but the bean does not move. The ant steps back, shakes its head once, taps its head, then smiles with an idea.
3–5s: It runs the short distance to the nearby anthill entrance and beckons inside.
5–7s: Exactly three smaller ants of the same design run naturally out of the entrance and gather around the bean. The original ant remains visible.
7–10s: Exactly four ants lift the same bean together above their heads and take two happy synchronized steps toward the entrance. End clearly on four ants successfully carrying the bean.

Maintain exact character and bean continuity. Every ant has six legs and two antennae. No duplication, morphing, merging, teleporting, extra limbs, other animals, humans, clothes, tools, text, subtitles, logos or watermark. The bean stays still during the solo push and never changes shape, size or color.
```

## 腾讯云 TTS 旁白稿

旁白不交给 Gemini 生成。视频验收完成后，使用项目现有的腾讯云 TTS 流程生成独立 MP3，再由故事课页面静音播放视频并同步播放旁白。

沿用第一节故事课的语音设置：

- 腾讯云音色：`502007`
- 语速：`-2`
- 编码：MP3
- 采样率：24000 Hz
- 建议文件名：`assets/lessons/ant-moving-bean/audio/story-full.mp3`

最终旁白：

> 小蚂蚁用力搬豆，搬不动。想出办法，请来朋友，一起抬回家。

腾讯云实际生成时长：9.792 秒，与 10 秒视频匹配。

配音节奏：

- 0.0—3.0 秒：小蚂蚁用力搬豆，搬不动。
- 3.0—6.5 秒：想出办法，请来朋友，
- 6.5—9.792 秒：一起抬回家。
- 9.792—10.0 秒：保留合作成功的结尾画面。

## 已批准的正式资源

- 正式视频：`assets/lessons/ant-moving-bean/video/story.mp4`
- 静态封面：`assets/lessons/ant-moving-bean/scene-1.jpg`
- 完整旁白：`assets/lessons/ant-moving-bean/audio/story-full.mp3`
- 腾讯云清单：`assets/lessons/ant-moving-bean/audio/manifest.json`
- 人工确认：候选视频 1 已通过

## 首次生成重点观察

第一次测试时，优先观察以下四点：

1. 模型能否按顺序完成“发现—推不动—招呼朋友—合作搬走”。
2. 三只朋友是否确实从洞口出现，而不是由主角突然分裂出来。
3. 前半段单独推豆子时，豆子是否保持不动。
4. 结尾是否恰好四只蚂蚁共同抬着同一粒豆子。

如果首次生成无法稳定完成全部动作，下一版应优先删减“摇头”动作，而不是删减“请朋友”和“一起抬豆子”这两个关键情节。
