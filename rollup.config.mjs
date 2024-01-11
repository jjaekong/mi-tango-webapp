import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
    'src/index.js'
].map(input => {
    return {
        input: input,
        output: {
            dir: 'public',
            format: 'esm',
        },
        plugins: [
            nodeResolve({
                extensions: ['js', 'mjs']
            }),
        ],
    }
})