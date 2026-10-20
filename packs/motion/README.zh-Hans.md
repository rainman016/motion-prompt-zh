<!-- 由 tools/build.mjs 从 meta.json 生成，请修改源文件后重新构建。 -->

# 动态图形基础

24 个效果 · #001–024 · 分类包 `motion` · 其他语言: [English](README.md) / [日本語](README.ja.md)

找到效果名称后，直接告诉 AI；补充持续时间、强度与运动对象，结果会更接近你的想法。

![动态图形基础 — 预览](../../assets/preview-motion.gif)

## 入场与文字

| 编号 | 中文名称 | 英文名称 | 名称解释 | 向 AI 提需求的示例 |
|---|---|---|---|---|
| [#001](https://rainman016.github.io/motion-prompt-zh/#001) | **弹性弹入** | Pop-in | 带轻微回弹地出现 | 让标志以弹性弹入方式出现，约 0.4 秒，稍微超出目标尺寸再回落。 |
| [#002](https://rainman016.github.io/motion-prompt-zh/#002) | **交错入场** | Stagger | 多个元素依次出现，时间略有错开 | 让五张卡片交错入场，从左到右每张间隔 0.08 秒。 |
| [#003](https://rainman016.github.io/motion-prompt-zh/#003) | **放射迸发** | Burst | 元素出现时，线条和圆点向外迸发 | 心形出现的瞬间加一圈放射迸发：八根短线，在 0.3 秒内淡出。 |
| [#004](https://rainman016.github.io/motion-prompt-zh/#004) | **路径描边** | Line draw | 线条像被画出来一样逐渐延伸 | 让图表折线从左侧开始路径描边，用 1.2 秒画完。 |
| [#005](https://rainman016.github.io/motion-prompt-zh/#005) | **遮罩揭示** | Mask reveal | 文字从不可见的边缘后方升起 | 标题从下方以遮罩揭示方式升起，持续 0.6 秒，各行略微错开。 |
| [#006](https://rainman016.github.io/motion-prompt-zh/#006) | **打字机效果** | Typewriter | 文字像键盘输入一样逐字出现 | 这句话用打字机效果呈现，每字 0.05 秒，末尾加光标。 |
| [#007](https://rainman016.github.io/motion-prompt-zh/#007) | **数字递增** | Count-up | 数字快速增长，最终停在目标值 | 数字从 0 递增到 1,280，用 1.5 秒完成，接近终点时减速。 |
| [#008](https://rainman016.github.io/motion-prompt-zh/#008) | **动态字体编排** | Kinetic typography | 文字随语义和节奏移动、缩放、旋转 | 把这段旁白做成动态字体编排，重读词放大，并在节拍上落定。 |

## 运动润饰

| 编号 | 中文名称 | 英文名称 | 名称解释 | 向 AI 提需求的示例 |
|---|---|---|---|---|
| [#009](https://rainman016.github.io/motion-prompt-zh/#009) | **缓动** | Easing | 运动有加速与减速，而非始终匀速 | 给这段运动加缓动，用 ease-out，在停止前逐渐减速。 |
| [#010](https://rainman016.github.io/motion-prompt-zh/#010) | **过冲回弹** | Overshoot | 先超过目标位置，再回落稳定 | 仪表指针加过冲，超过目标约 10% 后再回落。 |
| [#011](https://rainman016.github.io/motion-prompt-zh/#011) | **挤压与拉伸** | Squash & stretch | 通过压扁和拉长表现弹性 | 球落地时加挤压与拉伸，压扁幅度轻一些。 |
| [#012](https://rainman016.github.io/motion-prompt-zh/#012) | **形状变形** | Shape morph | 一个形状平滑过渡为另一个形状 | 用 0.8 秒把圆形变成星形，同时颜色从蓝色变成黄色。 |
| [#013](https://rainman016.github.io/motion-prompt-zh/#013) | **液态运动** | Liquid motion | 形状像液体一样运动并融合 | 标志用液态运动入场，让液滴聚拢成形。 |
| [#014](https://rainman016.github.io/motion-prompt-zh/#014) | **运动拖尾** | Motion trail | 移动物体身后留下逐渐消失的轨迹 | 给飞行圆球加运动拖尾，身后五个副本逐渐淡出。 |
| [#015](https://rainman016.github.io/motion-prompt-zh/#015) | **粒子喷发** | Particles | 大量小颗粒飞出并散开 | 成功时从底部向上喷出四色粒子，在 1.5 秒内全部落下。 |
| [#016](https://rainman016.github.io/motion-prompt-zh/#016) | **视差运动** | Parallax | 远近图层以不同速度移动，形成空间深度 | 把风景分成三层做视差滚动，越近的图层移动越快。 |

## 转场与强调

| 编号 | 中文名称 | 英文名称 | 名称解释 | 向 AI 提需求的示例 |
|---|---|---|---|---|
| [#017](https://rainman016.github.io/motion-prompt-zh/#017) | **遮罩转场** | Mask transition | 下一场景从扩张的形状内部显现 | 用遮罩转场切换场景，让圆形从中心扩张，持续 0.7 秒。 |
| [#018](https://rainman016.github.io/motion-prompt-zh/#018) | **图形转场** | Shape transition | 图形覆盖画面后离开，显露下一场景 | 用图形转场切换场景，四条斜向彩带从左侧扫入覆盖画面。 |
| [#019](https://rainman016.github.io/motion-prompt-zh/#019) | **液态转场** | Liquid transition | 液体流入并替换当前场景 | 这里用液态转场，蓝色墨水从顶部滴落并铺满画面。 |
| [#020](https://rainman016.github.io/motion-prompt-zh/#020) | **穿越放大转场** | Zoom through | 放大进入物体内部，并穿越到下一场景 | 加速穿过标志中“O”的孔洞进入下一场景，持续 0.6 秒。 |
| [#021](https://rainman016.github.io/motion-prompt-zh/#021) | **卡片翻转** | Flip | 像卡片一样翻到另一面 | 价格卡片用 0.5 秒翻转，显示背面的详情。 |
| [#022](https://rainman016.github.io/motion-prompt-zh/#022) | **扫光** | Light sweep | 一束光带掠过物体表面 | 标志停稳后加一次轻微扫光，从左上向右下掠过。 |
| [#023](https://rainman016.github.io/motion-prompt-zh/#023) | **故障干扰** | Glitch | 画面像信号故障一样错位破碎 | 标题加短暂故障干扰，持续 0.3 秒，色差轻一些，不要闪屏。 |
| [#024](https://rainman016.github.io/motion-prompt-zh/#024) | **冲击震屏** | Impact shake | 物体落地时带动整幅画面震动 | 标题砸下的一瞬间加冲击震屏，约 0.4 秒内平稳下来。 |

点击编号查看动画演示。单项的时序、缓动和参考代码： `api/v1/zh-Hans/e/<id>.txt` ([#001](../../api/v1/zh-Hans/e/001.txt)).

[全部分类包](../README.md)
