# 静态发布回滚

上线前部署：`de7c8bda-66f1-445d-a2e1-667db61528f7`。上一100% Worker版本：`6b11b7a8-303d-40c3-9c69-91d7b38eb15d`。

若新版本的核心访问、Sitemap或索引验证失败，执行已确认CLI支持的命令：

```sh
node /Users/graceshi/.npm/_npx/32026684e21afda6/node_modules/wrangler/bin/wrangler.js rollback 6b11b7a8-303d-40c3-9c69-91d7b38eb15d --name hanzifun --message 'Restore pre-closeout production version' --yes
```

随后重新检查首页、Sitemap和三场景robots；回滚到上一版时Sitemap预期恢复355，新场景恢复原预览状态。回滚仅切换静态Worker版本，不清空LocalStorage、旧key或新学习事件。上一版本仍由Cloudflare保留；本轮构建逐文件指纹位于忽略目录`.cache/releases/phase-2-closeout-2026-10-27/`。

CLI回滚参数及上线前版本已核实。本轮不主动切换回旧生产，未冒充已执行线上回滚演练。24小时与7天后由Owner检查错误反馈、资源可读与Sitemap；搜索引擎实际收录需后续观察。
