import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

function injectCSSImport(): Plugin {
  return {
    name: 'inject-css-import',
    apply: 'build',
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.fileName === 'use-react-ui.js') {
          chunk.code = `import './index.css';\n${chunk.code}`
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['src/App.tsx', 'src/main.tsx', 'src/vite-env.d.ts'],
      outDir: 'dist',
      rollupTypes: true,
      tsconfigPath: resolve('./tsconfig.build.json'),
    }),
    injectCSSImport(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UseReactUI',
      fileName: 'use-react-ui',
      formats: ['es', 'cjs'],
      cssFileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
    cssCodeSplit: false,
  },
})
