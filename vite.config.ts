/*global __dirname*/
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    tailwindcss(),
    Pages({
      exclude: [
        '**/components/*',
        '**/utils/*',
        '**/*.test.*',
        '**/*.spec.*',
        '**/hooks/*',
        '**/models/*',
        '**/data/*',
        '**/info/*',
        '*.ts',
      ],
      importMode: 'async',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 组件库
          'radix-ui': [
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tooltip',
          ],
          // TipTap 编辑器（单独分离，按需加载）
          'tiptap-editor': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extensions',
            '@tiptap/extension-highlight',
            '@tiptap/extension-image',
            '@tiptap/extension-text-align',
            '@tiptap/extension-typography',
            '@tiptap/extension-horizontal-rule',
            '@tiptap/extension-list',
            '@tiptap/extension-subscript',
            '@tiptap/extension-superscript',
          ],
          // 图标库
          icons: ['@tabler/icons-react', 'lucide-react'],
          // Supabase
          supabase: ['@supabase/supabase-js'],
          // 其他工具库
          utils: ['clsx', 'tailwind-merge', 'date-fns', 'zod', 'zustand'],
        },
      },
    },
    // 提高 chunk 大小警告阈值(临时)
    chunkSizeWarningLimit: 600,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 启用压缩 terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        keep_fnames: false,
        keep_classnames: false,
      },
      format: {
        comments: false,
      },
      mangle: true,
    },
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
  },
})
