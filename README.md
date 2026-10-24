# The Natural Curriculum | 自然生长的数学教材

**让证明与数学对象决定下一章。** 从钟表的重复旋转开始；一个问题产生了新的对象，我们才学习解释它所需要的数学。不预编全书目录，也不要求每个整数各占一章。

## 阅读

- [钟表上的循环群](chapters/cyclic-groups.qmd)：从跳格发现生成元、子群、素数阶单性与 μ(Cₚ)=p。
- [把子群变成位置：从陪集到群作用](chapters/coset-actions.qmd)：从 C₁₂ 的四个陪集出发，建立轨道、稳定子、作用核，以及有限单群的 μ(G)=d(G)。
- [陪集舞台](experiments/coset-stage.html)：可以单独使用的 C₆、S₃ 三点实验；正文另有完整静态说明。
- [数学事件索引](events.qmd)和[文献](references.bib)：查找已进入正文的证明与来源。

[在线教材](https://ye-chern.github.io/natural-curriculum/)发布的是 **main 已验收的版本**；PR 中新增章节合并前请使用本地预览。[构建记录](https://github.com/Ye-Chern/natural-curriculum/actions/workflows/book.yml)显示每次验收的实际结果。

## 本地阅读与修改

准备 Git、Python 3.12+、Node.js 24。Quarto 固定为 `.quarto-version` 指定的版本，安装器核对官方发布清单的 SHA-256，工具保存在项目内。

```sh
git clone https://github.com/Ye-Chern/natural-curriculum.git
cd natural-curriculum
python scripts/project.py setup
python scripts/project.py render
python scripts/project.py preview
```

打开显示的地址，按 Ctrl+C 结束预览。教材采用 **Quarto + MathJax + 原生 JavaScript/SVG**，阅读和构建不需要 npm 包。公式排版需要 MathJax 的网络资源；陪集舞台通过本地服务加载后无需外部网络，两个实验都保留静态说明。

## 修改后的验收

首次准备开发依赖：

```sh
npm ci
npx playwright install chromium
```

以后运行同一个入口：

```sh
python scripts/project.py verify
```

它依次执行数学实现检查、内容索引检查、Quarto 构建、站内链接检查及桌面／手机浏览器测试。GitHub PR 使用同一套检查，只有 main 通过后才部署 Pages。安装或浏览器遇到问题时见 [HELP.md](HELP.md)。

## 继续研究或写作

从 [research/state.md](research/state.md)取回当前问题、分支关系与验收事实；协作约定见 [AGENTS.md](AGENTS.md)。研究稿可以积累证明、反例与计算，只有已转写为可读正文的证明才进入教材导航。`research/events.json` 是事件的单一来源；运行 `python scripts/sync_content.py` 生成导航，请勿手工修改 `_chapters.yml` 或 `events.qmd`。

第二轮为什么这样重构，详见[设计出发点与取舍](research/design-second-round.md)。项目共通边界集中在 [NOTICE.md](NOTICE.md)；初学者试读材料见 [reader-trial-chapter-two.md](research/reader-trial-chapter-two.md)。
