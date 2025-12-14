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