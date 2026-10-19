# The Natural Curriculum | 自然生长的数学教材

**A textbook whose structure emerges from mathematical discovery, not from a predefined syllabus.**

这不是一本预先列好全书目录、再填充内容的教材。我们从易于探索的数学问题出发，逐渐增加结构复杂度；当此前不可能出现的现象首次出现，便学习解释它所需要的数学，并沿着真实的关联深入其他领域。

## 从哪里开始

从钟表上的重复旋转认识循环群 $C_n$，进一步认识群、子群和素数阶循环单群；随后研究有限集合上的群作用、陪集与指数，走向

$$
\mu(G)=\min_{H<G}[G:H]
$$

其中 $G$ 为非平凡有限单群。我们考察不同最小指数首次带来的新现象，允许群论与有限几何、表示论、数论、谱理论、编码理论自然相遇。

**没有预定终点和全书章节表。** 大纲不是项目的先决条件；数学上的“首次出现”、理论需要与教育价值共同决定后续内容。CFSG 可以是长远的地平线，不是近期交付任务。

## 如何写每个主题

- **发现**：提出简单、可以尝试的具体问题；允许读者先猜，再证明。
- **严谨**：清楚列出定义、完整证明、外部定理依赖、计算证据和未解决问题的区别。
- **历史**：区分有来源的数学史实、现代教学性的发现重建，以及本项目自己的猜想与修正记录。
- **联系**：保留真正有数学内容的跨领域关系，而不是为了好看堆砌趣闻。
- **交互**：用 MathJax、JavaScript/SVG 制作有助于思考的实验，同时提供静态解释。

## 项目状态

首轮教材包含首页、[循环群首章](chapters/cyclic-groups.qmd)、[数学事件索引](events.qmd)与[文献](references.bib)。首章从交互钟表出发，给出 Bézout 引理、轨道长度公式、循环群子群分类、素数阶单性及 $\mu(C_p)=p$ 的证明，并附六道练习与答案。

**教材发布地址：[The Natural Curriculum](https://ye-chern.github.io/natural-curriculum/)** · [自动构建记录](https://github.com/Ye-Chern/natural-curriculum/actions/workflows/book.yml)

2026-10-20 首次交接：本地构建和测试已通过；GitHub 官方 Actions／Pages 故障期间，首次云端验收和上线仍在等待。最新事实以工作流和[研究状态](research/state.md)为准；首次部署成功前发布地址可能返回 404。

已进行 GPT-6 Luna 的独立数学文本审读与 Gemini 的教学质疑；这些不替代真实初学者试读或正式数学审稿。[研究状态](research/state.md)保留验证结果、取舍与下一步问题。后续参与者请先读 [AGENTS.md](AGENTS.md)。

## 本地启动（Windows / Linux / macOS）

准备 Git、Python **3.12+**、Node.js **24**。Quarto 固定为 `.quarto-version` 中的 **1.10.19**；以下安装器从官方 release 下载并核对发布清单的 SHA-256，放在项目内被忽略的 `.local/`，不修改全局安装。

```sh
git clone https://github.com/Ye-Chern/natural-curriculum.git
cd natural-curriculum
python scripts/project.py setup
python scripts/project.py render
python scripts/project.py preview
```

打开终端显示的地址（默认 `http://localhost:4200`）；结束预览用 Ctrl+C。若系统使用 `python3` 命令，以下 `python` 相应替换；Quarto 的预渲染脚本要求 PATH 中也提供 `python`，可使用 Python 虚拟环境。若有其他 Quarto 版本，安装器仍会使用项目内的固定版本；也可用 `QUARTO_BIN` 指向同版本入口。

阅读与构建不需要 npm 包。交互本身是原生 JavaScript/SVG；MathJax 由 Quarto 引用 CDN，**公式的排版需要网络**，无脚本时仍保留静态实验和全部数学文字。无需数据库、前端打包器、Jupyter 或 LaTeX。

## 修改后的验收

```sh
npm ci
npx playwright install chromium
npm test
python scripts/project.py render
python scripts/project.py check
npm run test:browser
```

Linux 首次运行浏览器测试时使用 `npx playwright install --with-deps chromium` 安装系统依赖。Windows 若终端阻止 `npm.ps1`，可用 `npm.cmd` 与 `npx.cmd`。Playwright 只是开发依赖，不进入教材运行时。

- 数学代码检查覆盖全部 **25,956** 组界面允许的 $(n,k)$；另独立枚举 $n\le12$ 的所有子集，核对全部子群与约数分类。
- 这些有限计算用于检查实现，**不能代替正文的一般证明**。
- 构建检查核查本地页面、资源、锚点与引用；浏览器检查覆盖桌面、窄屏、负步长、零步长、$n=1$、无效输入、键盘与无 JavaScript 阅读。

## 云端工作与自动发布

在 GitHub 仓库点击 **Code → Codespaces → Create codespace on main**，或使用本地 VS Code 的 **Reopen in Container**。`.devcontainer/devcontainer.json` 提供 Python 3.12、Node 24，创建后自动安装固定 Quarto、测试浏览器并构建教材。在容器终端运行：

```sh
python scripts/project.py preview --host 0.0.0.0 --port 4200
```

打开转发的 4200 端口即可编辑与预览。云端工作区是否成功创建以 Codespaces 的实际日志为准；GitHub Actions 是另一条无需常驻工作区的 Linux 验收路径。

每次推送 `main` 或提交 PR，GitHub Actions 安装锁定依赖、运行数学检查、构建与浏览器测试。**仅 `main` 在检查成功后发布到 Pages**；PR 没有发布权限。构建任务只有 `contents: read`，部署任务只有 `pages: write` 与 `id-token: write`，使用 Actions 自带凭据，不需要个人 Token。生成的 `_book/` 不入 Git。

本仓库已通过 API 将 Pages 配置为 Actions 部署。复用到新仓库时，需将 **Settings → Pages → Source** 设置为 **GitHub Actions**。工作流也可从 Actions 页面手动运行。

另有 [云端环境验收](https://github.com/Ye-Chern/natural-curriculum/actions/workflows/environment.yml)：实际构建同一份 Dev Container，在容器内安装工具、构建教材并运行测试；仅环境相关文件变更时自动触发，也可手动运行。它不发布容器镜像，不创建常驻或收费的 Codespace。

## 让内容带动结构

正文在 `chapters/*.qmd`，实验在 `assets/cyclic.js`，文献统一在 `references.bib`。`research/events.json` 是极小的事件记录，使用 JSON 避免为元数据额外安装解析库，保留参数、对象、证据、证明状态、依赖与正文锚点。

```sh
python scripts/sync_content.py
python scripts/sync_content.py --check
git grep "prime-cyclic-simple"
```

脚本从状态为 `proved` 且有真实正文和锚点的条目生成 `_chapters.yml` 与 `events.qmd`。草稿可保留在元数据中，但不会预占导航；新主题有可读正文、证明和事件证据后才增长目录。请勿手工编辑这两份生成文件。

下一步首先做真实初学者试读，再从“陪集能否被群搬动”建立群作用。是否引入新的单群或几何对象，应由之后的论证决定。

> 对任何数学结论，请保留可核查的证明或来源；数学史与数学发现的教学重建必须明确区别。
