# 中文 Skill 集成增量验收

日期：2026-10-20。本轮基于当前中文化工作区继续修改；未重新克隆、覆盖翻译或发布远程仓库。

## 已有能力与本轮变更

原有 144 项中文资料、三语网页、中文 Prompt/搜索/复制、API 生成以及本地回环选择协议继续复用。本轮开始时保存的 16 个文件哈希核对一致：六包 `meta.json`、六包 `pack.js`、`site.css`、`runtime.js`、LICENSE 和第三方声明均未修改。

本轮补齐独立 `motion-prompt-zh` 技能标识、中文意图及实现指引、中文 CLI 输出、严格中文资源校验、共享配置、源码默认本地选取、独立安装与来源提示。旧 `skills/motion-prompt/scripts/motion-prompt.mjs` 转发到新目录，保留原命令兼容性。原 `references/porting.md` 内容保留。

源码仓库读取根 `site.config.json` 与本地 `api/v1`；独立安装读取生成的 `scripts/site-config.json`，默认尝试配置的中文版 Pages API 及同仓库原始文件。`MOTION_PROMPT_BASE` 继续优先，可指定本地目录或 URL。备用来源、缓存和离线目录缓存均明确说明来源；中文目录或资源不完整时拒绝运行，不以英文冒充。

生成的元素和 kit 版权行已恢复原作者站点链接；实际演示、中文 API 与 Prompt 链接使用中文版配置。作者姓名、MIT 标识与原代码保持。

## 实测结果

| 场景 | 实际结果 |
|---|---|
| 构建及静态检查 | `build.mjs`、`build.mjs --check`、`check-localization.mjs --static` 通过；6 包、144 元素、432 份三语 Prompt 与 432 份元素资源完整 |
| A：CLI | `check-skill.mjs` 实际调用 info/list/search/get/prompt/kit；144 项可访问，`zh-Hans` 与 `zh` 输出一致，英文/日文正常，旧 CLI 路径兼容 |
| 中文搜索 | 名称、分类、描述、别名和英文术语命中；实测“弹性”“选择与切换”“前两个开关”“拉焦”、typewriter、ポップイン |
| 中文缺失处理 | 删除中文字段、删除中文文件、用英文文件伪装中文路径均报明确错误；明确 `--lang en` 时仍能读取原语言 |
| 自定义 API 配置 | 在隔离副本重新构建，确认自定义 API URL 同步到 CLI 配置、生成 Prompt、参考文件头及网页复制 Prompt |
| 标准安装器 | 从本地源码运行 `npx skills add <本地仓库> --skill motion-prompt-zh --agent codex --copy --yes`，仅发现并安装 1 个 Skill；安装副本的 info/prompt 使用显式本地 API 通过 |
| Skill 格式 | skill-creator 的 `quick_validate.py` 通过；校验所需 PyYAML 仅安装在隔离验证目录，不作为网站或 Skill 运行依赖 |
| 独立安装与缓存 | 隔离 `.agents/skills` 副本按配置访问 HTTP API，模拟主站未发布而备用源可用，明确显示备用来源；缓存来源、断网后离线缓存和显式本地来源通过 |
| B：真实浏览器多选 | 实际启动 CLI 的临时监听器，浏览器打开完整 URL，选 #012/#059 并填中文备注，点击“发送给 AI”，CLI 收到正确中文名称、英文原名、解释、全部规格、备注及演示链接 |
| 本地默认行为 | 不传 `--local`、不传 `--lang` 时仍打开本地中文版；默认语言不受浏览器上一次英文偏好影响 |
| 独立安装在线模式 | 隔离安装版打开配置的 `/motion-prompt-zh/` 子路径，浏览器选择 #059/#060 并回传中文备注；此项使用本地 HTTP 模拟部署，并非已上线 Pages |
| 回调与普通访问 | 错误令牌 403、畸形编号 400、不允许的方法 405；本地 `.git` 路径拒绝；非回传访问及非法远程回调保留“复制所选” |
| D：网页回归 | 完整 `check-localization.mjs` 通过；三语、偏好/URL、刷新、详情、复制、选取、分享、根目录/子路径、1440/390/375/361/320 px 布局正常 |
| D：动画回归 | `check.mjs` 实际绘制全部 144 个动画：0 failed、0 warnings |
| 原实现及版权保护 | 432 份三语元素代码块、6 份 kit 实现与上游 HEAD 逐份比较一致；每份首行版权信息及原作者链接亦与上游一致 |

浏览器选择测试使用 `--no-open` 保留 CLI 会话，再由真实 Playwright 浏览器打开其完整 URL 并操作按钮，最后核对 CLI 输出与确认页；没有用伪造回调代替用户选择来宣称端到端通过。系统默认浏览器的启动器与真实 GitHub Pages HTTPS 环境仍需发布后复验。

## C：独立项目的实际实现

在主仓库外的隔离通知设置项目中，独立 Codex 子代理收到中文请求：“使用 $motion-prompt-zh，把我刚刚选择的动画用到当前项目的通知开关，保留保存设置功能。”其输入为上述真实浏览器回传的 #059 及中文备注，以及项目级安装的完整 Skill。

该实例读取项目、Skill 与原移植说明，并真实执行 `info`、`get 059 --lang zh-Hans` 和 `kit ui`，随后修改 HTML/CSS，实现通知开关，原 `app.js` 保存逻辑未改。验证保留 64×34 px 轨道、26 px 滑块、30 px 位移、200 ms 与 easeOutCubic；使用等价的 `cubic-bezier(1/3,1,2/3,1)`，支持真实点击、键盘与减少动态效果。

Chromium 验证五个中间采样点、反向切换、连续点击、保存结果、360 px 窄屏及减少动态效果，页面/控制台无错误；原 Canvas get/kit 代码亦实际执行并截图。原演示的模拟点击与自动循环被适配为真实 checkbox 事件。轨道按现有中文规格连续灰蓝混合；参考 Canvas 在进度超过 0.5 时直接设蓝，这一差异已在项目证据中说明，未改原翻译或代码。

测试项目和原始命令输出、截图、可复跑脚本保存在本次工作区的 `output/motion-prompt-skill-demo/`，不作为发布站点的一部分。测试验证了显式中文调用和实际实现；未将其视为用户所有既有 Codex 会话均已自动发现新 Skill 的证明。

## 未验证与发布边界

- 尚未创建或发布 `rainman016/motion-prompt-zh`，未 push、修改远程或 Pages 设置。预定地址不能视为已上线。
- 已验证标准安装器的本地源码安装；真实 GitHub 安装、生产 API、HTTPS 页面到本地回环的浏览器策略需发布后复验。部署前独立副本可通过 `MOTION_PROMPT_BASE` 使用本地中文 API，浏览器选择使用完整源码 CLI 的本地模式。
- Chrome/Chromium 已实测；Firefox/Safari、实际屏幕阅读器播报未测试。
- 未改用户已安装的原版 Skill，也未写入全局 Agent 配置。中文隐式触发依赖目标项目先按 README 安装 Skill；未穷举所有自然语言表达。

本地调用、独立安装和发布后的命令见根 [README](../README.md)。
