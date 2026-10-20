# Motion Prompt 简体中文版

**简体中文** · [English（原版说明）](README.en.md) · [日本語（原版说明）](README.ja.md)

本项目是 Motion Prompt 的非官方简体中文本地化版本，基于 Shohei Ohtaki 的开源项目开发。

用专业名称、动态示例与完整 Prompt 向 AI 描述视觉需求。沿用原项目的 HTML/CSS/JavaScript 和多语言架构，默认简体中文，可切换 ZH / EN / JA。144 个效果全部具备中文名称、解释、提问示例、表现、规格及适用场景，保留英文名称与标签。

**在线体验预定地址**：[rainman016.github.io/motion-prompt-zh](https://rainman016.github.io/motion-prompt-zh/)。本次仅在本地准备，尚未创建或发布远程仓库与 Pages；发布前请使用本地预览。

![动态图形示例](assets/preview-motion.gif)

| 编号 | 分类 | 数量 | 中文资料 |
|---|---|---:|---|
| 001–024 | 动态图形基础 `motion` | 24 | [查看](packs/motion/README.zh-Hans.md) |
| 025–048 | 镜头运动与剪辑 `camera` | 24 | [查看](packs/camera/README.zh-Hans.md) |
| 049–072 | UI 组件 `ui` | 24 | [查看](packs/ui/README.zh-Hans.md) |
| 073–096 | 落地页与网页动效 `lp` | 24 | [查看](packs/lp/README.zh-Hans.md) |
| 097–120 | 摄影光线与风格 `photo` | 24 | [查看](packs/photo/README.zh-Hans.md) |
| 121–144 | 动态图形进阶 `motion2` | 24 | [查看](packs/motion2/README.zh-Hans.md) |

## 搜索、预览与复制

1. 按分类浏览，或搜索“弹性”“遮罩”“镜头推进”；英文术语、slug、英文标签和 `#012` 等编号仍可搜索。
2. 点击卡片查看动画、解释、提问示例和完整运动规格，支持暂停及前后切换。
3. 点击“复制 Prompt”交给 Codex、Claude Code 等 AI。内容包括中英文名称、效果说明、全部参数、适用场景、参考实现与共享代码链接，以及保留运动规格、替换实际素材的要求。
4. 多项效果可点击“选择”，添加备注后“复制所选”或复制分享链接。由 Skill 打开时，还可“发送给 AI”。

语言优先级为有效 URL → 已保存偏好 → `zh-Hans`。`?lang=zh` 自动归一为 `zh-Hans`，分享链接包含语言。中文资源只生成 `zh-Hans` 目录。Canvas 内原始示例字样保留，见 [本地化说明](docs/LOCALIZATION.md)。

## 本地运行

需要 Node.js 18+，预览可用 Python 3，无需安装网站依赖。

```sh
cd motion-prompt-zh
node tools/build.mjs
node tools/build.mjs --check
python -m http.server 8000 --bind 127.0.0.1
```

打开 [本地效果库](http://127.0.0.1:8000/)。macOS/Linux 若无 `python`，可用 `python3`。请通过 HTTP 预览，直接打开文件会影响数据请求。

## Motion Prompt 中文 Skill

技能标识为 `motion-prompt-zh`，与原版 `motion-prompt` 可同时安装。完整用法见 [SKILL.md](skills/motion-prompt-zh/SKILL.md)。

在当前源码仓库中，无需安装即可验证和使用：

```sh
node skills/motion-prompt-zh/scripts/motion-prompt.mjs info
node skills/motion-prompt-zh/scripts/motion-prompt.mjs list --lang zh-Hans
node skills/motion-prompt-zh/scripts/motion-prompt.mjs search 弹性 --lang zh-Hans
node skills/motion-prompt-zh/scripts/motion-prompt.mjs get 012 --lang zh-Hans
node skills/motion-prompt-zh/scripts/motion-prompt.mjs prompt 012 --lang zh-Hans
node skills/motion-prompt-zh/scripts/motion-prompt.mjs kit motion
node skills/motion-prompt-zh/scripts/motion-prompt.mjs pick --local --lang zh-Hans
```

`pick` 打开中文网站并等待选择，选中一个或多个动画、填写备注后点击“发送给 AI”。完整源码默认使用本地网页；普通浏览器访问保留“复制所选”。`--no-open` 可只打印完整链接，由 Codex 浏览器面板打开。旧路径 `skills/motion-prompt/scripts/motion-prompt.mjs` 保留为兼容入口。

让 Codex 在另一个本地项目中识别技能时，将完整 `skills/motion-prompt-zh` 目录复制到该项目的 `.agents/skills/motion-prompt-zh`，保留 `scripts/site-config.json`、`config.mjs` 和 `references/`。这是项目级安装；无需改全局配置或覆盖原版。Codex 按 [官方 Skill 规范](https://learn.chatgpt.com/docs/build-skills) 读取 `SKILL.md`；安装后若未出现，重启该项目的 Codex 会话。

发布前，复制出来的独立技能没有网站源码，也不能假设预定站点已经上线。可在启动 Codex 的终端中指定本地数据，并先验证：

```powershell
$env:MOTION_PROMPT_BASE='C:\你的路径\motion-prompt-zh\api\v1'
node .agents/skills/motion-prompt-zh/scripts/motion-prompt.mjs info
node .agents/skills/motion-prompt-zh/scripts/motion-prompt.mjs get 059 --lang zh-Hans
```

发布前需要浏览器选择时，使用完整源码的 CLI 运行 `pick --local`，把回传结果交给目标项目中的 Codex；或将项目级 Skill 链接到完整源码中的技能目录（Codex 支持符号链接）。仅复制技能时，`--local` 会明确提示缺少网站源码。

公开仓库发布后，其他用户可在目标项目中安装（`npx skills` 安装器当前要求 Node.js 22.20+，网站构建及本仓库 CLI 仍支持 Node.js 18+；见[安装器官方说明](https://github.com/vercel-labs/skills)）：

```sh
npx skills add rainman016/motion-prompt-zh --skill motion-prompt-zh --agent codex
node .agents/skills/motion-prompt-zh/scripts/motion-prompt.mjs info
node .agents/skills/motion-prompt-zh/scripts/motion-prompt.mjs search 文字 入场 --lang zh-Hans
```

默认安装到当前项目，确认目录为 `.agents/skills/motion-prompt-zh`。验证命令应显示 144 个元素及实际来源。默认中文；`--lang zh` 等价于 `zh-Hans`，`--lang en`、`--lang ja` 保留原语言。

中文调用示例：

- “使用 $motion-prompt-zh 打开中文动效库，帮我挑选适合首页的动画。”
- “搜索与文字入场有关的动画。”
- “使用 #012 实现这个动效。”
- “把刚选中的 #059 用到当前项目的通知开关，保留保存设置功能。”
- “将 #032 的镜头运动整理成视频生成提示词。”

Codex 应先检查项目，再读取选中编号的 `get` 与对应 `kit`，完成实际代码适配和验证；Web 动效遵循 `prefers-reduced-motion`。没有收到选择时不会自行猜测编号。

数据配置统一在 [site.config.json](site.config.json)：`site` 为中文站，`repo` 为中文仓库，`apiBase` 默认由站点派生，`rawApiBase` 默认由账号、仓库、分支派生；后两项也可显式设置 HTTP(S) URL。修改后运行构建同步独立技能配置。`MOTION_PROMPT_BASE` 可覆盖为本地 `api/v1` 或逗号分隔的 URL；`MOTION_PROMPT_CACHE`、`MOTION_PROMPT_TTL` 和 `--refresh` 保留。备用来源及缓存会标出来源；中文资料缺失会报错，不静默使用原版英文。

## 发布到 GitHub Pages

首次发布推荐 Fork 原项目，保留上游来源关系与完整 Git 历史。以下命令是发布操作，须在确认自己的账号和公开范围、完成本地检查与提交后执行；仅修改配置文件不会自动开启 Pages。当前发布目标为个人账号 `rainman016` 的 `motion-prompt-zh`。

1. 从 `showheyohtaki/motion-prompt` 创建个人 Fork，并命名为 `motion-prompt-zh`。沿用当前工作区，不需要重新克隆。
2. 核对 [site.config.json](site.config.json)。当前根据 GitHub CLI 身份设置为 `rainman016`；换账号时统一修改 `owner`、`repo`、`site`，仓库名和分支也须对应实际值。
3. 运行构建和校验。构建会同步网页元数据、API、Prompt、Skill 配置和插件地址；提交全部源文件与生成文件。
4. 首次发布、目标 Fork 尚未创建且 `origin` 仍指向上游时，创建 Fork，再保留 `upstream` 并将 `origin` 指向自己的 Fork。若目标或远程已存在，先检查再继续，不重复创建或覆盖：

```sh
gh repo fork showheyohtaki/motion-prompt --fork-name motion-prompt-zh --clone=false --remote=false
git remote rename origin upstream
git remote add origin https://github.com/rainman016/motion-prompt-zh.git
git push -u origin HEAD:main
```

5. 使用已准备的 [.github/pages-source.json](.github/pages-source.json) 开启 Pages。它声明从 `main`、`/` 发布，本身不是自动执行的工作流：

```sh
gh api repos/rainman016/motion-prompt-zh/pages --method POST --input .github/pages-source.json
```

也可在仓库 **Settings → Pages → Build and deployment** 选择 **Deploy from a branch**，分支 `main`、目录 `/(root)`。项目自带 `.nojekyll` 与已生成静态文件，无需框架或额外部署密钥。参见 [GitHub 官方发布源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)及 [Pages API](https://docs.github.com/en/rest/pages/pages#create-a-github-pages-site)。
6. 部署成功后检查首页、`?lang=zh-Hans#144`、中文资源、分享和 Skill 远程读取，再移除本文“尚未发布”提示。

发布内容检查、完整验收范围及上线后的验证清单见 [发布说明](docs/PUBLISHING.md)。后续更新只需重新构建、检查、提交并推送 `main`，Pages 会按已配置来源更新。

## 开发与验证

内容源为 `packs/*/meta.json`，动画源为 `packs/*/pack.js`。不要手改 `assets/catalog.js` 或 `api/v1/`。

```sh
node tools/build.mjs
node tools/build.mjs --check
node tools/check-localization.mjs
node tools/check-skill.mjs
node tools/check.mjs
```

浏览器检查需要环境已有 Playwright，本项目未增加 npm 依赖。`MP_PLAYWRIGHT` 可指定安装目录，`MP_PYTHON` 可指定 Python 路径。Windows 设置示例：

```powershell
$env:MP_PLAYWRIGHT='C:\path\to\node_modules\playwright'
node tools/check-localization.mjs
node tools/check-skill.mjs
node tools/check.mjs
```

测试覆盖资源、Prompt 一致性、三语状态、搜索、分享、桌面/移动布局、Pages 子路径与 Skill 回传。`check-skill.mjs --static` 只检查 CLI；完整检查还会运行隔离安装、离线缓存、本地/在线子路径多选回传和回调校验。真实结果见 [原验收记录](docs/VALIDATION.md) 与 [Skill 集成验收](docs/SKILL-INTEGRATION.md)，扩展规则见 [FORMAT.md](FORMAT.md)。

## 来源、版权与授权

- 原项目：[showheyohtaki/motion-prompt](https://github.com/showheyohtaki/motion-prompt)，原作者 **Shohei Ohtaki（大滝昇平）**，X [@showheyohtaki](https://x.com/showheyohtaki)。创作缘起与完整原说明保留在 [英文](README.en.md) 和 [日文](README.ja.md) 文档。
- 本版由 `rainman016` 维护中文翻译及本地化扩展，不将原作者动画、代码或素材归为中文版原创。
- [LICENSE](LICENSE) 完整保留 **MIT License / Copyright (c) 2026 Shohei Ohtaki**。使用参考代码时保留每个元素和 kit 的版权行，再分发时保留许可证。
- [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) 原文完整保留。案例帖子及其媒体属于作者，**不受本仓库 MIT 许可覆盖**，本站仅存链接、帖子 ID、自写介绍并使用官方嵌入。
- 未新增外部字体、图片或视频。原仓库资源和素材核查范围见 [本地化说明](docs/LOCALIZATION.md)。

## 改动记录与同步上游

见 [CHANGELOG.zh-Hans.md](CHANGELOG.zh-Hans.md)。同步时在独立分支合并，保留 ID、顺序、slug 和参数；翻译变化字段后重新生成并验收。不要复制上游生成的 API 覆盖本版；规格行数和数值校验会提醒中文同步更新。
