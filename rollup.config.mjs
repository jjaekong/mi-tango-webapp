import { nodeResolve } from '@rollup/plugin-node-resolve';

console.log('process.env.NODE_ENV', process.env.NODE_ENV)

export default [
    'src/index.js',
    'src/login.js',
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