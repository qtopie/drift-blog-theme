开发环境:

在一个终端运行 hugo server。

在另一个终端运行 cd react-app && npm run build -- --watch。

注意：Vite 的 HMR (热更新) 在这种嵌入模式下比较难配置，通常建议使用 build --watch 模式，虽然慢一点，但能保证文件确实生成在 static 目录供 Hugo 读取。

生产部署:

你需要调整构建脚本，确保先构建 React，再构建 Hugo。

在根目录 package.json (如果存在) 或 CI/CD 配置中：

Bash

cd react-app && npm install && npm run build && cd .. && hugo --minify