# GitHub 开源发布说明

## 发布目标与来源

- 个人 GitHub 账号：`rainman016`。
- 目标公开仓库：`https://github.com/rainman016/motion-prompt-zh`。
- 中文网站：`https://rainman016.github.io/motion-prompt-zh/`。
- 中文 API：`https://rainman016.github.io/motion-prompt-zh/api/v1`。
- Skill：`motion-prompt-zh`，源码目录 `skills/motion-prompt-zh`。
- 上游：`showheyohtaki/motion-prompt`，本地化基线 `b4b676ef693080e78b706e36b47a8faa5286298e`。

采用个人 Fork，保留 GitHub 上游关系与原提交历史。新提交追加在原历史之后，不重建仓库、压平历史或强制推送。新提交使用与账号对应的 GitHub noreply 邮箱，不修改全局 Git 身份。

发布的是本仓库的 144 项动效库、三语资料、中文 API 和 Skill。工作区外的本地体验页、验证截图、依赖缓存和临时接收链接不属于发布内容。

## 公开内容与许可

1. 完整保留 LICENSE、THIRD-PARTY-NOTICES.md、原作者姓名及参考代码的原作者版权链接。
2. 中文 README 明确说明是非官方中文版本；英文、日文原说明继续保留。
3. 原作者六包动画实现、runtime.js、原英文/日文资料及中文翻译保留；站点和 API 从 `site.config.json` 统一生成。
4. `.gitignore` 排除本地 Agent 安装、环境配置、凭据、日志、缓存和验证输出。已经被 Git 跟踪的文件仍需检查，忽略规则不会自动移除它们。
5. 发布前扫描已跟踪及未忽略的待发布文件，检查常见密钥格式、私钥、含凭据 URL、敏感文件名、个人机器路径、符号链接和大文件。扫描只报告文件位置，不输出疑似密钥内容。此类检查不是对所有未知敏感信息的保证。
6. 案例页第三方帖子和媒体仍归各自作者；原第三方声明完整保留，本站只使用原有官方嵌入，不将帖子媒体纳入 MIT 素材。

## 本地验收

```sh
node tools/build.mjs
node tools/build.mjs --check
node tools/check-localization.mjs
node tools/check-skill.mjs
node tools/check.mjs
```

浏览器检查使用环境已有的 Playwright；可配置 `MP_PLAYWRIGHT` 和 `MP_PYTHON`，无需给静态站点增加运行依赖。

确认 144 项动画、三语 Prompt、搜索、复制、分享、语言切换、本地选择回传、独立 Skill 数据来源与缓存均通过；子路径 `/motion-prompt-zh/` 及 `zh-Hans`/`zh` 都需覆盖。将最终检查后的工作树提交，再向用户展示提交与公开目标。只有明确确认后才创建 Fork、推送和开启公开 Pages。

### 2026-10-20 首次发布前实测

| 检查 | 结果 |
|---|---|
| 构建及 `--check` | 通过，6 包、144 项，生成 902 个文件 |
| 完整本地化回归 | 通过；432 份三语 Prompt、432 份参考实现、语言/搜索/复制/分享、桌面及窄屏、子路径与真实本地回传 |
| 中文 Skill 集成检查 | 通过；CLI、旧入口、独立安装、备用来源/缓存、中文缺失错误、本地与模拟线上子路径多选回传 |
| 144 项动画严格绘制 | 0 failed、0 warnings |
| 现有成果保护 | 六包翻译、六包动画、样式、runtime、LICENSE 与第三方声明共 16 个源文件哈希和本轮前基线一致 |
| 发布内容扫描 | 待发布约 31.8 MB；未发现已知密钥格式、私钥、敏感文件名、个人机器绝对路径、符号链接或超大单文件；二进制原素材未按文本扫描 |
| Git 历史 | 已补齐浅克隆，保留 8 条原始上游提交；目标账号与仓库名已只读核实 |

以上为确认发布之前的本地准备记录。首次部署后的真实线上结果另列于下方。

### 2026-10-20 首次公开部署实测

用户明确确认后，已创建 `rainman016/motion-prompt-zh` 公开 Fork，父仓库为 `showheyohtaki/motion-prompt`。中文版提交 `3faafa0ba281fe1477f793199ae5faa48180b28f` 已推送至 `main`，GitHub Pages 的首次构建成功，HTTPS 已强制启用。

| 检查 | 结果 |
|---|---|
| 公开仓库与历史 | `public`、`isFork=true`；原 8 条提交保留，中文版追加提交；本地 `origin` 指向个人 Fork，`upstream` 保留原仓库 |
| 真实 Pages 资源 | HTTPS 首页、脚本与样式、三语目录、六包动画和共享代码，以及全部 144 份中文 Prompt 与 144 份中文规格均返回成功，与已发布源码一致 |
| 线上浏览器 | 144 项动画实际绘制；默认中文、中文搜索、EN/JA 切换、中文 Prompt 复制、多选复制、分享与 390px 手机布局通过；无站内资源 404 或脚本异常 |
| 公开 GitHub 安装 | README 中的 `npx skills add` 在隔离项目安装成功；Codex 标准 Skill 安装器也从公开仓库路径安装成功；未修改用户原有技能或全局配置 |
| 独立 Skill 数据 | `info/list/search/get/prompt/kit` 通过；中文、`zh` 别名、英文和日文内容正确；使用全新缓存，实际首选数据源为中文 Pages API |
| 真实 HTTPS 选择回传 | 从已安装 Skill 启动线上 `pick`，浏览器选中 `#012`、`#059` 并填写中文备注，点击“发送给 AI”后，经随机令牌及 `127.0.0.1` 临时监听器成功返回编号、中英文名称、中文解释、全部运动规格、备注及演示链接 |

线上选择验收使用真实公开 HTTPS 站点和隔离 Chrome 浏览器，未模拟线上 API 或手工伪造回调。普通网页访问继续显示“复制所选”。本次验证覆盖当前环境；其他浏览器若阻止访问本地回环地址，应检查其本地网络访问提示，不应放宽回调校验。

## GitHub Pages 配置

版本控制中的 `.github/pages-source.json` 为 API 请求体：`build_type=legacy`、`source.branch=main`、`source.path=/`。它不会自行执行。确认发布后，按根 README 的命令创建 Fork、配置远程、推送，再调用 Pages API；也可通过 GitHub Settings 设置同样来源。

网站静态文件已随仓库提交，`.nojekyll` 保留。使用 GitHub 的分支发布流程，不需要自建工作流或把令牌写入仓库。当前 GitHub CLI 的凭据留在本机凭据管理器中，命令不提取或保存令牌。

## 上线后验证

- 确认目标仓库为 public、`fork=true`，父仓库为 `showheyohtaki/motion-prompt`，`main` 包含本地发布提交及完整上游历史。
- 等待 Pages 构建成功，再实际读取 HTTPS 首页、静态脚本、中文 `catalog.tsv`、`e/012.txt`、`p/012.txt` 及共享 `kit`；目录应有 144 项。
- 在真实 Pages 子路径检查默认简体中文、EN/JA 切换、搜索、中文复制、分享和详情；不将本地模拟结果冒充线上验证。
- 从 GitHub 安装到隔离测试项目：`npx skills add rainman016/motion-prompt-zh --skill motion-prompt-zh --agent codex --copy --yes`。
- 在独立安装副本中执行 info/search/get/prompt；确认实际来源为中文版线上 API，必要的备用来源明确显示。
- 从独立 Skill 启动 `pick --lang zh-Hans`，在真实 HTTPS 页面选择并回传到本地回环接收器；如浏览器策略或环境限制阻碍此项，记录实际限制。
- 完成后将根 README 的“预定地址 / 尚未发布”说明更新为已验证在线地址。

Fork 与 Pages 的官方依据：[GitHub CLI Fork](https://cli.github.com/manual/gh_repo_fork)、[配置 Pages 发布源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)、[Pages REST API](https://docs.github.com/en/rest/pages/pages#create-a-github-pages-site)。
