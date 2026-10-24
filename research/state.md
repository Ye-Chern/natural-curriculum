# 当前研究与教材入口

更新：2026-10-24（Asia/Singapore）。本轮[教材 PR #2](https://github.com/Ye-Chern/natural-curriculum/pull/2)，分支 `textbook/coset-actions`，基于 main `85d9af7`。

## 已完成的第二章

[把子群变成位置](../chapters/coset-actions.qmd)从第一章 C₁₂ 的四个陪集出发，重证陪集划分、拉格朗日定理、左乘良定义、轨道—稳定子、传递作用的陪集模型、核与核心、单群忠实性、μ=d 以及阶乘整除下界。九道练习附答案；五点生成群只是下一次探索的问题，没有提前发布 A₅ 单性。

[陪集舞台](../experiments/coset-stage.html)独立运行，比较 C₆ 与 S₃ 的三点作用。正文与独立页面均有静态说明，控件支持键盘。两种模型的陪集成员、复合方向、轨道、稳定子与核有独立有限核对。

数学审读的实际修正与范围见 [独立审读](chapter-two-independent-review.md)及[本轮验收摘要](second-round-review.md)。初学者[试读材料](reader-trial-chapter-two.md)已经准备，**尚无真人试读数据**。

## 本地验收事实

- `python scripts/project.py verify` 全部通过：15项 Node 测试（含原25,956组循环群参数和 n≤12 的独立子群枚举）、4项内容边界测试、固定版本 Quarto 构建、6个 HTML 页面的站内链接／锚点／资源检查、26项桌面／手机浏览器测试。
- 主整合者检查实际截图：章节中的实验、窄屏数学证明及两个模型的独立页面。MathJax、文献、生成导航、键盘与无脚本阅读已自动核对。
- PR #1 原工作树上的最小指数冻结记录、Fano 模型重算和9项研究测试通过；这里没有声称重新运行 GAP 扫描。
- 实施提交 `2863886` 的云端[教材验收](https://github.com/Ye-Chern/natural-curriculum/actions/runs/40079529202)与[完整容器验收](https://github.com/Ye-Chern/natural-curriculum/actions/runs/40079529253)均成功；已读实际日志，两边都完成15项数学实现、4项内容、6页链接与26项浏览器检查。容器首次复现的 Yarn 签名问题已修复。后续提交以 PR 最新检查为准；只有 main 合并后才部署 Pages。

## 分支关系与已知研究

[PR #1](https://github.com/Ye-Chern/natural-curriculum/pull/1)在本轮实查时仍为 Draft/Open，HEAD `cf8e766`，未代为合并。其[最小指数研究稿](https://github.com/Ye-Chern/natural-curriculum/blob/cf8e766dd14f784b083f66189cd4e5962896884d/research/minimal-index.md)仍是低次数分类、Fano 结构与 GAP 2…12 扫描的研究入口。本轮教材自己的证明自足，不需要 PR #1 先合并。

两项教材事件使用独立 ID；PR #1 含本原性的研究事件仍留研究层。未来合并的索引与状态处理见 [HELP](../HELP.md#分支交接pr-1-尚未合并)。生成导航只由脚本更新。

PSL₂(8) 的候选证明已在独立分支 `research/psl28-verified` 核查并保存：[完整证明](https://github.com/Ye-Chern/natural-curriculum/blob/research/psl28-verified/research/psl2-8.md)。七点排除明确依赖 A₇ 单性；八点排除以36个 Sylow 7-子群的唯一固定点得到36=8r矛盾。该分支基于 PR #1，未并入教材 PR，未扩大 GAP 范围；一般 PSL₂(q) 家族与四个例外仍待项目内复现。

## 接下来由什么问题推动

先用试读材料收集真实初学者反馈；数学上辨认五点生成群，证明其阶与单性，再判断适合怎样写 A₅。研究上可以继续解释 M12 的11到12缺口，或复现 PSL₂(q) 家族。没有预设此后的全书目录。

第二轮重构的具体出发点见 [design-second-round.md](design-second-round.md)。首轮环境与部署历史保留在 [85d9af7](https://github.com/Ye-Chern/natural-curriculum/blob/85d9af72faed62367c0b0ea8ae79ee04982c6d4e/research/state.md) 和 PR #1；不再把已完成的初始化作为当前待办。
