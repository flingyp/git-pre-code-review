import { defineConfig } from 'tsup';
import { useExecCommand } from '@flypeng/tool/node';

const isProduction = process.argv.pop() === 'production';

export default defineConfig({
  entry: ['core/index.ts', 'bin/cli.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  clean: true,
  shims: true,
  minify: isProduction,
  onSuccess: async () => {
    await useExecCommand('cp package.json dist/package.json');
  },
});
