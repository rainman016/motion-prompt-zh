<!-- 由 tools/build.mjs 从 meta.json 生成，请修改源文件后重新构建。 -->

# 动态图形进阶

24 个效果 · #121–144 · 分类包 `motion2` · 其他语言: [English](README.md) / [日本語](README.ja.md)

找到效果名称后，直接告诉 AI；补充持续时间、强度与运动对象，结果会更接近你的想法。

![动态图形进阶 — 预览](../../assets/preview-motion2.gif)

## 运动技法

| 编号 | 中文名称 | 英文名称 | 名称解释 | 向 AI 提需求的示例 |
|---|---|---|---|---|
| [#121](https://rainman016.github.io/motion-prompt-zh/#121) | **预备动作** | Anticipation | 先短暂反向蓄力，再向前运动 | 按钮向右飞出前加预备动作，先用 0.3 秒轻微后退并压缩，再冲出。 |
| [#122](https://rainman016.github.io/motion-prompt-zh/#122) | **跟随惯性** | Follow-through | 主体停下后，附属部分继续摆动 | 角色停止后，头发与旗子保留约 0.5 秒的跟随惯性，继续摆动再稳定。 |
| [#123](https://rainman016.github.io/motion-prompt-zh/#123) | **落地弹跳** | Bounce | 落下后反复弹起，幅度逐渐降低 | 球从上方落下，弹跳三次，每次高度都比上次低。 |
| [#124](https://rainman016.github.io/motion-prompt-zh/#124) | **不规则抖动** | Wiggle | 持续细小、不规则地晃动 | 通知铃响起时持续轻微抖动，幅度不超过约 10°。 |
| [#125](https://rainman016.github.io/motion-prompt-zh/#125) | **脉冲缩放** | Pulse | 尺寸像心跳一样周期起伏 | 心形图标做脉冲缩放，每 1.2 秒放大约 10% 再恢复。 |
| [#126](https://rainman016.github.io/motion-prompt-zh/#126) | **运动路径** | Motion path | 沿预先定义的曲线移动 | 纸飞机沿这条运动路径飞行四秒，朝向始终跟随运动方向。 |
| [#127](https://rainman016.github.io/motion-prompt-zh/#127) | **往返循环** | Ping-pong loop | 正向播放后再反向播放，持续重复 | 加载圆点做往返循环，单程一秒。 |
| [#128](https://rainman016.github.io/motion-prompt-zh/#128) | **定格动画风格** | Stop-motion style | 通过跳帧产生逐格、顿挫的运动 | 这段运动做定格动画风格，每秒八帧，每帧加轻微抖动。 |

## 文字与图形

| 编号 | 中文名称 | 英文名称 | 名称解释 | 向 AI 提需求的示例 |
|---|---|---|---|---|
| [#129](https://rainman016.github.io/motion-prompt-zh/#129) | **文字乱码解码** | Text scramble | 字符随机变化，随后逐个锁定为目标文字 | 标题用文字乱码解码入场，随机字符持续约一秒，再从左到右锁定。 |
| [#130](https://rainman016.github.io/motion-prompt-zh/#130) | **波浪文字** | Wave text | 字符依次上下起伏，形成波浪 | 标志字符做波浪文字，依次略微延迟，上下约 20 px。 |
| [#131](https://rainman016.github.io/motion-prompt-zh/#131) | **沿路径文字** | Text on a path | 文字沿线条或曲线流动 | 标语沿波浪路径从左向右滚动，每五秒走完一轮。 |
| [#132](https://rainman016.github.io/motion-prompt-zh/#132) | **可变字重动画** | Variable font animation | 字形粗细连续变化 | 标题做可变字重动画，用一秒从 Thin 变到 Black，字重从 100 到 900。 |
| [#133](https://rainman016.github.io/motion-prompt-zh/#133) | **文字遮罩** | Text mask | 用文字轮廓裁出内部图像 | 把 OCEAN 作为文字遮罩，内部播放海面素材，最后一秒显露完整画面。 |
| [#134](https://rainman016.github.io/motion-prompt-zh/#134) | **图形重复器** | Repeater | 复制图形，并对副本做旋转排列 | 用重复器把花瓣复制十二份围成圆，每四秒转一圈。 |
| [#135](https://rainman016.github.io/motion-prompt-zh/#135) | **万花筒** | Kaleidoscope | 镜像图案对称扩散 | 标志后加万花筒，八向镜像对称，缓慢转动并向外扩散。 |
| [#136](https://rainman016.github.io/motion-prompt-zh/#136) | **手绘线条抖动** | Line boil | 手绘轮廓在逐帧重画时轻微变化 | 手绘插画加线条抖动，每秒十帧，线条仅移动 2–3 px。 |

## 转场与强调

| 编号 | 中文名称 | 英文名称 | 名称解释 | 向 AI 提需求的示例 |
|---|---|---|---|---|
| [#137](https://rainman016.github.io/motion-prompt-zh/#137) | **推移转场** | Push transition | 下一场景滑入，同时把当前场景推出 | 下一页从右侧推入转场，持续 0.8 秒。 |
| [#138](https://rainman016.github.io/motion-prompt-zh/#138) | **百叶窗转场** | Blinds transition | 通过多条窄带逐渐打开下一场景 | 用七条横带做百叶窗转场，在一秒内展开。 |
| [#139](https://rainman016.github.io/motion-prompt-zh/#139) | **立方体转场** | Cube transition | 像立方体转动一样切换场景 | 产品图片用立方体转场，用 0.8 秒向左转 90°。 |
| [#140](https://rainman016.github.io/motion-prompt-zh/#140) | **卷页转场** | Page curl | 像纸张卷起一样显露下一页 | 从右下角卷页进入下一章节，持续 1.2 秒。 |
| [#141](https://rainman016.github.io/motion-prompt-zh/#141) | **像素化转场** | Pixelate | 画面变成粗方块，在最粗时切换 | 做像素化转场，马赛克用 0.6 秒变粗，在最粗时切换场景。 |
| [#142](https://rainman016.github.io/motion-prompt-zh/#142) | **碎裂转场** | Shatter | 像玻璃一样破碎，碎片飞散 | 标题出现前让旧场景碎裂，先出现裂纹，再让碎片在约一秒内落走。 |
| [#143](https://rainman016.github.io/motion-prompt-zh/#143) | **爆炸分解图** | Exploded view | 将零件分离，展示内部结构 | 产品做爆炸分解图，四个部件在一秒内分开，各带名称标签。 |
| [#144](https://rainman016.github.io/motion-prompt-zh/#144) | **分屏** | Split screen | 分割画面，同时并列展示多个场景 | 同时显示三个场景，从一屏变两屏、再变三屏，每次 0.5 秒。 |

点击编号查看动画演示。单项的时序、缓动和参考代码： `api/v1/zh-Hans/e/<id>.txt` ([#121](../../api/v1/zh-Hans/e/121.txt)).

[全部分类包](../README.md)
