import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';
import dts from 'vite-plugin-dts'

// const isBuild = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsConfigFilePath: './tsconfig.json',
      outputDir: "es"
    }),
    dts({
      tsConfigFilePath: './tsconfig.json',
      outputDir: "dist"
    }),
  ],
  build: {
    target: 'modules',
    minify: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'vue'],
      output: [
        {
          format: 'es',
          //不用打包成.es.js,这里我们想把它打包成.js
          entryFileNames: '[name].js',
          //让打包目录和我们目录对应
          preserveModules: true,
          //配置打包根目录
          dir: 'es',
          preserveModulesRoot: 'src'
        },
        {
          format: 'cjs',
          entryFileNames: '[name].js',
          //让打包目录和我们目录对应
          preserveModules: true,
          //配置打包根目录
          dir: 'dist',
          preserveModulesRoot: 'src'
        },
        // {
        //   format: 'umd',
        //   file: 'umd/index.js',
        //   name: 'popup',
        //   inlineDynamicImports: true,
        //   dir: undefined,
        // },
      ]
    },
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs', 'es'],
      // // fileName: 'index',
      // name: 'popup',
    },
  },
  server: {
    host: '0.0.0.0'
  },
})
