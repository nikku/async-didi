import { copy } from '@web/rollup-plugin-copy';

import commonjs from '@rollup/plugin-commonjs';

import pkg from './package.json' with { type: 'json' };

const pkgExport = pkg.exports['.'];

export default [
  {
    input: 'lib/index.js',
    output: [
      {
        file: pkgExport,
        format: 'es',
        sourcemap: true
      }
    ],
    external: [
      'didi'
    ],
    plugins: [

      // @ts-expect-error 'no call signatures'
      commonjs(),
      copy({
        patterns: '**/*.d.ts', rootDir: './lib'
      })
    ]
  }
];