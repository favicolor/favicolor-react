import { defineConfig } from 'tsup';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  external: ['react', 'react-dom'],
  loader: {
    '.svg': 'dataurl',
  },
  treeshake: true,
  splitting: false,
  async onSuccess() {
    // Ajouter "use client" au début des fichiers après le build
    const files = ['dist/index.mjs', 'dist/index.js'];
    for (const file of files) {
      const filePath = resolve(file);
      const content = readFileSync(filePath, 'utf-8');
      if (!content.startsWith('"use client"')) {
        writeFileSync(filePath, `"use client";\n${content}`, 'utf-8');
        console.log(`✅ Added "use client" to ${file}`);
      }
    }
  },
});
