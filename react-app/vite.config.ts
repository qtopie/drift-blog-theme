import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  // Ensure runtime assets resolve under /react/
  base: '/react/',
  plugins: [
    react(),
    // Copy AlphaTab runtime assets (workers/worklets) into build output
    viteStaticCopy({
      targets: [
        {
          src: resolve(__dirname, 'node_modules/@coderline/alphatab/dist/**/*'),
          dest: 'alphatab'
        }
      ]
    })
  ],
  build: {
    // 1. 输出到 Hugo 的静态目录
    outDir: '../static/react',
    emptyOutDir: true, // 每次构建前清空目录

    // 2. 库模式配置 (虽然我们不是发包，但多入口机制类似)
    rollupOptions: {
      input: {
        // 定义不同页面的入口
        base: resolve(__dirname, 'src/pages/base.tsx'),
        home: resolve(__dirname, 'src/pages/home.tsx'),
        page: resolve(__dirname, 'src/pages/page.tsx'),
        list: resolve(__dirname, 'src/pages/list.tsx'),
      },
      output: {
        // 3. 固定入口文件名，方便在 Hugo 模板中引用
        entryFileNames: '[name].bundle.js',
        // 依赖块和资源可以使用 Hash 缓存
        chunkFileNames: 'chunks/[name].[hash].js',
        // Removed hash for easier inclusion in Hugo templates (manual cache busting needed if changed)
        assetFileNames: 'assets/[name].[ext]',
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
