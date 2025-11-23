import { readdirSync } from 'fs';
import { join, relative } from 'path';
import { defineConfig } from 'tsup';

const SRC_DIR = 'src';

// Discover all .ts files under src, excluding Next.js routes/components and tests/stories
const entries = (() => {
  const result: Record<string, string> = {};

  const shouldExclude = (filePath: string) => {
    const normalized = filePath.replace(/\\/g, '/');
    return normalized.includes('/app/')
      || normalized.endsWith('.d.ts')
      || normalized.endsWith('.test.ts')
      || normalized.endsWith('.stories.ts');
  };

  const walk = (dir: string) => {
    readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
      const fullPath = join(dir, dirent.name);

      if (dirent.isDirectory()) {
        walk(fullPath);
        return;
      }

      if (!dirent.name.endsWith('.ts')) return;
      if (shouldExclude(fullPath)) return;

      const key = relative(SRC_DIR, fullPath).replace(/\.ts$/, '').replace(/\\/g, '/');
      result[key] = fullPath;
    });
  };

  walk(SRC_DIR);
  return result;
})();

export default defineConfig({
  entry: entries,
  tsconfig: './tsconfig.tsup.json',
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  bundle: true,
  shims: false,
  skipNodeModulesBundle: true,
  outDir: 'dist',
  treeshake: true,
});
