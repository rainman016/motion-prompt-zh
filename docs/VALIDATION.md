# 本地验收记录

日期：2026-10-20。基线：上游 `b4b676ef693080e78b706e36b47a8faa5286298e`。本记录描述本地实际执行，不代表已上线。

本页保留首次中文化的验收记录；后续 Skill 独立安装、多选回传与实际项目实现结果见 [Skill 集成验收](SKILL-INTEGRATION.md)。

| 验证 | 结果 |
|---|---|
| `node tools/build.mjs` | 通过，6 包、144 元素，生成三语 API、中文 README、配置及元数据 |
| `node tools/build.mjs --check` | 通过，无错误、无警告 |
| 连续构建 | 两次构建后全仓库文件哈希一致，无生成漂移 |
| 中文内容与规格检查 | 144/144 完整；全部中文 spec 行数和数值与英文逐行对应 |
| 中文资源 | 144 份 `e`、144 份 `p`、1 份 TSV、6 份分类 README |
| `node tools/check-localization.mjs` | 通过，覆盖静态资源、浏览器与真实 Skill 回传 |
| 网页/API Prompt | 三语全部 432 份与共享模板一致；实测中文复制与 API 内容一致，Windows 剪贴板仅标准化换行 |
| 搜索 | “弹性”“遮罩”“镜头推进”、typewriter、`#144`、`012` 均命中对应条目 |
| 语言与刷新 | 默认 zh-Hans；URL 优先；偏好保存；zh 归一；无效参数回退；首页与案例页 ZH/EN/JA 切换及刷新通过 |
| 交互 | 详情、暂停控件、复制 Prompt、选取、备注、复制所选、分享、恢复分享选择、清空通过 |
| 本地与 Pages 子路径 | 同一本地服务器在 `/` 及 `/motion-prompt-zh/` 下通过；所测站内请求无 404 |
| 桌面和手机 | 1440、390、375、361、320 px 通过，无横向溢出；已截图检查首页和详情，修复窄屏导航溢出 |
| Skill 回传 | 本地 `pick --local --no-open --lang en` 打开，网页改为中文，选 #012，发送后接收中文确认和完整中文规格 |
| `node tools/check.mjs` | 144 个元素实际绘制检查，0 failed、0 warnings |
| 上游数据保护 | 原英文、日文和其他原字段深比较一致；所有 ID、排序、slug、tags 未变 |
| 源码与版权保护 | 六包 pack.js、runtime.js、LICENSE、THIRD-PARTY-NOTICES.md 与基线一致；原 README 完整保存为 README.en.md |
| 运行依赖 | 使用环境已有 Playwright 与 Python，网站未新增第三方运行依赖；仓库字体文件数为 0 |

运行环境为 Windows，Node.js v24.19.0，使用环境自带 Playwright 和本机 Chromium/Chrome。原绘制检查增加跨平台 Python 选择，可通过 `MP_PYTHON` 指定可执行文件。最初的本机连接被沙箱阻止（EACCES），在允许本机回环后重新执行成功；该初次失败未记为通过。

## 实际限制

- 未创建 GitHub 仓库、push 或修改 Pages 设置。预定生产地址尚未由本任务部署，远程生产 404、缓存、真实域名下剪贴板和独立安装 Skill 的远程读取应在发布后复验。
- 测试使用本地 HTTP 模拟 Pages 子路径。案例页本站中文、三语切换及原帖链接已验证；外部 X 嵌入在测试中被拦截，未宣称真实帖子在线可加载。
- Canvas 内原始演示字样保留，中文解释位于卡片和详情。上游历史视频、速查图和独立 make-your-own 工具未重新制作中文媒体，范围见 LOCALIZATION.md。
- 数值和行数校验不能自动证明所有术语和非数值约束的语义绝对正确；本次已逐项阅读原英文并翻译，后续上游变更仍需同步复核。

## 关键文件

- 源数据：`packs/{motion,camera,ui,lp,photo,motion2}/meta.json`。
- 界面：`index.html`、`found.html`、`assets/{language,site,found}.js`、`assets/site.css`、`examples/found.json`。
- 配置/生成：`site.config.json`、`tools/build.mjs`、`assets/catalog.js`、`api/v1/zh-Hans/`。
- Skill：现位于 `skills/motion-prompt-zh/SKILL.md`、`scripts/motion-prompt.mjs` 和生成的 `scripts/site-config.json`；旧 CLI 路径保留兼容入口。
- 文档/验证：`README.md`、`README.en.md`、`CHANGELOG.zh-Hans.md`、`FORMAT.md`、`docs/`、`tools/check-localization.mjs`。

构建、预览、GitHub 发布和 Pages 开启的可执行步骤均在根 README；维护同步说明在 LOCALIZATION.md。
