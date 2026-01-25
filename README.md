开发环境:

在一个终端运行 hugo server。

在另一个终端运行 cd react-app && npm run build -- --watch。

注意：Vite 的 HMR (热更新) 在这种嵌入模式下比较难配置，通常建议使用 build --watch 模式，虽然慢一点，但能保证文件确实生成在 static 目录供 Hugo 读取。

生产部署:

你需要调整构建脚本，确保先构建 React，再构建 Hugo。

在根目录 package.json (如果存在) 或 CI/CD 配置中：

Bash

cd react-app && npm install && npm run build && cd .. && hugo --minify

Guitar 简谱渲染（jTab）:

- 在 Markdown 中使用代码块，语言标记为 `guitar`。
- 例如：

	```guitar
	E / / / | Am / B7 / ||
	$2 0 1 3 $1 0 1 3/5
	```

- 构建后，React 前端会扫描页面并将这些代码块转换为 jTab 图形。
- jTab 语法支持和示例详见 https://jtab.tardate.com/。

Strum 扫弦标记:

- `^`/`v`: 分别表示向上/向下扫弦，默认覆盖全部 6 根弦。
- `^N`/`vN`: 居中覆盖 N 根弦，例如 `^3` 表示覆盖 3 根中间弦。
- `^S-E`/`vS-E`: 显式指定从第 `S` 根弦到第 `E` 根弦（1..6，自上而下），例如 `v2-5`。
- 扫弦可带时值：`^/8`、`v/16`、`^3/8`、`v1-4/16` 等，八分/十六分会压缩宽度并在谱线下方自动连线（单梁/双梁）。
- 在六线谱区域会绘制纵向箭头（带箭头尖）；仅和弦区域则显示紧凑的 `↑`/`↓` 图标。

时值标记（试验特性）:

- 在数字或 `x` 等符号后加 `/4`、`/8`、`/16` 表示四分/八分/十六分时值，例如 `$5 3/16`、`0h2/8`。
- 未标时值的旧谱保持原样；/8、/16 会压缩水平间距，并对连续短时值自动绘制单梁/双梁（位于谱线下方）。

换行与分段:

- 空行表示换行：相邻段会在新的一行渲染。
- 如果使用 `stave ... end;` 包裹段落，则按分段渲染；如果没有匹配到，则回退为按空行切段。

Mermaid 支持:

- 方法: 本主题在 `layouts/_default/_markup/render-codeblock-mermaid.html` 中添加了一个渲染钩子，且提供 `layouts/shortcodes/mermaid.html` 短代码。两者都会设置页面标记以便在页脚按需加载 Mermaid。
- 使用方式（推荐）: 在 Markdown 中直接使用标准代码块语法并指定语言 `mermaid`：

		```mermaid
		graph TD;
			A-->B;
		```

	- 或者使用短代码：

		{{"<"}}% raw %{{"%"}}  <!-- shortcodes in README rendered verbatim; use {{< mermaid >}} in content -->
		{{"<"}}% endraw %{{"%"}}

- 页面级控制: 渲染钩子会向页面注入一个标记 `hasMermaid`，页脚会使用 ESM `import()` 从 jsDelivr 按需加载 `mermaid`（ESM bundle），并初始化已有及后续动态插入的 `.mermaid` 区块。
- React 集成: 主题的 React bundle 也包含了一个小工具 `react-app/src/utils/mermaid.ts`，它会在 React 启动时检测 `.mermaid` 区块并动态 import Mermaid（ESM），以便在使用 React 渲染/增强时也能正确初始化图表。

注意:

- 使用 CDN 的 ESM 包需要在生产网络环境下允许导入外部模块。
- 如果站点有暗黑/浅色主题切换，Mermaid 初始化会尝试基于 `body` 的 class 或系统偏好选择 `dark` 或 `default` 主题。
