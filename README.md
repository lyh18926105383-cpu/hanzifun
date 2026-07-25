# hanzifun（汉字饭）

**链接**：https://hanzifun.online

这是一款专为3-6岁儿童设计的汉字启蒙互动工具，通过卡片翻转、图文配对、有声故事和即时反馈，帮助孩子在趣味中快乐识字。

**解决的痛点**

- **抽象汉字难理解**：孩子难以将符号化的汉字与实际含义建立联系。
    
- **动词等非名词难以图示化**：像“飞”“跑”这类动作，很难用直接、标准的图片教会孩子。
    
- **学习反馈不及时**：传统识字卡缺少互动和进度追踪，家长难以掌握学习效果。
    

**产品特色**

- **卡片翻转，直观学习**：正面展示标准汉字，背面通过 **Emoji 图片 + 趣味组词** 呈现字义，贴合儿童认知习惯。
    
- **动名词巧妙配图**：将抽象动词先组成具体名词再配图（例如“飞”→“飞鸟”→“🐦💨”），破解教学难点。
    
- **108张识字卡**：按配套识字表的18组顺序收录，每组6张，覆盖身体、方位、动作、自然等常用主题。
    
- **双按钮反馈机制**：孩子点击“熟悉”跳过已会字，点击“不熟悉”翻转卡片查看解释，自主掌控学习节奏。
    
- **灵活的学习设置**：支持选择5字、10字、20字或自定义字数，满足不同专注时长与学习计划。
    
- **多手势便捷操作**：支持点击翻转、键盘控制、滑动切换等操作，适配儿童小手和多种设备。
    
- **进度可视化**：实时统计“熟悉/不熟悉”字数，学习成果一目了然，并可单独复习不熟悉的汉字。

- **本机学习足迹**：自动保存学习轮次、薄弱字和最近结果，刷新页面后仍可查看。

## 项目结构

- `index.html`：页面结构和搜索引擎信息
- `pricing.html` / `payment-success.html`：Creem 月订阅定价页与支付结果页
- `privacy.html` / `terms.html`：公开隐私政策与服务条款
- `styles.css`：页面样式与响应式布局
- `characters.js`：按识字表顺序排列的108张汉字卡内容字库
- `storage.js`：本机学习记录与薄弱字数据
- `tts-corpus.js`：朗读语料、多音字修正和20字试音集
- `audio.js`：静态音频播放、预加载与浏览器朗读兜底
- `audio-manifest.json`：已生成音频的版本化索引
- `app.js`：学习流程和页面交互
- `lessons.js`：故事课内容、分镜、跟读和认字题数据
- `story.html` / `story.css` / `story.js`：有声动态绘本与跟读流程
- `worker.mjs`：仅在服务端创建 CREEM Checkout、校验支付回跳、查询订阅状态及接收 Webhook
- `assets/lessons/`：故事插图、固定童声旁白和题目语音
- `scripts/`：TTS批量生成和音频清单工具
- `tests/`：字库、基础学习流程与本机记录测试

## 本地检查

项目不需要安装第三方依赖。使用 Node.js 运行：

```bash
npm test
```

生成Cloudflare部署所需的白名单静态目录：

```bash
npm run build:site
```

### CREEM 测试月订阅

先在 Creem 控制台切换到 **Test Mode**，创建一个价格为 **US$1/月**、billing type 为 `recurring`、billing period 为 `every-month` 的产品。复制 `.dev.vars.example` 为 `.dev.vars`，填入：

```dotenv
CREEM_API_KEY=creem_test_你的测试APIKey
CREEM_PRODUCT_ID=prod_你的测试月订阅产品ID
```

`.dev.vars` 已被 Git 忽略。`CREEM_API_KEY` 和产品 ID 都只由 Cloudflare Worker 读取，不会进入 `dist/` 或浏览器代码。使用 Wrangler 本地预览后打开 `/pricing.html`：

```bash
npx wrangler dev
```

部署时不要把密钥写进 `wrangler.toml`。通过 Cloudflare Workers 控制台的 **Settings → Variables and Secrets** 添加同名变量，或使用：

```bash
npx wrangler secret put CREEM_API_KEY
npx wrangler secret put CREEM_PRODUCT_ID
```

代码固定调用 CREEM 测试地址 `https://test-api.creem.io`。Checkout 成功回到 `/payment-success.html`，页面会通过 Worker 校验 CREEM 回跳签名并查询订阅状态。

Webhook 接收地址已预留为 `/api/creem/webhook`，当前无需在 CREEM 后台创建。以后准备接入时，再添加 `CREEM_WEBHOOK_SECRET`，并把该地址注册到 CREEM Test Mode Webhook；处理器会先验证 `creem-signature` HMAC-SHA256 签名。当前处理器只确认并记录已验签事件，尚不负责持久化会员权限。

使用 `.env` 中的腾讯云配置生成故事课固定语音：

```bash
npm run tts:story
```

## TTS 语音资源

页面优先播放 `audio-manifest.json` 中的预生成 MP3。某个字尚未生成静态音频时，会自动使用浏览器中文朗读，用户学习时不会实时请求云端 TTS。

重建108张卡片的语料与音频清单：

```bash
npm run tts:manifest
```

使用腾讯云默认音色 `502007` 生成20字试听集：

```bash
export TENCENTCLOUD_SECRET_ID="your-secret-id"
export TENCENTCLOUD_SECRET_KEY="your-secret-key"
npm run tts:pilot
```

试听和人工校验通过后，再生成全部字卡：

```bash
npm run tts:all
```

生成脚本支持 `--voice=502007`、`--speed=0`、`--delay=1000`。凭证只通过环境变量传入，不要写入代码或提交到 Git。
