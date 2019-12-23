var path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require("webpack");

module.exports = {
    entry: './src/index.ts',
    target: "node",
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.js'] //resolve all the modules other than index.ts
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                test: /\.ts?$/
            }
        ]
    },
    plugins: [
        new CopyPlugin([
            { from: '.env.yml', to: './' },
        ]),
        new webpack.IgnorePlugin(/^hiredis$/)
    ],
}