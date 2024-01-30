import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

// console.log('process.env', process.env)
console.log('process.env.MODE', process.env.MODE)

export default {
	input: './src/index.js',
	output: {
		dir: "./public",
		format: 'esm',
        sourcemap: true,
	},
	plugins: [
        resolve(),
		replace({
			preventAssignment: true,
			'process.env.MODE': JSON.stringify(process.env.MODE)
		})
    ]
}