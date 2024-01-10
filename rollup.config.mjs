import { nodeResolve } from '@rollup/plugin-node-resolve';

console.log('process.env.NODE_ENV', process.env.NODE_ENV)

export default [
    {
        input: './src/index.js',
        output: {
            dir: './public/',
            format: 'esm',
        },
        plugins: [
            nodeResolve({
                extensions: ['js', 'mjs']
            }),
        ],
    },
    {
        input: './src/login.js',
        output: {
            dir: './public/',
            format: 'esm',
        },
        plugins: [
            nodeResolve({
                extensions: ['js', 'mjs']
            }),
        ],
    }
]