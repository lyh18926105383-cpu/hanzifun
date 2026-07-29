# 第三个故事课：《花猫照镜子》10 秒视频故事板

## 制作目标

- 使用 Gemini 一次生成一条完整视频
- 总时长：严格控制在 10 秒
- Gemini 生成画幅：竖版 9:16，所有关键动作位于中央 4:5 安全区
- 正式成片：用户批准候选后裁切为 720×900、4:5
- 形式：单场景、单个连续镜头，不切镜
- Gemini 不生成旁白、角色对白或其他人声；允许轻柔、自然且不抢叙事的环境音和动作音效
- 中文旁白继续使用项目现有的腾讯云 TTS 单独生成，并在网页播放时与视频同步

这个版本把原绘本的四格情节压缩到同一间卧室内。蓝色小床、红色落地镜和墙脚老鼠洞始终同时位于画面中，花猫只需移动很短的距离，避免 10 秒内因换景导致角色变形或叙事断裂。

## 本课学习字

```text
才、睡、左、右、只、旁
```

六个学习字都必须真实出现在最终旁白中。

## 10 秒动作时间线

| 时间 | 画面动作 | 故事信息 |
|---|---|---|
| 0.0—2.5 秒 | 小花猫在床边刚睡醒，打哈欠并伸懒腰；脸上已有明显灰色污点 | 才睡醒，还没洗脸 |
| 2.5—5.5 秒 | 小花猫走到镜子前，先向左看，再向右看；镜像始终准确同步 | 左看右看 |
| 5.5—7.5 秒 | 小花猫皱眉、翘胡子，用爪子指着镜子生气 | 误以为镜子脏 |
| 7.5—10.0 秒 | 一只小老鼠从旁边的洞口探出，指指花猫的脏脸并捂嘴笑；花猫惊讶又不好意思 | 老鼠看穿误会并发笑 |

## 固定的画面布局

- 蓝色小床位于画面左侧。
- 红色落地镜位于画面中间偏右，完整镜面始终可见。
- 老鼠洞位于镜子旁边的墙脚或地板边缘，结尾小老鼠从洞中自然出现。
- 花猫从床边走到镜子前的距离很短，不需要跑动。
- 使用稳定中远景，同时容纳床、花猫、镜子和老鼠洞。
- 所有关键动作放在竖版画面的中央 4:5 安全区，确保后续横向裁切不丢失角色。

## 角色与画风锚点

花猫是一只原创的圆润卡通小花猫：以白色毛发为主，头顶、耳朵、手臂、腿和长尾有橘黄色花纹，圆脸、大眼睛、粉色脸颊和肚皮，不穿衣服。未洗的脸上有三处小而清楚的灰色污点；污点从开头到结尾不能消失，镜中倒影也必须有完全对应的污点。

小老鼠是一只原创的灰色卡通小老鼠：圆耳朵、粉色耳心和肚皮、小黑眼睛、细尾巴，不穿衣服。它只在最后 2.5 秒从洞口出现。

画面采用原创儿童绘本动画风格：手绘水彩与水粉质感、柔和纸张纹理、暖色晨光、圆润造型、清楚表情，适合 3—6 岁儿童。参考图只用于理解角色特征、主要道具、配色和故事关系，不复制印刷页面或任何文字。

## Gemini 一次生成提示词

下面这一段作为完整提示词一次性提交，不拆分：

```text
Create a new, original children's animation using the attached illustration only
as visual reference for the general calico-cat features, gray mouse, blue bed,
red standing mirror, warm pastel colors, rounded proportions and soft watercolor
picture-book feeling. Do not copy or reproduce the printed page, exact artwork,
panel grid, borders, page numbers or any text.

Create one continuous 10-second vertical 9:16 video. Keep every important action
inside the central 4:5 safe area for later cropping. Use one stable medium-wide
shot in the same cozy bedroom. Keep the blue bed on the left, the red standing
mirror near the center-right, and a small mouse hole at floor level beside the
mirror. No cuts, transitions, montage, zooms or camera rotation.

No narration, spoken dialogue, voices, vocal sounds or lyrics. Very soft natural
room ambience and subtle child-friendly action sound effects are allowed, but
they must not dominate.

0–2.5s: Exactly one cute white-and-orange calico kitten has just woken beside the
blue bed. It yawns and stretches both paws upward. Three small gray dirt smudges
are already clearly visible on its unwashed face.

2.5–5.5s: The same kitten walks the short distance to the red standing mirror,
then looks once to its left and once to its right while studying its face. The
mirror shows only one accurate, synchronized reflection of that same kitten,
including the same three dirt smudges.

5.5–7.5s: The kitten mistakenly believes the mirror is dirty. It frowns, puffs
its cheeks, raises its whiskers and points one paw accusingly at the mirror. It
does not wash or wipe anything.

7.5–10s: Exactly one small gray mouse pops naturally out of the nearby floor-level
mouse hole beside the mirror. The mouse points gently at the kitten's dirty face,
covers its mouth and laughs silently. The kitten looks surprised and embarrassed.
End clearly with the kitten, its single accurate mirror reflection and the mouse
all visible.

Maintain exact character, room and mirror continuity. The kitten remains the same
size and fur pattern throughout. The three facial dirt smudges stay on the real
face and reflection until the end. The reflection must never become a second
physical kitten and must never move independently. Exactly one physical kitten
and exactly one mouse. No duplication, morphing, merging, teleporting, extra
limbs, humans, clothes, tools, speech bubbles, subtitles, logos, watermark or
written characters.
```

## 腾讯云 TTS 旁白稿

旁白不交给 Gemini 生成。候选视频经用户人工批准后，使用项目现有的腾讯云 TTS 流程生成独立 MP3。

为配合 10 秒视频，正式口语化旁白精简为：

> 小花猫才睡醒，没洗脸。左看右看，还怪镜子脏。旁边一只小老鼠笑了！

旁白已包含全部学习字：

```text
才、睡、左、右、只、旁
```

正式生成时优先沿用：

- 腾讯云音色：`502007`
- 腾讯云语速：`-1`
- 编码：MP3
- 采样率：24000 Hz

腾讯云实际生成时长：9.504 秒，与 10 秒视频匹配，结尾保留约 0.5 秒清楚画面。

## 候选视频目录

```text
storyboards/candidates/cat-mirror-candidate-2.mp4
```

用户已在 Gemini Mac 端查看并明确批准候选视频 2。

## 已批准的正式资源

- 正式视频：`assets/lessons/cat-mirror/video/story.mp4`
- 静态封面：`assets/lessons/cat-mirror/scene-1.jpg`
- 完整旁白：`assets/lessons/cat-mirror/audio/story-full.mp3`
- 腾讯云清单：`assets/lessons/cat-mirror/audio/manifest.json`
- 人工确认：候选视频 2 已通过
- 正式裁切：取原视频中部清晰的 4:5 安全区，去掉上下模糊延展并输出 720×900
- 原声音轨：保留候选视频 2 的自然环境音和动作音；网页播放音量为 `0.12`，作为腾讯云旁白下方的轻声背景
- 声音开关：关闭页面声音时，腾讯云旁白与视频原声同时静音

## 首次生成重点验收

1. 四个动作是否按“睡醒—照镜子—怪镜子—老鼠笑”的顺序发生。
2. 花猫脸上的灰色污点是否从开头保持到结尾，镜中污点是否同步。
3. 镜中倒影是否始终只是一个准确倒影，而不是第二只实体花猫。
4. 小老鼠是否只在结尾从旁边洞口自然出现，数量恰好一只。
5. 花猫和小老鼠是否没有复制、融合、瞬移或多余肢体。
6. 是否完全没有旁白、对白、唱词或其他人声。
7. 是否没有书页、四格边框、序号、文字、字幕、水印或黑边。
8. 结尾是否同时看清花猫、倒影和小老鼠，且关键内容位于中央 4:5 安全区。

如果首次生成无法稳定完成全部动作，下一版优先删减“打哈欠”或“鼓起脸颊”等装饰动作，不删减“左看右看”“误怪镜子”和“小老鼠发笑”三个核心情节。
