// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/cards.ts',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [typescript(), nodeResolve()]
};