# HF-11 Phase 2 音频正式签收与策略锁定

2026-10-27（Asia/Singapore） · **PASS / approved**

审核者：Project owner (user)。证据：Owner 本轮 Phase 2 收口正式指令，明确声明已完成真机实际试听，现有 1,268 个静态录音和浏览器中文 TTS 回退机制表现良好。

- 正式交付采用 **静态 MP3 + 设备中文语音平滑回退**。57 个缺静态录音的读音（表内 55 + 额外 2）与 738 组词句继续使用中文设备语音。
- Owner 决定当前阶段暂不调用腾讯云 TTS 补音；历史 TLS 故障与补录需求不再作为本阶段阻塞项。后续补录须有新的明确范围。
- 已有停止、换卡、静态失败回退和无中文声线提示机制保留。此签收是当前整体方案及真机实际体验的 Owner 验收，不扩大成全部候选逐条音准审定或静态音频全覆盖。
- 审核绑定 `data/audio/pronunciation.json` 原始 UTF-8 文件 SHA-256：`58bdd2386b941176c56dbceaf1601a73a0c29acb9d9993b4373a802cbe882aa6`；1,268 个实际 MP3 的逐项 SHA-256 由 manifest 绑定，自动测试继续验证全部资源字节。
- 历史源资产 `listeningAcceptance=pending` 与逐字旧 `audioListening` 保留其原始逐项审计含义；本阶段策略批准以本独立签收和 [机器回执](phase-2-hf11-audio-signoff.json) 为准，不重写历史审批。
