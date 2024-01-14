import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
    'src/index.js',
    'src/login.js',
    'src/me.js',
    'src/milonga_event.js',
].map(input => {
    return {
        input: input,
        output: {
            dir: 'public/js',
            format: 'esm',
        },
        plugins: [
            nodeResolve({
                extensions: ['js', 'mjs']
            }),
        ],
    }
})