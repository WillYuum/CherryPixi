const path = require('node:path');

module.exports = {
    html: {
        template: './public/index.html',
    },
    entry: './src/index.ts',
    output: {
        distPath: {
            root: 'builds/dev',
            js: 'resource/js',
        },
    },
    target: 'web',
    sourcemap: true,
    loader: {
        '.png': 'file',
        '.json': 'file',
        '.atlas': 'file',
        '.css': 'css',
    },
    resolveExtensions: ['.ts', '.js'],
};
