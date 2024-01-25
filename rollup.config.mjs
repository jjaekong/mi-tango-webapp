import resolve from '@rollup/plugin-node-resolve';
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

export default {
	input: './src/index.js',
	output: {
		file: './public/index.js',
		format: 'esm',
		plugins: [getBabelOutputPlugin({ presets: ['@babel/preset-env'] })],
	},
	plugins: [
		resolve({
			extensions: ['.js', '.jsx']
		}),
		babel({
			babelHelpers: 'bundled',
			presets: ['@babel/preset-react'],
			extensions: ['js', '.jsx']
		}),
		commonjs(),
		replace({
			'preventAssignment': false,
			'process.env.NODE_ENV': '"development"'
		})
	]
}