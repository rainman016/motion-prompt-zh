<!-- 由 tools/build.mjs 从 meta.json 生成，请修改源文件后重新构建。 -->

# 落地页与网页动效

24 个效果 · #073–096 · 分类包 `lp` · 其他语言: [English](README.md) / [日本語](README.ja.md)

找到效果名称后，直接告诉 AI；补充持续时间、强度与运动对象，结果会更接近你的想法。

## 滚动效果

| 编号 | 中文名称 | 英文名称 | 名称解释 | 向 AI 提需求的示例 |
|---|---|---|---|---|
| [#073](https://rainman016.github.io/motion-prompt-zh/#073) | **视差滚动** | Parallax scrolling | 页面滚动时背景图层比内容移动得慢 | 首屏背景做视差滚动，位移为滚动距离的 0.3×。 |
| [#074](https://rainman016.github.io/motion-prompt-zh/#074) | **滚动淡入** | Fade-in on scroll | 元素滚入视口时逐渐显现 | 各区标题和卡片滚入时，从下方 30 px 处用 0.6 秒上移淡入。 |
| [#075](https://rainman016.github.io/motion-prompt-zh/#075) | **吸顶页头** | Sticky header | 页面滚动时页头固定在顶部 | 页头设置吸顶，固定后增加柔和阴影。 |
| [#076](https://rainman016.github.io/motion-prompt-zh/#076) | **滚动固定分区** | Pinning | 分区保持固定，滚动推进内部内容 | 固定三步介绍分区，用户滚动时逐步切换图片和编号。 |
| [#077](https://rainman016.github.io/motion-prompt-zh/#077) | **横向滚动** | Horizontal scroll | 向下滚动，内容横向移动 | 作品区做横向滚动，用户下滚时卡片向左移动相应距离。 |
| [#078](https://rainman016.github.io/motion-prompt-zh/#078) | **滚动吸附** | Scroll snap | 滚动后准确停在下一分区边缘 | 每个分区加滚动吸附，轻微滚动后自动停在下一分区顶部。 |
| [#079](https://rainman016.github.io/motion-prompt-zh/#079) | **阅读进度条** | Scroll progress bar | 顶部进度条显示阅读位置 | 文章页顶部加 4 px 品牌橙色阅读进度条。 |
| [#080](https://rainman016.github.io/motion-prompt-zh/#080) | **荧光笔划线** | Highlighter animation | 关键词下方逐渐画出高亮笔迹 | 关键词滚入视口后，用 0.8 秒从左向右画出黄色荧光笔高亮。 |

## 悬停与点击交互

| 编号 | 中文名称 | 英文名称 | 名称解释 | 向 AI 提需求的示例 |
|---|---|---|---|---|
| [#081](https://rainman016.github.io/motion-prompt-zh/#081) | **悬停抬升** | Hover lift | 悬停时元素上浮，阴影加深 | 卡片悬停时用 0.3 秒上浮 8 px，阴影加深。 |
| [#082](https://rainman016.github.io/motion-prompt-zh/#082) | **悬停图片放大** | Image zoom on hover | 固定边框内的照片逐渐放大 | 作品照片悬停时保持边框不变，内部用 0.5 秒放大到 1.1×。 |
| [#083](https://rainman016.github.io/motion-prompt-zh/#083) | **光标跟随** | Cursor follower | 图形稍有延迟地跟随鼠标 | 全站增加光标跟随，30 px 橙色圆略微落后于鼠标。 |
| [#084](https://rainman016.github.io/motion-prompt-zh/#084) | **磁吸按钮** | Magnetic button | 按钮被附近的光标轻微吸引 | 联系按钮做磁吸效果，向光标移动距离的 0.3×，移开后弹回。 |
| [#085](https://rainman016.github.io/motion-prompt-zh/#085) | **点击涟漪** | Ripple effect | 波纹从按下位置向外扩散 | 提交按钮加点击涟漪，白圆从点击点扩散，并在 0.6 秒内淡出。 |
| [#086](https://rainman016.github.io/motion-prompt-zh/#086) | **下划线动画** | Underline animation | 悬停链接时，下划线从左侧伸展 | 菜单链接悬停时用 0.3 秒从左侧画出下划线，移开后向右消退。 |
| [#087](https://rainman016.github.io/motion-prompt-zh/#087) | **前后对比滑块** | Before/after slider | 拖动分隔线比较处理前后 | 项目照片做前后对比滑块，拖动中线比较左侧处理前与右侧处理后。 |
| [#088](https://rainman016.github.io/motion-prompt-zh/#088) | **离站挽留弹窗** | Exit-intent popup | 访客准备离开时出现弹窗 | 落地页增加一次性的离站挽留弹窗，光标从顶部移出时展示优惠券。 |

## 加载、导航与循环动效

| 编号 | 中文名称 | 英文名称 | 名称解释 | 向 AI 提需求的示例 |
|---|---|---|---|---|
| [#089](https://rainman016.github.io/motion-prompt-zh/#089) | **预加载屏** | Preloader | 页面加载期间显示的过渡屏幕 | 站点加载时显示标志和百分比，达到 100% 后整屏向上移走。 |
| [#090](https://rainman016.github.io/motion-prompt-zh/#090) | **懒加载** | Lazy loading | 图片进入视口后才开始加载 | 图库图片使用懒加载，完成前显示灰色占位，加载后用 0.3 秒淡入。 |
| [#091](https://rainman016.github.io/motion-prompt-zh/#091) | **无限滚动** | Infinite scroll | 到达列表底部时自动加载更多 | 新闻列表做无限滚动，底部显示旋转指示器，每次追加十条。 |
| [#092](https://rainman016.github.io/motion-prompt-zh/#092) | **页面转场** | Page transition | 用动画连接两个页面 | 点击链接后让橙色面板从左向右扫过，再显示下一页面。 |
| [#093](https://rainman016.github.io/motion-prompt-zh/#093) | **平滑滚动** | Smooth scroll | 页内链接平滑移动到目标，而非直接跳转 | 菜单页内链接使用平滑滚动，停在固定页头下方。 |
| [#094](https://rainman016.github.io/motion-prompt-zh/#094) | **无缝跑马灯** | Marquee | 文字或标志沿条带持续循环滚动 | 服务名称从右向左无缝跑马灯滚动，速度约每秒 80 px。 |
| [#095](https://rainman016.github.io/motion-prompt-zh/#095) | **动态渐变** | Animated gradient | 背景颜色持续漂移融合 | 首屏使用橙蓝缓慢融合的动态渐变背景，每十秒一轮。 |
| [#096](https://rainman016.github.io/motion-prompt-zh/#096) | **悬浮动画** | Floating animation | 元素轻柔地上下浮动 | 首屏手机图加悬浮动画，上下 8 px，每 2.4 秒起伏一次。 |

点击编号查看动画演示。单项的时序、缓动和参考代码： `api/v1/zh-Hans/e/<id>.txt` ([#073](../../api/v1/zh-Hans/e/073.txt)).

[全部分类包](../README.md)
