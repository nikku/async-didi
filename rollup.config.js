import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

function pgl(plugins=[]) {
  return [
    resolve(),
    commonjs(),
    ...plugins
  ];
}

const srcEntry = pkg.source;

const umdDist = pkg['umd:main'];

export default [

  // browser-friendly UMD build
  {
    input: srcEntry,
    output: {
      file: umdDist.replace(/\.js$/, '.prod.js'),
      format: 'umd',
      name: 'AsyncDidi'
    },
    plugins: pgl([
      terser()
    ])
  },
  {
    input: srcEntry,
    output: [
      {
        file: umdDist,
        format: 'umd',
        name: 'AsyncDidi'
      },
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: pgl()
  }
];