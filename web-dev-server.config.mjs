import rollupReplace from '@rollup/plugin-replace';
import { rollupBundlePlugin, fromRollup } from '@web/dev-server-rollup'
import { hmrPlugin } from '@web/dev-server-hmr'

const replace = fromRollup(rollupReplace);

export default {
    open: true,
    nodeResolve: true,
    rootDir: './public/',
    plugins: [
		replace({ include: ['src/**/*.js'], __environment__: '"development"' }),
		hmrPlugin(),
		rollupBundlePlugin({
			rollupConfig: {
				input: './src/index.js',
				output: {
					file: 'index.js',
					format: 'cjs'
				},
				watch: true,
			}
		})
    ]
};  