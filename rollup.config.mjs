import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: './src/index.js',
	output: {
		file: "./public/index.js",
		format: 'esm',
	},
	plugins: [
        resolve()
    ]
}