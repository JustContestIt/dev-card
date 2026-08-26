import { build } from 'esbuild';

await build({
  entryPoints: ['web/src/main.ts'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  outfile: 'public/app.js',
  sourcemap: false,
  logLevel: 'info',
});
