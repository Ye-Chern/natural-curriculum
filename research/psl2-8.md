# 为什么 PSL₂(8) 要等到九个位置才出现

日期：2026-10-24（Asia/Singapore）。研究分支 `research/psl28-proof`，接续 PR #1 的 `cf8e766`；本稿独立于第二章教材 PR。记号沿用本项目：

$$\mu(G)=\min_{H<G}[G:H],\qquad d(G)=\min\{n:G\hookrightarrow S_n\}.$$

**核查结论：候选证明成立。** 以下给出 $\mu(\mathrm{PSL}_2(8))=d(\mathrm{PSL}_2(8))=9$ 的自然语言证明。七点排除引用交错群单性；PSL₂(8) 的阶、单性、九点作用、36 个 Sylow 7-子群及八点排除在本文重建。不依赖 PrimGrp 的完备性、Dickson 子群分类或新一轮 GAP 扫描。

## 证明需要哪些工具

使用有限域的基本运算、二维线性代数、拉格朗日定理、Sylow 定理，以及已在 [minimal-index.md](minimal-index.md#t1-cosets) T1–T2 证明的陪集作用与单群忠实性。有限域可以具体取

$$F=\mathbb F_2[t]/(t^3+t+1).$$

这个三次多项式在 $\mathbb F_2$ 中没有根，故不可约，所得商是八元素域。其非零元素构成七阶乘法群，因此是循环群；选取任一 $a\ne0,1$ 即有 $a^2\ne1$。

唯一不在本稿重证的单性输入是 **$A_7$ 是单群**。它是交错群单性定理 $A_n$（$n\ge5$）的实例；可核查 Keith Conrad 的 [Simplicity of A_n](https://kconrad.math.uconn.edu/blurbs/grouptheory/Ansimple.pdf)，Theorem 1.1 及其证明。PR #1 已引 Burnside 1897 §111，本稿保留这个外部依赖，并不把它隐去。

## 一、从矩阵得到 504 阶群与九点舞台

令 $G=\mathrm{SL}_2(F)$。矩阵第一列可以是 $F^2$ 的任一非零向量，共 $8^2-1=63$ 种。固定第一列 $(a,c)^T$ 后，第二列 $(b,d)^T$ 满足 $ad-bc=1$；这是一个非零线性泛函的一个纤维，恰有八个解。因此

$$|G|=63\cdot8=504=2^3\cdot3^2\cdot7.$$

用 $F^2$ 中的一维子空间组成射影直线 $X=\mathbb P^1(F)$。它有 $63/7=9$ 个点，也可以写作 $F\cup\{\infty\}$。矩阵作用为分式线性变换

$$\begin{pmatrix}a&b\\c&d\end{pmatrix}:z\longmapsto\frac{az+b}{cz+d},$$

分母为零时取 $\infty$，$\infty$ 的像按第一列解释。

如果一个矩阵固定每条一维子空间，它固定 $\infty$ 与 $0$，所以是对角矩阵；再固定 $1$，两个对角元必须相等。故作用核由行列式为一的标量矩阵组成。标量 $\lambda$ 满足 $\lambda^2=1$；特征二给出 $(\lambda+1)^2=0$，故只有 $\lambda=1$。作用忠实。

同样，中心矩阵必须与上、下三角的初等矩阵交换，直接比较条目便得到它是标量。因此 $Z(G)=1$，从而 $G=\mathrm{PSL}_2(8)$。这里没有将 SL、PGL 和 PSL 的记号混用。

平移 $z\mapsto z+b$ 固定 $\infty$ 并在其余八点上传递；矩阵 $\left(\begin{smallmatrix}0&1\\1&0\end{smallmatrix}\right)$ 交换 $0,\infty$。所以 $G$ 在九点上传递，而且二重传递。特别地，一个点稳定子有阶 $504/9=56$，给出指数九的真子群，因而 $\mu(G)\le9$。

## 二、这里使用的 PSL₂(8) 单性也可以直接证明

下面专门在 $F=\mathbb F_8$ 中验证 Iwasawa 思路。其一般形式与来源可见 Conrad 的 [Simplicity of PSL_n(F)](https://kconrad.math.uconn.edu/blurbs/grouptheory/PSLnsimple.pdf)，§2 Theorem 2.10、§3。本段是标准论证在八元素域的重建，不宣称原创或历史发现顺序。

记

$$U(b)=\begin{pmatrix}1&b\\0&1\end{pmatrix},\quad
L(c)=\begin{pmatrix}1&0\\c&1\end{pmatrix},\quad
D(a)=\begin{pmatrix}a&0\\0&a^{-1}\end{pmatrix}.$$

所有 $U(b)$ 组成交换群 $U$。$\infty$ 的稳定子 $B$ 是所有上三角行列式一矩阵；由

$$D(a)U(b)D(a)^{-1}=U(a^2b)$$

可见 $U\triangleleft B$。

**上、下三角初等矩阵生成 $G$。** 如果 $M=\left(\begin{smallmatrix}a&b\\c&d\end{smallmatrix}\right)$ 的 $a\ne0$，则

$$M=L(c/a)D(a)U(b/a).$$

而在特征二下

$$W(a):=U(a)L(a^{-1})U(a)=\begin{pmatrix}0&a\\a^{-1}&0\end{pmatrix},\qquad D(a)=W(a)W(1).$$

如果 $a=0$，则 $c\ne0$，先左乘 $W(1)$ 就回到前一种情形。下三角群又是 $U$ 被 $W(1)$ 共轭得到的群，故 $U$ 的共轭群生成 $G$。

**$G$ 等于自己的换位子群。** 采用 $[x,y]=xyx^{-1}y^{-1}$。固定一个 $a\in F\setminus\{0,1\}$，则 $a^2-1\ne0$，并且

$$[D(a),U(c)]=U((a^2-1)c).$$

对任意 $b$，取 $c=b/(a^2-1)$，得到 $U(b)\in[G,G]$。换位子群正规，因此也包含所有 $U$ 的共轭群；前段说明它就是 $G$。

现在设 $1\ne N\triangleleft G$。九点作用忠实，故存在 $n\in N$ 和 $x\in X$ 使 $nx\ne x$。对任意不同的 $y,z\in X$，二重传递性给出 $g$ 使 $gx=y$、$g(nx)=z$；于是 $gng^{-1}\in N$ 把 $y$ 送到 $z$。所以 $N$ 在 $X$ 上传递，进而 $G=NB$：给定 $g$，可取 $n\in N$ 使 $n\infty=g\infty$，于是 $n^{-1}g\in B$。

考虑商映射 $\pi:G\to G/N$。因为每个 $g$ 可写为 $nb$，且 $U\triangleleft B$，$\pi(gUg^{-1})=\pi(U)$。$G$ 由这些共轭群生成，故 $G/N$ 由一个交换群 $\pi(U)$ 生成，本身交换。于是 $[G,G]\le N$；前段已证明 $[G,G]=G$，因此 $N=G$。这证明了 $G$ 单。

## 三、36 个 Sylow 7-子群从哪里来

设 $T=\{D(a):a\in F^\times\}$。它是七阶群，因此是 Sylow 7-子群；其非单位元在九点上的共同不动点恰为 $0,\infty$，因为 $D(a)$ 的作用是 $z\mapsto a^2z$ 且 $a^2\ne1$。

由二重传递性，每个无序点对 $\{x,y\}$ 都可由 $\{0,\infty\}$ 搬到。其逐点稳定子是 $T$ 的某个共轭，因此恰有七个元素。构造不依赖搬运方式，因为“同时固定 $x,y$ 的全部群元素”已经唯一确定这个群。

反过来，Sylow 定理说明每个 Sylow 7-子群都是 $T$ 的共轭，因此都有且仅有两个共同不动点。这个共同不动点对能唯一恢复它：它必是该点对的七阶逐点稳定子。因此得到双射

$$\{\text{Sylow 7-子群}\}\longleftrightarrow
\{X\text{ 的无序二元子集}\},$$

从而

$$n_7(G)=\binom92=36.$$

也可以核对正规化子。$gTg^{-1}=T$ 当且仅当 $g$ 集合地保持 $\{0,\infty\}$，所以 $N_G(T)$ 正是这个点对的集合稳定子，阶为 $504/36=14$。其中 $T$ 固定两点，$W(1)$ 交换两点。这个 14 由实际几何得到，而非预先引用子群表。

## 四、逐一关掉七点与八点的可能性

### 小于七点

单群的任意非平凡传递作用忠实：核正规，并包含于真稳定子，所以核只能是单位元。若 $G$ 有次数 $n<7$ 的非平凡传递作用，它嵌入 $S_n$，于是 $504\mid n!$。但 $7\nmid n!$，矛盾。所以 $\mu(G)\ge7$。

### 七点：把问题送进 A₇，再反向使用陪集

假设有七点传递作用。由单性得到嵌入 $G\hookrightarrow S_7$。将它与符号同态 $S_7\to C_2$ 复合。复合同态若非平凡，其核由 $G$ 单性只能为一，迫使 504 阶群嵌入二阶群，矛盾。因此像 $K$ 包含于 $A_7$。

此时 $|K|=504$，而 $|A_7|=7!/2=2520$，故 $[A_7:K]=5$。$A_7$ 在这五个左陪集上的传递作用非平凡；引用 $A_7$ 单性，作用必忠实，给出 $A_7\hookrightarrow S_5$。但 $2520>120$，不可能。

这里不能只写“$G$ 单，所以七点不行”。关键是借符号先进入 $A_7$，再使用**另一个群 $A_7$ 的单性**排除它的指数五子群。

### 八点：36 不能均匀分到八个位置

假设 $G$ 在八元素集合 $Y$ 上传递。由单性它忠实。每个 Sylow 7-子群 $P$ 在 $Y$ 上的轨道长度只能为一或七；它不能逐点固定 $Y$，因为 $P\ne1$ 而作用忠实。因此轨道长度恰为 $7+1$，即 $P$ 有且仅有一个共同不动点。

双重计数集合

$$\mathcal I=\{(y,P):y\in Y,\ P\in\mathrm{Syl}_7(G),\ P\le G_y\}.$$

每个 $P$ 恰贡献一个不动点，所以 $|\mathcal I|=36$。另一方面，若 $g$ 把 $y$ 送到 $z$，则 $P\mapsto gPg^{-1}$ 给出“固定 $y$ 的 Sylow 7-子群”与“固定 $z$ 的 Sylow 7-子群”的双射。由传递性，每个点有同样的整数个数 $r$，因此 $|\mathcal I|=8r$。这迫使 $8\mid36$，矛盾。

九点作用已经存在，所有更小指数均已排除，所以

$$\boxed{\mu(\mathrm{PSL}_2(8))=9.}$$

对任意忠实但可能不传递的 $n$ 点作用，必有至少一个非单点轨道；它的稳定子为真子群，故该轨道至少有 $\mu(G)=9$ 个点。因此 $d(G)\ge9$；已有九点忠实作用又给反向不等式，故 $d(G)=9$。

## 结论范围与独立核对

- 本稿完成的是 $q=8$ 这个具体对象的最小性证明；没有重证一般 PSL₂(q) 公式或四个例外。
- 上界来自九点射影作用；下界依赖本稿的单性证明、36 个 Sylow 7-子群计数，以及明确引用的 $A_7$ 单性。八点计数必须使用传递性和忠实性；删去其中任何一项，原句都不足以支持结论。
- [check_psl28.py](../scripts/check_psl28.py) 直接枚举 $F_8$ 上全部 4096 个二阶矩阵，选出 504 个行列式一矩阵；核对九点作用的忠实性、乘法相容性、元素阶、36 个七阶子群及其固定点对、正规化子阶和点稳定子阶。它核对具体实现；前面的自然语言推理解释最小性。
- 冻结结果在 [psl2-8.json](results/psl2-8.json)。运行 `python scripts/check_psl28.py --check` 重做有限模型并比较结果；它不调用 GAP，不更改此前的 2…12 扫描记录。

这不是文献未知结论。Guest、Morris、Praeger、Spiga 的[作者存档稿](https://api.research-repository.uwa.edu.au/ws/portalfiles/portal/11790160/Guest_et_al_On_the_maximum_orders_of_elements_of_finite_almost_simple_groups_and_primitive_permutation_groups_2015_.pdf)，§3、Table 4（PDF 第16页），已经给出相应最小次数公式，$q=8$ 适用通常的 $q+1$。本稿未以该表代替下界证明；它只确认项目正在复现已知结果。
