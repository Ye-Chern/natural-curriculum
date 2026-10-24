# 按问题查帮助

## Quarto 或 Python 没找到

常用入口见 README。`python scripts/project.py setup` 使用固定 Quarto 版本；如果已有同版本安装，可以设置 `QUARTO_BIN` 指向可执行文件。离线或不受安装器支持的平台请手动安装 `.quarto-version` 的版本。下载校验不一致时恢复网络后重试 setup，不应跳过校验。

系统只有 `python3` 时可用虚拟环境提供 `python`，因为 Quarto 的预渲染脚本也使用该名称。Windows 若阻止 npm.ps1，用 `npm.cmd` 和 `npx.cmd`。

## 浏览器测试无法启动

首次安装依赖用 `npm ci`，然后 `npx playwright install chromium`；Linux 使用 `npx playwright install --with-deps chromium`。`verify` 会使用平台对应的 npm 入口。4201 端口用于自动测试；若已被占用，先停止占用它的旧测试服务，再重跑。交互式预览默认使用 4200。

只检查局部时可以分别运行 `npm test`、`python -m unittest discover -s tests -p "test_*.py"`、`python scripts/project.py render`、`python scripts/project.py check`、`npm run test:browser`。页面截图与失败追踪保存在被忽略的 `test-results/`。

## 公式或实验没有出现

MathJax 的网络请求失败时，公式可能保留为源码；检查网络后刷新。实验无需 MathJax。陪集舞台在 `experiments/coset-stage.html`，需同时保留旁边的 `assets/`。浏览器可能限制 file:// 下的模块，运行教材预览并通过 HTTP 打开实验。禁用脚本时阅读始终保留的静态说明即可。

## 导航没有新增章节

检查 `research/events.json`：条目要有 `status: proved`、真实章节和存在的锚点，然后运行 `python scripts/sync_content.py`。研究已证与计算条目应保留 `research_file`，不为了让它出现在侧栏而改成 proved。索引检查报错应修来源，不直接编辑生成文件。

## 分支交接：PR #1 尚未合并

2026-10-24 查得 [研究 PR #1](https://github.com/Ye-Chern/natural-curriculum/pull/1) 为 Draft/Open，HEAD `cf8e766`。第二章分支 `textbook/coset-actions` 基于 main `85d9af7`，自己的正文重证所需结论，不复制 PR #1 的扫描、分类或研究证明。教材 PR 可以独立审阅和合并。

之后两分支汇合时，合并 `research/events.json` 中不同 ID 的条目，保留第二章的教材条目和 PR #1 的研究条目。`minimal-index-core-primitive` 包含本原性，第二章未教该部分，应继续为 research-proved；新条目 `coset-actions-foundation`、`simple-faithful-degree` 只覆盖本章已教范围。保留支持研究状态的索引校验，重新运行生成脚本；不要逐行拼接 `_chapters.yml` 和 `events.qmd`。`research/state.md` 保留一个当前入口，历史验证放回对应审查记录或提交链接。合并后重跑 verify、`python scripts/minimal_index.py --check` 与 `python scripts/check_fano.py --check`。

## 在云端编辑或发布

Codespaces：Code → Codespaces → Create codespace；本地 VS Code 可选 Reopen in Container。容器预览运行 `python scripts/project.py preview --host 0.0.0.0 --port 4200` 并打开转发端口。创建是否成功以实际日志为准。

Actions 的 build 只读仓库；仅 main 的 deploy 拥有 Pages 与身份令牌权限，使用 Actions 自带凭据。复用到新仓库时，把 Settings → Pages → Source 设为 GitHub Actions。PR 不部署到正式站点。

旧容器与本轮首次验收都因 Yarn 软件源缺少公钥 `62D54FD4003F6525` 中断安装。本轮改用官方 Node feature v2，并设置 `installYarnUsingApt: false`，避免为不使用的包管理器添加 APT 源；v2 也会修复基础镜像已带的 Yarn 源签名配置，见[官方实现](https://github.com/devcontainers/features/blob/main/src/node/install.sh)。已有 Codespace 需重建容器才采用新配置。遇到同样现象先看具体失败步骤，不跳过签名检查。GitHub 服务故障或排队时先查已有运行再决定是否重试，不重复创建云工作区。
