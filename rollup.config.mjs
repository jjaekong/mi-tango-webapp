import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
    'src/index.js',
    'src/login.js',
    'src/me.js',
    'src/milonga_event.js',
    'src/me/new_milonga.js',
    'src/components/header.js',
    'src/me/edit_profile.js',
].map(input => {
    return {
        input: input,
        output: {
            dir: 'public/js',
            format: 'esm',
        },
        plugins: [
            nodeResolve({
                extensions: ['js', 'mjs'],
            })
        ],
    }
})