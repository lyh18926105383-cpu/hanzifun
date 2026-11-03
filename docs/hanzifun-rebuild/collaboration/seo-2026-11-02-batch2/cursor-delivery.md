# SEO-05 · Cursor 第二批交付（拼音导航）

**执行时间：** 2026-11-02  
**工作目录：** `/Users/graceshi/.codex/worktrees/c20f/汉字饭hanzifun`  
**分支：** `codex/seo-2026-11-02`  
**说明：** 保留 SEO-03 首批三页引导改动；本批仅下列 3 文件。

## 修改清单

### 1. `site/pages/dictionary.mjs` — `/dictionary/pinyin/`

- 将音节分组提取为 `sortedPinyinGroups`（排序逻辑与原先 `[...groups].sort` 一致），**未改** `pinyin-{syllable}` 锚点 id 或 126 核心字分组范围。
- 新增静态 `<nav class="subnav" aria-label="Pinyin index letters">`：按拼音 **plain 拼写首字母**（A–Z，仅有音节的字母）链到该字母下**排序后第一个**音节的 `#pinyin-…` 锚点。
- 英文说明：`Choose a first letter to jump to its first listed syllable. Only letters used in this 126-character index are shown.`
- 导航置于 intro `content-prose` 之后、`pinyinBody` 之前；无 JavaScript。

### 2. `site/pages/pinyin-chart.mjs` — `/pinyin-chart/`

- 在 **Look up a syllable** 标题下增加 `<a href="#pinyin-syllable-filters">Jump to syllable filters</a>`。
- 现有筛选 `<form>` 增加唯一 `id="pinyin-syllable-filters"` 与 `tabindex="-1"`（原生锚点键盘聚焦），保留 `data-pinyin-filter` 及字段 id；无 JS 下仍可通过 fragment 聚焦到表单区域。
- 未改 410 音节数据、筛选逻辑或 `syllable-*` 锚点。

### 3. `tests/pinyin-navigation.test.mjs`（新增）

- 用 `parse5` + 现有 `nodes`/`attr` 辅助，对 **实际生成的** `content` HTML 断言：
  - 字母 nav 链接唯一、href 与「首字母 → 首个音节」映射一致，且目标 section 存在；
  - 全部 `pinyin-*` section id 集合与数据推导一致（锚点集合未变）；
  - chart 上 `#pinyin-syllable-filters` 跳转链接唯一，且仅一个带该 id 的 filter form。

## 实际命令与结果

```text
cd /Users/graceshi/.codex/worktrees/c20f/汉字饭hanzifun
node --test tests/pinyin-navigation.test.mjs
```

```
✔ pinyin index letter nav targets first syllable anchors and preserves section ids (75.350833ms)
✔ pinyin chart exposes one keyboard-reachable filter anchor (111.365375ms)
ℹ tests 2
ℹ pass 2
ℹ fail 0
ℹ duration_ms 530.580042
```

（本机 worktree 已有 `node_modules`；未执行全量 `npm test` / `build:site`，由总控集成验证。）

## 限制遵守

- 未改 `site/seo.mjs`、审批、元数据总表、CSS、数据文件、路由或客户端筛选脚本。
- 未 commit / push / deploy。

## 交接

- 总控：合并 SEO-03 + SEO-05，跑完整测试与生产构建后统一部署。
